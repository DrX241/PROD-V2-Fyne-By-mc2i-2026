import { CyberDomain } from '../types';

/**
 * Liste des domaines de cybersécurité disponibles
 */
export const CYBER_DOMAINS: CyberDomain[] = [
  {
    id: 'network-security',
    name: 'Sécurité Réseau',
    description: 'Protection des infrastructures réseau contre les intrusions et les attaques.',
    icon: 'Network',
    iconBgColor: '#3B82F6',
    iconColor: '#ffffff'
  },
  {
    id: 'application-security',
    name: 'Sécurité des Applications',
    description: 'Sécurisation des applications contre les vulnérabilités et les exploits.',
    icon: 'Code',
    iconBgColor: '#10B981',
    iconColor: '#ffffff'
  },
  {
    id: 'data-protection',
    name: 'Protection des Données',
    description: 'Protection des données sensibles contre les fuites et le vol.',
    icon: 'Shield',
    iconBgColor: '#F59E0B',
    iconColor: '#ffffff'
  },
  {
    id: 'identity-access',
    name: 'Identité et Accès',
    description: 'Gestion des identités et des accès aux systèmes d\'information.',
    icon: 'Key',
    iconBgColor: '#8B5CF6',
    iconColor: '#ffffff'
  },
  {
    id: 'threat-intelligence',
    name: 'Renseignement sur les Menaces',
    description: 'Collecte et analyse d\'informations sur les menaces cybernétiques.',
    icon: 'Search',
    iconBgColor: '#EC4899',
    iconColor: '#ffffff'
  }
];

export const getDomainById = (id: string): CyberDomain | undefined => {
  return CYBER_DOMAINS.find(domain => domain.id === id);
};