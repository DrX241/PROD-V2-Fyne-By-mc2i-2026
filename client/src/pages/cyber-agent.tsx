import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import CyberLayout from "@/components/layout/CyberLayout";
import ChatInterface from "@/components/cyber/ChatInterface";
import PageTitle from "@/components/utils/PageTitle";
import { Link } from "wouter";
import { ArrowLeft, Clock, Mail, Send, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Schéma de formulaire pour la configuration de la session Agent IA
const formSchema = z.object({
  userEmail: z.string().email({
    message: "Veuillez entrer une adresse email valide.",
  }),
  userName: z.string().min(2, {
    message: "Votre nom doit contenir au moins 2 caractères.",
  }),
});

// Type d'inférence pour le schéma de formulaire
type FormValues = z.infer<typeof formSchema>;

export default function CyberAgentPage() {
  const { toast } = useToast();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes en secondes
  const [messages, setMessages] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const startTimeRef = useRef<number>(0);

  // Configurer le formulaire
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userEmail: "",
      userName: "",
    },
  });
  
  // Fonction pour démarrer la session sans email (sera demandé à la fin)
  const startSession = () => {
    try {
      setIsSessionActive(true);
      startTimeRef.current = Date.now();
      setSessionData({ startTime: Date.now() });

      toast({
        title: "Session démarrée",
        description: "Votre session avec votre Agent IA a démarré.",
      });
    } catch (error) {
      console.error("Erreur lors du démarrage de la session:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de démarrer la session. Veuillez réessayer.",
      });
    }
  };

  // Fonction pour terminer la session et montrer le formulaire d'email
  const endSession = () => {
    setShowEndDialog(true);
  };

  // Fonction pour envoyer le rapport
  const sendReport = async (values: FormValues) => {
    if (isSubmittingReport) return;
    
    setIsSubmittingReport(true);
    const duration = Date.now() - startTimeRef.current;
    
    try {
      const fetchResponse = await fetch('/api/cyber/agent/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          userEmail: values.userEmail,
          userName: values.userName,
          messages, // Historique complet des messages
          duration // Durée en millisecondes
        })
      });
      
      console.log("Complete Status:", fetchResponse.status);
      
      // Essayer de lire le corps de la réponse comme JSON
      let response;
      try {
        const contentType = fetchResponse.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          response = await fetchResponse.json();
        } else {
          const text = await fetchResponse.text();
          console.log("Complete Response TEXT (first 100 chars):", text.substring(0, 100));
          toast({
            variant: "destructive",
            title: "Erreur de format",
            description: "La réponse du serveur n'est pas au format JSON attendu.",
          });
          setIsSubmittingReport(false);
          return;
        }
      } catch (parseError) {
        console.error("Erreur lors du parsing de la réponse (complete):", parseError);
        toast({
          variant: "destructive",
          title: "Erreur de parsing",
          description: "Impossible de lire la réponse du serveur.",
        });
        setIsSubmittingReport(false);
        return;
      }

      if (response && response.success) {
        toast({
          title: "Rapport envoyé",
          description: "Un rapport détaillé a été envoyé à votre adresse email.",
        });

        // Réinitialiser la session
        setIsSessionActive(false);
        setTimeRemaining(600);
        setMessages([]);
        setSessionData(null);
        setShowEndDialog(false);
      } else {
        console.warn("Réponse sans succès (complete):", response);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: response?.error || "Impossible d'envoyer le rapport. Veuillez contacter le support.",
        });
      }
    } catch (error) {
      console.error("Erreur lors de la finalisation de la session:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'envoyer le rapport. Veuillez contacter le support.",
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  // Effet pour le compte à rebours
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isSessionActive && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            endSession(); // Afficher le formulaire d'email à la fin au lieu d'envoyer automatiquement
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSessionActive, timeRemaining]);

  // Formater le temps restant
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Gestion des messages
  const handleMessagesUpdate = (newMessages: any[]) => {
    setMessages(newMessages);
  };

  return (
    <CyberLayout>
      <PageTitle title="AGENT IA CONVERSATIONNEL" />
      <div className="mb-2 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 bg-gray-950/80 backdrop-blur-sm py-2 shadow-md">
        <Link href="/cyber" className="inline-flex items-center text-[#46cada] hover:text-blue-600 transition-colors">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Retour à ESPACE CYBER
        </Link>
        
        <div className="flex items-center text-white bg-blue-600/80 px-3 py-1 rounded-full">
          <Clock className="mr-2 h-4 w-4" />
          <span className="font-mono">{isSessionActive ? formatTime(timeRemaining) : "10:00"}</span>
        </div>
      </div>

      {!isSessionActive ? (
        <div className="max-w-md mx-auto mt-8">
          <Card className="bg-gradient-to-br from-blue-950 to-indigo-900 text-white border-blue-800">
            <CardHeader>
              <CardTitle className="text-xl text-center">Démarrez votre session avec votre Agent IA</CardTitle>
              <CardDescription className="text-blue-200 text-center">
                Discutez avec un agent IA spécialisé pendant 10 minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button 
                onClick={startSession} 
                className="bg-blue-600 hover:bg-blue-700 px-6 py-6 text-lg"
              >
                <Send className="mr-2 h-5 w-5" />
                Démarrer la session
              </Button>
            </CardContent>
            <CardFooter className="text-xs text-center text-blue-300 justify-center">
              <p>La session durera 10 minutes. Vous pourrez recevoir un rapport détaillé par email à la fin.</p>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <ChatInterface onMessagesUpdate={handleMessagesUpdate} />
      )}

      {/* Dialog pour l'email en fin de session */}
      <Dialog open={showEndDialog} onOpenChange={setShowEndDialog}>
        <DialogContent className="bg-gradient-to-br from-blue-950 to-indigo-900 text-white border-blue-800">
          <DialogHeader>
            <DialogTitle className="text-xl text-center">Votre session est terminée</DialogTitle>
            <DialogDescription className="text-blue-200 text-center">
              Pour recevoir un rapport détaillé de votre conversation, veuillez saisir vos coordonnées ci-dessous.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(sendReport)} className="space-y-6 mt-4">
              <FormField
                control={form.control}
                name="userEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
                        <Input 
                          placeholder="votre.email@exemple.com" 
                          className="pl-10 bg-blue-900/50 border-blue-700 text-white" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-blue-200">Votre nom</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Prénom Nom" 
                        className="bg-blue-900/50 border-blue-700 text-white" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-center pt-2">
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 px-6"
                  disabled={isSubmittingReport}
                >
                  {isSubmittingReport ? (
                    <span className="flex items-center">
                      <Clock className="animate-spin mr-2 h-4 w-4" />
                      Envoi en cours...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Send className="mr-2 h-4 w-4" />
                      Recevoir le rapport
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
          <div className="text-xs text-center text-blue-300 mt-4">
            <p>Un rapport détaillé de votre conversation sera envoyé à l'email indiqué.</p>
          </div>
        </DialogContent>
      </Dialog>
    </CyberLayout>
  );
}