import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Check, Edit2, Loader2, RefreshCw, Shield, Lock, BarChart2, Target, Users, TrendingUp, ShoppingBag, Monitor, Settings2, MessageSquare, Heart, PenLine, type LucideIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AgentLoadingScreen from '@/components/AgentLoadingScreen';

// Cyber-specific domain prompts — focused on cybersecurity topics
const DOMAIN_PROMPTS: Record<string, string> = {
  phishing:       "Former les collaborateurs à reconnaître et éviter les attaques de phishing : identifier les emails suspects, les liens malveillants, les tentatives d'hameçonnage par SMS (smishing) et téléphone (vishing). Public non technique, exemples concrets du quotidien professionnel.",
  mots_de_passe:  "Apprendre à créer et gérer des mots de passe robustes : critères d'un bon mot de passe, utilisation d'un gestionnaire de mots de passe, authentification multi-facteurs (MFA), bonnes pratiques de renouvellement et de partage sécurisé.",
  ransomware:     "Comprendre et prévenir les attaques par ransomware : identifier les vecteurs d'infection, les comportements à risque, les étapes d'une attaque, les réflexes en cas d'infection, et la politique de sauvegarde. Public mixte technique et non technique.",
  rgpd:           "Sensibiliser aux obligations RGPD dans le contexte de la cybersécurité : données personnelles et données sensibles, droits des personnes, obligations de notification en cas de violation, sécurisation des traitements, et rôles DPO/RSSI.",
  zero_trust:     "Comprendre et appliquer les principes du Zero Trust : ne jamais faire confiance, toujours vérifier, principe du moindre privilège, segmentation réseau, surveillance continue. Public technique et architectes sécurité.",
  cloud_security: "Sécuriser ses usages cloud : responsabilité partagée, configuration sécurisée (S3, Azure Blob, GCP), gestion des identités IAM, chiffrement des données au repos et en transit, audit et monitoring cloud.",
  incident:       "Gérer un incident de sécurité : détecter les signaux faibles, activer la cellule de crise, contenir la menace, éradiquer et remédier, communiquer en interne et en externe, et rédiger un retour d'expérience (REX).",
  pentest:        "Introduction au test d'intrusion (pentest) : méthodologie PTES, phases de reconnaissance, scan, exploitation et post-exploitation, outils courants (Nmap, Metasploit, Burp Suite), rapport et recommandations. Public technique.",
  autre:          '',
};

const DOMAINS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: 'phishing',       label: 'Phishing',          icon: Shield },
  { value: 'mots_de_passe',  label: 'Mots de passe',     icon: Lock },
  { value: 'ransomware',     label: 'Ransomware',        icon: BarChart2 },
  { value: 'rgpd',           label: 'RGPD & Données',    icon: Target },
  { value: 'zero_trust',     label: 'Zero Trust',        icon: Monitor },
  { value: 'cloud_security', label: 'Cloud Security',    icon: Settings2 },
  { value: 'incident',       label: 'Gestion incident',  icon: MessageSquare },
  { value: 'pentest',        label: 'Pentest',           icon: TrendingUp },
  { value: 'autre',          label: 'Autre',             icon: PenLine },
];

const AUDIENCES = [
  { value: 'grand_public',  label: 'Grand public' },
  { value: 'managers',      label: 'Managers & Responsables' },
  { value: 'experts',       label: 'Experts techniques' },
  { value: 'rh',            label: 'RH & Formation' },
  { value: 'dirigeants',    label: 'Dirigeants & COMEX' },
  { value: 'commercial',    label: 'Équipes commerciales' },
];

const DIFFICULTIES = [
  { value: 'debutant',       label: 'Débutant',       sub: 'Notions fondamentales' },
  { value: 'intermediaire',  label: 'Intermédiaire',  sub: 'Cas pratiques métier' },
  { value: 'expert',         label: 'Expert',         sub: 'Enjeux avancés' },
];

const DURATIONS = [
  { value: '15',  label: '15 min',  sub: 'micro-learning' },
  { value: '30',  label: '30 min',  sub: 'express' },
  { value: '60',  label: '1 heure', sub: 'standard' },
  { value: '120', label: '2 heures',sub: 'approfondi' },
];

const SLIDE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  intro:        { label: 'Intro',          color: '#0057ff' },
  theorie:      { label: 'Théorie',        color: '#7c3aed' },
  pratique:     { label: 'Pratique',       color: '#059669' },
  'fill-blank': { label: 'Texte à trous',  color: '#d97706' },
  'vrai-faux':  { label: 'Vrai / Faux',    color: '#dc2626' },
  conclusion:   { label: 'Conclusion',     color: '#475569' },
};

const ACC = '#0057ff';
const BG = '#0f1117';
const SURFACE = '#111827';
const BORDER = '#1e2d45';
const TEXT = '#f1f5f9';
const SUB = '#64748b';
const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";

interface PlanItem { index: number; type: string; titre: string; }
interface PlanPreview { title: string; subtitle: string; plan: PlanItem[]; }

export default function CyberStudioIA() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<'pitch' | 'config' | 'plan' | 'generating'>('pitch');
  const [pitch, setPitch] = useState('');
  const [domainKey, setDomainKey] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [audience, setAudience] = useState('grand_public');
  const [difficulty, setDifficulty] = useState('intermediaire');
  const [duration, setDuration] = useState('30');
  const [planPreview, setPlanPreview] = useState<PlanPreview | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  const domainValue = domainKey === 'autre' ? customDomain : (domainKey || '');
  const progress = step === 'pitch' ? 33 : step === 'config' ? 66 : step === 'plan' ? 90 : 100;

  const goToPlan = async () => {
    setPlanLoading(true);
    setStep('plan');
    setPlanPreview(null);
    try {
      const res = await fetch('/api/studio/preview-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch, domain: domainValue, audience, difficulty, duration }),
      });
      if (!res.ok) throw new Error();
      setPlanPreview(await res.json());
    } catch {
      toast({ title: 'Erreur', description: 'Impossible de générer le plan. Réessayez.', variant: 'destructive' });
      setStep('config');
    } finally {
      setPlanLoading(false);
    }
  };

  const generate = async () => {
    setStep('generating');
    try {
      const res = await fetch('/api/studio/generate-lesson-from-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitch, domain: domainValue, audience, difficulty, duration, scope: 'cyber' }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLocation(`/cyber/academie/player/${data.id}`);
    } catch {
      toast({ title: 'Erreur', description: 'La génération a échoué. Réessayez.', variant: 'destructive' });
      setStep('plan');
    }
  };

  const restart = () => {
    setPitch(''); setDomainKey(''); setCustomDomain('');
    setAudience('grand_public'); setDifficulty('intermediaire'); setDuration('30');
    setPlanPreview(null); setStep('pitch');
  };

  const handleBack = () => {
    if (step === 'pitch') setLocation('/cyber/academie');
    else if (step === 'config') setStep('pitch');
    else if (step === 'plan') setStep('config');
    else restart();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: SANS, color: TEXT, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, backgroundColor: '#0a0d14', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ height: 2, background: BORDER }}>
          <div style={{ height: '100%', background: ACC, width: `${progress}%`, transition: 'width 0.6s ease' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={handleBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: SUB }}>
              <ArrowLeft size={18} />
            </button>
            <div style={{ width: 1, height: 16, background: BORDER }} />
            <span style={{ fontFamily: MONO, fontWeight: 600, fontSize: '0.72rem', color: ACC, letterSpacing: '0.1em' }}>CYBER ACADÉMIE</span>
            <div style={{ width: 1, height: 16, background: BORDER }} />
            <span style={{ fontFamily: MONO, fontSize: '0.7rem', color: SUB }}>Studio IA · Micro Learning</span>
          </div>
          <span style={{ fontFamily: MONO, fontSize: '0.65rem', color: BORDER }}>
            {step === 'pitch' ? '1/3' : step === 'config' ? '2/3' : step === 'plan' ? '3/3' : '…'}
          </span>
        </div>
      </header>

      <main style={{ flex: 1, paddingTop: 64 }}>
        <AnimatePresence mode="wait">

          {/* ── Step 1: Pitch ── */}
          {step === 'pitch' && (
            <motion.div key="pitch" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 32px', maxWidth: 700, margin: '0 auto' }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: '0.62rem', letterSpacing: '0.15em', color: ACC, marginBottom: 16, padding: '3px 10px', background: `${ACC}15`, border: `1px solid ${ACC}30`, display: 'inline-block' }}>
                  ÉTAPE 1 — VOTRE BESOIN
                </div>
                <h1 style={{ fontFamily: MONO, fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 600, lineHeight: 1.15, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                  Décrivez votre<br />besoin de formation
                </h1>
                <div style={{ width: 40, height: 2, background: ACC, marginBottom: 32 }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                  <div>
                    <label style={{ display: 'block', fontFamily: MONO, fontSize: '0.65rem', letterSpacing: '0.1em', color: SUB, marginBottom: 8 }}>
                      VOTRE BESOIN *
                    </label>
                    <textarea
                      value={pitch}
                      onChange={e => setPitch(e.target.value)}
                      placeholder="Ex : Former mes équipes à reconnaître un email de phishing et adopter les bons réflexes — elles n'ont pas de bagage technique."
                      style={{ width: '100%', background: SURFACE, border: `1px solid ${BORDER}`, padding: '12px 16px', fontSize: '0.875rem', resize: 'none', color: TEXT, fontFamily: SANS, minHeight: 120, outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => (e.target.style.borderColor = ACC)}
                      onBlur={e => (e.target.style.borderColor = BORDER)}
                    />
                    <p style={{ fontFamily: MONO, fontSize: '0.62rem', color: BORDER, marginTop: 4 }}>{pitch.length} / 500 caractères</p>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontFamily: MONO, fontSize: '0.65rem', letterSpacing: '0.1em', color: SUB, marginBottom: 10 }}>
                      THÈME <span style={{ color: BORDER, fontWeight: 400 }}>(optionnel)</span>
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      {DOMAINS.map(d => (
                        <button key={d.value} onClick={() => {
                          const next = domainKey === d.value ? '' : d.value;
                          setDomainKey(next);
                          if (next && next !== 'autre' && DOMAIN_PROMPTS[next]) setPitch(DOMAIN_PROMPTS[next]);
                          else if (!next) setPitch('');
                        }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
                            background: domainKey === d.value ? `${ACC}15` : SURFACE,
                            border: `1px solid ${domainKey === d.value ? ACC : BORDER}`,
                            cursor: 'pointer', color: domainKey === d.value ? ACC : SUB,
                            fontFamily: MONO, fontSize: '0.68rem', letterSpacing: '0.04em', position: 'relative',
                          }}>
                          {domainKey === d.value && <span style={{ position: 'absolute', top: 4, right: 6, color: ACC }}><Check size={9} /></span>}
                          <d.icon size={14} />
                          {d.label}
                        </button>
                      ))}
                    </div>
                    {domainKey === 'autre' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ marginTop: 8 }}>
                        <input
                          type="text" value={customDomain} onChange={e => setCustomDomain(e.target.value)}
                          placeholder="Précisez le thème…" autoFocus
                          style={{ width: '100%', background: SURFACE, border: `1px solid ${BORDER}`, padding: '10px 14px', fontSize: '0.85rem', color: TEXT, fontFamily: SANS, outline: 'none', boxSizing: 'border-box' }}
                        />
                      </motion.div>
                    )}
                  </div>

                  <div style={{ borderLeft: `2px solid ${ACC}`, paddingLeft: 14 }}>
                    <p style={{ fontFamily: SANS, fontSize: '0.82rem', color: SUB, margin: 0 }}>
                      Plus le besoin est précis, plus le module sera pertinent et directement utilisable par vos apprenants.
                    </p>
                  </div>

                  <button
                    onClick={() => setStep('config')}
                    disabled={pitch.trim().length < 20}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: ACC, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', opacity: pitch.trim().length < 20 ? 0.3 : 1, width: 'fit-content' }}
                  >
                    Continuer <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Config ── */}
          {step === 'config' && (
            <motion.div key="config" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 32px', maxWidth: 700, margin: '0 auto' }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: '0.62rem', letterSpacing: '0.15em', color: ACC, marginBottom: 16, padding: '3px 10px', background: `${ACC}15`, border: `1px solid ${ACC}30`, display: 'inline-block' }}>
                  ÉTAPE 2 — PARAMÈTRES
                </div>
                <h1 style={{ fontFamily: MONO, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 600, lineHeight: 1.15, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                  Paramétrez le module
                </h1>
                <div style={{ width: 40, height: 2, background: ACC, marginBottom: 32 }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                  {/* Recap pitch */}
                  <div style={{ background: SURFACE, border: `1px solid ${BORDER}`, padding: '12px 16px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: MONO, fontSize: '0.6rem', color: BORDER, marginBottom: 4, letterSpacing: '0.08em' }}>VOTRE BESOIN</div>
                      <p style={{ fontSize: '0.82rem', color: SUB, margin: '0 0 6px', fontFamily: SANS, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{pitch}</p>
                      {domainValue && <span style={{ fontFamily: MONO, fontSize: '0.62rem', padding: '1px 6px', background: `${ACC}15`, color: ACC, border: `1px solid ${ACC}30` }}>{domainValue}</span>}
                    </div>
                    <button onClick={() => setStep('pitch')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: BORDER, padding: 0 }}>
                      <Edit2 size={13} />
                    </button>
                  </div>

                  {/* Public */}
                  <div>
                    <label style={{ display: 'block', fontFamily: MONO, fontSize: '0.65rem', letterSpacing: '0.1em', color: SUB, marginBottom: 10 }}>PUBLIC CIBLE</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                      {AUDIENCES.map(a => (
                        <button key={a.value} onClick={() => setAudience(a.value)}
                          style={{ padding: '10px 14px', background: audience === a.value ? `${ACC}15` : SURFACE, border: `1px solid ${audience === a.value ? ACC : BORDER}`, color: audience === a.value ? ACC : SUB, cursor: 'pointer', fontFamily: SANS, fontSize: '0.82rem', fontWeight: audience === a.value ? 600 : 400, textAlign: 'left' }}>
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulté */}
                  <div>
                    <label style={{ display: 'block', fontFamily: MONO, fontSize: '0.65rem', letterSpacing: '0.1em', color: SUB, marginBottom: 10 }}>NIVEAU DE DIFFICULTÉ</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {DIFFICULTIES.map(d => (
                        <button key={d.value} onClick={() => setDifficulty(d.value)}
                          style={{ padding: '12px 8px', background: difficulty === d.value ? `${ACC}15` : SURFACE, border: `1px solid ${difficulty === d.value ? ACC : BORDER}`, cursor: 'pointer', textAlign: 'center' }}>
                          <div style={{ fontFamily: MONO, fontSize: '0.72rem', fontWeight: 600, color: difficulty === d.value ? ACC : TEXT, marginBottom: 2 }}>{d.label}</div>
                          <div style={{ fontFamily: SANS, fontSize: '0.72rem', color: SUB }}>{d.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Durée */}
                  <div>
                    <label style={{ display: 'block', fontFamily: MONO, fontSize: '0.65rem', letterSpacing: '0.1em', color: SUB, marginBottom: 10 }}>DURÉE SOUHAITÉE</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                      {DURATIONS.map(d => (
                        <button key={d.value} onClick={() => setDuration(d.value)}
                          style={{ padding: '12px 8px', background: duration === d.value ? `${ACC}15` : SURFACE, border: `1px solid ${duration === d.value ? ACC : BORDER}`, cursor: 'pointer', textAlign: 'center' }}>
                          <div style={{ fontFamily: MONO, fontSize: '0.75rem', fontWeight: 600, color: duration === d.value ? ACC : TEXT }}>{d.label}</div>
                          <div style={{ fontFamily: SANS, fontSize: '0.68rem', color: SUB, marginTop: 2 }}>{d.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={goToPlan}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: ACC, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em', width: 'fit-content' }}>
                    <Sparkles size={15} /> Voir le plan du module
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Plan ── */}
          {step === 'plan' && (
            <motion.div key="plan" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 32px', maxWidth: 700, margin: '0 auto' }}>
              <div>
                <div style={{ fontFamily: MONO, fontSize: '0.62rem', letterSpacing: '0.15em', color: ACC, marginBottom: 16, padding: '3px 10px', background: `${ACC}15`, border: `1px solid ${ACC}30`, display: 'inline-block' }}>
                  ÉTAPE 3 — VALIDATION DU PLAN
                </div>

                {planLoading ? (
                  <div>
                    <h1 style={{ fontFamily: MONO, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 600, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
                      L'IA structure le module…
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: SUB }}>
                      <Loader2 size={18} style={{ color: ACC, animation: 'spin 1s linear infinite' }} />
                      <span style={{ fontFamily: SANS, fontSize: '0.85rem' }}>Analyse du besoin et structuration en cours…</span>
                    </div>
                  </div>
                ) : planPreview ? (
                  <>
                    <h1 style={{ fontFamily: MONO, fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 600, margin: '0 0 4px', letterSpacing: '-0.02em', color: TEXT }}>
                      {planPreview.title}
                    </h1>
                    <p style={{ fontFamily: SANS, fontSize: '0.88rem', color: SUB, margin: '0 0 8px' }}>{planPreview.subtitle}</p>
                    <div style={{ width: 40, height: 2, background: ACC, marginBottom: 24 }} />

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 28 }}>
                      {planPreview.plan.map((item, i) => {
                        const typeInfo = SLIDE_TYPE_LABELS[item.type] || { label: item.type, color: SUB };
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: SURFACE, border: `1px solid ${BORDER}`, padding: '10px 14px' }}>
                            <span style={{ fontFamily: MONO, fontSize: '0.6rem', color: BORDER, width: 16, flexShrink: 0 }}>{item.index}</span>
                            <span style={{ fontFamily: MONO, fontSize: '0.62rem', fontWeight: 600, padding: '1px 6px', background: `${typeInfo.color}15`, color: typeInfo.color, flexShrink: 0 }}>{typeInfo.label}</span>
                            <span style={{ fontFamily: SANS, fontSize: '0.82rem', color: TEXT, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.titre}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div style={{ borderLeft: `2px solid ${BORDER}`, paddingLeft: 14, marginBottom: 24 }}>
                      <p style={{ fontFamily: SANS, fontSize: '0.82rem', color: SUB, margin: 0 }}>
                        Ce plan vous convient ? Lancez la génération complète, ou modifiez vos paramètres pour l'affiner.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <button onClick={generate}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: ACC, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.08em' }}>
                        <Sparkles size={15} /> Générer le micro learning
                      </button>
                      <button onClick={goToPlan}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: 'transparent', color: SUB, border: `1px solid ${BORDER}`, cursor: 'pointer', fontFamily: MONO, fontSize: '0.7rem' }}>
                        <RefreshCw size={13} /> Regénérer le plan
                      </button>
                    </div>
                  </>
                ) : null}
              </div>
            </motion.div>
          )}

          {step === 'generating' && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AgentLoadingScreen mode="prompt" />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
