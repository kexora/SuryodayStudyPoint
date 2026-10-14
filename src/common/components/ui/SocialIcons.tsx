import React from 'react';

// Standardized 24x24 Outline SVG Icon Package
// All icons use a unified stroke style (fill="none" stroke="currentColor" strokeWidth="2")
// with no background elements for 100% visual consistency.

export const SocialIcons = {
  youtube: (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      viewBox="0 0 24 24" 
      width="24" 
      height="24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <rect width="20" height="14" x="2" y="5" rx="4" />
      <polygon points="10 9 15 12 10 15 10 9" fill="currentColor" stroke="none" />
    </svg>
  ),

  instagram: (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      viewBox="0 0 24 24" 
      width="24" 
      height="24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  ),

  facebook: (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      viewBox="0 0 24 24" 
      width="24" 
      height="24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),

  twitter: (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      viewBox="0 0 24 24" 
      width="24" 
      height="24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
      <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
    </svg>
  ),

  linkedin: (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      viewBox="0 0 24 24" 
      width="24" 
      height="24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),

  whatsapp: (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      viewBox="0 0 24 24" 
      width="24" 
      height="24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
      <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-.5-.5A1.5 1.5 0 0 0 8 10c0 2.5 2 4.5 4.5 4.5a1.5 1.5 0 0 0 1.5-1.5.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0 0 1" />
    </svg>
  ),

  telegram: (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      viewBox="0 0 24 24" 
      width="24" 
      height="24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),

  pinterest: (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      viewBox="0 0 24 24" 
      width="24" 
      height="24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <line x1="8" y1="20" x2="12" y2="11" />
      <path d="M10.7 13.97c1.22 1.3 3.3.84 3.3-1.12 0-3.3-2.7-4.85-5.5-4.85-3.8 0-6.5 2.8-6.5 6.3 0 2.1 1.1 3.5 2.5 3.5.5 0 .8-.3.7-.8-.1-.4-.3-1.1-.3-1.4 0-.3.2-.6.6-.6.9 0 1.9.9 1.9 2.2 0 1.6-1.1 2.8-2.6 2.8-2.3 0-4.1-1.9-4.1-4.7 0-4.1 3.4-7.3 8.3-7.3 4.7 0 7.7 3.2 7.7 7 0 4.2-2.3 7.3-5.5 7.3-1.1 0-2.1-.6-2.5-1.3" />
    </svg>
  ),

  tiktok: (props: React.SVGProps<SVGSVGElement>) => (
    <svg 
      viewBox="0 0 24 24" 
      width="24" 
      height="24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  )
};
