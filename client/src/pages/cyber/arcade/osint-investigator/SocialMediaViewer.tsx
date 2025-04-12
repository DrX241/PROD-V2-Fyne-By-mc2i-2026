import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Search, User, Users, FileText, Link2, Camera, Edit, Heart, MessageSquare, RefreshCw, Share2 } from 'lucide-react';
import { SocialProfile, SocialPost } from './types';
import socialMediaInterfaceSvg from '@/assets/osint-investigator/social-media-interface.svg';

interface SocialMediaViewerProps {
  profiles: SocialProfile[];
  addEvidence: (evidence: any) => void;
}

export const SocialMediaViewer: React.FC<SocialMediaViewerProps> = ({
  profiles = [],
  addEvidence
}) => {
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [searchUsername, setSearchUsername] = useState<string>('');
  const [selectedProfile, setSelectedProfile] = useState<SocialProfile | null>(null);
  
  // Profil par défaut pour démo
  const defaultProfile: SocialProfile = {
    id: 'profile-001',
    platformId: 'socialconnect',
    username: 'alex_cybersec',
    displayName: 'Alex Dupont',
    bio: 'Spécialiste en cybersécurité | Digital forensics & OSINT',
    location: 'Lyon, France',
    joined: '2019-05-15',
    followers: 512,
    following: 284,
    posts: [
      {
        id: 'post-001',
        content: 'Journée captivante au forum sur la cybersécurité. J\'ai particulièrement apprécié les discussions sur les nouvelles techniques d\'OSINT.',
        date: '2025-04-12T08:30:00',
        likes: 48,
        comments: 12,
        shares: 5
      },
      {
        id: 'post-002',
        content: 'Nouveau post sur mon blog: "Comment protéger votre identité en ligne". Lien dans ma bio. #cybersecurity #privacymatters',
        date: '2025-04-11T18:45:00',
        likes: 73,
        comments: 21,
        shares: 18
      },
      {
        id: 'post-003',
        content: 'En route pour la conférence SecureCyber à Lyon. DM moi si tu y seras aussi!',
        date: '2025-03-28T10:15:00',
        likes: 31,
        comments: 9,
        shares: 0
      }
    ]
  };
  
  // Rechercher un profil social
  const searchProfile = () => {
    if (!searchUsername.trim()) return;
    // Dans un cas réel, on ferait un appel API. Ici, on retourne toujours le profil par défaut
    setSelectedProfile(defaultProfile);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchProfile();
    }
  };
  
  // Ajouter un post comme preuve
  const savePostAsEvidence = (post: SocialPost) => {
    const evidence = {
      id: `evidence-${post.id}`,
      title: `Post de ${selectedProfile?.displayName} du ${new Date(post.date).toLocaleDateString()}`,
      content: post.content,
      type: 'social_post',
      source: `${selectedProfile?.platformId} (${selectedProfile?.username})`,
      relevance: 0.85
    };
    
    addEvidence(evidence);
  };
  
  // Ajouter un profil comme preuve
  const saveProfileAsEvidence = () => {
    if (!selectedProfile) return;
    
    const evidence = {
      id: `evidence-profile-${selectedProfile.id}`,
      title: `Profil de ${selectedProfile.displayName} (@${selectedProfile.username})`,
      content: `Bio: ${selectedProfile.bio || 'Non spécifiée'}\nLocalisation: ${selectedProfile.location || 'Non spécifiée'}\nAbonnés: ${selectedProfile.followers}\nInscrit depuis: ${selectedProfile.joined}`,
      type: 'social_profile',
      source: selectedProfile.platformId,
      relevance: 0.9
    };
    
    addEvidence(evidence);
  };
  
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="mb-4 p-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Rechercher un nom d'utilisateur..."
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-gray-700 border-gray-600 text-white"
          />
          <Button 
            onClick={searchProfile}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {selectedProfile ? (
        // Affichage du profil sélectionné
        <div className="p-2">
          {/* Interface visuelle de profil */}
          <div className="relative h-[400px] overflow-hidden mb-3">
            <img 
              src={socialMediaInterfaceSvg} 
              alt="Social Media Interface" 
              className="w-full h-full object-contain"
            />
            
            {/* Actions sur le profil */}
            <div className="absolute top-2 right-2 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600"
                onClick={saveProfileAsEvidence}
              >
                Ajouter aux preuves
              </Button>
            </div>
          </div>
          
          {/* Interface interactive pour les détails du profil */}
          <div className="bg-gray-700 rounded-lg p-4">
            <Tabs defaultValue="posts" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="posts">Publications</TabsTrigger>
                <TabsTrigger value="connections">Connexions</TabsTrigger>
                <TabsTrigger value="photos">Photos</TabsTrigger>
                <TabsTrigger value="about">À propos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="posts" className="space-y-4">
                {selectedProfile.posts?.map(post => (
                  <div key={post.id} className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                        <div>
                          <p className="font-medium text-white">{selectedProfile.displayName}</p>
                          <p className="text-xs text-gray-400">{new Date(post.date).toLocaleString()}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-gray-400 hover:text-white"
                        onClick={() => savePostAsEvidence(post)}
                      >
                        Sauvegarder
                      </Button>
                    </div>
                    <div className="mt-3 text-gray-200">
                      {post.content}
                    </div>
                    <div className="mt-4 flex items-center gap-6 text-gray-400 text-sm">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4" />
                        {post.likes || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {post.comments || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <RefreshCw className="h-4 w-4" />
                        {post.shares || 0}
                      </div>
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="connections">
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <Users className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                  <p className="text-white">Connexions: {selectedProfile.followers} abonnés, {selectedProfile.following} abonnements</p>
                  <p className="text-gray-400 text-sm mt-1">
                    L'analyse des connexions peut révéler des relations importantes pour l'investigation OSINT.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="photos">
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <Camera className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                  <p className="text-white">Photos non disponibles</p>
                  <p className="text-gray-400 text-sm mt-1">
                    Les métadonnées des photos peuvent contenir des informations de localisation et d'appareil.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="about">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-white font-medium mb-3">Informations du profil</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-300">{selectedProfile.displayName} (@{selectedProfile.username})</p>
                    </div>
                    {selectedProfile.bio && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 text-gray-400 mt-1" />
                        <p className="text-gray-300">{selectedProfile.bio}</p>
                      </div>
                    )}
                    {selectedProfile.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-300">{selectedProfile.location}</p>
                      </div>
                    )}
                    {selectedProfile.joined && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-300">A rejoint le {new Date(selectedProfile.joined).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : (
        // Message si aucun profil n'est sélectionné
        <div className="text-center py-16 px-4">
          <User className="h-16 w-16 mx-auto mb-3 text-gray-600 opacity-20" />
          <h3 className="text-gray-300 text-lg">Aucun profil sélectionné</h3>
          <p className="text-gray-500 max-w-md mx-auto mt-2">
            Recherchez un nom d'utilisateur pour explorer les profils sociaux.
            L'analyse des réseaux sociaux est une composante essentielle de l'OSINT.
          </p>
        </div>
      )}
    </div>
  );
};