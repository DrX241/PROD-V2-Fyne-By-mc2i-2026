import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, FileUp, Brain, Upload, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ModuleGenerator() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#060d1a] to-[#0a1628] text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <button
          onClick={() => setLocation('/')}
          className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-10 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>

        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-600/20 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-widest mb-6">
            <Wand2 className="h-3.5 w-3.5" />
            Studio de Formation
          </div>
          <h1 className="text-5xl font-black mb-4 leading-tight">
            <span className="text-white">Soyez qui</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-500">vous voulez</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Créez une formation sur mesure en quelques minutes. Choisissez votre approche.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4 }}
            onClick={() => setLocation('/playground/studio-ia')}
            className="cursor-pointer group"
          >
            <div className="h-full rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-900/40 to-indigo-900/30 hover:border-violet-400/60 hover:shadow-2xl hover:shadow-violet-900/30 transition-all duration-300 overflow-hidden">
              <div className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold mb-4">
                  <Sparkles className="h-3 w-3" />
                  IA from scratch
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Générer avec l'IA
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Décrivez votre besoin en quelques mots. L'IA puise dans sa base de connaissance pour créer une formation complète, adaptée à votre public.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {[
                    "Pitchez votre besoin en langage naturel",
                    "L'IA sélectionne les meilleures sources",
                    "Scénarios, QCM et gamification générés",
                    "Prêt en moins de 60 secondes"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-5">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Créer avec l'IA
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4 }}
            onClick={() => setLocation('/playground/studio-documents')}
            className="cursor-pointer group"
          >
            <div className="h-full rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-900/40 to-teal-900/30 hover:border-emerald-400/60 hover:shadow-2xl hover:shadow-emerald-900/30 transition-all duration-300 overflow-hidden">
              <div className="p-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <FileUp className="h-8 w-8 text-white" />
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4">
                  <Upload className="h-3 w-3" />
                  Depuis vos documents
                </div>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Importer mes contenus
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  Apportez vos supports existants — PDF, PowerPoint, Word — et l'IA les transforme en une formation interactive et engageante.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {[
                    "Supporte PDF, PowerPoint et Word",
                    "Analyse sémantique du contenu",
                    "Mises en situation dans la vraie vie",
                    "Gamification adaptée au niveau"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold py-5">
                  <Upload className="h-4 w-4 mr-2" />
                  Importer mes contenus
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        <p className="text-center text-gray-600 text-sm mt-10">
          Les deux approches génèrent des formations avec scénarios interactifs, QCM et système de gamification complet.
        </p>
      </div>
    </div>
  );
}
