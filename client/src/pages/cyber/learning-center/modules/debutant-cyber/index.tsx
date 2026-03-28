import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Shield, AlertTriangle, CheckCircle,
  XCircle, Trophy, RefreshCw, Mail, Phone, Wifi, ExternalLink,
  MessageSquare, Monitor, Share2, Loader2, ChevronRight, Flag, Eye, Lock
} from 'lucide-react';
import mcLogoPath from "@assets/mc2i.png";

// ── TYPES ────────────────────────────────────────────────────────────────────
type VisualType = 'email' | 'sms' | 'phone-call' | 'browser-popup' | 'social-post';

interface ScenarioVisual {
  type: VisualType;
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
  | 'loading'
  | 'scenario'
  | 'trap-clicked'
  | 'answered'
  | 'reflexe'
  | 'final';

const TOTAL = 10;
const MAX_SCORE = TOTAL * 10;

// ── COULEURS MC2I ─────────────────────────────────────────────────────────────
const MC2I_BLUE = '#006a9e';
const MC2I_PINK = '#dd0061';

// ── BADGE ─────────────────────────────────────────────────────────────────────
function getBadge(score: number) {
  const pct = (score / MAX_SCORE) * 100;
  if (pct >= 70) return { label: 'Sécurisé', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
  if (pct >= 40) return { label: 'Prudent', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  return { label: 'Vulnérable', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
}

// ── VISUAL EMAIL ─────────────────────────────────────────────────────────────
function EmailVisual({ visual, onLinkClick }: { visual: ScenarioVisual; onLinkClick: () => void }) {
  return (
    <div className="w-full bg-white border border-gray-200 shadow-sm">
      <div style={{ background: MC2I_BLUE }} className="px-4 py-2 flex items-center gap-2">
        <Mail className="text-white" size={14} />
        <span className="text-white text-xs font-medium">Boîte de réception</span>
      </div>
      <div className="border-b border-gray-100 px-4 py-3 bg-gray-50">
        <div className="text-xs text-gray-500 mb-1">De : <span className="text-gray-800 font-medium">{visual.from}</span>
          {visual.fromEmail && <span className="ml-1 text-red-500">&lt;{visual.fromEmail}&gt;</span>}
        </div>
        {visual.subject && (
          <div className="text-sm font-semibold text-gray-900">{visual.subject}</div>
        )}
      </div>
      <div className="px-4 py-4">
        <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{visual.body}</div>
        {visual.hasClickableLink && visual.linkLabel && (
          <div className="mt-4">
            <button
              onClick={onLinkClick}
              className="inline-flex items-center gap-1 text-sm font-medium px-4 py-2 transition-all"
              style={{ background: MC2I_BLUE, color: 'white' }}
            >
              <ExternalLink size={13} />
              {visual.linkLabel}
            </button>
            {visual.linkUrl && (
              <div className="mt-1 text-xs text-gray-400 font-mono">{visual.linkUrl}</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── VISUAL SMS ───────────────────────────────────────────────────────────────
function SmsVisual({ visual, onLinkClick }: { visual: ScenarioVisual; onLinkClick: () => void }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-gray-800 rounded-none overflow-hidden shadow-lg">
        <div className="bg-gray-900 px-4 py-2 flex items-center gap-2">
          <MessageSquare size={14} className="text-green-400" />
          <span className="text-white text-xs font-medium">{visual.from || 'Messages'}</span>
        </div>
        <div className="bg-gray-100 min-h-40 p-4">
          <div className="flex flex-col gap-2">
            <div className="bg-white shadow-sm px-3 py-2 max-w-xs self-start">
              <div className="text-xs text-gray-800 leading-relaxed">{visual.body}</div>
              {visual.hasClickableLink && visual.linkLabel && (
                <button
                  onClick={onLinkClick}
                  className="mt-2 text-xs font-medium underline"
                  style={{ color: MC2I_BLUE }}
                >
                  {visual.linkUrl || visual.linkLabel}
                </button>
              )}
              <div className="text-right text-xs text-gray-400 mt-1">à l'instant</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── VISUAL PHONE CALL ────────────────────────────────────────────────────────
function PhoneCallVisual({ visual }: { visual: ScenarioVisual }) {
  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="bg-gray-900 p-6 text-center shadow-lg">
        <div className="w-16 h-16 bg-green-500 flex items-center justify-center mx-auto mb-4">
          <Phone size={28} className="text-white" />
        </div>
        <div className="text-white font-bold text-lg mb-1">{visual.from || 'Numéro inconnu'}</div>
        <div className="text-gray-400 text-sm mb-4">Appel entrant</div>
        <div className="bg-gray-800 p-4 text-left">
          <div className="text-green-400 text-xs font-medium mb-2 uppercase tracking-wider">Transcription de l'appel</div>
          <div className="text-gray-200 text-sm leading-relaxed whitespace-pre-line">{visual.body}</div>
        </div>
      </div>
    </div>
  );
}

// ── VISUAL BROWSER POPUP ─────────────────────────────────────────────────────
function BrowserPopupVisual({ visual, onLinkClick }: { visual: ScenarioVisual; onLinkClick: () => void }) {
  return (
    <div className="w-full">
      <div className="bg-gray-100 border border-gray-300 shadow-lg">
        <div className="bg-gray-200 px-3 py-2 flex items-center gap-2 border-b border-gray-300">
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
          <div className="flex-1 bg-white border border-gray-300 px-3 py-1 text-xs text-gray-600 flex items-center gap-1">
            <Monitor size={10} />
            {visual.linkUrl || 'https://...'}
          </div>
        </div>
        <div className="p-6 bg-white">
          {visual.subject && (
            <div className="text-lg font-bold text-gray-900 mb-3">{visual.subject}</div>
          )}
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-4">{visual.body}</div>
          {visual.hasClickableLink && (
            <button
              onClick={onLinkClick}
              className="px-6 py-2 text-white text-sm font-semibold"
              style={{ background: MC2I_PINK }}
            >
              {visual.linkLabel || 'Continuer'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── VISUAL SOCIAL POST ───────────────────────────────────────────────────────
function SocialPostVisual({ visual, onLinkClick }: { visual: ScenarioVisual; onLinkClick: () => void }) {
  return (
    <div className="w-full bg-white border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <div className="w-9 h-9 bg-gray-200 flex items-center justify-center">
          <Share2 size={16} className="text-gray-500" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">{visual.from || 'Utilisateur'}</div>
          <div className="text-xs text-gray-400">il y a quelques minutes</div>
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{visual.body}</div>
        {visual.hasClickableLink && visual.linkLabel && (
          <button
            onClick={onLinkClick}
            className="mt-3 text-sm font-medium flex items-center gap-1"
            style={{ color: MC2I_BLUE }}
          >
            <ExternalLink size={13} /> {visual.linkLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────
export default function MonsieurToutLeMonde() {
  const [, setLocation] = useLocation();

  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scenarios, setScenarios] = useState<(Scenario | null)[]>(Array(TOTAL).fill(null));
  const [loadingNext, setLoadingNext] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<ScenarioChoice | null>(null);
  const [trapClicked, setTrapClicked] = useState(false);
  const [showRedFlags, setShowRedFlags] = useState(false);

  const currentScenario = scenarios[currentIndex];

  const fetchScenario = useCallback(async (index: number) => {
    setLoadingNext(true);
    try {
      const resp = await fetch('/api/cyber/mtm-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioIndex: index }),
      });
      const data = await resp.json();
      if (data.success && data.scenario) {
        setScenarios(prev => {
          const next = [...prev];
          next[index] = data.scenario;
          return next;
        });
      }
    } catch (e) {
      console.error('Failed to load scenario', e);
    } finally {
      setLoadingNext(false);
    }
  }, []);

  const startModule = async () => {
    setPhase('loading');
    await fetchScenario(0);
    setPhase('scenario');
  };

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
    if (choice.isCorrect) {
      setScore(s => s + choice.points);
    } else {
      setScore(s => s + choice.points);
      setWrongCount(w => w + 1);
    }
  };

  const handleContinueAfterTrap = () => {
    setPhase('reflexe');
  };

  const handleContinueAfterAnswer = () => {
    setPhase('reflexe');
  };

  const handleNextScenario = async () => {
    const next = currentIndex + 1;
    if (next >= TOTAL) {
      setPhase('final');
      return;
    }
    setSelectedChoice(null);
    setTrapClicked(false);
    setShowRedFlags(false);
    setCurrentIndex(next);
    if (!scenarios[next]) {
      setPhase('loading');
      await fetchScenario(next);
    }
    setPhase('scenario');

    // Préchargement du suivant
    if (next + 1 < TOTAL && !scenarios[next + 1]) {
      fetchScenario(next + 1);
    }
  };

  const handleRestart = () => {
    setPhase('intro');
    setCurrentIndex(0);
    setScenarios(Array(TOTAL).fill(null));
    setScore(0);
    setWrongCount(0);
    setSelectedChoice(null);
    setTrapClicked(false);
    setShowRedFlags(false);
  };

  const progress = (currentIndex / TOTAL) * 100;
  const badge = getBadge(score);

  const renderVisual = (scenario: Scenario) => {
    const t = scenario.visual?.type;
    if (t === 'sms') return <SmsVisual visual={scenario.visual} onLinkClick={handleLinkClick} />;
    if (t === 'phone-call') return <PhoneCallVisual visual={scenario.visual} />;
    if (t === 'browser-popup') return <BrowserPopupVisual visual={scenario.visual} onLinkClick={handleLinkClick} />;
    if (t === 'social-post') return <SocialPostVisual visual={scenario.visual} onLinkClick={handleLinkClick} />;
    return <EmailVisual visual={scenario.visual} onLinkClick={handleLinkClick} />;
  };

  // ── RENDER ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fff', color: '#061019', fontFamily: 'system-ui, sans-serif' }}>

      {/* HEADER FIXÉ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        {/* Barre de progression */}
        <div className="h-1 w-full bg-gray-100">
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${progress}%`, background: MC2I_PINK }}
          />
        </div>
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLocation('/cyber/roleplay')}
              className="p-1 hover:opacity-70 transition-opacity"
            >
              <ArrowLeft size={18} style={{ color: MC2I_BLUE }} />
            </button>
            <img src={mcLogoPath} alt="mc2i" className="h-7 w-auto" />
            <div className="h-4 w-px bg-gray-300" />
            <span className="font-bold text-sm" style={{ color: MC2I_BLUE }}>FYNE</span>
            <div className="h-4 w-px bg-gray-300" />
            <span className="text-sm text-gray-600 font-medium">Je suis Monsieur Tout le Monde</span>
          </div>
          {phase !== 'intro' && phase !== 'final' && (
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500">{currentIndex + 1} / {TOTAL}</span>
              <div className="text-sm font-bold" style={{ color: score >= 0 ? MC2I_BLUE : MC2I_PINK }}>
                {score > 0 ? '+' : ''}{score} pts
              </div>
            </div>
          )}
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 pt-16">
        <AnimatePresence mode="wait">

          {/* ── INTRO ────────────────────────────────────────────────────────── */}
          {phase === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-screen flex flex-col"
            >
              <div className="flex-1 flex flex-col lg:flex-row">
                {/* Panneau gauche */}
                <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-16">
                  <div className="max-w-xl">
                    <div
                      className="text-xs font-semibold uppercase tracking-widest mb-6 px-3 py-1 inline-block"
                      style={{ background: `${MC2I_BLUE}12`, color: MC2I_BLUE }}
                    >
                      Formation Cybersécurité · Grand Public
                    </div>
                    <h1 className="text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-none">
                      <span style={{ color: MC2I_PINK }}>Je suis</span><br />
                      <span style={{ color: '#061019' }}>Monsieur</span><br />
                      <span style={{ color: MC2I_BLUE }}>Tout le Monde</span>
                    </h1>
                    <div className="w-20 h-1 mb-8" style={{ background: MC2I_PINK }} />
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                      10 scénarios réels générés par l'IA pour tester vos réflexes face aux cybermenaces du quotidien.
                      Phishing, arnaques SMS, faux techniciens... saurez-vous reconnaître le danger ?
                    </p>
                    <div className="grid grid-cols-3 gap-4 mb-10">
                      {[
                        { icon: <Shield size={18} />, label: '10 scénarios', sub: 'générés par IA' },
                        { icon: <Eye size={18} />, label: 'Éléments', sub: 'interactifs' },
                        { icon: <Trophy size={18} />, label: 'Score', sub: 'personnalisé' },
                      ].map((item, i) => (
                        <div key={i} className="border border-gray-200 p-4">
                          <div className="mb-2" style={{ color: MC2I_BLUE }}>{item.icon}</div>
                          <div className="text-sm font-bold text-gray-900">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.sub}</div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={startModule}
                      className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold text-base transition-all hover:opacity-90"
                      style={{ background: MC2I_BLUE }}
                    >
                      Commencer le test
                      <ArrowRight size={18} />
                    </button>
                  </div>
                </div>

                {/* Panneau droit — décoratif */}
                <div className="hidden lg:flex w-80 flex-col" style={{ background: `${MC2I_BLUE}08` }}>
                  <div className="flex-1 flex flex-col justify-center px-8 py-16 gap-4">
                    {['phishing-email-banque', 'sms-arnaque-colis', 'vishing-technicien',
                      'reutilisation-mot-de-passe', 'wifi-public-cafe',
                      'popup-mise-a-jour', 'oversharing-reseaux-sociaux',
                      'piece-jointe-malware', 'usurpation-ami-whatsapp', 'phishing-netflix'
                    ].map((cat, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: i < 3 ? MC2I_PINK : MC2I_BLUE }} />
                        <span className="text-xs text-gray-600">{cat.replace(/-/g, ' ')}</span>
                        <Lock size={10} className="text-gray-300 ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── CHARGEMENT ───────────────────────────────────────────────────── */}
          {phase === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center"
            >
              <Loader2 size={36} className="animate-spin mb-4" style={{ color: MC2I_BLUE }} />
              <p className="text-gray-600 font-medium">Génération du scénario en cours...</p>
              <p className="text-xs text-gray-400 mt-2">L'IA prépare une situation réaliste pour vous</p>
            </motion.div>
          )}

          {/* ── SCÉNARIO ─────────────────────────────────────────────────────── */}
          {phase === 'scenario' && currentScenario && (
            <motion.div
              key={`scenario-${currentIndex}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="min-h-screen flex flex-col lg:flex-row"
            >
              {/* Colonne gauche — contexte + visuel */}
              <div className="flex-1 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
                {/* En-tête du scénario */}
                <div className="px-8 py-6 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="text-xs font-bold uppercase tracking-wider px-2 py-0.5"
                      style={{ background: MC2I_PINK, color: 'white' }}
                    >
                      Scénario {currentIndex + 1}
                    </div>
                    <span className="text-xs text-gray-400 uppercase tracking-wider">
                      {currentScenario.category?.replace(/-/g, ' ')}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {currentScenario.title}
                  </h2>
                  <p className="text-gray-600 mt-1">{currentScenario.context}</p>
                </div>

                {/* Visuel interactif */}
                <div className="flex-1 px-8 py-6 overflow-y-auto">
                  {renderVisual(currentScenario)}

                  {/* Red flags toggle */}
                  {currentScenario.redFlags && currentScenario.redFlags.length > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() => setShowRedFlags(!showRedFlags)}
                        className="text-xs flex items-center gap-1 font-medium transition-opacity hover:opacity-70"
                        style={{ color: MC2I_PINK }}
                      >
                        <Flag size={12} />
                        {showRedFlags ? 'Masquer les indices' : 'Voir les indices suspects'}
                      </button>
                      <AnimatePresence>
                        {showRedFlags && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-3 border border-red-100 bg-red-50 px-4 py-3">
                              <div className="text-xs font-bold text-red-700 mb-2 uppercase tracking-wider">Indices suspects</div>
                              <ul className="space-y-1">
                                {currentScenario.redFlags.map((flag, i) => (
                                  <li key={i} className="flex items-start gap-2 text-xs text-red-600">
                                    <XCircle size={12} className="mt-0.5 flex-shrink-0" />
                                    {flag}
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
              <div className="w-full lg:w-96 flex flex-col">
                <div className="px-8 py-6 border-b border-gray-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500">Que faites-vous ?</div>
                </div>
                <div className="flex-1 px-8 py-6 flex flex-col gap-3">
                  {currentScenario.choices.map((choice, i) => (
                    <button
                      key={i}
                      onClick={() => handleChoice(choice)}
                      className="w-full text-left border border-gray-200 px-5 py-4 text-sm font-medium text-gray-800 hover:border-gray-400 transition-all flex items-start gap-3 group"
                    >
                      <span
                        className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-xs font-bold border border-gray-300 group-hover:border-gray-500 transition-colors"
                        style={{ color: MC2I_BLUE }}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      {choice.label}
                    </button>
                  ))}
                </div>
                <div className="px-8 py-4 border-t border-gray-100">
                  <div className="text-xs text-gray-400">
                    Score actuel : <span className="font-bold" style={{ color: score >= 0 ? MC2I_BLUE : MC2I_PINK }}>{score} pts</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── PIÈGE CLIQUÉ ─────────────────────────────────────────────────── */}
          {phase === 'trap-clicked' && currentScenario && (
            <motion.div
              key="trap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-8"
            >
              <div className="max-w-lg w-full">
                <div className="border-l-4 border-red-500 bg-red-50 px-6 py-8 mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <XCircle size={28} className="text-red-500 flex-shrink-0" />
                    <div className="text-xl font-black text-red-700">Vous avez cliqué !</div>
                  </div>
                  <div className="text-red-700 font-medium mb-4">
                    {currentScenario.clickConsequence || 'Vous venez de tomber dans le piège. Ce type de lien est utilisé par les cybercriminels pour voler vos données.'}
                  </div>
                  <div className="text-red-600 text-sm">−5 points</div>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  Ne vous inquiétez pas — c'est ici que l'apprentissage commence. Voyons ensemble le bon réflexe à adopter.
                </p>
                <button
                  onClick={handleContinueAfterTrap}
                  className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm"
                  style={{ background: MC2I_BLUE }}
                >
                  Voir le bon réflexe <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── RÉPONSE DONNÉE ───────────────────────────────────────────────── */}
          {phase === 'answered' && currentScenario && selectedChoice && (
            <motion.div
              key="answered"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-8"
            >
              <div className="max-w-lg w-full">
                <div
                  className={`border-l-4 px-6 py-8 mb-6 ${
                    selectedChoice.isCorrect
                      ? 'border-green-500 bg-green-50'
                      : 'border-red-500 bg-red-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    {selectedChoice.isCorrect ? (
                      <CheckCircle size={28} className="text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle size={28} className="text-red-500 flex-shrink-0" />
                    )}
                    <div className={`text-xl font-black ${selectedChoice.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {selectedChoice.isCorrect ? 'Excellent réflexe !' : 'Pas le bon choix'}
                    </div>
                  </div>
                  <div className={`font-medium mb-4 text-sm leading-relaxed ${selectedChoice.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {selectedChoice.feedback}
                  </div>
                  <div className={`text-sm font-bold ${selectedChoice.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedChoice.points > 0 ? '+' : ''}{selectedChoice.points} points
                  </div>
                </div>
                <button
                  onClick={handleContinueAfterAnswer}
                  className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm"
                  style={{ background: MC2I_BLUE }}
                >
                  Voir le réflexe clé <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ── RÉFLEXE CLÉ ──────────────────────────────────────────────────── */}
          {phase === 'reflexe' && currentScenario && (
            <motion.div
              key="reflexe"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-screen flex flex-col"
            >
              <div className="flex-1 flex flex-col lg:flex-row">
                {/* Panneau gauche */}
                <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 py-16">
                  <div className="max-w-xl">
                    <div
                      className="text-xs font-bold uppercase tracking-widest mb-6 px-3 py-1 inline-block"
                      style={{ background: MC2I_BLUE, color: 'white' }}
                    >
                      Réflexe clé
                    </div>
                    <h2 className="text-4xl font-black tracking-tight mb-8 leading-tight" style={{ color: '#061019' }}>
                      {currentScenario.title}
                    </h2>
                    <div className="border-l-4 pl-6 py-2 mb-8" style={{ borderColor: MC2I_BLUE }}>
                      <p className="text-xl font-bold text-gray-900">{currentScenario.reflexe}</p>
                    </div>

                    {currentScenario.redFlags && currentScenario.redFlags.length > 0 && (
                      <div className="mb-8">
                        <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Signaux d'alerte à retenir</div>
                        <ul className="space-y-2">
                          {currentScenario.redFlags.map((flag, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                              <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" style={{ color: MC2I_PINK }} />
                              {flag}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <button
                      onClick={handleNextScenario}
                      disabled={loadingNext}
                      className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold text-base transition-all hover:opacity-90 disabled:opacity-50"
                      style={{ background: MC2I_BLUE }}
                    >
                      {loadingNext ? (
                        <><Loader2 size={16} className="animate-spin" /> Chargement...</>
                      ) : currentIndex + 1 >= TOTAL ? (
                        <><Trophy size={16} /> Voir mon bilan final</>
                      ) : (
                        <>Scénario suivant <ArrowRight size={16} /></>
                      )}
                    </button>
                  </div>
                </div>

                {/* Panneau droit — score en cours */}
                <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col">
                  <div className="px-8 py-6 border-b border-gray-100">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Score actuel</div>
                    <div className="text-4xl font-black" style={{ color: score >= 0 ? MC2I_BLUE : MC2I_PINK }}>
                      {score > 0 ? '+' : ''}{score}
                    </div>
                    <div className="text-xs text-gray-400">sur {MAX_SCORE} pts possibles</div>
                  </div>
                  <div className="px-8 py-6">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-4">Progression</div>
                    <div className="space-y-2">
                      {Array.from({ length: TOTAL }, (_, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 flex-shrink-0"
                            style={{
                              background: i < currentIndex ? '#16a34a' : i === currentIndex ? MC2I_BLUE : '#e5e7eb'
                            }}
                          />
                          <div className="text-xs text-gray-500">Scénario {i + 1}</div>
                          {i < currentIndex && <CheckCircle size={10} className="text-green-500 ml-auto" />}
                          {i === currentIndex && <div className="w-2 h-2 ml-auto" style={{ background: MC2I_BLUE }} />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── BILAN FINAL ──────────────────────────────────────────────────── */}
          {phase === 'final' && (
            <motion.div
              key="final"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col"
            >
              {/* Section hero résultat */}
              <div
                className="px-8 lg:px-16 py-16 border-b border-gray-200"
                style={{ background: `${MC2I_BLUE}06` }}
              >
                <div className="max-w-3xl mx-auto text-center">
                  <div className="text-xs font-bold uppercase tracking-widest mb-4 px-3 py-1 inline-block"
                    style={{ background: MC2I_BLUE, color: 'white' }}>
                    Formation complète
                  </div>
                  <h1 className="text-5xl font-black tracking-tight mb-4" style={{ color: '#061019' }}>
                    Votre bilan cyber
                  </h1>
                  <div className="w-20 h-1 mx-auto mb-8" style={{ background: MC2I_PINK }} />

                  <div className="flex flex-col items-center gap-6">
                    {/* Score */}
                    <div className="flex items-end gap-2">
                      <span className="text-8xl font-black" style={{ color: score >= 0 ? MC2I_BLUE : MC2I_PINK }}>
                        {score}
                      </span>
                      <span className="text-2xl text-gray-400 mb-4">/ {MAX_SCORE}</span>
                    </div>

                    {/* Badge */}
                    <div
                      className="px-8 py-3 border-2 inline-flex items-center gap-3"
                      style={{ borderColor: badge.border, background: badge.bg, color: badge.color }}
                    >
                      {badge.label === 'Sécurisé' && <Shield size={20} />}
                      {badge.label === 'Prudent' && <AlertTriangle size={20} />}
                      {badge.label === 'Vulnérable' && <XCircle size={20} />}
                      <span className="text-xl font-black uppercase tracking-wider">{badge.label}</span>
                    </div>

                    {/* Niveau de risque */}
                    <div className="max-w-md w-full">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Niveau de risque personnel</span>
                        <span style={{ color: MC2I_PINK, fontWeight: 'bold' }}>
                          {Math.max(0, Math.round(100 - (score / MAX_SCORE) * 100))}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 h-2">
                        <div
                          className="h-2 transition-all"
                          style={{
                            width: `${Math.max(0, 100 - (score / MAX_SCORE) * 100)}%`,
                            background: MC2I_PINK
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails et actions */}
              <div className="flex-1 px-8 lg:px-16 py-12">
                <div className="max-w-3xl mx-auto">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                    {/* Stats */}
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Résultats détaillés</div>
                      <div className="space-y-3">
                        {[
                          { label: 'Scénarios complétés', value: `${TOTAL} / ${TOTAL}`, icon: <CheckCircle size={16} className="text-green-500" /> },
                          { label: 'Bons réflexes', value: `${TOTAL - wrongCount}`, icon: <CheckCircle size={16} className="text-green-500" /> },
                          { label: 'Erreurs commises', value: `${wrongCount}`, icon: <XCircle size={16} style={{ color: MC2I_PINK }} /> },
                          { label: 'Score obtenu', value: `${score} pts`, icon: <Trophy size={16} style={{ color: MC2I_BLUE }} /> },
                        ].map((stat, i) => (
                          <div key={i} className="flex items-center justify-between border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              {stat.icon}
                              {stat.label}
                            </div>
                            <span className="font-bold text-sm text-gray-900">{stat.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions recommandées */}
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4">Ce que vous devez faire maintenant</div>
                      <ul className="space-y-3">
                        {[
                          ...(wrongCount > 5 ? ['Activer l\'authentification à deux facteurs sur tous vos comptes'] : []),
                          ...(wrongCount > 3 ? ['Ne jamais cliquer sur un lien reçu par email ou SMS sans vérification'] : []),
                          'Utiliser un gestionnaire de mots de passe',
                          'Mettre à jour régulièrement vos appareils',
                          ...(wrongCount > 2 ? ['Vérifier l\'expéditeur avant de répondre à tout message urgent'] : []),
                          'Signaler tout email suspect à votre DSI ou à Signal Spam',
                        ].slice(0, 4).map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <ChevronRight size={14} className="mt-0.5 flex-shrink-0" style={{ color: MC2I_BLUE }} />
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Message d'encouragement */}
                  <div className="border-l-4 pl-6 py-2 mb-8" style={{ borderColor: MC2I_BLUE }}>
                    <p className="text-gray-700 font-medium">
                      {score >= MAX_SCORE * 0.7
                        ? 'Bravo ! Vous avez de très bons réflexes en cybersécurité. Continuez à vous former pour rester protégé face aux nouvelles menaces.'
                        : score >= MAX_SCORE * 0.4
                        ? 'Pas mal ! Vous avez les bases, mais certains scénarios vous ont piégé. Un peu plus de pratique et vous serez vraiment sécurisé.'
                        : 'Ne vous découragez pas — la plupart des gens se font piéger au premier essai. Rejouer le module pour ancrer les bons réflexes.'}
                    </p>
                  </div>

                  {/* Boutons */}
                  <div className="flex flex-wrap gap-4">
                    <button
                      onClick={handleRestart}
                      className="inline-flex items-center gap-2 px-6 py-3 border-2 font-bold text-sm transition-all hover:opacity-70"
                      style={{ borderColor: MC2I_BLUE, color: MC2I_BLUE }}
                    >
                      <RefreshCw size={15} /> Recommencer
                    </button>
                    <button
                      onClick={() => setLocation('/cyber/roleplay')}
                      className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm transition-all hover:opacity-90"
                      style={{ background: MC2I_BLUE }}
                    >
                      Retour au menu <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer mc2i */}
              <div className="border-t border-gray-200 px-8 py-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={mcLogoPath} alt="mc2i" className="h-6 w-auto" />
                  <div className="h-4 w-px bg-gray-300" />
                  <span className="text-sm font-bold" style={{ color: MC2I_BLUE }}>FYNE</span>
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
