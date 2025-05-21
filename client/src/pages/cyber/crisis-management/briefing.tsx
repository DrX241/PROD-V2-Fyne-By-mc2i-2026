import React, { useState } from 'react';
import { useLocation } from 'wouter';
import HomeLayout from '@/components/layout/HomeLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, ArrowRight, Shield, Megaphone } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const CrisisBriefing = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = () => {
    setIsAccepting(true);
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
            <div className="space-y-6 text-gray-200">
              <div className="border-l-4 border-red-700 pl-4 py-2">
                <p className="font-medium text-lg">Nous sommes le 21 mai 2025, 07:45.</p>
                <p>Une attaque par ransomware de grande envergure vient d'être détectée sur les systèmes informatiques de mc2i.</p>
              </div>

              <h3 className="text-xl font-semibold flex items-center text-red-300">
                <Shield className="w-5 h-5 mr-2" />
                Votre rôle: RSSI (Responsable Sécurité des Systèmes d'Information)
              </h3>
              
              <p>
                En tant que RSSI, vous êtes le responsable technique de la gestion de cette crise. 
                Vous allez devoir coordonner la réponse à cet incident critique avec les différents dirigeants de mc2i,
                prendre des décisions cruciales et limiter l'impact de cette attaque.
              </p>

              <div className="bg-gray-800/50 p-4 rounded border border-gray-700">
                <h4 className="text-lg font-medium text-red-200 mb-2 flex items-center">
                  <Megaphone className="w-5 h-5 mr-2" />
                  Situation initiale
                </h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>Plusieurs serveurs affichent des messages de rançon</li>
                  <li>Des fichiers sensibles ont été chiffrés dans toute l'organisation</li>
                  <li>Les cybercriminels exigent un paiement en cryptomonnaie</li>
                  <li>Les experts en sécurité ont identifié le ransomware comme "BlackCrypt"</li>
                  <li>L'infrastructure IT est partiellement compromise</li>
                  <li>Les dirigeants de mc2i sont réunis en cellule de crise d'urgence</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-red-300">Vos responsabilités:</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Coordonner la réponse technique à l'incident</li>
                <li>Consulter et informer les différentes parties prenantes</li>
                <li>Prendre des décisions critiques sous contrainte de temps</li>
                <li>Évaluer et limiter l'impact de l'attaque</li>
                <li>Gérer les communications techniques internes</li>
                <li>Élaborer une stratégie de récupération des systèmes</li>
              </ul>

              <div className="bg-red-950/20 p-4 rounded border border-red-900/40">
                <h4 className="text-lg font-medium text-red-200 mb-2">Important</h4>
                <p>Cette simulation vous plonge dans une gestion de crise réaliste. Les dirigeants sont tous joués par une IA avancée qui adaptera ses réactions à vos décisions.</p>
                <p className="mt-2">Chaque décision aura des conséquences sur l'évolution de la crise, le stress des parties prenantes et l'impact global sur l'organisation.</p>
              </div>
            </div>
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