import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, FileUp, Sparkles, Upload, ArrowRight } from 'lucide-react';
import mcLogoPath from '@assets/mc2i.png';

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

export default function ModuleGenerator() {
  const [, setLocation] = useLocation();

  const cards = [
    {
      id: 'ia',
      badge: 'IA from scratch',
      icon: <Brain size={28} />,
      title: 'Générer avec l\'IA',
      description: 'Décrivez votre besoin en quelques mots. L\'IA puise dans sa base de connaissance pour créer une formation complète, adaptée à votre public cible.',
      bullets: [
        'Pitchez votre besoin en langage naturel',
        'L\'IA sélectionne les meilleures sources',
        'Scénarios, QCM et gamification générés',
        'Prêt en moins de 60 secondes',
      ],
      color: BLUE,
      route: '/playground/studio-ia',
    },
    {
      id: 'docs',
      badge: 'Depuis vos documents',
      icon: <FileUp size={28} />,
      title: 'Importer mes contenus',
      description: 'Apportez vos supports existants — PDF, PowerPoint, Word — ou l\'URL d\'un site web. L\'IA les transforme en formation interactive et engageante.',
      bullets: [
        'PDF, PowerPoint, Word et sites web',
        'Crawl automatique des pages du site',
        'Mises en situation dans la vraie vie',
        'Gamification adaptée au niveau',
      ],
      color: PINK,
      route: '/playground/studio-documents',
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ color: DARK }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="h-0.5 w-full" style={{ background: `${BLUE}20` }}>
          <div className="h-full w-full" style={{ background: PINK, width: '100%' }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation('/')} className="hover:opacity-60 transition-opacity">
              <ArrowLeft size={18} style={{ color: BLUE }} />
            </button>
            <img src={mcLogoPath} alt="mc2i" className="h-7 w-auto" />
            <div className="h-4 w-px bg-gray-200" />
            <span className="font-bold text-sm" style={{ color: BLUE }}>FYNE</span>
            <div className="h-4 w-px bg-gray-200 hidden sm:block" />
            <span className="text-sm text-gray-500 font-medium hidden sm:block">Studio de Formation</span>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-14 flex flex-col justify-center">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-16 w-full">
          {/* Titre */}
          <div className="mb-14">
            <div className="text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 inline-block"
              style={{ background: `${BLUE}12`, color: BLUE }}>
              Soyez qui vous voulez
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-none mb-4">
              <span style={{ color: PINK }}>Créez votre</span><br />
              <span style={{ color: DARK }}>formation</span><br />
              <span style={{ color: BLUE }}>sur mesure</span>
            </h1>
            <div className="w-16 h-1 mb-6" style={{ background: PINK }} />
            <p className="text-lg text-gray-600 leading-relaxed max-w-xl">
              Choisissez votre approche. En quelques minutes, l'IA génère une formation complète avec scénarios interactifs, QCM et gamification.
            </p>
          </div>

          {/* Cartes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -2 }}
                onClick={() => setLocation(card.route)}
                className="cursor-pointer border border-gray-200 bg-white hover:border-gray-400 transition-all duration-200"
                style={{ cursor: 'pointer' }}
              >
                <div className="p-8 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 flex items-center justify-center border border-gray-100"
                      style={{ background: `${card.color}10`, color: card.color }}>
                      {card.icon}
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest px-2 py-1"
                      style={{ background: `${card.color}12`, color: card.color }}>
                      {card.badge}
                    </span>
                  </div>

                  <h2 className="text-2xl font-black mb-3" style={{ color: DARK }}>
                    {card.title}
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-grow">
                    {card.description}
                  </p>

                  <ul className="space-y-2 mb-8">
                    {card.bullets.map((b, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-gray-700">
                        <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: card.color }} />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <button
                    className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold hover:opacity-90 transition-opacity text-sm w-full justify-center"
                    style={{ background: card.color }}
                  >
                    {card.id === 'ia' ? <Sparkles size={16} /> : <Upload size={16} />}
                    {card.title}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
