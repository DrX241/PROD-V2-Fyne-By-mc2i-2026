import React, { useState, useEffect } from 'react';
import { useChatContext } from '@/contexts/ChatContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import ChatInterface from '@/components/cyber/ChatInterface';
import { AvatarDisplay } from '@/components/cyber/AvatarCreator';
import { Mail, MessageSquare, ArrowLeftCircle } from 'lucide-react';

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar: string;
  hasNewMessage?: boolean;
  initialMessage?: string;
}

interface MultiPNJChatProps {
  onBack?: () => void;
}

export default function MultiPNJChat({ onBack }: MultiPNJChatProps) {
  const { userName, playerRole, avatarId, difficultyLevel, currentMission } = useChatContext();
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 'hr-isabelle',
      name: 'Isabelle Dubacq',
      role: 'Directrice des Ressources Humaines',
      avatar: 'avatar1', 
      initialMessage: `Bonjour ${userName || 'Agent'} !\n\nJe suis ravie de vous accueillir dans notre équipe de Cyber Secure Solutions. D'après votre profil de ${playerRole || 'spécialiste'} et votre niveau ${difficultyLevel || 'Intermédiaire'} en cybersécurité, vous êtes parfaitement qualifié(e) pour nos missions.\n\nJe vais vous mettre en contact avec plusieurs de nos experts qui vous guideront dans différents types de missions. N'hésitez pas à me contacter pour toute question administrative.\n\nBonne chance dans vos missions !`
    }
  ]);

  // Ajouter automatiquement un contact lié à la mission en cours si disponible
  useEffect(() => {
    if (currentMission && !contacts.some(c => c.id === `mission-${currentMission.id}`)) {
      setContacts(prev => [
        ...prev,
        {
          id: `mission-${currentMission.id}`,
          name: currentMission.contactName,
          role: currentMission.contactRole,
          avatar: currentMission.contactAvatar,
          hasNewMessage: true,
          initialMessage: `Bonjour ${userName || 'Agent'},\n\nJe suis responsable de la mission "${currentMission.title}" classifiée ${currentMission.difficulty}.\n\nVoici les détails de votre mission :\n${currentMission.description}\n\nComment souhaitez-vous procéder ?`
        }
      ]);
    }
  }, [currentMission, userName]);

  // Définir le contact actif par défaut
  useEffect(() => {
    if (contacts.length > 0 && !activeContactId) {
      setActiveContactId(contacts[0].id);
    }
  }, [contacts, activeContactId]);

  const handleSelectContact = (contactId: string) => {
    setActiveContactId(contactId);
    setContacts(prev => 
      prev.map(contact => 
        contact.id === contactId 
          ? { ...contact, hasNewMessage: false } 
          : contact
      )
    );
  };

  const handleCloseChat = () => {
    setActiveContactId(null);
  };

  const activeContact = contacts.find(c => c.id === activeContactId);

  return (
    <div className="container mx-auto mt-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Interface de Simulation</h1>
          <p className="text-muted-foreground">
            Communiquez avec les différents interlocuteurs de votre mission
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-medium">{userName || 'Agent'}</div>
            <div className="text-sm text-muted-foreground">{playerRole || 'Spécialiste Cyber'}</div>
          </div>
          <AvatarDisplay avatarId={avatarId || 'avatar1'} size="lg" />
        </div>
      </div>

      {currentMission && (
        <Card className="mb-4 bg-muted/30">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">{currentMission.title}</h2>
                <p className="text-sm text-muted-foreground">{currentMission.domain}</p>
              </div>
              <Badge variant="outline">{currentMission.difficulty}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1">
          <div className="rounded-lg border bg-card shadow-sm">
            <div className="p-2 font-medium border-b">
              Contacts
            </div>
            <div className="p-2 space-y-2">
              {contacts.map(contact => (
                <div 
                  key={contact.id}
                  className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted transition-colors ${activeContactId === contact.id ? 'bg-muted' : ''}`}
                  onClick={() => handleSelectContact(contact.id)}
                >
                  <div className="relative">
                    <AvatarDisplay avatarId={contact.avatar} size="md" />
                    {contact.hasNewMessage && (
                      <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-background"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{contact.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{contact.role}</div>
                  </div>
                  {contact.id.startsWith('mission-') ? (
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full mt-4"
            onClick={onBack}
          >
            <ArrowLeftCircle className="mr-2 h-4 w-4" />
            Retour aux missions
          </Button>
        </div>

        <div className="md:col-span-3">
          {activeContact ? (
            <ChatInterface
              contactName={activeContact.name}
              contactRole={activeContact.role}
              contactAvatar={activeContact.avatar}
              userAvatar={avatarId || 'avatar1'}
              userName={userName || 'Agent'}
              userRole={playerRole || 'Spécialiste Cyber'}
              onClose={handleCloseChat}
              initialMessage={activeContact.initialMessage}
              height="h-[700px]"
            />
          ) : (
            <div className="h-[600px] rounded-lg border bg-card shadow-sm flex items-center justify-center">
              <div className="text-center p-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium">Aucune conversation sélectionnée</h3>
                <p className="text-muted-foreground">
                  Sélectionnez un contact pour commencer une conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}