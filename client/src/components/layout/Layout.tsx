import Header from "./Header";
import Sidebar from "@/components/cyber/Sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  
  // Largeur de la barre latérale adaptée au design
  const sidebarWidth = isMobile ? "0px" : "260px";
  
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-gray-50">
      <Header />

      <main className="flex-1 flex w-full overflow-hidden">
        {!isMobile && <Sidebar />}
        <div 
          className="flex-1 overflow-hidden transition-all duration-300 ease-in-out"
          style={{ marginLeft: isMobile ? "0px" : sidebarWidth }}
        >
          <div className="h-full overflow-hidden p-0 lg:p-4">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
