import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, FileOutput, ArrowLeftRight, Lightbulb, AlertTriangle, ChevronLeft } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

type AudienceType = 'technical' | 'management' | 'general' | 'beginner';
type PolicyType = 'general' | 'access-control' | 'incident-response' | 'data-protection' | 'network' | 'byod';

interface ConversionResult {
  convertedPolicy: string;
  simplificationNotes: string[];
  readabilityScore: number;
  keyPoints: string[];
}

// Fonction utilitaire pour nettoyer le Markdown
const cleanMarkdown = (text: string): string => {
  if (!text) return '';
  
  // Remplacer les balises Markdown les plus courantes
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Gras
    .replace(/\*(.*?)\*/g, '$1')     // Italique
    .replace(/#{1,6} (.+)/g, '$1')   // Titres
    .replace(/`(.+?)`/g, '$1')       // Code inline
    .replace(/~~(.+?)~~/g, '$1')     // Barré
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Liens
    .replace(/```.*?\n([\s\S]*?)```/g, '$1') // Blocs de code
    .replace(/- /g, '• '); // Transformer les listes en puces
};

export default function PolicyConverter() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [originalPolicy, setOriginalPolicy] = useState('');
  const [policyType, setPolicyType] = useState<PolicyType>('general');
  const [targetAudience, setTargetAudience] = useState<AudienceType>('general');
  const [result, setResult] = useState<ConversionResult | null>(null);
  
  // Mutation pour convertir la politique
  const convertPolicyMutation = useMutation<ConversionResult, Error, { 
    originalPolicy: string; 
    policyType: PolicyType; 
    targetAudience: AudienceType 
  }>({
    mutationFn: async (data) => {
      try {
        const response = await apiRequest('/api/cyber/tools/policy-converter', {
          method: 'POST',
          body: JSON.stringify(data)
        });
        // Pas besoin de nettoyer ici, on nettoie au moment de l'affichage
        return response;
      } catch (error) {
        console.error('Erreur lors de la conversion:', error);
        throw new Error('Échec de la conversion de la politique');
      }
    },
    onSuccess: (data: ConversionResult) => {
      setResult(data);
      toast({
        title: 'Conversion réussie',
        description: 'La politique a été convertie avec succès',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur de conversion',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Exemple de données pour l'aperçu
  const examplePolicies: Record<PolicyType, string> = {
    'general': "POLITIQUE DE SÉCURITÉ GÉNÉRALE\n\nTous les employés doivent adhérer aux principes de confidentialité, d'intégrité et de disponibilité des données. Le non-respect de cette politique peut entraîner des mesures disciplinaires pouvant aller jusqu'à la cessation d'emploi. Les violations doivent être signalées immédiatement au RSSI. L'accès aux systèmes d'information est contrôlé par authentification à facteurs multiples conformément à la norme ISO 27001. Les données confidentielles doivent être chiffrées selon les normes AES-256 en transit et au repos. Des sauvegardes incrémentales quotidiennes et complètes hebdomadaires sont obligatoires.",
    'access-control': "POLITIQUE DE CONTRÔLE D'ACCÈS\n\nL'accès aux systèmes d'information est accordé selon le principe du moindre privilège. L'authentification à deux facteurs est obligatoire pour tous les accès à distance. Les mots de passe doivent comporter 12 caractères minimum incluant majuscules, minuscules, chiffres et caractères spéciaux, et doivent être changés tous les 90 jours sans réutilisation des 12 derniers. Toute tentative d'accès non autorisé doit être enregistrée et signalée. L'accès privilégié est limité au personnel désigné et soumis à des audits trimestriels.",
    'incident-response': "PROCÉDURE DE RÉPONSE AUX INCIDENTS\n\nPhase 1: Détection et signalement - Tout incident de sécurité doit être signalé dans les 2 heures au CSIRT via le système de ticketing ou l'adresse incident@entreprise.com.\nPhase 2: Triage et évaluation - Classification de l'incident selon l'impact (critique, majeur, mineur) et détermination de l'étendue.\nPhase 3: Confinement - Isolation des systèmes affectés selon les procédures DR-03-21 à DR-03-26.\nPhase 4: Éradication - Suppression du vecteur d'attaque et correction des vulnérabilités.\nPhase 5: Rétablissement - Restauration des systèmes après validation.\nPhase 6: Analyse post-incident - Documentation complète et leçons apprises.",
    'data-protection': "POLITIQUE DE PROTECTION DES DONNÉES\n\nToutes les données sensibles doivent être classifiées selon leur niveau de confidentialité (public, interne, confidentiel, restreint). Les données personnelles sont soumises au RGPD et doivent être protégées par des mesures techniques et organisationnelles appropriées. La conservation des données est limitée à la durée nécessaire à la finalité du traitement. Les transferts de données hors UE doivent être conformes aux clauses contractuelles types. Tout accès aux données sensibles est journalisé et les journaux conservés pendant 12 mois.",
    'network': "POLITIQUE DE SÉCURITÉ RÉSEAU\n\nTous les accès réseau sont contrôlés par des pare-feux configurés selon le principe du moindre privilège. La segmentation du réseau est obligatoire avec séparation des environnements de production, test et développement. Le chiffrement TLS 1.2+ est requis pour toutes les communications. Les connexions VPN utilisent l'authentification multifacteur. La détection d'intrusion est active sur tous les segments critiques. Des scans de vulnérabilités sont effectués mensuellement sur toutes les ressources exposées.",
    'byod': "POLITIQUE D'UTILISATION DES APPAREILS PERSONNELS (BYOD)\n\nL'utilisation d'appareils personnels pour accéder aux ressources de l'entreprise est soumise à autorisation préalable. Tous les appareils doivent être enregistrés auprès du service informatique, disposer d'un antivirus à jour, d'un chiffrement du stockage et d'un verrouillage automatique après 5 minutes d'inactivité. L'entreprise se réserve le droit d'effacer à distance toutes les données professionnelles en cas de compromission ou de perte. Les données sensibles ne peuvent être stockées sur les appareils personnels."
  };

  const handleSubmit = () => {
    if (!originalPolicy.trim()) {
      toast({
        title: 'Entrée requise',
        description: 'Veuillez entrer une politique à convertir.',
        variant: 'destructive',
      });
      return;
    }

    convertPolicyMutation.mutate({
      originalPolicy,
      policyType,
      targetAudience
    });
  };

  const handleExampleSelect = (type: PolicyType) => {
    setPolicyType(type);
    setOriginalPolicy(examplePolicies[type] || examplePolicies.general);
  };

  return (
    <HomeLayout>
      <PageTitle title="CONVERTISSEUR DE POLITIQUES DE SÉCURITÉ" />
      
      <div className="container mx-auto py-6">
        <Card className="bg-gray-900 border-gray-800 text-gray-100 mb-6">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center">
              <FileOutput className="mr-2 h-6 w-6 text-blue-400" />
              Convertisseur de Politiques de Sécurité
            </CardTitle>
            <CardDescription className="text-gray-400">
              Transformez des politiques de sécurité complexes en versions adaptées à différents publics.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-start mb-6">
              <Button
                variant="outline"
                size="sm"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-950 border-blue-800"
                onClick={() => setLocation('/cyber')}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Retour à I AM CYBER
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="originalPolicy" className="text-gray-300 mb-2 block">
                  Politique de sécurité originale
                </Label>
                <div className="bg-gray-800 p-2 rounded-md mb-3">
                  <div className="flex justify-between mb-2">
                    <Label className="text-gray-400 text-sm">
                      Collez votre politique ou utilisez un exemple:
                    </Label>
                    <div className="flex space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-400 text-xs hover:text-blue-300 hover:bg-blue-950"
                        onClick={() => handleExampleSelect('general')}
                      >
                        Générale
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-400 text-xs hover:text-blue-300 hover:bg-blue-950"
                        onClick={() => handleExampleSelect('access-control')}
                      >
                        Contrôle d'accès
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-400 text-xs hover:text-blue-300 hover:bg-blue-950"
                        onClick={() => handleExampleSelect('incident-response')}
                      >
                        Réponse incidents
                      </Button>
                    </div>
                  </div>
                  <Textarea 
                    id="originalPolicy"
                    placeholder="Collez ici la politique de sécurité que vous souhaitez convertir..."
                    className="bg-gray-700 border-gray-600 min-h-[300px] text-gray-200"
                    value={originalPolicy}
                    onChange={(e) => setOriginalPolicy(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="policyType" className="text-gray-300 mb-2 block">
                      Type de politique
                    </Label>
                    <Select value={policyType} onValueChange={(val: PolicyType) => setPolicyType(val)}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-300">
                        <SelectValue placeholder="Sélectionnez un type" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                        <SelectItem value="general">Politique générale</SelectItem>
                        <SelectItem value="access-control">Contrôle d'accès</SelectItem>
                        <SelectItem value="incident-response">Réponse aux incidents</SelectItem>
                        <SelectItem value="data-protection">Protection des données</SelectItem>
                        <SelectItem value="network">Sécurité réseau</SelectItem>
                        <SelectItem value="byod">BYOD / Appareils mobiles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="targetAudience" className="text-gray-300 mb-2 block">
                      Public cible
                    </Label>
                    <Select value={targetAudience} onValueChange={(val: AudienceType) => setTargetAudience(val)}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-300">
                        <SelectValue placeholder="Sélectionnez un public" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                        <SelectItem value="technical">Équipe technique</SelectItem>
                        <SelectItem value="management">Management</SelectItem>
                        <SelectItem value="general">Tous employés</SelectItem>
                        <SelectItem value="beginner">Débutants en cybersécurité</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={handleSubmit}
                  disabled={convertPolicyMutation.isPending || !originalPolicy.trim()}
                >
                  {convertPolicyMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Conversion en cours...
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight className="mr-2 h-4 w-4" />
                      Convertir la politique
                    </>
                  )}
                </Button>
              </div>
              
              <div>
                <Label className="text-gray-300 mb-2 block">
                  Résultat de la conversion
                </Label>
                <div className="bg-gray-800 rounded-md p-4 min-h-[400px]">
                  {convertPolicyMutation.isPending ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <Loader2 className="h-10 w-10 animate-spin mb-4 text-blue-400" />
                      <p>Conversion en cours...</p>
                      <p className="text-sm mt-2">L'IA analyse et simplifie votre politique</p>
                    </div>
                  ) : result ? (
                    <Tabs defaultValue="converted">
                      <TabsList className="bg-gray-700">
                        <TabsTrigger value="converted">Version convertie</TabsTrigger>
                        <TabsTrigger value="insights">Analyse & Points clés</TabsTrigger>
                      </TabsList>
                      <TabsContent value="converted" className="mt-4">
                        <div className="bg-gray-700 rounded-md p-4 text-white whitespace-pre-wrap min-h-[300px]">
                          {cleanMarkdown(result.convertedPolicy)}
                        </div>
                      </TabsContent>
                      <TabsContent value="insights" className="mt-4">
                        <div className="bg-gray-700 rounded-md p-4 text-white min-h-[300px]">
                          <div className="mb-4">
                            <h3 className="text-blue-400 flex items-center mb-2">
                              <Lightbulb className="h-4 w-4 mr-2" />
                              Points clés
                            </h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {result.keyPoints.map((point, index) => (
                                <li key={index} className="text-gray-200">{cleanMarkdown(point)}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div className="mb-4">
                            <h3 className="text-blue-400 flex items-center mb-2">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Notes de simplification
                            </h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {result.simplificationNotes.map((note, index) => (
                                <li key={index} className="text-gray-200">{cleanMarkdown(note)}</li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h3 className="text-blue-400 mb-1">Score de lisibilité</h3>
                            <div className="bg-gray-800 h-2 rounded-full">
                              <div 
                                className="h-full rounded-full bg-gradient-to-r from-red-500 to-green-500"
                                style={{ width: `${result.readabilityScore * 100}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs mt-1">
                              <span>Complexe</span>
                              <span>Lisible</span>
                            </div>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <FileText className="h-16 w-16 mb-4 text-gray-700" />
                      <p>Votre politique convertie apparaîtra ici</p>
                      <p className="text-sm mt-2">Adaptée pour: {targetAudience === 'technical' ? 'Équipe technique' : 
                                                               targetAudience === 'management' ? 'Management' : 
                                                               targetAudience === 'beginner' ? 'Débutants en cybersécurité' : 
                                                               'Tous employés'}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t border-gray-800 pt-4">
            <div className="text-sm text-gray-400">
              <p>Cet outil convertit automatiquement des politiques de sécurité complexes en versions plus accessibles pour différents publics. La conversion est réalisée à l'aide de l'IA tout en préservant les informations essentielles.</p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </HomeLayout>
  );
}