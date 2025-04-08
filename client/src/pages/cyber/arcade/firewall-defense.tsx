import { useEffect } from 'react';
import { useLocation } from 'wouter';

// Cette page redirige l'ancien jeu Firewall Defense vers le nouveau jeu Puzzle Réseau
export default function FirewallDefensePage() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Rediriger automatiquement vers le nouveau jeu
    setLocation('/cyber/arcade/network-puzzle');
  }, [setLocation]);
  
  // Cette page ne sera jamais affichée, mais au cas où :
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl text-white mb-4">Redirection vers Puzzle Réseau</h1>
        <p className="text-gray-300 mb-6">Le jeu Firewall Defense a été remplacé par Puzzle Réseau, une expérience améliorée.</p>
        <div className="animate-pulse">
          <p className="text-blue-400">Redirection en cours...</p>
        </div>
      </div>
    </div>
  );
}