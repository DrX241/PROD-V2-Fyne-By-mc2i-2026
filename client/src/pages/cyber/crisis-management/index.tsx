import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import CyberButton from '@/components/CyberButton';
import { ChevronRight, Shield, AlertTriangle, Users, Clock, Sparkles } from 'lucide-react';

export default function CrisisManagementPage() {
  return (
    <div className="container mx-auto py-8 px-4 lg:px-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-cyan-400 font-cyber mb-4">
          Gestion de Crise Cyber
        </h1>
        <p className="text-lg text-white opacity-90 max-w-2xl mx-auto">
          Simulez des scénarios de crise cybersécurité réalistes et apprenez à gérer efficacement les attaques dans des conditions de stress.
        </p>
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
        {/* CryptoLock */}
        <Card className="border-cyber bg-black/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/30 to-purple-900/30 z-0"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-cyber text-red-500">CryptoLock</CardTitle>
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <CardDescription className="text-white/80">
              Simulation immersive d'attaque par ransomware en temps réel
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-white/70" />
                <span className="text-white/80">6 tours de 5 minutes</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-white/70" />
                <span className="text-white/80">1 à 6 joueurs, rôles distincts</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-white/70" />
                <span className="text-white/80">IA dynamique générant des scénarios uniques</span>
              </div>
              <p className="text-white mt-4">
                Prenez des décisions critiques en équipe face à une attaque ransomware en cours. 
                Chaque rôle a ses responsabilités et informations privées.
              </p>
            </div>
          </CardContent>
          <CardFooter className="relative z-10 flex justify-end gap-3">
            <Link href="/cyber/crisis-management/cryptolock-reborn">
              <CyberButton variant="glowing" className="w-full md:w-auto">
                DÉMARRER LA SIMULATION <ChevronRight className="ml-2 h-4 w-4" />
              </CyberButton>
            </Link>
          </CardFooter>
        </Card>

        {/* CyberResponsePro */}
        <Card className="border-cyber bg-black/50 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 z-0"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-cyber text-blue-500">CyberResponsePro</CardTitle>
              <Shield className="h-6 w-6 text-blue-500" />
            </div>
            <CardDescription className="text-white/80">
              Gestion professionnelle d'incidents de sécurité
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-white/70" />
                <span className="text-white/80">Séances de 30 minutes</span>
              </div>
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-white/70" />
                <span className="text-white/80">Exercice individuel ou en équipe</span>
              </div>
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-white/70" />
                <span className="text-white/80">12 scénarios réalistes</span>
              </div>
              <p className="text-white mt-4">
                Appliquez les méthodologies professionnelles de réponse aux incidents.
                Documentation, évaluation des impacts, et stratégies de remédiation.
              </p>
            </div>
          </CardContent>
          <CardFooter className="relative z-10 flex justify-end gap-3">
            <Button variant="outline" className="w-full md:w-auto opacity-50" disabled>
              PROCHAINEMENT
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}