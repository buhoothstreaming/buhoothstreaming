import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import dns from 'node:dns/promises';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';

// Disable TLS certificate verification for external image sources with expired SSL certificates (e.g. top4top.io)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

interface CachedImage {
  buffer: Buffer;
  contentType: string;
}

interface FetchResult {
  image: CachedImage | null;
  connectFailed?: boolean;
}

const CACHE_DIR = '/tmp/bahooth-image-proxy-cache';
const SEED_CACHE_DIR = path.join(process.cwd(), 'public', 'cache');
const MAX_MEMORY_CACHE_ITEMS = 600;
const CONNECT_TIMEOUT_MS = 2500;
const TOTAL_REQUEST_TIMEOUT_MS = 15000;
const HTTP_FALLBACK_TOTAL_TIMEOUT_MS = 6000;
const IP_COOLDOWN_MS = 30000;
const DNS_CACHE_TTL_MS = 60000;
const MAX_REDIRECTS = 5;

const memoryCache = new Map<string, CachedImage>();
const inFlightRequests = new Map<string, Promise<CachedImage | null>>();
const ipCooldownUntil = new Map<string, number>();
const dnsCache = new Map<string, { ip: string; expiresAt: number }>();
const ipReachabilityProbe = new Map<string, Promise<boolean>>();

const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 32,
  maxFreeSockets: 16,
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 32,
  maxFreeSockets: 16,
  rejectUnauthorized: false,
});

function ensureCacheDir() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  } catch {
    // Ignore cache dir creation errors
  }
}

function getCacheKey(url: string): string {
  return crypto.createHash('sha256').update(url).digest('hex');
}

function setMemoryCache(key: string, value: CachedImage) {
  if (memoryCache.size >= MAX_MEMORY_CACHE_ITEMS) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) {
      memoryCache.delete(oldestKey);
    }
  }
  memoryCache.set(key, value);
}

function readDiskCacheFromDir(dir: string, key: string): CachedImage | null {
  try {
    const dataPath = path.join(dir, `${key}.bin`);
    const metaPath = path.join(dir, `${key}.json`);
    if (fs.existsSync(dataPath) && fs.existsSync(metaPath)) {
      const buffer = fs.readFileSync(dataPath);
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      if (buffer.length > 0 && meta?.contentType) {
        return { buffer, contentType: meta.contentType };
      }
    }
  } catch {
    // Ignore disk read errors
  }
  return null;
}

function readDiskCache(key: string): CachedImage | null {
  return readDiskCacheFromDir(CACHE_DIR, key) || readDiskCacheFromDir(SEED_CACHE_DIR, key);
}

function writeDiskCache(key: string, value: CachedImage) {
  try {
    ensureCacheDir();
    const dataPath = path.join(CACHE_DIR, `${key}.bin`);
    const metaPath = path.join(CACHE_DIR, `${key}.json`);
    fs.writeFileSync(dataPath, value.buffer);
    fs.writeFileSync(metaPath, JSON.stringify({ contentType: value.contentType }));
  } catch {
    // Ignore disk write errors
  }
}

async function resolveHostIp(hostname: string): Promise<string | null> {
  const cached = dnsCache.get(hostname);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.ip;
  }
  try {
    const res = await dns.lookup(hostname);
    if (res?.address) {
      dnsCache.set(hostname, { ip: res.address, expiresAt: Date.now() + DNS_CACHE_TTL_MS });
      return res.address;
    }
  } catch {
    // Ignore DNS errors
  }
  return null;
}

function isIpInCooldown(ipOrHost: string): boolean {
  const until = ipCooldownUntil.get(ipOrHost);
  if (!until) return false;
  if (Date.now() < until) return true;
  ipCooldownUntil.delete(ipOrHost);
  return false;
}

function markIpCooldown(ipOrHost: string) {
  ipCooldownUntil.set(ipOrHost, Date.now() + IP_COOLDOWN_MS);
}

async function fetchViaNodeHttp(
  targetUrl: string,
  redirectsLeft = MAX_REDIRECTS,
  totalTimeoutMs = TOTAL_REQUEST_TIMEOUT_MS
): Promise<FetchResult> {
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return { image: null };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { image: null };
  }

  const resolvedIp = await resolveHostIp(parsed.hostname);
  const trackKey = resolvedIp || parsed.hostname;

  if (isIpInCooldown(trackKey)) {
    return { image: null, connectFailed: true };
  }

  // If an initial connect probe to this IP is already in flight, wait for its outcome
  // instead of flooding dozens of sockets against a potentially dead IP.
  const activeProbe = ipReachabilityProbe.get(trackKey);
  if (activeProbe) {
    const ok = await activeProbe;
    if (!ok) {
      return { image: null, connectFailed: true };
    }
  }

  let resolveProbe: ((ok: boolean) => void) | null = null;
  if (!ipReachabilityProbe.has(trackKey) && !dnsCache.get(parsed.hostname)?.ip) {
    // No-op; probe registered below
  }
  if (!ipReachabilityProbe.has(trackKey)) {
    const probePromise = new Promise<boolean>((res) => {
      resolveProbe = res;
    });
    ipReachabilityProbe.set(trackKey, probePromise);
    // Clear probe handle after it settles so future requests proceed freely
    probePromise.finally(() => {
      if (ipReachabilityProbe.get(trackKey) === probePromise) {
        ipReachabilityProbe.delete(trackKey);
      }
    });
  }

  return new Promise((resolve) => {
    const isHttps = parsed.protocol === 'https:';
    const isWikimedia =
      parsed.hostname.includes('wikimedia.org') ||
      parsed.hostname.includes('wikipedia.org');

    const headers: Record<string, string> = {
      'User-Agent': isWikimedia
        ? 'BahoothStreaming/1.0 (https://bahooth.app; contact@bahooth.app)'
        : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
    };

    let settled = false;
    let connectTimer: NodeJS.Timeout | null = null;
    let totalTimer: NodeJS.Timeout | null = null;

    const cleanupTimers = () => {
      if (connectTimer) {
        clearTimeout(connectTimer);
        connectTimer = null;
      }
      if (totalTimer) {
        clearTimeout(totalTimer);
        totalTimer = null;
      }
    };

    const settleProbe = (ok: boolean) => {
      if (resolveProbe) {
        const fn = resolveProbe;
        resolveProbe = null;
        fn(ok);
      }
    };

    const finish = (val: FetchResult) => {
      if (!settled) {
        settled = true;
        cleanupTimers();
        settleProbe(!val.connectFailed);
        resolve(val);
      }
    };

    const req = (isHttps ? https : http).request(
      parsed,
      {
        method: 'GET',
        agent: isHttps ? httpsAgent : httpAgent,
        rejectUnauthorized: false,
        headers,
      },
      (res) => {
        if (connectTimer) {
          clearTimeout(connectTimer);
          connectTimer = null;
        }
        ipCooldownUntil.delete(trackKey);
        settleProbe(true);

        const status = res.statusCode || 0;

        if (
          [301, 302, 303, 307, 308].includes(status) &&
          res.headers.location &&
          redirectsLeft > 0
        ) {
          res.resume();
          try {
            const nextUrl = new URL(res.headers.location, parsed).toString();
            fetchViaNodeHttp(nextUrl, redirectsLeft - 1, totalTimeoutMs).then(finish);
          } catch {
            finish({ image: null });
          }
          return;
        }

        if (status < 200 || status >= 300) {
          res.resume();
          finish({ image: null });
          return;
        }

        const contentType = res.headers['content-type'] || 'image/jpeg';
        if (contentType.toLowerCase().includes('text/html')) {
          res.resume();
          finish({ image: null });
          return;
        }

        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (buffer.length === 0) {
            finish({ image: null });
            return;
          }
          finish({ image: { buffer, contentType } });
        });
        res.on('error', () => finish({ image: null }));
      }
    );

    totalTimer = setTimeout(() => {
      req.destroy();
      finish({ image: null });
    }, totalTimeoutMs);

    req.on('socket', (socket) => {
      if (socket.connecting) {
        connectTimer = setTimeout(() => {
          markIpCooldown(trackKey);
          req.destroy();
          finish({ image: null, connectFailed: true });
        }, CONNECT_TIMEOUT_MS);

        socket.once('connect', () => {
          if (connectTimer) {
            clearTimeout(connectTimer);
            connectTimer = null;
          }
          settleProbe(true);
        });
      } else {
        settleProbe(true);
      }
    });

    req.on('error', (err: NodeJS.ErrnoException) => {
      const code = err?.code || '';
      const isConnectFailure =
        code === 'ETIMEDOUT' ||
        code === 'ECONNREFUSED' ||
        code === 'ENOTFOUND' ||
        code === 'EHOSTUNREACH' ||
        code === 'ENETUNREACH';
      if (isConnectFailure) {
        markIpCooldown(trackKey);
      }
      finish({ image: null, connectFailed: isConnectFailure });
    });

    req.end();
  });
}

async function fetchAndCacheImage(imageUrl: string): Promise<CachedImage | null> {
  const key = getCacheKey(imageUrl);

  const inMem = memoryCache.get(key);
  if (inMem) {
    return inMem;
  }

  const onDisk = readDiskCache(key);
  if (onDisk) {
    setMemoryCache(key, onDisk);
    return onDisk;
  }

  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    try {
      const firstAttempt = await fetchViaNodeHttp(imageUrl);
      let result = firstAttempt.image;

      // Only fall back to HTTP for top4top.io when HTTPS failed for a non-TCP-connect reason (e.g. TLS/HTTP)
      if (
        !result &&
        !firstAttempt.connectFailed &&
        imageUrl.includes('top4top.io') &&
        imageUrl.startsWith('https://')
      ) {
        const httpUrl = imageUrl.replace(/^https:\/\//, 'http://');
        const httpAttempt = await fetchViaNodeHttp(httpUrl, MAX_REDIRECTS, HTTP_FALLBACK_TOTAL_TIMEOUT_MS);
        result = httpAttempt.image;
      }

      if (result) {
        setMemoryCache(key, result);
        writeDiskCache(key, result);
      }

      return result;
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const imageUrl = searchParams.get('url');
  const isStrict = searchParams.get('strict') === '1';

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const parsed = new URL(imageUrl);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return new NextResponse('Invalid protocol', { status: 400 });
    }

    const result = await fetchAndCacheImage(imageUrl);
    if (result) {
      return new NextResponse(new Uint8Array(result.buffer), {
        status: 200,
        headers: {
          'Content-Type': result.contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  } catch (err) {
    console.error('Failed to proxy image:', imageUrl, err);
  }

  if (isStrict) {
    return new NextResponse('Upstream image unavailable', {
      status: 502,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      },
    });
  }

  // Fallback to placeholder image WITHOUT long-term caching so transient upstream failures recover on retry
  try {
    const placeholderPath = path.join(process.cwd(), 'public', 'images', 'placeholder-poster.png');
    if (fs.existsSync(placeholderPath)) {
      const fileBuffer = fs.readFileSync(placeholderPath);
      return new NextResponse(new Uint8Array(fileBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      });
    }
  } catch {}

  return new NextResponse('Image not found', { status: 404 });
}
