import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

// Disable TLS certificate verification for external image sources with expired SSL certificates (e.g. top4top.io)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    let upstreamRes: Response | null = null;
    try {
      upstreamRes = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      });
    } catch {
      // If HTTPS fails for top4top.io, try HTTP fallback
      if (parsed.hostname.includes('top4top.io') && parsed.protocol === 'https:') {
        const httpUrl = imageUrl.replace(/^https:/, 'http:');
        try {
          upstreamRes = await fetch(httpUrl, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
            },
          });
        } catch {
          upstreamRes = null;
        }
      }
    } finally {
      clearTimeout(timeoutId);
    }

    if (upstreamRes && upstreamRes.ok) {
      const buffer = await upstreamRes.arrayBuffer();
      const contentType = upstreamRes.headers.get('content-type') || 'image/jpeg';

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
  } catch (err) {
    console.error('Failed to proxy image:', imageUrl, err);
  }

  // Fallback to placeholder image
  try {
    const placeholderPath = path.join(process.cwd(), 'public', 'images', 'placeholder-poster.png');
    if (fs.existsSync(placeholderPath)) {
      const fileBuffer = fs.readFileSync(placeholderPath);
      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }
  } catch {}

  return new NextResponse('Image not found', { status: 404 });
}
