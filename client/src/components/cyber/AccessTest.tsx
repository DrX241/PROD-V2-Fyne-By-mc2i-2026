import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { RoleTest, TestQuestion } from '@shared/types/roles';

interface AccessTestProps {
  test: RoleTest;
  onTestComplete: (passed: boolean, score: number) => void;
}

const AccessTest: React.FC<AccessTestProps> = ({ test, onTestComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>(Array(test.questions.length).fill(-1));
  const [timeRemaining, setTimeRemaining] = useState(test.timeLimit * 60); // Convertir les minutes en secondes
  const [testSubmitted, setTestSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // Gestion du compte à rebours
  useEffect(() => {
    if (timeRemaining > 0 && !testSubmitted) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !testSubmitted) {
      handleSubmitTest();
    }
  }, [timeRemaining, testSubmitted]);

  // Calculer le score en pourcentage
  const calculateScore = () => {
    const correctAnswers = selectedAnswers.reduce((count, answer, index) => {
      return count + (answer === test.questions[index].correctAnswer ? 1 : 0);
    }, 0);
    return Math.round((correctAnswers / test.questions.length) * 100);
  };

  // Gérer la soumission du test
  const handleSubmitTest = () => {
    setTestSubmitted(true);
    const score = calculateScore();
    const passed = score >= test.passingScore;
    onTestComplete(passed, score);
  };

  // Gérer le changement de réponse
  const handleAnswerSelect = (questionIndex: number, answerIndex: number) => {
    if (testSubmitted) return;
    
    const newSelectedAnswers = [...selectedAnswers];
    newSelectedAnswers[questionIndex] = answerIndex;
    setSelectedAnswers(newSelectedAnswers);
  };

  // Formater le temps restant
  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Question courante
  const currentQuestion = test.questions[currentQuestionIndex];

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{test.title}</h2>
        
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <Clock className="h-5 w-5" />
          <span className="font-mono font-bold">{formatTimeRemaining()}</span>
        </div>
      </div>
      
      <p className="mb-6 text-gray-600 dark:text-gray-300">{test.description}</p>
      
      {/* Progression du test */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-1">
          <span>Progression</span>
          <span>{currentQuestionIndex + 1} / {test.questions.length}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-500 rounded-full transition-all" 
            style={{ width: `${((currentQuestionIndex + 1) / test.questions.length) * 100}%` }}
          ></div>
        </div>
      </div>
      
      {/* Question courante */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">
          {currentQuestionIndex + 1}. {currentQuestion.question}
        </h3>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <div 
              key={index}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedAnswers[currentQuestionIndex] === index
                  ? testSubmitted
                    ? index === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-700'
                    : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700'
                  : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
              }`}
              onClick={() => handleAnswerSelect(currentQuestionIndex, index)}
            >
              <div className="flex items-start">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                  selectedAnswers[currentQuestionIndex] === index
                    ? testSubmitted
                      ? index === currentQuestion.correctAnswer
                        ? 'bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200'
                        : 'bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-200'
                      : 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span>{option}</span>
                
                {testSubmitted && index === currentQuestion.correctAnswer && (
                  <CheckCircle className="ml-auto h-5 w-5 text-green-500" />
                )}
                
                {testSubmitted && selectedAnswers[currentQuestionIndex] === index && 
                  index !== currentQuestion.correctAnswer && (
                  <AlertTriangle className="ml-auto h-5 w-5 text-red-500" />
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Explication (visible uniquement après soumission) */}
        {testSubmitted && (
          <div className="mt-4">
            <button 
              className="text-blue-600 dark:text-blue-400 font-medium text-sm flex items-center gap-1"
              onClick={() => setShowExplanation(!showExplanation)}
            >
              {showExplanation ? 'Masquer' : 'Voir'} l'explication
            </button>
            
            {showExplanation && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-sm">
                {currentQuestion.explanation}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <div className="flex justify-between">
        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md text-gray-700 dark:text-gray-200 font-medium disabled:opacity-50"
          disabled={currentQuestionIndex === 0 || testSubmitted}
          onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
        >
          Précédent
        </button>
        
        {currentQuestionIndex < test.questions.length - 1 ? (
          <button
            className="px-4 py-2 bg-blue-600 dark:bg-blue-700 rounded-md text-white font-medium disabled:opacity-50"
            disabled={selectedAnswers[currentQuestionIndex] === -1 || testSubmitted}
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
          >
            Suivant
          </button>
        ) : (
          <button
            className="px-4 py-2 bg-green-600 dark:bg-green-700 rounded-md text-white font-medium disabled:opacity-50"
            disabled={selectedAnswers.includes(-1) || testSubmitted}
            onClick={handleSubmitTest}
          >
            Terminer le test
          </button>
        )}
      </div>
      
      {/* Résultats (visible uniquement après soumission) */}
      {testSubmitted && (
        <div className="mt-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-medium mb-2">Résultats</h3>
          
          <div className="flex items-center gap-3 mb-3">
            <div className="text-xl font-bold">
              Score: {calculateScore()}%
            </div>
            
            {calculateScore() >= test.passingScore ? (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle className="h-5 w-5" />
                <span>Réussi</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                <span>Échoué</span>
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {calculateScore() >= test.passingScore 
              ? 'Félicitations ! Vous avez réussi le test d\'accès et pouvez maintenant accéder au module sélectionné.'
              : `Vous n'avez pas atteint le score minimal requis (${test.passingScore}%). N'hésitez pas à revoir les concepts fondamentaux et à réessayer.`
            }
          </p>
          
          {calculateScore() >= test.passingScore && (
            <button
              className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 rounded-md text-white font-medium"
              onClick={() => onTestComplete(true, calculateScore())}
            >
              Accéder à la mission
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AccessTest;