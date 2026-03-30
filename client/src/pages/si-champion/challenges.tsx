import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, Trophy, Clock, Star, CheckCircle2, Lock, Search } from 'lucide-react';
import mcLogoPath from '@assets/mc2i.png';
import { CHALLENGES, TRACKS, LEVELS, LEVEL_CONFIG, type Track, type Level } from '@/data/si-champion-challenges';

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

const STORAGE_KEY = 'si-champion-completed';

function getCompleted(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export default function ChallengesPage() {
  const [, navigate] = useLocation();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const [trackFilter, setTrackFilter] = useState<Track | 'all'>(() => {
    const t = searchParams.get('track');
    return (t && TRACKS.find(tr => tr.id === t) ? t as Track : 'all');
  });
  const [levelFilter, setLevelFilter] = useState<Level | 'all'>('all');
  const [search, setSearch] = useState('');
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    setCompleted(getCompleted());
  }, []);

  const filtered = CHALLENGES.filter(c => {
    if (trackFilter !== 'all' && c.track !== trackFilter) return false;
    if (levelFilter !== 'all' && c.level !== levelFilter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()) &&
        !c.context.toLowerCase().includes(search.toLowerCase()) &&
        !c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const totalPoints = CHALLENGES.reduce((s, c) => s + c.points, 0);
  const earnedPoints = CHALLENGES.filter(c => completed.includes(c.id)).reduce((s, c) => s + c.points, 0);

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
            <Link href="/si-champion">
              <span className="text-sm font-semibold text-gray-500 hover:text-gray-800 cursor-pointer">
                I AM SI CHAMPION
              </span>
            </Link>
            <div className="h-4 w-px bg-gray-200" />
            <span className="text-sm font-bold" style={{ color: DARK }}>Bibliothèque de défis</span>
          </div>
          {/* Score */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: BLUE }}>
              <Trophy size={16} />
              {earnedPoints.toLocaleString()} / {totalPoints.toLocaleString()} pts
            </div>
            <div className="w-24 h-1.5 bg-gray-200">
              <div className="h-full transition-all" style={{ width: `${(earnedPoints / totalPoints) * 100}%`, background: PINK }} />
            </div>
          </div>
        </div>
        <div className="h-0.5 w-full" style={{ background: PINK }} />
      </header>

      <main className="pt-16 max-w-7xl mx-auto px-6 py-8">
        {/* Back + Title */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/si-champion">
            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
              <ChevronLeft size={16} /> Retour
            </button>
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black" style={{ color: DARK }}>
              {filtered.length} défi{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}
            </h1>
            <p className="text-gray-500 mt-1">{completed.length} complétés · {CHALLENGES.length - completed.length} restants</p>
          </div>
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Chercher un défi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 text-sm focus:outline-none focus:border-gray-400 w-64"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {/* Track filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTrackFilter('all')}
              className="px-4 py-1.5 text-sm font-bold border-2 transition-colors"
              style={trackFilter === 'all'
                ? { borderColor: BLUE, background: BLUE, color: 'white' }
                : { borderColor: '#e5e7eb', color: '#6b7280' }}
            >
              Tous
            </button>
            {TRACKS.map(track => (
              <button
                key={track.id}
                onClick={() => setTrackFilter(track.id)}
                className="px-4 py-1.5 text-sm font-bold border-2 transition-colors"
                style={trackFilter === track.id
                  ? { borderColor: track.color, background: track.color, color: 'white' }
                  : { borderColor: '#e5e7eb', color: '#6b7280' }}
              >
                {track.icon} {track.label}
              </button>
            ))}
          </div>

          <div className="w-px bg-gray-200 mx-1 hidden md:block" />

          {/* Level filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setLevelFilter('all')}
              className="px-4 py-1.5 text-sm font-bold border-2 transition-colors"
              style={levelFilter === 'all'
                ? { borderColor: DARK, background: DARK, color: 'white' }
                : { borderColor: '#e5e7eb', color: '#6b7280' }}
            >
              Tous niveaux
            </button>
            {LEVELS.map(level => {
              const cfg = LEVEL_CONFIG[level];
              return (
                <button
                  key={level}
                  onClick={() => setLevelFilter(level)}
                  className="px-4 py-1.5 text-sm font-bold border-2 transition-colors capitalize"
                  style={levelFilter === level
                    ? { borderColor: cfg.color, background: cfg.color, color: 'white' }
                    : { borderColor: '#e5e7eb', color: '#6b7280' }}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <Search size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Aucun défi ne correspond à ta recherche</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((challenge, i) => {
              const isCompleted = completed.includes(challenge.id);
              const track = TRACKS.find(t => t.id === challenge.track)!;
              const levelCfg = LEVEL_CONFIG[challenge.level];

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border border-gray-200 p-5 cursor-pointer hover:border-gray-400 hover:shadow-md transition-all group relative"
                  onClick={() => navigate(`/si-champion/challenge/${challenge.id}`)}
                >
                  {/* Completed badge */}
                  {isCompleted && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
                    </div>
                  )}

                  {/* Track badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{track.icon}</span>
                    <span className="text-xs font-bold px-2 py-0.5" style={{ background: track.bgLight, color: track.color }}>
                      {track.label}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5" style={{ background: levelCfg.bg, color: levelCfg.color }}>
                      {levelCfg.label}
                    </span>
                  </div>

                  <h3 className="font-black text-base mb-2 leading-tight pr-6" style={{ color: DARK }}>
                    {challenge.title}
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">
                    {challenge.context}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {challenge.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 text-xs bg-gray-100 text-gray-500">{tag}</span>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> ~{challenge.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Star size={11} /> {challenge.points} pts
                      </span>
                    </div>
                    <ArrowRight size={16} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
