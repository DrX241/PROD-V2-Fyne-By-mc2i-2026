import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from 'lucide-react';
import { type CyberUserRole } from "@shared/schema";

// Définition des rôles disponibles
const availableRoles: {
  id: CyberUserRole;
  title: string;
  fullTitle: string;
  description: string;
  responsibilities: string[];
  color: string;
  borderColor: string;
  hoverBorderColor: string;
  buttonColor: string;
  textColor: string;
  bgColor: string;
}[] = [
  {
    id: "rssi",
    title: "RSSI",
    fullTitle: "Responsable de la Sécurité des Systèmes d'Information",
    description: "Expert en stratégie de sécurité et gestion des risques informatiques",
    responsibilities: [
      "Définir et appliquer la politique de sécurité de l'entreprise",
      "Gérer les risques informatiques et superviser les audits",
      "Coordonner la réponse aux incidents de sécurité",
      "Assurer la conformité aux réglementations (RGPD, etc.)"
    ],
    color: "from-blue-950 to-blue-900",
    borderColor: "border-blue-800",
    hoverBorderColor: "hover:border-blue-700",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    textColor: "text-blue-300",
    bgColor: "bg-blue-700/50"
  },
  {
    id: "ethical-hacker",
    title: "Hacker éthique",
    fullTitle: "Expert en tests d'intrusion et sécurité offensive",
    description: "Spécialiste qui simule des cyberattaques pour identifier les vulnérabilités",
    responsibilities: [
      "Réaliser des tests d'intrusion (pentests) sur les systèmes",
      "Identifier et exploiter des failles de sécurité",
      "Rédiger des rapports détaillés sur les vulnérabilités",
      "Proposer des contre-mesures adaptées"
    ],
    color: "from-red-950 to-red-900",
    borderColor: "border-red-800",
    hoverBorderColor: "hover:border-red-700",
    buttonColor: "bg-red-600 hover:bg-red-700",
    textColor: "text-red-300",
    bgColor: "bg-red-700/50"
  },
  {
    id: "developer",
    title: "Développeur",
    fullTitle: "Développeur sensibilisé aux vulnérabilités logicielles",
    description: "Créateur d'applications sécurisées dès la conception",
    responsibilities: [
      "Coder en intégrant les principes de sécurité by design",
      "Identifier et corriger les vulnérabilités dans le code",
      "Réaliser des tests de sécurité sur les applications",
      "Collaborer avec les équipes de sécurité"
    ],
    color: "from-green-950 to-green-900",
    borderColor: "border-green-800",
    hoverBorderColor: "hover:border-green-700",
    buttonColor: "bg-green-600 hover:bg-green-700",
    textColor: "text-green-300",
    bgColor: "bg-green-700/50"
  },
  {
    id: "system-admin",
    title: "Administrateur Système",
    fullTitle: "Gestionnaire de l'infrastructure sécurisée",
    description: "Expert qui maintient et sécurise les systèmes informatiques",
    responsibilities: [
      "Configurer et maintenir les infrastructures de manière sécurisée",
      "Gérer les correctifs et les mises à jour de sécurité",
      "Surveiller les systèmes et détecter les anomalies",
      "Mettre en place des solutions de protection"
    ],
    color: "from-amber-950 to-amber-900",
    borderColor: "border-amber-800",
    hoverBorderColor: "hover:border-amber-700",
    buttonColor: "bg-amber-600 hover:bg-amber-700",
    textColor: "text-amber-300",
    bgColor: "bg-amber-700/50"
  },
  {
    id: "consultant",
    title: "Consultant en cybersécurité",
    fullTitle: "Spécialiste des audits de sécurité",
    description: "Conseiller qui évalue et améliore la posture de sécurité des organisations",
    responsibilities: [
      "Réaliser des audits et analyses de risques",
      "Conseiller les organisations sur leur stratégie de sécurité",
      "Accompagner les projets de transformation sécurisée",
      "Former les équipes aux bonnes pratiques"
    ],
    color: "from-purple-950 to-purple-900",
    borderColor: "border-purple-800",
    hoverBorderColor: "hover:border-purple-700",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
    textColor: "text-purple-300",
    bgColor: "bg-purple-700/50"
  }
];

interface RoleSelectionProps {
  onSelectRole: (roleId: CyberUserRole) => void;
}

export default function RoleSelection({ onSelectRole }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<CyberUserRole | null>(null);

  const handleRoleSelect = (roleId: CyberUserRole) => {
    setSelectedRole(roleId);
  };

  const handleConfirm = () => {
    if (selectedRole) {
      onSelectRole(selectedRole);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Choisissez votre rôle</h2>
        <p className="text-blue-300 max-w-2xl mx-auto">
          Sélectionnez le rôle que vous souhaitez incarner pendant cette session. 
          Chaque rôle offre une perspective différente et des défis adaptés.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {availableRoles.map((role) => (
          <Card 
            key={role.id}
            className={`bg-gradient-to-br ${role.color} text-white ${role.borderColor} ${role.hoverBorderColor} transition-all duration-300 cursor-pointer relative ${selectedRole === role.id ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-blue-500 shadow-lg' : ''}`}
            onClick={() => handleRoleSelect(role.id)}
          >
            {selectedRole === role.id && (
              <div className="absolute -top-3 -right-3 bg-blue-500 rounded-full p-1 shadow-lg">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{role.title}</CardTitle>
                  <CardDescription className={role.textColor}>
                    {role.fullTitle}
                  </CardDescription>
                </div>
                <div className={`rounded-full ${role.bgColor} p-2`}>
                  {/* Icon placeholder */}
                  <div className="h-6 w-6 flex items-center justify-center font-bold text-white">
                    {role.title.charAt(0)}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">{role.description}</p>
              <h4 className={`text-xs font-medium mb-2 ${role.textColor}`}>Responsabilités :</h4>
              <ul className="space-y-1.5 text-xs">
                {role.responsibilities.map((resp, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-2 text-xs">•</span>
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <Button
          onClick={handleConfirm}
          className="bg-blue-600 hover:bg-blue-700 px-8 py-6 text-lg"
          disabled={!selectedRole}
        >
          Continuer avec ce rôle
        </Button>
      </div>
    </div>
  );
}