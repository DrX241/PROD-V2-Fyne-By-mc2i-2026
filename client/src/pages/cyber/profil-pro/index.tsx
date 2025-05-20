import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Shield, Code, Database, Users, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageTitle from '@/components/PageTitle';

const profiles = [
  {
    id: 'rssi',
    title: 'Responsable Sécurité des Systèmes d\'Information (RSSI)',
    description: 'Pilotez la stratégie de sécurité de l\'organisation et supervisez les opérations de cybersécurité',
    color: 'bg-blue-600',
    icon: <Shield className="h-8 w-8 text-white" />,
    skills: ['Stratégie', 'Gouvernance', 'Risques', 'Conformité', 'Leadership'],
    tasks: [
      'Définir la politique de sécurité',
      'Gérer les risques et les incidents',
      'Piloter les audits et la conformité',
      'Sensibiliser les équipes'
    ]
  },
  {
    id: 'secops',
    title: 'Analyste SOC / SecOps',
    description: 'Surveillez, détectez et répondez aux menaces de cybersécurité en temps réel',
    color: 'bg-emerald-600',
    icon: <Database className="h-8 w-8 text-white" />,
    skills: ['Détection', 'Réponse', 'Analyse', 'Veille'],
    tasks: [
      'Surveiller les alertes de sécurité',
      'Analyser les incidents',
      'Répondre aux attaques',
      'Maintenir les outils de détection'
    ]
  },
  {
    id: 'pentester',
    title: 'Pentesteur / Ethical Hacker',
    description: 'Testez les systèmes pour trouver les vulnérabilités avant les attaquants',
    color: 'bg-red-600',
    icon: <Code className="h-8 w-8 text-white" />,
    skills: ['Offensive', 'Vulnérabilités', 'Exploitation', 'Remédiation'],
    tasks: [
      'Tester les systèmes et applications',
      'Exploiter des vulnérabilités',
      'Documenter les résultats',
      'Proposer des corrections'
    ]
  },
  {
    id: 'consultant',
    title: 'Consultant en Cybersécurité',
    description: 'Accompagnez les organisations dans l\'amélioration de leur posture de sécurité',
    color: 'bg-purple-600',
    icon: <Users className="h-8 w-8 text-white" />,
    skills: ['Conseil', 'Audit', 'Formation', 'Transformation'],
    tasks: [
      'Auditer des infrastructures',
      'Conseiller sur les bonnes pratiques',
      'Former les équipes',
      'Accompagner les projets de sécurité'
    ]
  },
  {
    id: 'grc',
    title: 'Spécialiste GRC (Gouvernance, Risque, Conformité)',
    description: 'Assurez la conformité réglementaire et la gestion des risques de cybersécurité',
    color: 'bg-amber-600',
    icon: <FileText className="h-8 w-8 text-white" />,
    skills: ['Gouvernance', 'Risques', 'Conformité', 'Audit'],
    tasks: [
      'Gérer la conformité réglementaire',
      'Évaluer les risques',
      'Mettre en place des contrôles',
      'Préparer les certifications'
    ]
  },
  {
    id: 'devsecops',
    title: 'Ingénieur DevSecOps',
    description: 'Intégrez la sécurité dans le cycle de développement logiciel et les pipelines CI/CD',
    color: 'bg-cyan-600',
    icon: <Lock className="h-8 w-8 text-white" />,
    skills: ['Automatisation', 'CI/CD', 'Sécurité du code', 'Infrastructure'],
    tasks: [
      'Sécuriser les pipelines de déploiement',
      'Mettre en place des tests de sécurité automatisés',
      'Hardening des infrastructures',
      'Gérer la sécurité des conteneurs'
    ]
  }
];

export default function ProfilPro() {
  return (
    <div className="min-h-screen bg-[#0a1429]">
      <PageTitle title="Métiers de la Cybersécurité | Parcours professionnels" />
      
      {/* En-tête avec navigation et titre */}
      <div className="border-b border-blue-800/60">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/cyber/learning-center">
            <Button variant="ghost" className="text-blue-300 hover:bg-blue-900/30 hover:text-blue-200">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <h1 className="text-xl text-white font-medium">Profils Professionnels</h1>
        </div>
      </div>
      
      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-8">
        {/* Titre et description */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Découvrez les métiers de la cybersécurité</h1>
          <p className="text-blue-300 max-w-3xl">
            Explorez les différentes carrières dans le domaine de la cybersécurité et trouvez celle qui correspond à vos compétences et aspirations professionnelles.
          </p>
        </div>
        
        {/* Grille des profils professionnels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
          {profiles.map((profile) => (
            <motion.div
              key={profile.id}
              whileHover={{ y: -5 }}
              className="bg-blue-900/20 border border-blue-700 rounded-lg overflow-hidden hover:border-blue-500 transition-all"
            >
              <div className={`${profile.color} p-4 flex items-center`}>
                <div className="bg-white/10 rounded-full p-3">
                  {profile.icon}
                </div>
                <h2 className="ml-4 text-white font-bold line-clamp-2">{profile.title}</h2>
              </div>
              
              <CardContent className="p-5">
                <p className="text-blue-200 mb-5">{profile.description}</p>
                
                <div className="mb-4">
                  <h3 className="text-white text-sm font-semibold mb-2">Compétences clés</h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, idx) => (
                      <Badge key={idx} className="bg-blue-800/40 hover:bg-blue-700/60 border-blue-600/50 text-blue-200">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-white text-sm font-semibold mb-2">Missions principales</h3>
                  <ul className="space-y-1 text-sm text-blue-300">
                    {profile.tasks.map((task, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-blue-400 mr-2">•</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  className="w-full mt-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  onClick={() => {
                    // Pour le moment, juste une alerte, mais on pourrait développer des modules spécifiques
                    alert(`Simulation du métier: ${profile.title} - Cette fonctionnalité sera disponible prochainement.`);
                  }}
                >
                  Découvrir ce métier
                </Button>
              </CardContent>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}