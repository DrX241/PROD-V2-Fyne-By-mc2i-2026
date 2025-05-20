import React from "react";
import { Link } from "wouter";
import { ArrowLeft, ListChecks, CheckCircle, Clock, Award, Bug, ClipboardCheck, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import PageTitle from "@/components/utils/PageTitle";

export default function GestionTests() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-950 text-white">
      <PageTitle title="Gestion des tests | Formation AMOA" />
      
      {/* En-tête avec navigation et titre */}
      <div className="border-b border-indigo-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/amoa/academie">
            <Button variant="ghost" className="text-indigo-300 hover:bg-indigo-900/30 hover:text-indigo-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Gestion des tests</h1>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale avec contenu du cours */}
          <div className="lg:col-span-2 space-y-8">
            {/* Présentation du module */}
            <div className="bg-indigo-900/30 border border-indigo-700/50 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 rounded-full bg-indigo-800/70 flex items-center justify-center mr-4">
                  <ListChecks className="h-5 w-5 text-indigo-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Gestion des tests</h1>
                  <p className="text-indigo-300">Stratégies et plans de test, recette utilisateurs</p>
                </div>
              </div>
              <Separator className="my-4 bg-indigo-800/40" />
              <p className="text-indigo-200 mb-4">
                Ce module vous enseigne les méthodologies pour concevoir et exécuter des campagnes de test efficaces.
                Vous apprendrez à planifier la stratégie de test, rédiger des cas de test pertinents et organiser 
                la recette utilisateurs pour garantir la qualité des livrables.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge className="bg-indigo-900/60 text-indigo-300 border border-indigo-600">Qualité</Badge>
                <Badge className="bg-indigo-900/60 text-indigo-300 border border-indigo-600">Intermédiaire</Badge>
                <Badge className="bg-indigo-900/60 text-indigo-300 border border-indigo-600">3-4h</Badge>
              </div>
              
              {/* Objectifs d'apprentissage */}
              <h2 className="text-lg font-medium mb-3 flex items-center">
                <Award className="h-5 w-5 mr-2 text-amber-400" />
                Objectifs d'apprentissage
              </h2>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-400 mr-2 shrink-0 mt-0.5" />
                  <span>Élaborer une stratégie de test adaptée aux enjeux du projet</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-400 mr-2 shrink-0 mt-0.5" />
                  <span>Rédiger des cas de test précis et exploitables</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-400 mr-2 shrink-0 mt-0.5" />
                  <span>Organiser les campagnes de test et la recette utilisateurs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-400 mr-2 shrink-0 mt-0.5" />
                  <span>Gérer efficacement les anomalies et leur résolution</span>
                </li>
              </ul>
            </div>
            
            {/* Contenu du cours - Partie 1 */}
            <Card className="bg-indigo-900/20 border-indigo-700/50">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">1. Stratégie et planification des tests</h2>
                <p className="text-indigo-200 mb-4">
                  Une stratégie de test bien définie est essentielle pour garantir la qualité d'un projet informatique.
                  Elle détermine l'approche, les ressources nécessaires et les critères de succès pour les différentes phases de test.
                </p>
                <div className="bg-indigo-950 border border-indigo-800 rounded-lg p-4 mb-4">
                  <h3 className="font-medium mb-2">Composantes d'une stratégie de test</h3>
                  <ul className="space-y-2 text-indigo-300">
                    <li><strong>Périmètre de test</strong> : Fonctionnalités et non-fonctionnalités à tester</li>
                    <li><strong>Types de tests</strong> : Unitaires, intégration, système, performance, sécurité, etc.</li>
                    <li><strong>Environnements</strong> : Configuration requise pour l'exécution des tests</li>
                    <li><strong>Planning</strong> : Calendrier des différentes phases de test</li>
                    <li><strong>Équipe</strong> : Rôles et responsabilités dans l'exécution des tests</li>
                  </ul>
                </div>
                <p className="text-indigo-200">
                  Le rôle de l'AMOA est de définir cette stratégie en collaboration avec la MOE et de s'assurer 
                  que les tests couvrent bien l'ensemble des besoins métier et des exigences fonctionnelles.
                </p>
              </div>
            </Card>
            
            {/* Contenu du cours - Partie 2 */}
            <Card className="bg-indigo-900/20 border-indigo-700/50">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">2. Conception des cas de test</h2>
                <p className="text-indigo-200 mb-4">
                  Les cas de test sont les scénarios concrets qui permettent de vérifier que les fonctionnalités
                  développées répondent aux exigences. Ils doivent être précis, complets et faciles à exécuter.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800/50">
                    <div className="flex items-center mb-2">
                      <Target className="h-5 w-5 text-indigo-400 mr-2" />
                      <h3 className="font-medium">Caractéristiques des bons cas de test</h3>
                    </div>
                    <ul className="space-y-1 text-sm text-indigo-300">
                      <li>• Précis et détaillés</li>
                      <li>• Traçables vers les exigences</li>
                      <li>• Vérifiables et reproductibles</li>
                      <li>• Couvrant les cas nominaux et d'erreur</li>
                    </ul>
                  </div>
                  
                  <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800/50">
                    <div className="flex items-center mb-2">
                      <ClipboardCheck className="h-5 w-5 text-indigo-400 mr-2" />
                      <h3 className="font-medium">Structure d'un cas de test</h3>
                    </div>
                    <ul className="space-y-1 text-sm text-indigo-300">
                      <li>• Identifiant et titre</li>
                      <li>• Prérequis et données de test</li>
                      <li>• Actions à effectuer</li>
                      <li>• Résultats attendus</li>
                      <li>• Critères de succès</li>
                    </ul>
                  </div>
                  
                  <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800/50">
                    <div className="flex items-center mb-2">
                      <Bug className="h-5 w-5 text-indigo-400 mr-2" />
                      <h3 className="font-medium">Techniques de conception</h3>
                    </div>
                    <ul className="space-y-1 text-sm text-indigo-300">
                      <li>• Boîte noire vs boîte blanche</li>
                      <li>• Partitionnement d'équivalence</li>
                      <li>• Analyse des valeurs limites</li>
                      <li>• Tests basés sur l'expérience</li>
                    </ul>
                  </div>
                  
                  <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800/50">
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-indigo-400 mr-2" />
                      <h3 className="font-medium">Priorisation des tests</h3>
                    </div>
                    <ul className="space-y-1 text-sm text-indigo-300">
                      <li>• Tests des fonctionnalités critiques</li>
                      <li>• Tests des parcours utilisateurs principaux</li>
                      <li>• Tests de régression</li>
                      <li>• Tests de non-régression</li>
                    </ul>
                  </div>
                </div>
                
                <p className="text-indigo-200">
                  La conception des cas de test est un processus itératif qui s'affine au fil du projet.
                  L'AMOA joue un rôle crucial dans la validation de la pertinence de ces tests du point de vue métier.
                </p>
              </div>
            </Card>
          </div>
          
          {/* Barre latérale avec progression et ressources */}
          <div className="space-y-6">
            {/* Progression */}
            <Card className="bg-indigo-900/30 border-indigo-700/50">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Votre progression</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progression globale</span>
                      <span>40%</span>
                    </div>
                    <Progress value={40} className="h-2 bg-indigo-950" />
                  </div>
                  
                  <div className="pt-2">
                    <h3 className="font-medium text-sm mb-3">Chapitres complétés</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">1. Stratégie et planification</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">2. Conception des cas de test</span>
                      </div>
                      <div className="flex items-center text-indigo-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">3. Organisation de la recette</span>
                      </div>
                      <div className="flex items-center text-indigo-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">4. Gestion des anomalies</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            
            {/* Ressources complémentaires */}
            <Card className="bg-indigo-900/30 border-indigo-700/50">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Ressources complémentaires</h2>
                <ul className="space-y-3">
                  <li>
                    <Link href="#">
                      <Button variant="link" className="text-indigo-300 hover:text-indigo-100 p-0 h-auto flex items-center">
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        <span>Modèle de plan de test</span>
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <Button variant="link" className="text-indigo-300 hover:text-indigo-100 p-0 h-auto flex items-center">
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        <span>Exemples de cas de test</span>
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <Button variant="link" className="text-indigo-300 hover:text-indigo-100 p-0 h-auto flex items-center">
                        <Bug className="h-4 w-4 mr-2" />
                        <span>Modèle de fiche d'anomalie</span>
                      </Button>
                    </Link>
                  </li>
                </ul>
              </div>
            </Card>
            
            {/* Quiz et évaluation */}
            <Card className="bg-indigo-900/30 border-indigo-700/50">
              <div className="p-6">
                <h2 className="text-lg font-medium mb-4">Évaluation des connaissances</h2>
                <p className="text-indigo-300 mb-4">
                  Testez vos connaissances sur la gestion des tests et la recette utilisateurs.
                </p>
                <Button className="w-full bg-indigo-700 hover:bg-indigo-600">
                  Lancer le quiz
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}