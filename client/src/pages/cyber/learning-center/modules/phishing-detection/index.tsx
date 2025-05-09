import React, { useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Mail, AlertTriangle, CheckCircle2, ShieldAlert, Eye, Lightbulb, PlayCircle, PencilRuler, Zap, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import PageTitle from '@/components/utils/PageTitle';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function PhishingDetection() {
  const [activeLesson, setActiveLesson] = useState('introduction');
  const [progress, setProgress] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Structure du cours
  const lessons = [
    { id: 'introduction', title: 'Introduction au phishing', progress: 0 },
    { id: 'techniques', title: 'Techniques de phishing courantes', progress: 0 },
    { id: 'detection', title: 'Comment détecter une tentative', progress: 0 },
    { id: 'protection', title: 'Se protéger efficacement', progress: 0 },
    { id: 'quiz', title: 'Quiz de validation', progress: 0 },
  ];

  // Questions du quiz
  const questions = [
    {
      question: "Quelle est la principale caractéristique d'une attaque de phishing ?",
      options: [
        "L'utilisation de logiciels malveillants",
        "La création de faux sites pour voler des identifiants",
        "L'usurpation d'identité pour tromper la victime",
        "L'exploitation de vulnérabilités système"
      ],
      correctAnswer: 2
    },
    {
      question: "Parmi ces indices, lequel n'est PAS un signe d'e-mail de phishing ?",
      options: [
        "Un e-mail contenant votre nom complet et des informations personnelles précises",
        "Des fautes d'orthographe et de grammaire",
        "Une demande urgente d'action immédiate",
        "Un expéditeur avec un domaine légèrement différent (ex: amazon-secure.com)"
      ],
      correctAnswer: 0
    },
    {
      question: "Quelle est la meilleure action à entreprendre si vous soupçonnez un e-mail de phishing ?",
      options: [
        "Cliquer sur les liens pour vérifier s'ils sont légitimes",
        "Répondre à l'expéditeur pour demander des clarifications",
        "Supprimer l'e-mail et/ou le signaler comme spam",
        "Transférer l'e-mail à vos collègues pour avoir leur avis"
      ],
      correctAnswer: 2
    },
    {
      question: "Le spear phishing se différencie du phishing classique par :",
      options: [
        "L'utilisation exclusive de messages SMS au lieu d'e-mails",
        "Le ciblage de victimes spécifiques avec des messages personnalisés",
        "L'exploitation de vulnérabilités dans les pare-feu",
        "L'utilisation de virus plutôt que de techniques d'ingénierie sociale"
      ],
      correctAnswer: 1
    },
    {
      question: "Quelle mesure n'est PAS efficace contre le phishing ?",
      options: [
        "Utiliser l'authentification à deux facteurs",
        "Vérifier l'URL complète avant de cliquer sur un lien",
        "Installer uniquement un antivirus puissant",
        "Former régulièrement les employés à reconnaître les tentatives"
      ],
      correctAnswer: 2
    }
  ];

  // Contenu des leçons
  const lessonContent = {
    introduction: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <Alert className="bg-blue-900/30 border-blue-500">
            <Lightbulb className="h-5 w-5 text-blue-500" />
            <AlertTitle className="text-blue-100">Objectifs d'apprentissage</AlertTitle>
            <AlertDescription className="text-blue-200">
              À la fin de ce module, vous serez capable de :
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Comprendre ce qu'est le phishing et ses variantes</li>
                <li>Reconnaître les indicateurs d'une tentative de phishing</li>
                <li>Savoir comment réagir face à une attaque potentielle</li>
                <li>Mettre en place des mesures de protection efficaces</li>
              </ul>
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-4">
            <h2 className="text-2xl font-bold">Qu'est-ce que le phishing ?</h2>
            <p>
              Le <strong>phishing</strong> (ou hameçonnage) est une technique d'attaque cybercriminelle visant à tromper les utilisateurs pour obtenir des informations sensibles comme les identifiants, mots de passe, ou données bancaires. Cette méthode repose principalement sur l'<strong>ingénierie sociale</strong>, exploitant la confiance plutôt que des vulnérabilités techniques.
            </p>
            
            <div className="bg-blue-900/20 border border-blue-800 rounded-md p-4 my-4">
              <h3 className="text-lg font-medium mb-2">Principe fondamental</h3>
              <p>
                Le phishing exploite un principe psychologique simple : il est souvent plus facile de tromper un humain que de pirater un système informatique sécurisé. Les attaquants se font passer pour des entités légitimes pour manipuler leurs victimes.
              </p>
            </div>
            
            <h3 className="text-xl font-bold mt-6">Les principales variantes</h3>
            
            <Accordion type="single" collapsible className="bg-blue-900/10">
              <AccordionItem value="spear-phishing">
                <AccordionTrigger className="px-4">Spear Phishing (Harponnage)</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  Attaques ciblées utilisant des informations personnalisées sur la victime. Contrairement au phishing de masse, ces attaques sont minutieusement préparées pour cibler des individus ou organisations spécifiques. Taux de réussite beaucoup plus élevé.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="whaling">
                <AccordionTrigger className="px-4">Whaling (Chasse à la baleine)</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  Variante du spear phishing ciblant spécifiquement les cadres supérieurs et dirigeants d'entreprise. Ces attaques sont particulièrement sophistiquées et contextualisées, visant à obtenir des accès privilégiés ou des transferts financiers importants.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="smishing">
                <AccordionTrigger className="px-4">Smishing</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  Phishing par SMS. Les attaquants envoient des messages texte contenant des liens malveillants ou demandant des informations sensibles. L'utilisation des smartphones et la taille réduite des écrans rendent la détection plus difficile pour les utilisateurs.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="vishing">
                <AccordionTrigger className="px-4">Vishing (Voice Phishing)</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  Phishing par téléphone. Les attaquants se font passer pour des représentants d'organisations légitimes par appel vocal. L'interaction humaine directe ajoute un niveau de persuasion supplémentaire.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="pharming">
                <AccordionTrigger className="px-4">Pharming</AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  Technique plus technique redirigeant les utilisateurs vers de faux sites même lorsqu'ils saisissent la bonne URL. Cette attaque peut cibler l'infrastructure DNS ou le fichier hosts des ordinateurs des victimes.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            
            <div className="mt-6">
              <h3 className="text-xl font-bold">Impact du phishing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <Card className="bg-red-900/20 border-red-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
                      Pour les individus
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Vol d'identité</li>
                      <li>Pertes financières directes</li>
                      <li>Accès compromis aux comptes personnels</li>
                      <li>Détresse émotionnelle</li>
                      <li>Temps perdu à résoudre les problèmes causés</li>
                    </ul>
                  </CardContent>
                </Card>
                
                <Card className="bg-orange-900/20 border-orange-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <ShieldAlert className="mr-2 h-5 w-5 text-orange-400" />
                      Pour les organisations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Fuites de données sensibles</li>
                      <li>Pertes financières importantes</li>
                      <li>Dommages à la réputation</li>
                      <li>Perturbation des opérations</li>
                      <li>Coûts de remédiation élevés</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-6">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-blue-400" />
                Chiffres clés
              </h3>
              <ul className="space-y-2">
                <li><strong>83%</strong> des organisations ont déclaré avoir subi des attaques de phishing réussies en 2022</li>
                <li>Le coût moyen d'une violation de données causée par le phishing est estimé à <strong>4,65 millions d'euros</strong></li>
                <li><strong>95%</strong> des incidents de cybersécurité impliquent une forme d'erreur humaine, souvent exploitée par le phishing</li>
              </ul>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <div></div>
          <Button onClick={() => setActiveLesson('techniques')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    techniques: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Techniques de phishing courantes</h2>
          
          <p className="mt-4">
            Les cybercriminels utilisent diverses techniques sophistiquées pour rendre leurs attaques de phishing plus crédibles et efficaces. Comprendre ces méthodes est essentiel pour les identifier et s'en protéger.
          </p>
          
          <div className="mt-6 space-y-5">
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Mail className="mr-2 h-5 w-5 text-blue-400" />
                  Usurpation d'identité visuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">
                  Les attaquants reproduisent fidèlement l'apparence des communications officielles en copiant :
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-200">
                  <li>Logos et chartes graphiques</li>
                  <li>Mise en page et formats typiques</li>
                  <li>Signatures et formules de politesse</li>
                  <li>Ton et style de communication</li>
                </ul>
                <div className="mt-3 bg-blue-950 p-3 rounded-md text-sm">
                  <p className="font-medium text-white">Exemple :</p>
                  <p className="text-blue-200">Reproduction exacte d'un e-mail de récupération de mot de passe Microsoft avec le même design, les mêmes boutons et la même mise en page que les e-mails authentiques.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-blue-400" />
                  Manipulation d'URL
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">
                  Techniques courantes pour dissimuler des URL malveillantes :
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-200">
                  <li>Typosquatting (ex: amaz0n.com, g00gle.com)</li>
                  <li>Domaines similaires (ex: paypal-secure.com)</li>
                  <li>Utilisation de sous-domaines trompeurs (ex: paypal.secure-payment.com)</li>
                  <li>URL raccourcies masquant la destination réelle</li>
                  <li>Caractères Unicode semblables (ex: utiliser le "а" cyrillique dans "аpple.com")</li>
                </ul>
                <div className="mt-3 bg-blue-950 p-3 rounded-md text-sm">
                  <p className="font-medium text-white">Cas réel :</p>
                  <p className="text-blue-200">En 2020, une campagne ciblant les utilisateurs Microsoft a utilisé l'URL "microsoft-upgrade.microsoftonline.documents-verify.site" - un domaine n'appartenant pas à Microsoft malgré l'inclusion du nom de la marque.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <PencilRuler className="mr-2 h-5 w-5 text-blue-400" />
                  Ingénierie sociale avancée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">
                  Tactiques psychologiques exploitées dans les attaques de phishing :
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-200">
                  <li><strong>Urgence</strong> : "Votre compte sera suspendu dans 24h si vous ne confirmez pas vos informations"</li>
                  <li><strong>Peur</strong> : "Activité suspecte détectée sur votre compte bancaire"</li>
                  <li><strong>Curiosité</strong> : "Voir qui a consulté votre profil récemment"</li>
                  <li><strong>Avidité</strong> : "Vous avez gagné un iPhone 14, cliquez pour réclamer"</li>
                  <li><strong>Autorité</strong> : Messages semblant provenir d'un supérieur hiérarchique ou d'une institution respectée</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="bg-orange-900/20 border-orange-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-orange-400" />
                  Contextualisation et actualité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-3">
                  Les attaques de phishing exploitent souvent l'actualité et le contexte pour paraître légitimes :
                </p>
                <ul className="list-disc list-inside space-y-1 text-orange-200">
                  <li>Crises sanitaires (ex: fausses informations sur les vaccins ou les tests pendant la pandémie)</li>
                  <li>Événements majeurs (JO, élections, catastrophes naturelles)</li>
                  <li>Périodes fiscales (faux e-mails des impôts)</li>
                  <li>Black Friday et périodes d'achats (fausses promotions)</li>
                  <li>Actualités d'entreprise (fausses notifications de mise à jour après une fusion annoncée)</li>
                </ul>
                <div className="mt-3 bg-orange-950 p-3 rounded-md text-sm">
                  <p className="font-medium text-white">Exemple récent :</p>
                  <p className="text-orange-200">En 2022, après l'annonce publique d'une fuite de données chez une grande entreprise, des attaquants ont envoyé de faux e-mails de "réinitialisation de sécurité obligatoire" aux clients, exploitant leur inquiétude légitime.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <Button onClick={() => setActiveLesson('introduction')} variant="outline" className="border-blue-700 text-blue-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button onClick={() => setActiveLesson('detection')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    detection: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Comment détecter une tentative de phishing</h2>
          
          <Alert className="bg-blue-900/30 border-blue-500 mt-4">
            <Eye className="h-5 w-5 text-blue-500" />
            <AlertTitle className="text-blue-100">Signaux d'alarme</AlertTitle>
            <AlertDescription className="text-blue-200">
              Apprenez à repérer les indicateurs d'une tentative de phishing pour ne pas tomber dans le piège.
            </AlertDescription>
          </Alert>
          
          <div className="mt-6 space-y-5">
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-5">
              <h3 className="text-xl font-semibold mb-4">Les 7 indices clés d'un e-mail suspect</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-800/30 p-3 rounded-md">
                  <h4 className="font-medium flex items-center">
                    <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                    Analyse de l'expéditeur
                  </h4>
                  <p className="mt-1 text-blue-200 text-sm">
                    Vérifiez attentivement l'adresse e-mail (pas seulement le nom affiché). Recherchez les variations subtiles comme "service@amaz0n.com" ou "apple.secure-alerts.com".
                  </p>
                </div>
                
                <div className="bg-blue-800/30 p-3 rounded-md">
                  <h4 className="font-medium flex items-center">
                    <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                    Erreurs linguistiques
                  </h4>
                  <p className="mt-1 text-blue-200 text-sm">
                    Les fautes d'orthographe, de grammaire ou de syntaxe sont souvent présentes dans les e-mails de phishing. Les grandes entreprises ont généralement des processus de relecture rigoureux.
                  </p>
                </div>
                
                <div className="bg-blue-800/30 p-3 rounded-md">
                  <h4 className="font-medium flex items-center">
                    <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                    Formulation pressante
                  </h4>
                  <p className="mt-1 text-blue-200 text-sm">
                    Méfiez-vous des messages créant un sentiment d'urgence ou de peur ("Agissez immédiatement", "Compte suspendu", "Violation de sécurité détectée").
                  </p>
                </div>
                
                <div className="bg-blue-800/30 p-3 rounded-md">
                  <h4 className="font-medium flex items-center">
                    <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
                    Inspection des liens
                  </h4>
                  <p className="mt-1 text-blue-200 text-sm">
                    Survolez les liens (sans cliquer) pour voir l'URL réelle dans la barre d'état du navigateur. Les URL légitimes correspondent généralement au domaine officiel de l'organisation.
                  </p>
                </div>
                
                <div className="bg-blue-800/30 p-3 rounded-md">
                  <h4 className="font-medium flex items-center">
                    <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">5</span>
                    Analyse des demandes inhabituelles
                  </h4>
                  <p className="mt-1 text-blue-200 text-sm">
                    Les institutions légitimes ne demandent jamais d'informations sensibles par e-mail (mots de passe, numéros de carte de crédit complets, etc.).
                  </p>
                </div>
                
                <div className="bg-blue-800/30 p-3 rounded-md">
                  <h4 className="font-medium flex items-center">
                    <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">6</span>
                    Pièces jointes suspectes
                  </h4>
                  <p className="mt-1 text-blue-200 text-sm">
                    Méfiez-vous des pièces jointes inattendues, particulièrement les formats exécutables (.exe, .scr, .zip) ou les fichiers Office contenant des macros.
                  </p>
                </div>
                
                <div className="bg-blue-800/30 p-3 rounded-md">
                  <h4 className="font-medium flex items-center">
                    <span className="bg-blue-700 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">7</span>
                    Incohérences visuelles
                  </h4>
                  <p className="mt-1 text-blue-200 text-sm">
                    Logos de mauvaise qualité, mise en page déséquilibrée ou design différent des communications habituelles de l'organisation.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card className="bg-green-900/20 border-green-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <CheckCircle2 className="mr-2 h-5 w-5 text-green-400" />
                    Communication légitime
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-green-200">
                    <li>Adresse e-mail correspondant au domaine officiel</li>
                    <li>Qualité professionnelle du contenu et de la mise en page</li>
                    <li>Personnalisation précise (nom complet, informations spécifiques)</li>
                    <li>Liens menant aux sites officiels</li>
                    <li>Absence de pression pour une action immédiate</li>
                    <li>Possibilité de vérifier via un autre canal (téléphone, application)</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="bg-red-900/20 border-red-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5 text-red-400" />
                    Signes de phishing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-red-200">
                    <li>Domaine d'e-mail suspect ou légèrement modifié</li>
                    <li>Formulation générique ("Cher client", "Utilisateur")</li>
                    <li>Demande d'informations sensibles</li>
                    <li>Urgence excessive ("Agissez maintenant", "48h maximum")</li>
                    <li>Offres trop belles pour être vraies</li>
                    <li>Incohérences visuelles et erreurs linguistiques</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4 mt-2">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <Lightbulb className="mr-2 h-5 w-5 text-amber-400" />
                Astuce professionnelle
              </h3>
              <p className="text-blue-200 mb-2">
                En cas de doute sur un e-mail, utilisez la méthode STOP :
              </p>
              <ul className="space-y-1">
                <li><strong>S</strong>top : ne pas agir dans la précipitation</li>
                <li><strong>T</strong>hink : analyser les éléments suspects</li>
                <li><strong>O</strong>bserve : vérifier l'adresse et les liens</li>
                <li><strong>P</strong>rotect : signaler l'e-mail et alerter si nécessaire</li>
              </ul>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <Button onClick={() => setActiveLesson('techniques')} variant="outline" className="border-blue-700 text-blue-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button onClick={() => setActiveLesson('protection')} className="bg-blue-700 hover:bg-blue-800">
            Continuer
            <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
          </Button>
        </div>
      </div>
    ),
    
    protection: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Se protéger efficacement</h2>
          
          <p className="mt-4">
            La protection contre le phishing repose sur une combinaison de vigilance personnelle, de bonnes pratiques et d'outils technologiques.
          </p>
          
          <div className="mt-6 space-y-6">
            <Card className="bg-blue-900/20 border-blue-800">
              <CardHeader>
                <CardTitle>Mesures préventives essentielles</CardTitle>
                <CardDescription className="text-blue-200">
                  Actions concrètes pour réduire significativement les risques de phishing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-800/20 p-3 rounded-md">
                  <h3 className="font-medium">Authentification à plusieurs facteurs (MFA)</h3>
                  <p className="text-sm text-blue-200 mt-1">
                    Même si vos identifiants sont compromis, l'attaquant ne pourra pas accéder à vos comptes sans le deuxième facteur d'authentification (application, SMS, clé physique).
                  </p>
                  <div className="flex justify-end">
                    <Badge className="bg-blue-700 mt-1">Protection : Très élevée</Badge>
                  </div>
                </div>
                
                <div className="bg-blue-800/20 p-3 rounded-md">
                  <h3 className="font-medium">Gestionnaire de mots de passe</h3>
                  <p className="text-sm text-blue-200 mt-1">
                    Utilisez un gestionnaire de mots de passe réputé pour générer et stocker des mots de passe uniques et complexes pour chaque service. Avantage supplémentaire : la saisie automatique ne fonctionnera pas sur les sites de phishing.
                  </p>
                  <div className="flex justify-end">
                    <Badge className="bg-blue-700 mt-1">Protection : Élevée</Badge>
                  </div>
                </div>
                
                <div className="bg-blue-800/20 p-3 rounded-md">
                  <h3 className="font-medium">Solutions de sécurité avancées</h3>
                  <p className="text-sm text-blue-200 mt-1">
                    Des logiciels de protection incluant des fonctionnalités anti-phishing peuvent analyser les URL et bloquer l'accès aux sites malveillants. Les outils professionnels incluent souvent des fonctionnalités de protection du courrier électronique.
                  </p>
                  <div className="flex justify-end">
                    <Badge className="bg-blue-700 mt-1">Protection : Élevée</Badge>
                  </div>
                </div>
                
                <div className="bg-blue-800/20 p-3 rounded-md">
                  <h3 className="font-medium">Formation continue</h3>
                  <p className="text-sm text-blue-200 mt-1">
                    Restez informé des nouvelles techniques de phishing et participez régulièrement à des formations de sensibilisation. Les exercices de phishing simulé sont particulièrement efficaces pour développer les réflexes de sécurité.
                  </p>
                  <div className="flex justify-end">
                    <Badge className="bg-blue-700 mt-1">Protection : Essentielle</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-5">
              <h3 className="text-xl font-bold mb-3">Réponse aux incidents</h3>
              <p className="mb-4">
                Si vous pensez avoir été victime d'une tentative de phishing, suivez ces étapes :
              </p>
              
              <div className="space-y-3">
                <div className="flex">
                  <div className="mr-3 bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Ne paniquez pas, mais agissez rapidement</h4>
                    <p className="text-sm text-blue-200">
                      Plus vous réagissez vite, plus vous limitez les dégâts potentiels.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-3 bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Changez immédiatement vos mots de passe</h4>
                    <p className="text-sm text-blue-200">
                      Commencez par les comptes critiques (banque, e-mail principal, réseaux sociaux).
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-3 bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Alertez votre service informatique</h4>
                    <p className="text-sm text-blue-200">
                      En contexte professionnel, informez immédiatement votre équipe IT ou sécurité.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-3 bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-medium">Signalez la tentative</h4>
                    <p className="text-sm text-blue-200">
                      Utilisez les fonctions "Signaler comme phishing" de votre messagerie et alertez les plateformes concernées.
                    </p>
                  </div>
                </div>
                
                <div className="flex">
                  <div className="mr-3 bg-blue-700 text-white w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    5
                  </div>
                  <div>
                    <h4 className="font-medium">Surveillez vos comptes</h4>
                    <p className="text-sm text-blue-200">
                      Vérifiez régulièrement l'activité sur vos comptes bancaires et en ligne pour détecter toute activité suspecte.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <Alert className="bg-green-900/30 border-green-600">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <AlertTitle>Bonnes pratiques quotidiennes</AlertTitle>
              <AlertDescription className="text-green-200">
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>Accédez directement aux sites web en tapant leur URL plutôt qu'en suivant des liens</li>
                  <li>Vérifiez régulièrement l'activité de vos comptes critiques</li>
                  <li>Mettez à jour vos logiciels et systèmes d'exploitation</li>
                  <li>Soyez particulièrement vigilant sur les appareils mobiles où les URL sont moins visibles</li>
                  <li>N'utilisez jamais le même mot de passe pour plusieurs services</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div className="bg-blue-950 border border-blue-800 rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2 flex items-center">
                <ExternalLink className="mr-2 h-5 w-5 text-blue-400" />
                Ressources supplémentaires
              </h3>
              <ul className="space-y-1 text-blue-200">
                <li>
                  <a href="#" className="text-blue-400 hover:underline">
                    ANSSI - Recommandations sur le phishing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-400 hover:underline">
                    Phishing.org - Éducation et ressources
                  </a>
                </li>
                <li>
                  <a href="#" className="text-blue-400 hover:underline">
                    Test interactif : Pouvez-vous identifier le phishing ?
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </motion.div>
        
        <div className="flex justify-between mt-8">
          <Button onClick={() => setActiveLesson('detection')} variant="outline" className="border-blue-700 text-blue-300">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Précédent
          </Button>
          <Button onClick={() => setActiveLesson('quiz')} className="bg-blue-700 hover:bg-blue-800">
            Quiz final
            <PlayCircle className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    ),
    
    quiz: (
      <div className="space-y-6">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={contentVariants}
        >
          <h2 className="text-2xl font-bold">Quiz : Détecter le phishing</h2>
          
          {!quizStarted && !quizCompleted ? (
            <div className="mt-6">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <CardTitle>Évaluez vos connaissances</CardTitle>
                  <CardDescription className="text-blue-200">
                    Ce quiz comporte 5 questions pour tester votre compréhension des techniques de phishing et des méthodes de protection.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-blue-800/20 p-4 rounded-md">
                    <h3 className="font-medium">Instructions</h3>
                    <ul className="list-disc list-inside text-sm text-blue-200 mt-2 space-y-1">
                      <li>Sélectionnez la meilleure réponse pour chaque question</li>
                      <li>Vous obtiendrez votre score à la fin du quiz</li>
                      <li>Une explication sera fournie pour chaque réponse</li>
                    </ul>
                  </div>
                  
                  <Button 
                    className="w-full bg-blue-700 hover:bg-blue-800"
                    onClick={() => setQuizStarted(true)}
                  >
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Commencer le quiz
                  </Button>
                </CardContent>
              </Card>
              
              <div className="mt-8">
                <Button onClick={() => setActiveLesson('protection')} variant="outline" className="border-blue-700 text-blue-300">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Revenir au contenu
                </Button>
              </div>
            </div>
          ) : quizStarted && !quizCompleted ? (
            <div className="mt-6">
              <Card className="bg-blue-900/20 border-blue-800">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Question {currentQuestion + 1} sur {questions.length}</CardTitle>
                    <Badge className="bg-blue-700">{currentQuestion + 1}/{questions.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-800/20 p-4 rounded-md">
                    <h3 className="font-medium text-lg">{questions[currentQuestion].question}</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {questions[currentQuestion].options.map((option, index) => (
                      <Button 
                        key={index}
                        variant="outline" 
                        className="w-full justify-start border-blue-700 hover:bg-blue-800/50 p-4 h-auto"
                        onClick={() => {
                          if (index === questions[currentQuestion].correctAnswer) {
                            setScore(score + 1);
                          }
                          
                          if (currentQuestion < questions.length - 1) {
                            setCurrentQuestion(currentQuestion + 1);
                          } else {
                            setQuizCompleted(true);
                          }
                        }}
                      >
                        <div className="mr-3 bg-blue-700/80 text-white w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span className="text-left">{option}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="mt-6">
              <Card className={`${score >= 4 ? 'bg-green-900/20 border-green-800' : score >= 2 ? 'bg-orange-900/20 border-orange-800' : 'bg-red-900/20 border-red-800'}`}>
                <CardHeader>
                  <CardTitle>Résultats du quiz</CardTitle>
                  <CardDescription className={`${score >= 4 ? 'text-green-200' : score >= 2 ? 'text-orange-200' : 'text-red-200'}`}>
                    Vous avez obtenu {score}/{questions.length} bonnes réponses.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`p-4 rounded-md ${score >= 4 ? 'bg-green-800/20' : score >= 2 ? 'bg-orange-800/20' : 'bg-red-800/20'}`}>
                    <h3 className="font-medium">
                      {score >= 4 
                        ? 'Excellent ! Vous avez de solides connaissances en matière de phishing.' 
                        : score >= 2 
                          ? 'Pas mal ! Vous avez des connaissances de base mais quelques points à améliorer.' 
                          : 'Vous devriez revoir ce module pour renforcer vos connaissances sur le phishing.'}
                    </h3>
                    <p className={`mt-2 text-sm ${score >= 4 ? 'text-green-200' : score >= 2 ? 'text-orange-200' : 'text-red-200'}`}>
                      {score >= 4 
                        ? 'Continuez à rester vigilant et à appliquer ces connaissances au quotidien.' 
                        : 'Concentrez-vous particulièrement sur la reconnaissance des signes de phishing et les bonnes pratiques de sécurité.'}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <Button 
                      variant="outline" 
                      className="border-blue-700 text-blue-300"
                      onClick={() => {
                        setQuizStarted(false);
                        setQuizCompleted(false);
                        setCurrentQuestion(0);
                        setScore(0);
                        setActiveLesson('introduction');
                      }}
                    >
                      Revoir le module
                    </Button>
                    
                    <Button 
                      className="bg-blue-700 hover:bg-blue-800"
                      onClick={() => {
                        // Ici, on pourrait enregistrer la progression
                        // Pour l'instant, on simule juste un retour à l'accueil
                      }}
                    >
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Terminer et retourner à l'accueil
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </motion.div>
      </div>
    )
  };

  // Navigation principale entre les leçons
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <Link href="/cyber/learning-center/modules/micro-learning">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au Micro-Learning
          </Button>
        </Link>
        <PageTitle
          title="Détecter le phishing"
          subtitle="Reconnaître et se protéger contre les attaques de phishing"
          icon={<Mail className="h-8 w-8 text-blue-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panneau latéral */}
        <div className="space-y-6">
          <Card className="bg-blue-900/20 border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg">Progression</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="p-4 border-b border-blue-800">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progression globale</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="py-2">
                {lessons.map((lesson) => (
                  <button
                    key={lesson.id}
                    className={`w-full text-left py-2 px-4 flex items-center justify-between hover:bg-blue-800/30 transition-colors ${activeLesson === lesson.id ? 'bg-blue-800/30 font-medium' : ''}`}
                    onClick={() => setActiveLesson(lesson.id)}
                  >
                    <span>{lesson.title}</span>
                    {lesson.progress > 0 && (
                      <Badge variant="outline" className="bg-blue-800/50 border-blue-700">
                        {lesson.progress}%
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-900/20 border-blue-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Informations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-300">Durée</span>
                  <span>30-45 min</span>
                </div>
                <Separator className="bg-blue-800/50" />
                <div className="flex justify-between">
                  <span className="text-blue-300">Niveau</span>
                  <Badge>Débutant</Badge>
                </div>
                <Separator className="bg-blue-800/50" />
                <div className="flex justify-between">
                  <span className="text-blue-300">Catégorie</span>
                  <span>Sécurité</span>
                </div>
                <Separator className="bg-blue-800/50" />
                <div className="flex justify-between">
                  <span className="text-blue-300">Mise à jour</span>
                  <span>Avril 2025</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Contenu principal */}
        <div className="lg:col-span-3">
          <Card className="bg-blue-900/20 border-blue-800">
            <CardContent className="pt-6">
              {lessonContent[activeLesson]}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}