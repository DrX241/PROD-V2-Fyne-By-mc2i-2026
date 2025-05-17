import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Composant personnalisé qui remplace CardDescription mais utilise un div au lieu d'un p
 * Cela permet d'éviter les erreurs de validation DOM lorsqu'on a des listes <ul> à l'intérieur
 */
export const CustomCardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));

CustomCardDescription.displayName = "CustomCardDescription";