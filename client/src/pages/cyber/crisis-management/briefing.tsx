import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import HomeLayout from '@/components/layout/HomeLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowRight, Shield, Megaphone, Clock, Users, FileText, Info, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

const CrisisBriefing = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAccepting, setIsAccepting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes en secondes
  const [activeTab, setActiveTab] = useState("situation");
  
  // Timer simulé pour ajouter un sentiment d'urgence
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);
  
  // Formater le temps restant (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Exemples de parties prenantes (dirigeants mc2i)
  const keyStakeholders = [
    {
      id: "president",
      name: "Arnaud Gauthier",
      role: "Président",
      department: "Executive",
      notes: "Très préoccupé par la réputation de l'entreprise et la confiance des clients."
    },
    {
      id: "dg",
      name: "Olivier Hervo",
      role: "Directeur Général",
      department: "Executive",
      notes: "Concentré sur l'impact business global et la stratégie de réponse."
    },
    {
      id: "dga-impulse",
      name: "Guillaume Lechevallier",
      role: "DGA et Directeur du pôle IMPULSE",
      department: "IT",
      notes: "Expert technique, très préoccupé par l'infrastructure IT compromise."
    },
    {
      id: "dir-finance",
      name: "Vincent Terrier",
      role: "Senior Partner et Directeur Financier",
      department: "Executive",
      notes: "Axé sur les implications financières et les coûts de la crise."
    },
    {
      id: "dir-comm",
      name: "Marion Lopez",
      role: "Senior Partner et Directrice Communication et Marketing",
      department: "Communication",
      notes: "Préoccupée par la communication externe et la gestion d'image."
    }
  ];
  
  // Systèmes affectés par l'attaque
  const affectedSystems = [
    { name: "Système CRM", status: "Compromis", criticalityLevel: 9 },
    { name: "Serveur de messagerie", status: "À risque", criticalityLevel: 8 },
    { name: "Base de données financière", status: "Compromis", criticalityLevel: 10 },
    { name: "Serveurs de fichiers", status: "Compromis", criticalityLevel: 7 },
    { name: "Passerelle VPN", status: "À risque", criticalityLevel: 8 },
    { name: "Système ERP", status: "Compromis", criticalityLevel: 9 }
  ];
  
  // Générer un avatar pour chaque partie prenante
  const generateAvatar = (name: string, department: string) => {
    const colorMap: Record<string, string> = {
      'IT': 'blue-600',
      'Executive': 'purple-700',
      'Communication': 'green-600',
      'Legal': 'amber-700',
      'Operations': 'orange-600',
      'External': 'slate-700'
    };
    
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
    
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${colorMap[department]}&color=fff&size=128`;
  };

  const handleAccept = () => {
    setIsAccepting(true);
    
    // Marquer le briefing comme consulté
    sessionStorage.setItem('crisis_briefing_consulted', 'true');
    
    setTimeout(() => {
      toast({
        title: "Alerte de crise activée",
        description: "Votre équipe est maintenant en attente dans la salle de crise.",
        variant: "destructive",
      });
      navigate('/cyber/crisis-management');
    }, 1000);
  };

  return (
    <HomeLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-red-500 flex items-center">
            <AlertTriangle className="w-10 h-10 mr-3 animate-pulse" />
            ALERTE DE CYBERSÉCURITÉ CRITIQUE
          </h1>
          <div className="flex items-center mt-2">
            <Badge className="bg-red-800">NIVEAU: CRITIQUE</Badge>
            <Badge className="ml-2 bg-gray-800">TYPE: RANSOMWARE</Badge>
            <Badge className="ml-2 bg-gray-800">MODE: SIMULATION</Badge>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border-red-900/40 mb-8 overflow-hidden">
          <CardHeader className="border-b border-gray-800 bg-gradient-to-r from-red-950/30 to-gray-900/90">
            <CardTitle className="text-2xl text-red-100">Briefing de mission</CardTitle>
            <CardDescription className="text-gray-300">
              CONFIDENTIEL - DESTINÉ AU RSSI (RESPONSABLE SÉCURITÉ DES SYSTÈMES D'INFORMATION)
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <div className="border-l-4 border-red-700 pl-4 py-2">
                <p className="font-medium text-lg text-gray-200">Nous sommes le 21 mai 2025, 07:45.</p>
                <p className="text-gray-300">Une attaque par ransomware vient d'être détectée sur les systèmes informatiques de mc2i.</p>
              </div>
              
              <div className="flex items-center bg-red-950/30 p-2 rounded border border-red-900/40">
                <Clock className="h-5 w-5 text-red-400 mr-2 animate-pulse" />
                <span className="text-red-300 font-mono text-xl">
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            
            <h3 className="text-xl font-semibold flex items-center text-red-300 mb-4">
              <Shield className="w-5 h-5 mr-2" />
              Votre rôle: RSSI (Responsable Sécurité des Systèmes d'Information)
            </h3>
            
            <p className="text-gray-200 mb-6">
              En tant que RSSI, vous êtes le responsable technique de la gestion de cette crise. 
              Vous allez devoir coordonner la réponse à cet incident critique avec les différents dirigeants de mc2i,
              prendre des décisions cruciales et limiter l'impact de cette attaque.
            </p>
            
            <Tabs defaultValue="situation" className="mb-6" onValueChange={setActiveTab}>
              <TabsList className="bg-gray-800 w-full border-b border-gray-700">
                <TabsTrigger 
                  value="situation" 
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-red-300"
                >
                  <Info className="h-4 w-4 mr-2" />
                  Situation
                </TabsTrigger>
                <TabsTrigger 
                  value="stakeholders" 
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-red-300"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Dirigeants
                </TabsTrigger>
                <TabsTrigger 
                  value="systems" 
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-red-300"
                >
                  <Server className="h-4 w-4 mr-2" />
                  Systèmes affectés
                </TabsTrigger>
                <TabsTrigger 
                  value="objectives" 
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-red-300"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Objectifs
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="situation" className="mt-4 text-gray-200">
                <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
                  <h4 className="text-lg font-medium text-red-200 mb-2 flex items-center">
                    <Megaphone className="w-5 h-5 mr-2" />
                    Situation initiale
                  </h4>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Plusieurs serveurs affichent des messages de rançon</li>
                    <li>Des fichiers sensibles ont été chiffrés dans toute l'organisation</li>
                    <li>Les cybercriminels exigent un paiement de 50 BTC (environ 1.5M€)</li>
                    <li>Les experts en sécurité ont identifié le ransomware comme "BlackCrypt"</li>
                    <li>L'infrastructure IT est partiellement compromise</li>
                    <li>Les dirigeants de mc2i sont réunis en cellule de crise d'urgence</li>
                  </ul>
                  
                  <div className="mt-4 border-t border-gray-700 pt-4">
                    <h5 className="font-semibold text-red-200 mb-2">Message des attaquants:</h5>
                    <div className="bg-black/60 p-3 rounded border border-red-900/30 font-mono text-sm">
                      <p className="text-red-500">ATTENTION: VOS FICHIERS ONT ÉTÉ CHIFFRÉS PAR BLACKCRYPT</p>
                      <p className="text-gray-400 mt-2">Tous vos fichiers importants ont été chiffrés avec une clé de chiffrement forte. Sans la clé de déchiffrement, la récupération est impossible.</p>
                      <p className="text-gray-400 mt-2">Pour récupérer vos données, vous devez payer 50 BTC dans les 72 heures. Après ce délai, le prix doublera. Après 7 jours, vos données seront définitivement perdues.</p>
                      <p className="text-gray-400 mt-2">Si vous tentez de restaurer ou de contourner notre chiffrement, nous publierons vos données sensibles sur notre site de fuite.</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-950/20 p-4 rounded border border-red-900/40 mt-4">
                  <h4 className="text-lg font-medium text-red-200 mb-2">Important</h4>
                  <p>Cette simulation vous plonge dans une gestion de crise réaliste. Les dirigeants sont tous joués par une IA avancée qui adaptera ses réactions à vos décisions.</p>
                  <p className="mt-2">Chaque décision aura des conséquences sur l'évolution de la crise, le stress des parties prenantes et l'impact global sur l'organisation.</p>
                </div>
              </TabsContent>
              
              <TabsContent value="stakeholders" className="mt-4 text-gray-200">
                <h4 className="text-lg font-medium mb-4">Dirigeants présents dans la salle de crise</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {keyStakeholders.map(stakeholder => (
                    <div key={stakeholder.id} className="bg-gray-800/40 p-4 rounded border border-gray-700 flex gap-4">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={generateAvatar(stakeholder.name, stakeholder.department)} />
                        <AvatarFallback className="bg-gray-700">{stakeholder.name.split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h5 className="font-semibold text-white">{stakeholder.name}</h5>
                        <p className="text-sm text-gray-300">{stakeholder.role}</p>
                        <p className="text-xs text-gray-400 mt-2">{stakeholder.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="systems" className="mt-4 text-gray-200">
                <h4 className="text-lg font-medium mb-4">Systèmes impactés par l'attaque</h4>
                <div className="space-y-4">
                  {affectedSystems.map((system, index) => (
                    <div key={index} className="bg-gray-800/40 p-4 rounded border border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-semibold text-white">{system.name}</h5>
                        <Badge 
                          className={
                            system.status === "Compromis" 
                              ? "bg-red-900/60 text-red-200" 
                              : "bg-amber-900/60 text-amber-200"
                          }
                        >
                          {system.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm text-gray-400">Criticité:</span>
                        <Progress 
                          value={system.criticalityLevel * 10} 
                          className="h-2 w-32"
                          indicatorClassName={`${
                            system.criticalityLevel >= 9 ? "bg-red-700" :
                            system.criticalityLevel >= 7 ? "bg-amber-600" :
                            "bg-blue-600"
                          }`}
                        />
                        <span className="text-sm font-mono">{system.criticalityLevel}/10</span>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="objectives" className="mt-4 text-gray-200">
                <h4 className="text-lg font-medium mb-4">Vos objectifs et responsabilités</h4>
                <div className="bg-gray-800/40 p-4 rounded border border-gray-700">
                  <ul className="list-disc list-inside space-y-2">
                    <li>Coordonner la réponse technique à l'incident</li>
                    <li>Consulter et informer les différentes parties prenantes</li>
                    <li>Prendre des décisions critiques sous contrainte de temps</li>
                    <li>Évaluer et limiter l'impact de l'attaque</li>
                    <li>Gérer les communications techniques internes</li>
                    <li>Élaborer une stratégie de récupération des systèmes</li>
                  </ul>
                  
                  <div className="mt-4 pt-4 border-t border-gray-700">
                    <h5 className="font-semibold text-red-200 mb-2">Objectifs prioritaires:</h5>
                    <ol className="list-decimal list-inside space-y-2">
                      <li className="font-medium">Évaluer l'étendue de la compromission</li>
                      <li className="font-medium">Contenir l'incident pour éviter la propagation</li>
                      <li className="font-medium">Identifier les systèmes critiques à restaurer en priorité</li>
                      <li className="font-medium">Établir une stratégie de communication interne et externe</li>
                      <li className="font-medium">Déterminer si la rançon doit être payée ou non</li>
                    </ol>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="border-t border-gray-800 flex justify-between py-4 bg-gradient-to-r from-gray-900 to-gray-950/50">
            <Button 
              variant="outline" 
              className="border-gray-700 hover:bg-gray-800"
              onClick={() => navigate('/cyber')}
            >
              Retour
            </Button>
            <Button 
              variant="destructive" 
              className="bg-red-700 hover:bg-red-800 text-white flex items-center gap-2"
              onClick={handleAccept}
              disabled={isAccepting}
            >
              {isAccepting ? (
                <>Activation de l'alerte...</>
              ) : (
                <>
                  Accepter la mission <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </HomeLayout>
  );
};

export default CrisisBriefing;