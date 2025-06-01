import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  ShoppingCart, 
  Search, 
  Filter,
  Star,
  BookOpen,
  Code,
  Target,
  Award,
  Eye,
  Heart,
  ArrowLeft,
  Zap
} from 'lucide-react';
import { Link } from 'wouter';

interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  category: string;
  author: string;
  tags: string[];
  level: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';
  type: 'module' | 'outil';
  featured: boolean;
}

const marketplaceItems: MarketplaceItem[] = [
  // Cybersécurité - 3 modules
  {
    id: '1',
    title: 'I AM CYBER - Sécurité Avancée',
    description: 'Programme complet de formation en cybersécurité avec simulations pratiques',
    category: 'Cybersécurité',
    author: 'FYNE Academy',
    tags: ['Sécurité', 'SOC', 'Incident'],
    level: 'Avancé',
    type: 'module',
    featured: true
  },
  {
    id: '2',
    title: 'I AM CYBER - SOC Analyst',
    description: 'Formation complète pour devenir analyste SOC avec outils de détection',
    category: 'Cybersécurité',
    author: 'FYNE Academy',
    tags: ['SOC', 'SIEM', 'Détection'],
    level: 'Avancé',
    type: 'module',
    featured: false
  },
  {
    id: '3',
    title: 'I AM CYBER - Pentest Expert',
    description: 'Techniques avancées de test d\'intrusion et d\'audit de sécurité',
    category: 'Cybersécurité',
    author: 'FYNE Academy',
    tags: ['Pentest', 'Audit', 'Vulnérabilités'],
    level: 'Expert',
    type: 'module',
    featured: true
  },
  
  // Data & IA - 3 modules
  {
    id: '4',
    title: 'I AM DATA - Machine Learning',
    description: 'Formation ML avancée avec projets pratiques et cas d\'usage réels',
    category: 'Data & IA',
    author: 'FYNE Academy',
    tags: ['ML', 'Python', 'Data Science'],
    level: 'Avancé',
    type: 'module',
    featured: true
  },
  {
    id: '5',
    title: 'I AM DATA - Engineering',
    description: 'Architecture et pipelines de données pour l\'entreprise moderne',
    category: 'Data & IA',
    author: 'FYNE Academy',
    tags: ['Pipeline', 'ETL', 'Architecture'],
    level: 'Expert',
    type: 'module',
    featured: false
  },
  {
    id: '6',
    title: 'I AM IA - Générative & LLM',
    description: 'Maîtrisez les modèles de langage et l\'IA générative pour l\'entreprise',
    category: 'Data & IA',
    author: 'FYNE Academy',
    tags: ['LLM', 'IA Générative', 'Prompt Engineering'],
    level: 'Avancé',
    type: 'module',
    featured: true
  },
  
  // AMOA - 3 modules
  {
    id: '7',
    title: 'I AM AMOA - Maîtrise d\'Ouvrage',
    description: 'Techniques modernes de maîtrise d\'ouvrage pour projets digitaux',
    category: 'AMOA',
    author: 'FYNE Academy',
    tags: ['AMOA', 'Digital', 'Transformation'],
    level: 'Avancé',
    type: 'module',
    featured: true
  },
  {
    id: '8',
    title: 'I AM AMOA - Product Owner',
    description: 'Formation Product Owner avec méthodes Agile et cas pratiques',
    category: 'AMOA',
    author: 'FYNE Academy',
    tags: ['Product Owner', 'Scrum', 'Agile'],
    level: 'Intermédiaire',
    type: 'module',
    featured: false
  },
  {
    id: '9',
    title: 'I AM AMOA - Business Analyst',
    description: 'Analyse fonctionnelle et expression des besoins métier',
    category: 'AMOA',
    author: 'FYNE Academy',
    tags: ['Business Analysis', 'UML', 'Cahier des charges'],
    level: 'Avancé',
    type: 'module',
    featured: false
  },
  
  // Agilité - 3 modules
  {
    id: '10',
    title: 'I AM AGILE - Scrum Master',
    description: 'Formation complète Scrum Master avec techniques d\'animation',
    category: 'Agilité',
    author: 'FYNE Academy',
    tags: ['Scrum Master', 'Animation', 'Facilitation'],
    level: 'Intermédiaire',
    type: 'module',
    featured: true
  },
  {
    id: '11',
    title: 'I AM AGILE - SAFe Program',
    description: 'Pilotage de programmes Agile à l\'échelle avec SAFe',
    category: 'Agilité',
    author: 'FYNE Academy',
    tags: ['SAFe', 'Programme', 'Scaling'],
    level: 'Expert',
    type: 'module',
    featured: false
  },
  {
    id: '12',
    title: 'I AM AGILE - DevOps',
    description: 'Intégration et déploiement continus avec approche DevOps',
    category: 'Agilité',
    author: 'FYNE Academy',
    tags: ['DevOps', 'CI/CD', 'Automatisation'],
    level: 'Avancé',
    type: 'module',
    featured: true
  },
  
  // Outils clés en main
  {
    id: '13',
    title: 'Créateur de Chatbots IA',
    description: 'Plateforme no-code pour créer des chatbots personnalisés avec IA',
    category: 'Outils',
    author: 'FYNE Tools',
    tags: ['Chatbot', 'IA', 'No-code'],
    level: 'Débutant',
    type: 'outil',
    featured: false
  },
  {
    id: '14',
    title: 'Générateur de Jeux de Test',
    description: 'Automatisation de la création de jeux de données pour les tests',
    category: 'Outils',
    author: 'FYNE Tools',
    tags: ['Tests', 'Automatisation', 'Données'],
    level: 'Intermédiaire',
    type: 'outil',
    featured: true
  },
  {
    id: '15',
    title: 'Assistant Politiques de Sécurité',
    description: 'Générateur de politiques de sécurité adaptées par type d\'organisation',
    category: 'Outils',
    author: 'FYNE Tools',
    tags: ['Sécurité', 'Politique', 'Compliance'],
    level: 'Intermédiaire',
    type: 'outil',
    featured: false
  },
  {
    id: '16',
    title: 'Générateur de Réponses AO',
    description: 'Assistant IA pour rédiger des réponses aux appels d\'offres',
    category: 'Outils',
    author: 'FYNE Tools',
    tags: ['Appel d\'offres', 'Rédaction', 'IA'],
    level: 'Intermédiaire',
    type: 'outil',
    featured: true
  },
  {
    id: '17',
    title: 'Plateforme de Veille Automatisée',
    description: 'Surveillance des tendances technologiques et réglementaires',
    category: 'Outils',
    author: 'FYNE Tools',
    tags: ['Veille', 'Tendances', 'Automatisation'],
    level: 'Débutant',
    type: 'outil',
    featured: false
  }
];

const categories = ['Tous', 'Cybersécurité', 'Data & IA', 'AMOA', 'Agilité', 'Outils'];

export default function Marketplace() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [sortBy, setSortBy] = useState('featured');
  const [cartItems, setCartItems] = useState<string[]>([]);

  const filteredItems = marketplaceItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Tous' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'featured':
        return b.featured ? 1 : -1;
      default:
        return b.featured ? 1 : -1;
    }
  });

  const addToCart = (itemId: string) => {
    if (!cartItems.includes(itemId)) {
      setCartItems([...cartItems, itemId]);
      const item = marketplaceItems.find(i => i.id === itemId);
      toast({
        title: "Ajouté au panier",
        description: `${item?.title} a été ajouté à votre panier`,
        variant: "default",
      });
    } else {
      toast({
        title: "Déjà dans le panier",
        description: "Cet élément est déjà dans votre panier",
        variant: "destructive",
      });
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'module': return <BookOpen className="h-4 w-4" />;
      case 'outil': return <Code className="h-4 w-4" />;
      case 'scenario': return <Target className="h-4 w-4" />;
      case 'certification': return <Award className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Débutant': return 'bg-green-900/30 text-green-300 border-green-700/30';
      case 'Intermédiaire': return 'bg-blue-900/30 text-blue-300 border-blue-700/30';
      case 'Avancé': return 'bg-purple-900/30 text-purple-300 border-purple-700/30';
      case 'Expert': return 'bg-red-900/30 text-red-300 border-red-700/30';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-700/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      {/* Header */}
      <div className="border-b border-blue-500/20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  FYNE MARKETPLACE
                </h1>
                <p className="text-gray-400 mt-1">
                  Modules, outils et ressources pour votre montée en compétences
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-900/20">
                <Heart className="mr-2 h-4 w-4" />
                Favoris
              </Button>
              <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-900/20">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Panier ({cartItems.length})
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher des modules, outils, certifications..."
                className="pl-10 bg-black/30 border-blue-500/30 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                className="bg-black/30 border border-blue-500/30 rounded-md px-3 py-2 text-white"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="featured">Mis en avant</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <Card className="bg-slate-800/70 border-blue-500/20 sticky top-4">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filtres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-white font-medium mb-3">Catégories</h4>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedCategory === category
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-blue-900/20'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-400">
                {sortedItems.length} résultat{sortedItems.length > 1 ? 's' : ''} trouvé{sortedItems.length > 1 ? 's' : ''}
              </p>
            </div>

            {/* Featured Items */}
            {selectedCategory === 'Tous' && searchTerm === '' && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-yellow-400" />
                  Mis en avant
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {marketplaceItems.filter(item => item.featured).map((item) => (
                    <Card key={item.id} className="bg-gradient-to-br from-slate-800/70 to-slate-900/70 border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 group cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-2">
                            {getIcon(item.type)}
                            <Badge variant="outline" className={getLevelColor(item.level)}>
                              {item.level}
                            </Badge>
                          </div>
                          <Badge className="bg-yellow-600 text-yellow-100">
                            ⭐ Vedette
                          </Badge>
                        </div>
                        <CardTitle className="text-white group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </CardTitle>
                        <CardDescription className="text-gray-300">
                          {item.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-3">
                          <span className="text-gray-400 text-sm">par {item.author}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {item.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="bg-blue-900/30 text-blue-300 text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-orange-600 hover:bg-orange-700"
                            disabled={true}
                          >
                            Bientôt disponible
                          </Button>
                          <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-400">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Items */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                {selectedCategory === 'Tous' && searchTerm === '' ? 'Tous les produits' : 'Résultats'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedItems.map((item) => (
                  <Card key={item.id} className="bg-slate-800/70 border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 group cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          {getIcon(item.type)}
                          <Badge variant="outline" className={getLevelColor(item.level)}>
                            {item.level}
                          </Badge>
                        </div>
                        {item.featured && (
                          <Badge className="bg-yellow-600 text-yellow-100">
                            ⭐
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-white group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-gray-300">
                        {item.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-3">
                        <span className="text-gray-400 text-sm">par {item.author}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-blue-900/30 text-blue-300 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1 bg-orange-600 hover:bg-orange-700"
                          disabled={true}
                        >
                          Bientôt disponible
                        </Button>
                        <Button variant="outline" size="sm" className="border-blue-500/30 text-blue-400">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}