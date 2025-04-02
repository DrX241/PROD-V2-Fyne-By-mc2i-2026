import { Avatar } from '../types';

/**
 * Liste des avatars disponibles pour les utilisateurs
 */
export const AVATARS: Avatar[] = [
  {
    id: 'avatar1',
    name: 'Cyber Ops',
    imagePath: '/I_AM_CYBER_NEW/assets/avatars/avatar1.png'
  },
  {
    id: 'avatar2',
    name: 'Tech Scholar',
    imagePath: '/I_AM_CYBER_NEW/assets/avatars/avatar2.jpg'
  },
  {
    id: 'avatar3',
    name: 'Security Analyst',
    imagePath: '/I_AM_CYBER_NEW/assets/avatars/avatar3.jpg'
  },
  {
    id: 'avatar4',
    name: 'Security Specialist',
    imagePath: '/I_AM_CYBER_NEW/assets/avatars/avatar4.jpg'
  }
];

export const getAvatarById = (id: string): Avatar | undefined => {
  return AVATARS.find(avatar => avatar.id === id);
};