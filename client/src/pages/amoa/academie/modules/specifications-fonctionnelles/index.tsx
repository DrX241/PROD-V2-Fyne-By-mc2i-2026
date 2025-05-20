import React from "react";
import { Link } from "wouter";
import { ArrowLeft, FileQuestion, CheckCircle, Clock, Award, PenTool, FileText, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import PageTitle from "@/components/utils/PageTitle";

export default function SpecificationsFonctionnelles() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-slate-950 text-white">
      <PageTitle title="Spécifications fonctionnelles | Formation AMOA" />
      
      {/* En-tête avec navigation et titre */}
      <div className="border-b border-indigo-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/amoa/academie">
            <Button variant="ghost" className="text-indigo-300 hover:bg-indigo-900/30 hover:text-indigo-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Spécifications fonctionnelles</h1>
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
                  <FileQuestion className="h-5 w-5 text-indigo-300" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Spécifications fonctionnelles</h1>
                  <p className="text-indigo-300">Rédaction et structuration des spécifications</p>
                </div>
              </div>
              <Separator className="my-4 bg-indigo-800/40" />
              <p className="text-indigo-200 mb-4">
                Ce module couvre les méthodologies et bonnes pratiques pour la rédaction de spécifications fonctionnelles
                détaillées. Vous apprendrez à transformer les besoins métier en documentations précises et exploitables
                par les équipes techniques.
              </p>
              <div className="flex flex-wrap gap-2 mb-6">
                <Badge className="bg-indigo-900/60 text-indigo-300 border border-indigo-600">Méthodologie</Badge>
                <Badge className="bg-indigo-900/60 text-indigo-300 border border-indigo-600">Intermédiaire</Badge>
                <Badge className="bg-indigo-900/60 text-indigo-300 border border-indigo-600">4-5h</Badge>
              </div>
              
              {/* Objectifs d'apprentissage */}
              <h2 className="text-lg font-medium mb-3 flex items-center">
                <Award className="h-5 w-5 mr-2 text-amber-400" />
                Objectifs d'apprentissage
              </h2>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-400 mr-2 shrink-0 mt-0.5" />
                  <span>Structurer efficacement un document de spécifications fonctionnelles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-400 mr-2 shrink-0 mt-0.5" />
                  <span>Décrire clairement les fonctionnalités, règles métier et contraintes</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-400 mr-2 shrink-0 mt-0.5" />
                  <span>Maîtriser différentes techniques de modélisation (process, data, interfaces)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-indigo-400 mr-2 shrink-0 mt-0.5" />
                  <span>Vérifier la qualité et la cohérence des spécifications</span>
                </li>
              </ul>
            </div>
            
            {/* Contenu du cours - Partie 1 */}
            <Card className="bg-indigo-900/20 border-indigo-700/50">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">1. Principes des spécifications fonctionnelles</h2>
                <p className="text-indigo-200 mb-4">
                  Les spécifications fonctionnelles détaillées constituent le document de référence qui traduit les besoins métier 
                  en descriptions précises des fonctionnalités attendues. Ce document sert de base de travail pour les développeurs 
                  et permet de valider avec le métier que leurs attentes sont correctement comprises.
                </p>
                <div className="bg-indigo-950 border border-indigo-800 rounded-lg p-4 mb-4">
                  <h3 className="font-medium mb-2">Les fondamentaux d'une bonne spécification</h3>
                  <ul className="space-y-2 text-indigo-300">
                    <li><strong>Complétude</strong> : Toutes les fonctionnalités sont décrites</li>
                    <li><strong>Précision</strong> : Chaque fonctionnalité est décrite sans ambiguïté</li>
                    <li><strong>Traçabilité</strong> : Lien clair avec les besoins identifiés</li>
                    <li><strong>Testabilité</strong> : Chaque spécification doit être vérifiable</li>
                    <li><strong>Compréhensibilité</strong> : Accessible à tous les participants du projet</li>
                  </ul>
                </div>
                <p className="text-indigo-200">
                  Il est essentiel de trouver le bon équilibre entre l'exhaustivité du document et sa lisibilité.
                  Un document trop volumineux ou trop technique risque de ne pas être lu ou compris par les parties prenantes métier.
                </p>
              </div>
            </Card>
            
            {/* Contenu du cours - Partie 2 */}
            <Card className="bg-indigo-900/20 border-indigo-700/50">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">2. Structure type d'un document de spécifications</h2>
                <p className="text-indigo-200 mb-4">
                  Une structuration claire et méthodique de vos spécifications fonctionnelles permet une meilleure 
                  compréhension et facilite les mises à jour ultérieures.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800/50">
                    <div className="flex items-center mb-2">
                      <FileText className="h-5 w-5 text-indigo-400 mr-2" />
                      <h3 className="font-medium">Introduction et contexte</h3>
                    </div>
                    <p className="text-sm text-indigo-300">
                      Présentation générale du projet, objectifs, périmètre et parties prenantes.
                    </p>
                  </div>
                  
                  <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800/50">
                    <div className="flex items-center mb-2">
                      <LayoutTemplate className="h-5 w-5 text-indigo-400 mr-2" />
                      <h3 className="font-medium">Description générale</h3>
                    </div>
                    <p className="text-sm text-indigo-300">
                      Architecture fonctionnelle, principaux flux et processus métier, contraintes techniques.
                    </p>
                  </div>
                  
                  <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800/50">
                    <div className="flex items-center mb-2">
                      <PenTool className="h-5 w-5 text-indigo-400 mr-2" />
                      <h3 className="font-medium">Spécifications détaillées</h3>
                    </div>
                    <p className="text-sm text-indigo-300">
                      Description des écrans, fonctionnalités, règles de gestion, contrôles et messages d'erreur.
                    </p>
                  </div>
                  
                  <div className="bg-indigo-950/50 p-4 rounded-lg border border-indigo-800/50">
                    <div className="flex items-center mb-2">
                      <Clock className="h-5 w-5 text-indigo-400 mr-2" />
                      <h3 className="font-medium">Annexes</h3>
                    </div>
                    <p className="text-sm text-indigo-300">
                      Glossaire, diagrammes, modèles de données, scénarios de tests, etc.
                    </p>
                  </div>
                </div>
                
                <p className="text-indigo-200">
                  Veillez à adapter cette structure en fonction de la taille et de la complexité du projet, 
                  tout en conservant une organisation cohérente qui guide le lecteur.
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
                      <span>25%</span>
                    </div>
                    <Progress value={25} className="h-2 bg-indigo-950" />
                  </div>
                  
                  <div className="pt-2">
                    <h3 className="font-medium text-sm mb-3">Chapitres complétés</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">1. Principes des spécifications</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm">2. Structure type</span>
                      </div>
                      <div className="flex items-center text-indigo-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">3. Techniques de modélisation</span>
                      </div>
                      <div className="flex items-center text-indigo-400">
                        <Clock className="h-4 w-4 mr-2" />
                        <span className="text-sm">4. Processus de validation</span>
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
                        <span>Modèle de spécifications fonctionnelles</span>
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <Button variant="link" className="text-indigo-300 hover:text-indigo-100 p-0 h-auto flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Exemples de diagrammes</span>
                      </Button>
                    </Link>
                  </li>
                  <li>
                    <Link href="#">
                      <Button variant="link" className="text-indigo-300 hover:text-indigo-100 p-0 h-auto flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        <span>Checklist de qualité</span>
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
                  Testez vos connaissances sur la rédaction de spécifications fonctionnelles.
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