import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Trophy, 
  CheckCircle, 
  XCircle, 
  Lock, 
  AlertTriangle, 
  Info,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

// Types pour le jeu
interface PasswordChallenge {
  id: number;
  description: string;
  requirements: {
    minLength: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    specialChars: boolean;
    noSequential: boolean;
    noCommon: boolean;
  };
  scenario: string;
  difficultyLevel: number;
}

// Liste de mots de passe courants à éviter
const commonPasswords = [
  'password', 'password123', '123456', '12345678', 'qwerty', 'admin', 
  'welcome', 'letmein', 'football', 'iloveyou', 'monkey', 'abc123', 
  'superman', 'dragon', 'master', 'sunshine', 'ashley', 'bailey', 
  'shadow', 'baseball', '000000', '111111', 'trustno1', 'azerty'
];

// Liste de séquences à éviter
const commonSequences = [
  '123', '1234', '12345', '123456', 'abcd', 'qwerty', 'asdf', 'zxcv'
];

const challenges: PasswordChallenge[] = [
  {
    id: 1,
    description: "Créez un mot de passe basique pour votre compte email personnel",
    requirements: {
      minLength: 8,
      uppercase: true,
      lowercase: true,
      numbers: true,
      specialChars: false,
      noSequential: false,
      noCommon: true
    },
    scenario: "Vous créez un nouveau compte email. Créez un mot de passe sécurisé mais facile à retenir.",
    difficultyLevel: 1
  },
  {
    id: 2,
    description: "Créez un mot de passe pour votre compte bancaire en ligne",
    requirements: {
      minLength: 10,
      uppercase: true,
      lowercase: true,
      numbers: true,
      specialChars: true,
      noSequential: true,
      noCommon: true
    },
    scenario: "Vous configurez l'accès à votre compte bancaire en ligne. Ce mot de passe doit être particulièrement sécurisé.",
    difficultyLevel: 2
  },
  {
    id: 3,
    description: "Créez un mot de passe pour votre compte administrateur professionnel",
    requirements: {
      minLength: 12,
      uppercase: true,
      lowercase: true,
      numbers: true,
      specialChars: true,
      noSequential: true,
      noCommon: true
    },
    scenario: "En tant qu'administrateur système, vous devez créer un mot de passe pour accéder aux systèmes critiques de l'entreprise.",
    difficultyLevel: 3
  },
  {
    id: 4,
    description: "Créez un mot de passe pour sécuriser une base de données sensible",
    requirements: {
      minLength: 14,
      uppercase: true,
      lowercase: true,
      numbers: true,
      specialChars: true,
      noSequential: true,
      noCommon: true
    },
    scenario: "Vous êtes chargé de créer un accès sécurisé à une base de données contenant des informations médicales confidentielles.",
    difficultyLevel: 4
  },
  {
    id: 5,
    description: "Créez un mot de passe pour un système de haute sécurité gouvernemental",
    requirements: {
      minLength: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      specialChars: true,
      noSequential: true,
      noCommon: true
    },
    scenario: "Vous travaillez pour un organisme gouvernemental qui nécessite le plus haut niveau de sécurité. Créez un mot de passe ultra-sécurisé.",
    difficultyLevel: 5
  }
];

const PasswordGuardianPage: React.FC = () => {
  const { toast } = useToast();
  const [currentLevel, setCurrentLevel] = useState(1);
  const [password, setPassword] = useState('');
  const [score, setScore] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [feedback, setFeedback] = useState<{
    valid: boolean;
    errors: string[];
    strengthDetails: {
      length: boolean;
      uppercase: boolean;
      lowercase: boolean;
      numbers: boolean;
      specialChars: boolean;
      noSequential: boolean;
      noCommon: boolean;
    };
  }>({
    valid: false,
    errors: [],
    strengthDetails: {
      length: false,
      uppercase: false,
      lowercase: false,
      numbers: false,
      specialChars: false,
      noSequential: true,
      noCommon: true
    }
  });
  const [gameStatus, setGameStatus] = useState<'playing' | 'levelComplete' | 'gameOver'>('playing');
  const [showTips, setShowTips] = useState(false);
  
  const currentChallenge = challenges[currentLevel - 1];
  
  // Fonction pour calculer la force du mot de passe
  const calculatePasswordStrength = useCallback((pwd: string) => {
    if (!pwd) return 0;
    
    let strength = 0;
    const currentReq = currentChallenge.requirements;
    
    // Vérifier la longueur
    if (pwd.length >= currentReq.minLength) {
      strength += 20;
    } else {
      strength += (pwd.length / currentReq.minLength) * 20;
    }
    
    // Vérifier majuscules, minuscules, chiffres et caractères spéciaux
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);
    
    if (currentReq.uppercase && hasUpper) strength += 20;
    if (currentReq.lowercase && hasLower) strength += 20;
    if (currentReq.numbers && hasNumber) strength += 20;
    if (currentReq.specialChars && hasSpecial) strength += 20;
    
    // Vérifier les séquences
    let hasSequential = false;
    if (currentReq.noSequential) {
      for (const seq of commonSequences) {
        if (pwd.toLowerCase().includes(seq)) {
          hasSequential = true;
          strength -= 15;
          break;
        }
      }
    }
    
    // Vérifier les mots de passe courants
    let isCommon = false;
    if (currentReq.noCommon) {
      for (const common of commonPasswords) {
        if (pwd.toLowerCase() === common) {
          isCommon = true;
          strength -= 30;
          break;
        }
      }
    }
    
    // Mettre à jour les détails de la force du mot de passe
    setFeedback(prev => ({
      ...prev,
      strengthDetails: {
        length: pwd.length >= currentReq.minLength,
        uppercase: !currentReq.uppercase || hasUpper,
        lowercase: !currentReq.lowercase || hasLower,
        numbers: !currentReq.numbers || hasNumber,
        specialChars: !currentReq.specialChars || hasSpecial,
        noSequential: !currentReq.noSequential || !hasSequential,
        noCommon: !currentReq.noCommon || !isCommon
      }
    }));
    
    // Limiter la force entre 0 et 100
    return Math.max(0, Math.min(100, strength));
  }, [currentChallenge]);
  
  // Mettre à jour la force du mot de passe lorsqu'il change
  useEffect(() => {
    const strength = calculatePasswordStrength(password);
    setPasswordStrength(strength);
    
    // Récupérer les détails de la force du mot de passe depuis calculatePasswordStrength
    // au lieu d'utiliser feedback.strengthDetails pour éviter les boucles infinies
    const currentReq = currentChallenge.requirements;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    // Vérifier les séquences
    let hasSequential = false;
    if (currentReq.noSequential) {
      for (const seq of commonSequences) {
        if (password.toLowerCase().includes(seq)) {
          hasSequential = true;
          break;
        }
      }
    }
    
    // Vérifier les mots de passe courants
    let isCommon = false;
    if (currentReq.noCommon) {
      for (const common of commonPasswords) {
        if (password.toLowerCase() === common) {
          isCommon = true;
          break;
        }
      }
    }
    
    // Créer les détails de force
    const details = {
      length: password.length >= currentReq.minLength,
      uppercase: !currentReq.uppercase || hasUpper,
      lowercase: !currentReq.lowercase || hasLower,
      numbers: !currentReq.numbers || hasNumber,
      specialChars: !currentReq.specialChars || hasSpecial,
      noSequential: !currentReq.noSequential || !hasSequential,
      noCommon: !currentReq.noCommon || !isCommon
    };
    
    // Vérifier si le mot de passe répond à toutes les exigences
    const isValid = details.length && 
                    details.uppercase && 
                    details.lowercase && 
                    details.numbers && 
                    details.specialChars && 
                    details.noSequential && 
                    details.noCommon;
    
    // Créer la liste des erreurs
    const errorsList: string[] = [];
    if (!details.length) errorsList.push(`Le mot de passe doit contenir au moins ${currentChallenge.requirements.minLength} caractères.`);
    if (!details.uppercase) errorsList.push("Le mot de passe doit contenir au moins une lettre majuscule.");
    if (!details.lowercase) errorsList.push("Le mot de passe doit contenir au moins une lettre minuscule.");
    if (!details.numbers) errorsList.push("Le mot de passe doit contenir au moins un chiffre.");
    if (!details.specialChars) errorsList.push("Le mot de passe doit contenir au moins un caractère spécial.");
    if (!details.noSequential) errorsList.push("Le mot de passe ne doit pas contenir de séquences communes (123, abc, etc.).");
    if (!details.noCommon) errorsList.push("Ce mot de passe est trop commun ou facile à deviner.");
    
    setFeedback({
      valid: isValid,
      errors: errorsList,
      strengthDetails: details
    });
  }, [password, calculatePasswordStrength, currentChallenge.requirements, currentChallenge]);
  
  // Soumettre le mot de passe pour validation
  const submitPassword = () => {
    if (feedback.valid) {
      setScore(score + 1);
      toast({
        title: "Mot de passe validé !",
        description: "Votre mot de passe répond à toutes les exigences de sécurité.",
        variant: "default",
      });
      
      if (currentLevel < challenges.length) {
        setGameStatus('levelComplete');
      } else {
        setGameStatus('gameOver');
      }
    } else {
      toast({
        title: "Mot de passe invalide",
        description: "Votre mot de passe ne répond pas à toutes les exigences de sécurité.",
        variant: "destructive",
      });
    }
  };
  
  // Passer au niveau suivant
  const nextLevel = () => {
    if (currentLevel < challenges.length) {
      setCurrentLevel(currentLevel + 1);
      setPassword('');
      setGameStatus('playing');
    } else {
      setGameStatus('gameOver');
    }
  };
  
  // Redémarrer le jeu
  const restartGame = () => {
    setCurrentLevel(1);
    setScore(0);
    setPassword('');
    setGameStatus('playing');
  };
  
  // Générer un mot de passe aléatoire qui répond aux exigences
  const generateRandomPassword = () => {
    const req = currentChallenge.requirements;
    const length = req.minLength + Math.floor(Math.random() * 4); // Un peu plus long que le minimum
    
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numberChars = '0123456789';
    const specialChars = '!@#$%^&*()-_=+[]{}|;:,.<>?';
    
    let allChars = '';
    let password = '';
    
    // Ajouter les types de caractères requis
    if (req.uppercase) allChars += uppercaseChars;
    if (req.lowercase) allChars += lowercaseChars;
    if (req.numbers) allChars += numberChars;
    if (req.specialChars) allChars += specialChars;
    
    // Assurer la présence d'au moins un caractère de chaque type requis
    if (req.uppercase) password += uppercaseChars.charAt(Math.floor(Math.random() * uppercaseChars.length));
    if (req.lowercase) password += lowercaseChars.charAt(Math.floor(Math.random() * lowercaseChars.length));
    if (req.numbers) password += numberChars.charAt(Math.floor(Math.random() * numberChars.length));
    if (req.specialChars) password += specialChars.charAt(Math.floor(Math.random() * specialChars.length));
    
    // Compléter avec des caractères aléatoires
    while (password.length < length) {
      password += allChars.charAt(Math.floor(Math.random() * allChars.length));
    }
    
    // Mélanger les caractères
    password = password.split('').sort(() => 0.5 - Math.random()).join('');
    
    setPassword(password);
  };
  
  return (
    <HomeLayout>
      <PageTitle title="PASSWORD GUARDIAN" />
      <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-purple-900 via-gray-900 to-black py-6 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/cyber/arcade" className="inline-flex items-center text-purple-300 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Retour à CYBER ARCADE
          </Link>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Password Guardian</h1>
              <p className="text-purple-200 mb-4">Apprenez à créer des mots de passe solides adaptés à différents contextes de sécurité.</p>
            </div>
            <div className="bg-purple-800 rounded-lg p-3 flex items-center">
              <Lock className="text-purple-300 mr-2 h-5 w-5" />
              <span className="text-white font-bold">Niveau {currentLevel}/{challenges.length}</span>
            </div>
          </div>
          
          <div className="bg-purple-900/40 rounded-xl p-4 md:p-6 border border-purple-800 shadow-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex-1">
                <div className="bg-gray-800 h-3 rounded-full overflow-hidden">
                  <Progress value={(currentLevel / challenges.length) * 100} className="h-full" />
                </div>
              </div>
              <div className="ml-4 bg-purple-700 px-3 py-1 rounded-full text-white font-medium text-sm">
                Score: {score}/{challenges.length}
              </div>
            </div>
            
            {gameStatus === 'gameOver' ? (
              <Card className="bg-gray-800 border-purple-700 p-6 text-center">
                <Trophy className="h-20 w-20 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Jeu terminé !</h2>
                <p className="text-gray-300 mb-6">Vous avez obtenu un score de {score} sur {challenges.length}</p>
                
                {score === challenges.length ? (
                  <div className="bg-green-900/40 p-4 rounded-lg mb-6">
                    <p className="text-green-300 font-medium">Félicitations ! Vous êtes un expert en création de mots de passe sécurisés !</p>
                  </div>
                ) : score >= challenges.length * 0.7 ? (
                  <div className="bg-blue-900/40 p-4 rounded-lg mb-6">
                    <p className="text-blue-300 font-medium">Bon travail ! Vous avez de bonnes compétences en matière de création de mots de passe.</p>
                  </div>
                ) : (
                  <div className="bg-yellow-900/40 p-4 rounded-lg mb-6">
                    <p className="text-yellow-300 font-medium">Continuez à vous entraîner pour améliorer vos compétences en création de mots de passe !</p>
                  </div>
                )}
                
                <Button onClick={restartGame} className="bg-purple-600 hover:bg-purple-700">
                  Rejouer
                </Button>
              </Card>
            ) : gameStatus === 'levelComplete' ? (
              <Card className="bg-gray-800 border-purple-700 p-6">
                <div className="flex items-center justify-center text-green-400 mb-4">
                  <CheckCircle className="h-12 w-12" />
                </div>
                <h2 className="text-2xl font-bold text-white text-center mb-4">Niveau {currentLevel} terminé !</h2>
                <p className="text-gray-300 mb-6 text-center">Votre mot de passe répond à toutes les exigences de sécurité pour ce niveau.</p>
                
                <div className="bg-gray-900 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-gray-300">Mot de passe créé :</p>
                    <div className="flex items-center">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="h-6 w-6 p-0 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <p className="font-mono bg-gray-800 p-2 rounded text-white mb-4">
                    {showPassword ? password : password.replace(/./g, '•')}
                  </p>
                  <p className="text-sm text-gray-400">Force : {passwordStrength}%</p>
                  <div className="w-full h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                    <div 
                      className={`h-full ${
                        passwordStrength < 30 ? 'bg-red-500' : 
                        passwordStrength < 70 ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
                
                <Button onClick={nextLevel} className="w-full bg-purple-600 hover:bg-purple-700">
                  Passer au niveau suivant
                </Button>
              </Card>
            ) : (
              <div>
                <Card className="bg-gray-800 border-gray-700 mb-6">
                  <div className="p-4 border-b border-gray-700">
                    <h2 className="text-xl text-white font-bold mb-2">Challenge de niveau {currentLevel}</h2>
                    <p className="text-gray-300">{currentChallenge.description}</p>
                  </div>
                  <div className="p-4">
                    <div className="bg-gray-900 p-4 rounded-lg mb-4">
                      <p className="text-gray-300 mb-2"><span className="font-bold text-purple-300">Scénario :</span> {currentChallenge.scenario}</p>
                      <div className="flex items-start text-sm">
                        <Info className="text-blue-400 mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p className="text-blue-300">
                          Difficulté de sécurité : 
                          <span className="font-bold ml-1">
                            {Array(currentChallenge.difficultyLevel).fill(0).map((_, i) => '★').join('')}
                            {Array(5 - currentChallenge.difficultyLevel).fill(0).map((_, i) => '☆').join('')}
                          </span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="password" className="text-white">Créez votre mot de passe :</Label>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowPassword(!showPassword)}
                            className="h-8 w-8 p-0"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={generateRandomPassword}
                            className="h-8 p-0 flex items-center text-xs text-gray-300"
                            title="Générer un mot de passe aléatoire"
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Aléatoire
                          </Button>
                        </div>
                      </div>
                      <div className="flex relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="bg-gray-900 border-gray-700 text-white"
                          placeholder="Entrez votre mot de passe..."
                        />
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-400">Force : {passwordStrength}%</p>
                        <div className="w-full h-2 bg-gray-700 rounded-full mt-1 overflow-hidden">
                          <div 
                            className={`h-full ${
                              passwordStrength < 30 ? 'bg-red-500' : 
                              passwordStrength < 70 ? 'bg-yellow-500' : 
                              'bg-green-500'
                            }`}
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <h3 className="text-gray-300 font-medium">Exigences :</h3>
                      <ul className="space-y-2">
                        <li className="flex items-center">
                          {feedback.strengthDetails.length ? (
                            <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                          ) : (
                            <XCircle className="text-red-500 mr-2 h-4 w-4" />
                          )}
                          <span className={feedback.strengthDetails.length ? "text-green-300" : "text-red-300"}>
                            Au moins {currentChallenge.requirements.minLength} caractères
                          </span>
                        </li>
                        {currentChallenge.requirements.uppercase && (
                          <li className="flex items-center">
                            {feedback.strengthDetails.uppercase ? (
                              <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                            ) : (
                              <XCircle className="text-red-500 mr-2 h-4 w-4" />
                            )}
                            <span className={feedback.strengthDetails.uppercase ? "text-green-300" : "text-red-300"}>
                              Au moins une lettre majuscule
                            </span>
                          </li>
                        )}
                        {currentChallenge.requirements.lowercase && (
                          <li className="flex items-center">
                            {feedback.strengthDetails.lowercase ? (
                              <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                            ) : (
                              <XCircle className="text-red-500 mr-2 h-4 w-4" />
                            )}
                            <span className={feedback.strengthDetails.lowercase ? "text-green-300" : "text-red-300"}>
                              Au moins une lettre minuscule
                            </span>
                          </li>
                        )}
                        {currentChallenge.requirements.numbers && (
                          <li className="flex items-center">
                            {feedback.strengthDetails.numbers ? (
                              <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                            ) : (
                              <XCircle className="text-red-500 mr-2 h-4 w-4" />
                            )}
                            <span className={feedback.strengthDetails.numbers ? "text-green-300" : "text-red-300"}>
                              Au moins un chiffre
                            </span>
                          </li>
                        )}
                        {currentChallenge.requirements.specialChars && (
                          <li className="flex items-center">
                            {feedback.strengthDetails.specialChars ? (
                              <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                            ) : (
                              <XCircle className="text-red-500 mr-2 h-4 w-4" />
                            )}
                            <span className={feedback.strengthDetails.specialChars ? "text-green-300" : "text-red-300"}>
                              Au moins un caractère spécial
                            </span>
                          </li>
                        )}
                        {currentChallenge.requirements.noSequential && (
                          <li className="flex items-center">
                            {feedback.strengthDetails.noSequential ? (
                              <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                            ) : (
                              <XCircle className="text-red-500 mr-2 h-4 w-4" />
                            )}
                            <span className={feedback.strengthDetails.noSequential ? "text-green-300" : "text-red-300"}>
                              Pas de séquences courantes (123, abc, etc.)
                            </span>
                          </li>
                        )}
                        {currentChallenge.requirements.noCommon && (
                          <li className="flex items-center">
                            {feedback.strengthDetails.noCommon ? (
                              <CheckCircle className="text-green-500 mr-2 h-4 w-4" />
                            ) : (
                              <XCircle className="text-red-500 mr-2 h-4 w-4" />
                            )}
                            <span className={feedback.strengthDetails.noCommon ? "text-green-300" : "text-red-300"}>
                              Pas de mot de passe courant ou facile à deviner
                            </span>
                          </li>
                        )}
                      </ul>
                    </div>
                    
                    <Button 
                      onClick={submitPassword}
                      className="w-full bg-purple-600 hover:bg-purple-700 py-6"
                      size="lg"
                      disabled={!feedback.valid}
                    >
                      {feedback.valid ? "Valider mon mot de passe" : "Complétez toutes les exigences"}
                    </Button>
                  </div>
                </Card>
                
                <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-800/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Conseils pour les mots de passe</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowTips(!showTips)}
                      className="text-purple-300 hover:text-white hover:bg-purple-900/50"
                    >
                      {showTips ? "Masquer" : "Afficher"} les conseils
                    </Button>
                  </div>
                  
                  {showTips && (
                    <div className="space-y-3 text-sm animate-in fade-in duration-200">
                      <p className="text-purple-200">
                        <span className="font-bold">⭐ Créer une phrase de passe :</span> Au lieu d'un mot de passe simple, utilisez une phrase complète que vous pouvez mémoriser facilement.
                        Ex : "Mon_Chat_Dort_Sur_Le_Canapé_42!"
                      </p>
                      <p className="text-purple-200">
                        <span className="font-bold">⭐ Système de substitution :</span> Remplacez des lettres par des chiffres ou symboles ressemblants.
                        Ex : "S3cur1t3_F0rt3!"
                      </p>
                      <p className="text-purple-200">
                        <span className="font-bold">⭐ Combinaison personnelle :</span> Combinez des informations que vous seul connaissez mais qui ne sont pas personnellement identifiables.
                        Ex : "Titre_Film_Prefere_2009#Age_Premier_Chat"
                      </p>
                      <p className="text-purple-200">
                        <span className="font-bold">⭐ Gestionnaire de mots de passe :</span> Utilisez un gestionnaire de mots de passe pour stocker vos identifiants de façon sécurisée.
                      </p>
                      <p className="text-purple-200">
                        <span className="font-bold">⚠️ À éviter :</span> Dates de naissance, noms des proches, mots du dictionnaire, informations publiques sur vos réseaux sociaux.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default PasswordGuardianPage;