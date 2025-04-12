import React, { useState } from 'react';
import { SocialProfile, SocialPost } from './types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Calendar, MapPin, Check, Image, MessageCircle, 
  Heart, Share2, Search, Filter, ArrowLeft
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

interface SocialMediaViewerProps {
  profiles: SocialProfile[];
  addEvidence: (evidence: any) => void;
}

export const SocialMediaViewer: React.FC<SocialMediaViewerProps> = ({
  profiles,
  addEvidence
}) => {
  const [selectedProfile, setSelectedProfile] = useState<SocialProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'media'>('posts');
  const [platform, setPlatform] = useState<'twitter' | 'facebook' | 'linkedin' | 'instagram'>('twitter');
  const [searchUsername, setSearchUsername] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Collection de profils pour la démonstration
  const availableProfiles: SocialProfile[] = [
    {
      id: 'profile-001',
      username: 'cyber_detective',
      displayName: 'Alex Martin',
      profileImage: 'https://i.pravatar.cc/150?img=12',
      bio: 'Expert en cybersécurité | Consultant | Conférencier | Les opinions exprimées sont personnelles',
      followers: 1247,
      following: 865,
      location: 'Paris, France',
      joinDate: '2018-05-21',
      lastActive: '2025-04-01',
      verified: true,
      platform: 'twitter',
      posts: [
        {
          id: 'post-001',
          content: "Nouvelle analyse des vulnérabilités découvertes ce mois-ci. Les entreprises doivent impérativement mettre à jour leurs systèmes. #cybersécurité #infosec",
          date: '2025-04-01',
          likes: 53,
          comments: 7,
          shares: 12,
          evidenceValue: 'medium'
        },
        {
          id: 'post-002',
          content: "Aujourd'hui, déplacement à Lyon pour une conférence sur la sécurité des systèmes IoT. Ravi de partager mon expertise avec la communauté locale.",
          date: '2025-03-28',
          likes: 28,
          comments: 4,
          shares: 3,
          evidenceValue: 'low'
        },
        {
          id: 'post-003',
          content: "URGENT: J'ai identifié une faille critique dans un logiciel largement utilisé. Détails dans mon dernier article. Prenez les mesures nécessaires immédiatement. #alerte #cybersécurité",
          date: '2025-03-25',
          likes: 112,
          comments: 24,
          shares: 67,
          evidenceValue: 'high'
        }
      ]
    },
    {
      id: 'profile-002',
      username: 'sarah.tech',
      displayName: 'Sarah Dubois',
      profileImage: 'https://i.pravatar.cc/150?img=5',
      bio: 'Spécialiste en sécurité informatique 👩‍💻 | Hackeuse éthique certifiée | Passionnée par la protection des données',
      followers: 2896,
      following: 731,
      location: 'Montréal, Canada',
      joinDate: '2017-11-12',
      lastActive: '2025-04-02',
      verified: true,
      platform: 'twitter',
      posts: [
        {
          id: 'post-sarah-001',
          content: "Je viens de publier mon analyse sur la récente faille de sécurité dans le framework populaire. Lien dans ma bio. #infosec #vuln",
          date: '2025-04-02',
          likes: 87,
          comments: 13,
          shares: 32,
          evidenceValue: 'high'
        },
        {
          id: 'post-sarah-002',
          content: "Belle journée pour une démonstration de hacking éthique au @CyberSummit2025. Si vous êtes dans le coin, passez me voir au stand 15!",
          date: '2025-03-30',
          likes: 45,
          comments: 7,
          shares: 5,
          evidenceValue: 'medium'
        }
      ]
    },
    {
      id: 'profile-003', 
      username: 'thomas.informatique',
      displayName: 'Thomas Lefebvre',
      profileImage: 'https://i.pravatar.cc/150?img=68',
      bio: 'Ingénieur systèmes | Admin réseau chez @TechCorp | Amoureux du café et des configurations serveur sécurisées ☕',
      followers: 652,
      following: 434,
      location: 'Nantes, France',
      joinDate: '2019-03-05',
      lastActive: '2025-03-29',
      verified: false,
      platform: 'linkedin',
      posts: [
        {
          id: 'post-thomas-001',
          content: "Je suis fier d'annoncer que notre équipe infrastructure vient de terminer la mise à niveau majeure de notre architecture réseau pour renforcer la sécurité des données de nos clients. #ProjetRéussi #Cybersécurité",
          date: '2025-03-29',
          likes: 43,
          comments: 8,
          shares: 2,
          evidenceValue: 'medium'
        }
      ]
    }
  ];

  // Définir un profil par défaut à partir de la collection disponible
  const defaultProfile = availableProfiles[0];

  // Fonction pour sauvegarder un post comme preuve
  const savePostAsEvidence = (post: SocialPost) => {
    const currentProfile = selectedProfile || defaultProfile;
    const evidence = {
      id: `evidence-${Date.now()}`,
      title: `Post par ${currentProfile.displayName}`,
      content: post.content,
      date: post.date,
      source: `${currentProfile.platform} (@${currentProfile.username})`,
      type: 'social-post',
      relevance: post.evidenceValue === 'high' ? 0.9 : post.evidenceValue === 'medium' ? 0.6 : 0.3
    };
    
    addEvidence(evidence);
  };

  // Recherche de profils
  const handleSearch = () => {
    if (searchUsername.trim().length > 0) {
      setShowSearchResults(true);
    }
  };

  // Sélection d'un profil
  const selectProfile = (profile: SocialProfile) => {
    setSelectedProfile(profile);
    setShowSearchResults(false);
  };

  // Interface de recherche de profils
  const renderSearchInterface = () => {
    return (
      <div className="bg-slate-900 rounded-lg p-4 mb-4">
        <div className="flex items-center mb-4">
          {platform === 'twitter' && (
            <div className="flex items-center text-sky-500">
              <span className="text-xl font-bold mr-2">X</span>
              <h3 className="text-lg font-medium">Explorer</h3>
            </div>
          )}
          {platform === 'linkedin' && (
            <div className="flex items-center text-blue-500">
              <span className="text-xl font-bold mr-2">in</span>
              <h3 className="text-lg font-medium">LinkedIn</h3>
            </div>
          )}
          {platform === 'facebook' && (
            <div className="flex items-center text-blue-600">
              <span className="text-xl font-bold mr-2">f</span>
              <h3 className="text-lg font-medium">Facebook</h3>
            </div>
          )}
          {platform === 'instagram' && (
            <div className="flex items-center text-pink-500">
              <span className="text-xl font-bold mr-2">I</span>
              <h3 className="text-lg font-medium">Instagram</h3>
            </div>
          )}
          
          <div className="ml-auto flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className={platform === 'twitter' ? 'bg-sky-500/10 border-sky-500/50 text-sky-500' : 'bg-transparent'}
              onClick={() => setPlatform('twitter')}
            >
              Twitter
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className={platform === 'linkedin' ? 'bg-blue-500/10 border-blue-500/50 text-blue-500' : 'bg-transparent'}
              onClick={() => setPlatform('linkedin')}
            >
              LinkedIn
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className={platform === 'facebook' ? 'bg-blue-600/10 border-blue-600/50 text-blue-600' : 'bg-transparent'}
              onClick={() => setPlatform('facebook')}
            >
              Facebook
            </Button>
          </div>
        </div>
        
        <div className="relative">
          <Input 
            placeholder="Rechercher un utilisateur..." 
            className="bg-slate-800 border-slate-700 text-white pl-10"
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Button 
            className="absolute right-1 top-1/2 transform -translate-y-1/2"
            size="sm"
            onClick={handleSearch}
          >
            Rechercher
          </Button>
        </div>
        
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-400 flex-wrap">
          <span className="flex items-center px-2 py-1 rounded-full bg-slate-800 border border-slate-700">
            <Filter className="h-3 w-3 mr-1" />
            Utilisateurs vérifiés
          </span>
          <span className="flex items-center px-2 py-1 rounded-full bg-slate-800 border border-slate-700">
            Actifs récemment
          </span>
          <span className="flex items-center px-2 py-1 rounded-full bg-slate-800 border border-slate-700">
            En France
          </span>
          <span className="flex items-center px-2 py-1 rounded-full bg-slate-800 border border-slate-700">
            Cybersécurité
          </span>
        </div>
      </div>
    );
  };

  // Rendu des résultats de recherche
  const renderSearchResults = () => {
    return (
      <div className="space-y-4 mt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">Résultats de recherche</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-gray-400"
            onClick={() => setShowSearchResults(false)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Revenir
          </Button>
        </div>
        <Separator className="bg-gray-800" />
        
        {availableProfiles.filter(p => p.platform === platform).map(profile => (
          <div 
            key={profile.id} 
            className="bg-slate-800 rounded-lg p-3 hover:bg-slate-700 transition cursor-pointer"
            onClick={() => selectProfile(profile)}
          >
            <div className="flex items-center space-x-3">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={profile.displayName} className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
              )}
              <div>
                <div className="flex items-center">
                  <h4 className="text-white font-medium">{profile.displayName}</h4>
                  {profile.verified && (
                    <span className="ml-1 text-blue-400">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm">@{profile.username}</p>
              </div>
              <div className="ml-auto text-xs text-gray-400">
                <div>{profile.followers} abonnés</div>
                <div>{profile.location}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Rendu des informations du profil
  const renderProfileInformation = (profile: SocialProfile) => {
    return (
      <div className="bg-slate-800 rounded-lg p-4">
        {/* En-tête du profil */}
        <div className="flex justify-between items-center mb-4">
          <button 
            className="text-gray-400 hover:text-white flex items-center"
            onClick={() => setShowSearchResults(true)}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Retour
          </button>
          
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="text-gray-300 border-gray-700">
              Suivre
            </Button>
            <Button size="sm" variant="outline" className="text-gray-300 border-gray-700">
              Partager
            </Button>
          </div>
        </div>

        {/* Photo de couverture (simulée) */}
        <div className="h-32 bg-gradient-to-r from-slate-700 to-slate-600 rounded-lg mb-4"></div>
        
        <div className="flex items-start space-x-4 -mt-10">
          {profile.profileImage ? (
            <img src={profile.profileImage} alt={profile.displayName} className="w-16 h-16 rounded-full border-2 border-slate-800" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center border-2 border-slate-800">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1 mt-10">
            <div className="flex items-center">
              <h3 className="text-white font-semibold text-lg">{profile.displayName}</h3>
              {profile.verified && (
                <span className="ml-1 text-blue-400">
                  <Check className="h-4 w-4" />
                </span>
              )}
            </div>
            <p className="text-gray-400">@{profile.username}</p>
            <p className="text-gray-300 mt-2">{profile.bio}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
              <span className="flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {profile.location}
              </span>
              <span className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                Membre depuis {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'Inconnue'}
              </span>
            </div>
            <div className="flex space-x-4 mt-2 text-sm">
              <span className="text-gray-300"><strong>{profile.followers}</strong> <span className="text-gray-400">abonnés</span></span>
              <span className="text-gray-300"><strong>{profile.following}</strong> <span className="text-gray-400">abonnements</span></span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Rendu des posts du profil
  const renderPosts = (profile: SocialProfile) => {
    return (
      <div className="space-y-4 mt-4">
        {profile.posts.map(post => (
          <div key={post.id} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
            <div className="flex items-center mb-3">
              {profile.profileImage ? (
                <img src={profile.profileImage} alt={profile.displayName} className="w-8 h-8 rounded-full mr-3" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center mr-3">
                  <User className="w-4 h-4 text-gray-400" />
                </div>
              )}
              <div>
                <div className="flex items-center">
                  <span className="text-white font-medium">{profile.displayName}</span>
                  {profile.verified && <Check className="h-3 w-3 ml-1 text-blue-400" />}
                </div>
                <div className="text-gray-500 text-xs">@{profile.username}</div>
              </div>
              <span className="ml-auto text-xs text-gray-500">
                {post.date ? new Date(post.date).toLocaleDateString() : 'Date inconnue'}
              </span>
            </div>
            
            <p className="text-white text-sm mb-3">{post.content}</p>
            
            <div className="flex justify-between items-center mt-4 border-t border-slate-700 pt-3">
              <div className="flex space-x-4 text-xs text-gray-400">
                <span className="flex items-center">
                  <Heart className="h-3 w-3 mr-1" />
                  {post.likes}
                </span>
                <span className="flex items-center">
                  <MessageCircle className="h-3 w-3 mr-1" />
                  {post.comments}
                </span>
                <span className="flex items-center">
                  <Share2 className="h-3 w-3 mr-1" />
                  {post.shares}
                </span>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-6 px-2 text-xs border-slate-600 hover:bg-slate-700"
                onClick={() => savePostAsEvidence(post)}
              >
                Ajouter aux preuves
              </Button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Simulation d'onglet "À propos"
  const renderAboutTab = (profile: SocialProfile) => {
    return (
      <div className="mt-4 space-y-4">
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-3">Informations personnelles</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Nom</span>
              <span className="text-white">{profile.displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Localisation</span>
              <span className="text-white">{profile.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Compte créé le</span>
              <span className="text-white">{profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'Date inconnue'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Dernière activité</span>
              <span className="text-white">{profile.lastActive ? new Date(profile.lastActive).toLocaleDateString() : 'Date inconnue'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Statut</span>
              <span className="text-white flex items-center">
                {profile.verified ? 'Vérifié ' : 'Non vérifié '}
                {profile.verified && <Check className="h-3 w-3 ml-1 text-blue-400" />}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-3">Activité</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Total des publications</span>
              <span className="text-white">{profile.posts.length} posts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Fréquence de publication</span>
              <span className="text-white">2-3 fois par semaine</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sujets fréquents</span>
              <span className="text-white">Cybersécurité, Technologie, Conférences</span>
            </div>
          </div>
        </div>
        
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={() => {
            const evidence = {
              id: `evidence-${Date.now()}`,
              title: `Profil de ${profile.displayName}`,
              content: `Informations de profil pour ${profile.displayName} (@${profile.username}). Compte créé le ${profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'date inconnue'}, actuellement basé à ${profile.location}.`,
              type: 'profile-information',
              source: `${profile.platform}`,
              relevance: 0.85
            };
            addEvidence(evidence);
          }}
        >
          Sauvegarder le profil comme preuve
        </Button>
      </div>
    );
  };

  // État final pour l'affichage
  const profileToRender = selectedProfile || defaultProfile;

  // Détermine ce qui est affiché
  const renderContent = () => {
    if (!selectedProfile && !showSearchResults) {
      return (
        <>
          {renderSearchInterface()}
          <div className="text-center py-10 text-gray-400">
            <User className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <h2 className="text-xl mb-2 text-gray-300">Recherchez un utilisateur</h2>
            <p className="max-w-md mx-auto">Utilisez l'interface de recherche ci-dessus pour trouver des profils sur les réseaux sociaux qui pourraient être liés à votre enquête.</p>
          </div>
        </>
      );
    } 
    
    if (showSearchResults) {
      return (
        <>
          {renderSearchInterface()}
          {renderSearchResults()}
        </>
      );
    }
    
    return (
      <>
        {renderProfileInformation(profileToRender)}
        
        <Tabs defaultValue="posts" className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="posts">Publications</TabsTrigger>
            <TabsTrigger value="about">À propos</TabsTrigger>
            <TabsTrigger value="media">Médias</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-0">
            {renderPosts(profileToRender)}
          </TabsContent>
          
          <TabsContent value="about" className="mt-0">
            {renderAboutTab(profileToRender)}
          </TabsContent>
          
          <TabsContent value="media" className="mt-0">
            <div className="mt-4 py-12 text-center text-gray-400 bg-slate-800 rounded">
              <Image className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>Aucun média disponible</p>
              <p className="text-sm mt-1">Ce compte n'a pas partagé de photos ou vidéos récemment</p>
            </div>
          </TabsContent>
        </Tabs>
      </>
    );
  };

  return (
    <div className="space-y-4">
      {renderContent()}
    </div>
  );
};