import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ChevronLeft, CheckCircle, XCircle, AlertTriangle,
  Trophy, Shield, Flag, Loader2, Brain, Zap, Lock, Cpu,
  Star, BarChart2, RefreshCw
} from 'lucide-react';

// ── PALETTE mc2i ──────────────────────────────────────────────────────────────
const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

// ── CONSTANTES ────────────────────────────────────────────────────────────────
const TOTAL_SCENARIOS = 12;
const MAX_SCORE = 120;

// ── TYPES ─────────────────────────────────────────────────────────────────────
interface Choice {
  label: string;
  feedback: string;
  points: number;
  isCorrect: boolean;
}

interface Scenario {
  id: string;
  module: number;
  moduleTitle: string;
  title: string;
  context: string;
  situation: string;
  choices: Choice[];
  reflexe: string;
  redFlags: string[];
  category: string;
}

// ── SCÉNARIOS ─────────────────────────────────────────────────────────────────
const SCENARIOS: Scenario[] = [
  // ── MODULE 1 : Comprendre ce qu'est vraiment l'IA ─────────────────────────
  {
    id: 'm1-s1', module: 1, moduleTitle: 'Comprendre ce qu\'est vraiment l\'IA', category: 'comprendre',
    title: 'La réponse "sûre à 100%"',
    context: 'Tu utilises un assistant IA pour préparer un document important pour ton client.',
    situation: 'L\'IA t\'affiche une réponse très précise : "La loi du 15 mars 2023 impose une pénalité de 8% au-delà de 30 jours." Elle semble complète, bien rédigée, sans hésitation. Que fais-tu ?',
    choices: [
      { label: 'Je copie-colle directement dans mon document', feedback: 'L\'IA peut inventer des lois qui n\'existent pas — c\'est ce qu\'on appelle une hallucination. Cette "loi" pourrait être totalement fictive.', points: -10, isCorrect: false },
      { label: 'Je vérifie sur une source officielle avant d\'utiliser', feedback: 'Excellent réflexe ! Même une réponse confiante et précise peut être fausse. La vérification sur une source officielle est indispensable.', points: 10, isCorrect: true },
      { label: 'Je reformule la question à l\'IA pour avoir une confirmation', feedback: 'Demander confirmation à la même IA n\'est pas une vérification — elle peut confirmer une information fausse. Il faut une source externe.', points: -5, isCorrect: false },
    ],
    reflexe: 'L\'IA calcule des probabilités, elle ne "sait" pas. Plus une réponse est précise et confiante, plus il faut la vérifier.',
    redFlags: ['Dates ou chiffres très précis sans source', 'Références à des lois ou réglementations', 'Aucune mention d\'incertitude'],
  },
  {
    id: 'm1-s2', module: 1, moduleTitle: 'Comprendre ce qu\'est vraiment l\'IA', category: 'comprendre',
    title: 'Le résumé automatique',
    context: 'Tu as un rapport de 60 pages à lire pour une réunion dans 2h.',
    situation: 'Tu demandes à l\'IA de résumer le rapport. Elle te sort un résumé en 10 points, clair et structuré. La réunion approche. Que fais-tu ?',
    choices: [
      { label: 'Je me base uniquement sur le résumé pour la réunion', feedback: 'L\'IA peut omettre des points cruciaux, mal interpréter le contexte ou résumer des parties non représentatives. Tu risques de rater l\'essentiel.', points: -5, isCorrect: false },
      { label: 'Je lis le résumé et parcours les sections clés du rapport', feedback: 'Parfait ! L\'IA est un outil d\'aide à la lecture, pas un remplaçant. Le survol des sections importantes te donne la maîtrise réelle du sujet.', points: 10, isCorrect: true },
      { label: 'Je demande à l\'IA de faire un résumé encore plus court', feedback: 'Réduire encore plus augmente les risques d\'omissions importantes. L\'IA ne peut pas savoir ce qui est stratégiquement crucial pour toi.', points: -5, isCorrect: false },
    ],
    reflexe: 'L\'IA résume ce qui est statistiquement fréquent dans le texte, pas ce qui est stratégiquement important pour toi.',
    redFlags: ['Utiliser uniquement le résumé IA pour une réunion importante', 'Ne pas relire les conclusions du document source', 'Faire confiance à un résumé sans titre ni source vérifiable'],
  },
  {
    id: 'm1-s3', module: 1, moduleTitle: 'Comprendre ce qu\'est vraiment l\'IA', category: 'comprendre',
    title: 'La prédiction de l\'IA',
    context: 'Ton outil de CRM intègre une IA qui analyse les données clients.',
    situation: 'L\'IA affiche : "Ce client a 87% de probabilité de résilier son contrat dans les 30 prochains jours." Ton manager te demande d\'agir. Que fais-tu ?',
    choices: [
      { label: 'Je contacte immédiatement le client pour un geste commercial', feedback: 'Agir sur une prédiction sans comprendre pourquoi l\'IA l\'a faite peut être inutile ou même contre-productif. Tu as besoin du contexte.', points: -5, isCorrect: false },
      { label: 'Je consulte les données client pour comprendre les signaux avant d\'agir', feedback: 'Excellent ! La prédiction est un point de départ, pas une vérité. Comprendre les signaux (retards de paiement ? baisse d\'usage ?) te permet d\'agir de façon pertinente.', points: 10, isCorrect: true },
      { label: 'J\'ignore la prédiction, les chiffres ne sont jamais fiables', feedback: 'Ignorer complètement une prédiction IA utile n\'est pas optimal non plus. L\'IA peut détecter des patterns que tu n\'aurais pas vus — il faut l\'interroger, pas l\'ignorer.', points: -10, isCorrect: false },
    ],
    reflexe: 'L\'IA détecte des corrélations, pas des causes. La décision reste humaine, avec les données comme contexte.',
    redFlags: ['Agir sans vérifier la logique derrière la prédiction', 'Oublier que les données passées ne prédisent pas parfaitement le futur', 'Ignorer des signaux faibles parce qu\'ils viennent d\'une IA'],
  },

  // ── MODULE 2 : Éviter les pièges de l'IA ──────────────────────────────────
  {
    id: 'm2-s1', module: 2, moduleTitle: 'Éviter les pièges de l\'IA', category: 'pieges',
    title: 'Deux réponses contradictoires',
    context: 'Tu prépares une présentation sur l\'impact de l\'IA sur l\'emploi.',
    situation: 'Tu poses la même question à deux IA différentes. L\'une dit "l\'IA créera plus d\'emplois qu\'elle n\'en détruira", l\'autre dit "l\'IA supprimera 30% des postes actuels d\'ici 2030". Les deux semblent convaincantes. Que fais-tu ?',
    choices: [
      { label: 'Je garde la réponse la plus optimiste pour la présentation', feedback: 'Choisir une réponse par préférence plutôt que par vérification est un biais de confirmation. Tu présentes une opinion IA comme un fait.', points: -10, isCorrect: false },
      { label: 'Je cherche des études de sources reconnues (WEF, OCDE, McKinsey…)', feedback: 'Parfait ! Quand deux IA divergent, la vérité est dans les sources. Les IA synthétisent des données ; seules les études primaires font autorité.', points: 10, isCorrect: true },
      { label: 'Je présente les deux réponses sans prendre de position', feedback: 'Mieux que de choisir arbitrairement, mais présenter deux chiffres contradictoires sans cadre analytique crée de la confusion plutôt que de la clarté.', points: -5, isCorrect: false },
    ],
    reflexe: 'Les IA peuvent se contredire car elles synthétisent des sources différentes. La vérité est dans les études primaires, pas dans le consensus des IA.',
    redFlags: ['Deux IA donnent des chiffres contradictoires', 'Aucune IA ne cite ses sources précisément', 'La réponse semble trop tranchée sur un sujet complexe'],
  },
  {
    id: 'm2-s2', module: 2, moduleTitle: 'Éviter les pièges de l\'IA', category: 'pieges',
    title: 'La vidéo suspecte',
    context: 'Tu reçois une vidéo de ton DG via WhatsApp professionnel.',
    situation: 'Dans la vidéo, ton DG annonce une procédure exceptionnelle : un virement urgent de 50 000€ vers un nouveau fournisseur doit être fait aujourd\'hui avant 17h. Sa voix et son visage semblent authentiques. Que fais-tu ?',
    choices: [
      { label: 'Je fais le virement, la vidéo est convaincante et c\'est urgent', feedback: 'C\'est un deepfake classique. Les techniques actuelles permettent de recréer parfaitement voix et visage. L\'urgence est délibérée pour court-circuiter ta vigilance.', points: -10, isCorrect: false },
      { label: 'Je contacte directement le DG par téléphone pour confirmer', feedback: 'Excellent réflexe ! Tout virement exceptionnel doit être confirmé par un canal différent de celui de la demande. C\'est la règle anti-fraude fondamentale.', points: 10, isCorrect: true },
      { label: 'Je transfère la demande à la comptabilité sans vérifier', feedback: 'Déléguer sans vérifier ne réduit pas le risque, ça le déplace. La fraude au président ne cible pas que les décideurs — elle cible toute la chaîne.', points: -10, isCorrect: false },
    ],
    reflexe: 'Un deepfake peut imiter parfaitement voix et visage. Toute demande financière urgente via un canal digital doit être confirmée via un autre canal.',
    redFlags: ['Urgence artificielle ("avant 17h")', 'Demande inhabituelle via un canal numérique', 'Nouveau fournisseur inconnu', 'Pression émotionnelle ("fais-moi confiance")'],
  },
  {
    id: 'm2-s3', module: 2, moduleTitle: 'Éviter les pièges de l\'IA', category: 'pieges',
    title: 'Le chiffre parfait',
    context: 'Tu réalises un rapport d\'analyse de marché pour un comité de direction.',
    situation: 'L\'IA génère cette phrase : "Selon les dernières données, le marché français de l\'IA BtoB atteindra 4,7 milliards d\'euros en 2025, soit une croissance de 23,4% par rapport à 2024." Le chiffre semble parfait pour ton rapport. Que fais-tu ?',
    choices: [
      { label: 'Je l\'intègre directement, le chiffre précis rend le rapport crédible', feedback: 'Un chiffre précis sans source est une illusion de crédibilité. L\'IA peut inventer des statistiques qui n\'ont jamais existé. Ton rapport risque d\'être remis en question.', points: -10, isCorrect: false },
      { label: 'Je demande à l\'IA sa source, puis je la vérifie', feedback: 'Bien ! Mais attention : l\'IA peut inventer une source qui semble réelle. La vérification directe de la source est indispensable, pas la source fournie par l\'IA.', points: 5, isCorrect: false },
      { label: 'Je cherche ce chiffre sur des sites d\'analystes reconnus (Gartner, IDC…)', feedback: 'Parfait ! Les chiffres de marché doivent venir de cabinets d\'analyse reconnus. L\'IA peut générer des statistiques plausibles mais inexistantes. La source primaire est la seule valide.', points: 10, isCorrect: true },
    ],
    reflexe: 'Plus un chiffre est précis (23,4% et non "environ 20%"), plus il peut être une hallucination. Vérifie toujours sur la source primaire.',
    redFlags: ['Précision excessive (décimales) sans source mentionnée', 'Chiffre introuvable sur les sites des cabinets référents', 'L\'IA cite une "étude récente" sans nom ni date précise'],
  },

  // ── MODULE 3 : Utiliser l'IA dans son quotidien ────────────────────────────
  {
    id: 'm3-s1', module: 3, moduleTitle: 'Utiliser l\'IA dans son quotidien', category: 'quotidien',
    title: 'Le mail professionnel urgent',
    context: 'Tu dois envoyer un mail à un client mécontent dans les 10 prochaines minutes.',
    situation: 'Tu demandes à l\'IA : "Écris un mail pour expliquer le retard de livraison." L\'IA génère un mail bien rédigé, poli et structuré. Tu dois l\'envoyer. Que fais-tu ?',
    choices: [
      { label: 'J\'envoie le mail IA directement sans modification', feedback: 'Le mail IA peut être générique, manquer des détails spécifiques à ce client, ou avoir un ton qui ne correspond pas à votre relation. Un envoi non relu est risqué.', points: -5, isCorrect: false },
      { label: 'Je relis, personnalise avec les détails du dossier et envoie', feedback: 'Parfait ! L\'IA t\'a donné une base solide. En ajoutant le nom du client, les détails spécifiques et en ajustant le ton à votre relation, tu obtiens le meilleur des deux mondes.', points: 10, isCorrect: true },
      { label: 'Je réécris entièrement le mail moi-même pour être sûr', feedback: 'Réécrire entièrement efface le gain de temps de l\'IA. Elle t\'a donné une structure solide — l\'adapter prend 2 minutes et est plus efficace que repartir de zéro.', points: 5, isCorrect: false },
    ],
    reflexe: 'L\'IA est un point de départ, pas un point final. Personnalise toujours avec le contexte réel avant d\'envoyer.',
    redFlags: ['Mail générique sans référence au dossier client', 'Ton trop formel ou trop informel pour la relation', 'Informations factuelles non vérifiées dans le mail généré'],
  },
  {
    id: 'm3-s2', module: 3, moduleTitle: 'Utiliser l\'IA dans son quotidien', category: 'quotidien',
    title: 'Le compte-rendu de réunion',
    context: 'Tu as utilisé un outil d\'IA pour transcrire et résumer votre réunion d\'équipe de 45 minutes.',
    situation: 'L\'IA a généré un compte-rendu avec les décisions prises et les actions à mener. C\'est complet et bien présenté. Comment tu l\'utilises ?',
    choices: [
      { label: 'Je l\'envoie directement à toute l\'équipe sans relire', feedback: 'L\'IA peut mal attribuer des actions, omettre des nuances ou se tromper sur les décisions. Un compte-rendu erroné envoyé à toute l\'équipe peut créer de la confusion ou des conflits.', points: -10, isCorrect: false },
      { label: 'Je vérifie les décisions clés et actions attribuées avant de partager', feedback: 'Excellent réflexe ! La relecture rapide des points critiques (décisions, actions, responsables) suffit. Tu gagnes du temps sans prendre le risque d\'envoyer des erreurs.', points: 10, isCorrect: true },
      { label: 'Je complète le résumé IA avec mes propres notes et l\'envoie', feedback: 'Bonne initiative d\'enrichir le résumé, mais attention à valider que le contenu IA est correct avant d\'y ajouter tes notes — tu ne veux pas confirmer des informations erronées.', points: 5, isCorrect: false },
    ],
    reflexe: 'Déléguer la rédaction à l\'IA est efficace. Déléguer la responsabilité du contenu, c\'est risqué. Valide avant de diffuser.',
    redFlags: ['Actions mal attribuées à des personnes', 'Décisions résumées de façon trop vague ou erronée', 'Nuances importantes perdues dans la transcription'],
  },
  {
    id: 'm3-s3', module: 3, moduleTitle: 'Utiliser l\'IA dans son quotidien', category: 'quotidien',
    title: 'Le prompt trop vague',
    context: 'Tu veux que l\'IA t\'aide à préparer une présentation pour convaincre ton management.',
    situation: 'Tu écris : "Fais-moi une présentation sur l\'IA." L\'IA génère un plan très générique sur "qu\'est-ce que l\'IA" et "ses applications". Ce n\'est pas du tout ce dont tu avais besoin. Que fais-tu ?',
    choices: [
      { label: 'Je garde le plan générique, l\'IA sait ce qu\'elle fait', feedback: 'Un plan générique sur "l\'IA en général" ne convaincra pas ton management. L\'IA a répondu à ta question — c\'est ta question qui manquait de précision.', points: -10, isCorrect: false },
      { label: 'Je précise ma demande : contexte, audience, objectif, format', feedback: 'Parfait ! "Fais un plan de 10 slides pour convaincre mon CODIR d\'investir dans un outil IA pour notre équipe RH de 50 personnes, budget 30k€" donne un résultat radicalement meilleur.', points: 10, isCorrect: true },
      { label: 'Je redemande la même chose à une autre IA', feedback: 'Changer d\'IA sans changer le prompt donnera un résultat tout aussi générique. Le problème est dans la formulation, pas dans l\'outil.', points: -5, isCorrect: false },
    ],
    reflexe: 'La qualité du résultat IA est proportionnelle à la qualité du prompt. Contexte + audience + objectif + format = prompt efficace.',
    redFlags: ['Prompt d\'une seule phrase sans contexte', 'Résultat trop générique ou trop large', 'Aucune mention de l\'objectif ou de l\'audience cible'],
  },

  // ── MODULE 4 : Protéger ses données avec l'IA ─────────────────────────────
  {
    id: 'm4-s1', module: 4, moduleTitle: 'Protéger ses données avec l\'IA', category: 'donnees',
    title: 'Le contrat confidentiel',
    context: 'Tu dois analyser un contrat de 40 pages pour identifier les clauses à risque.',
    situation: 'Tu copies-colles l\'intégralité du contrat (avec noms des parties, montants, conditions) dans ChatGPT pour qu\'il identifie les clauses problématiques. C\'est rapide et efficace. Mais est-ce correct ?',
    choices: [
      { label: 'Oui, c\'est efficace et ça reste confidentiel entre moi et l\'IA', feedback: 'Faux. Les données envoyées à des IA cloud peuvent être utilisées pour l\'entraînement des modèles. Un contrat confidentiel ne doit pas quitter l\'environnement sécurisé de l\'entreprise.', points: -10, isCorrect: false },
      { label: 'Non, je dois utiliser un outil IA validé par mon entreprise ou anonymiser', feedback: 'Exact ! Soit tu utilises l\'outil IA approuvé par ton entreprise (souvent en environnement privé), soit tu anonymises les données sensibles avant de les soumettre.', points: 10, isCorrect: true },
      { label: 'Ça dépend si l\'IA a une politique de confidentialité', feedback: 'La politique de confidentialité est un premier niveau, mais elle ne suffit pas pour des données d\'entreprise confidentielles. Les règles RGPD et les politiques internes de sécurité priment.', points: -5, isCorrect: false },
    ],
    reflexe: 'Tout ce que tu envoies à une IA cloud peut potentiellement être stocké, analysé ou utilisé pour l\'entraînement. Les données confidentielles ne doivent pas y passer.',
    redFlags: ['Noms de clients ou partenaires dans le prompt', 'Montants financiers ou clauses contractuelles', 'Stratégie d\'entreprise ou projets confidentiels'],
  },
  {
    id: 'm4-s2', module: 4, moduleTitle: 'Protéger ses données avec l\'IA', category: 'donnees',
    title: 'L\'outil IA gratuit',
    context: 'Tu découvres un outil IA gratuit qui promet d\'analyser vos données RH pour détecter des risques de turnover.',
    situation: 'L\'outil semble performant. Pour tester, tu téléverses un fichier Excel avec noms, salaires, ancienneté et évaluations de 200 collaborateurs. Que risques-tu ?',
    choices: [
      { label: 'Rien, c\'est un outil professionnel, il est sûrement certifié', feedback: 'Gratuit ne signifie pas sécurisé ni conforme RGPD. Sans audit, un outil externe peut stocker, revendre ou utiliser les données RH de tes collaborateurs sans leur consentement.', points: -10, isCorrect: false },
      { label: 'Une violation RGPD : données personnelles transmises sans encadrement légal', feedback: 'Exactement. Les données RH (salaires, évaluations) sont des données personnelles sensibles. Leur transmission à un tiers sans contrat de traitement des données est une violation RGPD exposant ton entreprise à des sanctions.', points: 10, isCorrect: true },
      { label: 'Un risque de cybersécurité, mais pas de problème légal', feedback: 'Il y a bien un risque légal — le RGPD s\'applique. Toute transmission de données personnelles à un prestataire exige un contrat de traitement des données (DPA). L\'aspect cybersécurité est un risque supplémentaire.', points: -5, isCorrect: false },
    ],
    reflexe: '"Gratuit" en IA signifie souvent que tes données sont le produit. Toute transmission de données personnelles nécessite une validation juridique et un contrat RGPD.',
    redFlags: ['Outil non référencé par la DSI ou le service juridique', 'Aucun contrat de traitement des données proposé', 'Données personnelles (nom, salaire, évaluation) dans le fichier'],
  },
  {
    id: 'm4-s3', module: 4, moduleTitle: 'Protéger ses données avec l\'IA', category: 'donnees',
    title: 'Le prompt avec données clients',
    context: 'Tu veux améliorer la qualité de tes prompts pour mieux exploiter l\'IA dans ton travail.',
    situation: 'Pour donner un exemple concret à l\'IA, tu écris : "Voici un exemple de mail client : \'Bonjour M. Dupont, concernant votre commande n°45821 du 12/03 et votre adresse au 12 rue de la Paix 75001 Paris...\'. Améliore ce type de mail." Quel est le problème ?',
    choices: [
      { label: 'Aucun, c\'est juste un exemple pour améliorer mes compétences', feedback: 'Les données réelles de M. Dupont (nom, numéro de commande, adresse) ont été transmises à une IA externe. Même "pour l\'exemple", c\'est une violation des données personnelles de ton client.', points: -10, isCorrect: false },
      { label: 'J\'ai partagé des données personnelles réelles d\'un client avec une IA externe', feedback: 'Exact. Utilise toujours des données fictives dans tes prompts d\'exemple. "M. Martin, commande n°12345, 1 rue Fictive" donne le même résultat sans risque RGPD.', points: 10, isCorrect: true },
      { label: 'C\'est risqué mais acceptable si je le fais rarement', feedback: 'La fréquence ne change pas le risque légal. Chaque transmission de données personnelles réelles à une IA externe est une violation RGPD potentielle, même si c\'est exceptionnel.', points: -10, isCorrect: false },
    ],
    reflexe: 'Utilise toujours des données fictives dans tes prompts. Remplace noms, adresses, numéros de commande par des données inventées — le résultat est identique, le risque est nul.',
    redFlags: ['Nom complet d\'un client réel dans le prompt', 'Numéro de commande, contrat ou référence interne', 'Adresse postale ou email personnel dans l\'exemple'],
  },
];

// ── ENRICHISSEMENTS PAR CATÉGORIE ─────────────────────────────────────────────
function getEnrichment(category: string) {
  const enrichments: Record<string, { resumeCle: string; bonnesPratiques: string[]; faitsHistoriques: string[] }> = {
    comprendre: {
      resumeCle: 'L\'IA prédit et génère, elle ne "sait" pas. Ses réponses confiantes peuvent être totalement fausses.',
      bonnesPratiques: [
        'Traiter les réponses IA comme un point de départ, pas une vérité',
        'Vérifier sur des sources primaires toute information critique',
        'Garder l\'humain dans la boucle décisionnelle',
        'Se demander "comment l\'IA peut-elle se tromper ici ?" avant d\'agir',
      ],
      faitsHistoriques: [
        'En 2023, un avocat américain a soumis des citations de jurisprudence générées par ChatGPT — toutes fictives. Il a été sanctionné par le tribunal.',
        'Le phénomène d\'hallucination touche tous les grands modèles de langage, même les plus avancés.',
        'Une étude Stanford (2024) montre que les LLMs se trompent dans 20% des questions factuelles précises.',
      ],
    },
    pieges: {
      resumeCle: 'L\'IA peut halluciner, biaiser ou imiter. Toujours vérifier les informations importantes sur des sources primaires.',
      bonnesPratiques: [
        'Confronter les réponses IA à des sources reconnues (rapports officiels, cabinets d\'analyse)',
        'Être particulièrement vigilant face aux deepfakes pour les demandes financières',
        'Confirmer toute demande urgente via un canal différent',
        'Ne jamais agir dans l\'urgence sans vérification sur une décision importante',
      ],
      faitsHistoriques: [
        'Les attaques par deepfake ont augmenté de 3000% entre 2019 et 2023 selon le rapport Sensity AI.',
        'En 2024, une entreprise hongkongaise a perdu 25 millions de dollars suite à un deepfake de son directeur financier lors d\'une visioconférence.',
        'Les "hallucinations" de chiffres sont particulièrement fréquentes : les IA créent des statistiques plausibles mais inexistantes.',
      ],
    },
    quotidien: {
      resumeCle: 'L\'IA amplifie ta productivité si tu restes dans la boucle. Personnalise, vérifie, et formule des prompts précis.',
      bonnesPratiques: [
        'Toujours relire et personnaliser les contenus générés avant de les partager',
        'Préciser contexte, audience et objectif dans chaque prompt',
        'Utiliser l\'IA pour la structure, garder la substance pour toi',
        'Valider les comptes-rendus et résumés avant diffusion',
      ],
      faitsHistoriques: [
        'Les professionnels qui formulent des prompts précis obtiennent des résultats 3 à 5 fois plus utiles que ceux qui utilisent des prompts vagues.',
        'Une étude McKinsey (2023) montre que l\'IA générative peut augmenter la productivité des knowledge workers de 20 à 30%.',
        'L\'ingénierie de prompt ("prompt engineering") est devenue l\'une des compétences les plus demandées dans les entreprises digitales.',
      ],
    },
    donnees: {
      resumeCle: 'Les données que tu envoies à une IA peuvent être stockées et réutilisées. Les données sensibles ne doivent pas quitter l\'environnement sécurisé.',
      bonnesPratiques: [
        'Utiliser uniquement les outils IA validés par la DSI et le service juridique',
        'Anonymiser systématiquement les données réelles dans les prompts',
        'Vérifier l\'existence d\'un contrat de traitement des données (DPA) avec tout prestataire IA',
        'Signaler toute utilisation d\'outil IA non référencé à son responsable',
      ],
      faitsHistoriques: [
        'Samsung a interdit l\'usage de ChatGPT après que des ingénieurs ont involontairement partagé du code source propriétaire avec l\'outil.',
        'OpenAI utilise par défaut les conversations pour améliorer ses modèles — une option désactivable dans les paramètres, souvent méconnue.',
        'Le RGPD impose une amende jusqu\'à 4% du chiffre d\'affaires mondial pour des violations graves de protection des données.',
      ],
    },
  };
  return enrichments[category] ?? enrichments.comprendre;
}

// ── MODULES META ──────────────────────────────────────────────────────────────
const MODULES_META = [
  { num: 1, title: 'Comprendre ce qu\'est vraiment l\'IA', icon: <Brain size={20} />, color: BLUE },
  { num: 2, title: 'Éviter les pièges de l\'IA', icon: <AlertTriangle size={20} />, color: '#d97706' },
  { num: 3, title: 'Utiliser l\'IA dans son quotidien', icon: <Zap size={20} />, color: '#7c3aed' },
  { num: 4, title: 'Protéger ses données avec l\'IA', icon: <Lock size={20} />, color: PINK },
];

// ── BADGE FINAL ───────────────────────────────────────────────────────────────
function getBadge(score: number) {
  const pct = score / MAX_SCORE;
  if (pct >= 0.7) return { label: 'Utilisateur Intelligent', color: '#16a34a', bg: '#f0fdf4', border: '#16a34a', emoji: '🟩' };
  if (pct >= 0.35) return { label: 'Utilisateur Prudent', color: '#d97706', bg: '#fffbeb', border: '#d97706', emoji: '🟧' };
  return { label: 'Dépendant Naïf', color: '#dc2626', bg: '#fef2f2', border: '#dc2626', emoji: '🟥' };
}

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────
type Phase = 'intro' | 'scenario' | 'answered' | 'final';

export default function MTMDataIA() {
  const [, setLocation] = useLocation();

  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [loadingNext, setLoadingNext] = useState(false);

  const currentScenario = SCENARIOS[currentIndex] ?? null;
  const badge = getBadge(score);
  const currentModule = currentScenario ? MODULES_META.find(m => m.num === currentScenario.module) : null;

  function handleChoice(choice: Choice) {
    setSelectedChoice(choice);
    setScore(s => s + choice.points);
    if (!choice.isCorrect) setWrongCount(w => w + 1);
    setPhase('answered');
  }

  function handleNext() {
    setLoadingNext(true);
    setTimeout(() => {
      if (currentIndex + 1 >= TOTAL_SCENARIOS) {
        setPhase('final');
      } else {
        setCurrentIndex(i => i + 1);
        setSelectedChoice(null);
        setPhase('scenario');
      }
      setLoadingNext(false);
    }, 300);
  }

  function handleRestart() {
    setPhase('intro');
    setCurrentIndex(0);
    setSelectedChoice(null);
    setScore(0);
    setWrongCount(0);
  }

  return (
    <div className="min-h-screen text-gray-900" style={{ fontFamily: 'Inter, sans-serif', background: '#f5f5f5' }}>
      <AnimatePresence mode="wait">

        {/* ═══ INTRO ════════════════════════════════════════════════════════ */}
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col" style={{ background: DARK }}>

            <div className="px-6 py-4 flex items-center border-b border-white/10">
              <button onClick={() => setLocation('/data-ia/roleplay')}
                className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
                <ChevronLeft size={14} /> Retour
              </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
              <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-white"
                style={{ background: BLUE }}>
                <Cpu size={12} /> DATA & IA · MODULE GRAND PUBLIC
              </div>

              <h1 className="text-5xl lg:text-6xl font-black tracking-tight text-white mb-4 leading-tight">
                Je suis Monsieur<br />
                <span style={{ color: PINK }}>Tout le Monde</span>
              </h1>
              <p className="text-lg text-white/60 max-w-xl mb-2">
                Comment utiliser l'IA dans mon quotidien sans faire n'importe quoi ?
              </p>
              <p className="text-sm text-white/40 max-w-md mb-12">
                12 situations réelles · 4 modules · Sans jargon · Score de maturité IA
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl w-full mb-12">
                {MODULES_META.map((m) => (
                  <div key={m.num} className="border border-white/10 p-4 text-left" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <div className="mb-2 text-white/60" style={{ color: m.color }}>{m.icon}</div>
                    <div className="text-xs text-white/40 mb-1">Module {m.num}</div>
                    <div className="text-xs font-bold text-white leading-snug">{m.title}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => setPhase('scenario')}
                className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold text-base hover:opacity-90 transition-opacity"
                style={{ background: BLUE }}>
                Commencer les 12 situations <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ═══ SCÉNARIO ═════════════════════════════════════════════════════ */}
        {phase === 'scenario' && currentScenario && (
          <motion.div key={`scenario-${currentIndex}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="min-h-screen flex flex-col lg:flex-row">

            {/* Panneau gauche — contexte */}
            <div className="lg:w-5/12 flex flex-col border-r border-gray-200" style={{ background: DARK }}>
              {/* Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-white/10">
                <button onClick={() => setLocation('/data-ia/roleplay')}
                  className="flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors">
                  <ChevronLeft size={14} /> Retour
                </button>
                <div className="text-xs text-white/40">{currentIndex + 1} / {TOTAL_SCENARIOS}</div>
              </div>

              {/* Module badge */}
              <div className="px-6 pt-6 pb-2">
                <div className="inline-flex items-center gap-2 px-2 py-1 text-xs font-bold uppercase tracking-wider text-white mb-4"
                  style={{ background: currentModule?.color ?? BLUE }}>
                  {currentModule?.icon}
                  Module {currentScenario.module} — {currentScenario.moduleTitle}
                </div>
                <h2 className="text-2xl font-black text-white mb-4 leading-tight">{currentScenario.title}</h2>
              </div>

              {/* Contexte */}
              <div className="px-6 pb-6">
                <div className="text-xs font-bold uppercase tracking-wider text-white/40 mb-2">Contexte</div>
                <div className="border-l-2 pl-4 py-2" style={{ borderColor: currentModule?.color ?? BLUE }}>
                  <p className="text-white/70 text-sm leading-relaxed">{currentScenario.context}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-auto px-6 pb-6">
                <div className="flex justify-between text-xs text-white/30 mb-1.5">
                  <span>Progression</span>
                  <span>{currentIndex} / {TOTAL_SCENARIOS} terminés</span>
                </div>
                <div className="h-1 w-full bg-white/10">
                  <div className="h-1 transition-all" style={{ width: `${(currentIndex / TOTAL_SCENARIOS) * 100}%`, background: currentModule?.color ?? BLUE }} />
                </div>
              </div>
            </div>

            {/* Panneau droite — situation + choix */}
            <div className="flex-1 flex flex-col justify-center px-8 lg:px-14 py-10" style={{ background: '#fafafa' }}>
              <div className="max-w-lg">
                <div className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: currentModule?.color ?? BLUE }}>Situation</div>
                <p className="text-lg font-bold text-gray-900 mb-8 leading-snug">{currentScenario.situation}</p>

                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Que fais-tu ?</div>
                <div className="space-y-3">
                  {currentScenario.choices.map((choice, i) => (
                    <button key={i} onClick={() => handleChoice(choice)}
                      className="w-full text-left px-5 py-4 border-2 border-gray-200 bg-white hover:border-gray-400 font-medium text-sm text-gray-800 transition-all"
                      style={{ fontFamily: 'inherit' }}>
                      <span className="inline-block w-5 h-5 text-xs font-black text-center mr-3 text-white flex-shrink-0"
                        style={{ background: currentModule?.color ?? BLUE, lineHeight: '20px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {choice.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══ FEEDBACK UNIFIÉ ══════════════════════════════════════════════ */}
        {phase === 'answered' && currentScenario && selectedChoice && (() => {
          const enrich = getEnrichment(currentScenario.category);
          const correct = selectedChoice.isCorrect;
          const pts = selectedChoice.points;
          const modColor = currentModule?.color ?? BLUE;

          return (
            <motion.div key="feedback" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="h-screen flex flex-col" style={{ background: '#fafafa' }}>

              {/* Bandeau verdict + bouton suivant */}
              <div className={`border-l-4 px-5 py-3 flex items-center gap-3 flex-shrink-0 ${correct ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                {correct
                  ? <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                  : <XCircle size={20} className="text-red-500 flex-shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-black ${correct ? 'text-green-700' : 'text-red-700'}`}>
                    {correct ? 'Bon réflexe !' : 'Ce n\'était pas le bon choix'}
                  </div>
                  <div className={`text-xs leading-snug ${correct ? 'text-green-600' : 'text-red-600'} truncate`}>
                    {selectedChoice.feedback}
                  </div>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 mr-4 ${correct ? 'text-green-600' : 'text-red-600'}`}>
                  {pts > 0 ? '+' : ''}{pts} pts
                </span>
                <button onClick={handleNext} disabled={loadingNext}
                  className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 text-white font-bold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                  style={{ background: BLUE }}>
                  {loadingNext
                    ? <><Loader2 size={14} className="animate-spin" />Chargement…</>
                    : currentIndex + 1 >= TOTAL_SCENARIOS
                      ? <><Trophy size={14} />Voir mon bilan</>
                      : <>Situation suivante <ArrowRight size={14} /></>}
                </button>
              </div>

              {/* À retenir + réflexe */}
              <div className="px-5 py-3 border-b border-gray-200 flex-shrink-0" style={{ background: `${modColor}06` }}>
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: modColor }}>À retenir</div>
                    <p className="text-xs font-semibold text-gray-600 leading-snug">{enrich.resumeCle}</p>
                  </div>
                  <div className="flex-1 min-w-0 border-l border-gray-200 pl-4">
                    <div className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: modColor }}>Ce scénario</div>
                    <p className="text-xs font-bold text-gray-900 leading-snug">{currentScenario.reflexe}</p>
                  </div>
                </div>
              </div>

              {/* Grille 3 colonnes */}
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
                    {currentScenario.redFlags.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <AlertTriangle size={11} className="flex-shrink-0 mt-0.5" style={{ color: PINK }} />
                        <span className="text-xs text-gray-700 leading-snug">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })()}

        {/* ═══ BILAN FINAL ══════════════════════════════════════════════════ */}
        {phase === 'final' && (
          <motion.div key="final" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col" style={{ background: '#fafafa' }}>

            {/* En-tête */}
            <div className="px-8 lg:px-14 py-12 border-b border-gray-100 text-center" style={{ background: DARK }}>
              <div className="text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 inline-block text-white" style={{ background: BLUE }}>
                Module terminé · Bilan de maturité IA
              </div>
              <h1 className="text-5xl font-black tracking-tight mb-4 text-white">Votre profil IA</h1>
              <div className="w-16 h-1 mx-auto mb-8" style={{ background: PINK }} />

              <div className="flex flex-col items-center gap-5">
                <div className="flex items-end gap-2">
                  <span className="text-8xl font-black" style={{ color: score >= 0 ? '#60a5fa' : PINK }}>{score}</span>
                  <span className="text-2xl text-white/40 mb-4">/ {MAX_SCORE}</span>
                </div>
                <div className="px-8 py-3 border-2 inline-flex items-center gap-3"
                  style={{ borderColor: badge.border, background: badge.bg, color: badge.color }}>
                  <span className="text-2xl">{badge.emoji}</span>
                  <span className="text-xl font-black uppercase tracking-wider">{badge.label}</span>
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div className="flex-1 px-8 lg:px-14 py-12">
              <div className="max-w-3xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                  {/* Résultats */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Résultats</div>
                    {[
                      { label: 'Situations réussies', value: `${TOTAL_SCENARIOS - wrongCount} / ${TOTAL_SCENARIOS}`, icon: <CheckCircle size={15} className="text-green-500" /> },
                      { label: 'Score final', value: `${score} pts`, icon: <BarChart2 size={15} style={{ color: BLUE }} /> },
                      { label: 'Profil de maturité', value: badge.label, icon: <span>{badge.emoji}</span> },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="flex items-center justify-between py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">{icon}{label}</div>
                        <div className="text-sm font-bold text-gray-900">{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Ce que ça veut dire */}
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Ce que ça veut dire</div>
                    <div className="p-4 border border-gray-200 bg-white">
                      {badge.label === 'Utilisateur Intelligent' && (
                        <p className="text-sm text-gray-700 leading-relaxed">Tu maîtrises les fondamentaux de l'IA : tu l'utilises avec discernement, tu vérifies les informations, et tu protèges tes données. Continue comme ça !</p>
                      )}
                      {badge.label === 'Utilisateur Prudent' && (
                        <p className="text-sm text-gray-700 leading-relaxed">Tu as de bons instincts mais quelques angles morts. Travaille particulièrement sur la vérification des sources et la protection des données sensibles.</p>
                      )}
                      {badge.label === 'Dépendant Naïf' && (
                        <p className="text-sm text-gray-700 leading-relaxed">Tu fais trop confiance à l'IA et tu sous-estimes ses risques. La bonne nouvelle : quelques réflexes simples suffisent à changer complètement la donne.</p>
                      )}
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Les 3 règles d'or</div>
                      {[
                        'Vérifie toujours les infos importantes sur des sources primaires',
                        'N\'envoie jamais de données sensibles à une IA non validée',
                        'Personnalise toujours ce que l\'IA génère avant de le partager',
                      ].map((r, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-4 h-4 flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5" style={{ background: BLUE }}>{i + 1}</div>
                          <span className="text-xs text-gray-700 leading-snug">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex flex-wrap gap-4">
                  <button onClick={handleRestart}
                    className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm hover:opacity-90 transition-opacity"
                    style={{ background: BLUE }}>
                    <RefreshCw size={14} /> Recommencer
                  </button>
                  <button onClick={() => setLocation('/data-ia/roleplay')}
                    className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm border-2 border-gray-300 hover:border-gray-500 transition-colors bg-white">
                    <ChevronLeft size={14} /> Retour aux modules
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
