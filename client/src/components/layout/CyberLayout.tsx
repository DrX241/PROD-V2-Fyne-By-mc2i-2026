import Header from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";
import ConfigPanel from "@/components/cyber/ConfigPanel";
import { useChatContext } from "@/contexts/ChatContext";
import { useState, useEffect } from "react";
import { ShieldCheck, Settings, Info, AlertTriangle, Lock } from "lucide-react";

interface CyberLayoutProps {
  children: React.ReactNode;
}

// Données informatives sur la cybersécurité
const cyberSecurityFacts = [
  {
    category: "Définition",
    content: "La cybersécurité est l'ensemble des technologies, processus et pratiques conçus pour protéger les réseaux, les ordinateurs, les programmes et les données contre les attaques, les dommages ou les accès non autorisés."
  },
  {
    category: "Fait historique",
    content: "Le premier ver informatique majeur, Morris Worm, a été créé en 1988 par Robert Morris et a affecté environ 10% des ordinateurs connectés à Internet à l'époque."
  },
  {
    category: "Conseil",
    content: "Utilisez des phrases de passe (password phrases) plutôt que des mots de passe simples. Une phrase comme 'La-cybersécurité-est-importante-en-2023!' est plus sécurisée qu'un mot de passe court et complexe."
  },
  {
    category: "Statistique",
    content: "Environ 95% des violations de cybersécurité sont dues à l'erreur humaine, selon IBM Security."
  },
  {
    category: "Conseil",
    content: "Activez l'authentification à deux facteurs (2FA) sur tous vos comptes importants pour ajouter une couche de sécurité supplémentaire."
  },
  {
    category: "Définition",
    content: "Le phishing est une technique de cyberattaque où les attaquants se font passer pour des entités légitimes afin d'obtenir des informations sensibles comme des mots de passe ou des données bancaires."
  },
  {
    category: "Fait historique",
    content: "Le terme 'bug informatique' est né en 1947 quand Grace Hopper a trouvé un vrai insecte (un papillon de nuit) dans un relais du Harvard Mark II, causant un dysfonctionnement."
  },
  {
    category: "Conseil",
    content: "Mettez régulièrement à jour tous vos logiciels. Les mises à jour contiennent souvent des correctifs de sécurité pour des vulnérabilités connues."
  },
  {
    category: "Statistique",
    content: "Les attaques de ransomware ont augmenté de plus de 150% en 2021, avec une rançon moyenne demandée dépassant les 200 000 dollars."
  },
  {
    category: "Définition",
    content: "Un pare-feu (firewall) est un système de sécurité qui surveille et contrôle le trafic réseau entrant et sortant selon des règles de sécurité prédéfinies."
  }
];

export default function CyberLayout({ children }: CyberLayoutProps) {
  const { scenario } = useChatContext();
  const isMobile = useIsMobile();
  const [showConfig, setShowConfig] = useState(false);
  const [factIndex, setFactIndex] = useState(0);
  
  // Rotation des faits sur la cybersécurité
  useEffect(() => {
    const interval = setInterval(() => {
      setFactIndex(prev => (prev + 1) % cyberSecurityFacts.length);
    }, 8000); // Change de fait toutes les 8 secondes
    
    return () => clearInterval(interval);
  }, []);
  
  const currentFact = cyberSecurityFacts[factIndex];
  
  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white">
      <Header />
      
      {/* Bannière d'informations sur la cybersécurité */}
      <div className="fixed top-16 left-0 right-0 backdrop-blur-md bg-blue-900/30 border-y border-blue-700/50 shadow-lg p-3 text-sm text-blue-100 z-10">
        <div className="max-w-4xl mx-auto flex items-start gap-2">
          {currentFact.category === "Définition" && <Info className="h-5 w-5 text-blue-300 flex-shrink-0 mt-0.5" />}
          {currentFact.category === "Conseil" && <ShieldCheck className="h-5 w-5 text-green-300 flex-shrink-0 mt-0.5" />}
          {currentFact.category === "Fait historique" && <Lock className="h-5 w-5 text-yellow-300 flex-shrink-0 mt-0.5" />}
          {currentFact.category === "Statistique" && <AlertTriangle className="h-5 w-5 text-orange-300 flex-shrink-0 mt-0.5" />}
          
          <div>
            <span className="font-bold text-blue-200">{currentFact.category}: </span>
            <span>{currentFact.content}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 flex w-full overflow-hidden relative z-10 mt-10" style={{ height: 'calc(100vh - 110px)' }}>
        {/* Colonne latérale gauche avec glossaire cybersécurité */}
        {!isMobile && (
          <div className="w-72 backdrop-blur-md bg-black/20 border-r border-blue-800/30 p-4 overflow-y-auto scrollbar-cyber hidden lg:block">
            <h3 className="text-lg font-semibold text-blue-300 mb-3 border-b border-blue-700/30 pb-2">Glossaire Cyber</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-900/30 border border-blue-800/40 rounded-lg p-3">
                <h4 className="text-blue-200 font-medium">Ransomware</h4>
                <p className="text-blue-100/80 text-sm mt-1">Logiciel malveillant qui chiffre les données de la victime et exige une rançon pour leur déchiffrement.</p>
              </div>
              
              <div className="bg-blue-900/30 border border-blue-800/40 rounded-lg p-3">
                <h4 className="text-blue-200 font-medium">Hameçonnage (Phishing)</h4>
                <p className="text-blue-100/80 text-sm mt-1">Technique frauduleuse pour obtenir des informations personnelles en se faisant passer pour un tiers de confiance.</p>
              </div>
              
              <div className="bg-blue-900/30 border border-blue-800/40 rounded-lg p-3">
                <h4 className="text-blue-200 font-medium">Zero-day</h4>
                <p className="text-blue-100/80 text-sm mt-1">Vulnérabilité de sécurité inconnue du développeur et qui n'a pas encore été corrigée.</p>
              </div>
              
              <div className="bg-blue-900/30 border border-blue-800/40 rounded-lg p-3">
                <h4 className="text-blue-200 font-medium">DDoS</h4>
                <p className="text-blue-100/80 text-sm mt-1">Attaque par déni de service distribué qui submerge un système avec un volume massif de requêtes.</p>
              </div>
              
              <div className="bg-blue-900/30 border border-blue-800/40 rounded-lg p-3">
                <h4 className="text-blue-200 font-medium">Chiffrement</h4>
                <p className="text-blue-100/80 text-sm mt-1">Processus qui rend des données illisibles à toute personne ne possédant pas la clé de déchiffrement.</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Zone principale de contenu */}
        <div className="flex-1 overflow-y-auto flex justify-center">
          <div className="w-full max-w-5xl overflow-y-auto backdrop-blur-sm bg-black/10 rounded-lg shadow-xl my-4 mx-4">
            {children}
          </div>
        </div>
        
        {/* Panneau latéral de config et conseils */}
        {!isMobile ? (
          <div 
            className={`backdrop-blur-md bg-black/20 border-l border-gray-700/50 transition-all duration-500 ${
              showConfig ? 'w-80' : 'w-0 opacity-0'
            } overflow-y-auto scrollbar-cyber`}
          >
            {showConfig && (
              <div className="p-4 h-full">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-300 mb-3 border-b border-blue-700/30 pb-2">Configuration</h3>
                  <ConfigPanel />
                </div>
                
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-green-300 mb-3 border-b border-blue-700/30 pb-2">Conseils de sécurité</h3>
                  
                  <ul className="space-y-3 text-sm text-blue-100/80">
                    <li className="flex gap-2 items-start">
                      <ShieldCheck className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Utilisez un gestionnaire de mots de passe pour créer et stocker des mots de passe uniques et complexes.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <ShieldCheck className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Effectuez des sauvegardes régulières de vos données importantes sur un support externe.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <ShieldCheck className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Ne cliquez jamais sur des liens ou pièces jointes provenant d'expéditeurs inconnus.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <ShieldCheck className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Verrouillez votre écran lorsque vous vous éloignez de votre poste de travail.</span>
                    </li>
                    <li className="flex gap-2 items-start">
                      <ShieldCheck className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Méfiez-vous des réseaux Wi-Fi publics et utilisez un VPN si nécessaire.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        ) : null}
        
        {/* Bouton pour ouvrir/fermer le panneau de config */}
        {!isMobile && (
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="fixed right-0 top-1/2 transform -translate-y-1/2 bg-blue-900/80 hover:bg-blue-800/90 backdrop-blur-sm border border-blue-700/50 shadow-lg rounded-l-md p-3 z-20 transition-all duration-300"
          >
            <Settings className={`h-5 w-5 text-blue-100 transition-transform duration-300 ${showConfig ? 'rotate-180' : ''}`} />
          </button>
        )}
      </main>
    </div>
  );
}