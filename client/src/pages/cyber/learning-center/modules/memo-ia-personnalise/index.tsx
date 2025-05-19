import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  ArrowLeft,
  Download,
  Copy,
  Check,
  FileText,
  BrainCircuit,
  BookOpen,
  FileDown,
  Sparkles,
  Send,
  Info,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import PageTitle from '@/components/utils/PageTitle';
import { useToast } from '@/hooks/use-toast';

export default function MemoIAPersonnalise() {
  // États
  const [subject, setSubject] = useState('');
  const [complexity, setComplexity] = useState('intermediaire');
  const [format, setFormat] = useState('resume');
  const [specificPoints, setSpecificPoints] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMemo, setGeneratedMemo] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('creation');
  const [savedMemos, setSavedMemos] = useState<{title: string, content: string, date: string}[]>([
    {
      title: 'Zero Trust',
      content: `# Mémo: Principes du Zero Trust

## Définition
Le Zero Trust est un modèle de sécurité basé sur le principe "ne jamais faire confiance, toujours vérifier". Il part du principe que les menaces existent à la fois à l'intérieur et à l'extérieur du réseau.

## Principes fondamentaux
1. **Vérification explicite** - Authentifier et autoriser toutes les demandes d'accès
2. **Moindre privilège** - Limiter l'accès au strict nécessaire
3. **Micro-segmentation** - Diviser le réseau en zones isolées
4. **Vérification continue** - Réévaluer régulièrement la confiance
5. **Accès basé sur l'identité** plutôt que sur l'emplacement réseau

## Technologies clés
- IAM avec authentification multifacteur
- Solutions d'accès réseau Zero Trust (ZTNA)
- Micro-segmentation
- Chiffrement des données
- Surveillance et analytique avancées

## Avantages
- Limitation du mouvement latéral des attaquants
- Protection adaptée au cloud et mobilité
- Sécurité cohérente pour le travail à distance
- Réduction de la surface d'attaque`,
      date: '12/05/2025'
    },
    {
      title: 'Principes RGPD',
      content: `# Mémo: Principes clés du RGPD

## Les 7 principes fondamentaux
1. **Licéité, loyauté et transparence** - Traitement légal, équitable et transparent
2. **Limitation des finalités** - Collecte pour des objectifs spécifiques et légitimes
3. **Minimisation des données** - Uniquement les données nécessaires
4. **Exactitude** - Données exactes et mises à jour
5. **Limitation de conservation** - Stockage limité dans le temps
6. **Intégrité et confidentialité** - Sécurité appropriée
7. **Responsabilité** - Capacité à démontrer la conformité

## Droits des personnes concernées
- Droit d'accès
- Droit de rectification
- Droit à l'effacement ("droit à l'oubli")
- Droit à la limitation du traitement
- Droit à la portabilité
- Droit d'opposition
- Droits relatifs à la décision automatisée

## Obligations des organisations
- Désigner un DPO (dans certains cas)
- Tenir un registre des traitements
- Notifier les violations de données
- Mener des analyses d'impact (AIPD)
- Intégrer la protection des données dès la conception

## Sanctions
- Jusqu'à 20M€ ou 4% du CA mondial annuel`,
      date: '08/05/2025'
    }
  ]);
  
  const { toast } = useToast();
  
  // Exemples de sujets pour inspiration
  const subjectExamples = [
    "Authentification multifacteur (MFA)",
    "Ransomware",
    "Sécurité du cloud",
    "SIEM (Security Information and Event Management)",
    "Analyse des risques cybersécurité",
    "DevSecOps",
    "Gestion des vulnérabilités",
    "Social engineering"
  ];
  
  // Simuler la génération d'un mémo avec l'IA
  const generateMemo = () => {
    if (!subject.trim()) {
      toast({
        title: "Sujet requis",
        description: "Veuillez saisir un sujet pour générer un mémo.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    setGeneratedMemo(null);
    
    // Simuler un délai d'appel API (à remplacer par un appel réel à OpenAI)
    setTimeout(() => {
      const memoContent = generateSampleMemo(subject, complexity, format, specificPoints);
      setGeneratedMemo(memoContent);
      setIsGenerating(false);
      
      // Passer automatiquement à l'onglet du mémo généré
      setActiveTab('resultat');
      
      toast({
        title: "Mémo généré avec succès !",
        description: "Votre mémo personnalisé est prêt.",
        variant: "default",
      });
    }, 3000);
  };
  
  // Fonction pour générer un exemple de mémo (à remplacer par l'appel réel à l'API OpenAI)
  const generateSampleMemo = (
    subject: string,
    complexity: string,
    format: string,
    specificPoints: string
  ) => {
    // Ici, on simule une réponse d'IA avec un contenu statique
    // Dans une implémentation réelle, ce serait remplacé par un appel à l'API OpenAI
    
    const intro = `# Mémo: ${subject}\n\n`;
    
    let content = "";
    
    // Adapter le contenu en fonction du niveau de complexité
    if (complexity === 'debutant') {
      content += `## Concepts de base\n`;
      content += `${subject} est un domaine important de la cybersécurité qui concerne la protection des systèmes et des données contre les menaces. Il s'agit d'une approche fondamentale pour maintenir la confidentialité, l'intégrité et la disponibilité des informations.\n\n`;
      content += `## Points essentiels à retenir\n`;
      content += `- La sensibilisation des utilisateurs est cruciale\n`;
      content += `- Une approche multicouche est recommandée\n`;
      content += `- Les mises à jour régulières sont importantes\n`;
      content += `- La sauvegarde des données est une pratique indispensable\n\n`;
    } else if (complexity === 'intermediaire') {
      content += `## Définition et contexte\n`;
      content += `${subject} représente un ensemble de techniques et pratiques visant à protéger les systèmes d'information contre les accès non autorisés et les attaques. Cette approche s'inscrit dans une stratégie globale de défense en profondeur et nécessite une compréhension des vecteurs de menaces courants.\n\n`;
      content += `## Principes fondamentaux\n`;
      content += `1. **Défense en profondeur** - Multiple couches de sécurité\n`;
      content += `2. **Moindre privilège** - Accès limité au strict nécessaire\n`;
      content += `3. **Segmentation** - Isolation des composants critiques\n`;
      content += `4. **Surveillance continue** - Détection précoce des incidents\n\n`;
      content += `## Bonnes pratiques\n`;
      content += `- Mise en œuvre d'une politique de sécurité documentée\n`;
      content += `- Formation régulière du personnel\n`;
      content += `- Évaluations périodiques des risques\n`;
      content += `- Plan de réponse aux incidents testé régulièrement\n\n`;
    } else { // avancé
      content += `## Analyse approfondie\n`;
      content += `${subject} constitue un domaine complexe de la cybersécurité qui nécessite une approche holistique intégrant des contrôles techniques, des processus organisationnels et des considérations liées au facteur humain. Les organisations doivent adopter une posture de sécurité adaptative face à l'évolution constante du paysage des menaces.\n\n`;
      content += `## Cadre méthodologique\n`;
      content += `1. **Évaluation des risques** - Identification systématique des menaces et vulnérabilités avec quantification des impacts potentiels\n`;
      content += `2. **Conception de l'architecture** - Élaboration d'une infrastructure résiliente intégrant des mécanismes de défense spécialisés\n`;
      content += `3. **Implémentation des contrôles** - Déploiement coordonné de mesures techniques et organisationnelles\n`;
      content += `4. **Surveillance et détection** - Mise en place de capacités avancées d'analyse comportementale et de corrélation d'événements\n`;
      content += `5. **Réponse et remédiation** - Protocoles d'intervention rapide et procédures de restauration sécurisée\n\n`;
      content += `## Considérations techniques avancées\n`;
      content += `- Orchestration et automatisation des contrôles de sécurité\n`;
      content += `- Intégration de capacités d'intelligence artificielle pour la détection d'anomalies\n`;
      content += `- Approche Zero Trust avec vérification explicite à chaque point d'accès\n`;
      content += `- Gestion cryptographique avancée des données sensibles\n\n`;
    }
    
    // Adapter le format
    if (format === 'resume') {
      // Le format est déjà adapté
    } else if (format === 'ficheRecap') {
      content += `## À retenir\n`;
      content += `✅ Points clés à mémoriser\n`;
      content += `✅ Concepts fondamentaux\n`;
      content += `✅ Références importantes\n\n`;
      content += `## Pour aller plus loin\n`;
      content += `- Ressources recommandées\n`;
      content += `- Outils et frameworks associés\n`;
      content += `- Standards et bonnes pratiques\n\n`;
    } else if (format === 'mindmap') {
      content += `## Structure en carte mentale\n\n`;
      content += `${subject}\n`;
      content += `├── Définition\n`;
      content += `│   ├── Concepts clés\n`;
      content += `│   └── Objectifs principaux\n`;
      content += `├── Composants\n`;
      content += `│   ├── Élément 1\n`;
      content += `│   ├── Élément 2\n`;
      content += `│   └── Élément 3\n`;
      content += `└── Applications\n`;
      content += `    ├── Cas d'usage 1\n`;
      content += `    ├── Cas d'usage 2\n`;
      content += `    └── Bonnes pratiques\n\n`;
    }
    
    // Ajouter les points spécifiques si demandés
    if (specificPoints.trim()) {
      content += `## Points spécifiques\n`;
      const points = specificPoints.split('\n').filter(p => p.trim());
      points.forEach((point, index) => {
        content += `${index + 1}. ${point.trim()}\n`;
      });
    }
    
    return intro + content;
  };
  
  // Copier le mémo dans le presse-papier
  const copyToClipboard = () => {
    if (!generatedMemo) return;
    
    navigator.clipboard.writeText(generatedMemo).then(
      () => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
        
        toast({
          title: "Copié !",
          description: "Le mémo a été copié dans le presse-papier.",
          variant: "default",
        });
      },
      (err) => {
        toast({
          title: "Erreur",
          description: "Impossible de copier le texte: " + err,
          variant: "destructive",
        });
      }
    );
  };
  
  // Sauvegarder le mémo
  const saveMemo = () => {
    if (!generatedMemo) return;
    
    const newMemo = {
      title: subject,
      content: generatedMemo,
      date: new Date().toLocaleDateString('fr-FR')
    };
    
    setSavedMemos([newMemo, ...savedMemos]);
    
    toast({
      title: "Mémo sauvegardé",
      description: "Votre mémo a été ajouté à votre bibliothèque.",
      variant: "default",
    });
  };
  
  // Télécharger le mémo en format markdown
  const downloadMemo = () => {
    if (!generatedMemo) return;
    
    const blob = new Blob([generatedMemo], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memo-${subject.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Téléchargement démarré",
      description: "Votre mémo est en cours de téléchargement.",
      variant: "default",
    });
  };
  
  // Rendu du formulaire de création
  const renderCreationForm = () => (
    <div className="space-y-6">
      <Card className="bg-blue-950/60 border-blue-800/60">
        <CardHeader>
          <CardTitle>Créer un mémo personnalisé</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-1" htmlFor="subject">
              Sujet du mémo *
            </label>
            <Input
              id="subject"
              placeholder="Ex: Authentification multifacteur (MFA)"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="bg-blue-900/30 border-blue-700/50 text-white placeholder:text-blue-400/60"
            />
            <div className="mt-2">
              <p className="text-xs text-blue-400 mb-1">Suggestions de sujets :</p>
              <div className="flex flex-wrap gap-2">
                {subjectExamples.map((example) => (
                  <Badge
                    key={example}
                    className="bg-blue-900/50 hover:bg-blue-800/70 text-blue-200 cursor-pointer"
                    onClick={() => setSubject(example)}
                  >
                    {example}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-1">
              Niveau de complexité
            </label>
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="debutant"
                  name="complexity"
                  value="debutant"
                  checked={complexity === 'debutant'}
                  onChange={() => setComplexity('debutant')}
                  className="mr-2"
                />
                <label htmlFor="debutant" className="text-sm text-blue-200">Débutant</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="intermediaire"
                  name="complexity"
                  value="intermediaire"
                  checked={complexity === 'intermediaire'}
                  onChange={() => setComplexity('intermediaire')}
                  className="mr-2"
                />
                <label htmlFor="intermediaire" className="text-sm text-blue-200">Intermédiaire</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="avance"
                  name="complexity"
                  value="avance"
                  checked={complexity === 'avance'}
                  onChange={() => setComplexity('avance')}
                  className="mr-2"
                />
                <label htmlFor="avance" className="text-sm text-blue-200">Avancé</label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-1">
              Format du mémo
            </label>
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="resume"
                  name="format"
                  value="resume"
                  checked={format === 'resume'}
                  onChange={() => setFormat('resume')}
                  className="mr-2"
                />
                <label htmlFor="resume" className="text-sm text-blue-200">Résumé structuré</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="ficheRecap"
                  name="format"
                  value="ficheRecap"
                  checked={format === 'ficheRecap'}
                  onChange={() => setFormat('ficheRecap')}
                  className="mr-2"
                />
                <label htmlFor="ficheRecap" className="text-sm text-blue-200">Fiche récapitulative</label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="mindmap"
                  name="format"
                  value="mindmap"
                  checked={format === 'mindmap'}
                  onChange={() => setFormat('mindmap')}
                  className="mr-2"
                />
                <label htmlFor="mindmap" className="text-sm text-blue-200">Carte mentale</label>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-blue-100 mb-1" htmlFor="specificPoints">
              Points spécifiques à inclure (optionnel)
            </label>
            <Textarea
              id="specificPoints"
              placeholder="Entrez chaque point sur une nouvelle ligne..."
              value={specificPoints}
              onChange={(e) => setSpecificPoints(e.target.value)}
              className="min-h-[100px] bg-blue-900/30 border-blue-700/50 text-white placeholder:text-blue-400/60"
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={generateMemo}
            disabled={isGenerating || !subject.trim()}
          >
            {isGenerating ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full mr-2" />
                Génération en cours...
              </>
            ) : (
              <>
                <BrainCircuit className="mr-2 h-4 w-4" />
                Générer mon mémo personnalisé
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Alert className="bg-blue-900/20 border-blue-600/30">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertTitle>Comment ça fonctionne ?</AlertTitle>
        <AlertDescription className="text-blue-300">
          Notre IA analyse votre sujet et crée un mémo personnalisé adapté à vos besoins spécifiques. Les mémos sont générés pour vous aider à comprendre et mémoriser les concepts clés de cybersécurité.
        </AlertDescription>
      </Alert>
    </div>
  );
  
  // Rendu du mémo généré
  const renderGeneratedMemo = () => (
    <div className="space-y-6">
      {generatedMemo ? (
        <>
          <Card className="bg-blue-950/60 border-blue-800/60">
            <CardHeader className="pb-3 flex flex-row items-start justify-between">
              <CardTitle>Mémo : {subject}</CardTitle>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-blue-600/50 text-blue-300 hover:bg-blue-900/50"
                  onClick={copyToClipboard}
                >
                  {copySuccess ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="ml-1 hidden sm:inline">{copySuccess ? 'Copié !' : 'Copier'}</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-blue-600/50 text-blue-300 hover:bg-blue-900/50"
                  onClick={downloadMemo}
                >
                  <FileDown className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">Télécharger</span>
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-blue-600/50 text-blue-300 hover:bg-blue-900/50"
                  onClick={saveMemo}
                >
                  <FileText className="h-4 w-4" />
                  <span className="ml-1 hidden sm:inline">Sauvegarder</span>
                </Button>
              </div>
            </CardHeader>
            <Separator className="bg-blue-800/60" />
            <CardContent className="pt-4">
              <ScrollArea className="h-[500px] pr-4">
                <div className="prose prose-invert max-w-none">
                  {generatedMemo.split('\n').map((line, index) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={index} className="text-2xl font-bold text-white mt-0 mb-4">{line.substring(2)}</h1>;
                    } else if (line.startsWith('## ')) {
                      return <h2 key={index} className="text-xl font-semibold text-blue-100 mt-6 mb-3">{line.substring(3)}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={index} className="text-lg font-medium text-blue-200 mt-4 mb-2">{line.substring(4)}</h3>;
                    } else if (line.startsWith('- ')) {
                      return <li key={index} className="text-blue-300 ml-5 mb-1">{line.substring(2)}</li>;
                    } else if (line.startsWith('1. ') || line.startsWith('2. ') || line.startsWith('3. ') || line.startsWith('4. ') || line.startsWith('5. ')) {
                      return <li key={index} className="text-blue-300 ml-5 mb-1">{line.substring(3)}</li>;
                    } else if (line.includes('**')) {
                      return <p key={index} className="text-blue-200 mb-2" 
                        dangerouslySetInnerHTML={{ 
                          __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        }} />;
                    } else if (line.trim() === '') {
                      return <div key={index} className="h-2"></div>;
                    } else if (line.startsWith('├──') || line.startsWith('│') || line.startsWith('└──')) {
                      return <div key={index} className="text-blue-300 font-mono whitespace-pre mb-0 leading-tight">{line}</div>;
                    } else {
                      return <p key={index} className="text-blue-200 mb-2">{line}</p>;
                    }
                  })}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-center pt-2">
              <Button
                variant="outline"
                className="border-blue-600/50 text-blue-300 hover:bg-blue-900/50"
                onClick={() => setActiveTab('creation')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à la création
              </Button>
            </CardFooter>
          </Card>
        </>
      ) : (
        <div className="bg-blue-900/30 rounded-lg p-8 text-center flex flex-col items-center">
          <BookOpen className="h-12 w-12 text-blue-500 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Aucun mémo généré</h3>
          <p className="text-blue-300 mb-4">
            Vous n'avez pas encore généré de mémo. Retournez à l'onglet "Création" pour commencer.
          </p>
          <Button
            variant="outline"
            className="border-blue-500 text-blue-400 hover:bg-blue-900/20"
            onClick={() => setActiveTab('creation')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à la création
          </Button>
        </div>
      )}
    </div>
  );
  
  // Rendu de la bibliothèque de mémos
  const renderMemoLibrary = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-white">Mes mémos sauvegardés</h2>
      </div>
      
      {savedMemos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedMemos.map((memo, index) => (
            <Card key={index} className="bg-blue-950/60 border-blue-800/60 hover:bg-blue-900/40 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{memo.title}</CardTitle>
                  <Badge className="bg-blue-700/40 text-xs">{memo.date}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <ScrollArea className="h-[120px]">
                  <div className="prose prose-invert max-w-none text-sm text-blue-300">
                    {memo.content.split('\n').slice(0, 10).map((line, idx) => {
                      if (line.startsWith('# ')) {
                        return null; // Skip the title that's already shown
                      } else if (line.startsWith('## ')) {
                        return <p key={idx} className="text-blue-200 font-medium">{line.substring(3)}</p>;
                      } else if (line.trim() === '') {
                        return null;
                      } else {
                        return <p key={idx} className="text-blue-300 text-sm truncate">{line}</p>;
                      }
                    })}
                    {memo.content.split('\n').length > 10 && (
                      <p className="text-blue-400 text-xs italic">(...suite du document)</p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="pt-0 flex justify-end">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                  onClick={() => {
                    setGeneratedMemo(memo.content);
                    setSubject(memo.title);
                    setActiveTab('resultat');
                  }}
                >
                  Ouvrir
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-blue-900/30 rounded-lg p-8 text-center">
          <FileText className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Aucun mémo sauvegardé</h3>
          <p className="text-blue-300 mb-4">
            Vous n'avez pas encore sauvegardé de mémos. Générez un mémo et sauvegardez-le pour le retrouver ici.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a1429]">
      <PageTitle title="Mémo IA personnalisé | Centre de formation" />
      
      {/* En-tête */}
      <header className="border-b border-blue-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-blue-300 hover:bg-blue-900/30 hover:text-blue-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour au centre de formation
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Mémo IA personnalisé</h1>
        </div>
      </header>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Introduction */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Mémo IA personnalisé</h1>
          <p className="text-blue-300 max-w-3xl">
            Créez des aide-mémoires sur mesure pour consolider vos connaissances en cybersécurité. Notre IA génère des mémos adaptés à votre niveau et vos besoins spécifiques.
          </p>
        </div>
        
        {/* Navigation par onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-blue-950/70 border border-blue-800/60">
            <TabsTrigger value="creation" className="data-[state=active]:bg-blue-700">
              <Sparkles className="h-4 w-4 mr-2" />
              Création
            </TabsTrigger>
            <TabsTrigger value="resultat" className="data-[state=active]:bg-blue-700">
              <FileText className="h-4 w-4 mr-2" />
              Mémo généré
            </TabsTrigger>
            <TabsTrigger value="bibliotheque" className="data-[state=active]:bg-blue-700">
              <BookOpen className="h-4 w-4 mr-2" />
              Ma bibliothèque
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="creation">
            {renderCreationForm()}
          </TabsContent>
          
          <TabsContent value="resultat">
            {renderGeneratedMemo()}
          </TabsContent>
          
          <TabsContent value="bibliotheque">
            {renderMemoLibrary()}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}