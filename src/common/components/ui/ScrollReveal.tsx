import React, { ReactNode, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'; // kept for compatibility but ignored
  delay?: number;
  duration?: number;
  distance?: number;
  key?: string | number;
}

export function ScrollReveal({
  children,
  className,
  direction = 'up',
  delay = 0,
  duration = 0.6,
  distance = 40,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  let y = 0;
  // Always slide from bottom, except when none
  if (direction !== 'none') {
    y = distance;
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y, filter: 'blur(8px)' }}
      animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : { opacity: 0, y, filter: 'blur(8px)' }}
      transition={{
        duration,
        delay,
        ease: 'easeOut'
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
