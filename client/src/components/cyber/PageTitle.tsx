import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle }) => {
  return (
    <div className="ml-6">
      <h1 className="text-3xl font-bold text-white tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-blue-300 mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default PageTitle;