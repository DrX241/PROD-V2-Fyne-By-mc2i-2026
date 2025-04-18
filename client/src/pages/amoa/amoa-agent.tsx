import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import AmoaLayout from "@/components/layout/AmoaLayout";
import ChatInterface from "@/components/cyber/ChatInterface";
import PageTitle from "@/components/utils/PageTitle";
import { Link } from "wouter";
import { ArrowLeft, Clock, Mail, Send } from "lucide-react";
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

// Schéma de formulaire pour la configuration de la session Expert AMOA Conversationnel
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

export default function AmoaAgentPage() {
  const { toast } = useToast();
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes en secondes
  const [messages, setMessages] = useState<any[]>([]);
  const [sessionData, setSessionData] = useState<any>(null);
  const startTimeRef = useRef<number>(0);

  // Configurer le formulaire
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userEmail: "",
      userName: "",
    },
  });

  // Fonction pour démarrer la session
  const startSession = async (values: FormValues) => {
    try {
      // Utiliser fetch pour la requête API
      const fetchResponse = await fetch('/api/amoa/agent/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          userEmail: values.userEmail,
          userName: values.userName
        })
      });
      
      console.log("Status:", fetchResponse.status);
      console.log("Content-Type:", fetchResponse.headers.get('Content-Type'));
      
      // Essayer de lire le corps de la réponse comme JSON
      let response;
      try {
        const contentType = fetchResponse.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          response = await fetchResponse.json();
          console.log("Response JSON:", response);
        } else {
          const text = await fetchResponse.text();
          console.log("Response TEXT (first 100 chars):", text.substring(0, 100));
          toast({
            variant: "destructive",
            title: "Erreur de format",
            description: "La réponse du serveur n'est pas au format JSON attendu.",
          });
          return;
        }
      } catch (parseError) {
        console.error("Erreur lors du parsing de la réponse:", parseError);
        toast({
          variant: "destructive",
          title: "Erreur de parsing",
          description: "Impossible de lire la réponse du serveur.",
        });
        return;
      }

      if (response && response.success) {
        setSessionData({
          userEmail: values.userEmail,
          userName: values.userName,
          startTime: Date.now()
        });
        setIsSessionActive(true);
        startTimeRef.current = Date.now();
        setMessages(response.data.initialMessages || []);

        toast({
          title: "Session démarrée",
          description: "Votre session Expert AMOA Conversationnel a démarré. Un rapport sera envoyé à votre email à la fin.",
        });
      } else {
        console.warn("Réponse sans succès:", response);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: response?.error || "Impossible de démarrer la session. Veuillez réessayer.",
        });
      }
    } catch (error) {
      console.error("Erreur lors du démarrage de la session:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de démarrer la session. Veuillez réessayer.",
      });
    }
  };

  // Fonction pour terminer la session et envoyer le rapport
  const completeSession = async () => {
    if (!sessionData) return;

    const duration = Date.now() - startTimeRef.current;
    
    try {
      // Utiliser fetch pour la requête API
      const fetchResponse = await fetch('/api/amoa/agent/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          userEmail: sessionData.userEmail,
          userName: sessionData.userName,
          messages, // Historique complet des messages
          duration // Durée en millisecondes
        })
      });
      
      console.log("Complete Status:", fetchResponse.status);
      console.log("Complete Content-Type:", fetchResponse.headers.get('Content-Type'));
      
      // Essayer de lire le corps de la réponse comme JSON
      let response;
      try {
        const contentType = fetchResponse.headers.get('Content-Type');
        if (contentType && contentType.includes('application/json')) {
          response = await fetchResponse.json();
          console.log("Complete Response JSON:", response);
        } else {
          const text = await fetchResponse.text();
          console.log("Complete Response TEXT (first 100 chars):", text.substring(0, 100));
          toast({
            variant: "destructive",
            title: "Erreur de format",
            description: "La réponse du serveur n'est pas au format JSON attendu.",
          });
          return;
        }
      } catch (parseError) {
        console.error("Erreur lors du parsing de la réponse (complete):", parseError);
        toast({
          variant: "destructive",
          title: "Erreur de parsing",
          description: "Impossible de lire la réponse du serveur.",
        });
        return;
      }

      if (response && response.success) {
        toast({
          title: "Session terminée",
          description: "Un rapport détaillé a été envoyé à votre adresse email.",
        });

        // Réinitialiser la session
        setIsSessionActive(false);
        setTimeRemaining(600);
        setMessages([]);
        setSessionData(null);
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
            completeSession();
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
    <AmoaLayout>
      <PageTitle title="EXPERT AMOA CONVERSATIONNEL" />
      <div className="mb-2 px-4 sm:px-6 flex items-center justify-between">
        <Link href="/amoa" className="inline-flex items-center text-[#46cada] hover:text-blue-600 transition-colors">
          <ArrowLeft className="mr-2 h-5 w-5" />
          Retour à IAM mc2i
        </Link>
        
        {isSessionActive && (
          <div className="flex items-center text-white bg-blue-600/80 px-3 py-1 rounded-full">
            <Clock className="mr-2 h-4 w-4" />
            <span className="font-mono">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>

      {!isSessionActive ? (
        <div className="max-w-md mx-auto mt-8">
          <Card className="bg-gradient-to-br from-blue-950 to-indigo-900 text-white border-blue-800">
            <CardHeader>
              <CardTitle className="text-xl text-center">Démarrez votre session Expert AMOA Conversationnel</CardTitle>
              <CardDescription className="text-blue-200 text-center">
                Un rapport détaillé sera envoyé à votre email à la fin de la session de 10 minutes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(startSession)} className="space-y-6">
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
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="mr-2 h-4 w-4" />
                    Démarrer la session
                  </Button>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="text-xs text-center text-blue-300 justify-center">
              <p>La session durera 10 minutes. Vous recevrez un rapport détaillé par email.</p>
            </CardFooter>
          </Card>
        </div>
      ) : (
        <ChatInterface
          apiEndpoint="/api/amoa/agent/chat"
          initialMessages={messages}
          onMessagesUpdate={handleMessagesUpdate}
        />
      )}
    </AmoaLayout>
  );
}