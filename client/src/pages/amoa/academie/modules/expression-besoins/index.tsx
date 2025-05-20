import React from "react";
import { Link } from "wouter";
import { ArrowLeft, FileText, CheckCircle, Clock, Award, Users, MessageSquare, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import PageTitle from "@/components/utils/PageTitle";

export default function ExpressionBesoins() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-950 text-white">
      <PageTitle title="Expression des besoins | Formation AMOA" />
      
      {/* En-tête avec navigation et titre */}
      <div className="border-b border-indigo-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/amoa/academie">
            <Button variant="ghost" className="text-indigo-300 hover:bg-indigo-900/30 hover:text-indigo-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Expression des besoins</h1>
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
                  <FileText className="h-5 w-5 text-indigo-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Expression des besoins</h1>
                  <p className="text-indigo-300">Techniques d'élicitation et formalisation des besoins métier</p>
                </div>
              </div>
              <Separator className="my-4 bg-indigo-800/40" />
              <p className="text-indigo-200 mb-4">
                Ce module vous permettra d'acquérir les compétences nécessaires pour recueillir, analyser et formaliser 
                efficacement les besoins des utilisateurs. Vous apprendrez les techniques d'entretien, d'animation d'ateliers 
                et de documentation qui sont essentielles à tout projet informatique.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge className="bg-indigo-900/60 text-indigo-300 border border-indigo-600">Fondamentaux</Badge>
                <Badge className="bg-indigo-900/60 text-indigo-300 border border-indigo-600">Débutant</Badge>
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
                  <span>Maîtriser les différentes techniques d'élicitation des besoins</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-400 mr-2 shrink-0 mt-0.5" />
                  <span>Savoir poser les bonnes questions et animer des ateliers productifs</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-400 mr-2 shrink-0 mt-0.5" />
                  <span>Formaliser les besoins dans un document structuré et compréhensible</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-400 mr-2 shrink-0 mt-0.5" />
                  <span>Savoir prioriser les besoins avec les parties prenantes</span>
                </li>
              </ul>
            </div>
            
            {/* Contenu du cours - Partie 1 */}
            <Card className="bg-indigo-900/20 border-indigo-700/50">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">1. Les fondamentaux de l'expression des besoins</h2>
                <p className="text-indigo-200 mb-4">
                  L'expression des besoins est une étape cruciale dans tout projet informatique. Elle consiste à identifier 
                  et à comprendre les attentes des utilisateurs pour concevoir une solution adaptée. Un besoin mal identifié 
                  ou mal formalisé peut entraîner des coûts importants et des délais supplémentaires.
                </p>
                <div className="bg-indigo-950 border border-indigo-800 rounded-lg p-4 mb-4">
                  <h3 className="font-medium mb-2">Principes clés</h3>
                  <ul className="space-y-2 text-indigo-300">
                    <li><strong>Exhaustivité</strong> : Tous les besoins doivent être identifiés</li>
                    <li><strong>Précision</strong> : Chaque besoin doit être clairement défini</li>
                    <li><strong>Non-ambiguïté</strong> : Un besoin ne doit pas être sujet à interprétation</li>
                    <li><strong>Cohérence</strong> : Les besoins ne doivent pas se contredire</li>
                    <li><strong>Testabilité</strong> : Un besoin doit pouvoir être vérifié lors de la recette</li>
                  </ul>
                </div>
                <p className="text-indigo-200">
                  L'AMOA joue un rôle essentiel d'interface entre les métiers et la technique, en traduisant 
                  les besoins exprimés en langage courant vers des spécifications compréhensibles par les équipes techniques.
                </p>
              </div>
            </Card>
            
            {/* Contenu du cours - Partie 2 */}
            <Card className="bg-indigo-900/20 border-indigo-700/50">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">2. Techniques d'élicitation des besoins</h2>
                <p className="text-indigo-200 mb-4">
                  L'élicitation des besoins consiste à recueillir les informations nécessaires auprès des parties prenantes. 
                  Voici les principales techniques à votre disposition :
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800/50">
                    <div className="flex items-center mb-2">
                      <MessageSquare className="h-5 w-5 text-indigo-400 mr-2" />
                      <h3 className="font-medium">Entretiens individuels</h3>
                    </div>
                    <p className="text-sm text-indigo-300">
                      Discussions en face-à-face avec les principaux utilisateurs pour comprendre leurs attentes et contraintes.
                    </p>
                  </div>
                  
                  <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800/50">
                    <div className="flex items-center mb-2">
                      <Users className="h-5 w-5 text-indigo-400 mr-2" />
                      <h3 className="font-medium">Ateliers collectifs</h3>
                    </div>
                    <p className="text-sm text-indigo-300">
                      Sessions de travail en groupe pour favoriser l'émergence d'idées et la confrontation des points de vue.
                    </p>
                  </div>
                  
                  <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800/50">
                    <div className="flex items-center mb-2">
                      <ClipboardList className="h-5 w-5 text-indigo-400 mr-2" />
                      <h3 className="font-medium">Questionnaires</h3>
                    </div>
                    <p className="text-sm text-indigo-300">
                      Formulaires permettant de recueillir des informations structurées auprès d'un grand nombre d'utilisateurs.
                    </p>
                  </div>
                  
                  <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800/50">
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-indigo-400 mr-2" />
                      <h3 className="font-medium">Observation terrain</h3>
                    </div>
                    <p className="text-sm text-indigo-300">
                      Immersion dans l'environnement de travail des utilisateurs pour comprendre leurs pratiques réelles.
                    </p>
                  </div>
                </div>
                
                <p className="text-indigo-200">
                  Pour des résultats optimaux, il est recommandé de combiner plusieurs de ces techniques, en les adaptant 
                  au contexte du projet et au profil des parties prenantes.
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
                      <span>30%</span>
                    </div>
                    <Progress value={30} className="h-2 bg-indigo-950" />
                  </div>
                  
                  <div className="pt-2">
                    <h3 className="font-medium text-sm mb-3">Chapitres complétés</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">1. Les fondamentaux</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">2. Techniques d'élicitation</span>
                      </div>
                      <div className="flex items-center text-indigo-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">3. Formalisation des besoins</span>
                      </div>
                      <div className="flex items-center text-indigo-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">4. Priorisation et validation</span>
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
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Modèle de cahier des charges</span>
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <Button variant="link" className="text-indigo-300 hover:text-indigo-100 p-0 h-auto flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Guide d'entretien utilisateur</span>
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <Button variant="link" className="text-indigo-300 hover:text-indigo-100 p-0 h-auto flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Checklist d'analyse des besoins</span>
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
                  Testez vos connaissances sur les techniques d'élicitation et la formalisation des besoins.
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