import React, { ReactNode, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  distance?: number;
  blur?: number;
  key?: string | number;
}

export function ScrollReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 30,
  blur = 8,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10px" });

  let x = 0;
  let y = 0;

  if (direction === 'up') {
    y = distance;
  } else if (direction === 'down') {
    y = -distance;
  } else if (direction === 'left') {
    x = distance;
  } else if (direction === 'right') {
    x = -distance;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ 
        opacity: 0, 
        x, 
        y, 
        filter: `blur(${blur}px)` 
      }}
      animate={isInView ? { 
        opacity: 1, 
        x: 0, 
        y: 0, 
        filter: 'blur(0px)' 
      } : { 
        opacity: 0, 
        x, 
        y, 
        filter: `blur(${blur}px)` 
      }}
      transition={{
        duration,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98]
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
