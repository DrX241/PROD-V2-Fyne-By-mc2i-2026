import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Terminal, Database, Code2, BarChart3, Trophy, Zap, Target, Clock } from 'lucide-react';
import mcLogoPath from '@assets/mc2i.png';
import { CHALLENGES, TRACKS, getTotalPoints } from '@/data/si-champion-challenges';

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

const trackIcons: Record<string, React.ReactNode> = {
  python: <Terminal size={28} />,
  sql: <Database size={28} />,
  javascript: <Code2 size={28} />,
  data: <BarChart3 size={28} />,
};

const stats = [
  { value: CHALLENGES.length, label: 'défis pratiques', icon: <Target size={18} /> },
  { value: getTotalPoints().toLocaleString(), label: 'points à gagner', icon: <Trophy size={18} /> },
  { value: 4, label: 'technologies', icon: <Zap size={18} /> },
  { value: '~' + Math.round(CHALLENGES.reduce((s, c) => s + c.duration, 0) / 60) + 'h', label: 'de pratique', icon: <Clock size={18} /> },
];

export default function SiChampionHub() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-white text-[#061019]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <img src={mcLogoPath} alt="mc2i" className="h-7 w-auto cursor-pointer" />
            </Link>
            <div className="h-4 w-px bg-gray-200" />
            <span className="text-base font-bold" style={{ color: BLUE }}>FYNE</span>
            <div className="h-4 w-px bg-gray-200" />
            <span className="text-sm font-semibold text-gray-500">I AM SI CHAMPION</span>
          </div>
          <Link href="/si-champion/challenges">
            <button className="inline-flex items-center gap-2 px-6 py-2.5 text-white text-sm font-bold" style={{ background: PINK }}>
              Commencer à coder <ArrowRight size={16} />
            </button>
          </Link>
        </div>
        <div className="h-0.5 w-full" style={{ background: PINK }} />
      </header>

      <main className="pt-16">
        {/* Hero */}
        <section className="border-b border-gray-100 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold mb-6 border"
                style={{ borderColor: PINK, color: PINK }}>
                <Zap size={12} />
                NOUVEAU MODULE — PRATIQUE RÉELLE
              </div>
              <h1 className="text-5xl font-black tracking-tight mb-4" style={{ color: DARK }}>
                I AM<br />
                <span style={{ color: BLUE }}>SI</span>{' '}
                <span style={{ color: PINK }}>CHAMPION</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mb-8 leading-relaxed">
                L'environnement de code interactif de FYNE. Pratique Python, SQL, JavaScript et la Data dans un vrai environnement d'exécution — comme les pros.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/si-champion/challenges">
                  <button className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold text-base" style={{ background: BLUE }}>
                    Voir les défis <ArrowRight size={18} />
                  </button>
                </Link>
                <Link href="/si-champion/challenges?track=python">
                  <button className="inline-flex items-center gap-2 px-8 py-4 font-bold text-base border-2 border-gray-200 text-gray-700 hover:border-gray-400 transition-colors">
                    Démarrer en Python
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Stats band */}
        <section className="py-8 px-6 bg-gray-50 border-b border-gray-100">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-1.5 mb-1" style={{ color: BLUE }}>
                  {s.icon}
                </div>
                <div className="text-3xl font-black" style={{ color: DARK }}>{s.value}</div>
                <div className="text-sm text-gray-500 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Tracks */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-black mb-2" style={{ color: DARK }}>
              4 TRACKS DE COMPÉTENCES
            </h2>
            <p className="text-gray-500 mb-10">Des défis contextualisés dans des situations réelles de consultant mc2i.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TRACKS.map((track, i) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.12 }}
                  className="border border-gray-200 p-6 cursor-pointer hover:border-gray-400 transition-all group"
                  onClick={() => navigate(`/si-champion/challenges?track=${track.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center text-2xl border border-gray-200"
                        style={{ background: track.bgLight }}>
                        {track.icon}
                      </div>
                      <div>
                        <div className="font-black text-lg" style={{ color: DARK }}>{track.label}</div>
                        <div className="text-sm font-bold" style={{ color: track.color }}>
                          {track.count} défis
                        </div>
                      </div>
                    </div>
                    <ArrowRight size={20} className="text-gray-300 group-hover:text-gray-600 transition-colors mt-1" />
                  </div>
                  <p className="text-gray-500 text-sm">{track.description}</p>
                  <div className="mt-4 flex gap-2">
                    {(['débutant', 'intermédiaire', 'expert'] as const).map(level => {
                      const count = CHALLENGES.filter(c => c.track === track.id && c.level === level).length;
                      if (count === 0) return null;
                      return (
                        <span key={level} className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600">
                          {count} {level}
                        </span>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="py-16 px-6 border-t border-gray-100 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-black mb-10" style={{ color: DARK }}>
              UN VRAI ENVIRONNEMENT DE CODE
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Choisis un défi',
                  desc: 'Filtre par technologie et niveau. Chaque défi est basé sur un cas réel de mission mc2i.',
                  color: BLUE,
                },
                {
                  step: '02',
                  title: 'Code dans l\'éditeur',
                  desc: 'Écris ton code dans un éditeur Monaco (identique à VS Code) avec coloration syntaxique complète.',
                  color: PINK,
                },
                {
                  step: '03',
                  title: 'Exécute & valide',
                  desc: 'Ton code s\'exécute réellement côté serveur. Les tests vérifient ton output automatiquement.',
                  color: DARK,
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="relative"
                >
                  <div className="text-6xl font-black opacity-10 mb-3 select-none" style={{ color: item.color }}>
                    {item.step}
                  </div>
                  <h3 className="text-lg font-black mb-2" style={{ color: DARK }}>{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 px-6 border-t border-gray-100">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-black mb-2" style={{ color: DARK }}>
                Prêt à coder comme un SI Champion ?
              </h2>
              <p className="text-gray-500">30 défis, 4 technologies, exécution réelle. À toi de jouer.</p>
            </div>
            <Link href="/si-champion/challenges">
              <button className="inline-flex items-center gap-2 px-10 py-4 text-white font-bold text-base whitespace-nowrap" style={{ background: PINK }}>
                Lancer les défis <ArrowRight size={18} />
              </button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
