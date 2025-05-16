import React from 'react';
import { Helmet } from 'react-helmet';

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

export default function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <Helmet>
      <title>{title} | FYNE</title>
    </Helmet>
  );
}