import Header from "./Header";
import ConnectionStatus from "@/components/cyber/ConnectionStatus";
import { useChatContext } from "@/contexts/ChatContext";

interface CyberLayoutProps {
  children: React.ReactNode;
}

export default function CyberLayout({ children }: CyberLayoutProps) {
  const { scenario } = useChatContext();
  
  // Hauteur du header
  const headerHeight = "70px";

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white">
      <Header />
      
      {/* L'affichage du statut de connexion a été déplacé vers le header */}

      <main className="flex-1 relative z-10 pt-[70px]" style={{ height: `calc(100vh - ${headerHeight})` }}>
        {/* Zone principale de contenu */}
        <div className="h-full flex justify-center px-4 pb-4">
          <div className="w-full max-w-7xl backdrop-blur-sm bg-black/10 rounded-lg shadow-xl">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}