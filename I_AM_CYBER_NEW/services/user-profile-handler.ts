import { v4 as uuidv4 } from 'uuid';
import { UserProfile, Skill } from '../types';
import { getAvatarById, getRoleById } from '../data';

/**
 * Service de gestion des profils utilisateurs
 */
class UserProfileHandler {
  private profiles: Map<string, UserProfile> = new Map();

  /**
   * Crée un nouveau profil utilisateur
   * @param name Nom de l'utilisateur
   * @param avatarId ID de l'avatar
   * @param roleId ID du rôle
   * @returns Profil utilisateur créé
   */
  createUserProfile(
    name: string,
    avatarId: string,
    roleId: string
  ): UserProfile {
    // Vérifier que l'avatar existe
    const avatar = getAvatarById(avatarId);
    if (!avatar) {
      throw new Error(`Avatar with ID ${avatarId} not found`);
    }

    // Vérifier que le rôle existe
    const role = getRoleById(roleId);
    if (!role) {
      throw new Error(`Role with ID ${roleId} not found`);
    }

    // Créer les compétences initiales
    const initialSkills: Skill[] = [
      {
        id: 'skill-awareness',
        name: 'Sensibilisation',
        description: 'Votre niveau de sensibilisation aux menaces cybernétiques',
        level: 10,
        category: 'awareness'
      },
      {
        id: 'skill-technical',
        name: 'Compétences Techniques',
        description: 'Votre maîtrise des aspects techniques de la cybersécurité',
        level: 5,
        category: 'technical'
      },
      {
        id: 'skill-analysis',
        name: 'Analyse de Risques',
        description: 'Votre capacité à analyser et évaluer les risques de sécurité',
        level: 5,
        category: 'analysis'
      }
    ];

    // Créer le profil
    const profileId = uuidv4();
    const profile: UserProfile = {
      id: profileId,
      name,
      avatarId,
      roleId,
      level: 1,
      experience: 0,
      skills: initialSkills,
      completedMissions: [],
      badges: []
    };

    // Enregistrer le profil
    this.profiles.set(profileId, profile);

    return profile;
  }

  /**
   * Récupère un profil utilisateur
   * @param profileId ID du profil
   * @returns Profil utilisateur
   */
  getUserProfile(profileId: string): UserProfile | undefined {
    return this.profiles.get(profileId);
  }

  /**
   * Met à jour un profil utilisateur
   * @param profileId ID du profil
   * @param updates Mises à jour à appliquer
   * @returns Profil utilisateur mis à jour
   */
  updateUserProfile(
    profileId: string,
    updates: Partial<Omit<UserProfile, 'id'>>
  ): UserProfile {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`User profile with ID ${profileId} not found`);
    }

    // Appliquer les mises à jour
    const updatedProfile = {
      ...profile,
      ...updates
    };

    // Enregistrer le profil mis à jour
    this.profiles.set(profileId, updatedProfile);

    return updatedProfile;
  }

  /**
   * Ajoute de l'expérience à un utilisateur
   * @param profileId ID du profil
   * @param amount Quantité d'expérience à ajouter
   * @returns Profil utilisateur mis à jour
   */
  addExperience(profileId: string, amount: number): UserProfile {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`User profile with ID ${profileId} not found`);
    }

    // Ajouter l'expérience
    const newExperience = profile.experience + amount;
    
    // Calculer le nouveau niveau (1 niveau tous les 1000 XP)
    const newLevel = Math.floor(newExperience / 1000) + 1;
    
    // Mettre à jour le profil
    const updatedProfile = {
      ...profile,
      experience: newExperience,
      level: newLevel
    };

    // Enregistrer le profil mis à jour
    this.profiles.set(profileId, updatedProfile);

    return updatedProfile;
  }

  /**
   * Ajoute un badge à un utilisateur
   * @param profileId ID du profil
   * @param badgeId ID du badge
   * @returns Profil utilisateur mis à jour
   */
  addBadge(profileId: string, badgeId: string): UserProfile {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`User profile with ID ${profileId} not found`);
    }

    // Vérifier si le badge est déjà présent
    if (profile.badges.includes(badgeId)) {
      return profile;
    }

    // Ajouter le badge
    const updatedProfile = {
      ...profile,
      badges: [...profile.badges, badgeId]
    };

    // Enregistrer le profil mis à jour
    this.profiles.set(profileId, updatedProfile);

    return updatedProfile;
  }

  /**
   * Marque une mission comme complétée
   * @param profileId ID du profil
   * @param missionId ID de la mission
   * @returns Profil utilisateur mis à jour
   */
  completeMission(profileId: string, missionId: string): UserProfile {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`User profile with ID ${profileId} not found`);
    }

    // Vérifier si la mission est déjà complétée
    if (profile.completedMissions.includes(missionId)) {
      return profile;
    }

    // Marquer la mission comme complétée
    const updatedProfile = {
      ...profile,
      completedMissions: [...profile.completedMissions, missionId]
    };

    // Enregistrer le profil mis à jour
    this.profiles.set(profileId, updatedProfile);

    return updatedProfile;
  }

  /**
   * Met à jour une compétence
   * @param profileId ID du profil
   * @param skillId ID de la compétence
   * @param increment Incrément de niveau à appliquer
   * @returns Profil utilisateur mis à jour
   */
  updateSkill(profileId: string, skillId: string, increment: number): UserProfile {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`User profile with ID ${profileId} not found`);
    }

    // Trouver la compétence
    const skillIndex = profile.skills.findIndex(skill => skill.id === skillId);
    if (skillIndex === -1) {
      throw new Error(`Skill with ID ${skillId} not found in user profile`);
    }

    // Mettre à jour la compétence
    const updatedSkills = [...profile.skills];
    const currentSkill = updatedSkills[skillIndex];
    
    // Calculer le nouveau niveau (limité entre 0 et 100)
    const newLevel = Math.max(0, Math.min(100, currentSkill.level + increment));
    
    updatedSkills[skillIndex] = {
      ...currentSkill,
      level: newLevel
    };

    // Mettre à jour le profil
    const updatedProfile = {
      ...profile,
      skills: updatedSkills
    };

    // Enregistrer le profil mis à jour
    this.profiles.set(profileId, updatedProfile);

    return updatedProfile;
  }
}

export const userProfileHandler = new UserProfileHandler();