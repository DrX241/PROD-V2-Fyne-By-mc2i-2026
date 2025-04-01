import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, Terminal, FileText, AlertTriangle, ArrowRight, Trophy } from 'lucide-react';
import { AvatarDisplay } from '@/components/cyber/AvatarCreator';
import ChatInterface from '@/components/cyber/ChatInterface';

interface AnalysisResult {
  id: string;
  type: 'success' | 'warning' | 'error';
  description: string;
  impact: string;
  recommendation?: string;
}

interface TechnicalMissionProps {
  title: string;
  description: string;
  contactName: string;
  contactRole: string;
  contactAvatar: string;
  badgeId?: string;
  badgeName?: string;
  domain: string;
  onComplete?: () => void;
}

export default function TechnicalMission({
  title,
  description,
  contactName,
  contactRole,
  contactAvatar,
  badgeId,
  badgeName,
  domain,
  onComplete
}: TechnicalMissionProps) {
  const [currentTab, setCurrentTab] = useState<'data' | 'analysis' | 'assistant' | 'report'>('data');
  const [userAnalysis, setUserAnalysis] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [badgeEarned, setBadgeEarned] = useState(false);
  const [showCompletePage, setShowCompletePage] = useState(false);
  
  // Exemple de données techniques pour une mission d'analyse de logs
  const [technicalData] = useState(`
192.168.1.254 - - [23/Apr/2025:20:30:45 +0100] "GET /admin HTTP/1.1" 301 185 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
192.168.1.254 - - [23/Apr/2025:20:30:46 +0100] "GET /admin/ HTTP/1.1" 200 7821 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
192.168.1.254 - - [23/Apr/2025:20:30:50 +0100] "POST /admin/login.php HTTP/1.1" 200 4526 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
192.168.1.254 - - [23/Apr/2025:20:30:52 +0100] "POST /admin/login.php HTTP/1.1" 200 4526 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
192.168.1.254 - - [23/Apr/2025:20:30:55 +0100] "POST /admin/login.php HTTP/1.1" 302 0 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
192.168.1.254 - - [23/Apr/2025:20:30:55 +0100] "GET /admin/dashboard.php HTTP/1.1" 200 18364 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
192.168.1.254 - - [23/Apr/2025:20:31:02 +0100] "GET /admin/users.php HTTP/1.1" 200 12783 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
192.168.1.254 - - [23/Apr/2025:20:31:15 +0100] "GET /admin/export.php?file=../../../etc/passwd HTTP/1.1" 200 2345 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
192.168.1.254 - - [23/Apr/2025:20:31:30 +0100] "GET /admin/export.php?file=../../../etc/shadow HTTP/1.1" 403 978 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
45.33.22.11 - - [23/Apr/2025:20:35:14 +0100] "POST /admin/upload.php HTTP/1.1" 200 321 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
45.33.22.11 - - [23/Apr/2025:20:35:16 +0100] "GET /uploads/shell.php HTTP/1.1" 200 0 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
45.33.22.11 - - [23/Apr/2025:20:35:20 +0100] "POST /uploads/shell.php HTTP/1.1" 200 1243 "-" "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)"
45.33.22.11 - - [23/Apr/2025:20:36:02 +0100] "POST /uploads/shell.php HTTP/1.1" 200 542 "-" "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)"
45.33.22.11 - - [23/Apr/2025:20:37:45 +0100] "POST /uploads/shell.php HTTP/1.1" 200 984 "-" "Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)"
192.168.1.1 - - [23/Apr/2025:23:14:22 +0100] "GET / HTTP/1.1" 200 6432 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
  `);

  // Résultats d'analyse attendus
  const [expectedResults] = useState<AnalysisResult[]>([
    {
      id: 'finding-1',
      type: 'warning',
      description: 'Tentatives multiples de connexion',
      impact: 'Indique potentiellement une attaque par force brute sur le portail d\'administration.',
      recommendation: 'Mettre en place une politique de verrouillage de compte et/ou un CAPTCHA après plusieurs tentatives échouées.'
    },
    {
      id: 'finding-2',
      type: 'error',
      description: 'Tentative d\'exploitation de traversée de répertoire (Path Traversal)',
      impact: 'Tentative d\'accès à des fichiers système sensibles via une vulnérabilité de type Directory Traversal.',
      recommendation: 'Valider et assainir tous les paramètres d\'entrée utilisateur, en particulier les paramètres de chemin de fichier.'
    },
    {
      id: 'finding-3',
      type: 'error',
      description: 'Upload et exécution de webshell',
      impact: 'Un attaquant a réussi à télécharger et exécuter un script malveillant (webshell) permettant l\'exécution de commandes arbitraires.',
      recommendation: 'Limiter les types de fichiers pouvant être téléchargés, valider le contenu des fichiers, et placer les téléchargements dans un répertoire non-exécutable.'
    },
    {
      id: 'finding-4',
      type: 'warning',
      description: 'Changement d\'agent utilisateur (User-Agent)',
      impact: 'L\'attaquant a changé son User-Agent lors de l\'interaction avec le webshell, ce qui peut indiquer une tentative de masquer ses activités.',
      recommendation: 'Surveiller les changements d\'User-Agent dans les sessions et mettre en place une journalisation complète.'
    }
  ]);

  const submitAnalysis = () => {
    setSubmitted(true);
    setCurrentTab('report');
    
    // Vérifier si l'analyse est suffisamment complète pour mériter le badge
    const wordsCount = userAnalysis.split(/\s+/).filter(word => word.length > 0).length;
    
    if (wordsCount >= 50) {
      setBadgeEarned(true);
    }
  };

  const handleComplete = () => {
    setShowCompletePage(true);
  };

  const renderDataTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Données à analyser</CardTitle>
        <CardDescription>
          Examinez attentivement ces logs de serveur web pour identifier d'éventuelles activités suspectes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] rounded-md border p-4">
          <pre className="font-mono text-xs whitespace-pre-wrap">{technicalData}</pre>
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <Button onClick={() => setCurrentTab('analysis')}>
          Analyser les données
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );

  const renderAnalysisTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Votre analyse</CardTitle>
        <CardDescription>
          Identifiez et décrivez les problèmes de sécurité que vous avez détectés dans les logs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea 
          placeholder="Décrivez ici les incidents de sécurité détectés, leur gravité, et proposez des mesures correctives..."
          className="h-[400px] font-mono"
          value={userAnalysis}
          onChange={(e) => setUserAnalysis(e.target.value)}
          disabled={submitted}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrentTab('data')}>
          Revoir les données
        </Button>
        <Button 
          onClick={submitAnalysis} 
          disabled={submitted || userAnalysis.trim().length < 20}
        >
          Soumettre l'analyse
        </Button>
      </CardFooter>
    </Card>
  );

  const renderAssistantTab = () => (
    <Card>
      <CardContent className="p-0">
        <ChatInterface 
          contactName={contactName}
          contactRole={contactRole}
          contactAvatar={contactAvatar}
          userAvatar="avatar1"
          userName="Agent"
          userRole="Analyste Cyber"
          initialMessage={`Je suis là pour vous aider dans l'analyse de ces logs. Comment puis-je vous guider sans vous donner directement les réponses ?`}
          height="h-[600px]"
        />
      </CardContent>
    </Card>
  );

  const renderReportTab = () => (
    <Card>
      <CardHeader>
        <CardTitle>Rapport d'analyse</CardTitle>
        <CardDescription>
          Voici les incidents de sécurité identifiés dans les logs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Votre analyse :</h3>
            <p className="whitespace-pre-wrap">{userAnalysis}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Éléments attendus dans l'analyse :</h3>
            <div className="space-y-3">
              {expectedResults.map((result) => (
                <Alert 
                  key={result.id}
                  variant={
                    result.type === 'error' ? 'destructive' : 
                    result.type === 'warning' ? 'default' : undefined
                  }
                  className={
                    result.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                    result.type === 'success' ? 'bg-green-50 border-green-200 text-green-900' :
                    undefined
                  }
                >
                  <AlertTriangle className={`h-4 w-4 ${
                    result.type === 'error' ? 'text-red-600' : 
                    result.type === 'warning' ? 'text-amber-600' : 
                    'text-green-600'
                  }`} />
                  <div>
                    <AlertDescription className="font-medium">
                      {result.description}
                    </AlertDescription>
                    <AlertDescription className="text-sm mt-1">
                      <span className="font-medium">Impact : </span>
                      {result.impact}
                    </AlertDescription>
                    {result.recommendation && (
                      <AlertDescription className="text-sm mt-1">
                        <span className="font-medium">Recommandation : </span>
                        {result.recommendation}
                      </AlertDescription>
                    )}
                  </div>
                </Alert>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleComplete}>
          Terminer la mission
        </Button>
      </CardFooter>
    </Card>
  );

  if (showCompletePage) {
    return (
      <div className="container py-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">Mission accomplie !</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Félicitations !</h3>
              <p className="mb-4">
                Vous avez complété la mission technique "{title}".
                {badgeEarned && badgeId && (
                  <span> Vous avez gagné le badge <strong>{badgeName || badgeId}</strong> !</span>
                )}
              </p>
              
              {badgeEarned && badgeId && (
                <Badge className="mx-auto" variant="outline">
                  <Trophy className="h-3 w-3 mr-1" /> {badgeName || badgeId}
                </Badge>
              )}
            </div>
            
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AvatarDisplay avatarId={contactAvatar} size="lg" />
                <div>
                  <p className="font-medium">{contactName}</p>
                  <p className="text-sm text-muted-foreground">{contactRole}</p>
                  <p className="mt-2">
                    "Excellent travail d'analyse ! Vous avez démontré votre capacité à identifier des indicateurs de compromission dans les logs et à proposer des mesures de sécurité pertinentes. Ce type de compétence est crucial pour la détection et la réponse aux incidents de sécurité."
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={onComplete}>Retour aux missions</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Badge variant="outline" className="bg-destructive/10">
          <Terminal className="h-4 w-4 mr-1" />
          Mission Technique
        </Badge>
      </div>
      
      <Tabs defaultValue="data" value={currentTab} onValueChange={(value) => setCurrentTab(value as any)}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="data" disabled={submitted}>
            <FileText className="h-4 w-4 mr-2" />
            Données
          </TabsTrigger>
          <TabsTrigger value="analysis" disabled={submitted}>
            <Terminal className="h-4 w-4 mr-2" />
            Analyse
          </TabsTrigger>
          <TabsTrigger value="assistant">
            <AvatarDisplay avatarId={contactAvatar} size="sm" className="mr-2" />
            Assistant
          </TabsTrigger>
          <TabsTrigger value="report" disabled={!submitted}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Rapport
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          <TabsContent value="data">
            {renderDataTab()}
          </TabsContent>
          
          <TabsContent value="analysis">
            {renderAnalysisTab()}
          </TabsContent>
          
          <TabsContent value="assistant" className="p-0">
            {renderAssistantTab()}
          </TabsContent>
          
          <TabsContent value="report">
            {renderReportTab()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}