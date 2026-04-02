import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, BookOpen, Zap, CheckCircle,
  Lightbulb, Target, ArrowLeft, Eye, EyeOff, Award
} from 'lucide-react';

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

interface SlideIntro {
  id: number; type: 'intro';
  titre: string; contenu: string; objectifs: string[];
}
interface SlideTheorie {
  id: number; type: 'theorie';
  titre: string; contenu: string; pointsCles: string[]; exemple: string;
}
interface SlidePratique {
  id: number; type: 'pratique';
  titre: string; contexte: string; question: string; indice: string; reponse: string;
}
interface SlideConclusion {
  id: number; type: 'conclusion';
  titre: string; points: string[]; message: string;
}
type Slide = SlideIntro | SlideTheorie | SlidePratique | SlideConclusion;

interface Lesson {
  title: string; subtitle: string; description: string; slides: Slide[];
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
};

export default function LessonPlayer() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [direction, setDirection] = useState(1);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [error, setError] = useState('');
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    fetch(`/api/studio/training/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(data => {
        const content = data.content;
        if (!content?.slides || !Array.isArray(content.slides)) {
          setError('Cette leçon n\'a pas pu être chargée.');
          return;
        }
        setLesson(content as Lesson);
      })
      .catch(() => setError('Leçon introuvable.'));
  }, [id]);

  if (error) return (
    <div style={{ minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: 'white', fontSize: 18 }}>{error}</p>
      <button onClick={() => navigate('/playground/module-generator')} style={{ color: BLUE, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Retour</button>
    </div>
  );

  if (!lesson) return (
    <div style={{ minHeight: '100vh', background: DARK, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: `3px solid ${BLUE}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Chargement de la leçon...</p>
      </div>
    </div>
  );

  const slides = lesson.slides;
  const total = slides.length;
  const slide = slides[currentIdx];
  const progress = ((currentIdx + 1) / total) * 100;

  const goNext = () => {
    if (currentIdx < total - 1) { setDirection(1); setCurrentIdx(i => i + 1); }
    else setCompleted(true);
  };
  const goPrev = () => {
    if (currentIdx > 0) { setDirection(-1); setCurrentIdx(i => i - 1); }
  };
  const toggleReveal = (idx: number) => setRevealed(r => ({ ...r, [idx]: !r[idx] }));

  if (completed) return <CompletionScreen lesson={lesson} onRestart={() => { setCurrentIdx(0); setCompleted(false); setRevealed({}); }} onBack={() => navigate('/playground/module-generator')} />;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 50 }}>
        <button onClick={() => navigate('/playground/module-generator')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <ArrowLeft size={16} /> Retour
        </button>
        <div style={{ width: 1, height: 20, background: '#e5e7eb' }} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: DARK, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lesson.title}</p>
        </div>
        <span style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' }}>{currentIdx + 1} / {total}</span>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: '#e5e7eb' }}>
        <motion.div style={{ height: '100%', background: slide.type === 'pratique' ? PINK : BLUE }} animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
      </div>

      {/* Slide pills */}
      <div style={{ padding: '12px 24px', display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap', background: 'white', borderBottom: '1px solid #f3f4f6' }}>
        {slides.map((s, i) => (
          <button key={i} onClick={() => { setDirection(i > currentIdx ? 1 : -1); setCurrentIdx(i); }}
            style={{ width: 28, height: 8, border: 'none', cursor: 'pointer', borderRadius: 0, transition: 'all 0.2s',
              background: i === currentIdx ? (s.type === 'pratique' ? PINK : BLUE) : i < currentIdx ? (s.type === 'pratique' ? 'rgba(221,0,97,0.3)' : 'rgba(0,106,158,0.3)') : '#e5e7eb' }} />
        ))}
      </div>

      {/* Slide content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 860 }}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div key={currentIdx} custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: 'easeInOut' }}>
              {slide.type === 'intro' && <IntroSlide slide={slide as SlideIntro} />}
              {slide.type === 'theorie' && <TheorieSlide slide={slide as SlideTheorie} />}
              {slide.type === 'pratique' && <PratiqueSlide slide={slide as SlidePratique} idx={currentIdx} revealed={!!revealed[currentIdx]} onToggle={() => toggleReveal(currentIdx)} />}
              {slide.type === 'conclusion' && <ConclusionSlide slide={slide as SlideConclusion} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer navigation */}
      <div style={{ background: 'white', borderTop: '1px solid #e5e7eb', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={goPrev} disabled={currentIdx === 0}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', border: '1px solid #e5e7eb', background: 'white', cursor: currentIdx === 0 ? 'not-allowed' : 'pointer', opacity: currentIdx === 0 ? 0.4 : 1, fontWeight: 500, fontSize: 14, color: DARK }}>
          <ChevronLeft size={18} /> Précédent
        </button>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <TypeBadge type={slide.type} />
        </div>

        <button onClick={goNext}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', border: 'none', background: slide.type === 'pratique' ? PINK : BLUE, color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
          {currentIdx === total - 1 ? 'Terminer' : 'Suivant'} <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  if (type === 'theorie') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: `rgba(0,106,158,0.1)`, color: BLUE, fontSize: 12, fontWeight: 600 }}>
      <BookOpen size={12} /> THÉORIE
    </span>
  );
  if (type === 'pratique') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: `rgba(221,0,97,0.1)`, color: PINK, fontSize: 12, fontWeight: 600 }}>
      <Zap size={12} /> PRATIQUE
    </span>
  );
  if (type === 'intro') return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#f3f4f6', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>
      <Target size={12} /> INTRODUCTION
    </span>
  );
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: '#f3f4f6', color: '#6b7280', fontSize: 12, fontWeight: 600 }}>
      <Award size={12} /> CONCLUSION
    </span>
  );
}

function IntroSlide({ slide }: { slide: SlideIntro }) {
  return (
    <div style={{ background: DARK, padding: '64px 56px', minHeight: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${BLUE}, ${PINK})` }} />
      <div style={{ position: 'absolute', top: -120, right: -80, width: 320, height: 320, borderRadius: '50%', background: `${BLUE}18` }} />
      <div style={{ position: 'absolute', bottom: -80, left: -40, width: 200, height: 200, borderRadius: '50%', background: `${PINK}12` }} />

      <div style={{ position: 'relative' }}>
        <p style={{ margin: '0 0 16px', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: BLUE, textTransform: 'uppercase' }}>Introduction</p>
        <h1 style={{ margin: '0 0 16px', fontSize: 36, fontWeight: 700, color: 'white', lineHeight: 1.2 }}>{slide.titre}</h1>
        <p style={{ margin: '0 0 40px', fontSize: 16, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7 }}>{slide.contenu}</p>

        <div>
          <p style={{ margin: '0 0 16px', fontSize: 12, fontWeight: 600, color: BLUE, textTransform: 'uppercase', letterSpacing: 2 }}>Objectifs de cette leçon</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {slide.objectifs?.map((obj, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', background: 'rgba(255,255,255,0.06)', borderLeft: `3px solid ${BLUE}` }}>
                <CheckCircle size={14} style={{ color: BLUE, marginTop: 2, flexShrink: 0 }} />
                <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 1.4 }}>{obj}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TheorieSlide({ slide }: { slide: SlideTheorie }) {
  return (
    <div style={{ background: 'white', minHeight: 480, border: '1px solid #e5e7eb' }}>
      {/* Top bar */}
      <div style={{ height: 4, background: BLUE }} />
      <div style={{ padding: '40px 48px' }}>
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: BLUE, textTransform: 'uppercase' }}>Théorie</p>
        <h2 style={{ margin: '0 0 24px', fontSize: 28, fontWeight: 700, color: DARK }}>{slide.titre}</h2>
        <p style={{ margin: '0 0 32px', fontSize: 16, color: '#374151', lineHeight: 1.8 }}>{slide.contenu}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          {/* Key points */}
          <div>
            <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: 1.5 }}>Points clés</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {slide.pointsCles?.map((pt, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', background: `rgba(0,106,158,0.05)`, borderLeft: `3px solid ${BLUE}` }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: BLUE, minWidth: 20, lineHeight: 1.5 }}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={{ fontSize: 14, color: DARK, lineHeight: 1.5 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Example */}
          <div>
            <p style={{ margin: '0 0 14px', fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1.5 }}>Exemple concret</p>
            <div style={{ padding: '20px', background: '#f9fafb', borderLeft: '3px solid #e5e7eb', position: 'relative' }}>
              <Lightbulb size={18} style={{ color: '#f59e0b', position: 'absolute', top: 16, right: 16 }} />
              <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: 1.7, fontStyle: 'italic' }}>{slide.exemple}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PratiqueSlide({ slide, idx, revealed, onToggle }: { slide: SlidePratique; idx: number; revealed: boolean; onToggle: () => void }) {
  return (
    <div style={{ background: DARK, minHeight: 480, border: `2px solid ${PINK}20`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -100, right: -60, width: 280, height: 280, borderRadius: '50%', background: `${PINK}08` }} />
      <div style={{ height: 4, background: PINK }} />
      <div style={{ padding: '40px 48px', position: 'relative' }}>
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: PINK, textTransform: 'uppercase' }}>Mise en pratique</p>
        <h2 style={{ margin: '0 0 24px', fontSize: 28, fontWeight: 700, color: 'white' }}>{slide.titre}</h2>

        {/* Context */}
        <div style={{ padding: '20px 24px', background: 'rgba(255,255,255,0.06)', borderLeft: `3px solid rgba(255,255,255,0.2)`, marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.8 }}>{slide.contexte}</p>
        </div>

        {/* Question */}
        <div style={{ padding: '20px 24px', background: `${PINK}15`, borderLeft: `3px solid ${PINK}`, marginBottom: 20 }}>
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: PINK, textTransform: 'uppercase', letterSpacing: 1.5 }}>Votre défi</p>
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: 'white', lineHeight: 1.6 }}>{slide.question}</p>
        </div>

        {/* Hint */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', background: 'rgba(255,255,255,0.04)', marginBottom: 24 }}>
          <Lightbulb size={14} style={{ color: '#f59e0b', marginTop: 2, flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, fontStyle: 'italic' }}>{slide.indice}</p>
        </div>

        {/* Reveal */}
        <button onClick={onToggle} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', background: revealed ? 'rgba(255,255,255,0.12)' : PINK, border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14, marginBottom: revealed ? 20 : 0 }}>
          {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
          {revealed ? 'Masquer la réponse' : 'Révéler la réponse idéale'}
        </button>

        <AnimatePresence>
          {revealed && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}>
              <div style={{ padding: '20px 24px', background: 'rgba(0,106,158,0.15)', borderLeft: `3px solid ${BLUE}` }}>
                <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, color: BLUE, textTransform: 'uppercase', letterSpacing: 1.5 }}>Réponse idéale</p>
                <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.9)', lineHeight: 1.8 }}>{slide.reponse}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ConclusionSlide({ slide }: { slide: SlideConclusion }) {
  return (
    <div style={{ background: DARK, minHeight: 480, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${BLUE}, ${PINK})` }} />
      <div style={{ position: 'absolute', top: -80, right: -60, width: 240, height: 240, borderRadius: '50%', background: `${BLUE}12` }} />
      <div style={{ padding: '48px 56px', position: 'relative' }}>
        <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#9ca3af', textTransform: 'uppercase' }}>Conclusion</p>
        <h2 style={{ margin: '0 0 32px', fontSize: 32, fontWeight: 700, color: 'white' }}>{slide.titre}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 36 }}>
          {slide.points?.map((pt, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 20px', background: 'rgba(255,255,255,0.06)' }}>
              <div style={{ width: 24, height: 24, background: i % 2 === 0 ? BLUE : PINK, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{i + 1}</span>
              </div>
              <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 1.6 }}>{pt}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '20px 24px', background: `${BLUE}20`, borderLeft: `3px solid ${BLUE}` }}>
          <p style={{ margin: 0, fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, fontStyle: 'italic' }}>{slide.message}</p>
        </div>
      </div>
    </div>
  );
}

function CompletionScreen({ lesson, onRestart, onBack }: { lesson: Lesson; onRestart: () => void; onBack: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: DARK, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, textAlign: 'center' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: `linear-gradient(90deg, ${BLUE}, ${PINK})` }} />
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
        <div style={{ width: 80, height: 80, background: `linear-gradient(135deg, ${BLUE}, ${PINK})`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Award size={36} style={{ color: 'white' }} />
        </div>
        <h1 style={{ color: 'white', fontSize: 32, fontWeight: 700, margin: '0 0 12px' }}>Leçon terminée !</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 16, margin: '0 0 8px' }}>{lesson.title}</p>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, margin: '0 0 40px' }}>{lesson.slides.length} slides complétées</p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <button onClick={onRestart} style={{ padding: '12px 28px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
            Recommencer
          </button>
          <button onClick={onBack} style={{ padding: '12px 28px', background: BLUE, border: 'none', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
            Retour au studio
          </button>
        </div>
      </motion.div>
    </div>
  );
}
