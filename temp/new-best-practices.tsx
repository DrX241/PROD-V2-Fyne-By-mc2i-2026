import React, { useState } from "react";
import { 
  Search, 
  ListChecks, 
  Ear, 
  Lightbulb, 
  PanelTop, 
  LineChart, 
  ClipboardSignature, 
  BookOpen, 
  CheckCircle2, 
  MessageCircle, 
  ClipboardList,
  BookMarked,
  Star 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BestPracticesContentProps {
  setActiveTab?: (tab: string) => void;
}

const BestPracticesContent: React.FC<BestPracticesContentProps> = ({ setActiveTab }) => {
  const [activeSection, setActiveSection] = useState<string>("before");
  
  return (
    <div className="px-8 py-6 bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg">
      {/* Section title */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Guide complet pour réussir vos entretiens client</h2>
        <p className="text-blue-100 max-w-3xl mx-auto">
          Ce guide structuré vous aidera à naviguer avec assurance à travers les différentes phases d'un entretien client, 
          en fournissant des conseils pratiques et des exemples concrets à chaque étape.
        </p>
      </div>
      
      {/* Navigation tabs */}
      <div className="flex justify-center mb-8 border-b border-gray-700/50">
        <button 
          onClick={() => setActiveSection("before")}
          className={`px-4 py-3 font-medium text-lg transition-colors ${activeSection === "before" 
            ? "text-blue-400 border-b-2 border-blue-400" 
            : "text-gray-400 hover:text-blue-300"}`}
        >
          <div className="flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2" />
            Avant l'entretien
          </div>
        </button>
        <button 
          onClick={() => setActiveSection("during")}
          className={`px-4 py-3 font-medium text-lg transition-colors ${activeSection === "during" 
            ? "text-purple-400 border-b-2 border-purple-400" 
            : "text-gray-400 hover:text-purple-300"}`}
        >
          <div className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Pendant l'entretien
          </div>
        </button>
        <button 
          onClick={() => setActiveSection("after")}
          className={`px-4 py-3 font-medium text-lg transition-colors ${activeSection === "after" 
            ? "text-green-400 border-b-2 border-green-400" 
            : "text-gray-400 hover:text-green-300"}`}
        >
          <div className="flex items-center">
            <ClipboardList className="w-5 h-5 mr-2" />
            Après l'entretien
          </div>
        </button>
      </div>
      
      {/* Before section */}
      <div className={`transition-all duration-300 ${activeSection === "before" ? "block" : "hidden"}`}>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 p-6 rounded-lg border border-blue-700/30">
            <div className="flex items-start">
              <div className="bg-blue-600/40 p-3 rounded-full mr-4">
                <Search className="w-6 h-6 text-blue-200" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-blue-300 mb-3">Comprendre le contexte client</h4>
                <p className="text-gray-300 mb-3">
                  Prenez le temps d'analyser le contexte de l'entreprise cliente, son secteur d'activité, et ses enjeux stratégiques. 
                  Une compréhension approfondie de son environnement vous permettra de mieux appréhender ses besoins et d'adapter votre discours.
                </p>
                
                <div className="bg-gray-800/60 p-4 rounded-md mb-4 border-l-4 border-blue-500">
                  <h5 className="font-semibold text-blue-200 mb-2">Exemple concret</h5>
                  <p className="text-gray-300">
                    Pour une banque souhaitant moderniser son système d'information, recherchez au préalable les réglementations 
                    financières récentes (RGPD, DSP2, etc.) qui pourraient impacter le projet et les intégrer à votre analyse.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-200 border-blue-500/50 px-3 py-1">Analyse préalable</Badge>
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-200 border-blue-500/50 px-3 py-1">Recherche sectorielle</Badge>
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-200 border-blue-500/50 px-3 py-1">Veille stratégique</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 p-6 rounded-lg border border-blue-700/30">
            <div className="flex items-start">
              <div className="bg-blue-600/40 p-3 rounded-full mr-4">
                <ListChecks className="w-6 h-6 text-blue-200" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-blue-300 mb-3">Préparer vos questions et réponses</h4>
                <p className="text-gray-300 mb-3">
                  Anticipez les questions que le client pourrait vous poser et préparez des réponses claires. 
                  Identifiez également les points que vous souhaitez aborder pour approfondir votre compréhension 
                  de ses besoins et de son contexte.
                </p>
                
                <div className="bg-gray-800/60 p-4 rounded-md mb-4 border-l-4 border-blue-500">
                  <h5 className="font-semibold text-blue-200 mb-2">Questions stratégiques à préparer</h5>
                  <ul className="list-disc pl-5 text-gray-300 space-y-2">
                    <li>Quels sont vos objectifs à court et long terme pour ce projet ?</li>
                    <li>Quelles sont les contraintes principales (budget, délais, techniques) ?</li>
                    <li>Quels indicateurs de performance utiliserez-vous pour évaluer le succès du projet ?</li>
                    <li>Quelle est votre vision de la collaboration avec un consultant AMOA ?</li>
                  </ul>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-200 border-blue-500/50 px-3 py-1">Questions ouvertes</Badge>
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-200 border-blue-500/50 px-3 py-1">Réponses structurées</Badge>
                  <Badge variant="outline" className="bg-blue-900/30 text-blue-200 border-blue-500/50 px-3 py-1">Préparation ciblée</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* During section */}
      <div className={`transition-all duration-300 ${activeSection === "during" ? "block" : "hidden"}`}>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 p-6 rounded-lg border border-purple-700/30">
            <div className="flex items-start">
              <div className="bg-purple-600/40 p-3 rounded-full mr-4">
                <Ear className="w-6 h-6 text-purple-200" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-purple-300 mb-3">Écoute active et reformulation</h4>
                <p className="text-gray-300 mb-3">
                  Pratiquez l'écoute active en montrant votre intérêt pour les problématiques du client. 
                  Reformulez régulièrement ses propos pour confirmer votre compréhension et approfondir les points importants.
                </p>
                
                <div className="bg-gray-800/60 p-4 rounded-md mb-4 border-l-4 border-purple-500">
                  <h5 className="font-semibold text-purple-200 mb-2">Technique de reformulation</h5>
                  <div className="space-y-3">
                    <div className="pl-3 border-l-2 border-purple-400/50">
                      <p className="font-semibold text-gray-200">Client :</p>
                      <p className="text-gray-300">"Nous avons des problèmes de performance avec notre application métier qui ralentit considérablement le travail des équipes terrain."</p>
                    </div>
                    <div className="pl-3 border-l-2 border-purple-400/50">
                      <p className="font-semibold text-gray-200">Vous (reformulation) :</p>
                      <p className="text-gray-300">"Si je comprends bien, votre équipe terrain rencontre des difficultés opérationnelles importantes liées aux performances de l'application. Pourriez-vous me préciser quels processus métier sont les plus impactés par ces ralentissements ?"</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50 px-3 py-1">Validation de compréhension</Badge>
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50 px-3 py-1">Questions d'approfondissement</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 p-6 rounded-lg border border-purple-700/30">
            <div className="flex items-start">
              <div className="bg-purple-600/40 p-3 rounded-full mr-4">
                <Lightbulb className="w-6 h-6 text-purple-200" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-purple-300 mb-3">Posture consultative</h4>
                <p className="text-gray-300 mb-3">
                  Adoptez une posture de conseil plutôt que de simple prestataire. Montrez comment votre expertise 
                  peut apporter une réelle valeur ajoutée au projet, en étant force de proposition tout en restant à l'écoute.
                </p>
                
                <div className="bg-gray-800/60 p-4 rounded-md mb-4 border-l-4 border-purple-500">
                  <h5 className="font-semibold text-purple-200 mb-2">Différencier la posture</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-red-900/20 p-3 rounded-md">
                      <h6 className="font-medium text-red-300 mb-2">❌ Posture de prestataire</h6>
                      <p className="text-gray-300 text-sm">"Nous pouvons développer exactement ce que vous demandez dans le délai imparti."</p>
                    </div>
                    <div className="bg-green-900/20 p-3 rounded-md">
                      <h6 className="font-medium text-green-300 mb-2">✅ Posture de consultant</h6>
                      <p className="text-gray-300 text-sm">"D'après votre besoin, je recommanderais une approche itérative qui permettrait de livrer de la valeur plus rapidement tout en minimisant les risques liés au changement."</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50 px-3 py-1">Conseil stratégique</Badge>
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50 px-3 py-1">Apport d'expertise</Badge>
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50 px-3 py-1">Vision partenariale</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-900/20 to-purple-800/20 p-6 rounded-lg border border-purple-700/30">
            <div className="flex items-start">
              <div className="bg-purple-600/40 p-3 rounded-full mr-4">
                <PanelTop className="w-6 h-6 text-purple-200" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-purple-300 mb-3">Structuration de votre discours</h4>
                <p className="text-gray-300 mb-3">
                  Présentez vos idées de façon structurée et cohérente. Utilisez des exemples concrets de projets similaires 
                  pour illustrer vos propos, en veillant à ne pas divulguer d'informations confidentielles.
                </p>
                
                <div className="bg-gray-800/60 p-4 rounded-md mb-4 border-l-4 border-purple-500">
                  <h5 className="font-semibold text-purple-200 mb-2">Structure STAR pour partager une expérience</h5>
                  <ul className="space-y-2 text-gray-300">
                    <li><span className="font-medium text-purple-300">Situation :</span> "J'ai travaillé avec un acteur majeur du secteur bancaire qui..."</li>
                    <li><span className="font-medium text-purple-300">Tâche :</span> "Ma mission était de redéfinir le processus d'onboarding client..."</li>
                    <li><span className="font-medium text-purple-300">Action :</span> "J'ai coordonné des ateliers métier et mis en place une démarche..."</li>
                    <li><span className="font-medium text-purple-300">Résultat :</span> "Ce qui a permis de réduire le temps d'ouverture de compte de 65%..."</li>
                  </ul>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50 px-3 py-1">Clarté</Badge>
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50 px-3 py-1">Exemples concrets</Badge>
                  <Badge variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-500/50 px-3 py-1">Approche méthodique</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* After section */}
      <div className={`transition-all duration-300 ${activeSection === "after" ? "block" : "hidden"}`}>
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 p-6 rounded-lg border border-green-700/30">
            <div className="flex items-start">
              <div className="bg-green-600/40 p-3 rounded-full mr-4">
                <LineChart className="w-6 h-6 text-green-200" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-green-300 mb-3">Analyse de votre performance</h4>
                <p className="text-gray-300 mb-3">
                  Après l'entretien, prenez le temps d'analyser votre performance. Identifiez vos points forts 
                  et les aspects à améliorer pour continuer à progresser dans vos compétences d'entretien client.
                </p>
                
                <div className="bg-gray-800/60 p-4 rounded-md mb-4 border-l-4 border-green-500">
                  <h5 className="font-semibold text-green-200 mb-2">Grille d'auto-évaluation</h5>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Compréhension des besoins client</span>
                      <div className="flex space-x-1">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < 4 ? "text-amber-400" : "text-gray-600"}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Qualité des questions posées</span>
                      <div className="flex space-x-1">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < 3 ? "text-amber-400" : "text-gray-600"}`} />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">Capacité à proposer des solutions</span>
                      <div className="flex space-x-1">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < 4 ? "text-amber-400" : "text-gray-600"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50 px-3 py-1">Auto-évaluation</Badge>
                  <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50 px-3 py-1">Points forts</Badge>
                  <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50 px-3 py-1">Axes d'amélioration</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 p-6 rounded-lg border border-green-700/30">
            <div className="flex items-start">
              <div className="bg-green-600/40 p-3 rounded-full mr-4">
                <ClipboardSignature className="w-6 h-6 text-green-200" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-green-300 mb-3">Suivi et documentation</h4>
                <p className="text-gray-300 mb-3">
                  Documentez les points clés abordés pendant l'entretien et préparez une proposition 
                  ou un compte-rendu synthétique pour le client, démontrant votre compréhension de ses besoins.
                </p>
                
                <div className="bg-gray-800/60 p-4 rounded-md mb-4 border-l-4 border-green-500">
                  <h5 className="font-semibold text-green-200 mb-2">Structure d'un compte-rendu efficace</h5>
                  <ol className="list-decimal pl-5 text-gray-300 space-y-2">
                    <li><span className="font-medium text-green-300">Contexte et objectifs</span> - Rappel du contexte client et des objectifs de l'entretien</li>
                    <li><span className="font-medium text-green-300">Points clés discutés</span> - Synthèse des principales thématiques abordées</li>
                    <li><span className="font-medium text-green-300">Problématiques identifiées</span> - Liste des challenges et besoins exprimés</li>
                    <li><span className="font-medium text-green-300">Solutions proposées</span> - Approches et méthodologies suggérées</li>
                    <li><span className="font-medium text-green-300">Prochaines étapes</span> - Actions concrètes et calendrier prévisionnel</li>
                  </ol>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50 px-3 py-1">Synthèse</Badge>
                  <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50 px-3 py-1">Proposition de valeur</Badge>
                  <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50 px-3 py-1">Engagement client</Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-900/20 to-green-800/20 p-6 rounded-lg border border-green-700/30">
            <div className="flex items-start">
              <div className="bg-green-600/40 p-3 rounded-full mr-4">
                <BookOpen className="w-6 h-6 text-green-200" />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-semibold text-green-300 mb-3">Apprentissage continu</h4>
                <p className="text-gray-300 mb-3">
                  Transformez chaque entretien en opportunité d'apprentissage. Notez les situations où vous avez excellé 
                  et celles où vous pourriez vous améliorer pour enrichir votre expertise en tant que consultant AMOA.
                </p>
                
                <div className="bg-gray-800/60 p-4 rounded-md mb-4 border-l-4 border-green-500">
                  <h5 className="font-semibold text-green-200 mb-2">Journal de progression professionnelle</h5>
                  <p className="text-gray-300 mb-2">Tenez un journal structuré pour chaque entretien client :</p>
                  <ul className="list-disc pl-5 text-gray-300 space-y-1">
                    <li>Ce qui a bien fonctionné</li>
                    <li>Ce qui aurait pu être amélioré</li>
                    <li>Les questions inattendues et comment j'y ai répondu</li>
                    <li>Nouvelles connaissances ou insights acquis</li>
                    <li>Actions concrètes pour le prochain entretien</li>
                  </ul>
                </div>
                
                <div className="flex flex-wrap gap-3 mt-4">
                  <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50 px-3 py-1">Réflexion continue</Badge>
                  <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50 px-3 py-1">Feedback</Badge>
                  <Badge variant="outline" className="bg-green-900/30 text-green-200 border-green-500/50 px-3 py-1">Développement professionnel</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Explore more section at the bottom */}
      <div className="mt-10 pt-6 border-t border-gray-700/50">
        <div className="bg-gradient-to-r from-indigo-900/20 to-indigo-800/20 p-5 rounded-lg border border-indigo-700/30">
          <h3 className="text-lg font-semibold text-indigo-300 mb-2 flex items-center">
            <BookMarked className="w-5 h-5 mr-2" />
            Ressources complémentaires
          </h3>
          <p className="text-gray-300 mb-4">
            Perfectionnez vos compétences en consultant ces ressources recommandées pour les consultants AMOA.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/60 p-4 rounded-md">
              <h4 className="font-medium text-indigo-200 mb-1">📚 Livres recommandés</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• "L'art de poser les bonnes questions" - T. Fadem</li>
                <li>• "Le guide du consultant" - H. Marchat</li>
                <li>• "Business Analysis Techniques" - J. Cadle et al.</li>
              </ul>
            </div>
            <div className="bg-gray-800/60 p-4 rounded-md">
              <h4 className="font-medium text-indigo-200 mb-1">🎓 Formations utiles</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Certification IIBA (CBAP ou CCBA)</li>
                <li>• Formation PMI en gestion de projet</li>
                <li>• Ateliers sur les méthodologies Agile</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BestPracticesContent;