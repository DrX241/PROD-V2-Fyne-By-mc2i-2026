import React, { useState, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Shield, AlertTriangle, CheckCircle,
  XCircle, Trophy, RefreshCw, Mail, Phone, Wifi, ExternalLink,
  MessageSquare, Monitor, Share2, Loader2, ChevronRight, Flag,
  Lock, Star, Target, Zap, Eye
} from 'lucide-react';
import mcLogoPath from "@assets/mc2i.png";

// ─── COULEURS MC2I ────────────────────────────────────────────────────────────
const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

// ─── TYPES ───────────────────────────────────────────────────────────────────
type Level = 'debutant' | 'intermediaire' | 'expert';

interface AssessmentQuestion {
  id: string;
  question: string;
  context?: string;
  options: { label: string; sublabel?: string; score: number }[];
}

interface ScenarioVisual {
  type: 'email' | 'sms' | 'phone-call' | 'browser-popup' | 'social-post';
  from?: string;
  fromEmail?: string;
  subject?: string;
  body: string;
  hasClickableLink?: boolean;
  linkLabel?: string;
  linkUrl?: string;
}

interface ScenarioChoice {
  label: string;
  isCorrect: boolean;
  feedback: string;
  points: number;
}

interface Scenario {
  category: string;
  title: string;
  context: string;
  visual: ScenarioVisual;
  choices: ScenarioChoice[];
  reflexe: string;
  clickConsequence?: string;
  redFlags?: string[];
}

type Phase =
  | 'intro'
  | 'assessment'
  | 'level-reveal'
  | 'loading'
  | 'error'
  | 'scenario'
  | 'trap-clicked'
  | 'answered'
  | 'reflexe'
  | 'final';

// ─── QUESTIONS D'ÉVALUATION ───────────────────────────────────────────────────
const ASSESSMENT: AssessmentQuestion[] = [
  {
    id: 'q1',
    question: 'Vous recevez un email urgent de votre banque vous demandant de cliquer sur un lien pour "débloquer votre compte". Que faites-vous ?',
    context: '📧 Un email avec votre logo de banque vient d\'arriver',
    options: [
      { label: 'Je clique sur le lien, c\'est urgent', sublabel: 'Il faut vite régler ça', score: 0 },
      { label: 'Je vérifie l\'adresse email de l\'expéditeur', sublabel: 'Avant de faire quoi que ce soit', score: 1 },
      { label: 'Je vais directement sur le site de ma banque', sublabel: 'Sans jamais cliquer sur le lien', score: 2 },
    ],
  },
  {
    id: 'q2',
    question: 'Combien de mots de passe différents utilisez-vous au quotidien ?',
    context: '🔑 Vos comptes : email, banque, réseaux sociaux, shopping...',
    options: [
      { label: '1 ou 2 mots de passe', sublabel: 'C\'est plus simple à retenir', score: 0 },
      { label: 'Quelques mots de passe différents', sublabel: 'Selon l\'importance du compte', score: 1 },
      { label: 'Un mot de passe unique par site', sublabel: 'Géré par un gestionnaire de mots de passe', score: 2 },
    ],
  },
  {
    id: 'q3',
    question: 'Un inconnu vous appelle, se présente comme du "support informatique" et demande votre mot de passe pour "résoudre un problème urgent".',
    context: '📞 Numéro inconnu, voix professionnelle, il connaît votre nom',
    options: [
      { label: 'Je lui donne mon mot de passe', sublabel: 'Il semble officiel et sérieux', score: 0 },
      { label: 'Je lui demande de me rappeler via le numéro officiel', sublabel: 'Pour vérifier son identité', score: 1 },
      { label: 'Je raccroche et signale l\'incident', sublabel: 'Aucun IT légitime ne demande un mot de passe', score: 2 },
    ],
  },
  {
    id: 'q4',
    question: 'La double authentification (2FA), pour vous c\'est...',
    context: '🔒 Sécuriser l\'accès à vos comptes',
    options: [
      { label: 'Je ne sais pas ce que c\'est', sublabel: 'Ça ne me dit rien', score: 0 },
      { label: 'Un code SMS en plus de mon mot de passe', sublabel: 'Je l\'utilise sur certains comptes', score: 1 },
      { label: 'Activée sur tous mes comptes importants', sublabel: 'Email, banque, réseaux sociaux...', score: 2 },
    ],
  },
  {
    id: 'q5',
    question: 'Parmi ces URLs, laquelle vous semble suspecte ?',
    context: '🌐 Regardez attentivement chaque adresse',
    options: [
      { label: 'Elles me semblent toutes pareilles', sublabel: 'Je ne sais pas les distinguer', score: 0 },
      { label: 'credit-agricole.fr.secure-login.com est suspect', sublabel: 'Le vrai domaine n\'est pas au bon endroit', score: 1 },
      { label: 'Je repère tous les sous-domaines trompeurs', sublabel: 'Homographes, caractères similaires, HTTPS trompeur...', score: 2 },
    ],
  },
];

const TOTAL_SCENARIOS = 10;
const MAX_SCORE = TOTAL_SCENARIOS * 10;

// ─── CALCUL DU NIVEAU ─────────────────────────────────────────────────────────
function computeLevel(answers: number[]): Level {
  const total = answers.reduce((a, b) => a + b, 0);
  if (total <= 3) return 'debutant';
  if (total <= 7) return 'intermediaire';
  return 'expert';
}

const LEVEL_META: Record<Level, { label: string; desc: string; color: string; bg: string; icon: React.ReactNode }> = {
  debutant: {
    label: 'Débutant',
    desc: 'Vous avez les bases. Les scénarios vont vous apprendre les arnaques les plus courantes.',
    color: '#16a34a',
    bg: '#f0fdf4',
    icon: <Shield size={24} />,
  },
  intermediaire: {
    label: 'Intermédiaire',
    desc: 'Vous avez quelques réflexes. Les scénarios vont tester votre vigilance face à des attaques plus subtiles.',
    color: '#d97706',
    bg: '#fffbeb',
    icon: <Target size={24} />,
  },
  expert: {
    label: 'Expert',
    desc: 'Vous maîtrisez les bases. Les scénarios vont confronter vos connaissances aux attaques les plus sophistiquées.',
    color: BLUE,
    bg: '#eff6ff',
    icon: <Zap size={24} />,
  },
};

function getBadge(score: number) {
  const pct = (score / MAX_SCORE) * 100;
  if (pct >= 70) return { label: 'Sécurisé', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
  if (pct >= 40) return { label: 'Prudent', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  return { label: 'Vulnérable', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
}

// ─── VISUELS INTERACTIFS ──────────────────────────────────────────────────────
function EmailVisual({ visual, onLinkClick }: { visual: ScenarioVisual; onLinkClick: () => void }) {
  return (
    <div className="w-full border border-gray-200 shadow-sm bg-white">
      <div className="px-4 py-2 flex items-center gap-2" style={{ background: '#f3f4f6' }}>
        <div className="flex gap-1.5"><div className="w-3 h-3 bg-red-400 rounded-full" /><div className="w-3 h-3 bg-yellow-400 rounded-full" /><div className="w-3 h-3 bg-green-400 rounded-full" /></div>
        <div className="flex-1 text-xs text-gray-500 text-center">Boîte de réception</div>
      </div>
      <div className="border-b border-gray-100 px-4 py-3 bg-gray-50">
        <div className="text-xs text-gray-500 mb-0.5">
          De : <span className="font-medium text-gray-800">{visual.from}</span>
          {visual.fromEmail && <span className="ml-1 text-red-500 font-mono">&lt;{visual.fromEmail}&gt;</span>}
        </div>
        {visual.subject && <div className="text-sm font-semibold text-gray-900">{visual.subject}</div>}
      </div>
      <div className="px-4 py-4">
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{visual.body}</div>
        {visual.hasClickableLink && visual.linkLabel && (
          <div className="mt-4">
            <button onClick={onLinkClick} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80" style={{ background: BLUE }}>
              <ExternalLink size={13} />{visual.linkLabel}
            </button>
            {visual.linkUrl && <div className="mt-1 text-xs text-gray-400 font-mono break-all">{visual.linkUrl}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

function SmsVisual({ visual, onLinkClick }: { visual: ScenarioVisual; onLinkClick: () => void }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="overflow-hidden shadow-md" style={{ background: '#1c1c1e', borderRadius: 0 }}>
        <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-700">
          <MessageSquare size={16} className="text-green-400" />
          <span className="text-white text-sm font-semibold">{visual.from || 'Message'}</span>
        </div>
        <div className="p-4 min-h-32 bg-gray-100">
          <div className="max-w-xs">
            <div className="bg-white shadow-sm px-3 py-2 inline-block">
              <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{visual.body}</div>
              {visual.hasClickableLink && visual.linkUrl && (
                <button onClick={onLinkClick} className="mt-2 block text-xs font-medium underline break-all" style={{ color: BLUE }}>
                  {visual.linkUrl}
                </button>
              )}
              <div className="text-right text-xs text-gray-400 mt-1">À l'instant · Lu</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PhoneCallVisual({ visual }: { visual: ScenarioVisual }) {
  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="bg-gray-900 shadow-lg">
        <div className="px-6 py-6 text-center border-b border-gray-700">
          <div className="w-14 h-14 bg-green-500 flex items-center justify-center mx-auto mb-3">
            <Phone size={24} className="text-white" />
          </div>
          <div className="text-white font-bold">{visual.from || 'Numéro inconnu'}</div>
          <div className="text-gray-400 text-sm">Appel entrant — en cours</div>
        </div>
        <div className="p-4">
          <div className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-2">Transcription</div>
          <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{visual.body}</div>
        </div>
      </div>
    </div>
  );
}

function BrowserPopupVisual({ visual, onLinkClick }: { visual: ScenarioVisual; onLinkClick: () => void }) {
  return (
    <div className="w-full border border-gray-300 shadow-md">
      <div className="bg-gray-200 px-3 py-2 flex items-center gap-2 border-b border-gray-300">
        <div className="flex gap-1"><div className="w-2.5 h-2.5 bg-red-400 rounded-full" /><div className="w-2.5 h-2.5 bg-yellow-400 rounded-full" /><div className="w-2.5 h-2.5 bg-green-400 rounded-full" /></div>
        <div className="flex-1 bg-white border border-gray-300 px-3 py-1 text-xs text-gray-600 font-mono flex items-center gap-1">
          <Monitor size={10} />{visual.linkUrl || 'https://...'}
        </div>
      </div>
      <div className="p-6 bg-white">
        {visual.subject && <div className="text-lg font-bold text-gray-900 mb-3">{visual.subject}</div>}
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-4">{visual.body}</div>
        {visual.hasClickableLink && (
          <button onClick={onLinkClick} className="px-6 py-2.5 text-white text-sm font-bold" style={{ background: PINK }}>
            {visual.linkLabel || 'Continuer'}
          </button>
        )}
      </div>
    </div>
  );
}

function SocialPostVisual({ visual, onLinkClick }: { visual: ScenarioVisual; onLinkClick: () => void }) {
  return (
    <div className="w-full bg-white border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <div className="w-9 h-9 bg-blue-100 flex items-center justify-center">
          <Share2 size={16} style={{ color: BLUE }} />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">{visual.from}</div>
          <div className="text-xs text-gray-400">il y a quelques minutes · Public</div>
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{visual.body}</div>
        {visual.hasClickableLink && visual.linkLabel && (
          <button onClick={onLinkClick} className="mt-3 flex items-center gap-1 text-sm font-medium" style={{ color: BLUE }}>
            <ExternalLink size={13} />{visual.linkLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function MonsieurToutLeMonde() {
  const [, setLocation] = useLocation();

  // Évaluation
  const [assessmentIndex, setAssessmentIndex] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Niveau
  const [level, setLevel] = useState<Level>('debutant');

  // Scénarios
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scenarios, setScenarios] = useState<(Scenario | null)[]>(Array(TOTAL_SCENARIOS).fill(null));
  const [loadingNext, setLoadingNext] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<ScenarioChoice | null>(null);
  const [trapClicked, setTrapClicked] = useState(false);
  const [showRedFlags, setShowRedFlags] = useState(false);

  const currentScenario = scenarios[currentIndex];
  const progress = phase === 'assessment' || phase === 'level-reveal'
    ? 0
    : ((currentIndex) / TOTAL_SCENARIOS) * 100;

  // ── Évaluation ─────────────────────────────────────────────────────────────
  const handleOptionSelect = (optionScore: number, optionIndex: number) => {
    setSelectedOption(optionIndex);
    setTimeout(() => {
      const newAnswers = [...assessmentAnswers, optionScore];
      setAssessmentAnswers(newAnswers);
      setSelectedOption(null);
      if (assessmentIndex + 1 < ASSESSMENT.length) {
        setAssessmentIndex(assessmentIndex + 1);
      } else {
        const detectedLevel = computeLevel(newAnswers);
        setLevel(detectedLevel);
        setPhase('level-reveal');
      }
    }, 350);
  };

  // ── Chargement scénario ────────────────────────────────────────────────────
  const fetchScenario = useCallback(async (index: number, lvl: Level): Promise<Scenario | null> => {
    setLoadingNext(true);
    try {
      const resp = await fetch('/api/cyber/mtm-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioIndex: index, level: lvl }),
      });
      const data = await resp.json();
      if (data.success && data.scenario) {
        setScenarios(prev => { const n = [...prev]; n[index] = data.scenario; return n; });
        return data.scenario;
      }
      return null;
    } catch { return null; }
    finally { setLoadingNext(false); }
  }, []);

  const startScenarios = async (lvl: Level) => {
    setPhase('loading');
    const s = await fetchScenario(0, lvl);
    setPhase(s ? 'scenario' : 'error');
    if (s && TOTAL_SCENARIOS > 1) fetchScenario(1, lvl);
  };

  // ── Actions scénario ───────────────────────────────────────────────────────
  const handleLinkClick = () => {
    if (!currentScenario) return;
    setTrapClicked(true);
    setPhase('trap-clicked');
    setScore(s => s - 5);
    setWrongCount(w => w + 1);
  };

  const handleChoice = (choice: ScenarioChoice) => {
    if (phase !== 'scenario') return;
    setSelectedChoice(choice);
    setPhase('answered');
    setScore(s => s + choice.points);
    if (!choice.isCorrect) setWrongCount(w => w + 1);
  };

  const handleNextScenario = async () => {
    const next = currentIndex + 1;
    if (next >= TOTAL_SCENARIOS) { setPhase('final'); return; }
    setSelectedChoice(null);
    setTrapClicked(false);
    setShowRedFlags(false);
    setCurrentIndex(next);
    if (!scenarios[next]) {
      setPhase('loading');
      const loaded = await fetchScenario(next, level);
      setPhase(loaded ? 'scenario' : 'error');
      if (loaded && next + 1 < TOTAL_SCENARIOS && !scenarios[next + 1]) fetchScenario(next + 1, level);
    } else {
      setPhase('scenario');
    }
  };

  const handleRestart = () => {
    setPhase('intro');
    setAssessmentIndex(0);
    setAssessmentAnswers([]);
    setSelectedOption(null);
    setLevel('debutant');
    setCurrentIndex(0);
    setScenarios(Array(TOTAL_SCENARIOS).fill(null));
    setScore(0);
    setWrongCount(0);
    setSelectedChoice(null);
    setTrapClicked(false);
    setShowRedFlags(false);
  };

  const badge = getBadge(score);
  const levelMeta = LEVEL_META[level];

  const renderVisual = (s: Scenario) => {
    const t = s.visual?.type;
    if (t === 'sms') return <SmsVisual visual={s.visual} onLinkClick={handleLinkClick} />;
    if (t === 'phone-call') return <PhoneCallVisual visual={s.visual} />;
    if (t === 'browser-popup') return <BrowserPopupVisual visual={s.visual} onLinkClick={handleLinkClick} />;
    if (t === 'social-post') return <SocialPostVisual visual={s.visual} onLinkClick={handleLinkClick} />;
    return <EmailVisual visual={s.visual} onLinkClick={handleLinkClick} />;
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fff', color: DARK, fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="h-0.5 w-full bg-gray-100">
          <div className="h-full transition-all duration-700" style={{ width: `${progress}%`, background: PINK }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation('/cyber/roleplay')} className="hover:opacity-60 transition-opacity">
              <ArrowLeft size={18} style={{ color: BLUE }} />
            </button>
            <img src={mcLogoPath} alt="mc2i" className="h-7 w-auto" />
            <div className="h-4 w-px bg-gray-200" />
            <span className="font-bold text-sm" style={{ color: BLUE }}>FYNE</span>
            <div className="h-4 w-px bg-gray-200 hidden sm:block" />
            <span className="text-sm text-gray-500 font-medium hidden sm:block">Monsieur Tout le Monde</span>
          </div>
          <div className="flex items-center gap-3">
            {(phase === 'scenario' || phase === 'answered' || phase === 'reflexe' || phase === 'trap-clicked') && (
              <>
                <div className="px-2 py-0.5 text-xs font-bold" style={{ background: levelMeta.bg, color: levelMeta.color }}>
                  {levelMeta.label}
                </div>
                <span className="text-xs text-gray-400">{currentIndex + 1}/{TOTAL_SCENARIOS}</span>
                <span className="text-sm font-bold" style={{ color: score >= 0 ? BLUE : PINK }}>
                  {score > 0 ? '+' : ''}{score} pts
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 pt-14">
        <AnimatePresence mode="wait">

          {/* ═══════════════════════════════ INTRO ═══════════════════════════ */}
          {phase === 'intro' && (
            <motion.div key="intro" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="min-h-screen flex flex-col lg:flex-row">
              <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-16">
                <div className="max-w-xl">
                  <div className="text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 inline-block" style={{ background: `${BLUE}12`, color: BLUE }}>
                    Formation Cybersécurité · Grand Public
                  </div>
                  <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-none">
                    <span style={{ color: PINK }}>Je suis</span><br />
                    <span style={{ color: DARK }}>Monsieur</span><br />
                    <span style={{ color: BLUE }}>Tout le Monde</span>
                  </h1>
                  <div className="w-16 h-1 mb-7" style={{ background: PINK }} />
                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    5 questions pour évaluer votre niveau, puis 10 scénarios réalistes sélectionnés par l'IA et adaptés à votre profil. Phishing, arnaques, vishing... êtes-vous prêt ?
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-10">
                    {[
                      { icon: <Target size={16} />, label: 'Niveau adaptatif', sub: '5 questions d\'évaluation' },
                      { icon: <Zap size={16} />, label: '60 scénarios', sub: 'Banque de situations réelles' },
                      { icon: <Trophy size={16} />, label: 'Bilan personnalisé', sub: 'Score et recommandations' },
                    ].map((item, i) => (
                      <div key={i} className="border border-gray-100 p-3 bg-gray-50">
                        <div className="mb-1.5" style={{ color: BLUE }}>{item.icon}</div>
                        <div className="text-xs font-bold text-gray-900">{item.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{item.sub}</div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setPhase('assessment')} className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity" style={{ background: BLUE }}>
                    Évaluer mon niveau <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <div className="hidden lg:flex w-72 border-l border-gray-100 flex-col justify-center px-8 py-16" style={{ background: '#fafafa' }}>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Thèmes couverts</div>
                <div className="space-y-2">
                  {['Phishing par email', 'Arnaques SMS', 'Vishing (téléphone)', 'Mots de passe', 'WiFi public', 'Pièces jointes', 'Réseaux sociaux', 'Ingénierie sociale', 'Double authentification', 'Signalement'].map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: i % 2 === 0 ? PINK : BLUE }} />
                      <span className="text-xs text-gray-600">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════ ÉVALUATION ══════════════════════════ */}
          {phase === 'assessment' && (
            <motion.div key={`assess-${assessmentIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="min-h-screen flex flex-col">
              {/* Barre de progression évaluation */}
              <div className="border-b border-gray-100 px-8 py-4 flex items-center gap-4">
                <span className="text-xs text-gray-400 font-medium">Évaluation de votre niveau</span>
                <div className="flex-1 flex items-center gap-1.5">
                  {ASSESSMENT.map((_, i) => (
                    <div key={i} className="h-1.5 flex-1 transition-all duration-300"
                      style={{ background: i < assessmentIndex ? BLUE : i === assessmentIndex ? `${BLUE}50` : '#e5e7eb' }} />
                  ))}
                </div>
                <span className="text-xs font-bold" style={{ color: BLUE }}>{assessmentIndex + 1} / {ASSESSMENT.length}</span>
              </div>

              {/* Question */}
              <div className="flex-1 flex flex-col lg:flex-row">
                <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-12">
                  <div className="max-w-2xl">
                    {ASSESSMENT[assessmentIndex].context && (
                      <div className="text-sm text-gray-500 mb-4 px-4 py-2 border-l-2" style={{ borderColor: BLUE }}>
                        {ASSESSMENT[assessmentIndex].context}
                      </div>
                    )}
                    <h2 className="text-2xl lg:text-3xl font-black text-gray-900 mb-8 leading-tight">
                      {ASSESSMENT[assessmentIndex].question}
                    </h2>
                    <div className="space-y-3">
                      {ASSESSMENT[assessmentIndex].options.map((opt, i) => (
                        <motion.button
                          key={i}
                          onClick={() => handleOptionSelect(opt.score, i)}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full text-left border px-5 py-4 transition-all flex items-start gap-4 group"
                          style={{
                            borderColor: selectedOption === i ? BLUE : '#e5e7eb',
                            background: selectedOption === i ? `${BLUE}08` : 'white',
                          }}
                        >
                          <span className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-xs font-bold border transition-colors"
                            style={{ borderColor: selectedOption === i ? BLUE : '#d1d5db', color: selectedOption === i ? BLUE : '#6b7280' }}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{opt.label}</div>
                            {opt.sublabel && <div className="text-xs text-gray-500 mt-0.5">{opt.sublabel}</div>}
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hidden lg:flex w-64 border-l border-gray-100 flex-col justify-center px-8" style={{ background: '#fafafa' }}>
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-4 font-bold">Votre progression</div>
                  <div className="space-y-3">
                    {ASSESSMENT.map((q, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0"
                          style={{ background: i < assessmentIndex ? BLUE : i === assessmentIndex ? `${BLUE}20` : '#f3f4f6' }}>
                          {i < assessmentIndex ? <CheckCircle size={12} className="text-white" /> :
                           i === assessmentIndex ? <div className="w-1.5 h-1.5 rounded-full" style={{ background: BLUE }} /> :
                           <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />}
                        </div>
                        <span className="text-xs" style={{ color: i <= assessmentIndex ? DARK : '#9ca3af' }}>
                          Question {i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════ RÉVÉLATION NIVEAU ═══════════════════ */}
          {phase === 'level-reveal' && (
            <motion.div key="level-reveal" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-8">
              <div className="max-w-lg w-full text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: BLUE }}>
                    Évaluation terminée
                  </div>
                  <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6"
                    style={{ background: levelMeta.bg, color: levelMeta.color }}>
                    {levelMeta.icon}
                  </div>
                  <h2 className="text-4xl font-black mb-3" style={{ color: DARK }}>Niveau</h2>
                  <h1 className="text-6xl font-black mb-6" style={{ color: levelMeta.color }}>
                    {levelMeta.label}
                  </h1>
                  <div className="w-16 h-1 mx-auto mb-6" style={{ background: levelMeta.color }} />
                  <p className="text-gray-600 mb-10 leading-relaxed">{levelMeta.desc}</p>
                  <div className="mb-8 border border-gray-100 p-4 bg-gray-50 text-left">
                    <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Les 10 scénarios vont couvrir</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                      {[
                        level === 'debutant' ? ['Phishing évident', 'Arnaques SMS', 'Faux support téléphonique', 'Popups virus', 'WiFi non sécurisé', 'Pièces jointes', 'Arnaques cadeaux', 'Usurpation d\'identité', 'Faux emails banque', 'Réflexes de base']
                        : level === 'intermediaire' ? ['Phishing sophistiqué', 'Credential stuffing', 'Ingénierie sociale', 'Vishing professionnel', 'Extensions malveillantes', 'Faux sites e-commerce', 'Arnaque romantique', 'Supply chain', 'OAuth phishing', 'Macros Office']
                        : ['CEO Fraud / BEC', 'Deepfake voix', 'Watering hole', 'Double extorsion', 'Spear phishing', 'Supply chain logiciel', 'SIM swapping avancé', 'Insider threat', 'OAuth avancé', 'Exfiltration DNS']
                      ].flat().map((t, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs text-gray-600">
                          <ChevronRight size={10} style={{ color: levelMeta.color }} />{t}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => startScenarios(level)}
                    className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity"
                    style={{ background: levelMeta.color }}>
                    Démarrer les scénarios <ArrowRight size={18} />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════ CHARGEMENT ══════════════════════════ */}
          {phase === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center">
              <Loader2 size={32} className="animate-spin mb-4" style={{ color: BLUE }} />
              <p className="text-gray-600 font-medium">Sélection du scénario adapté à votre niveau…</p>
              <p className="text-xs text-gray-400 mt-1">Niveau : <span className="font-bold" style={{ color: levelMeta.color }}>{levelMeta.label}</span></p>
            </motion.div>
          )}

          {/* ═══════════════════════════ ERREUR ══════════════════════════════ */}
          {phase === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-8">
              <div className="max-w-md w-full text-center">
                <div className="w-16 h-16 flex items-center justify-center mx-auto mb-6" style={{ background: `${PINK}15` }}>
                  <AlertTriangle size={28} style={{ color: PINK }} />
                </div>
                <h2 className="text-2xl font-black mb-3">Scénario indisponible</h2>
                <p className="text-gray-600 mb-8">Impossible de charger le scénario. Réessayez.</p>
                <button onClick={() => startScenarios(level)} className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold" style={{ background: BLUE }}>
                  <RefreshCw size={15} /> Réessayer
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════ SCÉNARIO ════════════════════════════ */}
          {phase === 'scenario' && currentScenario && (
            <motion.div key={`sc-${currentIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="min-h-screen flex flex-col lg:flex-row">
              {/* Colonne gauche — visuel */}
              <div className="flex-1 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col">
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 text-white" style={{ background: PINK }}>
                      Scénario {currentIndex + 1}/{TOTAL_SCENARIOS}
                    </div>
                    <div className="text-xs px-2 py-0.5 font-medium" style={{ background: levelMeta.bg, color: levelMeta.color }}>
                      {levelMeta.label}
                    </div>
                  </div>
                  <h2 className="text-xl font-black text-gray-900">{currentScenario.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">{currentScenario.context}</p>
                </div>
                <div className="flex-1 px-6 py-5 overflow-y-auto">
                  {renderVisual(currentScenario)}
                  {currentScenario.redFlags && currentScenario.redFlags.length > 0 && (
                    <div className="mt-4">
                      <button onClick={() => setShowRedFlags(!showRedFlags)}
                        className="text-xs flex items-center gap-1 font-medium hover:opacity-70 transition-opacity"
                        style={{ color: PINK }}>
                        <Flag size={11} />{showRedFlags ? 'Masquer les indices' : 'Afficher des indices 💡'}
                      </button>
                      <AnimatePresence>
                        {showRedFlags && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                            <div className="mt-2 border border-red-100 bg-red-50 px-4 py-3">
                              <div className="text-xs font-bold text-red-700 mb-2 uppercase tracking-wider">Indices suspects</div>
                              <ul className="space-y-1">
                                {currentScenario.redFlags.map((f, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-red-600">
                                    <XCircle size={11} className="mt-0.5 flex-shrink-0" />{f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>

              {/* Colonne droite — choix */}
              <div className="w-full lg:w-80 flex flex-col">
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Que faites-vous ?</div>
                </div>
                <div className="flex-1 px-6 py-5 flex flex-col gap-3">
                  {currentScenario.choices.map((c, i) => (
                    <motion.button key={i} onClick={() => handleChoice(c)} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                      className="w-full text-left border border-gray-200 px-4 py-3.5 text-sm font-medium text-gray-800 hover:border-gray-400 transition-all flex items-start gap-3">
                      <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-xs font-bold border border-gray-300 mt-0.5" style={{ color: BLUE }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {c.label}
                    </motion.button>
                  ))}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <div className="text-xs text-gray-400">Score : <span className="font-bold" style={{ color: score >= 0 ? BLUE : PINK }}>{score} pts</span></div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════ PIÈGE CLIQUÉ ════════════════════════ */}
          {phase === 'trap-clicked' && currentScenario && (
            <motion.div key="trap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-8">
              <div className="max-w-lg w-full">
                <div className="border-l-4 border-red-500 bg-red-50 px-6 py-7 mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <XCircle size={26} className="text-red-500 flex-shrink-0" />
                    <div className="text-xl font-black text-red-700">Vous avez cliqué !</div>
                  </div>
                  <div className="text-red-700 text-sm leading-relaxed mb-3">
                    {currentScenario.clickConsequence || 'Ce lien aurait conduit à une page malveillante conçue pour voler vos données.'}
                  </div>
                  <div className="text-red-600 text-sm font-bold">−5 points</div>
                </div>
                <p className="text-gray-500 text-sm mb-6">C'est ici que l'apprentissage commence. Voyons le réflexe à adopter.</p>
                <button onClick={() => setPhase('reflexe')} className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm" style={{ background: BLUE }}>
                  Voir le bon réflexe <ChevronRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════ RÉPONSE ═════════════════════════════ */}
          {phase === 'answered' && currentScenario && selectedChoice && (
            <motion.div key="answered" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-8">
              <div className="max-w-lg w-full">
                <div className={`border-l-4 px-6 py-7 mb-6 ${selectedChoice.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                  <div className="flex items-center gap-3 mb-3">
                    {selectedChoice.isCorrect
                      ? <CheckCircle size={26} className="text-green-600 flex-shrink-0" />
                      : <XCircle size={26} className="text-red-500 flex-shrink-0" />}
                    <div className={`text-xl font-black ${selectedChoice.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {selectedChoice.isCorrect ? 'Excellent réflexe !' : 'Pas le bon choix'}
                    </div>
                  </div>
                  <div className={`text-sm leading-relaxed mb-3 ${selectedChoice.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {selectedChoice.feedback}
                  </div>
                  <div className={`text-sm font-bold ${selectedChoice.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedChoice.points > 0 ? '+' : ''}{selectedChoice.points} points
                  </div>
                </div>
                <button onClick={() => setPhase('reflexe')} className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm" style={{ background: BLUE }}>
                  Voir le réflexe clé <ChevronRight size={15} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════ RÉFLEXE CLÉ ════════════════════════ */}
          {phase === 'reflexe' && currentScenario && (
            <motion.div key="reflexe" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="min-h-screen flex flex-col lg:flex-row">
              <div className="flex-1 flex flex-col justify-center px-8 lg:px-14 py-14">
                <div className="max-w-xl">
                  <div className="text-xs font-bold uppercase tracking-widest mb-5 px-2 py-1 inline-block text-white" style={{ background: BLUE }}>
                    Réflexe clé
                  </div>
                  <h2 className="text-3xl font-black tracking-tight mb-6 leading-tight">{currentScenario.title}</h2>
                  <div className="border-l-4 pl-5 py-1 mb-7" style={{ borderColor: BLUE }}>
                    <p className="text-xl font-bold text-gray-900 leading-snug">{currentScenario.reflexe}</p>
                  </div>
                  {currentScenario.redFlags && currentScenario.redFlags.length > 0 && (
                    <div className="mb-8">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Signaux d'alerte à retenir</div>
                      <ul className="space-y-2">
                        {currentScenario.redFlags.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" style={{ color: PINK }} />{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <button onClick={handleNextScenario} disabled={loadingNext}
                    className="inline-flex items-center gap-2 px-7 py-3.5 text-white font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
                    style={{ background: BLUE }}>
                    {loadingNext ? <><Loader2 size={15} className="animate-spin" />Chargement...</> :
                     currentIndex + 1 >= TOTAL_SCENARIOS ? <><Trophy size={15} />Voir mon bilan</> :
                     <>Scénario suivant <ArrowRight size={15} /></>}
                  </button>
                </div>
              </div>
              {/* Mini progression */}
              <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col" style={{ background: '#fafafa' }}>
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Score en cours</div>
                  <div className="text-4xl font-black" style={{ color: score >= 0 ? BLUE : PINK }}>{score > 0 ? '+' : ''}{score}</div>
                  <div className="text-xs text-gray-400">/ {MAX_SCORE} pts</div>
                </div>
                <div className="px-6 py-5 flex-1">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">Progression</div>
                  <div className="space-y-1.5">
                    {Array.from({ length: TOTAL_SCENARIOS }, (_, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: i < currentIndex ? '#16a34a' : i === currentIndex ? BLUE : '#e5e7eb' }} />
                        <div className="text-xs text-gray-500">Scénario {i + 1}</div>
                        {i < currentIndex && <CheckCircle size={9} className="text-green-500 ml-auto" />}
                        {i === currentIndex && <Star size={9} className="ml-auto" style={{ color: BLUE }} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════════════ BILAN FINAL ═════════════════════════ */}
          {phase === 'final' && (
            <motion.div key="final" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col">
              {/* Hero */}
              <div className="px-8 lg:px-14 py-14 border-b border-gray-100" style={{ background: '#fafafa' }}>
                <div className="max-w-3xl mx-auto text-center">
                  <div className="text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 inline-block text-white" style={{ background: BLUE }}>
                    Formation complète · Niveau {levelMeta.label}
                  </div>
                  <h1 className="text-5xl font-black tracking-tight mb-4">Votre bilan cyber</h1>
                  <div className="w-16 h-1 mx-auto mb-8" style={{ background: PINK }} />
                  <div className="flex flex-col items-center gap-5">
                    <div className="flex items-end gap-2">
                      <span className="text-8xl font-black" style={{ color: score >= 0 ? BLUE : PINK }}>{score}</span>
                      <span className="text-2xl text-gray-400 mb-4">/ {MAX_SCORE}</span>
                    </div>
                    <div className="px-8 py-3 border-2 inline-flex items-center gap-3"
                      style={{ borderColor: badge.border, background: badge.bg, color: badge.color }}>
                      {badge.label === 'Sécurisé' ? <Shield size={20} /> : badge.label === 'Prudent' ? <AlertTriangle size={20} /> : <XCircle size={20} />}
                      <span className="text-xl font-black uppercase tracking-wider">{badge.label}</span>
                    </div>
                    <div className="max-w-md w-full">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Niveau de risque estimé</span>
                        <span className="font-bold" style={{ color: PINK }}>{Math.max(0, Math.round(100 - (score / MAX_SCORE) * 100))}%</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(0, 100 - (score / MAX_SCORE) * 100)}%` }} transition={{ duration: 1, delay: 0.3 }}
                          className="h-2" style={{ background: PINK }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails */}
              <div className="flex-1 px-8 lg:px-14 py-12">
                <div className="max-w-3xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Résultats</div>
                      {[
                        { label: 'Niveau évalué', value: levelMeta.label, icon: levelMeta.icon },
                        { label: 'Bons réflexes', value: `${TOTAL_SCENARIOS - wrongCount} / ${TOTAL_SCENARIOS}`, icon: <CheckCircle size={15} className="text-green-500" /> },
                        { label: 'Erreurs', value: `${wrongCount}`, icon: <XCircle size={15} style={{ color: PINK }} /> },
                        { label: 'Score final', value: `${score} pts`, icon: <Trophy size={15} style={{ color: BLUE }} /> },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between border-b border-gray-100 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700">{s.icon}{s.label}</div>
                          <span className="font-bold text-sm text-gray-900">{s.value}</span>
                        </div>
                      ))}
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Actions prioritaires</div>
                      <ul className="space-y-3">
                        {[
                          ...(wrongCount > 6 ? ['Activer la double authentification sur tous vos comptes'] : []),
                          ...(wrongCount > 4 ? ['Ne jamais cliquer sur un lien reçu par email ou SMS'] : []),
                          'Utiliser un gestionnaire de mots de passe',
                          'Mettre à jour régulièrement vos appareils et logiciels',
                          ...(level === 'debutant' ? ['Suivre une formation cybersécurité de base'] : []),
                          ...(wrongCount > 2 ? ['Vérifier l\'expéditeur avant de répondre à tout message urgent'] : []),
                          'Signaler les emails suspects à signal-spam.fr',
                        ].slice(0, 5).map((a, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <ChevronRight size={13} className="mt-0.5 flex-shrink-0" style={{ color: BLUE }} />{a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="border-l-4 pl-5 py-1 mb-8" style={{ borderColor: BLUE }}>
                    <p className="text-gray-700 font-medium leading-relaxed">
                      {score >= MAX_SCORE * 0.7
                        ? 'Bravo ! Vous avez d\'excellents réflexes. Continuez à vous former pour rester protégé face aux nouvelles menaces.'
                        : score >= MAX_SCORE * 0.4
                        ? 'Pas mal ! Vous avez quelques bons réflexes, mais certains scénarios vous ont piégé. La pratique régulière est la clé.'
                        : 'Ne vous découragez pas — la cybersécurité s\'apprend. Rejouez le module pour ancrer les bons réflexes dans vos habitudes.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <button onClick={handleRestart}
                      className="inline-flex items-center gap-2 px-6 py-3 border-2 font-bold text-sm hover:opacity-70 transition-opacity"
                      style={{ borderColor: BLUE, color: BLUE }}>
                      <RefreshCw size={14} />Recommencer
                    </button>
                    <button onClick={() => setLocation('/cyber/roleplay')}
                      className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm hover:opacity-90 transition-opacity"
                      style={{ background: BLUE }}>
                      Retour au menu <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 px-8 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={mcLogoPath} alt="mc2i" className="h-6 w-auto" />
                  <div className="h-4 w-px bg-gray-200" />
                  <span className="text-sm font-bold" style={{ color: BLUE }}>FYNE</span>
                </div>
                <span className="text-xs text-gray-400">© {new Date().getFullYear()} FYNE by mc2i. Tous droits réservés.</span>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
