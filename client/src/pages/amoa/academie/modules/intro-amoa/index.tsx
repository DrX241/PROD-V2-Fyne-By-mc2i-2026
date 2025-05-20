import React from "react";
import { Link } from "wouter";
import { ArrowLeft, BookOpen, FileText, CheckCircle, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import PageTitle from "@/components/utils/PageTitle";

export default function IntroAmoa() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-950 text-white">
      <PageTitle title="Introduction à l'AMOA | Formation" />
      
      {/* En-tête avec navigation et titre */}
      <div className="border-b border-indigo-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/amoa/academie">
            <Button variant="ghost" className="text-indigo-300 hover:bg-indigo-900/30 hover:text-indigo-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Introduction à l'AMOA</h1>
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
                  <BookOpen className="h-5 w-5 text-indigo-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Introduction à l'AMOA</h1>
                  <p className="text-indigo-300">Le rôle et les responsabilités de l'AMOA dans les projets</p>
                </div>
              </div>
              <Separator className="my-4 bg-indigo-800/40" />
              <p className="text-indigo-200 mb-4">
                Ce module vous fournit les connaissances fondamentales sur le métier d'Assistance à Maîtrise d'Ouvrage (AMOA). 
                Vous découvrirez les rôles clés, les responsabilités et les compétences essentielles pour exceller dans cette fonction.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge className="bg-indigo-900/60 text-indigo-300 border border-indigo-600">Fondamentaux</Badge>
                <Badge className="bg-indigo-900/60 text-indigo-300 border border-indigo-600">Débutant</Badge>
                <Badge className="bg-indigo-900/60 text-indigo-300 border border-indigo-600">2-3h</Badge>
              </div>
              
              {/* Objectifs d'apprentissage */}
              <h2 className="text-lg font-medium mb-3 flex items-center">
                <Award className="h-5 w-5 mr-2 text-amber-400" />
                Objectifs d'apprentissage
              </h2>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-400 mr-2 shrink-0 mt-0.5" />
                  <span>Comprendre le positionnement de l'AMOA entre la maîtrise d'ouvrage et la maîtrise d'œuvre</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-400 mr-2 shrink-0 mt-0.5" />
                  <span>Maîtriser les responsabilités clés et les livrables attendus d'un AMOA</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-400 mr-2 shrink-0 mt-0.5" />
                  <span>Identifier les compétences techniques et relationnelles nécessaires</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-400 mr-2 shrink-0 mt-0.5" />
                  <span>Comprendre le cycle de vie d'un projet et l'intervention de l'AMOA à chaque étape</span>
                </li>
              </ul>
            </div>
            
            {/* Contenu du cours - Partie 1 */}
            <Card className="bg-indigo-900/20 border-indigo-700/50">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">1. Définition et positionnement de l'AMOA</h2>
                <p className="text-indigo-200 mb-4">
                  L'Assistance à Maîtrise d'Ouvrage (AMOA) représente un rôle d'interface et de conseil auprès de la maîtrise d'ouvrage (MOA). 
                  Dans l'écosystème d'un projet, l'AMOA se positionne comme un facilitateur entre les parties prenantes métier (MOA) et les équipes 
                  techniques chargées de la réalisation (MOE).
                </p>
                <div className="bg-indigo-950 border border-indigo-800 rounded-lg p-4 mb-4">
                  <h3 className="font-medium mb-2">Le triptyque MOA-AMOA-MOE</h3>
                  <ul className="space-y-2 text-indigo-300">
                    <li><strong>MOA (Maîtrise d'Ouvrage)</strong> : Représente le client, définit le besoin et finance le projet</li>
                    <li><strong>AMOA (Assistance à Maîtrise d'Ouvrage)</strong> : Conseille la MOA et traduit les besoins métier</li>
                    <li><strong>MOE (Maîtrise d'Œuvre)</strong> : Conçoit et réalise la solution technique</li>
                  </ul>
                </div>
                <p className="text-indigo-200">
                  La valeur ajoutée de l'AMOA réside dans sa capacité à comprendre à la fois les enjeux métier et les contraintes techniques,
                  facilitant ainsi la communication entre des parties prenantes aux perspectives parfois divergentes.
                </p>
              </div>
            </Card>
            
            {/* Contenu du cours - Partie 2 */}
            <Card className="bg-indigo-900/20 border-indigo-700/50">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">2. Responsabilités et missions de l'AMOA</h2>
                <p className="text-indigo-200 mb-4">
                  Les missions de l'AMOA s'étendent tout au long du cycle de vie du projet, de la phase d'initialisation jusqu'à la mise en service 
                  et parfois au-delà. Voici les principales responsabilités :
                </p>
                
                <div className="space-y-4 mb-4">
                  <div className="border-l-4 border-indigo-600 pl-4 py-1">
                    <h3 className="font-medium">Cadrage et expression des besoins</h3>
                    <p className="text-indigo-300">Accompagnement dans la définition et la formalisation des besoins métier</p>
                  </div>
                  
                  <div className="border-l-4 border-indigo-600 pl-4 py-1">
                    <h3 className="font-medium">Rédaction des spécifications fonctionnelles</h3>
                    <p className="text-indigo-300">Traduction des besoins métier en spécifications compréhensibles par la MOE</p>
                  </div>
                  
                  <div className="border-l-4 border-indigo-600 pl-4 py-1">
                    <h3 className="font-medium">Conduite du changement</h3>
                    <p className="text-indigo-300">Préparation des utilisateurs aux changements induits par le projet</p>
                  </div>
                  
                  <div className="border-l-4 border-indigo-600 pl-4 py-1">
                    <h3 className="font-medium">Validation et recette</h3>
                    <p className="text-indigo-300">Organisation et pilotage des tests fonctionnels et de la recette utilisateurs</p>
                  </div>
                </div>
                
                <p className="text-indigo-200">
                  L'AMOA joue également un rôle crucial dans la gestion des risques, l'estimation des charges, et peut intervenir dans la 
                  sélection des prestataires lors des appels d'offres.
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
                      <span>15%</span>
                    </div>
                    <Progress value={15} className="h-2 bg-indigo-950" />
                  </div>
                  
                  <div className="pt-2">
                    <h3 className="font-medium text-sm mb-3">Chapitres complétés</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">1. Définition et positionnement</span>
                      </div>
                      <div className="flex items-center text-indigo-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">2. Responsabilités et missions</span>
                      </div>
                      <div className="flex items-center text-indigo-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">3. Compétences requises</span>
                      </div>
                      <div className="flex items-center text-indigo-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">4. L'AMOA dans le cycle de vie projet</span>
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
                        <span>Guide des bonnes pratiques AMOA</span>
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <Button variant="link" className="text-indigo-300 hover:text-indigo-100 p-0 h-auto flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Modèles de documents AMOA</span>
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <Button variant="link" className="text-indigo-300 hover:text-indigo-100 p-0 h-auto flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Lexique des termes AMOA</span>
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
                  Testez vos connaissances sur le rôle et les responsabilités de l'AMOA avec notre quiz interactif.
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