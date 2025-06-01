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
  // Cybersécurité
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
    title: 'Kit d\'Audit de Sécurité',
    description: 'Collection d\'outils automatisés pour auditer la sécurité d\'une infrastructure',
    category: 'Cybersécurité',
    rating: 4.6,
    reviews: 89,
    author: 'SecurityTools Pro',
    tags: ['Audit', 'Automatisation', 'Pentest'],
    level: 'Intermédiaire',
    type: 'outil',
    featured: false
  },
  {
    id: '3',
    title: 'Certification Éthique Hacker',
    description: 'Parcours CEH complet avec labs de pentest et certification officielle',
    category: 'Cybersécurité',
    rating: 4.8,
    reviews: 198,
    author: 'EthicalHack Pro',
    tags: ['CEH', 'Pentest', 'Éthique'],
    level: 'Expert',
    type: 'certification',
    featured: true
  },
  {
    id: '4',
    title: 'Simulation Crise Ransomware',
    description: 'Scénario immersif de gestion de crise cyber avec équipe virtuelle',
    category: 'Cybersécurité',
    rating: 4.7,
    reviews: 67,
    author: 'CyberSim',
    tags: ['Ransomware', 'Crise', 'Simulation'],
    level: 'Intermédiaire',
    type: 'scenario',
    featured: false
  },
  // Data & IA
  {
    id: '5',
    title: 'Machine Learning pour Data Scientists',
    description: 'Cours avancé ML avec projets pratiques et datasets réels',
    category: 'Data & IA',
    rating: 4.9,
    reviews: 256,
    author: 'AI Academy',
    tags: ['ML', 'Python', 'Data Science'],
    level: 'Avancé',
    type: 'module',
    featured: true
  },
  {
    id: '6',
    title: 'Générateur de Code IA',
    description: 'Outil d\'IA pour générer du code sécurisé en multiple langages',
    category: 'Data & IA',
    rating: 4.5,
    reviews: 134,
    author: 'CodeGen AI',
    tags: ['IA', 'Code', 'Automatisation'],
    level: 'Débutant',
    type: 'outil',
    featured: false
  },
  {
    id: '7',
    title: 'Analytics Avancés avec Python',
    description: 'Maîtrisez l\'analyse de données avec pandas, numpy et matplotlib',
    category: 'Data & IA',
    rating: 4.7,
    reviews: 189,
    author: 'DataPro',
    tags: ['Python', 'Analytics', 'Visualisation'],
    level: 'Intermédiaire',
    type: 'module',
    featured: false
  },
  // Comptabilité
  {
    id: '8',
    title: 'Comptabilité Générale Expert',
    description: 'Formation complète en comptabilité générale et analytique',
    category: 'Comptabilité',
    rating: 4.6,
    reviews: 145,
    author: 'ComptaExpert',
    tags: ['Comptabilité', 'Gestion', 'Finance'],
    level: 'Avancé',
    type: 'module',
    featured: false
  },
  {
    id: '9',
    title: 'Outils de Clôture Comptable',
    description: 'Automatisation des processus de clôture mensuelle et annuelle',
    category: 'Comptabilité',
    rating: 4.4,
    reviews: 98,
    author: 'FinanceTools',
    tags: ['Clôture', 'Automatisation', 'Reporting'],
    level: 'Intermédiaire',
    type: 'outil',
    featured: false
  },
  {
    id: '10',
    title: 'Certification Comptable',
    description: 'Préparation à la certification comptable professionnelle',
    category: 'Comptabilité',
    rating: 4.8,
    reviews: 167,
    author: 'CertifCompta',
    tags: ['Certification', 'Comptabilité', 'Professionnel'],
    level: 'Expert',
    type: 'certification',
    featured: true
  },
  // Paie
  {
    id: '11',
    title: 'Gestion de Paie Complète',
    description: 'Formation complète sur la gestion de paie et les charges sociales',
    category: 'Paie',
    rating: 4.7,
    reviews: 203,
    author: 'PaieExpert',
    tags: ['Paie', 'Social', 'Charges'],
    level: 'Avancé',
    type: 'module',
    featured: true
  },
  {
    id: '12',
    title: 'Calculateur de Paie Automatisé',
    description: 'Outil automatisé pour le calcul des bulletins de paie',
    category: 'Paie',
    rating: 4.5,
    reviews: 176,
    author: 'PayrollTech',
    tags: ['Automatisation', 'Calcul', 'Bulletin'],
    level: 'Intermédiaire',
    type: 'outil',
    featured: false
  },
  {
    id: '13',
    title: 'Simulation Audit Social',
    description: 'Scénario d\'audit social avec contrôle URSSAF',
    category: 'Paie',
    rating: 4.6,
    reviews: 123,
    author: 'SocialAudit',
    tags: ['Audit', 'URSSAF', 'Contrôle'],
    level: 'Avancé',
    type: 'scenario',
    featured: false
  },
  // AMOA/Projet
  {
    id: '14',
    title: 'Maîtrise d\'Ouvrage Digitale',
    description: 'Techniques modernes de maîtrise d\'ouvrage pour projets digitaux',
    category: 'AMOA',
    rating: 4.8,
    reviews: 234,
    author: 'DigitalMOA',
    tags: ['AMOA', 'Digital', 'Projet'],
    level: 'Avancé',
    type: 'module',
    featured: true
  },
  {
    id: '15',
    title: 'Kit Outils MOA',
    description: 'Boîte à outils complète pour le maître d\'ouvrage',
    category: 'AMOA',
    rating: 4.4,
    reviews: 156,
    author: 'MOATools',
    tags: ['Outils', 'Template', 'Méthode'],
    level: 'Intermédiaire',
    type: 'outil',
    featured: false
  },
  // Management
  {
    id: '16',
    title: 'Leadership Digital',
    description: 'Développez vos compétences de leadership à l\'ère numérique',
    category: 'Management',
    rating: 4.9,
    reviews: 278,
    author: 'LeadershipPro',
    tags: ['Leadership', 'Digital', 'Management'],
    level: 'Expert',
    type: 'module',
    featured: true
  },
  {
    id: '17',
    title: 'Gestion d\'Équipe Hybride',
    description: 'Techniques de management pour équipes hybrides et distantes',
    category: 'Management',
    rating: 4.6,
    reviews: 187,
    author: 'HybridManager',
    tags: ['Hybride', 'Remote', 'Équipe'],
    level: 'Avancé',
    type: 'module',
    featured: false
  }
];

const categories = ['Tous', 'Cybersécurité', 'Data & IA', 'Comptabilité', 'Paie', 'AMOA', 'Management', 'Certifications'];

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
                          <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Ajouter
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
                        <span className="text-xl font-bold text-blue-400">{item.price}€</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-blue-900/30 text-blue-300 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Ajouter
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