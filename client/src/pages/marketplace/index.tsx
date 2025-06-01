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
  rating: number;
  reviews: number;
  author: string;
  tags: string[];
  level: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert';
  type: 'module' | 'outil' | 'scenario' | 'certification';
  featured: boolean;
}

const marketplaceItems: MarketplaceItem[] = [
  // Cybersécurité - 3 modules
  {
    id: '1',
    title: 'Formation CISSP Complète',
    description: 'Programme complet de préparation à la certification CISSP avec labs pratiques',
    category: 'Cybersécurité',
    rating: 4.8,
    reviews: 124,
    author: 'Expert Cyber',
    tags: ['CISSP', 'Certification', 'Sécurité'],
    level: 'Avancé',
    type: 'module',
    featured: true
  },
  {
    id: '2',
    title: 'SOC Analyst Expert',
    description: 'Formation complète pour devenir analyste SOC avec outils de détection avancés',
    category: 'Cybersécurité',
    rating: 4.7,
    reviews: 198,
    author: 'SOC Academy',
    tags: ['SOC', 'SIEM', 'Détection'],
    level: 'Avancé',
    type: 'module',
    featured: false
  },
  {
    id: '3',
    title: 'Pentest & Red Team',
    description: 'Techniques avancées de test d\'intrusion et d\'exercices Red Team',
    category: 'Cybersécurité',
    rating: 4.9,
    reviews: 156,
    author: 'RedTeam Pro',
    tags: ['Pentest', 'Red Team', 'Exploitation'],
    level: 'Expert',
    type: 'module',
    featured: true
  },
  
  // Data & IA - 3 modules
  {
    id: '4',
    title: 'Machine Learning Avancé',
    description: 'Cours avancé ML avec projets pratiques et datasets réels',
    category: 'Data & IA',
    rating: 4.9,
    reviews: 256,
    author: 'AI Academy',
    tags: ['ML', 'Python', 'Deep Learning'],
    level: 'Avancé',
    type: 'module',
    featured: true
  },
  {
    id: '5',
    title: 'Data Engineering Expert',
    description: 'Architecture et pipelines de données pour l\'entreprise moderne',
    category: 'Data & IA',
    rating: 4.8,
    reviews: 189,
    author: 'DataPro',
    tags: ['Pipeline', 'ETL', 'Architecture'],
    level: 'Expert',
    type: 'module',
    featured: false
  },
  {
    id: '6',
    title: 'IA Générative & LLM',
    description: 'Maîtrisez les modèles de langage et l\'IA générative pour l\'entreprise',
    category: 'Data & IA',
    rating: 4.7,
    reviews: 234,
    author: 'GenAI Expert',
    tags: ['LLM', 'ChatGPT', 'Prompt Engineering'],
    level: 'Avancé',
    type: 'module',
    featured: true
  },
  
  // AMOA - 3 modules
  {
    id: '7',
    title: 'Maîtrise d\'Ouvrage Digitale',
    description: 'Techniques modernes de maîtrise d\'ouvrage pour projets digitaux',
    category: 'AMOA',
    rating: 4.8,
    reviews: 234,
    author: 'DigitalMOA',
    tags: ['AMOA', 'Digital', 'Transformation'],
    level: 'Avancé',
    type: 'module',
    featured: true
  },
  {
    id: '8',
    title: 'Product Owner Certifié',
    description: 'Formation Product Owner avec certification et cas pratiques réels',
    category: 'AMOA',
    rating: 4.9,
    reviews: 312,
    author: 'Agile Masters',
    tags: ['Product Owner', 'Scrum', 'Agile'],
    level: 'Intermédiaire',
    type: 'module',
    featured: false
  },
  {
    id: '9',
    title: 'Business Analyst Expert',
    description: 'Analyse fonctionnelle et expression des besoins métier',
    category: 'AMOA',
    rating: 4.6,
    reviews: 178,
    author: 'BA Institute',
    tags: ['Business Analysis', 'UML', 'Cahier des charges'],
    level: 'Avancé',
    type: 'module',
    featured: false
  },
  
  // Agilité - 3 modules
  {
    id: '10',
    title: 'Scrum Master Certifié',
    description: 'Formation complète Scrum Master avec certification PSM',
    category: 'Agilité',
    rating: 4.8,
    reviews: 289,
    author: 'Scrum Alliance',
    tags: ['Scrum Master', 'PSM', 'Animation'],
    level: 'Intermédiaire',
    type: 'module',
    featured: true
  },
  {
    id: '11',
    title: 'SAFe Program Manager',
    description: 'Pilotage de programmes Agile à l\'échelle avec SAFe',
    category: 'Agilité',
    rating: 4.7,
    reviews: 167,
    author: 'SAFe Institute',
    tags: ['SAFe', 'Programme', 'Scaling'],
    level: 'Expert',
    type: 'module',
    featured: false
  },
  {
    id: '12',
    title: 'DevOps & CI/CD',
    description: 'Intégration et déploiement continus avec approche DevOps',
    category: 'Agilité',
    rating: 4.9,
    reviews: 245,
    author: 'DevOps Academy',
    tags: ['DevOps', 'CI/CD', 'Docker'],
    level: 'Avancé',
    type: 'module',
    featured: true
  },
  
  // Outils clés en main
  {
    id: '13',
    title: 'Plateforme de Veille Technologique',
    description: 'Outil IA pour surveiller les tendances tech et cyber en temps réel',
    category: 'Outils',
    rating: 4.6,
    reviews: 134,
    author: 'VeilleTech',
    tags: ['Veille', 'IA', 'Monitoring'],
    level: 'Débutant',
    type: 'outil',
    featured: false
  },
  {
    id: '14',
    title: 'Générateur de Réponses AO',
    description: 'Assistant IA pour générer des réponses aux appels d\'offres personnalisées',
    category: 'Outils',
    rating: 4.8,
    reviews: 98,
    author: 'BidGenius',
    tags: ['Appel d\'offres', 'IA', 'Rédaction'],
    level: 'Intermédiaire',
    type: 'outil',
    featured: true
  },
  {
    id: '15',
    title: 'Audit de Vulnérabilités Automatisé',
    description: 'Scanner de sécurité complet avec reporting automatique',
    category: 'Outils',
    rating: 4.7,
    reviews: 156,
    author: 'SecureScan',
    tags: ['Audit', 'Vulnérabilités', 'Automatisation'],
    level: 'Intermédiaire',
    type: 'outil',
    featured: false
  },
  {
    id: '16',
    title: 'Dashboard Analytics Temps Réel',
    description: 'Tableaux de bord personnalisables avec connexions multi-sources',
    category: 'Outils',
    rating: 4.5,
    reviews: 123,
    author: 'DataViz Pro',
    tags: ['Dashboard', 'Analytics', 'Visualisation'],
    level: 'Débutant',
    type: 'outil',
    featured: false
  },
  {
    id: '17',
    title: 'Assistant IA Project Management',
    description: 'IA pour planification automatique et suivi de projets Agile',
    category: 'Outils',
    rating: 4.9,
    reviews: 201,
    author: 'ProjectAI',
    tags: ['Project Management', 'IA', 'Planification'],
    level: 'Avancé',
    type: 'outil',
    featured: true
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
      case 'rating':
        return b.rating - a.rating;
      case 'popular':
        return b.reviews - a.reviews;
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
                <option value="rating">Mieux notés</option>
                <option value="popular">Plus populaires</option>
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
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-gray-400 text-sm">({item.reviews})</span>
                          </div>
                          <Badge variant="outline" className="text-orange-400 border-orange-400">
                            Bientôt disponible
                          </Badge>
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
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => addToCart(item.id)}
                            disabled={cartItems.includes(item.id)}
                          >
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            {cartItems.includes(item.id) ? 'Dans le panier' : 'Ajouter'}
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
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-gray-400 text-sm">({item.reviews})</span>
                        </div>
                        <Badge variant="outline" className="text-orange-400 border-orange-400">
                          Bientôt disponible
                        </Badge>
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
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => addToCart(item.id)}
                          disabled={cartItems.includes(item.id)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {cartItems.includes(item.id) ? 'Dans le panier' : 'Ajouter'}
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