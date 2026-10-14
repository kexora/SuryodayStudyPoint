import React, { useState, useEffect } from 'react';
import { Loader2, ImageOff } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper to convert Google Drive sharing/view URLs into direct high-performance CDN URLs
export function formatGoogleDriveUrl(url: string | undefined): string {
  if (!url) return '';
  
  // Extract file ID from various Google Drive URL formats
  let fileId = '';
  
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/drive\.google\.com\/file\/d\/([^\/\?]+)/);
    if (match && match[1]) fileId = match[1];
  } else if (url.includes('drive.google.com/uc?')) {
    const match = url.match(/id=([^\&]+)/);
    if (match && match[1]) fileId = match[1];
  } else if (url.includes('lh3.googleusercontent.com/d/')) {
    const match = url.match(/lh3\.googleusercontent\.com\/d\/([^=\/\?]+)/);
    if (match && match[1]) fileId = match[1];
  }

  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}=s1600`;
  }

  return url;
}

export interface ImageWithLoaderProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  itemProp?: string;
  loading?: "lazy" | "eager";
  title?: string;
  src?: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  fallbackIcon?: React.ReactNode;
}

export function ImageWithLoader({
  src,
  alt,
  className,
  containerClassName,
  fallbackIcon,
  ...props
}: ImageWithLoaderProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const formattedSrc = formatGoogleDriveUrl(src);

  useEffect(() => {
    setLoaded(false);
    setError(false);

    if (!formattedSrc) {
      setError(true);
      return;
    }

    // Preload image in JS memory to ensure simultaneous fetching
    const img = new Image();
    img.src = formattedSrc;
    img.onload = () => {
      setLoaded(true);
    };
    img.onerror = () => {
      setError(true);
      setLoaded(true);
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [formattedSrc]);

  return (
    <div className={cn("relative overflow-hidden flex items-center justify-center bg-slate-100/80", containerClassName)}>
      {/* Loading Screen Overlay - Remains visible until image preview loads */}
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200/90 animate-pulse z-10">
          <Loader2 className="w-5 h-5 animate-spin text-crhs-navy opacity-70" />
        </div>
      )}

      {/* Error Fallback */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2 z-10 text-center">
          {fallbackIcon || <ImageOff className="w-5 h-5 mb-1 opacity-60" />}
          <span className="text-[10px] font-bold uppercase tracking-wider">Image Unavailable</span>
        </div>
      )}

      {/* Main Image */}
      {formattedSrc && (
        <img
          src={formattedSrc}
          alt={alt || "Image"}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setError(true);
            setLoaded(true);
          }}
          className={cn(
            "transition-opacity duration-300",
            loaded && !error ? "opacity-100" : "opacity-0",
            className
          )}
          {...props}
        />
      )}
    </div>
  );
}
