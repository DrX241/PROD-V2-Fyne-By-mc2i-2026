/**
 * Utilitaires pour la gestion des domaines
 */

/**
 * Domaines disponibles dans l'application
 */
export type Domain = 
  | 'general'
  | 'cybersecurite' 
  | 'amoa' 
  | 'data_ia' 
  | 'developpement'
  | 'cloud'
  | 'agile';

/**
 * Obtient le libellé d'un domaine
 * @param domain Identifiant du domaine
 * @returns Libellé du domaine
 */
export function getDomainLabel(domain: string): string {
  const labels: Record<string, string> = {
    'general': 'Général',
    'cybersecurite': 'Cybersécurité',
    'amoa': 'AMOA',
    'data_ia': 'Data & IA',
    'developpement': 'Développement',
    'cloud': 'Cloud',
    'agile': 'Agile & Méthodes'
  };
  
  return labels[domain] || domain;
}

/**
 * Obtient la couleur associée à un domaine
 * @param domain Identifiant du domaine
 * @returns Classe CSS pour la couleur
 */
export function getDomainColor(domain: string): string {
  const colors: Record<string, string> = {
    'general': 'bg-blue-100 text-blue-800',
    'cybersecurite': 'bg-red-100 text-red-800',
    'amoa': 'bg-purple-100 text-purple-800',
    'data_ia': 'bg-green-100 text-green-800',
    'developpement': 'bg-orange-100 text-orange-800',
    'cloud': 'bg-indigo-100 text-indigo-800',
    'agile': 'bg-teal-100 text-teal-800'
  };
  
  return colors[domain] || 'bg-gray-100 text-gray-800';
}

/**
 * Liste complète des domaines disponibles
 */
export const allDomains: Domain[] = [
  'general',
  'cybersecurite',
  'amoa',
  'data_ia',
  'developpement',
  'cloud',
  'agile'
];