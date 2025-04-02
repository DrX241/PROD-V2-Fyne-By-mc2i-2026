import { UserRole } from '../types';

/**
 * Liste des rôles disponibles pour les utilisateurs
 */
export const USER_ROLES: UserRole[] = [
  {
    id: 'debutant',
    name: 'Apprenti Cyber',
    description: 'Vous débutez dans le domaine de la cybersécurité. Vous apprendrez les concepts de base et les bonnes pratiques.',
    type: 'débutant'
  },
  {
    id: 'analyste',
    name: 'Analyste Cyber',
    description: 'Vous avez des connaissances de base en cybersécurité. Vous développerez des compétences avancées en analyse des menaces.',
    type: 'analyste'
  },
  {
    id: 'expert',
    name: 'Expert Cyber',
    description: 'Vous êtes un professionnel expérimenté en cybersécurité. Vous vous spécialiserez dans des domaines avancés.',
    type: 'expert'
  }
];

export const getRoleById = (id: string): UserRole | undefined => {
  return USER_ROLES.find(role => role.id === id);
};