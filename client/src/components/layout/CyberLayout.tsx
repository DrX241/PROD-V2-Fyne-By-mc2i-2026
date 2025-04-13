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
      
      {/* Affichage du statut de connexion */}
      <div className="fixed bottom-4 right-4 z-30">
        <ConnectionStatus />
      </div>

      <main className="flex-1 flex w-full overflow-hidden relative z-10 pt-[70px]" style={{ height: `calc(100vh - ${headerHeight})` }}>
        {/* Zone principale de contenu */}
        <div className="flex-1 overflow-y-auto flex justify-center">
          <div className="w-full max-w-5xl overflow-y-auto backdrop-blur-sm bg-black/10 rounded-lg shadow-xl my-4 mx-4">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}