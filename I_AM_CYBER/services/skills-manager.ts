import { 
  UserSkillsProfile, 
  Skill, 
  BadgeAchievement, 
  SkillProgress,
  SkillCategory,
  defaultSkills,
  defaultBadges,
  createInitialUserSkillsProfile
} from '../../shared/types/skills';

class SkillsManagerService {
  private profiles: Map<string, UserSkillsProfile> = new Map();
  
  constructor() {
    // Ce service utilise la mémoire pour stocker les profils de compétences
    // Dans une implémentation complète, cela serait persisté dans une base de données
    console.log('SkillsManagerService initialized');
  }
  
  /**
   * Récupère ou crée un profil de compétences utilisateur
   */
  getUserProfile(userId: string): UserSkillsProfile {
    if (!this.profiles.has(userId)) {
      this.profiles.set(userId, createInitialUserSkillsProfile(userId));
    }
    return this.profiles.get(userId)!;
  }
  
  /**
   * Met à jour une compétence spécifique pour un utilisateur
   */
  updateSkill(userId: string, skillId: string, increment: number): void {
    const profile = this.getUserProfile(userId);
    const skill = profile.skills.find(s => s.id === skillId);
    
    if (skill) {
      // Calculer le nouveau niveau, limité entre 0 et 100
      const newLevel = Math.max(0, Math.min(100, skill.level + increment));
      skill.level = newLevel;
      
      // Enregistrer cette mise à jour dans l'historique
      profile.progressHistory.push({
        skillId,
        progress: newLevel,
        lastUpdated: new Date().toISOString()
      });
      
      // Mettre à jour le profil
      this.profiles.set(userId, profile);
    }
  }
  
  /**
   * Attribue un badge à un utilisateur s'il ne l'a pas déjà
   */
  awardBadge(userId: string, badgeId: string): boolean {
    const profile = this.getUserProfile(userId);
    
    // Vérifier si l'utilisateur a déjà ce badge
    if (profile.badges.some(b => b.id === badgeId)) {
      return false;
    }
    
    // Trouver le badge dans la liste des badges disponibles
    const badgeTemplate = defaultBadges.find(b => b.id === badgeId);
    if (!badgeTemplate) {
      return false;
    }
    
    // Créer le badge avec la date d'acquisition
    const newBadge: BadgeAchievement = {
      ...badgeTemplate,
      acquiredAt: new Date().toISOString()
    };
    
    // Ajouter le badge au profil
    profile.badges.push(newBadge);
    this.profiles.set(userId, profile);
    
    return true;
  }
  
  /**
   * Enregistre la progression d'un scénario pour un utilisateur
   */
  recordScenarioProgress(userId: string, completed: boolean, skillUpdates: {skillId: string, value: number}[]): void {
    const profile = this.getUserProfile(userId);
    
    // Mettre à jour les compteurs de scénarios
    profile.totalScenarios += 1;
    if (completed) {
      profile.completedScenarios += 1;
      
      // Attribuer le badge "Première mission" si c'est le premier scénario complété
      if (profile.completedScenarios === 1) {
        this.awardBadge(userId, "first-mission");
      }
    }
    
    // Appliquer les mises à jour de compétences
    skillUpdates.forEach(update => {
      this.updateSkill(userId, update.skillId, update.value);
      
      // Vérifier si nous devons attribuer des badges basés sur les niveaux de compétence
      const skill = profile.skills.find(s => s.id === update.skillId);
      if (skill && skill.level >= 80) {
        // Attribuer des badges basés sur la catégorie de compétence
        switch(skill.category) {
          case 'technical':
            this.awardBadge(userId, "technical-expert");
            break;
          case 'communication':
            this.awardBadge(userId, "master-communicator");
            break;
          case 'analytical':
            this.awardBadge(userId, "analytical-mind");
            break;
          case 'leadership':
            this.awardBadge(userId, "crisis-leader");
            break;
        }
      }
    });
    
    // Mettre à jour le profil
    this.profiles.set(userId, profile);
  }
  
  /**
   * Récupère les compétences les plus développées d'un utilisateur
   */
  getTopSkills(userId: string, limit: number = 3): Skill[] {
    const profile = this.getUserProfile(userId);
    return [...profile.skills]
      .sort((a, b) => b.level - a.level)
      .slice(0, limit);
  }
  
  /**
   * Calcule le niveau global d'un utilisateur basé sur ses compétences
   */
  calculateOverallLevel(userId: string): number {
    const profile = this.getUserProfile(userId);
    if (profile.skills.length === 0) return 0;
    
    const totalLevel = profile.skills.reduce((sum, skill) => sum + skill.level, 0);
    return Math.round(totalLevel / profile.skills.length);
  }
  
  /**
   * Génère des recommandations personnalisées basées sur le profil de compétences
   */
  generateRecommendations(userId: string): string[] {
    const profile = this.getUserProfile(userId);
    const recommendations: string[] = [];
    
    // Trouver les compétences les moins développées
    const weakestSkills = [...profile.skills]
      .sort((a, b) => a.level - b.level)
      .slice(0, 2);
    
    // Générer des recommandations basées sur les compétences les plus faibles
    weakestSkills.forEach(skill => {
      recommendations.push(`Améliorez votre "${skill.name}" en vous entraînant sur des scénarios spécifiques.`);
    });
    
    // Recommandations générales
    if (profile.completedScenarios < 3) {
      recommendations.push("Complétez plus de scénarios pour obtenir une évaluation précise de vos compétences.");
    } else if (this.calculateOverallLevel(userId) < 50) {
      recommendations.push("Continuez à vous entraîner sur différents domaines pour améliorer votre niveau global.");
    } else {
      recommendations.push("Essayez des scénarios de difficulté 'Expert' pour mettre vos compétences à l'épreuve.");
    }
    
    return recommendations;
  }
  
  /**
   * Analyse les tendances d'apprentissage d'un utilisateur
   */
  getLearningTrends(userId: string): {category: SkillCategory, progress: number}[] {
    const profile = this.getUserProfile(userId);
    const categories: SkillCategory[] = ['technical', 'organizational', 'communication', 'analytical', 'leadership'];
    
    return categories.map(category => {
      const skillsInCategory = profile.skills.filter(s => s.category === category);
      if (skillsInCategory.length === 0) return { category, progress: 0 };
      
      const avgProgress = skillsInCategory.reduce((sum, s) => sum + s.level, 0) / skillsInCategory.length;
      return { category, progress: avgProgress };
    });
  }
}

// Exporter une instance singleton du service
export const skillsManager = new SkillsManagerService();