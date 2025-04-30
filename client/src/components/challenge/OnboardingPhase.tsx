import React, { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { PlayerRole } from '@shared/types/challenge';
import { Users, Shield, Terminal, Star, Scale } from 'lucide-react';

interface OnboardingPhaseProps {
  onComplete: () => void;
}

export default function OnboardingPhase({ onComplete }: OnboardingPhaseProps) {
  const { createGame, addPlayer, state, error, isLoading } = useGame();
  const [playerCount, setPlayerCount] = useState<number | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [selectedRole, setSelectedRole] = useState<PlayerRole | null>(null);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameId, setGameId] = useState<string | null>(null);
  
  // Fonction pour gérer la création du jeu
  const handleCreateGame = async () => {
    if (!playerCount) return;
    
    try {
      const id = await createGame();
      setGameId(id);
    } catch (error) {
      console.error('Error creating game:', error);
    }
  };
  
  // Fonction pour gérer l'ajout d'un joueur
  const handleAddPlayer = () => {
    if (!playerName || !selectedRole) return;
    
    addPlayer(playerName, selectedRole);
    
    // Réinitialiser les champs
    setPlayerName('');
    setSelectedRole(null);
    
    // Vérifier si tous les joueurs ont été ajoutés
    if (currentPlayerIndex + 1 >= playerCount!) {
      onComplete();
    } else {
      setCurrentPlayerIndex(prev => prev + 1);
    }
  };
  
  // Icônes pour les différents rôles
  const roleIcons = {
    [PlayerRole.RSSI]: <Shield className="h-5 w-5" />,
    [PlayerRole.HACKER]: <Star className="h-5 w-5" />,
    [PlayerRole.DEVELOPER]: <Terminal className="h-5 w-5" />,
    [PlayerRole.CONSULTANT]: <Users className="h-5 w-5" />,
    [PlayerRole.LEGAL]: <Scale className="h-5 w-5" />,
    [PlayerRole.SYSADMIN]: <Terminal className="h-5 w-5" />,
  };
  
  return (
    <div className="p-6 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">🛡️ CyberChallenge - Phase d'enregistrement 🛡️</h2>
        <p className="text-blue-300">
          Bienvenue dans la simulation de gestion de crise cybersécurité.
          Chaque décision compte!
        </p>
      </div>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-4 rounded-md">
          {error}
        </div>
      )}
      
      {!playerCount ? (
        <div className="bg-slate-700/50 p-6 rounded-lg border border-blue-600/30 max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-4">Nombre de participants</h3>
          <p className="mb-4 text-sm">Combien de joueurs vont participer à cette session?</p>
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 4, 5].map(num => (
              <button 
                key={num}
                onClick={() => setPlayerCount(num)} 
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 
                           flex items-center justify-center font-bold transition-colors"
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      ) : !gameId ? (
        <div className="bg-slate-700/50 p-6 rounded-lg border border-blue-600/30 max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-4">Configuration du jeu</h3>
          <p className="mb-6">Nous allons créer une session pour {playerCount} joueur{playerCount > 1 ? 's' : ''}.</p>
          
          <button
            onClick={handleCreateGame}
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-md font-medium 
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Création en cours...
              </>
            ) : (
              'Créer la partie'
            )}
          </button>
        </div>
      ) : (
        <div className="bg-slate-700/50 p-6 rounded-lg border border-blue-600/30 max-w-md mx-auto">
          <h3 className="text-xl font-semibold mb-4">
            Joueur {currentPlayerIndex + 1} / {playerCount}
          </h3>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="playerName" className="block text-sm font-medium mb-2">
                Votre prénom
              </label>
              <input
                id="playerName"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-3 rounded-md bg-slate-800 border border-blue-700/50 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                placeholder="Entrez votre prénom..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Choisissez votre rôle</label>
              <div className="grid grid-cols-1 gap-3">
                {Object.values(PlayerRole).map(role => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`p-3 rounded-md text-left hover:bg-blue-700/30 transition-colors flex items-center
                               ${selectedRole === role ? 'bg-blue-600/40 border-2 border-blue-500' : 'bg-slate-800/80 border border-blue-700/30'}`}
                  >
                    <span className="bg-blue-900/50 rounded-full p-2 mr-3">
                      {roleIcons[role]}
                    </span>
                    <span className="font-medium">{role}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleAddPlayer}
              disabled={!playerName || !selectedRole || isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-md font-medium 
                         disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Enregistrement...
                </>
              ) : (
                'Confirmer'
              )}
            </button>
          </div>
        </div>
      )}
      
      {state.players.length > 0 && (
        <div className="bg-slate-700/30 p-4 rounded-lg max-w-md mx-auto">
          <h4 className="font-medium mb-2 text-blue-300">Joueurs enregistrés</h4>
          <ul className="space-y-2">
            {state.players.map((player, index) => (
              <li key={player.id} className="flex items-center gap-3 bg-slate-800/40 p-2 rounded">
                <span className="bg-blue-900/50 rounded-full p-1">
                  {roleIcons[player.role]}
                </span>
                <div>
                  <p className="font-medium">{player.name}</p>
                  <p className="text-xs text-slate-400">{player.role}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}