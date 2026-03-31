import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Brain, FileUp, Sparkles, Upload, ArrowRight,
  BookOpen, Trash2, Play, Calendar, ChevronRight, Library
} from 'lucide-react';
import mcLogoPath from '@assets/mc2i.png';

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

interface SavedTraining {
  id: string;
  title: string;
  tagline: string;
  source: string;
  audience: string;
  gamificationLevel: string;
  createdAt: string;
}

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function sourceLabel(source: string) {
  if (source === 'prompt') return 'IA from scratch';
  if (source === 'documents') return 'Documents';
  if (source === 'url') return 'URL / Site web';
  return source;
}

export default function ModuleGenerator() {
  const [, setLocation] = useLocation();
  const [trainings, setTrainings] = useState<SavedTraining[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);

  const loadTrainings = useCallback(() => {
    fetch('/api/studio/trainings')
      .then(r => r.json())
      .then(data => setTrainings(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => { loadTrainings(); }, [loadTrainings]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Supprimer cette formation ? Cette action est irréversible.')) return;
    setDeleting(id);
    try {
      await fetch(`/api/studio/training/${id}`, { method: 'DELETE' });
      setTrainings(prev => prev.filter(t => t.id !== id));
    } catch {}
    setDeleting(null);
  };

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
        '7 mises en situation + 10 QCM générés',
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
        '7 mises en situation professionnelles',
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

      <main className="flex-1 pt-14">
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
              Choisissez votre approche. En quelques minutes, l'IA génère une formation complète avec mises en situation, QCM immersif et gamification.
            </p>
          </div>

          {/* Cartes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
            {cards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -2 }}
                onClick={() => setLocation(card.route)}
                className="cursor-pointer border border-gray-200 bg-white hover:border-gray-400 transition-all duration-200"
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

          {/* ─── Bibliothèque de formations ──────────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Library size={18} style={{ color: BLUE }} />
                <h2 className="text-xl font-black" style={{ color: DARK }}>Formations sauvegardées</h2>
              </div>
              {trainings.length > 0 && (
                <span className="text-xs font-bold px-2 py-1"
                  style={{ background: `${BLUE}12`, color: BLUE }}>
                  {trainings.length} formation{trainings.length > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {trainings.length === 0 ? (
              <div className="border border-dashed border-gray-200 p-12 text-center">
                <BookOpen size={28} className="mx-auto mb-3 text-gray-300" />
                <p className="text-sm text-gray-400">Aucune formation générée pour l'instant.</p>
                <p className="text-xs text-gray-300 mt-1">Vos formations apparaîtront ici après génération.</p>
              </div>
            ) : (
              <AnimatePresence>
                <div className="space-y-2">
                  {trainings.map((t, idx) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border border-gray-200 bg-white hover:border-gray-400 transition-all duration-150 group"
                    >
                      <div className="flex items-center gap-4 px-5 py-4">
                        {/* Icon */}
                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center border border-gray-100"
                          style={{ background: `${BLUE}08`, color: BLUE }}>
                          <BookOpen size={16} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-bold text-sm truncate" style={{ color: DARK }}>{t.title}</h3>
                          </div>
                          {t.tagline && (
                            <p className="text-xs text-gray-500 truncate">{t.tagline}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs font-medium px-1.5 py-0.5"
                              style={{ background: `${BLUE}10`, color: BLUE }}>
                              {sourceLabel(t.source)}
                            </span>
                            {t.createdAt && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar size={10} /> {formatDate(t.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => setLocation(`/playground/player/${t.id}`)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-white font-bold text-xs hover:opacity-90 transition-opacity"
                            style={{ background: BLUE }}>
                            <Play size={13} /> Jouer
                          </button>
                          <button
                            onClick={(e) => handleDelete(t.id, e)}
                            disabled={deleting === t.id}
                            className="w-9 h-9 flex items-center justify-center border border-gray-200 hover:border-red-300 hover:text-red-500 transition-colors text-gray-400 disabled:opacity-40"
                            title="Supprimer">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
