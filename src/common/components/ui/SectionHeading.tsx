import React from 'react';
import { cn } from '@/lib/utils';

export function SectionHeading({ 
  title, 
  subtitle, 
  className,
  centered = false 
}: { 
  title: string; 
  subtitle?: string; 
  className?: string;
  centered?: boolean;
}) {
  return (
    <div className={cn("mb-6 sm:mb-10 lg:mb-12", centered ? "flex flex-col items-center text-center" : "", className)}>
      {subtitle && (
        <p className="text-[10px] sm:text-xs font-black tracking-[0.2em] sm:tracking-[0.3em] text-crhs-gold uppercase mb-2 sm:mb-4">
          {subtitle}
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-tight uppercase text-crhs-navy mb-3 sm:mb-6 break-words max-w-full">
        {title}
      </h2>
      <div className={cn("h-1 w-12 sm:w-16 bg-crhs-gold rounded-none", centered ? "mx-auto" : "")}></div>
    </div>
  );
}
