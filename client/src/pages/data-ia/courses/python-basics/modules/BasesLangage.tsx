import React from 'react';
import { ChevronRight, ChevronLeft, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface BasesLangageProps {
  goToNext: () => void;
  goToPrev: () => void;
}

const BasesLangage: React.FC<BasesLangageProps> = ({ goToNext, goToPrev }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Bases du langage Python</h2>
      
      <div className="mb-6">
        <p className="mb-4">Python est reconnu pour sa syntaxe claire et lisible. Dans cette section, nous allons explorer les fondamentaux du langage qui vous permettront de commencer à écrire vos premiers programmes.</p>
        
        <h3 className="text-xl font-semibold mb-3">Votre premier programme Python</h3>
        <p className="mb-3">Commençons par le traditionnel "Hello World" :</p>
        
        <div className="mb-6">
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Ceci est un commentaire
print("Hello, World!")  # Affiche le message sur la console`}
          </SyntaxHighlighter>
          <div className="bg-slate-800 p-2 rounded-b-md border-t border-slate-700 text-green-400 font-mono text-sm">
            Hello, World!
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-3">Commentaires</h3>
        <p className="mb-3">Les commentaires sont essentiels pour documenter votre code et le rendre plus compréhensible :</p>

        <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-6">
          {`# Ceci est un commentaire sur une ligne

'''
Ceci est un commentaire
sur plusieurs lignes (docstring)
Généralement utilisé pour documenter des fonctions et des classes
'''

"""
On peut aussi utiliser les guillemets doubles
pour les commentaires multi-lignes
"""

# En Python, les commentaires sont ignorés lors de l'exécution du code
x = 5  # Commentaire en fin de ligne`}
        </SyntaxHighlighter>
        
        <h3 className="text-xl font-semibold mb-3">Variables et types de données</h3>
        <p className="mb-3">Les variables sont des espaces de stockage nommés pour les données. Python est un langage à typage dynamique, ce qui signifie que vous n'avez pas besoin de déclarer le type d'une variable.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="font-semibold mb-2">Types de données de base</h4>
            <div className="space-y-3">
              <div className="bg-blue-900/30 rounded-md p-3">
                <div className="font-semibold text-blue-300">Entiers (int)</div>
                <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                  {`age = 30
population = 7_800_000_000  # Les _ améliorent la lisibilité
print(type(age))  # <class 'int'>`}
                </SyntaxHighlighter>
              </div>
              
              <div className="bg-blue-900/30 rounded-md p-3">
                <div className="font-semibold text-blue-300">Nombres à virgule flottante (float)</div>
                <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                  {`pi = 3.14159
temperature = -2.5
print(type(pi))  # <class 'float'>`}
                </SyntaxHighlighter>
              </div>
              
              <div className="bg-blue-900/30 rounded-md p-3">
                <div className="font-semibold text-blue-300">Chaînes de caractères (str)</div>
                <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                  {`nom = "Alice"
message = 'Bonjour'
phrase = """Ceci est une chaîne
sur plusieurs lignes"""
print(type(nom))  # <class 'str'>`}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Autres types importants</h4>
            <div className="space-y-3">
              <div className="bg-blue-900/30 rounded-md p-3">
                <div className="font-semibold text-blue-300">Booléens (bool)</div>
                <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                  {`est_actif = True
est_complete = False
print(type(est_actif))  # <class 'bool'>`}
                </SyntaxHighlighter>
              </div>
              
              <div className="bg-blue-900/30 rounded-md p-3">
                <div className="font-semibold text-blue-300">None (NoneType)</div>
                <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                  {`resultat = None  # Représente l'absence de valeur
print(type(resultat))  # <class 'NoneType'>`}
                </SyntaxHighlighter>
              </div>
              
              <div className="bg-blue-900/30 rounded-md p-3">
                <div className="font-semibold text-blue-300">Conversions de types</div>
                <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
                  {`x = int("42")      # Chaîne vers entier
y = float("3.14")   # Chaîne vers flottant
z = str(42)         # Entier vers chaîne
b = bool(1)         # Convertit en booléen (True)`}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-900/30 rounded-md p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-2">Détails sur les conversions</h4>
          <p className="mb-2">La conversion de types est un concept important à maîtriser, voici quelques règles :</p>
          <ul className="list-disc list-inside space-y-1 text-blue-200">
            <li>Pour convertir en <code>int</code>, la chaîne doit contenir un entier valide (sans décimales)</li>
            <li>Pour convertir en <code>float</code>, la chaîne doit représenter un nombre valide</li>
            <li>Tout peut être converti en <code>str</code></li>
            <li>Pour <code>bool</code>, <code>False</code> correspond à : <code>0</code>, <code>None</code>, <code>""</code> (chaîne vide), <code>[]</code> (liste vide), <code>{}</code> (dictionnaire vide), etc.</li>
            <li>Tout le reste est converti en <code>True</code></li>
          </ul>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm mt-2">
            {`# Exemples de conversions en booléen
print(bool(0))         # False
print(bool(""))        # False
print(bool(None))      # False
print(bool([]))        # False
print(bool({}))        # False

print(bool(1))         # True
print(bool("Texte"))   # True
print(bool([1, 2, 3])) # True`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Opérateurs</h3>
        <p className="mb-3">Python dispose d'un ensemble complet d'opérateurs pour effectuer des calculs et des comparaisons.</p>
        
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-900/50">
                <th className="border border-blue-800 p-2 text-left">Type</th>
                <th className="border border-blue-800 p-2 text-left">Opérateurs</th>
                <th className="border border-blue-800 p-2 text-left">Exemple</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-blue-900/20">
                <td className="border border-blue-800 p-2">Arithmétiques</td>
                <td className="border border-blue-800 p-2"><code>+, -, *, /, //, %, **</code></td>
                <td className="border border-blue-800 p-2"><code>5 + 2 = 7, 5 * 2 = 10, 5 / 2 = 2.5</code></td>
              </tr>
              <tr className="bg-blue-900/30">
                <td className="border border-blue-800 p-2">Comparaison</td>
                <td className="border border-blue-800 p-2"><code>==, !=, &gt;, &lt;, &gt;=, &lt;=</code></td>
                <td className="border border-blue-800 p-2"><code>5 &gt; 2 → True, 5 == 5 → True</code></td>
              </tr>
              <tr className="bg-blue-900/20">
                <td className="border border-blue-800 p-2">Logiques</td>
                <td className="border border-blue-800 p-2"><code>and, or, not</code></td>
                <td className="border border-blue-800 p-2"><code>True and False → False</code></td>
              </tr>
              <tr className="bg-blue-900/30">
                <td className="border border-blue-800 p-2">Assignation</td>
                <td className="border border-blue-800 p-2"><code>=, +=, -=, *=, /=</code></td>
                <td className="border border-blue-800 p-2"><code>x = 5, x += 2 → x devient 7</code></td>
              </tr>
              <tr className="bg-blue-900/20">
                <td className="border border-blue-800 p-2">Identité</td>
                <td className="border border-blue-800 p-2"><code>is, is not</code></td>
                <td className="border border-blue-800 p-2"><code>x is y → vérifie si mêmes objets</code></td>
              </tr>
              <tr className="bg-blue-900/30">
                <td className="border border-blue-800 p-2">Appartenance</td>
                <td className="border border-blue-800 p-2"><code>in, not in</code></td>
                <td className="border border-blue-800 p-2"><code>"a" in "abc" → True</code></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-blue-900/30 rounded-md p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-2">Division en Python</h4>
          <p className="mb-2">Python propose deux types de division :</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md text-sm">
            {`# Division standard (/) - Retourne toujours un float
print(5 / 2)   # 2.5
print(10 / 2)  # 5.0

# Division entière (//) - Retourne un entier (arrondi vers le bas)
print(5 // 2)  # 2
print(5 // 2)  # 2

# Modulo (%) - Retourne le reste de la division
print(5 % 2)   # 1
print(10 % 3)  # 1`}
          </SyntaxHighlighter>
        </div>
        
        <h3 className="text-xl font-semibold mb-3">Formatage de chaînes</h3>
        <p className="mb-3">Python offre plusieurs façons de formater des chaînes de caractères, et cette fonctionnalité est particulièrement utile pour présenter des résultats :</p>
        
        <div className="space-y-4 mb-6">
          <div className="bg-blue-900/30 rounded-lg p-4">
            <h4 className="font-semibold mb-2">f-strings (Python 3.6+, recommandé)</h4>
            <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
              {`nom = "Alice"
age = 30
message = f"Bonjour, je m'appelle {nom} et j'ai {age} ans."
print(message)  # Bonjour, je m'appelle Alice et j'ai 30 ans.

# Expressions dans les f-strings
prix = 49.95
quantite = 3
print(f"Total: {prix * quantite:.2f}€")  # Total: 149.85€`}
            </SyntaxHighlighter>
          </div>
          
          <div className="bg-blue-900/30 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Méthode .format()</h4>
            <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
              {`nom = "Bob"
age = 25
message = "Bonjour, je m'appelle {} et j'ai {} ans.".format(nom, age)
print(message)  # Bonjour, je m'appelle Bob et j'ai 25 ans.

# Utilisation de paramètres nommés
message = "Bonjour, je m'appelle {nom} et j'ai {age} ans.".format(nom=nom, age=age)`}
            </SyntaxHighlighter>
          </div>
          
          <div className="bg-blue-900/30 rounded-lg p-4">
            <h4 className="font-semibold mb-2">Formatage % (style ancien, moins recommandé)</h4>
            <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
              {`nom = "Charlie"
age = 35
message = "Bonjour, je m'appelle %s et j'ai %d ans." % (nom, age)
print(message)  # Bonjour, je m'appelle Charlie et j'ai 35 ans.`}
            </SyntaxHighlighter>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-3">Manipulation de chaînes</h3>
        <p className="mb-3">Les chaînes de caractères en Python offrent de nombreuses méthodes intégrées :</p>

        <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-6">
          {`texte = "  Data Science avec Python  "

# Longueur d'une chaîne
print(len(texte))            # 26

# Accès aux caractères (indexation commence à 0)
print(texte[7])              # S

# Tranches (slicing)
print(texte[2:6])            # Data
print(texte[:4])             # "  Da" (du début à l'indice 3)
print(texte[-7:])            # Python  (les 7 derniers caractères)

# Méthodes utiles
print(texte.upper())         # "  DATA SCIENCE AVEC PYTHON  "
print(texte.lower())         # "  data science avec python  "
print(texte.strip())         # "Data Science avec Python" (supprime les espaces avant/après)
print(texte.replace("Python", "R"))  # "  Data Science avec R  "
print(texte.split())         # ["Data", "Science", "avec", "Python"]
print(",".join(["A", "B", "C"]))     # "A,B,C"

# Vérifications
print("Python" in texte)     # True
print(texte.startswith("  D"))  # True
print(texte.endswith("!"))   # False`}
        </SyntaxHighlighter>

        <h3 className="text-xl font-semibold mb-3">Entrées utilisateur</h3>
        <p className="mb-3">La fonction <code>input()</code> permet de récupérer une saisie utilisateur :</p>

        <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md mb-6">
          {`# Demander une entrée à l'utilisateur
nom = input("Entrez votre nom : ")
print(f"Bonjour, {nom} !")

# Les entrées sont toujours de type str, il faut les convertir si nécessaire
age_str = input("Entrez votre âge : ")
age = int(age_str)
print(f"Dans 5 ans, vous aurez {age + 5} ans.")`}
        </SyntaxHighlighter>
        
        <div className="bg-gradient-to-r from-blue-800/30 to-indigo-800/30 border border-blue-700 rounded-lg p-4 mb-6">
          <h3 className="flex items-center text-lg font-semibold mb-2">
            <BrainCircuit className="h-5 w-5 text-blue-400 mr-2" />
            Exemple pratique en Data Science
          </h3>
          <p className="text-blue-200 mb-3">Voici un exemple de code qui combine plusieurs concepts de base pour effectuer une analyse simple :</p>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Analyse de température mensuelle
temperatures = [14.2, 16.3, 18.0, 19.5, 22.1, 25.3, 28.2, 29.7, 26.4, 21.8, 18.5, 15.2]
mois = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"]

# Calculs de base
temp_moyenne = sum(temperatures) / len(temperatures)
temp_max = max(temperatures)
temp_min = min(temperatures)
amplitude = temp_max - temp_min

# Analyse et formatage
mois_plus_chaud = mois[temperatures.index(temp_max)]
mois_plus_froid = mois[temperatures.index(temp_min)]

# Affichage des résultats
print(f"Température moyenne annuelle: {temp_moyenne:.1f}°C")
print(f"Température maximale: {temp_max}°C en {mois_plus_chaud}")
print(f"Température minimale: {temp_min}°C en {mois_plus_froid}")
print(f"Amplitude thermique: {amplitude}°C")`}
          </SyntaxHighlighter>
          <div className="bg-slate-800 p-2 rounded-b-md border-t border-slate-700 text-green-400 font-mono text-sm">
            Température moyenne annuelle: 21.3°C<br/>
            Température maximale: 29.7°C en Aoû<br/>
            Température minimale: 14.2°C en Jan<br/>
            Amplitude thermique: 15.5°C
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-3">Exercices pratiques</h3>
        
        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-3">Exercice 1: Conversion de température</h4>
          <p className="mb-2">Écrivez un programme qui convertit une température de Celsius en Fahrenheit.</p>
          <p className="mb-1 text-blue-300">Formule: F = (C × 9/5) + 32</p>

          <div className="mt-4 mb-2 font-semibold">Solution:</div>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Convertisseur de température
celsius = float(input("Entrez une température en °C : "))
fahrenheit = (celsius * 9/5) + 32
print(f"{celsius}°C équivaut à {fahrenheit:.1f}°F")`}
          </SyntaxHighlighter>
        </div>

        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-800 mb-6">
          <h4 className="font-semibold mb-3">Exercice 2: Calcul d'IMC (Indice de Masse Corporelle)</h4>
          <p className="mb-2">Écrivez un programme qui calcule l'IMC d'une personne à partir de son poids (en kg) et de sa taille (en m).</p>
          <p className="mb-1 text-blue-300">Formule: IMC = poids / (taille)²</p>

          <div className="mt-4 mb-2 font-semibold">Solution:</div>
          <SyntaxHighlighter language="python" style={vscDarkPlus} className="rounded-md">
            {`# Calculateur d'IMC
poids = float(input("Entrez votre poids en kg : "))
taille = float(input("Entrez votre taille en m : "))

imc = poids / (taille ** 2)

print(f"Votre IMC est de {imc:.1f}")

# Interprétation (simplifiée)
if imc < 18.5:
    categorie = "insuffisance pondérale"
elif imc < 25:
    categorie = "poids normal"
elif imc < 30:
    categorie = "surpoids"
else:
    categorie = "obésité"

print(f"Catégorie: {categorie}")`}
          </SyntaxHighlighter>
        </div>
      </div>
      
      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={goToPrev}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
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

export default BasesLangage;