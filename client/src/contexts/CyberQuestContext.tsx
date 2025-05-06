import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  CyberQuestPlayer, 
  Mission, 
  Environment, 
  Skill, 
  Item
} from '@shared/schema/cyber-quest';

// Type Npc temporaire (jusqu'à l'import complet)
type Npc = {
  id: number;
  name: string;
  role: string;
  description: string;
  environmentId: number;
  avatarImage?: string;
  dialogues: any;
  shop?: any;
  missions?: any;
  relationshipLevel?: number;
  isActive: boolean;
  createdAt: Date;
};

// Type Objective temporaire (jusqu'à l'import complet)
type Objective = {
  id: number;
  description: string;
  type: 'interact' | 'collect' | 'analyze' | 'solve' | 'hack' | 'defend';
  targetId?: number;
  targetCount?: number;
  completed: boolean;
};

interface CyberQuestContextType {
  // Données du joueur et état global
  player: CyberQuestPlayer | null;
  isLoading: boolean;
  error: Error | null;
  gamePhase: 'init' | 'character_creation' | 'tutorial' | 'main_game';
  currentEnvironment: Environment | null;
  
  // Données de jeu
  availableMissions: Mission[];
  currentMission: Mission | null;
  activeMissions: Mission[];
  inventory: Item[];
  skills: Skill[];
  
  // Actions joueur
  refreshGameState: () => Promise<void>;
  startMission: (missionId: number) => Promise<void>;
  completeMission: (missionId: number) => Promise<void>;
  abandonMission: (missionId: number) => Promise<void>;
  buyItem: (itemId: number) => Promise<void>;
  useItem: (itemId: number, targetId?: number) => Promise<void>;
  talkToNpc: (npcId: number) => Promise<void>;
  upgradeSkill: (skillId: number) => Promise<void>;
  completeObjective: (missionId: number, objectiveId: number) => Promise<void>;
  levelUpAttribute: (attribute: 'intelligence' | 'perception' | 'charisma' | 'technicalKnowledge') => Promise<void>;
}

// Création du contexte avec une valeur initiale
const CyberQuestContext = createContext<CyberQuestContextType | null>(null);

// Provider du contexte
export const CyberQuestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  
  // États
  const [player, setPlayer] = useState<CyberQuestPlayer | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [gamePhase, setGamePhase] = useState<'init' | 'character_creation' | 'tutorial' | 'main_game'>('init');
  const [currentEnvironment, setCurrentEnvironment] = useState<Environment | null>(null);
  const [availableMissions, setAvailableMissions] = useState<Mission[]>([]);
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [activeMissions, setActiveMissions] = useState<Mission[]>([]);
  const [inventory, setInventory] = useState<Item[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  
  // Chargement initial des données
  useEffect(() => {
    refreshGameState();
  }, []);
  
  // Récupérer l'état actuel du jeu depuis le serveur
  const refreshGameState = async () => {
    setIsLoading(true);
    
    try {
      // Récupérer les données du joueur
      const playerResponse = await fetch('/api/cyber-quest/player');
      if (playerResponse.ok) {
        const playerData = await playerResponse.json();
        setPlayer(playerData);
        
        // Déterminer la phase de jeu
        if (!playerData) {
          setGamePhase('character_creation');
        } else if (playerData.level === 1 && playerData.missionsCompleted === 0) {
          setGamePhase('tutorial');
        } else {
          setGamePhase('main_game');
        }
      } else {
        setGamePhase('character_creation');
      }
      
      // Récupérer l'environnement actuel
      const environmentResponse = await fetch('/api/cyber-quest/environment/headquarters');
      if (environmentResponse.ok) {
        const environmentData = await environmentResponse.json();
        setCurrentEnvironment(environmentData);
      }
      
      // Récupérer les missions disponibles
      const missionsResponse = await fetch('/api/cyber-quest/missions/available');
      if (missionsResponse.ok) {
        const missionsData = await missionsResponse.json();
        setAvailableMissions(missionsData);
      }
      
      // Récupérer les missions actives
      const activeMissionsResponse = await fetch('/api/cyber-quest/missions/active');
      if (activeMissionsResponse.ok) {
        const activeMissionsData = await activeMissionsResponse.json();
        setActiveMissions(activeMissionsData);
        
        // Si une mission est en cours
        if (activeMissionsData.length > 0) {
          setCurrentMission(activeMissionsData[0]);
        }
      }
      
      // Récupérer l'inventaire
      const inventoryResponse = await fetch('/api/cyber-quest/inventory');
      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json();
        setInventory(inventoryData);
      }
      
      // Récupérer les compétences
      const skillsResponse = await fetch('/api/cyber-quest/skills');
      if (skillsResponse.ok) {
        const skillsData = await skillsResponse.json();
        setSkills(skillsData);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de charger les données du jeu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Démarrer une mission
  const startMission = async (missionId: number) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber-quest/missions/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ missionId }),
      });
      
      if (!response.ok) {
        throw new Error('Impossible de démarrer la mission');
      }
      
      const missionData = await response.json();
      setCurrentMission(missionData);
      
      toast({
        title: "Mission acceptée",
        description: `Vous avez démarré la mission: ${missionData.title}`,
      });
      
      // Rafraîchir l'état du jeu
      await refreshGameState();
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de démarrer la mission",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Terminer une mission
  const completeMission = async (missionId: number) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber-quest/missions/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ missionId }),
      });
      
      if (!response.ok) {
        throw new Error('Impossible de terminer la mission');
      }
      
      const result = await response.json();
      
      toast({
        title: "Mission terminée",
        description: `Vous avez terminé la mission et gagné ${result.experienceGained} XP et ${result.creditsGained} crédits!`,
      });
      
      // Vérifier si le joueur a monté de niveau
      if (result.levelUp) {
        toast({
          title: "Niveau supérieur!",
          description: `Félicitations! Vous avez atteint le niveau ${result.newLevel}!`,
          variant: "default",
        });
      }
      
      // Rafraîchir l'état du jeu
      await refreshGameState();
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de terminer la mission",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Abandonner une mission
  const abandonMission = async (missionId: number) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber-quest/missions/abandon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ missionId }),
      });
      
      if (!response.ok) {
        throw new Error('Impossible d\'abandonner la mission');
      }
      
      toast({
        title: "Mission abandonnée",
        description: "Vous avez abandonné cette mission. Vous pouvez la reprendre plus tard.",
      });
      
      // Rafraîchir l'état du jeu
      await refreshGameState();
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible d'abandonner la mission",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Acheter un objet
  const buyItem = async (itemId: number) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber-quest/inventory/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId }),
      });
      
      if (!response.ok) {
        throw new Error('Impossible d\'acheter cet objet');
      }
      
      const itemData = await response.json();
      
      toast({
        title: "Achat effectué",
        description: `Vous avez acheté: ${itemData.name}`,
      });
      
      // Rafraîchir l'état du jeu
      await refreshGameState();
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible d'acheter cet objet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Utiliser un objet
  const useItem = async (itemId: number, targetId?: number) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber-quest/inventory/use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemId, targetId }),
      });
      
      if (!response.ok) {
        throw new Error('Impossible d\'utiliser cet objet');
      }
      
      const result = await response.json();
      
      toast({
        title: "Objet utilisé",
        description: result.message,
      });
      
      // Rafraîchir l'état du jeu
      await refreshGameState();
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible d'utiliser cet objet",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Parler à un PNJ
  const talkToNpc = async (npcId: number) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber-quest/npc/talk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ npcId }),
      });
      
      if (!response.ok) {
        throw new Error('Impossible de parler à ce personnage');
      }
      
      const dialogueData = await response.json();
      
      // Le retour contient les données du dialogue et est traité par l'interface de dialogue
      
      // Rafraîchir l'état du jeu
      await refreshGameState();
      
      return dialogueData;
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de communiquer avec ce personnage",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Améliorer une compétence
  const upgradeSkill = async (skillId: number) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber-quest/skills/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ skillId }),
      });
      
      if (!response.ok) {
        throw new Error('Impossible d\'améliorer cette compétence');
      }
      
      const skillData = await response.json();
      
      toast({
        title: "Compétence améliorée",
        description: `Vous avez amélioré la compétence ${skillData.name} au niveau ${skillData.level}!`,
      });
      
      // Rafraîchir l'état du jeu
      await refreshGameState();
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible d'améliorer cette compétence",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Compléter un objectif de mission
  const completeObjective = async (missionId: number, objectiveId: number) => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber-quest/missions/objective/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ missionId, objectiveId }),
      });
      
      if (!response.ok) {
        throw new Error('Impossible de compléter cet objectif');
      }
      
      const objectiveData = await response.json();
      
      toast({
        title: "Objectif complété",
        description: objectiveData.description,
      });
      
      // Si tous les objectifs sont complétés, proposer de finir la mission
      if (objectiveData.allObjectivesCompleted) {
        toast({
          title: "Mission prête à être terminée",
          description: "Tous les objectifs de la mission sont complétés! Retournez au QG pour obtenir votre récompense.",
          variant: "default",
        });
      }
      
      // Rafraîchir l'état du jeu
      await refreshGameState();
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible de compléter cet objectif",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Améliorer un attribut du joueur
  const levelUpAttribute = async (attribute: 'intelligence' | 'perception' | 'charisma' | 'technicalKnowledge') => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/cyber-quest/player/attribute/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attribute }),
      });
      
      if (!response.ok) {
        throw new Error('Impossible d\'améliorer cet attribut');
      }
      
      const attributeData = await response.json();
      
      toast({
        title: "Attribut amélioré",
        description: `Votre ${getAttributeName(attribute)} a été amélioré à ${attributeData.value}!`,
      });
      
      // Rafraîchir l'état du jeu
      await refreshGameState();
      
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Impossible d'améliorer cet attribut",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction utilitaire pour obtenir le nom français d'un attribut
  const getAttributeName = (attribute: string): string => {
    switch (attribute) {
      case 'intelligence':
        return 'Intelligence';
      case 'perception':
        return 'Perception';
      case 'charisma':
        return 'Charisme';
      case 'technicalKnowledge':
        return 'Connaissance Technique';
      default:
        return attribute;
    }
  };
  
  // Fournir le contexte aux composants enfants
  return (
    <CyberQuestContext.Provider
      value={{
        player,
        isLoading,
        error,
        gamePhase,
        currentEnvironment,
        availableMissions,
        currentMission,
        activeMissions,
        inventory,
        skills,
        refreshGameState,
        startMission,
        completeMission,
        abandonMission,
        buyItem,
        useItem,
        talkToNpc,
        upgradeSkill,
        completeObjective,
        levelUpAttribute,
      }}
    >
      {children}
    </CyberQuestContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte
export const useCyberQuest = () => {
  const context = useContext(CyberQuestContext);
  
  if (!context) {
    throw new Error('useCyberQuest doit être utilisé à l\'intérieur d\'un CyberQuestProvider');
  }
  
  return context;
};