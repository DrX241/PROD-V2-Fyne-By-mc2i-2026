import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet';

interface AdminPageTitleProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export default function AdminPageTitle({ title, description, icon }: AdminPageTitleProps) {
  return (
    <>
      <Helmet>
        <title>{title} | Administration mc2i Cyber</title>
      </Helmet>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b">
        <div className="flex items-center gap-3">
          {icon && <div className="p-2 rounded-lg bg-violet-50">{icon}</div>}
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && (
              <p className="text-gray-500 mt-1">{description}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}