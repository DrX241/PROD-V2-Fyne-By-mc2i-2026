import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Search,
  BookOpen,
  AlertCircle,
  Shield,
  Lock,
  Server,
  Database,
  Network,
  Layers,
  Users,
  Code,
  FileText,
  Bug,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import PageTitle from '@/components/utils/PageTitle';

export default function GlossaireVisuel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  
  // Définition des catégories
  const categories = [
    { id: 'all', name: 'Tous les termes' },
    { id: 'basics', name: 'Concepts de base' },
    { id: 'threats', name: 'Menaces' },
    { id: 'tools', name: 'Outils & technologies' },
    { id: 'protocols', name: 'Protocoles' }
  ];
  
  // Données du glossaire
  const glossaryItems = [
    {
      id: 'firewall',
      term: 'Pare-feu (Firewall)',
      definition: 'Système de sécurité qui surveille et filtre le trafic réseau entrant et sortant selon des règles prédéfinies.',
      category: 'tools',
      icon: <Shield />,
      color: 'blue',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/Network-Firewall.jpeg'
    },
    {
      id: 'malware',
      term: 'Logiciel malveillant (Malware)',
      definition: 'Programme conçu pour s\'infiltrer dans un système informatique et y exécuter des actions malveillantes, comme voler des données ou perturber le fonctionnement.',
      category: 'threats',
      icon: <Bug />,
      color: 'red',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/Malware.jpeg'
    },
    {
      id: 'encryption',
      term: 'Chiffrement (Encryption)',
      definition: 'Processus de conversion des données en format illisible, qui ne peut être décodé qu\'avec une clé de déchiffrement.',
      category: 'basics',
      icon: <Lock />,
      color: 'green',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/Encryption.jpeg'
    },
    {
      id: 'vpn',
      term: 'Réseau privé virtuel (VPN)',
      definition: 'Technologie permettant de créer une connexion sécurisée et chiffrée sur un réseau moins sécurisé, comme Internet.',
      category: 'tools',
      icon: <Network />,
      color: 'purple',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/VPN.jpeg'
    },
    {
      id: 'phishing',
      term: 'Hameçonnage (Phishing)',
      definition: 'Technique frauduleuse visant à obtenir des informations sensibles en se faisant passer pour une entité de confiance.',
      category: 'threats',
      icon: <AlertCircle />,
      color: 'amber',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/Phishing.jpeg'
    },
    {
      id: 'ids',
      term: 'Système de détection d\'intrusion (IDS)',
      definition: 'Dispositif ou application qui surveille un réseau ou un système pour détecter toute activité malveillante ou violation de politique.',
      category: 'tools',
      icon: <Shield />,
      color: 'blue',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/IDS.jpeg'
    },
    {
      id: 'ransomware',
      term: 'Rançongiciel (Ransomware)',
      definition: 'Type de logiciel malveillant qui chiffre les fichiers de la victime et exige une rançon pour les déchiffrer.',
      category: 'threats',
      icon: <Lock />,
      color: 'red',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/Ransomware.jpeg'
    },
    {
      id: 'tls-ssl',
      term: 'TLS/SSL',
      definition: 'Protocoles cryptographiques qui assurent la sécurité des communications sur Internet en chiffrant les données.',
      category: 'protocols',
      icon: <Lock />,
      color: 'green',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/SSL.jpeg'
    },
    {
      id: 'ddos',
      term: 'Attaque par déni de service distribué (DDoS)',
      definition: 'Attaque visant à rendre un service en ligne indisponible en surchargeant ses ressources avec un trafic provenant de multiples sources.',
      category: 'threats',
      icon: <Network />,
      color: 'red',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/DDoS.jpeg'
    },
    {
      id: 'waf',
      term: 'Pare-feu d\'application Web (WAF)',
      definition: 'Outil de sécurité qui filtre, surveille et bloque le trafic HTTP/HTTPS vers et depuis une application Web.',
      category: 'tools',
      icon: <Shield />,
      color: 'blue',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/WAF.jpeg'
    },
    {
      id: 'zero-day',
      term: 'Vulnérabilité zero-day',
      definition: 'Faille de sécurité dans un logiciel qui est inconnue du fournisseur et qui peut être exploitée avant qu\'un correctif ne soit disponible.',
      category: 'threats',
      icon: <AlertCircle />,
      color: 'amber',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/Zero-Day.jpeg'
    },
    {
      id: 'soc',
      term: 'Centre des opérations de sécurité (SOC)',
      definition: 'Équipe et infrastructure dédiées à la surveillance et à l\'analyse de la posture de sécurité d\'une organisation en continu.',
      category: 'basics',
      icon: <Users />,
      color: 'blue',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/SOC.jpeg'
    },
    {
      id: 'oauth',
      term: 'OAuth',
      definition: 'Protocole d\'autorisation ouvert permettant à des applications tierces d\'accéder à des ressources protégées sans partager les identifiants.',
      category: 'protocols',
      icon: <Key />,
      color: 'green',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/OAuth.jpeg'
    },
    {
      id: 'hids',
      term: 'Système de détection d\'intrusion sur hôte (HIDS)',
      definition: 'Solution de sécurité qui surveille et analyse les activités sur un seul hôte ou système pour détecter les signes d\'intrusion.',
      category: 'tools',
      icon: <Server />,
      color: 'blue',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/HIDS.jpeg'
    },
    {
      id: 'apt',
      term: 'Menace persistante avancée (APT)',
      definition: 'Attaque prolongée et ciblée dans laquelle un attaquant obtient un accès non autorisé à un réseau et y reste indétecté pendant une période prolongée.',
      category: 'threats',
      icon: <Bug />,
      color: 'red',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/APT.jpeg'
    },
    {
      id: 'xss',
      term: 'Cross-Site Scripting (XSS)',
      definition: 'Vulnérabilité web qui permet à un attaquant d\'injecter des scripts malveillants dans des pages web consultées par d\'autres utilisateurs.',
      category: 'threats',
      icon: <Code />,
      color: 'red',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/XSS.jpeg'
    },
    {
      id: 'iam',
      term: 'Gestion des identités et des accès (IAM)',
      definition: 'Cadre de politiques et technologies pour gérer les identités numériques et contrôler leur accès aux ressources.',
      category: 'basics',
      icon: <Users />,
      color: 'blue',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/IAM.jpeg'
    },
    {
      id: 'mfa',
      term: 'Authentification multifacteur (MFA)',
      definition: 'Méthode d\'authentification nécessitant deux ou plusieurs facteurs de vérification pour accorder l\'accès.',
      category: 'basics',
      icon: <Lock />,
      color: 'green',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/MFA.jpeg'
    },
    {
      id: 'dlp',
      term: 'Prévention de perte de données (DLP)',
      definition: 'Stratégies et outils conçus pour détecter et prévenir la transmission non autorisée de données sensibles.',
      category: 'tools',
      icon: <Database />,
      color: 'blue',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/DLP.jpeg'
    },
    {
      id: 'siem',
      term: 'Gestion des informations et événements de sécurité (SIEM)',
      definition: 'Solution qui combine la gestion des informations de sécurité et la gestion des événements pour fournir une analyse en temps réel des alertes de sécurité.',
      category: 'tools',
      icon: <Layers />,
      color: 'blue',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/SIEM.jpeg'
    },
    {
      id: 'pki',
      term: 'Infrastructure à clé publique (PKI)',
      definition: 'Ensemble de rôles, politiques et procédures nécessaires à la création, gestion et distribution de certificats numériques.',
      category: 'protocols',
      icon: <Key />,
      color: 'green',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/PKI.jpeg'
    },
    {
      id: 'sql-injection',
      term: 'Injection SQL',
      definition: 'Technique d\'attaque consistant à insérer du code SQL malveillant dans une requête pour manipuler la base de données.',
      category: 'threats',
      icon: <Database />,
      color: 'red',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/SQL-Injection.jpeg'
    },
    {
      id: 'two-factor',
      term: 'Authentification à deux facteurs (2FA)',
      definition: 'Méthode de sécurité nécessitant deux formes distinctes d\'identification pour accéder à un compte ou un système.',
      category: 'basics',
      icon: <Key />,
      color: 'green',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/2FA.jpeg'
    },
    {
      id: 'saml',
      term: 'Security Assertion Markup Language (SAML)',
      definition: 'Standard ouvert pour l\'échange de données d\'authentification et d\'autorisation entre parties.',
      category: 'protocols',
      icon: <FileText />,
      color: 'green',
      image: 'https://cybersecurityglossary.com/wp-content/uploads/2023/03/SAML.jpeg'
    }
  ];
  
  // Filtrer les termes du glossaire selon la recherche et la catégorie
  const filteredItems = glossaryItems.filter(item => {
    const matchesSearch = searchTerm.toLowerCase() === '' || 
      item.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.definition.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Fonction pour générer une couleur de badge basée sur la catégorie
  const getCategoryColor = (category: string) => {
    switch(category) {
      case 'basics':
        return 'bg-green-700/50 hover:bg-green-700/70 text-green-100';
      case 'threats':
        return 'bg-red-700/50 hover:bg-red-700/70 text-red-100';
      case 'tools':
        return 'bg-blue-700/50 hover:bg-blue-700/70 text-blue-100';
      case 'protocols':
        return 'bg-violet-700/50 hover:bg-violet-700/70 text-violet-100';
      default:
        return 'bg-slate-700/50 hover:bg-slate-700/70 text-slate-100';
    }
  };
  
  // Fonction pour obtenir le texte lisible de la catégorie
  const getCategoryText = (category: string) => {
    switch(category) {
      case 'basics':
        return 'Concepts de base';
      case 'threats':
        return 'Menaces';
      case 'tools':
        return 'Outils & technologies';
      case 'protocols':
        return 'Protocoles';
      default:
        return '';
    }
  };
  
  // Trier les termes par ordre alphabétique
  const sortedItems = [...filteredItems].sort((a, b) => a.term.localeCompare(b.term));
  
  return (
    <div className="min-h-screen bg-[#0a1429]">
      <PageTitle title="Glossaire visuel | Centre de formation" />
      
      {/* En-tête */}
      <header className="border-b border-blue-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-blue-300 hover:bg-blue-900/30 hover:text-blue-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au centre de formation
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Glossaire visuel</h1>
        </div>
      </header>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Glossaire visuel de cybersécurité</h1>
          <p className="text-blue-300 max-w-3xl">
            Explorez les termes clés de la cybersécurité avec notre glossaire visuel. Chaque définition est accompagnée d'une illustration pour faciliter la compréhension et la mémorisation.
          </p>
        </div>
        
        {/* Barre de recherche et filtres */}
        <div className="mb-8">
          <div className="relative w-full mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-blue-400" />
            <Input
              placeholder="Rechercher un terme ou une définition..."
              className="pl-10 bg-blue-950/70 border-blue-500/30 text-white focus:border-blue-500 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="bg-blue-950/70 border border-blue-800/60 w-full overflow-x-auto">
              {categories.map(category => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="data-[state=active]:bg-blue-700"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {/* Glossaire */}
        {sortedItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedItems.map((item) => (
              <Card key={item.id} className="bg-blue-950/70 border-blue-700/30 overflow-hidden hover:bg-blue-900/60 transition-colors">
                <div className="h-40 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 to-transparent z-10" />
                  <div 
                    className="h-full w-full bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url('${item.image}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  />
                  <div className="absolute bottom-4 left-4 z-20">
                    <Badge className={getCategoryColor(item.category)}>
                      {getCategoryText(item.category)}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md bg-${item.color}-700/50`}>
                      {item.icon}
                    </div>
                    <CardTitle className="text-lg font-medium">{item.term}</CardTitle>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-blue-200">{item.definition}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-blue-900/30 rounded-lg p-8 text-center">
            <BookOpen className="h-12 w-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Aucun terme trouvé</h3>
            <p className="text-blue-300 mb-4">
              Aucun terme ne correspond à vos critères de recherche.
            </p>
            <Button 
              variant="outline" 
              className="border-blue-500 text-blue-400"
              onClick={() => {
                setSearchTerm('');
                setActiveCategory('all');
              }}
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}