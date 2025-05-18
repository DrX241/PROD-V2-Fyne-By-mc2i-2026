
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle,
  Clock,
  Users,
  BarChart
} from 'lucide-react';
import { useLocation } from 'wouter';

export default function CyberCrisisCenter() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Centre de Commandement CyberOps</h1>
            <p className="text-blue-300">
              Plateforme avancée de simulation et gestion de crises cybersécurité
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-red-600/20 border border-red-600/40 p-4 flex items-center hover:bg-red-600/30 transition-all">
            <AlertTriangle className="w-8 h-8 mr-3 text-red-500" />
            <div>
              <div className="text-sm text-red-300">Incidents Critiques</div>
              <div className="text-2xl font-bold">2</div>
            </div>
          </Card>
          
          <Card className="bg-orange-600/20 border border-orange-600/40 p-4 flex items-center hover:bg-orange-600/30 transition-all">
            <Clock className="w-8 h-8 mr-3 text-orange-500" />
            <div>
              <div className="text-sm text-orange-300">Temps de Réponse Moyen</div>
              <div className="text-2xl font-bold">45min</div>
            </div>
          </Card>
          
          <Card className="bg-blue-600/20 border border-blue-600/40 p-4 flex items-center hover:bg-blue-600/30 transition-all">
            <Shield className="w-8 h-8 mr-3 text-blue-500" />
            <div>
              <div className="text-sm text-blue-300">Niveau de Sécurité</div>
              <div className="text-2xl font-bold">73%</div>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-cyan-400" />
              Équipe de Crise
            </h2>
            <p className="text-slate-300 mb-4">
              Dirigez une équipe d'experts en cybersécurité et coordonnez la réponse aux incidents.
            </p>
            <ul className="space-y-2 text-slate-400 mb-4">
              <li>• Analystes SOC</li>
              <li>• Experts en forensique</li>
              <li>• Communicants de crise</li>
              <li>• Experts techniques</li>
            </ul>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <BarChart className="w-5 h-5 mr-2 text-cyan-400" />
              Objectifs de Mission
            </h2>
            <p className="text-slate-300 mb-4">
              Gérez efficacement les incidents tout en maintenant les opérations critiques.
            </p>
            <ul className="space-y-2 text-slate-400 mb-4">
              <li>• Réduire le niveau de menace</li>
              <li>• Protéger la réputation</li>
              <li>• Optimiser les ressources</li>
              <li>• Respecter les délais</li>
            </ul>
          </Card>
        </div>
        
        <div className="text-center">
          <Button 
            size="lg"
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-6"
            onClick={() => setLocation('/cyber/crisis-management/ciso-challenge')}
          >
            Lancer la Simulation CISO
          </Button>
          <p className="text-slate-400 mt-4">
            Mettez vos compétences à l'épreuve dans des scénarios de crise réalistes
          </p>
        </div>
      </div>
    </div>
  );
}
