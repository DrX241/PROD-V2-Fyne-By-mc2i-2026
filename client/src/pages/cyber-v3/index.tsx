import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  Target,
  Gamepad2,
  ArrowRight,
  Shield,
  Trophy,
  TrendingUp,
  ChevronRight,
  BookOpen,
  Zap,
  Star,
  Users,
  Lock,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

import { Helmet } from 'react-helmet-async';
import { useAuth } from '@/hooks/useAuth';
import HomeLayout from '@/components/layout/HomeLayout';

// ── Diagnostic quiz ──────────────────────────────────────────────────────────

const QUIZ = [
  {
    q: "Qu'est-ce que le phishing ?",
    options: [
      "Une technique pour sécuriser les emails",
      "Une attaque qui usurpe l'identité d'un expéditeur pour vous piéger",
      "Un logiciel antivirus",
      "Un protocole de chiffrement",
    ],
    correct: 1,
    xp: 10,
    explanation: "Le phishing est une attaque d'ingénierie sociale par email visant à tromper la victime pour lui faire exécuter une action nuisible.",
  },
  {
    q: "Que signifie l'acronyme MFA ?",
    options: [
      "Multi Factor Authentication",
      "Main Frame Access",
      "Managed Firewall Application",
      "Malware Free Access",
    ],
    correct: 0,
    xp: 10,
    explanation: "MFA = Multi-Factor Authentication (authentification multi-facteurs). Bloque 99,9% des attaques automatisées sur les comptes.",
  },
  {
    q: "Un ransomware chiffre vos fichiers. Quelle est la meilleure protection préventive ?",
    options: [
      "Payer la rançon rapidement",
      "Avoir un antivirus à jour",
      "Des sauvegardes hors-ligne testées régulièrement (règle 3-2-1)",
      "Changer son mot de passe après l'attaque",
    ],
    correct: 2,
    xp: 15,
    explanation: "La règle 3-2-1 : 3 copies, 2 supports différents, 1 hors-ligne. C'est la seule protection garantie contre un ransomware.",
  },
  {
    q: "Quel est le délai légal pour notifier la CNIL en cas de violation de données (RGPD) ?",
    options: ["24 heures", "72 heures", "7 jours", "1 mois"],
    correct: 1,
    xp: 15,
    explanation: "Article 33 du RGPD : notification obligatoire à la CNIL dans les 72h suivant la découverte d'une violation de données personnelles.",
  },
  {
    q: "Vous recevez un email urgent de votre banque avec un lien. Que faites-vous ?",
    options: [
      "Cliquez sur le lien pour vérifier votre compte",
      "Ignorez l'email",
      "Allez directement sur le site officiel de votre banque via votre navigateur",
      "Répondez à l'email pour confirmer votre identité",
    ],
    correct: 2,
    xp: 10,
    explanation: "Ne jamais cliquer sur un lien dans un email suspect. Toujours accéder aux services via l'URL officielle tapée manuellement dans le navigateur.",
  },
  {
    q: "Qu'est-ce qu'un mot de passe fort ?",
    options: [
      "Votre prénom + année de naissance (ex: Marie1990)",
      "Un mot du dictionnaire avec un chiffre (ex: soleil1)",
      "Une passphrase longue et aléatoire (ex: ChevalBleuNuage!2024)",
      "Le même mot de passe complexe réutilisé partout",
    ],
    correct: 2,
    xp: 10,
    explanation: "Une passphrase longue est plus forte qu'un mot court complexe. L'entropie dépend de la longueur ET de l'aléatoire. Jamais de réutilisation.",
  },
  {
    q: "L'ANSSI est :",
    options: [
      "Un antivirus français",
      "L'Agence Nationale de la Sécurité des Systèmes d'Information",
      "Un protocole de chiffrement",
      "Une directive européenne",
    ],
    correct: 1,
    xp: 10,
    explanation: "L'ANSSI est l'autorité nationale française en cybersécurité. En cas d'incident : cybermalveillance.gouv.fr ou cert-fr.eu.",
  },
];

const DIAGNOSTIC_KEY = 'fyne_cyber_diagnostic';

function getProfile(score: number, total: number) {
  const pct = score / total;
  if (pct < 0.4) return { label: 'Débutant', color: '#94a3b8', route: '/cyber/learning-center/modules/debutant-cyber', cta: 'Commencer par le parcours Débutant', desc: 'Découvrez les bases de la cybersécurité avec le module "Monsieur Tout le Monde".' };
  if (pct < 0.7) return { label: 'Intermédiaire', color: '#006a9e', route: '/cyber/sas-academie', cta: 'Accéder à l\'Académie Cyber', desc: 'Vous avez de bonnes bases. Approfondissez avec les formations structurées.' };
  return { label: 'Avancé', color: '#7c3aed', route: '/cyber/attack-simulator', cta: 'Tester le simulateur d\'attaque', desc: 'Excellentes connaissances. Passez aux mises en situation techniques avancées.' };
}

function CyberDiagnostic({ onComplete }: { onComplete: (xp: number) => void }) {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUIZ.length).fill(null));
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [, setLocation] = useLocation();

  const totalXP = QUIZ.reduce((s, q) => s + q.xp, 0);
  const earnedXP = answers.reduce((s, a, i) => s + (a === QUIZ[i].correct ? QUIZ[i].xp : 0), 0);
  const correctCount = answers.filter((a, i) => a === QUIZ[i].correct).length;
  const profile = getProfile(earnedXP, totalXP);

  const handleSelect = (idx: number) => {
    if (revealed) return;
    setSelected(idx);
    setRevealed(true);
    const updated = [...answers];
    updated[current] = idx;
    setAnswers(updated);
  };

  const handleNext = () => {
    if (current < QUIZ.length - 1) {
      setCurrent(c => c + 1);
      setSelected(null);
      setRevealed(false);
    } else {
      setStep('result');
      onComplete(earnedXP);
    }
  };

  if (step === 'intro') return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 560, margin: '0 auto', padding: '48px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 36, height: 36, background: T.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={18} color="#fff" />
        </div>
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>DIAGNOSTIC INITIAL</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: T.text, letterSpacing: '-0.03em' }}>Évaluation de votre niveau cyber</div>
        </div>
      </div>
      <p style={{ fontSize: 14, color: T.sub, lineHeight: 1.7, marginBottom: 8 }}>
        <strong style={{ color: T.text }}>7 questions</strong> pour évaluer vos connaissances en cybersécurité et vous orienter vers le parcours adapté. Chaque bonne réponse rapporte des points XP.
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
        {[`${QUIZ.length} questions`, `${totalXP} XP à gagner`, '~3 minutes'].map(tag => (
          <span key={tag} style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, padding: '3px 8px', background: T.surface, border: `1px solid ${T.border}`, color: T.muted }}>{tag}</span>
        ))}
      </div>
      <motion.button whileHover={{ scale: 1.02 }} onClick={() => setStep('quiz')}
        style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: T.blue, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600 }}>
        Démarrer le diagnostic <ChevronRight size={14} />
      </motion.button>
    </motion.div>
  );

  if (step === 'quiz') {
    const q = QUIZ[current];
    return (
      <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}
        style={{ maxWidth: 600, margin: '0 auto', padding: '32px 0' }}>
        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ flex: 1, height: 4, background: T.border }}>
            <motion.div animate={{ width: `${((current) / QUIZ.length) * 100}%` }} style={{ height: '100%', background: T.blue }} transition={{ duration: 0.3 }} />
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.muted, whiteSpace: 'nowrap' }}>
            {current + 1} / {QUIZ.length}
          </span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.blue, whiteSpace: 'nowrap' }}>
            +{q.xp} XP
          </span>
        </div>

        {/* Question */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text, margin: '0 0 20px', lineHeight: 1.4, letterSpacing: '-0.02em' }}>{q.q}</h2>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {q.options.map((opt, i) => {
            const isSelected = selected === i;
            const isCorrect = i === q.correct;
            let bg = T.bg, border = T.border, color = T.text;
            if (revealed) {
              if (isCorrect) { bg = 'rgba(16,185,129,0.06)'; border = T.green; color = T.green; }
              else if (isSelected && !isCorrect) { bg = 'rgba(239,68,68,0.06)'; border = T.red; color = T.red; }
              else { color = T.muted; }
            } else if (isSelected) {
              bg = T.surface; border = T.blue;
            }
            return (
              <motion.button key={i} whileHover={!revealed ? { x: 3 } : {}} onClick={() => handleSelect(i)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: bg, border: `1px solid ${border}`, cursor: revealed ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.15s', color }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: revealed && isCorrect ? T.green : revealed && isSelected ? T.red : T.muted, flexShrink: 0, width: 16 }}>
                  {revealed ? (isCorrect ? '✓' : isSelected ? '✗' : String.fromCharCode(65 + i)) : String.fromCharCode(65 + i)}
                </span>
                <span style={{ fontSize: 13, fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: isSelected || (revealed && isCorrect) ? 600 : 400 }}>{opt}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {revealed && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              style={{ padding: '12px 16px', background: selected === q.correct ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)', borderLeft: `3px solid ${selected === q.correct ? T.green : T.red}`, marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                {selected === q.correct ? <CheckCircle size={13} color={T.green} style={{ flexShrink: 0, marginTop: 1 }} /> : <XCircle size={13} color={T.red} style={{ flexShrink: 0, marginTop: 1 }} />}
                <p style={{ fontSize: 12, color: T.sub, margin: 0, lineHeight: 1.6 }}>{q.explanation}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {revealed && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleNext}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: T.blue, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600 }}>
            {current < QUIZ.length - 1 ? <>Question suivante <ChevronRight size={12} /></> : <>Voir mes résultats <ChevronRight size={12} /></>}
          </motion.button>
        )}
      </motion.div>
    );
  }

  // Result screen
  const pct = Math.round((earnedXP / totalXP) * 100);
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      style={{ maxWidth: 580, margin: '0 auto', padding: '36px 0' }}>
      {/* Score header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, padding: '20px 24px', background: T.surface, border: `1px solid ${T.border}` }}>
        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: profile.color, letterSpacing: '-0.04em', lineHeight: 1 }}>{earnedXP}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.muted, marginTop: 3 }}>XP GAGNÉS</div>
        </div>
        <div style={{ width: 1, height: 48, background: T.border }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.muted, textTransform: 'uppercase', marginBottom: 4 }}>Profil détecté</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: profile.color, letterSpacing: '-0.03em' }}>{profile.label}</div>
          <div style={{ fontSize: 12, color: T.sub, marginTop: 3 }}>{correctCount}/{QUIZ.length} bonnes réponses · {pct}%</div>
        </div>
        <div style={{ width: 52, height: 52, flexShrink: 0, position: 'relative' }}>
          <svg viewBox="0 0 52 52" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="26" cy="26" r="22" fill="none" stroke={T.border} strokeWidth="4" />
            <circle cx="26" cy="26" r="22" fill="none" stroke={profile.color} strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 22}`}
              strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
              strokeLinecap="butt" style={{ transition: 'stroke-dashoffset 1s ease' }} />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, color: profile.color }}>
            {pct}%
          </div>
        </div>
      </div>

      {/* Answers recap */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 24 }}>
        {answers.map((a, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ height: 6, background: a === QUIZ[i].correct ? T.green : T.red, marginBottom: 4 }} />
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: a === QUIZ[i].correct ? T.green : T.red }}>Q{i + 1}</div>
          </div>
        ))}
      </div>

      {/* Recommended path */}
      <div style={{ padding: '16px 20px', background: `${profile.color}08`, border: `1px solid ${profile.color}22`, marginBottom: 20 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: profile.color, textTransform: 'uppercase', marginBottom: 6 }}>Parcours recommandé</div>
        <p style={{ fontSize: 13, color: T.sub, margin: '0 0 12px', lineHeight: 1.6 }}>{profile.desc}</p>
        <motion.button whileHover={{ scale: 1.02 }} onClick={() => setLocation(profile.route)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: profile.color, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600 }}>
          {profile.cta} <ArrowRight size={12} />
        </motion.button>
      </div>

      <button onClick={() => setLocation('/cyber')}
        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.muted, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
        <ChevronRight size={10} style={{ transform: 'rotate(180deg)' }} /> Voir tous les modules
      </button>
    </motion.div>
  );
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  bg:       '#ffffff',
  surface:  '#f5f6f8',
  border:   '#ebedf0',
  borderMid:'#d8dce3',
  blue:     '#006a9e',
  pink:     '#dd0061',
  text:     '#0f172a',
  sub:      '#64748b',
  muted:    '#94a3b8',
  hoverBg:  '#f0f3f7',
  activeBg: '#eaf3f9',
};

// ── Level thresholds ──────────────────────────────────────────────────────────
const LEVELS = [
  { label: 'Novice',       min: 0,    max: 99,   color: '#94a3b8' },
  { label: 'Padawan',      min: 100,  max: 299,  color: '#38bdf8' },
  { label: 'Chevalier',    min: 300,  max: 599,  color: '#006a9e' },
  { label: 'Maître',       min: 600,  max: 999,  color: '#7c3aed' },
  { label: 'Grand Maître', min: 1000, max: 9999, color: '#dd0061' },
];

function getLevelInfo(score: number) {
  return LEVELS.find(l => score >= l.min && score <= l.max) ?? LEVELS[0];
}

// ── Module cards ──────────────────────────────────────────────────────────────
const MODULES = [
  {
    id: 'decouvrir',
    label: 'Découvrir',
    headline: "L'Académie Cyber",
    description: 'Maîtrisez les fondamentaux de la cybersécurité grâce à un coach IA expert et des parcours progressifs.',
    cta: "Accéder à l'académie",
    route: '/cyber/sas-academie',
    Icon: GraduationCap,
    accent: T.blue,
    lightBg: '#deeef8',
    tags: ['Académie', 'Expert IA', 'Conversationnel'],
    stat: { label: 'modules', value: '12' },
  },
  {
    id: 'entrainer',
    label: "S'entraîner",
    headline: 'Roleplay & Scénarios',
    description: 'Incarnez un rôle professionnel et affrontez des scénarios réalistes : RSSI, analyste SOC, consultant...',
    cta: 'Accéder aux rôles',
    route: '/cyber/roleplay',
    Icon: Target,
    accent: '#7c3aed',
    lightBg: '#ede9fb',
    tags: ['Professionnel', 'Roleplay', 'Scénarios'],
    stat: { label: 'rôles', value: '8' },
  },
  {
    id: 'challenger',
    label: 'Se challenger',
    headline: 'Arcade & Défis',
    description: 'Jeux interactifs, défis chronométrés et classements en temps réel pour tester vos réflexes cyber.',
    cta: 'Accéder aux jeux',
    route: '/cyber/arcade',
    Icon: Gamepad2,
    accent: '#059669',
    lightBg: '#d5f0e6',
    tags: ['Bug Hunter', 'Firewall', 'Brain Hacker', 'Escape'],
    stat: { label: 'jeux', value: '6' },
  },
];

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'decouvrir',  label: "L'académie",    Icon: BookOpen,    route: '/cyber/sas-academie' },
  { id: 'entrainer',  label: 'Roleplay',       Icon: Users,       route: '/cyber/roleplay' },
  { id: 'challenger', label: 'Arcade',         Icon: Zap,         route: '/cyber/arcade' },
];

// ── Main component ────────────────────────────────────────────────────────────
export default function CyberV3() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [activeNav, setActiveNav]   = useState<string | null>(null);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagXP, setDiagXP] = useState(0);

  const mainRef = useRef<HTMLElement>(null);

  // Check localStorage on mount
  useEffect(() => {
    const done = localStorage.getItem(DIAGNOSTIC_KEY);
    if (!done) setShowDiagnostic(true);
    else {
      try { setDiagXP(JSON.parse(done).xp ?? 0); } catch {}
    }
  }, []);

  // Lock scroll on main container while diagnostic is open
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    if (showDiagnostic) {
      el.scrollTop = 0;
      el.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      el.style.overflow = '';
      document.body.style.overflow = '';
    }
    return () => {
      el.style.overflow = '';
      document.body.style.overflow = '';
    };
  }, [showDiagnostic]);

  const handleDiagComplete = (xp: number) => {
    setDiagXP(xp);
    localStorage.setItem(DIAGNOSTIC_KEY, JSON.stringify({ xp, date: new Date().toISOString() }));
  };

  const resetDiag = () => {
    localStorage.removeItem(DIAGNOSTIC_KEY);
    setShowDiagnostic(true);
    setDiagXP(0);
  };

  const score = (user as any)?.kpi?.score ?? 0;
  const levelInfo = getLevelInfo(score);
  const levelIndex = LEVELS.findIndex(l => l.label === levelInfo.label);
  const nextLevel  = LEVELS[levelIndex + 1];
  const segmentPct = nextLevel
    ? Math.min(100, ((score - levelInfo.min) / (nextLevel.min - levelInfo.min)) * 100)
    : 100;

  return (
    <HomeLayout>
      <Helmet>
        <title>ESPACE CYBER | Univers Cybersécurité</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <style>{`* { box-sizing: border-box; }`}</style>
      </Helmet>

      {/* ── Root shell ── */}
      <div style={{
        minHeight: '100vh',
        backgroundColor: T.bg,
        fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        color: T.text,
        display: 'flex',
      }}>

        {/* ══════════════════════════════════════════════
            LEFT SIDEBAR
        ══════════════════════════════════════════════ */}
        <aside style={{
          width: 248,
          minHeight: '100vh',
          backgroundColor: T.surface,
          borderRight: `1px solid ${T.border}`,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
          overflowY: 'auto',
        }}>

          {/* Brand wordmark */}
          <div style={{
            padding: '22px 20px 20px',
            borderBottom: `1px solid ${T.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 2 }}>
              <div style={{
                width: 30,
                height: 30,
                background: T.blue,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Shield size={15} color="#fff" strokeWidth={2.2} />
              </div>
              <div>
                <div style={{
                  fontWeight: 700,
                  fontSize: '13px',
                  color: T.text,
                  letterSpacing: '-0.01em',
                  lineHeight: 1.2,
                }}>
                  ESPACE CYBER
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px',
                  color: T.muted,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginTop: 1,
                }}>
                  Univers · FYNE
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ padding: '14px 10px', flex: 1 }}>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              fontWeight: 500,
              color: T.muted,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '0 10px',
              marginBottom: 6,
            }}>
              Navigation
            </div>

            {NAV_ITEMS.map(item => {
              const isActive = activeNav === item.id;
              const isHov = hoveredNav === item.id;
              return (
                <button
                  key={item.id}
                  className="cyber-nav-btn"
                  onClick={() => { setActiveNav(item.id); setLocation(item.route); }}
                  onMouseEnter={() => setHoveredNav(item.id)}
                  onMouseLeave={() => setHoveredNav(null)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 9,
                    padding: '8px 10px',
                    border: 'none',
                    background: isActive ? '#e8f0f6' : isHov ? T.hoverBg : 'transparent',
                    color: isActive ? T.blue : T.sub,
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: isActive ? 600 : 400,
                    textAlign: 'left',
                    marginBottom: 1,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    position: 'relative',
                  }}
                >
                  {isActive && (
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 2,
                      background: T.blue,
                    }} />
                  )}
                  <item.Icon size={14} strokeWidth={isActive ? 2.2 : 1.8} />
                  {item.label}
                  {isActive && (
                    <ChevronRight size={11} style={{ marginLeft: 'auto', opacity: 0.5 }} />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Diagnostic entry */}
          <div style={{ margin: '0 10px 14px', padding: '12px 14px', background: T.bg, border: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Diagnostic
              </span>
              <button onClick={resetDiag} title="Refaire le diagnostic"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: T.muted, display: 'flex', alignItems: 'center' }}>
                <RefreshCw size={11} />
              </button>
            </div>
            {diagXP > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={12} color={T.green} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: T.green, fontWeight: 600 }}>+{diagXP} XP obtenus</span>
              </div>
            ) : (
              <button onClick={() => setShowDiagnostic(true)}
                style={{ width: '100%', padding: '7px 10px', background: T.blue, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Shield size={10} /> Évaluer mon niveau
              </button>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: T.border, margin: '0 10px 14px' }} />

          {/* Level widget */}
          <div style={{
            margin: '0 10px 20px',
            padding: '14px 16px',
            background: T.bg,
            borderTop: `1px solid ${T.border}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                fontWeight: 500,
                color: T.muted,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}>
                Mon niveau
              </span>
              <Trophy size={12} color={levelInfo.color} strokeWidth={2} />
            </div>
            <div style={{
              fontSize: '15px',
              fontWeight: 700,
              color: levelInfo.color,
              marginBottom: 3,
              letterSpacing: '-0.01em',
            }}>
              {levelInfo.label}
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '11px',
              color: T.muted,
              marginBottom: 10,
            }}>
              {score} pts
              {nextLevel && (
                <span style={{ color: T.border, marginLeft: 6 }}>
                  · {nextLevel.min - score} → {nextLevel.label}
                </span>
              )}
            </div>
            <div style={{ height: 3, background: T.border, overflow: 'hidden' }}>
              <motion.div
                style={{ height: '100%', background: levelInfo.color }}
                initial={{ width: 0 }}
                animate={{ width: `${segmentPct}%` }}
                transition={{ delay: 0.5, duration: 0.9, ease: 'easeOut' }}
              />
            </div>
          </div>
        </aside>

        {/* ══════════════════════════════════════════════
            MAIN CONTENT
        ══════════════════════════════════════════════ */}
        <main ref={mainRef} style={{
          flex: 1,
          padding: '36px 52px 72px',
          overflowY: 'auto',
          maxWidth: 1100,
        }}>

          {/* ── Breadcrumb ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginBottom: 28,
            }}
          >
            {['FYNE', 'Univers', 'ESPACE CYBER'].map((crumb, i, arr) => (
              <React.Fragment key={crumb}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  color: i === arr.length - 1 ? T.blue : T.muted,
                  fontWeight: i === arr.length - 1 ? 600 : 400,
                  letterSpacing: '0.03em',
                }}>
                  {crumb}
                </span>
                {i < arr.length - 1 && (
                  <ChevronRight size={11} color={T.border} strokeWidth={2} />
                )}
              </React.Fragment>
            ))}
          </motion.div>

          {/* ── Page header ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{ marginBottom: 36 }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 20,
            }}>
              <div>
                <h1 style={{
                  fontSize: 'clamp(1.5rem, 2.8vw, 2rem)',
                  fontWeight: 800,
                  letterSpacing: '-0.035em',
                  color: T.text,
                  margin: '0 0 6px',
                  lineHeight: 1.1,
                }}>
                  Univers{' '}
                  <span style={{
                    color: T.blue,
                    position: 'relative',
                  }}>
                    Cybersécurité
                  </span>
                </h1>
                <p style={{
                  fontSize: '14px',
                  color: T.sub,
                  margin: 0,
                  maxWidth: 480,
                  lineHeight: 1.6,
                  fontWeight: 400,
                }}>
                  Choisissez votre mode de formation et progressez à votre rythme avec des outils IA de pointe.
                </p>
              </div>

              {/* Stats strip */}
              <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                {[
                  { icon: <BookOpen size={13} color={T.blue} strokeWidth={2} />, label: 'Modules', value: '31' },
                  { icon: <Users size={13} color="#059669" strokeWidth={2} />, label: 'Rôles', value: '8' },
                  { icon: <Trophy size={13} color={T.pink} strokeWidth={2} />, label: 'Votre rang', value: levelInfo.label },
                ].map((stat, i) => (
                  <div key={i} style={{
                    background: T.surface,
                    border: `1px solid ${T.border}`,
                    padding: '10px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    minWidth: 82,
                  }}>
                    {stat.icon}
                    <div style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: T.text,
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}>
                      {stat.value}
                    </div>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px',
                      color: T.muted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Diagnostic overlay ── */}
          <AnimatePresence>
            {showDiagnostic && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'fixed', inset: 0, zIndex: 100,
                  background: 'rgba(15,23,42,0.55)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 24,
                  overscrollBehavior: 'contain',
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 24, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 24 }}
                  transition={{ duration: 0.25 }}
                  tabIndex={-1}
                  style={{
                    background: T.bg,
                    border: `1px solid ${T.border}`,
                    maxWidth: 680,
                    width: '100%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    padding: '32px 40px',
                    position: 'relative',
                    outline: 'none',
                  }}
                >
                  <CyberDiagnostic onComplete={(xp) => {
                    handleDiagComplete(xp);
                    setTimeout(() => setShowDiagnostic(false), 3000);
                  }} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Progression tracker ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.35 }}
            style={{
              background: T.surface,
              borderTop: `1px solid ${T.border}`,
              borderBottom: `1px solid ${T.border}`,
              padding: '18px 24px',
              marginBottom: 36,
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <TrendingUp size={14} color={T.blue} strokeWidth={2} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: T.text }}>
                  Votre progression
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  fontWeight: 600,
                  padding: '2px 8px',
                  background: `${levelInfo.color}14`,
                  color: levelInfo.color,
                  border: `1px solid ${levelInfo.color}28`,
                  letterSpacing: '0.02em',
                }}>
                  {levelInfo.label}
                </span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '11px',
                  color: T.muted,
                }}>
                  {score} pts
                </span>
              </div>
            </div>

            {/* Segmented level bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: 5,
              marginBottom: 10,
            }}>
              {LEVELS.map((lvl, i) => {
                const isPast   = i < levelIndex;
                const isActive = i === levelIndex;
                return (
                  <div key={lvl.label}>
                    <div style={{
                      height: 6,
                      background: isPast ? `${lvl.color}30` : T.surface,
                      borderRadius: 0,
                      overflow: 'hidden',
                      border: `1px solid ${isActive ? `${lvl.color}40` : T.border}`,
                      position: 'relative',
                    }}>
                      {isPast && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          background: lvl.color,
                          opacity: 0.55,
                          borderRadius: 0,
                        }} />
                      )}
                      {isActive && (
                        <motion.div
                          style={{ height: '100%', background: lvl.color, borderRadius: 3 }}
                          initial={{ width: 0 }}
                          animate={{ width: `${segmentPct}%` }}
                          transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                        />
                      )}
                    </div>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px',
                      marginTop: 5,
                      color: isActive ? lvl.color : T.muted,
                      fontWeight: isActive ? 600 : 400,
                      letterSpacing: '0.02em',
                    }}>
                      {lvl.label}
                    </div>
                  </div>
                );
              })}
            </div>

            {nextLevel && (
              <div style={{
                fontSize: '12px',
                color: T.muted,
                marginTop: 2,
                fontWeight: 400,
              }}>
                <strong style={{ color: T.sub, fontWeight: 600 }}>{nextLevel.min - score} pts</strong>
                {' '}pour atteindre{' '}
                <strong style={{ color: nextLevel.color, fontWeight: 600 }}>{nextLevel.label}</strong>
              </div>
            )}
          </motion.div>

          {/* ── Section label ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.3 }}
            style={{ marginBottom: 16 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                fontWeight: 500,
                color: T.muted,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}>
                Modes d'apprentissage
              </span>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '11px',
                color: T.muted,
              }}>
                {MODULES.length} modules
              </span>
            </div>
          </motion.div>

          {/* ── Module cards grid ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1,
            background: T.border,
          }}>
            {MODULES.map((mod, i) => {
              const isHov = hoveredCard === mod.id;
              return (
                <motion.div
                  key={mod.id}
                  className="cyber-module-card"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.22 + i * 0.07, duration: 0.35 }}
                  onClick={() => setLocation(mod.route)}
                  onMouseEnter={() => setHoveredCard(mod.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: isHov ? T.surface : T.bg,
                    padding: '22px 22px 20px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    transition: 'background 0.12s ease',
                  }}
                >
                  {/* Icon + badge row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 14,
                  }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      background: T.surface,
                      border: `1px solid ${T.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <mod.Icon size={18} color={mod.accent} strokeWidth={2} />
                    </div>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: mod.accent,
                      background: `${mod.accent}10`,
                      padding: '2px 7px',
                      border: `1px solid ${mod.accent}20`,
                    }}>
                      {mod.label}
                    </div>
                  </div>

                  {/* Headline */}
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: T.text,
                    margin: '0 0 7px',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.3,
                  }}>
                    {mod.headline}
                  </h3>

                  {/* Description */}
                  <p style={{
                    fontSize: '13px',
                    color: T.sub,
                    lineHeight: 1.6,
                    margin: '0 0 14px',
                    flex: 1,
                    fontWeight: 400,
                  }}>
                    {mod.description}
                  </p>

                  {/* Tags */}
                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 4,
                    marginBottom: 16,
                  }}>
                    {mod.tags.map(tag => (
                      <span
                        key={tag}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px 7px',
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '10px',
                          fontWeight: 500,
                          letterSpacing: '0.02em',
                          background: `${mod.accent}08`,
                          color: mod.accent,
                          border: `1px solid ${mod.accent}18`,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* CTA row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: 14,
                    borderTop: `1px solid ${T.border}`,
                  }}>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: isHov ? mod.accent : T.sub,
                      transition: 'color 0.15s ease',
                      letterSpacing: '-0.01em',
                    }}>
                      {mod.cta}
                    </span>
                    <div style={{
                      width: 26,
                      height: 26,
                      background: isHov ? T.blue : T.surface,
                      border: `1px solid ${T.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      transition: 'background 0.12s ease',
                    }}>
                      <ArrowRight
                        size={13}
                        color={isHov ? '#fff' : T.muted}
                        strokeWidth={2.2}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Footer status bar ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            style={{
              marginTop: 1,
              padding: '14px 20px',
              background: T.surface,
              borderTop: `1px solid ${T.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <Lock size={13} color={T.muted} strokeWidth={2} style={{ flexShrink: 0 }} />
            <p style={{ fontSize: '13px', color: T.muted, margin: 0, fontWeight: 400 }}>
              Tous vos progrès sont sauvegardés en temps réel.{' '}
              <span
                style={{ color: T.blue, fontWeight: 600, cursor: 'pointer' }}
                onClick={() => setLocation('/mon-suivi')}
              >
                Consulter mon suivi →
              </span>
            </p>
          </motion.div>

        </main>
      </div>
    </HomeLayout>
  );
}
