import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { AlertCircle, CheckCircle2, Shield, User, Cpu, Network, Lock, Database, BookOpen, Building } from "lucide-react";
import axios from 'axios';

// Avatars disponibles pour le joueur
const avatars = [
  { id: 'avatar1', src: '/avatars/avatar1.png', fallback: 'A1' },
  { id: 'avatar2', src: '/avatars/avatar2.png', fallback: 'A2' },
  { id: 'avatar3', src: '/avatars/avatar3.png', fallback: 'A3' },
  { id: 'avatar4', src: '/avatars/avatar4.png', fallback: 'A4' },
  { id: 'avatar5', src: '/avatars/avatar5.png', fallback: 'A5' },
  { id: 'avatar6', src: '/avatars/avatar6.png', fallback: 'A6' },
];

// Rôles que le joueur peut choisir
const roles = [
  { id: 'analyst', name: 'Analyste Sécurité', description: 'Expert en détection et analyse des menaces', icon: <AlertCircle className="h-6 w-6" /> },
  { id: 'pentester', name: 'Pentesteur', description: 'Spécialiste des tests d\'intrusion et vulnérabilités', icon: <Shield className="h-6 w-6" /> },
  { id: 'ciso', name: 'RSSI / CISO', description: 'Responsable de la stratégie de sécurité', icon: <User className="h-6 w-6" /> },
  { id: 'engineer', name: 'Ingénieur Sécurité', description: 'Conception et implémentation de solutions', icon: <Cpu className="h-6 w-6" /> },
];

// Modules de cybersécurité disponibles
const modules = [
  { 
    id: 'crisis', 
    name: 'Gestion de crise cyber', 
    description: 'Apprendre à gérer des incidents majeurs',
    icon: <AlertCircle className="h-8 w-8 text-red-500" />,
    questions: {
      debutant: [
        {
          question: "Quelle est la première étape lors d'un incident de sécurité ?",
          options: [
            "Formater tous les systèmes infectés",
            "Isoler les systèmes affectés",
            "Contacter immédiatement la presse",
            "Payer la rançon rapidement"
          ],
          correct: 1
        },
        {
          question: "Qu'est-ce qu'un plan de réponse aux incidents (IRP) ?",
          options: [
            "Un document définissant les procédures à suivre lors d'incidents",
            "Un logiciel anti-virus avancé",
            "Une police d'assurance contre les cyber-attaques",
            "Un programme de formation des employés"
          ],
          correct: 0
        }
      ],
      intermediaire: [
        {
          question: "Quelle information n'est généralement PAS incluse dans un rapport d'incident initial ?",
          options: [
            "L'heure de détection de l'incident",
            "L'analyse complète des rootkits utilisés",
            "Les systèmes potentiellement affectés",
            "Les actions de confinement immédiates"
          ],
          correct: 1
        },
        {
          question: "Dans un contexte de gestion de crise, qu'est-ce que la 'containment strategy' ?",
          options: [
            "Une stratégie marketing pour limiter l'impact médiatique",
            "L'ensemble des mesures pour isoler et limiter l'étendue de l'incident",
            "Un plan pour centraliser les données sensibles",
            "Une méthode pour containeriser les applications vulnérables"
          ],
          correct: 1
        }
      ],
      expert: [
        {
          question: "Dans le cadre d'un incident impliquant une APT (Advanced Persistent Threat), quelle approche est généralement recommandée ?",
          options: [
            "Éradiquer immédiatement toutes les traces de l'attaquant",
            "Maintenir un monitoring continu tout en documentant l'activité de l'attaquant",
            "Désactiver tous les systèmes et réinstaller depuis zéro",
            "Migrer immédiatement toutes les données vers un cloud public"
          ],
          correct: 1
        },
        {
          question: "Quelle méthodologie d'investigation numérique privilégie l'ordre de volatilité pour la collecte de preuves ?",
          options: [
            "MITRE ATT&CK",
            "NIST SP 800-61",
            "RFC 3227",
            "ISO 27035"
          ],
          correct: 2
        }
      ]
    }
  },
  { 
    id: 'gdpr', 
    name: 'Protection des données / RGPD', 
    description: 'Comprendre les obligations légales et les bonnes pratiques',
    icon: <Lock className="h-8 w-8 text-blue-500" />,
    questions: {
      debutant: [
        {
          question: "Que signifie l'acronyme RGPD ?",
          options: [
            "Référentiel Général de Protection des Documents",
            "Règlement Général sur la Protection des Données",
            "Registre de Gestion des Procédures Digitales",
            "Réseau Global de Prévention des Dangers"
          ],
          correct: 1
        },
        {
          question: "Qu'est-ce qu'une donnée à caractère personnel selon le RGPD ?",
          options: [
            "Uniquement les noms et adresses des personnes",
            "Toute information se rapportant à une personne identifiée ou identifiable",
            "Seulement les informations sensibles comme les données de santé",
            "Les données chiffrées par l'entreprise"
          ],
          correct: 1
        }
      ],
      intermediaire: [
        {
          question: "Quel est le délai maximum pour notifier une violation de données à l'autorité de contrôle ?",
          options: [
            "24 heures",
            "72 heures",
            "7 jours",
            "30 jours"
          ],
          correct: 1
        },
        {
          question: "Qu'est-ce que le 'Privacy by Design' ?",
          options: [
            "Un label de certification européen",
            "Une fonctionnalité des navigateurs web",
            "L'intégration de la protection des données dès la conception des systèmes",
            "Un mode de confidentialité pour les applications mobiles"
          ],
          correct: 2
        }
      ],
      expert: [
        {
          question: "Dans le cadre d'un transfert international de données hors UE, quelle mesure n'est PAS considérée comme une garantie appropriée ?",
          options: [
            "Les clauses contractuelles types adoptées par la Commission",
            "Un code de conduite approuvé assorti d'engagements contraignants",
            "Une certification générale de conformité ISO 27001",
            "Les règles d'entreprise contraignantes (BCR)"
          ],
          correct: 2
        },
        {
          question: "Concernant l'analyse d'impact relative à la protection des données (AIPD/DPIA), laquelle de ces affirmations est correcte ?",
          options: [
            "Elle est obligatoire pour tout traitement impliquant des données personnelles",
            "Elle doit être réalisée uniquement quand le traitement est susceptible d'engendrer un risque élevé",
            "Elle doit être renouvelée tous les 6 mois",
            "Elle remplace l'obligation de tenir un registre des traitements"
          ],
          correct: 1
        }
      ]
    }
  },
  { 
    id: 'phishing', 
    name: 'Ingénierie sociale et phishing', 
    description: 'Détecter et contrer les attaques ciblant l\'humain',
    icon: <User className="h-8 w-8 text-yellow-500" />,
    questions: {
      debutant: [
        {
          question: "Qu'est-ce que le phishing ?",
          options: [
            "Une technique de piratage des mots de passe par force brute",
            "Une technique d'usurpation d'identité pour obtenir des informations",
            "Un virus informatique qui chiffre les données",
            "Une méthode de sécurisation des emails"
          ],
          correct: 1
        },
        {
          question: "Lequel de ces éléments est un signe d'alerte typique d'un email de phishing ?",
          options: [
            "L'email est envoyé durant les heures de bureau",
            "L'email contient le logo officiel de l'entreprise",
            "L'email crée un sentiment d'urgence inhabituel",
            "L'email est signé par un responsable de l'entreprise"
          ],
          correct: 2
        }
      ],
      intermediaire: [
        {
          question: "Qu'est-ce que le spear phishing ?",
          options: [
            "Une attaque de phishing ciblant une organisation spécifique",
            "Une attaque de phishing personnalisée visant un individu spécifique",
            "Une technique de phishing utilisant exclusivement des SMS",
            "Un phishing réalisé via des applications de messagerie instantanée"
          ],
          correct: 1
        },
        {
          question: "Quelle technique d'ingénierie sociale consiste à fouiller les poubelles pour obtenir des informations ?",
          options: [
            "Dumpster diving",
            "Tailgating",
            "Baiting",
            "Pretexting"
          ],
          correct: 0
        }
      ],
      expert: [
        {
          question: "Dans une campagne d'attaque BEC (Business Email Compromise), quelle technique est souvent utilisée ?",
          options: [
            "L'envoi massif d'emails avec des pièces jointes infectées",
            "L'usurpation d'identité d'un cadre supérieur pour demander un transfert financier",
            "Le déni de service des serveurs de messagerie",
            "L'injection SQL dans les formulaires web"
          ],
          correct: 1
        },
        {
          question: "Quelle méthode d'authentification est la plus efficace contre les attaques de phishing visant à voler des identifiants ?",
          options: [
            "Les mots de passe complexes et régulièrement changés",
            "L'authentification basée sur les SMS",
            "L'authentification par email secondaire",
            "L'authentification avec clé physique FIDO2/WebAuthn"
          ],
          correct: 3
        }
      ]
    }
  },
  { 
    id: 'incidents', 
    name: 'Gestion des incidents de sécurité', 
    description: 'Détecter, analyser et répondre aux menaces',
    icon: <AlertCircle className="h-8 w-8 text-orange-500" />,
    questions: {
      debutant: [
        {
          question: "Qu'est-ce qu'un SOC dans le contexte de la cybersécurité ?",
          options: [
            "Système d'Organisation Cryptographique",
            "Centre Opérationnel de Sécurité",
            "Service Opérationnel de Crise",
            "Système d'Observation des Cyberattaques"
          ],
          correct: 1
        },
        {
          question: "Quelle est l'utilité principale d'un SIEM ?",
          options: [
            "Protéger le réseau contre les intrusions",
            "Chiffrer les communications sensibles",
            "Collecter et analyser les logs de sécurité",
            "Sécuriser les bases de données"
          ],
          correct: 2
        }
      ],
      intermediaire: [
        {
          question: "Qu'est-ce que le 'dwell time' dans le contexte des incidents de sécurité ?",
          options: [
            "Le temps nécessaire pour restaurer les systèmes après un incident",
            "Le temps pendant lequel un attaquant reste non détecté dans un réseau",
            "La durée d'une attaque par déni de service",
            "Le délai entre la détection et la résolution d'un incident"
          ],
          correct: 1
        },
        {
          question: "Quelle technique est souvent utilisée pour la priorisation des incidents de sécurité ?",
          options: [
            "FIFO (First In, First Out)",
            "Scoring basé sur la criticité des actifs et la sévérité de la menace",
            "Traitement aléatoire pour éviter les biais",
            "Analyse manuelle de chaque alerte"
          ],
          correct: 1
        }
      ],
      expert: [
        {
          question: "Dans le contexte de la traque des menaces (Threat Hunting), quelle approche est considérée comme la plus proactive ?",
          options: [
            "L'analyse des alertes du SIEM",
            "La recherche basée sur des hypothèses (hypothesis-based hunting)",
            "L'attente de signalements des utilisateurs",
            "L'analyse post-incident"
          ],
          correct: 1
        },
        {
          question: "Quelle technique permet de regrouper des alertes apparemment disparates en un incident cohérent ?",
          options: [
            "La corrélation d'événements",
            "La déduplication d'alertes",
            "Le filtrage par seuil",
            "La normalisation des logs"
          ],
          correct: 0
        }
      ]
    }
  },
  { 
    id: 'supply', 
    name: 'Sécurité de la chaîne d\'approvisionnement', 
    description: 'Sécuriser les relations avec les fournisseurs et partenaires',
    icon: <Network className="h-8 w-8 text-green-500" />,
    questions: {
      debutant: [
        {
          question: "Qu'est-ce que la sécurité de la chaîne d'approvisionnement en cybersécurité ?",
          options: [
            "La protection physique des entrepôts et centres de distribution",
            "La sécurisation des processus et relations impliquant des fournisseurs et partenaires technologiques",
            "L'évaluation des risques financiers liés aux fournisseurs",
            "La gestion des stocks de matériel informatique"
          ],
          correct: 1
        },
        {
          question: "Pourquoi les attaques contre la chaîne d'approvisionnement sont-elles particulièrement dangereuses ?",
          options: [
            "Elles sont faciles à détecter",
            "Elles n'affectent que les petites entreprises",
            "Elles peuvent compromettre de nombreuses organisations à travers un seul point d'entrée",
            "Elles sont moins sophistiquées que les autres types d'attaques"
          ],
          correct: 2
        }
      ],
      intermediaire: [
        {
          question: "Quelle célèbre attaque de 2020 illustre parfaitement les risques liés à la chaîne d'approvisionnement ?",
          options: [
            "L'attaque WannaCry",
            "La fuite de données Equifax",
            "La compromission SolarWinds",
            "L'attaque NotPetya"
          ],
          correct: 2
        },
        {
          question: "Quelle pratique aide à atténuer les risques liés à la chaîne d'approvisionnement logicielle ?",
          options: [
            "Utiliser uniquement des logiciels développés en interne",
            "Installer toutes les mises à jour immédiatement sans tests",
            "Vérifier l'intégrité des packages et l'authenticité des sources",
            "Désactiver les contrôles d'accès pour faciliter les intégrations"
          ],
          correct: 2
        }
      ],
      expert: [
        {
          question: "Quelle approche est recommandée pour la gestion des vulnérabilités dans les composants tiers ?",
          options: [
            "Maintenir un inventaire à jour et suivre les vulnérabilités avec un SBOM (Software Bill of Materials)",
            "Faire confiance aux fournisseurs pour signaler les vulnérabilités",
            "Tester uniquement les composants principaux pour gagner du temps",
            "Attendre les rapports publics de vulnérabilités avant d'agir"
          ],
          correct: 0
        },
        {
          question: "Dans le contexte des évaluations de sécurité des fournisseurs, qu'est-ce que le 'right to audit' ?",
          options: [
            "Le droit du fournisseur à auditer vos systèmes",
            "Une clause contractuelle permettant d'évaluer la sécurité du fournisseur",
            "Un framework d'audit spécifique aux chaînes d'approvisionnement",
            "Une certification délivrée par un organisme tiers"
          ],
          correct: 1
        }
      ]
    }
  },
  { 
    id: 'governance', 
    name: 'Stratégie et gouvernance cybersécurité', 
    description: 'Élaborer et piloter une stratégie de sécurité',
    icon: <Building className="h-8 w-8 text-purple-500" />,
    questions: {
      debutant: [
        {
          question: "Quelle est la principale responsabilité d'un RSSI (CISO) ?",
          options: [
            "Développer des logiciels sécurisés",
            "Définir et superviser la stratégie de sécurité de l'information",
            "Réparer les ordinateurs infectés par des virus",
            "Gérer les infrastructures cloud"
          ],
          correct: 1
        },
        {
          question: "Qu'est-ce qu'une politique de sécurité de l'information ?",
          options: [
            "Un logiciel anti-virus",
            "Un ensemble de règles définissant la protection des informations",
            "Une loi gouvernementale sur la cybersécurité",
            "Un firewall avancé"
          ],
          correct: 1
        }
      ],
      intermediaire: [
        {
          question: "Selon la norme ISO 27001, quel est l'élément central du système de management de la sécurité de l'information ?",
          options: [
            "Les contrôles techniques",
            "L'approche basée sur les risques",
            "La certification obligatoire",
            "Les audits externes"
          ],
          correct: 1
        },
        {
          question: "Qu'est-ce que le 'risk appetite' (appétence au risque) dans le contexte de la gouvernance cybersécurité ?",
          options: [
            "La tendance des employés à prendre des risques",
            "Le niveau de risque qu'une organisation est prête à accepter",
            "La fréquence des audits de sécurité",
            "Le budget alloué à la cybersécurité"
          ],
          correct: 1
        }
      ],
      expert: [
        {
          question: "Quelle est la différence fondamentale entre la gouvernance et la gestion en matière de cybersécurité ?",
          options: [
            "La gouvernance définit la direction et les objectifs, la gestion les met en œuvre",
            "La gouvernance concerne les aspects techniques, la gestion les aspects humains",
            "La gouvernance est réservée aux grandes entreprises, la gestion aux PME",
            "La gouvernance est obligatoire, la gestion est facultative"
          ],
          correct: 0
        },
        {
          question: "Dans le cadre d'une gouvernance Zero Trust, quel principe est fondamental ?",
          options: [
            "Faire confiance à tous les utilisateurs internes par défaut",
            "Vérifier uniquement les connexions externes",
            "Vérifier systématiquement chaque accès, quelle que soit la source",
            "Imposer l'authentification uniquement pour les applications critiques"
          ],
          correct: 2
        }
      ]
    }
  }
];

const CyberOnboarding: React.FC = () => {
  const [_, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<number>(1); // 1 = Débutant, 2 = Intermédiaire, 3 = Expert
  const [playerName, setPlayerName] = useState('');
  const [testState, setTestState] = useState({
    questions: [],
    currentQuestion: 0,
    answers: [],
    completed: false,
    correctAnswers: 0
  });
  const [loading, setLoading] = useState(false);

  // Fonction pour gérer le changement d'étape
  const nextStep = () => {
    if (currentStep === 3) {
      // Si on est à l'étape 3 (choix du module), on prépare les questions de test
      prepareTest();
    }
    setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  // Préparation du test de niveau
  const prepareTest = () => {
    const selectedModuleData = modules.find(m => m.id === selectedModule);
    if (!selectedModuleData) return;

    let difficultyLevel;
    if (selectedDifficulty === 1) difficultyLevel = 'debutant';
    else if (selectedDifficulty === 2) difficultyLevel = 'intermediaire';
    else difficultyLevel = 'expert';

    setTestState({
      questions: selectedModuleData.questions[difficultyLevel],
      currentQuestion: 0,
      answers: [],
      completed: false,
      correctAnswers: 0
    });
  };

  // Gérer la réponse à une question du test
  const handleAnswer = (answerIndex: number) => {
    const isCorrect = answerIndex === testState.questions[testState.currentQuestion].correct;
    
    const newAnswers = [...testState.answers, {
      questionIndex: testState.currentQuestion,
      answerIndex,
      isCorrect
    }];
    
    const newCorrectAnswers = isCorrect 
      ? testState.correctAnswers + 1 
      : testState.correctAnswers;

    // Si c'était la dernière question
    if (testState.currentQuestion === testState.questions.length - 1) {
      setTestState({
        ...testState,
        answers: newAnswers,
        completed: true,
        correctAnswers: newCorrectAnswers
      });
    } else {
      // Passer à la question suivante
      setTestState({
        ...testState,
        answers: newAnswers,
        currentQuestion: testState.currentQuestion + 1,
        correctAnswers: newCorrectAnswers
      });
    }
  };

  // Soumettre les choix finaux et commencer le scénario
  const startScenario = async () => {
    setLoading(true);
    
    try {
      // Déterminer le niveau final en fonction des réponses au test
      let finalLevel;
      const scorePercentage = (testState.correctAnswers / testState.questions.length) * 100;
      
      if (selectedDifficulty === 3) { // Expert
        finalLevel = scorePercentage >= 50 ? "Expert" : "Intermédiaire";
      } else if (selectedDifficulty === 2) { // Intermédiaire
        if (scorePercentage >= 75) finalLevel = "Expert";
        else if (scorePercentage >= 40) finalLevel = "Intermédiaire";
        else finalLevel = "Débutant";
      } else { // Débutant
        finalLevel = scorePercentage >= 75 ? "Intermédiaire" : "Débutant";
      }
      
      // Enregistrer la configuration du joueur
      await axios.post('/api/cyber/setup-player', {
        name: playerName,
        avatar: selectedAvatar,
        role: selectedRole,
        module: selectedModule,
        selectedDifficulty: selectedDifficulty === 1 ? "Débutant" : selectedDifficulty === 2 ? "Intermédiaire" : "Expert",
        finalLevel,
        testResults: {
          score: testState.correctAnswers,
          total: testState.questions.length,
          percentage: scorePercentage
        }
      });
      
      // Rediriger vers l'interface de chat avec le nouveau scénario
      toast({
        title: "Personnage créé avec succès!",
        description: `Votre niveau de difficulté a été défini à: ${finalLevel}`,
      });
      
      // Rediriger vers la page du module cyber
      navigate('/cyber');
    } catch (error) {
      console.error('Erreur lors de la création du personnage:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer votre personnage. Veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">I AM CYBER</h1>
        <p className="text-gray-600">Créez votre personnage et commencez votre mission</p>
      </div>

      {/* Stepper */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center">
          <div className={`rounded-full h-10 w-10 flex items-center justify-center ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-200'}`}>1</div>
          <div className={`h-1 w-12 ${currentStep >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`rounded-full h-10 w-10 flex items-center justify-center ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-200'}`}>2</div>
          <div className={`h-1 w-12 ${currentStep >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`rounded-full h-10 w-10 flex items-center justify-center ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-gray-200'}`}>3</div>
          <div className={`h-1 w-12 ${currentStep >= 4 ? 'bg-primary' : 'bg-gray-200'}`}></div>
          <div className={`rounded-full h-10 w-10 flex items-center justify-center ${currentStep >= 4 ? 'bg-primary text-white' : 'bg-gray-200'}`}>4</div>
        </div>
      </div>

      {/* Étape 1: Sélection d'avatar et nom */}
      {currentStep === 1 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Créez votre identité</CardTitle>
            <CardDescription>Choisissez un avatar et entrez votre nom d'agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="playerName">Votre nom d'agent</Label>
                <input
                  id="playerName"
                  type="text"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="w-full p-2 border rounded mt-1"
                  placeholder="Entrez votre nom"
                />
              </div>
              
              <div>
                <Label className="block mb-2">Choisissez un avatar</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                  {avatars.map((avatar) => (
                    <div 
                      key={avatar.id}
                      onClick={() => setSelectedAvatar(avatar.id)}
                      className={`cursor-pointer flex flex-col items-center ${selectedAvatar === avatar.id ? 'ring-2 ring-primary rounded-lg p-2' : 'p-2'}`}
                    >
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={avatar.src} alt="Avatar" />
                        <AvatarFallback>{avatar.fallback}</AvatarFallback>
                      </Avatar>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              onClick={nextStep}
              disabled={!playerName || !selectedAvatar}
            >
              Suivant
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Étape 2: Sélection du rôle */}
      {currentStep === 2 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Choisissez votre rôle</CardTitle>
            <CardDescription>Sélectionnez le type de professionnel en cybersécurité que vous souhaitez incarner</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedRole} onValueChange={setSelectedRole}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roles.map((role) => (
                  <div key={role.id} className={`border rounded-lg p-4 cursor-pointer ${selectedRole === role.id ? 'border-primary bg-primary/5' : ''}`}>
                    <RadioGroupItem value={role.id} id={role.id} className="sr-only" />
                    <Label htmlFor={role.id} className="cursor-pointer flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">{role.icon}</div>
                      <div>
                        <h3 className="font-medium">{role.name}</h3>
                        <p className="text-sm text-gray-500">{role.description}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={prevStep}>Retour</Button>
            <Button onClick={nextStep} disabled={!selectedRole}>Suivant</Button>
          </CardFooter>
        </Card>
      )}

      {/* Étape 3: Module et difficulté */}
      {currentStep === 3 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Domaine et difficulté</CardTitle>
            <CardDescription>Choisissez un domaine de cybersécurité et votre niveau de difficulté</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="module" className="w-full">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="module">Module</TabsTrigger>
                <TabsTrigger value="difficulty">Difficulté</TabsTrigger>
              </TabsList>
              
              <TabsContent value="module" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {modules.map((module) => (
                    <div 
                      key={module.id}
                      onClick={() => setSelectedModule(module.id)}
                      className={`border rounded-lg p-4 cursor-pointer hover:bg-gray-50 ${selectedModule === module.id ? 'border-primary bg-primary/5' : ''}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">{module.icon}</div>
                        <div>
                          <h3 className="font-medium">{module.name}</h3>
                          <p className="text-sm text-gray-500">{module.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="difficulty" className="space-y-4">
                <div className="space-y-8">
                  <div>
                    <Label htmlFor="difficulty" className="block mb-2">Niveau de difficulté</Label>
                    <Slider
                      id="difficulty"
                      defaultValue={[1]}
                      max={3}
                      step={1}
                      value={[selectedDifficulty]}
                      onValueChange={(value) => setSelectedDifficulty(value[0])}
                      className="my-6"
                    />
                    
                    <div className="flex justify-between text-sm">
                      <div className={`${selectedDifficulty === 1 ? 'font-bold text-primary' : ''}`}>Débutant</div>
                      <div className={`${selectedDifficulty === 2 ? 'font-bold text-primary' : ''}`}>Intermédiaire</div>
                      <div className={`${selectedDifficulty === 3 ? 'font-bold text-primary' : ''}`}>Expert</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h3 className="font-medium mb-2">
                      {selectedDifficulty === 1 && "Niveau Débutant"}
                      {selectedDifficulty === 2 && "Niveau Intermédiaire"}
                      {selectedDifficulty === 3 && "Niveau Expert"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedDifficulty === 1 && "Pour les personnes débutant en cybersécurité ou souhaitant renforcer les bases. Concepts fondamentaux et scénarios accessibles."}
                      {selectedDifficulty === 2 && "Pour les professionnels ayant une expérience dans le domaine. Scénarios plus complexes et connaissances techniques attendues."}
                      {selectedDifficulty === 3 && "Pour les experts du domaine souhaitant être challengés. Scénarios avancés, questions pointues et connaissances spécialisées requises."}
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={prevStep}>Retour</Button>
            <Button onClick={nextStep} disabled={!selectedModule}>Suivant</Button>
          </CardFooter>
        </Card>
      )}

      {/* Étape 4: Quiz de validation */}
      {currentStep === 4 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Test de niveau</CardTitle>
            <CardDescription>
              Répondez à ces questions pour valider votre niveau de compétence
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!testState.completed ? (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg mb-4">
                  <h3 className="font-medium mb-2">Question {testState.currentQuestion + 1}/{testState.questions.length}</h3>
                  <p>{testState.questions[testState.currentQuestion]?.question}</p>
                </div>
                
                <div className="space-y-3">
                  {testState.questions[testState.currentQuestion]?.options.map((option, index) => (
                    <div 
                      key={index}
                      onClick={() => handleAnswer(index)}
                      className="border rounded-lg p-3 cursor-pointer hover:bg-gray-50"
                    >
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg mb-4 text-center">
                  <h3 className="font-medium mb-2">Test terminé !</h3>
                  <p>Votre score: {testState.correctAnswers}/{testState.questions.length}</p>
                  <div className="mt-4">
                    {testState.correctAnswers === testState.questions.length ? (
                      <div className="flex justify-center">
                        <CheckCircle2 className="h-12 w-12 text-green-500" />
                      </div>
                    ) : (
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-primary h-2.5 rounded-full" 
                          style={{ width: `${(testState.correctAnswers / testState.questions.length) * 100}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Prêt à commencer</h3>
                  <p className="text-sm text-gray-600">
                    Basé sur vos réponses, nous allons vous proposer un scénario adapté à votre niveau. 
                    L'équipe I AM CYBER vous accompagnera tout au long de cette mission.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            {!testState.completed ? (
              <Button variant="outline" onClick={prevStep} disabled={testState.currentQuestion > 0}>Retour</Button>
            ) : (
              <>
                <Button variant="outline" onClick={prevStep}>Retour</Button>
                <Button onClick={startScenario} disabled={loading}>
                  {loading ? "Préparation..." : "Commencer la mission"}
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default CyberOnboarding;