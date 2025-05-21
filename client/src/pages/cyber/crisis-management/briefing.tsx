import React, { useState } from 'react';
import { Link } from 'wouter';
import HomeLayout from '@/components/layout/HomeLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, ArrowRight, FileText, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CrisisBriefingPage() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const previousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <HomeLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white py-12 px-4 relative overflow-hidden">
        {/* Éléments de design en arrière-plan */}
        <div className="absolute inset-0 overflow-hidden z-0">
          <div className="opacity-5">
            <div className="absolute top-20 right-20 w-48 h-48 rounded-full bg-red-500 blur-3xl"></div>
            <div className="absolute bottom-20 left-20 w-72 h-72 rounded-full bg-blue-500 blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-500 blur-3xl opacity-20"></div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-red-500 via-red-400 to-amber-500">
              BRIEFING: ALERTE CRITIQUE
            </h1>
            <p className="text-xl text-gray-300 mt-2">
              Préparez-vous à faire face à une crise de cybersécurité majeure
            </p>
          </div>

          <div className="w-full bg-gray-800 rounded-lg h-1.5 mb-10">
            <div
              className="bg-gradient-to-r from-red-500 to-amber-500 h-1.5 rounded-lg transition-all duration-300 ease-in-out"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            ></div>
          </div>

          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {step === 1 && (
              <Card className="bg-gray-900 border-gray-800 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-500">
                    <AlertCircle className="mr-2" /> Situation d'urgence
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    03/04/2025 - 08:15
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-lg mb-4">
                    En tant que <span className="font-bold text-blue-400">Responsable de la Sécurité des Systèmes d'Information (RSSI)</span> chez mc2i, vous êtes alerté d'une situation critique. 
                  </p>
                  <div className="bg-gray-800 p-4 rounded-md border-l-4 border-red-500 mb-4">
                    <p className="italic">
                      "Notre infrastructure IT vient d'être touchée par une cyberattaque. Plusieurs serveurs affichent un message de rançon et les systèmes critiques sont inaccessibles. La Direction Générale vous demande d'intervenir immédiatement."
                    </p>
                  </div>
                  <p>
                    Vous devez prendre les commandes et coordonner la réponse à cet incident majeur qui menace l'activité de l'entreprise. Le temps est compté et vos décisions auront un impact direct sur:
                  </p>
                  <ul className="list-disc ml-6 mt-3 space-y-2">
                    <li>La continuité des activités de l'entreprise</li>
                    <li>La protection des données sensibles</li>
                    <li>La réputation de mc2i auprès de ses clients et partenaires</li>
                    <li>Les conséquences financières et juridiques</li>
                  </ul>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={nextStep} className="bg-red-700 hover:bg-red-600">
                    Prendre connaissance des détails <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === 2 && (
              <Card className="bg-gray-900 border-gray-800 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-amber-500">
                    <FileText className="mr-2" /> Analyse préliminaire
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Rapport initial de l'équipe technique
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    Les premières observations indiquent une attaque par <span className="font-bold text-red-400">ransomware</span> sophistiquée qui a:
                  </p>
                  <ul className="list-disc ml-6 space-y-2 mb-4">
                    <li>Chiffré plusieurs serveurs critiques dont les bases de données clients</li>
                    <li>Compromis potentiellement les postes de travail de la comptabilité</li>
                    <li>Causé des pannes sur les systèmes de partage documentaire</li>
                    <li>Laissé une demande de rançon de 500,000€ en cryptomonnaie</li>
                  </ul>
                  
                  <div className="bg-gray-800 p-4 rounded-md border-l-4 border-amber-500 mb-4">
                    <p className="font-semibold mb-2">Systèmes touchés:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span>Serveurs de base de données</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                        <span>Partage de fichiers</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                        <span>Serveurs d'applications</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                        <span>Serveurs email</span>
                      </div>
                    </div>
                  </div>
                  
                  <p>
                    Les équipes techniques ont déjà initié les protocoles d'urgence pour isoler les systèmes contaminés, mais ont besoin de votre coordination et de vos décisions stratégiques pour la suite des opérations.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={previousStep} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    Retour
                  </Button>
                  <Button onClick={nextStep} className="bg-red-700 hover:bg-red-600">
                    Examiner les parties prenantes <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === 3 && (
              <Card className="bg-gray-900 border-gray-800 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-500">
                    <Users className="mr-2" /> Parties prenantes clés
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Les personnes avec qui vous devrez interagir
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    En tant que RSSI, vous allez devoir coordonner votre action avec plusieurs dirigeants et équipes de mc2i. Chacun a ses propres priorités et inquiétudes:
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-800 p-4 rounded-md">
                      <h3 className="font-semibold text-blue-400 mb-1">Vincent Terrier</h3>
                      <p className="text-sm text-gray-300 mb-2">Directeur Général</p>
                      <p className="text-sm">Préoccupé par l'impact sur l'activité et la réputation de mc2i. Attend des informations claires et des solutions rapides.</p>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-md">
                      <h3 className="font-semibold text-amber-400 mb-1">Marion Lopez</h3>
                      <p className="text-sm text-gray-300 mb-2">Directrice Communication</p>
                      <p className="text-sm">Doit gérer la communication interne et externe. Besoin de savoir quoi dire aux clients et partenaires.</p>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-md">
                      <h3 className="font-semibold text-green-400 mb-1">Thomas Durand</h3>
                      <p className="text-sm text-gray-300 mb-2">Directeur Technique</p>
                      <p className="text-sm">En première ligne pour la partie technique. A besoin de vos directives pour coordonner ses équipes.</p>
                    </div>
                    
                    <div className="bg-gray-800 p-4 rounded-md">
                      <h3 className="font-semibold text-purple-400 mb-1">Sophie Legrand</h3>
                      <p className="text-sm text-gray-300 mb-2">Directrice Juridique</p>
                      <p className="text-sm">Préoccupée par les aspects légaux et réglementaires, notamment les obligations RGPD en cas de fuite de données.</p>
                    </div>
                  </div>
                  
                  <p className="text-sm bg-gray-800 p-3 rounded-md border-l-4 border-blue-500">
                    <span className="font-bold">Note importante:</span> La façon dont vous communiquerez avec chaque partie prenante aura un impact sur leur niveau de stress et leur confiance en vous. Certains auront besoin d'être rassurés, d'autres de recevoir des informations techniques précises.
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={previousStep} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    Retour
                  </Button>
                  <Button onClick={nextStep} className="bg-red-700 hover:bg-red-600">
                    Comprendre votre rôle <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            )}

            {step === 4 && (
              <Card className="bg-gray-900 border-gray-800 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-500">
                    <Shield className="mr-2" /> Votre mission de RSSI
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Vos objectifs et responsabilités
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">
                    En tant que RSSI chez mc2i, vous êtes le pilote principal de cette gestion de crise. Votre mission est de:
                  </p>
                  
                  <ul className="list-disc ml-6 space-y-3 mb-6">
                    <li>
                      <span className="font-bold text-green-400">Coordonner la réponse à l'incident</span>
                      <p className="text-sm text-gray-300 ml-6">Diriger et synchroniser les actions des différentes équipes impliquées dans la résolution de la crise.</p>
                    </li>
                    <li>
                      <span className="font-bold text-green-400">Prendre des décisions stratégiques</span>
                      <p className="text-sm text-gray-300 ml-6">Déterminer les actions prioritaires, affecter les ressources et décider des compromis nécessaires.</p>
                    </li>
                    <li>
                      <span className="font-bold text-green-400">Communiquer efficacement</span>
                      <p className="text-sm text-gray-300 ml-6">Maintenir toutes les parties prenantes informées avec le niveau de détail approprié à leur rôle.</p>
                    </li>
                    <li>
                      <span className="font-bold text-green-400">Minimiser l'impact global</span>
                      <p className="text-sm text-gray-300 ml-6">Réduire les conséquences négatives sur l'activité, la réputation et la situation financière de mc2i.</p>
                    </li>
                  </ul>
                  
                  <div className="bg-red-900/30 p-4 rounded-md border border-red-700 mb-6">
                    <p className="font-semibold text-red-400 mb-2">Attention :</p>
                    <p className="text-sm">
                      Cette simulation reflète une situation de crise réaliste. Chaque décision que vous prendrez aura des conséquences, parfois inattendues. Il n'y a pas de solution parfaite - votre objectif est de gérer au mieux cette situation complexe en utilisant votre jugement et les informations disponibles.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={previousStep} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                    Retour
                  </Button>
                  <Link href="/cyber/crisis-management">
                    <Button className="bg-red-700 hover:bg-red-600">
                      Entrer dans la salle de crise <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            )}
          </motion.div>
        </div>
      </div>
    </HomeLayout>
  );
}