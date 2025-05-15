import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Brain, Code, PlayCircle, Book, Trophy, ArrowLeft, RefreshCw, RotateCw, Lightbulb, Clock3 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2 } from 'lucide-react';

// Types
interface QuizResponse {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface CodeChallenge {
  id: string;
  code: string;
  language: 'python' | 'sql';
  question: string;
  difficulty: 'débutant' | 'intermédiaire' | 'avancé';
  responses: QuizResponse[];
  explanation: string;
  hint?: string;
}

// Composant d'affichage de code avec syntaxe highlighting
const CodeDisplay = ({ code, language }: { code: string, language: string }) => {
  return (
    <div className="rounded-md bg-black/90 p-4 my-4 relative font-mono text-sm overflow-auto">
      <div className="absolute top-2 right-3 px-2 py-1 bg-blue-700/70 rounded-md text-xs text-white font-semibold uppercase">
        {language}
      </div>
      <pre className="text-gray-200 max-h-[400px] overflow-y-auto">
        <code>
          {code.split('\n').map((line, index) => (
            <div key={index} className="py-0.5">
              <span className="text-gray-500 mr-4 select-none w-8 inline-block text-right">{index + 1}</span>
              <span>{line}</span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};

// Composant principal
const ReadMeIfYouCan = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'sql'>('python');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'débutant' | 'intermédiaire' | 'avancé'>('intermédiaire');
  const [selectedMode, setSelectedMode] = useState<'normal' | 'analyse' | 'défense' | 'vitesse'>('normal');
  const [currentChallenge, setCurrentChallenge] = useState<CodeChallenge | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userJustification, setUserJustification] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [hintRequested, setHintRequested] = useState(false);
  const [highContrastMode, setHighContrastMode] = useState(false);
  
  // Fonction pour récupérer un nouveau challenge
  const fetchNewChallenge = async () => {
    setIsLoading(true);
    setShowResult(false);
    setSelectedAnswer(null);
    setUserJustification('');
    setHintRequested(false);
    
    try {
      // Dans un environnement de production, nous ferions un appel API ici
      // pour l'instant, on va simuler une réponse de l'API
      
      // Délai simulé d'appel d'API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Pour le prototype, nous créons un challenge statique
      const mockChallenge: CodeChallenge = generateMockChallenge();
      
      setCurrentChallenge(mockChallenge);
      setQuestionCount(prev => prev + 1);
      
      // Si mode vitesse, initialiser le timer
      if (selectedMode === 'vitesse') {
        setTimeLeft(30);
        setTimerActive(true);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer le challenge. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Générer un challenge de test selon le niveau et le langage
  const generateMockChallenge = (): CodeChallenge => {
    // Python - Débutant
    if (selectedLanguage === 'python' && selectedDifficulty === 'débutant') {
      return {
        id: 'py-deb-1',
        language: 'python',
        difficulty: 'débutant',
        code: `def calcul_somme(liste):
    total = 0
    for nombre in liste:
        if nombre > 0:
            total += nombre
    return total

resultat = calcul_somme([5, -3, 10, -1, 4, 2])
print(resultat)`,
        question: "Que va afficher ce code ?",
        responses: [
          { id: 'a', text: '17', isCorrect: true },
          { id: 'b', text: '21', isCorrect: false },
          { id: 'c', text: '11', isCorrect: false },
          { id: 'd', text: 'Une erreur', isCorrect: false }
        ],
        explanation: "Cette fonction calcule la somme des nombres positifs dans la liste. Elle parcourt chaque nombre et l'ajoute au total seulement s'il est supérieur à 0. Les nombres positifs sont 5, 10, 4 et 2, dont la somme est 21."
      };
    }
    
    // Python - Intermédiaire
    if (selectedLanguage === 'python' && selectedDifficulty === 'intermédiaire') {
      return {
        id: 'py-int-1',
        language: 'python',
        difficulty: 'intermédiaire',
        code: `import pandas as pd

def traitement_donnees(df):
    # Filtrer les lignes avec des valeurs manquantes
    df = df.dropna(subset=['prix'])
    
    # Calculer le prix moyen par catégorie
    prix_moyen = df.groupby('categorie')['prix'].mean()
    
    # Créer une nouvelle colonne avec le ratio prix / prix_moyen
    df['ratio'] = df.apply(lambda row: row['prix'] / prix_moyen[row['categorie']], axis=1)
    
    # Filtrer les produits dont le prix est > 20% du prix moyen
    resultat = df[df['ratio'] > 1.2]
    
    return resultat.sort_values('ratio', ascending=False)

# Utilisation (non visible par l'utilisateur)
# df = pd.DataFrame({
#    'categorie': ['A', 'A', 'B', 'A', 'B', 'C'],
#    'prix': [100, 120, 200, 90, 250, 300]
# })
# res = traitement_donnees(df)`,
        question: "Quelle est la fonctionnalité principale de ce code ?",
        responses: [
          { id: 'a', text: "Il calcule le prix moyen par catégorie", isCorrect: false },
          { id: 'b', text: "Il identifie les produits dont le prix est au moins 20% supérieur à la moyenne de leur catégorie", isCorrect: true },
          { id: 'c', text: "Il supprime les lignes avec des valeurs nulles dans la colonne 'prix'", isCorrect: false },
          { id: 'd', text: "Il calcule le ratio entre le prix de chaque produit et le prix moyen global", isCorrect: false }
        ],
        explanation: "Ce code effectue plusieurs opérations: il supprime d'abord les lignes avec des valeurs manquantes dans la colonne 'prix', puis calcule le prix moyen par catégorie, ensuite crée une colonne 'ratio' qui est le rapport entre le prix de chaque produit et le prix moyen de sa catégorie. Enfin, il filtre pour ne garder que les produits dont le prix est supérieur d'au moins 20% au prix moyen de leur catégorie (ratio > 1.2), et trie les résultats par ratio décroissant."
      };
    }
    
    // Python - Avancé
    if (selectedLanguage === 'python' && selectedDifficulty === 'avancé') {
      return {
        id: 'py-adv-1',
        language: 'python',
        difficulty: 'avancé',
        code: `def process_data(func):
    def wrapper(*args, **kwargs):
        try:
            result = func(*args, **kwargs)
            if isinstance(result, dict):
                # Filtrer les valeurs None
                return {k: v for k, v in result.items() if v is not None}
            return result
        except Exception as e:
            print(f"Erreur: {e}")
            return {}
    return wrapper

@process_data
def extract_user_data(user_input):
    if not user_input:
        raise ValueError("Entrée vide")
    
    data = {}
    fields = user_input.split(';')
    
    for field in fields:
        if ':' in field:
            key, value = field.split(':', 1)
            data[key.strip()] = value.strip() or None
    
    return data

# Utilisation
result1 = extract_user_data("nom: Dupont; age: 35; email:")
result2 = extract_user_data("")
print(result1)
print(result2)`,
        question: "Quelle problématique ce code résout-il principalement ?",
        responses: [
          { id: 'a', text: "Validation de formulaires HTML", isCorrect: false },
          { id: 'b', text: "Gestion des exceptions sans arrêter l'exécution", isCorrect: false },
          { id: 'c', text: "Nettoyage et transformation de données entrées par l'utilisateur", isCorrect: true },
          { id: 'd', text: "Mise en cache de résultats de fonction", isCorrect: false }
        ],
        explanation: "Ce code utilise un décorateur (@process_data) pour gérer les erreurs et nettoyer les résultats. La fonction extract_user_data parse une chaîne de caractères au format 'clé: valeur' séparée par des points-virgules, et les transforme en dictionnaire. Le décorateur gère les exceptions et supprime les valeurs None du dictionnaire résultant. Le premier appel va retourner {'nom': 'Dupont', 'age': '35'} (l'email étant vide, il est supprimé), et le second appel va capturer l'erreur d'entrée vide et retourner un dictionnaire vide {}."
      };
    }
    
    // SQL - Débutant
    if (selectedLanguage === 'sql' && selectedDifficulty === 'débutant') {
      return {
        id: 'sql-deb-1',
        language: 'sql',
        difficulty: 'débutant',
        code: `SELECT 
  p.nom,
  p.prix,
  c.nom AS categorie
FROM produits p
JOIN categories c ON p.categorie_id = c.id
WHERE p.prix > 100
ORDER BY p.prix DESC
LIMIT 5;`,
        question: "Que fait cette requête SQL ?",
        responses: [
          { id: 'a', text: "Elle retourne les 5 produits les plus chers dont le prix est supérieur à 100", isCorrect: true },
          { id: 'b', text: "Elle retourne les 5 premiers produits de chaque catégorie", isCorrect: false },
          { id: 'c', text: "Elle retourne tous les produits dont le prix est supérieur à 100", isCorrect: false },
          { id: 'd', text: "Elle joint les tables sans condition particulière", isCorrect: false }
        ],
        explanation: "Cette requête sélectionne le nom et le prix des produits ainsi que le nom de leur catégorie, en joignant les tables 'produits' et 'categories'. Elle filtre pour ne garder que les produits dont le prix est supérieur à 100, les trie par prix décroissant, et limite le résultat aux 5 premiers produits de cette liste triée."
      };
    }
    
    // SQL - Intermédiaire
    if (selectedLanguage === 'sql' && selectedDifficulty === 'intermédiaire') {
      return {
        id: 'sql-int-1',
        language: 'sql',
        difficulty: 'intermédiaire',
        code: `WITH VentesMensuelles AS (
  SELECT 
    EXTRACT(YEAR FROM date_vente) AS annee,
    EXTRACT(MONTH FROM date_vente) AS mois,
    SUM(montant) AS total_ventes
  FROM ventes
  WHERE date_vente >= '2023-01-01' AND date_vente < '2024-01-01'
  GROUP BY EXTRACT(YEAR FROM date_vente), EXTRACT(MONTH FROM date_vente)
),
EvolutionMensuelle AS (
  SELECT
    annee,
    mois,
    total_ventes,
    LAG(total_ventes) OVER (ORDER BY annee, mois) AS ventes_mois_precedent
  FROM VentesMensuelles
)
SELECT
  annee,
  mois,
  total_ventes,
  ventes_mois_precedent,
  CASE
    WHEN ventes_mois_precedent IS NULL THEN 0
    ELSE ROUND(((total_ventes - ventes_mois_precedent) / ventes_mois_precedent) * 100, 2)
  END AS evolution_pourcentage
FROM EvolutionMensuelle
ORDER BY annee, mois;`,
        question: "Quel est l'objectif principal de cette requête SQL ?",
        responses: [
          { id: 'a', text: "Calculer le total des ventes pour 2023", isCorrect: false },
          { id: 'b', text: "Calculer le pourcentage d'évolution des ventes mois par mois en 2023", isCorrect: true },
          { id: 'c', text: "Comparer les ventes mensuelles de 2023 avec celles de 2022", isCorrect: false },
          { id: 'd', text: "Identifier le mois avec les ventes les plus élevées en 2023", isCorrect: false }
        ],
        explanation: "Cette requête utilise des expressions de table communes (CTEs) et des fonctions de fenêtrage pour calculer l'évolution mensuelle des ventes en 2023. La première CTE 'VentesMensuelles' calcule le total des ventes par mois. La seconde CTE 'EvolutionMensuelle' utilise la fonction LAG() pour récupérer le montant des ventes du mois précédent. Enfin, la requête principale calcule le pourcentage d'évolution entre chaque mois consécutif, et affiche ces données triées par année et mois."
      };
    }
    
    // SQL - Avancé
    if (selectedLanguage === 'sql' && selectedDifficulty === 'avancé') {
      return {
        id: 'sql-adv-1',
        language: 'sql',
        difficulty: 'avancé',
        code: `WITH ClientsActifs AS (
  SELECT
    client_id,
    MAX(date_transaction) AS derniere_transaction,
    COUNT(*) AS nb_transactions,
    SUM(montant) AS total_achats
  FROM transactions
  WHERE date_transaction >= CURRENT_DATE - INTERVAL '12 months'
  GROUP BY client_id
),
Stats AS (
  SELECT
    PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY total_achats) AS q1,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_achats) AS mediane,
    PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY total_achats) AS q3,
    AVG(total_achats) AS moyenne,
    COUNT(*) AS nb_clients
  FROM ClientsActifs
),
ClientsSegments AS (
  SELECT
    c.client_id,
    c.total_achats,
    CASE
      WHEN c.total_achats > s.q3 + (s.q3 - s.q1) * 1.5 THEN 'Premium'
      WHEN c.total_achats > s.mediane THEN 'Standard+'
      WHEN c.total_achats > s.q1 THEN 'Standard'
      ELSE 'Basique'
    END AS segment,
    c.nb_transactions,
    c.derniere_transaction,
    CURRENT_DATE - c.derniere_transaction AS jours_depuis_dernier_achat
  FROM ClientsActifs c, Stats s
)
SELECT
  segment,
  COUNT(*) AS nb_clients,
  ROUND(AVG(total_achats), 2) AS panier_moyen,
  ROUND(AVG(nb_transactions), 1) AS transactions_moyenne,
  ROUND(AVG(jours_depuis_dernier_achat), 0) AS recence_moyenne
FROM ClientsSegments
GROUP BY segment
ORDER BY panier_moyen DESC;`,
        question: "Quelle technique avancée est illustrée par cette requête SQL ?",
        responses: [
          { id: 'a', text: "Segmentation de clients basée sur des métriques statistiques (méthode RFM)", isCorrect: true },
          { id: 'b', text: "Calcul de prévisions de ventes par régression linéaire", isCorrect: false },
          { id: 'c', text: "Détection de fraudes par analyse d'anomalies", isCorrect: false },
          { id: 'd', text: "Clustering de produits par similarité d'achat", isCorrect: false }
        ],
        explanation: "Cette requête met en œuvre une segmentation de clients basée sur des métriques statistiques (similaire à la méthode RFM - Récence, Fréquence, Montant). La requête utilise des CTEs successives pour: (1) identifier les clients actifs des 12 derniers mois avec leurs métriques, (2) calculer des statistiques globales comme les quartiles et la moyenne, (3) segmenter les clients en catégories 'Premium', 'Standard+', 'Standard' ou 'Basique' selon leur position par rapport aux quartiles, avec une détection spécifique pour les clients premium (outliers). Enfin, elle agrège les résultats par segment pour obtenir des statistiques de groupe."
      };
    }

    // Par défaut, retourner un challenge Python intermédiaire
    return {
      id: 'default',
      language: 'python',
      difficulty: 'intermédiaire',
      code: `def mystere(liste):
    if not liste:
        return []
    return mystere([x for x in liste[1:] if x < liste[0]]) + [liste[0]] + mystere([x for x in liste[1:] if x >= liste[0]])

resultat = mystere([5, 3, 8, 1, 7, 2])
print(resultat)`,
      question: "Que fait cette fonction et que va afficher le code ?",
      responses: [
        { id: 'a', text: "Elle trie la liste dans l'ordre croissant et affiche [1, 2, 3, 5, 7, 8]", isCorrect: true },
        { id: 'b', text: "Elle trie la liste dans l'ordre décroissant et affiche [8, 7, 5, 3, 2, 1]", isCorrect: false },
        { id: 'c', text: "Elle retourne le premier élément et affiche [5]", isCorrect: false },
        { id: 'd', text: "Elle provoque une erreur de récursion infinie", isCorrect: false }
      ],
      explanation: "Cette fonction est une implémentation de l'algorithme de tri 'quicksort' (tri rapide) en utilisant la récursion. Elle prend le premier élément comme pivot, puis divise la liste restante en deux: les éléments plus petits que le pivot et les éléments plus grands ou égaux. Elle s'appelle ensuite récursivement sur ces deux sous-listes et combine les résultats avec le pivot au milieu. Le résultat final est [1, 2, 3, 5, 7, 8], qui est la liste triée par ordre croissant."
    };
  };

  // Récupérer un indice pour le challenge actuel
  const getHint = () => {
    setHintRequested(true);
    
    if (!currentChallenge) return;
    
    if (!currentChallenge.hint) {
      // Générer un indice en fonction du langage et du niveau
      if (currentChallenge.language === 'python') {
        toast({
          title: "Indice",
          description: "Regardez attentivement les structures de contrôle et la façon dont les données sont manipulées.",
          variant: "default",
        });
      } else {
        toast({
          title: "Indice",
          description: "Analysez les jointures et les conditions de filtrage pour comprendre quelles données sont sélectionnées.",
          variant: "default",
        });
      }
    } else {
      toast({
        title: "Indice",
        description: currentChallenge.hint,
        variant: "default",
      });
    }
  };

  // Soumettre la réponse
  const submitAnswer = () => {
    if (!selectedAnswer) {
      toast({
        title: "Attention",
        description: "Veuillez sélectionner une réponse avant de soumettre.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedDifficulty !== 'débutant' && selectedMode !== 'vitesse' && !userJustification.trim()) {
      toast({
        title: "Justification requise",
        description: "Veuillez expliquer votre raisonnement avant de soumettre.",
        variant: "destructive",
      });
      return;
    }
    
    // Arrêter le timer si actif
    if (timerActive) {
      setTimerActive(false);
    }
    
    // Vérifier si la réponse est correcte
    const isCorrect = currentChallenge?.responses.find(r => r.id === selectedAnswer)?.isCorrect || false;
    
    // Mettre à jour le score
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
    
    // Afficher le résultat
    setShowResult(true);
    
    // Notification
    toast({
      title: isCorrect ? "Correct !" : "Incorrect !",
      description: isCorrect 
        ? "Bravo, votre réponse est correcte !" 
        : "Dommage, votre réponse n'est pas correcte. Consultez l'explication.",
      variant: isCorrect ? "default" : "destructive",
    });
  };

  // Effet pour gérer le compte à rebours
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (timerActive && timeLeft !== null && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
    } else if (timerActive && timeLeft === 0) {
      setTimerActive(false);
      toast({
        title: "Temps écoulé !",
        description: "Vous n'avez pas répondu à temps.",
        variant: "destructive",
      });
      submitAnswer();
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timerActive, timeLeft]);
  
  // Charger un challenge au montage du composant
  useEffect(() => {
    fetchNewChallenge();
  }, []);

  return (
    <div className={`min-h-screen ${highContrastMode ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-900 to-blue-950'}`}>
      <header className="py-6 border-b border-blue-700/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                onClick={() => setLocation('/data-ia')}
                className="text-white hover:text-blue-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour
              </Button>
              <h1 className="text-2xl font-bold text-white ml-4 font-data-title flex items-center">
                <Code className="mr-2 h-6 w-6 text-cyan-400" />
                READ ME IF YOU CAN
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="contrast-mode"
                  checked={highContrastMode}
                  onCheckedChange={setHighContrastMode}
                />
                <Label htmlFor="contrast-mode" className="text-white text-sm">Mode contraste élevé</Label>
              </div>
              
              <Badge className="bg-cyan-600 hover:bg-cyan-700">
                Score: {score}/{questionCount}
              </Badge>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Paramètres du jeu */}
          <Card className={`mb-6 ${
            highContrastMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-gradient-to-br from-blue-800/50 to-indigo-900/50 border-blue-500/20'
          }`}>
            <CardHeader>
              <CardTitle className="text-white">Configuration du défi</CardTitle>
              <CardDescription className="text-gray-300">
                Choisissez le langage, la difficulté et le mode de jeu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="language" className="text-white mb-2 block">Langage</Label>
                  <Select 
                    value={selectedLanguage} 
                    onValueChange={(val) => setSelectedLanguage(val as 'python' | 'sql')}
                    disabled={isLoading}
                  >
                    <SelectTrigger 
                      id="language"
                      className={highContrastMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-900/70 border-blue-500/30'}
                    >
                      <SelectValue placeholder="Choisir le langage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="sql">SQL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="difficulty" className="text-white mb-2 block">Difficulté</Label>
                  <Select 
                    value={selectedDifficulty} 
                    onValueChange={(val) => setSelectedDifficulty(val as 'débutant' | 'intermédiaire' | 'avancé')}
                    disabled={isLoading}
                  >
                    <SelectTrigger 
                      id="difficulty"
                      className={highContrastMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-900/70 border-blue-500/30'}
                    >
                      <SelectValue placeholder="Choisir la difficulté" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="débutant">Débutant</SelectItem>
                      <SelectItem value="intermédiaire">Intermédiaire</SelectItem>
                      <SelectItem value="avancé">Avancé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="mode" className="text-white mb-2 block">Mode de jeu</Label>
                  <Select 
                    value={selectedMode} 
                    onValueChange={(val) => setSelectedMode(val as 'normal' | 'analyse' | 'défense' | 'vitesse')}
                    disabled={isLoading}
                  >
                    <SelectTrigger 
                      id="mode"
                      className={highContrastMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-900/70 border-blue-500/30'}
                    >
                      <SelectValue placeholder="Choisir le mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal - "Lis et devine"</SelectItem>
                      <SelectItem value="analyse">Analyse - "Explique ce que tu lis"</SelectItem>
                      <SelectItem value="défense">Défense - "Revue de code"</SelectItem>
                      <SelectItem value="vitesse">Vitesse - "Contre la montre"</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={fetchNewChallenge}
                disabled={isLoading}
                className={`${
                  highContrastMode 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                } text-white`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Génération...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Nouveau challenge
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Challenge actuel */}
          {currentChallenge && (
            <Card className={`mb-6 ${
              highContrastMode 
                ? 'bg-gray-800 border-gray-700' 
                : 'bg-gradient-to-br from-blue-800/70 to-indigo-900/70 border-blue-500/20'
            }`}>
              <CardHeader>
                <div className="flex justify-between">
                  <CardTitle className="text-white flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
                    Défi {selectedDifficulty} {selectedLanguage === 'python' ? 'Python' : 'SQL'} 
                  </CardTitle>
                  
                  {selectedMode === 'vitesse' && timeLeft !== null && (
                    <div className="flex items-center">
                      <Clock3 className={`mr-2 h-5 w-5 ${
                        timeLeft > 10 ? 'text-green-400' : 'text-red-400'
                      }`} />
                      <span className={`font-mono text-lg ${
                        timeLeft > 10 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {String(timeLeft).padStart(2, '0')}s
                      </span>
                    </div>
                  )}
                </div>
                
                <CardDescription className="text-gray-300">
                  Mode : {selectedMode === 'normal' ? '"Lis et devine"' : 
                         selectedMode === 'analyse' ? '"Explique ce que tu lis"' :
                         selectedMode === 'défense' ? '"Revue de code"' : '"Contre la montre"'}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Affichage du code */}
                  <CodeDisplay code={currentChallenge.code} language={currentChallenge.language} />
                  
                  {/* Question */}
                  <div className="bg-blue-900/40 p-4 rounded-md border border-blue-700/40">
                    <h3 className="text-white text-lg font-semibold mb-2 flex items-center">
                      <Brain className="mr-2 h-5 w-5 text-purple-400" />
                      Question:
                    </h3>
                    <p className="text-gray-200">{currentChallenge.question}</p>
                  </div>
                  
                  {/* Réponses possibles */}
                  <div className="mt-4">
                    <h3 className="text-white font-semibold mb-3">Sélectionnez votre réponse:</h3>
                    <RadioGroup 
                      value={selectedAnswer || ""} 
                      onValueChange={setSelectedAnswer}
                      className="space-y-2"
                      disabled={showResult}
                    >
                      {currentChallenge.responses.map((response) => (
                        <div 
                          key={response.id} 
                          className={`flex items-start space-x-3 p-3 rounded-md ${
                            showResult && response.isCorrect 
                              ? 'bg-green-900/30 border border-green-500/50' 
                              : showResult && selectedAnswer === response.id && !response.isCorrect
                                ? 'bg-red-900/30 border border-red-500/50'
                                : highContrastMode
                                  ? 'bg-gray-700 border border-gray-600 hover:bg-gray-600'
                                  : 'bg-blue-900/40 border border-blue-700/30 hover:bg-blue-800/50'
                          } transition-colors`}
                        >
                          <RadioGroupItem 
                            value={response.id} 
                            id={`answer-${response.id}`} 
                            className="mt-1"
                            disabled={showResult}
                          />
                          <Label 
                            htmlFor={`answer-${response.id}`} 
                            className={`text-sm flex-grow ${
                              showResult && response.isCorrect
                                ? 'text-green-300'
                                : showResult && selectedAnswer === response.id && !response.isCorrect
                                  ? 'text-red-300'
                                  : 'text-gray-200'
                            }`}
                          >
                            <span className="font-semibold">{response.id.toUpperCase()}:</span> {response.text}
                            
                            {showResult && response.isCorrect && (
                              <span className="ml-2 text-green-400 text-xs font-semibold">
                                ✓ CORRECT
                              </span>
                            )}
                            
                            {showResult && selectedAnswer === response.id && !response.isCorrect && (
                              <span className="ml-2 text-red-400 text-xs font-semibold">
                                ✗ INCORRECT
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                  
                  {/* Justification (sauf pour les débutants et mode vitesse) */}
                  {selectedDifficulty !== 'débutant' && selectedMode !== 'vitesse' && (
                    <div className="mt-4">
                      <Label htmlFor="justification" className="text-white font-semibold mb-2 block">
                        Justifiez votre réponse:
                      </Label>
                      <Textarea 
                        id="justification" 
                        placeholder="Expliquez votre raisonnement..."
                        value={userJustification}
                        onChange={(e) => setUserJustification(e.target.value)}
                        disabled={showResult}
                        className={`h-24 ${
                          highContrastMode 
                            ? 'bg-gray-700 border-gray-600' 
                            : 'bg-blue-900/50 border-blue-700/30'
                        }`}
                      />
                    </div>
                  )}
                  
                  {/* Explication (visible après soumission) */}
                  {showResult && (
                    <div className="mt-6 bg-blue-900/40 p-4 rounded-md border border-blue-500/40">
                      <h3 className="text-white text-lg font-semibold mb-2 flex items-center">
                        <Sparkles className="mr-2 h-5 w-5 text-yellow-400" />
                        Explication:
                      </h3>
                      <p className="text-gray-200">{currentChallenge.explanation}</p>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={getHint}
                  disabled={isLoading || hintRequested || showResult}
                  className={`${
                    highContrastMode
                      ? 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      : 'bg-blue-900/20 border-blue-600/20 hover:bg-blue-800/40'
                  } text-blue-300 hover:text-blue-200`}
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Indice
                </Button>
                
                <div className="space-x-3">
                  {showResult ? (
                    <Button
                      onClick={fetchNewChallenge}
                      disabled={isLoading}
                      className={`${
                        highContrastMode 
                          ? 'bg-indigo-600 hover:bg-indigo-700' 
                          : 'bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700'
                      } text-white`}
                    >
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Question suivante
                    </Button>
                  ) : (
                    <Button
                      onClick={submitAnswer}
                      disabled={isLoading || !selectedAnswer}
                      className={`${
                        highContrastMode 
                          ? 'bg-cyan-600 hover:bg-cyan-700' 
                          : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700'
                      } text-white`}
                    >
                      Valider ma réponse
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          )}
          
          {/* Guide du jeu */}
          <Card className={`${
            highContrastMode 
              ? 'bg-gray-800 border-gray-700' 
              : 'bg-gradient-to-br from-blue-800/30 to-indigo-900/30 border-blue-500/20'
          }`}>
            <CardHeader>
              <CardTitle className="text-white">Comment jouer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center">
                    <Book className="mr-2 h-5 w-5 text-blue-400" />
                    Modes de jeu
                  </h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li className="flex items-start">
                      <span className="font-semibold text-cyan-400 mr-2">Normal:</span> 
                      <span>Lisez le code et choisissez l'interprétation correcte parmi les options proposées.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold text-purple-400 mr-2">Analyse:</span> 
                      <span>Expliquez en détail ce que fait le code, ligne par ligne, et son résultat.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold text-pink-400 mr-2">Défense:</span> 
                      <span>Identifiez les erreurs potentielles, les problèmes de performance et les améliorations possibles.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="font-semibold text-orange-400 mr-2">Vitesse:</span> 
                      <span>Répondez correctement dans un temps limité (30 secondes) pour tester votre compréhension rapide.</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center">
                    <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
                    Conseils pour progresser
                  </h3>
                  <ul className="space-y-2 text-gray-300 text-sm">
                    <li>Lisez attentivement chaque ligne de code, même les commentaires.</li>
                    <li>Identifiez d'abord la structure générale avant de vous concentrer sur les détails.</li>
                    <li>Pour SQL, analysez les jointures et les conditions de filtrage.</li>
                    <li>Pour Python, suivez le flux d'exécution et les transformations de données.</li>
                    <li>Entraînez-vous régulièrement pour améliorer votre capacité de lecture rapide.</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default ReadMeIfYouCan;