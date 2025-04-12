import React, { useState } from 'react';
import { SocialProfile, SocialPost } from './types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Calendar, MapPin, Check, File, Link, Image, MessageCircle, Heart, Share2 } from 'lucide-react';

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

  // Profil par défaut pour la démonstration
  const defaultProfile: SocialProfile = {
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
  };

  const renderProfileInformation = (profile: SocialProfile) => {
    return (
      <div className="bg-gray-700 rounded-lg p-4">
        <div className="flex items-start space-x-4">
          {profile.profileImage ? (
            <img src={profile.profileImage} alt={profile.displayName} className="w-16 h-16 rounded-full" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center">
              <User className="w-8 h-8 text-gray-400" />
            </div>
          )}
          <div className="flex-1">
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
            <div className="flex space-x-4 mt-3 text-sm text-gray-400">
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

  // Fonction pour sauvegarder un post comme preuve
  const savePostAsEvidence = (post: SocialPost) => {
    const evidence = {
      id: `evidence-${Date.now()}`,
      title: `Post par ${selectedProfile?.displayName || defaultProfile.displayName}`,
      content: post.content,
      date: post.date,
      source: `${selectedProfile?.platform || defaultProfile.platform} (@${selectedProfile?.username || defaultProfile.username})`,
      type: 'social-post',
      relevance: post.evidenceValue === 'high' ? 0.9 : post.evidenceValue === 'medium' ? 0.6 : 0.3
    };
    
    addEvidence(evidence);
  };

  // Rendu des posts du profil
  const renderPosts = (profile: SocialProfile) => {
    return (
      <div className="space-y-4 mt-4">
        {profile.posts.map(post => (
          <div key={post.id} className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <p className="text-white text-sm">{post.content}</p>
            <div className="flex justify-between items-center mt-3">
              <div className="flex space-x-3 text-xs text-gray-400">
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {post.date ? new Date(post.date).toLocaleDateString() : 'Date inconnue'}
                </span>
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
                variant="ghost" 
                className="h-6 px-2 text-xs"
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
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Informations personnelles</h3>
          <div className="space-y-2 text-sm">
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
        
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Activité</h3>
          <div className="space-y-2 text-sm">
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
              content: `Informations de profil pour ${profile.displayName} (@${profile.username}). Compte créé le ${new Date(profile.joinDate).toLocaleDateString()}, actuellement basé à ${profile.location}.`,
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

  return (
    <div className="space-y-4">
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
          <div className="mt-4 py-12 text-center text-gray-400 bg-gray-800 rounded">
            <Image className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>Aucun média disponible</p>
            <p className="text-sm mt-1">Ce compte n'a pas partagé de photos ou vidéos récemment</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};