import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvatarDisplay } from '@/components/cyber/AvatarCreator';
import {
  CalendarDays, 
  Mail, 
  MessageSquare, 
  FileText, 
  User,
  Shield,
  Terminal,
  Folder,
  AlertTriangle,
  Zap,
  InfoIcon
} from 'lucide-react';

// Types
interface PlayerData {
  name: string;
  avatar: string;
  role: string;
  module: string;
  selectedDifficulty: string;
  finalLevel: string;
  testResults: {
    score: number;
    total: number;
    percentage: number;
  };
  onboardingComplete: boolean;
  timestamp: number;
}

interface Message {
  id: string;
  sender: string;
  senderAvatar?: string;
  senderRole?: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'email' | 'chat' | 'notification';
  subject?: string;
  attachments?: string[];
}

interface Mission {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  difficulty: string;
  contact: {
    name: string;
    role: string;
  };
  timestamp: Date;
}

interface File {
  id: string;
  name: string;
  type: string;
  content: string;
  lastModified: Date;
  size: string;
}

const COMPANY_NAME = 'CYBER SECURE SOLUTIONS';

// Composant principal de la simulation
export default function CyberSimulation() {
  const [, setLocation] = useLocation();
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('email');
  
  // États pour la simulation
  const [emails, setEmails] = useState<Message[]>([]);
  const [chats, setChats] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Message[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  
  // Chargement des données du joueur depuis localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('cyberPlayerData');
    if (!savedData) {
      // Rediriger vers l'onboarding si les données ne sont pas disponibles
      setLocation('/cyber-onboarding-new');
      return;
    }
    
    try {
      const data = JSON.parse(savedData) as PlayerData;
      setPlayerData(data);
      
      // Génération des données de simulation initiales
      generateInitialData(data);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des données du joueur:', error);
      // En cas d'erreur, rediriger vers l'onboarding
      setLocation('/cyber-onboarding-new');
    }
  }, [setLocation]);
  
  // Génération des données initiales de simulation
  const generateInitialData = (data: PlayerData) => {
    // Message de bienvenue initial d'Isabelle Dubacq
    const welcomeEmail: Message = {
      id: 'welcome-email',
      sender: 'Isabelle Dubacq',
      senderRole: 'Directrice des Ressources Humaines',
      content: `Bonjour ${data.name},\n\nJe suis ravie de vous accueillir chez ${COMPANY_NAME}. Votre profil intéressant et votre évaluation de niveau ${data.finalLevel} en ${getModuleName(data.module)} nous a particulièrement impressionnés.\n\nVous trouverez dans votre dossier les premiers documents relatifs à votre mission. J'ai également demandé à ce qu'un de nos spécialistes vous contact rapidement pour vous guider sur vos premiers défis.\n\nN'hésitez pas à explorer notre plateforme interne et à me contacter si vous avez des questions.\n\nBienvenue dans l'équipe !`,
      timestamp: new Date(),
      isRead: false,
      type: 'email',
      subject: `Bienvenue chez ${COMPANY_NAME}`,
    };
    
    // Message de notification concernant le niveau
    const levelNotification: Message = {
      id: 'level-notification',
      sender: 'Système',
      content: `Votre niveau a été établi à "${data.finalLevel}" suite à votre évaluation (${data.testResults.score}/${data.testResults.total} correct).`,
      timestamp: new Date(),
      isRead: false,
      type: 'notification',
    };
    
    // Ajouter aux états
    setEmails([welcomeEmail]);
    setNotifications([levelNotification]);
    
    // Générer des fichiers de base
    const initialFiles: File[] = [
      {
        id: 'welcome-guide',
        name: 'Guide de bienvenue.txt',
        type: 'text',
        content: `GUIDE DE BIENVENUE - ${COMPANY_NAME}\n\nCher ${data.name},\n\nBienvenue dans notre équipe ! Ce document contient les informations essentielles pour bien démarrer.\n\n1. Votre rôle: ${getRoleName(data.role)}\n2. Votre domaine d'expertise: ${getModuleName(data.module)}\n3. Votre niveau: ${data.finalLevel}\n\nVous recevrez bientôt votre première mission. Restez attentif à vos messages et emails.\n\nL'équipe de Direction`,
        lastModified: new Date(),
        size: '2.3 KB',
      },
      {
        id: 'security-policies',
        name: 'Politiques de sécurité.txt',
        type: 'text',
        content: `POLITIQUES DE SÉCURITÉ - ${COMPANY_NAME}\n\n1. Confidentialité des données\n2. Gestion des accès\n3. Réponse aux incidents\n4. Protection des communications\n5. Sauvegarde et restauration\n\nCes politiques sont essentielles pour maintenir un niveau élevé de sécurité dans notre organisation. Veuillez les consulter régulièrement.`,
        lastModified: new Date(),
        size: '1.8 KB',
      }
    ];
    
    setFiles(initialFiles);
    
    // Générer la première mission
    setTimeout(() => {
      const expertName = getExpertByModule(data.module);
      const expertRole = getExpertRole(expertName);
      
      const missionEmail: Message = {
        id: 'first-mission-email',
        sender: expertName,
        senderRole: expertRole,
        content: `Bonjour ${data.name},\n\nSuite à votre intégration, j'ai le plaisir de vous confier votre première mission dans le domaine de ${getModuleName(data.module)}.\n\nVotre mission consistera à analyser une situation problématique et à proposer des solutions adaptées. Les détails se trouvent dans le fichier joint à ce message.\n\nCompte tenu de votre niveau ${data.finalLevel}, j'ai adapté la difficulté en conséquence.\n\nN'hésitez pas à me contacter via le chat si vous avez des questions.\n\nCordialement,`,
        timestamp: new Date(Date.now() + 1000 * 60 * 5), // 5 minutes plus tard
        isRead: false,
        type: 'email',
        subject: `Votre première mission - ${getModuleName(data.module)}`,
        attachments: ['mission-details.txt']
      };
      
      const missionDetailsFile: File = {
        id: 'mission-details',
        name: 'mission-details.txt',
        type: 'text',
        content: generateMissionContent(data.module, data.finalLevel),
        lastModified: new Date(Date.now() + 1000 * 60 * 5),
        size: '4.2 KB',
      };
      
      const newMission: Mission = {
        id: 'mission-1',
        title: `Première mission - ${getModuleName(data.module)}`,
        description: `Analyse et résolution d'un cas pratique en ${getModuleName(data.module)}`,
        status: 'pending',
        difficulty: data.finalLevel,
        contact: {
          name: expertName,
          role: expertRole
        },
        timestamp: new Date(Date.now() + 1000 * 60 * 5)
      };
      
      setEmails(prev => [...prev, missionEmail]);
      setFiles(prev => [...prev, missionDetailsFile]);
      setMissions(prev => [...prev, newMission]);
      
      // Ajouter une notification
      setNotifications(prev => [
        ...prev, 
        {
          id: 'new-mission-notification',
          sender: 'Système',
          content: `Vous avez reçu une nouvelle mission de ${expertName}.`,
          timestamp: new Date(Date.now() + 1000 * 60 * 5),
          isRead: false,
          type: 'notification',
        }
      ]);
      
    }, 5000); // Délai pour simuler l'arrivée de la mission
  };
  
  // Fonction pour marquer un message comme lu
  const markAsRead = (id: string, type: 'email' | 'chat' | 'notification') => {
    if (type === 'email') {
      setEmails(prev => prev.map(email => 
        email.id === id ? {...email, isRead: true} : email
      ));
    } else if (type === 'chat') {
      setChats(prev => prev.map(chat => 
        chat.id === id ? {...chat, isRead: true} : chat
      ));
    } else if (type === 'notification') {
      setNotifications(prev => prev.map(notification => 
        notification.id === id ? {...notification, isRead: true} : notification
      ));
    }
  };
  
  // Fonction pour commencer une mission
  const startMission = (missionId: string) => {
    setMissions(prev => prev.map(mission => 
      mission.id === missionId ? {...mission, status: 'active'} : mission
    ));
    
    // Ajouter une notification
    setNotifications(prev => [
      ...prev, 
      {
        id: `start-mission-${missionId}`,
        sender: 'Système',
        content: `Vous avez commencé la mission "${missions.find(m => m.id === missionId)?.title}".`,
        timestamp: new Date(),
        isRead: false,
        type: 'notification',
      }
    ]);
  };
  
  // Fonction pour quitter la simulation et revenir à l'accueil
  const handleLogout = () => {
    setLocation('/');
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-700">Chargement de votre environnement...</p>
        </div>
      </div>
    );
  }
  
  const unreadEmails = emails.filter(email => !email.isRead).length;
  const unreadChats = chats.filter(chat => !chat.isRead).length;
  const unreadNotifications = notifications.filter(notification => !notification.isRead).length;
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* En-tête */}
      <header className="bg-blue-700 text-white p-4 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Shield className="h-8 w-8" />
            <h1 className="text-xl font-bold">{COMPANY_NAME}</h1>
          </div>
          <div className="flex items-center space-x-6">
            {playerData && (
              <div className="flex items-center space-x-2">
                <AvatarDisplay avatarId={playerData.avatar} size="sm" />
                <div>
                  <p className="text-sm font-medium">{playerData.name}</p>
                  <p className="text-xs opacity-80">{getRoleName(playerData.role)}</p>
                </div>
              </div>
            )}
            <Button variant="outline" className="text-white border-white hover:bg-blue-800" onClick={handleLogout}>
              Quitter
            </Button>
          </div>
        </div>
      </header>
      
      {/* Contenu principal */}
      <main className="flex-grow p-4 md:p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Panneau de gauche (navigation) */}
          <div className="md:col-span-1">
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="space-y-1 pt-2">
                  <Button 
                    variant={activeTab === 'email' ? 'default' : 'ghost'} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab('email')}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Emails
                    {unreadEmails > 0 && (
                      <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                        {unreadEmails}
                      </span>
                    )}
                  </Button>
                  <Button 
                    variant={activeTab === 'chat' ? 'default' : 'ghost'} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab('chat')}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat
                    {unreadChats > 0 && (
                      <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                        {unreadChats}
                      </span>
                    )}
                  </Button>
                  <Button 
                    variant={activeTab === 'files' ? 'default' : 'ghost'} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab('files')}
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    Fichiers
                  </Button>
                  <Button 
                    variant={activeTab === 'missions' ? 'default' : 'ghost'} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab('missions')}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Missions
                  </Button>
                  <Button 
                    variant={activeTab === 'terminal' ? 'default' : 'ghost'} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab('terminal')}
                  >
                    <Terminal className="mr-2 h-4 w-4" />
                    Terminal
                  </Button>
                  <Button 
                    variant={activeTab === 'profile' ? 'default' : 'ghost'} 
                    className="w-full justify-start" 
                    onClick={() => setActiveTab('profile')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profil
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Notifications */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2 flex items-center">
                  <InfoIcon className="h-4 w-4 mr-2" />
                  Notifications
                  {unreadNotifications > 0 && (
                    <span className="ml-auto bg-blue-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadNotifications}
                    </span>
                  )}
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">Aucune notification</p>
                  ) : (
                    notifications.map(notification => (
                      <div 
                        key={notification.id}
                        className={`text-sm p-2 rounded ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50'}`}
                        onClick={() => markAsRead(notification.id, 'notification')}
                      >
                        <p className="text-gray-700">{notification.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {notification.timestamp.toLocaleTimeString()} - {notification.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Contenu principal (dynamique selon l'onglet) */}
          <div className="md:col-span-3">
            {/* Email */}
            {activeTab === 'email' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Mail className="mr-2 h-5 w-5" />
                    Boîte de réception
                  </h2>
                  
                  <div className="max-h-[70vh] overflow-y-auto pr-2">
                    {emails.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-gray-500">Aucun email pour le moment</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {emails.map(email => (
                          <div 
                            key={email.id}
                            className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition ${!email.isRead ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}
                            onClick={() => markAsRead(email.id, 'email')}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-bold">{email.subject}</h3>
                                <p className="text-sm text-gray-600">
                                  De: {email.sender} {email.senderRole ? `(${email.senderRole})` : ''}
                                </p>
                              </div>
                              <div className="text-sm text-gray-500">
                                {email.timestamp.toLocaleTimeString()} - {email.timestamp.toLocaleDateString()}
                              </div>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">{email.content}</p>
                            
                            {email.attachments && email.attachments.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm font-medium">Pièces jointes:</p>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  {email.attachments.map(attachment => (
                                    <div 
                                      key={attachment}
                                      className="px-3 py-1 bg-gray-100 rounded-full text-sm flex items-center"
                                    >
                                      <FileText className="h-3 w-3 mr-1" />
                                      {attachment}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Chat */}
            {activeTab === 'chat' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <MessageSquare className="mr-2 h-5 w-5" />
                    Messages
                  </h2>
                  
                  <div className="text-center py-10">
                    <p className="text-gray-500">Aucun message pour le moment</p>
                    <p className="text-sm text-gray-400 mt-2">Les contacts vous enverront des messages lorsque vous aurez commencé une mission</p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Fichiers */}
            {activeTab === 'files' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Folder className="mr-2 h-5 w-5" />
                    Fichiers
                  </h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4">Nom</th>
                          <th className="text-left py-2 px-4">Type</th>
                          <th className="text-left py-2 px-4">Dernière modification</th>
                          <th className="text-left py-2 px-4">Taille</th>
                        </tr>
                      </thead>
                      <tbody>
                        {files.map(file => (
                          <tr key={file.id} className="border-b hover:bg-gray-50 cursor-pointer">
                            <td className="py-3 px-4 flex items-center">
                              <FileText className="h-4 w-4 mr-2 text-blue-500" />
                              {file.name}
                            </td>
                            <td className="py-3 px-4">{file.type}</td>
                            <td className="py-3 px-4">{file.lastModified.toLocaleString()}</td>
                            <td className="py-3 px-4">{file.size}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Missions */}
            {activeTab === 'missions' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Missions
                  </h2>
                  
                  <div className="max-h-[70vh] overflow-y-auto pr-2">
                    {missions.length === 0 ? (
                      <div className="text-center py-10">
                        <p className="text-gray-500">Aucune mission disponible pour le moment</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {missions.map(mission => (
                          <div 
                            key={mission.id}
                            className={`p-4 border rounded-lg ${
                              mission.status === 'active' ? 'bg-blue-50 border-blue-200' : 
                              mission.status === 'completed' ? 'bg-green-50 border-green-200' : 
                              'bg-white'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold">{mission.title}</h3>
                              <div className={`px-2 py-1 rounded-full text-xs ${
                                mission.status === 'active' ? 'bg-blue-100 text-blue-800' : 
                                mission.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {mission.status === 'active' ? 'En cours' : 
                                 mission.status === 'completed' ? 'Terminée' : 
                                 'En attente'}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-2">{mission.description}</p>
                            
                            <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-500 mb-4">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {mission.contact.name} ({mission.contact.role})
                              </div>
                              <div className="flex items-center">
                                <CalendarDays className="h-4 w-4 mr-1" />
                                {mission.timestamp.toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <Zap className="h-4 w-4 mr-1" />
                                Difficulté: {mission.difficulty}
                              </div>
                            </div>
                            
                            {mission.status === 'pending' && (
                              <Button 
                                onClick={() => startMission(mission.id)}
                                className="w-full sm:w-auto"
                              >
                                Commencer la mission
                              </Button>
                            )}
                            
                            {mission.status === 'active' && (
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button 
                                  variant="outline"
                                  className="w-full sm:w-auto"
                                  onClick={() => setActiveTab('files')}
                                >
                                  Consulter les documents
                                </Button>
                                <Button 
                                  variant="outline"
                                  className="w-full sm:w-auto"
                                  onClick={() => setActiveTab('chat')}
                                >
                                  Contacter {mission.contact.name}
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Terminal */}
            {activeTab === 'terminal' && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center">
                    <Terminal className="mr-2 h-5 w-5" />
                    Terminal
                  </h2>
                  
                  <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm h-60 overflow-y-auto">
                    <div>
                      <p className="mb-2">Bienvenue sur le terminal sécurisé de {COMPANY_NAME}</p>
                      <p className="mb-2">Utilisateur: {playerData?.name}</p>
                      <p className="mb-2">Rôle: {getRoleName(playerData?.role || '')}</p>
                      <p className="mb-2">Type 'help' pour afficher les commandes disponibles</p>
                    </div>
                    <div className="mt-4">
                      <span className="text-blue-400">user@cyber-secure</span>:<span className="text-purple-400">~</span>$ <span className="animate-pulse">_</span>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Note: Le terminal n'est pas encore complètement fonctionnel. De nouvelles fonctionnalités seront ajoutées prochainement.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Profil */}
            {activeTab === 'profile' && playerData && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-6 flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Profil utilisateur
                  </h2>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex flex-col items-center">
                      <AvatarDisplay avatarId={playerData.avatar} size="xl" />
                      <h3 className="font-bold mt-3">{playerData.name}</h3>
                      <p className="text-sm text-gray-600">{getRoleName(playerData.role)}</p>
                    </div>
                    
                    <div className="flex-grow space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Spécialisation</h4>
                          <p>{getModuleName(playerData.module)}</p>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Niveau actuel</h4>
                          <p>{playerData.finalLevel} ({playerData.testResults.score}/{playerData.testResults.total})</p>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Missions complétées</h4>
                          <p>{missions.filter(m => m.status === 'completed').length}</p>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-500 mb-1">Date d'arrivée</h4>
                          <p>{new Date(playerData.timestamp).toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Compétences et progression</h4>
                        
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">{getModuleName(playerData.module)}</span>
                              <span className="text-sm text-gray-600">
                                {Math.round(playerData.testResults.percentage)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${playerData.testResults.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm">Progression globale</span>
                              <span className="text-sm text-gray-600">15%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: '15%' }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      
      {/* Pied de page */}
      <footer className="bg-gray-800 text-gray-300 py-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} {COMPANY_NAME} - Plateforme de simulation cybersécurité</p>
      </footer>
    </div>
  );
}

// Fonctions utilitaires
function getRoleName(roleId: string): string {
  const roles: Record<string, string> = {
    'security-analyst': 'Analyste de sécurité',
    'security-engineer': 'Ingénieur sécurité',
    'security-consultant': 'Consultant cybersécurité',
    'security-manager': 'Responsable sécurité',
    'data-protection-officer': 'Délégué à la protection des données',
    'security-auditor': 'Auditeur sécurité',
    'red-team': 'Équipe rouge (Red Team)',
    'blue-team': 'Équipe bleue (Blue Team)'
  };
  
  return roles[roleId] || roleId;
}

function getModuleName(moduleId: string): string {
  const modules: Record<string, string> = {
    'crisis-management': 'Gestion de crise cyber',
    'data-protection': 'Protection des données personnelles',
    'social-engineering': 'Ingénierie sociale et phishing',
    'incident-handling': 'Gestion des incidents de sécurité',
    'supply-chain': 'Sécurité de la chaîne d\'approvisionnement',
    'governance': 'Stratégie et gouvernance cybersécurité'
  };
  
  return modules[moduleId] || moduleId;
}

function getExpertByModule(moduleId: string): string {
  const experts: Record<string, string> = {
    'crisis-management': 'Richard Farkas',
    'data-protection': 'Sophie Niel',
    'social-engineering': 'Marc Dubois',
    'incident-handling': 'Eddy Missoni',
    'supply-chain': 'Leila Hakimi',
    'governance': 'François Bernard'
  };
  
  return experts[moduleId] || 'Olivier Dupont';
}

function getExpertRole(expertName: string): string {
  const roles: Record<string, string> = {
    'Richard Farkas': 'Directeur de la Réponse aux Incidents',
    'Sophie Niel': 'DPO / Juriste spécialisée RGPD',
    'Marc Dubois': 'Expert en Sécurité Humaine',
    'Eddy Missoni': 'Expert Data / IA & CTO',
    'Leila Hakimi': 'Responsable Sécurité des Fournisseurs',
    'François Bernard': 'RSSI / Directeur Cybersécurité',
    'Olivier Dupont': 'Mentor Cybersécurité'
  };
  
  return roles[expertName] || 'Spécialiste Cybersécurité';
}

function generateMissionContent(moduleId: string, level: string): string {
  // Contenu générique pour la mission, à personnaliser selon le module et le niveau
  return `MISSION CONFIDENTIELLE - ${level.toUpperCase()}
  
Module: ${getModuleName(moduleId)}

Objectif: En tant que ${level === 'debutant' ? 'nouvel arrivant' : level === 'expert' ? 'expert' : 'professionnel'} dans notre équipe, votre mission consistera à analyser un scénario de ${getModuleName(moduleId)} et à proposer des solutions adaptées.

Description:
${getMissionDescription(moduleId, level)}

Livrables attendus:
1. Analyse détaillée de la situation
2. Identification des risques et vulnérabilités
3. Proposition de mesures correctives
4. Plan d'action recommandé

Contactez votre référent ${getExpertByModule(moduleId)} pour toute question ou clarification.

Niveau de confidentialité: ${level === 'expert' ? 'Niveau 3 - Strictement confidentiel' : level === 'intermediaire' ? 'Niveau 2 - Confidentiel' : 'Niveau 1 - Interne'}

Bon courage dans votre mission.`;
}

function getMissionDescription(moduleId: string, level: string): string {
  const descriptions: Record<string, Record<string, string>> = {
    'crisis-management': {
      'debutant': 'Notre entreprise vient de détecter une tentative d\'intrusion sur notre réseau. Les premiers signes indiquent qu\'il pourrait s\'agir d\'une attaque ciblée, mais nous n\'avons pas encore confirmé si des données ont été compromises. Vous devez aider l\'équipe à préparer les premières étapes de la réponse à incident.',
      'intermediaire': 'Une attaque de ransomware a touché notre système de gestion des stocks. Les attaquants demandent une rançon de 50.000€ pour débloquer les données. Certains systèmes critiques sont affectés, mais les sauvegardes récentes semblent intactes. Vous devez coordonner notre réponse à cette crise.',
      'expert': 'Notre entreprise fait face à une attaque sophistiquée de type APT (Advanced Persistent Threat). Les attaquants ont maintenu une présence discrète dans nos systèmes depuis plusieurs mois et ont potentiellement accédé à des informations sensibles concernant nos produits en développement. La presse commence à avoir vent de l\'incident. Vous devez gérer cette crise complexe qui touche à la fois les aspects techniques, juridiques et de communication.'
    },
    'data-protection': {
      'debutant': 'Notre application mobile collecte des données de géolocalisation des utilisateurs pour améliorer nos services. Nous devons nous assurer que cette collecte est conforme au RGPD avant le lancement prévu le mois prochain. Vous devez analyser les pratiques actuelles et proposer des ajustements si nécessaire.',
      'intermediaire': 'Un collaborateur a signalé avoir accidentellement envoyé un fichier contenant des données personnelles de clients à un destinataire externe. Le fichier contient des noms, adresses email et historiques d\'achat de près de 500 clients. Vous devez évaluer la situation et recommander les actions appropriées selon le RGPD.',
      'expert': 'Suite à une restructuration, notre entreprise envisage de transférer l\'ensemble de ses bases de données clients vers un nouveau fournisseur de cloud computing basé aux États-Unis. Ces données concernent des citoyens européens et incluent des informations sensibles comme des données de santé pour certaines de nos applications. Vous devez analyser les implications juridiques et proposer une stratégie de conformité complète.'
    },
    'incident-handling': {
      'debutant': 'Un employé du service comptabilité a signalé avoir cliqué sur un lien dans un email qu\'il croyait provenir du directeur financier. Son ordinateur montre maintenant un comportement inhabituel (ralentissements, popups). Vous devez analyser la situation et recommander les premières actions.',
      'intermediaire': 'Notre équipe de sécurité a détecté une activité inhabituelle sur nos serveurs web, avec un trafic anormalement élevé vers notre base de données clients. Les premiers indicateurs suggèrent une tentative d\'extraction de données via une vulnérabilité SQL. Vous devez coordonner la réponse à cet incident.',
      'expert': 'Nous avons détecté la présence d\'un malware avancé sur plusieurs systèmes critiques de l\'entreprise. L\'analyse préliminaire suggère qu\'il s\'agit d\'un outil d\'espionnage industriel ciblant spécifiquement nos données de R&D. Le malware semble avoir contourné nos défenses traditionnelles et opère depuis plusieurs semaines. Vous devez diriger l\'investigation complète et la remédiation de cet incident majeur.'
    },
    'social-engineering': {
      'debutant': 'Nous avons reçu plusieurs signalements d\'emails suspects demandant aux employés de réinitialiser leurs mots de passe. Ces emails semblent imiter notre service informatique. Vous devez analyser ces tentatives et proposer des mesures pour sensibiliser les employés.',
      'intermediaire': 'Un inconnu s\'est présenté au service d\'accueil en se faisant passer pour un technicien de maintenance informatique et a tenté d\'accéder à notre salle serveur. Bien qu\'il ait été stoppé par la sécurité, cet incident révèle des failles dans nos procédures. Vous devez analyser ce scénario et renforcer nos défenses contre le social engineering physique.',
      'expert': 'Notre entreprise a été victime d\'une attaque sophistiquée de type whaling/CEO fraud. L\'attaquant a réussi à se faire passer pour le PDG auprès du directeur financier, ce qui a conduit à un virement frauduleux de 2M€. L\'attaque a combiné plusieurs techniques d\'ingénierie sociale, y compris l\'usurpation d\'emails, des appels téléphoniques et une connaissance approfondie de l\'organisation interne. Vous devez analyser cette attaque complexe et concevoir une stratégie globale pour prévenir ce type d\'incident.'
    },
    'supply-chain': {
      'debutant': 'Nous envisageons d\'intégrer un nouveau fournisseur de services cloud pour notre système de gestion de projet. Vous devez évaluer les risques potentiels de sécurité liés à cette intégration et proposer un questionnaire d\'évaluation pour ce fournisseur.',
      'intermediaire': 'L\'un de nos fournisseurs critiques de composants logiciels a signalé avoir subi une intrusion dans leurs systèmes. Bien qu\'ils affirment que les données clients n\'ont pas été compromises, nous devons évaluer l\'impact potentiel sur notre chaîne d\'approvisionnement et notre sécurité. Vous devez proposer un plan d\'action.',
      'expert': 'Nous développons une nouvelle plateforme IoT critique qui intègre des composants matériels et logiciels de plus de 20 fournisseurs différents, certains basés dans des régions géopolitiquement sensibles. Ce produit sera déployé dans des infrastructures critiques de nos clients. Vous devez concevoir une stratégie complète de sécurité de la chaîne d\'approvisionnement pour ce projet, en tenant compte des risques techniques, organisationnels et géopolitiques.'
    },
    'governance': {
      'debutant': 'Notre startup en pleine croissance n\'a pas encore formalisé ses politiques de sécurité. La direction souhaite mettre en place les fondations d\'une bonne gouvernance cyber. Vous devez proposer un cadre initial adapté à notre taille et notre secteur.',
      'intermediaire': 'Notre entreprise prépare une certification ISO 27001 dans les 12 prochains mois. Vous devez évaluer notre niveau actuel de maturité en matière de gouvernance de la sécurité et identifier les principales lacunes à combler pour atteindre cette certification.',
      'expert': 'Suite à une fusion-acquisition, nous devons intégrer deux cultures de sécurité très différentes. La société acquise opère dans un secteur hautement régulé avec des exigences strictes, tandis que notre approche a toujours été plus flexible. De plus, nous envisageons une expansion internationale qui nous soumettra à de nouvelles réglementations. Vous devez concevoir une stratégie de gouvernance unifiée qui réponde à ces défis complexes.'
    }
  };

  return descriptions[moduleId]?.[level] || 
    'Vous êtes chargé d\'analyser les pratiques de sécurité actuelles et de proposer des améliorations basées sur les meilleures pratiques du secteur.';
}