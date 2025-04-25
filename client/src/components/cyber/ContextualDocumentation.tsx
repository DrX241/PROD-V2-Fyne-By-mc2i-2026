import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  X, BookOpen, ExternalLink, Search, AlertCircle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  isOpen = false,
  onClose
}: ContextualDocsProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [visible, setVisible] = useState<boolean>(isOpen);
  const [searchTerm, setSearchTerm] = useState<string>(term || '');

  // Mettre à jour l'état visible quand isOpen change
  useEffect(() => {
    setVisible(isOpen);
  }, [isOpen]);

  // Fonction pour récupérer la documentation
  async function fetchDocs() {
    try {
      setLoading(true);
      setError(null);
      
      // Construire l'URL avec les paramètres
      let url = `/api/cyber/documentation?context=${context}`;
      if (searchTerm) {
        url += `&term=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        setDocuments(response.data.documentation);
      } else {
        throw new Error(response.data.error || "Échec de récupération de la documentation");
      }
    } catch (err) {
      console.error("Erreur lors du chargement de la documentation:", err);
      setError("Impossible de charger la documentation. Veuillez réessayer ultérieurement.");
      
      // Documentation de secours en cas d'échec
      setDocuments([
        {
          title: `Documentation sur la ${mapContextToFrench(context)}`,
          content: "La documentation n'a pas pu être chargée. Veuillez consulter les ressources de l'ANSSI pour obtenir des informations sur ce sujet."
        }
      ]);
    } finally {
      setLoading(false);
    }
  }

  // Charger la documentation au chargement ou quand le contexte/terme change
  useEffect(() => {
    if (visible) {
      fetchDocs();
    }
  }, [visible, context]);

  // Rechercher quand l'utilisateur soumet la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDocs();
  };

  // Fonction pour convertir les contextes en français
  const mapContextToFrench = (contextType: string): string => {
    const contextMap: Record<string, string> = {
      'data_breach': 'fuite de données',
      'ransomware': 'rançongiciels',
      'phishing': 'hameçonnage',
      'insider_threat': 'menaces internes',
      'social_engineering': 'ingénierie sociale'
    };
    
    return contextMap[contextType] || 'cybersécurité';
  };

  // Fermer le panneau
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 300 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 right-0 h-full w-full sm:w-96 bg-gray-900/95 backdrop-blur-sm z-50 shadow-xl border-l border-indigo-900/50"
        >
          <div className="flex flex-col h-full">
            {/* En-tête */}
            <div className="flex items-center justify-between p-4 border-b border-indigo-900/50">
              <div className="flex items-center">
                <BookOpen className="h-5 w-5 text-indigo-400 mr-2" />
                <h2 className="text-lg font-medium text-white">Documentation technique</h2>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 rounded-full hover:bg-gray-800"
              >
                <X className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
            
            {/* Barre de recherche */}
            <div className="p-4 border-b border-indigo-900/50">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Rechercher un concept..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button type="submit" variant="secondary" size="icon" className="h-10 w-10">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
              <div className="mt-2">
                <p className="text-sm text-indigo-200">
                  Documentation: <span className="font-semibold">{mapContextToFrench(context)}</span>
                </p>
              </div>
            </div>
            
            {/* Contenu principal */}
            <ScrollArea className="flex-1 p-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin mb-4"></div>
                  <p className="text-indigo-200">Chargement de la documentation...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
                  <p className="text-gray-300 text-center">{error}</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-10 w-10 text-amber-500 mb-4" />
                  <p className="text-gray-300 text-center">Aucune documentation trouvée pour ces critères.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {documents.map((doc, index) => (
                    <div key={index} className="pb-4">
                      <h3 className="text-indigo-300 font-medium mb-2">{doc.title}</h3>
                      <p className="text-gray-300 text-sm">{doc.content}</p>
                      
                      {doc.url && (
                        <a 
                          href={doc.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-indigo-400 hover:text-indigo-300 text-sm mt-3"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Ressource externe
                        </a>
                      )}
                      
                      {index < documents.length - 1 && (
                        <Separator className="bg-indigo-900/30 mt-4" />
                      )}
                    </div>
                  ))}
                  
                  <div className="text-center py-2 opacity-70">
                    <div className="flex items-center justify-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Documentation générée {new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}