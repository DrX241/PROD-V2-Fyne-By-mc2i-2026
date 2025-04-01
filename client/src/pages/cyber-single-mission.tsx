import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useChatContext } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Terminal, Puzzle, Brain, MessageSquare, ArrowLeftCircle } from 'lucide-react';
import { AvatarDisplay } from '@/components/cyber/AvatarCreator';
import TechnicalMission from '@/components/cyber/TechnicalMission';
import ArcadeMission from '@/components/cyber/ArcadeMission';
import EducationalContent from '@/components/cyber/EducationalContent';
import MultiPNJChat from '@/components/cyber/MultiPNJChat';
// Définition des types de mission directement ici car problème d'import
const MISSION_TYPES = {
  TECHNICAL: 'technical',
  ARCADE: 'arcade',
  CONVERSATION: 'conversation',
  EDUCATIONAL: 'educational'
};

export default function CyberSingleMission() {
  const [, setLocation] = useLocation();
  const { currentMission } = useChatContext();
  const [tab, setTab] = useState('mission');
  
  const handleBackToMissions = () => {
    setLocation('/cyber-missions');
  };

  if (!currentMission) {
    return (
      <div className="container mx-auto py-12">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Aucune mission n'est actuellement sélectionnée. Veuillez choisir une mission dans le centre de missions.
          </AlertDescription>
        </Alert>
        
        <Button onClick={handleBackToMissions}>
          Retour au centre de missions
        </Button>
      </div>
    );
  }

  // Obtenir l'icône selon le type de mission
  const getMissionIcon = (type: string) => {
    switch(type) {
      case MISSION_TYPES.TECHNICAL: 
        return <Terminal className="h-5 w-5" />;
      case MISSION_TYPES.ARCADE: 
        return <Puzzle className="h-5 w-5" />;
      case MISSION_TYPES.CONVERSATION: 
        return <MessageSquare className="h-5 w-5" />;
      case MISSION_TYPES.EDUCATIONAL: 
        return <Brain className="h-5 w-5" />;
      default:
        return <Terminal className="h-5 w-5" />;
    }
  };

  // Obtenir la couleur de l'étiquette selon le type de mission
  const getMissionBadgeVariant = (type: string) => {
    switch(type) {
      case MISSION_TYPES.TECHNICAL: 
        return 'destructive';
      case MISSION_TYPES.ARCADE: 
        return 'secondary';
      case MISSION_TYPES.CONVERSATION: 
        return 'outline';
      case MISSION_TYPES.EDUCATIONAL: 
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleBackToMissions}>
            <ArrowLeftCircle className="h-4 w-4 mr-2" />
            Retour aux missions
          </Button>
        </div>
        <Badge variant={getMissionBadgeVariant(currentMission.type)} className="ml-auto">
          {getMissionIcon(currentMission.type)}
          <span className="ml-1">
            {currentMission.type === MISSION_TYPES.TECHNICAL && 'Mission Technique'}
            {currentMission.type === MISSION_TYPES.ARCADE && 'Mission Arcade'}
            {currentMission.type === MISSION_TYPES.CONVERSATION && 'Mission Conversationnelle'}
            {currentMission.type === MISSION_TYPES.EDUCATIONAL && 'Mission Éducative'}
          </span>
        </Badge>
      </div>

      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{currentMission.title}</CardTitle>
            <p className="text-sm text-muted-foreground">{currentMission.domain}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{currentMission.difficulty}</Badge>
            <AvatarDisplay avatarId={currentMission.contactAvatar} size="md" />
          </div>
        </CardHeader>
        <CardContent>
          <p>{currentMission.description}</p>
          
          <div className="mt-4 flex items-center gap-2">
            <p className="text-sm font-medium">Contact :</p>
            <p className="text-sm">{currentMission.contactName}, {currentMission.contactRole}</p>
          </div>
        </CardContent>
      </Card>

      {currentMission.type === MISSION_TYPES.TECHNICAL && (
        <TechnicalMission
          title={currentMission.title}
          description={currentMission.description}
          contactName={currentMission.contactName}
          contactRole={currentMission.contactRole}
          contactAvatar={currentMission.contactAvatar}
          badgeId={currentMission.badgeId}
          badgeName={currentMission.badgeId}
          domain={currentMission.domain}
          onComplete={handleBackToMissions}
        />
      )}

      {currentMission.type === MISSION_TYPES.ARCADE && (
        <ArcadeMission
          title={currentMission.title}
          description={currentMission.description}
          contactName={currentMission.contactName}
          contactRole={currentMission.contactRole}
          contactAvatar={currentMission.contactAvatar}
          badgeId={currentMission.badgeId}
          badgeName={currentMission.badgeId}
          domain={currentMission.domain}
          onComplete={handleBackToMissions}
        />
      )}

      {currentMission.type === MISSION_TYPES.EDUCATIONAL && (
        <EducationalContent
          title={currentMission.title}
          description={currentMission.description}
          contactName={currentMission.contactName}
          contactRole={currentMission.contactRole}
          contactAvatar={currentMission.contactAvatar}
          badgeId={currentMission.badgeId}
          badgeName={currentMission.badgeId}
          domain={currentMission.domain}
          onComplete={handleBackToMissions}
        />
      )}

      {currentMission.type === MISSION_TYPES.CONVERSATION && (
        <Tabs defaultValue={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mission">Détails</TabsTrigger>
            <TabsTrigger value="chat">Conversation</TabsTrigger>
          </TabsList>
          <TabsContent value="mission" className="mt-6">
            <div className="flex items-center gap-8 bg-muted p-6 rounded-lg">
              <AvatarDisplay avatarId={currentMission.contactAvatar} size="xl" />
              <div>
                <h2 className="text-xl font-semibold mb-2">{currentMission.contactName}</h2>
                <p className="text-muted-foreground mb-4">{currentMission.contactRole}</p>
                <p>
                  "Bonjour ! Je suis en charge de cette mission et je vais vous accompagner tout au long de son exécution. 
                  N'hésitez pas à me contacter pour toute question ou préoccupation. Cliquez sur l'onglet 'Conversation' 
                  pour commencer notre dialogue."
                </p>
                <Button className="mt-4" onClick={() => setTab('chat')}>
                  Commencer la conversation
                </Button>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="chat" className="mt-6">
            <MultiPNJChat onBack={handleBackToMissions} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}