import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Code,
  Braces,
  Cpu,
  RefreshCw,
  Terminal,
  Download,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  LayoutList,
  FileCode2,
  Settings2,
  Languages,
  Link as LinkIcon,
  CheckCircle,
  MessageSquare,
  Lightbulb
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import Layout from '@/components/layout/Layout';
import PageTitle from '@/components/layout/PageTitle';
import { Switch } from '@/components/ui/switch';
import { apiRequest } from '@/lib/queryClient';
import { useTheme } from '@/components/theme-provider';
import axios from 'axios';

// Définition des types pour le générateur de code
interface CodeGenerationRequest {
  prompt: string;
  language: string;
  framework?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  includeComments: boolean;
  includeTests: boolean;
  additionalContext?: string;
}

interface CodeGenerationResponse {
  code: string;
  explanation: string;
  language: string;
  framework?: string;
  fileExtension: string;
  suggestedFileStructure?: Array<{
    name: string;
    type: 'file' | 'directory';
    content?: string;
  }>;
  references?: Array<{
    title: string;
    url: string;
  }>;
}

// Langages de programmation disponibles
const programmingLanguages = [
  { value: 'python', label: 'Python', extension: '.py', icon: <Braces className="h-4 w-4 mr-2" /> },
  { value: 'javascript', label: 'JavaScript', extension: '.js', icon: <Code className="h-4 w-4 mr-2" /> },
  { value: 'typescript', label: 'TypeScript', extension: '.ts', icon: <FileCode2 className="h-4 w-4 mr-2" /> },
  { value: 'java', label: 'Java', extension: '.java', icon: <Cpu className="h-4 w-4 mr-2" /> },
  { value: 'csharp', label: 'C#', extension: '.cs', icon: <Terminal className="h-4 w-4 mr-2" /> },
  { value: 'go', label: 'Go', extension: '.go', icon: <Braces className="h-4 w-4 mr-2" /> },
  { value: 'rust', label: 'Rust', extension: '.rs', icon: <Code className="h-4 w-4 mr-2" /> },
  { value: 'php', label: 'PHP', extension: '.php', icon: <Code className="h-4 w-4 mr-2" /> },
  { value: 'swift', label: 'Swift', extension: '.swift', icon: <Braces className="h-4 w-4 mr-2" /> },
  { value: 'kotlin', label: 'Kotlin', extension: '.kt', icon: <Terminal className="h-4 w-4 mr-2" /> },
  { value: 'ruby', label: 'Ruby', extension: '.rb', icon: <Braces className="h-4 w-4 mr-2" /> },
];

// Frameworks par langage
const frameworksByLanguage: Record<string, Array<{ value: string, label: string }>> = {
  python: [
    { value: 'none', label: 'Aucun' },
    { value: 'flask', label: 'Flask' },
    { value: 'django', label: 'Django' },
    { value: 'fastapi', label: 'FastAPI' },
    { value: 'pytorch', label: 'PyTorch' },
    { value: 'tensorflow', label: 'TensorFlow' },
  ],
  javascript: [
    { value: 'none', label: 'Aucun' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue.js' },
    { value: 'angular', label: 'Angular' },
    { value: 'express', label: 'Express' },
    { value: 'nextjs', label: 'Next.js' },
  ],
  typescript: [
    { value: 'none', label: 'Aucun' },
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue.js' },
    { value: 'angular', label: 'Angular' },
    { value: 'express', label: 'Express' },
    { value: 'nextjs', label: 'Next.js' },
  ],
  java: [
    { value: 'none', label: 'Aucun' },
    { value: 'spring', label: 'Spring' },
    { value: 'springboot', label: 'Spring Boot' },
    { value: 'jakarta', label: 'Jakarta EE' },
  ],
  csharp: [
    { value: 'none', label: 'Aucun' },
    { value: 'dotnet', label: '.NET' },
    { value: 'aspnet', label: 'ASP.NET Core' },
    { value: 'xamarin', label: 'Xamarin' },
  ],
};

// Exemples de prompts pour inspirer l'utilisateur
const promptExamples = [
  "Créer une API REST pour gérer un inventaire de produits avec authentification",
  "Développer un jeu simple de devinette de nombre en interface console",
  "Concevoir une classe pour gérer une file d'attente prioritaire",
  "Créer un script qui convertit des images PNG en JPG avec redimensionnement",
  "Implémenter un algorithme de tri fusion (merge sort)",
  "Créer un formulaire d'inscription avec validation des champs",
  "Développer un crawler web simple qui extrait les titres d'articles",
  "Créer un système de cache en mémoire avec expiration des données",
];

export default function CodeGeneratorPage() {
  const { themeMode } = useTheme();
  const isFuturistic = themeMode === 'futuristic';
  const { toast } = useToast();

  // État pour le formulaire de génération de code
  const [formData, setFormData] = useState<CodeGenerationRequest>({
    prompt: '',
    language: 'python',
    framework: 'none',
    level: 'intermediate',
    includeComments: true,
    includeTests: false,
    additionalContext: '',
  });

  // État pour suivre si le code a été copié
  const [copied, setCopied] = useState(false);
  // État pour les onglets actifs
  const [activeTab, setActiveTab] = useState('code');
  // État pour l'historique des demandes
  const [history, setHistory] = useState<Array<{ prompt: string; timestamp: Date }>>([]);
  // État pour stocker le dernier résultat
  const [lastResult, setLastResult] = useState<CodeGenerationResponse | null>(null);
  // État pour l'exemple de prompt sélectionné
  const [selectedExample, setSelectedExample] = useState(-1);

  // Fonction pour utiliser un exemple de prompt
  const usePromptExample = (index: number) => {
    setSelectedExample(index);
    setFormData({
      ...formData,
      prompt: promptExamples[index],
    });
  };

  // Fonction pour mettre à jour le formulaire
  const handleInputChange = (field: keyof CodeGenerationRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Réinitialiser le framework si le langage change
    if (field === 'language') {
      setFormData(prev => ({
        ...prev,
        [field]: value,
        framework: frameworksByLanguage[value] ? 'none' : undefined,
      }));
    }
  };

  // Mutation pour générer le code
  const generateCodeMutation = useMutation({
    mutationFn: async (data: CodeGenerationRequest) => {
      try {
        // En environnement de production, cette requête irait vers notre API
        // Pour le développement, on simule une réponse
        
        // Simuler un délai pour montrer le chargement
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Exemple de code pour Python sans framework
        const pythonCode = `
def main():
    """
    Fonction principale pour démarrer l'application.
    ${data.prompt}
    """
    print("Démarrage de l'application...")
    
    # Initialisation des variables
    running = True
    data = []
    
    while running:
        # Affichage du menu
        print("\\n1. Ajouter un élément")
        print("2. Afficher les éléments")
        print("3. Quitter")
        
        choice = input("Votre choix: ")
        
        if choice == "1":
            item = input("Entrez un élément: ")
            data.append(item)
            print(f"Élément '{item}' ajouté avec succès!")
        elif choice == "2":
            if not data:
                print("Aucun élément à afficher.")
            else:
                print("\\nListe des éléments:")
                for idx, item in enumerate(data, 1):
                    print(f"{idx}. {item}")
        elif choice == "3":
            running = False
            print("Au revoir!")
        else:
            print("Choix invalide. Veuillez réessayer.")

if __name__ == "__main__":
    main()
`;

        // Exemple de code pour JavaScript avec React
        const reactCode = `
import React, { useState } from 'react';
import './App.css';

function App() {
  // État pour stocker les éléments
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  
  // Fonction pour ajouter un élément
  const addItem = () => {
    if (newItem.trim() !== '') {
      setItems([...items, newItem]);
      setNewItem('');
    }
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Ma Liste d'éléments</h1>
        
        <div className="input-container">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            placeholder="Ajouter un élément..."
          />
          <button onClick={addItem}>Ajouter</button>
        </div>
        
        {items.length === 0 ? (
          <p>Aucun élément à afficher.</p>
        ) : (
          <ul>
            {items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        )}
      </header>
    </div>
  );
}

export default App;
`;

        // Générer une réponse en fonction du langage et du framework sélectionnés
        let codeResponse: CodeGenerationResponse;
        
        if (data.language === 'python') {
          codeResponse = {
            code: pythonCode,
            explanation: "Ce code crée une application console simple avec un menu interactif permettant d'ajouter des éléments à une liste et de les afficher. La structure utilise une boucle principale et un système de menu basé sur les entrées utilisateur.",
            language: 'python',
            fileExtension: '.py',
            suggestedFileStructure: [
              {
                name: 'main.py',
                type: 'file',
                content: pythonCode
              },
              {
                name: 'README.md',
                type: 'file',
                content: `# Application Console Python\n\nUne application simple permettant de gérer une liste d'éléments via un menu interactif.\n\n## Utilisation\n\nExécutez le script avec Python:\n\n\`\`\`\npython main.py\n\`\`\``
              }
            ],
            references: [
              {
                title: "Documentation Python",
                url: "https://docs.python.org/fr/3/"
              },
              {
                title: "Guide sur les listes Python",
                url: "https://docs.python.org/fr/3/tutorial/datastructures.html"
              }
            ]
          };
        } else if (data.language === 'javascript' && data.framework === 'react') {
          codeResponse = {
            code: reactCode,
            explanation: "Ce code crée une application React simple qui permet d'ajouter des éléments à une liste et de les afficher. Il utilise le hook useState pour gérer l'état des éléments et du champ de saisie. L'interface comprend un champ de texte, un bouton pour ajouter des éléments, et une liste pour afficher les éléments ajoutés.",
            language: 'javascript',
            framework: 'react',
            fileExtension: '.jsx',
            suggestedFileStructure: [
              {
                name: 'src',
                type: 'directory'
              },
              {
                name: 'src/App.jsx',
                type: 'file',
                content: reactCode
              },
              {
                name: 'src/App.css',
                type: 'file',
                content: `.App {
  text-align: center;
}

.App-header {
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
}

.input-container {
  margin: 20px 0;
  display: flex;
}

input {
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 4px 0 0 4px;
  width: 300px;
}

button {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #61dafb;
  color: #282c34;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
}

ul {
  list-style-type: none;
  padding: 0;
  width: 400px;
}

li {
  padding: 10px;
  margin: 5px 0;
  background-color: #3a3f4a;
  border-radius: 4px;
  text-align: left;
}`
              },
              {
                name: 'src/index.js',
                type: 'file',
                content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`
              }
            ],
            references: [
              {
                title: "Documentation React",
                url: "https://fr.reactjs.org/docs/getting-started.html"
              },
              {
                title: "Hooks React",
                url: "https://fr.reactjs.org/docs/hooks-intro.html"
              }
            ]
          };
        } else {
          // Réponse par défaut pour les autres langages/frameworks
          codeResponse = {
            code: `// Code pour ${data.language} ${data.framework !== 'none' ? 'avec ' + data.framework : 'sans framework'}\n// Génération du code pour: ${data.prompt}`,
            explanation: `Voici une implémentation de base pour ${data.language}${data.framework !== 'none' ? ' avec ' + data.framework : ''}. Ce code répond à votre besoin: ${data.prompt}`,
            language: data.language,
            framework: data.framework !== 'none' ? data.framework : undefined,
            fileExtension: '.txt',
            suggestedFileStructure: [
              {
                name: 'main',
                type: 'file',
                content: `// Code principal pour ${data.language} ${data.framework !== 'none' ? 'avec ' + data.framework : 'sans framework'}`
              }
            ]
          };
        }

        // Ajouter la requête à l'historique
        setHistory(prev => [
          { prompt: data.prompt, timestamp: new Date() },
          ...prev.slice(0, 9) // Garder les 10 dernières requêtes maximum
        ]);

        // Stocker le résultat pour affichage
        setLastResult(codeResponse);
        
        return codeResponse;
      } catch (error) {
        console.error('Error generating code:', error);
        throw error;
      }
    },
    onError: (error) => {
      toast({
        title: "Erreur de génération",
        description: "Une erreur est survenue lors de la génération du code. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  });

  // Fonction pour copier le code dans le presse-papier
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        toast({
          title: "Code copié",
          description: "Le code a été copié dans le presse-papier",
          variant: "default",
        });
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        toast({
          title: "Erreur",
          description: "Impossible de copier le code",
          variant: "destructive",
        });
      });
  };

  // Fonction pour télécharger le code
  const downloadCode = (code: string, fileExtension: string) => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `generated_code${fileExtension}`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Fonction pour soumettre le formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generateCodeMutation.mutate(formData);
  };

  return (
    <Layout>
      <PageTitle title="Générateur de Code" />
      
      {/* Hero section */}
      <div className={`w-full ${isFuturistic ? 'bg-gradient-to-b from-blue-950 to-indigo-950' : 'bg-blue-50'} py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden`}>
        {/* Effets visuels futuristes */}
        {isFuturistic && (
          <div className="absolute inset-0 overflow-hidden opacity-30">
            <div className="absolute top-0 right-0 w-full h-full mix-blend-screen">
              <div className="absolute top-20 right-20 w-60 h-60 bg-blue-500/20 rounded-full filter blur-3xl"></div>
              <div className="absolute bottom-10 left-10 w-72 h-72 bg-indigo-500/20 rounded-full filter blur-3xl"></div>
            </div>
            
            {/* Grille numérique */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
          </div>
        )}
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center">
            <motion.h1 
              className={`text-2xl sm:text-3xl font-bold mb-3 ${
                isFuturistic 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300 font-cyber-title tracking-wide' 
                  : 'text-blue-900'
              }`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              Générateur de Code IA
            </motion.h1>
            
            <motion.p 
              className={`text-lg max-w-3xl mx-auto mb-4 ${
                isFuturistic ? 'text-indigo-100' : 'text-blue-700'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              Transformez vos idées en code fonctionnel grâce à notre générateur basé sur l'IA.
              Spécifiez vos besoins et obtenez du code dans le langage de votre choix.
            </motion.p>
          </div>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className={`w-full ${isFuturistic ? 'bg-gray-900' : 'bg-white'} py-6 px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Formulaire de génération de code */}
            <div className="lg:col-span-1">
              <Card className={isFuturistic ? 'bg-gray-800 border-gray-700' : ''}>
                <CardHeader>
                  <CardTitle className={isFuturistic ? 'text-white' : ''}>
                    <div className="flex items-center gap-2">
                      <Code className={`h-5 w-5 ${isFuturistic ? 'text-blue-400' : 'text-blue-600'}`} />
                      Paramètres de génération
                    </div>
                  </CardTitle>
                  <CardDescription className={isFuturistic ? 'text-gray-400' : ''}>
                    Configurez les détails pour générer votre code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="prompt" className={isFuturistic ? 'text-gray-300' : ''}>
                        Description de votre besoin
                      </Label>
                      <Textarea 
                        id="prompt"
                        placeholder="Décrivez ce que vous souhaitez réaliser avec votre code..."
                        value={formData.prompt}
                        onChange={(e) => handleInputChange('prompt', e.target.value)}
                        className={`h-32 ${isFuturistic ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}`}
                        required
                      />
                      <p className={`text-xs ${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`}>
                        Soyez aussi précis que possible pour obtenir un code de qualité.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="language" className={isFuturistic ? 'text-gray-300' : ''}>
                        Langage de programmation
                      </Label>
                      <Select 
                        value={formData.language} 
                        onValueChange={(value) => handleInputChange('language', value)}
                      >
                        <SelectTrigger className={isFuturistic ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                          <SelectValue placeholder="Sélectionnez un langage" />
                        </SelectTrigger>
                        <SelectContent className={isFuturistic ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                          <SelectGroup>
                            <SelectLabel className={isFuturistic ? 'text-gray-300' : ''}>Langages</SelectLabel>
                            {programmingLanguages.map((lang) => (
                              <SelectItem key={lang.value} value={lang.value} className={isFuturistic ? 'text-white focus:bg-gray-700 focus:text-white' : ''}>
                                <div className="flex items-center">
                                  {lang.icon}
                                  {lang.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {frameworksByLanguage[formData.language] && (
                      <div className="space-y-2">
                        <Label htmlFor="framework" className={isFuturistic ? 'text-gray-300' : ''}>
                          Framework / Bibliothèque
                        </Label>
                        <Select 
                          value={formData.framework || 'none'} 
                          onValueChange={(value) => handleInputChange('framework', value)}
                        >
                          <SelectTrigger className={isFuturistic ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                            <SelectValue placeholder="Sélectionnez un framework" />
                          </SelectTrigger>
                          <SelectContent className={isFuturistic ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                            <SelectGroup>
                              <SelectLabel className={isFuturistic ? 'text-gray-300' : ''}>Frameworks</SelectLabel>
                              {frameworksByLanguage[formData.language].map((framework) => (
                                <SelectItem 
                                  key={framework.value} 
                                  value={framework.value}
                                  className={isFuturistic ? 'text-white focus:bg-gray-700 focus:text-white' : ''}
                                >
                                  {framework.label}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="level" className={isFuturistic ? 'text-gray-300' : ''}>
                        Niveau de complexité
                      </Label>
                      <Select 
                        value={formData.level} 
                        onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => handleInputChange('level', value)}
                      >
                        <SelectTrigger className={isFuturistic ? 'bg-gray-700 border-gray-600 text-white' : ''}>
                          <SelectValue placeholder="Sélectionnez un niveau" />
                        </SelectTrigger>
                        <SelectContent className={isFuturistic ? 'bg-gray-800 border-gray-700 text-white' : ''}>
                          <SelectItem value="beginner" className={isFuturistic ? 'text-white focus:bg-gray-700 focus:text-white' : ''}>
                            Débutant
                          </SelectItem>
                          <SelectItem value="intermediate" className={isFuturistic ? 'text-white focus:bg-gray-700 focus:text-white' : ''}>
                            Intermédiaire
                          </SelectItem>
                          <SelectItem value="advanced" className={isFuturistic ? 'text-white focus:bg-gray-700 focus:text-white' : ''}>
                            Avancé
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeComments" className={isFuturistic ? 'text-gray-300' : ''}>
                          Inclure des commentaires
                        </Label>
                        <Switch 
                          id="includeComments"
                          checked={formData.includeComments}
                          onCheckedChange={(checked) => handleInputChange('includeComments', checked)}
                          className={isFuturistic ? 'data-[state=checked]:bg-blue-600' : ''}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="includeTests" className={isFuturistic ? 'text-gray-300' : ''}>
                          Inclure des tests
                        </Label>
                        <Switch 
                          id="includeTests"
                          checked={formData.includeTests}
                          onCheckedChange={(checked) => handleInputChange('includeTests', checked)}
                          className={isFuturistic ? 'data-[state=checked]:bg-blue-600' : ''}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="additionalContext" className={isFuturistic ? 'text-gray-300' : ''}>
                        Contexte supplémentaire (optionnel)
                      </Label>
                      <Textarea 
                        id="additionalContext"
                        placeholder="Ajoutez des détails, contraintes ou exigences particulières..."
                        value={formData.additionalContext || ''}
                        onChange={(e) => handleInputChange('additionalContext', e.target.value)}
                        className={`h-20 ${isFuturistic ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}`}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className={`w-full ${
                        isFuturistic 
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      } text-white`}
                      disabled={generateCodeMutation.isPending || !formData.prompt.trim()}
                    >
                      {generateCodeMutation.isPending ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Génération en cours...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Générer le code
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
              
              {/* Exemples de prompts */}
              <Card className={`mt-4 ${isFuturistic ? 'bg-gray-800 border-gray-700' : ''}`}>
                <CardHeader className="pb-3">
                  <CardTitle className={isFuturistic ? 'text-white' : ''}>
                    <div className="flex items-center gap-2">
                      <Lightbulb className={`h-5 w-5 ${isFuturistic ? 'text-yellow-400' : 'text-yellow-600'}`} />
                      Exemples d'idées
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {promptExamples.map((example, index) => (
                      <div 
                        key={index}
                        className={`p-2 rounded-md cursor-pointer text-sm ${
                          selectedExample === index
                            ? isFuturistic 
                              ? 'bg-blue-500/30 border border-blue-400 text-white' 
                              : 'bg-blue-100 border border-blue-200'
                            : isFuturistic 
                              ? 'bg-blue-900/20 hover:bg-blue-800/40 border border-blue-700/50 text-white' 
                              : 'hover:bg-gray-100 border border-gray-200'
                        } transition-colors`}
                        onClick={() => usePromptExample(index)}
                      >
                        <p className="font-medium">
                          {example}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Résultat de la génération */}
            <div className="lg:col-span-2">
              {!lastResult && !generateCodeMutation.isPending ? (
                <div className={`h-full flex flex-col items-center justify-center p-10 border ${isFuturistic ? 'border-gray-700 text-gray-400' : 'border-gray-200 text-gray-500'} rounded-lg`}>
                  <Code className={`h-16 w-16 ${isFuturistic ? 'text-gray-700' : 'text-gray-300'} mb-4`} />
                  <h3 className={`text-xl font-medium mb-2 ${isFuturistic ? 'text-gray-300' : 'text-gray-700'}`}>
                    Prêt à générer du code
                  </h3>
                  <p className="text-center max-w-md">
                    Décrivez votre besoin, sélectionnez vos préférences et cliquez sur "Générer le code" pour obtenir votre solution.
                  </p>
                </div>
              ) : generateCodeMutation.isPending ? (
                <div className={`h-full flex flex-col items-center justify-center p-10 border ${isFuturistic ? 'border-gray-700' : 'border-gray-200'} rounded-lg`}>
                  <div className={`${isFuturistic ? 'text-blue-400' : 'text-blue-600'} animate-pulse`}>
                    <RefreshCw className="h-16 w-16 animate-spin mb-4" />
                  </div>
                  <h3 className={`text-xl font-medium mb-2 ${isFuturistic ? 'text-gray-300' : 'text-gray-700'}`}>
                    Génération en cours...
                  </h3>
                  <p className={`text-center max-w-md ${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`}>
                    Notre IA analyse votre demande et génère le code optimal. Cela peut prendre quelques secondes.
                  </p>
                </div>
              ) : (
                <Card className={isFuturistic ? 'bg-gray-800 border-gray-700' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className={isFuturistic ? 'text-white' : ''}>
                        <div className="flex items-center gap-2">
                          <FileCode2 className={`h-5 w-5 ${isFuturistic ? 'text-blue-400' : 'text-blue-600'}`} />
                          Code généré - {programmingLanguages.find(l => l.value === lastResult?.language)?.label || lastResult?.language}
                          {lastResult?.framework && lastResult.framework !== 'none' && ` + ${lastResult.framework}`}
                        </div>
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(lastResult?.code || '')}
                          className={isFuturistic ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
                        >
                          {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                          {copied ? 'Copié' : 'Copier'}
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadCode(lastResult?.code || '', lastResult?.fileExtension || '.txt')}
                          className={isFuturistic ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <Tabs defaultValue="code" value={activeTab} onValueChange={setActiveTab}>
                    <div className="px-4 pt-2 pb-1">
                      <TabsList className={`w-full ${isFuturistic ? 'bg-gray-700' : ''}`}>
                        <TabsTrigger 
                          value="code" 
                          className={isFuturistic ? 'data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300' : ''}
                        >
                          <Code className="h-4 w-4 mr-1" />
                          Code
                        </TabsTrigger>
                        <TabsTrigger 
                          value="explanation" 
                          className={isFuturistic ? 'data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300' : ''}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Explication
                        </TabsTrigger>
                        <TabsTrigger 
                          value="structure" 
                          className={isFuturistic ? 'data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300' : ''}
                        >
                          <LayoutList className="h-4 w-4 mr-1" />
                          Structure
                        </TabsTrigger>
                        <TabsTrigger 
                          value="references" 
                          className={isFuturistic ? 'data-[state=active]:bg-gray-600 data-[state=active]:text-white text-gray-300' : ''}
                        >
                          <LinkIcon className="h-4 w-4 mr-1" />
                          Références
                        </TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="code" className="m-0">
                      <CardContent className={`p-0 overflow-hidden rounded-b-lg ${isFuturistic ? 'bg-gray-900' : 'bg-gray-50'}`}>
                        <pre className={`p-4 overflow-x-auto font-mono text-sm ${isFuturistic ? 'text-gray-300' : 'text-gray-800'}`}>
                          <code>
                            {lastResult?.code}
                          </code>
                        </pre>
                      </CardContent>
                    </TabsContent>
                    
                    <TabsContent value="explanation" className="m-0">
                      <CardContent className="pt-6">
                        <div className={`p-4 rounded-lg ${isFuturistic ? 'bg-gray-700 text-gray-300' : 'bg-blue-50 text-gray-700'}`}>
                          <h3 className={`text-lg font-medium mb-3 ${isFuturistic ? 'text-white' : 'text-blue-800'}`}>
                            Explication du code généré
                          </h3>
                          <p className="whitespace-pre-line">
                            {lastResult?.explanation}
                          </p>
                        </div>
                      </CardContent>
                    </TabsContent>
                    
                    <TabsContent value="structure" className="m-0">
                      <CardContent className="pt-6">
                        <div className={`p-4 rounded-lg ${isFuturistic ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                          <h3 className={`text-lg font-medium mb-3 ${isFuturistic ? 'text-white' : 'text-gray-800'}`}>
                            Structure de fichiers suggérée
                          </h3>
                          <div className="space-y-2 mt-4">
                            {lastResult?.suggestedFileStructure?.map((item, index) => (
                              <div key={index} className="flex items-start">
                                {item.type === 'directory' ? (
                                  <div className={`p-1 rounded mr-2 ${isFuturistic ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-800'}`}>
                                    <Folder className="h-4 w-4" />
                                  </div>
                                ) : (
                                  <div className={`p-1 rounded mr-2 ${isFuturistic ? 'bg-indigo-900/30 text-indigo-400' : 'bg-indigo-100 text-indigo-800'}`}>
                                    <FileCode2 className="h-4 w-4" />
                                  </div>
                                )}
                                <div>
                                  <p className={`${isFuturistic ? 'text-gray-300' : 'text-gray-800'} font-medium`}>
                                    {item.name}
                                  </p>
                                  {item.content && (
                                    <Drawer>
                                      <DrawerTrigger asChild>
                                        <Button 
                                          variant="link" 
                                          size="sm" 
                                          className={`p-0 h-auto mt-1 ${isFuturistic ? 'text-blue-400' : 'text-blue-600'}`}
                                        >
                                          Voir le contenu
                                        </Button>
                                      </DrawerTrigger>
                                      <DrawerContent className={isFuturistic ? 'bg-gray-800 border-gray-700' : ''}>
                                        <DrawerHeader>
                                          <DrawerTitle className={isFuturistic ? 'text-white' : ''}>
                                            {item.name}
                                          </DrawerTitle>
                                          <DrawerDescription className={isFuturistic ? 'text-gray-400' : ''}>
                                            Contenu du fichier généré
                                          </DrawerDescription>
                                        </DrawerHeader>
                                        <div className={`p-4 mx-4 rounded-lg overflow-auto max-h-[400px] ${isFuturistic ? 'bg-gray-900 text-gray-300' : 'bg-gray-50 text-gray-800'}`}>
                                          <pre className="font-mono text-sm whitespace-pre-wrap">
                                            <code>{item.content}</code>
                                          </pre>
                                        </div>
                                        <DrawerFooter>
                                          <DrawerClose asChild>
                                            <Button variant="outline" className={isFuturistic ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : ''}>
                                              Fermer
                                            </Button>
                                          </DrawerClose>
                                        </DrawerFooter>
                                      </DrawerContent>
                                    </Drawer>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </TabsContent>
                    
                    <TabsContent value="references" className="m-0">
                      <CardContent className="pt-6">
                        <div className={`p-4 rounded-lg ${isFuturistic ? 'bg-gray-700 text-gray-300' : 'bg-gray-50 text-gray-700'}`}>
                          <h3 className={`text-lg font-medium mb-3 ${isFuturistic ? 'text-white' : 'text-gray-800'}`}>
                            Ressources et références
                          </h3>
                          <div className="space-y-2 mt-4">
                            {lastResult?.references?.map((ref, index) => (
                              <a 
                                key={index} 
                                href={ref.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`flex items-center p-3 rounded-lg transition-colors ${
                                  isFuturistic 
                                    ? 'bg-gray-800 hover:bg-gray-700 text-blue-400 hover:text-blue-300' 
                                    : 'bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 border border-gray-200'
                                }`}
                              >
                                <LinkIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span>{ref.title}</span>
                              </a>
                            ))}
                            
                            {(!lastResult?.references || lastResult.references.length === 0) && (
                              <p className={`italic ${isFuturistic ? 'text-gray-400' : 'text-gray-500'}`}>
                                Aucune référence disponible pour ce code.
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </TabsContent>
                  </Tabs>
                </Card>
              )}
              
              {/* Historique des requêtes */}
              {history.length > 0 && (
                <Card className={`mt-4 ${isFuturistic ? 'bg-gray-800 border-gray-700' : ''}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className={isFuturistic ? 'text-white' : ''}>
                      <div className="flex items-center gap-2">
                        <Clock className={`h-5 w-5 ${isFuturistic ? 'text-gray-400' : 'text-gray-600'}`} />
                        Historique récent
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {history.map((item, index) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-md cursor-pointer ${
                            isFuturistic
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                          } transition-colors`}
                          onClick={() => setFormData(prev => ({ ...prev, prompt: item.prompt }))}
                        >
                          <div className="flex justify-between items-start">
                            <p className="text-sm truncate max-w-[80%]">{item.prompt}</p>
                            <span className={`text-xs ${isFuturistic ? 'text-gray-500' : 'text-gray-500'}`}>
                              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Icône de dossier pour la structure de fichiers
const Folder = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
  </svg>
);

// Icône d'horloge pour l'historique
const Clock = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);