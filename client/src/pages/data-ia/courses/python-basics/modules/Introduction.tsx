import React from 'react';
import { ChevronRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface IntroductionProps {
  goToNext: () => void;
}

const Introduction: React.FC<IntroductionProps> = ({ goToNext }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Introduction à Python</h2>
      
      <div className="mb-6">
        <p className="mb-4">Python est l'un des langages de programmation les plus populaires au monde, particulièrement dans le domaine de la data science et de l'intelligence artificielle. Sa syntaxe intuitive et sa grande flexibilité en font un excellent choix pour les débutants comme pour les experts.</p>
        
        <div className="bg-blue-950/50 border border-blue-800 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold mb-2 flex items-center">
            <Lightbulb className="h-5 w-5 text-amber-400 mr-2" />
            Pourquoi Python pour la Data Science ?
          </h3>
          <ul className="list-disc list-inside space-y-2 text-blue-200">
            <li><strong>Simplicité</strong> : Syntaxe claire et lisible, idéale pour la modélisation de concepts</li>
            <li><strong>Écosystème riche</strong> : Bibliothèques spécialisées (NumPy, Pandas, Matplotlib, Scikit-learn, etc.)</li>
            <li><strong>Communauté active</strong> : Ressources abondantes et support communautaire</li>
            <li><strong>Polyvalence</strong> : Adapté à l'analyse de données, au machine learning, à la visualisation</li>
            <li><strong>Intégration facile</strong> : Interopérable avec d'autres langages et technologies</li>
          </ul>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Histoire et évolution de Python</h3>
        <p className="mb-4">Créé par Guido van Rossum à la fin des années 1980, Python a connu une évolution remarquable :</p>
        
        <div className="relative pl-8 mb-6">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-700"></div>
          
          <div className="relative pb-6">
            <div className="absolute left-[-0.5rem] top-1.5 h-4 w-4 rounded-full bg-blue-600 border-2 border-blue-300"></div>
            <div className="font-semibold text-blue-300">1991</div>
            <div>Python 0.9.0 - Première version publique</div>
          </div>
          
          <div className="relative pb-6">
            <div className="absolute left-[-0.5rem] top-1.5 h-4 w-4 rounded-full bg-blue-600 border-2 border-blue-300"></div>
            <div className="font-semibold text-blue-300">2000</div>
            <div>Python 2.0 - Nouvelles fonctionnalités comme le ramasse-miettes (garbage collector)</div>
          </div>
          
          <div className="relative pb-6">
            <div className="absolute left-[-0.5rem] top-1.5 h-4 w-4 rounded-full bg-blue-600 border-2 border-blue-300"></div>
            <div className="font-semibold text-blue-300">2008</div>
            <div>Python 3.0 - Amélioration majeure, non rétrocompatible avec Python 2</div>
          </div>
          
          <div className="relative pb-6">
            <div className="absolute left-[-0.5rem] top-1.5 h-4 w-4 rounded-full bg-blue-600 border-2 border-blue-300"></div>
            <div className="font-semibold text-blue-300">2010s</div>
            <div>Essor de Python en data science avec l'émergence de bibliothèques spécialisées</div>
          </div>
          
          <div className="relative">
            <div className="absolute left-[-0.5rem] top-1.5 h-4 w-4 rounded-full bg-blue-600 border-2 border-blue-300"></div>
            <div className="font-semibold text-blue-300">Aujourd'hui</div>
            <div>Python est l'un des langages les plus utilisés, particulièrement en IA et Data Science</div>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Python 2 vs Python 3</h3>
        <p className="mb-4">Aujourd'hui, Python 3 est la version standard. Les principales différences avec Python 2 (désormais obsolète) :</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-900/30 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Python 2</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-200">
              <li>Print est une instruction: <code>print "Hello"</code></li>
              <li>Division entière par défaut: <code>5 / 2 == 2</code></li>
              <li>Unicode moins bien supporté</li>
              <li>Support terminé en 2020</li>
            </ul>
          </div>
          
          <div className="bg-blue-700/30 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Python 3</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-blue-200">
              <li>Print est une fonction: <code>print("Hello")</code></li>
              <li>Division flottante par défaut: <code>5 / 2 == 2.5</code></li>
              <li>Meilleur support Unicode</li>
              <li>Version actuelle et supportée</li>
            </ul>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Python en entreprise</h3>
        <p className="mb-4">Python est largement utilisé dans l'industrie, notamment dans des entreprises comme :</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-950/70 rounded-lg p-4 text-center">
            <h4 className="font-semibold">Google</h4>
            <p className="text-sm text-blue-300">Infrastructure web et machine learning</p>
          </div>
          <div className="bg-blue-950/70 rounded-lg p-4 text-center">
            <h4 className="font-semibold">Netflix</h4>
            <p className="text-sm text-blue-300">Analyse de données et recommandations</p>
          </div>
          <div className="bg-blue-950/70 rounded-lg p-4 text-center">
            <h4 className="font-semibold">Spotify</h4>
            <p className="text-sm text-blue-300">Analyses musicales et recommandations</p>
          </div>
          <div className="bg-blue-950/70 rounded-lg p-4 text-center">
            <h4 className="font-semibold">Instagram</h4>
            <p className="text-sm text-blue-300">Backend et traitement d'images</p>
          </div>
          <div className="bg-blue-950/70 rounded-lg p-4 text-center">
            <h4 className="font-semibold">NASA</h4>
            <p className="text-sm text-blue-300">Traitement de données scientifiques</p>
          </div>
          <div className="bg-blue-950/70 rounded-lg p-4 text-center">
            <h4 className="font-semibold">mc2i</h4>
            <p className="text-sm text-blue-300">Projets data et intelligence artificielle</p>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-3">Applications en Data Science</h3>
        <p className="mb-4">Python excelle dans de nombreux domaines liés à la data science :</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg p-5 border border-blue-800/70">
            <h4 className="font-bold text-lg mb-2">Analyse de données</h4>
            <p className="text-sm mb-3">Manipulation, nettoyage et exploration de données avec des bibliothèques comme Pandas.</p>
            <SyntaxHighlighter language="python" style={vscDarkPlus} className="text-xs rounded">
              {`import pandas as pd

# Charger les données
data = pd.read_csv('donnees.csv')

# Analyser les données
summary = data.describe()
missing_values = data.isnull().sum()

# Filtrer les données
filtered_data = data[data['age'] > 30]`}
            </SyntaxHighlighter>
          </div>

          <div className="bg-gradient-to-br from-blue-900/30 to-indigo-900/30 rounded-lg p-5 border border-blue-800/70">
            <h4 className="font-bold text-lg mb-2">Machine Learning</h4>
            <p className="text-sm mb-3">Création de modèles prédictifs avec des bibliothèques comme Scikit-learn.</p>
            <SyntaxHighlighter language="python" style={vscDarkPlus} className="text-xs rounded">
              {`from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

# Préparer les données
X_train, X_test, y_train, y_test = train_test_split(
    features, target, test_size=0.3
)

# Entraîner un modèle
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Évaluer le modèle
accuracy = model.score(X_test, y_test)`}
            </SyntaxHighlighter>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-3">Zen de Python</h3>
        <p className="mb-3">La philosophie de Python est résumée dans le "Zen de Python", accessible en tapant <code>import this</code> dans un interpréteur Python :</p>

        <div className="bg-blue-950/60 border-l-4 border-blue-500 p-4 mb-6 italic">
          <p className="mb-2">Beautiful is better than ugly.</p>
          <p className="mb-2">Explicit is better than implicit.</p>
          <p className="mb-2">Simple is better than complex.</p>
          <p className="mb-2">Complex is better than complicated.</p>
          <p className="mb-2">Flat is better than nested.</p>
          <p className="mb-2">Sparse is better than dense.</p>
          <p>Readability counts.</p>
          <p className="text-sm text-blue-300 mt-2 not-italic">... et bien d'autres principes qui guident l'écriture de code Python</p>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button variant="outline" disabled>
          Précédent
        </Button>
        <Button 
          onClick={goToNext}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Suivant
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default Introduction;