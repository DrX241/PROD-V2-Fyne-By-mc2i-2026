import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useChatContext } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { AvatarDisplay } from '@/components/cyber/AvatarCreator';
import ChatInterface from '@/components/cyber/ChatInterface';
import axios from 'axios';
import {
  Mail,
  MessageSquare,
  FileText,
  Terminal,
  LogOut,
  Bell,
  User,
  ChevronDown,
  Paperclip,
  Reply,
  Trash,
  Clock
} from 'lucide-react';

interface Message {
  id: string;
  subject: string;
  sender: {
    name: string;
    role: string;
    avatar: string;
  };
  date: string;
  content: string;
  read: boolean;
  hasAttachment?: boolean;
}

export default function CyberSimulationInterface() {
  const [, setLocation] = useLocation();
  const { 
    userName, 
    playerRole, 
    avatarId, 
    difficultyLevel,
    currentMission
  } = useChatContext();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'emails' | 'chat' | 'files' | 'missions' | 'terminal'>('emails');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("CYBER SECURE SOLUTIONS");
  const [notificationCount, setNotificationCount] = useState(2);
  
  // Contacts disponibles pour le chat
  const [contacts, setContacts] = useState([
    {
      id: 'isabelle-dubacq',
      name: 'Isabelle Dubacq',
      role: 'Directrice des Ressources Humaines',
      avatar: 'avatar1',
      online: true
    },
    {
      id: 'olivier-dupont',
      name: 'Olivier Dupont',
      role: 'Mentor Cybersécurité',
      avatar: 'avatar2',
      online: true
    }
  ]);
  
  // Messages dans la boîte de réception
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-message',
      subject: `Bienvenue chez ${companyName}`,
      sender: {
        name: 'Isabelle Dubacq',
        role: 'Directrice des Ressources Humaines',
        avatar: 'avatar1'
      },
      date: '01:17:28 - 02/04/2025',
      content: `Bonjour ${userName || 'Agent'},

Je suis ravie de vous accueillir chez ${companyName}. Votre profil intéressant et votre évaluation de niveau ${difficultyLevel || 'Débutant'} en incidents nous a particulièrement impressionnés.

Vous trouverez dans votre dossier les premiers documents relatifs à votre mission. J'ai également demandé à ce qu'un de nos spécialistes vous contact rapidement pour vous guider sur vos premiers défis.

N'hésitez pas à explorer notre plateforme interne et à me contacter si vous avez des questions.

Bienvenue dans l'équipe !
      `,
      read: true
    },
    {
      id: 'first-mission',
      subject: `Votre première mission - incidents`,
      sender: {
        name: 'Olivier Dupont',
        role: 'Mentor Cybersécurité',
        avatar: 'avatar2'
      },
      date: '01:22:33 - 02/04/2025',
      content: `Bonjour ${userName || 'Agent'},

Suite à votre intégration, j'ai le plaisir de vous confier votre première mission dans le domaine de incidents.

Votre mission consistera à analyser une situation problématique et à proposer des solutions adaptées. Les détails se trouvent dans le fichier joint à ce message.

Compte tenu de votre niveau ${difficultyLevel || 'Débutant'}, j'ai adapté la difficulté en conséquence.

N'hésitez pas à me contacter si vous avez des questions ou besoin de conseils pour cette mission.

Cordialement,
Olivier Dupont
      `,
      read: false,
      hasAttachment: true
    }
  ]);
  
  // Modifier le nom de l'entreprise en fonction du contexte
  useEffect(() => {
    if (currentMission) {
      // Adapter le nom de l'entreprise en fonction du domaine de la mission
      if (currentMission.domain === 'Gestion de crise cyber') {
        setCompanyName('CYBER SECURE SOLUTIONS');
      } else if (currentMission.domain === 'Protection des données personnelles / RGPD') {
        setCompanyName('DATA PRIVACY EXPERTS');
      } else if (currentMission.domain === 'Stratégie et gouvernance cybersécurité') {
        setCompanyName('CYBER STRATEGY PARTNERS');
      } else {
        setCompanyName('CYBER SECURE SOLUTIONS');
      }
      
      // Ajouter le contact de la mission s'il n'existe pas déjà
      const missionContactExists = contacts.some(c => c.name === currentMission.contactName);
      if (!missionContactExists) {
        setContacts(prev => [
          ...prev,
          {
            id: `contact-${currentMission.id}`,
            name: currentMission.contactName,
            role: currentMission.contactRole,
            avatar: currentMission.contactAvatar,
            online: true
          }
        ]);
        
        // Ajouter un message correspondant à la mission
        setMessages(prev => [
          ...prev,
          {
            id: `message-${currentMission.id}`,
            subject: currentMission.title,
            sender: {
              name: currentMission.contactName,
              role: currentMission.contactRole,
              avatar: currentMission.contactAvatar
            },
            date: new Date().toLocaleString('fr-FR'),
            content: `Bonjour ${userName || 'Agent'},

Je vous contacte concernant une nouvelle mission : ${currentMission.title}.

${currentMission.description}

Je reste à votre disposition pour discuter des détails.

Cordialement,
${currentMission.contactName}
`,
            read: false
          }
        ]);
      }
    }
    
    // Simuler le chargement
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [currentMission]);
  
  // Marquer un message comme lu
  const markMessageAsRead = (messageId: string) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === messageId 
          ? { ...message, read: true } 
          : message
      )
    );
  };
  
  // Ouvrir un message
  const handleOpenMessage = (messageId: string) => {
    setActiveMessageId(messageId);
    markMessageAsRead(messageId);
  };
  
  // Démarrer une conversation
  const handleStartChat = (contactId: string) => {
    setActiveChatId(contactId);
    setActiveTab('chat');
  };
  
  // Répondre à un message par chat
  const handleReplyByChat = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message) {
      const contactId = contacts.find(c => c.name === message.sender.name)?.id;
      if (contactId) {
        setActiveChatId(contactId);
        setActiveTab('chat');
      }
    }
  };
  
  // Contact actif
  const activeContact = activeChatId 
    ? contacts.find(contact => contact.id === activeChatId) 
    : null;
  
  // Message actif
  const activeMessage = activeMessageId 
    ? messages.find(message => message.id === activeMessageId) 
    : null;
  
  // Messages non lus
  const unreadCount = messages.filter(m => !m.read).length;
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-lg">Initialisation de l'environnement de simulation...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      {/* En-tête */}
      <header className="bg-primary text-primary-foreground p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-primary-foreground/10 rounded-full p-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">{companyName}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-white/10">
              <span className="font-semibold">{playerRole || 'Analyste'}</span>
            </Badge>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Bell className="h-5 w-5 cursor-pointer" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-2 bg-primary-foreground/10 rounded-lg p-1 pl-2">
                <div className="text-sm font-medium">{userName || 'Agent'}</div>
                <AvatarDisplay avatarId={avatarId || 'avatar1'} size="sm" />
                <ChevronDown className="h-4 w-4" />
              </div>
              
              <Button 
                variant="secondary" 
                className="text-primary" 
                size="sm"
                onClick={() => setLocation('/')}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Quitter
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Contenu principal */}
      <main className="flex flex-1 overflow-hidden">
        {/* Barre latérale */}
        <div className="w-56 bg-card border-r">
          <div className="p-2">
            <Button
              variant={activeTab === 'emails' ? 'secondary' : 'ghost'}
              className="w-full justify-start mb-1"
              onClick={() => setActiveTab('emails')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Emails
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-auto">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            
            <Button
              variant={activeTab === 'chat' ? 'secondary' : 'ghost'}
              className="w-full justify-start mb-1"
              onClick={() => setActiveTab('chat')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat
            </Button>
            
            <Button
              variant={activeTab === 'files' ? 'secondary' : 'ghost'}
              className="w-full justify-start mb-1"
              onClick={() => setActiveTab('files')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Fichiers
            </Button>
            
            <Button
              variant={activeTab === 'missions' ? 'secondary' : 'ghost'}
              className="w-full justify-start mb-1"
              onClick={() => setActiveTab('missions')}
            >
              <Badge className="h-4 w-4 mr-2" />
              Missions
            </Button>
            
            <Button
              variant={activeTab === 'terminal' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('terminal')}
            >
              <Terminal className="h-4 w-4 mr-2" />
              Terminal
            </Button>
          </div>
          
          <Separator className="my-2" />
          
          <div className="p-2">
            <p className="px-2 text-xs font-semibold text-muted-foreground uppercase">
              Notifications
            </p>
            
            <div className="mt-2 space-y-1">
              <div className="p-2 bg-muted/50 rounded-lg text-xs">
                <p className="font-medium">Votre niveau a été établi à "{difficultyLevel || 'Débutant'}"</p>
                <p className="text-muted-foreground text-[10px] mt-1">01:17:28 - 02/04/2025</p>
              </div>
              
              <div className="p-2 bg-muted/50 rounded-lg text-xs">
                <p className="font-medium">Vous avez reçu une nouvelle mission</p>
                <p className="text-muted-foreground text-[10px] mt-1">01:22:33 - 02/04/2025</p>
              </div>
            </div>
          </div>
          
          {activeTab === 'chat' && (
            <>
              <Separator className="my-2" />
              
              <div className="p-2">
                <p className="px-2 text-xs font-semibold text-muted-foreground uppercase">
                  Contacts ({contacts.length})
                </p>
                
                <div className="mt-2 space-y-1">
                  {contacts.map(contact => (
                    <div
                      key={contact.id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer ${
                        activeChatId === contact.id ? 'bg-secondary' : 'hover:bg-muted'
                      }`}
                      onClick={() => setActiveChatId(contact.id)}
                    >
                      <div className="relative">
                        <AvatarDisplay avatarId={contact.avatar} size="sm" />
                        {contact.online && (
                          <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full ring-1 ring-background" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-medium truncate">{contact.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{contact.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Contenu de l'onglet actif */}
        <div className="flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'emails' | 'chat' | 'files' | 'missions' | 'terminal')}>
            <TabsList className="hidden">
              <TabsTrigger value="emails">Emails</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
              <TabsTrigger value="files">Fichiers</TabsTrigger>
              <TabsTrigger value="missions">Missions</TabsTrigger>
              <TabsTrigger value="terminal">Terminal</TabsTrigger>
            </TabsList>
            <TabsContent value="emails" className="m-0 h-full">
              <div className="h-full flex">
                {/* Liste des emails */}
              <div className={`w-1/3 border-r ${activeMessageId ? 'hidden md:block' : ''}`}>
                <div className="p-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <Mail className="h-5 w-5 mr-2" /> 
                    Boîte de réception
                  </h2>
                </div>
                
                <ScrollArea className="h-[calc(100vh-10rem)]">
                  <div className="space-y-1 p-2">
                    {messages.map(message => (
                      <div
                        key={message.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          activeMessageId === message.id
                            ? 'bg-secondary'
                            : message.read
                            ? 'bg-card hover:bg-muted/50'
                            : 'bg-primary/5 hover:bg-muted/50 border-primary/20'
                        }`}
                        onClick={() => handleOpenMessage(message.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <AvatarDisplay avatarId={message.sender.avatar} size="sm" />
                            <div>
                              <p className="text-sm font-medium">
                                {message.sender.name}
                                {!message.read && (
                                  <span className="inline-block w-2 h-2 bg-primary rounded-full ml-2" />
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">{message.sender.role}</p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{message.date.split(' - ')[0]}</p>
                        </div>
                        <p className="text-sm font-medium mb-1 truncate">{message.subject}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {message.content.split('\n')[0]}
                        </p>
                        {message.hasAttachment && (
                          <div className="flex items-center mt-2 text-xs text-muted-foreground">
                            <Paperclip className="h-3 w-3 mr-1" /> Pièce jointe
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              {/* Affichage du message */}
              {activeMessageId ? (
                <div className="flex-1 p-4">
                  {activeMessage && (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-semibold">{activeMessage.subject}</h2>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReplyByChat(activeMessage.id)}
                          >
                            <Reply className="h-4 w-4 mr-2" />
                            Répondre
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <AvatarDisplay avatarId={activeMessage.sender.avatar} size="md" />
                        <div>
                          <p className="font-medium">{activeMessage.sender.name}</p>
                          <p className="text-sm text-muted-foreground">{activeMessage.sender.role}</p>
                        </div>
                        <div className="ml-auto flex items-center text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 mr-1" />
                          {activeMessage.date}
                        </div>
                      </div>
                      
                      <Card>
                        <CardContent className="p-4">
                          <div className="whitespace-pre-wrap">
                            {activeMessage.content}
                          </div>
                          
                          {activeMessage.hasAttachment && (
                            <div className="mt-4 p-3 border rounded-lg flex items-center gap-3">
                              <FileText className="h-8 w-8 text-muted-foreground" />
                              <div>
                                <p className="font-medium">mission_details.pdf</p>
                                <p className="text-xs text-muted-foreground">Cliquez pour ouvrir</p>
                              </div>
                              <Button variant="outline" size="sm" className="ml-auto">
                                <Paperclip className="h-4 w-4 mr-2" />
                                Ouvrir
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Aucun message sélectionné</h3>
                    <p className="text-muted-foreground">
                      Sélectionnez un message pour l'afficher
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="m-0 h-full">
            <div className="h-full flex">
              {/* Affichage du chat */}
              {activeChatId && activeContact ? (
                <div className="flex-1">
                  <ChatInterface
                    contactName={activeContact.name}
                    contactRole={activeContact.role}
                    contactAvatar={activeContact.avatar}
                    userAvatar={avatarId || 'avatar1'}
                    userName={userName || 'Agent'}
                    userRole={playerRole || 'Analyste'}
                    height="h-[calc(100vh-7rem)]"
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium">Aucune conversation sélectionnée</h3>
                    <p className="text-muted-foreground">
                      Sélectionnez un contact dans la liste pour démarrer une conversation
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="files" className="m-0 h-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Fichiers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-medium">mission_details.pdf</p>
                      <p className="text-xs text-muted-foreground">Documents de mission</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Ouvrir
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 flex items-center gap-3">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                    <div>
                      <p className="font-medium">guide_integration.pdf</p>
                      <p className="text-xs text-muted-foreground">Guide d'intégration</p>
                    </div>
                    <Button variant="outline" size="sm" className="ml-auto">
                      Ouvrir
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="missions" className="m-0 h-full">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Missions en cours</h2>
              
              {currentMission ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium mb-1">{currentMission.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{currentMission.domain}</p>
                        <p className="mb-3">{currentMission.description}</p>
                        
                        <div className="flex items-center gap-2">
                          <AvatarDisplay avatarId={currentMission.contactAvatar} size="sm" />
                          <div>
                            <p className="text-sm font-medium">{currentMission.contactName}</p>
                            <p className="text-xs text-muted-foreground">{currentMission.contactRole}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <Badge>{currentMission.difficulty}</Badge>
                        <Button 
                          className="mt-4"
                          onClick={() => {
                            // Trouver l'ID du contact
                            const contactId = contacts.find(c => c.name === currentMission.contactName)?.id;
                            if (contactId) {
                              setActiveChatId(contactId);
                              setActiveTab('chat');
                            }
                          }}
                        >
                          Discuter avec le contact
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="text-center p-12 border rounded-lg bg-muted/10">
                  <p className="text-lg mb-2">Aucune mission en cours</p>
                  <p className="text-muted-foreground">
                    Consultez votre boîte de réception pour trouver des missions à accomplir
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="terminal" className="m-0 h-full">
            <div className="p-4 bg-black text-green-400 font-mono h-full">
              <div className="mb-2">
                <p>{`${companyName} Terminal v1.0`}</p>
                <p>Tapez 'help' pour voir les commandes disponibles</p>
              </div>
              <div className="mb-2">
                <p>{`${userName || 'user'}@${companyName.toLowerCase().replace(/\s+/g, '-')}:~$ help`}</p>
                <p>Commandes disponibles:</p>
                <p>  whoami     - Affiche les informations sur l'utilisateur</p>
                <p>  ls         - Liste les fichiers dans le répertoire courant</p>
                <p>  cat        - Affiche le contenu d'un fichier</p>
                <p>  cd         - Change de répertoire</p>
                <p>  mission    - Affiche les détails de la mission en cours</p>
                <p>  clear      - Efface l'écran</p>
              </div>
              <div>
                <p>{`${userName || 'user'}@${companyName.toLowerCase().replace(/\s+/g, '-')}:~$ whoami`}</p>
                <p>{`Nom: ${userName || 'Agent'}`}</p>
                <p>{`Rôle: ${playerRole || 'Analyste'}`}</p>
                <p>{`Niveau: ${difficultyLevel || 'Débutant'}`}</p>
                <p>{`${userName || 'user'}@${companyName.toLowerCase().replace(/\s+/g, '-')}:~$ _`}<span className="animate-pulse">|</span></p>
              </div>
            </div>
          </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}