import { useChatContext } from "@/contexts/ChatContext";
import { 
  ArrowRight, Users, Shield, ShieldAlert, 
  AlertTriangle, Clock, Brain, ChevronRight 
} from "lucide-react";
import { useState } from "react";

export default function ScenarioSelection() {
  const { scenarios, scenario, selectScenario } = useChatContext();
  const [hoveredScenario, setHoveredScenario] = useState<string | null>(null);
  
  // Filter scenarios by the active domain
  const filteredScenarios = scenarios.filter(
    (s: any) => s.domainId === scenario.activeDomain?.id
  );

  const handleScenarioClick = (scenarioId: string) => {
    selectScenario(scenarioId);
  };

  // Fonction pour obtenir les couleurs basées sur la difficulté
  const getDifficultyConfig = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant':
        return {
          icon: <Shield className="w-4 h-4 mr-1" />,
          bgColor: "bg-green-900/40",
          textColor: "text-green-300",
          borderColor: "border-green-700/30",
          label: "Débutant"
        };
      case 'Intermédiaire':
        return {
          icon: <ShieldAlert className="w-4 h-4 mr-1" />,
          bgColor: "bg-amber-900/40",
          textColor: "text-amber-300",
          borderColor: "border-amber-700/30",
          label: "Intermédiaire"
        };
      case 'Expert':
        return {
          icon: <AlertTriangle className="w-4 h-4 mr-1" />,
          bgColor: "bg-red-900/40",
          textColor: "text-red-300",
          borderColor: "border-red-700/30",
          label: "Expert"
        };
      default:
        return {
          icon: <Shield className="w-4 h-4 mr-1" />,
          bgColor: "bg-gray-900/40",
          textColor: "text-gray-300",
          borderColor: "border-gray-700/30",
          label: difficulty
        };
    }
  };

  // Choisir l'icône en fonction du domaine actif pour afficher des éléments visuels thématiques
  const getDomainConfig = () => {
    const domainId = scenario.activeDomain?.id;
    const domainName = scenario.activeDomain?.name;
    
    switch (domainId) {
      case 'gestion-crise':
        return {
          color: "from-red-900/30 to-red-700/10",
          accentColor: "text-red-300",
          borderColor: "border-red-700/20",
          icon: <AlertTriangle className="w-6 h-6 text-red-300 mb-2" />
        };
      case 'donnees-personnelles':
        return {
          color: "from-emerald-900/30 to-emerald-700/10",
          accentColor: "text-emerald-300",
          borderColor: "border-emerald-700/20",
          icon: <Shield className="w-6 h-6 text-emerald-300 mb-2" />
        };
      default:
        return {
          color: "from-blue-900/30 to-blue-700/10",
          accentColor: "text-blue-300",
          borderColor: "border-blue-700/20",
          icon: <Shield className="w-6 h-6 text-blue-300 mb-2" />
        };
    }
  };

  const domainConfig = getDomainConfig();

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      <div className={`text-center mb-10 p-6 rounded-xl bg-gradient-to-br ${domainConfig.color} backdrop-blur-sm border ${domainConfig.borderColor}`}>
        <div className="flex flex-col items-center">
          {domainConfig.icon}
          <h2 className="text-2xl font-bold text-blue-50 mb-3">
            Sélectionnez un scénario de {scenario.activeDomain?.name}
          </h2>
        </div>
        <p className={`${domainConfig.accentColor} mb-3`}>
          {filteredScenarios.length} scénarios disponibles
        </p>
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-blue-200 text-sm">15-20 min/scénario</span>
          </div>
          <div className="flex items-center">
            <Brain className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-blue-200 text-sm">Apprentissage pratique</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-blue-400" />
            <span className="text-blue-200 text-sm">PNJ réalistes</span>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4 mb-6">
        <h3 className="text-base font-semibold text-blue-200 mb-2">À savoir sur ce domaine</h3>
        <p className="text-sm text-blue-100/80">
          {scenario.activeDomain?.id === 'gestion-crise' && "La gestion de crise cyber nécessite une réponse coordonnée qui implique différents aspects : technique, communication, juridique et relations publiques. Un plan de réponse préparé à l'avance est essentiel pour limiter les impacts."}
          {scenario.activeDomain?.id === 'donnees-personnelles' && "Le RGPD impose aux entreprises de protéger les données personnelles qu'elles traitent. Les violations peuvent entraîner des amendes allant jusqu'à 4% du chiffre d'affaires annuel mondial ou 20 millions d'euros."}
          {scenario.activeDomain?.id === 'ingenierie-sociale' && "90% des cyberattaques commencent par une tentative d'ingénierie sociale. Cette technique exploite les faiblesses humaines plutôt que les vulnérabilités techniques."}
          {scenario.activeDomain?.id === 'gestion-incidents' && "La détection précoce des incidents de sécurité permet de réduire le coût moyen d'une violation de données de 1,12 million de dollars. Le temps moyen de détection est encore de 200 jours."}
          {scenario.activeDomain?.id === 'supply-chain' && "60% des cyberattaques proviennent désormais de la chaîne d'approvisionnement. Les attaquants ciblent souvent le maillon le plus faible pour atteindre leur cible principale."}
          {scenario.activeDomain?.id === 'strategie-cyber' && "Une stratégie de cybersécurité efficace doit s'aligner sur les objectifs business de l'entreprise et intégrer des mécanismes de gouvernance, de conformité et de gestion des risques."}
        </p>
      </div>

      <div className="space-y-4">
        {filteredScenarios.map((s: any) => {
          const diffConfig = getDifficultyConfig(s.difficulty);
          const isHovered = hoveredScenario === s.id;
          
          return (
            <button 
              key={s.id}
              className="w-full text-left focus:outline-none focus:ring-1 focus:ring-blue-500/50 group"
              onClick={() => handleScenarioClick(s.id)}
              onMouseEnter={() => setHoveredScenario(s.id)}
              onMouseLeave={() => setHoveredScenario(null)}
            >
              <div className="relative flex items-center justify-between p-5 rounded-xl bg-gray-900/40 backdrop-blur-sm border border-blue-800/30 hover:border-blue-600/40 transition-all duration-300 shadow-md hover:shadow-xl group-hover:-translate-y-0.5">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-blue-600/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="flex-1 relative z-10">
                  <h3 className="font-bold text-xl text-blue-100 group-hover:text-blue-50 transition-colors">{s.title}</h3>
                  {isHovered ? (
                    <p className="mt-2 text-blue-300/90 text-sm">
                      Cliquez pour commencer ce scénario.
                    </p>
                  ) : (
                    <p className="mt-2 text-blue-400/70 text-sm line-clamp-1">{s.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <span className={`flex items-center px-3 py-1 rounded-md ${diffConfig.bgColor} ${diffConfig.textColor} border ${diffConfig.borderColor} text-xs font-medium shadow-glow-sm`}>
                    {diffConfig.icon}
                    {diffConfig.label}
                  </span>
                  <div className="text-blue-400 group-hover:text-blue-300 transition-all duration-300 transform group-hover:translate-x-1">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      <div className="mt-6 bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
        <h3 className="text-base font-semibold text-yellow-200 mb-2">Astuce de formation</h3>
        <p className="text-sm text-blue-100/80">
          Pour un apprentissage optimal, nous vous recommandons de commencer par les scénarios de niveau débutant 
          avant de progresser vers les niveaux intermédiaire et expert. Chaque scénario vous fournira des connaissances 
          et compétences qui vous prépareront pour les défis plus complexes.
        </p>
      </div>
    </div>
  );
}
