import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { CyberQuestPlayer, Environment, Mission, NPC, Skill, Item } from '@shared/schema/cyber-quest';

// Types pour le contexte
interface CyberQuestContextType {
  // Données joueur
  player: CyberQuestPlayer | null;
  isLoading: boolean;
  error: Error | null;
  
  // Données de jeu
  currentEnvironment: Environment | null;
  availableMissions: Mission[];
  activeNPCs: NPC[];
  playerInventory: Item[];
  playerSkills: Skill[];
  
  // États de jeu
  gamePhase: 'intro' | 'exploration' | 'mission' | 'dialogue' | 'shop' | 'skills';
  currentMissionId: number | null;
  currentDialogueNPC: NPC | null;
  
  // Actions de jeu
  startMission: (missionId: number) => void;
  completeObjective: (missionId: number, objectiveId: number) => void;
  startDialogue: (npcId: number) => void;
  makeDialogueChoice: (choiceId: string) => void;
  buyItem: (itemId: number) => void;
  useItem: (itemId: number, targetId?: number) => void;
  upgradeSkill: (skillId: number) => void;
  updateCharacterAttribute: (attribute: string, value: number) => void;
  
  // Navigation entre environnements
  changeEnvironment: (environmentId: number) => void;
  unlockEnvironment: (environmentId: number) => void;
  
  // Utilitaires
  refreshGameState: () => void;
  saveGameProgress: () => void;
}

// Valeur par défaut du contexte (pour TypeScript)
const CyberQuestContextDefault: CyberQuestContextType = {
  player: null,
  isLoading: false,
  error: null,
  
  currentEnvironment: null,
  availableMissions: [],
  activeNPCs: [],
  playerInventory: [],
  playerSkills: [],
  
  gamePhase: 'intro',
  currentMissionId: null,
  currentDialogueNPC: null,
  
  startMission: () => {},
  completeObjective: () => {},
  startDialogue: () => {},
  makeDialogueChoice: () => {},
  buyItem: () => {},
  useItem: () => {},
  upgradeSkill: () => {},
  updateCharacterAttribute: () => {},
  
  changeEnvironment: () => {},
  unlockEnvironment: () => {},
  
  refreshGameState: () => {},
  saveGameProgress: () => {},
};

// Création du contexte
export const CyberQuestContext = createContext<CyberQuestContextType>(CyberQuestContextDefault);

// Hook personnalisé pour utiliser le contexte
export const useCyberQuest = () => useContext(CyberQuestContext);

// Provider
export function CyberQuestProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // États locaux pour les données de jeu
  const [gamePhase, setGamePhase] = useState<'intro' | 'exploration' | 'mission' | 'dialogue' | 'shop' | 'skills'>('intro');
  const [currentMissionId, setCurrentMissionId] = useState<number | null>(null);
  const [currentDialogueNPC, setCurrentDialogueNPC] = useState<NPC | null>(null);
  
  // Requête pour les données du joueur
  const {
    data: player,
    isLoading: isPlayerLoading,
    error: playerError,
    refetch: refetchPlayer
  } = useQuery({
    queryKey: ['/api/cyber-quest/player'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/cyber-quest/player');
      if (!res.ok) throw new Error('Failed to fetch player data');
      return await res.json();
    },
    // Ne pas fetcher automatiquement au début, on attend l'initialisation du jeu
    enabled: false,
  });
  
  // Requête pour l'environnement actuel
  const {
    data: currentEnvironment,
    refetch: refetchEnvironment
  } = useQuery({
    queryKey: ['/api/cyber-quest/environment', player?.currentEnvironmentId],
    queryFn: async () => {
      if (!player?.currentEnvironmentId) return null;
      const res = await apiRequest('GET', `/api/cyber-quest/environment/${player.currentEnvironmentId}`);
      if (!res.ok) throw new Error('Failed to fetch environment data');
      return await res.json();
    },
    enabled: !!player?.currentEnvironmentId,
  });
  
  // Requête pour les missions disponibles
  const {
    data: availableMissions = [],
    refetch: refetchMissions
  } = useQuery({
    queryKey: ['/api/cyber-quest/missions', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      const res = await apiRequest('GET', `/api/cyber-quest/missions/available/${player.id}`);
      if (!res.ok) throw new Error('Failed to fetch available missions');
      return await res.json();
    },
    enabled: !!player?.id,
  });
  
  // Requête pour les PNJ actifs
  const {
    data: activeNPCs = [],
    refetch: refetchNPCs
  } = useQuery({
    queryKey: ['/api/cyber-quest/npcs', currentEnvironment?.id],
    queryFn: async () => {
      if (!currentEnvironment?.id) return [];
      const res = await apiRequest('GET', `/api/cyber-quest/npcs/environment/${currentEnvironment.id}`);
      if (!res.ok) throw new Error('Failed to fetch NPCs');
      return await res.json();
    },
    enabled: !!currentEnvironment?.id,
  });
  
  // Requête pour l'inventaire du joueur
  const {
    data: playerInventory = [],
    refetch: refetchInventory
  } = useQuery({
    queryKey: ['/api/cyber-quest/inventory', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      const res = await apiRequest('GET', `/api/cyber-quest/inventory/${player.id}`);
      if (!res.ok) throw new Error('Failed to fetch inventory');
      return await res.json();
    },
    enabled: !!player?.id,
  });
  
  // Requête pour les compétences du joueur
  const {
    data: playerSkills = [],
    refetch: refetchSkills
  } = useQuery({
    queryKey: ['/api/cyber-quest/skills', player?.id],
    queryFn: async () => {
      if (!player?.id) return [];
      const res = await apiRequest('GET', `/api/cyber-quest/skills/player/${player.id}`);
      if (!res.ok) throw new Error('Failed to fetch skills');
      return await res.json();
    },
    enabled: !!player?.id,
  });
  
  // Mutation pour démarrer une mission
  const startMissionMutation = useMutation({
    mutationFn: async (missionId: number) => {
      if (!player?.id) throw new Error('Player not loaded');
      const res = await apiRequest('POST', `/api/cyber-quest/mission/start`, {
        playerId: player.id,
        missionId
      });
      if (!res.ok) throw new Error('Failed to start mission');
      return await res.json();
    },
    onSuccess: (data) => {
      setGamePhase('mission');
      setCurrentMissionId(data.missionId);
      toast({
        title: 'Mission démarrée',
        description: `Vous avez commencé une nouvelle mission: ${data.missionTitle}`,
      });
      // Rafraîchir les données pertinentes
      refetchPlayer();
      refetchMissions();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de démarrer la mission: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Mutation pour acheter un item
  const buyItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      if (!player?.id) throw new Error('Player not loaded');
      const res = await apiRequest('POST', `/api/cyber-quest/item/buy`, {
        playerId: player.id,
        itemId
      });
      if (!res.ok) throw new Error('Failed to buy item');
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Achat réussi',
        description: `Vous avez acheté: ${data.itemName}`,
      });
      // Rafraîchir les données pertinentes
      refetchPlayer();
      refetchInventory();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible d'acheter l'item: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Mutation pour améliorer une compétence
  const upgradeSkillMutation = useMutation({
    mutationFn: async (skillId: number) => {
      if (!player?.id) throw new Error('Player not loaded');
      const res = await apiRequest('POST', `/api/cyber-quest/skill/upgrade`, {
        playerId: player.id,
        skillId
      });
      if (!res.ok) throw new Error('Failed to upgrade skill');
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Compétence améliorée',
        description: `Vous avez amélioré: ${data.skillName} au niveau ${data.newLevel}`,
      });
      // Rafraîchir les données pertinentes
      refetchPlayer();
      refetchSkills();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible d'améliorer la compétence: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Mutation pour changer d'environnement
  const changeEnvironmentMutation = useMutation({
    mutationFn: async (environmentId: number) => {
      if (!player?.id) throw new Error('Player not loaded');
      const res = await apiRequest('POST', `/api/cyber-quest/environment/change`, {
        playerId: player.id,
        environmentId
      });
      if (!res.ok) throw new Error('Failed to change environment');
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: 'Environnement changé',
        description: `Vous êtes maintenant dans: ${data.environmentName}`,
      });
      // Rafraîchir les données pertinentes
      refetchPlayer();
      refetchEnvironment();
      refetchNPCs();
      refetchMissions();
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de changer d'environnement: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Fonction pour rafraîchir toutes les données du jeu
  const refreshGameState = () => {
    refetchPlayer();
    refetchEnvironment();
    refetchMissions();
    refetchNPCs();
    refetchInventory();
    refetchSkills();
  };
  
  // Fonction pour sauvegarder la progression
  const saveGameProgressMutation = useMutation({
    mutationFn: async () => {
      if (!player?.id) throw new Error('Player not loaded');
      const res = await apiRequest('POST', `/api/cyber-quest/save`, {
        playerId: player.id
      });
      if (!res.ok) throw new Error('Failed to save game progress');
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: 'Progression sauvegardée',
        description: 'Votre progression a été enregistrée avec succès.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de sauvegarder: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  // Fournir toutes les valeurs et fonctions au contexte
  const contextValue: CyberQuestContextType = {
    player,
    isLoading: isPlayerLoading,
    error: playerError as Error,
    
    currentEnvironment,
    availableMissions,
    activeNPCs,
    playerInventory,
    playerSkills,
    
    gamePhase,
    currentMissionId,
    currentDialogueNPC,
    
    startMission: (missionId: number) => startMissionMutation.mutate(missionId),
    completeObjective: (missionId: number, objectiveId: number) => {
      // À implémenter
    },
    startDialogue: (npcId: number) => {
      // Trouver le NPC dans les NPCs actifs
      const npc = activeNPCs.find(n => n.id === npcId);
      if (npc) {
        setCurrentDialogueNPC(npc);
        setGamePhase('dialogue');
      }
    },
    makeDialogueChoice: (choiceId: string) => {
      // À implémenter
    },
    buyItem: (itemId: number) => buyItemMutation.mutate(itemId),
    useItem: (itemId: number, targetId?: number) => {
      // À implémenter
    },
    upgradeSkill: (skillId: number) => upgradeSkillMutation.mutate(skillId),
    updateCharacterAttribute: (attribute: string, value: number) => {
      // À implémenter
    },
    
    changeEnvironment: (environmentId: number) => changeEnvironmentMutation.mutate(environmentId),
    unlockEnvironment: (environmentId: number) => {
      // À implémenter
    },
    
    refreshGameState,
    saveGameProgress: () => saveGameProgressMutation.mutate(),
  };
  
  return (
    <CyberQuestContext.Provider value={contextValue}>
      {children}
    </CyberQuestContext.Provider>
  );
}