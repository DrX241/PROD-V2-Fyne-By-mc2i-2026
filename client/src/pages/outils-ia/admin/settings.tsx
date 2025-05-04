import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  AlertCircle,
  RefreshCw,
  Cog,
  Save,
  Palette,
  Globe,
  FileText,
  Mail,
  Database,
  Key,
  Lock,
  Image
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AdminPageTitle from '@/components/layout/AdminPageTitle';
import Layout from '@/components/layout/Layout';
import { apiRequest } from '@/lib/queryClient';

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  maintenanceMode: boolean;
  signupEnabled: boolean;
  defaultUserRole: string;
  maxAssistantsPerUser: number;
  termsAndConditions: string;
  privacyPolicy: string;
}

interface AppearanceSettings {
  theme: string;
  primaryColor: string;
  logoUrl: string;
  faviconUrl: string;
  customCss: string;
  fontFamily: string;
  enableDarkMode: boolean;
  carouselContent: string[];
  footerLinks: Array<{ label: string, url: string }>;
}

interface APISettings {
  modelSettings: {
    defaultModel: string;
    temperature: number;
    maxTokens: number;
    useBackupModel: boolean;
  };
  rateLimits: {
    maxRequestsPerMinute: number;
    maxTokensPerDay: number;
    queueEnabled: boolean;
    externalAPIEnabled: boolean;
  };
  security: {
    apiKeyRequired: boolean;
    ipWhitelisting: boolean;
    contentFiltering: boolean;
  };
}

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteName: 'mc2i AI Learning Platform',
    siteDescription: 'Plateforme éducative en cybersécurité avec assistants IA personnalisés',
    siteUrl: 'https://ai.mc2i.fr',
    contactEmail: 'contact@mc2i.fr',
    maintenanceMode: false,
    signupEnabled: true,
    defaultUserRole: 'user',
    maxAssistantsPerUser: 10,
    termsAndConditions: "# Conditions Générales d'Utilisation\n\nBienvenue sur la plateforme mc2i AI Learning.\n\n## 1. Acceptation des conditions\n\nEn accédant à cette plateforme, vous acceptez de vous conformer aux présentes Conditions Générales d'Utilisation.",
    privacyPolicy: "# Politique de Confidentialité\n\n## Collecte et utilisation des données\n\nNous collectons certaines informations personnelles lorsque vous utilisez notre plateforme, notamment votre nom, votre adresse e-mail et vos données d'utilisation."
  });

  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings>({
    theme: 'classic',
    primaryColor: '#3b82f6',
    logoUrl: '/logo.png',
    faviconUrl: '/favicon.ico',
    customCss: '',
    fontFamily: 'Inter, sans-serif',
    enableDarkMode: true,
    carouselContent: [
      'Bienvenue sur la plateforme mc2i AI Learning',
      'Découvrez nos modules interactifs en cybersécurité',
      'Créez vos propres assistants IA personnalisés'
    ],
    footerLinks: [
      { label: 'À propos', url: '/about' },
      { label: 'Contact', url: '/contact' },
      { label: 'Mentions légales', url: '/legal' }
    ]
  });

  const [apiSettings, setApiSettings] = useState<APISettings>({
    modelSettings: {
      defaultModel: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2000,
      useBackupModel: true
    },
    rateLimits: {
      maxRequestsPerMinute: 60,
      maxTokensPerDay: 100000,
      queueEnabled: true,
      externalAPIEnabled: true
    },
    security: {
      apiKeyRequired: true,
      ipWhitelisting: false,
      contentFiltering: true
    }
  });

  const { toast } = useToast();

  // Mutation pour mettre à jour les paramètres généraux
  const updateGeneralSettingsMutation = useMutation({
    mutationFn: async (settings: GeneralSettings) => {
      // Simulation pour développement
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Paramètres mis à jour',
        description: 'Les paramètres généraux ont été mis à jour avec succès.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour les paramètres: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Mutation pour mettre à jour les paramètres d'apparence
  const updateAppearanceSettingsMutation = useMutation({
    mutationFn: async (settings: AppearanceSettings) => {
      // Simulation pour développement
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Apparence mise à jour',
        description: 'Les paramètres d\'apparence ont été mis à jour avec succès.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour l'apparence: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Mutation pour mettre à jour les paramètres d'API
  const updateApiSettingsMutation = useMutation({
    mutationFn: async (settings: APISettings) => {
      // Simulation pour développement
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: 'Paramètres API mis à jour',
        description: 'Les paramètres d\'API ont été mis à jour avec succès.',
        variant: 'default',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: `Impossible de mettre à jour les paramètres d'API: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Gestionnaire pour les changements dans les paramètres généraux
  const handleGeneralSettingChange = (
    field: keyof GeneralSettings, 
    value: string | number | boolean
  ) => {
    setGeneralSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gestionnaire pour les changements dans les paramètres d'apparence
  const handleAppearanceSettingChange = (
    field: keyof AppearanceSettings, 
    value: string | boolean | any[]
  ) => {
    setAppearanceSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Gestionnaire pour les changements dans les paramètres d'API
  const handleApiSettingChange = (
    category: keyof APISettings,
    field: string,
    value: string | number | boolean
  ) => {
    setApiSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  // Gestionnaire pour ajouter une entrée de carousel
  const handleAddCarouselItem = () => {
    setAppearanceSettings(prev => ({
      ...prev,
      carouselContent: [...prev.carouselContent, '']
    }));
  };

  // Gestionnaire pour modifier une entrée de carousel
  const handleChangeCarouselItem = (index: number, value: string) => {
    setAppearanceSettings(prev => {
      const newCarouselContent = [...prev.carouselContent];
      newCarouselContent[index] = value;
      return {
        ...prev,
        carouselContent: newCarouselContent
      };
    });
  };

  // Gestionnaire pour supprimer une entrée de carousel
  const handleRemoveCarouselItem = (index: number) => {
    setAppearanceSettings(prev => {
      const newCarouselContent = [...prev.carouselContent];
      newCarouselContent.splice(index, 1);
      return {
        ...prev,
        carouselContent: newCarouselContent
      };
    });
  };

  // Gestionnaire pour ajouter un lien de pied de page
  const handleAddFooterLink = () => {
    setAppearanceSettings(prev => ({
      ...prev,
      footerLinks: [...prev.footerLinks, { label: '', url: '' }]
    }));
  };

  // Gestionnaire pour modifier un lien de pied de page
  const handleChangeFooterLink = (index: number, field: 'label' | 'url', value: string) => {
    setAppearanceSettings(prev => {
      const newFooterLinks = [...prev.footerLinks];
      newFooterLinks[index] = {
        ...newFooterLinks[index],
        [field]: value
      };
      return {
        ...prev,
        footerLinks: newFooterLinks
      };
    });
  };

  // Gestionnaire pour supprimer un lien de pied de page
  const handleRemoveFooterLink = (index: number) => {
    setAppearanceSettings(prev => {
      const newFooterLinks = [...prev.footerLinks];
      newFooterLinks.splice(index, 1);
      return {
        ...prev,
        footerLinks: newFooterLinks
      };
    });
  };

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <AdminPageTitle 
          title="Paramètres généraux" 
          description="Configurez les paramètres globaux de la plateforme"
          icon={<Cog className="h-6 w-6 text-violet-500" />}
        />

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="appearance">Apparence</TabsTrigger>
            <TabsTrigger value="api">API & Sécurité</TabsTrigger>
          </TabsList>
          
          {/* Onglet Paramètres Généraux */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres généraux</CardTitle>
                <CardDescription>
                  Configurez les informations de base et les fonctionnalités de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Nom du site</Label>
                    <Input
                      id="siteName"
                      value={generalSettings.siteName}
                      onChange={(e) => handleGeneralSettingChange('siteName', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl">URL du site</Label>
                    <Input
                      id="siteUrl"
                      value={generalSettings.siteUrl}
                      onChange={(e) => handleGeneralSettingChange('siteUrl', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="siteDescription">Description du site</Label>
                    <Textarea
                      id="siteDescription"
                      rows={3}
                      value={generalSettings.siteDescription}
                      onChange={(e) => handleGeneralSettingChange('siteDescription', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email de contact</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={generalSettings.contactEmail}
                      onChange={(e) => handleGeneralSettingChange('contactEmail', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxAssistantsPerUser">Nombre max d'assistants par utilisateur</Label>
                    <Input
                      id="maxAssistantsPerUser"
                      type="number"
                      min="1"
                      value={generalSettings.maxAssistantsPerUser}
                      onChange={(e) => handleGeneralSettingChange('maxAssistantsPerUser', parseInt(e.target.value, 10))}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Options d'accès</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenanceMode">Mode maintenance</Label>
                        <p className="text-sm text-muted-foreground">
                          Afficher une page de maintenance au lieu du site
                        </p>
                      </div>
                      <Switch 
                        id="maintenanceMode"
                        checked={generalSettings.maintenanceMode}
                        onCheckedChange={(checked) => handleGeneralSettingChange('maintenanceMode', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="signupEnabled">Inscription utilisateurs</Label>
                        <p className="text-sm text-muted-foreground">
                          Permettre aux nouveaux utilisateurs de s'inscrire
                        </p>
                      </div>
                      <Switch 
                        id="signupEnabled"
                        checked={generalSettings.signupEnabled}
                        onCheckedChange={(checked) => handleGeneralSettingChange('signupEnabled', checked)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="defaultUserRole">Rôle par défaut des nouveaux utilisateurs</Label>
                      <Select 
                        value={generalSettings.defaultUserRole}
                        onValueChange={(value) => handleGeneralSettingChange('defaultUserRole', value)}
                      >
                        <SelectTrigger id="defaultUserRole">
                          <SelectValue placeholder="Sélectionnez un rôle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">Utilisateur</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="admin">Administrateur</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Documents légaux</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="termsAndConditions">Conditions générales d'utilisation</Label>
                      <Textarea
                        id="termsAndConditions"
                        rows={5}
                        value={generalSettings.termsAndConditions}
                        onChange={(e) => handleGeneralSettingChange('termsAndConditions', e.target.value)}
                        placeholder="Utilisez le format Markdown"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Format Markdown supporté</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="privacyPolicy">Politique de confidentialité</Label>
                      <Textarea
                        id="privacyPolicy"
                        rows={5}
                        value={generalSettings.privacyPolicy}
                        onChange={(e) => handleGeneralSettingChange('privacyPolicy', e.target.value)}
                        placeholder="Utilisez le format Markdown"
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-muted-foreground">Format Markdown supporté</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={() => updateGeneralSettingsMutation.mutate(generalSettings)}
                  disabled={updateGeneralSettingsMutation.isPending}
                  className="gap-2"
                >
                  {updateGeneralSettingsMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Onglet Apparence */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personnalisation de l'apparence</CardTitle>
                <CardDescription>
                  Configurez l'apparence et la présentation de la plateforme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="theme">Thème</Label>
                    <Select 
                      value={appearanceSettings.theme}
                      onValueChange={(value) => handleAppearanceSettingChange('theme', value)}
                    >
                      <SelectTrigger id="theme">
                        <SelectValue placeholder="Sélectionnez un thème" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classic">Classique</SelectItem>
                        <SelectItem value="modern">Moderne</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="futuristic">Futuriste</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="primaryColor">Couleur principale</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={appearanceSettings.primaryColor}
                        onChange={(e) => handleAppearanceSettingChange('primaryColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={appearanceSettings.primaryColor}
                        onChange={(e) => handleAppearanceSettingChange('primaryColor', e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logoUrl">URL du logo</Label>
                    <Input
                      id="logoUrl"
                      value={appearanceSettings.logoUrl}
                      onChange={(e) => handleAppearanceSettingChange('logoUrl', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="faviconUrl">URL du favicon</Label>
                    <Input
                      id="faviconUrl"
                      value={appearanceSettings.faviconUrl}
                      onChange={(e) => handleAppearanceSettingChange('faviconUrl', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="fontFamily">Police de caractères</Label>
                    <Select 
                      value={appearanceSettings.fontFamily}
                      onValueChange={(value) => handleAppearanceSettingChange('fontFamily', value)}
                    >
                      <SelectTrigger id="fontFamily">
                        <SelectValue placeholder="Sélectionnez une police" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                        <SelectItem value="'Roboto', sans-serif">Roboto</SelectItem>
                        <SelectItem value="'Open Sans', sans-serif">Open Sans</SelectItem>
                        <SelectItem value="'Montserrat', sans-serif">Montserrat</SelectItem>
                        <SelectItem value="'Poppins', sans-serif">Poppins</SelectItem>
                        <SelectItem value="'Nunito', sans-serif">Nunito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enableDarkMode">Mode sombre</Label>
                      <p className="text-sm text-muted-foreground">
                        Activer l'option de thème sombre
                      </p>
                    </div>
                    <Switch 
                      id="enableDarkMode"
                      checked={appearanceSettings.enableDarkMode}
                      onCheckedChange={(checked) => handleAppearanceSettingChange('enableDarkMode', checked)}
                    />
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Contenu du carousel d'accueil</h3>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleAddCarouselItem}
                      className="gap-1"
                    >
                      + Ajouter
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {appearanceSettings.carouselContent.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={item}
                          onChange={(e) => handleChangeCarouselItem(index, e.target.value)}
                          placeholder="Texte à afficher"
                          className="flex-1"
                        />
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleRemoveCarouselItem(index)}
                        >
                          &times;
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Liens de pied de page</h3>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={handleAddFooterLink}
                      className="gap-1"
                    >
                      + Ajouter
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    {appearanceSettings.footerLinks.map((link, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={link.label}
                          onChange={(e) => handleChangeFooterLink(index, 'label', e.target.value)}
                          placeholder="Libellé"
                          className="flex-1"
                        />
                        <Input
                          value={link.url}
                          onChange={(e) => handleChangeFooterLink(index, 'url', e.target.value)}
                          placeholder="URL"
                          className="flex-1"
                        />
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleRemoveFooterLink(index)}
                        >
                          &times;
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <Label htmlFor="customCss">CSS personnalisé</Label>
                  <Textarea
                    id="customCss"
                    rows={5}
                    value={appearanceSettings.customCss}
                    onChange={(e) => handleAppearanceSettingChange('customCss', e.target.value)}
                    placeholder="Ajoutez des styles CSS personnalisés ici"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ces styles seront appliqués à l'ensemble du site
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={() => updateAppearanceSettingsMutation.mutate(appearanceSettings)}
                  disabled={updateAppearanceSettingsMutation.isPending}
                  className="gap-2"
                >
                  {updateAppearanceSettingsMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Palette className="h-4 w-4" />
                      Appliquer les styles
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Onglet API & Sécurité */}
          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de l'API et sécurité</CardTitle>
                <CardDescription>
                  Configurez les paramètres de l'API, les limites et la sécurité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Paramètres des modèles IA</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="defaultModel">Modèle par défaut</Label>
                      <Select 
                        value={apiSettings.modelSettings.defaultModel}
                        onValueChange={(value) => handleApiSettingChange('modelSettings', 'defaultModel', value)}
                      >
                        <SelectTrigger id="defaultModel">
                          <SelectValue placeholder="Sélectionnez un modèle" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                          <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="temperature">Température ({apiSettings.modelSettings.temperature})</Label>
                      <div className="flex gap-2 items-center">
                        <input
                          id="temperature"
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          value={apiSettings.modelSettings.temperature}
                          onChange={(e) => handleApiSettingChange('modelSettings', 'temperature', parseFloat(e.target.value))}
                          className="w-full"
                        />
                        <span className="w-10 text-center">{apiSettings.modelSettings.temperature}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Contrôle la créativité et la randomisation des réponses
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxTokens">Limite de tokens par requête</Label>
                      <Input
                        id="maxTokens"
                        type="number"
                        min="100"
                        max="32000"
                        step="100"
                        value={apiSettings.modelSettings.maxTokens}
                        onChange={(e) => handleApiSettingChange('modelSettings', 'maxTokens', parseInt(e.target.value, 10))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="useBackupModel">Utiliser modèle de secours</Label>
                        <p className="text-sm text-muted-foreground">
                          Basculer sur un modèle secondaire en cas d'erreur
                        </p>
                      </div>
                      <Switch 
                        id="useBackupModel"
                        checked={apiSettings.modelSettings.useBackupModel}
                        onCheckedChange={(checked) => handleApiSettingChange('modelSettings', 'useBackupModel', checked)}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Limites d'utilisation</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="maxRequestsPerMinute">Requêtes max par minute</Label>
                      <Input
                        id="maxRequestsPerMinute"
                        type="number"
                        min="1"
                        value={apiSettings.rateLimits.maxRequestsPerMinute}
                        onChange={(e) => handleApiSettingChange('rateLimits', 'maxRequestsPerMinute', parseInt(e.target.value, 10))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="maxTokensPerDay">Tokens max par jour</Label>
                      <Input
                        id="maxTokensPerDay"
                        type="number"
                        min="1000"
                        step="1000"
                        value={apiSettings.rateLimits.maxTokensPerDay}
                        onChange={(e) => handleApiSettingChange('rateLimits', 'maxTokensPerDay', parseInt(e.target.value, 10))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="queueEnabled">File d'attente</Label>
                        <p className="text-sm text-muted-foreground">
                          Mettre les requêtes en file d'attente au lieu de les rejeter
                        </p>
                      </div>
                      <Switch 
                        id="queueEnabled"
                        checked={apiSettings.rateLimits.queueEnabled}
                        onCheckedChange={(checked) => handleApiSettingChange('rateLimits', 'queueEnabled', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="externalAPIEnabled">API externe</Label>
                        <p className="text-sm text-muted-foreground">
                          Activer l'accès à l'API depuis des applications externes
                        </p>
                      </div>
                      <Switch 
                        id="externalAPIEnabled"
                        checked={apiSettings.rateLimits.externalAPIEnabled}
                        onCheckedChange={(checked) => handleApiSettingChange('rateLimits', 'externalAPIEnabled', checked)}
                      />
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Sécurité</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="apiKeyRequired">Authentification par clé API</Label>
                        <p className="text-sm text-muted-foreground">
                          Exiger une clé API pour toutes les requêtes
                        </p>
                      </div>
                      <Switch 
                        id="apiKeyRequired"
                        checked={apiSettings.security.apiKeyRequired}
                        onCheckedChange={(checked) => handleApiSettingChange('security', 'apiKeyRequired', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="ipWhitelisting">Liste blanche d'IPs</Label>
                        <p className="text-sm text-muted-foreground">
                          Restreindre l'accès à certaines adresses IP
                        </p>
                      </div>
                      <Switch 
                        id="ipWhitelisting"
                        checked={apiSettings.security.ipWhitelisting}
                        onCheckedChange={(checked) => handleApiSettingChange('security', 'ipWhitelisting', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="contentFiltering">Filtrage du contenu</Label>
                        <p className="text-sm text-muted-foreground">
                          Filtrer automatiquement le contenu inapproprié
                        </p>
                      </div>
                      <Switch 
                        id="contentFiltering"
                        checked={apiSettings.security.contentFiltering}
                        onCheckedChange={(checked) => handleApiSettingChange('security', 'contentFiltering', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={() => updateApiSettingsMutation.mutate(apiSettings)}
                  disabled={updateApiSettingsMutation.isPending}
                  className="gap-2"
                >
                  {updateApiSettingsMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}