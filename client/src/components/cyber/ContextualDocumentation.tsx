import React, { useState, useEffect } from 'react';
import { X, Book, BookOpen, Loader2, Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ContextualDocsProps {
  context: string; // Contexte actuel (ex: "data_breach", "ransomware", etc.)
  term?: string; // Terme technique spécifique
  isOpen?: boolean; // État d'ouverture du panneau
  onClose?: () => void; // Fonction pour fermer le panneau
}

interface Document {
  title: string;
  content: string;
  url?: string; // URL optionnelle pour les ressources externes
}

export default function ContextualDocumentation({ 
  context, 
  term, 
  isOpen = true,
  onClose
}: ContextualDocsProps) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [currentTerm, setCurrentTerm] = useState<string | undefined>(term);
  
  useEffect(() => {
    // Récupère la documentation pertinente basée sur le contexte
    async function fetchDocs() {
      try {
        setIsLoading(true);
        const queryParams = new URLSearchParams();
        queryParams.append('context', context);
        if (currentTerm) {
          queryParams.append('term', currentTerm);
        }
        
        const response = await fetch(`/api/cyber/documentation?${queryParams.toString()}`);
        if (!response.ok) {
          throw new Error('Failed to fetch documentation');
        }
        
        const data = await response.json();
        setDocs(data.documents || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching documentation:", error);
        // Fallback documentation
        setDocs([
          {
            title: "Ressources de référence",
            content: "Consultez les guides de l'ANSSI et le framework MITRE ATT&CK pour approfondir vos connaissances sur ce sujet."
          }
        ]);
        setIsLoading(false);
      }
    }
    
    if (isOpen) {
      fetchDocs();
    }
  }, [context, currentTerm, isOpen]);
  
  // Ne pas rendre si le panneau est fermé
  if (!isOpen) return null;
  
  return (
    <div className={cn(
      "fixed bottom-0 right-0 z-50 transition-all duration-300 ease-in-out",
      isExpanded 
        ? "w-96 h-96" 
        : "w-12 h-12",
      "bg-gray-900/90 backdrop-blur-sm border-l border-t border-indigo-500/30 rounded-tl-lg overflow-hidden"
    )}>
      {isExpanded ? (
        <>
          <div className="flex justify-between items-center p-3 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white flex items-center">
              <BookOpen className="h-5 w-5 text-indigo-400 mr-2" />
              Ressources techniques
            </h3>
            <div className="flex space-x-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0" 
                onClick={() => setIsExpanded(false)}
              >
                <Info className="h-4 w-4 text-gray-400" />
              </Button>
              {onClose && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0" 
                  onClick={onClose}
                >
                  <X className="h-4 w-4 text-gray-400" />
                </Button>
              )}
            </div>
          </div>
          
          <div className="p-4 overflow-auto h-[calc(100%-48px)]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-8 w-8 text-indigo-400 animate-spin mb-2" />
                <p className="text-gray-400 text-sm">Chargement des ressources...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {docs.map((doc, index) => (
                  <div key={index} className="border-b border-gray-700 pb-3 last:border-b-0">
                    <h4 className="text-indigo-300 font-medium mb-1">{doc.title}</h4>
                    <p className="text-sm text-gray-300 leading-relaxed">{doc.content}</p>
                    {doc.url && (
                      <a 
                        href={doc.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-400 hover:text-indigo-300 inline-flex items-center mt-2"
                      >
                        En savoir plus
                        <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    )}
                  </div>
                ))}
                
                {/* Termes techniques courants */}
                <div className="mt-4 pt-3 border-t border-gray-700">
                  <h4 className="text-gray-400 font-medium mb-2 text-sm">Termes techniques</h4>
                  <div className="flex flex-wrap gap-2">
                    {context === 'data_breach' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs border-indigo-700 text-indigo-300 hover:bg-indigo-900/30"
                          onClick={() => setCurrentTerm('Exfiltration de données')}
                        >
                          Exfiltration
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs border-indigo-700 text-indigo-300 hover:bg-indigo-900/30"
                          onClick={() => setCurrentTerm('Data Loss Prevention')}
                        >
                          DLP
                        </Button>
                      </>
                    )}
                    {context === 'ransomware' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs border-indigo-700 text-indigo-300 hover:bg-indigo-900/30"
                          onClick={() => setCurrentTerm('Double extorsion')}
                        >
                          Double extorsion
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs border-indigo-700 text-indigo-300 hover:bg-indigo-900/30"
                          onClick={() => setCurrentTerm('Mouvements latéraux')}
                        >
                          Mouvements latéraux
                        </Button>
                      </>
                    )}
                    {context === 'insider_threat' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs border-indigo-700 text-indigo-300 hover:bg-indigo-900/30"
                          onClick={() => setCurrentTerm('Principe du moindre privilège')}
                        >
                          Moindre privilège
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs border-indigo-700 text-indigo-300 hover:bg-indigo-900/30"
                          onClick={() => setCurrentTerm('Séparation des pouvoirs')}
                        >
                          Séparation des pouvoirs
                        </Button>
                      </>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs border-indigo-700 text-indigo-300 hover:bg-indigo-900/30"
                      onClick={() => setCurrentTerm(undefined)}
                    >
                      Vue générale
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div 
          className="w-12 h-12 flex items-center justify-center cursor-pointer"
          onClick={() => setIsExpanded(true)}
        >
          <Book className="h-6 w-6 text-indigo-400" />
        </div>
      )}
    </div>
  );
}