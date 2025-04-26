import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, BookOpen, ArrowDown, Info } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import axios from 'axios';

interface DebriefingProps {
  userActions: string[]; // Actions que l'utilisateur a prises
  correctApproach: string[]; // Approche recommandée
  scenario: string; // Type de scénario joué
  performanceScore: number; // Score de l'utilisateur
}

export default function DebriefingComponent({ 
  userActions, 
  correctApproach, 
  scenario, 
  performanceScore 
}: DebriefingProps) {
  const [debriefing, setDebriefing] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDebriefing() {
      try {
        setLoading(true);
        
        // Appel à l'API pour générer le débriefing
        const response = await axios.post('/api/cyber/debriefing', {
          userActions,
          correctApproach,
          scenario,
          performanceScore
        });

        if (response.data.success) {
          setDebriefing(response.data.debriefing);
        } else {
          throw new Error(response.data.error || "Échec de génération du débriefing");
        }
      } catch (err) {
        console.error("Erreur lors du chargement du débriefing:", err);
        setError("Impossible de générer le débriefing pédagogique. Veuillez réessayer ultérieurement.");
        
        // Débriefing de secours en cas d'échec
        setDebriefing(`
          **Résumé de votre performance**
          
          Vous avez complété ce scénario de ${mapScenarioToFrench(scenario)} avec un score de ${performanceScore}/100.
          
          **Points clés à retenir**
          
          - Les fuites de données peuvent provenir de sources internes ou externes
          - Une investigation méthodique est essentielle pour identifier le coupable
          - La chronologie des événements et les preuves physiques sont cruciales
          
          **Pour approfondir**
          
          Consultez les ressources de l'ANSSI sur la gestion des incidents de sécurité.
        `);
      } finally {
        setLoading(false);
      }
    }

    fetchDebriefing();
  }, [userActions, correctApproach, scenario, performanceScore]);

  // Fonction pour convertir les types de scénarios en français
  const mapScenarioToFrench = (scenarioType: string): string => {
    const scenarioMap: Record<string, string> = {
      'data_breach': 'fuite de données',
      'ransomware': 'rançongiciel',
      'phishing': 'hameçonnage',
      'insider_threat': 'menace interne',
      'social_engineering': 'ingénierie sociale'
    };
    
    return scenarioMap[scenarioType] || 'cybersécurité';
  };

  // Fonction pour rendre le texte Markdown en HTML simplifié
  const renderMarkdown = (text: string): JSX.Element[] => {
    if (!text) return [<p key="empty">Chargement du débriefing...</p>];
    
    // Séparation par lignes
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Titre en gras (regex pour **texte**)
      if (line.match(/^\s*\*\*(.+)\*\*\s*$/)) {
        const title = line.replace(/^\s*\*\*(.+)\*\*\s*$/, '$1');
        return <h3 key={index} className="text-lg font-semibold text-indigo-200 mt-4 mb-2">{title}</h3>;
      }
      
      // Puce (ligne commençant par - ou *)
      if (line.match(/^\s*[\-\*]\s+(.+)$/)) {
        const content = line.replace(/^\s*[\-\*]\s+(.+)$/, '$1');
        return (
          <div key={index} className="flex items-start mb-1">
            <div className="text-indigo-400 mr-2">•</div>
            <p className="text-gray-300">{content}</p>
          </div>
        );
      }
      
      // Ligne vide
      if (line.trim() === '') {
        return <div key={index} className="h-2"></div>;
      }
      
      // Texte normal
      return <p key={index} className="text-gray-300 mb-2">{line}</p>;
    });
  };

  return (
    <Card className="bg-gray-900/70 border border-indigo-800/40 w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center mb-1">
          <Info className="h-5 w-5 text-indigo-400 mr-2" />
          <CardTitle className="text-xl text-white">Débriefing pédagogique</CardTitle>
        </div>
        <CardDescription className="text-gray-400">
          Analyse des actions et leçons à retenir
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Score et performance */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Performance</span>
            <span>{performanceScore}%</span>
          </div>
          <Progress 
            value={performanceScore} 
            className="h-2" 
            indicatorClassName={
              performanceScore > 75 ? "bg-green-500" : 
              performanceScore > 40 ? "bg-amber-500" : 
              "bg-red-500"
            }
          />
          <div className="flex justify-center mt-2">
            {performanceScore > 75 ? (
              <span className="text-green-400 text-sm flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" /> Excellent travail
              </span>
            ) : performanceScore > 40 ? (
              <span className="text-amber-400 text-sm flex items-center">
                <Info className="h-4 w-4 mr-1" /> Des points à améliorer
              </span>
            ) : (
              <span className="text-red-400 text-sm flex items-center">
                <XCircle className="h-4 w-4 mr-1" /> Nécessite révision
              </span>
            )}
          </div>
        </div>
        
        <Separator className="bg-indigo-800/30 my-4" />
        
        {/* Débriefing */}
        <div className="px-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-6">
              <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
              <p className="text-indigo-200">Génération du débriefing en cours...</p>
            </div>
          ) : error ? (
            <div className="text-center py-6">
              <p className="text-red-400 mb-2">{error}</p>
              <p className="text-gray-400 text-sm">Un débriefing simplifié est affiché ci-dessous.</p>
              <div className="mt-4 text-left">
                {renderMarkdown(debriefing)}
              </div>
            </div>
          ) : (
            <div>
              {renderMarkdown(debriefing)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}