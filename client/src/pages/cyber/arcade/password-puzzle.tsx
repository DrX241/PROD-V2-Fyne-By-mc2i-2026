import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  CheckCircle2, 
  XCircle, 
  Zap, 
  ShieldCheck,
  Info,
  Award
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface PasswordRule {
  rule: string;
  description: string;
  example: string;
  counterExample: string;
}

export default function PasswordPuzzle() {
  const [password, setPassword] = useState('');
  const [score, setScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [feedback, setFeedback] = useState<{
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const passwordRules: PasswordRule[] = [
    {
      rule: "Longueur minimale de 12 caractères",
      description: "Un mot de passe sécurisé doit comporter au moins 12 caractères",
      example: "MonMo2dePasse!Securise",
      counterExample: "Court123!"
    },
    {
      rule: "Mélange de lettres majuscules et minuscules",
      description: "Utilisez à la fois des lettres majuscules et minuscules",
      example: "SecuriTe2023!",
      counterExample: "securite2023!"
    },
    {
      rule: "Inclusion de chiffres",
      description: "Ajoutez des chiffres dans votre mot de passe",
      example: "Secure2023!",
      counterExample: "SecurePass!"
    },
    {
      rule: "Caractères spéciaux",
      description: "Incluez des caractères spéciaux (!@#$%^&*)",
      example: "SecurePass!2023",
      counterExample: "SecurePass2023"
    },
    {
      rule: "Évitez les séquences évidentes",
      description: "Évitez les séquences comme '123', 'abc' ou des mots courants",
      example: "Cy8er!S3curiT&",
      counterExample: "Password123"
    }
  ];

  useEffect(() => {
    setMaxScore(passwordRules.length);
  }, []);

  useEffect(() => {
    if (password) {
      evaluatePassword();
    } else {
      setScore(0);
      setFeedback(null);
    }
  }, [password]);

  const evaluatePassword = () => {
    let newScore = 0;
    let feedbackMessages = [];

    // Vérification de la longueur
    if (password.length >= 12) {
      newScore++;
    } else {
      feedbackMessages.push("Le mot de passe doit comporter au moins 12 caractères");
    }

    // Vérification des majuscules et minuscules
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
      newScore++;
    } else {
      feedbackMessages.push("Utilisez à la fois des lettres majuscules et minuscules");
    }

    // Vérification des chiffres
    if (/[0-9]/.test(password)) {
      newScore++;
    } else {
      feedbackMessages.push("Ajoutez au moins un chiffre");
    }

    // Vérification des caractères spéciaux
    if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      newScore++;
    } else {
      feedbackMessages.push("Incluez au moins un caractère spécial");
    }

    // Vérification des séquences évidentes
    const commonPatterns = [
      /123/, /abc/, /password/i, /motdepasse/i, /qwerty/i, /azerty/i
    ];
    const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
    if (!hasCommonPattern) {
      newScore++;
    } else {
      feedbackMessages.push("Évitez les séquences évidentes ou les mots courants");
    }

    setScore(newScore);

    // Message de feedback
    if (newScore === maxScore) {
      setFeedback({
        message: "Excellent ! Votre mot de passe est très sécurisé.",
        type: "success"
      });
      
      if (!gameCompleted) {
        setGameCompleted(true);
      }
    } else if (newScore >= maxScore * 0.8) {
      setFeedback({
        message: "Bon travail ! Votre mot de passe est assez sécurisé, mais peut encore être amélioré.",
        type: "warning"
      });
    } else if (newScore >= maxScore * 0.5) {
      setFeedback({
        message: "Votre mot de passe a une sécurité moyenne. Consultez les conseils pour l'améliorer.",
        type: "warning"
      });
    } else {
      setFeedback({
        message: "Votre mot de passe n'est pas suffisamment sécurisé. Veuillez suivre les règles recommandées.",
        type: "error"
      });
    }
  };

  return (
    <HomeLayout>
      <PageTitle title="LE DÉFI DES MOTS DE PASSE" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-gray-800 via-gray-900 to-blue-900">
        <div className="relative z-10 max-w-4xl w-full mx-auto px-4 py-12 sm:px-6 sm:py-16">
          <div className="flex items-center mb-8">
            <Link href="/cyber/arcade">
              <Button variant="ghost" className="text-white hover:bg-blue-800/20 mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'Arcade
              </Button>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Le Défi des Mots de Passe</h1>
          </div>
          
          <div className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 mb-8">
            <h2 className="text-xl text-white font-semibold mb-4">Testez la robustesse de votre mot de passe</h2>
            <p className="text-blue-200 mb-6">
              Créez un mot de passe sécurisé qui respecte toutes les règles de sécurité recommandées. 
              Votre objectif est d'atteindre un score parfait !
            </p>
            
            <div className="mb-6">
              <label className="block text-white text-sm font-medium mb-2">
                Entrez un mot de passe pour l'évaluer
              </label>
              <input
                type="text"
                className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg border border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tapez votre mot de passe ici..."
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white text-sm font-medium">Score de sécurité</span>
                <span className="text-white text-sm font-medium">{score}/{maxScore}</span>
              </div>
              <Progress 
                value={(score / maxScore) * 100} 
                className="h-2.5"
                indicatorClassName={
                  score === maxScore 
                    ? "bg-green-500" 
                    : score >= maxScore * 0.8 
                    ? "bg-yellow-500" 
                    : score >= maxScore * 0.5
                    ? "bg-orange-500"
                    : "bg-red-500"
                }
              />
            </div>
            
            {feedback && (
              <div className={`p-4 rounded-lg mb-6 flex items-start ${
                feedback.type === 'success' 
                  ? 'bg-green-800/50 text-green-200' 
                  : feedback.type === 'warning'
                  ? 'bg-yellow-800/50 text-yellow-200'
                  : 'bg-red-800/50 text-red-200'
              }`}>
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                ) : feedback.type === 'warning' ? (
                  <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium">{feedback.message}</p>
                </div>
              </div>
            )}
            
            {gameCompleted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-blue-800/50 border border-blue-500/50 p-4 rounded-lg mb-6 text-center"
              >
                <Award className="h-12 w-12 mx-auto mb-2 text-yellow-400" />
                <h3 className="text-xl font-bold text-white mb-2">Félicitations !</h3>
                <p className="text-blue-200">
                  Vous avez créé un mot de passe parfaitement sécurisé qui respecte toutes les règles recommandées.
                </p>
              </motion.div>
            )}
            
            <Button
              variant="outline"
              onClick={() => setShowTips(!showTips)}
              className="w-full text-white border-blue-500 hover:bg-blue-800/50"
            >
              {showTips ? 'Masquer les conseils' : 'Afficher les conseils'}
            </Button>
          </div>
          
          {showTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6"
            >
              <h2 className="text-xl text-white font-semibold mb-4 flex items-center">
                <Zap className="mr-2 h-5 w-5 text-yellow-400" />
                Conseils pour un mot de passe sécurisé
              </h2>
              
              <div className="space-y-6">
                {passwordRules.map((rule, index) => (
                  <div key={index} className="border-l-2 border-blue-500 pl-4">
                    <h3 className="text-white font-medium mb-1">{rule.rule}</h3>
                    <p className="text-blue-200 text-sm mb-2">{rule.description}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                      <div className="bg-green-900/30 p-3 rounded-lg">
                        <div className="flex items-center text-green-400 text-xs font-medium mb-1">
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          BON EXEMPLE
                        </div>
                        <code className="text-green-300 text-sm">{rule.example}</code>
                      </div>
                      <div className="bg-red-900/30 p-3 rounded-lg">
                        <div className="flex items-center text-red-400 text-xs font-medium mb-1">
                          <XCircle className="h-3.5 w-3.5 mr-1" />
                          MAUVAIS EXEMPLE
                        </div>
                        <code className="text-red-300 text-sm">{rule.counterExample}</code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-blue-900/40 p-4 rounded-lg mt-6 flex items-start">
                <ShieldCheck className="h-6 w-6 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-white font-medium mb-1">Note de sécurité importante</h3>
                  <p className="text-blue-200 text-sm">
                    N'utilisez jamais le même mot de passe pour plusieurs comptes. Pensez à utiliser un gestionnaire de mots de passe pour générer et stocker des mots de passe uniques et complexes pour chaque site.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}