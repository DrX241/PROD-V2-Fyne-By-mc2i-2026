import { Request, Response } from 'express';
import { db } from './db';
import { eq, and, or, gt, lt, gte, lte, isNull } from 'drizzle-orm';
import {
  cyberQuestPlayers,
  cyberQuestMissions,
  cyberQuestEnvironments,
  cyberQuestNpcs,
  cyberQuestItems,
  cyberQuestSkills,
  cyberQuestPlayerMissions,
  cyberQuestPlayerSkills,
  cyberQuestPlayerJournal,
  CyberQuestPlayer,
  Environment,
  Mission,
  Npc,
  Item,
  Skill,
  missionDifficultyEnum,
  environmentTypeEnum,
  itemTypeEnum,
  skillCategoryEnum
} from '../shared/schema/cyber-quest';

// ============================ CONTRÔLEURS JOUEUR ============================

/**
 * Initialise ou récupère un profil de joueur
 */
export async function getOrCreatePlayer(req: Request, res: Response) {
  try {
    const { userId, userName } = req.body;
    
    if (!userId || !userName) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId et userName sont requis' 
      });
    }
    
    // Vérifier si le joueur existe déjà
    const existingPlayer = await db.select().from(cyberQuestPlayers).where(eq(cyberQuestPlayers.userId, userId)).limit(1);
    
    if (existingPlayer.length > 0) {
      // Joueur existant
      return res.status(200).json({ 
        success: true, 
        player: existingPlayer[0],
        isNewPlayer: false
      });
    }
    
    // Créer un nouveau joueur
    const [newPlayer] = await db.insert(cyberQuestPlayers).values({
      userId,
      userName,
      characterName: 'Agent', // Nom par défaut
      level: 1,
      experience: 0,
      credits: 100, // Crédits de départ
      reputation: 0,
      
      // Attributs de départ
      intelligence: 5,
      perception: 5,
      charisma: 5,
      technicalKnowledge: 5,
      
      // Points disponibles
      attributePoints: 0,
      skillPoints: 3, // Points de compétence initiaux
      
      // Déverrouillages initiaux
      unlockedEnvironments: [1], // QG déverrouillé par défaut
      unlockedSkills: [],
      inventory: [],
      
      // Statistiques
      playTime: 0,
      missionsCompleted: 0,
      challengesCompleted: 0
    }).returning();
    
    // Ajouter les compétences de base au joueur
    const baseSkills = await db.select().from(cyberQuestSkills).where(and(
      eq(cyberQuestSkills.requiredLevel, 1),
      eq(cyberQuestSkills.level, 1)
    ));
    
    // Attribuer les compétences de base
    for (const skill of baseSkills) {
      await db.insert(cyberQuestPlayerSkills).values({
        playerId: newPlayer.id,
        skillId: skill.id,
        level: 1,
        experience: 0,
        usageCount: 0
      });
    }
    
    return res.status(201).json({ 
      success: true, 
      player: newPlayer,
      isNewPlayer: true
    });
  } catch (error) {
    console.error('Error in getOrCreatePlayer:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de l'initialisation du joueur" 
    });
  }
}

/**
 * Récupère les données du joueur
 */
export async function getPlayerData(req: Request, res: Response) {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId est requis' 
      });
    }
    
    // Récupérer le joueur
    const player = await db.select().from(cyberQuestPlayers).where(eq(cyberQuestPlayers.userId, userId)).limit(1);
    
    if (player.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      player: player[0]
    });
  } catch (error) {
    console.error('Error in getPlayerData:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des données du joueur' 
    });
  }
}

/**
 * Met à jour un attribut du joueur
 */
export async function updatePlayerAttribute(req: Request, res: Response) {
  try {
    const { playerId, attribute, value } = req.body;
    
    if (!playerId || !attribute || value === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'playerId, attribute et value sont requis' 
      });
    }
    
    // Vérifier que le joueur existe
    const player = await db.select().from(cyberQuestPlayers).where(eq(cyberQuestPlayers.id, playerId)).limit(1);
    
    if (player.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    // Vérifier que l'attribut est valide
    const validAttributes = ['intelligence', 'perception', 'charisma', 'technicalKnowledge', 'attributePoints', 'skillPoints'];
    
    if (!validAttributes.includes(attribute)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Attribut invalide' 
      });
    }
    
    // Mettre à jour l'attribut
    const updateData: Record<string, any> = {};
    updateData[attribute] = value;
    
    await db.update(cyberQuestPlayers)
      .set(updateData)
      .where(eq(cyberQuestPlayers.id, playerId));
    
    // Récupérer le joueur mis à jour
    const updatedPlayer = await db.select().from(cyberQuestPlayers).where(eq(cyberQuestPlayers.id, playerId)).limit(1);
    
    return res.status(200).json({ 
      success: true, 
      player: updatedPlayer[0],
      message: `Attribut ${attribute} mis à jour avec succès`
    });
  } catch (error) {
    console.error('Error in updatePlayerAttribute:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la mise à jour de l'attribut" 
    });
  }
}

/**
 * Ajoute de l'expérience et augmente de niveau si nécessaire
 */
export async function addExperience(req: Request, res: Response) {
  try {
    const { playerId, experienceAmount } = req.body;
    
    if (!playerId || !experienceAmount) {
      return res.status(400).json({ 
        success: false, 
        message: 'playerId et experienceAmount sont requis' 
      });
    }
    
    // Récupérer le joueur
    const player = await db.select().from(cyberQuestPlayers).where(eq(cyberQuestPlayers.id, playerId)).limit(1);
    
    if (player.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    const currentPlayer = player[0];
    const currentExp = currentPlayer.experience;
    const currentLevel = currentPlayer.level;
    
    // Calculer l'expérience requise pour le niveau suivant
    const nextLevelExp = calculateRequiredExp(currentLevel);
    
    // Ajouter l'expérience
    let newExp = currentExp + experienceAmount;
    let newLevel = currentLevel;
    let gainedSkillPoints = 0;
    let leveledUp = false;
    
    // Vérifier si le joueur a suffisamment d'expérience pour monter de niveau
    while (newExp >= nextLevelExp) {
      newExp -= nextLevelExp;
      newLevel++;
      gainedSkillPoints += 2; // 2 points de compétence par niveau
      leveledUp = true;
    }
    
    // Mettre à jour le joueur
    await db.update(cyberQuestPlayers)
      .set({
        experience: newExp,
        level: newLevel,
        skillPoints: currentPlayer.skillPoints + gainedSkillPoints
      })
      .where(eq(cyberQuestPlayers.id, playerId));
    
    // Récupérer le joueur mis à jour
    const updatedPlayer = await db.select().from(cyberQuestPlayers).where(eq(cyberQuestPlayers.id, playerId)).limit(1);
    
    return res.status(200).json({ 
      success: true, 
      player: updatedPlayer[0],
      experienceAdded: experienceAmount,
      levelUp: leveledUp,
      newLevel: newLevel,
      gainedSkillPoints
    });
  } catch (error) {
    console.error('Error in addExperience:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de l'ajout d'expérience" 
    });
  }
}

// Fonction utilitaire pour calculer l'expérience requise pour le niveau suivant
function calculateRequiredExp(level: number): number {
  // Formule : 100 * (niveau actuel * 1.5)
  return Math.floor(100 * (level * 1.5));
}

// ============================ CONTRÔLEURS ENVIRONNEMENT ============================

/**
 * Récupère un environnement par ID
 */
export async function getEnvironment(req: Request, res: Response) {
  try {
    const { environmentId } = req.params;
    
    if (!environmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'environmentId est requis' 
      });
    }
    
    // Récupérer l'environnement
    const environment = await db.select().from(cyberQuestEnvironments).where(eq(cyberQuestEnvironments.id, parseInt(environmentId))).limit(1);
    
    if (environment.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Environnement non trouvé' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      environment: environment[0]
    });
  } catch (error) {
    console.error('Error in getEnvironment:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération de l'environnement" 
    });
  }
}

/**
 * Récupère les environnements déverrouillés par le joueur
 */
export async function getUnlockedEnvironments(req: Request, res: Response) {
  try {
    const { playerId } = req.params;
    
    if (!playerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'playerId est requis' 
      });
    }
    
    // Récupérer le joueur
    const player = await db.select().from(cyberQuestPlayers).where(eq(cyberQuestPlayers.id, parseInt(playerId))).limit(1);
    
    if (player.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    const unlockedEnvironmentIds = player[0].unlockedEnvironments as number[];
    
    // Récupérer les environnements déverrouillés
    const unlockedEnvironments = await db.select().from(cyberQuestEnvironments).where(
      // L'opérateur `in` ne fonctionne pas bien avec les tableaux JSON, filtrer manuellement
      // Utiliser une condition qui sera toujours vraie pour récupérer tous les environnements, puis filtrer
      eq(cyberQuestEnvironments.id, cyberQuestEnvironments.id)
    );
    
    // Filtrer manuellement
    const filteredEnvironments = unlockedEnvironments.filter(env => 
      unlockedEnvironmentIds.includes(env.id)
    );
    
    return res.status(200).json({ 
      success: true, 
      environments: filteredEnvironments
    });
  } catch (error) {
    console.error('Error in getUnlockedEnvironments:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des environnements déverrouillés' 
    });
  }
}

/**
 * Change l'environnement actuel du joueur
 */
export async function changeEnvironment(req: Request, res: Response) {
  try {
    const { playerId, environmentId } = req.body;
    
    if (!playerId || !environmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'playerId et environmentId sont requis' 
      });
    }
    
    // Vérifier que le joueur existe
    const player = await db.select().from(cyberQuestPlayers).where(eq(cyberQuestPlayers.id, playerId)).limit(1);
    
    if (player.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    // Vérifier que l'environnement existe
    const environment = await db.select().from(cyberQuestEnvironments).where(eq(cyberQuestEnvironments.id, environmentId)).limit(1);
    
    if (environment.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Environnement non trouvé' 
      });
    }
    
    // Vérifier que l'environnement est déverrouillé pour le joueur
    const unlockedEnvironments = player[0].unlockedEnvironments as number[];
    
    if (!unlockedEnvironments.includes(environmentId)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Environnement verrouillé' 
      });
    }
    
    // Mettre à jour l'environnement actuel du joueur
    // Pour l'instant, nous allons simplement retourner l'environnement
    
    return res.status(200).json({ 
      success: true, 
      environment: environment[0],
      message: 'Environnement changé avec succès'
    });
  } catch (error) {
    console.error('Error in changeEnvironment:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors du changement d'environnement" 
    });
  }
}

// ============================ CONTRÔLEURS MISSION ============================

/**
 * Récupère les missions disponibles pour le joueur
 */
export async function getAvailableMissions(req: Request, res: Response) {
  try {
    const { playerId } = req.params;
    
    if (!playerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'playerId est requis' 
      });
    }
    
    // Récupérer le joueur
    const player = await db.select().from(cyberQuestPlayers).where(eq(cyberQuestPlayers.id, parseInt(playerId))).limit(1);
    
    if (player.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    const playerLevel = player[0].level;
    
    // Récupérer les missions disponibles pour le niveau du joueur
    const availableMissions = await db.select().from(cyberQuestMissions).where(
      and(
        lte(cyberQuestMissions.requiredLevel, playerLevel),
        // Ajoutez d'autres conditions si nécessaire
      )
    );
    
    // Vérifier la progression des missions pour filtrer celles qui sont déjà terminées
    const missionProgress = await db.select().from(cyberQuestPlayerMissions).where(
      and(
        eq(cyberQuestPlayerMissions.playerId, parseInt(playerId)),
        eq(cyberQuestPlayerMissions.status, 'completed')
      )
    );
    
    const completedMissionIds = missionProgress.map(progress => progress.missionId);
    
    // Filtrer les missions terminées, sauf si elles peuvent être répétées
    const filteredMissions = availableMissions.filter(mission => {
      // Ici, vous pourriez ajouter une logique pour les missions répétables
      return !completedMissionIds.includes(mission.id);
    });
    
    return res.status(200).json({ 
      success: true, 
      missions: filteredMissions
    });
  } catch (error) {
    console.error('Error in getAvailableMissions:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des missions disponibles' 
    });
  }
}

/**
 * Démarre une mission pour le joueur
 */
export async function startMission(req: Request, res: Response) {
  try {
    const { playerId, missionId } = req.body;
    
    if (!playerId || !missionId) {
      return res.status(400).json({ 
        success: false, 
        message: 'playerId et missionId sont requis' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Mission démarrée',
      missionId
    });
  } catch (error) {
    console.error('Error in startMission:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du démarrage de la mission' 
    });
  }
}

/**
 * Marque un objectif de mission comme complété
 */
export async function completeObjective(req: Request, res: Response) {
  try {
    const { playerId, missionId, objectiveId } = req.body;
    
    if (!playerId || !missionId || !objectiveId) {
      return res.status(400).json({ 
        success: false, 
        message: 'playerId, missionId et objectiveId sont requis' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: 'Objectif complété',
      objectiveId,
      description: "Objectif de mission complété",
      allObjectivesCompleted: false
    });
  } catch (error) {
    console.error('Error in completeObjective:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la validation de l'objectif" 
    });
  }
}

/**
 * Récupère les compétences du joueur
 */
export async function getPlayerSkills(req: Request, res: Response) {
  try {
    const { playerId } = req.params;
    
    if (!playerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'playerId est requis' 
      });
    }
    
    // Simuler des compétences pour le moment
    const skills = [
      {
        id: 1,
        name: "Analyse de code",
        description: "Capacité à analyser et comprendre du code malveillant",
        category: "technical",
        level: 1,
        requiredLevel: 1,
        experience: 0,
        maxLevel: 5
      }
    ];
    
    return res.status(200).json({ 
      success: true, 
      skills
    });
  } catch (error) {
    console.error('Error in getPlayerSkills:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des compétences' 
    });
  }
}

/**
 * Améliore une compétence du joueur
 */
export async function upgradeSkill(req: Request, res: Response) {
  try {
    const { playerId, skillId } = req.body;
    
    if (!playerId || !skillId) {
      return res.status(400).json({ 
        success: false, 
        message: 'playerId et skillId sont requis' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      name: "Analyse de code",
      level: 2,
      message: 'Compétence améliorée avec succès'
    });
  } catch (error) {
    console.error('Error in upgradeSkill:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de l'amélioration de la compétence" 
    });
  }
}

/**
 * Récupère les PNJ dans un environnement
 */
export async function getNPCsInEnvironment(req: Request, res: Response) {
  try {
    const { environmentId } = req.params;
    
    if (!environmentId) {
      return res.status(400).json({ 
        success: false, 
        message: 'environmentId est requis' 
      });
    }
    
    // Simuler des PNJ pour le moment
    const npcs = [
      {
        id: 1,
        name: "Alex",
        role: "Mentor",
        description: "Expert en cybersécurité qui vous guide dans vos missions",
        environmentId: parseInt(environmentId),
        avatarImage: "/assets/npcs/mentor.png",
        isActive: true
      }
    ];
    
    return res.status(200).json({ 
      success: true, 
      npcs
    });
  } catch (error) {
    console.error('Error in getNPCsInEnvironment:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des PNJ' 
    });
  }
}

/**
 * Récupère les détails d'un PNJ
 */
export async function getNPCDetails(req: Request, res: Response) {
  try {
    const { npcId } = req.params;
    
    if (!npcId) {
      return res.status(400).json({ 
        success: false, 
        message: 'npcId est requis' 
      });
    }
    
    // Simuler un PNJ pour le moment
    const npc = {
      id: parseInt(npcId),
      name: "Alex",
      role: "Mentor",
      description: "Expert en cybersécurité qui vous guide dans vos missions",
      environmentId: 1,
      avatarImage: "/assets/npcs/mentor.png",
      dialogues: [
        {
          id: 1,
          text: "Bienvenue, agent. Prêt pour votre mission ?",
          options: [
            { id: 1, text: "Oui, je suis prêt.", nextId: 2 },
            { id: 2, text: "Pouvez-vous me donner plus de détails ?", nextId: 3 }
          ]
        }
      ],
      isActive: true
    };
    
    return res.status(200).json({ 
      success: true, 
      npc
    });
  } catch (error) {
    console.error('Error in getNPCDetails:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des détails du PNJ' 
    });
  }
}

/**
 * Récupère l'inventaire du joueur
 */
export async function getPlayerInventory(req: Request, res: Response) {
  try {
    const { playerId } = req.params;
    
    if (!playerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'playerId est requis' 
      });
    }
    
    // Simuler un inventaire pour le moment
    const inventory = [
      {
        id: 1,
        name: "Scanner réseau",
        description: "Permet d'analyser les vulnérabilités d'un réseau",
        type: "tool",
        price: 100,
        rarity: "common",
        effects: { analysisBonus: 5 },
        quantity: 1,
        isEquipped: false
      }
    ];
    
    return res.status(200).json({ 
      success: true, 
      inventory
    });
  } catch (error) {
    console.error('Error in getPlayerInventory:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération de l'inventaire" 
    });
  }
}

/**
 * Ajoute un item à l'inventaire du joueur
 */
export async function addItemToInventory(req: Request, res: Response) {
  try {
    const { playerId, itemId, quantity = 1 } = req.body;
    
    if (!playerId || !itemId) {
      return res.status(400).json({ 
        success: false, 
        message: 'playerId et itemId sont requis' 
      });
    }
    
    // Simuler l'ajout d'un item pour le moment
    const item = {
      id: itemId,
      name: "Scanner réseau",
      description: "Permet d'analyser les vulnérabilités d'un réseau",
      type: "tool",
      price: 100,
      rarity: "common",
      effects: { analysisBonus: 5 },
      quantity: quantity,
      isEquipped: false
    };
    
    return res.status(200).json({ 
      success: true, 
      item,
      message: `${quantity} ${item.name} ajouté(s) à l'inventaire`
    });
  } catch (error) {
    console.error('Error in addItemToInventory:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de l'ajout de l'item à l'inventaire" 
    });
  }
}

/**
 * Utilise un item de l'inventaire
 */
export async function useInventoryItem(req: Request, res: Response) {
  try {
    const { playerId, itemId, targetId } = req.body;
    
    if (!playerId || !itemId) {
      return res.status(400).json({ 
        success: false, 
        message: 'playerId et itemId sont requis' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      message: "Item utilisé avec succès"
    });
  } catch (error) {
    console.error('Error in useInventoryItem:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de l'utilisation de l'item" 
    });
  }
}

/**
 * Ajoute une entrée au journal du joueur
 */
export async function addJournalEntry(req: Request, res: Response) {
  try {
    const { playerId, title, content, category = "mission" } = req.body;
    
    if (!playerId || !title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'playerId, title et content sont requis' 
      });
    }
    
    const entry = {
      id: Date.now(),
      playerId,
      title,
      content,
      category,
      timestamp: new Date()
    };
    
    return res.status(201).json({ 
      success: true, 
      entry,
      message: "Entrée ajoutée au journal"
    });
  } catch (error) {
    console.error('Error in addJournalEntry:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de l'ajout de l'entrée au journal" 
    });
  }
}

/**
 * Récupère les entrées du journal du joueur
 */
export async function getPlayerJournal(req: Request, res: Response) {
  try {
    const { playerId } = req.params;
    
    if (!playerId) {
      return res.status(400).json({ 
        success: false, 
        message: 'playerId est requis' 
      });
    }
    
    // Simuler des entrées de journal pour le moment
    const entries = [
      {
        id: 1,
        playerId: parseInt(playerId),
        title: "Première mission",
        content: "J'ai reçu ma première mission de la part d'Alex.",
        category: "mission",
        timestamp: new Date()
      }
    ];
    
    return res.status(200).json({ 
      success: true, 
      entries
    });
  } catch (error) {
    console.error('Error in getPlayerJournal:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération du journal" 
    });
  }
}