import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Shield, 
  AlertTriangle
} from 'lucide-react';

// Version simplifiée du Centre de Crise Cyber (CyberOps Command Center)
export default function CyberCrisisCenter() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">CyberOps Command Center</h1>
            <p className="text-blue-300">
              Plateforme de gestion et de simulation de crise cybersécurité
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-red-600/20 border border-red-600/40 p-4 flex items-center">
            <AlertTriangle className="w-8 h-8 mr-3 text-red-500" />
            <div>
              <div className="text-sm text-red-300">Incidents Critiques</div>
              <div className="text-2xl font-bold">2</div>
            </div>
          </Card>
          
          <Card className="bg-orange-600/20 border border-orange-600/40 p-4 flex items-center">
            <AlertTriangle className="w-8 h-8 mr-3 text-orange-500" />
            <div>
              <div className="text-sm text-orange-300">Incidents Haute priorité</div>
              <div className="text-2xl font-bold">1</div>
            </div>
          </Card>
          
          <Card className="bg-blue-600/20 border border-blue-600/40 p-4 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-500" />
            <div>
              <div className="text-sm text-blue-300">Niveau de sécurité</div>
              <div className="text-2xl font-bold">73%</div>
            </div>
          </Card>
        </div>
        
        <div className="text-center py-8">
          <p className="text-xl mb-4">
            Module en cours de développement
          </p>
          <p className="mb-6">
            Cette version simplifiée du CyberOps Command Center est en cours d'implémentation.
            La version complète comprendra des incidents en temps réel, des interactions avec des experts, 
            et des outils de gestion de crise avancés.
          </p>
          <Button>Explorer les incidents</Button>
        </div>
      </div>
    </div>
  );
}