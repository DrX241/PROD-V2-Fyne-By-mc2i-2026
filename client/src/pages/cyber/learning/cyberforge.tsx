import React from 'react';
import HomeLayout from '@/components/layout/HomeLayout';
import { CyberForgeAcademy } from '@/components/cyber/learning/CyberForgeAcademy';
import { HomeIcon, BookOpen, Award } from 'lucide-react';
import { Link } from 'wouter';
import PageTitle from '@/components/utils/PageTitle';

export default function CyberForgePage() {
  return (
    <HomeLayout>
      <PageTitle title="CyberForge Academy" />
      
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <nav className="flex items-center mb-6">
              <Link href="/">
                <a className="text-gray-500 hover:text-indigo-600 flex items-center">
                  <HomeIcon className="w-4 h-4 mr-1" />
                  Accueil
                </a>
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <Link href="/cyber-mode-selection">
                <a className="text-gray-500 hover:text-indigo-600 flex items-center">
                  I AM CYBER
                </a>
              </Link>
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-indigo-600 font-medium flex items-center">
                <BookOpen className="w-4 h-4 mr-1" />
                CyberForge Academy
              </span>
            </nav>
            
            <div className="relative mb-8">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">CyberForge Academy</h1>
                    <p className="text-indigo-100 mb-4">
                      Forgez vos compétences cyber par une approche pédagogique interactive et ludique
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                        5 parcours thématiques
                      </span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                        25 modules d'apprentissage
                      </span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                        Intégration GPT-4o
                      </span>
                    </div>
                  </div>
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full flex items-center justify-center">
                    <Award className="w-12 h-12 md:w-14 md:h-14 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Éléments décoratifs */}
              <div className="absolute -bottom-4 left-10 w-8 h-8 bg-indigo-500 rounded-full opacity-20"></div>
              <div className="absolute -top-3 right-16 w-6 h-6 bg-purple-500 rounded-full opacity-20"></div>
              <div className="absolute top-1/2 right-8 w-4 h-4 bg-indigo-300 rounded-full opacity-30"></div>
            </div>
          </header>
          
          <main>
            <CyberForgeAcademy />
          </main>
          
          <footer className="mt-12 text-center text-sm text-gray-500 p-6">
            <p>CyberForge Academy © {new Date().getFullYear()} - Propulsé par GPT-4o</p>
          </footer>
        </div>
      </div>
    </HomeLayout>
  );
}