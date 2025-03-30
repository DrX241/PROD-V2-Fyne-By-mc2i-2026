import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScenarioContact } from "@shared/schema";
import { useChatContext } from "../../contexts/ChatContext";
import { MessageSquare, Users } from "lucide-react";

export default function ContactSelector() {
  const { scenario, activateChatRoom } = useChatContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  
  // Récupérer les contacts actifs du scénario
  const contacts = scenario.activeContacts || 
    (scenario.activeScenario?.contacts ? 
      scenario.activeScenario.contacts : []);
  
  if (!contacts || contacts.length === 0) {
    return null;
  }
  
  const handleContactSelect = (contactId: string) => {
    setSelectedContacts(prev => {
      if (prev.includes(contactId)) {
        return prev.filter(id => id !== contactId);
      } else {
        return [...prev, contactId];
      }
    });
  };
  
  const handleStartChatRoom = () => {
    if (selectedContacts.length >= 2) {
      activateChatRoom(selectedContacts);
      setIsDialogOpen(false);
      setSelectedContacts([]);
    }
  };
  
  return (
    <>
      <div className="flex items-center gap-1 mb-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Contacts:
        </span>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 px-2">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-xs">Message direct</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {contacts.map((contact: ScenarioContact) => (
              <ContactMenuItem key={contact.id} contact={contact} />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {contacts.length >= 2 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2"
            onClick={() => setIsDialogOpen(true)}
          >
            <Users className="h-4 w-4 mr-1" />
            <span className="text-xs">Conversation groupe</span>
          </Button>
        )}
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer une conversation de groupe</DialogTitle>
            <DialogDescription>
              Sélectionnez au moins 2 participants pour démarrer une discussion de groupe.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 my-4">
            {contacts.map((contact: ScenarioContact) => (
              <div key={contact.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`contact-${contact.id}`}
                  checked={selectedContacts.includes(contact.id)}
                  onCheckedChange={() => handleContactSelect(contact.id)}
                />
                <Label htmlFor={`contact-${contact.id}`} className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback>
                      {contact.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{contact.name}</span>
                  <span className="text-xs text-gray-500">({contact.department})</span>
                </Label>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button 
              onClick={handleStartChatRoom}
              disabled={selectedContacts.length < 2}
            >
              Démarrer la conversation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ContactMenuItem({ contact }: { contact: ScenarioContact }) {
  const { sendMessageToContact } = useChatContext();
  
  const handleClick = () => {
    // Démarre une conversation directe avec ce contact
    // Pour l'exemple, nous allons simplement afficher un message de salutation
    sendMessageToContact(`Bonjour ${contact.name}, je souhaiterais discuter avec vous du projet.`, contact.id);
  };
  
  const initials = contact.name
    .split(" ")
    .map((part: string) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  
  return (
    <DropdownMenuItem onClick={handleClick} className="cursor-pointer flex items-center gap-2">
      <Avatar className="h-6 w-6">
        <AvatarImage src={contact.avatar} alt={contact.name} />
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm">{contact.name}</span>
        <span className="text-xs text-gray-500">{contact.role}</span>
      </div>
    </DropdownMenuItem>
  );
}