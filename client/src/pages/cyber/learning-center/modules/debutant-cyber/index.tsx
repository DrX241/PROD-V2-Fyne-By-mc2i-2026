import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Shield, AlertTriangle, CheckCircle,
  XCircle, Trophy, RefreshCw, Mail, Phone, ExternalLink,
  MessageSquare, Monitor, Share2, Loader2, ChevronRight, Flag,
  Star, Target, Zap, Reply, Forward, Archive, Trash2,
  MoreHorizontal, ThumbsUp, MessageCircle, Info, X, Search,
  ChevronDown, Lock, Paperclip, Send, Mic, Camera, CornerDownRight,
  Globe, AlertOctagon, Code, Eye, EyeOff, Volume2, VolumeX,
  PhoneOff, PhoneIncoming, Heart, Bookmark, MoreVertical
} from 'lucide-react';
import mcLogoPath from "@assets/mc2i.png";

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

type Level = 'debutant' | 'intermediaire' | 'maitrise';

interface AssessmentOption {
  label: string;
  sublabel?: string;
  score: number;
  icon?: string;
}

interface AssessmentVisual {
  type: 'email' | 'sms';
  from?: string;
  fromEmail?: string;
  subject?: string;
  body: string;
  linkUrl?: string;
  hasLink?: boolean;
  hasPJ?: boolean;
  pjLabel?: string;
}

interface AssessmentQuestion {
  id: string;
  question: string;
  context?: string;
  type?: 'standard' | 'interactive';
  visual?: AssessmentVisual;
  options: AssessmentOption[];
}

function shuffleAndPick<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}

interface ScenarioVisual {
  type: 'email' | 'sms' | 'phone-call' | 'browser-popup' | 'social-post';
  from?: string;
  fromEmail?: string;
  subject?: string;
  body: string;
  hasClickableLink?: boolean;
  linkLabel?: string;
  linkUrl?: string;
}

interface ScenarioChoice {
  label: string;
  isCorrect: boolean;
  feedback: string;
  points: number;
}

interface Scenario {
  category: string;
  title: string;
  context: string;
  visual: ScenarioVisual;
  choices: ScenarioChoice[];
  reflexe: string;
  clickConsequence?: string;
  redFlags?: string[];
}

type Phase = 'intro' | 'assessment' | 'level-reveal' | 'loading' | 'error' | 'scenario' | 'trap-clicked' | 'answered' | 'reflexe' | 'final';

// ─── QUESTIONS D'ÉVALUATION ────────────────────────────────────────────────────
const ASSESSMENT_BANK: AssessmentQuestion[] = [
  {
    id: 'q-bnp',
    question: 'Il est 8h47. Vous ouvrez vos emails et voyez ça : "URGENT — Votre compte BNP Paribas a été compromis. Connexion depuis Budapest détectée. Cliquez pour sécuriser votre compte dans les 2h."',
    context: '📧 L\'email affiche le logo BNP, une mise en page soignée, et semble légitime',
    options: [
      { label: 'Je clique immédiatement sur le bouton sécuriser', sublabel: 'C\'est urgent et ça semble officiel', score: 0 },
      { label: 'Je survole le lien pour voir l\'URL réelle avant de cliquer', sublabel: 'Vérification rapide de l\'adresse destination', score: 1 },
      { label: 'Je ferme l\'email et vais sur bnpparibas.fr directement', sublabel: 'Jamais via un lien reçu par email', score: 2 },
    ],
  },
  {
    id: 'q-colissimo',
    question: 'SMS reçu : "Votre colis Colissimo REF-748291 est bloqué en douane. Frais de dédouanement : 2,49€. Réglez ici : colissimo-delivery.fr/pay"',
    context: '📱 Vous attendez effectivement un colis cette semaine',
    options: [
      { label: 'Je paie les 2,49€, c\'est une somme dérisoire', sublabel: 'Et mon colis sera débloqué', score: 0 },
      { label: 'Je vérifie sur laposte.fr avec mon numéro de suivi', sublabel: 'Sans passer par le lien du SMS', score: 2 },
      { label: 'Je réponds au SMS pour demander confirmation', sublabel: 'Avant de payer quoi que ce soit', score: 1 },
    ],
  },
  {
    id: 'q-faux-it',
    question: 'Téléphone : "Bonjour, je suis Thomas du service informatique. On a détecté une intrusion sur votre poste. Pour sécuriser votre session, j\'ai besoin de votre mot de passe Windows."',
    context: '📞 Numéro interne reconnu, voix professionnelle, il connaît votre prénom et votre service',
    options: [
      { label: 'Je lui donne mon mot de passe, il semble légitime', sublabel: 'Il a même le bon numéro interne', score: 0 },
      { label: 'Je lui demande de me rappeler dans 10 min après vérification', sublabel: 'Le temps d\'appeler le helpdesk directement', score: 1 },
      { label: 'Je refuse et appelle le helpdesk sur le numéro officiel', sublabel: 'Aucun IT légitime ne demande un mot de passe', score: 2 },
    ],
  },
  {
    id: 'q-mdp',
    question: 'Votre mot de passe habituel, c\'est lequel de ces profils ?',
    context: '🔑 Vos comptes : Gmail, banque, Instagram, Amazon, LinkedIn...',
    options: [
      { label: 'Le même partout, avec le nom de mon chien et une date', sublabel: 'Exemple : "Filou2018!" — facile à retenir', score: 0 },
      { label: 'Différents mais construits sur le même modèle', sublabel: 'Exemple : "Netflix2024!", "Gmail2024!"', score: 1 },
      { label: 'Aléatoires et uniques, stockés dans un gestionnaire', sublabel: 'Bitwarden, 1Password, ou équivalent', score: 2 },
    ],
  },
  {
    id: 'q-2fa',
    question: 'La double authentification (2FA), pour vous c\'est...',
    context: '🔒 Sécuriser l\'accès à vos comptes',
    options: [
      { label: 'Je ne sais pas ce que c\'est', sublabel: 'Ça ne me dit rien', score: 0 },
      { label: 'Un code SMS en plus de mon mot de passe', sublabel: 'Je l\'utilise sur certains comptes', score: 1 },
      { label: 'Activée sur tous mes comptes importants', sublabel: 'Email, banque, réseaux sociaux...', score: 2 },
    ],
  },
  {
    id: 'q-url',
    question: 'Parmi ces trois URLs, laquelle est la vraie page de connexion du Crédit Agricole ?',
    context: '🌐 Regardez bien l\'adresse complète de chaque lien',
    options: [
      { label: 'credit-agricole.fr.secure-login.com/client', sublabel: 'Connexion sécurisée au Crédit Agricole', score: 0 },
      { label: 'secure.credit-agricole.fr/login', sublabel: 'Portail de connexion sécurisé', score: 2 },
      { label: 'credit-agr1cole.fr/espace-client', sublabel: 'Espace client Crédit Agricole', score: 1 },
    ],
  },
  {
    id: 'q-clara',
    question: 'Vos vacances commencent demain. WhatsApp d\'un numéro inconnu : "Salut c\'est moi Clara ! J\'ai cassé mon tel, c\'est un nouveau numéro. Je suis bloquée à l\'aéroport de Lyon, j\'ai besoin de 300€ urgent."',
    context: '📲 Vous avez bien une amie prénommée Clara',
    options: [
      { label: 'Je vire les 300€ immédiatement, Clara a besoin de moi', sublabel: 'C\'est une amie, je ne peux pas la laisser tomber', score: 0 },
      { label: 'Je demande à Clara de me prouver son identité par message', sublabel: 'Avant de faire quoi que ce soit', score: 1 },
      { label: 'J\'appelle Clara sur son ancien numéro pour vérifier', sublabel: 'Si son téléphone est "cassé", quelqu\'un d\'autre peut décrocher', score: 2 },
    ],
  },
  {
    id: 'q-wifi',
    question: 'Vous êtes à l\'aéroport. Votre connexion 4G est mauvaise. Vous voyez un réseau WiFi nommé "AirportFreeWifi" ouvert (sans mot de passe). Vous devez consulter vos emails pros.',
    context: '📶 Votre vol est dans 1h et vous avez des dossiers urgents à traiter',
    options: [
      { label: 'Je me connecte — c\'est l\'aéroport, c\'est forcément sécurisé', sublabel: 'Les aéroports ont des infrastructures modernes', score: 0 },
      { label: 'Je me connecte mais uniquement sur des sites en HTTPS', sublabel: 'Le cadenas garantit la sécurité de la connexion', score: 1 },
      { label: 'Je garde mon 4G ou utilise mon VPN si je dois me connecter', sublabel: 'Un WiFi public ouvert peut être un hotspot frauduleux', score: 2 },
    ],
  },
  {
    id: 'q-antivirus',
    question: 'En naviguant sur un site, une popup apparaît : "⚠️ ALERTE SÉCURITÉ — Votre ordinateur est infecté par 3 virus ! Téléchargez AntiVirus Pro maintenant pour protéger vos données."',
    context: '💻 La fenêtre s\'est ouverte automatiquement et fait clignoter des alertes rouges',
    options: [
      { label: 'Je télécharge le logiciel — c\'est une alerte système officielle', sublabel: 'Mieux vaut prévenir que guérir', score: 0 },
      { label: 'Je ferme l\'onglet et lance une analyse avec mon vrai antivirus', sublabel: 'Mon antivirus installé est plus fiable', score: 1 },
      { label: 'Je ferme directement — c\'est du scareware, pas une alerte réelle', sublabel: 'Les vrais antivirus ne s\'affichent pas dans le navigateur', score: 2 },
    ],
  },
  {
    id: 'q-linkedin',
    question: 'Un inconnu vous envoie une demande de connexion LinkedIn avec ce message : "Bonjour, je travaille chez un grand cabinet de conseil. Nous recrutons des profils comme le vôtre. Envoyez-moi votre CV complet + date de naissance + RIB pour le dossier."',
    context: '💼 Son profil a 500+ relations et semble professionnel',
    options: [
      { label: 'J\'envoie tout — c\'est une opportunité à saisir', sublabel: 'Son profil semble authentique', score: 0 },
      { label: 'J\'envoie mon CV mais pas le RIB ni la date de naissance', sublabel: 'Certaines infos sont trop sensibles', score: 1 },
      { label: 'Je ne réponds pas — aucun recruteur légitime ne demande un RIB dès le premier contact', sublabel: 'Je vérifie le profil de l\'entreprise via le site officiel', score: 2 },
    ],
  },
  {
    id: 'q-concurrent-compte',
    question: 'Vous recevez un email vous informant que votre adresse email a été retrouvée dans une fuite de données. L\'email propose de "vérifier votre exposition" en cliquant sur un lien.',
    context: '🔓 L\'email cite des sites que vous avez réellement utilisés',
    options: [
      { label: 'Je clique — c\'est urgent de savoir si mes mots de passe sont exposés', sublabel: 'Je veux savoir tout de suite', score: 0 },
      { label: 'Je vais directement sur haveibeenpwned.com sans passer par le lien', sublabel: 'C\'est le service officiel de vérification des fuites', score: 2 },
      { label: 'J\'ignore — ce genre d\'email est toujours faux', sublabel: 'Les vraies fuites ne génèrent pas d\'emails', score: 1 },
    ],
  },
  {
    id: 'q-concours',
    question: 'Sur Facebook : "🎉 FÉLICITATIONS ! Vous avez été tiré au sort parmi nos abonnés ! Vous gagnez un iPhone 15 Pro. Cliquez pour réclamer votre prix avant ce soir minuit !"',
    context: '📘 Le post a 4 800 likes et vient d\'une page avec 50 000 abonnés',
    options: [
      { label: 'Je clique — j\'ai peut-être vraiment gagné !', sublabel: 'Tant de personnes ne peuvent pas se tromper', score: 0 },
      { label: 'Je vérifie d\'abord si la page est certifiée et si je me souviens d\'avoir participé', sublabel: 'Les concours légitimes nécessitent une participation préalable', score: 1 },
      { label: 'J\'ignore — c\'est un arnaque classique aux faux concours', sublabel: 'On ne gagne pas à des jeux auxquels on n\'a pas participé', score: 2 },
    ],
  },
  {
    id: 'q-incognito',
    question: 'Vous utilisez une application bancaire depuis votre téléphone en mode navigation privée (incognito). Vous pensez que...',
    context: '🕵️ Votre connexion est-elle vraiment privée ?',
    options: [
      { label: 'Incognito me protège totalement — personne ne peut voir mes connexions', sublabel: 'Ni mon opérateur, ni ma banque, ni les pirates', score: 0 },
      { label: 'Incognito empêche juste que mon historique soit sauvegardé sur l\'appareil', sublabel: 'Le reste du trafic reste visible pour l\'opérateur et les serveurs', score: 2 },
      { label: 'Incognito cache mon identité sur internet — ma banque ne sait pas que c\'est moi', sublabel: 'C\'est comme naviguer avec un masque', score: 0 },
    ],
  },
  {
    id: 'q-maj',
    question: 'Windows vous demande une mise à jour depuis 3 semaines. Vous ignorez les notifications car ça prend du temps et vous ne voulez pas perdre votre travail en cours.',
    context: '💻 La mise à jour concerne une faille de sécurité critique (CVE-2024-XXXX)',
    options: [
      { label: 'Je reporte indéfiniment — les mises à jour cassent parfois les choses', sublabel: 'Et je n\'ai pas eu de problème jusqu\'ici', score: 0 },
      { label: 'Je mets à jour seulement si c\'est une mise à jour "critique" notifiée', sublabel: 'Je fais le tri selon l\'urgence', score: 1 },
      { label: 'Je programme la mise à jour pour la nuit — les failles non corrigées sont la première porte d\'entrée des attaques', sublabel: 'WannaCry a exploité une faille disponible 2 mois avant l\'attaque', score: 2 },
    ],
  },
  {
    id: 'q-backup',
    question: 'Vos photos de famille (mariage, enfants) ne sont stockées que sur votre téléphone. Il n\'y a pas de sauvegarde ailleurs. Que faites-vous ?',
    context: '📸 15 ans de souvenirs, ~30 000 photos, aucune copie',
    options: [
      { label: 'Rien — mon téléphone est récent et fiable', sublabel: 'Les téléphones neufs ne tombent pas en panne', score: 0 },
      { label: 'Je les envoie par email à moi-même de temps en temps', sublabel: 'C\'est une sauvegarde suffisante', score: 1 },
      { label: 'Je mets en place une sauvegarde automatique (cloud + disque dur)', sublabel: 'Règle 3-2-1 : 3 copies, 2 supports différents, 1 hors site', score: 2 },
    ],
  },
  {
    id: 'q-partage-ecran',
    question: '"Technicien Orange" vous appelle : "Votre box est piratée. Pour la réparer à distance, j\'ai besoin que vous installiez TeamViewer et que vous me donniez le code d\'accès affiché."',
    context: '📞 Il connaît votre adresse et votre numéro de client Orange',
    options: [
      { label: 'J\'installe TeamViewer et lui donne le code — il est technicien certifié Orange', sublabel: 'Il a prouvé qu\'il connaît mon dossier', score: 0 },
      { label: 'Je racccroche et appelle le 3900 (numéro officiel Orange)', sublabel: 'Un vrai technicien peut être dépêché via le service client', score: 2 },
      { label: 'J\'installe mais je surveille l\'écran — si je vois quelque chose d\'anormal je coupe', sublabel: 'Je reste vigilant pendant l\'intervention', score: 1 },
    ],
  },
  {
    id: 'q-pj-exe',
    type: 'interactive',
    question: 'Que faites-vous face à cet email ?',
    context: '📧 Lisez bien l\'expéditeur, l\'objet et la pièce jointe avant d\'agir',
    visual: {
      type: 'email',
      from: 'Service Comptabilité',
      fromEmail: 'facturation@orange-compte.fr',
      subject: 'Facture impayée N°2024-08471 — Action requise sous 48h',
      body: 'Bonjour,\n\nNous n\'avons pas reçu le règlement de la facture N°2024-08471 d\'un montant de 127,50€.\n\nVeuillez trouver ci-joint la facture détaillée au format exécutable.\n\nSans règlement sous 48h, votre ligne sera suspendue.\n\nService Facturation Orange',
      hasPJ: true,
      pjLabel: 'Facture_N2024-08471.exe',
    },
    options: [
      { label: '📎 Ouvrir la pièce jointe', sublabel: 'Pour voir le détail de la facture', score: 0 },
      { label: '🚩 Signaler comme phishing', sublabel: 'Et ne pas ouvrir la pièce jointe', score: 2 },
      { label: '🗑️ Supprimer sans ouvrir', sublabel: 'Je paierai via le site Orange directement', score: 1 },
    ],
  },
  {
    id: 'q-email-apple',
    type: 'interactive',
    question: 'Que faites-vous face à cet email reçu ce matin ?',
    context: '📧 Prenez le temps d\'examiner l\'expéditeur et le contenu',
    visual: {
      type: 'email',
      from: 'Apple Support',
      fromEmail: 'noreply@apple-id-secure.com',
      subject: 'Votre identifiant Apple ID a été temporairement verrouillé',
      body: 'Cher client Apple,\n\nNous avons détecté une tentative d\'accès non autorisée sur votre compte Apple ID depuis un iPhone 16 Pro (Bucarest, Roumanie).\n\nPour protéger votre compte, nous avons temporairement verrouillé votre accès.\n\nCliquez sur le bouton ci-dessous pour vérifier votre identité et restaurer l\'accès dans les 24h.',
      hasLink: true,
      linkUrl: 'https://apple-id-secure.com/restore',
    },
    options: [
      { label: '🔗 Cliquer sur "Restaurer mon accès"', sublabel: 'Pour récupérer mon compte rapidement', score: 0 },
      { label: '🚩 Signaler comme phishing', sublabel: 'L\'adresse expéditeur n\'est pas celle d\'Apple', score: 2 },
      { label: '🌐 Aller sur appleid.apple.com directement', sublabel: 'Sans passer par le lien de l\'email', score: 2 },
    ],
  },
  {
    id: 'q-sms-antai',
    type: 'interactive',
    question: 'Vous recevez ce SMS. Que faites-vous ?',
    context: '📱 Vous avez un véhicule et conduisez régulièrement en ville',
    visual: {
      type: 'sms',
      from: 'ANTAI-Officiel',
      body: 'ANTAI : Amende non réglée réf. 7291-FR. Montant dû : 47€. Sans règlement avant demain, des frais de 135€ s\'ajouteront. Payez maintenant : antai-paiement-fr.com/reg',
    },
    options: [
      { label: '💳 Payer les 47€ via le lien', sublabel: 'Pour éviter les 135€ supplémentaires', score: 0 },
      { label: '📵 Signaler au 33700', sublabel: 'C\'est le numéro officiel pour signaler les SMS frauduleux', score: 2 },
      { label: '🌐 Vérifier sur amendes.gouv.fr', sublabel: 'Le seul site officiel pour consulter ses amendes', score: 2 },
    ],
  },
  {
    id: 'q-email-amazon',
    type: 'interactive',
    question: 'Cet email est-il légitime ? Quelle est votre action ?',
    context: '📧 Vous commandez régulièrement sur Amazon',
    visual: {
      type: 'email',
      from: 'Amazon.fr',
      fromEmail: 'confirmation@amazon-expeditions.com',
      subject: 'Votre commande #406-8291847 a bien été expédiée !',
      body: 'Bonjour,\n\nVotre commande a été expédiée ! Vous pouvez suivre votre livraison en cliquant sur le lien ci-dessous.\n\nCommande : #406-8291847\nDate d\'expédition : Aujourd\'hui\nLivreur : DHL\nLivraison estimée : 2-3 jours ouvrés\n\nSuivre mon colis →',
      hasLink: true,
      linkUrl: 'https://amazon-expeditions.com/track/406-8291847',
    },
    options: [
      { label: '📦 Cliquer sur "Suivre mon colis"', sublabel: 'Pour voir où en est ma livraison', score: 0 },
      { label: '🚩 Signaler comme phishing', sublabel: 'L\'email vient de amazon-expeditions.com, pas d\'amazon.fr', score: 2 },
      { label: '🌐 Aller sur amazon.fr pour vérifier mes commandes', sublabel: 'Sans passer par le lien de l\'email', score: 2 },
    ],
  },
];

const ASSESSMENT_COUNT = 5;

const TOTAL_SCENARIOS = 10;
const MAX_SCORE = TOTAL_SCENARIOS * 10;

function computeLevel(answers: number[]): Level {
  const total = answers.reduce((a, b) => a + b, 0);
  if (total <= 4) return 'debutant';
  if (total <= 8) return 'intermediaire';
  return 'maitrise';
}

const LEVEL_META: Record<Level, { label: string; desc: string; color: string; bg: string; icon: React.ReactNode }> = {
  debutant: { label: 'Débutant', desc: 'Vous découvrez le sujet. Les scénarios vont vous exposer aux arnaques les plus fréquentes du quotidien.', color: '#16a34a', bg: '#f0fdf4', icon: <Shield size={24} /> },
  intermediaire: { label: 'Intermédiaire', desc: 'Vous avez quelques bons réflexes. Les scénarios vont tester votre vigilance face à des attaques plus subtiles.', color: '#d97706', bg: '#fffbeb', icon: <Target size={24} /> },
  maitrise: { label: 'Bonne maîtrise des bases', desc: 'Vos fondamentaux sont solides. Les scénarios vont confronter vos connaissances aux attaques les plus sophistiquées.', color: BLUE, bg: '#eff6ff', icon: <Zap size={24} /> },
};

// ─── ENRICHISSEMENT PAR CATÉGORIE (faits réels + bonnes pratiques) ─────────────
interface CyberEnrichment {
  bonnesPratiques: string[];
  faitsHistoriques: string[];
  resumeCle: string;
}

const CYBER_ENRICHMENT: Record<string, CyberEnrichment> = {
  'phishing': {
    resumeCle: 'Le phishing représente la première cause de compromission de comptes dans le monde.',
    bonnesPratiques: [
      'Ne jamais cliquer sur un lien dans un email — saisir l\'URL officiellement',
      'Vérifier le domaine de l\'expéditeur (pas juste le nom affiché)',
      'Activer la double authentification sur tous vos comptes importants',
      'Sur mobile, appuyer longuement sur le lien pour voir l\'URL avant d\'ouvrir',
    ],
    faitsHistoriques: [
      '91 % des cyberattaques débutent par un email de phishing (Verizon DBIR 2024)',
      '3,4 milliards d\'emails de phishing sont envoyés chaque jour dans le monde',
      'En France, le phishing représente 80 % des signalements sur signal-spam.fr',
      'Le coût moyen d\'une attaque de phishing réussie : 4,91 M€ pour une entreprise (IBM 2023)',
    ],
  },
  'sms': {
    resumeCle: 'Le smishing (phishing par SMS) a explosé depuis 2020 : +300 % en 3 ans en France.',
    bonnesPratiques: [
      'Les organismes officiels (impôts, banques) ne demandent jamais de paiement par SMS',
      'Vérifier les livraisons uniquement sur le site officiel du transporteur',
      'Signaler les SMS frauduleux au 33700 (gratuit)',
      'Ne jamais rappeler un numéro reçu dans un SMS suspect',
    ],
    faitsHistoriques: [
      'En 2023, Signal-spam a traité plus de 130 000 signalements de smishing en France',
      'L\'arnaque au colis (faux Chronopost/La Poste) est la 1ère arnaque SMS en France',
      'Le taux de clic sur un lien malveillant est 8× plus élevé sur SMS que par email',
      'En 2022, des fausses alertes Ameli par SMS ont escroqué 600 000 Français',
    ],
  },
  'vishing': {
    resumeCle: 'Le vishing (phishing vocal) exploite la confiance instinctive que nous accordons à une voix humaine.',
    bonnesPratiques: [
      'Aucun service informatique légitime ne demande votre mot de passe par téléphone',
      'Raccrocher et rappeler via le numéro officiel de l\'entreprise',
      'Ne jamais donner accès à votre ordinateur à quelqu\'un qui appelle spontanément',
      'Vérifier le numéro affiché (le spoofing permet d\'afficher n\'importe quel numéro)',
    ],
    faitsHistoriques: [
      'Microsoft a reçu 7 000 plaintes pour faux support technique en 2023 rien qu\'en France',
      'Les arnaques au faux support coûtent en moyenne 1 200€ par victime',
      'Le spoofing téléphonique permet d\'afficher le numéro de votre banque — aucun numéro ne certifie l\'identité',
      'En 2021, des hackers ont volé 4,2 M$ à une entreprise via un deepfake vocal du PDG',
    ],
  },
  'popup': {
    resumeCle: 'Les fausses alertes navigateur exploitent la panique pour faire installer des malwares.',
    bonnesPratiques: [
      'Windows n\'alerte jamais via le navigateur — fermer immédiatement la fenêtre',
      'Ne jamais appeler le numéro affiché dans une popup d\'alerte (numéro surtaxé)',
      'Forcer la fermeture du navigateur avec Alt+F4 ou le gestionnaire de tâches',
      'Scanner son PC avec un antivirus officiel après ce type d\'incident',
    ],
    faitsHistoriques: [
      'L\'arnaque au faux support (scareware) génère 1,5 milliard $ de revenus par an à l\'échelle mondiale',
      'Les personnes âgées représentent 60 % des victimes du faux support technique',
      'En France, 15 000 plaintes pour faux support informatique ont été déposées en 2022',
      'Un appel à ces numéros coûte entre 1,50€ et 4€ la minute',
    ],
  },
  'wifi': {
    resumeCle: 'Un réseau WiFi public peut être contrôlé par n\'importe qui — VPN obligatoire.',
    bonnesPratiques: [
      'Utiliser un VPN sur tout réseau public ou inconnu',
      'Désactiver la connexion WiFi automatique sur votre téléphone',
      'Utiliser la connexion 4G/5G plutôt que le WiFi public pour les opérations sensibles',
      'Vérifier le nom exact du réseau officiel auprès du personnel de l\'établissement',
    ],
    faitsHistoriques: [
      'Une attaque "Evil Twin" (faux hotspot) peut se mettre en place en moins de 5 minutes',
      '25 % des internautes se connectent à des réseaux WiFi publics pour faire leurs achats en ligne',
      'En 2023, des pirates ont volé des données bancaires via un faux WiFi dans un aéroport australien',
      'Le coût moyen d\'une intrusion par WiFi non sécurisé : 7 000€ de préjudice par victime',
    ],
  },
  'malware': {
    resumeCle: 'Les pièces jointes malveillantes restent le vecteur n°1 d\'infection des entreprises.',
    bonnesPratiques: [
      'Ne jamais ouvrir une pièce jointe .exe, .zip, .iso ou .macro d\'un expéditeur inconnu',
      'Vérifier l\'extension réelle du fichier (facture.pdf.exe est un exécutable, pas un PDF)',
      'Les vraies factures s\'affichent dans votre espace client, pas en pièce jointe',
      'Signaler à votre service informatique tout email suspect avant de l\'ouvrir',
    ],
    faitsHistoriques: [
      '71 % des malwares sont distribués par email (ENISA Threat Landscape 2023)',
      'En 2023, une macro Excel malveillante a paralysé 40 hôpitaux en France (cyberattaque Corentin Celton)',
      'Le ransomware coûte en moyenne 4,54 M€ aux entreprises françaises (IBM 2023)',
      'L\'attaque NotPetya (2017) a coûté 10 milliards $ au niveau mondial, propagée par une mise à jour corrompue',
    ],
  },
  'arnaque': {
    resumeCle: 'Si c\'est trop beau pour être vrai, c\'est une arnaque — sans exception.',
    bonnesPratiques: [
      'On ne peut pas gagner une loterie à laquelle on n\'a pas participé',
      'Les marques ne font jamais cadeau de produits par email ou SMS',
      'Les "frais de livraison" sont souvent un prétexte pour enregistrer votre CB',
      'Signaler sur signalconso.gouv.fr pour protéger les autres',
    ],
    faitsHistoriques: [
      '31 millions de Français ont été victimes d\'une arnaque en ligne en 2023 (DGCCRF)',
      'L\'arnaque aux faux cadeaux génère 300 M€ de pertes par an en France',
      'Les abonnements cachés piégent 4 millions de Français chaque année',
      'L\'arnaque "frais de livraison 2€" cache en réalité un abonnement à 49,90€/mois',
    ],
  },
  'ami': {
    resumeCle: 'L\'arnaque au faux proche exploite votre générosité — toujours vérifier par un appel direct.',
    bonnesPratiques: [
      'Appeler la personne sur son ancien numéro avant tout virement',
      'Poser une question personnelle dont seul un proche connaît la réponse',
      'Ne jamais virer de l\'argent en urgence sans vérification vocale',
      'Les virements effectués sont quasi-impossibles à récupérer — agir avec prudence',
    ],
    faitsHistoriques: [
      'L\'arnaque au faux proche a généré 17 M€ de pertes en France en 2022',
      'Les + de 60 ans représentent 55 % des victimes d\'arnaques au faux proche',
      'La durée moyenne entre le premier contact et le virement : 47 minutes',
      'Avec le deepfake vocal, les escrocs imitent maintenant la voix du proche avec 30 secondes d\'échantillon',
    ],
  },
  'social': {
    resumeCle: 'Les réseaux sociaux sont le terrain de chasse favori des escrocs — vigilance permanente.',
    bonnesPratiques: [
      'Vérifier le nombre de followers et la date de création d\'une page avant d\'interagir',
      'Les vrais concours de marques ne redirigent jamais vers des sites externes',
      'Paramétrer son profil en privé pour les publications personnelles',
      'Ne jamais partager son adresse ou ses dates d\'absence publiquement',
    ],
    faitsHistoriques: [
      'Facebook est le réseau le plus utilisé pour la fraude en France (CNIL 2023)',
      '4,9 milliards € de pertes dues aux arnaques sur les réseaux sociaux en 2023 (FTC)',
      'En 2022, des arnaques aux faux concours Samsung et Apple ont touché 2 M de Français',
      'Le "pig butchering" (arnaque romantique longue durée) coûte en moyenne 28 000€ par victime',
    ],
  },
  'credential': {
    resumeCle: 'La réutilisation de mot de passe expose tous vos comptes dès qu\'un seul site est compromis.',
    bonnesPratiques: [
      'Utiliser un mot de passe unique pour chaque service (gestionnaire recommandé)',
      'Activer la double authentification partout, surtout email et banque',
      'Vérifier si ses données ont fuité sur haveibeenpwned.com',
      'Changer immédiatement ses mots de passe après une fuite de données',
    ],
    faitsHistoriques: [
      '81 % des violations de données impliquent des mots de passe faibles ou réutilisés (Verizon 2023)',
      'La base de données RockYou2024 contient 10 milliards de mots de passe fuités',
      '60 % des internautes français utilisent le même mot de passe pour plusieurs services (CNIL 2022)',
      'Une attaque par "credential stuffing" teste jusqu\'à 1 million de combinaisons par heure',
    ],
  },
  'deepfake': {
    resumeCle: 'Les deepfakes audio et vidéo deviennent quasi-indétectables — les procédures humaines sont la seule défense.',
    bonnesPratiques: [
      'Établir un mot de passe verbal de confirmation avec ses proches et collègues',
      'Pour tout virement important, exiger une confirmation par un 2e canal (email + téléphone)',
      'Être vigilant aux micro-coupures ou artefacts vocaux lors d\'un appel',
      'Contacter directement la direction ou les RH en cas de demande de virement inhabituelle',
    ],
    faitsHistoriques: [
      'En 2024, une banque hongkongaise a perdu 25,6 M$ à cause d\'un deepfake vidéo d\'un CFO',
      'Le nombre de deepfakes malveillants a augmenté de 3000 % entre 2019 et 2023',
      'En France, 3 entreprises ont subi des fraudes au président par deepfake vocal en 2023',
      'Des outils gratuits permettent de cloner une voix avec 10 secondes d\'audio source',
    ],
  },
  'ceo-fraud': {
    resumeCle: 'La fraude au président cible les collaborateurs ayant accès aux virements — toujours confirmer par téléphone.',
    bonnesPratiques: [
      'Toute demande de virement hors procédure doit être vérifiée par un appel au dirigeant sur son numéro habituel',
      'Mettre en place une procédure de double validation pour les virements inhabituels',
      'Ne jamais traiter en urgence une demande de confidentialité absolue',
      'Former régulièrement les équipes comptables aux scénarios de fraude',
    ],
    faitsHistoriques: [
      'La fraude au président coûte 2,3 milliards € par an aux entreprises françaises (Euler Hermes)',
      'En 2023, une PME française a perdu 1,2 M€ suite à un email du "PDG" demandant un virement urgent',
      'Le taux de réussite de cette arnaque est de 27 % quand elle cible un employé non formé',
      'Le FBI estime que cette fraude a généré 50 milliards $ de pertes mondiales depuis 2013',
    ],
  },
  'usb': {
    resumeCle: 'Une clé USB trouvée est un piège classique — 60 % des gens la branchent quand même.',
    bonnesPratiques: [
      'Ne jamais brancher une clé USB trouvée, même dans un parking d\'entreprise',
      'Remettre tout support de stockage trouvé au service informatique sans le connecter',
      'Les clés "BadUSB" se font passer pour un clavier et injectent des commandes automatiquement',
      'Désactiver l\'exécution automatique (Autorun) sur les postes de travail',
    ],
    faitsHistoriques: [
      'Dans une étude de l\'université d\'Illinois, 98 % des clés USB piégées ont été branchées',
      'Le ver Stuxnet (2010) s\'est propagé dans les centrifugeuses iraniennes via une clé USB',
      'En 2022, le FBI a alerté sur une campagne où des clés USB malveillantes étaient envoyées par courrier postal aux entreprises',
      'Le temps moyen entre le branchement d\'une clé piégée et l\'infection complète : 8 secondes',
    ],
  },
  'ransomware': {
    resumeCle: 'Le ransomware chiffre vos données en quelques minutes — la prévention est la seule vraie défense.',
    bonnesPratiques: [
      'Sauvegarder ses données selon la règle 3-2-1 : 3 copies, 2 supports différents, 1 hors site',
      'Maintenir ses logiciels à jour pour corriger les vulnérabilités exploitées',
      'Ne jamais payer la rançon : ça finance les criminels et ne garantit pas la récupération',
      'Signaler immédiatement à l\'ANSSI en cas d\'incident',
    ],
    faitsHistoriques: [
      'La France est le 4e pays le plus touché par les ransomwares en Europe (ANSSI 2023)',
      'L\'hôpital de Corbeil-Essonnes a mis 18 mois à se remettre d\'une cyberattaque en 2022',
      'Le coût moyen d\'une attaque ransomware pour une PME française : 1,3 M€',
      'En 2023, LockBit 3.0 a mis en faillite 3 entreprises françaises en chiffrant leurs données',
    ],
  },
  'supply-chain': {
    resumeCle: 'Les attaques via la chaîne d\'approvisionnement logicielle contaminent des milliers d\'entreprises en une seule attaque.',
    bonnesPratiques: [
      'Vérifier les mises à jour de logiciels tiers avant de les déployer',
      'Maintenir un inventaire des logiciels utilisés et leurs éditeurs',
      'Appliquer le principe du moindre privilège aux logiciels tiers',
      'S\'abonner aux alertes de sécurité de l\'ANSSI et CERT-FR',
    ],
    faitsHistoriques: [
      'L\'attaque SolarWinds (2020) a compromis 18 000 organisations dont des agences US gouvernementales',
      'L\'incident XZ Utils (2024) a failli introduire une backdoor dans des millions de systèmes Linux',
      'En 2021, Kaseya VSA a permis de déployer un ransomware sur 1 500 entreprises simultanément',
      'Les attaques supply chain ont augmenté de 742 % entre 2019 et 2022 (Sonatype)',
    ],
  },
  'oversharing': {
    resumeCle: 'Chaque information publiée en ligne peut être utilisée contre vous — ou votre domicile.',
    bonnesPratiques: [
      'Passer ses profils en mode privé sur tous les réseaux sociaux',
      'Ne jamais publier son adresse précise, même partiellement',
      'Partager les photos de vacances à son retour, pas en temps réel',
      'Vérifier régulièrement qui a accès à ses publications',
    ],
    faitsHistoriques: [
      'En France, 30 % des cambriolages surviennent pendant des vacances annoncées sur les réseaux',
      'Le CNIL a reçu 1 200 plaintes liées à la géolocalisation non consentie en 2023',
      'Des assureurs refusent des indemnisations quand des publications montrent une absence',
      '73 % des recruteurs consultent les réseaux sociaux d\'un candidat avant entretien',
    ],
  },
};

function getEnrichment(category: string): CyberEnrichment {
  const key = Object.keys(CYBER_ENRICHMENT).find(k => category.toLowerCase().includes(k));
  return key ? CYBER_ENRICHMENT[key] : {
    resumeCle: 'Les cybermenaces évoluent constamment — la formation est votre meilleure protection.',
    bonnesPratiques: [
      'Maintenir ses logiciels à jour régulièrement',
      'Activer la double authentification sur les comptes importants',
      'Faire des sauvegardes régulières de ses données',
      'Signaler tout incident à son équipe informatique ou sur cybermalveillance.gouv.fr',
    ],
    faitsHistoriques: [
      '385 000 signalements cyber ont été traités par cybermalveillance.gouv.fr en 2023',
      'La France a investi 1 milliard € dans la cybersécurité dans le cadre du plan France 2030',
      '90 % des incidents cyber impliquent une erreur humaine (IBM Security 2023)',
      'Le marché mondial de la cybersécurité atteindra 262 milliards $ en 2025',
    ],
  };
}

function getBadge(score: number) {
  const pct = (score / MAX_SCORE) * 100;
  if (pct >= 70) return { label: 'Sécurisé', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
  if (pct >= 40) return { label: 'Prudent', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  return { label: 'Vulnérable', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
}

// ─────────────────────────────────────────────────────────────────────────────
// SANDBOX EMAIL INTERACTIF — ÉVALUATION (avec boutons d'action directs)
// ─────────────────────────────────────────────────────────────────────────────
function AssessmentEmailSandbox({ visual, onAction }: { visual: AssessmentVisual; onAction: (score: number, idx: number) => void }) {
  const [showHeaders, setShowHeaders] = useState(false);
  const [clicked, setClicked] = useState<number | null>(null);
  const isDangerousDomain = visual.fromEmail && !visual.fromEmail.includes('@apple.com') && !visual.fromEmail.includes('@amazon.fr') && !visual.fromEmail.includes('@orange.fr');
  const initials = (visual.from || 'X').charAt(0).toUpperCase();

  const actions = [
    { label: '🔗 Ouvrir le lien', sublabel: 'Accéder au site mentionné dans l\'email', score: 0 },
    { label: '📎 Ouvrir la pièce jointe', sublabel: 'Consulter le document joint', score: 0 },
    { label: '🚩 Signaler comme phishing', sublabel: 'Marquer comme tentative d\'hameçonnage', score: 2 },
    { label: '🗑️ Supprimer sans ouvrir', sublabel: 'Supprimer l\'email sans interagir', score: 1 },
    { label: '🌐 Vérifier sur le site officiel', sublabel: 'Aller directement sur le site sans le lien', score: 2 },
  ];

  const shownActions = visual.hasLink && !visual.hasPJ
    ? [actions[0], actions[2], actions[4]]
    : visual.hasPJ
    ? [actions[1], actions[2], actions[3]]
    : [actions[2], actions[3], actions[4]];

  const handleClick = (score: number, idx: number) => {
    if (clicked !== null) return;
    setClicked(idx);
    setTimeout(() => onAction(score, idx), 300);
  };

  return (
    <div className="flex flex-col bg-white border border-gray-200 overflow-hidden" style={{ fontFamily: 'Google Sans, Arial, sans-serif', maxHeight: 420 }}>
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ background: '#f6f8fc' }}>
        <Mail size={13} className="text-gray-500" />
        <span className="text-xs font-medium text-gray-700">Boîte de réception</span>
      </div>
      <div className="px-5 pt-4 pb-2">
        <h3 className="text-lg font-normal text-gray-900">{visual.subject || '(sans objet)'}</h3>
      </div>
      <div className="px-5 pb-3 flex items-start gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: isDangerousDomain ? '#dc2626' : '#6b7280' }}>{initials}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 text-sm">{visual.from}</span>
            <button onClick={() => setShowHeaders(!showHeaders)}
              className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-0.5">
              <span className="font-mono text-xs">&lt;{visual.fromEmail}&gt;</span>
              <ChevronDown size={10} className={`transition-transform ${showHeaders ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">À : moi · Aujourd'hui, {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
        {isDangerousDomain && <span className="text-xs font-bold text-red-600 flex-shrink-0 mt-1">⚠ Domaine suspect</span>}
      </div>
      <AnimatePresence>
        {showHeaders && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mx-5 mb-2">
            <div className="bg-gray-50 border border-gray-200 p-2 text-xs font-mono space-y-1">
              <div><span className="text-gray-500">From: </span><span className="text-red-600">{visual.fromEmail}</span></div>
              <div><span className="text-gray-500">Authentication: </span><span className="text-red-600">DKIM=fail SPF=fail</span></div>
              <div className="text-red-600 font-sans font-bold mt-1">⚠️ Domaine non officiel — cet email n'est PAS envoyé par le vrai service</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="px-5 pb-2 flex-1 overflow-y-auto">
        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{visual.body}</div>
        {visual.hasPJ && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 border border-orange-300 bg-orange-50">
            <Paperclip size={14} className="text-orange-500 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-orange-800">{visual.pjLabel}</div>
              <div className="text-xs text-orange-600">⚠️ Fichier exécutable (.exe) — dangereux</div>
            </div>
          </div>
        )}
        {visual.hasLink && visual.linkUrl && (
          <div className="mt-3 px-3 py-2 border border-gray-200 bg-gray-50">
            <div className="text-xs text-gray-500 font-mono">{visual.linkUrl}</div>
          </div>
        )}
      </div>
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Que faites-vous ?</div>
        <div className="flex flex-col gap-2">
          {shownActions.map((action, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleClick(action.score, idx)}
              disabled={clicked !== null}
              whileHover={clicked === null ? { x: 3 } : {}}
              className="w-full text-left px-3 py-2.5 border text-sm font-medium transition-all flex items-center gap-3"
              style={{
                borderColor: clicked === idx ? (action.score >= 2 ? '#16a34a' : action.score === 1 ? '#d97706' : '#dc2626') : '#e5e7eb',
                background: clicked === idx ? (action.score >= 2 ? '#f0fdf4' : action.score === 1 ? '#fffbeb' : '#fef2f2') : 'white',
                opacity: clicked !== null && clicked !== idx ? 0.5 : 1,
              }}>
              <span className="text-base">{action.label.split(' ')[0]}</span>
              <div>
                <div className="font-semibold text-gray-900">{action.label.split(' ').slice(1).join(' ')}</div>
                <div className="text-xs text-gray-500">{action.sublabel}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SANDBOX SMS INTERACTIF — ÉVALUATION
// ─────────────────────────────────────────────────────────────────────────────
function AssessmentSmsSandbox({ visual, onAction }: { visual: AssessmentVisual; onAction: (score: number, idx: number) => void }) {
  const [clicked, setClicked] = useState<number | null>(null);

  const shownActions = [
    { label: '💳 Payer via le lien', sublabel: 'Accéder au lien de paiement', score: 0 },
    { label: '📵 Signaler au 33700', sublabel: 'Numéro officiel de signalement des SMS frauduleux', score: 2 },
    { label: '🌐 Vérifier sur le site officiel', sublabel: 'Sans passer par le lien du SMS', score: 2 },
    { label: '↩️ Répondre au SMS', sublabel: 'Pour demander plus d\'informations', score: 0 },
    { label: '🗑️ Supprimer et ignorer', sublabel: 'Sans interagir avec le message', score: 1 },
  ];

  const visibleActions = [shownActions[0], shownActions[1], shownActions[2]];

  const handleClick = (score: number, idx: number) => {
    if (clicked !== null) return;
    setClicked(idx);
    setTimeout(() => onAction(score, idx), 300);
  };

  return (
    <div className="flex flex-col bg-white border border-gray-200 overflow-hidden" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', maxHeight: 420 }}>
      <div style={{ background: '#f2f2f7' }} className="px-4 pt-3 pb-2 border-b border-gray-200 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: '#8e8e93' }}>{(visual.from || '?').charAt(0)}</div>
        <div>
          <div className="text-sm font-semibold text-gray-900">{visual.from || 'Inconnu'}</div>
          <div className="text-xs text-gray-500">Message · Aujourd'hui</div>
        </div>
      </div>
      <div className="px-4 py-4 bg-white min-h-28">
        <div className="flex justify-start">
          <div className="max-w-xs px-3.5 py-2.5 text-sm leading-relaxed text-gray-900"
            style={{ background: '#e5e5ea', borderRadius: '18px 18px 18px 4px' }}>
            {visual.body}
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
        <div className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Que faites-vous ?</div>
        <div className="flex flex-col gap-2">
          {visibleActions.map((action, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleClick(action.score, idx)}
              disabled={clicked !== null}
              whileHover={clicked === null ? { x: 3 } : {}}
              className="w-full text-left px-3 py-2.5 border text-sm font-medium transition-all flex items-center gap-3"
              style={{
                borderColor: clicked === idx ? (action.score >= 2 ? '#16a34a' : action.score === 1 ? '#d97706' : '#dc2626') : '#e5e7eb',
                background: clicked === idx ? (action.score >= 2 ? '#f0fdf4' : action.score === 1 ? '#fffbeb' : '#fef2f2') : 'white',
                opacity: clicked !== null && clicked !== idx ? 0.5 : 1,
              }}>
              <span className="text-base">{action.label.split(' ')[0]}</span>
              <div>
                <div className="font-semibold text-gray-900">{action.label.split(' ').slice(1).join(' ')}</div>
                <div className="text-xs text-gray-500">{action.sublabel}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACE EMAIL RÉALISTE (style Gmail)
// ─────────────────────────────────────────────────────────────────────────────
function EmailVisual({ visual, onLinkClick }: { visual: ScenarioVisual; onLinkClick: () => void }) {
  const [showHeaders, setShowHeaders] = useState(false);
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [starred, setStarred] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const initials = (visual.from || 'X').charAt(0).toUpperCase();
  const avatarColor = visual.fromEmail?.includes('.com') && !visual.fromEmail?.includes(visual.from?.split(' ')[0]?.toLowerCase() || '') ? '#dc2626' : '#6b7280';

  return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: 'Google Sans, Arial, sans-serif' }}>
      {/* Barre Gmail */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ background: '#f6f8fc' }}>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Mail size={13} />
          <span className="font-medium text-gray-700">Boîte de réception</span>
        </div>
        <div className="flex-1" />
        <Search size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
        <MoreHorizontal size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>

      {/* Sujet */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-normal text-gray-900 flex-1">{visual.subject || '(sans objet)'}</h2>
          <button onClick={() => setStarred(!starred)} className="mt-1 flex-shrink-0">
            <Star size={18} fill={starred ? '#f59e0b' : 'none'} className={starred ? 'text-yellow-500' : 'text-gray-400'} />
          </button>
        </div>
      </div>

      {/* Info expéditeur */}
      <div className="px-6 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: avatarColor }}>{initials}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900 text-sm">{visual.from || 'Expéditeur inconnu'}</span>
              <button onClick={() => setShowHeaders(!showHeaders)}
                className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-0.5 transition-colors">
                <span className="font-mono text-xs">&lt;{visual.fromEmail}&gt;</span>
                <ChevronDown size={11} className={`transition-transform ${showHeaders ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              À : <span className="text-gray-700">moi</span>
              <span className="ml-2 text-gray-400">Aujourd'hui, {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Reply size={16} className="text-gray-400 hover:text-gray-700 cursor-pointer transition-colors" title="Répondre" />
            <MoreHorizontal size={16} className="text-gray-400 hover:text-gray-700 cursor-pointer transition-colors" onClick={() => setShowMenu(!showMenu)} />
          </div>
        </div>

        {/* Headers expandables */}
        <AnimatePresence>
          {showHeaders && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3">
              <div className="bg-gray-50 border border-gray-200 p-3 text-xs font-mono">
                <div className="text-gray-500 mb-2 uppercase tracking-wider text-xs font-sans">En-têtes de l'email</div>
                <div className="space-y-1">
                  <div><span className="text-gray-500">From: </span><span className="text-gray-800">{visual.from} &lt;{visual.fromEmail}&gt;</span></div>
                  <div><span className="text-gray-500">Reply-To: </span>
                    <span className="text-red-600 font-bold">{visual.fromEmail}</span>
                    {visual.fromEmail && !visual.fromEmail?.includes('bnpparibas.fr') && !visual.fromEmail?.includes('credit-agricole.fr') && !visual.fromEmail?.includes('edf.fr') &&
                      <span className="ml-2 text-red-500 font-sans normal-case font-bold">⚠ Domaine suspect !</span>}
                  </div>
                  <div><span className="text-gray-500">Received: </span><span className="text-gray-700">from mail.{visual.fromEmail?.split('@')[1]} (unknown)</span></div>
                  <div><span className="text-gray-500">Authentication: </span><span className="text-red-600">DKIM=fail SPF=fail</span></div>
                  <div><span className="text-gray-500">X-Spam-Score: </span><span className="text-red-600">8.4 (HIGH)</span></div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200 text-red-600 font-sans normal-case">
                  ⚠️ DKIM et SPF échouent — cet email n'est PAS envoyé par le vrai domaine
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Corps du message */}
      <div className="flex-1 px-6 pb-4 overflow-y-auto">
        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{visual.body}</div>

        {/* Lien cliquable */}
        {visual.hasClickableLink && visual.linkLabel && (
          <div className="mt-6">
            <button
              onClick={onLinkClick}
              onMouseEnter={() => setHoveredUrl(visual.linkUrl || '')}
              onMouseLeave={() => setHoveredUrl(null)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-85"
              style={{ background: BLUE }}>
              <ExternalLink size={13} />{visual.linkLabel}
            </button>
            {visual.linkUrl && (
              <div className="mt-2 text-xs text-gray-400 font-mono break-all hover:text-gray-600 cursor-pointer"
                onMouseEnter={() => setHoveredUrl(visual.linkUrl || '')}
                onMouseLeave={() => setHoveredUrl(null)}>
                {visual.linkUrl}
              </div>
            )}
          </div>
        )}

        {/* Zone de réponse */}
        <AnimatePresence>
          {showReply && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="mt-6 border border-gray-300 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
                Répondre à <span className="font-medium">{visual.fromEmail}</span>
              </div>
              <textarea className="w-full px-3 py-3 text-sm text-gray-800 resize-none outline-none" rows={4}
                placeholder="Rédiger votre réponse..." value={replyText} onChange={e => setReplyText(e.target.value)} />
              <div className="px-3 py-2 flex items-center gap-2 border-t border-gray-200 bg-gray-50">
                <button className="px-4 py-1.5 text-white text-xs font-medium flex items-center gap-1" style={{ background: BLUE }}>
                  <Send size={11} />Envoyer
                </button>
                <span className="text-xs text-orange-500">⚠ Attention à qui vous répondez</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-3">
        <button onClick={() => setShowReply(!showReply)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">
          <Reply size={12} />Répondre
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">
          <Forward size={12} />Transférer
        </button>
        <div className="flex-1" />
        <button onClick={() => setShowHeaders(true)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          <Info size={11} />Inspecter
        </button>
        <button className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors">
          <AlertOctagon size={11} />Signaler
        </button>
      </div>

      {/* Status bar URL */}
      <AnimatePresence>
        {hoveredUrl && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-3 py-1.5 border-t border-gray-200 flex items-center gap-2" style={{ background: '#f0f0f0' }}>
            <Globe size={10} className="text-gray-500 flex-shrink-0" />
            <span className="text-xs font-mono text-gray-600 truncate">{hoveredUrl}</span>
            {hoveredUrl && !hoveredUrl.includes('.gouv.fr') && !hoveredUrl.startsWith('https://www.') && (
              <span className="text-xs text-red-600 font-bold ml-auto flex-shrink-0">⚠ Suspect</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACE SMS RÉALISTE (style iPhone)
// ─────────────────────────────────────────────────────────────────────────────
function SmsVisual({ visual, onLinkClick }: { visual: ScenarioVisual; onLinkClick: () => void }) {
  const [replyText, setReplyText] = useState('');
  const [showSendWarn, setShowSendWarn] = useState(false);
  const [longPressMenu, setLongPressMenu] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  const handleSend = () => {
    if (replyText.trim()) setShowSendWarn(true);
  };

  return (
    <div className="w-full max-w-sm mx-auto select-none" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* En-tête iPhone */}
      <div style={{ background: '#f2f2f7' }} className="overflow-hidden">
        <div className="px-4 pt-3 pb-2 flex items-center gap-3 border-b border-gray-200">
          <button className="text-blue-500 text-sm flex items-center gap-1">
            <ArrowLeft size={16} />Messages
          </button>
          <div className="flex-1 text-center">
            <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white text-sm font-bold"
              style={{ background: '#8e8e93' }}>
              {(visual.from || '?').charAt(0)}
            </div>
            <div className="text-xs font-semibold text-gray-900 mt-0.5">{visual.from || 'Inconnu'}</div>
            <button className="text-xs text-blue-500">Infos</button>
          </div>
          <div className="w-16" />
        </div>

        {/* Zone de messages */}
        <div className="px-4 py-4 min-h-48 bg-white space-y-3">
          <div className="text-center text-xs text-gray-400">Aujourd'hui {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
          
          {/* Bulle message reçu */}
          <div className="flex justify-start">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-xs"
              onContextMenu={(e) => { e.preventDefault(); setLongPressMenu(!longPressMenu); }}>
              <div className="px-3.5 py-2.5 text-sm leading-relaxed" style={{ background: '#e5e5ea', borderRadius: '18px 18px 18px 4px' }}>
                <div className="text-gray-900 whitespace-pre-line">{visual.body.split('\n').slice(0, -1).join('\n') || visual.body}</div>
                {visual.hasClickableLink && visual.linkUrl && (
                  <button
                    onClick={() => { setTapCount(t => t + 1); onLinkClick(); }}
                    className="mt-2 block w-full text-left border border-gray-300 bg-white p-2 text-xs"
                    style={{ borderRadius: 8 }}>
                    <div className="flex items-center gap-1.5">
                      <Globe size={12} className="text-blue-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-blue-600 truncate">{visual.linkUrl.replace('https://', '').split('/')[0]}</div>
                        <div className="text-gray-400 text-xs truncate">{visual.linkUrl}</div>
                      </div>
                    </div>
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-0.5 px-1">Lu</div>
            </motion.div>
          </div>

          {/* Long press menu */}
          <AnimatePresence>
            {longPressMenu && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-100 border border-gray-200 p-2 flex gap-4 text-xs text-gray-600 justify-center">
                {['Copier', 'Plus', 'Supprimer', 'Signaler'].map(a => (
                  <button key={a} className="px-2 py-1 hover:bg-gray-200 transition-colors">{a}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Zone de saisie */}
        <div className="px-3 py-2 border-t border-gray-200 flex items-end gap-2" style={{ background: '#f2f2f7' }}>
          <Camera size={24} className="text-gray-400 mb-1.5 flex-shrink-0" />
          <div className="flex-1 flex items-end gap-2 bg-white border border-gray-300 px-3 py-1.5" style={{ borderRadius: 20 }}>
            <input
              className="flex-1 text-sm outline-none bg-transparent"
              placeholder="Message iMessage"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <Mic size={16} className="text-gray-400 flex-shrink-0" />
          </div>
          {replyText ? (
            <button onClick={handleSend} className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
              style={{ background: BLUE }}>
              <ArrowRight size={14} className="text-white" />
            </button>
          ) : (
            <button className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <Mic size={18} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Warning envoi */}
      <AnimatePresence>
        {showSendWarn && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-3 border-l-4 border-orange-400 bg-orange-50 p-3">
            <div className="text-xs font-bold text-orange-800 mb-1">⚠️ Vous allez répondre à ce numéro</div>
            <div className="text-xs text-orange-700">Répondre confirme aux fraudeurs que votre numéro est actif. Êtes-vous sûr ?</div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setShowSendWarn(false)} className="text-xs px-3 py-1 bg-orange-600 text-white">Annuler</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACE APPEL TÉLÉPHONIQUE RÉALISTE (style iPhone)
// ─────────────────────────────────────────────────────────────────────────────
function PhoneCallVisual({ visual, onTrapAnswer }: { visual: ScenarioVisual; onTrapAnswer?: () => void }) {
  const [callPhase, setCallPhase] = useState<'ringing' | 'active' | 'declined'>('ringing');
  const [callTime, setCallTime] = useState(0);
  const [transcriptIndex, setTranscriptIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  const sentences = visual.body.split('. ').filter(s => s.trim());

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callPhase === 'active') {
      interval = setInterval(() => setCallTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callPhase]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (callPhase === 'active' && transcriptIndex < sentences.length) {
      timeout = setTimeout(() => setTranscriptIndex(i => i + 1), 1800);
    }
    return () => clearTimeout(timeout);
  }, [callPhase, transcriptIndex, sentences.length]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (callPhase === 'ringing') {
    return (
      <div className="w-full max-w-xs mx-auto" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
        <div className="overflow-hidden" style={{ background: 'linear-gradient(180deg, #1c1c2e 0%, #2d2d44 100%)', minHeight: 480 }}>
          <div className="px-6 pt-12 pb-6 flex flex-col items-center">
            <div className="text-white text-sm mb-2 opacity-70">Appel entrant</div>
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)' }}>
              <Phone size={36} className="text-white" />
            </div>
            <div className="text-white text-2xl font-light mb-1">{visual.from || 'Numéro inconnu'}</div>
            <div className="text-gray-400 text-sm">Portable · France</div>
            <div className="mt-2 text-xs text-orange-300">⚠ Numéro non enregistré</div>
          </div>

          {/* Options */}
          <div className="px-8 py-4 grid grid-cols-3 gap-6 text-center">
            {[
              { icon: <VolumeX size={20} />, label: 'Sourdine' },
              { icon: <Code size={20} />, label: 'Clavier' },
              { icon: <Volume2 size={20} />, label: 'Haut-parleur' },
            ].map((btn, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <span className="text-white">{btn.icon}</span>
                </div>
                <span className="text-white text-xs opacity-70">{btn.label}</span>
              </div>
            ))}
          </div>

          {/* Boutons répondre/raccrocher */}
          <div className="px-8 py-8 flex justify-between items-center">
            <div className="flex flex-col items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setCallPhase('declined')}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#ff3b30' }}>
                <PhoneOff size={26} className="text-white" />
              </motion.button>
              <span className="text-white text-xs opacity-70">Refuser</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                onClick={() => setCallPhase('active')}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#34c759' }}>
                <Phone size={26} className="text-white" />
              </motion.button>
              <span className="text-white text-xs opacity-70">Accepter</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (callPhase === 'declined') {
    return (
      <div className="w-full max-w-xs mx-auto">
        <div className="p-8 text-center" style={{ background: 'linear-gradient(180deg, #1c1c2e 0%, #2d2d44 100%)' }}>
          <PhoneOff size={40} className="text-red-400 mx-auto mb-4" />
          <div className="text-white font-medium mb-2">Appel refusé</div>
          <div className="text-gray-400 text-sm mb-6">Vous avez raccroché. Bonne décision ?</div>
          <button onClick={() => setCallPhase('ringing')} className="text-blue-400 text-sm">Réécouter l'appel</button>
        </div>
      </div>
    );
  }

  // Appel actif — transcript
  return (
    <div className="w-full max-w-xs mx-auto" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div className="overflow-hidden" style={{ background: 'linear-gradient(180deg, #1c1c2e 0%, #2d2d44 100%)', minHeight: 480 }}>
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="text-green-400 text-sm mb-1 font-medium">{formatTime(callTime)}</div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Phone size={26} className="text-white" />
          </div>
          <div className="text-white text-xl font-light">{visual.from}</div>
          <div className="text-gray-400 text-xs mt-1">En communication</div>
        </div>

        {/* Transcript en temps réel */}
        <div className="mx-4 mb-4 bg-black bg-opacity-30 p-4 overflow-y-auto" style={{ minHeight: 160, maxHeight: 200 }}>
          <div className="text-green-400 text-xs font-bold uppercase tracking-wider mb-2">Transcription en direct</div>
          {sentences.slice(0, transcriptIndex).map((s, i) => (
            <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="text-gray-200 text-xs mb-1.5 leading-relaxed">
              {s}.
            </motion.p>
          ))}
          {transcriptIndex < sentences.length && (
            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}
              className="flex gap-1 mt-2">
              {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-400" />)}
            </motion.div>
          )}
        </div>

        {/* Contrôles */}
        <div className="px-8 py-4 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: muted ? <Mic size={18} /> : <VolumeX size={18} />, label: muted ? 'Activer' : 'Sourdine', active: muted, action: () => setMuted(!muted) },
            { icon: <Code size={18} />, label: 'Clavier', active: false, action: () => {} },
            { icon: <Volume2 size={18} />, label: 'HP', active: speaker, action: () => setSpeaker(!speaker) },
          ].map((btn, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <button onClick={btn.action}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                style={{ background: btn.active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)', color: btn.active ? '#1c1c2e' : 'white' }}>
                {btn.icon}
              </button>
              <span className="text-white text-xs opacity-70">{btn.label}</span>
            </div>
          ))}
        </div>

        {/* Raccrocher */}
        <div className="flex justify-center py-6">
          <div className="flex flex-col items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCallPhase('declined')}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: '#ff3b30' }}>
              <PhoneOff size={26} className="text-white" />
            </motion.button>
            <span className="text-white text-xs opacity-70">Raccrocher</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACE NAVIGATEUR RÉALISTE (avec inspection, URL suspecte)
// ─────────────────────────────────────────────────────────────────────────────
function BrowserPopupVisual({ visual, onLinkClick }: { visual: ScenarioVisual; onLinkClick: () => void }) {
  const [showInspect, setShowInspect] = useState(false);
  const [closeAttempts, setCloseAttempts] = useState(0);
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);
  const [urlInput, setUrlInput] = useState(visual.linkUrl || 'https://...');

  const isSuspicious = !urlInput.includes('.gouv.fr') && !urlInput.startsWith('https://www.google') && urlInput.length > 10;

  const handleClose = () => {
    setCloseAttempts(c => c + 1);
  };

  return (
    <div className="w-full overflow-hidden border border-gray-300 shadow-lg" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Chrome browser bar */}
      <div className="bg-gray-100 border-b border-gray-300">
        {/* Tabs */}
        <div className="flex items-end px-2 pt-1">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-300 border-b-white text-xs text-gray-700 font-medium max-w-48 truncate -mb-px">
            <Globe size={11} className="text-blue-500 flex-shrink-0" />
            <span className="truncate">{visual.subject || 'Page web'}</span>
            <button onClick={handleClose} className="ml-auto flex-shrink-0 hover:text-gray-900">
              {closeAttempts > 0 ? (
                <motion.span animate={{ x: closeAttempts % 2 === 0 ? 0 : 5 }}>×</motion.span>
              ) : '×'}
            </button>
          </div>
          {closeAttempts > 0 && (
            <div className="ml-2 text-xs text-red-500 mb-1">⚠ La page empêche la fermeture</div>
          )}
        </div>

        {/* Barre d'adresse */}
        <div className="px-3 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <button className="text-gray-400 hover:text-gray-700"><ArrowLeft size={14} /></button>
            <button className="text-gray-400 hover:text-gray-700"><ArrowRight size={14} /></button>
            <button className="text-gray-400 hover:text-gray-700"><RefreshCw size={13} /></button>
          </div>
          <div className={`flex-1 flex items-center gap-2 px-3 py-1.5 border text-xs font-mono ${isSuspicious ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}>
            {isSuspicious ? (
              <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />
            ) : (
              <Lock size={12} className="text-green-600 flex-shrink-0" />
            )}
            <input
              className="flex-1 outline-none bg-transparent text-gray-800"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
            />
            {isSuspicious && <span className="text-red-500 text-xs font-bold flex-shrink-0">⚠</span>}
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={() => setShowInspect(!showInspect)} title="Inspecter"
              className="text-gray-400 hover:text-gray-700 transition-colors">
              <Code size={14} />
            </button>
            <button className="text-gray-400 hover:text-gray-700"><MoreVertical size={14} /></button>
          </div>
        </div>

        {/* Alerte sécurité si suspect */}
        {isSuspicious && (
          <div className="mx-3 mb-2 px-3 py-2 bg-red-50 border border-red-300 flex items-start gap-2">
            <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-700">
              <strong>Ce site pourrait être dangereux.</strong> Le domaine ne correspond pas à une organisation connue.
            </div>
          </div>
        )}
      </div>

      {/* Contenu de la page */}
      <div className="bg-white p-6 min-h-48">
        {visual.subject && <h3 className="text-lg font-bold text-gray-900 mb-3">{visual.subject}</h3>}
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-5">{visual.body}</div>
        {visual.hasClickableLink && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLinkClick}
            onMouseEnter={() => setHoveredUrl(visual.linkUrl || '')}
            onMouseLeave={() => setHoveredUrl(null)}
            className="px-6 py-2.5 text-white text-sm font-bold"
            style={{ background: PINK }}>
            {visual.linkLabel || 'Continuer'}
          </motion.button>
        )}
      </div>

      {/* Panneau d'inspection */}
      <AnimatePresence>
        {showInspect && (
          <motion.div initial={{ height: 0 }} animate={{ height: 200 }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-gray-300 bg-gray-900 text-green-400 font-mono text-xs p-3 overflow-y-auto">
            <div className="text-gray-500 mb-2">&lt;!-- Outils développeur — Réseau --&gt;</div>
            <div className="text-yellow-400">GET {urlInput} → 200 OK</div>
            <div className="text-gray-400 mt-1">Host: {urlInput.replace('https://', '').split('/')[0]}</div>
            <div className="text-red-400 mt-1">⚠ Certificate: Self-signed / Not trusted</div>
            <div className="text-red-400">⚠ HSTS: Not present</div>
            <div className="text-gray-400 mt-2">Set-Cookie: session_id=... (httpOnly=false) ← Suspect</div>
            <div className="text-red-400 mt-1">⚠ Scripts: trackInput(), keylogger.js detecté</div>
            <div className="text-gray-500 mt-2">— Cette page collecte vos frappes clavier —</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status bar */}
      <div className="bg-gray-100 border-t border-gray-200 px-3 py-1 flex items-center justify-between">
        <div className="text-xs text-gray-500 flex items-center gap-1">
          {hoveredUrl ? (
            <><Globe size={10} /><span className="font-mono truncate max-w-xs">{hoveredUrl}</span></>
          ) : (
            <span>Prêt</span>
          )}
        </div>
        <button onClick={() => setShowSource(!showSource)} className="text-xs text-gray-400 hover:text-gray-700">
          {showSource ? 'Masquer source' : 'Voir source'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACE RÉSEAU SOCIAL RÉALISTE
// ─────────────────────────────────────────────────────────────────────────────
function SocialPostVisual({ visual, onLinkClick }: { visual: ScenarioVisual; onLinkClick: () => void }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 2000) + 847);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [shared, setShared] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments] = useState([
    { user: 'Marie L.', text: 'Trop bien ! Je participe 🎉', time: '2 min', avatar: 'M' },
    { user: 'Pierre D.', text: 'Pareil, j\'ai cliqué, c\'est trop facile !', time: '5 min', avatar: 'P' },
    { user: 'Sophie M.', text: 'Attention, ça ressemble à une arnaque... 🤔', time: '8 min', avatar: 'S' },
  ]);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(c => liked ? c - 1 : c + 1);
  };

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="w-full bg-white border border-gray-200 shadow-sm" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* En-tête post */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #4267B2, #898F9C)' }}>
          {(visual.from || 'P').charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{visual.from || 'Page'}</span>
            {visual.from?.includes('✓') || visual.from?.includes('Officiel') ? (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle size={10} className="text-white" />
              </div>
            ) : null}
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <span>il y a 42 minutes</span>
            <span>·</span>
            <Globe size={10} />
            <span>Public</span>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-700"><MoreHorizontal size={16} /></button>
      </div>

      {/* Contenu */}
      <div className="px-4 pb-3">
        <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">{visual.body}</div>
        {visual.hasClickableLink && visual.linkLabel && (
          <button onClick={onLinkClick}
            className="mt-3 block w-full border border-gray-200 p-3 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gray-200 flex-shrink-0 flex items-center justify-center">
                <Globe size={20} className="text-gray-400" />
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">{visual.linkUrl?.replace('https://', '').split('/')[0]}</div>
                <div className="text-sm font-medium text-gray-900">{visual.linkLabel}</div>
                <div className="text-xs text-gray-500 truncate">{visual.linkUrl}</div>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Compteurs */}
      <div className="px-4 py-2 border-t border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            {['👍', '❤️', '😮'].map((e, i) => <span key={i} className="text-xs">{e}</span>)}
          </div>
          <span className="hover:underline cursor-pointer ml-1">{likeCount.toLocaleString()}</span>
        </div>
        <div className="flex gap-3">
          <span className="hover:underline cursor-pointer" onClick={() => setShowComments(!showComments)}>
            {comments.length + (commentText ? 1 : 0)} commentaires
          </span>
          <span className="hover:underline cursor-pointer">{shared ? '1 partage ✓' : '0 partage'}</span>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="px-2 py-1 flex justify-around border-b border-gray-100">
        {[
          { icon: <ThumbsUp size={16} fill={liked ? BLUE : 'none'} />, label: 'J\'aime', action: handleLike, active: liked },
          { icon: <MessageCircle size={16} />, label: 'Commenter', action: () => setShowComments(!showComments), active: showComments },
          { icon: <Share2 size={16} />, label: shared ? 'Partagé ✓' : 'Partager', action: handleShare, active: shared },
          { icon: <Bookmark size={16} fill={bookmarked ? BLUE : 'none'} />, label: 'Enregistrer', action: () => setBookmarked(!bookmarked), active: bookmarked },
        ].map((btn, i) => (
          <button key={i} onClick={btn.action}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold hover:bg-gray-100 transition-colors"
            style={{ color: btn.active ? BLUE : '#65676b' }}>
            {btn.icon}{btn.label}
          </button>
        ))}
      </div>

      {/* Commentaires */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="px-4 py-3 space-y-3">
              {comments.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: ['#4267B2', '#898F9C', '#16a34a'][i] }}>
                    {c.avatar}
                  </div>
                  <div>
                    <div className="bg-gray-100 px-3 py-1.5 inline-block">
                      <span className="font-semibold text-xs text-gray-900 mr-1">{c.user}</span>
                      <span className="text-xs text-gray-700">{c.text}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 px-1">
                      {c.time} · <button className="hover:underline">J'aime</button> · <button className="hover:underline">Répondre</button>
                    </div>
                  </div>
                </div>
              ))}
              {/* Saisir un commentaire */}
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: BLUE }}>V</div>
                <div className="flex-1 flex gap-2">
                  <input className="flex-1 bg-gray-100 px-3 py-1.5 text-xs outline-none text-gray-800"
                    placeholder="Écrire un commentaire..." value={commentText} onChange={e => setCommentText(e.target.value)}
                    style={{ borderRadius: 20 }} />
                  {commentText && (
                    <button className="text-blue-500"><Send size={14} /></button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function MonsieurToutLeMonde() {
  const [, setLocation] = useLocation();

  const [assessmentIndex, setAssessmentIndex] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<number[]>([]);
  const [assessmentQuestions, setAssessmentQuestions] = useState<AssessmentQuestion[]>(() => shuffleAndPick(ASSESSMENT_BANK, ASSESSMENT_COUNT));
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [level, setLevel] = useState<Level>('debutant');
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scenarios, setScenarios] = useState<(Scenario | null)[]>(Array(TOTAL_SCENARIOS).fill(null));
  const [loadingNext, setLoadingNext] = useState(false);
  const [usedBankIndices, setUsedBankIndices] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<ScenarioChoice | null>(null);
  const [showRedFlags, setShowRedFlags] = useState(false);

  const currentScenario = scenarios[currentIndex];
  const progress = (phase === 'assessment' || phase === 'level-reveal') ? 0 : ((currentIndex) / TOTAL_SCENARIOS) * 100;
  const levelMeta = LEVEL_META[level];

  const handleOptionSelect = (optionScore: number, optionIndex: number) => {
    setSelectedOption(optionIndex);
    setTimeout(() => {
      const newAnswers = [...assessmentAnswers, optionScore];
      setAssessmentAnswers(newAnswers);
      setSelectedOption(null);
      if (assessmentIndex + 1 < assessmentQuestions.length) {
        setAssessmentIndex(assessmentIndex + 1);
      } else {
        const detectedLevel = computeLevel(newAnswers);
        setLevel(detectedLevel);
        setPhase('level-reveal');
      }
    }, 350);
  };

  const usedBankIndicesRef = useRef<number[]>([]);
  usedBankIndicesRef.current = usedBankIndices;

  const fetchScenario = useCallback(async (index: number, lvl: Level): Promise<Scenario | null> => {
    setLoadingNext(true);
    try {
      const resp = await fetch('/api/cyber/mtm-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioIndex: index, level: lvl, usedIndices: usedBankIndicesRef.current }),
      });
      const data = await resp.json();
      if (data.success && data.scenario) {
        const scenario = data.scenario;
        if (scenario._bankIndex !== undefined) {
          setUsedBankIndices(prev => prev.includes(scenario._bankIndex) ? prev : [...prev, scenario._bankIndex]);
        }
        setScenarios(prev => { const n = [...prev]; n[index] = scenario; return n; });
        return scenario;
      }
      return null;
    } catch { return null; }
    finally { setLoadingNext(false); }
  }, []);

  const startScenarios = async (lvl: Level) => {
    setPhase('loading');
    const s = await fetchScenario(0, lvl);
    setPhase(s ? 'scenario' : 'error');
    if (s && TOTAL_SCENARIOS > 1) fetchScenario(1, lvl);
  };

  const handleLinkClick = () => {
    if (!currentScenario) return;
    setPhase('trap-clicked');
    setScore(s => s - 5);
    setWrongCount(w => w + 1);
  };

  const handleChoice = (choice: ScenarioChoice) => {
    if (phase !== 'scenario') return;
    setSelectedChoice(choice);
    setPhase('answered');
    setScore(s => s + choice.points);
    if (!choice.isCorrect) setWrongCount(w => w + 1);
  };

  const handleNextScenario = async () => {
    const next = currentIndex + 1;
    if (next >= TOTAL_SCENARIOS) { setPhase('final'); return; }
    setSelectedChoice(null);
    setShowRedFlags(false);
    setCurrentIndex(next);
    if (!scenarios[next]) {
      setPhase('loading');
      const loaded = await fetchScenario(next, level);
      setPhase(loaded ? 'scenario' : 'error');
      if (loaded && next + 1 < TOTAL_SCENARIOS && !scenarios[next + 1]) fetchScenario(next + 1, level);
    } else {
      setPhase('scenario');
    }
  };

  const handleRestart = () => {
    setPhase('intro');
    setAssessmentIndex(0);
    setAssessmentAnswers([]);
    setAssessmentQuestions(shuffleAndPick(ASSESSMENT_BANK, ASSESSMENT_COUNT));
    setSelectedOption(null);
    setLevel('debutant');
    setCurrentIndex(0);
    setScenarios(Array(TOTAL_SCENARIOS).fill(null));
    setUsedBankIndices([]);
    setScore(0);
    setWrongCount(0);
    setSelectedChoice(null);
    setShowRedFlags(false);
  };

  const badge = getBadge(score);

  const renderVisual = (s: Scenario) => {
    const t = s.visual?.type;
    if (t === 'sms') return <SmsVisual visual={s.visual} onLinkClick={handleLinkClick} />;
    if (t === 'phone-call') return <PhoneCallVisual visual={s.visual} />;
    if (t === 'browser-popup') return <BrowserPopupVisual visual={s.visual} onLinkClick={handleLinkClick} />;
    if (t === 'social-post') return <SocialPostVisual visual={s.visual} onLinkClick={handleLinkClick} />;
    return <EmailVisual visual={s.visual} onLinkClick={handleLinkClick} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ color: DARK }}>
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="h-0.5 w-full bg-gray-100">
          <div className="h-full transition-all duration-700" style={{ width: `${progress}%`, background: PINK }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation('/cyber/roleplay')} className="hover:opacity-60 transition-opacity">
              <ArrowLeft size={18} style={{ color: BLUE }} />
            </button>
            <img src={mcLogoPath} alt="mc2i" className="h-7 w-auto" />
            <div className="h-4 w-px bg-gray-200" />
            <span className="font-bold text-sm" style={{ color: BLUE }}>FYNE</span>
            <div className="h-4 w-px bg-gray-200 hidden sm:block" />
            <span className="text-sm text-gray-500 font-medium hidden sm:block">Monsieur Tout le Monde</span>
          </div>
          <div className="flex items-center gap-3">
            {(phase === 'scenario' || phase === 'answered' || phase === 'reflexe' || phase === 'trap-clicked') && (
              <>
                <div className="px-2 py-0.5 text-xs font-bold" style={{ background: levelMeta.bg, color: levelMeta.color }}>
                  {levelMeta.label}
                </div>
                <span className="text-xs text-gray-400">{currentIndex + 1}/{TOTAL_SCENARIOS}</span>
                <span className="text-sm font-bold" style={{ color: score >= 0 ? BLUE : PINK }}>
                  {score > 0 ? '+' : ''}{score} pts
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-14">
        <AnimatePresence mode="wait">

          {/* ═══ INTRO ═══════════════════════════════════════════════════════ */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="min-h-screen flex flex-col lg:flex-row">
              <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-16">
                <div className="max-w-xl">
                  <div className="text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 inline-block" style={{ background: `${BLUE}12`, color: BLUE }}>
                    Formation Cybersécurité · Grand Public
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-none">
                    <span style={{ color: PINK }}>Je suis</span><br />
                    <span style={{ color: DARK }}>Monsieur</span><br />
                    <span style={{ color: BLUE }}>Tout le Monde</span>
                  </h1>
                  <div className="w-16 h-1 mb-7" style={{ background: PINK }} />
                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    5 questions pour détecter votre niveau, puis 10 scénarios <strong>100% interactifs</strong> : cliquez sur les liens, répondez aux SMS, décrochez le téléphone, inspectez les emails...
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-10">
                    {[
                      { icon: <Mail size={16} />, label: 'Emails interactifs', sub: 'Inspecter les en-têtes' },
                      { icon: <MessageSquare size={16} />, label: 'SMS réalistes', sub: 'iPhone Messages' },
                      { icon: <Phone size={16} />, label: 'Appels à décrocher', sub: 'Transcription en direct' },
                      { icon: <Monitor size={16} />, label: 'Navigateur simulé', sub: 'Inspecter les URLs' },
                    ].map((item, i) => (
                      <div key={i} className="border border-gray-100 p-3 bg-gray-50 flex items-start gap-2">
                        <div className="mt-0.5 flex-shrink-0" style={{ color: BLUE }}>{item.icon}</div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setPhase('assessment')} className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity" style={{ background: BLUE }}>
                    Évaluer mon niveau <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <div className="hidden lg:flex w-72 border-l border-gray-100 flex-col justify-center px-8 py-16" style={{ background: '#fafafa' }}>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Ce que vous pouvez faire</div>
                <div className="space-y-2">
                  {['Survoler un lien pour voir sa vraie URL', 'Inspecter les en-têtes email suspects', 'Décrocher ou refuser un appel', 'Analyser le code source d\'une page', 'Lire la transcription d\'un appel', 'Répondre à un SMS (et voir l\'impact)', 'Inspecter les éléments du navigateur', 'Liker, commenter un post social', 'Voir les signaux d\'alerte en temps réel', 'Tester vos réflexes face aux arnaques'].map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: i % 2 === 0 ? PINK : BLUE }} />
                      <span className="text-xs text-gray-600">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ ÉVALUATION ══════════════════════════════════════════════════ */}
          {phase === 'assessment' && (() => {
            const currentQ = assessmentQuestions[assessmentIndex];
            const isInteractive = currentQ?.type === 'interactive';
            return (
              <motion.div key={`assess-${assessmentIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
                className="min-h-screen flex flex-col">
                <div className="border-b border-gray-100 px-8 py-4 flex items-center gap-4">
                  <span className="text-xs text-gray-400 font-medium">Évaluation</span>
                  <div className="flex-1 flex items-center gap-1.5">
                    {assessmentQuestions.map((_, i) => (
                      <div key={i} className="h-1.5 flex-1 transition-all duration-300"
                        style={{ background: i < assessmentIndex ? BLUE : i === assessmentIndex ? `${BLUE}50` : '#e5e7eb' }} />
                    ))}
                  </div>
                  <span className="text-xs font-bold" style={{ color: BLUE }}>{assessmentIndex + 1} / {assessmentQuestions.length}</span>
                </div>
                <div className={`flex-1 flex flex-col ${isInteractive ? '' : 'justify-center'} px-6 lg:px-12 py-8`}>
                  <div className={`${isInteractive ? 'max-w-2xl mx-auto w-full' : 'max-w-2xl'}`}>
                    {currentQ?.context && (
                      <div className="text-sm text-gray-500 mb-4 px-4 py-2 border-l-2" style={{ borderColor: BLUE }}>
                        {currentQ.context}
                      </div>
                    )}
                    <h2 className={`font-black text-gray-900 leading-tight ${isInteractive ? 'text-xl lg:text-2xl mb-5' : 'text-2xl lg:text-3xl mb-8'}`}>
                      {currentQ?.question}
                    </h2>

                    {isInteractive && currentQ?.visual ? (
                      currentQ.visual.type === 'email' ? (
                        <AssessmentEmailSandbox
                          visual={currentQ.visual}
                          onAction={(score, idx) => handleOptionSelect(score, idx)}
                        />
                      ) : (
                        <AssessmentSmsSandbox
                          visual={currentQ.visual}
                          onAction={(score, idx) => handleOptionSelect(score, idx)}
                        />
                      )
                    ) : (
                      <div className="space-y-3">
                        {currentQ?.options.map((opt, i) => (
                          <motion.button key={i} onClick={() => handleOptionSelect(opt.score, i)} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                            className="w-full text-left border px-5 py-4 transition-all flex items-start gap-4"
                            style={{ borderColor: selectedOption === i ? BLUE : '#e5e7eb', background: selectedOption === i ? `${BLUE}08` : 'white' }}>
                            <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold border transition-colors"
                              style={{ borderColor: selectedOption === i ? BLUE : '#d1d5db', color: selectedOption === i ? BLUE : '#6b7280' }}>
                              {String.fromCharCode(65 + i)}
                            </span>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{opt.label}</div>
                              {opt.sublabel && <div className="text-xs text-gray-500 mt-0.5">{opt.sublabel}</div>}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* ═══ NIVEAU RÉVÉLÉ ════════════════════════════════════════════════ */}
          {phase === 'level-reveal' && (
            <motion.div key="level-reveal" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-8">
              <div className="max-w-lg w-full text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: BLUE }}>Évaluation terminée</div>
                  <h2 className="text-4xl font-black mb-3" style={{ color: DARK }}>Niveau</h2>
                  <h1 className="text-6xl font-black mb-6" style={{ color: levelMeta.color }}>{levelMeta.label}</h1>
                  <div className="w-16 h-1 mx-auto mb-6" style={{ background: levelMeta.color }} />
                  <p className="text-gray-600 mb-10 leading-relaxed">{levelMeta.desc}</p>
                  <button onClick={() => startScenarios(level)}
                    className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity"
                    style={{ background: levelMeta.color }}>
                    Démarrer les scénarios <ArrowRight size={18} />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ═══ CHARGEMENT ══════════════════════════════════════════════════ */}
          {phase === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center">
              <Loader2 size={32} className="animate-spin mb-4" style={{ color: BLUE }} />
              <p className="text-gray-600 font-medium">Sélection du scénario…</p>
              <p className="text-xs text-gray-400 mt-1">Niveau <span className="font-bold" style={{ color: levelMeta.color }}>{levelMeta.label}</span></p>
            </motion.div>
          )}

          {/* ═══ ERREUR ══════════════════════════════════════════════════════ */}
          {phase === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-8">
              <div className="max-w-md w-full text-center">
                <AlertTriangle size={28} className="mx-auto mb-4" style={{ color: PINK }} />
                <h2 className="text-2xl font-black mb-3">Scénario indisponible</h2>
                <p className="text-gray-600 mb-8">Impossible de charger le scénario.</p>
                <button onClick={() => startScenarios(level)} className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold" style={{ background: BLUE }}>
                  <RefreshCw size={15} /> Réessayer
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ SCÉNARIO ════════════════════════════════════════════════════ */}
          {phase === 'scenario' && currentScenario && (
            <motion.div key={`sc-${currentIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="min-h-screen flex flex-col lg:flex-row">

              {/* Colonne visuelle */}
              <div className="flex-1 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 text-white" style={{ background: PINK }}>
                      {currentIndex + 1}/{TOTAL_SCENARIOS}
                    </div>
                    <div className="text-xs px-2 py-0.5 font-medium" style={{ background: levelMeta.bg, color: levelMeta.color }}>
                      {levelMeta.label}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      {currentScenario.redFlags && (
                        <button onClick={() => setShowRedFlags(!showRedFlags)}
                          className="text-xs flex items-center gap-1 font-medium hover:opacity-70 transition-opacity"
                          style={{ color: showRedFlags ? PINK : '#9ca3af' }}>
                          <Eye size={11} />{showRedFlags ? 'Masquer indices' : 'Indices 💡'}
                        </button>
                      )}
                    </div>
                  </div>
                  <h2 className="text-lg font-black text-gray-900">{currentScenario.title}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{currentScenario.context}</p>
                </div>

                {/* Red flags tooltip */}
                <AnimatePresence>
                  {showRedFlags && currentScenario.redFlags && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-b border-red-100 bg-red-50 px-6 py-3">
                      <div className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">Signaux suspects</div>
                      <ul className="space-y-1">
                        {currentScenario.redFlags.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-red-600">
                            <XCircle size={11} className="mt-0.5 flex-shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                  {renderVisual(currentScenario)}
                </div>
              </div>

              {/* Colonne choix */}
              <div className="w-full lg:w-80 flex flex-col bg-gray-50">
                <div className="px-5 py-4 border-b border-gray-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Que faites-vous ?</div>
                  <div className="text-xs text-gray-400 mt-1">Interagissez avec la simulation ou choisissez une action</div>
                </div>
                <div className="flex-1 px-5 py-4 flex flex-col gap-3">
                  {currentScenario.choices.map((c, i) => (
                    <motion.button key={i} onClick={() => handleChoice(c)} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                      className="w-full text-left border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-800 hover:border-gray-400 hover:shadow-sm transition-all flex items-start gap-3">
                      <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-xs font-bold border border-gray-300 mt-0.5" style={{ color: BLUE }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {c.label}
                    </motion.button>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-gray-200 bg-white">
                  <div className="text-xs text-gray-400">Score : <span className="font-bold" style={{ color: score >= 0 ? BLUE : PINK }}>{score} pts</span></div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ FEEDBACK UNIFIÉ (réponse + pédagogie + suivant) ═════════════ */}
          {(phase === 'answered' || phase === 'trap-clicked' || phase === 'reflexe') && currentScenario && (() => {
            const enrich = getEnrichment(currentScenario.category);
            const isTrap = phase === 'trap-clicked';
            const correct = !isTrap && selectedChoice?.isCorrect;
            const verdictTitle = isTrap
              ? 'Vous avez cliqué sur le piège'
              : correct ? 'Bon réflexe' : 'Ce n\'était pas le bon choix';
            const verdictSub = isTrap
              ? (currentScenario.clickConsequence || 'Ce lien aurait conduit à une page malveillante.')
              : (selectedChoice?.feedback ?? '');
            const pts = isTrap ? -5 : (selectedChoice?.points ?? 0);
            const borderColor = (isTrap || !correct) ? 'border-red-500' : 'border-green-500';
            const bgColor = (isTrap || !correct) ? 'bg-red-50' : 'bg-green-50';
            const textColor = (isTrap || !correct) ? 'text-red-700' : 'text-green-700';
            const subColor = (isTrap || !correct) ? 'text-red-600' : 'text-green-600';
            const ptsColor = (isTrap || !correct) ? 'text-red-600' : 'text-green-600';
            const Icon = (isTrap || !correct) ? XCircle : CheckCircle;
            const iconClass = (isTrap || !correct) ? 'text-red-500' : 'text-green-600';

            return (
              <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="h-screen flex flex-col" style={{ background: '#fafafa' }}>

                {/* ── BANDEAU VERDICT + BOUTON SUIVANT ── */}
                <div className={`border-l-4 ${borderColor} ${bgColor} px-5 py-3 flex items-center gap-3 flex-shrink-0`}>
                  <Icon size={20} className={`${iconClass} flex-shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-black ${textColor}`}>{verdictTitle}</div>
                    <div className={`text-xs leading-snug ${subColor} truncate`}>{verdictSub}</div>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 mr-4 ${ptsColor}`}>
                    {pts > 0 ? '+' : ''}{pts} pts
                  </span>
                  <button
                    onClick={handleNextScenario}
                    disabled={loadingNext}
                    className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                    style={{ background: BLUE }}>
                    {loadingNext
                      ? <><Loader2 size={14} className="animate-spin" />Chargement…</>
                      : currentIndex + 1 >= TOTAL_SCENARIOS
                        ? <><Trophy size={14} />Voir mon bilan</>
                        : <>Scénario suivant <ArrowRight size={14} /></>}
                  </button>
                </div>

                {/* ── SECTION "À RETENIR" + RÉFLEXE ── */}
                <div className="px-5 py-3 border-b border-gray-200 flex-shrink-0" style={{ background: `${BLUE}06` }}>
                  <div className="flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: BLUE }}>À retenir</div>
                      <p className="text-xs font-semibold text-gray-600 leading-snug">{enrich.resumeCle}</p>
                    </div>
                    <div className="flex-1 min-w-0 border-l border-gray-200 pl-4">
                      <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: BLUE }}>Ce scénario</div>
                      <p className="text-xs font-bold text-gray-900 leading-snug">{currentScenario.reflexe}</p>
                    </div>
                  </div>
                </div>

                {/* ── GRILLE PRINCIPALE ── */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-0">

                  {/* Les bons réflexes */}
                  <div className="flex flex-col border-r border-gray-200 min-h-0">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 flex-shrink-0" style={{ background: '#f0f9ff' }}>
                      <Shield size={12} style={{ color: BLUE }} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: BLUE }}>Les bons réflexes</span>
                    </div>
                    <div className="flex-1 px-4 py-3 space-y-2 overflow-y-auto">
                      {enrich.bonnesPratiques.map((p, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle size={11} className="text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-700 leading-snug">{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Le saviez-vous ? */}
                  <div className="flex flex-col border-r border-gray-200 min-h-0">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 flex-shrink-0" style={{ background: '#fff7ed' }}>
                      <AlertTriangle size={12} style={{ color: '#d97706' }} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#d97706' }}>Le saviez-vous ?</span>
                    </div>
                    <div className="flex-1 px-4 py-3 space-y-3 overflow-y-auto">
                      {enrich.faitsHistoriques.map((f, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ background: '#d97706' }}>{i + 1}</div>
                          <span className="text-xs text-gray-700 leading-snug">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Signaux d'alerte */}
                  <div className="flex flex-col min-h-0">
                    <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-2 flex-shrink-0" style={{ background: '#fff1f2' }}>
                      <Flag size={12} style={{ color: PINK }} />
                      <span className="text-xs font-bold uppercase tracking-wider" style={{ color: PINK }}>Signaux d'alerte</span>
                    </div>
                    <div className="flex-1 px-4 py-3 space-y-2 overflow-y-auto">
                      {currentScenario.redFlags?.map((f, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <AlertTriangle size={11} className="flex-shrink-0 mt-0.5" style={{ color: PINK }} />
                          <span className="text-xs text-gray-700 leading-snug">{f}</span>
                        </div>
                      )) ?? (
                        <span className="text-xs text-gray-400 italic">Aucun signal spécifique pour ce scénario</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}

          {/* ═══ BILAN FINAL ══════════════════════════════════════════════════ */}
          {phase === 'final' && (
            <motion.div key="final" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col">
              <div className="px-8 lg:px-14 py-14 border-b border-gray-100" style={{ background: '#fafafa' }}>
                <div className="max-w-3xl mx-auto text-center">
                  <div className="text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 inline-block text-white" style={{ background: BLUE }}>
                    Formation complète · Niveau {levelMeta.label}
                  </div>
                  <h1 className="text-5xl font-black tracking-tight mb-4">Votre bilan cyber</h1>
                  <div className="w-16 h-1 mx-auto mb-8" style={{ background: PINK }} />
                  <div className="flex flex-col items-center gap-5">
                    <div className="flex items-end gap-2">
                      <span className="text-8xl font-black" style={{ color: score >= 0 ? BLUE : PINK }}>{score}</span>
                      <span className="text-2xl text-gray-400 mb-4">/ {MAX_SCORE}</span>
                    </div>
                    <div className="px-8 py-3 border-2 inline-flex items-center gap-3"
                      style={{ borderColor: badge.border, background: badge.bg, color: badge.color }}>
                      {badge.label === 'Sécurisé' ? <Shield size={20} /> : badge.label === 'Prudent' ? <AlertTriangle size={20} /> : <XCircle size={20} />}
                      <span className="text-xl font-black uppercase tracking-wider">{badge.label}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-1 px-8 lg:px-14 py-12">
                <div className="max-w-3xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Résultats</div>
                      {[
                        { label: 'Niveau évalué', value: levelMeta.label, icon: levelMeta.icon },
                        { label: 'Bons réflexes', value: `${TOTAL_SCENARIOS - wrongCount} / ${TOTAL_SCENARIOS}`, icon: <CheckCircle size={15} className="text-green-500" /> },
                        { label: 'Erreurs', value: `${wrongCount}`, icon: <XCircle size={15} style={{ color: PINK }} /> },
                        { label: 'Score final', value: `${score} pts`, icon: <Trophy size={15} style={{ color: BLUE }} /> },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between border-b border-gray-100 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700">{s.icon}{s.label}</div>
                          <span className="font-bold text-sm text-gray-900">{s.value}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Actions prioritaires</div>
                      <ul className="space-y-3">
                        {[
                          'Activer la double authentification sur tous vos comptes',
                          'Utiliser un gestionnaire de mots de passe',
                          'Ne jamais cliquer sur un lien reçu par email ou SMS',
                          'Vérifier l\'expéditeur avant de répondre à tout message urgent',
                          'Signaler les emails suspects à signal-spam.fr',
                        ].slice(0, 5).map((a, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <ChevronRight size={13} className="mt-0.5 flex-shrink-0" style={{ color: BLUE }} />{a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={handleRestart}
                      className="inline-flex items-center gap-2 px-6 py-3 border-2 font-bold text-sm hover:opacity-70 transition-opacity"
                      style={{ borderColor: BLUE, color: BLUE }}>
                      <RefreshCw size={14} />Recommencer
                    </button>
                    <button onClick={() => setLocation('/cyber/roleplay')}
                      className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm hover:opacity-90 transition-opacity"
                      style={{ background: BLUE }}>
                      Retour au menu <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={mcLogoPath} alt="mc2i" className="h-6 w-auto" />
                  <div className="h-4 w-px bg-gray-200" />
                  <span className="text-sm font-bold" style={{ color: BLUE }}>FYNE</span>
                </div>
                <span className="text-xs text-gray-400">© {new Date().getFullYear()} FYNE by mc2i</span>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
