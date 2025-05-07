import React from 'react';
import { Link } from 'wouter';
import { ShieldAlert, Clock, Server, Database, UserCheck, Key, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

/**
 * Page simplifiée pour présenter le jeu Cyber Escape v2.0
 */
const CyberEscapeV2 = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4">
      <div className="max-w-6xl mx-auto">
        {/* En-tête du jeu */}
        <div className="text-center mb-8 py-10">
          <ShieldAlert className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-blue-400 mb-2">CYBER ESCAPE v2.0</h1>
          <p className="text-xl text-gray-400">Le Pare-feu est tombé</p>
          <div className="max-w-3xl mx-auto mt-6 text-gray-300">
            <p>
              En tant que RSSI nouvellement nommé, votre mission est de restaurer les défenses 
              de l'entreprise après une cyberattaque majeure. Relevez 10 défis techniques à travers 
              différentes salles pour sécuriser à nouveau le système.
            </p>
          </div>
        </div>
        
        {/* Caractéristiques du jeu */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-900 border-blue-900">
            <CardHeader>
              <Clock className="h-8 w-8 text-yellow-500 mb-2" />
              <CardTitle className="text-xl text-yellow-400">Course contre la montre</CardTitle>
              <CardDescription className="text-gray-400">
                15 minutes pour restaurer les systèmes de sécurité de l'entreprise.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>Le temps est compté! Chaque défi réussi vous accorde un bonus de temps précieux.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-blue-900">
            <CardHeader>
              <Server className="h-8 w-8 text-green-500 mb-2" />
              <CardTitle className="text-xl text-green-400">10 Niveaux progressifs</CardTitle>
              <CardDescription className="text-gray-400">
                Des défis variés de cybersécurité à travers différentes salles.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>De la détection de phishing à la configuration de pare-feu, mettez en pratique vos connaissances.</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-blue-900">
            <CardHeader>
              <Database className="h-8 w-8 text-purple-500 mb-2" />
              <CardTitle className="text-xl text-purple-400">Immersion réaliste</CardTitle>
              <CardDescription className="text-gray-400">
                Un environnement fidèle aux situations professionnelles.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-gray-300">
              <p>Inspiré de scénarios d'attaques réels, ce jeu vous prépare aux enjeux actuels de la cybersécurité.</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Aperçu des niveaux */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-blue-400 mb-4">Les salles à explorer</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Salle des Serveurs", icon: <Server />, status: "Disponible", desc: "Détection de phishing et accès initial" },
              { name: "Contrôle Réseau", icon: <Key />, status: "En développement", desc: "Configuration du pare-feu" },
              { name: "Centre de Données", icon: <Database />, status: "En développement", desc: "Chiffrement des données sensibles" },
              { name: "Bureau Exécutif", icon: <UserCheck />, status: "En développement", desc: "Authentification et droits d'accès" }
            ].map((room, index) => (
              <Card key={index} className={`bg-gray-900 border-gray-800 ${index === 0 ? 'border-green-700' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div className="text-gray-400">
                      {room.icon}
                    </div>
                    <Badge 
                      variant={index === 0 ? "default" : "secondary"} 
                      className={index === 0 ? "bg-green-900 hover:bg-green-900 text-green-300" : "bg-gray-800 text-gray-400"}
                    >
                      {room.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-md">
                    {room.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-gray-400">
                    {room.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Statut de développement */}
        <Card className="bg-gray-900/50 border-gray-800 mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-orange-400">
              Statut de développement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span className="text-green-300">Création des composants d'interface utilisateur</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
                <span className="text-green-300">Définition des structures de données</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-blue-300">Implémentation du Niveau 1 (Salle des Serveurs)</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-gray-500 mr-2"></div>
                <span className="text-gray-400">Implémentation des Niveaux 2-10</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full bg-gray-500 mr-2"></div>
                <span className="text-gray-400">Tests et équilibrage de la difficulté</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/cyber/arcade">
            <Button variant="outline">
              Retour à l'Arcade
            </Button>
          </Link>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled
          >
            <Eye className="mr-2 h-4 w-4" />
            Aperçu du Jeu (Bientôt disponible)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CyberEscapeV2;