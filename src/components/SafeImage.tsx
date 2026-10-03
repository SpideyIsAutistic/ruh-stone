'use client';

import React, { useState } from 'react';
import Image, { ImageProps } from 'next/image';

interface SafeImageProps extends Omit<ImageProps, 'src'> {
  src: string | null | undefined;
  fallbackSrc?: string;
}

const DEFAULT_FALLBACK = '/images/atelier-carving.jpg';

export default function SafeImage({
  src,
  alt = 'Ruh Stone handcrafted object',
  fallbackSrc = DEFAULT_FALLBACK,
  className = '',
  fill,
  sizes,
  priority,
  style,
  ...rest
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  const cleanSrc = (src && typeof src === 'string' && src.trim()) ? src.trim() : fallbackSrc;
  const currentSrc = hasError ? fallbackSrc : cleanSrc;

  const isDataUrl = currentSrc.startsWith('data:');
  const isBlobUrl = currentSrc.startsWith('blob:');

  // If the image is a data URL or blob URL, next/image will throw "Failed to parse src".
  // Native HTML <img> renders both seamlessly with zero performance overhead.
  if (isDataUrl || isBlobUrl) {
    const combinedStyle: React.CSSProperties = fill
      ? {
          position: 'absolute',
          height: '100%',
          width: '100%',
          left: 0,
          top: 0,
          right: 0,
          bottom: 0,
          objectFit: className.includes('object-contain') ? 'contain' : 'cover',
          objectPosition: 'center',
          ...style,
        }
      : { ...style };

    return (
      <img
        src={currentSrc}
        alt={alt}
        className={className}
        style={combinedStyle}
        onError={() => setHasError(true)}
        loading={priority ? 'eager' : 'lazy'}
      />
    );
  }

  // Resilient rendering with unoptimized=true so external URLs never throw host errors
  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill={fill}
      sizes={sizes}
      priority={priority}
      className={className}
      style={style}
      unoptimized={true}
      onError={() => setHasError(true)}
      {...rest}
    />
  );
}
