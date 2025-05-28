import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Database, 
  Cog, 
  CheckCircle, 
  Zap, 
  Users, 
  Shield, 
  BookOpen,
  MessageSquare,
  Target,
  ArrowRight,
  Sparkles
} from "lucide-react";
import HomeLayout from "@/components/layout/HomeLayout";
import PageTitle from "@/components/utils/PageTitle";
import { useLocation } from "wouter";

export default function AIArchitecturePage() {
  const [, setLocation] = useLocation();

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f1c] via-[#1a1f3a] to-[#0a0f1c] p-6">
        <PageTitle 
          title="Architecture IA de la Plateforme" 
          subtitle="Découvrez comment l'intelligence artificielle optimise votre apprentissage"
        />
        
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Vue d'ensemble */}
          <Card className="bg-[#091525] border-[#00b4d8]/30 shadow-[0_0_20px_rgba(0,180,216,0.15)]">
            <CardHeader>
              <CardTitle className="text-[#00b4d8] text-2xl font-mono flex items-center gap-3">
                <Brain className="h-8 w-8" />
                Architecture Hybride : IA + Expertise Humaine
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#112641] p-6 rounded-lg border border-[#00b4d8]/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="h-6 w-6 text-[#00b4d8]" />
                    <h3 className="text-[#00b4d8] text-lg font-medium">IA Générative</h3>
                  </div>
                  <p className="text-[#c3d9ee] text-sm leading-relaxed">
                    L'IA génère dynamiquement du contenu adaptatif basé sur des sources 
                    validées et des modèles pédagogiques éprouvés, personnalisant 
                    l'expérience selon votre profil et progression.
                  </p>
                </div>
                
                <div className="bg-[#112641] p-6 rounded-lg border border-[#00b4d8]/20">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                    <h3 className="text-green-400 text-lg font-medium">Curation Experte</h3>
                  </div>
                  <p className="text-[#c3d9ee] text-sm leading-relaxed">
                    Les experts valident et enrichissent les sources de données, 
                    garantissant la qualité, l'exactitude et la pertinence 
                    des informations utilisées par l'IA.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Flux de données */}
          <Card className="bg-[#091525] border-[#00b4d8]/30">
            <CardHeader>
              <CardTitle className="text-[#00b4d8] text-xl font-mono flex items-center gap-3">
                <Cog className="h-6 w-6" />
                Flux de Création de Contenu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="bg-[#112641] p-4 rounded-lg border border-[#00b4d8]/20 mb-3">
                    <Database className="h-8 w-8 text-[#00b4d8] mx-auto mb-2" />
                    <h4 className="text-[#00b4d8] font-medium text-sm">Sources Expertes</h4>
                    <p className="text-[#c3d9ee] text-xs mt-1">
                      Référentiels, normes, best practices validés
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                    Curation Humaine
                  </Badge>
                </div>

                <ArrowRight className="h-6 w-6 text-[#00b4d8] mx-auto mt-8 hidden md:block" />

                <div className="text-center">
                  <div className="bg-[#112641] p-4 rounded-lg border border-[#00b4d8]/20 mb-3">
                    <Brain className="h-8 w-8 text-[#00b4d8] mx-auto mb-2" />
                    <h4 className="text-[#00b4d8] font-medium text-sm">Génération IA</h4>
                    <p className="text-[#c3d9ee] text-xs mt-1">
                      Contenu adaptatif et personnalisé
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                    IA Générative
                  </Badge>
                </div>

                <ArrowRight className="h-6 w-6 text-[#00b4d8] mx-auto mt-8 hidden md:block" />

                <div className="text-center">
                  <div className="bg-[#112641] p-4 rounded-lg border border-[#00b4d8]/20 mb-3">
                    <Users className="h-8 w-8 text-[#00b4d8] mx-auto mb-2" />
                    <h4 className="text-[#00b4d8] font-medium text-sm">Expérience Utilisateur</h4>
                    <p className="text-[#c3d9ee] text-xs mt-1">
                      Formation interactive et sur-mesure
                    </p>
                  </div>
                  <Badge variant="secondary" className="bg-purple-500/20 text-purple-400">
                    Hybride
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Apports de l'IA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#091525] border-[#00b4d8]/30">
              <CardHeader>
                <CardTitle className="text-[#00b4d8] text-lg font-mono flex items-center gap-3">
                  <Zap className="h-6 w-6" />
                  Apports de l'IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-[#112641] rounded-lg border border-[#00b4d8]/20">
                    <MessageSquare className="h-5 w-5 text-[#00b4d8] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-[#00b4d8] font-medium text-sm">Chat Adaptatif</h4>
                      <p className="text-[#c3d9ee] text-xs mt-1">
                        Conversations intelligentes qui s'adaptent à votre niveau et style d'apprentissage
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#112641] rounded-lg border border-[#00b4d8]/20">
                    <Target className="h-5 w-5 text-[#00b4d8] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-[#00b4d8] font-medium text-sm">Scénarios Dynamiques</h4>
                      <p className="text-[#c3d9ee] text-xs mt-1">
                        Génération de mises en situation réalistes basées sur votre profil
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#112641] rounded-lg border border-[#00b4d8]/20">
                    <BookOpen className="h-5 w-5 text-[#00b4d8] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-[#00b4d8] font-medium text-sm">Quiz Personnalisés</h4>
                      <p className="text-[#c3d9ee] text-xs mt-1">
                        Questions adaptées à vos lacunes et objectifs d'apprentissage
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#112641] rounded-lg border border-[#00b4d8]/20">
                    <Shield className="h-5 w-5 text-[#00b4d8] mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-[#00b4d8] font-medium text-sm">Évaluation Continue</h4>
                      <p className="text-[#c3d9ee] text-xs mt-1">
                        Analyse automatique de vos réponses et suggestions d'amélioration
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#091525] border-[#00b4d8]/30">
              <CardHeader>
                <CardTitle className="text-green-400 text-lg font-mono flex items-center gap-3">
                  <CheckCircle className="h-6 w-6" />
                  Contrôle Qualité Humain
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-[#112641] rounded-lg border border-green-400/20">
                    <Database className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-green-400 font-medium text-sm">Sources Validées</h4>
                      <p className="text-[#c3d9ee] text-xs mt-1">
                        Référentiels ANSSI, ISO, NIST et best practices validés par des experts
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#112641] rounded-lg border border-green-400/20">
                    <Users className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-green-400 font-medium text-sm">Expertise Métier</h4>
                      <p className="text-[#c3d9ee] text-xs mt-1">
                        Contenus enrichis et validés par des professionnels expérimentés
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#112641] rounded-lg border border-green-400/20">
                    <Cog className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-green-400 font-medium text-sm">Modèles Pédagogiques</h4>
                      <p className="text-[#c3d9ee] text-xs mt-1">
                        Structures d'apprentissage optimisées et testées en conditions réelles
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-[#112641] rounded-lg border border-green-400/20">
                    <Shield className="h-5 w-5 text-green-400 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="text-green-400 font-medium text-sm">Mise à Jour Continue</h4>
                      <p className="text-[#c3d9ee] text-xs mt-1">
                        Veille constante sur les nouvelles menaces et évolutions réglementaires
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Avantages de l'approche hybride */}
          <Card className="bg-[#091525] border-[#00b4d8]/30">
            <CardHeader>
              <CardTitle className="text-[#00b4d8] text-xl font-mono">
                Pourquoi cette Approche Hybride ?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="bg-[#112641] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00b4d8]/20">
                    <Shield className="h-8 w-8 text-[#00b4d8]" />
                  </div>
                  <h3 className="text-[#00b4d8] font-medium mb-2">Fiabilité</h3>
                  <p className="text-[#c3d9ee] text-sm">
                    Contenu vérifié et validé par des experts, garantissant l'exactitude des informations
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="bg-[#112641] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00b4d8]/20">
                    <Zap className="h-8 w-8 text-[#00b4d8]" />
                  </div>
                  <h3 className="text-[#00b4d8] font-medium mb-2">Adaptabilité</h3>
                  <p className="text-[#c3d9ee] text-sm">
                    Personnalisation en temps réel selon votre progression et vos besoins spécifiques
                  </p>
                </div>

                <div className="text-center p-4">
                  <div className="bg-[#112641] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#00b4d8]/20">
                    <Target className="h-8 w-8 text-[#00b4d8]" />
                  </div>
                  <h3 className="text-[#00b4d8] font-medium mb-2">Pertinence</h3>
                  <p className="text-[#c3d9ee] text-sm">
                    Contenu toujours à jour avec les dernières menaces et réglementations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to action */}
          <div className="text-center">
            <Button
              onClick={() => setLocation('/cyber/sas-academie')}
              className="bg-[#00b4d8] hover:bg-[#00b4d8]/80 text-[#091525] px-8 py-3 text-lg"
            >
              Découvrir les Formations
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
}