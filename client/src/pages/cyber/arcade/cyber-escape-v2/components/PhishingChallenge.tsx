import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, MailCheck, MailQuestion, MailX, Shield, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Types pour les emails
interface EmailAttachment {
  name: string;
  type: string;
  size: string;
  isMalicious?: boolean;
}

interface EmailData {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  date: string;
  content: string;
  isPhishing: boolean;
  phishingIndicators?: string[];
  attachments?: EmailAttachment[];
  urgencyLevel?: 'low' | 'medium' | 'high';
}

interface PhishingChallengeProps {
  onComplete: (success: boolean, score: number, timeBonus: number) => void;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
}

// Exemples d'emails pour le défi de phishing
const sampleEmails: EmailData[] = [
  {
    id: 'email-1',
    sender: 'Service Informatique',
    senderEmail: 'support-it@megacorp-group.co',
    subject: 'Action Urgente: Mise à jour de votre mot de passe',
    date: '02 mai 2025 09:32',
    content: `
      <p>Cher(e) collaborateur(trice),</p>
      <p>Notre système de sécurité a détecté une activité inhabituelle sur votre compte professionnel.</p>
      <p>Pour sécuriser votre compte, vous devez <strong>immédiatement</strong> mettre à jour votre mot de passe en cliquant sur le lien ci-dessous:</p>
      <p><a href="http://portal-megacorp.security-check.com/reset">http://portal-megacorp.security-check.com/reset</a></p>
      <p>Cette procédure est obligatoire et doit être effectuée dans les 24 heures.</p>
      <p>Cordialement,<br>L'équipe Support Informatique</p>
    `,
    isPhishing: true,
    urgencyLevel: 'high',
    phishingIndicators: [
      'Domaine suspect (security-check.com au lieu de megacorp.com)',
      'Création d\'un sentiment d\'urgence',
      'Absence de personnalisation (pas de nom spécifique)',
      'Menace implicite (procédure obligatoire)'
    ]
  },
  {
    id: 'email-2',
    sender: 'Marie Dupont - Ressources Humaines',
    senderEmail: 'm.dupont@megacorp.com',
    subject: 'Mise à jour des avantages sociaux - Mai 2025',
    date: '03 mai 2025 14:15',
    content: `
      <p>Bonjour à tous,</p>
      <p>Le service RH souhaite vous informer des mises à jour concernant vos avantages sociaux pour le mois de mai 2025.</p>
      <p>Vous trouverez en pièce jointe une présentation détaillant les nouveaux avantages ainsi que le calendrier des sessions d'information.</p>
      <p>N'hésitez pas à me contacter si vous avez des questions.</p>
      <p>Cordialement,<br>Marie Dupont<br>Responsable Avantages Sociaux<br>Département RH</p>
    `,
    isPhishing: false,
    urgencyLevel: 'low',
    attachments: [
      {
        name: 'Avantages_Sociaux_Mai2025.pdf',
        type: 'PDF',
        size: '1.2 MB'
      }
    ]
  },
  {
    id: 'email-3',
    sender: 'Service Facturation',
    senderEmail: 'facturation@megacrp.com',
    subject: 'Facture impayée - Action requise',
    date: '03 mai 2025 15:47',
    content: `
      <p>IMPORTANT - ACTION REQUISE</p>
      <p>Bonjour,</p>
      <p>Notre système a détecté une facture impayée sur votre compte. Veuillez régler ce montant immédiatement pour éviter des frais supplémentaires.</p>
      <p>Pour faciliter le paiement, veuillez ouvrir le document ci-joint et suivre les instructions.</p>
      <p>Cette facture doit être réglée sous 48h.</p>
      <p>Service Facturation</p>
    `,
    isPhishing: true,
    urgencyLevel: 'high',
    attachments: [
      {
        name: 'Facture_INV29845.doc',
        type: 'DOC',
        size: '43 KB',
        isMalicious: true
      }
    ],
    phishingIndicators: [
      'Faute dans le domaine (megacrp.com au lieu de megacorp.com)',
      'Pièce jointe au format suspect (.doc plutôt que .pdf)',
      'Contenu vague (pas de détails sur la facture)',
      'Ton alarmiste et urgence artificielle'
    ]
  },
  {
    id: 'email-4',
    sender: 'Thomas Martin - Directeur Technique',
    senderEmail: 't.martin@megacorp.com',
    subject: 'Compte-rendu réunion projet SIGMA',
    date: '04 mai 2025 10:03',
    content: `
      <p>Bonjour à l'équipe projet,</p>
      <p>Suite à notre réunion d'hier concernant le projet SIGMA, vous trouverez en pièce jointe le compte-rendu ainsi que le planning mis à jour.</p>
      <p>Les prochaines étapes ont été validées avec le client et nous commencerons le déploiement comme prévu la semaine prochaine.</p>
      <p>Merci à tous pour votre contribution.</p>
      <p>Cordialement,<br>Thomas Martin<br>Directeur Technique</p>
    `,
    isPhishing: false,
    urgencyLevel: 'medium',
    attachments: [
      {
        name: 'CR_Reunion_SIGMA_04052025.pdf',
        type: 'PDF',
        size: '2.8 MB'
      },
      {
        name: 'Planning_SIGMA_V3.xlsx',
        type: 'XLSX',
        size: '1.4 MB'
      }
    ]
  },
  {
    id: 'email-5',
    sender: 'Support Microsoft Office',
    senderEmail: 'ms-verify@microsoft-verify.com',
    subject: 'Vérification de votre compte Microsoft Office 365',
    date: '04 mai 2025 16:22',
    content: `
      <p>Cher utilisateur Microsoft Office,</p>
      <p>Nous avons récemment détecté des tentatives d'accès multiples à votre compte Office 365 depuis une localisation inhabituelle.</p>
      <p>Afin de protéger vos données, veuillez confirmer votre identité en cliquant sur le bouton ci-dessous:</p>
      <p style="text-align: center;"><a href="https://ms-office365-verify.com/auth" style="padding: 10px 15px; background-color: #0078D4; color: white; text-decoration: none; border-radius: 3px;">Vérifier mon compte</a></p>
      <p>Si vous ignorez cette notification, votre accès aux services Microsoft Office sera suspendu dans les 24 heures.</p>
      <p>L'équipe de sécurité Microsoft</p>
    `,
    isPhishing: true,
    urgencyLevel: 'high',
    phishingIndicators: [
      'Domaine non officiel (microsoft-verify.com)',
      'URL de redirection suspecte (ms-office365-verify.com)',
      'Menace de suspension de compte',
      'Design imitant les emails Microsoft',
      'Manque de details precis'
    ]
  }
];

const PhishingChallenge: React.FC<PhishingChallengeProps> = ({ onComplete, difficultyLevel = 'beginner' }) => {
  // États pour la gestion du jeu
  const [currentEmailIndex, setCurrentEmailIndex] = useState(0);
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  
  // Récupérer l'email courant
  const currentEmail = sampleEmails[currentEmailIndex];
  
  // Vérifier si l'email actuel est déjà sélectionné
  const isSelected = selectedEmails.includes(currentEmail.id);
  
  // Gérer la sélection/désélection d'un email comme phishing
  const toggleEmailSelection = () => {
    if (isSelected) {
      setSelectedEmails(selectedEmails.filter(id => id !== currentEmail.id));
    } else {
      setSelectedEmails([...selectedEmails, currentEmail.id]);
    }
    setFeedback(null);
  };
  
  // Passer à l'email suivant
  const goToNextEmail = () => {
    if (currentEmailIndex < sampleEmails.length - 1) {
      setCurrentEmailIndex(currentEmailIndex + 1);
      setShowHint(false);
      setFeedback(null);
    } else {
      // Tous les emails ont été vérifiés
      evaluateResults();
    }
  };
  
  // Passer à l'email précédent
  const goToPreviousEmail = () => {
    if (currentEmailIndex > 0) {
      setCurrentEmailIndex(currentEmailIndex - 1);
      setShowHint(false);
      setFeedback(null);
    }
  };
  
  // Afficher ou masquer un indice
  const toggleHint = () => {
    setShowHint(!showHint);
    // Petite pénalité de temps pour l'utilisation d'un indice
    if (!showHint) setTimeSpent(prev => prev + 10);
  };
  
  // Évaluer les résultats finaux
  const evaluateResults = () => {
    let correctCount = 0;
    
    sampleEmails.forEach(email => {
      const wasSelected = selectedEmails.includes(email.id);
      if ((email.isPhishing && wasSelected) || (!email.isPhishing && !wasSelected)) {
        correctCount++;
      }
    });
    
    const finalScore = Math.round((correctCount / sampleEmails.length) * 10);
    setScore(finalScore);
    setShowResult(true);
    
    // Calculer le bonus de temps (max 50 secondes)
    const timeBonus = Math.max(0, 50 - timeSpent);
    
    // Déterminer le succès (score de 7/10 ou plus)
    const success = finalScore >= 7;
    
    // Appeler le callback avec les résultats
    onComplete(success, finalScore, timeBonus);
  };
  
  // Animations pour les éléments de l'interface
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };
  
  const emailVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };
  
  const feedbackVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };
  
  // Rendu de la vue des résultats
  if (showResult) {
    const successRate = (score / 10) * 100;
    
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="bg-black/60 backdrop-blur-sm p-6 rounded-lg border border-green-500 space-y-6"
      >
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold text-green-400">Évaluation Terminée</h3>
          <p className="text-gray-300">Vous avez complété l'analyse des emails suspects</p>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Score final:</span>
            <Badge variant="outline" className={`text-lg px-3 py-1 ${score >= 7 ? 'border-green-500 text-green-400' : 'border-red-500 text-red-400'}`}>
              {score}/10
            </Badge>
          </div>
          
          <div className="w-full bg-gray-800 rounded-full h-2.5">
            <motion.div 
              className={`h-2.5 rounded-full ${successRate >= 70 ? 'bg-green-500' : 'bg-red-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${successRate}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          
          <Alert variant={successRate >= 70 ? "default" : "destructive"} className="border-2">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {successRate >= 70 ? (
                <CheckCircle className="h-5 w-5 mr-2 inline-block text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 mr-2 inline-block" />
              )}
              <AlertTitle className="inline-block ml-1">
                {successRate >= 70 ? 'Félicitations!' : 'Attention!'}
              </AlertTitle>
              <AlertDescription>
                {successRate >= 70 
                  ? 'Vous avez démontré de bonnes compétences en détection de phishing.' 
                  : 'Vous devez améliorer vos compétences en détection de phishing.'}
              </AlertDescription>
            </motion.div>
          </Alert>
        </div>
        
        <div className="pt-4 text-center">
          <p className="text-gray-400 text-sm mb-4">
            {successRate >= 70 
              ? 'La porte du Vestibule est maintenant déverrouillée. Vous pouvez continuer votre progression.' 
              : 'Vous devez obtenir au moins 7/10 pour déverrouiller la porte et continuer.'}
          </p>
          
          <Button 
            onClick={() => onComplete(successRate >= 70, score, 0)}
            variant="outline"
            className="border-green-500 text-green-400 hover:bg-green-900/20"
          >
            {successRate >= 70 ? 'Continuer l\'aventure' : 'Réessayer'}
          </Button>
        </div>
      </motion.div>
    );
  }
  
  // Rendu principal du défi
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-black/60 backdrop-blur-sm p-4 rounded-lg border border-green-500 space-y-4"
    >
      <div className="flex justify-between items-center">
        <Badge variant="outline" className="bg-blue-900/30 border-blue-600 text-blue-300">
          {currentEmailIndex + 1} / {sampleEmails.length}
        </Badge>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-400 font-bold">Analyseur de Phishing</span>
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-gray-900 border-green-600">
              <p className="text-xs">Identifiez les emails de phishing dans cette boîte de réception</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Separator className="bg-gray-700" />
      
      <motion.div
        key={currentEmail.id}
        initial="hidden"
        animate="visible"
        variants={emailVariants}
      >
        <Card className="border-gray-700 bg-gray-900/50">
          <CardHeader className="pb-2">
            <div className="flex justify-between">
              <div>
                <CardTitle className="text-base text-gray-200">{currentEmail.subject}</CardTitle>
                <CardDescription>
                  De: {currentEmail.sender} &lt;{currentEmail.senderEmail}&gt;
                </CardDescription>
              </div>
              <Badge variant="outline" className={`
                ${currentEmail.urgencyLevel === 'high' 
                  ? 'border-red-500 text-red-400' 
                  : currentEmail.urgencyLevel === 'medium'
                    ? 'border-yellow-500 text-yellow-400'
                    : 'border-blue-500 text-blue-400'
                }
              `}>
                {currentEmail.urgencyLevel === 'high' 
                  ? 'Urgent' 
                  : currentEmail.urgencyLevel === 'medium'
                    ? 'Important'
                    : 'Standard'
                }
              </Badge>
            </div>
            <p className="text-xs text-gray-400 mt-1">{currentEmail.date}</p>
          </CardHeader>
          
          <CardContent>
            <div 
              className="text-sm text-gray-300 space-y-2 p-3 rounded bg-black/30 border border-gray-800"
              dangerouslySetInnerHTML={{ __html: currentEmail.content }}
            />
            
            {currentEmail.attachments && currentEmail.attachments.length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <p className="text-xs text-gray-400 mb-2">Pièces jointes:</p>
                <div className="flex flex-wrap gap-2">
                  {currentEmail.attachments.map((attachment, idx) => (
                    <Badge 
                      key={idx}
                      variant="outline" 
                      className="border-gray-600 text-gray-300 flex items-center gap-1"
                    >
                      <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                      {attachment.name} ({attachment.size})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between pt-2 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={`border-red-500 ${isSelected ? 'bg-red-900/30 text-red-400' : 'text-gray-400 hover:text-red-400'}`}
                onClick={toggleEmailSelection}
              >
                <MailX className="h-4 w-4 mr-1" />
                {isSelected ? 'Phishing détecté' : 'Marquer comme phishing'}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-blue-400"
                onClick={toggleHint}
              >
                <MailQuestion className="h-4 w-4 mr-1" />
                {showHint ? 'Masquer indice' : 'Indice'}
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousEmail}
                disabled={currentEmailIndex === 0}
                className="text-gray-400 hover:text-gray-200 disabled:opacity-30"
              >
                Précédent
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextEmail}
                className="text-gray-400 hover:text-gray-200"
              >
                {currentEmailIndex < sampleEmails.length - 1 ? 'Suivant' : 'Terminer'}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
      
      {(feedback || showHint) && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={feedbackVariants}
        >
          {feedback && (
            <Alert variant={feedback.success ? "default" : "destructive"} className="border-2">
              {feedback.success ? (
                <CheckCircle className="h-5 w-5 mr-2" />
              ) : (
                <XCircle className="h-5 w-5 mr-2" />
              )}
              <AlertTitle>{feedback.success ? 'Bonne analyse!' : 'Analyse incorrecte'}</AlertTitle>
              <AlertDescription>{feedback.message}</AlertDescription>
            </Alert>
          )}
          
          {showHint && !feedback && currentEmail.isPhishing && (
            <Alert variant="default" className="border-blue-500 bg-blue-900/20">
              <AlertCircle className="h-5 w-5 mr-2 text-blue-400" />
              <AlertTitle className="text-blue-400">Indices à rechercher:</AlertTitle>
              <AlertDescription className="text-blue-200 text-sm">
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  {currentEmail.phishingIndicators && 
                    currentEmail.phishingIndicators.slice(0, difficultyLevel === 'beginner' ? 2 : 1).map((indicator, idx) => (
                      <li key={idx}>{indicator}</li>
                    ))
                  }
                  <li className="italic text-xs text-blue-300 mt-2">
                    (L'utilisation d'indices réduit votre bonus de temps)
                  </li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {showHint && !feedback && !currentEmail.isPhishing && (
            <Alert variant="default" className="border-blue-500 bg-blue-900/20">
              <MailCheck className="h-5 w-5 mr-2 text-blue-400" />
              <AlertTitle className="text-blue-400">Indices à rechercher:</AlertTitle>
              <AlertDescription className="text-sm text-blue-200">
                Vérifiez l'adresse email, le niveau de personnalisation et si le contenu semble cohérent avec l'expéditeur supposé.
              </AlertDescription>
            </Alert>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default PhishingChallenge;