import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Bug,
  Info,
  Lightbulb,
  CheckCircle2,
  Send,
  Code,
  Target,
  Database,
  FileType,
  Shield,
  Lock,
  Brain,
  Globe,
  Loader2,
  AlertTriangle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
// Import individual UI components correctly
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import HomeLayout from '@/components/layout/HomeLayout';
import PageTitle from '@/components/utils/PageTitle';

// Types
type VulnerabilityCategory = 
  | 'XSS' 
  | 'CSRF' 
  | 'SQLi' 
  | 'AuthZ' 
  | 'AuthN' 
  | 'BusinessLogic' 
  | 'SSRF'
  | 'FileUpload'
  | 'IDOR';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: VulnerabilityCategory;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  points: number;
  completed?: boolean;
  locked?: boolean;
  prerequisites?: string[];
  environment: {
    type: 'web' | 'api' | 'mobile';
    details: string;
  };
  objectives?: string[];
  hints: string[];
  timeLimit?: number;
  tutorial?: string;
}

interface BugReport {
  challengeId: string;
  title: string;
  vulnerability: VulnerabilityCategory;
  severity: 'faible' | 'moyen' | 'élevé' | 'critique';
  description: string;
  stepsToReproduce: string[];
  impactDescription: string;
  proofOfConcept: string;
}

// Mock environments
const mockWebEnvironments = {
  'web-store-1': {
    name: 'E-commerce vulnérable',
    pages: [
      { 
        name: 'Accueil', 
        url: '/', 
        content: `
          <div class="store-header">
            <h1>BugMart - Votre magasin préféré</h1>
            <div class="search">
              <input type="text" placeholder="Rechercher des produits..." id="search-box">
              <button>Rechercher</button>
            </div>
            <div class="nav">
              <a href="/">Accueil</a> | 
              <a href="/products">Produits</a> | 
              <a href="/account">Mon compte</a> | 
              <a href="/cart">Panier (2)</a>
            </div>
          </div>
          <div class="featured">
            <h2>Produits populaires</h2>
            <div class="products">
              <div class="product">
                <img src="https://placehold.co/200x150/4287f5/ffffff?text=Appareil+photo" alt="Appareil photo">
                <h3>Appareil photo professionnel</h3>
                <p>599,99 €</p>
                <a href="/products/1">Voir détails</a>
              </div>
              <div class="product">
                <img src="https://placehold.co/200x150/42f59e/000000?text=Smartphone" alt="Smartphone">
                <h3>Smartphone dernière génération</h3>
                <p>899,99 €</p>
                <a href="/products/2">Voir détails</a>
              </div>
            </div>
          </div>
        `
      },
      { 
        name: 'Détail produit', 
        url: '/products/1', 
        content: `
          <div class="product-detail">
            <div class="product-image">
              <img src="https://placehold.co/400x300/4287f5/ffffff?text=Appareil+photo" alt="Appareil photo">
            </div>
            <div class="product-info">
              <h1>Appareil photo professionnel</h1>
              <div class="price">599,99 €</div>
              <div class="description">
                <p>Appareil photo professionnel avec capteur haute résolution, zoom optique 20x et stabilisation d'image avancée.</p>
                <ul>
                  <li>Résolution: 42 MP</li>
                  <li>Zoom optique: 20x</li>
                  <li>Stabilisation: 5 axes</li>
                  <li>Vidéo: 4K 60 FPS</li>
                </ul>
              </div>
              <button class="add-to-cart">Ajouter au panier</button>
            </div>
          </div>
          <div class="reviews">
            <h2>Avis clients</h2>
            <div class="review">
              <div class="review-author">Jean D. ⭐⭐⭐⭐⭐</div>
              <div class="review-content">Excellent appareil, je le recommande vivement!</div>
            </div>
            <div class="review">
              <div class="review-author">Marie L. ⭐⭐⭐⭐</div>
              <div class="review-content">Très bon rapport qualité-prix, mais batterie un peu faible.</div>
            </div>
            <div class="add-review">
              <h3>Ajouter un avis</h3>
              <div class="form-group">
                <label>Votre nom:</label>
                <input type="text" id="review-name">
              </div>
              <div class="form-group">
                <label>Note:</label>
                <select id="review-rating">
                  <option>5 étoiles</option>
                  <option>4 étoiles</option>
                  <option>3 étoiles</option>
                  <option>2 étoiles</option>
                  <option>1 étoile</option>
                </select>
              </div>
              <div class="form-group">
                <label>Votre avis:</label>
                <textarea id="review-content"></textarea>
              </div>
              <button id="submit-review">Soumettre</button>
            </div>
            <div id="reviews-container">
              <!-- Les avis soumis apparaîtront ici -->
            </div>
          </div>
        `
      }
    ],
    vulnerableCode: `
// Code vulnérable à l'injection XSS
document.getElementById('submit-review').addEventListener('click', function() {
  const name = document.getElementById('review-name').value;
  const rating = document.getElementById('review-rating').value;
  const content = document.getElementById('review-content').value;

  // Aucune validation ou assainissement des entrées utilisateur
  const reviewHTML = \`
    <div class="review">
      <div class="review-author">\${name} \${rating}</div>
      <div class="review-content">\${content}</div>
    </div>
  \`;

  // Injection directe de HTML non assaini dans le DOM
  document.getElementById('reviews-container').innerHTML += reviewHTML;
});
    `
  },
  'api-bank-1': {
    name: 'API Bancaire',
    endpoints: [
      {
        method: 'GET',
        path: '/api/accounts/:accountId',
        description: 'Récupère les détails d\'un compte bancaire',
        response: {
          "accountId": "ACC123456",
          "userId": "USER001",
          "balance": 2540.75,
          "currency": "EUR",
          "accountType": "checking",
          "lastTransactionDate": "2025-04-28T14:32:15Z"
        }
      },
      {
        method: 'GET',
        path: '/api/accounts/:accountId/transactions',
        description: 'Récupère les transactions d\'un compte bancaire',
        response: [
          {
            "transactionId": "TRX00123",
            "amount": 150.00,
            "type": "deposit",
            "date": "2025-04-28T14:32:15Z",
            "description": "Dépôt ATM"
          },
          {
            "transactionId": "TRX00124",
            "amount": -45.99,
            "type": "payment",
            "date": "2025-04-27T11:15:22Z",
            "description": "Paiement SuperMart"
          }
        ]
      },
      {
        method: 'POST',
        path: '/api/transfers',
        description: 'Effectue un transfert entre deux comptes',
        request: {
          "fromAccountId": "ACC123456",
          "toAccountId": "ACC789012",
          "amount": 100.00,
          "description": "Remboursement"
        },
        response: {
          "transferId": "TRF00534",
          "status": "completed",
          "timestamp": "2025-04-29T09:15:22Z"
        }
      }
    ],
    vulnerableCode: `
// Code vulnérable à l'IDOR - aucune vérification que l'utilisateur 
// a accès au compte demandé
app.get('/api/accounts/:accountId', authenticate, (req, res) => {
  const { accountId } = req.params;

  // Pas de vérification que l'utilisateur authentifié est propriétaire de ce compte
  db.getAccount(accountId)
    .then(account => {
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Retourne les détails du compte même si l'utilisateur n'y a pas droit
      res.json(account);
    })
    .catch(err => {
      res.status(500).json({ error: 'Database error' });
    });
});
    `
  }
};

// Composant principal de la page de défi
export default function ChallengePage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('brief');
  const [showHint, setShowHint] = useState(false);
  const [currentHintIndex, setCurrentHintIndex] = useState(0);
  const [simulation, setSimulation] = useState<any>(null);
  const [showSimulation, setShowSimulation] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  // État pour le rapport de bogue
  const [bugReport, setBugReport] = useState<BugReport>({
    challengeId: id || '',
    title: '',
    vulnerability: 'XSS',
    severity: 'moyen',
    description: '',
    stepsToReproduce: [''],
    impactDescription: '',
    proofOfConcept: ''
  });

  // Récupération des détails du défi
  const { 
    data: challengeData, 
    isLoading, 
    error 
  } = useQuery<{ success: boolean, challenge: Challenge }>({
    queryKey: ['/api/bug-hunter/challenge', id],
    enabled: !!id
  });

  const challenge = challengeData?.challenge;

  // Chargement de la simulation appropriée
  useEffect(() => {
    if (challenge) {
      if (challenge.environment.type === 'web' && id) {
        setSimulation(mockWebEnvironments[id as keyof typeof mockWebEnvironments]);
      } 
      // Ajouter d'autres types d'environnements au besoin
    }
  }, [challenge, id]);

  // Gestion du clic sur un indice
  const handleHintClick = () => {
    if (!showHint) {
      setShowHint(true);
      return;
    }

    if (challenge && currentHintIndex < challenge.hints.length - 1) {
      setCurrentHintIndex(prevIndex => prevIndex + 1);
    } else {
      toast({
        title: "Plus d'indices disponibles",
        description: "Vous avez utilisé tous les indices disponibles pour ce défi.",
        variant: "default"
      });
    }
  };

  // Mise à jour du rapport de bug
  const updateBugReport = (field: keyof BugReport, value: any) => {
    setBugReport(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Ajout d'une étape de reproduction
  const addReproductionStep = () => {
    setBugReport(prev => ({
      ...prev,
      stepsToReproduce: [...prev.stepsToReproduce, '']
    }));
  };

  // Mise à jour d'une étape de reproduction
  const updateReproductionStep = (index: number, value: string) => {
    setBugReport(prev => {
      const newSteps = [...prev.stepsToReproduce];
      newSteps[index] = value;
      return {
        ...prev,
        stepsToReproduce: newSteps
      };
    });
  };

  // Soumission du rapport de bug
  const submitReport = async () => {
    try {
      const response = await fetch('/api/bug-hunter/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bugReport)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Rapport soumis avec succès",
          description: "Votre rapport a été soumis et sera évalué prochainement.",
          variant: "default"
        });
      } else {
        throw new Error(data.message || "Erreur lors de la soumission");
      }
    } catch (error) {
      toast({
        title: "Erreur de soumission",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la soumission du rapport.",
        variant: "destructive"
      });
    }
  };

  // Lancer la simulation
  const launchSimulation = () => {
    setShowSimulation(true);
  };

  // Naviguer entre les pages (pour les simulations Web)
  const navigateToPage = (index: number) => {
    setCurrentPage(index);
  };

  // Rendu de l'icône pour une catégorie de vulnérabilité
  const renderVulnerabilityIcon = (category: VulnerabilityCategory) => {
    switch (category) {
      case 'XSS':
        return <Code className="h-5 w-5" />;
      case 'CSRF':
        return <Shield className="h-5 w-5" />;
      case 'SQLi':
        return <Database className="h-5 w-5" />;
      case 'AuthZ':
      case 'AuthN':
        return <Lock className="h-5 w-5" />;
      case 'BusinessLogic':
        return <Brain className="h-5 w-5" />;
      case 'SSRF':
        return <Globe className="h-5 w-5" />;
      case 'FileUpload':
        return <FileType className="h-5 w-5" />;
      case 'IDOR':
        return <Target className="h-5 w-5" />;
      default:
        return <Bug className="h-5 w-5" />;
    }
  };

  // Rendu du badge de difficulté
  const renderDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'débutant':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Débutant</Badge>;
      case 'intermédiaire':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Intermédiaire</Badge>;
      case 'avancé':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Avancé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  if (isLoading) {
    return (
      <HomeLayout>
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-blue-900 text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
            </div>
          </div>
        </div>
      </HomeLayout>
    );
  }

  if (error || !challenge) {
    return (
      <HomeLayout>
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-blue-900 text-white">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center mb-8">
              <Link href="/cyber/arcade/bug-hunter">
                <Button variant="ghost" className="text-white hover:bg-blue-800/20 mr-4">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                </Button>
              </Link>
              <PageTitle title="ERROR" />
            </div>
            <div className="text-center p-10">
              <AlertTriangle className="h-20 w-20 text-red-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold mb-4">Défi non trouvé</h2>
              <p className="mb-6">Le défi que vous cherchez n'existe pas ou n'est pas disponible.</p>
              <Link href="/cyber/arcade/bug-hunter">
                <Button variant="default">
                  Retour aux défis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </HomeLayout>
    );
  }

  const currentSimulationPage = simulation?.pages?.[currentPage];

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 py-8">
          {/* Header avec navigation */}
          <div className="flex items-center mb-8">
            <Link href="/cyber/arcade/bug-hunter">
              <Button variant="ghost" className="text-white hover:bg-blue-800/20 mr-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
              </Button>
            </Link>
            <PageTitle title="BUG HUNTER" />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-10"
          >
            {/* En-tête du défi */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {renderVulnerabilityIcon(challenge.category)}
                  <h1 className="text-3xl font-bold">{challenge.title}</h1>
                  {renderDifficultyBadge(challenge.difficulty)}
                </div>
                <p className="text-blue-200 max-w-3xl mb-2">
                  {challenge.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-blue-300">
                  <span>Catégorie: {challenge.category}</span>
                  <span>•</span>
                  <span>Points: {challenge.points}</span>
                  <span>•</span>
                  <span>Environnement: {challenge.environment.type.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Navigation principale */}
            <Tabs 
              defaultValue={activeTab} 
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full mb-8 bg-blue-900/20">
                <TabsTrigger value="brief" className="flex-1">
                  <Info className="mr-2 h-4 w-4" />
                  Briefing
                </TabsTrigger>
                <TabsTrigger value="environment" className="flex-1">
                  <Target className="mr-2 h-4 w-4" />
                  Environnement
                </TabsTrigger>
                <TabsTrigger value="report" className="flex-1">
                  <Bug className="mr-2 h-4 w-4" />
                  Soumettre un rapport
                </TabsTrigger>
              </TabsList>

              {/* Contenu du briefing */}
              <TabsContent value="brief" className="space-y-6">
                <Card className="bg-blue-900/20 border-blue-800 text-white">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <Info className="mr-2 h-5 w-5 text-blue-400" />
                      Objectifs de la mission
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="mb-4">{challenge.description}</p>
                      {challenge.objectives && (
                        <ul className="list-disc pl-5 space-y-1">
                          {challenge.objectives.map((objective, index) => (
                            <li key={index}>{objective}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="pt-4">
                      <p className="text-sm text-blue-200 mb-2">
                        <span className="font-medium">Type d'environnement:</span> {challenge.environment.type.toUpperCase()}
                      </p>
                      <p className="text-sm text-blue-200">
                        <span className="font-medium">Détails:</span> {challenge.environment.details}
                      </p>
                    </div>

                    {challenge.timeLimit && (
                      <div className="pt-2">
                        <p className="text-sm text-blue-200">
                          <span className="font-medium">Temps suggéré:</span> {challenge.timeLimit} minutes
                        </p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" onClick={handleHintClick}>
                      <Lightbulb className="mr-2 h-4 w-4" />
                      {showHint ? "Indice suivant" : "Demander un indice"}
                    </Button>
                  </CardFooter>
                </Card>

                {/* Affichage des indices */}
                {showHint && challenge.hints.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert className="bg-yellow-900/40 border-yellow-800">
                      <Lightbulb className="h-4 w-4 text-yellow-400" />
                      <AlertTitle>Indice {currentHintIndex + 1}/{challenge.hints.length}</AlertTitle>
                      <AlertDescription>
                        {challenge.hints[currentHintIndex]}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}

                {/* Tutoriel si disponible */}
                {challenge.tutorial && (
                  <Card className="bg-blue-900/20 border-blue-800 text-white">
                    <CardHeader>
                      <CardTitle className="text-xl flex items-center">
                        <Book className="mr-2 h-5 w-5 text-green-400" />
                        Tutoriel
                      </CardTitle>
                      <CardDescription className="text-blue-200">
                        Ressources d'apprentissage pour mieux comprendre cette vulnérabilité
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="prose prose-invert max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: challenge.tutorial }} />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Contenu de l'environnement */}
              <TabsContent value="environment" className="space-y-6">
                <Card className="bg-blue-900/20 border-blue-800 text-white">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <Target className="mr-2 h-5 w-5 text-green-400" />
                      Environnement de test
                    </CardTitle>
                    <CardDescription className="text-blue-200">
                      {challenge.environment.details}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {!showSimulation ? (
                      <div className="text-center py-10">
                        <div className="mb-6">
                          <Target className="h-16 w-16 mx-auto text-blue-400" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">Prêt à démarrer la simulation ?</h3>
                        <p className="mb-6 text-blue-200">
                          La simulation reproduit un environnement contrôlé où vous pourrez rechercher et exploiter des vulnérabilités en toute sécurité.
                        </p>
                        <Button onClick={launchSimulation}>
                          Lancer la simulation
                        </Button>
                      </div>
                    ) : (
                      <div>
                        {challenge.environment.type === 'web' && simulation?.pages && (
                          <div>
                            {/* Onglets de navigation entre les pages web simulées */}
                            <div className="flex items-center gap-2 mb-4 bg-blue-950/50 rounded overflow-hidden">
                              {simulation.pages.map((page: any, index: number) => (
                                <Button 
                                  key={index}
                                  variant={currentPage === index ? "subtle" : "ghost"} 
                                  className={`rounded-none h-8 px-2 text-xs ${currentPage === index ? 'bg-blue-700' : ''}`}
                                  onClick={() => navigateToPage(index)}
                                >
                                  {page.name}
                                </Button>
                              ))}
                            </div>

                            {/* URL de la page */}
                            <div className="bg-slate-950 rounded p-2 flex items-center mb-4 text-sm">
                              <div className="text-green-500 mr-2">https://</div>
                              <div>vulnerable-store-xss-1.bugbountysandbox.com{currentSimulationPage?.url}</div>
                            </div>

                            {/* Contenu de la page web simulée */}
                            <div className="bg-white text-black p-4 rounded-md mb-4">
                              <div dangerouslySetInnerHTML={{ __html: currentSimulationPage?.content || '' }} />
                            </div>

                            {/* Code source vulnérable */}
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="vulnerable-code" className="border-blue-800">
                                <AccordionTrigger className="text-blue-300 hover:text-blue-100">
                                  <div className="flex items-center">
                                    <Code className="mr-2 h-4 w-4" />
                                    Voir le code vulnérable
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <pre className="bg-slate-950 p-4 rounded overflow-auto max-h-80 text-xs">
                                    <code className="text-green-400">
                                      {simulation?.vulnerableCode || '// Pas de code disponible pour cet environnement'}
                                    </code>
                                  </pre>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        )}

                        {challenge.environment.type === 'api' && simulation?.endpoints && (
                          <div>
                            <div className="mb-4">
                              <h3 className="text-lg font-medium mb-2">Points d'API disponibles:</h3>
                              <div className="space-y-3">
                                {simulation.endpoints.map((endpoint: any, index: number) => (
                                  <Accordion key={index} type="single" collapsible className="w-full">
                                    <AccordionItem value={`endpoint-${index}`} className="border-blue-800">
                                      <AccordionTrigger className="text-blue-300 hover:text-blue-100">
                                        <div className="flex items-center">
                                          <span className={`mr-2 font-mono px-2 py-1 rounded text-xs ${
                                            endpoint.method === 'GET' ? 'bg-green-900/40 text-green-400' : 
                                            endpoint.method === 'POST' ? 'bg-blue-900/40 text-blue-400' :
                                            endpoint.method === 'PUT' ? 'bg-yellow-900/40 text-yellow-400' :
                                            'bg-red-900/40 text-red-400'
                                          }`}>
                                            {endpoint.method}
                                          </span>
                                          <span className="font-mono">{endpoint.path}</span>
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <div className="p-3 bg-blue-950/30 rounded-md">
                                          <p className="mb-2 text-sm">{endpoint.description}</p>

                                          {endpoint.request && (
                                            <div className="mb-2">
                                              <p className="text-xs font-medium text-blue-300 mb-1">Requête:</p>
                                              <pre className="bg-slate-950 p-2 rounded text-xs overflow-auto">
                                                <code className="text-green-400">
                                                  {JSON.stringify(endpoint.request, null, 2)}
                                                </code>
                                              </pre>
                                            </div>
                                          )}

                                          <div>
                                            <p className="text-xs font-medium text-blue-300 mb-1">Réponse:</p>
                                            <pre className="bg-slate-950 p-2 rounded text-xs overflow-auto">
                                              <code className="text-green-400">
                                                {JSON.stringify(endpoint.response, null, 2)}
                                              </code>
                                            </pre>
                                          </div>
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  </Accordion>
                                ))}
                              </div>
                            </div>

                            {/* Code source vulnérable */}
                            <Accordion type="single" collapsible className="w-full">
                              <AccordionItem value="vulnerable-code" className="border-blue-800">
                                <AccordionTrigger className="text-blue-300 hover:text-blue-100">
                                  <div className="flex items-center">
                                    <Code className="mr-2 h-4 w-4" />
                                    Voir le code vulnérable
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <pre className="bg-slate-950 p-4 rounded overflow-auto max-h-80 text-xs">
                                    <code className="text-green-400">
                                      {simulation?.vulnerableCode || '// Pas de code disponible pour cet environnement'}
                                    </code>
                                  </pre>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contenu du rapport */}
              <TabsContent value="report" className="space-y-6">
                <Card className="bg-blue-900/20 border-blue-800 text-white">
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <Bug className="mr-2 h-5 w-5 text-purple-400" />
                      Rapport de vulnérabilité
                    </CardTitle>
                    <CardDescription className="text-blue-200">
                      Documentez la vulnérabilité que vous avez découverte
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-blue-200">Titre du rapport</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 rounded bg-blue-950/50 border border-blue-800 text-white"
                          placeholder="Ex: XSS persistant dans la section commentaires"
                          value={bugReport.title}
                          onChange={(e) => updateBugReport('title', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-blue-200">Type de vulnérabilité</label>
                        <select 
                          className="w-full px-3 py-2 rounded bg-blue-950/50 border border-blue-800 text-white"
                          value={bugReport.vulnerability}
                          onChange={(e) => updateBugReport('vulnerability', e.target.value as VulnerabilityCategory)}
                        >
                          <option value="XSS">Cross-Site Scripting (XSS)</option>
                          <option value="CSRF">Cross-Site Request Forgery (CSRF)</option>
                          <option value="SQLi">SQL Injection</option>
                          <option value="AuthZ">Authorization Bypass</option>
                          <option value="AuthN">Authentication Bypass</option>
                          <option value="BusinessLogic">Business Logic Flaw</option>
                          <option value="SSRF">Server-Side Request Forgery</option>
                          <option value="FileUpload">Unsafe File Upload</option>
                          <option value="IDOR">Insecure Direct Object Reference</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-blue-200">Sévérité</label>
                        <select 
                          className="w-full px-3 py-2 rounded bg-blue-950/50 border border-blue-800 text-white"
                          value={bugReport.severity}
                          onChange={(e) => updateBugReport('severity', e.target.value as any)}
                        >
                          <option value="faible">Faible</option>
                          <option value="moyen">Moyen</option>
                          <option value="élevé">Élevé</option>
                          <option value="critique">Critique</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-blue-200">Description détaillée</label>
                      <Textarea 
                        className="w-full min-h-[100px] bg-blue-950/50 border border-blue-800 text-white"
                        placeholder="Décrivez la vulnérabilité en détail..."
                        value={bugReport.description}
                        onChange={(e) => updateBugReport('description', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-sm text-blue-200">Étapes pour reproduire</label>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={addReproductionStep}
                          className="h-7 text-xs"
                        >
                          Ajouter une étape
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {bugReport.stepsToReproduce.map((step, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="bg-blue-800/40 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-2">
                              {index + 1}
                            </div>
                            <Textarea 
                              className="flex-1 min-h-[60px] bg-blue-950/50 border border-blue-800 text-white"
                              placeholder={`Étape ${index + 1}...`}
                              value={step}
                              onChange={(e) => updateReproductionStep(index, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-blue-200">Description de l'impact</label>
                      <Textarea 
                        className="w-full min-h-[100px] bg-blue-950/50 border border-blue-800 text-white"
                        placeholder="Quel est l'impact de cette vulnérabilité? Que pourrait faire un attaquant?"
                        value={bugReport.impactDescription}
                        onChange={(e) => updateBugReport('impactDescription', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-blue-200">Preuve de concept (PoC)</label>
                      <Textarea 
                        className="w-full min-h-[120px] font-mono bg-blue-950/50 border border-blue-800 text-white"
                        placeholder="Fournissez un code ou commande qui démontre l'exploitation de la vulnérabilité..."
                        value={bugReport.proofOfConcept}
                        onChange={(e) => updateBugReport('proofOfConcept', e.target.value)}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={submitReport}>
                      <Send className="mr-2 h-4 w-4" />
                      Soumettre le rapport
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </HomeLayout>
  );
}