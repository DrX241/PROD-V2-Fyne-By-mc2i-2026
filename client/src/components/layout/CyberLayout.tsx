import Header from "./Header";
import ConnectionStatus from "@/components/cyber/ConnectionStatus";
import { useChatContext } from "@/contexts/ChatContext";

interface CyberLayoutProps {
  children: React.ReactNode;
}

export default function CyberLayout({ children }: CyberLayoutProps) {
  const { scenario } = useChatContext();
  
  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white">
      <Header />
      
      {/* Affichage du statut de connexion */}
      <div className="fixed bottom-4 right-4 z-30">
        <ConnectionStatus />
      </div>

      <main className="flex-1 flex w-full overflow-hidden relative z-10" style={{ height: 'calc(100vh - 70px)' }}>
        {/* Zone principale de contenu */}
        <div className="flex-1 h-full overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}