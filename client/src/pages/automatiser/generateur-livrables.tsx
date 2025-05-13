import React, { useState } from 'react';
import { useLocation } from 'wouter';
import HomeLayout from '@/components/layout/HomeLayout';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  FileText, 
  ClipboardList, 
  FileCheck, 
  ListChecks, 
  Shield,
  Lightbulb,
  Sparkles,
  Check,
  Loader2
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Types pour les générateurs de livrables
interface DeliverableGenerator {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  inputFields: {
    id: string;
    label: string;
    placeholder: string;
    type: 'text' | 'textarea' | 'select';
    options?: { value: string; label: string }[];
    required?: boolean;
  }[];
  examples: {
    title: string;
    description: string;
    inputs: Record<string, string>;
  }[];
}

// Types pour les résultats générés
interface GeneratedDeliverable {
  content: string;
  sections?: {
    title: string;
    content: string;
  }[];
  loading: boolean;
  error?: string;
}

export default function GenerateurLivrables() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState('functional-requirements');
  const [formInputs, setFormInputs] = useState<Record<string, Record<string, string>>>({
    'functional-requirements': {},
    'test-plan': {},
    'meeting-minutes': {},
    'agile-backlog': {},
    'security-policy': {}
  });
  const [generatedContent, setGeneratedContent] = useState<Record<string, GeneratedDeliverable | null>>({
    'functional-requirements': null,
    'test-plan': null,
    'meeting-minutes': null,
    'agile-backlog': null,
    'security-policy': null
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExamples, setShowExamples] = useState<Record<string, boolean>>({
    'functional-requirements': false,
    'test-plan': false,
    'meeting-minutes': false,
    'agile-backlog': false,
    'security-policy': false
  });

  // Liste des générateurs de livrables disponibles
  const deliverableGenerators: DeliverableGenerator[] = [
    {
      id: 'functional-requirements',
      title: 'Expression de besoin fonctionnel',
      description: 'Générez un document structuré exprimant vos besoins fonctionnels à partir d\'un contexte et d\'attentes métier.',
      icon: <FileText className="h-6 w-6 text-cyan-500" />,
      gradient: 'from-cyan-600 to-cyan-800',
      inputFields: [
        {
          id: 'context',
          label: 'Contexte du projet',
          placeholder: 'Décrivez le contexte de votre projet, l\'entreprise et l\'environnement actuel...',
          type: 'textarea',
          required: true
        },
        {
          id: 'business-need',
          label: 'Besoin métier',
          placeholder: 'Expliquez le besoin métier principal que vous souhaitez combler...',
          type: 'textarea',
          required: true
        },
        {
          id: 'current-process',
          label: 'Processus actuel (si existant)',
          placeholder: 'Décrivez comment le processus est géré actuellement, s\'il existe...',
          type: 'textarea'
        },
        {
          id: 'user-types',
          label: 'Types d\'utilisateurs concernés',
          placeholder: 'Ex: Responsables RH, Managers, Employés, Clients...',
          type: 'text'
        },
        {
          id: 'constraints',
          label: 'Contraintes particulières',
          placeholder: 'Budget, délais, réglementations, systèmes existants...',
          type: 'textarea'
        }
      ],
      examples: [
        {
          title: 'Système de gestion des congés',
          description: 'Expression de besoin pour un système de gestion des congés et absences',
          inputs: {
            'context': 'Notre entreprise de 150 personnes gère actuellement les demandes de congés via des emails et un fichier Excel partagé. Cette gestion manuelle provoque des erreurs, des retards et un manque de visibilité pour les managers et le département RH.',
            'business-need': 'Nous souhaitons digitaliser le processus de demande et de validation des congés pour optimiser le temps de traitement, garantir le respect des procédures et faciliter la planification des équipes.',
            'current-process': 'Actuellement, un employé envoie un email à son manager pour demander des congés, qui transmet ensuite au RH qui met à jour un fichier Excel. Ce processus prend en moyenne 3 jours et génère souvent des erreurs de synchronisation.',
            'user-types': 'Employés, Managers, RH, Direction',
            'constraints': 'Budget limité à 15K€, besoin d\'une mise en place sous 2 mois, RGPD, doit s\'intégrer avec notre SIRH actuel pour la paie.'
          }
        }
      ]
    },
    {
      id: 'test-plan',
      title: 'Plan de test fonctionnel',
      description: 'Créez des scénarios de test complets à partir de user stories ou de descriptions de fonctionnalités.',
      icon: <ClipboardList className="h-6 w-6 text-green-500" />,
      gradient: 'from-green-600 to-green-800',
      inputFields: [
        {
          id: 'feature-description',
          label: 'Description de la fonctionnalité',
          placeholder: 'Décrivez la fonctionnalité à tester en détail...',
          type: 'textarea',
          required: true
        },
        {
          id: 'user-story',
          label: 'User Story (si disponible)',
          placeholder: 'En tant que... Je veux... Afin de...',
          type: 'textarea'
        },
        {
          id: 'acceptance-criteria',
          label: 'Critères d\'acceptation',
          placeholder: 'Listez les critères d\'acceptation pour cette fonctionnalité...',
          type: 'textarea'
        },
        {
          id: 'edge-cases',
          label: 'Cas limites à considérer',
          placeholder: 'Situations particulières ou limites à tester...',
          type: 'textarea'
        },
        {
          id: 'test-environment',
          label: 'Environnement de test',
          placeholder: 'Précisez l\'environnement cible pour ces tests...',
          type: 'text'
        }
      ],
      examples: [
        {
          title: 'Authentification à double facteur',
          description: 'Scénarios de test pour une fonctionnalité d\'authentification à double facteur',
          inputs: {
            'feature-description': 'Implémentation d\'une authentification à double facteur (2FA) pour sécuriser l\'accès à l\'application. Les utilisateurs devront confirmer leur identité via un code envoyé par SMS après avoir saisi leur mot de passe.',
            'user-story': 'En tant qu\'utilisateur, je veux pouvoir sécuriser mon compte avec une authentification à deux facteurs afin de protéger mes données personnelles contre les accès non autorisés.',
            'acceptance-criteria': '- L\'utilisateur peut activer/désactiver la 2FA dans son profil\n- Un code à 6 chiffres est envoyé au numéro vérifié\n- Le code expire après 5 minutes\n- 3 tentatives max avant blocage temporaire\n- Option de secours si téléphone perdu',
            'edge-cases': '- Téléphone non disponible/changé\n- SMS non reçu\n- Utilisateur à l\'étranger\n- Tentatives multiples simultanées\n- Expiration de session pendant la saisie',
            'test-environment': 'Environnement de staging avec service SMS de test intégré'
          }
        }
      ]
    },
    {
      id: 'meeting-minutes',
      title: 'Compte-rendu de réunion',
      description: 'Transformez vos notes brutes de réunion en compte-rendu professionnel et structuré.',
      icon: <FileCheck className="h-6 w-6 text-violet-500" />,
      gradient: 'from-violet-600 to-violet-800',
      inputFields: [
        {
          id: 'meeting-subject',
          label: 'Sujet de la réunion',
          placeholder: 'Ex: Lancement du projet X, Point d\'avancement mensuel...',
          type: 'text',
          required: true
        },
        {
          id: 'date',
          label: 'Date de la réunion',
          placeholder: 'Ex: 24/04/2025',
          type: 'text',
          required: true
        },
        {
          id: 'participants',
          label: 'Participants',
          placeholder: 'Liste des participants et leurs rôles/entreprises...',
          type: 'textarea',
          required: true
        },
        {
          id: 'raw-notes',
          label: 'Notes brutes de la réunion',
          placeholder: 'Collez vos notes prises pendant la réunion, même si elles sont désorganisées...',
          type: 'textarea',
          required: true
        },
        {
          id: 'format-type',
          label: 'Type de format souhaité',
          placeholder: 'Sélectionnez un format',
          type: 'select',
          options: [
            { value: 'standard', label: 'Standard (Points clés, décisions, actions)' },
            { value: 'detailed', label: 'Détaillé (Chronologique avec résumés)' },
            { value: 'executive', label: 'Synthèse exécutive (Concis, orienté décisions)' }
          ]
        }
      ],
      examples: [
        {
          title: 'Comité de pilotage projet',
          description: 'Transformation de notes en compte-rendu structuré',
          inputs: {
            'meeting-subject': 'Comité de pilotage - Projet de refonte du site e-commerce',
            'date': '15/05/2025',
            'participants': 'Jean Dupont (Chef de projet), Marie Martin (Directrice marketing), Pierre Lefebvre (DSI), Sophie Lambert (Responsable UX), Lucas Moreau (Développeur lead)',
            'raw-notes': '- démarrage 14h05\n- retard planning de 2 semaines sur module paiement, pb API bancaire\n- équipe UX a fini les maquettes, tests users ok\n- budget ok mais risque dépassement si problème paiement persiste\n- décision: renforcer équipe dev avec 1 dev senior pendant 3 semaines\n- marketing: lancement campagne repoussé à fin juin\n- prochain jalon: validation catalogue produits le 25/05\n- questions sur mobile? Sophie dit 80% responsive ok\n- action Pierre: contacter prestataire bancaire d\'ici vendredi\n- action Marie: préparer communication report\n- prochaine réunion: 29/05 à 14h',
            'format-type': 'standard'
          }
        }
      ]
    },
    {
      id: 'agile-backlog',
      title: 'Backlog initial Agile',
      description: 'Créez un ensemble de User Stories structurées à partir d\'un périmètre fonctionnel.',
      icon: <ListChecks className="h-6 w-6 text-amber-500" />,
      gradient: 'from-amber-600 to-amber-800',
      inputFields: [
        {
          id: 'project-scope',
          label: 'Périmètre du projet',
          placeholder: 'Décrivez le périmètre global du projet et ses objectifs principaux...',
          type: 'textarea',
          required: true
        },
        {
          id: 'user-types',
          label: 'Types d\'utilisateurs',
          placeholder: 'Listez les différents types d\'utilisateurs qui interagiront avec le système...',
          type: 'textarea',
          required: true
        },
        {
          id: 'key-features',
          label: 'Fonctionnalités clés',
          placeholder: 'Énumérez les principales fonctionnalités attendues...',
          type: 'textarea',
          required: true
        },
        {
          id: 'constraints',
          label: 'Contraintes et priorités',
          placeholder: 'Mentionnez les contraintes techniques ou business, ainsi que les priorités...',
          type: 'textarea'
        },
        {
          id: 'story-format',
          label: 'Format des User Stories',
          placeholder: 'Sélectionnez un format',
          type: 'select',
          options: [
            { value: 'standard', label: 'Standard (En tant que... Je veux... Afin de...)' },
            { value: 'detailed', label: 'Détaillé (Avec critères d\'acceptation)' },
            { value: 'themed', label: 'Regroupé par thèmes' }
          ]
        }
      ],
      examples: [
        {
          title: 'Application de gestion de budget personnel',
          description: 'Création d\'un backlog initial pour une application de gestion de finances personnelles',
          inputs: {
            'project-scope': 'Développement d\'une application mobile de gestion de budget personnel permettant aux utilisateurs de suivre leurs dépenses, définir des objectifs d\'épargne, et recevoir des conseils financiers personnalisés. L\'application doit être simple d\'utilisation, sécurisée et permettre la synchronisation avec les comptes bancaires.',
            'user-types': '- Utilisateur standard : personne souhaitant gérer son budget\n- Utilisateur premium : accès à des fonctionnalités avancées\n- Utilisateur famille : gestion de budget partagé\n- Administrateur : gestion de la plateforme',
            'key-features': '- Saisie et catégorisation des dépenses\n- Visualisation des dépenses (graphiques)\n- Définition d\'objectifs d\'épargne\n- Connexion aux comptes bancaires\n- Alertes de dépassement de budget\n- Conseils personnalisés\n- Exportation de rapports\n- Version web et mobile',
            'constraints': '- La sécurité des données financières est prioritaire\n- L\'interface doit être simple et intuitive\n- La version MVP doit être prête en 3 mois\n- Pas de publicités invasives\n- Conformité RGPD obligatoire',
            'story-format': 'detailed'
          }
        }
      ]
    },
    {
      id: 'security-policy',
      title: 'Politique de sécurité simplifiée',
      description: 'Générez une documentation de sécurité adaptée à différents publics et différentes problématiques.',
      icon: <Shield className="h-6 w-6 text-red-500" />,
      gradient: 'from-red-600 to-red-800',
      inputFields: [
        {
          id: 'security-domain',
          label: 'Domaine de sécurité',
          placeholder: 'Sélectionnez un domaine',
          type: 'select',
          options: [
            { value: 'email', label: 'Sécurité des emails' },
            { value: 'passwords', label: 'Gestion des mots de passe' },
            { value: 'remote', label: 'Accès à distance' },
            { value: 'gdpr', label: 'Conformité RGPD' },
            { value: 'devices', label: 'Appareils mobiles' },
            { value: 'incident', label: 'Gestion des incidents' },
            { value: 'custom', label: 'Autre (à préciser)' }
          ],
          required: true
        },
        {
          id: 'custom-domain',
          label: 'Domaine personnalisé (si "Autre" sélectionné)',
          placeholder: 'Précisez le domaine de sécurité...',
          type: 'text'
        },
        {
          id: 'audience',
          label: 'Public cible',
          placeholder: 'Sélectionnez le public cible',
          type: 'select',
          options: [
            { value: 'general', label: 'Tous les employés' },
            { value: 'technical', label: 'Équipe technique' },
            { value: 'management', label: 'Direction' },
            { value: 'multi', label: 'Versions multiples (général et technique)' }
          ],
          required: true
        },
        {
          id: 'organization-context',
          label: 'Contexte de l\'organisation',
          placeholder: 'Décrivez brièvement votre organisation, son secteur, sa taille, ses enjeux spécifiques...',
          type: 'textarea',
          required: true
        },
        {
          id: 'specific-requirements',
          label: 'Exigences spécifiques',
          placeholder: 'Précisez les exigences ou contraintes particulières à prendre en compte...',
          type: 'textarea'
        }
      ],
      examples: [
        {
          title: 'Politique BYOD (Bring Your Own Device)',
          description: 'Création d\'une politique d\'utilisation des appareils personnels',
          inputs: {
            'security-domain': 'devices',
            'custom-domain': '',
            'audience': 'multi',
            'organization-context': 'Cabinet d\'avocats de 45 personnes spécialisé en droit des affaires. Les collaborateurs travaillent souvent à distance et utilisent fréquemment leurs appareils personnels pour accéder aux emails et documents professionnels. Nous manipulons des données sensibles et confidentielles de nos clients.',
            'specific-requirements': '- Nécessité d\'un équilibre entre sécurité et flexibilité\n- Conformité avec le secret professionnel des avocats\n- Support limité pour les appareils personnels\n- Budget restreint pour les solutions de MDM\n- Besoin urgent suite à une fuite de données récente'
          }
        }
      ]
    }
  ];

  // Fonction pour handle les changements d'entrée dans les formulaires
  const handleInputChange = (generatorId: string, fieldId: string, value: string) => {
    setFormInputs(prev => ({
      ...prev,
      [generatorId]: {
        ...prev[generatorId],
        [fieldId]: value
      }
    }));
  };

  // Fonction pour générer le livrable
  const generateDeliverable = async (generatorId: string) => {
    // Vérification des champs requis
    const generator = deliverableGenerators.find(g => g.id === generatorId);
    if (!generator) return;

    const requiredFields = generator.inputFields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => 
      !formInputs[generatorId][field.id] || formInputs[generatorId][field.id].trim() === ''
    );

    if (missingFields.length > 0) {
      toast({
        variant: 'destructive',
        title: 'Champs obligatoires manquants',
        description: `Veuillez remplir les champs suivants: ${missingFields.map(f => f.label).join(', ')}`
      });
      return;
    }

    // Préparation des états
    setIsGenerating(true);
    setGeneratedContent(prev => ({
      ...prev,
      [generatorId]: {
        content: '',
        loading: true
      }
    }));

    try {
      // Appel à l'API pour générer le contenu
      const response = await fetch('/api/mc2i/generateur-livrables', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          generatorType: generatorId,
          inputs: formInputs[generatorId]
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      const data = await response.json();
      
      // Mise à jour du contenu généré
      setGeneratedContent(prev => ({
        ...prev,
        [generatorId]: {
          content: data.content,
          sections: data.sections || [],
          loading: false
        }
      }));

      toast({
        title: 'Livrable généré avec succès',
        description: 'Vous pouvez maintenant consulter le résultat.'
      });

    } catch (error) {
      console.error('Erreur lors de la génération du livrable:', error);
      
      setGeneratedContent(prev => ({
        ...prev,
        [generatorId]: {
          content: '',
          loading: false,
          error: `Une erreur est survenue: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
        }
      }));

      toast({
        variant: 'destructive',
        title: 'Échec de la génération',
        description: 'Une erreur est survenue. Veuillez réessayer.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Fonction pour charger un exemple
  const loadExample = (generatorId: string, exampleIndex: number) => {
    const generator = deliverableGenerators.find(g => g.id === generatorId);
    if (!generator || !generator.examples[exampleIndex]) return;

    setFormInputs(prev => ({
      ...prev,
      [generatorId]: {
        ...generator.examples[exampleIndex].inputs
      }
    }));

    toast({
      title: 'Exemple chargé',
      description: 'Les champs ont été remplis avec l\'exemple sélectionné.'
    });
  };

  // Fonction pour copier le contenu généré dans le presse-papier
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast({
        title: 'Copié !',
        description: 'Le contenu a été copié dans le presse-papiers.'
      });
    }).catch(err => {
      toast({
        variant: 'destructive',
        title: 'Échec de la copie',
        description: 'Une erreur est survenue lors de la copie.'
      });
    });
  };

  // Fonction pour faire le rendu des formulaires de saisie
  const renderInputForm = (generator: DeliverableGenerator) => {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Informations nécessaires</h3>
          
          {generator.examples.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExamples(prev => ({...prev, [generator.id]: !prev[generator.id]}))}
            >
              {showExamples[generator.id] ? 'Masquer' : 'Voir'} les exemples
            </Button>
          )}
        </div>

        {/* Exemples */}
        {showExamples[generator.id] && generator.examples.length > 0 && (
          <div className="mb-6 p-4 rounded-lg bg-muted/30 border">
            <h4 className="font-medium mb-2">Exemples</h4>
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {generator.examples.map((example, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{example.title}</CardTitle>
                    <CardDescription className="text-xs">{example.description}</CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full"
                      onClick={() => loadExample(generator.id, index)}
                    >
                      Utiliser cet exemple
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Formulaire */}
        <div className="space-y-4">
          {generator.inputFields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={`${generator.id}-${field.id}`} className="flex items-center">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </Label>
              
              {field.type === 'textarea' ? (
                <Textarea
                  id={`${generator.id}-${field.id}`}
                  placeholder={field.placeholder}
                  rows={5}
                  value={formInputs[generator.id][field.id] || ''}
                  onChange={(e) => handleInputChange(generator.id, field.id, e.target.value)}
                  className="resize-y"
                />
              ) : field.type === 'select' ? (
                <Select
                  value={formInputs[generator.id][field.id] || ''}
                  onValueChange={(value) => handleInputChange(generator.id, field.id, value)}
                >
                  <SelectTrigger id={`${generator.id}-${field.id}`}>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={`${generator.id}-${field.id}`}
                  placeholder={field.placeholder}
                  value={formInputs[generator.id][field.id] || ''}
                  onChange={(e) => handleInputChange(generator.id, field.id, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={() => generateDeliverable(generator.id)}
          disabled={isGenerating}
          className={`w-full ${
            generator.gradient ? `bg-gradient-to-r ${generator.gradient} hover:opacity-90` : ''
          } text-white`}
        >
          {isGenerating && generatedContent[generator.id]?.loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Générer le livrable
            </>
          )}
        </Button>
      </div>
    );
  };

  // Fonction pour faire le rendu du résultat généré
  const renderGeneratedContent = (generatorId: string) => {
    const content = generatedContent[generatorId];
    
    if (!content) return null;
    if (content.loading) {
      return (
        <div className="flex flex-col items-center justify-center h-96">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg font-medium">Génération en cours...</p>
          <p className="text-sm text-muted-foreground">Cela peut prendre un moment, veuillez patienter.</p>
        </div>
      );
    }
    
    if (content.error) {
      return (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md my-4">
          <p className="font-medium mb-2">Erreur lors de la génération</p>
          <p>{content.error}</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setGeneratedContent(prev => ({...prev, [generatorId]: null}))}
            className="mt-4"
          >
            Réessayer
          </Button>
        </div>
      );
    }

    if (content.sections && content.sections.length > 0) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Livrable généré</h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(content.content)}
              >
                Copier tout
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => setGeneratedContent(prev => ({...prev, [generatorId]: null}))}
              >
                Générer un nouveau
              </Button>
            </div>
          </div>

          <div className="bg-white text-black dark:bg-gray-900 dark:text-white rounded-lg p-6 shadow-lg">
            <Accordion type="single" collapsible className="w-full">
              {content.sections.map((section, index) => (
                <AccordionItem key={index} value={`section-${index}`}>
                  <AccordionTrigger className="font-medium text-left">
                    {section.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="whitespace-pre-wrap p-4 rounded bg-gray-50 dark:bg-gray-800">
                      {section.content}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Livrable généré</h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(content.content)}
            >
              Copier
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setGeneratedContent(prev => ({...prev, [generatorId]: null}))}
            >
              Générer un nouveau
            </Button>
          </div>
        </div>

        <div className="bg-white text-black dark:bg-gray-900 dark:text-white rounded-lg p-6 shadow-lg">
          <pre className="whitespace-pre-wrap font-sans">{content.content}</pre>
        </div>
      </div>
    );
  };

  return (
    <HomeLayout>
      <div className="container py-8 max-w-screen-lg">
        {/* En-tête de la page */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/amoa-mode-selection')}
              className="h-10 w-10 rounded-full"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Lightbulb className="h-8 w-8 text-amber-400" />
              Générateur de Livrables
            </h1>
          </div>
          <p className="text-gray-900 dark:text-gray-100 max-w-3xl">
            Transformez vos idées en livrables professionnels. Sélectionnez un type de livrable, 
            fournissez les informations nécessaires et notre IA générera un document structuré et prêt à l'emploi.
          </p>
        </div>

        {/* Navigation entre les générateurs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 h-auto p-1 w-full">
            {deliverableGenerators.map(generator => (
              <TabsTrigger 
                key={generator.id} 
                value={generator.id}
                className="flex flex-col items-center gap-1 py-3 h-auto data-[state=active]:shadow-lg"
              >
                <div className={`p-1.5 rounded-full ${generator.gradient ? `bg-gradient-to-br ${generator.gradient}` : ''}`}>
                  {generator.icon}
                </div>
                <span className="text-xs font-medium text-center whitespace-normal">
                  {generator.title.split(' ').slice(0, 3).join(' ')}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Contenu des onglets */}
          {deliverableGenerators.map(generator => (
            <TabsContent key={generator.id} value={generator.id} className="space-y-8">
              <div className="flex gap-2 items-center">
                <div className={`p-2 rounded-full ${generator.gradient ? `bg-gradient-to-br ${generator.gradient}` : ''}`}>
                  {generator.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{generator.title}</h2>
                  <p className="text-gray-900 dark:text-gray-100">{generator.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                {/* Formulaire à gauche */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 rounded-xl border bg-card"
                >
                  {renderInputForm(generator)}
                </motion.div>

                {/* Résultat à droite */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 rounded-xl border bg-card"
                >
                  {generatedContent[generator.id] 
                    ? renderGeneratedContent(generator.id)
                    : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-4">
                        <div className="bg-muted/30 rounded-full p-6 mb-4">
                          {generator.icon}
                        </div>
                        <h3 className="text-lg font-medium mb-2">Prêt à générer votre livrable ?</h3>
                        <p className="text-gray-900 dark:text-gray-100 mb-6 max-w-sm">
                          Remplissez le formulaire à gauche et cliquez sur "Générer le livrable" pour créer votre document.
                        </p>
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Génération rapide en quelques secondes</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Format professionnel prêt à l'emploi</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>Personnalisé selon vos informations</span>
                          </div>
                        </div>
                      </div>
                    )
                  }
                </motion.div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </HomeLayout>
  );
}