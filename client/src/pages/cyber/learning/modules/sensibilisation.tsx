import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, ShieldCheck, AlertTriangle, Book, Target, 
  Trophy, ArrowLeft, ChevronRight, Smartphone, Briefcase, 
  Lightbulb, CheckCircle, HelpCircle, PenTool, UserCheck, Brain
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

// Types pour les contenus d'apprentissage
interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  explanation?: string;
  category: string;
}

interface Scenario {
  id: string;
  title: string;
  description: string;
  situation: string;
  questions: Question[];
  tips: string[];
  references: {
    title: string;
    url: string;
    source: string;
  }[];
}

interface Level {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  scenarios: Scenario[];
  minScoreToPass: number;
}

// États pour la progression et les réponses
interface UserResponse {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  scenarioId: string;
}

// Définition des 5 niveaux d'apprentissage pour la sensibilisation cybersécurité
const sensibilisationLevels: Level[] = [
  {
    id: 'basics',
    title: 'Les fondamentaux de la cybersécurité',
    description: 'Comprendre les concepts de base et les principales menaces cyber',
    icon: <Shield className="h-8 w-8" />,
    minScoreToPass: 70,
    scenarios: [
      {
        id: 'phishing-intro',
        title: 'Reconnaître une tentative de phishing',
        description: 'Apprenez à identifier les emails de phishing et éviter les pièges courants',
        situation: `Vous recevez un email qui semble provenir de votre banque vous demandant de vous connecter d'urgence à votre compte pour vérifier une transaction suspecte. L'email contient un lien et mentionne que votre compte sera bloqué si vous n'agissez pas rapidement.`,
        questions: [
          {
            id: 'phishing-signs',
            text: 'Quels éléments dans cet email devraient éveiller vos soupçons ?',
            category: 'identification',
            options: [
              {
                id: 'signs-1',
                text: 'Le sentiment d'urgence et la menace de bloquer le compte',
                isCorrect: true,
                explanation: 'Les emails de phishing utilisent souvent l'urgence et la peur pour pousser la victime à agir sans réfléchir.'
              },
              {
                id: 'signs-2',
                text: 'La présence d'un lien direct vers une page de connexion',
                isCorrect: true,
                explanation: 'Les emails légitimes des banques vous demandent généralement de vous connecter via leur site web officiel, pas via un lien direct.'
              },
              {
                id: 'signs-3',
                text: 'La banque vous contacte par email pour une transaction suspecte',
                isCorrect: false,
                explanation: 'Les banques peuvent vous contacter par email pour vous alerter, mais elles ne demanderont jamais vos identifiants par ce canal.'
              },
              {
                id: 'signs-4',
                text: 'L\'email est écrit dans une langue étrangère',
                isCorrect: false,
                explanation: 'Ce n\'est pas mentionné dans la situation, et les emails de phishing sont souvent bien rédigés dans la langue de la cible.'
              }
            ]
          },
          {
            id: 'phishing-action',
            text: 'Quelle est la meilleure action à entreprendre face à cet email ?',
            category: 'action',
            options: [
              {
                id: 'action-1',
                text: 'Cliquer sur le lien mais ne pas entrer vos identifiants',
                isCorrect: false,
                explanation: 'Même sans entrer vos identifiants, cliquer sur un lien malveillant peut installer des logiciels malveillants sur votre appareil.'
              },
              {
                id: 'action-2',
                text: 'Ignorer l\'email et contacter directement votre banque via les coordonnées officielles',
                isCorrect: true,
                explanation: 'C\'est la meilleure pratique : vérifier directement auprès de la source via les canaux officiels.'
              },
              {
                id: 'action-3',
                text: 'Répondre à l\'email pour demander plus d\'informations',
                isCorrect: false,
                explanation: 'Répondre à un email de phishing confirme que votre adresse est active et peut entraîner plus de tentatives.'
              },
              {
                id: 'action-4',
                text: 'Transférer l\'email à un collègue pour avoir son avis',
                isCorrect: false,
                explanation: 'Vous risquez d\'exposer votre collègue à la même menace. Mieux vaut signaler le mail aux équipes IT ou cybersécurité.'
              }
            ]
          },
          {
            id: 'phishing-prevention',
            text: 'Quelle mesure préventive est la plus efficace contre le phishing ?',
            category: 'prevention',
            options: [
              {
                id: 'prevention-1',
                text: 'Utiliser un antivirus performant',
                isCorrect: false,
                explanation: 'Un antivirus est important mais n\'empêche pas de cliquer sur un lien de phishing et de divulguer ses identifiants.'
              },
              {
                id: 'prevention-2',
                text: 'Se méfier des emails qui créent un sentiment d\'urgence',
                isCorrect: true,
                explanation: 'La vigilance est la première ligne de défense contre le phishing. L\'urgence est un indicateur typique des tentatives de phishing.'
              },
              {
                id: 'prevention-3',
                text: 'Ne jamais ouvrir d\'emails provenant d\'expéditeurs inconnus',
                isCorrect: false,
                explanation: 'C\'est trop restrictif et peu pratique. De plus, les attaques de phishing peuvent venir d\'expéditeurs connus dont les comptes ont été compromis.'
              },
              {
                id: 'prevention-4',
                text: 'Désactiver JavaScript dans son navigateur',
                isCorrect: false,
                explanation: 'Cette mesure est trop extrême et rendra de nombreux sites web inutilisables, sans bloquer efficacement toutes les formes de phishing.'
              }
            ]
          }
        ],
        tips: [
          'Vérifiez toujours l\'adresse email complète de l\'expéditeur, pas seulement le nom affiché',
          'Passez votre souris sur les liens sans cliquer pour voir l\'URL réelle',
          'Les fautes d\'orthographe et de grammaire sont souvent des indices de phishing',
          'En cas de doute, contactez directement l\'organisation par téléphone ou via son site officiel'
        ],
        references: [
          {
            title: 'Guide sur le phishing',
            url: 'https://www.ssi.gouv.fr/entreprise/glossaire/p/',
            source: 'ANSSI'
          },
          {
            title: 'Comment détecter et éviter les tentatives de phishing',
            url: 'https://www.cybermalveillance.gouv.fr/tous-nos-contenus/fiches-reflexes/hameconnage-phishing',
            source: 'Cybermalveillance.gouv.fr'
          }
        ]
      }
    ]
  },
  {
    id: 'passwords',
    title: 'Gestion des mots de passe et authentification',
    description: 'Maîtriser les bonnes pratiques pour sécuriser ses accès',
    icon: <UserCheck className="h-8 w-8" />,
    minScoreToPass: 75,
    scenarios: [
      {
        id: 'password-practices',
        title: 'Créer et gérer des mots de passe robustes',
        description: 'Apprenez à créer et gérer efficacement des mots de passe sécurisés',
        situation: `Votre entreprise vient d'adopter une nouvelle politique de sécurité qui exige des mots de passe plus robustes et une authentification à deux facteurs (2FA) pour tous les systèmes. Vous devez mettre à jour vos identifiants et former votre équipe aux bonnes pratiques.`,
        questions: [
          {
            id: 'password-strength',
            text: 'Parmi ces mots de passe, lequel est le plus sécurisé ?',
            category: 'identification',
            options: [
              {
                id: 'pwd-1',
                text: 'Azerty123!',
                isCorrect: false,
                explanation: 'Ce mot de passe utilise une séquence de clavier prévisible avec quelques chiffres et un symbole, ce qui le rend facile à deviner.'
              },
              {
                id: 'pwd-2',
                text: 'P@ss$w0rd2023',
                isCorrect: false,
                explanation: 'Malgré l\'utilisation de caractères spéciaux et de chiffres, ce mot de passe utilise des substitutions communes (@ pour a, $ pour s, 0 pour o) qui sont connues des attaquants.'
              },
              {
                id: 'pwd-3',
                text: 'M0n*Ch@t#Est?Mignon',
                isCorrect: true,
                explanation: 'C\'est une phrase longue avec des caractères spéciaux et des substitutions à des positions variées, ce qui la rend difficile à craquer.'
              },
              {
                id: 'pwd-4',
                text: 'ANSSI-2023-fr',
                isCorrect: false,
                explanation: 'Ce mot de passe contient des informations prévisibles (année, organisation) et manque de complexité.'
              }
            ]
          },
          {
            id: 'password-management',
            text: 'Quelle est la meilleure façon de gérer de multiples mots de passe complexes ?',
            category: 'action',
            options: [
              {
                id: 'mgmt-1',
                text: 'Utiliser le même mot de passe complexe pour tous les services',
                isCorrect: false,
                explanation: 'Si ce mot de passe unique est compromis, tous vos comptes seront vulnérables.'
              },
              {
                id: 'mgmt-2',
                text: 'Créer une feuille Excel protégée par mot de passe contenant tous vos identifiants',
                isCorrect: false,
                explanation: 'Les fichiers Excel, même protégés, ne sont pas conçus pour stocker des informations sensibles et peuvent être vulnérables.'
              },
              {
                id: 'mgmt-3',
                text: 'Utiliser un gestionnaire de mots de passe réputé',
                isCorrect: true,
                explanation: 'Les gestionnaires de mots de passe sont conçus pour stocker de manière sécurisée des identifiants avec un chiffrement fort.'
              },
              {
                id: 'mgmt-4',
                text: 'Noter les mots de passe dans un carnet conservé dans un lieu sûr',
                isCorrect: false,
                explanation: 'Bien que physiquement sécurisé, cette méthode n\'offre pas de sauvegarde, de partage sécurisé ou d\'accès à distance.'
              }
            ]
          },
          {
            id: '2fa-methods',
            text: 'Quelle méthode d\'authentification à deux facteurs (2FA) est généralement la plus sécurisée ?',
            category: 'prevention',
            options: [
              {
                id: '2fa-1',
                text: 'SMS sur téléphone mobile',
                isCorrect: false,
                explanation: 'Les SMS peuvent être interceptés ou détournés via des attaques de type SIM swapping (usurpation de carte SIM).'
              },
              {
                id: '2fa-2',
                text: 'Applications d\'authentification (comme Google Authenticator, Microsoft Authenticator)',
                isCorrect: true,
                explanation: 'Ces applications génèrent des codes temporaires localement sur l\'appareil, sans transmission réseau, ce qui les rend très sécurisées.'
              },
              {
                id: '2fa-3',
                text: 'Email secondaire',
                isCorrect: false,
                explanation: 'L\'email est moins sécurisé car si un attaquant compromet votre principal compte email, il pourrait également accéder à votre email secondaire.'
              },
              {
                id: '2fa-4',
                text: 'Questions de sécurité prédéfinies',
                isCorrect: false,
                explanation: 'Les réponses aux questions de sécurité peuvent souvent être devinées ou trouvées via l\'ingénierie sociale ou les réseaux sociaux.'
              }
            ]
          }
        ],
        tips: [
          'Utilisez des phrases de passe plutôt que des mots de passe simples',
          'Activez l\'authentification à deux facteurs partout où c\'est possible',
          'Ne réutilisez jamais le même mot de passe sur différents services',
          'Changez vos mots de passe immédiatement si un service que vous utilisez subit une fuite de données'
        ],
        references: [
          {
            title: 'Recommandations de l\'ANSSI sur les mots de passe',
            url: 'https://www.ssi.gouv.fr/guide/mot-de-passe/',
            source: 'ANSSI'
          },
          {
            title: 'Guide sur l\'authentification multi-facteurs',
            url: 'https://www.cnil.fr/fr/authentification-multifacteur-comment-se-proteger',
            source: 'CNIL'
          }
        ]
      }
    ]
  },
  {
    id: 'data-protection',
    title: 'Protection des données sensibles',
    description: 'Sécuriser les informations confidentielles et respecter la vie privée',
    icon: <Briefcase className="h-8 w-8" />,
    minScoreToPass: 80,
    scenarios: [
      {
        id: 'data-classification',
        title: 'Classification et protection des données',
        description: 'Apprenez à classifier et protéger différents types de données selon leur sensibilité',
        situation: `Votre équipe travaille sur un nouveau projet confidentiel impliquant des données client sensibles. Vous devez établir des protocoles pour la classification, le stockage et le partage de ces données, conformément au RGPD et aux politiques internes de l'entreprise.`,
        questions: [
          {
            id: 'data-types',
            text: 'Parmi ces données, lesquelles sont considérées comme des données personnelles sensibles selon le RGPD ?',
            category: 'identification',
            options: [
              {
                id: 'data-1',
                text: 'Les adresses email professionnelles',
                isCorrect: false,
                explanation: 'Les adresses email professionnelles sont des données personnelles, mais pas des données sensibles au sens du RGPD.'
              },
              {
                id: 'data-2',
                text: 'Les opinions politiques et l\'appartenance syndicale',
                isCorrect: true,
                explanation: 'Ces informations font partie des catégories spéciales de données (sensibles) définies par l\'article 9 du RGPD.'
              },
              {
                id: 'data-3',
                text: 'Les noms et prénoms des clients',
                isCorrect: false,
                explanation: 'Les noms et prénoms sont des données personnelles mais ne sont pas considérés comme sensibles au sens du RGPD.'
              },
              {
                id: 'data-4',
                text: 'Les données de santé et l\'orientation sexuelle',
                isCorrect: true,
                explanation: 'Ces informations font partie des catégories spéciales de données (sensibles) définies par l\'article 9 du RGPD.'
              }
            ]
          },
          {
            id: 'data-sharing',
            text: 'Quelle méthode est la plus sécurisée pour partager des fichiers contenant des données sensibles avec des collaborateurs externes ?',
            category: 'action',
            options: [
              {
                id: 'sharing-1',
                text: 'Envoyer les fichiers par email en pièce jointe',
                isCorrect: false,
                explanation: 'Les emails standard ne sont pas chiffrés de bout en bout et les pièces jointes peuvent être interceptées.'
              },
              {
                id: 'sharing-2',
                text: 'Utiliser une plateforme de partage de fichiers sécurisée avec authentification et chiffrement',
                isCorrect: true,
                explanation: 'Ces plateformes offrent plusieurs niveaux de protection : chiffrement, contrôle d\'accès, traçabilité et révocation d\'accès.'
              },
              {
                id: 'sharing-3',
                text: 'Partager via un service cloud grand public (comme Dropbox personnel)',
                isCorrect: false,
                explanation: 'Les comptes personnels sur les services cloud grand public n\'offrent généralement pas les garanties de conformité nécessaires pour les données professionnelles sensibles.'
              },
              {
                id: 'sharing-4',
                text: 'Envoyer les fichiers sur une clé USB par courrier postal',
                isCorrect: false,
                explanation: 'Les supports physiques peuvent être perdus, volés ou endommagés pendant le transport, et il n\'y a pas de garantie de remise au bon destinataire.'
              }
            ]
          },
          {
            id: 'data-protection',
            text: 'Quelle mesure de protection des données est obligatoire selon le RGPD pour les entreprises traitant des données sensibles à grande échelle ?',
            category: 'compliance',
            options: [
              {
                id: 'protection-1',
                text: 'La nomination d\'un Délégué à la Protection des Données (DPO)',
                isCorrect: true,
                explanation: 'Le RGPD exige la désignation d\'un DPO pour les organisations qui traitent des données sensibles à grande échelle.'
              },
              {
                id: 'protection-2',
                text: 'L\'utilisation exclusive de serveurs situés dans l\'UE',
                isCorrect: false,
                explanation: 'Le RGPD permet les transferts de données hors UE sous certaines conditions (décisions d\'adéquation, clauses contractuelles types, etc.).'
              },
              {
                id: 'protection-3',
                text: 'Le chiffrement de toutes les données stockées',
                isCorrect: false,
                explanation: 'Le chiffrement est recommandé mais pas explicitement obligatoire dans tous les cas. Le RGPD exige des mesures techniques et organisationnelles appropriées.'
              },
              {
                id: 'protection-4',
                text: 'La souscription à une cyber-assurance',
                isCorrect: false,
                explanation: 'La cyber-assurance n\'est pas une exigence du RGPD, bien qu\'elle puisse être une bonne pratique de gestion des risques.'
              }
            ]
          }
        ],
        tips: [
          'Réalisez une analyse d\'impact relative à la protection des données (AIPD) pour les traitements à risque',
          'Appliquez le principe de minimisation des données : ne collectez que ce qui est nécessaire',
          'Mettez en place une politique de conservation limitée dans le temps',
          'Documentez toutes vos mesures de protection pour démontrer votre conformité'
        ],
        references: [
          {
            title: 'Guide RGPD pour les entreprises',
            url: 'https://www.cnil.fr/fr/rgpd-guide-de-la-securite-des-donnees-personnelles',
            source: 'CNIL'
          },
          {
            title: 'Recommandations sur la protection des données sensibles',
            url: 'https://www.enisa.europa.eu/topics/data-protection',
            source: 'ENISA'
          }
        ]
      }
    ]
  },
  {
    id: 'mobile-security',
    title: 'Sécurité des appareils mobiles',
    description: 'Protéger les smartphones et tablettes contre les menaces',
    icon: <Smartphone className="h-8 w-8" />,
    minScoreToPass: 80,
    scenarios: [
      {
        id: 'mobile-threats',
        title: 'Sécurité des appareils mobiles professionnels',
        description: 'Découvrez comment protéger les appareils mobiles contre les principales menaces',
        situation: `Votre entreprise a mis en place une politique BYOD (Bring Your Own Device) permettant aux employés d'utiliser leurs appareils personnels pour accéder aux ressources de l'entreprise. Vous êtes responsable d'établir les directives de sécurité pour cette nouvelle politique.`,
        questions: [
          {
            id: 'mobile-risks',
            text: 'Quels sont les risques majeurs liés à l\'utilisation d\'appareils mobiles personnels dans un contexte professionnel ?',
            category: 'identification',
            options: [
              {
                id: 'risk-1',
                text: 'Mélange des données personnelles et professionnelles',
                isCorrect: true,
                explanation: 'Sans séparation claire, les données de l\'entreprise peuvent être exposées via des applications personnelles non sécurisées.'
              },
              {
                id: 'risk-2',
                text: 'Les appareils personnels sont généralement plus performants',
                isCorrect: false,
                explanation: 'La performance n\'est pas un risque de sécurité; au contraire, certains appareils professionnels sont optimisés pour la sécurité plutôt que pour la performance.'
              },
              {
                id: 'risk-3',
                text: 'Manque de contrôle sur les mises à jour de sécurité',
                isCorrect: true,
                explanation: 'Les utilisateurs peuvent retarder les mises à jour critiques, laissant les appareils vulnérables à des failles connues.'
              },
              {
                id: 'risk-4',
                text: 'Connexion à des réseaux Wi-Fi non sécurisés',
                isCorrect: true,
                explanation: 'Les utilisateurs peuvent se connecter à des réseaux publics non sécurisés, exposant les données de l\'entreprise à des interceptions.'
              }
            ]
          },
          {
            id: 'mobile-measures',
            text: 'Quelles mesures sont essentielles pour sécuriser un appareil mobile utilisé en contexte professionnel ?',
            category: 'action',
            options: [
              {
                id: 'measure-1',
                text: 'Installer uniquement des applications provenant des stores officiels',
                isCorrect: true,
                explanation: 'Les applications des stores officiels sont généralement vérifiées, réduisant le risque de malwares.'
              },
              {
                id: 'measure-2',
                text: 'Désactiver complètement le Wi-Fi et le Bluetooth',
                isCorrect: false,
                explanation: 'Cette mesure est excessive et impraticable. La bonne pratique est de les désactiver lorsqu\'ils ne sont pas utilisés.'
              },
              {
                id: 'measure-3',
                text: 'Utiliser une solution MDM (Mobile Device Management)',
                isCorrect: true,
                explanation: 'Les solutions MDM permettent de gérer les politiques de sécurité et de séparer les données personnelles et professionnelles.'
              },
              {
                id: 'measure-4',
                text: 'Partitionner l\'appareil avec un conteneur sécurisé pour les données professionnelles',
                isCorrect: true,
                explanation: 'Cette approche crée une séparation claire entre les environnements personnels et professionnels, limitant les risques de fuite de données.'
              }
            ]
          },
          {
            id: 'mobile-incident',
            text: 'Quelle est la meilleure procédure à suivre en cas de perte ou de vol d\'un appareil mobile contenant des données d\'entreprise ?',
            category: 'incident',
            options: [
              {
                id: 'incident-1',
                text: 'Attendre 48 heures pour voir si l\'appareil réapparaît avant de signaler la perte',
                isCorrect: false,
                explanation: 'Tout délai augmente les risques d\'accès non autorisés aux données. La perte doit être signalée immédiatement.'
              },
              {
                id: 'incident-2',
                text: 'Signaler immédiatement l\'incident au service IT et activer l\'effacement à distance',
                isCorrect: true,
                explanation: 'Cette réponse rapide permet de minimiser les risques d\'accès aux données sensibles stockées sur l\'appareil.'
              },
              {
                id: 'incident-3',
                text: 'Demander à un collègue d\'utiliser ses identifiants pour changer vos mots de passe',
                isCorrect: false,
                explanation: 'Partager des identifiants viole les bonnes pratiques de sécurité et ne permet pas un suivi précis des actions prises.'
              },
              {
                id: 'incident-4',
                text: 'Contacter uniquement votre opérateur téléphonique pour bloquer la SIM',
                isCorrect: false,
                explanation: 'Bloquer la SIM n\'est pas suffisant, car les données peuvent toujours être accessibles via Wi-Fi ou en extrayant la mémoire de l\'appareil.'
              }
            ]
          }
        ],
        tips: [
          'Activez toujours le verrouillage automatique avec un code fort ou la biométrie',
          'Utilisez un VPN lors de la connexion à des réseaux Wi-Fi publics',
          'Sauvegardez régulièrement vos données de manière sécurisée',
          'Ne rootez/jailbreakez pas les appareils utilisés pour le travail'
        ],
        references: [
          {
            title: 'Guide de sécurité mobile pour les entreprises',
            url: 'https://www.ssi.gouv.fr/entreprise/guide/recommandations-de-securite-relatives-aux-ordiphones/',
            source: 'ANSSI'
          },
          {
            title: 'Bonnes pratiques BYOD',
            url: 'https://www.enisa.europa.eu/topics/iot-and-smart-infrastructures/smartphones',
            source: 'ENISA'
          }
        ]
      }
    ]
  },
  {
    id: 'incident-response',
    title: 'Réaction aux incidents de sécurité',
    description: 'Savoir identifier et réagir face à une attaque ou une fuite de données',
    icon: <AlertTriangle className="h-8 w-8" />,
    minScoreToPass: 85,
    scenarios: [
      {
        id: 'incident-handling',
        title: 'Gestion d\'un incident de cybersécurité',
        description: 'Apprenez les étapes essentielles pour réagir efficacement face à un incident',
        situation: `Un collègue vous informe que son poste de travail se comporte étrangement : ralentissements, fichiers inexplicablement chiffrés avec l'extension ".locked", et une fenêtre pop-up demandant un paiement en Bitcoin pour récupérer l'accès aux données. Vous suspectez une attaque par ransomware (rançongiciel).`,
        questions: [
          {
            id: 'incident-signs',
            text: 'Quels sont les signes qui confirment qu\'il s\'agit probablement d\'un ransomware ?',
            category: 'identification',
            options: [
              {
                id: 'sign-1',
                text: 'Fichiers chiffrés avec une extension inhabituelle',
                isCorrect: true,
                explanation: 'Les ransomwares modifient généralement l\'extension des fichiers chiffrés pour les rendre inaccessibles.'
              },
              {
                id: 'sign-2',
                text: 'Demande de paiement pour récupérer l\'accès aux données',
                isCorrect: true,
                explanation: 'L\'exigence d\'une rançon est la caractéristique définissant un ransomware.'
              },
              {
                id: 'sign-3',
                text: 'Ralentissement notable du système',
                isCorrect: true,
                explanation: 'Le processus de chiffrement des fichiers consomme beaucoup de ressources, ce qui ralentit le système.'
              },
              {
                id: 'sign-4',
                text: 'Connexions répétées à l\'imprimante du réseau',
                isCorrect: false,
                explanation: 'Les connexions à l\'imprimante ne sont pas spécifiquement liées aux ransomwares, bien que certains malwares sophistiqués puissent cibler les imprimantes dans un second temps.'
              }
            ]
          },
          {
            id: 'immediate-actions',
            text: 'Quelles sont les actions immédiates à entreprendre dans cette situation ?',
            category: 'action',
            options: [
              {
                id: 'action-1',
                text: 'Payer immédiatement la rançon pour limiter les dégâts',
                isCorrect: false,
                explanation: 'Le paiement de la rançon n\'est jamais recommandé comme première action. Il n\'y a aucune garantie de récupération des données et cela encourage les attaquants.'
              },
              {
                id: 'action-2',
                text: 'Déconnecter physiquement la machine du réseau',
                isCorrect: true,
                explanation: 'Isoler rapidement la machine infectée empêche la propagation du ransomware à d\'autres systèmes du réseau.'
              },
              {
                id: 'action-3',
                text: 'Éteindre immédiatement l\'ordinateur',
                isCorrect: true,
                explanation: 'Éteindre la machine peut arrêter le processus de chiffrement en cours et préserver certaines données non encore chiffrées.'
              },
              {
                id: 'action-4',
                text: 'Tenter de désinstaller des programmes suspects',
                isCorrect: false,
                explanation: 'Cette action peut alerter le malware qui pourrait accélérer le chiffrement ou s\'auto-répliquer. De plus, elle peut détruire des preuves numériques importantes.'
              }
            ]
          },
          {
            id: 'incident-report',
            text: 'Qui devrait être informé en priorité dans ce type d\'incident ?',
            category: 'communication',
            options: [
              {
                id: 'report-1',
                text: 'L\'équipe de sécurité informatique ou le responsable IT',
                isCorrect: true,
                explanation: 'Les experts en sécurité de l\'organisation sont les mieux placés pour coordonner la réponse initiale à l\'incident.'
              },
              {
                id: 'report-2',
                text: 'Les forces de l\'ordre (police, gendarmerie)',
                isCorrect: false,
                explanation: 'Bien qu\'important, le signalement aux autorités n\'est généralement pas la première action. L\'équipe IT doit d\'abord évaluer l\'incident.'
              },
              {
                id: 'report-3',
                text: 'Tous les collègues par email pour les alerter',
                isCorrect: false,
                explanation: 'Envoyer un email à tous pourrait créer une panique inutile et les canaux de communication standard pourraient être compromis.'
              },
              {
                id: 'report-4',
                text: 'Uniquement votre supérieur hiérarchique direct',
                isCorrect: false,
                explanation: 'Bien qu\'important, informer uniquement le supérieur hiérarchique peut retarder la réponse technique nécessaire.'
              }
            ]
          },
          {
            id: 'prevention-future',
            text: 'Quelles mesures aideraient à prévenir ce type d\'incident à l\'avenir ?',
            category: 'prevention',
            options: [
              {
                id: 'prevention-1',
                text: 'Maintenir une politique de sauvegarde régulière hors ligne (offline)',
                isCorrect: true,
                explanation: 'Les sauvegardes hors ligne ne peuvent pas être atteintes par le ransomware et permettent la restauration des données sans payer de rançon.'
              },
              {
                id: 'prevention-2',
                text: 'Installer plusieurs antivirus sur chaque poste',
                isCorrect: false,
                explanation: 'Installer plusieurs antivirus crée des conflits et dégrade les performances sans améliorer significativement la sécurité.'
              },
              {
                id: 'prevention-3',
                text: 'Appliquer régulièrement les mises à jour de sécurité',
                isCorrect: true,
                explanation: 'Les mises à jour comblent les vulnérabilités connues que les ransomwares exploitent souvent pour l\'infection initiale.'
              },
              {
                id: 'prevention-4',
                text: 'Former les utilisateurs à reconnaître les menaces et signaler les comportements suspects',
                isCorrect: true,
                explanation: 'La sensibilisation des utilisateurs est essentielle, car de nombreuses infections par ransomware commencent par une action humaine (clic sur un lien malveillant, ouverture d\'une pièce jointe).'
              }
            ]
          }
        ],
        tips: [
          'Disposez d\'un plan de réponse aux incidents documenté et testé',
          'Maintenez des sauvegardes hors ligne et testez régulièrement leur restauration',
          'Segmentez votre réseau pour limiter la propagation en cas d\'infection',
          'Documentez toutes les actions prises pendant un incident pour analyse ultérieure'
        ],
        references: [
          {
            title: 'Guide sur la réponse aux incidents',
            url: 'https://www.ssi.gouv.fr/guide/guide-gestion-incidents-securite/',
            source: 'ANSSI'
          },
          {
            title: 'Recommandations contre les ransomwares',
            url: 'https://www.cybermalveillance.gouv.fr/tous-nos-contenus/fiches-reflexes/rancongiciels-ransomwares',
            source: 'Cybermalveillance.gouv.fr'
          }
        ]
      }
    ]
  }
];

// Composant pour afficher un scénario individuel
const ScenarioCard: React.FC<{
  scenario: Scenario;
  onStart: () => void;
  isDark: boolean;
}> = ({ scenario, onStart, isDark }) => {
  return (
    <Card className={`w-full ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white'}`}>
      <CardHeader>
        <CardTitle className="text-blue-700">
          {scenario.title}
        </CardTitle>
        <CardDescription className={isDark ? 'text-slate-300' : 'text-slate-700'}>
          {scenario.description}
        </CardDescription>
      </CardHeader>
      <CardContent className={isDark ? 'text-slate-400' : 'text-slate-700'}>
        <p className="mb-4">
          <span className="font-semibold text-blue-700">Mise en situation :</span><br />
          {scenario.situation}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className={isDark ? 'border-blue-700 text-blue-500' : 'border-blue-300 text-blue-700'}>
            {scenario.questions.length} questions
          </Badge>
          <Badge variant="outline" className={isDark ? 'border-amber-700 text-amber-500' : 'border-amber-300 text-amber-700'}>
            {scenario.tips.length} conseils
          </Badge>
          <Badge variant="outline" className={isDark ? 'border-emerald-700 text-emerald-500' : 'border-emerald-300 text-emerald-700'}>
            {scenario.references.length} références
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={onStart}
        >
          Commencer le scénario
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

// Composant pour afficher un niveau d'apprentissage
const LevelCard: React.FC<{
  level: Level;
  progress: number;
  isCompleted: boolean;
  isLocked: boolean;
  isActive: boolean;
  onClick: () => void;
  isDark: boolean;
}> = ({ level, progress, isCompleted, isLocked, isActive, onClick, isDark }) => {
  return (
    <Card 
      className={`relative w-full overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg
        ${isActive ? (isDark ? 'ring-2 ring-blue-500' : 'ring-2 ring-blue-400') : ''}
        ${isLocked ? 'opacity-60' : ''}
        ${isDark ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-white hover:bg-slate-50'}
      `}
      onClick={isLocked ? undefined : onClick}
    >
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
          <div className="bg-black/80 p-2 rounded-full">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
        </div>
      )}
      {isCompleted && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-green-500 p-1 rounded-full">
            <CheckCircle className="h-5 w-5 text-white" />
          </div>
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isLocked ? 'bg-gray-500' : isCompleted ? 'bg-green-500' : 'bg-blue-600'} text-white`}>
            {level.icon}
          </div>
          <div>
            <CardTitle className={`${isDark ? 'text-white' : 'text-blue-700'}`}>
              {level.title}
            </CardTitle>
            <CardDescription className={isDark ? 'text-slate-300' : 'text-slate-700'}>
              {level.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                Progression
              </span>
              <span className={isDark ? 'text-slate-400' : 'text-slate-700'}>
                {progress}%
              </span>
            </div>
            <Progress value={progress} className={`h-2 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
          </div>
          
          <div className="flex flex-wrap gap-1">
            <Badge variant="outline" className={`${isDark ? 'border-blue-700 text-blue-500' : 'border-blue-300 text-blue-700'}`}>
              {level.scenarios.length} scénarios
            </Badge>
            <Badge variant="outline" className={`${isDark ? 'border-amber-700 text-amber-500' : 'border-amber-300 text-amber-700'}`}>
              Score minimum: {level.minScoreToPass}%
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant pour le quiz
const QuizQuestion: React.FC<{
  question: Question;
  selectedOption: string | null;
  onSelectOption: (optionId: string) => void;
  showExplanation: boolean;
  isDark: boolean;
}> = ({ question, selectedOption, onSelectOption, showExplanation, isDark }) => {
  return (
    <div className={`w-full p-4 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-md`}>
      <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-blue-700'}`}>
        {question.text}
      </h3>
      
      <RadioGroup value={selectedOption || ''} className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrect = option.isCorrect;
          const showResult = showExplanation && isSelected;
          
          return (
            <div 
              key={option.id} 
              className={`relative rounded-lg border p-3 transition-all
                ${isDark ? 'border-slate-700' : 'border-slate-200'}
                ${isSelected ? (isDark ? 'border-blue-500' : 'border-blue-400') : ''}
                ${showResult && isCorrect ? (isDark ? 'border-green-600 bg-green-900/20' : 'border-green-500 bg-green-50') : ''}
                ${showResult && !isCorrect ? (isDark ? 'border-red-600 bg-red-900/20' : 'border-red-500 bg-red-50') : ''}
              `}
            >
              <div className="flex items-start">
                <RadioGroupItem
                  id={option.id}
                  value={option.id}
                  disabled={showExplanation}
                  onClick={() => onSelectOption(option.id)}
                  className={`${isDark ? 'text-white border-slate-600' : ''}`}
                />
                <Label
                  htmlFor={option.id}
                  className={`flex-grow ml-2 cursor-pointer ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                >
                  {option.text}
                </Label>
                {showResult && (
                  <div className="ml-2">
                    {isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              
              {showResult && (
                <div className={`mt-2 text-sm ${isCorrect ? (isDark ? 'text-green-400' : 'text-green-700') : (isDark ? 'text-red-400' : 'text-red-700')}`}>
                  {option.explanation}
                </div>
              )}
            </div>
          );
        })}
      </RadioGroup>
    </div>
  );
};

// Page principale du module Sensibilisation Cybersécurité
export default function SensibilisationCyberPage() {
  const [, setLocation] = useLocation();
  const { isDark } = useTheme();
  const { toast } = useToast();
  
  // États pour la progression de l'utilisateur
  const [activeLevel, setActiveLevel] = useState(sensibilisationLevels[0]);
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState<UserResponse[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [levelProgress, setLevelProgress] = useState<{[key: string]: number}>({
    'basics': 0,
    'passwords': 0,
    'data-protection': 0,
    'mobile-security': 0,
    'incident-response': 0
  });
  const [completedLevels, setCompletedLevels] = useState<string[]>([]);
  
  // État pour la navigation dans l'interface
  const [currentView, setCurrentView] = useState<'levels' | 'scenarios' | 'quiz' | 'results'>('levels');

  // Sélection d'un niveau
  const handleLevelSelect = (level: Level) => {
    setActiveLevel(level);
    setCurrentView('scenarios');
  };

  // Démarrage d'un scénario
  const handleStartScenario = (scenario: Scenario) => {
    setActiveScenario(scenario);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setUserResponses([]);
    setShowResults(false);
    setCurrentView('quiz');
  };

  // Sélection d'une option de réponse
  const handleSelectOption = (optionId: string) => {
    if (activeScenario && currentQuestionIndex < activeScenario.questions.length) {
      const currentQuestion = activeScenario.questions[currentQuestionIndex];
      const selectedOption = currentQuestion.options.find(option => option.id === optionId);
      
      if (selectedOption) {
        setSelectedOption(optionId);
      }
    }
  };

  // Progression vers la question suivante ou affichage des résultats
  const handleNextQuestion = () => {
    if (activeScenario && selectedOption) {
      const currentQuestion = activeScenario.questions[currentQuestionIndex];
      const selectedOptionObj = currentQuestion.options.find(opt => opt.id === selectedOption);
      
      // Enregistrer la réponse
      const newResponse: UserResponse = {
        questionId: currentQuestion.id,
        selectedOptionId: selectedOption,
        isCorrect: !!selectedOptionObj?.isCorrect,
        scenarioId: activeScenario.id
      };
      
      setUserResponses([...userResponses, newResponse]);
      
      // Passer à la question suivante ou aux résultats
      if (currentQuestionIndex < activeScenario.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
      } else {
        calculateResults();
      }
    }
  };
  
  // Calcul des résultats
  const calculateResults = () => {
    if (activeScenario) {
      const totalQuestions = activeScenario.questions.length;
      const correctAnswers = [...userResponses, {
        questionId: activeScenario.questions[currentQuestionIndex].id,
        selectedOptionId: selectedOption || '',
        isCorrect: !!activeScenario.questions[currentQuestionIndex].options.find(opt => opt.id === selectedOption)?.isCorrect,
        scenarioId: activeScenario.id
      }].filter(response => response.isCorrect).length;
      
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      
      // Mettre à jour la progression du niveau
      const levelId = activeLevel.id;
      const newProgress = {...levelProgress};
      
      // La progression est basée sur le meilleur score obtenu pour chaque scénario
      const scenarioProgress = Math.min(100, score);
      const scenarioWeight = 1 / activeLevel.scenarios.length;
      
      newProgress[levelId] = Math.round(
        (newProgress[levelId] || 0) + (scenarioProgress * scenarioWeight)
      );
      
      setLevelProgress(newProgress);
      
      // Vérifier si le niveau est complété
      if (newProgress[levelId] >= activeLevel.minScoreToPass && !completedLevels.includes(levelId)) {
        setCompletedLevels([...completedLevels, levelId]);
        
        toast({
          title: "Niveau complété !",
          description: `Félicitations ! Vous avez terminé le niveau "${activeLevel.title}" avec succès.`,
        });
      }
      
      setShowResults(true);
    }
  };
  
  // Revenir à la liste des scénarios
  const handleBackToScenarios = () => {
    setCurrentView('scenarios');
    setActiveScenario(null);
    setCurrentQuestionIndex(0);
    setUserResponses([]);
    setShowResults(false);
  };
  
  // Revenir à la liste des niveaux
  const handleBackToLevels = () => {
    setCurrentView('levels');
  };

  // Vérifier si un niveau est déverrouillé
  const isLevelLocked = (levelIndex: number): boolean => {
    if (levelIndex === 0) return false; // Premier niveau toujours déverrouillé
    
    const previousLevelId = sensibilisationLevels[levelIndex - 1].id;
    return !completedLevels.includes(previousLevelId);
  };
  
  // Obtenir le score actuel du quiz
  const getCurrentScore = (): number => {
    if (!activeScenario || userResponses.length === 0) return 0;
    
    const correctAnswers = userResponses.filter(response => response.isCorrect).length;
    return Math.round((correctAnswers / activeScenario.questions.length) * 100);
  };

  // Déterminer si l'option sélectionnée est correcte
  const isCurrentAnswerCorrect = (): boolean => {
    if (!activeScenario || selectedOption === null) return false;
    
    const currentQuestion = activeScenario.questions[currentQuestionIndex];
    const selectedOptionObj = currentQuestion.options.find(opt => opt.id === selectedOption);
    
    return !!selectedOptionObj?.isCorrect;
  };

  return (
    <HomeLayout>
      <PageTitle title="Sensibilisation Cybersécurité" />
      
      <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
        {/* Header avec navigation */}
        <header className={`py-6 ${isDark ? 'bg-slate-800/80' : 'bg-white'} shadow-sm backdrop-blur-sm sticky top-0 z-20`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                {currentView !== 'levels' ? (
                  <Button
                    variant="ghost"
                    className={`mb-2 sm:mb-0 ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'}`}
                    onClick={currentView === 'scenarios' ? handleBackToLevels : handleBackToScenarios}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {currentView === 'scenarios' ? 'Retour aux niveaux' : 'Retour aux scénarios'}
                  </Button>
                ) : (
                  <Link href="/cyber/learning/cyber-mastery">
                    <Button
                      variant="ghost"
                      className={`mb-2 sm:mb-0 ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-black'}`}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour à Cyber Mastery
                    </Button>
                  </Link>
                )}
              </div>
              
              <div className="flex items-center">
                <Shield className={`h-5 w-5 mr-2 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Sensibilisation Cybersécurité
                </h1>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={`font-normal ${isDark ? 'border-blue-500/50 text-blue-400' : 'border-blue-500 text-blue-600'}`}>
                  <Brain className="h-3 w-3 mr-1" />
                  IA intégrée
                </Badge>
                <Badge variant="outline" className={`font-normal ${isDark ? 'border-green-500/50 text-green-400' : 'border-green-500 text-green-600'}`}>
                  <PenTool className="h-3 w-3 mr-1" />
                  Interactif
                </Badge>
              </div>
            </div>
          </div>
        </header>
        
        <div className="container mx-auto px-4 py-8">
          {currentView === 'levels' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="max-w-4xl mx-auto text-center">
                <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Parcours de sensibilisation
                </h2>
                <p className={`mb-8 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Progressez à travers 5 niveaux d'apprentissage pour maîtriser les fondamentaux de la cybersécurité avec notre IA pédagogique. 
                  Chaque niveau propose des scénarios interactifs et des défis adaptés pour renforcer vos compétences.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sensibilisationLevels.map((level, index) => (
                  <LevelCard
                    key={level.id}
                    level={level}
                    progress={levelProgress[level.id] || 0}
                    isCompleted={completedLevels.includes(level.id)}
                    isLocked={isLevelLocked(index)}
                    isActive={activeLevel.id === level.id}
                    onClick={() => !isLevelLocked(index) && handleLevelSelect(level)}
                    isDark={isDark}
                  />
                ))}
              </div>
              
              <div className={`p-6 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'} shadow mt-8`}>
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-blue-700'}`}>
                  <Lightbulb className="inline-block mr-2 h-5 w-5" />
                  Votre parcours d'apprentissage
                </h3>
                <p className={`mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Ce module est conçu pour vous faire progresser étape par étape dans vos connaissances en cybersécurité. 
                  L'intelligence artificielle adapte les contenus et les évaluations à votre progression.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                  {sensibilisationLevels.map((level, index) => (
                    <div key={level.id} className="flex flex-col items-center text-center">
                      <div className={`p-3 rounded-full mb-2 
                        ${completedLevels.includes(level.id) 
                          ? 'bg-green-500' 
                          : isLevelLocked(index) 
                            ? 'bg-gray-500' 
                            : 'bg-blue-600'} 
                        text-white`}
                      >
                        {level.icon}
                      </div>
                      <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        {level.title}
                      </p>
                      <div className="w-full mt-2">
                        <Progress 
                          value={levelProgress[level.id] || 0} 
                          className={`h-1.5 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} 
                        />
                      </div>
                      <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {levelProgress[level.id] || 0}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          {currentView === 'scenarios' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8"
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center mb-6">
                  <div className={`p-3 rounded-lg ${isDark ? 'bg-blue-700' : 'bg-blue-600'} text-white mr-4`}>
                    {activeLevel.icon}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {activeLevel.title}
                    </h2>
                    <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      {activeLevel.description}
                    </p>
                  </div>
                </div>
                
                <div className={`p-4 rounded-lg ${isDark ? 'bg-amber-900/30 border border-amber-800/50' : 'bg-amber-50 border border-amber-200'} mb-6`}>
                  <div className="flex items-start">
                    <Lightbulb className={`h-5 w-5 mr-2 mt-0.5 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    <div>
                      <p className={`font-medium ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                        Comment progresser dans ce niveau
                      </p>
                      <ul className={`text-sm mt-1 space-y-1 list-disc list-inside ${isDark ? 'text-amber-200' : 'text-amber-700'}`}>
                        <li>Complétez chaque scénario pour comprendre différents aspects de la thématique</li>
                        <li>Vous devez atteindre un score minimal de {activeLevel.minScoreToPass}% pour valider ce niveau</li>
                        <li>Les scénarios peuvent être refaits pour améliorer votre compréhension</li>
                        <li>L'IA personnalise vos évaluations en fonction de vos réponses</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  Scénarios d'apprentissage disponibles
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeLevel.scenarios.map((scenario) => (
                    <ScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      onStart={() => handleStartScenario(scenario)}
                      isDark={isDark}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          {currentView === 'quiz' && activeScenario && !showResults && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className={`p-4 rounded-lg ${isDark ? 'bg-blue-900/30 border border-blue-800/50' : 'bg-blue-50 border border-blue-200'} mb-6`}>
                <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
                  {activeScenario.title}
                </h2>
                <p className={`mb-3 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {activeScenario.situation}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Book className={`h-4 w-4 mr-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                    <span className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                      Question {currentQuestionIndex + 1} sur {activeScenario.questions.length}
                    </span>
                  </div>
                  <Badge variant="outline" className={isDark ? 'border-blue-700 text-blue-500' : 'border-blue-300 text-blue-700'}>
                    {activeScenario.questions[currentQuestionIndex].category}
                  </Badge>
                </div>
              </div>
              
              <QuizQuestion
                question={activeScenario.questions[currentQuestionIndex]}
                selectedOption={selectedOption}
                onSelectOption={handleSelectOption}
                showExplanation={false}
                isDark={isDark}
              />
              
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={handleBackToScenarios}
                  className={isDark ? 'border-slate-700 text-slate-300' : ''}
                >
                  Quitter le scénario
                </Button>
                <Button
                  disabled={!selectedOption}
                  onClick={handleNextQuestion}
                >
                  {currentQuestionIndex < activeScenario.questions.length - 1 
                    ? 'Question suivante' 
                    : 'Terminer le quiz'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          )}
          
          {currentView === 'quiz' && showResults && activeScenario && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-4xl mx-auto"
            >
              <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Trophy className={`h-6 w-6 mr-2 ${getCurrentScore() >= activeLevel.minScoreToPass ? 'text-amber-500' : 'text-blue-600'}`} />
                      <CardTitle className={isDark ? 'text-white' : 'text-blue-700'}>
                        Résultats du scénario
                      </CardTitle>
                    </div>
                    <Badge className={getCurrentScore() >= activeLevel.minScoreToPass ? 'bg-green-600' : 'bg-red-600'}>
                      {getCurrentScore() >= activeLevel.minScoreToPass ? 'Réussi' : 'À améliorer'}
                    </Badge>
                  </div>
                  <CardDescription className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                    {activeScenario.title}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className={`p-6 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <div className="flex flex-col sm:flex-row items-center justify-between mb-4">
                      <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Score: {getCurrentScore()}%
                      </h3>
                      <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                        Score minimal requis: {activeLevel.minScoreToPass}%
                      </p>
                    </div>
                    <Progress
                      value={getCurrentScore()}
                      className={`h-3 ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`}
                    />
                    <p className={`mt-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      {getCurrentScore() >= activeLevel.minScoreToPass 
                        ? 'Félicitations ! Vous avez réussi ce scénario avec succès.' 
                        : 'Vous n\'avez pas atteint le score minimal requis. Réessayez le scénario pour progresser.'}
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      Vos réponses
                    </h3>
                    
                    <Tabs defaultValue="questions" className="w-full">
                      <TabsList className="w-full grid grid-cols-3">
                        <TabsTrigger value="questions">Questions</TabsTrigger>
                        <TabsTrigger value="tips">Conseils</TabsTrigger>
                        <TabsTrigger value="resources">Ressources</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="questions" className="mt-4 space-y-4">
                        {activeScenario.questions.map((question, index) => {
                          const userResponse = [...userResponses, {
                            questionId: activeScenario.questions[currentQuestionIndex].id,
                            selectedOptionId: selectedOption || '',
                            isCorrect: !!activeScenario.questions[currentQuestionIndex].options.find(opt => opt.id === selectedOption)?.isCorrect,
                            scenarioId: activeScenario.id
                          }].find(res => res.questionId === question.id);
                          
                          const selectedOption = userResponse ? question.options.find(opt => opt.id === userResponse.selectedOptionId) : null;
                          
                          return (
                            <div 
                              key={question.id}
                              className={`p-4 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                  {index + 1}. {question.text}
                                </h4>
                                {userResponse && (
                                  <Badge className={userResponse.isCorrect ? 'bg-green-600' : 'bg-red-600'}>
                                    {userResponse.isCorrect ? 'Correct' : 'Incorrect'}
                                  </Badge>
                                )}
                              </div>
                              
                              {selectedOption && (
                                <div className={`p-3 rounded-lg mt-2 ${isDark 
                                  ? (userResponse?.isCorrect ? 'bg-green-900/20 border border-green-800/50' : 'bg-red-900/20 border border-red-800/50')
                                  : (userResponse?.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200')
                                }`}>
                                  <p className={`text-sm font-medium ${isDark 
                                    ? (userResponse?.isCorrect ? 'text-green-400' : 'text-red-400')
                                    : (userResponse?.isCorrect ? 'text-green-700' : 'text-red-700')
                                  }`}>
                                    Votre réponse: {selectedOption.text}
                                  </p>
                                  {selectedOption.explanation && (
                                    <p className={`text-xs mt-1 ${isDark 
                                      ? (userResponse?.isCorrect ? 'text-green-300' : 'text-red-300')
                                      : (userResponse?.isCorrect ? 'text-green-600' : 'text-red-600')
                                    }`}>
                                      {selectedOption.explanation}
                                    </p>
                                  )}
                                </div>
                              )}
                              
                              {!userResponse?.isCorrect && (
                                <div className="mt-2">
                                  <p className={`text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>
                                    Réponses correctes:
                                  </p>
                                  <ul className={`text-xs mt-1 list-disc list-inside ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                                    {question.options.filter(opt => opt.isCorrect).map(opt => (
                                      <li key={opt.id}>{opt.text}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </TabsContent>
                      
                      <TabsContent value="tips" className="mt-4">
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            Conseils pratiques
                          </h4>
                          <ul className="space-y-2">
                            {activeScenario.tips.map((tip, index) => (
                              <li key={index} className="flex items-start">
                                <Lightbulb className={`h-5 w-5 mr-2 flex-shrink-0 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                                <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>
                                  {tip}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="resources" className="mt-4">
                        <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                          <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                            Ressources pour approfondir
                          </h4>
                          <ul className="space-y-3">
                            {activeScenario.references.map((reference, index) => (
                              <li key={index} className={`p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
                                <div className="flex justify-between">
                                  <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                    {reference.title}
                                  </span>
                                  <Badge variant="outline" className={isDark ? 'border-blue-700 text-blue-500' : 'border-blue-300 text-blue-700'}>
                                    {reference.source}
                                  </Badge>
                                </div>
                                <a 
                                  href={reference.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`text-sm mt-1 block hover:underline ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
                                >
                                  Consulter la ressource
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleBackToScenarios}
                    className={isDark ? 'border-slate-700 text-slate-300' : ''}
                  >
                    Retour aux scénarios
                  </Button>
                  <Button
                    onClick={() => handleStartScenario(activeScenario)}
                    className="ml-2"
                  >
                    Refaire ce scénario
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </div>
        
        {/* Footer */}
        <footer className={`py-6 ${isDark ? 'bg-slate-800' : 'bg-white'} shadow-inner mt-12`}>
          <div className="container mx-auto px-4 text-center">
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Module de Sensibilisation Cybersécurité © {new Date().getFullYear()} - Propulsé par GPT-4o
            </p>
          </div>
        </footer>
      </div>
    </HomeLayout>
  );
}