import { ImmersiveScenario } from '../../../shared/types/immersive-cyber';
import { phishingCampaignAdvanced } from './phishing-campaign-advanced';

/**
 * Liste des scénarios immersifs disponibles
 */
export const immersiveScenarios: ImmersiveScenario[] = [
  phishingCampaignAdvanced
  // Ajouter ici d'autres scénarios au fur et à mesure de leur création
];

/**
 * Récupère un scénario par son ID
 */
export function getScenarioById(id: string): ImmersiveScenario | undefined {
  return immersiveScenarios.find(scenario => scenario.id === id);
}

/**
 * Filtre les scénarios par différents critères
 */
export function getFilteredScenarios(
  filters: {
    difficulty?: string;
    sector?: string;
    role?: string;
    searchTerm?: string;
  }
): ImmersiveScenario[] {
  return immersiveScenarios.filter(scenario => {
    // Filtre par niveau de difficulté
    if (filters.difficulty && scenario.difficulty !== filters.difficulty) {
      return false;
    }
    
    // Filtre par secteur d'activité
    if (filters.sector && scenario.sector !== filters.sector) {
      return false;
    }
    
    // Filtre par rôle disponible
    if (filters.role && !scenario.availableRoles.includes(filters.role as any)) {
      return false;
    }
    
    // Filtre par terme de recherche (dans le titre ou la description)
    if (filters.searchTerm) {
      const searchTermLower = filters.searchTerm.toLowerCase();
      return (
        scenario.title.toLowerCase().includes(searchTermLower) ||
        scenario.description.toLowerCase().includes(searchTermLower)
      );
    }
    
    return true;
  });
}