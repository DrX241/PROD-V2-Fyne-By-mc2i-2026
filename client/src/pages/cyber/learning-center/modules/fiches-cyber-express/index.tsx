import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { 
  ArrowLeft, 
  FileText, 
  Star, 
  Search,
  BookOpen,
  Shield,
  Server,
  Lock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Types
interface FicheCyber {
  id: string;
  title: string;
  category: string;
  level: 'débutant' | 'intermédiaire' | 'avancé' | 'tous niveaux';
  description: string;
  content: string;
  keyPoints: string[];
  references: string[];
  icon: React.ReactElement;
  isFavorite: boolean;
  hasBeenRead: boolean;
}

export default function FichesCyberExpress() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [readCount, setReadCount] = useState(0);
  const [selectedFiche, setSelectedFiche] = useState<FicheCyber | null>(null);
  const [fiches, setFiches] = useState<FicheCyber[]>([]);

  // Données de démo pour les fiches
  const demoFiches: FicheCyber[] = [
    {
      id: 'ransomware',
      title: 'Ransomware : comprendre et se protéger',
      category: 'menaces',
      level: 'débutant',
      description: 'Principes de fonctionnement des ransomwares et méthodes de protection efficaces',
      content: `
## Qu'est-ce qu'un ransomware ?

Un ransomware (ou rançongiciel) est un type de logiciel malveillant qui chiffre les données de la victime et exige le paiement d'une rançon pour fournir la clé de déchiffrement.

## Comment fonctionnent les ransomwares ?

1. **Infection** : Principalement par phishing, téléchargements infectés ou exploitation de vulnérabilités
2. **Installation** : Le malware s'installe et établit la persistance dans le système
3. **Communication** : Établissement d'une connexion avec les serveurs de commande et contrôle (C2)
4. **Chiffrement** : Les fichiers sont chiffrés avec des algorithmes puissants
5. **Demande de rançon** : Affichage d'un message exigeant le paiement, souvent en cryptomonnaie

## Techniques de protection essentielles

- Sauvegardes régulières hors ligne (3-2-1 : 3 copies, 2 supports différents, 1 hors site)
- Formation des utilisateurs à la reconnaissance des tentatives de phishing
- Mise à jour systématique des logiciels et systèmes d'exploitation
      `,
      keyPoints: [
        "Les ransomwares chiffrent les données et exigent une rançon pour les déchiffrer",
        "La double extorsion combine chiffrement et menace de publication des données",
        "Le phishing est le principal vecteur d'infection",
        "Les sauvegardes régulières non connectées sont la meilleure protection"
      ],
      references: [
        'ANSSI - Note technique "Panorama des attaques par rançongiciels"',
        'NIST - Special Publication 1800-25, "Identifying and Protecting Assets Against Ransomware"'
      ],
      icon: <Shield />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'zero-trust',
      title: 'Zero Trust : au-delà du périmètre',
      category: 'architecture',
      level: 'intermédiaire',
      description: 'Présentation du modèle Zero Trust et des principes de sa mise en œuvre',
      content: `
## Qu'est-ce que Zero Trust ?

Le modèle Zero Trust est une approche de sécurité basée sur le principe "ne jamais faire confiance, toujours vérifier".

## Principes fondamentaux

1. **Vérification explicite** : Authentifier et autoriser en fonction de toutes les données disponibles
2. **Accès avec le moindre privilège** : Limiter l'accès des utilisateurs au strict nécessaire
3. **Suppose la compromission** : Minimiser le rayon d'impact en segmentant l'accès par application et ressource
      `,
      keyPoints: [
        "Zero Trust adopte le principe 'ne jamais faire confiance, toujours vérifier'",
        "L'authentification et l'autorisation sont requises pour chaque accès",
        "La micro-segmentation limite l'impact d'une compromission",
        "L'implémentation complète combine IAM, MFA, EDR/XDR, ZTNA et CASB"
      ],
      references: [
        'NIST SP 800-207: "Zero Trust Architecture"',
        'Gartner: "Market Guide for Zero Trust Network Access"'
      ],
      icon: <Lock />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'oauth',
      title: 'OAuth 2.0 et OpenID Connect',
      category: 'authentication',
      level: 'avancé',
      description: 'Fonctionnement des protocoles OAuth 2.0 et OpenID Connect pour l\'authentification et l\'autorisation',
      content: `
## Comprendre OAuth 2.0

OAuth 2.0 est un protocole d'autorisation qui permet à une application d'accéder à des ressources hébergées par d'autres applications web au nom d'un utilisateur.
      `,
      keyPoints: [
        "OAuth 2.0 est un protocole d'autorisation, pas d'authentification",
        "OpenID Connect ajoute une couche d'authentification au-dessus d'OAuth 2.0",
        "Les jetons JWT doivent être validés côté serveur"
      ],
      references: [
        'RFC 6749 - The OAuth 2.0 Authorization Framework',
        'RFC 7636 - PKCE'
      ],
      icon: <Server />,
      isFavorite: false,
      hasBeenRead: false
    },
    {
      id: 'threatHunting',
      title: 'Threat Hunting : chasse proactive aux menaces',
      category: 'opérations',
      level: 'avancé',
      description: 'Méthodologies et techniques pour la recherche proactive de menaces dans un système d\'information',
      content: `
## Concept du Threat Hunting

Le Threat Hunting est une approche proactive de la cybersécurité qui consiste à rechercher activement des menaces qui se sont infiltrées dans le réseau.
      `,
      keyPoints: [
        "Le Threat Hunting est une démarche proactive de recherche de menaces déjà présentes",
        "Il se base sur la formulation et vérification d'hypothèses de compromission",
        "Une bonne connaissance des tactiques adversaires (TTPs) est essentielle"
      ],
      references: [
        'SANS - Effective Threat Hunting',
        'MITRE ATT&CK Framework'
      ],
      icon: <AlertCircle />,
      isFavorite: false,
      hasBeenRead: false
    }
  ];

  // Initialisation des fiches
  useEffect(() => {
    // Simuler le chargement depuis une API
    setFiches(demoFiches);

    // Initialiser les compteurs
    const favCount = demoFiches.filter(fiche => fiche.isFavorite).length;
    const readCount = demoFiches.filter(fiche => fiche.hasBeenRead).length;
    setFavoriteCount(favCount);
    setReadCount(readCount);
  }, []);

  // Filtrage des fiches
  const filteredFiches = fiches
    .filter(fiche => 
      fiche.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      fiche.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(fiche => selectedCategory === 'all' || fiche.category === selectedCategory)
    .filter(fiche => selectedLevel === 'all' || fiche.level === selectedLevel);

  // Marquer une fiche comme lue
  const handleToggleRead = (id: string) => {
    setFiches(fiches.map(fiche => {
      if (fiche.id === id) {
        const updated = { ...fiche, hasBeenRead: !fiche.hasBeenRead };
        return updated;
      }
      return fiche;
    }));

    // Mettre à jour le compteur
    const updatedFiches = fiches.map(f => f.id === id ? { ...f, hasBeenRead: !f.hasBeenRead } : f);
    const newReadCount = updatedFiches.filter(f => f.hasBeenRead).length;
    setReadCount(newReadCount);
  };

  // Marquer une fiche comme favorite
  const handleToggleFavorite = (id: string) => {
    setFiches(fiches.map(fiche => {
      if (fiche.id === id) {
        const updated = { ...fiche, isFavorite: !fiche.isFavorite };
        return updated;
      }
      return fiche;
    }));

    // Mettre à jour le compteur
    const updatedFiches = fiches.map(f => f.id === id ? { ...f, isFavorite: !f.isFavorite } : f);
    const newFavoriteCount = updatedFiches.filter(f => f.isFavorite).length;
    setFavoriteCount(newFavoriteCount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 to-blue-900 text-white">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Link href="/cyber/learning-center">
            <Button variant="outline" size="icon" className="mr-2 border-blue-600 bg-blue-950/50 text-blue-200 hover:bg-blue-900/50 hover:text-blue-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Fiches Cyber Express</h1>
            <p className="text-blue-200">Consultez et apprenez rapidement avec nos fiches synthétiques</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Panneau de gauche : Liste des fiches et recherche */}
          <div className="lg:col-span-1 space-y-4 bg-blue-900/30 p-4 rounded-lg border border-blue-800">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="flex flex-col">
                  <span className="text-sm text-blue-300">Fiches disponibles</span>
                  <span className="font-medium text-white">{fiches.length}</span>
                </div>
                <div className="w-px h-8 bg-blue-700 mx-2"></div>
                <div className="flex flex-col">
                  <span className="text-sm text-blue-300">Lues</span>
                  <span className="font-medium text-white">{readCount}/{fiches.length}</span>
                </div>
                <div className="w-px h-8 bg-blue-700 mx-2"></div>
                <div className="flex flex-col">
                  <span className="text-sm text-blue-300">Favorites</span>
                  <span className="font-medium text-white">{favoriteCount}</span>
                </div>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-400" />
              <Input
                className="pl-9 bg-blue-950/50 border-blue-700 text-white placeholder:text-blue-400"
                placeholder="Rechercher une fiche..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Liste des fiches */}
            <div className="space-y-3 mt-4">
              {filteredFiches.map((fiche) => (
                <Card 
                  key={fiche.id} 
                  className={`cursor-pointer transition-all bg-blue-900/40 border-blue-800 hover:border-blue-600 ${selectedFiche?.id === fiche.id ? 'border-blue-500' : ''}`}
                  onClick={() => setSelectedFiche(fiche)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="mt-1 p-2 rounded-md bg-blue-950 flex items-center justify-center text-blue-300">
                          {fiche.icon}
                        </div>
                        <div>
                          <h3 className="font-medium text-white">{fiche.title}</h3>
                          <p className="text-sm text-blue-300 line-clamp-2">{fiche.description}</p>
                          <div className="flex items-center mt-2 space-x-2">
                            <Badge variant="outline" className="text-xs capitalize border-blue-600 text-blue-200">
                              {fiche.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize border-blue-600 text-blue-200">
                              {fiche.level}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className={`h-7 w-7 ${fiche.isFavorite ? 'text-yellow-400' : 'text-blue-300 hover:text-yellow-400'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleFavorite(fiche.id);
                          }}
                        >
                          <Star className="h-4 w-4" fill={fiche.isFavorite ? "currentColor" : "none"} />
                        </Button>
                        {fiche.hasBeenRead && (
                          <div className="text-xs text-blue-400">
                            <div className="flex items-center">
                              <BookOpen className="h-3 w-3 mr-1" />
                              Lu
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Panneau de droite : Contenu de la fiche sélectionnée */}
          <div className="lg:col-span-2 bg-blue-900/30 rounded-lg border border-blue-800">
            {selectedFiche ? (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-blue-800 flex justify-between items-center bg-blue-900/50">
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-xl font-semibold text-white">{selectedFiche.title}</h2>
                      {selectedFiche.isFavorite && (
                        <Star className="ml-2 h-4 w-4 text-yellow-400" fill="currentColor" />
                      )}
                    </div>
                    <div className="flex items-center mt-1 space-x-2">
                      <Badge variant="outline" className="text-xs capitalize border-blue-600 text-blue-200">
                        {selectedFiche.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize border-blue-600 text-blue-200">
                        {selectedFiche.level}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`${selectedFiche.hasBeenRead ? 'bg-blue-600/20 text-blue-300' : 'border-blue-600 bg-blue-950/50 text-blue-200 hover:bg-blue-900/50 hover:text-blue-100'}`}
                      onClick={() => handleToggleRead(selectedFiche.id)}
                    >
                      <BookOpen className="mr-1 h-4 w-4" />
                      {selectedFiche.hasBeenRead ? 'Lu' : 'Marquer comme lu'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className={`${selectedFiche.isFavorite ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500' : 'border-blue-600 bg-blue-950/50 text-blue-200 hover:bg-blue-900/50 hover:text-blue-100'}`}
                      onClick={() => handleToggleFavorite(selectedFiche.id)}
                    >
                      <Star 
                        className="mr-1 h-4 w-4" 
                        fill={selectedFiche.isFavorite ? "currentColor" : "none"} 
                      />
                      {selectedFiche.isFavorite ? 'Favori' : 'Ajouter aux favoris'}
                    </Button>
                  </div>
                </div>

                <div className="p-6 overflow-auto prose prose-invert max-w-none">
                  <p className="text-lg font-medium mb-4 text-white">{selectedFiche.description}</p>

                  {/* Contenu en Markdown */}
                  <div className="text-white" dangerouslySetInnerHTML={{ 
                    __html: selectedFiche.content
                      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-6 mb-3 text-blue-200">$1</h2>')
                      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-5 mb-2 text-blue-200">$1</h3>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-blue-100">$1</strong>')
                      .replace(/^\- (.*$)/gm, '<li class="ml-4 mb-1 text-white">$1</li>')
                      .replace(/^\d\. (.*$)/gm, '<li class="ml-4 mb-1 text-white">$1</li>')
                  }} />

                  <div className="mt-8 bg-blue-900/40 p-4 rounded-md border border-blue-800">
                    <h3 className="font-semibold mb-2 text-blue-200">Points clés à retenir</h3>
                    <ul className="space-y-2">
                      {selectedFiche.keyPoints.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block h-2 w-2 rounded-full bg-blue-500 mt-2 mr-2"></span>
                          <span className="text-blue-100">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6">
                    <h3 className="font-semibold mb-2 text-blue-200">Références</h3>
                    <ul className="space-y-1 text-sm">
                      {selectedFiche.references.map((ref, index) => (
                        <li key={index} className="text-blue-300">
                          <a href="#" className="hover:underline">{ref}</a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-blue-900/20 border-blue-800">
                <FileText className="h-16 w-16 text-blue-400 mb-4" />
                <h3 className="text-xl font-medium text-white">Sélectionnez une fiche</h3>
                <p className="text-blue-200 mt-2 max-w-md">
                  Choisissez une fiche dans la liste à gauche pour afficher son contenu.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}