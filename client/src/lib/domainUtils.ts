// Utilitaires pour la gestion des domaines des assistants

/**
 * Fonction pour obtenir le libellé d'un domaine à partir de son code
 */
export const getDomainLabel = (domain: string): string => {
  const domainMap: Record<string, string> = {
    cybersecurite: 'Cybersécurité',
    gestion_projet: 'Gestion de projet',
    amoa: 'AMOA',
    developpement: 'Développement',
    data_ia: 'Data & IA',
    conseil: 'Conseil',
    general: 'Général',
  };
  
  return domainMap[domain] || 'Général';
};

/**
 * Liste des domaines disponibles pour les assistants
 */
export const availableDomains = [
  { code: 'cybersecurite', label: 'Cybersécurité' },
  { code: 'gestion_projet', label: 'Gestion de projet' },
  { code: 'amoa', label: 'AMOA' },
  { code: 'developpement', label: 'Développement' },
  { code: 'data_ia', label: 'Data & IA' },
  { code: 'conseil', label: 'Conseil' },
  { code: 'general', label: 'Général' }
];

/**
 * Fonction pour obtenir la couleur associée à un domaine
 */
export const getDomainColor = (domain: string): { light: string, dark: string } => {
  const colorMap: Record<string, { light: string, dark: string }> = {
    cybersecurite: { light: 'text-red-600 bg-red-50', dark: 'text-red-300 bg-red-900/30' },
    gestion_projet: { light: 'text-blue-600 bg-blue-50', dark: 'text-blue-300 bg-blue-900/30' },
    amoa: { light: 'text-purple-600 bg-purple-50', dark: 'text-purple-300 bg-purple-900/30' },
    developpement: { light: 'text-green-600 bg-green-50', dark: 'text-green-300 bg-green-900/30' },
    data_ia: { light: 'text-amber-600 bg-amber-50', dark: 'text-amber-300 bg-amber-900/30' },
    conseil: { light: 'text-indigo-600 bg-indigo-50', dark: 'text-indigo-300 bg-indigo-900/30' },
    general: { light: 'text-gray-600 bg-gray-50', dark: 'text-gray-300 bg-gray-800/50' }
  };
  
  return colorMap[domain] || colorMap.general;
};