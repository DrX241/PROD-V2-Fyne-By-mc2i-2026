import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Shuffle, Rocket } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

interface GameModeSelectionProps {
  onSelectMode: (mode: "classic" | "tunnel") => void;
}

export default function GameModeSelection({ onSelectMode }: GameModeSelectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-6">
      <Card className="bg-gradient-to-br from-blue-950 to-indigo-900 text-white border-blue-800 hover:shadow-lg hover:border-blue-700 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Mode Classique</CardTitle>
            <div className="rounded-full bg-blue-700/50 p-2">
              <Shuffle className="h-5 w-5 text-blue-300" />
            </div>
          </div>
          <CardDescription className="text-blue-300">
            4 missions aléatoires indépendantes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm text-blue-200">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Scenarii variés sur différents domaines de la cybersécurité</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Défis techniques et analyse de situations</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Rapport de performance détaillé à la fin</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Sélection aléatoire parmi une large bibliothèque de cas</span>
            </li>
          </ul>
          
          <div className="rounded-lg bg-blue-900/50 p-3 border border-blue-700/30 text-xs">
            <p className="text-blue-300">Idéal pour explorer divers aspects de la cybersécurité et développer différentes compétences.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-transparent border-blue-500 text-blue-300 hover:bg-blue-800/50">
                <HelpCircle className="mr-2 h-4 w-4" />
                Détails
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-blue-950 to-indigo-900 text-white border-blue-800">
              <DialogHeader>
                <DialogTitle>Mode Classique</DialogTitle>
                <DialogDescription className="text-blue-300">
                  Explorez des défis variés de cybersécurité
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm text-blue-100">
                <h3 className="font-medium text-blue-200">Comment ça fonctionne :</h3>
                <p>Le mode classique vous propose 4 missions indépendantes, sélectionnées aléatoirement parmi les domaines suivants :</p>
                <ul className="space-y-2 pl-5 list-disc">
                  <li>Hameçonnage</li>
                  <li>Attaques DDoS</li>
                  <li>Injections SQL</li>
                  <li>Vulnérabilités XSS</li>
                  <li>Cryptographie</li>
                  <li>Sécurité réseau</li>
                  <li>Et bien d'autres...</li>
                </ul>
                <p>Chaque mission est conçue pour tester différentes compétences. Vous pourrez analyser du code, rechercher des indices cachés et résoudre des problèmes de sécurité.</p>
                <p>À la fin des 4 missions, vous recevrez un rapport détaillé sur vos performances et vos points d'amélioration.</p>
              </div>
              <DialogClose asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 mt-2">Compris</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={() => onSelectMode("classic")} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Shuffle className="mr-2 h-4 w-4" />
            Démarrer
          </Button>
        </CardFooter>
      </Card>
      
      <Card className="bg-gradient-to-br from-indigo-950 to-purple-900 text-white border-indigo-800 hover:shadow-lg hover:border-indigo-700 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Mode Tunnel</CardTitle>
            <div className="rounded-full bg-indigo-700/50 p-2">
              <Rocket className="h-5 w-5 text-indigo-300" />
            </div>
          </div>
          <CardDescription className="text-indigo-300">
            6 missions connectées et progressives
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-sm text-indigo-200">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Scénario évolutif où chaque décision impacte la suite</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Collaboration active avec des personnages virtuels</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Conséquences réelles des mauvais choix</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Histoire immersive et apprentissage profond</span>
            </li>
          </ul>
          
          <div className="rounded-lg bg-indigo-900/50 p-3 border border-indigo-700/30 text-xs">
            <p className="text-indigo-300">Pour une expérience plus immersive où vos décisions façonnent l'évolution d'un incident de cybersécurité.</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-transparent border-indigo-500 text-indigo-300 hover:bg-indigo-800/50">
                <HelpCircle className="mr-2 h-4 w-4" />
                Détails
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-to-br from-indigo-950 to-purple-900 text-white border-indigo-800">
              <DialogHeader>
                <DialogTitle>Mode Tunnel</DialogTitle>
                <DialogDescription className="text-indigo-300">
                  Une aventure interactive où chaque choix compte
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 text-sm text-indigo-100">
                <h3 className="font-medium text-indigo-200">Comment ça fonctionne :</h3>
                <p>Le mode tunnel vous propose une série de 6 missions connectées qui simulent la progression d'un incident de cybersécurité :</p>
                <ul className="space-y-2 pl-5 list-disc">
                  <li>Chaque décision influence le déroulement des missions suivantes</li>
                  <li>Les mauvais choix peuvent mener à l'échec de la mission</li>
                  <li>Vous devrez collaborer avec différents experts virtuels</li>
                  <li>Les défis deviennent progressivement plus complexes</li>
                </ul>
                <p className="text-amber-300 font-medium mt-2">Attention :</p>
                <p>Si vos décisions mènent à des conséquences graves, la mission peut être interrompue prématurément avec une notification d'échec. Vous devrez alors recommencer.</p>
                <p>Ce mode est conçu pour simuler la pression et les conséquences réelles des décisions en situation de crise.</p>
              </div>
              <DialogClose asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700 mt-2">Compris</Button>
              </DialogClose>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={() => onSelectMode("tunnel")} 
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Rocket className="mr-2 h-4 w-4" />
            Démarrer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}