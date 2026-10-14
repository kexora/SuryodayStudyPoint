import React from 'react';
import { cn } from '@/lib/utils';
import { themeConfig, getRadiusClass } from '@/theme.config';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof themeConfig.button.variants;
  size?: keyof typeof themeConfig.button.sizes;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          themeConfig.button.base,
          themeConfig.button.sizes[size],
          themeConfig.button.variants[variant],
          getRadiusClass(),
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
