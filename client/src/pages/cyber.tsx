import { useState } from "react";
import CyberLayout from "@/components/layout/CyberLayout";
import ChatInterface from "@/components/cyber/ChatInterface";
import { SkillsProvider } from "@/contexts/SkillsContext";
import { InterlocutorsProvider } from "@/contexts/InterlocutorContext";
import { Tab } from "@headlessui/react";
import { MessageSquareText, Award, BookOpen, UserCircle, Settings } from "lucide-react";

export default function CyberPage() {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <SkillsProvider>
      <InterlocutorsProvider>
        <CyberLayout>
          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
            <div className="flex h-full">
              {/* Tabs verticaux */}
              <div className="h-full w-16 sm:w-20 bg-gray-900/50 border-r border-blue-900/30 flex flex-col items-center pt-6 space-y-6">
                <Tab 
                  className={({ selected }) => `
                    w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center rounded-xl 
                    transition-all duration-300 outline-none
                    ${selected 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'text-blue-300/70 hover:bg-blue-900/50 hover:text-blue-200'
                    }
                  `}
                >
                  <MessageSquareText className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-[10px] mt-1">Chat</span>
                </Tab>
                
                <Tab 
                  className={({ selected }) => `
                    w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center rounded-xl
                    transition-all duration-300 outline-none
                    ${selected 
                      ? 'bg-purple-600 text-white shadow-lg' 
                      : 'text-blue-300/70 hover:bg-blue-900/50 hover:text-blue-200'
                    }
                  `}
                >
                  <Award className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-[10px] mt-1">Compétences</span>
                </Tab>
                
                <Tab 
                  className={({ selected }) => `
                    w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center rounded-xl
                    transition-all duration-300 outline-none
                    ${selected 
                      ? 'bg-amber-600 text-white shadow-lg' 
                      : 'text-blue-300/70 hover:bg-blue-900/50 hover:text-blue-200'
                    }
                  `}
                >
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-[10px] mt-1">Ressources</span>
                </Tab>
                
                <Tab 
                  className={({ selected }) => `
                    w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center rounded-xl
                    transition-all duration-300 outline-none
                    ${selected 
                      ? 'bg-emerald-600 text-white shadow-lg' 
                      : 'text-blue-300/70 hover:bg-blue-900/50 hover:text-blue-200'
                    }
                  `}
                >
                  <UserCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-[10px] mt-1">Profil</span>
                </Tab>
                
                <Tab 
                  className={({ selected }) => `
                    w-12 h-12 sm:w-14 sm:h-14 flex flex-col items-center justify-center rounded-xl
                    transition-all duration-300 outline-none
                    ${selected 
                      ? 'bg-gray-600 text-white shadow-lg' 
                      : 'text-blue-300/70 hover:bg-blue-900/50 hover:text-blue-200'
                    }
                  `}
                >
                  <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-[10px] mt-1">Paramètres</span>
                </Tab>
              </div>
              
              {/* Contenu des onglets */}
              <div className="flex-1 overflow-y-auto">
                <Tab.Panel className="h-full">
                  <ChatInterface />
                </Tab.Panel>
                
                <Tab.Panel className="p-4 h-full overflow-y-auto">
                  <div className="max-w-5xl mx-auto">
                    {/* Contenu de l'onglet Compétences */}
                    <SkillsTab />
                  </div>
                </Tab.Panel>
                
                <Tab.Panel className="p-4 h-full overflow-y-auto">
                  <div className="max-w-5xl mx-auto">
                    {/* Contenu de l'onglet Ressources */}
                    <ResourcesTab />
                  </div>
                </Tab.Panel>
                
                <Tab.Panel className="p-4 h-full overflow-y-auto">
                  <div className="max-w-5xl mx-auto">
                    {/* Contenu de l'onglet Profil */}
                    <ProfileTab />
                  </div>
                </Tab.Panel>
                
                <Tab.Panel className="p-4 h-full overflow-y-auto">
                  <div className="max-w-5xl mx-auto">
                    {/* Contenu de l'onglet Paramètres */}
                    <SettingsTab />
                  </div>
                </Tab.Panel>
              </div>
            </div>
          </Tab.Group>
        </CyberLayout>
      </InterlocutorsProvider>
    </SkillsProvider>
  );
}

// Onglet Compétences
import SkillsOverview from "@/components/cyber/profile/SkillsOverview";
import { useSkills } from "@/contexts/SkillsContext";

function SkillsTab() {
  const { skills, badges } = useSkills();
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-100 mb-6">
        <Award className="inline-block mr-2 h-8 w-8 text-purple-400" />
        Tableau de compétences
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SkillsOverview />
        </div>
        
        <div className="lg:col-span-1">
          <LearningRecommendations />
        </div>
      </div>
    </div>
  );
}

// Onglet Ressources
import EducationalResources from "@/components/cyber/resources/EducationalResources";
import { defaultResources } from "@/components/cyber/resources/ResourcesData";
import LearningRecommendations from "@/components/cyber/profile/LearningRecommendations";

function ResourcesTab() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-100 mb-6">
        <BookOpen className="inline-block mr-2 h-8 w-8 text-amber-400" />
        Centre de ressources
      </h1>
      
      <EducationalResources userSkills={['incidents', 'risques', 'conformité']} />
    </div>
  );
}

// Onglet Profil
import InterlocutorSelector from "@/components/cyber/profile/InterlocutorSelector";
import { useInterlocutors } from "@/contexts/InterlocutorContext";
import Avatar from "@/components/cyber/profile/AvatarGenerator";

function ProfileTab() {
  const { currentInterlocutor } = useInterlocutors();
  const { skills, badges } = useSkills();
  
  // Calculer le niveau global
  const overallLevel = skills.reduce((acc: number, skill) => acc + skill.level, 0) / skills.length;
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-100 mb-6">
        <UserCircle className="inline-block mr-2 h-8 w-8 text-emerald-400" />
        Mon profil
      </h1>
      
      <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-900/30">
        <h2 className="text-2xl font-bold text-blue-100 mb-6">Interlocuteurs</h2>
        <p className="text-blue-300 mb-4">Choisissez votre interlocuteur préféré pour les scénarios :</p>
        
        <div className="text-center text-blue-300 py-4">
          Sélection d'interlocuteur disponible dans la version complète
        </div>
      </div>
      
      <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-900/30">
        <h2 className="text-2xl font-bold text-blue-100 mb-6">Progression</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-lg p-5 text-center flex flex-col items-center">
            <h3 className="text-blue-300 font-medium mb-1">Niveau global</h3>
            <div className="text-3xl font-bold text-white">{Math.round(overallLevel)}%</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-lg p-5 text-center flex flex-col items-center">
            <h3 className="text-blue-300 font-medium mb-1">Scénarios terminés</h3>
            <div className="text-3xl font-bold text-white">2</div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-lg p-5 text-center flex flex-col items-center">
            <h3 className="text-blue-300 font-medium mb-1">Badges obtenus</h3>
            <div className="text-3xl font-bold text-white">{badges.filter(b => b.unlocked).length}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Onglet Paramètres
function SettingsTab() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-blue-100 mb-6">
        <Settings className="inline-block mr-2 h-8 w-8 text-gray-400" />
        Paramètres
      </h1>
      
      <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-900/30">
        <h2 className="text-2xl font-bold text-blue-100 mb-6">Configuration de l'IA</h2>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-blue-200 font-medium">Langue préférée</label>
            <select className="w-full p-3 bg-gray-800 border border-blue-800/50 rounded-lg text-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-blue-200 font-medium">Modèle d'IA</label>
            <select className="w-full p-3 bg-gray-800 border border-blue-800/50 rounded-lg text-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="gpt-4o">GPT-4o (Recommandé)</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-blue-200 font-medium">Difficulté des scénarios</label>
            <select className="w-full p-3 bg-gray-800 border border-blue-800/50 rounded-lg text-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="normal">Normale</option>
              <option value="hard">Difficile</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-900/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-900/30">
        <h2 className="text-2xl font-bold text-blue-100 mb-6">Interface</h2>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <input type="checkbox" id="sound" className="mr-3 h-5 w-5 rounded text-blue-600" />
            <label htmlFor="sound" className="text-blue-200">Activer les sons</label>
          </div>
          
          <div className="flex items-center">
            <input type="checkbox" id="animations" className="mr-3 h-5 w-5 rounded text-blue-600" checked />
            <label htmlFor="animations" className="text-blue-200">Activer les animations</label>
          </div>
        </div>
      </div>
    </div>
  );
}