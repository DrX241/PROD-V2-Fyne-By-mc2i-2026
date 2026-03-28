import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, ArrowRight, Shield, AlertTriangle, Lock, Smartphone,
  Brain, CheckCircle, XCircle, Star, Trophy, RefreshCw, ChevronRight,
  Mail, Phone, Globe, Wifi, Key, Eye, Download, Share2, Bell, Clock
} from "lucide-react";

// ──────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────
type Choice = {
  id: string;
  label: string;
  isCorrect: boolean;
  feedback: string;
  pointsDelta: number;
};

type Scenario = {
  id: string;
  title: string;
  situation: string;
  visual: React.ReactNode;
  choices: Choice[];
  reflexe: string;
};

type Block = {
  id: string;
  number: number;
  title: string;
  emoji: string;
  color: string;
  borderColor: string;
  bgGradient: string;
  icon: React.ReactNode;
  scenarios: Scenario[];
};

type ScreenMode =
  | { type: 'hub' }
  | { type: 'scenario'; blockId: string; scenarioIndex: number }
  | { type: 'consequence'; blockId: string; scenarioIndex: number; choiceId: string }
  | { type: 'block-result'; blockId: string }
  | { type: 'final-result' };

// ──────────────────────────────────────────────
// DATA
// ──────────────────────────────────────────────
const BLOCKS: Block[] = [
  {
    id: 'dangers',
    number: 1,
    title: 'Reconnaître les dangers',
    emoji: '🔓',
    color: 'text-red-400',
    borderColor: 'border-red-500/40',
    bgGradient: 'from-red-950/60 to-slate-900',
    icon: <AlertTriangle className="h-8 w-8 text-red-400" />,
    scenarios: [
      {
        id: 'phishing-email',
        title: 'L\'email de ta banque',
        situation: 'Tu reçois cet email ce matin :\n\n📧 De : securite-clients@credi-agriicole.fr\nObjet : ⚠️ URGENT – Votre compte sera bloqué dans 24h\n\n"Cher client, une activité suspecte a été détectée sur votre compte. Pour éviter le blocage immédiat, veuillez confirmer vos identifiants en cliquant ci-dessous."\n\n→ [Confirmer mon compte maintenant]',
        visual: <Mail className="h-16 w-16 text-red-300 opacity-80" />,
        choices: [
          {
            id: 'click',
            label: '🖱️ Je clique sur le lien pour vérifier',
            isCorrect: false,
            feedback: 'Tu t\'es fait avoir ! L\'adresse "@credi-agriicole.fr" est fausse (deux "i" dans agricole). Les banques ne demandent JAMAIS vos identifiants par email. En cliquant, tu aurais transmis ton mot de passe à des hackers.',
            pointsDelta: -5
          },
          {
            id: 'ignore',
            label: '🗑️ Je supprime sans cliquer',
            isCorrect: true,
            feedback: 'Bien joué ! Tu as eu le bon réflexe. Quand un email crée de l\'urgence et demande des infos perso, c\'est presque toujours une arnaque. On appelle ça le phishing.',
            pointsDelta: 10
          },
          {
            id: 'verify',
            label: '📞 J\'appelle ma banque pour vérifier',
            isCorrect: true,
            feedback: 'Excellent ! Vérifier directement auprès de ta banque est la meilleure réaction. Tu n\'as jamais cliqué sur le lien suspect et tu as confirmé auprès de la source officielle.',
            pointsDelta: 10
          }
        ],
        reflexe: '⚡ Si c\'est urgent + demande d\'infos perso = DANGER. Vérifie toujours via le site officiel ou en appelant.'
      },
      {
        id: 'sms-colis',
        title: 'Le SMS du colis',
        situation: 'Tu reçois ce SMS sur ton téléphone :\n\n📱 "Votre colis N°FR8472 est en attente de livraison. Des frais de douane de 2,99€ sont requis. Payez maintenant ici : bit.ly/colisexpress24"\n\nTu attendais effectivement une commande Amazon...',
        visual: <Phone className="h-16 w-16 text-orange-300 opacity-80" />,
        choices: [
          {
            id: 'pay',
            label: '💳 Je paie les 2,99€ pour récupérer mon colis',
            isCorrect: false,
            feedback: 'Attention ! Ce SMS est une arnaque. Le lien "bit.ly" masque un faux site qui va voler ton numéro de carte bancaire. 2,99€ semble peu, mais les hackers récupèrent tes données pour des achats bien plus importants.',
            pointsDelta: -5
          },
          {
            id: 'check-amazon',
            label: '📦 Je vérifie directement sur l\'app Amazon',
            isCorrect: true,
            feedback: 'Parfait ! Toujours vérifier l\'état de ta commande directement sur le site officiel, jamais via un lien reçu par SMS. Amazon ne demande jamais de paiement supplémentaire par SMS.',
            pointsDelta: 10
          },
          {
            id: 'ignore-sms',
            label: '🚫 Je ne fais rien et supprime le SMS',
            isCorrect: true,
            feedback: 'Bon réflexe ! Les vrais services de livraison ne demandent pas d\'argent par SMS via des liens raccourcis. Si tu attendais un colis, vérifie sur l\'app officielle.',
            pointsDelta: 10
          }
        ],
        reflexe: '⚡ Jamais de paiement via un lien dans un SMS. Toujours aller directement sur le site officiel.'
      },
      {
        id: 'appel-microsoft',
        title: 'L\'appel du technicien',
        situation: 'Ton téléphone sonne. Un homme avec un accent étranger :\n\n📞 "Bonjour, je vous appelle de la part de Microsoft. Nos serveurs ont détecté un virus grave sur votre ordinateur. Si vous ne nous donnez pas l\'accès maintenant, vos données seront perdues définitivement. Je dois vous guider pour l\'installer de suite."',
        visual: <Globe className="h-16 w-16 text-yellow-300 opacity-80" />,
        choices: [
          {
            id: 'give-access',
            label: '💻 Je lui donne l\'accès à distance pour qu\'il répare',
            isCorrect: false,
            feedback: 'Très dangereux ! Microsoft ne vous appelle JAMAIS de manière non sollicitée. En donnant l\'accès, le "technicien" aurait installé un vrai virus, volé vos mots de passe et potentiellement demandé de l\'argent.',
            pointsDelta: -5
          },
          {
            id: 'hang-up',
            label: '📵 Je raccroche immédiatement',
            isCorrect: true,
            feedback: 'Parfait ! C\'est une arnaque connue appelée "vishing" (phishing vocal). Microsoft, Apple, Google ne vous appellent JAMAIS à froid pour des problèmes informatiques.',
            pointsDelta: 10
          },
          {
            id: 'ask-callback',
            label: '🔁 Je demande un numéro de rappel officiel',
            isCorrect: false,
            feedback: 'Prudent, mais risqué. Le faux technicien vous donnera un faux numéro officiel. La seule bonne action est de raccrocher directement. Si vous avez un doute, appelez le support officiel depuis le site web de Microsoft.',
            pointsDelta: -5
          }
        ],
        reflexe: '⚡ Microsoft, Apple ou votre banque ne vous appellent JAMAIS à l\'improviste. Raccrochez sans hésiter.'
      }
    ]
  },
  {
    id: 'comptes',
    number: 2,
    title: 'Sécuriser ses comptes',
    emoji: '🔐',
    color: 'text-blue-400',
    borderColor: 'border-blue-500/40',
    bgGradient: 'from-blue-950/60 to-slate-900',
    icon: <Lock className="h-8 w-8 text-blue-400" />,
    scenarios: [
      {
        id: 'meme-mdp',
        title: 'Le même mot de passe partout',
        situation: 'Tu utilises "Soleil2024!" comme mot de passe pour : Gmail, Facebook, Amazon et ta banque.\n\nTu reçois cette notification :\n\n🚨 "Alerte sécurité : vos données ont été compromises lors d\'une fuite chez LinkedIn. Votre email et mot de passe sont peut-être exposés."',
        visual: <Key className="h-16 w-16 text-blue-300 opacity-80" />,
        choices: [
          {
            id: 'nothing',
            label: '😌 Ce n\'est que LinkedIn, mes autres comptes sont séparés',
            isCorrect: false,
            feedback: 'FAUX ! Tu utilises le même mot de passe. Les hackers vont tester immédiatement "Soleil2024!" sur Gmail, Facebook, Amazon et ta banque. C\'est ce qu\'on appelle le "credential stuffing".',
            pointsDelta: -5
          },
          {
            id: 'change-all',
            label: '🔑 Je change immédiatement tous mes mots de passe',
            isCorrect: true,
            feedback: 'Excellent réflexe ! Et pour ne plus jamais avoir ce problème, utilise un mot de passe unique et différent pour chaque compte. Un gestionnaire de mots de passe comme Bitwarden peut t\'aider.',
            pointsDelta: 10
          },
          {
            id: 'change-bank',
            label: '🏦 Je change seulement le mot de passe de ma banque',
            isCorrect: false,
            feedback: 'Bonne intuition mais insuffisant. Tous tes comptes qui utilisent le même mot de passe sont en danger. Change-les tous, en commençant par Gmail (qui donne accès à la récupération des autres comptes).',
            pointsDelta: -5
          }
        ],
        reflexe: '⚡ Un compte = un mot de passe unique. Utilise un gestionnaire de mots de passe.'
      },
      {
        id: '2fa',
        title: 'La double authentification',
        situation: 'Tu veux activer la double authentification (2FA) sur ton compte Google.\n\nGoogle te propose 3 options :\n• Recevoir un SMS avec un code\n• Utiliser une app d\'authentification (Google Authenticator)\n• Utiliser une clé physique USB\n\nQuelle option choisis-tu ?',
        visual: <Smartphone className="h-16 w-16 text-green-300 opacity-80" />,
        choices: [
          {
            id: 'no-2fa',
            label: '❌ Je ne l\'active pas, c\'est trop compliqué',
            isCorrect: false,
            feedback: 'Erreur ! La 2FA protège ton compte même si ton mot de passe est volé. Sans elle, un hacker avec ton mot de passe a accès direct à tout. L\'activer prend 2 minutes.',
            pointsDelta: -5
          },
          {
            id: 'sms-2fa',
            label: '📱 SMS avec un code',
            isCorrect: true,
            feedback: 'C\'est bien mieux que rien ! Le SMS est le minimum recommandé. Sache que l\'app d\'authentification est encore plus sécurisée car les SMS peuvent être interceptés (attaque SIM swap).',
            pointsDelta: 7
          },
          {
            id: 'app-2fa',
            label: '🔐 App d\'authentification',
            isCorrect: true,
            feedback: 'Excellent choix ! L\'app d\'authentification (Authy, Google Authenticator) génère des codes temporaires sur ton téléphone, sans passer par le réseau mobile. C\'est le meilleur compromis sécurité/praticité.',
            pointsDelta: 10
          }
        ],
        reflexe: '⚡ Active toujours la double authentification. C\'est ton filet de sécurité si ton mot de passe est volé.'
      },
      {
        id: 'ami-pc',
        title: 'L\'ordinateur d\'un ami',
        situation: 'Tu es chez un ami et tu dois vite consulter ton compte en ligne pour vérifier un virement important.\n\nTon ami te propose son ordinateur.',
        visual: <Eye className="h-16 w-16 text-purple-300 opacity-80" />,
        choices: [
          {
            id: 'login-normal',
            label: '💻 Je me connecte normalement et laisse le navigateur mémoriser le mot de passe',
            isCorrect: false,
            feedback: 'Dangereux ! Ton mot de passe est maintenant enregistré sur l\'ordinateur de quelqu\'un d\'autre. Et si le PC de ton ami est infecté ? Utilise toujours la navigation privée ET déconnecte-toi après.',
            pointsDelta: -5
          },
          {
            id: 'private-mode',
            label: '🕵️ Je me connecte en navigation privée et me déconnecte après',
            isCorrect: true,
            feedback: 'Parfait ! La navigation privée ne sauvegarde pas de mot de passe, d\'historique ni de cookies. Et te déconnecter manuellement assure qu\'aucune session n\'est laissée ouverte.',
            pointsDelta: 10
          },
          {
            id: 'wait',
            label: '⏳ J\'attends de rentrer chez moi pour le faire sur mon propre PC',
            isCorrect: true,
            feedback: 'Très sage ! Si ce n\'est pas urgent, attendre d\'être sur son propre appareil est toujours la meilleure option pour les opérations sensibles.',
            pointsDelta: 10
          }
        ],
        reflexe: '⚡ Sur un ordinateur qui n\'est pas le tien : navigation privée + déconnexion obligatoire.'
      }
    ]
  },
  {
    id: 'appareils',
    number: 3,
    title: 'Protéger ses appareils',
    emoji: '📱',
    color: 'text-green-400',
    borderColor: 'border-green-500/40',
    bgGradient: 'from-green-950/60 to-slate-900',
    icon: <Smartphone className="h-8 w-8 text-green-400" />,
    scenarios: [
      {
        id: 'mise-a-jour',
        title: 'La notification de mise à jour',
        situation: 'Une notification apparaît sur ton écran :\n\n🔔 "iOS 17.3 disponible – Cette mise à jour contient des correctifs de sécurité importants."\n\nTu es en train de regarder une vidéo. La mise à jour prend 15 minutes.',
        visual: <Download className="h-16 w-16 text-green-300 opacity-80" />,
        choices: [
          {
            id: 'postpone-forever',
            label: '⏸️ Je clique "Ignorer" et je le ferai... un jour',
            isCorrect: false,
            feedback: 'Mauvais réflexe ! Chaque jour sans mise à jour, ton appareil reste vulnérable aux failles connues. Les hackers exploitent justement les appareils non mis à jour. C\'est l\'une des façons les plus faciles de se faire pirater.',
            pointsDelta: -5
          },
          {
            id: 'update-now',
            label: '✅ Je mets à jour maintenant',
            isCorrect: true,
            feedback: 'Parfait ! Les mises à jour corrigent des failles de sécurité découvertes. Chaque correction est une porte fermée aux hackers. Active les mises à jour automatiques pour ne jamais oublier.',
            pointsDelta: 10
          },
          {
            id: 'schedule',
            label: '🌙 Je programme la mise à jour pour la nuit',
            isCorrect: true,
            feedback: 'Très bien ! Programmer la mise à jour pendant ton sommeil est une excellente pratique. Tu n\'es pas interrompu et ton appareil est à jour au réveil.',
            pointsDelta: 10
          }
        ],
        reflexe: '⚡ Mettre à jour = se protéger. Active les mises à jour automatiques sur tous tes appareils.'
      },
      {
        id: 'wifi-public',
        title: 'Le WiFi du café',
        situation: 'Tu es dans un café et tu vois ce réseau WiFi disponible :\n📶 "CafeWifi_Gratuit"\n\nTu veux vérifier ton compte bancaire et envoyer des documents de travail confidentiels.',
        visual: <Wifi className="h-16 w-16 text-yellow-300 opacity-80" />,
        choices: [
          {
            id: 'connect-all',
            label: '📲 Je me connecte et je fais tout ce que je voulais faire',
            isCorrect: false,
            feedback: 'Risqué ! Sur un WiFi public non sécurisé, n\'importe qui peut potentiellement intercepter tes données. Évite surtout les opérations bancaires et l\'envoi de documents confidentiels.',
            pointsDelta: -5
          },
          {
            id: 'use-4g',
            label: '📡 J\'utilise mes données mobiles 4G à la place',
            isCorrect: true,
            feedback: 'Excellent choix ! Ton réseau mobile 4G/5G est chiffré par défaut et bien plus sécurisé qu\'un WiFi public. Pour les opérations sensibles, préfère toujours tes données mobiles.',
            pointsDelta: 10
          },
          {
            id: 'connect-light',
            label: '🌐 Je me connecte mais je ne fais que naviguer sur des sites normaux',
            isCorrect: true,
            feedback: 'Acceptable pour la navigation basique. Assure-toi que les sites affichent "https://" (cadenas vert). Évite tout de même de vous connecter à des comptes sensibles sur WiFi public.',
            pointsDelta: 7
          }
        ],
        reflexe: '⚡ WiFi public = zone dangereuse. Utilise tes données mobiles pour tout ce qui est sensible.'
      },
      {
        id: 'piece-jointe',
        title: 'La pièce jointe mystérieuse',
        situation: 'Tu reçois un email d\'une adresse inconnue :\n\n📧 De : facturation@service-compte.net\nObjet : Votre facture du mois\n\n"Veuillez trouver ci-joint votre facture. En cas de non-paiement sous 48h, votre compte sera suspendu."\n\n📎 Facture_Aout.pdf.exe (2.3 MB)',
        visual: <AlertTriangle className="h-16 w-16 text-red-300 opacity-80" />,
        choices: [
          {
            id: 'open',
            label: '📂 J\'ouvre le fichier pour voir de quelle facture il s\'agit',
            isCorrect: false,
            feedback: '🚨 CATASTROPHE ! ".pdf.exe" est un programme déguisé en PDF. En l\'ouvrant, tu aurais installé un ransomware qui chiffre tous tes fichiers et demande une rançon. Ne jamais ouvrir un ".exe" reçu par email.',
            pointsDelta: -5
          },
          {
            id: 'delete',
            label: '🗑️ Je supprime sans ouvrir',
            isCorrect: true,
            feedback: 'Parfait ! ".pdf.exe" est un signal d\'alarme évident. Un vrai PDF se termine par ".pdf", jamais par ".exe". Tu as évité une infection par ransomware.',
            pointsDelta: 10
          },
          {
            id: 'scan-first',
            label: '🛡️ Je le scanne avec mon antivirus avant d\'ouvrir',
            isCorrect: true,
            feedback: 'Bonne réaction, mais le plus sûr reste de ne pas l\'ouvrir du tout quand tu ne connais pas l\'expéditeur. Les antivirus ne détectent pas 100% des menaces.',
            pointsDelta: 7
          }
        ],
        reflexe: '⚡ Une pièce jointe ".exe" dans un email = virus garanti. Supprime sans ouvrir.'
      }
    ]
  },
  {
    id: 'reflexes',
    number: 4,
    title: 'Les bons réflexes',
    emoji: '🧠',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgGradient: 'from-purple-950/60 to-slate-900',
    icon: <Brain className="h-8 w-8 text-purple-400" />,
    scenarios: [
      {
        id: 'ami-urgent',
        title: 'L\'ami en détresse',
        situation: 'Tu reçois ce message WhatsApp de ton ami Marc :\n\n💬 "Salut, c\'est super urgent. Je suis coincé à l\'étranger, j\'ai perdu mon portefeuille. J\'ai besoin que tu m\'envoies 300€ via Western Union. Je te rembourse dès que je rentre. Tu peux le faire maintenant ?"\n\nTu n\'étais pas au courant qu\'il voyageait...',
        visual: <Bell className="h-16 w-16 text-orange-300 opacity-80" />,
        choices: [
          {
            id: 'send-money',
            label: '💸 Je lui envoie l\'argent, c\'est mon ami',
            isCorrect: false,
            feedback: 'Arnaque ! Le compte WhatsApp de Marc a probablement été piraté. Les hackers envoient ce genre de message à tous ses contacts. Contacte Marc par téléphone pour vérifier avant toute action.',
            pointsDelta: -5
          },
          {
            id: 'call-marc',
            label: '📞 Je l\'appelle directement sur son numéro pour vérifier',
            isCorrect: true,
            feedback: 'Excellent ! Appeler directement confirme en quelques secondes si c\'est vrai ou une arnaque. C\'est le réflexe parfait face à toute demande urgente d\'argent.',
            pointsDelta: 10
          },
          {
            id: 'ask-proof',
            label: '🤔 Je lui pose une question que seul lui peut répondre',
            isCorrect: true,
            feedback: 'Très bonne stratégie ! Poser une question personnelle (nom de son animal, souvenir partagé) démasque les imposteurs. Si c\'est un hacker, il ne pourra pas répondre correctement.',
            pointsDelta: 10
          }
        ],
        reflexe: '⚡ Toujours vérifier via un autre canal avant d\'envoyer de l\'argent, même à un "ami".'
      },
      {
        id: 'popup-gagnant',
        title: 'Tu as gagné !',
        situation: 'En naviguant sur internet, une fenêtre pop-up s\'affiche soudainement :\n\n🎉 "FÉLICITATIONS ! Vous êtes le visiteur N°1 000 000 !\nVous avez gagné un iPhone 15 Pro !\nCliquez vite, il ne reste que 2 minutes !"\n\n⏱️ Un compteur de 1:47 tourne...',
        visual: <Trophy className="h-16 w-16 text-yellow-300 opacity-80" />,
        choices: [
          {
            id: 'click-claim',
            label: '🎁 Je clique pour réclamer mon prix',
            isCorrect: false,
            feedback: 'Piège classique ! Cette pop-up va te demander des informations personnelles ou installer un logiciel malveillant. Le compteur crée une fausse urgence. Tu n\'as rien gagné.',
            pointsDelta: -5
          },
          {
            id: 'close-popup',
            label: '❌ Je ferme la fenêtre sans cliquer',
            isCorrect: true,
            feedback: 'Parfait ! Ces pop-ups sont toujours des arnaques. Ferme la fenêtre via le "X" ou Ctrl+W, jamais en cliquant sur des boutons à l\'intérieur.',
            pointsDelta: 10
          },
          {
            id: 'share-with-friends',
            label: '📤 Je partage avec mes amis pour qu\'ils puissent aussi gagner',
            isCorrect: false,
            feedback: 'Attention ! En partageant, tu propages l\'arnaque à tes proches. Ferme simplement la page et signale-la si possible.',
            pointsDelta: -5
          }
        ],
        reflexe: '⚡ Sur internet, personne ne t\'offre un iPhone gratuitement. Un compteur = manipulation.'
      },
      {
        id: 'photo-reseaux',
        title: 'La photo de vacances',
        situation: 'Tu es en vacances et tu veux poster cette photo sur Instagram :\n📸 Tu poses devant ta maison avec en fond la plaque d\'immatriculation de ta voiture, ton adresse visible sur la boîte aux lettres, et le message : "Parties pour 2 semaines ! 🌴✈️"\n\nTu as 800 followers dont 400 personnes que tu ne connais pas vraiment.',
        visual: <Share2 className="h-16 w-16 text-pink-300 opacity-80" />,
        choices: [
          {
            id: 'post-public',
            label: '📸 Je poste en public, j\'aime partager mes voyages',
            isCorrect: false,
            feedback: 'Risqué ! Tu viens d\'annoncer à 800 personnes (dont des inconnus) que ta maison est vide pendant 2 semaines avec ton adresse visible. C\'est une invitation au cambriolage.',
            pointsDelta: -5
          },
          {
            id: 'post-after',
            label: '✅ Je poste la photo après être rentré chez moi',
            isCorrect: true,
            feedback: 'Excellent réflexe ! Partager ses vacances après le retour évite d\'annoncer une maison vide. Tu gardes le souvenir sans le risque.',
            pointsDelta: 10
          },
          {
            id: 'post-friends-only',
            label: '👥 Je poste uniquement pour mes amis proches',
            isCorrect: true,
            feedback: 'Bien ! Limiter la visibilité à tes vrais amis réduit le risque. Mais pense aussi à flouter la plaque de voiture et l\'adresse sur la boîte aux lettres.',
            pointsDelta: 10
          }
        ],
        reflexe: '⚡ Prends 10 secondes avant de publier. Demande-toi : qui peut voir ça et qu\'est-ce que ça révèle ?'
      }
    ]
  }
];

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
const getBadge = (score: number, maxScore: number) => {
  const pct = (score / maxScore) * 100;
  if (pct >= 80) return { label: 'Sécurisé', emoji: '🟩', color: 'text-green-400 border-green-500', bg: 'bg-green-950/40', desc: 'Excellent ! Vous avez les bons réflexes pour vous protéger en ligne.' };
  if (pct >= 50) return { label: 'Prudent', emoji: '🟧', color: 'text-orange-400 border-orange-500', bg: 'bg-orange-950/40', desc: 'Pas mal ! Quelques angles morts restent à travailler.' };
  return { label: 'Vulnérable', emoji: '🟥', color: 'text-red-400 border-red-500', bg: 'bg-red-950/40', desc: 'Des lacunes importantes à combler. Retentez les modules !' };
};

const MAX_SCORE = BLOCKS.length * 3 * 10;

// ──────────────────────────────────────────────
// MAIN COMPONENT
// ──────────────────────────────────────────────
export default function DebutantCyber() {
  const [, setLocation] = useLocation();
  const [screen, setScreen] = useState<ScreenMode>({ type: 'hub' });
  const [score, setScore] = useState(0);
  const [completedBlocks, setCompletedBlocks] = useState<Set<string>>(new Set());
  const [scenarioResults, setScenarioResults] = useState<Record<string, 'correct' | 'wrong'>>({});
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [showConsequence, setShowConsequence] = useState(false);

  const getBlock = (id: string) => BLOCKS.find(b => b.id === id)!;

  const handleChoiceSelected = (blockId: string, scenarioIndex: number, choice: Choice) => {
    setSelectedChoice(choice);
    setScore(s => Math.max(0, s + choice.pointsDelta));
    setScenarioResults(prev => ({
      ...prev,
      [`${blockId}-${scenarioIndex}`]: choice.isCorrect ? 'correct' : 'wrong'
    }));
    setShowConsequence(true);
  };

  const handleNextScenario = (blockId: string, scenarioIndex: number) => {
    const block = getBlock(blockId);
    setShowConsequence(false);
    setSelectedChoice(null);
    if (scenarioIndex + 1 < block.scenarios.length) {
      setScreen({ type: 'scenario', blockId, scenarioIndex: scenarioIndex + 1 });
    } else {
      setCompletedBlocks(prev => new Set([...prev, blockId]));
      setScreen({ type: 'block-result', blockId });
    }
  };

  const completedCount = completedBlocks.size;
  const overallProgress = (completedCount / BLOCKS.length) * 100;

  // ── HUB SCREEN ──
  if (screen.type === 'hub') {
    const allDone = completedCount === BLOCKS.length;
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
        {/* Header */}
        <div className="border-b border-slate-700/50 bg-slate-900/80 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => setLocation('/cyber/roleplay')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Retour</span>
            </button>
            <div className="flex items-center gap-3">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="font-bold text-yellow-400 text-lg">{score} pts</span>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-10">
          {/* Hero */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full px-4 py-1.5 text-sm mb-6">
              <Shield className="h-4 w-4" />
              Cybersécurité pour tous
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🧑‍💻 Je suis Monsieur<br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Tout le Monde</span>
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              4 modules immersifs pour apprendre à vous protéger en ligne. Des situations réelles, des choix, des conséquences.
            </p>
          </motion.div>

          {/* Progress global */}
          {completedCount > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-8">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300">Progression globale</span>
                <span className="text-amber-400 font-bold">{completedCount}/{BLOCKS.length} modules</span>
              </div>
              <Progress value={overallProgress} className="h-2 bg-slate-700" />
              {allDone && (
                <button
                  onClick={() => setScreen({ type: 'final-result' })}
                  className="mt-4 w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg py-3 font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Trophy className="h-5 w-5" />
                  Voir mon résultat final
                </button>
              )}
            </motion.div>
          )}

          {/* Blocks grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {BLOCKS.map((block, i) => {
              const done = completedBlocks.has(block.id);
              return (
                <motion.div
                  key={block.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-gradient-to-br ${block.bgGradient} border-2 ${block.borderColor} rounded-2xl p-6 cursor-pointer relative overflow-hidden`}
                  onClick={() => setScreen({ type: 'scenario', blockId: block.id, scenarioIndex: 0 })}
                >
                  {done && (
                    <div className="absolute top-4 right-4">
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                  )}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-slate-900/50">
                      {block.icon}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1">Module {block.number}</div>
                      <h3 className={`text-xl font-bold ${block.color}`}>{block.emoji} {block.title}</h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4">
                    {block.scenarios.map((_, si) => {
                      const result = scenarioResults[`${block.id}-${si}`];
                      return (
                        <div key={si} className={`h-2 flex-1 rounded-full ${result === 'correct' ? 'bg-green-500' : result === 'wrong' ? 'bg-red-500' : 'bg-slate-700'}`} />
                      );
                    })}
                  </div>
                  <p className="text-slate-400 text-sm mb-4">{block.scenarios.length} scénarios réels · Choix interactifs · Feedback immédiat</p>
                  <div className={`flex items-center gap-2 font-semibold ${block.color}`}>
                    {done ? 'Rejouer' : 'Commencer'}
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Score recap */}
          {score > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 text-center">
              <div className="inline-flex items-center gap-3 bg-slate-800 border border-slate-600 rounded-full px-6 py-3">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-white font-bold">{score} points</span>
                <span className="text-slate-400">sur {MAX_SCORE} possibles</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // ── SCENARIO SCREEN ──
  if (screen.type === 'scenario') {
    const { blockId, scenarioIndex } = screen;
    const block = getBlock(blockId);
    const scenario = block.scenarios[scenarioIndex];
    const totalScenarios = block.scenarios.length;

    return (
      <div className={`min-h-screen bg-gradient-to-b ${block.bgGradient} text-white`}>
        {/* Header */}
        <div className="border-b border-slate-700/50 bg-slate-900/60 sticky top-0 z-10 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <button onClick={() => { setScreen({ type: 'hub' }); setShowConsequence(false); setSelectedChoice(null); }} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm">
              <ArrowLeft className="h-4 w-4" />
              Hub
            </button>
            <div className="flex items-center gap-4">
              <span className={`text-sm font-semibold ${block.color}`}>{block.emoji} {block.title}</span>
              <div className="flex items-center gap-1.5">
                {block.scenarios.map((_, i) => (
                  <div key={i} className={`h-2 w-6 rounded-full transition-all ${i < scenarioIndex ? 'bg-green-500' : i === scenarioIndex ? 'bg-white' : 'bg-slate-600'}`} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-yellow-400">
              <Star className="h-4 w-4" />
              <span className="font-bold text-sm">{score}</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {!showConsequence ? (
              <motion.div key={`scenario-${scenarioIndex}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                {/* Situation card */}
                <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-slate-800">
                      {scenario.visual}
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 uppercase tracking-wide mb-1">Situation réelle · {scenarioIndex + 1}/{totalScenarios}</div>
                      <h2 className="text-xl font-bold text-white">{scenario.title}</h2>
                    </div>
                  </div>
                  <div className="bg-slate-800/80 border border-slate-600 rounded-xl p-4">
                    <pre className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">{scenario.situation}</pre>
                  </div>
                </div>

                {/* Choices */}
                <div className="mb-4">
                  <p className="text-slate-400 text-sm mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Que faites-vous ?
                  </p>
                  <div className="space-y-3">
                    {scenario.choices.map(choice => (
                      <motion.button
                        key={choice.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleChoiceSelected(blockId, scenarioIndex, choice)}
                        className="w-full text-left bg-slate-800/60 hover:bg-slate-700/60 border border-slate-600 hover:border-slate-400 text-white rounded-xl p-4 transition-all"
                      >
                        {choice.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key={`consequence-${scenarioIndex}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                {/* Result banner */}
                <div className={`rounded-2xl p-6 mb-6 border-2 ${selectedChoice?.isCorrect ? 'bg-green-950/60 border-green-500/50' : 'bg-red-950/60 border-red-500/50'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    {selectedChoice?.isCorrect
                      ? <CheckCircle className="h-8 w-8 text-green-400" />
                      : <XCircle className="h-8 w-8 text-red-400" />
                    }
                    <div>
                      <h3 className={`text-xl font-bold ${selectedChoice?.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                        {selectedChoice?.isCorrect ? '✅ Bien joué !' : '❌ Erreur !'}
                      </h3>
                      <span className={`text-sm font-semibold ${selectedChoice?.isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                        {selectedChoice?.pointsDelta && selectedChoice.pointsDelta > 0 ? `+${selectedChoice.pointsDelta}` : selectedChoice?.pointsDelta} points
                      </span>
                    </div>
                  </div>
                  <p className="text-white/90 leading-relaxed">{selectedChoice?.feedback}</p>
                </div>

                {/* Reflexe clé */}
                <div className="bg-amber-950/40 border border-amber-600/40 rounded-xl p-4 mb-6">
                  <p className="text-amber-300 font-semibold text-sm">{scenario.reflexe}</p>
                </div>

                {/* Next button */}
                <button
                  onClick={() => handleNextScenario(blockId, scenarioIndex)}
                  className="w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border border-slate-500 text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  {scenarioIndex + 1 < block.scenarios.length ? (
                    <>Scénario suivant <ArrowRight className="h-5 w-5" /></>
                  ) : (
                    <>Voir le résultat du module <Trophy className="h-5 w-5" /></>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // ── BLOCK RESULT ──
  if (screen.type === 'block-result') {
    const { blockId } = screen;
    const block = getBlock(blockId);
    const blockScores = block.scenarios.map((_, i) => scenarioResults[`${blockId}-${i}`]);
    const correctCount = blockScores.filter(r => r === 'correct').length;
    const blockIndex = BLOCKS.findIndex(b => b.id === blockId);
    const nextBlock = BLOCKS[blockIndex + 1];

    return (
      <div className={`min-h-screen bg-gradient-to-b ${block.bgGradient} text-white flex flex-col items-center justify-center px-4`}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{block.emoji}</div>
            <h2 className={`text-2xl font-bold ${block.color} mb-2`}>{block.title}</h2>
            <p className="text-slate-300">Module terminé !</p>
          </div>

          {/* Score bloc */}
          <div className="bg-slate-900/70 border border-slate-700 rounded-2xl p-6 mb-6">
            <div className="flex justify-around text-center">
              <div>
                <div className="text-3xl font-bold text-green-400">{correctCount}</div>
                <div className="text-slate-400 text-sm">Bons réflexes</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-red-400">{block.scenarios.length - correctCount}</div>
                <div className="text-slate-400 text-sm">Erreurs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-400">{score}</div>
                <div className="text-slate-400 text-sm">Points total</div>
              </div>
            </div>
          </div>

          {/* Résultats par scénario */}
          <div className="space-y-2 mb-6">
            {block.scenarios.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-lg ${scenarioResults[`${blockId}-${i}`] === 'correct' ? 'bg-green-950/40 border border-green-800/50' : 'bg-red-950/40 border border-red-800/50'}`}>
                {scenarioResults[`${blockId}-${i}`] === 'correct'
                  ? <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                  : <XCircle className="h-5 w-5 text-red-400 shrink-0" />
                }
                <span className="text-sm text-slate-200">{s.title}</span>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {nextBlock ? (
              <button
                onClick={() => setScreen({ type: 'scenario', blockId: nextBlock.id, scenarioIndex: 0 })}
                className={`w-full bg-gradient-to-r from-slate-700 to-slate-600 hover:from-slate-600 hover:to-slate-500 border border-slate-500 text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2 transition-all`}
              >
                Module suivant : {nextBlock.emoji} {nextBlock.title}
                <ArrowRight className="h-5 w-5" />
              </button>
            ) : (
              <button
                onClick={() => setScreen({ type: 'final-result' })}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2"
              >
                <Trophy className="h-5 w-5" />
                Voir mon bilan final
              </button>
            )}
            <button
              onClick={() => setScreen({ type: 'hub' })}
              className="w-full bg-transparent border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white rounded-xl py-3 font-medium transition-all"
            >
              Retour au hub
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── FINAL RESULT ──
  if (screen.type === 'final-result') {
    const badge = getBadge(score, MAX_SCORE);
    const pct = Math.round((score / MAX_SCORE) * 100);
    const risqueScore = Math.max(0, 100 - pct);

    // Recommandations personnalisées
    const failedScenarios = Object.entries(scenarioResults)
      .filter(([, r]) => r === 'wrong')
      .map(([key]) => {
        const [blockId, si] = key.split('-');
        const block = getBlock(blockId);
        return block?.scenarios[parseInt(si)]?.title;
      }).filter(Boolean);

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col items-center justify-center px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
          {/* Badge */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="text-7xl mb-4"
            >
              {badge.emoji}
            </motion.div>
            <h1 className="text-4xl font-bold mb-2">Bilan Personnel</h1>
            <div className={`inline-block border-2 rounded-full px-6 py-2 text-xl font-bold ${badge.color} ${badge.bg} mt-2`}>
              {badge.label}
            </div>
          </div>

          {/* Score & Risque */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 text-center">
              <div className="text-4xl font-bold text-yellow-400 mb-1">{score}</div>
              <div className="text-slate-400 text-sm">Points sur {MAX_SCORE}</div>
              <Progress value={pct} className="mt-3 h-2 bg-slate-700" />
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-5 text-center">
              <div className={`text-4xl font-bold mb-1 ${risqueScore > 50 ? 'text-red-400' : risqueScore > 25 ? 'text-orange-400' : 'text-green-400'}`}>
                {risqueScore}%
              </div>
              <div className="text-slate-400 text-sm">Niveau de risque personnel</div>
              <Progress value={risqueScore} className="mt-3 h-2 bg-slate-700" />
            </div>
          </div>

          {/* Message badge */}
          <div className={`${badge.bg} border ${badge.color.split(' ')[1] || 'border-slate-500'} rounded-xl p-4 mb-8`}>
            <p className={`${badge.color.split(' ')[0]} font-semibold`}>{badge.desc}</p>
          </div>

          {/* Recommandations si erreurs */}
          {failedScenarios.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 mb-8">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-400" />
                Ce que vous devez pratiquer
              </h3>
              <ul className="space-y-2">
                {failedScenarios.map((s, i) => (
                  <li key={i} className="flex items-center gap-2 text-slate-300 text-sm">
                    <ChevronRight className="h-4 w-4 text-orange-400 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Checklist export */}
          <div className="bg-amber-950/40 border border-amber-600/30 rounded-xl p-5 mb-8">
            <h3 className="text-amber-300 font-bold mb-3">📋 Ce que vous devez faire dès maintenant</h3>
            <ul className="space-y-2 text-sm text-amber-200">
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" /> Activer la double authentification sur Gmail et votre banque</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" /> Utiliser un mot de passe différent pour chaque compte important</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" /> Activer les mises à jour automatiques sur votre téléphone et PC</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" /> Ne jamais cliquer sur un lien reçu par SMS ou email inattendu</li>
              <li className="flex items-start gap-2"><CheckCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" /> Vérifier l'adresse email de l'expéditeur avant de répondre</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => {
                setScore(0);
                setCompletedBlocks(new Set());
                setScenarioResults({});
                setSelectedChoice(null);
                setShowConsequence(false);
                setScreen({ type: 'hub' });
              }}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-xl py-4 font-bold flex items-center justify-center gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              Recommencer pour améliorer mon score
            </button>
            <button
              onClick={() => setLocation('/cyber/roleplay')}
              className="w-full bg-transparent border border-slate-600 hover:border-slate-400 text-slate-300 hover:text-white rounded-xl py-3 font-medium transition-all"
            >
              Retour aux rôles
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
