import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { IoArrowBack, IoBookOutline, IoSchoolOutline, IoStatsChartOutline, IoCodeSlashOutline, IoBarChartOutline, IoServerOutline, IoExtensionPuzzleOutline } from 'react-icons/io5';
import useHighContrastMode from '@/hooks/useHighContrastMode';

type ModuleContent = {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  icon: React.ReactNode;
  progress: number;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  durationMinutes: number;
  color: string;
};

// Composant pour l'arrière-plan animé
function DataSceneBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#050c15] to-[#0a1525]" />
  );
}

export default function DataAcademie() {
  const [, setLocation] = useLocation();
  const { highContrastMode } = useHighContrastMode();
  const [activeTab, setActiveTab] = useState('fondamentaux');
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  
  // Déclaration des modules avec leur contenu
  const modules: Record<string, ModuleContent[]> = {
    fondamentaux: [
      {
        id: 'intro-data-science',
        title: 'Introduction à la Data Science',
        description: 'Comprendre les bases de la Data Science et les types d\'analyses',
        difficulty: 'débutant',
        durationMinutes: 20,
        progress: 0,
        color: 'blue',
        icon: <IoStatsChartOutline className="h-5 w-5" />,
        content: (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Qu'est-ce que la Data Science ?</h3>
            <p>La Data Science est un domaine interdisciplinaire qui utilise des méthodes scientifiques, des processus, des algorithmes et des systèmes pour extraire des connaissances et des insights à partir de données structurées et non structurées.</p>
            
            <h4 className="text-lg font-semibold mt-4">Les 4 piliers de la Data Science :</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
                <h5 className="font-bold text-blue-400">1. Collecte de données</h5>
                <p className="text-sm">Acquisition et nettoyage des données brutes de différentes sources</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-3">
                <h5 className="font-bold text-purple-400">2. Analyse exploratoire</h5>
                <p className="text-sm">Visualisation et compréhension des patterns dans les données</p>
              </div>
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-md p-3">
                <h5 className="font-bold text-pink-400">3. Modélisation</h5>
                <p className="text-sm">Construction de modèles prédictifs et explicatifs</p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-md p-3">
                <h5 className="font-bold text-cyan-400">4. Interprétation</h5>
                <p className="text-sm">Tirer des conclusions et communiquer les résultats</p>
              </div>
            </div>

            <h4 className="text-lg font-semibold mt-4">Différents types d'analyses :</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li><span className="font-semibold">Analyse descriptive</span> : Résume ce qui s'est passé (passé)</li>
              <li><span className="font-semibold">Analyse diagnostique</span> : Explique pourquoi cela s'est produit (passé)</li>
              <li><span className="font-semibold">Analyse prédictive</span> : Prédit ce qui pourrait se passer (futur)</li>
              <li><span className="font-semibold">Analyse prescriptive</span> : Recommande des actions à prendre (futur)</li>
            </ul>

            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-4 rounded-md border border-blue-500/30 mt-6">
              <h4 className="font-bold text-lg">Exemple concret</h4>
              <p className="mt-2">Imaginez une entreprise de e-commerce qui analyse :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Les tendances de vente (descriptif)</li>
                <li>Les facteurs qui influencent les achats (diagnostique)</li>
                <li>Les ventes futures probables (prédictif)</li>
                <li>La meilleure stratégie de prix et de marketing (prescriptif)</li>
              </ul>
            </div>
          </div>
        )
      },
      {
        id: 'stats-fondamentaux',
        title: 'Statistiques Fondamentales',
        description: 'Maîtriser les concepts statistiques essentiels pour l\'analyse de données',
        difficulty: 'débutant',
        durationMinutes: 30,
        progress: 0,
        color: 'purple',
        icon: <IoBarChartOutline className="h-5 w-5" />,
        content: (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Les fondamentaux statistiques pour la Data Science</h3>
            <p>Les statistiques constituent le langage de base pour comprendre et interpréter les données.</p>
            
            <h4 className="text-lg font-semibold mt-4">Mesures de tendance centrale</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
                <h5 className="font-bold text-blue-400">Moyenne</h5>
                <p className="text-sm">La somme des valeurs divisée par le nombre de valeurs</p>
                <div className="mt-2 bg-blue-600/20 p-2 rounded text-center">
                  <span className="font-mono">μ = (Σx) / n</span>
                </div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-3">
                <h5 className="font-bold text-purple-400">Médiane</h5>
                <p className="text-sm">La valeur centrale qui sépare les données en deux moitiés égales</p>
                <div className="mt-2 bg-purple-600/20 p-2 rounded text-center">
                  <span className="font-mono">Position = (n+1) / 2</span>
                </div>
              </div>
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-md p-3">
                <h5 className="font-bold text-pink-400">Mode</h5>
                <p className="text-sm">La valeur qui apparaît le plus fréquemment dans l'ensemble de données</p>
              </div>
            </div>

            <h4 className="text-lg font-semibold mt-4">Mesures de dispersion</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-md p-3">
                <h5 className="font-bold text-cyan-400">Variance</h5>
                <p className="text-sm">Mesure l'étalement des données par rapport à la moyenne</p>
                <div className="mt-2 bg-cyan-600/20 p-2 rounded text-center">
                  <span className="font-mono">σ² = Σ(x - μ)² / n</span>
                </div>
              </div>
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-md p-3">
                <h5 className="font-bold text-teal-400">Écart-type</h5>
                <p className="text-sm">Racine carrée de la variance, exprimée dans la même unité que les données</p>
                <div className="mt-2 bg-teal-600/20 p-2 rounded text-center">
                  <span className="font-mono">σ = √σ²</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-4 rounded-md border border-indigo-500/30 mt-6">
              <h4 className="font-bold text-lg">Application en Data Science</h4>
              <p className="mt-2">Ces concepts sont essentiels pour :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Comprendre la distribution de vos données</li>
                <li>Détecter les anomalies et valeurs aberrantes</li>
                <li>Préparer les données pour la modélisation</li>
                <li>Évaluer la performance des modèles</li>
              </ul>
            </div>

            <h4 className="text-lg font-semibold mt-4">Distributions de probabilité</h4>
            <p>Les distributions les plus courantes en analyse de données :</p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><span className="font-semibold text-blue-400">Distribution normale</span> : La fameuse "courbe en cloche"</li>
              <li><span className="font-semibold text-purple-400">Distribution binomiale</span> : Pour les événements binaires (succès/échec)</li>
              <li><span className="font-semibold text-pink-400">Distribution de Poisson</span> : Pour compter les occurrences d'événements rares</li>
            </ul>
          </div>
        )
      },
      {
        id: 'visualisation-donnees',
        title: 'Visualisation de Données',
        description: 'Apprendre à créer des visualisations efficaces pour communiquer les insights',
        difficulty: 'débutant',
        durationMinutes: 25,
        progress: 0,
        color: 'indigo',
        icon: <IoExtensionPuzzleOutline className="h-5 w-5" />,
        content: (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">L'art de la visualisation de données</h3>
            <p>La visualisation de données est l'art de transformer des données brutes en représentations visuelles qui facilitent la compréhension et la prise de décision.</p>
            
            <h4 className="text-lg font-semibold mt-4">Principes fondamentaux</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
                <h5 className="font-bold text-blue-400">Simplicité</h5>
                <p className="text-sm">Éliminer les éléments inutiles et mettre en évidence l'information pertinente</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-3">
                <h5 className="font-bold text-purple-400">Intégrité</h5>
                <p className="text-sm">Représenter les données avec précision, sans distorsion ni manipulation</p>
              </div>
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-md p-3">
                <h5 className="font-bold text-indigo-400">Contexte</h5>
                <p className="text-sm">Fournir suffisamment de contexte pour que le public comprenne l'importance des données</p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-md p-3">
                <h5 className="font-bold text-cyan-400">Accessibilité</h5>
                <p className="text-sm">Créer des visualisations compréhensibles par tous, indépendamment de leurs compétences techniques</p>
              </div>
            </div>

            <h4 className="text-lg font-semibold mt-4">Types de visualisations</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
                <h5 className="font-bold text-blue-400">Distribution</h5>
                <ul className="list-disc pl-4 text-sm space-y-1 mt-1">
                  <li>Histogrammes</li>
                  <li>Box plots</li>
                  <li>Violin plots</li>
                </ul>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-3">
                <h5 className="font-bold text-purple-400">Comparaison</h5>
                <ul className="list-disc pl-4 text-sm space-y-1 mt-1">
                  <li>Bar charts</li>
                  <li>Spider/Radar charts</li>
                  <li>Heatmaps</li>
                </ul>
              </div>
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-md p-3">
                <h5 className="font-bold text-teal-400">Relation</h5>
                <ul className="list-disc pl-4 text-sm space-y-1 mt-1">
                  <li>Scatter plots</li>
                  <li>Bubble charts</li>
                  <li>Network diagrams</li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-md p-3">
                <h5 className="font-bold text-pink-400">Composition</h5>
                <ul className="list-disc pl-4 text-sm space-y-1 mt-1">
                  <li>Pie charts</li>
                  <li>Stacked bar charts</li>
                  <li>Treemaps</li>
                </ul>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3">
                <h5 className="font-bold text-amber-400">Tendance</h5>
                <ul className="list-disc pl-4 text-sm space-y-1 mt-1">
                  <li>Line charts</li>
                  <li>Area charts</li>
                  <li>Candlestick charts</li>
                </ul>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 p-4 rounded-md border border-blue-500/30 mt-6">
              <h4 className="font-bold text-lg">Bonnes pratiques</h4>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Adapter le type de visualisation au message à communiquer</li>
                <li>Utiliser la couleur avec parcimonie et de manière cohérente</li>
                <li>Inclure des titres et légendes informatifs</li>
                <li>Veiller à l'accessibilité (contraste, daltonisme)</li>
                <li>Éviter les distorsions d'échelle qui peuvent tromper</li>
              </ul>
            </div>
          </div>
        )
      },
    ],
    intelligence_artificielle: [
      {
        id: 'intro-ia-ml',
        title: 'Introduction à l\'IA et ML',
        description: 'Comprendre les concepts fondamentaux de l\'IA et du Machine Learning',
        difficulty: 'débutant',
        durationMinutes: 25,
        progress: 0,
        color: 'purple',
        icon: <IoSchoolOutline className="h-5 w-5" />,
        content: (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Intelligence Artificielle et Machine Learning</h3>
            <p>L'intelligence artificielle (IA) est un domaine de l'informatique qui vise à créer des systèmes capables d'effectuer des tâches qui nécessiteraient normalement l'intelligence humaine.</p>
            
            <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 p-4 rounded-md border border-purple-500/30">
              <h4 className="font-bold text-lg">Les principales branches de l'IA</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-3">
                  <h5 className="font-bold text-purple-400">Machine Learning</h5>
                  <p className="text-sm">Systèmes qui apprennent à partir de données sans être explicitement programmés</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
                  <h5 className="font-bold text-blue-400">Deep Learning</h5>
                  <p className="text-sm">Sous-ensemble du ML utilisant des réseaux de neurones à plusieurs couches</p>
                </div>
                <div className="bg-pink-500/10 border border-pink-500/30 rounded-md p-3">
                  <h5 className="font-bold text-pink-400">Natural Language Processing</h5>
                  <p className="text-sm">Interaction entre ordinateurs et langage humain</p>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-md p-3">
                  <h5 className="font-bold text-cyan-400">Computer Vision</h5>
                  <p className="text-sm">Capacité à interpréter et comprendre le contenu visuel</p>
                </div>
              </div>
            </div>
            
            <h4 className="text-lg font-semibold mt-4">Types d'apprentissage en Machine Learning</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
                <h5 className="font-bold text-blue-400">Supervisé</h5>
                <p className="text-sm">Apprentissage à partir d'exemples étiquetés</p>
                <div className="mt-2 pt-2 border-t border-blue-500/30">
                  <p className="text-xs">Applications : classification, régression</p>
                </div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-3">
                <h5 className="font-bold text-purple-400">Non-supervisé</h5>
                <p className="text-sm">Découverte de patterns dans des données non étiquetées</p>
                <div className="mt-2 pt-2 border-t border-purple-500/30">
                  <p className="text-xs">Applications : clustering, réduction dimensionnelle</p>
                </div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3">
                <h5 className="font-bold text-green-400">Par renforcement</h5>
                <p className="text-sm">Apprentissage par essais et erreurs via un système de récompenses</p>
                <div className="mt-2 pt-2 border-t border-green-500/30">
                  <p className="text-xs">Applications : robots, jeux, véhicules autonomes</p>
                </div>
              </div>
            </div>

            <h4 className="text-lg font-semibold mt-4">Le processus de Machine Learning</h4>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500"></div>
              <div className="space-y-4 ml-10">
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                  <h5 className="font-bold">1. Collecte de données</h5>
                  <p className="text-sm">Rassembler des données pertinentes et représentatives</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-indigo-500"></div>
                  <h5 className="font-bold">2. Préparation des données</h5>
                  <p className="text-sm">Nettoyage, transformation et features engineering</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-violet-500"></div>
                  <h5 className="font-bold">3. Choix du modèle</h5>
                  <p className="text-sm">Sélection de l'algorithme adapté au problème</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-purple-500"></div>
                  <h5 className="font-bold">4. Entraînement</h5>
                  <p className="text-sm">Apprentissage du modèle sur un jeu de données d'entraînement</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-fuchsia-500"></div>
                  <h5 className="font-bold">5. Évaluation</h5>
                  <p className="text-sm">Test des performances sur un jeu de données distinct</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-pink-500"></div>
                  <h5 className="font-bold">6. Optimisation</h5>
                  <p className="text-sm">Ajustement des hyperparamètres pour améliorer les performances</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-rose-500"></div>
                  <h5 className="font-bold">7. Déploiement</h5>
                  <p className="text-sm">Mise en production du modèle dans un environnement réel</p>
                </div>
              </div>
            </div>
          </div>
        )
      },
      {
        id: 'deep-learning-basics',
        title: 'Réseaux de Neurones',
        description: 'Comprendre le fonctionnement des réseaux de neurones et du Deep Learning',
        difficulty: 'intermédiaire',
        durationMinutes: 35,
        progress: 0,
        color: 'indigo',
        icon: <IoSchoolOutline className="h-5 w-5" />,
        content: (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Réseaux de Neurones et Deep Learning</h3>
            <p>Les réseaux de neurones artificiels sont des modèles de calcul inspirés par le fonctionnement du cerveau humain, formant la base du Deep Learning.</p>
            
            <div className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 p-4 rounded-md border border-indigo-500/30">
              <h4 className="font-bold text-lg">Structure d'un neurone artificiel</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                <div>
                  <p className="text-sm">Un neurone artificiel est composé de :</p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                    <li><span className="font-semibold">Entrées</span> : Données provenant de l'environnement ou d'autres neurones</li>
                    <li><span className="font-semibold">Poids</span> : Importance accordée à chaque entrée</li>
                    <li><span className="font-semibold">Biais</span> : Décalage ajouté à la somme pondérée</li>
                    <li><span className="font-semibold">Fonction d'activation</span> : Détermine la sortie du neurone</li>
                  </ul>
                </div>
                <div className="bg-slate-800/50 p-3 rounded-md text-center border border-indigo-500/30">
                  <div className="font-mono text-xs md:text-sm">
                    <p>Sortie = f(Σ(w × x) + b)</p>
                    <p className="mt-2">où f est la fonction d'activation</p>
                  </div>
                </div>
              </div>
            </div>
            
            <h4 className="text-lg font-semibold mt-4">Architecture des réseaux de neurones</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
                <h5 className="font-bold text-blue-400">Couche d'entrée</h5>
                <p className="text-sm">Reçoit les données brutes à traiter</p>
                <p className="text-xs mt-2 text-blue-300">Exemple : pixels d'une image, mots d'un texte</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-3">
                <h5 className="font-bold text-purple-400">Couches cachées</h5>
                <p className="text-sm">Traitent l'information et extraient des caractéristiques</p>
                <p className="text-xs mt-2 text-purple-300">Plus il y a de couches, plus le réseau est "profond"</p>
              </div>
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-md p-3">
                <h5 className="font-bold text-pink-400">Couche de sortie</h5>
                <p className="text-sm">Produit le résultat final du réseau</p>
                <p className="text-xs mt-2 text-pink-300">Ex: probabilités de classes pour une classification</p>
              </div>
            </div>

            <h4 className="text-lg font-semibold mt-4">Fonctions d'activation courantes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
                <h5 className="font-bold text-blue-400">ReLU (Rectified Linear Unit)</h5>
                <p className="text-sm">f(x) = max(0, x)</p>
                <p className="text-xs mt-2">Avantages : Simple, efficace contre la disparition du gradient</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-3">
                <h5 className="font-bold text-purple-400">Sigmoid</h5>
                <p className="text-sm">f(x) = 1 / (1 + e^(-x))</p>
                <p className="text-xs mt-2">Avantages : Sortie entre 0 et 1, utile pour les probabilités</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3">
                <h5 className="font-bold text-green-400">Tanh</h5>
                <p className="text-sm">f(x) = (e^x - e^(-x)) / (e^x + e^(-x))</p>
                <p className="text-xs mt-2">Avantages : Sortie entre -1 et 1, centré autour de zéro</p>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3">
                <h5 className="font-bold text-amber-400">Softmax</h5>
                <p className="text-sm">f(x) = e^x / Σ e^x</p>
                <p className="text-xs mt-2">Avantages : Distribution de probabilités sur plusieurs classes</p>
              </div>
            </div>

            <h4 className="text-lg font-semibold mt-4">Types de réseaux de neurones</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
                <h5 className="font-bold text-blue-400">CNN (Convolutional Neural Networks)</h5>
                <p className="text-sm">Spécialisés dans le traitement des données à structure de grille comme les images</p>
                <p className="text-xs mt-2">Applications : reconnaissance d'images, détection d'objets</p>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-3">
                <h5 className="font-bold text-purple-400">RNN (Recurrent Neural Networks)</h5>
                <p className="text-sm">Traitent des séquences de données en maintenant un état interne</p>
                <p className="text-xs mt-2">Applications : traitement du langage, séries temporelles</p>
              </div>
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-md p-3">
                <h5 className="font-bold text-pink-400">Transformers</h5>
                <p className="text-sm">Architecture basée sur l'attention pour le traitement parallèle de séquences</p>
                <p className="text-xs mt-2">Applications : GPT, BERT, modèles de langage avancés</p>
              </div>
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-md p-3">
                <h5 className="font-bold text-teal-400">GANs (Generative Adversarial Networks)</h5>
                <p className="text-sm">Deux réseaux en compétition : générateur et discriminateur</p>
                <p className="text-xs mt-2">Applications : génération d'images, deep fakes</p>
              </div>
            </div>
          </div>
        )
      },
    ],
    sql: [
      {
        id: 'sql-fundamentals',
        title: 'Fondamentaux SQL',
        description: 'Maîtriser les bases du langage SQL pour l\'interrogation et la manipulation de données',
        difficulty: 'débutant',
        durationMinutes: 30,
        progress: 0,
        color: 'cyan',
        icon: <IoCodeSlashOutline className="h-5 w-5" />,
        content: (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Les fondamentaux du langage SQL</h3>
            <p>SQL (Structured Query Language) est le langage standard pour interagir avec les bases de données relationnelles.</p>
            
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 p-4 rounded-md border border-cyan-500/30">
              <h4 className="font-bold text-lg">Structure d'une base de données relationnelle</h4>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li><span className="font-semibold">Tables</span> : Collections de données organisées en lignes et colonnes</li>
                <li><span className="font-semibold">Colonnes (Champs)</span> : Définissent le type de données stockées</li>
                <li><span className="font-semibold">Lignes (Enregistrements)</span> : Contiennent les données réelles</li>
                <li><span className="font-semibold">Clés primaires</span> : Identifient de façon unique chaque ligne</li>
                <li><span className="font-semibold">Clés étrangères</span> : Établissent des relations entre les tables</li>
              </ul>
            </div>
            
            <h4 className="text-lg font-semibold mt-4">Requêtes de base</h4>
            <div className="space-y-3">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
                <h5 className="font-bold text-blue-400">SELECT - Récupérer des données</h5>
                <div className="bg-slate-800/50 p-2 rounded-md mt-2 overflow-x-auto">
                  <pre className="text-xs md:text-sm font-mono text-gray-300">
                    SELECT colonne1, colonne2
                    FROM nom_table
                    WHERE condition;
                  </pre>
                </div>
                <p className="text-xs mt-2">Exemple : <span className="font-mono">SELECT nom, prénom FROM utilisateurs WHERE age &gt; 18;</span></p>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/30 rounded-md p-3">
                <h5 className="font-bold text-green-400">INSERT - Ajouter des données</h5>
                <div className="bg-slate-800/50 p-2 rounded-md mt-2 overflow-x-auto">
                  <pre className="text-xs md:text-sm font-mono text-gray-300">
                    INSERT INTO nom_table (colonne1, colonne2)
                    VALUES (valeur1, valeur2);
                  </pre>
                </div>
                <p className="text-xs mt-2">Exemple : <span className="font-mono">INSERT INTO produits (nom, prix) VALUES ('Ordinateur', 999.99);</span></p>
              </div>
              
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-md p-3">
                <h5 className="font-bold text-amber-400">UPDATE - Modifier des données</h5>
                <div className="bg-slate-800/50 p-2 rounded-md mt-2 overflow-x-auto">
                  <pre className="text-xs md:text-sm font-mono text-gray-300">
                    UPDATE nom_table
                    SET colonne1 = valeur1, colonne2 = valeur2
                    WHERE condition;
                  </pre>
                </div>
                <p className="text-xs mt-2">Exemple : <span className="font-mono">UPDATE utilisateurs SET statut = 'actif' WHERE id = 5;</span></p>
              </div>
              
              <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3">
                <h5 className="font-bold text-red-400">DELETE - Supprimer des données</h5>
                <div className="bg-slate-800/50 p-2 rounded-md mt-2 overflow-x-auto">
                  <pre className="text-xs md:text-sm font-mono text-gray-300">
                    DELETE FROM nom_table
                    WHERE condition;
                  </pre>
                </div>
                <p className="text-xs mt-2">Exemple : <span className="font-mono">DELETE FROM commandes WHERE date &lt; '2020-01-01';</span></p>
              </div>
            </div>

            <h4 className="text-lg font-semibold mt-4">Filtrage et tri des données</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-3">
                <h5 className="font-bold text-purple-400">Opérateurs de comparaison</h5>
                <ul className="list-disc pl-4 text-sm mt-2 space-y-1">
                  <li><span className="font-mono">=, !=, &lt;, &gt;, &lt;=, &gt;=</span> : Comparaisons standard</li>
                  <li><span className="font-mono">LIKE</span> : Correspondance de modèles avec caractères génériques</li>
                  <li><span className="font-mono">IN</span> : Vérification dans une liste de valeurs</li>
                  <li><span className="font-mono">BETWEEN</span> : Vérification dans une plage</li>
                </ul>
              </div>
              
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-md p-3">
                <h5 className="font-bold text-indigo-400">Ordre et limitation</h5>
                <ul className="list-disc pl-4 text-sm mt-2 space-y-1">
                  <li><span className="font-mono">ORDER BY</span> : Trier les résultats</li>
                  <li><span className="font-mono">GROUP BY</span> : Regrouper les résultats</li>
                  <li><span className="font-mono">LIMIT</span> : Limiter le nombre de résultats</li>
                  <li><span className="font-mono">OFFSET</span> : Sauter un nombre de résultats</li>
                </ul>
              </div>
            </div>
          </div>
        )
      },
    ],
    python: [
      {
        id: 'python-data-science',
        title: 'Python pour Data Science',
        description: 'Maîtriser les bibliothèques Python essentielles pour l\'analyse de données',
        difficulty: 'intermédiaire',
        durationMinutes: 30,
        progress: 0,
        color: 'blue',
        icon: <IoCodeSlashOutline className="h-5 w-5" />,
        content: (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Python pour la Data Science</h3>
            <p>Python est devenu le langage de prédilection pour la Data Science grâce à sa simplicité et son écosystème riche de bibliothèques spécialisées.</p>
            
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 p-4 rounded-md border border-blue-500/30">
              <h4 className="font-bold text-lg">L'écosystème Python pour Data Science</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
                  <h5 className="font-bold text-blue-400">Manipulation de données</h5>
                  <ul className="list-disc pl-4 text-sm mt-1 space-y-1">
                    <li><span className="font-semibold">NumPy</span> : Calcul scientifique et manipulations de tableaux</li>
                    <li><span className="font-semibold">Pandas</span> : Structures de données et outils d'analyse</li>
                  </ul>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-md p-3">
                  <h5 className="font-bold text-cyan-400">Visualisation</h5>
                  <ul className="list-disc pl-4 text-sm mt-1 space-y-1">
                    <li><span className="font-semibold">Matplotlib</span> : Visualisations basiques</li>
                    <li><span className="font-semibold">Seaborn</span> : Visualisations statistiques avancées</li>
                    <li><span className="font-semibold">Plotly</span> : Graphiques interactifs</li>
                  </ul>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-3">
                  <h5 className="font-bold text-purple-400">Machine Learning</h5>
                  <ul className="list-disc pl-4 text-sm mt-1 space-y-1">
                    <li><span className="font-semibold">Scikit-learn</span> : Algorithmes et outils ML</li>
                    <li><span className="font-semibold">TensorFlow/Keras</span> : Deep Learning</li>
                    <li><span className="font-semibold">PyTorch</span> : Deep Learning flexible</li>
                  </ul>
                </div>
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-md p-3">
                  <h5 className="font-bold text-indigo-400">Outils complémentaires</h5>
                  <ul className="list-disc pl-4 text-sm mt-1 space-y-1">
                    <li><span className="font-semibold">Jupyter</span> : Notebooks interactifs</li>
                    <li><span className="font-semibold">SciPy</span> : Algorithmes scientifiques</li>
                    <li><span className="font-semibold">Statsmodels</span> : Modèles statistiques</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <h4 className="text-lg font-semibold mt-4">NumPy : La base du calcul scientifique</h4>
            <div className="bg-slate-800/50 p-3 rounded-md overflow-x-auto border border-blue-500/30">
              <pre className="text-xs md:text-sm font-mono text-gray-300">
                import numpy as np

                # Création d'un tableau NumPy
                arr = np.array([1, 2, 3, 4, 5])
                
                # Opérations vectorielles
                arr_double = arr * 2  # [2, 4, 6, 8, 10]
                
                # Création d'une matrice 2D
                matrix = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
                
                # Statistiques
                print(f"Moyenne: {np.mean(arr)}")
                print(f"Écart-type: {np.std(arr)}")
              </pre>
            </div>

            <h4 className="text-lg font-semibold mt-4">Pandas : Manipulation et analyse de données</h4>
            <div className="bg-slate-800/50 p-3 rounded-md overflow-x-auto border border-blue-500/30">
              <pre className="text-xs md:text-sm font-mono text-gray-300">
                import pandas as pd

                # Création d'un DataFrame
                data = {'Nom': ['Alice', 'Bob', 'Charlie', 'David'],
                    'Age': [25, 30, 35, 40],
                    'Ville': ['Paris', 'Lyon', 'Marseille', 'Toulouse']
                }
                df = pd.DataFrame(data)
                
                # Filtrage
                jeunes = df[df['Age'] < 35]
                
                # Groupement et agrégation
                age_moyen_par_ville = df.groupby('Ville')['Age'].mean()
                
                # Lecture de données externes
                # df_csv = pd.read_csv('donnees.csv')
                # df_excel = pd.read_excel('donnees.xlsx')
              </pre>
            </div>

            <h4 className="text-lg font-semibold mt-4">Matplotlib : Visualisation des données</h4>
            <div className="bg-slate-800/50 p-3 rounded-md overflow-x-auto border border-blue-500/30">
              <pre className="text-xs md:text-sm font-mono text-gray-300">
                import matplotlib.pyplot as plt
                import numpy as np

                # Données de test
                x = np.linspace(0, 10, 100)
                y = np.sin(x)
                
                # Création d'un graphique simple
                plt.figure(figsize=(10, 6))
                plt.plot(x, y, label='sin(x)')
                plt.plot(x, np.cos(x), label='cos(x)')
                
                # Ajout de légendes et titres
                plt.title('Fonctions trigonométriques')
                plt.xlabel('x')
                plt.ylabel('y')
                plt.legend()
                plt.grid(True)
                
                # Affichage
                plt.show()
              </pre>
            </div>
          </div>
        )
      },
    ],
    data_engineering: [
      {
        id: 'intro-data-engineering',
        title: 'Introduction au Data Engineering',
        description: 'Comprendre les principes fondamentaux de l\'ingénierie des données',
        difficulty: 'intermédiaire',
        durationMinutes: 25,
        progress: 0,
        color: 'emerald',
        icon: <IoServerOutline className="h-5 w-5" />,
        content: (
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Introduction au Data Engineering</h3>
            <p>Le Data Engineering consiste à concevoir, construire et maintenir les infrastructures et pipelines permettant de collecter, stocker, transformer et servir les données à grande échelle.</p>
            
            <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 p-4 rounded-md border border-emerald-500/30">
              <h4 className="font-bold text-lg">Rôle du Data Engineer</h4>
              <p className="mt-2">Les Data Engineers sont responsables de :</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Concevoir et maintenir les infrastructures de données (data lakes, entrepôts de données)</li>
                <li>Développer les pipelines ETL/ELT pour traiter les données</li>
                <li>Assurer la qualité, la sécurité et la disponibilité des données</li>
                <li>Optimiser les performances des systèmes de données</li>
                <li>Collaborer avec les Data Scientists et Data Analysts</li>
              </ul>
            </div>
            
            <h4 className="text-lg font-semibold mt-4">La chaîne de valeur des données</h4>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 to-blue-500"></div>
              <div className="space-y-4 ml-10">
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-emerald-500"></div>
                  <h5 className="font-bold">1. Ingestion des données</h5>
                  <p className="text-sm">Collecte des données depuis diverses sources (bases de données, APIs, fichiers, streaming)</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-teal-500"></div>
                  <h5 className="font-bold">2. Stockage</h5>
                  <p className="text-sm">Organisation des données dans des systèmes adaptés (bases de données, data lakes, data warehouses)</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-cyan-500"></div>
                  <h5 className="font-bold">3. Traitement et transformation</h5>
                  <p className="text-sm">Nettoyage, enrichissement, agrégation et transformation des données brutes</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-blue-500"></div>
                  <h5 className="font-bold">4. Analyse et modélisation</h5>
                  <p className="text-sm">Extraction d'insights et création de modèles à partir des données préparées</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-10 top-0 w-4 h-4 rounded-full bg-indigo-500"></div>
                  <h5 className="font-bold">5. Consommation et visualisation</h5>
                  <p className="text-sm">Mise à disposition des données et insights pour les utilisateurs finaux</p>
                </div>
              </div>
            </div>

            <h4 className="text-lg font-semibold mt-4">Types de pipelines de données</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-md p-3">
                <h5 className="font-bold text-emerald-400">ETL (Extract, Transform, Load)</h5>
                <p className="text-sm">Extraction depuis les sources, transformation avant stockage</p>
                <p className="text-xs mt-2">Avantages : Données propres dans le stockage, contrôle qualité avant chargement</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
                <h5 className="font-bold text-blue-400">ELT (Extract, Load, Transform)</h5>
                <p className="text-sm">Stockage des données brutes, transformation à la demande</p>
                <p className="text-xs mt-2">Avantages : Plus rapide, flexible, adapté aux grandes quantités de données</p>
              </div>
              <div className="bg-teal-500/10 border border-teal-500/30 rounded-md p-3">
                <h5 className="font-bold text-teal-400">Batch processing</h5>
                <p className="text-sm">Traitement périodique de grandes quantités de données</p>
                <p className="text-xs mt-2">Cas d'usage : Rapports quotidiens, analyses non urgentes</p>
              </div>
              <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-md p-3">
                <h5 className="font-bold text-cyan-400">Stream processing</h5>
                <p className="text-sm">Traitement continu des données en temps réel</p>
                <p className="text-xs mt-2">Cas d'usage : Détection de fraude, surveillance, analyses en temps réel</p>
              </div>
            </div>

            <h4 className="text-lg font-semibold mt-4">Technologies et outils courants</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-md p-3">
                <h5 className="font-bold text-indigo-400">Ingestion et orchestration</h5>
                <ul className="list-disc pl-4 text-xs mt-1 space-y-1">
                  <li>Apache Airflow</li>
                  <li>Apache NiFi</li>
                  <li>Kafka</li>
                  <li>Prefect</li>
                </ul>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-md p-3">
                <h5 className="font-bold text-purple-400">Stockage et bases de données</h5>
                <ul className="list-disc pl-4 text-xs mt-1 space-y-1">
                  <li>Hadoop HDFS</li>
                  <li>Amazon S3</li>
                  <li>Snowflake</li>
                  <li>BigQuery</li>
                  <li>Redshift</li>
                </ul>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3">
                <h5 className="font-bold text-blue-400">Traitement et analyse</h5>
                <ul className="list-disc pl-4 text-xs mt-1 space-y-1">
                  <li>Apache Spark</li>
                  <li>Databricks</li>
                  <li>Dbt</li>
                  <li>Pandas</li>
                  <li>Python/SQL</li>
                </ul>
              </div>
            </div>
          </div>
        )
      },
    ],
  };

  // Fonction pour afficher le Module Dashboard
  const renderModuleDashboard = () => {
    const currentModules = modules[activeTab] || [];
    
    return (
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {currentModules.map((module) => (
            <Card 
              key={module.id} 
              className={`hover:shadow-lg transition-all cursor-pointer ${
                highContrastMode 
                  ? 'bg-gray-800 border border-gray-700 hover:border-gray-600' 
                  : 'bg-gradient-to-br from-[#1a3a60]/90 to-[#152a40]/90 border border-blue-400/20 hover:border-blue-400/40'
              }`}
              onClick={() => setActiveModuleId(module.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg bg-${module.color}-500/20 text-${module.color}-400`}>
                      {module.icon}
                    </div>
                    <CardTitle className="text-xl">{module.title}</CardTitle>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`${
                      module.difficulty === 'débutant' 
                        ? 'border-green-500/50 text-green-400' 
                        : module.difficulty === 'intermédiaire'
                          ? 'border-yellow-500/50 text-yellow-400'
                          : 'border-red-500/50 text-red-400'
                    }`}
                  >
                    {module.difficulty}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400 mb-4">
                  {module.description}
                </CardDescription>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center space-x-1">
                    <IoBookOutline className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-400">{module.durationMinutes} min</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-400 mr-2">{module.progress}%</span>
                    <Progress 
                      value={module.progress} 
                      className={`h-2 w-20 ${
                        highContrastMode 
                          ? 'bg-gray-700' 
                          : 'bg-gray-700/50'
                      }`} 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Fonction pour afficher le contenu d'un module
  const renderModuleContent = () => {
    // Trouver le module actif dans tous les onglets
    let activeModule: ModuleContent | undefined;
    
    for (const tabKey in modules) {
      const foundModule = modules[tabKey].find(m => m.id === activeModuleId);
      if (foundModule) {
        activeModule = foundModule;
        break;
      }
    }
    
    if (!activeModule) return null;
    
    return (
      <div className="p-4">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 hover:bg-blue-500/10"
          onClick={() => setActiveModuleId(null)}
        >
          <IoArrowBack className="mr-1 h-4 w-4" /> Retour aux modules
        </Button>
        
        <Card className={
          highContrastMode 
            ? 'bg-gray-800 border border-gray-700' 
            : 'bg-gradient-to-br from-[#1a3a60]/90 to-[#152a40]/90 border border-blue-400/20'
        }>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{activeModule.title}</CardTitle>
                <CardDescription className="text-gray-400 mt-1">
                  {activeModule.description}
                </CardDescription>
              </div>
              <Badge 
                variant="outline" 
                className={`${
                  activeModule.difficulty === 'débutant' 
                    ? 'border-green-500/50 text-green-400' 
                    : activeModule.difficulty === 'intermédiaire'
                      ? 'border-yellow-500/50 text-yellow-400'
                      : 'border-red-500/50 text-red-400'
                }`}
              >
                {activeModule.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <IoBookOutline className="h-4 w-4 text-gray-500" />
                <span className="text-gray-400">Durée estimée: {activeModule.durationMinutes} minutes</span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">Progression: {activeModule.progress}%</span>
                <Progress 
                  value={activeModule.progress} 
                  className={`h-2 w-24 ${
                    highContrastMode 
                      ? 'bg-gray-700' 
                      : 'bg-gray-700/50'
                  }`} 
                />
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="prose prose-invert max-w-none">
              {activeModule.content}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline">Marquer comme terminé</Button>
            <Button>Continuer</Button>
          </CardFooter>
        </Card>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative">
      <DataSceneBackground />
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-6 max-w-screen-xl">
          <div className="flex items-center mb-6 mt-10">
            <Button
              variant="ghost"
              size="sm"
              className="mr-2 hover:bg-blue-500/10"
              onClick={() => setLocation('/data-ia')}
            >
              <IoArrowBack className="mr-1 h-4 w-4" /> Retour
            </Button>
            <h1 className="text-3xl font-bold text-gradient bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              DATA ACADÉMIE
            </h1>
          </div>
          
          <div className={`rounded-lg border ${
            highContrastMode 
              ? 'bg-gray-900/90 border-gray-700' 
              : 'bg-[#0c1625]/80 backdrop-blur-sm border-blue-500/20'
          }`}>
            {activeModuleId ? (
              renderModuleContent()
            ) : (
              <>
                <div className="p-4 border-b border-gray-700">
                  <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className={`grid grid-cols-5 w-full ${
                      highContrastMode 
                        ? 'bg-gray-800' 
                        : 'bg-gray-900/50'
                    }`}>
                      <TabsTrigger value="fondamentaux" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
                        Fondamentaux
                      </TabsTrigger>
                      <TabsTrigger value="intelligence_artificielle" className="data-[state=active]:bg-purple-600/20 data-[state=active]:text-purple-400">
                        IA & ML
                      </TabsTrigger>
                      <TabsTrigger value="sql" className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400">
                        SQL
                      </TabsTrigger>
                      <TabsTrigger value="python" className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-blue-400">
                        Python
                      </TabsTrigger>
                      <TabsTrigger value="data_engineering" className="data-[state=active]:bg-emerald-600/20 data-[state=active]:text-emerald-400">
                        Data Engineering
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                
                {renderModuleDashboard()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}