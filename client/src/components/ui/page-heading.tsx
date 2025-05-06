import React from 'react';

interface PageHeadingProps {
  title: string;
  subtitle?: string;
  icon?: string;
}

export function PageHeading({ title, subtitle, icon }: PageHeadingProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        {icon && <span className="text-2xl">{icon}</span>}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      </div>
      {subtitle && (
        <p className="text-muted-foreground text-lg">{subtitle}</p>
      )}
    </div>
  );
}