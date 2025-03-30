import React from "react";
import { 
  ShieldCheck, Database, ListChecks, Plus, ArrowRight, 
  BarChart4, Users, Award, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HomeLayout from "@/components/layout/HomeLayout";
import { Link } from "wouter";

export default function ModulesPage() {
  const modules = [
    {
      id: "cyber",
      title: "I AM CYBER",
      description: "Développez vos compétences en cybersécurité à travers des scénarios interactifs et immersifs.",
      icon: <ShieldCheck className="w-12 h-12 text-white" />,
      iconBg: "bg-blue-600",
      color: "border-blue-200 hover:shadow-lg hover:border-blue-300",
      link: "/cyber"
    },
    {
      id: "data-ia",
      title: "I AM DATA & IA",
      description: "Maîtrisez les concepts de la data science et de l'intelligence artificielle par des cas pratiques.",
      icon: <Database className="w-12 h-12 text-white" />,
      iconBg: "bg-purple-600",
      color: "border-purple-200 hover:shadow-lg hover:border-purple-300",
      link: "/data-ia"
    },
    {
      id: "amoa",
      title: "I AM AMOA",
      description: "Perfectionnez vos compétences en assistance à maîtrise d'ouvrage et gestion de projet.",
      icon: <ListChecks className="w-12 h-12 text-white" />,
      iconBg: "bg-emerald-600",
      color: "border-emerald-200 hover:shadow-lg hover:border-emerald-300",
      link: "/amoa"
    },
    {
      id: "custom",
      title: "Soyez qui vous voulez",
      description: "Créez votre propre module personnalisé et adaptez l'apprentissage à vos besoins spécifiques.",
      icon: <Plus className="w-12 h-12 text-white" />,
      iconBg: "bg-rose-600",
      color: "border-rose-200 hover:shadow-lg hover:border-rose-300",
      link: "/custom"
    }
  ];

  const features = [
    {
      icon: <Zap className="h-8 w-8 text-blue-600" />,
      title: "Apprentissage interactif",
      description: "Des scénarios immersifs et des conversations en temps réel pour un apprentissage efficace"
    },
    {
      icon: <BarChart4 className="h-8 w-8 text-blue-600" />,
      title: "Suivi de progression",
      description: "Suivez votre évolution et identifiez vos points d'amélioration"
    },
    {
      icon: <Users className="h-8 w-8 text-blue-600" />,
      title: "Expertise métier",
      description: "Des contenus créés par des experts reconnus dans leur domaine"
    },
    {
      icon: <Award className="h-8 w-8 text-blue-600" />,
      title: "Certification",
      description: "Obtenez des certifications reconnues à l'issue de votre parcours d'apprentissage"
    }
  ];

  return (
    <HomeLayout>
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-blue-600">FYNE</span> - Votre plateforme d'excellence
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10">
              Développez vos compétences professionnelles grâce à des expériences d'apprentissage interactives et immersives
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                Démarrer maintenant
              </Button>
              <Button size="lg" variant="outline" className="px-8">
                En savoir plus
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pourquoi choisir FYNE ?</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Notre plateforme offre une expérience d'apprentissage unique, conçue pour développer vos compétences de manière efficace et engageante
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos modules de formation</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explorez nos modules spécialisés conçus pour répondre à vos besoins d'apprentissage spécifiques
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {modules.map((module) => (
              <div 
                key={module.id} 
                className={`bg-white p-8 border rounded-xl transition-all duration-300 ${module.color} cursor-pointer h-full flex flex-col`}
              >
                <div className={`${module.iconBg} w-20 h-20 rounded-lg flex items-center justify-center mb-6`}>
                  {module.icon}
                </div>
                <h2 className="text-2xl font-bold mb-3 text-gray-900">{module.title}</h2>
                <p className="text-gray-700 mb-6 flex-grow">{module.description}</p>
                <Link href={module.link}>
                  <Button className="w-fit mt-auto group bg-white text-gray-800 hover:bg-gray-100">
                    Commencer
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              © 2025 mc2i. Tous droits réservés.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">Conditions d'utilisation</a>
              <a href="#" className="text-gray-400 hover:text-gray-500">Politique de confidentialité</a>
              <a href="#" className="text-gray-400 hover:text-gray-500">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </HomeLayout>
  );
}