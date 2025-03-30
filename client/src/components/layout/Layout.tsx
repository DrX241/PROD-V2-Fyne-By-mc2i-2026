import Header from "./Header";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function Layout({ children, showSidebar = false }: LayoutProps) {
  const [location] = useLocation();
  const moduleName = location.split('/')[1] || '';
  
  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden bg-gray-50">
      <Header />

      <main className="flex-1 w-full">
        {children}
      </main>
    </div>
  );
}
