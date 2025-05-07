import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Check, Flag, Mail, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Interface pour un email dans le défi
interface Email {
  id: number;
  subject: string;
  sender: string;
  content: string;
  isPhishing: boolean;
}

// Interface pour les props du composant
interface PhishingChallengeProps {
  emails: Email[];
  correctPhishingIds: number[];
  onComplete: (success: boolean) => void;
  onTimeChange: (seconds: number) => void;
  timeReward: number;
  timePenalty: number;
}

const PhishingChallenge: React.FC<PhishingChallengeProps> = ({
  emails,
  correctPhishingIds,
  onComplete,
  onTimeChange,
  timeReward,
  timePenalty
}) => {
  const [flaggedEmails, setFlaggedEmails] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState(`email-${emails[0].id}`);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  // Gérer le flag/unflag d'un email
  const handleFlag = (emailId: number) => {
    if (submitted) return; // Ne pas permettre de changer après soumission
    
    setFlaggedEmails(prev => {
      if (prev.includes(emailId)) {
        return prev.filter(id => id !== emailId);
      } else {
        return [...prev, emailId];
      }
    });
  };

  // Vérifier les réponses
  const handleSubmit = () => {
    // Vérifier si tous les emails de phishing ont été correctement identifiés
    const correctlyFlagged = correctPhishingIds.every(id => flaggedEmails.includes(id));
    // Vérifier si aucun email légitime n'a été flaggé par erreur
    const noFalsePositives = flaggedEmails.every(id => correctPhishingIds.includes(id));
    
    const success = correctlyFlagged && noFalsePositives;
    
    if (success) {
      toast({
        title: "Analyse correcte !",
        description: `Vous avez correctement identifié tous les emails de phishing. +${timeReward} secondes !`,
        variant: "default",
      });
      onTimeChange(timeReward); // Ajouter du temps
    } else {
      toast({
        title: "Analyse incorrecte",
        description: `Vous n'avez pas identifié correctement les emails de phishing. -${timePenalty} secondes.`,
        variant: "destructive",
      });
      onTimeChange(-timePenalty); // Soustraire du temps
    }
    
    setSubmitted(true);
    onComplete(success);
  };

  // Réinitialiser le défi
  const handleReset = () => {
    setFlaggedEmails([]);
    setSubmitted(false);
  };

  return (
    <Card className="border-yellow-500 bg-black/80 text-white">
      <CardHeader className="border-b border-yellow-800/50 bg-yellow-950/30">
        <CardTitle className="text-xl flex items-center text-yellow-400">
          <Mail className="mr-2 h-5 w-5" />
          Défi de détection de phishing
        </CardTitle>
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-8 h-auto bg-black/50 p-1">
          {emails.map(email => (
            <TabsTrigger 
              key={`email-${email.id}`}
              value={`email-${email.id}`}
              className={`px-2 py-1 text-xs ${
                submitted ? 
                  (email.isPhishing ? 'data-[state=active]:bg-red-900/70' : 'data-[state=active]:bg-green-900/70') : 
                  'data-[state=active]:bg-blue-900/70'
              }`}
            >
              {email.id}
              {flaggedEmails.includes(email.id) && (
                <Flag className="h-3 w-3 ml-1 text-red-500" />
              )}
              {submitted && (
                email.isPhishing ? 
                  <AlertTriangle className="h-3 w-3 ml-1 text-yellow-500" /> :
                  <Check className="h-3 w-3 ml-1 text-green-500" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {emails.map(email => (
          <TabsContent key={`content-${email.id}`} value={`email-${email.id}`} className="p-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                <div>
                  <h3 className="font-medium">Sujet: <span className="text-gray-300">{email.subject}</span></h3>
                  <p className="text-sm text-gray-400">De: {email.sender}</p>
                </div>
                <div className="flex items-center gap-2">
                  {submitted && (
                    email.isPhishing ? 
                      <Badge variant="destructive" className="flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" /> Malveillant
                      </Badge> :
                      <Badge variant="default" className="bg-green-700 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Légitime
                      </Badge>
                  )}
                  <Button 
                    size="sm" 
                    variant={flaggedEmails.includes(email.id) ? "destructive" : "outline"}
                    className={`${
                      flaggedEmails.includes(email.id) ? 'bg-red-900 text-white' : 'text-gray-300'
                    } hover:bg-red-800`}
                    onClick={() => handleFlag(email.id)}
                    disabled={submitted}
                  >
                    <Flag className="h-4 w-4 mr-1" />
                    {flaggedEmails.includes(email.id) ? 'Marqué' : 'Marquer'}
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-gray-900/30 rounded border border-gray-800 text-gray-300">
                {email.content}
              </div>
              
              {submitted && (
                <div className={`p-3 rounded ${
                  email.isPhishing ? 'bg-red-900/20 border border-red-800' : 'bg-green-900/20 border border-green-800'
                }`}>
                  <h4 className="font-medium mb-1 flex items-center">
                    {email.isPhishing ? (
                      <>
                        <AlertTriangle className="h-4 w-4 mr-1 text-red-400" />
                        <span className="text-red-400">Analyse de sécurité : Email malveillant</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-1 text-green-400" />
                        <span className="text-green-400">Analyse de sécurité : Email légitime</span>
                      </>
                    )}
                  </h4>
                  <p className="text-sm">
                    {email.isPhishing ? (
                      `Cet email est une tentative de phishing. Points d'attention: ${
                        email.sender.includes('@') && !email.sender.endsWith('.com') && !email.sender.endsWith('.fr') ? 
                          "domaine suspect, " : ""
                      }${
                        email.content.includes('http://') ? 
                          "URL non sécurisée, " : ""
                      }${
                        email.subject.includes('URGENT') ? 
                          "création d'urgence artificielle, " : ""
                      }demande d'informations personnelles ou financières.`
                    ) : (
                      "Cet email est légitime. Il provient d'une source fiable, n'utilise pas de techniques de manipulation et ne comporte pas de liens suspects."
                    )}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      
      <CardFooter className="flex justify-between border-t border-gray-800 p-4">
        <Button 
          variant="ghost" 
          onClick={handleReset}
          disabled={!submitted}
        >
          <X className="h-4 w-4 mr-1" />
          Réinitialiser
        </Button>
        
        <Button 
          variant="default" 
          className="bg-yellow-600 hover:bg-yellow-700"
          onClick={handleSubmit}
          disabled={submitted}
        >
          <Check className="h-4 w-4 mr-1" />
          Soumettre l'analyse
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PhishingChallenge;