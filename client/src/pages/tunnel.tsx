import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, ArrowRight, RefreshCw } from "lucide-react";

const TunnelPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [scenarioTypes, setScenarioTypes] = useState<{ id: string, name: string }[]>([]);
  const [role, setRole] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [sector, setSector] = useState<string>("");
  const [scenarioType, setScenarioType] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [currentSituation, setCurrentSituation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [decisionPath, setDecisionPath] = useState<string[]>([]);
  
  // Récupérer les types de scénarios au chargement
  useEffect(() => {
    const fetchScenarioTypes = async () => {
      try {
        const response = await fetch('/api/tunnel/scenario-types');
        const data = await response.json();
        setScenarioTypes(data.scenarioTypes);
      } catch (error) {
        console.error('Error fetching scenario types:', error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les types de scénarios",
          variant: "destructive",
        });
      }
    };
    
    fetchScenarioTypes();
  }, [toast]);
  
  // Initialiser une session
  const initializeSession = async () => {
    if (!role || !level || !sector || !scenarioType) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      const response = await apiRequest('/api/tunnel/initialize', {
        method: 'POST',
        data: { role, level, sector, scenarioType }
      });
      
      setSessionId(response.sessionId);
      setCurrentSituation(response.initialSituation);
      setDecisionPath([response.initialSituation.id]);
      setMessages([
        {
          id: 'welcome',
          type: 'system',
          content: `Bienvenue dans le module EFFET TUNNEL. Vous incarnez un(e) ${role} avec un niveau ${level} dans le secteur ${sector}.`
        },
        {
          id: 'situation-' + response.initialSituation.id,
          type: 'situation',
          content: response.initialSituation
        }
      ]);
      setInitialized(true);
    } catch (error) {
      console.error('Error initializing session:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'initialiser la session",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Faire un choix
  const makeDecision = async (optionId: string) => {
    if (!sessionId || !currentSituation) return;
    
    setLoading(true);
    try {
      // Ajouter le choix aux messages
      const selectedOption = currentSituation.options.find((opt: any) => opt.id === optionId);
      setMessages(prev => [
        ...prev,
        {
          id: 'choice-' + optionId,
          type: 'user-choice',
          content: selectedOption
        }
      ]);
      
      const response = await apiRequest('/api/tunnel/make-decision', {
        method: 'POST',
        data: { sessionId, optionId }
      });
      
      // Si c'est la fin du scénario
      if (response.isFinal) {
        setMessages(prev => [
          ...prev,
          {
            id: 'situation-final',
            type: 'situation',
            content: response.situation || { 
              title: "Fin du scénario", 
              description: "Vous avez terminé ce scénario." 
            }
          },
          {
            id: 'debriefing',
            type: 'tutorial',
            content: response.debriefing
          }
        ]);
      } else {
        // Ajouter le tutoriel si disponible
        if (response.situation.tutorialContent) {
          setMessages(prev => [
            ...prev,
            {
              id: 'tutorial-' + response.situation.id,
              type: 'tutorial',
              content: response.situation.tutorialContent
            }
          ]);
        }
        
        // Ajouter la nouvelle situation
        setMessages(prev => [
          ...prev,
          {
            id: 'situation-' + response.situation.id,
            type: 'situation',
            content: response.situation
          }
        ]);
        
        setCurrentSituation(response.situation);
        setDecisionPath(response.decisionPath);
      }
    } catch (error) {
      console.error('Error making decision:', error);
      toast({
        title: "Erreur",
        description: "Impossible de traiter votre choix",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Réinitialiser le scénario
  const resetScenario = async () => {
    if (!sessionId) return;
    
    setLoading(true);
    try {
      const response = await apiRequest('/api/tunnel/reset-scenario', {
        method: 'POST',
        data: { sessionId }
      });
      
      setCurrentSituation(response.situation);
      setDecisionPath(response.decisionPath);
      setMessages([
        {
          id: 'reset',
          type: 'system',
          content: "Le scénario a été réinitialisé."
        },
        {
          id: 'situation-' + response.situation.id,
          type: 'situation',
          content: response.situation
        }
      ]);
    } catch (error) {
      console.error('Error resetting scenario:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser le scénario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Réinitialiser la session
  const resetSession = () => {
    setSessionId("");
    setCurrentSituation(null);
    setMessages([]);
    setDecisionPath([]);
    setInitialized(false);
  };
  
  // Interface de configuration initiale
  if (!initialized) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Module EFFET TUNNEL</h1>
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Configuration du scénario</CardTitle>
            <CardDescription>
              Dans ce module, vous incarnerez un rôle professionnel face à des situations de cybersécurité où chaque décision influence la suite du parcours.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Votre rôle professionnel</Label>
              <Select
                value={role}
                onValueChange={setRole}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RSSI">RSSI</SelectItem>
                  <SelectItem value="DSI">DSI</SelectItem>
                  <SelectItem value="Administrateur Systèmes">Administrateur Systèmes</SelectItem>
                  <SelectItem value="Administrateur Réseau">Administrateur Réseau</SelectItem>
                  <SelectItem value="Analyste SOC">Analyste SOC</SelectItem>
                  <SelectItem value="Chef de Projet IT">Chef de Projet IT</SelectItem>
                  <SelectItem value="DPO">DPO</SelectItem>
                  <SelectItem value="Juriste">Juriste</SelectItem>
                  <SelectItem value="Directeur Communication">Directeur Communication</SelectItem>
                  <SelectItem value="Responsable RH">Responsable RH</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="level">Niveau d'expertise</Label>
              <Select
                value={level}
                onValueChange={setLevel}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre niveau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Débutant">Débutant</SelectItem>
                  <SelectItem value="Intermédiaire">Intermédiaire</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sector">Secteur d'activité</Label>
              <Select
                value={sector}
                onValueChange={setSector}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le secteur" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Banque/Finance">Banque/Finance</SelectItem>
                  <SelectItem value="Santé">Santé</SelectItem>
                  <SelectItem value="Industrie">Industrie</SelectItem>
                  <SelectItem value="Administration Publique">Administration Publique</SelectItem>
                  <SelectItem value="Energie">Energie</SelectItem>
                  <SelectItem value="Retail/E-commerce">Retail/E-commerce</SelectItem>
                  <SelectItem value="Transport/Logistique">Transport/Logistique</SelectItem>
                  <SelectItem value="Education">Education</SelectItem>
                  <SelectItem value="Services">Services</SelectItem>
                  <SelectItem value="Télécommunication">Télécommunication</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="scenario">Type de scénario</Label>
              <Select
                value={scenarioType}
                onValueChange={setScenarioType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez le type de scénario" />
                </SelectTrigger>
                <SelectContent>
                  {scenarioTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              onClick={initializeSession}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initialisation en cours...
                </>
              ) : (
                <>
                  Commencer l'expérience
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Interface du scénario
  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">EFFET TUNNEL</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={resetScenario}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Réinitialiser le scénario
          </Button>
          <Button 
            variant="secondary" 
            onClick={resetSession}
            disabled={loading}
          >
            Nouvelle session
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-8">
        {/* Panneau latéral avec informations */}
        <div className="col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Votre profil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rôle</p>
                <p className="font-medium">{role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Niveau</p>
                <p className="font-medium">{level}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Secteur</p>
                <p className="font-medium">{sector}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Parcours</CardTitle>
              <CardDescription>Vos décisions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {decisionPath.length === 1 ? (
                  <p>Vous commencez votre aventure...</p>
                ) : (
                  <ul className="space-y-2">
                    {decisionPath.map((situationId, index) => (
                      <li key={situationId} className="flex items-center">
                        <span className="mr-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                          {index + 1}
                        </span>
                        <span className="text-sm truncate">
                          Étape {index + 1}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Contenu principal */}
        <div className="col-span-3 space-y-6">
          {/* Affichage des messages */}
          <div className="space-y-6">
            {messages.map(message => {
              switch (message.type) {
                case 'system':
                  return (
                    <div key={message.id} className="bg-muted p-4 rounded-lg">
                      <p>{message.content}</p>
                    </div>
                  );
                case 'situation':
                  const situation = message.content;
                  return (
                    <Card key={message.id} className="border-primary/20">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>{situation.title}</CardTitle>
                          <div className="text-sm text-muted-foreground">
                            {situation.expertName && (
                              <span>{situation.expertName} - {situation.expertRole}</span>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none dark:prose-invert">
                          <p>{situation.description}</p>
                        </div>
                      </CardContent>
                      {situation.options && situation.options.length > 0 && (
                        <CardFooter className="flex flex-col gap-2">
                          <p className="text-sm font-medium mb-2 w-full">Options disponibles:</p>
                          <div className="grid grid-cols-1 gap-2 w-full">
                            {situation.options.map((option: any) => (
                              <Button
                                key={option.id}
                                onClick={() => makeDecision(option.id)}
                                disabled={loading}
                                className="justify-start h-auto py-3 px-4"
                                variant="outline"
                              >
                                <div className="text-left">
                                  <p className="font-medium">{option.text}</p>
                                  <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                                </div>
                              </Button>
                            ))}
                          </div>
                        </CardFooter>
                      )}
                    </Card>
                  );
                case 'user-choice':
                  const option = message.content;
                  return (
                    <div key={message.id} className="bg-primary/10 p-4 rounded-lg ml-12">
                      <p className="font-medium mb-1">Vous avez choisi:</p>
                      <p>{option.text}: {option.description}</p>
                    </div>
                  );
                case 'tutorial':
                  return (
                    <Card key={message.id} className="border-amber-500/20 bg-amber-50/10">
                      <CardHeader>
                        <CardTitle className="text-amber-600 flex items-center">
                          <span className="mr-2">📚</span> Note pédagogique
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="prose max-w-none dark:prose-invert">
                          <p>{message.content}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                default:
                  return null;
              }
            })}
          </div>
          
          {/* Loader pour les actions en cours */}
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TunnelPage;