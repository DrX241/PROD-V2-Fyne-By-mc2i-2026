import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import {
  ShieldCheck as ShieldIcon,
  ArrowLeft,
  ArrowRight,
  User,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { getAvatarPath } from '@/lib/utils';

// Types
interface Avatar {
  id: string;
  name: string;
  imagePath: string;
}

interface UserRole {
  id: string;
  name: string;
  description: string;
}

export default function CyberNewOnboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // États pour le formulaire
  const [step, setStep] = useState<'name' | 'avatar' | 'role'>('name');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  
  // États pour les données
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charge les avatars et les rôles au chargement
  useEffect(() => {
    // Pour l'instant, nous allons utiliser des données statiques
    setAvatars([
      { id: 'avatar1', name: 'Cyber Ops', imagePath: '/I_AM_CYBER_NEW/assets/avatars/avatar1.png' },
      { id: 'avatar2', name: 'Tech Scholar', imagePath: '/I_AM_CYBER_NEW/assets/avatars/avatar2.jpg' },
      { id: 'avatar3', name: 'Security Analyst', imagePath: '/I_AM_CYBER_NEW/assets/avatars/avatar3.jpg' },
      { id: 'avatar4', name: 'Security Specialist', imagePath: '/I_AM_CYBER_NEW/assets/avatars/avatar4.jpg' }
    ]);
    
    setRoles([
      { id: 'debutant', name: 'Débutant', description: 'Idéal si vous découvrez la cybersécurité' },
      { id: 'analyste', name: 'Analyste', description: 'Pour ceux ayant une connaissance basique en cybersécurité' },
      { id: 'expert', name: 'Expert', description: 'Pour les professionnels expérimentés en cybersécurité' }
    ]);
  }, []);

  const handleNextStep = () => {
    if (step === 'name') {
      if (!name.trim()) {
        toast({
          title: "Nom requis",
          description: "Veuillez entrer votre nom pour continuer.",
          variant: "destructive"
        });
        return;
      }
      setStep('avatar');
    } else if (step === 'avatar') {
      if (!selectedAvatar) {
        toast({
          title: "Avatar requis",
          description: "Veuillez sélectionner un avatar pour continuer.",
          variant: "destructive"
        });
        return;
      }
      setStep('role');
    }
  };

  const handlePreviousStep = () => {
    if (step === 'avatar') {
      setStep('name');
    } else if (step === 'role') {
      setStep('avatar');
    }
  };

  const handleSubmit = async () => {
    if (!name || !selectedAvatar || !selectedRole) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs requis.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/cyber/new/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          avatarId: selectedAvatar,
          roleId: selectedRole
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la création du profil");
      }

      const profileData = await response.json();
      
      // Stocker l'ID du profil dans le localStorage
      localStorage.setItem('cyberNewProfileId', profileData.id);

      toast({
        title: "Profil créé avec succès !",
        description: "Bienvenue dans I AM CYBER NEW.",
      });

      // Rediriger vers le tableau de bord
      setLocation('/cyber-new-dashboard');
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Une erreur s'est produite");
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : "Une erreur s'est produite",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 border-b">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 text-gray-700"
          >
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Button>
          <h1 className="text-xl font-bold text-center text-gray-900">I AM CYBER NEW</h1>
          <div className="w-24"></div> {/* Placeholder pour équilibrer la mise en page */}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <ShieldIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900">Créez votre profil</h2>
            <p className="text-gray-600 mt-2">
              Personnalisez votre expérience I AM CYBER NEW
            </p>
          </div>

          <Card>
            <CardContent className="pt-6">
              {/* Step 1: Name */}
              {step === 'name' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Votre nom</Label>
                    <Input
                      id="name"
                      placeholder="Entrez votre nom"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                    />
                  </div>

                  <Button
                    className="w-full mt-4"
                    onClick={handleNextStep}
                  >
                    Continuer
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Avatar Selection */}
              {step === 'avatar' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Choisissez un avatar</Label>
                    <div className="grid grid-cols-2 gap-4 py-2">
                      {avatars.map((avatar) => (
                        <div
                          key={avatar.id}
                          className={`
                            p-3 rounded-lg cursor-pointer transition-all duration-200
                            ${selectedAvatar === avatar.id
                              ? 'bg-blue-50 border-2 border-blue-500'
                              : 'border-2 border-transparent hover:bg-gray-50'
                            }
                          `}
                          onClick={() => setSelectedAvatar(avatar.id)}
                        >
                          <div className="relative flex flex-col items-center">
                            <Avatar className="h-20 w-20 mb-2">
                              <AvatarImage src={getAvatarPath(avatar.id)} alt={avatar.name} />
                              <AvatarFallback>{avatar.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{avatar.name}</span>
                            
                            {selectedAvatar === avatar.id && (
                              <div className="absolute -top-2 -right-2 bg-blue-500 text-white p-1 rounded-full">
                                <Check className="h-4 w-4" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={handlePreviousStep}
                      className="flex-1"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                    <Button 
                      onClick={handleNextStep} 
                      className="flex-1"
                    >
                      Continuer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Role Selection */}
              {step === 'role' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label>Choisissez votre niveau</Label>
                    <RadioGroup 
                      value={selectedRole} 
                      onValueChange={setSelectedRole}
                      className="mt-2 space-y-2"
                    >
                      {roles.map((role) => (
                        <div
                          key={role.id}
                          className={`
                            flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer
                            ${selectedRole === role.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-transparent hover:bg-gray-50'
                            }
                          `}
                          onClick={() => setSelectedRole(role.id)}
                        >
                          <RadioGroupItem value={role.id} id={role.id} />
                          <div className="flex-1">
                            <Label htmlFor={role.id} className="font-medium cursor-pointer">
                              {role.name}
                            </Label>
                            <p className="text-sm text-gray-500">
                              {role.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={handlePreviousStep}
                      className="flex-1"
                      disabled={isLoading}
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Retour
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-opacity-50 border-t-transparent rounded-full" />
                          Création...
                        </>
                      ) : (
                        <>
                          Commencer
                          <User className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Stepper */}
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${step === 'name' ? 'bg-blue-600' : 'bg-blue-200'}`} />
              <div className={`h-2 w-2 rounded-full ${step === 'avatar' ? 'bg-blue-600' : 'bg-blue-200'}`} />
              <div className={`h-2 w-2 rounded-full ${step === 'role' ? 'bg-blue-600' : 'bg-blue-200'}`} />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t p-4 text-center text-sm text-gray-500">
        I AM CYBER NEW © {new Date().getFullYear()}
      </footer>
    </div>
  );
}