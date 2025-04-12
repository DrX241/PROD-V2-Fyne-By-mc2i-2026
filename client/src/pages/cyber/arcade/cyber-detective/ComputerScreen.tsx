import React, { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PuzzleData } from './game';
import computerScreenSvg from '@/assets/cyber-detective/computer-screen.svg';

interface ComputerScreenProps {
  isOpen: boolean;
  onClose: () => void;
  puzzle: PuzzleData;
  onSolve: (puzzleId: string) => void;
}

export const ComputerScreen: React.FC<ComputerScreenProps> = ({
  isOpen,
  onClose,
  puzzle,
  onSolve
}) => {
  const [inputValue, setInputValue] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [currentDirectory, setCurrentDirectory] = useState('/home/admin');
  const [isLocked, setIsLocked] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  useEffect(() => {
    if (isOpen) {
      // Initialiser les messages de l'ordinateur
      if (puzzle.type === 'password') {
        setOutput([
          'TechSecure OS v3.4 (kernel 5.16.0-security)',
          '© 2025 TechSecure Inc. Tous droits réservés.',
          '',
          '*** SÉCURITÉ RENFORCÉE ***',
          'Accès au système protégé. Mot de passe requis.',
          ''
        ]);
      } else if (puzzle.type === 'terminal') {
        setOutput([
          'TechSecure OS v3.4 (kernel 5.16.0-security)',
          '© 2025 TechSecure Inc. Tous droits réservés.',
          '',
          `Utilisateur connecté: admin`,
          `Localisation: ${currentDirectory}`,
          `Dernière connexion: Aujourd'hui 09:15 depuis 192.168.1.48`,
          '',
          'Entrez une commande:',
          ''
        ]);
        setIsLocked(false);
      }
    } else {
      // Réinitialiser l'état quand la fenêtre se ferme
      setInputValue('');
      setOutput([]);
      setLoginAttempts(0);
      setShowHint(false);
      setIsLocked(true);
    }
  }, [isOpen, puzzle, currentDirectory]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    const command = inputValue.trim();
    setInputValue('');
    
    // Ajouter la commande à l'output
    const newOutput = [...output];
    
    if (puzzle.type === 'password') {
      newOutput.push(`Mot de passe: ${'*'.repeat(command.length)}`);
      
      if (command === puzzle.solution) {
        newOutput.push('');
        newOutput.push('Mot de passe correct. Accès accordé.');
        newOutput.push('Chargement du système...');
        newOutput.push('');
        setOutput(newOutput);
        
        // Permettre un délai pour voir le message de succès
        setTimeout(() => {
          onSolve(puzzle.id);
          onClose();
        }, 1500);
      } else {
        newOutput.push('');
        newOutput.push('Mot de passe incorrect. Accès refusé.');
        newOutput.push('');
        setOutput(newOutput);
        
        setLoginAttempts(prev => prev + 1);
        
        // Montrer l'indice après 2 tentatives
        if (loginAttempts >= 1) {
          setShowHint(true);
        }
      }
    } else if (puzzle.type === 'terminal') {
      newOutput.push(`admin@techsecure:${currentDirectory}$ ${command}`);
      
      if (command === puzzle.solution) {
        // Commande correcte pour la solution du puzzle
        newOutput.push('');
        newOutput.push('Exécution de la commande...');
        newOutput.push('Configuration du pare-feu mise à jour.');
        newOutput.push('Services redémarrés.');
        newOutput.push('Système sécurisé.');
        newOutput.push('');
        setOutput(newOutput);
        
        // Permettre un délai pour voir le message de succès
        setTimeout(() => {
          onSolve(puzzle.id);
          onClose();
        }, 1500);
      } else if (command.toLowerCase() === 'help' || command === '?') {
        // Commande d'aide
        newOutput.push('');
        newOutput.push('Commandes disponibles:');
        newOutput.push('  ls       - Lister les fichiers');
        newOutput.push('  cat      - Afficher le contenu d\'un fichier');
        newOutput.push('  cd       - Changer de répertoire');
        newOutput.push('  pwd      - Afficher le répertoire actuel');
        newOutput.push('  service  - Gérer les services système');
        newOutput.push('  iptables - Configurer le pare-feu');
        newOutput.push('  clear    - Effacer l\'écran');
        newOutput.push('');
        
        if (showHint) {
          newOutput.push('INDICE:');
          newOutput.push(puzzle.hint);
          newOutput.push('');
        }
      } else if (command.toLowerCase().startsWith('ls')) {
        // Simulation de la commande ls
        newOutput.push('');
        newOutput.push('firewall.conf  security_audit.sh  system.log');
        newOutput.push('');
      } else if (command.toLowerCase().startsWith('cat')) {
        // Simulation de la commande cat
        newOutput.push('');
        if (command.includes('firewall.conf')) {
          newOutput.push('# Configuration du pare-feu - TechSecure');
          newOutput.push('# Dernière modification: 2025-04-10');
          newOutput.push('');
          newOutput.push('DEFAULT_ZONE=public');
          newOutput.push('SERVICES="ssh http https"');
          newOutput.push('PORTS="80/tcp 443/tcp 22/tcp"');
          newOutput.push('FORWARD=false');
          newOutput.push('MASQUERADE=false');
          newOutput.push('');
          newOutput.push('# Le port 22 (SSH) est vulnérable à une attaque');
          newOutput.push('# TODO: Désactiver ce service et bloquer le port');
        } else if (command.includes('system.log')) {
          newOutput.push('Apr 10 03:15:22 techsecure sshd[1234]: Accepted password for admin from 203.0.113.100');
          newOutput.push('Apr 10 03:16:45 techsecure sshd[1235]: Accepted password for root from 203.0.113.100');
          newOutput.push('Apr 10 03:18:12 techsecure sshd[1236]: Multiple authentication failures from 203.0.113.100');
          newOutput.push('Apr 10 03:20:33 techsecure kernel: [UFW BLOCK] IN=eth0 OUT= MAC=00:11:22:33:44:55');
          newOutput.push('Apr 10 09:05:10 techsecure systemd[1]: Started System Security Service.');
        } else {
          newOutput.push(`Fichier non trouvé: ${command.split(' ')[1]}`);
        }
        newOutput.push('');
      } else if (command.toLowerCase() === 'clear') {
        // Effacer l'écran
        return setOutput([
          `Utilisateur connecté: admin`,
          `Localisation: ${currentDirectory}`,
          ''
        ]);
      } else {
        // Commande non reconnue
        newOutput.push('');
        newOutput.push(`Commande non reconnue ou incorrecte: ${command}`);
        newOutput.push('Tapez "help" pour voir les commandes disponibles.');
        newOutput.push('');
        
        setLoginAttempts(prev => prev + 1);
        
        // Montrer l'indice après quelques tentatives
        if (loginAttempts >= 2) {
          setShowHint(true);
        }
      }
    }
    
    setOutput(newOutput);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] bg-slate-900 border-slate-700 max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">{puzzle.title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col h-full overflow-hidden">
          {/* Aperçu de l'ordinateur en SVG pour l'apparence réaliste */}
          <div className="relative h-[400px] overflow-hidden mb-3">
            <img 
              src={computerScreenSvg} 
              alt="Computer Screen" 
              className="w-full h-full object-contain"
            />
            
            {/* Écran du terminal positionné par-dessus l'image SVG */}
            <div className="absolute top-[50px] left-[20px] right-[20px] bottom-[20px] overflow-auto p-3 text-green-400 font-mono text-sm">
              {output.map((line, index) => (
                <div key={index} className={line.includes('INDICE:') ? 'text-yellow-400 font-bold' : ''}>
                  {line}
                </div>
              ))}
            </div>
          </div>
          
          {/* Description du défi */}
          <div className="mb-3 text-sm text-slate-300">
            {puzzle.description}
          </div>
          
          {/* Formulaire de saisie */}
          <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
            <div className="flex items-center">
              <span className="text-green-500 mr-2 font-mono">
                {isLocked ? 'Password:' : 'admin@techsecure:~$'}
              </span>
              <input
                ref={inputRef}
                type={isLocked ? 'password' : 'text'}
                value={inputValue}
                onChange={handleInputChange}
                className="flex-1 bg-slate-800 border-none text-white font-mono px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
                placeholder={isLocked ? '********' : 'Entrez une commande...'}
                autoFocus
              />
            </div>
            
            <div className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowHint(true)}
                className="text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
              >
                Indice
              </Button>
              
              <div className="space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  variant="default"
                  className="bg-green-700 hover:bg-green-600 text-white"
                >
                  {isLocked ? 'Connexion' : 'Exécuter'}
                </Button>
              </div>
            </div>
          </form>
          
          {/* Indice */}
          {showHint && (
            <div className="mt-3 p-2 bg-yellow-900/30 border border-yellow-800 rounded text-yellow-300 text-sm">
              <strong>Indice:</strong> {puzzle.hint}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};