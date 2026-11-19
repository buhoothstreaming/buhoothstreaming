import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
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

const CACHE_DIR = '/tmp/bahooth-image-proxy-cache';
const MAX_MEMORY_CACHE_ITEMS = 300;
const REQUEST_TIMEOUT_MS = 45000;
const MAX_REDIRECTS = 5;

const memoryCache = new Map<string, CachedImage>();
const inFlightRequests = new Map<string, Promise<CachedImage | null>>();

const httpAgent = new http.Agent({
  keepAlive: true,
  maxSockets: 6,
});

const httpsAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 6,
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

function readDiskCache(key: string): CachedImage | null {
  try {
    const dataPath = path.join(CACHE_DIR, `${key}.bin`);
    const metaPath = path.join(CACHE_DIR, `${key}.json`);
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

function fetchViaNodeHttp(
  targetUrl: string,
  redirectsLeft = MAX_REDIRECTS
): Promise<CachedImage | null> {
  return new Promise((resolve) => {
    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      resolve(null);
      return;
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      resolve(null);
      return;
    }

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
    const finish = (val: CachedImage | null) => {
      if (!settled) {
        settled = true;
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
        const status = res.statusCode || 0;

        if (
          [301, 302, 303, 307, 308].includes(status) &&
          res.headers.location &&
          redirectsLeft > 0
        ) {
          res.resume();
          try {
            const nextUrl = new URL(res.headers.location, parsed).toString();
            fetchViaNodeHttp(nextUrl, redirectsLeft - 1).then(finish);
          } catch {
            finish(null);
          }
          return;
        }

        if (status < 200 || status >= 300) {
          res.resume();
          finish(null);
          return;
        }

        const contentType = res.headers['content-type'] || 'image/jpeg';
        if (contentType.toLowerCase().includes('text/html')) {
          res.resume();
          finish(null);
          return;
        }

        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (buffer.length === 0) {
            finish(null);
            return;
          }
          finish({ buffer, contentType });
        });
        res.on('error', () => finish(null));
      }
    );

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy();
      finish(null);
    });

    req.on('error', () => {
      finish(null);
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
      let result = await fetchViaNodeHttp(imageUrl);

      if (!result && imageUrl.includes('top4top.io') && imageUrl.startsWith('https://')) {
        const httpUrl = imageUrl.replace(/^https:\/\//, 'http://');
        result = await fetchViaNodeHttp(httpUrl);
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
