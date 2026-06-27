import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Sparkles, Check, Edit2, Loader2, RefreshCw, Shield, Lock, BarChart2, Target, Users, TrendingUp, ShoppingBag, Monitor, Settings2, MessageSquare, Heart, PenLine, type LucideIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import mcLogoPath from '@assets/mc2i.png';
import AgentLoadingScreen from '@/components/AgentLoadingScreen';

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

const DOMAIN_PROMPTS: Record<string, string> = {
  cybersecurite: "Former tous les collaborateurs aux bonnes pratiques de cybersécurité au quotidien : reconnaître un email de phishing, créer et gérer des mots de passe robustes, sécuriser son poste de travail et ses données, réagir correctement en cas d'incident. Public non technique, exemples concrets tirés du quotidien professionnel.",
  rgpd: "Sensibiliser les équipes au RGPD et à la protection des données personnelles : comprendre ce qu'est une donnée personnelle, les droits des personnes concernées, les obligations légales de l'entreprise, les bons réflexes en cas de violation de données, et comment collecter/stocker/supprimer les données en conformité.",
  excel_data: "Maîtriser les fondamentaux d'Excel et de l'analyse de données : formules essentielles (SOMME, RECHERCHEV, SI, NB.SI), tableaux croisés dynamiques, mise en forme conditionnelle, création de graphiques pertinents, et initiation à la lecture critique des données et indicateurs métier.",
  management: "Développer les compétences managériales essentielles : donner un feedback constructif, mener un entretien individuel efficace, fixer des objectifs SMART, gérer les conflits dans l'équipe, motiver et engager ses collaborateurs dans la durée, et adapter son style de management selon les profils.",
  rh: "Former les professionnels RH et managers aux processus clés des ressources humaines : conduite d'entretien de recrutement, onboarding réussi, gestion des entretiens annuels, prévention des RPS (risques psychosociaux), cadre légal du droit du travail et obligations employeur.",
  finance: "Acquérir les bases de la finance d'entreprise pour non-financiers : lire et comprendre un bilan et un compte de résultat, maîtriser les notions de rentabilité, marge et cash-flow, comprendre le budget prévisionnel, analyser les indicateurs financiers clés et dialoguer efficacement avec les équipes finance.",
  commerce: "Renforcer les compétences commerciales et de vente : techniques de prospection efficaces, qualification des besoins clients, construction d'un argumentaire percutant, gestion des objections, closing et fidélisation. Focus sur la vente consultative et la relation client dans un contexte B2B.",
  it: "Former les utilisateurs et équipes IT aux fondamentaux des systèmes d'information : architecture réseau et cloud, gestion des accès et des droits, sauvegardes et continuité de service, ITIL et gestion des incidents, bonnes pratiques de maintenance et de support utilisateur.",
  qualite: "Sensibiliser aux démarches qualité et à l'amélioration continue : comprendre les normes ISO, mettre en place des indicateurs de performance (KPIs), utiliser les outils qualité (5S, PDCA, ishikawa, cartographie de processus), gérer les non-conformités et animer une culture qualité dans l'équipe.",
  communication: "Développer les compétences en communication professionnelle : prise de parole en public, structuration d'un message clair et impactant, communication écrite efficace (emails, rapports, présentations), écoute active, gestion du feedback et adaptation du discours selon l'interlocuteur.",
  sante: "Former les collaborateurs à la santé et sécurité au travail : identifier les risques professionnels (TMS, RPS, accidents), appliquer les gestes et postures adaptés, connaître les obligations légales employeur et salarié, réagir face à une situation d'urgence, et contribuer activement à la prévention des risques.",
};

const DOMAINS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: 'cybersecurite', label: 'Cybersécurité',    icon: Shield },
  { value: 'rgpd',          label: 'RGPD & Données',   icon: Lock },
  { value: 'excel_data',    label: 'Excel & Data',     icon: BarChart2 },
  { value: 'management',    label: 'Management',        icon: Target },
  { value: 'rh',            label: 'RH & Formation',   icon: Users },
  { value: 'finance',       label: 'Finance',           icon: TrendingUp },
  { value: 'commerce',      label: 'Commerce & Vente',  icon: ShoppingBag },
  { value: 'it',            label: 'IT & Systèmes',    icon: Monitor },
  { value: 'qualite',       label: 'Qualité & Process', icon: Settings2 },
  { value: 'communication', label: 'Communication',     icon: MessageSquare },
  { value: 'sante',         label: 'Santé & Sécurité',  icon: Heart },
  { value: 'autre',         label: 'Autre',             icon: PenLine },
];

const AUDIENCES = [
  { value: 'grand_public', label: 'Grand public' },
  { value: 'managers', label: 'Managers & Responsables' },
  { value: 'experts', label: 'Experts techniques' },
  { value: 'rh', label: 'RH & Formation' },
  { value: 'dirigeants', label: 'Dirigeants & COMEX' },
  { value: 'commercial', label: 'Équipes commerciales' },
];

const DIFFICULTIES = [
  { value: 'debutant', label: 'Débutant', sub: 'Notions fondamentales' },
  { value: 'intermediaire', label: 'Intermédiaire', sub: 'Cas pratiques métier' },
  { value: 'expert', label: 'Expert', sub: 'Enjeux avancés' },
];

const DURATIONS = [
  { value: '15', label: '15 min', sub: 'micro-learning' },
  { value: '30', label: '30 min', sub: 'express' },
  { value: '60', label: '1 heure', sub: 'standard' },
  { value: '120', label: '2 heures', sub: 'approfondi' },
];

interface Template {
  id: string;
  domain: string;
  title: string;
  description: string;
  tags: string[];
  duration: string;
  audience: string;
  difficulty: string;
}

const TEMPLATES: Template[] = [
  {
    id: 'phishing-101',
    domain: 'cybersecurite',
    title: 'Anti-phishing : reconnaître les mails suspects',
    description: 'Former tous les collaborateurs à détecter les tentatives de phishing. Exemples réels, quiz interactifs, réflexes clés.',
    tags: ['Phishing', 'Email', 'Mots de passe'],
    duration: '30',
    audience: 'grand_public',
    difficulty: 'debutant',
  },
  {
    id: 'rgpd-bases',
    domain: 'rgpd',
    title: 'RGPD essentiel pour les équipes',
    description: 'Comprendre les fondamentaux du RGPD : droits des personnes, obligations, réflexes en cas d\'incident de données.',
    tags: ['RGPD', 'Données', 'Conformité'],
    duration: '30',
    audience: 'grand_public',
    difficulty: 'debutant',
  },
  {
    id: 'feedback-manager',
    domain: 'management',
    title: 'Donner un feedback constructif',
    description: 'Maîtriser la méthode DESC et les techniques de feedback pour des entretiens individuels efficaces et bienveillants.',
    tags: ['Feedback', 'Entretien', 'DESC'],
    duration: '30',
    audience: 'managers',
    difficulty: 'intermediaire',
  },
  {
    id: 'excel-tcd',
    domain: 'excel_data',
    title: 'Tableaux croisés dynamiques Excel',
    description: 'Créer et exploiter des TCD pour analyser des données métier, filtrer, regrouper et créer des graphiques croisés.',
    tags: ['Excel', 'TCD', 'Analyse'],
    duration: '60',
    audience: 'grand_public',
    difficulty: 'intermediaire',
  },
  {
    id: 'recrutement-entretien',
    domain: 'rh',
    title: 'Conduire un entretien de recrutement',
    description: 'Structurer un entretien, poser les bonnes questions, éviter les biais cognitifs, évaluer objectivement les candidats.',
    tags: ['Recrutement', 'Entretien', 'Biais'],
    duration: '45',
    audience: 'managers',
    difficulty: 'intermediaire',
  },
  {
    id: 'finance-nonfi',
    domain: 'finance',
    title: 'Lire un bilan pour non-financiers',
    description: 'Décrypter un bilan et un compte de résultat, comprendre rentabilité, marge et cash-flow, dialoguer avec les équipes finance.',
    tags: ['Bilan', 'P&L', 'Cash-flow'],
    duration: '60',
    audience: 'dirigeants',
    difficulty: 'intermediaire',
  },
  {
    id: 'pitch-commercial',
    domain: 'commerce',
    title: 'Réussir son pitch commercial en 5 min',
    description: 'Structurer un argumentaire percutant, gérer les objections prix et délai, conclure avec les bonnes questions de closing.',
    tags: ['Pitch', 'Objections', 'Closing'],
    duration: '30',
    audience: 'commercial',
    difficulty: 'intermediaire',
  },
  {
    id: 'prise-parole',
    domain: 'communication',
    title: 'Prise de parole en public : les bases',
    description: 'Structurer un message, capter l\'attention dès les premières secondes, gérer le stress et les silences face à un auditoire.',
    tags: ['Prise de parole', 'Stress', 'Structure'],
    duration: '30',
    audience: 'grand_public',
    difficulty: 'debutant',
  },
];

const DOMAIN_ACCENT: Record<string, string> = {
  cybersecurite: '#0057ff',
  rgpd: '#7c3aed',
  management: '#059669',
  excel_data: '#059669',
  rh: '#d97706',
  finance: '#0057ff',
  commerce: '#dc2626',
  communication: '#dd0061',
  it: '#0057ff',
  qualite: '#7c3aed',
  sante: '#059669',
};

const SLIDE_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  intro:       { label: 'Intro',         color: BLUE },
  theorie:     { label: 'Théorie',       color: '#7c3aed' },
  pratique:    { label: 'Pratique',      color: '#059669' },
  'fill-blank':{ label: 'Texte à trous', color: '#d97706' },
  'vrai-faux': { label: 'Vrai / Faux',   color: '#dc2626' },
  conclusion:  { label: 'Conclusion',    color: DARK },
};

interface PlanItem { index: number; type: string; titre: string; }
interface PlanPreview { title: string; subtitle: string; plan: PlanItem[]; }

export default function StudioIA() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [step, setStep] = useState<'pitch' | 'config' | 'plan' | 'generating'>('pitch');
  const [pitch, setPitch] = useState('');
  const [domainKey, setDomainKey] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [audience, setAudience] = useState('grand_public');
  const [difficulty, setDifficulty] = useState('intermediaire');
  const [duration, setDuration] = useState('30');
  const [planLoading, setPlanLoading] = useState(false);
  const [planPreview, setPlanPreview] = useState<PlanPreview | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const domainValue = domainKey === 'autre' ? customDomain : (DOMAINS.find(d => d.value === domainKey)?.label || '');
  const progress = step === 'pitch' ? 25 : step === 'config' ? 50 : step === 'plan' ? 75 : 100;

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
      const data = await res.json();
      setPlanPreview(data);
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
        body: JSON.stringify({ pitch, domain: domainValue, audience, difficulty, duration }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setLocation(`/playground/lesson/${data.id}`);
    } catch {
      toast({ title: 'Erreur', description: 'La génération a échoué. Réessayez.', variant: 'destructive' });
      setStep('plan');
    }
  };

  const restart = () => {
    setPitch(''); setDomainKey(''); setCustomDomain('');
    setAudience('grand_public'); setDifficulty('intermediaire'); setDuration('30');
    setPlanPreview(null);
    setSelectedTemplateId(null);
    setStep('pitch');
  };

  const handleBack = () => {
    if (step === 'pitch') setLocation('/playground/module-generator');
    else if (step === 'config') setStep('pitch');
    else if (step === 'plan') setStep('config');
    else restart();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ color: DARK }}>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="h-0.5 w-full bg-gray-100">
          <div className="h-full transition-all duration-700" style={{ width: `${progress}%`, background: PINK }} />
        </div>
        <div className="flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="hover:opacity-60 transition-opacity">
              <ArrowLeft size={18} style={{ color: BLUE }} />
            </button>
            <img src={mcLogoPath} alt="mc2i" className="h-7 w-auto" />
            <div className="h-4 w-px bg-gray-200" />
            <span className="font-bold text-sm" style={{ color: BLUE }}>FYNE</span>
            <div className="h-4 w-px bg-gray-200 hidden sm:block" />
            <span className="text-sm text-gray-500 font-medium hidden sm:block">Studio IA · Micro Learning</span>
          </div>
          <span className="text-xs text-gray-400 font-medium">
            {step === 'pitch' ? '1/3' : step === 'config' ? '2/3' : step === 'plan' ? '3/3' : '…'}
          </span>
        </div>
      </header>

      <main className="flex-1 pt-14">
        <AnimatePresence mode="wait">

          {step === 'pitch' && (
            <motion.div key="pitch" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="min-h-screen flex flex-col justify-center px-6 lg:px-16 py-16">
              <div className="max-w-2xl">
                <div className="text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 inline-block"
                  style={{ background: `${PINK}12`, color: PINK }}>
                  Étape 1 · Votre besoin
                </div>
                <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4 leading-tight">
                  <span style={{ color: PINK }}>Pitchez</span> votre<br />
                  <span style={{ color: DARK }}>besoin de formation</span>
                </h1>
                <div className="w-16 h-1 mb-8" style={{ background: PINK }} />

                <div className="space-y-8">

                  {/* Mode A : galerie templates (aucun template sélectionné) */}
                  {!selectedTemplateId && (
                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                        {TEMPLATES.map(tpl => {
                          const accent = DOMAIN_ACCENT[tpl.domain] || BLUE;
                          return (
                            <button
                              key={tpl.id}
                              onClick={() => {
                                setSelectedTemplateId(tpl.id);
                                setDomainKey(tpl.domain);
                                setPitch(DOMAIN_PROMPTS[tpl.domain] || '');
                                setAudience(tpl.audience);
                                setDifficulty(tpl.difficulty);
                                setDuration(tpl.duration);
                              }}
                              className="text-left p-3 transition-all group"
                              style={{ border: '1px solid #e5e7eb', background: 'white' }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = accent;
                                (e.currentTarget as HTMLButtonElement).style.background = `${accent}06`;
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb';
                                (e.currentTarget as HTMLButtonElement).style.background = 'white';
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <div className="w-0.5 flex-shrink-0 self-stretch" style={{ background: accent }} />
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold leading-tight mb-1" style={{ color: DARK }}>{tpl.title}</div>
                                  <div className="flex flex-wrap gap-1">
                                    {tpl.tags.map(tag => (
                                      <span key={tag} className="text-xs px-1.5 py-0.5 font-medium"
                                        style={{ background: `${accent}12`, color: accent }}>
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <ArrowRight size={12} className="flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }} />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <div className="border-t border-gray-100 pt-3">
                        <button
                          onClick={() => { setSelectedTemplateId('scratch'); setPitch(''); setDomainKey(''); }}
                          className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
                        >
                          Partir de zéro →
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mode B : template sélectionné ou from scratch — affinement */}
                  {selectedTemplateId && (() => {
                    const tpl = TEMPLATES.find(t => t.id === selectedTemplateId);
                    const accent = tpl ? (DOMAIN_ACCENT[tpl.domain] || BLUE) : DARK;
                    return (
                      <div>
                        {tpl && (
                          <div className="flex items-center justify-between mb-4 px-3 py-2"
                            style={{ background: `${accent}08`, borderLeft: `3px solid ${accent}` }}>
                            <div>
                              <div className="text-xs font-bold" style={{ color: accent }}>Template sélectionné</div>
                              <div className="text-sm font-semibold" style={{ color: DARK }}>{tpl.title}</div>
                            </div>
                            <button
                              onClick={() => { setSelectedTemplateId(null); setPitch(''); setDomainKey(''); }}
                              className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                            >
                              Changer
                            </button>
                          </div>
                        )}
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                          {tpl ? 'Affinez le besoin si nécessaire' : 'Décrivez votre besoin'}
                        </label>
                        <textarea
                          value={pitch}
                          onChange={e => setPitch(e.target.value)}
                          placeholder="Ex : Former mes commerciaux aux bonnes pratiques de cybersécurité — phishing, mots de passe, données clients. Ils n'ont aucune base technique."
                          className="w-full border border-gray-200 px-4 py-3 text-sm resize-none focus:outline-none focus:border-gray-400 bg-white"
                          style={{ minHeight: 130, color: DARK }}
                        />
                        <p className="text-xs text-gray-400 mt-1">{pitch.length} / 500 caractères</p>
                      </div>
                    );
                  })()}


                  {selectedTemplateId && (
                    <>
                      {selectedTemplateId === 'scratch' && (
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                            Domaine <span className="text-gray-400 font-normal normal-case">(optionnel)</span>
                          </label>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {DOMAINS.map(d => (
                              <button key={d.value} onClick={() => {
                                const next = domainKey === d.value ? '' : d.value;
                                setDomainKey(next);
                                if (next && next !== 'autre' && DOMAIN_PROMPTS[next]) {
                                  setPitch(DOMAIN_PROMPTS[next]);
                                } else if (!next) {
                                  setPitch('');
                                }
                              }}
                                className="flex flex-col items-center gap-1 border px-2 py-3 text-xs font-medium transition-all relative"
                                style={{
                                  borderColor: domainKey === d.value ? BLUE : '#e5e7eb',
                                  background: domainKey === d.value ? `${BLUE}0a` : 'white',
                                  color: domainKey === d.value ? BLUE : '#6b7280',
                                }}>
                                {domainKey === d.value && (
                                  <span className="absolute top-1 right-1">
                                    <Check size={10} style={{ color: BLUE }} />
                                  </span>
                                )}
                                <d.icon size={18} />
                                <span className="text-center leading-tight">{d.label}</span>
                              </button>
                            ))}
                          </div>
                          {domainKey === 'autre' && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3">
                              <input
                                type="text"
                                value={customDomain}
                                onChange={e => setCustomDomain(e.target.value)}
                                placeholder="Précisez le domaine..."
                                autoFocus
                                className="w-full border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-gray-500 bg-white"
                                style={{ color: DARK }}
                              />
                            </motion.div>
                          )}
                        </div>
                      )}

                      <div className="border-l-2 pl-4 py-1" style={{ borderColor: PINK }}>
                        <p className="text-sm text-gray-500">
                          Plus votre pitch est précis, plus le micro learning sera pertinent et directement utilisable.
                        </p>
                      </div>

                      <button
                        onClick={() => setStep('config')}
                        disabled={pitch.trim().length < 20}
                        className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
                        style={{ background: PINK }}
                      >
                        Continuer <ArrowRight size={18} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {step === 'config' && (
            <motion.div key="config" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="min-h-screen flex flex-col justify-center px-6 lg:px-16 py-16">
              <div className="max-w-2xl">
                <div className="text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 inline-block"
                  style={{ background: `${PINK}12`, color: PINK }}>
                  Étape 2 · Paramètres
                </div>
                <h1 className="text-4xl font-black tracking-tight mb-4" style={{ color: DARK }}>
                  Paramétrez<br /><span style={{ color: PINK }}>le module</span>
                </h1>
                <div className="w-16 h-1 mb-8" style={{ background: PINK }} />

                <div className="space-y-10">
                  <div className="border border-gray-100 p-4 bg-gray-50 flex items-start gap-3">
                    <div className="flex-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Votre besoin</div>
                      <p className="text-sm text-gray-700 line-clamp-2">{pitch}</p>
                      {domainValue && <span className="inline-block mt-2 text-xs px-2 py-0.5 font-medium" style={{ background: `${BLUE}12`, color: BLUE }}>{domainValue}</span>}
                    </div>
                    <button onClick={() => setStep('pitch')} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
                      <Edit2 size={14} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                      Public cible
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {AUDIENCES.map(a => (
                        <button key={a.value} onClick={() => setAudience(a.value)}
                          className="text-left border px-4 py-3 text-sm font-medium transition-all"
                          style={{
                            borderColor: audience === a.value ? PINK : '#e5e7eb',
                            background: audience === a.value ? `${PINK}08` : 'white',
                            color: audience === a.value ? PINK : DARK,
                          }}>
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                      Niveau de difficulté
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {DIFFICULTIES.map(d => (
                        <button key={d.value} onClick={() => setDifficulty(d.value)}
                          className="text-center border px-3 py-4 transition-all"
                          style={{
                            borderColor: difficulty === d.value ? BLUE : '#e5e7eb',
                            background: difficulty === d.value ? `${BLUE}0a` : 'white',
                          }}>
                          <div className="text-sm font-bold mb-0.5" style={{ color: difficulty === d.value ? BLUE : DARK }}>{d.label}</div>
                          <div className="text-xs text-gray-500">{d.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
                      Durée souhaitée
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {DURATIONS.map(d => (
                        <button key={d.value} onClick={() => setDuration(d.value)}
                          className="text-center border px-3 py-4 transition-all"
                          style={{
                            borderColor: duration === d.value ? PINK : '#e5e7eb',
                            background: duration === d.value ? `${PINK}08` : 'white',
                          }}>
                          <div className="text-sm font-bold" style={{ color: duration === d.value ? PINK : DARK }}>{d.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{d.sub}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={goToPlan}
                    className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity"
                    style={{ background: PINK }}
                  >
                    <Sparkles size={18} /> Voir le plan du module
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'plan' && (
            <motion.div key="plan" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="min-h-screen flex flex-col justify-center px-6 lg:px-16 py-16">
              <div className="max-w-2xl">
                <div className="text-xs font-bold uppercase tracking-widest mb-5 px-3 py-1 inline-block"
                  style={{ background: `${PINK}12`, color: PINK }}>
                  Étape 3 · Validation du plan
                </div>

                {planLoading ? (
                  <div className="flex flex-col items-start gap-6">
                    <h1 className="text-4xl font-black tracking-tight" style={{ color: DARK }}>
                      L'IA construit<br /><span style={{ color: PINK }}>votre plan…</span>
                    </h1>
                    <div className="w-16 h-1" style={{ background: PINK }} />
                    <div className="flex items-center gap-3 text-gray-500">
                      <Loader2 size={20} className="animate-spin" style={{ color: PINK }} />
                      <span className="text-sm">Analyse du besoin et structuration en cours…</span>
                    </div>
                  </div>
                ) : planPreview ? (
                  <>
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-2 leading-tight" style={{ color: DARK }}>
                      {planPreview.title}
                    </h1>
                    <p className="text-base text-gray-500 mb-2">{planPreview.subtitle}</p>
                    <div className="w-16 h-1 mb-8" style={{ background: PINK }} />

                    <div className="space-y-2 mb-8">
                      {planPreview.plan.map((item, i) => {
                        const typeInfo = SLIDE_TYPE_LABELS[item.type] || { label: item.type, color: DARK };
                        return (
                          <div key={i} className="flex items-center gap-3 border border-gray-100 px-4 py-3 bg-white">
                            <span className="text-xs font-bold w-5 text-gray-400 flex-shrink-0">{item.index}</span>
                            <span className="text-xs font-bold px-2 py-0.5 flex-shrink-0"
                              style={{ background: `${typeInfo.color}15`, color: typeInfo.color }}>
                              {typeInfo.label}
                            </span>
                            <span className="text-sm text-gray-700 truncate">{item.titre}</span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-l-2 pl-4 py-1 mb-8" style={{ borderColor: '#e5e7eb' }}>
                      <p className="text-sm text-gray-500">
                        Ce plan vous convient ? Lancez la génération complète, ou modifiez vos paramètres pour l'affiner.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={generate}
                        className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity"
                        style={{ background: PINK }}
                      >
                        <Sparkles size={18} /> Générer le micro learning
                      </button>
                      <button
                        onClick={goToPlan}
                        className="inline-flex items-center gap-2 px-5 py-4 border border-gray-300 text-sm font-medium text-gray-600 hover:border-gray-400 transition-colors"
                      >
                        <RefreshCw size={15} /> Regénérer le plan
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
    </div>
  );
}
