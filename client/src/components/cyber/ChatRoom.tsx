import React from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatRoomContent, ScenarioContact } from "@shared/schema";
import { useChatContext } from "../../contexts/ChatContext";
import { XCircle } from "lucide-react";

interface ChatRoomProps {
  content: ChatRoomContent;
}

export default function ChatRoom({ content }: ChatRoomProps) {
  const { deactivateChatRoom } = useChatContext();
  
  return (
    <div className="my-4 w-full">
      <Card className="p-4 border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950 shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold">Salle de discussion</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={deactivateChatRoom}
            className="text-gray-500 hover:text-gray-700"
          >
            <XCircle className="h-5 w-5 mr-1" />
            Quitter
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 mr-2">Participants:</p>
          {content.participants.map((participant: ScenarioContact) => (
            <ParticipantBadge key={participant.id} participant={participant} />
          ))}
        </div>
        
        {content.messages.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto p-2">
            {content.messages.map((message: { contactId: string; text: string; timestamp: number }, index: number) => {
              const sender = content.participants.find((p: ScenarioContact) => p.id === message.contactId);
              return (
                <ChatRoomMessage
                  key={index}
                  message={message.text}
                  sender={sender}
                  timestamp={message.timestamp}
                />
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic text-center py-3">
            Salle de discussion créée. Envoyez un message pour démarrer la conversation.
          </p>
        )}
      </Card>
    </div>
  );
}

function ParticipantBadge({ participant }: { participant: ScenarioContact }) {
  const initials = participant.name
    .split(" ")
    .map((part: string) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
    
  return (
    <Badge variant="outline" className="flex items-center gap-1 py-1 pl-1 pr-2">
      <Avatar className="h-5 w-5">
        <AvatarImage src={participant.avatar} alt={participant.name} />
        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
      </Avatar>
      <span className="text-xs">{participant.name}</span>
    </Badge>
  );
}

function ChatRoomMessage({ 
  message, 
  sender, 
  timestamp 
}: { 
  message: string; 
  sender?: ScenarioContact;
  timestamp: number;
}) {
  if (!sender) return null;
  
  const initials = sender.name
    .split(" ")
    .map((part: string) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
    
  const formattedTime = new Date(timestamp).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return (
    <div className="flex items-start gap-2">
      <Avatar className="h-7 w-7 mt-0.5">
        <AvatarImage src={sender.avatar} alt={sender.name} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-baseline gap-2">
          <span className="font-medium text-xs">{sender.name}</span>
          <span className="text-[10px] text-gray-400">{formattedTime}</span>
        </div>
        <p className="text-sm mt-0.5 whitespace-pre-line">{message}</p>
      </div>
    </div>
  );
}