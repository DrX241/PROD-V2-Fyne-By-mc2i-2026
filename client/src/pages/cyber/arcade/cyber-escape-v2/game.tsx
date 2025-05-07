import React from 'react';
import { motion } from 'framer-motion';
import { GameProvider } from './state/game-state-v2';
import CyberTerminal from './components/CyberTerminal';
import InventoryPanel from './components/InventoryPanel';
import StageProgress from './components/StageProgress';
import { Link } from 'wouter';

/**
 * Page de présentation pour le nouveau jeu Cyber Escape v2.0
 */
const CyberEscapeGame = () => {
  // Exemple de messages pour prévisualiser le terminal
  const terminalMessages = [
    'Initialisation de la simulation "Cyber Escape: Le Pare-feu est tombé"...',
    'Bienvenue dans la version 2.0 du jeu pédagogique de cybersécurité.',
    'En cours de développement: implémentation de la salle des serveurs (niveau 1).',
    'Les composants visuels ont été créés avec succès.',
    'Préparez-vous à relever des défis de cybersécurité réalistes!'
  ];

  // Exemple d'objets pour prévisualiser l'inventaire
  const inventoryItems = {
    'badge': {
      id: 'badge',
      name: 'Badge de Sécurité',
      description: 'Badge d\'accès pour les zones sécurisées du bâtiment.',
      type: 'key',
      usable: true,
      imagePath: '/assets/badge.png'
    },
    'usb': {
      id: 'usb',
      name: 'Clé USB',
      description: 'Contient des données importantes pour la mission.',
      type: 'tool',
      usable: true,
      imagePath: '/assets/usb.png'
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 bg-[url('/assets/cyber-bg.jpg')] bg-cover bg-center bg-fixed text-gray-200 p-4">
      {/* Overlay pour lisibilité */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-0"></div>
      
      {/* Contenu principal */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 py-6">
          {/* Bannière du jeu */}
          <div className="bg-black/60 border border-blue-800 rounded-lg p-6 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-blue-400 mb-4">
              CYBER ESCAPE: Le Pare-feu est tombé
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto">
              En tant que RSSI nouvellement nommé, votre mission est de restaurer les défenses de l'entreprise 
              après une cyberattaque majeure. Relevez 10 défis techniques à travers différentes salles 
              pour sécuriser à nouveau le système.
            </p>
          </div>
          
          {/* Aperçu des composants */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1">
              <h2 className="text-xl font-bold text-green-400 mb-4">Aperçu du Terminal</h2>
              <CyberTerminal messages={terminalMessages} />
            </div>
            
            <div className="col-span-1">
              <h2 className="text-xl font-bold text-blue-400 mb-4">Aperçu de l'Inventaire</h2>
              <InventoryPanel 
                items={inventoryItems} 
                onUseItem={(id) => console.log(`Utilisation de l'objet: ${id}`)} 
                onInspectItem={(id) => console.log(`Inspection de l'objet: ${id}`)} 
              />
            </div>
          </div>
          
          <div className="mt-4">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">Progression des Niveaux</h2>
            <StageProgress currentStage={1} unlockedStages={[1]} totalStages={10} />
          </div>
          
          {/* Bouton pour lancer le jeu */}
          <div className="mt-8 text-center">
            <p className="text-lg text-gray-300 mb-6">
              Le développement actif de Cyber Escape v2.0 est en cours. La version 1.0 du jeu a été 
              remplacée par cette nouvelle version améliorée avec une interface plus intuitive, 
              des défis plus réalistes et une meilleure expérience utilisateur.
            </p>
            
            <Link href="/cyber/arcade">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg border border-blue-500 transition-all hover:scale-105">
                Retour au Centre d'Arcade
              </button>
            </Link>
            
            <p className="text-gray-400 mt-4 text-sm">
              Version 2.0 - Développement en cours - Niveau 1 presque terminé
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CyberEscapeGame;