import React, { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';

// Définir les variantes du bouton
const dataButtonVariants = cva(
  'font-data relative inline-flex items-center justify-center cursor-pointer transition-all duration-300 select-none',
  {
    variants: {
      variant: {
        default: 'data-button bg-gradient-to-r from-indigo-900 to-purple-900 text-white hover:from-indigo-800 hover:to-purple-800 hover:shadow-purple-500/20 hover:shadow-lg',
        outline: 'bg-transparent border-2 border-purple-700 text-purple-400 hover:bg-purple-900/20 hover:border-purple-600 hover:text-purple-300',
        secondary: 'bg-gradient-to-r from-blue-900 to-cyan-900 text-white hover:from-blue-800 hover:to-cyan-800 hover:shadow-cyan-500/20 hover:shadow-lg',
        ghost: 'bg-transparent hover:bg-purple-900/20 text-purple-400 hover:text-purple-300',
        link: 'text-purple-500 underline-offset-4 hover:underline hover:text-purple-400 bg-transparent p-0',
        glow: 'from-purple-700 to-indigo-700 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 data-hover-glow',
        destructive: 'bg-gradient-to-r from-red-900 to-pink-900 text-white hover:from-red-800 hover:to-pink-800 hover:shadow-red-500/20 hover:shadow-lg',
      },
      size: {
        sm: 'text-xs px-3 py-1.5 rounded-md',
        md: 'text-sm px-4 py-2 rounded-md',
        lg: 'text-base px-5 py-2.5 rounded-lg',
        xl: 'text-lg px-6 py-3 rounded-lg',
      },
      dataEffect: {
        none: '',
        flow: 'data-flow',
        border: 'data-border',
        pulse: 'after:content-[""] after:absolute after:inset-0 after:bg-white after:bg-opacity-0 after:animate-pulse-faint',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      dataEffect: 'none',
      fullWidth: false,
    },
  }
);

// Props pour le composant DataButton
export interface DataButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof dataButtonVariants> {
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

// Composant DataButton avec ref forwarding
const DataButton = forwardRef<HTMLButtonElement, DataButtonProps>(
  ({ 
    className, 
    children, 
    variant, 
    size, 
    dataEffect, 
    fullWidth, 
    isLoading, 
    startIcon, 
    endIcon, 
    disabled, 
    ...props 
  }, ref) => {
    return (
      <button
        className={cn(
          dataButtonVariants({ 
            variant, 
            size, 
            dataEffect, 
            fullWidth, 
            className 
          })
        )}
        disabled={isLoading || disabled}
        ref={ref}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : startIcon ? (
          <span className="mr-2">{startIcon}</span>
        ) : null}
        
        {children}
        
        {!isLoading && endIcon ? (
          <span className="ml-2">{endIcon}</span>
        ) : null}
      </button>
    );
  }
);

DataButton.displayName = 'DataButton';

export { DataButton, dataButtonVariants };