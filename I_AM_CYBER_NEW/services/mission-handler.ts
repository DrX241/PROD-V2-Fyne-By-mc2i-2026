import { Mission, MissionObjective, UserProfile } from '../types';
import { getMissionById } from '../data';
import { userProfileHandler } from './user-profile-handler';

/**
 * Service de gestion des missions
 */
class MissionHandler {
  private activeMissions: Map<string, Mission> = new Map(); // userProfileId -> activeMission

  /**
   * Démarre une mission pour un utilisateur
   * @param userProfileId ID du profil utilisateur
   * @param missionId ID de la mission
   * @returns Mission démarrée
   */
  startMission(userProfileId: string, missionId: string): Mission {
    // Récupérer le profil utilisateur
    const userProfile = userProfileHandler.getUserProfile(userProfileId);
    if (!userProfile) {
      throw new Error(`User profile with ID ${userProfileId} not found`);
    }

    // Récupérer la mission
    const mission = getMissionById(missionId);
    if (!mission) {
      throw new Error(`Mission with ID ${missionId} not found`);
    }

    // Vérifier si la mission est disponible
    if (mission.status !== 'available') {
      throw new Error(`Mission with ID ${missionId} is not available`);
    }

    // Mettre à jour le statut de la mission
    const updatedMission: Mission = {
      ...mission,
      status: 'in-progress'
    };

    // Enregistrer la mission comme active pour l'utilisateur
    this.activeMissions.set(userProfileId, updatedMission);

    return updatedMission;
  }

  /**
   * Récupère la mission active d'un utilisateur
   * @param userProfileId ID du profil utilisateur
   * @returns Mission active ou undefined si aucune mission n'est active
   */
  getActiveMission(userProfileId: string): Mission | undefined {
    return this.activeMissions.get(userProfileId);
  }

  /**
   * Valide un objectif de mission
   * @param userProfileId ID du profil utilisateur
   * @param objectiveId ID de l'objectif
   * @returns Mission mise à jour
   */
  validateObjective(userProfileId: string, objectiveId: string): Mission {
    // Récupérer la mission active
    const activeMission = this.activeMissions.get(userProfileId);
    if (!activeMission) {
      throw new Error(`No active mission found for user profile with ID ${userProfileId}`);
    }

    // Trouver l'objectif
    const objectiveIndex = activeMission.objectives.findIndex(obj => obj.id === objectiveId);
    if (objectiveIndex === -1) {
      throw new Error(`Objective with ID ${objectiveId} not found in active mission`);
    }

    // Mettre à jour l'objectif
    const updatedObjectives = [...activeMission.objectives];
    updatedObjectives[objectiveIndex] = {
      ...updatedObjectives[objectiveIndex],
      completed: true
    };

    // Mettre à jour la mission
    const updatedMission: Mission = {
      ...activeMission,
      objectives: updatedObjectives
    };

    // Vérifier si tous les objectifs sont complétés
    const allObjectivesCompleted = updatedMission.objectives.every(obj => obj.completed);
    if (allObjectivesCompleted) {
      updatedMission.status = 'completed';
      
      // Récupérer le profil utilisateur
      const userProfile = userProfileHandler.getUserProfile(userProfileId);
      if (userProfile) {
        // Ajouter les récompenses au profil
        userProfileHandler.addExperience(userProfileId, updatedMission.rewards.points);
        
        // Ajouter les badges
        if (updatedMission.rewards.badges) {
          updatedMission.rewards.badges.forEach(badgeId => {
            userProfileHandler.addBadge(userProfileId, badgeId);
          });
        }
        
        // Marquer la mission comme complétée
        userProfileHandler.completeMission(userProfileId, updatedMission.id);
        
        // Débloquer les nouvelles missions
        this.unlockMissions(userProfileId, updatedMission.rewards.unlockedMissions || []);
      }
      
      // Supprimer la mission active
      this.activeMissions.delete(userProfileId);
    } else {
      // Enregistrer la mission mise à jour
      this.activeMissions.set(userProfileId, updatedMission);
    }

    return updatedMission;
  }

  /**
   * Abandonne la mission active
   * @param userProfileId ID du profil utilisateur
   */
  abandonMission(userProfileId: string): void {
    // Vérifier qu'une mission est active
    if (!this.activeMissions.has(userProfileId)) {
      throw new Error(`No active mission found for user profile with ID ${userProfileId}`);
    }

    // Supprimer la mission active
    this.activeMissions.delete(userProfileId);
  }

  /**
   * Débloque des missions pour un utilisateur
   * @param userProfileId ID du profil utilisateur
   * @param missionIds IDs des missions à débloquer
   */
  private unlockMissions(userProfileId: string, missionIds: string[]): void {
    missionIds.forEach(missionId => {
      const mission = getMissionById(missionId);
      if (mission && mission.status === 'locked') {
        // Mettre à jour le statut de la mission
        mission.status = 'available';
      }
    });
  }

  /**
   * Simule la validation d'un objectif par quiz
   * @param userProfileId ID du profil utilisateur
   * @param objectiveId ID de l'objectif
   * @param answers Réponses au quiz
   * @returns Résultat de la validation
   */
  validateQuizObjective(
    userProfileId: string,
    objectiveId: string,
    answers: Record<string, any>
  ): { success: boolean; feedback: string } {
    // Cette fonction est une simulation, dans une implémentation réelle,
    // elle devrait vérifier les réponses contre un modèle de réponses correctes
    
    // Récupérer la mission active
    const activeMission = this.activeMissions.get(userProfileId);
    if (!activeMission) {
      throw new Error(`No active mission found for user profile with ID ${userProfileId}`);
    }

    // Trouver l'objectif
    const objective = activeMission.objectives.find(obj => obj.id === objectiveId);
    if (!objective) {
      throw new Error(`Objective with ID ${objectiveId} not found in active mission`);
    }

    // Simulation de validation (75% de chance de succès)
    const success = Math.random() > 0.25;
    
    if (success) {
      // Valider l'objectif
      this.validateObjective(userProfileId, objectiveId);
      return {
        success: true,
        feedback: "Félicitations ! Vous avez correctement répondu au quiz."
      };
    } else {
      return {
        success: false,
        feedback: "Certaines réponses sont incorrectes. Révisez le sujet et réessayez."
      };
    }
  }

  /**
   * Simule la validation d'un objectif par chat
   * @param userProfileId ID du profil utilisateur
   * @param objectiveId ID de l'objectif
   * @param conversation Contenu de la conversation
   * @returns Résultat de la validation
   */
  validateChatObjective(
    userProfileId: string,
    objectiveId: string,
    conversation: string[]
  ): { success: boolean; feedback: string } {
    // Cette fonction est une simulation, dans une implémentation réelle,
    // elle devrait analyser la conversation avec l'IA pour déterminer
    // si l'utilisateur a démontré la compréhension attendue
    
    // Récupérer la mission active
    const activeMission = this.activeMissions.get(userProfileId);
    if (!activeMission) {
      throw new Error(`No active mission found for user profile with ID ${userProfileId}`);
    }

    // Trouver l'objectif
    const objective = activeMission.objectives.find(obj => obj.id === objectiveId);
    if (!objective) {
      throw new Error(`Objective with ID ${objectiveId} not found in active mission`);
    }

    // Simulation de validation (80% de chance de succès)
    const success = Math.random() > 0.2;
    
    if (success) {
      // Valider l'objectif
      this.validateObjective(userProfileId, objectiveId);
      return {
        success: true,
        feedback: "Vous avez démontré une bonne compréhension du sujet. Objectif validé !"
      };
    } else {
      return {
        success: false,
        feedback: "Vous n'avez pas encore démontré une compréhension suffisante du sujet. Continuez la conversation pour approfondir vos connaissances."
      };
    }
  }
}

export const missionHandler = new MissionHandler();