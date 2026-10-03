'use client';

import React from 'react';
import SafeImage from './SafeImage';
import { CraftProduct, getProductImages } from '@/types';

interface ProductCardImageProps {
  product: CraftProduct;
  aspectRatio?: string;
  sizes?: string;
  className?: string;
  fit?: 'contain' | 'cover';
  children?: React.ReactNode;
}

export default function ProductCardImage({
  product,
  aspectRatio = 'aspect-[4/5]',
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  className = '',
  fit,
  children,
}: ProductCardImageProps) {
  const images = getProductImages(product);
  const fallbackCover = '/images/atelier-carving.jpg';
  const primaryImage = images[0] || product.heroImage || fallbackCover;
  const hoverImage = images.length > 1 && images[1] && images[1] !== primaryImage ? images[1] : null;

  // Always default to object-cover so product photography fills the frame edge-to-edge seamlessly without borders
  const isContain = fit === 'contain';
  const fitClass = isContain ? 'object-contain object-center' : 'object-cover object-center';

  return (
    <div
      className={`relative ${aspectRatio} w-full overflow-hidden bg-[#ECE4D6] ${className}`}
    >
      {/* 1. Primary Default Image (Image 1) */}
      <SafeImage
        src={primaryImage}
        alt={product.name}
        fill
        sizes={sizes}
        className={`${fitClass} transition-transform duration-700 ease-out group-hover:scale-[1.02]`}
      />

      {/* 2. Hover Image (Image 2 of the SAME product) with subtle 350-400ms crossfade */}
      {hoverImage && (
        <SafeImage
          src={hoverImage}
          alt={`${product.name} alternate angle`}
          fill
          sizes={sizes}
          className={`${fitClass} opacity-0 group-hover:opacity-100 transition-all duration-400 ease-out group-hover:scale-[1.02]`}
          aria-hidden="true"
        />
      )}

      {/* Overlaid badges / children (like Quick Actions or Tags) */}
      {children}
    </div>
  );
}
