import React from "react";
import { Link } from "wouter";
import { 
  ShieldCheck, Database, ListChecks, Plus, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import mclogo from "@assets/mc2i.png";

export default function ModulesPage() {
  const modules = [
    {
      id: "cyber",
      title: "I AM CYBER",
      description: "Développez vos compétences en cybersécurité à travers des scénarios interactifs et immersifs.",
      icon: <ShieldCheck className="w-12 h-12 text-blue-600" />,
      color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
      link: "/cyber"
    },
    {
      id: "data-ia",
      title: "I AM DATA & IA",
      description: "Maîtrisez les concepts de la data science et de l'intelligence artificielle par des cas pratiques.",
      icon: <Database className="w-12 h-12 text-purple-600" />,
      color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
      link: "/data-ia"
    },
    {
      id: "amoa",
      title: "I AM AMOA",
      description: "Perfectionnez vos compétences en assistance à maîtrise d'ouvrage et gestion de projet.",
      icon: <ListChecks className="w-12 h-12 text-emerald-600" />,
      color: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
      link: "/amoa"
    },
    {
      id: "custom",
      title: "Soyez qui vous voulez",
      description: "Créez votre propre module personnalisé et adaptez l'apprentissage à vos besoins spécifiques.",
      icon: <Plus className="w-12 h-12 text-rose-600" />,
      color: "bg-rose-50 border-rose-200 hover:bg-rose-100",
      link: "/custom"
    }
  ];

  return (
    <Layout>
      <div className="w-full min-h-screen py-16 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <img 
              src={mclogo} 
              alt="mc2i Logo" 
              className="h-16 mx-auto mb-6" 
            />
            <h1 className="text-4xl font-bold mb-4 text-gray-900">Plateforme d'apprentissage mc2i</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Développez vos compétences professionnelles à travers des expériences d'apprentissage interactives et immersives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            {modules.map((module) => (
              <div 
                key={module.id} 
                onClick={() => window.location.href = module.link}
                className={`block p-8 border-2 rounded-xl transition-all duration-300 ${module.color} h-full cursor-pointer`}
              >
                <div className="flex flex-col h-full">
                  <div className="mb-6">{module.icon}</div>
                  <h2 className="text-2xl font-bold mb-3 text-gray-900">{module.title}</h2>
                  <p className="text-gray-700 mb-6 flex-grow">{module.description}</p>
                  <Button variant="outline" className="w-fit mt-auto group">
                    Commencer
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-20">
            <p className="text-gray-500 text-sm">
              © 2025 mc2i. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}