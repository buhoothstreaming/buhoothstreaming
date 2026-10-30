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

  // Local images or data URLs do not need proxying
  if (src.startsWith('/') || src.startsWith('data:')) {
    return src;
  }

  // Route remote images through our internal image proxy endpoint to bypass:
  // 1) Vercel 402 OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED quota blocks
  // 2) Upstream SSL CERT_HAS_EXPIRED errors (such as on top4top.io)
  return `/api/image-proxy?url=${encodeURIComponent(src)}`;
}
