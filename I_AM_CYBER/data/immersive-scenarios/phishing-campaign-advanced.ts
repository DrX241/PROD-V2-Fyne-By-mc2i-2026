import { CyberScenario } from '@/I_AM_CYBER/types';

export const phishingCampaignAdvanced: CyberScenario = {
  id: 'phishing-campaign-advanced',
  title: 'Gestion d\'une Attaque de Phishing Avancée',
  description: 'ALERTE CYBERSÉCURITÉ CRITIQUE\n\nUne campagne de phishing sophistiquée vient d\'être détectée dans votre organisation. Plusieurs employés ont reçu des emails se faisant passer pour la direction financière.\n\nQue faites-vous ?\n\n1. Bloquer immédiatement tous les emails externes\n2. Analyser d\'abord les logs pour comprendre l\'ampleur de l\'attaque\n3. Envoyer une alerte générale à tous les employés',
  contact: {
    name: 'Thomas Chen',
    role: 'RSSI'
  },
  difficulty: 'Expert',
  difficultyColor: 'red',
  domainId: 'incident-response',
  initialPrompt: 'ALERTE CYBERSÉCURITÉ CRITIQUE : Attaque de phishing en cours. Quelle est votre première action ?'
};