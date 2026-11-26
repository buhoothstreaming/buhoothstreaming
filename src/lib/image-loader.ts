'use client';

export default function customImageLoader({
  src,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  if (!src) {
    return '/images/placeholder-poster.png';
  }

  // Allow explicit direct browser fallback when proxy cannot reach upstream host
  if (src.endsWith('#direct')) {
    return src.slice(0, -'#direct'.length);
  }

  // Local images or data URLs do not need proxying
  if (src.startsWith('/') || src.startsWith('data:')) {
    return src;
  }

  // YouTube thumbnail CDN supports valid HTTPS and CORS directly
  if (src.startsWith('https://img.youtube.com/')) {
    return src;
  }

  // Route remote images through our internal image proxy endpoint to bypass:
  // 1) Vercel 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED quota blocks
  // 2) Upstream SSL CERT_HAS_EXPIRED errors (such as on top4top.io)
  return `/api/image-proxy?v=3&strict=1&url=${encodeURIComponent(src)}`;
}
