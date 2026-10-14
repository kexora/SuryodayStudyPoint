import React from 'react';
import { cn } from '@/lib/utils';
import { themeConfig, getRadiusClass } from '@/theme.config';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          themeConfig.input.base,
          getRadiusClass(),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
