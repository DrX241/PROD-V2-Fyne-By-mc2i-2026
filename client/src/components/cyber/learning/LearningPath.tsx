import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Award, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface Module {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  icon?: string;
}

interface LearningPathProps {
  path: {
    id: string;
    title: string;
    description: string;
    icon: string;
    difficulty: string;
    modules: string[];
  };
  onSelectModule: (moduleId: string) => void;
  completedModules: string[];
}

export function LearningPath({ path, onSelectModule, completedModules }: LearningPathProps) {
  // Modules fictifs pour démonstration
  const modules: Module[] = path.modules.map((moduleId) => {
    const moduleMap: Record<string, Module> = {
      // Sensibilisation
      "phishing": {
        id: "phishing",
        title: "Détection de phishing",
        description: "Apprenez à identifier les tentatives de phishing et protégez-vous contre l'ingénierie sociale",
        difficulty: "Débutant",
        icon: "🎣"
      },
      "passwords": {
        id: "passwords",
        title: "Gestion des mots de passe",
        description: "Techniques pour créer et gérer des mots de passe forts",
        difficulty: "Débutant",
        icon: "🔑"
      },
      "socialEngineering": {
        id: "socialEngineering",
        title: "Ingénierie sociale",
        description: "Comprendre et se protéger contre les techniques de manipulation",
        difficulty: "Intermédiaire",
        icon: "🎭"
      },
      "dataProtection": {
        id: "dataProtection",
        title: "Protection des données sensibles",
        description: "Meilleures pratiques pour sécuriser les informations confidentielles",
        difficulty: "Intermédiaire",
        icon: "🔒"
      },
      "mobileSecrity": {
        id: "mobileSecrity",
        title: "Sécurité mobile",
        description: "Protéger vos appareils mobiles contre les cybermenaces",
        difficulty: "Intermédiaire",
        icon: "📱"
      },
      
      // RGPD
      "rgpdBasics": {
        id: "rgpdBasics",
        title: "Fondamentaux du RGPD",
        description: "Principes essentiels et obligations légales du RGPD",
        difficulty: "Débutant",
        icon: "📜"
      },
      "dataBreaches": {
        id: "dataBreaches",
        title: "Gestion des violations de données",
        description: "Procédures et obligations en cas de fuite de données",
        difficulty: "Intermédiaire",
        icon: "🚨"
      },
      "subjectRights": {
        id: "subjectRights",
        title: "Droits des personnes concernées",
        description: "Comprendre et mettre en œuvre les droits RGPD des individus",
        difficulty: "Intermédiaire",
        icon: "⚖️"
      },
      "impactAnalysis": {
        id: "impactAnalysis",
        title: "Analyse d'impact (AIPD)",
        description: "Méthodologie d'analyse d'impact sur la protection des données",
        difficulty: "Avancé",
        icon: "📊"
      },
      "complianceFrameworks": {
        id: "complianceFrameworks",
        title: "Frameworks de conformité",
        description: "Outils et méthodes pour assurer la conformité continue",
        difficulty: "Avancé",
        icon: "🔍"
      },
      
      // Risques
      "threatModeling": {
        id: "threatModeling",
        title: "Modélisation des menaces",
        description: "Techniques d'identification et priorisation des menaces",
        difficulty: "Intermédiaire",
        icon: "🎯"
      },
      "riskAssessment": {
        id: "riskAssessment",
        title: "Évaluation des risques",
        description: "Méthodologies pour quantifier et qualifier les risques cyber",
        difficulty: "Avancé",
        icon: "⚠️"
      },
      "vulnerabilityAnalysis": {
        id: "vulnerabilityAnalysis",
        title: "Analyse de vulnérabilités",
        description: "Identifier et classifier les faiblesses des systèmes",
        difficulty: "Avancé",
        icon: "🔎"
      },
      "impactEstimation": {
        id: "impactEstimation",
        title: "Estimation d'impact",
        description: "Évaluer les conséquences potentielles des incidents de sécurité",
        difficulty: "Expert",
        icon: "💥"
      },
      "riskMitigation": {
        id: "riskMitigation",
        title: "Réduction des risques",
        description: "Stratégies et techniques pour diminuer l'exposition aux risques",
        difficulty: "Expert",
        icon: "🛡️"
      },
      
      // Audit
      "auditMethodology": {
        id: "auditMethodology",
        title: "Méthodologie d'audit",
        description: "Approches structurées pour conduire des audits de sécurité",
        difficulty: "Intermédiaire",
        icon: "📋"
      },
      "evidenceCollection": {
        id: "evidenceCollection",
        title: "Collecte de preuves",
        description: "Techniques de collecte et préservation des preuves numériques",
        difficulty: "Avancé",
        icon: "🔍"
      },
      "complianceChecking": {
        id: "complianceChecking",
        title: "Vérification de conformité",
        description: "Évaluation du respect des normes et réglementations",
        difficulty: "Avancé",
        icon: "✓"
      },
      "reportWriting": {
        id: "reportWriting",
        title: "Rédaction de rapports",
        description: "Création de rapports d'audit clairs et exploitables",
        difficulty: "Expert",
        icon: "📝"
      },
      "remediation": {
        id: "remediation",
        title: "Plans de remédiation",
        description: "Élaboration de plans d'action suite aux audits",
        difficulty: "Expert",
        icon: "🔧"
      },
      
      // Stratégie
      "securityStrategy": {
        id: "securityStrategy",
        title: "Stratégie de sécurité",
        description: "Élaboration d'une stratégie cyber alignée sur les objectifs d'entreprise",
        difficulty: "Avancé",
        icon: "🏹"
      },
      "budgetOptimization": {
        id: "budgetOptimization",
        title: "Optimisation budgétaire",
        description: "Maximiser l'efficacité des investissements en cybersécurité",
        difficulty: "Avancé",
        icon: "💰"
      },
      "teamManagement": {
        id: "teamManagement",
        title: "Gestion d'équipe cyber",
        description: "Constitution et pilotage d'une équipe cybersécurité performante",
        difficulty: "Expert",
        icon: "👥"
      },
      "boardCommunication": {
        id: "boardCommunication",
        title: "Communication dirigeants",
        description: "Présenter efficacement les enjeux cyber aux décideurs",
        difficulty: "Expert",
        icon: "🎤"
      },
      "crisisManagement": {
        id: "crisisManagement",
        title: "Gestion de crise cyber",
        description: "Préparation et conduite d'une cellule de crise lors d'incidents",
        difficulty: "Maître",
        icon: "🚨"
      }
    };
    
    return moduleMap[moduleId] || {
      id: moduleId,
      title: moduleId.charAt(0).toUpperCase() + moduleId.slice(1).replace(/([A-Z])/g, ' $1'),
      description: "Description du module",
      difficulty: "Intermédiaire"
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
        <h2 className="text-2xl font-bold text-indigo-900 mb-2">{path.title}</h2>
        <p className="text-indigo-700 mb-4">{path.description}</p>
        
        <div className="flex items-center gap-2 text-sm text-indigo-600">
          <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-200">
            {path.difficulty}
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
            {modules.length} modules
          </Badge>
          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
            {completedModules.filter(m => path.modules.includes(m)).length} complétés
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((module, index) => {
          const isCompleted = completedModules.includes(module.id);
          
          return (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => onSelectModule(module.id)}
              className="cursor-pointer"
            >
              <Card className={`p-4 h-full border-l-4 ${
                isCompleted 
                  ? 'border-l-green-500 bg-green-50/50' 
                  : 'border-l-indigo-500 hover:border-l-indigo-600 hover:shadow-md'
              } transition-all duration-200`}>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700">
                    {module.icon || '📚'}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-indigo-900">{module.title}</h3>
                      {isCompleted ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-indigo-400" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{module.description}</p>
                    
                    <div className="mt-2 flex items-center justify-between">
                      <Badge variant="outline" className={
                        module.difficulty === 'Débutant' ? 'bg-green-50 text-green-700 border-green-100' :
                        module.difficulty === 'Intermédiaire' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                        module.difficulty === 'Avancé' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                        module.difficulty === 'Expert' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                        'bg-red-50 text-red-700 border-red-100'
                      }>
                        {module.difficulty}
                      </Badge>
                      
                      {isCompleted && (
                        <span className="flex items-center text-xs text-green-600">
                          <Award className="h-3 w-3 mr-1" />
                          Complété
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}