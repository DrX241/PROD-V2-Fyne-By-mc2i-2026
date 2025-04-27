import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    value: string;
  }[];
}

import { type CyberSkillLevel } from "@shared/schema";

interface QuizEvaluationProps {
  domain: string;
  onComplete: (score: number, level: CyberSkillLevel) => void;
  onCancel: () => void;
}

export default function QuizEvaluation({ domain, onComplete, onCancel }: QuizEvaluationProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState<CyberSkillLevel>("Intermédiaire");

  // Ensemble de questions adaptées au domaine sélectionné
  const questions = getQuestionsByDomain(domain);
  
  const handleAnswerSelect = (questionId: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Calculer le score en fonction des réponses
      let totalScore = 0;
      const answerValues = Object.values(answers);
      
      // Calculer le score en fonction des niveaux des réponses
      answerValues.forEach(value => {
        if (value === "expert") totalScore += 3;
        else if (value === "intermédiaire") totalScore += 2;
        else if (value === "débutant") totalScore += 1;
      });
      
      // Déterminer le niveau en fonction du score total
      const maxPossibleScore = questions.length * 3; // Score maximum possible
      const percentage = (totalScore / maxPossibleScore) * 100;
      
      let determinedLevel: CyberSkillLevel;
      if (percentage >= 75) {
        determinedLevel = "Expert";
      } else if (percentage >= 40) {
        determinedLevel = "Intermédiaire";
      } else {
        determinedLevel = "Débutant";
      }
      
      setScore(totalScore);
      setLevel(determinedLevel);
      setSubmitted(true);
      
      // Attendre un court moment pour montrer le résultat avant de compléter
      setTimeout(() => {
        onComplete(totalScore, determinedLevel);
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de l'évaluation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="animate-fadeIn">
      <Card className="bg-gradient-to-br from-blue-950 to-indigo-900 text-white border-blue-800 max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-xl text-center">
            {submitted ? "Évaluation terminée" : "Évaluez votre niveau en cybersécurité"}
          </CardTitle>
          {!submitted && (
            <div className="mt-2">
              <div className="h-2 w-full bg-blue-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-blue-300">
                <span>Question {currentQuestionIndex + 1}/{questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/20">
                  <CheckCircle className="h-10 w-10 text-blue-400" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium">Votre niveau estimé</h3>
                <p className="text-3xl font-bold text-blue-300 mt-2">{level}</p>
              </div>
              <p className="text-blue-200">
                Nous allons maintenant adapter les scénarios en fonction de votre niveau.
              </p>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-medium mb-3">{currentQuestion.text}</h3>
              <RadioGroup 
                value={answers[currentQuestion.id] || ""}
                onValueChange={(value) => handleAnswerSelect(currentQuestion.id, value)}
                className="space-y-3"
              >
                {currentQuestion.options.map((option) => (
                  <div 
                    key={option.id} 
                    className="flex items-start space-x-2 p-3 rounded-md hover:bg-blue-800/40 transition-colors cursor-pointer"
                    onClick={() => handleAnswerSelect(currentQuestion.id, option.value)}
                  >
                    <RadioGroupItem 
                      value={option.value} 
                      id={option.id} 
                      className="mt-1 border-blue-400"
                    />
                    <div className="flex-1">
                      <Label 
                        htmlFor={option.id} 
                        className="text-base font-medium cursor-pointer"
                      >
                        {option.text}
                      </Label>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {!submitted ? (
            <>
              {currentQuestionIndex > 0 ? (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="bg-transparent border-blue-500 text-blue-300 hover:bg-blue-800/50"
                  disabled={isSubmitting}
                >
                  Précédent
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="bg-transparent border-blue-500 text-blue-300 hover:bg-blue-800/50"
                >
                  Annuler
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 ml-auto"
                disabled={!answers[currentQuestion.id] || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                {currentQuestionIndex < questions.length - 1 ? "Suivant" : "Terminer"}
              </Button>
            </>
          ) : (
            <Button
              className="bg-blue-600 hover:bg-blue-700 mx-auto"
              onClick={() => onComplete(score, level)}
            >
              Continuer
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

// Fonction pour obtenir des questions adaptées au domaine
function getQuestionsByDomain(domain: string): Question[] {
  // Questions communes à tous les domaines
  const commonQuestions: Question[] = [
    {
      id: "q1",
      text: "Comment évaluez-vous vos connaissances générales en cybersécurité ?",
      options: [
        { 
          id: "q1-a", 
          text: "J'ai des connaissances de base et je comprends les principes fondamentaux.", 
          value: "débutant" 
        },
        { 
          id: "q1-b", 
          text: "Je possède une bonne compréhension des concepts et j'ai déjà travaillé sur des projets liés à la cybersécurité.", 
          value: "intermédiaire" 
        },
        { 
          id: "q1-c", 
          text: "J'ai une expertise approfondie et une expérience significative en cybersécurité.", 
          value: "expert" 
        }
      ]
    },
    {
      id: "q2",
      text: "Face à une menace de cybersécurité, comment approchez-vous généralement la situation ?",
      options: [
        { 
          id: "q2-a", 
          text: "Je suis les procédures établies et demande de l'aide à des experts si nécessaire.", 
          value: "débutant" 
        },
        { 
          id: "q2-b", 
          text: "J'analyse la situation, identifie les risques potentiels et mets en place des mesures de protection appropriées.", 
          value: "intermédiaire" 
        },
        { 
          id: "q2-c", 
          text: "Je réalise une analyse approfondie, développe une stratégie complète de réponse et coordonne les différentes équipes impliquées.", 
          value: "expert" 
        }
      ]
    }
  ];
  
  // Questions spécifiques au domaine
  let domainQuestions: Question[] = [];
  
  if (domain === "gestion-crise") {
    domainQuestions = [
      {
        id: "d1",
        text: "Dans le cadre d'une gestion de crise cyber, quelle affirmation vous correspond le mieux ?",
        options: [
          { 
            id: "d1-a", 
            text: "Je connais les bases de la gestion de crise, comme l'importance d'avoir un plan de réponse aux incidents.", 
            value: "débutant" 
          },
          { 
            id: "d1-b", 
            text: "J'ai participé à l'élaboration de plans de gestion de crise et à des exercices de simulation.", 
            value: "intermédiaire" 
          },
          { 
            id: "d1-c", 
            text: "J'ai dirigé des équipes de gestion de crise et géré des incidents de sécurité majeurs en environnement réel.", 
            value: "expert" 
          }
        ]
      },
      {
        id: "d2",
        text: "Comment évaluez-vous votre capacité à communiquer pendant une crise cyber ?",
        options: [
          { 
            id: "d2-a", 
            text: "Je comprends l'importance de la communication mais j'ai peu d'expérience pratique.", 
            value: "débutant" 
          },
          { 
            id: "d2-b", 
            text: "Je sais adapter ma communication en fonction des différentes parties prenantes (techniques, management, clients).", 
            value: "intermédiaire" 
          },
          { 
            id: "d2-c", 
            text: "J'ai une expérience significative dans l'élaboration de stratégies de communication de crise et dans la gestion des relations avec les médias et les autorités.", 
            value: "expert" 
          }
        ]
      },
      {
        id: "d3",
        text: "Concernant les aspects juridiques et réglementaires des incidents de cybersécurité :",
        options: [
          { 
            id: "d3-a", 
            text: "J'ai une connaissance basique des obligations légales comme la notification des violations de données.", 
            value: "débutant" 
          },
          { 
            id: "d3-b", 
            text: "Je connais bien le cadre réglementaire (RGPD, NIS2, etc.) et ses implications lors d'une crise.", 
            value: "intermédiaire" 
          },
          { 
            id: "d3-c", 
            text: "Je maîtrise parfaitement les aspects juridiques et ai déjà géré des interactions avec les autorités de régulation et les implications transfrontalières.", 
            value: "expert" 
          }
        ]
      }
    ];
  } else if (domain === "donnees-personnelles") {
    domainQuestions = [
      {
        id: "d1",
        text: "Comment évaluez-vous votre connaissance du RGPD et des réglementations sur la protection des données ?",
        options: [
          { 
            id: "d1-a", 
            text: "Je connais les principes de base comme le consentement et le droit à l'effacement.", 
            value: "débutant" 
          },
          { 
            id: "d1-b", 
            text: "Je comprends bien le RGPD et j'ai déjà travaillé sur des projets de mise en conformité.", 
            value: "intermédiaire" 
          },
          { 
            id: "d1-c", 
            text: "J'ai une expertise approfondie du RGPD et d'autres cadres réglementaires internationaux, et j'ai dirigé des programmes de conformité complets.", 
            value: "expert" 
          }
        ]
      },
      {
        id: "d2",
        text: "En cas de violation de données personnelles :",
        options: [
          { 
            id: "d2-a", 
            text: "Je sais qu'il faut le signaler mais je ne suis pas familier avec les procédures détaillées.", 
            value: "débutant" 
          },
          { 
            id: "d2-b", 
            text: "Je connais les étapes à suivre, les délais de notification et la documentation requise.", 
            value: "intermédiaire" 
          },
          { 
            id: "d2-c", 
            text: "J'ai géré des violations de données réelles, coordonné les notifications aux autorités et aux personnes concernées, et mis en œuvre des mesures correctives.", 
            value: "expert" 
          }
        ]
      },
      {
        id: "d3",
        text: "Concernant l'analyse d'impact relative à la protection des données (AIPD/DPIA) :",
        options: [
          { 
            id: "d3-a", 
            text: "J'en comprends le concept mais je n'ai jamais réalisé d'AIPD.", 
            value: "débutant" 
          },
          { 
            id: "d3-b", 
            text: "J'ai participé à la réalisation d'AIPD et je comprends bien la méthodologie d'évaluation des risques.", 
            value: "intermédiaire" 
          },
          { 
            id: "d3-c", 
            text: "J'ai dirigé de nombreuses AIPD pour des traitements complexes et je sais intégrer les résultats dans la conception des systèmes (Privacy by Design).", 
            value: "expert" 
          }
        ]
      }
    ];
  } else if (domain === "ingenierie-sociale") {
    domainQuestions = [
      {
        id: "d1",
        text: "Comment évaluez-vous votre capacité à identifier les attaques de phishing ?",
        options: [
          { 
            id: "d1-a", 
            text: "Je connais les signes évidents comme les fautes d'orthographe et les URLs suspectes.", 
            value: "débutant" 
          },
          { 
            id: "d1-b", 
            text: "Je peux reconnaître des attaques de phishing sophistiquées et je comprends les techniques de spear phishing.", 
            value: "intermédiaire" 
          },
          { 
            id: "d1-c", 
            text: "J'ai une expertise approfondie dans l'analyse des attaques de phishing avancées, y compris les attaques ciblées de type BEC (Business Email Compromise).", 
            value: "expert" 
          }
        ]
      },
      {
        id: "d2",
        text: "Concernant les programmes de sensibilisation à l'ingénierie sociale :",
        options: [
          { 
            id: "d2-a", 
            text: "J'ai participé à des formations en tant qu'apprenant et je comprends l'importance de la sensibilisation.", 
            value: "débutant" 
          },
          { 
            id: "d2-b", 
            text: "J'ai contribué à l'élaboration de programmes de formation et réalisé des simulations de phishing.", 
            value: "intermédiaire" 
          },
          { 
            id: "d2-c", 
            text: "J'ai conçu et dirigé des programmes complets de sensibilisation, incluant des simulations avancées et l'analyse comportementale.", 
            value: "expert" 
          }
        ]
      },
      {
        id: "d3",
        text: "Face à une attaque d'ingénierie sociale réussie :",
        options: [
          { 
            id: "d3-a", 
            text: "Je saurais la signaler mais j'aurais besoin d'aide pour les étapes suivantes.", 
            value: "débutant" 
          },
          { 
            id: "d3-b", 
            text: "Je pourrais analyser l'incident, évaluer les dommages potentiels et proposer des mesures correctives.", 
            value: "intermédiaire" 
          },
          { 
            id: "d3-c", 
            text: "J'ai l'expérience de la gestion complète d'incidents d'ingénierie sociale, de l'analyse technique à la coordination de la réponse avec tous les départements concernés.", 
            value: "expert" 
          }
        ]
      }
    ];
  } else if (domain === "gestion-incidents") {
    domainQuestions = [
      {
        id: "d1",
        text: "Comment évaluez-vous votre maîtrise des processus de gestion des incidents de sécurité ?",
        options: [
          { 
            id: "d1-a", 
            text: "Je connais les étapes de base (détection, analyse, confinement, éradication, etc.).", 
            value: "débutant" 
          },
          { 
            id: "d1-b", 
            text: "J'ai une bonne expérience pratique des différentes phases et j'ai participé à des équipes de réponse aux incidents.", 
            value: "intermédiaire" 
          },
          { 
            id: "d1-c", 
            text: "J'ai dirigé des équipes CSIRT/CERT, défini des processus de gestion des incidents et géré des incidents majeurs avec succès.", 
            value: "expert" 
          }
        ]
      },
      {
        id: "d2",
        text: "Concernant l'analyse forensique et l'investigation numérique :",
        options: [
          { 
            id: "d2-a", 
            text: "Je comprends les principes de base mais j'ai peu d'expérience pratique.", 
            value: "débutant" 
          },
          { 
            id: "d2-b", 
            text: "J'ai réalisé des analyses basiques (logs, mémoire, disque) et je connais les outils principaux.", 
            value: "intermédiaire" 
          },
          { 
            id: "d2-c", 
            text: "J'ai une expertise approfondie en analyse forensique, connaissance des techniques anti-forensiques et expérience dans la préservation des preuves pour usage légal.", 
            value: "expert" 
          }
        ]
      },
      {
        id: "d3",
        text: "Dans le domaine de la détection et de la surveillance de sécurité :",
        options: [
          { 
            id: "d3-a", 
            text: "Je connais les concepts de base comme les IDS/IPS et les SIEM.", 
            value: "débutant" 
          },
          { 
            id: "d3-b", 
            text: "J'ai configuré et utilisé des outils de détection, analysé des alertes et défini des règles de corrélation.", 
            value: "intermédiaire" 
          },
          { 
            id: "d3-c", 
            text: "J'ai conçu des architectures complètes de détection, développé des techniques avancées de threat hunting et optimisé des SOC.", 
            value: "expert" 
          }
        ]
      }
    ];
  } else if (domain === "supply-chain") {
    domainQuestions = [
      {
        id: "d1",
        text: "Comment évaluez-vous votre connaissance de la sécurité de la chaîne d'approvisionnement IT ?",
        options: [
          { 
            id: "d1-a", 
            text: "Je connais les risques de base liés aux fournisseurs et sous-traitants.", 
            value: "débutant" 
          },
          { 
            id: "d1-b", 
            text: "J'ai une bonne compréhension des risques liés à la supply chain et j'ai participé à des évaluations de sécurité des fournisseurs.", 
            value: "intermédiaire" 
          },
          { 
            id: "d1-c", 
            text: "J'ai une expertise approfondie dans la gestion des risques de la chaîne d'approvisionnement et j'ai conçu des programmes complets d'évaluation et de contrôle.", 
            value: "expert" 
          }
        ]
      },
      {
        id: "d2",
        text: "Concernant les attaques ciblant la chaîne d'approvisionnement (supply chain attacks) :",
        options: [
          { 
            id: "d2-a", 
            text: "Je connais quelques exemples célèbres comme SolarWinds mais avec peu de détails techniques.", 
            value: "débutant" 
          },
          { 
            id: "d2-b", 
            text: "Je comprends bien les vecteurs d'attaque, les techniques utilisées et les mesures de protection principales.", 
            value: "intermédiaire" 
          },
          { 
            id: "d2-c", 
            text: "J'ai une connaissance approfondie des attaques historiques et émergentes, j'ai développé des stratégies de défense en profondeur et géré des incidents liés à la supply chain.", 
            value: "expert" 
          }
        ]
      },
      {
        id: "d3",
        text: "En matière de clauses contractuelles et d'exigences de sécurité pour les fournisseurs :",
        options: [
          { 
            id: "d3-a", 
            text: "Je connais les principes de base comme l'importance d'inclure des clauses de sécurité.", 
            value: "débutant" 
          },
          { 
            id: "d3-b", 
            text: "J'ai contribué à l'élaboration d'exigences de sécurité pour les fournisseurs et participé à des audits.", 
            value: "intermédiaire" 
          },
          { 
            id: "d3-c", 
            text: "J'ai développé des cadres complets d'exigences adaptés aux différents types de fournisseurs, dirigé des programmes d'évaluation continue et géré la conformité de l'écosystème.", 
            value: "expert" 
          }
        ]
      }
    ];
  } else if (domain === "strategie-cyber") {
    domainQuestions = [
      {
        id: "d1",
        text: "Comment évaluez-vous votre capacité à définir une stratégie de cybersécurité alignée sur les objectifs business ?",
        options: [
          { 
            id: "d1-a", 
            text: "Je comprends l'importance de cet alignement mais j'ai peu d'expérience pratique.", 
            value: "débutant" 
          },
          { 
            id: "d1-b", 
            text: "J'ai participé à l'élaboration de stratégies et je sais adapter les priorités de sécurité aux besoins métier.", 
            value: "intermédiaire" 
          },
          { 
            id: "d1-c", 
            text: "J'ai dirigé le développement de stratégies complètes, présenté à des conseils d'administration et piloté des transformations majeures.", 
            value: "expert" 
          }
        ]
      },
      {
        id: "d2",
        text: "En matière de gouvernance de la cybersécurité :",
        options: [
          { 
            id: "d2-a", 
            text: "Je connais les concepts de base comme les rôles et responsabilités clés.", 
            value: "débutant" 
          },
          { 
            id: "d2-b", 
            text: "J'ai une bonne compréhension des cadres de gouvernance (ex: NIST, ISO) et j'ai participé à des comités de sécurité.", 
            value: "intermédiaire" 
          },
          { 
            id: "d2-c", 
            text: "J'ai conçu et mis en œuvre des structures de gouvernance complètes, incluant la gestion des risques au niveau du conseil d'administration et l'intégration multi-départements.", 
            value: "expert" 
          }
        ]
      },
      {
        id: "d3",
        text: "Concernant la mesure de l'efficacité et les indicateurs de performance en cybersécurité :",
        options: [
          { 
            id: "d3-a", 
            text: "Je connais quelques métriques de base mais peu d'expérience dans leur mise en œuvre.", 
            value: "débutant" 
          },
          { 
            id: "d3-b", 
            text: "J'ai développé et suivi des KPI pertinents et je sais comment les présenter aux parties prenantes.", 
            value: "intermédiaire" 
          },
          { 
            id: "d3-c", 
            text: "J'ai créé des tableaux de bord stratégiques complets, aligné les métriques sur la maturité et les objectifs organisationnels, et utilisé l'analyse avancée pour orienter les décisions.", 
            value: "expert" 
          }
        ]
      }
    ];
  } else {
    // Si le domaine n'est pas reconnu, utiliser des questions génériques supplémentaires
    domainQuestions = [
      {
        id: "d1",
        text: "Comment évaluez-vous votre maîtrise des outils et technologies de cybersécurité ?",
        options: [
          { 
            id: "d1-a", 
            text: "Je connais les catégories principales d'outils mais avec une expérience limitée.", 
            value: "débutant" 
          },
          { 
            id: "d1-b", 
            text: "J'ai une bonne expérience pratique avec plusieurs outils et technologies de sécurité.", 
            value: "intermédiaire" 
          },
          { 
            id: "d1-c", 
            text: "J'ai une expertise approfondie avec une large gamme d'outils, y compris leur configuration avancée, intégration et optimisation.", 
            value: "expert" 
          }
        ]
      },
      {
        id: "d2",
        text: "En matière de conformité et de standards de cybersécurité :",
        options: [
          { 
            id: "d2-a", 
            text: "Je connais quelques standards comme ISO 27001 ou NIST mais avec peu de détails.", 
            value: "débutant" 
          },
          { 
            id: "d2-b", 
            text: "J'ai une bonne compréhension de plusieurs cadres réglementaires et j'ai participé à des projets de mise en conformité.", 
            value: "intermédiaire" 
          },
          { 
            id: "d2-c", 
            text: "J'ai dirigé des programmes de conformité complexes, obtenu des certifications et développé des stratégies d'harmonisation multi-réglementaires.", 
            value: "expert" 
          }
        ]
      },
      {
        id: "d3",
        text: "Comment évaluez-vous votre approche de la sensibilisation et de la formation à la cybersécurité ?",
        options: [
          { 
            id: "d3-a", 
            text: "Je comprends l'importance de la sensibilisation mais j'ai peu d'expérience dans sa mise en œuvre.", 
            value: "débutant" 
          },
          { 
            id: "d3-b", 
            text: "J'ai développé ou délivré des programmes de formation et je sais adapter le contenu aux différents publics.", 
            value: "intermédiaire" 
          },
          { 
            id: "d3-c", 
            text: "J'ai conçu des stratégies complètes de sensibilisation, mesuré leur efficacité et créé des programmes de changement culturel durables.", 
            value: "expert" 
          }
        ]
      }
    ];
  }
  
  // Combine common questions with domain-specific questions
  return [...commonQuestions, ...domainQuestions];
}