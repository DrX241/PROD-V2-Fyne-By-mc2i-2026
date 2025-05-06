import { Request, Response } from 'express';
import { db } from './db';
import { eq, and, or, gt, lt, gte, lte, isNull } from 'drizzle-orm';
import {
  cyberQuestPlayer,
  environments,
  missions,
  npcs,
  items,
  skills,
  playerMissionProgress,
  playerSkills,
  playerJournal,
  CyberQuestPlayer,
  Environment,
  Mission,
  NPC,
  Item,
  Skill,
  difficultyEnum,
  statusEnum
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
    const existingPlayer = await db.select().from(cyberQuestPlayer).where(eq(cyberQuestPlayer.userId, userId)).limit(1);
    
    if (existingPlayer.length > 0) {
      // Joueur existant
      return res.status(200).json({ 
        success: true, 
        player: existingPlayer[0],
        isNewPlayer: false
      });
    }
    
    // Créer un nouveau joueur
    const [newPlayer] = await db.insert(cyberQuestPlayer).values({
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
    const baseSkills = await db.select().from(skills).where(and(
      eq(skills.requiredLevel, 1),
      eq(skills.level, 1)
    ));
    
    // Attribuer les compétences de base
    for (const skill of baseSkills) {
      await db.insert(playerSkills).values({
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
    const player = await db.select().from(cyberQuestPlayer).where(eq(cyberQuestPlayer.userId, userId)).limit(1);
    
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
    const player = await db.select().from(cyberQuestPlayer).where(eq(cyberQuestPlayer.id, playerId)).limit(1);
    
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
    
    await db.update(cyberQuestPlayer)
      .set(updateData)
      .where(eq(cyberQuestPlayer.id, playerId));
    
    // Récupérer le joueur mis à jour
    const updatedPlayer = await db.select().from(cyberQuestPlayer).where(eq(cyberQuestPlayer.id, playerId)).limit(1);
    
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
    const player = await db.select().from(cyberQuestPlayer).where(eq(cyberQuestPlayer.id, playerId)).limit(1);
    
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
    await db.update(cyberQuestPlayer)
      .set({
        experience: newExp,
        level: newLevel,
        skillPoints: currentPlayer.skillPoints + gainedSkillPoints
      })
      .where(eq(cyberQuestPlayer.id, playerId));
    
    // Récupérer le joueur mis à jour
    const updatedPlayer = await db.select().from(cyberQuestPlayer).where(eq(cyberQuestPlayer.id, playerId)).limit(1);
    
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
    const environment = await db.select().from(environments).where(eq(environments.id, parseInt(environmentId))).limit(1);
    
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
    const player = await db.select().from(cyberQuestPlayer).where(eq(cyberQuestPlayer.id, parseInt(playerId))).limit(1);
    
    if (player.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    const unlockedEnvironmentIds = player[0].unlockedEnvironments as number[];
    
    // Récupérer les environnements déverrouillés
    const unlockedEnvironments = await db.select().from(environments).where(
      // L'opérateur `in` ne fonctionne pas bien avec les tableaux JSON, filtrer manuellement
      // Utiliser une condition qui sera toujours vraie pour récupérer tous les environnements, puis filtrer
      eq(environments.id, environments.id)
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
    const player = await db.select().from(cyberQuestPlayer).where(eq(cyberQuestPlayer.id, playerId)).limit(1);
    
    if (player.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    // Vérifier que l'environnement existe
    const environment = await db.select().from(environments).where(eq(environments.id, environmentId)).limit(1);
    
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
    // Cette mise à jour serait faite si nous avions une colonne pour stocker l'environnement actuel
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
    const player = await db.select().from(cyberQuestPlayer).where(eq(cyberQuestPlayer.id, parseInt(playerId))).limit(1);
    
    if (player.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    const playerLevel = player[0].level;
    
    // Récupérer les missions disponibles pour le niveau du joueur
    const availableMissions = await db.select().from(missions).where(
      and(
        lte(missions.requiredLevel, playerLevel),
        // Ajoutez d'autres conditions si nécessaire
      )
    );
    
    // Vérifier la progression des missions pour filtrer celles qui sont déjà terminées
    const missionProgress = await db.select().from(playerMissionProgress).where(
      and(
        eq(playerMissionProgress.playerId, parseInt(playerId)),
        eq(playerMissionProgress.status, 'completed')
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
    
    // Vérifier que le joueur existe
    const player = await db.select().from(cyberQuestPlayer).where(eq(cyberQuestPlayer.id, playerId)).limit(1);
    
    if (player.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    // Vérifier que la mission existe
    const mission = await db.select().from(missions).where(eq(missions.id, missionId)).limit(1);
    
    if (mission.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mission non trouvée' 
      });
    }
    
    // Vérifier si la mission est déjà en cours
    const existingProgress = await db.select().from(playerMissionProgress).where(
      and(
        eq(playerMissionProgress.playerId, playerId),
        eq(playerMissionProgress.missionId, missionId)
      )
    ).limit(1);
    
    if (existingProgress.length > 0 && existingProgress[0].status === 'in_progress') {
      // La mission est déjà en cours, renvoyer la progression existante
      return res.status(200).json({ 
        success: true, 
        missionProgress: existingProgress[0],
        mission: mission[0],
        message: 'Mission déjà en cours'
      });
    }
    
    // Créer une nouvelle entrée de progression ou mettre à jour une existante
    if (existingProgress.length > 0) {
      // Mettre à jour la progression existante
      await db.update(playerMissionProgress)
        .set({
          status: 'in_progress',
          startedAt: new Date(),
          completedAt: null,
          completedObjectives: [],
          currentObjectiveIndex: 0,
          attempts: existingProgress[0].attempts + 1
        })
        .where(
          and(
            eq(playerMissionProgress.playerId, playerId),
            eq(playerMissionProgress.missionId, missionId)
          )
        );
    } else {
      // Créer une nouvelle entrée de progression
      await db.insert(playerMissionProgress).values({
        playerId,
        missionId,
        status: 'in_progress',
        startedAt: new Date(),
        attempts: 1,
        completedObjectives: [],
        currentObjectiveIndex: 0
      });
    }
    
    // Récupérer la progression mise à jour
    const updatedProgress = await db.select().from(playerMissionProgress).where(
      and(
        eq(playerMissionProgress.playerId, playerId),
        eq(playerMissionProgress.missionId, missionId)
      )
    ).limit(1);
    
    return res.status(200).json({ 
      success: true, 
      missionProgress: updatedProgress[0],
      mission: mission[0],
      missionTitle: mission[0].title,
      message: 'Mission démarrée avec succès'
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
    
    if (!playerId || !missionId || objectiveId === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: 'playerId, missionId et objectiveId sont requis' 
      });
    }
    
    // Vérifier que la progression de mission existe
    const missionProgress = await db.select().from(playerMissionProgress).where(
      and(
        eq(playerMissionProgress.playerId, playerId),
        eq(playerMissionProgress.missionId, missionId)
      )
    ).limit(1);
    
    if (missionProgress.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Progression de mission non trouvée' 
      });
    }
    
    const currentProgress = missionProgress[0];
    
    // Vérifier que la mission est en cours
    if (currentProgress.status !== 'in_progress') {
      return res.status(400).json({ 
        success: false, 
        message: 'La mission n\'est pas en cours' 
      });
    }
    
    // Récupérer la mission pour vérifier les objectifs
    const mission = await db.select().from(missions).where(eq(missions.id, missionId)).limit(1);
    
    if (mission.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Mission non trouvée' 
      });
    }
    
    const missionData = mission[0];
    const objectives = missionData.objectives as any[];
    
    // Vérifier que l'objectif existe
    if (objectiveId >= objectives.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Objectif invalide' 
      });
    }
    
    // Récupérer les objectifs complétés
    const completedObjectives = currentProgress.completedObjectives as number[] || [];
    
    // Vérifier si l'objectif est déjà complété
    if (completedObjectives.includes(objectiveId)) {
      return res.status(200).json({ 
        success: true, 
        message: 'Objectif déjà complété',
        isAlreadyCompleted: true,
        missionProgress: currentProgress
      });
    }
    
    // Ajouter l'objectif à la liste des objectifs complétés
    const updatedObjectives = [...completedObjectives, objectiveId];
    
    // Vérifier si tous les objectifs sont complétés
    const allObjectivesCompleted = updatedObjectives.length === objectives.length;
    
    // Mettre à jour la progression
    await db.update(playerMissionProgress)
      .set({
        completedObjectives: updatedObjectives,
        currentObjectiveIndex: objectiveId + 1,
        status: allObjectivesCompleted ? 'completed' : 'in_progress',
        completedAt: allObjectivesCompleted ? new Date() : null
      })
      .where(
        and(
          eq(playerMissionProgress.playerId, playerId),
          eq(playerMissionProgress.missionId, missionId)
        )
      );
    
    // Si tous les objectifs sont complétés, attribuer les récompenses
    if (allObjectivesCompleted) {
      // Récupérer le joueur
      const player = await db.select().from(cyberQuestPlayer).where(eq(cyberQuestPlayer.id, playerId)).limit(1);
      
      if (player.length > 0) {
        const currentPlayer = player[0];
        
        // Mettre à jour le joueur
        await db.update(cyberQuestPlayer)
          .set({
            experience: currentPlayer.experience + missionData.experienceReward,
            credits: currentPlayer.credits + missionData.creditReward,
            reputation: currentPlayer.reputation + missionData.reputationReward,
            missionsCompleted: currentPlayer.missionsCompleted + 1
          })
          .where(eq(cyberQuestPlayer.id, playerId));
      }
    }
    
    // Récupérer la progression mise à jour
    const updatedProgress = await db.select().from(playerMissionProgress).where(
      and(
        eq(playerMissionProgress.playerId, playerId),
        eq(playerMissionProgress.missionId, missionId)
      )
    ).limit(1);
    
    return res.status(200).json({ 
      success: true, 
      missionProgress: updatedProgress[0],
      allObjectivesCompleted,
      message: allObjectivesCompleted ? 'Mission terminée' : 'Objectif complété'
    });
  } catch (error) {
    console.error('Error in completeObjective:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la complétion de l'objectif" 
    });
  }
}

// ============================ CONTRÔLEURS COMPÉTENCES ============================

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
    
    // Récupérer les compétences du joueur avec les détails de chaque compétence
    const playerSkillsData = await db.select({
      id: playerSkills.id,
      playerId: playerSkills.playerId,
      skillId: playerSkills.skillId,
      level: playerSkills.level,
      experience: playerSkills.experience,
      unlockedAt: playerSkills.unlockedAt,
      lastUsed: playerSkills.lastUsed,
      usageCount: playerSkills.usageCount,
      // Joindre les détails de la compétence
      skillName: skills.name,
      skillDescription: skills.description,
      skillBranch: skills.branch,
      skillEffects: skills.effects
    }).from(playerSkills)
      .innerJoin(skills, eq(playerSkills.skillId, skills.id))
      .where(eq(playerSkills.playerId, parseInt(playerId)));
    
    if (playerSkillsData.length === 0) {
      return res.status(200).json({ 
        success: true, 
        skills: []
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      skills: playerSkillsData
    });
  } catch (error) {
    console.error('Error in getPlayerSkills:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des compétences du joueur' 
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
    
    // Vérifier que le joueur existe
    const player = await db.select().from(cyberQuestPlayer).where(eq(cyberQuestPlayer.id, playerId)).limit(1);
    
    if (player.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    // Vérifier que la compétence existe
    const skill = await db.select().from(skills).where(eq(skills.id, skillId)).limit(1);
    
    if (skill.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Compétence non trouvée' 
      });
    }
    
    const skillData = skill[0];
    
    // Vérifier si le joueur possède déjà cette compétence
    const playerSkillData = await db.select().from(playerSkills).where(
      and(
        eq(playerSkills.playerId, playerId),
        eq(playerSkills.skillId, skillId)
      )
    ).limit(1);
    
    if (playerSkillData.length === 0) {
      // Le joueur n'a pas encore cette compétence
      // Vérifier que les compétences préalables sont déverrouillées
      const requiredSkills = skillData.requiredSkills as number[];
      
      if (requiredSkills && requiredSkills.length > 0) {
        // Vérifier que le joueur possède toutes les compétences requises
        const playerRequiredSkills = await db.select().from(playerSkills).where(
          and(
            eq(playerSkills.playerId, playerId),
            // Ne fonctionne pas directement avec les tableaux JSON, filtrer après
          )
        );
        
        const playerSkillIds = playerRequiredSkills.map(skill => skill.skillId);
        
        // Vérifier que toutes les compétences requises sont déverrouillées
        const missingSkills = requiredSkills.filter(reqSkill => !playerSkillIds.includes(reqSkill));
        
        if (missingSkills.length > 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'Compétences préalables manquantes',
            missingSkills
          });
        }
      }
      
      // Vérifier que le joueur a suffisamment de points de compétence
      if (player[0].skillPoints < skillData.skillPointCost) {
        return res.status(400).json({ 
          success: false, 
          message: 'Points de compétence insuffisants',
          required: skillData.skillPointCost,
          available: player[0].skillPoints
        });
      }
      
      // Déverrouiller la compétence
      await db.insert(playerSkills).values({
        playerId,
        skillId,
        level: 1,
        experience: 0,
        unlockedAt: new Date(),
        usageCount: 0
      });
      
      // Déduire les points de compétence
      await db.update(cyberQuestPlayer)
        .set({
          skillPoints: player[0].skillPoints - skillData.skillPointCost
        })
        .where(eq(cyberQuestPlayer.id, playerId));
      
      // Récupérer la compétence déverrouillée
      const newPlayerSkill = await db.select().from(playerSkills).where(
        and(
          eq(playerSkills.playerId, playerId),
          eq(playerSkills.skillId, skillId)
        )
      ).limit(1);
      
      return res.status(200).json({ 
        success: true, 
        skill: newPlayerSkill[0],
        skillName: skillData.name,
        newLevel: 1,
        previousLevel: 0,
        message: 'Compétence déverrouillée'
      });
    } else {
      // Le joueur possède déjà cette compétence, vérifier si elle peut être améliorée
      const currentPlayerSkill = playerSkillData[0];
      
      // Vérifier si la compétence est déjà au niveau maximum
      if (currentPlayerSkill.level >= 5) {
        return res.status(400).json({ 
          success: false, 
          message: 'Compétence déjà au niveau maximum'
        });
      }
      
      // Vérifier que le joueur a suffisamment de points de compétence
      if (player[0].skillPoints < skillData.skillPointCost) {
        return res.status(400).json({ 
          success: false, 
          message: 'Points de compétence insuffisants',
          required: skillData.skillPointCost,
          available: player[0].skillPoints
        });
      }
      
      // Améliorer la compétence
      await db.update(playerSkills)
        .set({
          level: currentPlayerSkill.level + 1
        })
        .where(
          and(
            eq(playerSkills.playerId, playerId),
            eq(playerSkills.skillId, skillId)
          )
        );
      
      // Déduire les points de compétence
      await db.update(cyberQuestPlayer)
        .set({
          skillPoints: player[0].skillPoints - skillData.skillPointCost
        })
        .where(eq(cyberQuestPlayer.id, playerId));
      
      // Récupérer la compétence améliorée
      const updatedPlayerSkill = await db.select().from(playerSkills).where(
        and(
          eq(playerSkills.playerId, playerId),
          eq(playerSkills.skillId, skillId)
        )
      ).limit(1);
      
      return res.status(200).json({ 
        success: true, 
        skill: updatedPlayerSkill[0],
        skillName: skillData.name,
        newLevel: updatedPlayerSkill[0].level,
        previousLevel: currentPlayerSkill.level,
        message: 'Compétence améliorée'
      });
    }
  } catch (error) {
    console.error('Error in upgradeSkill:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de l'amélioration de la compétence" 
    });
  }
}

// ============================ CONTRÔLEURS PNJ ============================

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
    
    // Récupérer l'environnement
    const environment = await db.select().from(environments).where(eq(environments.id, parseInt(environmentId))).limit(1);
    
    if (environment.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Environnement non trouvé' 
      });
    }
    
    // Récupérer les PNJ dans cet environnement
    // Si les PNJ sont stockés dans une propriété de l'environnement
    const npcsInEnvironment = environment[0].npcs as number[];
    
    // Récupérer les détails des PNJ
    const npcDetails = await db.select().from(npcs).where(
      // Ne fonctionne pas directement avec les tableaux JSON, filtrer après
      eq(npcs.id, npcs.id) // Condition toujours vraie pour récupérer tous les PNJ
    );
    
    // Filtrer manuellement les PNJ qui sont dans cet environnement
    const filteredNPCs = npcDetails.filter(npc => 
      npcsInEnvironment.includes(npc.id)
    );
    
    return res.status(200).json({ 
      success: true, 
      npcs: filteredNPCs
    });
  } catch (error) {
    console.error('Error in getNPCsInEnvironment:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération des PNJ dans l'environnement" 
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
    
    // Récupérer le PNJ
    const npc = await db.select().from(npcs).where(eq(npcs.id, parseInt(npcId))).limit(1);
    
    if (npc.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'PNJ non trouvé' 
      });
    }
    
    return res.status(200).json({ 
      success: true, 
      npc: npc[0]
    });
  } catch (error) {
    console.error('Error in getNPCDetails:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des détails du PNJ' 
    });
  }
}

// ============================ CONTRÔLEURS INVENTAIRE ============================

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
    
    // Récupérer le joueur
    const player = await db.select().from(cyberQuestPlayer).where(eq(cyberQuestPlayer.id, parseInt(playerId))).limit(1);
    
    if (player.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    // Récupérer les items dans l'inventaire
    const inventoryItemIds = player[0].inventory as {itemId: number, quantity: number}[];
    
    if (!inventoryItemIds || inventoryItemIds.length === 0) {
      return res.status(200).json({ 
        success: true, 
        inventory: []
      });
    }
    
    // Récupérer les détails des items
    const itemIds = inventoryItemIds.map(item => item.itemId);
    const allItems = await db.select().from(items);
    
    // Filtrer les items qui sont dans l'inventaire et ajouter la quantité
    const inventoryWithDetails = inventoryItemIds.map(inventoryItem => {
      const itemDetail = allItems.find(item => item.id === inventoryItem.itemId);
      return {
        ...itemDetail,
        quantity: inventoryItem.quantity
      };
    }).filter(item => item !== undefined);
    
    return res.status(200).json({ 
      success: true, 
      inventory: inventoryWithDetails
    });
  } catch (error) {
    console.error('Error in getPlayerInventory:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de la récupération de l'inventaire du joueur" 
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
    
    // Vérifier que le joueur existe
    const player = await db.select().from(cyberQuestPlayer).where(eq(cyberQuestPlayer.id, playerId)).limit(1);
    
    if (player.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    // Vérifier que l'item existe
    const item = await db.select().from(items).where(eq(items.id, itemId)).limit(1);
    
    if (item.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item non trouvé' 
      });
    }
    
    // Récupérer l'inventaire actuel
    const inventory = player[0].inventory as {itemId: number, quantity: number}[] || [];
    
    // Vérifier si l'item est déjà dans l'inventaire
    const existingItemIndex = inventory.findIndex(item => item.itemId === itemId);
    
    let updatedInventory;
    
    if (existingItemIndex !== -1) {
      // L'item est déjà dans l'inventaire, augmenter la quantité
      updatedInventory = [...inventory];
      updatedInventory[existingItemIndex].quantity += quantity;
    } else {
      // Ajouter le nouvel item à l'inventaire
      updatedInventory = [...inventory, { itemId, quantity }];
    }
    
    // Mettre à jour l'inventaire
    await db.update(cyberQuestPlayer)
      .set({
        inventory: updatedInventory
      })
      .where(eq(cyberQuestPlayer.id, playerId));
    
    return res.status(200).json({ 
      success: true, 
      inventory: updatedInventory,
      itemName: item[0].name,
      message: `${quantity} ${item[0].name}${quantity > 1 ? 's' : ''} ajouté${quantity > 1 ? 's' : ''} à l'inventaire`
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
    
    // Vérifier que le joueur existe
    const player = await db.select().from(cyberQuestPlayer).where(eq(cyberQuestPlayer.id, playerId)).limit(1);
    
    if (player.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    // Vérifier que l'item existe
    const item = await db.select().from(items).where(eq(items.id, itemId)).limit(1);
    
    if (item.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item non trouvé' 
      });
    }
    
    // Récupérer l'inventaire actuel
    const inventory = player[0].inventory as {itemId: number, quantity: number}[] || [];
    
    // Vérifier si l'item est dans l'inventaire
    const existingItemIndex = inventory.findIndex(item => item.itemId === itemId);
    
    if (existingItemIndex === -1 || inventory[existingItemIndex].quantity <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Item non disponible dans l\'inventaire' 
      });
    }
    
    // Simuler les effets de l'utilisation de l'item
    // Cette logique dépend du type d'item et de ses effets
    // Pour l'instant, nous allons simplement réduire la quantité
    
    const updatedInventory = [...inventory];
    updatedInventory[existingItemIndex].quantity -= 1;
    
    // Si la quantité est à 0, supprimer l'item de l'inventaire
    if (updatedInventory[existingItemIndex].quantity === 0) {
      updatedInventory.splice(existingItemIndex, 1);
    }
    
    // Mettre à jour l'inventaire
    await db.update(cyberQuestPlayer)
      .set({
        inventory: updatedInventory
      })
      .where(eq(cyberQuestPlayer.id, playerId));
    
    return res.status(200).json({ 
      success: true, 
      inventory: updatedInventory,
      itemName: item[0].name,
      message: `${item[0].name} utilisé avec succès`
    });
  } catch (error) {
    console.error('Error in useInventoryItem:', error);
    return res.status(500).json({ 
      success: false, 
      message: "Erreur lors de l'utilisation de l'item" 
    });
  }
}

// ============================ CONTRÔLEURS JOURNAL ============================

/**
 * Ajoute une entrée au journal du joueur
 */
export async function addJournalEntry(req: Request, res: Response) {
  try {
    const { 
      playerId, 
      entryType, 
      title, 
      content, 
      associatedMissionId, 
      associatedNpcId, 
      associatedEnvironmentId,
      tags = []
    } = req.body;
    
    if (!playerId || !entryType || !title || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'playerId, entryType, title et content sont requis' 
      });
    }
    
    // Vérifier que le joueur existe
    const player = await db.select().from(cyberQuestPlayer).where(eq(cyberQuestPlayer.id, playerId)).limit(1);
    
    if (player.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Joueur non trouvé' 
      });
    }
    
    // Créer l'entrée de journal
    const [newEntry] = await db.insert(playerJournal).values({
      playerId,
      entryType,
      title,
      content,
      associatedMissionId: associatedMissionId || null,
      associatedNpcId: associatedNpcId || null,
      associatedEnvironmentId: associatedEnvironmentId || null,
      tags
    }).returning();
    
    return res.status(201).json({ 
      success: true, 
      journalEntry: newEntry,
      message: 'Entrée de journal ajoutée'
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
    
    // Récupérer les entrées de journal
    const journalEntries = await db.select().from(playerJournal).where(eq(playerJournal.playerId, parseInt(playerId)));
    
    return res.status(200).json({ 
      success: true, 
      journal: journalEntries
    });
  } catch (error) {
    console.error('Error in getPlayerJournal:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération du journal du joueur' 
    });
  }
}