import React from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowLeft, ArrowRight, Clock, User, Building, CheckSquare, XCircle, Shield, Sparkles } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HomeLayout from '@/components/layout/HomeLayout';

// Composant pour les sections de bonnes pratiques
const BestPracticesSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: Array<{ dos: string[]; donts: string[] }>;
}> = ({ title, icon, items }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        {icon}
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <div key={index} className="space-y-4">
            <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-800/30">
              <h4 className="flex items-center gap-2 text-green-400 font-medium mb-2">
                <CheckSquare className="h-5 w-5" /> À faire
              </h4>
              <ul className="space-y-2 pl-5 list-disc">
                {item.dos.map((doItem, i) => (
                  <li key={i} className="text-white">{doItem}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-red-900/20 p-4 rounded-lg border border-red-800/30">
              <h4 className="flex items-center gap-2 text-red-400 font-medium mb-2">
                <XCircle className="h-5 w-5" /> À éviter
              </h4>
              <ul className="space-y-2 pl-5 list-disc">
                {item.donts.map((dontItem, i) => (
                  <li key={i} className="text-white">{dontItem}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CyberInterviewPreparation: React.FC = () => {
  const [, navigate] = useLocation();

  return (
    <HomeLayout>
      <div className="flex flex-col w-full min-h-screen p-4 md:p-8 bg-gradient-to-b from-blue-900 to-gray-950 text-white">
        <div className="flex justify-between items-center mb-4">
          <Button 
            variant="ghost" 
            className="text-white hover:text-white hover:bg-blue-700/50"
            onClick={() => navigate("/cyber")}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">
            Préparation à l'audition client en cybersécurité
          </h1>
          <p className="text-gray-300 max-w-3xl mx-auto">
            Guide complet pour préparer et réussir une audition client dans le domaine de la cybersécurité. 
            Maîtrisez les bonnes pratiques avant, pendant et après l'entretien pour maximiser vos chances de succès.
          </p>
        </div>
        
        <Card className="bg-blue-900/20 border-blue-700/50 shadow-xl w-full max-w-6xl mx-auto">
          <CardHeader className="border-b border-blue-700/50">
            <CardTitle className="text-xl text-center">Guide de préparation d'audition en cybersécurité</CardTitle>
            <CardDescription className="text-gray-300 text-center">
              Conseils pour optimiser votre présentation et votre comportement lors des auditions client
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <Tabs defaultValue="before" className="w-full">
              <TabsList className="grid grid-cols-3 mb-8 bg-blue-950/60">
                <TabsTrigger 
                  value="before"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-700/80 data-[state=active]:to-cyan-700/80"
                >
                  Avant l'audition
                </TabsTrigger>
                <TabsTrigger 
                  value="during"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-700/80 data-[state=active]:to-cyan-700/80"
                >
                  Pendant l'audition
                </TabsTrigger>
                <TabsTrigger 
                  value="after"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-700/80 data-[state=active]:to-cyan-700/80"
                >
                  Après l'audition
                </TabsTrigger>
              </TabsList>
              
              {/* Onglet : Avant l'audition */}
              <TabsContent value="before" className="space-y-6">
                <BestPracticesSection
                  title="Préparation professionnelle"
                  icon={<User className="h-6 w-6 text-blue-400" />}
                  items={[
                    {
                      dos: [
                        "Portez une tenue professionnelle adaptée au contexte (costume/tailleur pour les environnements formels, smart casual pour les contextes plus souples)",
                        "Préparez une copie physique de votre CV et de vos certifications en cybersécurité",
                        "Arrivez 10-15 minutes en avance pour vous installer et vous détendre",
                        "Préparez quelques questions pertinentes sur la mission et les enjeux de sécurité spécifiques"
                      ],
                      donts: [
                        "Évitez les tenues trop décontractées, même pour les entreprises avec dress code souple",
                        "Ne surchargez pas de parfum ou de bijoux trop voyants",
                        "Évitez d'arriver au dernier moment ou en retard",
                        "Ne négligez pas votre communication non verbale (posture, poignée de main assurée, contact visuel)"
                      ]
                    }
                  ]}
                />
                
                <BestPracticesSection
                  title="Recherche et préparation technique"
                  icon={<Building className="h-6 w-6 text-blue-400" />}
                  items={[
                    {
                      dos: [
                        "Recherchez en profondeur l'entreprise cliente, son secteur d'activité et ses enjeux de cybersécurité spécifiques",
                        "Renseignez-vous sur les derniers incidents de sécurité dans le secteur du client",
                        "Préparez des exemples concrets de missions similaires en cybersécurité (anonymisés si nécessaire)",
                        "Revoyez les principales réglementations et normes applicables au secteur du client (RGPD, NIS2, ISO 27001, etc.)"
                      ],
                      donts: [
                        "Ne vous contentez pas d'informations génériques sur l'entreprise",
                        "Évitez de mémoriser un discours trop formaté qui manquera d'authenticité",
                        "Ne négligez pas la veille des dernières menaces et vulnérabilités pertinentes pour le client",
                        "Évitez de vous présenter sans connaître les concurrents principaux et leur positionnement"
                      ]
                    }
                  ]}
                />
              </TabsContent>
              
              {/* Onglet : Pendant l'audition */}
              <TabsContent value="during" className="space-y-6">
                <BestPracticesSection
                  title="Communication et posture"
                  icon={<User className="h-6 w-6 text-blue-400" />}
                  items={[
                    {
                      dos: [
                        "Adoptez une écoute active et posez des questions pertinentes sur les besoins spécifiques en cybersécurité",
                        "Utilisez un vocabulaire précis mais accessible, en adaptant le niveau technique à votre interlocuteur",
                        "Illustrez vos propos avec des exemples concrets de problématiques de sécurité résolues",
                        "Restez honnête sur vos compétences et expériences en cybersécurité"
                      ],
                      donts: [
                        "Évitez de couper la parole ou de monopoliser la conversation",
                        "Ne survendez pas vos compétences ou vos certifications en sécurité",
                        "Évitez le jargon technique excessif face à des interlocuteurs non techniques",
                        "Ne critiquez pas les choix techniques ou de sécurité actuels du client"
                      ]
                    }
                  ]}
                />
                
                <BestPracticesSection
                  title="Réponses aux questions techniques"
                  icon={<Shield className="h-6 w-6 text-blue-400" />}
                  items={[
                    {
                      dos: [
                        "Structurez vos réponses sur les sujets de cybersécurité (contexte, méthode, résultat)",
                        "Démontrez votre compréhension des risques et menaces spécifiques au secteur d'activité",
                        "Expliquez comment vous avez résolu des problèmes de sécurité complexes dans le passé",
                        "Présentez une approche méthodologique claire pour aborder les défis de sécurité"
                      ],
                      donts: [
                        "Évitez les réponses trop longues ou digressives sur les aspects techniques",
                        "Ne restez pas vague sur votre rôle précis dans les projets de cybersécurité passés",
                        "Évitez d'utiliser des exemples non pertinents pour le secteur du client",
                        "Ne sous-estimez pas l'importance de l'aspect humain et organisationnel de la cybersécurité"
                      ]
                    }
                  ]}
                />
                
                <BestPracticesSection
                  title="Gestion du temps"
                  icon={<Clock className="h-6 w-6 text-blue-400" />}
                  items={[
                    {
                      dos: [
                        "Respectez le temps imparti pour chaque partie de l'entretien",
                        "Priorisez les informations essentielles concernant votre expertise en cybersécurité",
                        "Gardez du temps pour poser vos questions sur les enjeux de sécurité spécifiques",
                        "Concluez par un résumé de l'adéquation entre votre profil et les besoins en sécurité"
                      ],
                      donts: [
                        "Évitez les digressions qui consomment du temps précieux",
                        "Ne négligez pas de réserver du temps pour les questions-réponses",
                        "Évitez de consulter votre montre ou téléphone trop fréquemment",
                        "Ne précipitez pas vos réponses aux questions techniques complexes"
                      ]
                    }
                  ]}
                />
              </TabsContent>
              
              {/* Onglet : Après l'audition */}
              <TabsContent value="after" className="space-y-6">
                <BestPracticesSection
                  title="Suivi professionnel"
                  icon={<CheckSquare className="h-6 w-6 text-blue-400" />}
                  items={[
                    {
                      dos: [
                        "Envoyez un email de remerciement dans les 24h, en rappelant les points clés évoqués sur la sécurité",
                        "Fournissez les informations complémentaires promises lors de l'entretien (articles, livre blanc, références)",
                        "Faites un débriefing avec votre manager sur les points forts et axes d'amélioration",
                        "Notez les questions techniques qui vous ont posé difficulté pour vous améliorer"
                      ],
                      donts: [
                        "Ne relancez pas de façon trop insistante ou prématurée",
                        "Évitez de négliger l'analyse post-entretien qui vous permettra de progresser",
                        "Ne communiquez pas d'informations confidentielles sur d'autres clients par email",
                        "Évitez de surinterpréter les signaux positifs ou négatifs reçus pendant l'entretien"
                      ]
                    }
                  ]}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          
          {/* Bouton pour accéder à la simulation */}
          <CardFooter className="border-t border-blue-700/50 pt-6 flex justify-center">
            <div className="text-center">
              <Button
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-2 px-6 rounded-full shadow-lg transform transition-all duration-300 hover:scale-105"
                onClick={() => navigate('/cyber/interview-simulation')}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Démarrer une simulation d'audition
              </Button>
              <p className="text-blue-200 text-sm mt-2">
                Mettez en pratique ces conseils dans notre environnement de simulation
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </HomeLayout>
  );
};

export default CyberInterviewPreparation;