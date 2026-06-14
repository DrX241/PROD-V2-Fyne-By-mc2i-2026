import React from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Database, Code2, Table2 } from 'lucide-react';

const TRACKS = [
  {
    id: 'sql',
    label: 'SQL',
    tagline: 'Interroger et analyser des bases de données relationnelles',
    description: 'Maîtrisez SELECT, JOIN, GROUP BY et les agrégats sur PostgreSQL. QCM de niveau + mise en situation sur vraies données.',
    icon: Database,
    color: 'text-[#006a9e]',
    accentBg: 'bg-[#006a9e]/8',
    badge: 'bg-[#006a9e] text-white',
    halo: 'shadow-[0_22px_50px_rgba(0,106,158,0.10)]',
    strip: '#006a9e',
    route: '/portail-client/data/sql',
    available: true,
  },
  {
    id: 'python',
    label: 'Python',
    tagline: 'Manipuler et analyser des données avec pandas',
    description: 'Filtrage, groupby, merge, apply/lambda — sandbox Python réelle avec exécution de vrai code et coach IA.',
    icon: Code2,
    color: 'text-[#dd0061]',
    accentBg: 'bg-[#dd0061]/8',
    badge: 'bg-[#dd0061] text-white',
    halo: 'shadow-[0_22px_50px_rgba(221,0,97,0.10)]',
    strip: '#dd0061',
    route: '/portail-client/data/python',
    available: true,
  },
  {
    id: 'excel',
    label: 'Excel',
    tagline: 'Maîtriser les formules et l\'analyse de données dans Excel',
    description: 'SUM, AVERAGE, IF, COUNTIF, SUMIF — feuilles de calcul interactives avec formules réelles et coach IA.',
    icon: Table2,
    color: 'text-[#217346]',
    accentBg: 'bg-[#217346]/8',
    badge: 'bg-[#217346] text-white',
    halo: 'shadow-[0_22px_50px_rgba(33,115,70,0.10)]',
    strip: '#217346',
    route: '/portail-client/data/excel',
    available: true,
  },
];

export default function ClientDataChoicePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(0,106,158,0.10),_transparent_28%),radial-gradient(circle_at_82%_14%,_rgba(221,0,97,0.08),_transparent_24%),linear-gradient(180deg,_#fbfcfe_0%,_#f3f6fb_52%,_#f7f9fc_100%)] text-[#061019]">
      <header className="flex items-center justify-between px-6 py-3 bg-white/42 backdrop-blur shadow-[0_10px_30px_rgba(6,16,25,0.04)]">
        <button onClick={() => setLocation('/portail-client/accueil')} className="text-sm text-[#617286] hover:text-[#006a9e] transition-colors">
          ← Accueil
        </button>
        <div className="text-sm font-semibold tracking-wide text-[#006a9e]">FYNE DATA</div>
        <div />
      </header>

      <main className="px-5 py-8 md:px-8 md:py-12 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-10 mb-12 text-center"
        >
          <span className="text-xs font-semibold text-[#dd0061] uppercase tracking-widest">Mode Formation — Data</span>
          <h1 className="mt-3 text-3xl md:text-5xl font-black text-[#061019] leading-[0.98]">Quel langage choisis-tu ?</h1>
          <p className="mt-4 text-sm md:text-base text-[#617286]">QCM d'évaluation · mise en situation réelle · coach IA</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {TRACKS.map((track, i) => {
            const Icon = track.icon;
            return (
              <motion.button
                key={track.id}
                type="button"
                onClick={() => setLocation(track.route)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`group relative overflow-hidden text-left bg-white/54 backdrop-blur-[8px] ${track.halo} hover:-translate-y-1 hover:bg-white/72 transition-all duration-200 p-7 flex flex-col gap-5`}
              >
                <div className="absolute inset-x-0 top-0 h-1" style={{ background: track.strip }} />
                <div className={`inline-flex items-center justify-center w-14 h-14 ${track.accentBg} shadow-[0_10px_24px_rgba(6,16,25,0.04)]`}>
                  <Icon className={`w-7 h-7 ${track.color}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h2 className={`text-xl font-black ${track.color}`}>{track.label}</h2>
                    <span className={`text-[10px] font-bold px-2.5 py-1 ${track.badge}`}>Disponible</span>
                  </div>
                  <p className="text-sm font-semibold text-[#32485f] mb-3 leading-6">{track.tagline}</p>
                  <p className="text-[13px] text-[#617286] leading-7">{track.description}</p>
                </div>
                <div className={`mt-auto text-[13px] font-black ${track.color} flex items-center gap-1.5`}>
                  Commencer le parcours →
                </div>
              </motion.button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
