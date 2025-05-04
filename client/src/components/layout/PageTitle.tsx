import { Helmet } from 'react-helmet';

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

export default function PageTitle({ title, subtitle }: PageTitleProps) {
  const fullTitle = subtitle ? `${title} - ${subtitle}` : title;
  
  return (
    <Helmet>
      <title>{fullTitle} | mc2i Cyber</title>
    </Helmet>
  );
}