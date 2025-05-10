import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle, 
  Terminal, 
  Users, 
  Clock, 
  ChevronRight,
  BarChart3,
  Globe,
  Zap,
  Lock,
  AlertCircle,
  Wifi,
  FileText,
  MessageSquare,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { toast } from '@/hooks/use-toast';
import Link from 'next/link';

// Types pour les incidents
interface Incident {
  id: string;
  title: string;
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'contained' | 'resolved';
  location: string;
  startTime: string;
  threatType: string;
  affectedSystems: string[];
  threatLevel: number;
  coordinates: [number, number]; // longitude, latitude
  timeline: TimelineEvent[];
  metrics: IncidentMetrics;
}

interface IncidentMetrics {
  reputation: number;
  financial: number;
  operational: number;
  security: number;
}

interface TimelineEvent {
  id: string;
  timestamp: string;
  title: string;
  description: string;
  actionTaken?: string;
  impact?: string;
}

interface Expert {
  id: string;
  name: string;
  role: string;
  specialty: string;
  avatarInitials: string;
  avatarColor: string;
  expertise: number;
  availableForUrgency: ('low' | 'medium' | 'high' | 'critical')[];
  description: string;
}

// Composant pour les statistiques du tableau de bord
const DashboardCard = ({ 
  icon, 
  title, 
  value, 
  trend 
}: { 
  icon: React.ReactNode; 
  title: string; 
  value: string | number; 
  trend?: { value: number; positive: boolean } 
}) => {
  return (
    <Card className="bg-blue-950/60 border border-blue-800 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="bg-blue-800/70 p-2 rounded-lg">
            {icon}
          </div>
          {trend && (
            <Badge className={trend.positive ? 'bg-green-700' : 'bg-red-700'}>
              {trend.positive ? '+' : '-'}{trend.value}%
            </Badge>
          )}
        </div>
        <div className="mt-2">
          <p className="text-sm text-blue-300">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant pour la carte du monde simplifiée
const WorldMap = ({ 
  incidents, 
  onSelectIncident 
}: { 
  incidents: Incident[];
  onSelectIncident: (incident: Incident) => void;
}) => {
  return (
    <div className="relative h-full w-full bg-blue-900/30 rounded-lg p-4 overflow-hidden">
      {/* Grille représentant le monde */}
      <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-px opacity-20">
        {Array.from({ length: 12 * 6 }).map((_, i) => (
          <div key={i} className="bg-blue-500/20 border border-blue-500/10"></div>
        ))}
      </div>
      
      {/* Points représentant les incidents */}
      {incidents.map((incident) => (
        <motion.div
          key={incident.id}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2`}
          style={{ 
            left: `${(incident.coordinates[0] + 180) / 360 * 100}%`, 
            top: `${(incident.coordinates[1] + 90) / 180 * 100}%` 
          }}
          onClick={() => onSelectIncident(incident)}
        >
          <div 
            className={`h-5 w-5 rounded-full flex items-center justify-center 
              ${incident.urgency === 'critical' ? 'bg-red-500' :
                incident.urgency === 'high' ? 'bg-orange-500' :
                incident.urgency === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}
          >
            <div className="h-3 w-3 rounded-full bg-white animate-ping absolute"></div>
          </div>
          <div className="absolute w-32 text-center text-xs text-white font-medium -bottom-6 left-1/2 transform -translate-x-1/2">
            {incident.location}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Composant pour afficher les détails d'un incident
const IncidentDetails = ({ 
  incident,
  experts,
  onBack
}: { 
  incident: Incident;
  experts: Expert[];
  onBack: () => void;
}) => {
  // État local pour les messages et décisions
  const [message, setMessage] = useState('');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  
  // Filtrer les experts disponibles pour cet incident en fonction de l'urgence
  const availableExperts = experts.filter(expert => 
    expert.availableForUrgency.includes(incident.urgency)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-blue-950/60 border border-blue-800 rounded-xl overflow-hidden shadow-lg"
    >
      <div className="p-4 border-b border-blue-800 flex justify-between items-center">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onBack} className="text-white hover:bg-blue-800/40 mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </Button>
          <h2 className="text-xl text-white font-bold font-exo">{incident.title}</h2>
          <Badge 
            className={`ml-3 ${
              incident.urgency === 'critical' ? 'bg-red-600' :
              incident.urgency === 'high' ? 'bg-orange-600' :
              incident.urgency === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
            }`}
          >
            {incident.urgency.toUpperCase()}
          </Badge>
        </div>
        
        <div className="flex items-center">
          <Badge variant="outline" className="bg-blue-900/40 text-white border-blue-700 mr-2">
            {incident.status === 'active' ? 'EN COURS' : 
             incident.status === 'contained' ? 'CONTENU' : 'RÉSOLU'}
          </Badge>
          <Clock className="h-4 w-4 text-blue-300 mr-1" />
          <span className="text-sm text-blue-200">
            Début: {new Date(incident.startTime).toLocaleTimeString()}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        {/* Colonne 1: Contexte et données */}
        <div className="space-y-4">
          <Card className="bg-blue-950/40 border-blue-800 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg font-exo">Contexte de l'incident</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-200 text-sm mb-3">
                {incident.description}
              </p>
              <div className="space-y-3">
                <div>
                  <p className="text-blue-300 text-xs mb-1">Type de menace</p>
                  <Badge className="bg-blue-800">{incident.threatType}</Badge>
                </div>
                <div>
                  <p className="text-blue-300 text-xs mb-1">Systèmes affectés</p>
                  <div className="flex flex-wrap gap-1">
                    {incident.affectedSystems.map((system, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-900/20 border-blue-700">
                        {system}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-blue-300 text-xs mb-1">Niveau de menace</p>
                  <div className="w-full bg-blue-950 rounded-full h-2">
                    <div 
                      className={`h-full rounded-full ${
                        incident.threatLevel >= 80 ? 'bg-red-500' :
                        incident.threatLevel >= 60 ? 'bg-orange-500' :
                        incident.threatLevel >= 40 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${incident.threatLevel}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-blue-300 mt-1">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-950/40 border-blue-800 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg font-exo">Impact de l'incident</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-blue-300 mb-1">
                    <span>Réputation</span>
                    <span>{incident.metrics.reputation}%</span>
                  </div>
                  <Progress value={incident.metrics.reputation} className="h-2 bg-blue-950" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-blue-300 mb-1">
                    <span>Impact financier</span>
                    <span>{incident.metrics.financial}%</span>
                  </div>
                  <Progress value={incident.metrics.financial} className="h-2 bg-blue-950" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-blue-300 mb-1">
                    <span>Opérations</span>
                    <span>{incident.metrics.operational}%</span>
                  </div>
                  <Progress value={incident.metrics.operational} className="h-2 bg-blue-950" />
                </div>
                <div>
                  <div className="flex justify-between text-xs text-blue-300 mb-1">
                    <span>Sécurité globale</span>
                    <span>{incident.metrics.security}%</span>
                  </div>
                  <Progress value={incident.metrics.security} className="h-2 bg-blue-950" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Colonne 2: Salle de crise / discussion */}
        <div className="space-y-4">
          <Card className="bg-blue-950/40 border-blue-800 shadow-md flex flex-col h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg font-exo">Salle de crise</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <div className="flex overflow-x-auto pb-2 space-x-2 mb-3">
                {availableExperts.map(expert => (
                  <div 
                    key={expert.id} 
                    className={`flex-shrink-0 border rounded-lg p-2 cursor-pointer transition-all ${
                      selectedExpert?.id === expert.id
                        ? 'bg-blue-800 border-blue-400'
                        : 'bg-blue-900/30 border-blue-800 hover:bg-blue-900/60'
                    }`}
                    onClick={() => setSelectedExpert(expert)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarFallback className={`${expert.avatarColor} text-white text-xs`}>
                          {expert.avatarInitials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-xs text-white font-medium">{expert.name}</p>
                        <p className="text-xs text-blue-300">{expert.role}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex-grow bg-blue-950/70 rounded-lg border border-blue-800 p-3 mb-3 overflow-y-auto max-h-60">
                <div className="space-y-3">
                  {/* Timeline des événements */}
                  {incident.timeline.map((event, index) => (
                    <div key={event.id} className="flex items-start space-x-2">
                      <div className="bg-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs">
                        {index + 1}
                      </div>
                      <div className="flex-grow">
                        <p className="text-white text-sm font-medium">{event.title}</p>
                        <p className="text-blue-200 text-xs">{event.description}</p>
                        {event.actionTaken && (
                          <div className="mt-1 text-xs text-green-300 bg-green-900/20 p-1 rounded border border-green-900">
                            Action: {event.actionTaken}
                          </div>
                        )}
                        {event.impact && (
                          <div className="mt-1 text-xs text-red-300 bg-red-900/20 p-1 rounded border border-red-900">
                            Impact: {event.impact}
                          </div>
                        )}
                        <p className="text-blue-400 text-xs mt-1">{new Date(event.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Si aucun événement */}
                  {incident.timeline.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-blue-300 text-sm">Aucun événement enregistré pour cet incident</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <textarea
                  className="flex-grow bg-blue-950/70 rounded-lg border border-blue-800 p-2 text-white placeholder:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                  placeholder={selectedExpert 
                    ? `Communiquer avec ${selectedExpert.name}...` 
                    : "Sélectionnez un expert pour communiquer..."
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={!selectedExpert}
                ></textarea>
                <Button 
                  className="bg-blue-700 hover:bg-blue-600 text-white"
                  disabled={!selectedExpert || !message}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Envoyer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Colonne 3: Outils et actions */}
        <div className="space-y-4">
          <Card className="bg-blue-950/40 border-blue-800 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg font-exo">Actions disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-blue-800 hover:bg-blue-700 text-white">
                  <Shield className="h-4 w-4 mr-2" />
                  Isoler les systèmes affectés
                </Button>
                <Button className="w-full justify-start bg-blue-800 hover:bg-blue-700 text-white">
                  <Terminal className="h-4 w-4 mr-2" />
                  Lancer analyse forensique
                </Button>
                <Button className="w-full justify-start bg-blue-800 hover:bg-blue-700 text-white">
                  <Lock className="h-4 w-4 mr-2" />
                  Réinitialiser les identifiants
                </Button>
                <Button className="w-full justify-start bg-blue-800 hover:bg-blue-700 text-white">
                  <Users className="h-4 w-4 mr-2" />
                  Notifier les utilisateurs
                </Button>
                <Button className="w-full justify-start bg-blue-800 hover:bg-blue-700 text-white">
                  <FileText className="h-4 w-4 mr-2" />
                  Préparer un communiqué
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-950/40 border-blue-800 shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-lg font-exo">Ressources et outils</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-2 rounded-lg bg-blue-900/30 border border-blue-800">
                  <div className="flex items-center">
                    <div className="bg-blue-800 p-1 rounded mr-2">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Analyse des logs</p>
                      <p className="text-xs text-blue-300">Recherche de signatures d'attaque</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-2 rounded-lg bg-blue-900/30 border border-blue-800">
                  <div className="flex items-center">
                    <div className="bg-blue-800 p-1 rounded mr-2">
                      <Wifi className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Scan de vulnérabilités</p>
                      <p className="text-xs text-blue-300">Identifier les failles exploitées</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-2 rounded-lg bg-blue-900/30 border border-blue-800">
                  <div className="flex items-center">
                    <div className="bg-blue-800 p-1 rounded mr-2">
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">Renseignement sur les menaces</p>
                      <p className="text-xs text-blue-300">Informations sur l'attaquant potentiel</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

// Composant principal
export default function CyberCrisisCenter() {
  // États pour les incidents et les experts
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  
  // Données factices pour les statistiques du dashboard
  const dashboardStats = [
    { 
      id: '1', 
      icon: <AlertCircle className="h-5 w-5 text-white" />, 
      title: 'Incidents actifs', 
      value: 4, 
      trend: { value: 25, positive: false } 
    },
    { 
      id: '2', 
      icon: <Shield className="h-5 w-5 text-white" />, 
      title: 'Niveau de menace', 
      value: '68%', 
      trend: { value: 12, positive: false } 
    },
    { 
      id: '3', 
      icon: <Zap className="h-5 w-5 text-white" />, 
      title: 'Temps de réponse moyen', 
      value: '42m', 
      trend: { value: 8, positive: true } 
    },
    { 
      id: '4', 
      icon: <BarChart3 className="h-5 w-5 text-white" />, 
      title: 'Score de sécurité', 
      value: '72/100', 
      trend: { value: 5, positive: true } 
    }
  ];
  
  // Données factices pour les incidents
  const incidents: Incident[] = [
    {
      id: 'inc-001',
      title: 'Attaque par phishing ciblé',
      description: 'Campagne de phishing sophistiquée visant des cadres supérieurs avec accès aux systèmes critiques. Plusieurs emails contenant des documents malveillants ont été identifiés.',
      urgency: 'high',
      status: 'active',
      location: 'Siège social Paris',
      startTime: '2025-05-10T08:43:21',
      threatType: 'Spear Phishing',
      affectedSystems: ['Email', 'Endpoint'],
      threatLevel: 75,
      coordinates: [2.352222, 48.856613], // Paris
      timeline: [
        {
          id: 'evt-001-1',
          timestamp: '2025-05-10T08:43:21',
          title: 'Détection initiale',
          description: 'Alerte du système EDR sur un comportement suspect après ouverture d'un document Office.'
        },
        {
          id: 'evt-001-2',
          timestamp: '2025-05-10T08:55:12',
          title: 'Validation de l'alerte',
          description: 'L'équipe SOC confirme la présence d'un script PowerShell malveillant tentant d'établir une connexion C2.',
          actionTaken: 'Blocage immédiat de la connexion sortante.'
        },
        {
          id: 'evt-001-3',
          timestamp: '2025-05-10T09:12:45',
          title: 'Identification des cibles',
          description: '5 autres emails similaires identifiés dans les boîtes de réception de l'équipe de direction.',
          impact: 'Risque élevé de compromission d'identifiants VPN et d'accès aux données financières.'
        }
      ],
      metrics: {
        reputation: 45,
        financial: 30,
        operational: 25,
        security: 60
      }
    },
    {
      id: 'inc-002',
      title: 'Tentative d'exfiltration de données',
      description: 'Trafic réseau suspect détecté vers un serveur externe non reconnu. Volume important de données en transit depuis le serveur de R&D.',
      urgency: 'critical',
      status: 'active',
      location: 'Centre R&D Lyon',
      startTime: '2025-05-10T10:17:05',
      threatType: 'Data Breach',
      affectedSystems: ['Serveurs R&D', 'Base de données'],
      threatLevel: 90,
      coordinates: [4.835659, 45.764043], // Lyon
      timeline: [
        {
          id: 'evt-002-1',
          timestamp: '2025-05-10T10:17:05',
          title: 'Détection d'anomalie réseau',
          description: 'Le SIEM a signalé un volume anormal de données sortantes vers une adresse IP non catégorisée.'
        },
        {
          id: 'evt-002-2',
          timestamp: '2025-05-10T10:23:18',
          title: 'Analyse préliminaire',
          description: 'Confirmation d'un transfert non autorisé de fichiers propriétaires depuis le serveur principal de R&D.',
          actionTaken: 'Blocage d'urgence de l'adresse IP de destination.'
        }
      ],
      metrics: {
        reputation: 80,
        financial: 85,
        operational: 50,
        security: 85
      }
    },
    {
      id: 'inc-003',
      title: 'Vulnérabilité critique détectée',
      description: 'Une nouvelle vulnérabilité zero-day a été découverte affectant notre infrastructure cloud. Des exploits sont activement utilisés dans la nature.',
      urgency: 'medium',
      status: 'active',
      location: 'Infrastructure Cloud',
      startTime: '2025-05-10T07:30:00',
      threatType: 'Zero-Day Vulnerability',
      affectedSystems: ['Kubernetes', 'API Gateway'],
      threatLevel: 65,
      coordinates: [-0.1278, 51.5074], // Londres (localisation du cloud provider)
      timeline: [
        {
          id: 'evt-003-1',
          timestamp: '2025-05-10T07:30:00',
          title: 'Alerte de sécurité du fournisseur',
          description: 'Notification de vulnérabilité critique (CVE-2025-12345) dans le service managé que nous utilisons.'
        }
      ],
      metrics: {
        reputation: 35,
        financial: 20,
        operational: 55,
        security: 70
      }
    },
    {
      id: 'inc-004',
      title: 'Activité suspecte sur compte privilégié',
      description: 'Connexion anormale détectée sur un compte administrateur depuis une localisation inhabituelle pendant les heures non ouvrées.',
      urgency: 'low',
      status: 'contained',
      location: 'Strasbourg',
      startTime: '2025-05-10T02:14:37',
      threatType: 'Credential Theft',
      affectedSystems: ['Active Directory', 'VPN'],
      threatLevel: 40,
      coordinates: [7.7521, 48.5734], // Strasbourg
      timeline: [
        {
          id: 'evt-004-1',
          timestamp: '2025-05-10T02:14:37',
          title: 'Alerte d'authentification',
          description: 'Connexion à un compte admin depuis une adresse IP non reconnue à 2h14 du matin.'
        },
        {
          id: 'evt-004-2',
          timestamp: '2025-05-10T02:17:52',
          title: 'Actions post-authentification',
          description: 'Tentative de modification des règles du pare-feu sur plusieurs segments réseau.',
          actionTaken: 'Déconnexion forcée de la session et verrouillage temporaire du compte.'
        }
      ],
      metrics: {
        reputation: 15,
        financial: 5,
        operational: 20,
        security: 35
      }
    }
  ];
  
  // Données factices pour les experts
  const experts: Expert[] = [
    {
      id: 'exp-001',
      name: 'Émilie Dupont',
      role: 'RSSI',
      specialty: 'Stratégie de défense',
      avatarInitials: 'ED',
      avatarColor: 'bg-red-700',
      expertise: 95,
      availableForUrgency: ['low', 'medium', 'high', 'critical'],
      description: 'Responsable de la sécurité des systèmes d'information avec 15 ans d'expérience. Spécialiste en gestion de crise.'
    },
    {
      id: 'exp-002',
      name: 'Alexandre Martin',
      role: 'Analyste SOC',
      specialty: 'Détection & Réponse',
      avatarInitials: 'AM',
      avatarColor: 'bg-blue-700',
      expertise: 85,
      availableForUrgency: ['low', 'medium', 'high', 'critical'],
      description: 'Expert en détection d'intrusion et analyse de malware. Certifié GIAC.'
    },
    {
      id: 'exp-003',
      name: 'Sophie Legrand',
      role: 'Experte Forensics',
      specialty: 'Investigation numérique',
      avatarInitials: 'SL',
      avatarColor: 'bg-purple-700',
      expertise: 90,
      availableForUrgency: ['medium', 'high', 'critical'],
      description: 'Spécialiste en analyse post-incident et reconstruction d'événements. Expérience judiciaire.'
    },
    {
      id: 'exp-004',
      name: 'Thomas Moreau',
      role: 'Resp. Communication',
      specialty: 'Communication de crise',
      avatarInitials: 'TM',
      avatarColor: 'bg-green-700',
      expertise: 80,
      availableForUrgency: ['high', 'critical'],
      description: 'Gère la communication externe lors d'incidents majeurs. Expert en relations publiques.'
    },
    {
      id: 'exp-005',
      name: 'Laurent Klein',
      role: 'Architecte Sécurité',
      specialty: 'Infrastructure & Cloud',
      avatarInitials: 'LK',
      avatarColor: 'bg-orange-700',
      expertise: 88,
      availableForUrgency: ['low', 'medium', 'high'],
      description: 'Conçoit des architectures sécurisées et coordonne la remédiation technique des vulnérabilités.'
    }
  ];
  
  // Filtrer les incidents actifs pour l'affichage sur la carte
  const activeIncidents = incidents.filter(incident => incident.status !== 'resolved');
  
  // Gestion de la sélection d'un incident
  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncident(incident);
  };
  
  // Retour à la vue globale
  const handleBackToOverview = () => {
    setSelectedIncident(null);
  };
  
  return (
    <HomeLayout>
      <PageTitle title="CENTRE DE CRISE CYBER" />
      <div className="min-h-[calc(100vh-64px)] relative overflow-hidden bg-gradient-to-b from-blue-950 to-slate-950">
        {/* Grille de fond animée */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full grid grid-cols-12 grid-rows-6 gap-px">
            {Array.from({ length: 12 * 6 }).map((_, i) => (
              <div key={i} className="bg-blue-500/20 border border-blue-500/10"></div>
            ))}
          </div>
        </div>
        
        {/* Contenu principal */}
        <div className="container mx-auto py-12 px-4 relative z-10">
          {/* En-tête de la page */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div className="flex items-center mb-4 md:mb-0">
              <Link href="/cyber">
                <Button variant="ghost" className="text-white hover:bg-blue-800/20 mr-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white font-exo">CENTRE DE CRISE CYBER</h1>
                <p className="text-blue-300 mt-1 font-rajdhani">
                  Plateforme de simulation et gestion d'incidents de sécurité
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge className="bg-blue-700 text-white">
                <div className="h-2 w-2 rounded-full bg-green-400 mr-1 animate-pulse"></div>
                Système actif
              </Badge>
              <Badge className="bg-blue-900/70 text-white">
                4 incidents en cours
              </Badge>
            </div>
          </div>
          
          {/* Dashboard avec statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {dashboardStats.map((stat) => (
              <DashboardCard 
                key={stat.id}
                icon={stat.icon}
                title={stat.title}
                value={stat.value}
                trend={stat.trend}
              />
            ))}
          </div>
          
          {/* Contenu principal : carte ou détails d'incident */}
          {selectedIncident ? (
            // Vue détaillée d'un incident
            <IncidentDetails
              incident={selectedIncident}
              experts={experts}
              onBack={handleBackToOverview}
            />
          ) : (
            // Vue globale avec carte et liste des incidents
            <div className="space-y-8">
              {/* Carte du monde avec incidents */}
              <div className="bg-blue-950/60 border border-blue-800 rounded-xl overflow-hidden shadow-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white font-exo">Carte des incidents</h2>
                  <Badge className="bg-blue-900/70 text-white">
                    Mise à jour en temps réel
                  </Badge>
                </div>
                
                <div className="h-80 rounded-lg overflow-hidden">
                  <WorldMap 
                    incidents={activeIncidents}
                    onSelectIncident={handleSelectIncident}
                  />
                </div>
                
                <div className="flex justify-end mt-4 space-x-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
                    <span className="text-xs text-white">Critique</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-orange-500 mr-1"></div>
                    <span className="text-xs text-white">Élevé</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
                    <span className="text-xs text-white">Moyen</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
                    <span className="text-xs text-white">Faible</span>
                  </div>
                </div>
              </div>
              
              {/* Liste des incidents actifs */}
              <div className="bg-blue-950/60 border border-blue-800 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-blue-800">
                  <h2 className="text-xl font-bold text-white font-exo">Incidents actifs</h2>
                  <p className="text-blue-300 text-sm">
                    Sélectionnez un incident pour accéder à sa salle de crise dédiée.
                  </p>
                </div>
                
                <div className="p-4">
                  <div className="space-y-4">
                    {activeIncidents.map((incident) => (
                      <motion.div
                        key={incident.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-blue-900/30 hover:bg-blue-900/50 border border-blue-800 rounded-lg p-4 cursor-pointer transition-all"
                        onClick={() => handleSelectIncident(incident)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <div 
                              className={`h-5 w-5 mt-1 rounded-full mr-3 flex-shrink-0 ${
                                incident.urgency === 'critical' ? 'bg-red-500' :
                                incident.urgency === 'high' ? 'bg-orange-500' :
                                incident.urgency === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                              }`}
                            ></div>
                            <div>
                              <h3 className="text-white font-medium">{incident.title}</h3>
                              <p className="text-blue-300 text-sm mt-1">{incident.description.substring(0, 100)}...</p>
                              
                              <div className="flex flex-wrap gap-2 mt-2">
                                <Badge className="bg-blue-800/80 text-white">
                                  <Globe className="h-3 w-3 mr-1" />
                                  {incident.location}
                                </Badge>
                                <Badge className="bg-blue-800/80 text-white">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {new Date(incident.startTime).toLocaleTimeString()}
                                </Badge>
                                <Badge className="bg-blue-800/80 text-white">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  {incident.threatType}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <Button 
                            size="sm" 
                            className="bg-blue-700 hover:bg-blue-600 text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectIncident(incident);
                            }}
                          >
                            Gérer
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Fonctionnement du centre de crise */}
              <div className="bg-blue-950/60 border border-blue-800 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 border-b border-blue-800">
                  <h2 className="text-xl font-bold text-white font-exo">Comment fonctionne le CENTRE DE CRISE</h2>
                </div>
                
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col">
                      <div className="w-12 h-12 bg-blue-700 rounded-lg mb-4 flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2 text-white font-rajdhani">Incidents réalistes</h4>
                      <p className="text-blue-300">
                        Affrontez des incidents de cybersécurité basés sur des cas réels, de l'alerte phishing de base jusqu'à la gestion de crise majeure avec tous les interlocuteurs.
                      </p>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="w-12 h-12 bg-blue-700 rounded-lg mb-4 flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2 text-white font-rajdhani">Équipe d'experts</h4>
                      <p className="text-blue-300">
                        Interagissez avec une équipe virtuelle d'experts en cybersécurité. Chaque expert apporte ses compétences spécifiques pour vous aider à résoudre la crise.
                      </p>
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="w-12 h-12 bg-blue-700 rounded-lg mb-4 flex items-center justify-center">
                        <Activity className="h-6 w-6 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold mb-2 text-white font-rajdhani">Impact en temps réel</h4>
                      <p className="text-blue-300">
                        Visualisez l'impact de vos décisions en temps réel sur les indicateurs clés : réputation, finances, opérations et sécurité globale de l'organisation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </HomeLayout>
  );
}