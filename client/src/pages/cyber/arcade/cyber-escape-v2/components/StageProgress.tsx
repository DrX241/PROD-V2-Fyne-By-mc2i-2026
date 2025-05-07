import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Database, 
  Lock, 
  BarChart, 
  AlertTriangle, 
  Box,
  Cloud, 
  Terminal, 
  FileSearch, 
  Key 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { GameStage } from '../types/game';

interface StageProgressProps {
  currentStage: number;
  className?: string;
}

// Données des étapes avec icônes et descriptions
const stageData = [
  {
    id: GameStage.VESTIBULE,
    name: "Vestibule Phish-Alert",
    icon: <Shield className="h-4 w-4" />,
    color: "text-blue-400",
    bgColor: "bg-blue-900/40",
    borderColor: "border-blue-700",
    description: "Triage de 20 emails pour identifier les tentatives de phishing"
  },
  {
    id: GameStage.MUR_REVELATIONS,
    name: "Mur des Révélations",
    icon: <Database className="h-4 w-4" />,
    color: "text-indigo-400",
    bgColor: "bg-indigo-900/40",
    borderColor: "border-indigo-700",
    description: "Recherche OSINT pour trouver des informations critiques"
  },
  {
    id: GameStage.COULOIR_BADGES,
    name: "Couloir des Badges",
    icon: <Lock className="h-4 w-4" />,
    color: "text-purple-400",
    bgColor: "bg-purple-900/40",
    borderColor: "border-purple-700",
    description: "Association de badges aux rôles et services cloud appropriés"
  },
  {
    id: GameStage.SALLE_STRATEX,
    name: "Salle Stratex",
    icon: <BarChart className="h-4 w-4" />,
    color: "text-cyan-400",
    bgColor: "bg-cyan-900/40", 
    borderColor: "border-cyan-700",
    description: "Priorisation stratégique des investissements cybersécurité"
  },
  {
    id: GameStage.CENTRE_ALERTE,
    name: "Centre d'Alerte",
    icon: <AlertTriangle className="h-4 w-4" />,
    color: "text-yellow-400",
    bgColor: "bg-yellow-900/40",
    borderColor: "border-yellow-700",
    description: "Gestion de crise face à un incident de sécurité majeur"
  },
  {
    id: GameStage.CHAINE_FANTOME,
    name: "Chaîne Fantôme",
    icon: <Box className="h-4 w-4" />,
    color: "text-amber-400",
    bgColor: "bg-amber-900/40",
    borderColor: "border-amber-700",
    description: "Audit et analyse de la chaîne d'approvisionnement logicielle"
  },
  {
    id: GameStage.NUAGE_TROUE,
    name: "Nuage Troué v2",
    icon: <Cloud className="h-4 w-4" />,
    color: "text-orange-400",
    bgColor: "bg-orange-900/40",
    borderColor: "border-orange-700", 
    description: "Correction de vulnérabilités dans un environnement cloud"
  },
  {
    id: GameStage.ZONE_ROOTLAB,
    name: "Zone Root-Lab",
    icon: <Terminal className="h-4 w-4" />,
    color: "text-rose-400",
    bgColor: "bg-rose-900/40",
    borderColor: "border-rose-700",
    description: "Exploitation et démonstration de PoC sur des vulnérabilités"
  },
  {
    id: GameStage.ATELIER_FORENSIC,
    name: "Atelier Forensic",
    icon: <FileSearch className="h-4 w-4" />,
    color: "text-fuchsia-400", 
    bgColor: "bg-fuchsia-900/40",
    borderColor: "border-fuchsia-700",
    description: "Analyse forensique de preuves numériques après incident"
  },
  {
    id: GameStage.PORTE_SIGMA,
    name: "Porte Sigma",
    icon: <Key className="h-4 w-4" />,
    color: "text-green-400",
    bgColor: "bg-green-900/40",
    borderColor: "border-green-700",
    description: "Quiz final de synthèse sur tous les aspects de la cybersécurité"
  }
];

const StageProgress: React.FC<StageProgressProps> = ({ currentStage, className = "" }) => {
  return (
    <Card className={`border-green-500 bg-black/50 backdrop-blur-sm ${className}`}>
      <CardHeader className="p-3 pb-2 border-b border-green-800">
        <CardTitle className="text-sm font-medium text-green-400 flex items-center">
          <Shield className="h-4 w-4 mr-2" /> 
          Progression du parcours
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="space-y-1.5">
          {/* Pourcentage global */}
          <div className="flex justify-between text-xs mb-1">
            <span className="text-green-400">Étape {currentStage}/10</span>
            <span className="text-gray-400">{(currentStage / 10) * 100}%</span>
          </div>
          
          {/* Affichage des étapes comme une timeline visuelle */}
          <div className="relative pt-2">
            {/* Ligne de progression */}
            <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gray-800 z-0"></div>
            
            {/* Étapes */}
            <div className="relative z-10 space-y-3">
              {stageData.map((stage) => {
                const isCompleted = currentStage > stage.id;
                const isCurrent = currentStage === stage.id;
                const isLocked = currentStage < stage.id;
                
                return (
                  <TooltipProvider key={stage.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center group">
                          {/* Indicateur d'étape */}
                          <motion.div
                            initial={{ scale: isCurrent ? 0.8 : 1 }}
                            animate={{ 
                              scale: isCurrent ? [1, 1.2, 1] : 1,
                              boxShadow: isCurrent ? "0 0 12px rgba(74, 222, 128, 0.5)" : "none"
                            }}
                            transition={{ duration: 2, repeat: isCurrent ? Infinity : 0, repeatType: "reverse" }}
                            className={`
                              relative flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center z-10
                              ${isCompleted ? 'bg-green-800 border-green-500' : 
                                isCurrent ? `${stage.bgColor} ${stage.borderColor}` : 
                                'bg-gray-900 border-gray-700'}
                              border transition-all
                            `}
                          >
                            {isCompleted ? (
                              <div className="h-2 w-2 rounded-full bg-green-400"></div>
                            ) : (
                              <span className={isLocked ? 'text-gray-500' : stage.color}>
                                {stage.icon}
                              </span>
                            )}
                            
                            {/* Numéro d'étape (petit) */}
                            <span className="absolute -top-1 -right-1 text-[9px] font-bold bg-black rounded-full w-3.5 h-3.5 flex items-center justify-center">
                              {stage.id}
                            </span>
                          </motion.div>
                          
                          {/* Nom de l'étape */}
                          <div 
                            className={`
                              ml-3 text-xs font-medium transition-colors
                              ${isCompleted ? 'text-green-400' : 
                                isCurrent ? stage.color : 
                                'text-gray-500'}
                            `}
                          >
                            {stage.name}
                            
                            {/* Badge pour l'étape courante */}
                            {isCurrent && (
                              <Badge 
                                variant="outline" 
                                className="ml-2 text-[8px] px-1 py-0 h-3.5 border-green-500 text-green-400"
                              >
                                Actuelle
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent 
                        side="right" 
                        className="bg-gray-900 border-gray-700"
                      >
                        <div className="space-y-1 max-w-[240px]">
                          <div className="font-bold flex items-center">
                            <span className={isLocked ? 'text-gray-400' : stage.color}>
                              {stage.icon}
                              <span className="ml-2">{stage.name}</span>
                            </span>
                          </div>
                          <p className="text-xs text-gray-300">
                            {stage.description}
                          </p>
                          <div className="pt-1">
                            <Badge variant={isCompleted ? "default" : "outline"} className="text-[9px]">
                              {isCompleted ? "Complété" : isCurrent ? "En cours" : "Verrouillé"}
                            </Badge>
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StageProgress;