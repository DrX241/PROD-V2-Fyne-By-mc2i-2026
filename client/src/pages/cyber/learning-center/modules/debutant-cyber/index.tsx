import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Shield, AlertTriangle, CheckCircle,
  XCircle, Trophy, RefreshCw, Mail, Phone, ExternalLink,
  MessageSquare, Monitor, Share2, Loader2, ChevronRight, Flag,
  Star, Target, Zap, Reply, Forward, Archive, Trash2,
  MoreHorizontal, ThumbsUp, MessageCircle, Info, X, Search,
  ChevronDown, Lock, Paperclip, Send, Mic, Camera, CornerDownRight,
  Globe, AlertOctagon, Code, Eye, EyeOff, Volume2, VolumeX,
  PhoneOff, PhoneIncoming, Heart, Bookmark, MoreVertical
} from 'lucide-react';
import mcLogoPath from "@assets/mc2i.png";

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

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

type Phase = 'intro' | 'assessment' | 'level-reveal' | 'loading' | 'error' | 'scenario' | 'trap-clicked' | 'answered' | 'reflexe' | 'final';

// ─── QUESTIONS ────────────────────────────────────────────────────────────────
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
    question: 'Un inconnu vous appelle, se présente comme du "support informatique" et demande votre mot de passe.',
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

function computeLevel(answers: number[]): Level {
  const total = answers.reduce((a, b) => a + b, 0);
  if (total <= 3) return 'debutant';
  if (total <= 7) return 'intermediaire';
  return 'expert';
}

const LEVEL_META: Record<Level, { label: string; desc: string; color: string; bg: string; icon: React.ReactNode }> = {
  debutant: { label: 'Débutant', desc: 'Vous avez les bases. Les scénarios vont vous apprendre les arnaques les plus courantes.', color: '#16a34a', bg: '#f0fdf4', icon: <Shield size={24} /> },
  intermediaire: { label: 'Intermédiaire', desc: 'Vous avez quelques réflexes. Les scénarios vont tester votre vigilance face à des attaques plus subtiles.', color: '#d97706', bg: '#fffbeb', icon: <Target size={24} /> },
  expert: { label: 'Expert', desc: 'Vous maîtrisez les bases. Les scénarios vont confronter vos connaissances aux attaques les plus sophistiquées.', color: BLUE, bg: '#eff6ff', icon: <Zap size={24} /> },
};

function getBadge(score: number) {
  const pct = (score / MAX_SCORE) * 100;
  if (pct >= 70) return { label: 'Sécurisé', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' };
  if (pct >= 40) return { label: 'Prudent', color: '#d97706', bg: '#fffbeb', border: '#fde68a' };
  return { label: 'Vulnérable', color: '#dc2626', bg: '#fef2f2', border: '#fecaca' };
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACE EMAIL RÉALISTE (style Gmail)
// ─────────────────────────────────────────────────────────────────────────────
function EmailVisual({ visual, onLinkClick }: { visual: ScenarioVisual; onLinkClick: () => void }) {
  const [showHeaders, setShowHeaders] = useState(false);
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [starred, setStarred] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const initials = (visual.from || 'X').charAt(0).toUpperCase();
  const avatarColor = visual.fromEmail?.includes('.com') && !visual.fromEmail?.includes(visual.from?.split(' ')[0]?.toLowerCase() || '') ? '#dc2626' : '#6b7280';

  return (
    <div className="flex flex-col h-full bg-white" style={{ fontFamily: 'Google Sans, Arial, sans-serif' }}>
      {/* Barre Gmail */}
      <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ background: '#f6f8fc' }}>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Mail size={13} />
          <span className="font-medium text-gray-700">Boîte de réception</span>
        </div>
        <div className="flex-1" />
        <Search size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
        <MoreHorizontal size={14} className="text-gray-400 cursor-pointer hover:text-gray-600" />
      </div>

      {/* Sujet */}
      <div className="px-6 pt-5 pb-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-xl font-normal text-gray-900 flex-1">{visual.subject || '(sans objet)'}</h2>
          <button onClick={() => setStarred(!starred)} className="mt-1 flex-shrink-0">
            <Star size={18} fill={starred ? '#f59e0b' : 'none'} className={starred ? 'text-yellow-500' : 'text-gray-400'} />
          </button>
        </div>
      </div>

      {/* Info expéditeur */}
      <div className="px-6 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: avatarColor }}>{initials}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900 text-sm">{visual.from || 'Expéditeur inconnu'}</span>
              <button onClick={() => setShowHeaders(!showHeaders)}
                className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-0.5 transition-colors">
                <span className="font-mono text-xs">&lt;{visual.fromEmail}&gt;</span>
                <ChevronDown size={11} className={`transition-transform ${showHeaders ? 'rotate-180' : ''}`} />
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              À : <span className="text-gray-700">moi</span>
              <span className="ml-2 text-gray-400">Aujourd'hui, {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Reply size={16} className="text-gray-400 hover:text-gray-700 cursor-pointer transition-colors" title="Répondre" />
            <MoreHorizontal size={16} className="text-gray-400 hover:text-gray-700 cursor-pointer transition-colors" onClick={() => setShowMenu(!showMenu)} />
          </div>
        </div>

        {/* Headers expandables */}
        <AnimatePresence>
          {showHeaders && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mt-3">
              <div className="bg-gray-50 border border-gray-200 p-3 text-xs font-mono">
                <div className="text-gray-500 mb-2 uppercase tracking-wider text-xs font-sans">En-têtes de l'email</div>
                <div className="space-y-1">
                  <div><span className="text-gray-500">From: </span><span className="text-gray-800">{visual.from} &lt;{visual.fromEmail}&gt;</span></div>
                  <div><span className="text-gray-500">Reply-To: </span>
                    <span className="text-red-600 font-bold">{visual.fromEmail}</span>
                    {visual.fromEmail && !visual.fromEmail?.includes('bnpparibas.fr') && !visual.fromEmail?.includes('credit-agricole.fr') && !visual.fromEmail?.includes('edf.fr') &&
                      <span className="ml-2 text-red-500 font-sans normal-case font-bold">⚠ Domaine suspect !</span>}
                  </div>
                  <div><span className="text-gray-500">Received: </span><span className="text-gray-700">from mail.{visual.fromEmail?.split('@')[1]} (unknown)</span></div>
                  <div><span className="text-gray-500">Authentication: </span><span className="text-red-600">DKIM=fail SPF=fail</span></div>
                  <div><span className="text-gray-500">X-Spam-Score: </span><span className="text-red-600">8.4 (HIGH)</span></div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200 text-red-600 font-sans normal-case">
                  ⚠️ DKIM et SPF échouent — cet email n'est PAS envoyé par le vrai domaine
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Corps du message */}
      <div className="flex-1 px-6 pb-4 overflow-y-auto">
        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{visual.body}</div>

        {/* Lien cliquable */}
        {visual.hasClickableLink && visual.linkLabel && (
          <div className="mt-6">
            <button
              onClick={onLinkClick}
              onMouseEnter={() => setHoveredUrl(visual.linkUrl || '')}
              onMouseLeave={() => setHoveredUrl(null)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-85"
              style={{ background: BLUE }}>
              <ExternalLink size={13} />{visual.linkLabel}
            </button>
            {visual.linkUrl && (
              <div className="mt-2 text-xs text-gray-400 font-mono break-all hover:text-gray-600 cursor-pointer"
                onMouseEnter={() => setHoveredUrl(visual.linkUrl || '')}
                onMouseLeave={() => setHoveredUrl(null)}>
                {visual.linkUrl}
              </div>
            )}
          </div>
        )}

        {/* Zone de réponse */}
        <AnimatePresence>
          {showReply && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className="mt-6 border border-gray-300 overflow-hidden">
              <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 text-xs text-gray-500">
                Répondre à <span className="font-medium">{visual.fromEmail}</span>
              </div>
              <textarea className="w-full px-3 py-3 text-sm text-gray-800 resize-none outline-none" rows={4}
                placeholder="Rédiger votre réponse..." value={replyText} onChange={e => setReplyText(e.target.value)} />
              <div className="px-3 py-2 flex items-center gap-2 border-t border-gray-200 bg-gray-50">
                <button className="px-4 py-1.5 text-white text-xs font-medium flex items-center gap-1" style={{ background: BLUE }}>
                  <Send size={11} />Envoyer
                </button>
                <span className="text-xs text-orange-500">⚠ Attention à qui vous répondez</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center gap-3">
        <button onClick={() => setShowReply(!showReply)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">
          <Reply size={12} />Répondre
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-600 border border-gray-300 hover:bg-gray-50 transition-colors">
          <Forward size={12} />Transférer
        </button>
        <div className="flex-1" />
        <button onClick={() => setShowHeaders(true)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
          <Info size={11} />Inspecter
        </button>
        <button className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors">
          <AlertOctagon size={11} />Signaler
        </button>
      </div>

      {/* Status bar URL */}
      <AnimatePresence>
        {hoveredUrl && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="px-3 py-1.5 border-t border-gray-200 flex items-center gap-2" style={{ background: '#f0f0f0' }}>
            <Globe size={10} className="text-gray-500 flex-shrink-0" />
            <span className="text-xs font-mono text-gray-600 truncate">{hoveredUrl}</span>
            {hoveredUrl && !hoveredUrl.includes('.gouv.fr') && !hoveredUrl.startsWith('https://www.') && (
              <span className="text-xs text-red-600 font-bold ml-auto flex-shrink-0">⚠ Suspect</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACE SMS RÉALISTE (style iPhone)
// ─────────────────────────────────────────────────────────────────────────────
function SmsVisual({ visual, onLinkClick }: { visual: ScenarioVisual; onLinkClick: () => void }) {
  const [replyText, setReplyText] = useState('');
  const [showSendWarn, setShowSendWarn] = useState(false);
  const [longPressMenu, setLongPressMenu] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  const handleSend = () => {
    if (replyText.trim()) setShowSendWarn(true);
  };

  return (
    <div className="w-full max-w-sm mx-auto select-none" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* En-tête iPhone */}
      <div style={{ background: '#f2f2f7' }} className="overflow-hidden">
        <div className="px-4 pt-3 pb-2 flex items-center gap-3 border-b border-gray-200">
          <button className="text-blue-500 text-sm flex items-center gap-1">
            <ArrowLeft size={16} />Messages
          </button>
          <div className="flex-1 text-center">
            <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white text-sm font-bold"
              style={{ background: '#8e8e93' }}>
              {(visual.from || '?').charAt(0)}
            </div>
            <div className="text-xs font-semibold text-gray-900 mt-0.5">{visual.from || 'Inconnu'}</div>
            <button className="text-xs text-blue-500">Infos</button>
          </div>
          <div className="w-16" />
        </div>

        {/* Zone de messages */}
        <div className="px-4 py-4 min-h-48 bg-white space-y-3">
          <div className="text-center text-xs text-gray-400">Aujourd'hui {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
          
          {/* Bulle message reçu */}
          <div className="flex justify-start">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-xs"
              onContextMenu={(e) => { e.preventDefault(); setLongPressMenu(!longPressMenu); }}>
              <div className="px-3.5 py-2.5 text-sm leading-relaxed" style={{ background: '#e5e5ea', borderRadius: '18px 18px 18px 4px' }}>
                <div className="text-gray-900 whitespace-pre-line">{visual.body.split('\n').slice(0, -1).join('\n') || visual.body}</div>
                {visual.hasClickableLink && visual.linkUrl && (
                  <button
                    onClick={() => { setTapCount(t => t + 1); onLinkClick(); }}
                    className="mt-2 block w-full text-left border border-gray-300 bg-white p-2 text-xs"
                    style={{ borderRadius: 8 }}>
                    <div className="flex items-center gap-1.5">
                      <Globe size={12} className="text-blue-500 flex-shrink-0" />
                      <div>
                        <div className="font-medium text-blue-600 truncate">{visual.linkUrl.replace('https://', '').split('/')[0]}</div>
                        <div className="text-gray-400 text-xs truncate">{visual.linkUrl}</div>
                      </div>
                    </div>
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-0.5 px-1">Lu</div>
            </motion.div>
          </div>

          {/* Long press menu */}
          <AnimatePresence>
            {longPressMenu && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-100 border border-gray-200 p-2 flex gap-4 text-xs text-gray-600 justify-center">
                {['Copier', 'Plus', 'Supprimer', 'Signaler'].map(a => (
                  <button key={a} className="px-2 py-1 hover:bg-gray-200 transition-colors">{a}</button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Zone de saisie */}
        <div className="px-3 py-2 border-t border-gray-200 flex items-end gap-2" style={{ background: '#f2f2f7' }}>
          <Camera size={24} className="text-gray-400 mb-1.5 flex-shrink-0" />
          <div className="flex-1 flex items-end gap-2 bg-white border border-gray-300 px-3 py-1.5" style={{ borderRadius: 20 }}>
            <input
              className="flex-1 text-sm outline-none bg-transparent"
              placeholder="Message iMessage"
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
            />
            <Mic size={16} className="text-gray-400 flex-shrink-0" />
          </div>
          {replyText ? (
            <button onClick={handleSend} className="w-8 h-8 flex items-center justify-center rounded-full flex-shrink-0"
              style={{ background: BLUE }}>
              <ArrowRight size={14} className="text-white" />
            </button>
          ) : (
            <button className="w-8 h-8 flex items-center justify-center flex-shrink-0">
              <Mic size={18} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Warning envoi */}
      <AnimatePresence>
        {showSendWarn && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-3 border-l-4 border-orange-400 bg-orange-50 p-3">
            <div className="text-xs font-bold text-orange-800 mb-1">⚠️ Vous allez répondre à ce numéro</div>
            <div className="text-xs text-orange-700">Répondre confirme aux fraudeurs que votre numéro est actif. Êtes-vous sûr ?</div>
            <div className="flex gap-2 mt-2">
              <button onClick={() => setShowSendWarn(false)} className="text-xs px-3 py-1 bg-orange-600 text-white">Annuler</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACE APPEL TÉLÉPHONIQUE RÉALISTE (style iPhone)
// ─────────────────────────────────────────────────────────────────────────────
function PhoneCallVisual({ visual, onTrapAnswer }: { visual: ScenarioVisual; onTrapAnswer?: () => void }) {
  const [callPhase, setCallPhase] = useState<'ringing' | 'active' | 'declined'>('ringing');
  const [callTime, setCallTime] = useState(0);
  const [transcriptIndex, setTranscriptIndex] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  const sentences = visual.body.split('. ').filter(s => s.trim());

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callPhase === 'active') {
      interval = setInterval(() => setCallTime(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callPhase]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (callPhase === 'active' && transcriptIndex < sentences.length) {
      timeout = setTimeout(() => setTranscriptIndex(i => i + 1), 1800);
    }
    return () => clearTimeout(timeout);
  }, [callPhase, transcriptIndex, sentences.length]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (callPhase === 'ringing') {
    return (
      <div className="w-full max-w-xs mx-auto" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
        <div className="overflow-hidden" style={{ background: 'linear-gradient(180deg, #1c1c2e 0%, #2d2d44 100%)', minHeight: 480 }}>
          <div className="px-6 pt-12 pb-6 flex flex-col items-center">
            <div className="text-white text-sm mb-2 opacity-70">Appel entrant</div>
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)' }}>
              <Phone size={36} className="text-white" />
            </div>
            <div className="text-white text-2xl font-light mb-1">{visual.from || 'Numéro inconnu'}</div>
            <div className="text-gray-400 text-sm">Portable · France</div>
            <div className="mt-2 text-xs text-orange-300">⚠ Numéro non enregistré</div>
          </div>

          {/* Options */}
          <div className="px-8 py-4 grid grid-cols-3 gap-6 text-center">
            {[
              { icon: <VolumeX size={20} />, label: 'Sourdine' },
              { icon: <Code size={20} />, label: 'Clavier' },
              { icon: <Volume2 size={20} />, label: 'Haut-parleur' },
            ].map((btn, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <span className="text-white">{btn.icon}</span>
                </div>
                <span className="text-white text-xs opacity-70">{btn.label}</span>
              </div>
            ))}
          </div>

          {/* Boutons répondre/raccrocher */}
          <div className="px-8 py-8 flex justify-between items-center">
            <div className="flex flex-col items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setCallPhase('declined')}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#ff3b30' }}>
                <PhoneOff size={26} className="text-white" />
              </motion.button>
              <span className="text-white text-xs opacity-70">Refuser</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
                onClick={() => setCallPhase('active')}
                className="w-16 h-16 rounded-full flex items-center justify-center"
                style={{ background: '#34c759' }}>
                <Phone size={26} className="text-white" />
              </motion.button>
              <span className="text-white text-xs opacity-70">Accepter</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (callPhase === 'declined') {
    return (
      <div className="w-full max-w-xs mx-auto">
        <div className="p-8 text-center" style={{ background: 'linear-gradient(180deg, #1c1c2e 0%, #2d2d44 100%)' }}>
          <PhoneOff size={40} className="text-red-400 mx-auto mb-4" />
          <div className="text-white font-medium mb-2">Appel refusé</div>
          <div className="text-gray-400 text-sm mb-6">Vous avez raccroché. Bonne décision ?</div>
          <button onClick={() => setCallPhase('ringing')} className="text-blue-400 text-sm">Réécouter l'appel</button>
        </div>
      </div>
    );
  }

  // Appel actif — transcript
  return (
    <div className="w-full max-w-xs mx-auto" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      <div className="overflow-hidden" style={{ background: 'linear-gradient(180deg, #1c1c2e 0%, #2d2d44 100%)', minHeight: 480 }}>
        <div className="px-6 pt-8 pb-4 text-center">
          <div className="text-green-400 text-sm mb-1 font-medium">{formatTime(callTime)}</div>
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ background: 'rgba(255,255,255,0.15)' }}>
            <Phone size={26} className="text-white" />
          </div>
          <div className="text-white text-xl font-light">{visual.from}</div>
          <div className="text-gray-400 text-xs mt-1">En communication</div>
        </div>

        {/* Transcript en temps réel */}
        <div className="mx-4 mb-4 bg-black bg-opacity-30 p-4 overflow-y-auto" style={{ minHeight: 160, maxHeight: 200 }}>
          <div className="text-green-400 text-xs font-bold uppercase tracking-wider mb-2">Transcription en direct</div>
          {sentences.slice(0, transcriptIndex).map((s, i) => (
            <motion.p key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              className="text-gray-200 text-xs mb-1.5 leading-relaxed">
              {s}.
            </motion.p>
          ))}
          {transcriptIndex < sentences.length && (
            <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}
              className="flex gap-1 mt-2">
              {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-400" />)}
            </motion.div>
          )}
        </div>

        {/* Contrôles */}
        <div className="px-8 py-4 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: muted ? <Mic size={18} /> : <VolumeX size={18} />, label: muted ? 'Activer' : 'Sourdine', active: muted, action: () => setMuted(!muted) },
            { icon: <Code size={18} />, label: 'Clavier', active: false, action: () => {} },
            { icon: <Volume2 size={18} />, label: 'HP', active: speaker, action: () => setSpeaker(!speaker) },
          ].map((btn, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <button onClick={btn.action}
                className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                style={{ background: btn.active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)', color: btn.active ? '#1c1c2e' : 'white' }}>
                {btn.icon}
              </button>
              <span className="text-white text-xs opacity-70">{btn.label}</span>
            </div>
          ))}
        </div>

        {/* Raccrocher */}
        <div className="flex justify-center py-6">
          <div className="flex flex-col items-center gap-2">
            <motion.button whileTap={{ scale: 0.9 }} onClick={() => setCallPhase('declined')}
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: '#ff3b30' }}>
              <PhoneOff size={26} className="text-white" />
            </motion.button>
            <span className="text-white text-xs opacity-70">Raccrocher</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACE NAVIGATEUR RÉALISTE (avec inspection, URL suspecte)
// ─────────────────────────────────────────────────────────────────────────────
function BrowserPopupVisual({ visual, onLinkClick }: { visual: ScenarioVisual; onLinkClick: () => void }) {
  const [showInspect, setShowInspect] = useState(false);
  const [closeAttempts, setCloseAttempts] = useState(0);
  const [hoveredUrl, setHoveredUrl] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);
  const [urlInput, setUrlInput] = useState(visual.linkUrl || 'https://...');

  const isSuspicious = !urlInput.includes('.gouv.fr') && !urlInput.startsWith('https://www.google') && urlInput.length > 10;

  const handleClose = () => {
    setCloseAttempts(c => c + 1);
  };

  return (
    <div className="w-full overflow-hidden border border-gray-300 shadow-lg" style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Chrome browser bar */}
      <div className="bg-gray-100 border-b border-gray-300">
        {/* Tabs */}
        <div className="flex items-end px-2 pt-1">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white border border-gray-300 border-b-white text-xs text-gray-700 font-medium max-w-48 truncate -mb-px">
            <Globe size={11} className="text-blue-500 flex-shrink-0" />
            <span className="truncate">{visual.subject || 'Page web'}</span>
            <button onClick={handleClose} className="ml-auto flex-shrink-0 hover:text-gray-900">
              {closeAttempts > 0 ? (
                <motion.span animate={{ x: closeAttempts % 2 === 0 ? 0 : 5 }}>×</motion.span>
              ) : '×'}
            </button>
          </div>
          {closeAttempts > 0 && (
            <div className="ml-2 text-xs text-red-500 mb-1">⚠ La page empêche la fermeture</div>
          )}
        </div>

        {/* Barre d'adresse */}
        <div className="px-3 py-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <button className="text-gray-400 hover:text-gray-700"><ArrowLeft size={14} /></button>
            <button className="text-gray-400 hover:text-gray-700"><ArrowRight size={14} /></button>
            <button className="text-gray-400 hover:text-gray-700"><RefreshCw size={13} /></button>
          </div>
          <div className={`flex-1 flex items-center gap-2 px-3 py-1.5 border text-xs font-mono ${isSuspicious ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'}`}>
            {isSuspicious ? (
              <AlertTriangle size={12} className="text-red-500 flex-shrink-0" />
            ) : (
              <Lock size={12} className="text-green-600 flex-shrink-0" />
            )}
            <input
              className="flex-1 outline-none bg-transparent text-gray-800"
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
            />
            {isSuspicious && <span className="text-red-500 text-xs font-bold flex-shrink-0">⚠</span>}
          </div>
          <div className="flex gap-2 items-center">
            <button onClick={() => setShowInspect(!showInspect)} title="Inspecter"
              className="text-gray-400 hover:text-gray-700 transition-colors">
              <Code size={14} />
            </button>
            <button className="text-gray-400 hover:text-gray-700"><MoreVertical size={14} /></button>
          </div>
        </div>

        {/* Alerte sécurité si suspect */}
        {isSuspicious && (
          <div className="mx-3 mb-2 px-3 py-2 bg-red-50 border border-red-300 flex items-start gap-2">
            <AlertTriangle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-red-700">
              <strong>Ce site pourrait être dangereux.</strong> Le domaine ne correspond pas à une organisation connue.
            </div>
          </div>
        )}
      </div>

      {/* Contenu de la page */}
      <div className="bg-white p-6 min-h-48">
        {visual.subject && <h3 className="text-lg font-bold text-gray-900 mb-3">{visual.subject}</h3>}
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-5">{visual.body}</div>
        {visual.hasClickableLink && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onLinkClick}
            onMouseEnter={() => setHoveredUrl(visual.linkUrl || '')}
            onMouseLeave={() => setHoveredUrl(null)}
            className="px-6 py-2.5 text-white text-sm font-bold"
            style={{ background: PINK }}>
            {visual.linkLabel || 'Continuer'}
          </motion.button>
        )}
      </div>

      {/* Panneau d'inspection */}
      <AnimatePresence>
        {showInspect && (
          <motion.div initial={{ height: 0 }} animate={{ height: 200 }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-gray-300 bg-gray-900 text-green-400 font-mono text-xs p-3 overflow-y-auto">
            <div className="text-gray-500 mb-2">&lt;!-- Outils développeur — Réseau --&gt;</div>
            <div className="text-yellow-400">GET {urlInput} → 200 OK</div>
            <div className="text-gray-400 mt-1">Host: {urlInput.replace('https://', '').split('/')[0]}</div>
            <div className="text-red-400 mt-1">⚠ Certificate: Self-signed / Not trusted</div>
            <div className="text-red-400">⚠ HSTS: Not present</div>
            <div className="text-gray-400 mt-2">Set-Cookie: session_id=... (httpOnly=false) ← Suspect</div>
            <div className="text-red-400 mt-1">⚠ Scripts: trackInput(), keylogger.js detecté</div>
            <div className="text-gray-500 mt-2">— Cette page collecte vos frappes clavier —</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Status bar */}
      <div className="bg-gray-100 border-t border-gray-200 px-3 py-1 flex items-center justify-between">
        <div className="text-xs text-gray-500 flex items-center gap-1">
          {hoveredUrl ? (
            <><Globe size={10} /><span className="font-mono truncate max-w-xs">{hoveredUrl}</span></>
          ) : (
            <span>Prêt</span>
          )}
        </div>
        <button onClick={() => setShowSource(!showSource)} className="text-xs text-gray-400 hover:text-gray-700">
          {showSource ? 'Masquer source' : 'Voir source'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERFACE RÉSEAU SOCIAL RÉALISTE
// ─────────────────────────────────────────────────────────────────────────────
function SocialPostVisual({ visual, onLinkClick }: { visual: ScenarioVisual; onLinkClick: () => void }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(Math.floor(Math.random() * 2000) + 847);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [shared, setShared] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments] = useState([
    { user: 'Marie L.', text: 'Trop bien ! Je participe 🎉', time: '2 min', avatar: 'M' },
    { user: 'Pierre D.', text: 'Pareil, j\'ai cliqué, c\'est trop facile !', time: '5 min', avatar: 'P' },
    { user: 'Sophie M.', text: 'Attention, ça ressemble à une arnaque... 🤔', time: '8 min', avatar: 'S' },
  ]);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount(c => liked ? c - 1 : c + 1);
  };

  const handleShare = () => {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="w-full bg-white border border-gray-200 shadow-sm" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
      {/* En-tête post */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #4267B2, #898F9C)' }}>
          {(visual.from || 'P').charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{visual.from || 'Page'}</span>
            {visual.from?.includes('✓') || visual.from?.includes('Officiel') ? (
              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle size={10} className="text-white" />
              </div>
            ) : null}
          </div>
          <div className="text-xs text-gray-400 flex items-center gap-1">
            <span>il y a 42 minutes</span>
            <span>·</span>
            <Globe size={10} />
            <span>Public</span>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-700"><MoreHorizontal size={16} /></button>
      </div>

      {/* Contenu */}
      <div className="px-4 pb-3">
        <div className="text-sm text-gray-900 leading-relaxed whitespace-pre-line">{visual.body}</div>
        {visual.hasClickableLink && visual.linkLabel && (
          <button onClick={onLinkClick}
            className="mt-3 block w-full border border-gray-200 p-3 text-left hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 bg-gray-200 flex-shrink-0 flex items-center justify-center">
                <Globe size={20} className="text-gray-400" />
              </div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">{visual.linkUrl?.replace('https://', '').split('/')[0]}</div>
                <div className="text-sm font-medium text-gray-900">{visual.linkLabel}</div>
                <div className="text-xs text-gray-500 truncate">{visual.linkUrl}</div>
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Compteurs */}
      <div className="px-4 py-2 border-t border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <div className="flex -space-x-1">
            {['👍', '❤️', '😮'].map((e, i) => <span key={i} className="text-xs">{e}</span>)}
          </div>
          <span className="hover:underline cursor-pointer ml-1">{likeCount.toLocaleString()}</span>
        </div>
        <div className="flex gap-3">
          <span className="hover:underline cursor-pointer" onClick={() => setShowComments(!showComments)}>
            {comments.length + (commentText ? 1 : 0)} commentaires
          </span>
          <span className="hover:underline cursor-pointer">{shared ? '1 partage ✓' : '0 partage'}</span>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="px-2 py-1 flex justify-around border-b border-gray-100">
        {[
          { icon: <ThumbsUp size={16} fill={liked ? BLUE : 'none'} />, label: 'J\'aime', action: handleLike, active: liked },
          { icon: <MessageCircle size={16} />, label: 'Commenter', action: () => setShowComments(!showComments), active: showComments },
          { icon: <Share2 size={16} />, label: shared ? 'Partagé ✓' : 'Partager', action: handleShare, active: shared },
          { icon: <Bookmark size={16} fill={bookmarked ? BLUE : 'none'} />, label: 'Enregistrer', action: () => setBookmarked(!bookmarked), active: bookmarked },
        ].map((btn, i) => (
          <button key={i} onClick={btn.action}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold hover:bg-gray-100 transition-colors"
            style={{ color: btn.active ? BLUE : '#65676b' }}>
            {btn.icon}{btn.label}
          </button>
        ))}
      </div>

      {/* Commentaires */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden">
            <div className="px-4 py-3 space-y-3">
              {comments.map((c, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ background: ['#4267B2', '#898F9C', '#16a34a'][i] }}>
                    {c.avatar}
                  </div>
                  <div>
                    <div className="bg-gray-100 px-3 py-1.5 inline-block">
                      <span className="font-semibold text-xs text-gray-900 mr-1">{c.user}</span>
                      <span className="text-xs text-gray-700">{c.text}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 px-1">
                      {c.time} · <button className="hover:underline">J'aime</button> · <button className="hover:underline">Répondre</button>
                    </div>
                  </div>
                </div>
              ))}
              {/* Saisir un commentaire */}
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: BLUE }}>V</div>
                <div className="flex-1 flex gap-2">
                  <input className="flex-1 bg-gray-100 px-3 py-1.5 text-xs outline-none text-gray-800"
                    placeholder="Écrire un commentaire..." value={commentText} onChange={e => setCommentText(e.target.value)}
                    style={{ borderRadius: 20 }} />
                  {commentText && (
                    <button className="text-blue-500"><Send size={14} /></button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function MonsieurToutLeMonde() {
  const [, setLocation] = useLocation();

  const [assessmentIndex, setAssessmentIndex] = useState(0);
  const [assessmentAnswers, setAssessmentAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [level, setLevel] = useState<Level>('debutant');
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scenarios, setScenarios] = useState<(Scenario | null)[]>(Array(TOTAL_SCENARIOS).fill(null));
  const [loadingNext, setLoadingNext] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<ScenarioChoice | null>(null);
  const [showRedFlags, setShowRedFlags] = useState(false);

  const currentScenario = scenarios[currentIndex];
  const progress = (phase === 'assessment' || phase === 'level-reveal') ? 0 : ((currentIndex) / TOTAL_SCENARIOS) * 100;
  const levelMeta = LEVEL_META[level];

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

  const handleLinkClick = () => {
    if (!currentScenario) return;
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
    setShowRedFlags(false);
  };

  const badge = getBadge(score);

  const renderVisual = (s: Scenario) => {
    const t = s.visual?.type;
    if (t === 'sms') return <SmsVisual visual={s.visual} onLinkClick={handleLinkClick} />;
    if (t === 'phone-call') return <PhoneCallVisual visual={s.visual} />;
    if (t === 'browser-popup') return <BrowserPopupVisual visual={s.visual} onLinkClick={handleLinkClick} />;
    if (t === 'social-post') return <SocialPostVisual visual={s.visual} onLinkClick={handleLinkClick} />;
    return <EmailVisual visual={s.visual} onLinkClick={handleLinkClick} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ color: DARK }}>
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
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

          {/* ═══ INTRO ═══════════════════════════════════════════════════════ */}
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
                    5 questions pour détecter votre niveau, puis 10 scénarios <strong>100% interactifs</strong> : cliquez sur les liens, répondez aux SMS, décrochez le téléphone, inspectez les emails...
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-10">
                    {[
                      { icon: <Mail size={16} />, label: 'Emails interactifs', sub: 'Inspecter les en-têtes' },
                      { icon: <MessageSquare size={16} />, label: 'SMS réalistes', sub: 'iPhone Messages' },
                      { icon: <Phone size={16} />, label: 'Appels à décrocher', sub: 'Transcription en direct' },
                      { icon: <Monitor size={16} />, label: 'Navigateur simulé', sub: 'Inspecter les URLs' },
                    ].map((item, i) => (
                      <div key={i} className="border border-gray-100 p-3 bg-gray-50 flex items-start gap-2">
                        <div className="mt-0.5 flex-shrink-0" style={{ color: BLUE }}>{item.icon}</div>
                        <div>
                          <div className="text-xs font-bold text-gray-900">{item.label}</div>
                          <div className="text-xs text-gray-500">{item.sub}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setPhase('assessment')} className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity" style={{ background: BLUE }}>
                    Évaluer mon niveau <ArrowRight size={18} />
                  </button>
                </div>
              </div>
              <div className="hidden lg:flex w-72 border-l border-gray-100 flex-col justify-center px-8 py-16" style={{ background: '#fafafa' }}>
                <div className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Ce que vous pouvez faire</div>
                <div className="space-y-2">
                  {['Survoler un lien pour voir sa vraie URL', 'Inspecter les en-têtes email suspects', 'Décrocher ou refuser un appel', 'Analyser le code source d\'une page', 'Lire la transcription d\'un appel', 'Répondre à un SMS (et voir l\'impact)', 'Inspecter les éléments du navigateur', 'Liker, commenter un post social', 'Voir les signaux d\'alerte en temps réel', 'Tester vos réflexes face aux arnaques'].map((t, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 flex-shrink-0" style={{ background: i % 2 === 0 ? PINK : BLUE }} />
                      <span className="text-xs text-gray-600">{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ ÉVALUATION ══════════════════════════════════════════════════ */}
          {phase === 'assessment' && (
            <motion.div key={`assess-${assessmentIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="min-h-screen flex flex-col">
              <div className="border-b border-gray-100 px-8 py-4 flex items-center gap-4">
                <span className="text-xs text-gray-400 font-medium">Évaluation</span>
                <div className="flex-1 flex items-center gap-1.5">
                  {ASSESSMENT.map((_, i) => (
                    <div key={i} className="h-1.5 flex-1 transition-all duration-300"
                      style={{ background: i < assessmentIndex ? BLUE : i === assessmentIndex ? `${BLUE}50` : '#e5e7eb' }} />
                  ))}
                </div>
                <span className="text-xs font-bold" style={{ color: BLUE }}>{assessmentIndex + 1} / {ASSESSMENT.length}</span>
              </div>
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
                      <motion.button key={i} onClick={() => handleOptionSelect(opt.score, i)} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}
                        className="w-full text-left border px-5 py-4 transition-all flex items-start gap-4"
                        style={{ borderColor: selectedOption === i ? BLUE : '#e5e7eb', background: selectedOption === i ? `${BLUE}08` : 'white' }}>
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
            </motion.div>
          )}

          {/* ═══ NIVEAU RÉVÉLÉ ════════════════════════════════════════════════ */}
          {phase === 'level-reveal' && (
            <motion.div key="level-reveal" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-8">
              <div className="max-w-lg w-full text-center">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: BLUE }}>Évaluation terminée</div>
                  <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6" style={{ background: levelMeta.bg, color: levelMeta.color }}>
                    {levelMeta.icon}
                  </div>
                  <h2 className="text-4xl font-black mb-3" style={{ color: DARK }}>Niveau</h2>
                  <h1 className="text-6xl font-black mb-6" style={{ color: levelMeta.color }}>{levelMeta.label}</h1>
                  <div className="w-16 h-1 mx-auto mb-6" style={{ background: levelMeta.color }} />
                  <p className="text-gray-600 mb-10 leading-relaxed">{levelMeta.desc}</p>
                  <button onClick={() => startScenarios(level)}
                    className="inline-flex items-center gap-2 px-8 py-4 text-white font-bold hover:opacity-90 transition-opacity"
                    style={{ background: levelMeta.color }}>
                    Démarrer les scénarios <ArrowRight size={18} />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ═══ CHARGEMENT ══════════════════════════════════════════════════ */}
          {phase === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center">
              <Loader2 size={32} className="animate-spin mb-4" style={{ color: BLUE }} />
              <p className="text-gray-600 font-medium">Sélection du scénario…</p>
              <p className="text-xs text-gray-400 mt-1">Niveau <span className="font-bold" style={{ color: levelMeta.color }}>{levelMeta.label}</span></p>
            </motion.div>
          )}

          {/* ═══ ERREUR ══════════════════════════════════════════════════════ */}
          {phase === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-8">
              <div className="max-w-md w-full text-center">
                <AlertTriangle size={28} className="mx-auto mb-4" style={{ color: PINK }} />
                <h2 className="text-2xl font-black mb-3">Scénario indisponible</h2>
                <p className="text-gray-600 mb-8">Impossible de charger le scénario.</p>
                <button onClick={() => startScenarios(level)} className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold" style={{ background: BLUE }}>
                  <RefreshCw size={15} /> Réessayer
                </button>
              </div>
            </motion.div>
          )}

          {/* ═══ SCÉNARIO ════════════════════════════════════════════════════ */}
          {phase === 'scenario' && currentScenario && (
            <motion.div key={`sc-${currentIndex}`} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }}
              className="min-h-screen flex flex-col lg:flex-row">

              {/* Colonne visuelle */}
              <div className="flex-1 border-b lg:border-b-0 lg:border-r border-gray-100 flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 text-white" style={{ background: PINK }}>
                      {currentIndex + 1}/{TOTAL_SCENARIOS}
                    </div>
                    <div className="text-xs px-2 py-0.5 font-medium" style={{ background: levelMeta.bg, color: levelMeta.color }}>
                      {levelMeta.label}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      {currentScenario.redFlags && (
                        <button onClick={() => setShowRedFlags(!showRedFlags)}
                          className="text-xs flex items-center gap-1 font-medium hover:opacity-70 transition-opacity"
                          style={{ color: showRedFlags ? PINK : '#9ca3af' }}>
                          <Eye size={11} />{showRedFlags ? 'Masquer indices' : 'Indices 💡'}
                        </button>
                      )}
                    </div>
                  </div>
                  <h2 className="text-lg font-black text-gray-900">{currentScenario.title}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">{currentScenario.context}</p>
                </div>

                {/* Red flags tooltip */}
                <AnimatePresence>
                  {showRedFlags && currentScenario.redFlags && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden border-b border-red-100 bg-red-50 px-6 py-3">
                      <div className="text-xs font-bold text-red-700 uppercase tracking-wider mb-2">Signaux suspects</div>
                      <ul className="space-y-1">
                        {currentScenario.redFlags.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-red-600">
                            <XCircle size={11} className="mt-0.5 flex-shrink-0" />{f}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex-1 overflow-y-auto p-4 lg:p-6">
                  {renderVisual(currentScenario)}
                </div>
              </div>

              {/* Colonne choix */}
              <div className="w-full lg:w-80 flex flex-col bg-gray-50">
                <div className="px-5 py-4 border-b border-gray-200">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Que faites-vous ?</div>
                  <div className="text-xs text-gray-400 mt-1">Interagissez avec la simulation ou choisissez une action</div>
                </div>
                <div className="flex-1 px-5 py-4 flex flex-col gap-3">
                  {currentScenario.choices.map((c, i) => (
                    <motion.button key={i} onClick={() => handleChoice(c)} whileHover={{ x: 3 }} whileTap={{ scale: 0.98 }}
                      className="w-full text-left border border-gray-200 bg-white px-4 py-3.5 text-sm font-medium text-gray-800 hover:border-gray-400 hover:shadow-sm transition-all flex items-start gap-3">
                      <span className="w-6 h-6 flex-shrink-0 flex items-center justify-center text-xs font-bold border border-gray-300 mt-0.5" style={{ color: BLUE }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {c.label}
                    </motion.button>
                  ))}
                </div>
                <div className="px-5 py-3 border-t border-gray-200 bg-white">
                  <div className="text-xs text-gray-400">Score : <span className="font-bold" style={{ color: score >= 0 ? BLUE : PINK }}>{score} pts</span></div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ PIÈGE CLIQUÉ ════════════════════════════════════════════════ */}
          {phase === 'trap-clicked' && currentScenario && (
            <motion.div key="trap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-8">
              <div className="max-w-lg w-full">
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                  <div className="border-l-4 border-red-500 bg-red-50 px-6 py-7 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <XCircle size={26} className="text-red-500 flex-shrink-0" />
                      <div className="text-xl font-black text-red-700">Vous avez cliqué !</div>
                    </div>
                    <div className="text-red-700 text-sm leading-relaxed mb-3">
                      {currentScenario.clickConsequence || 'Ce lien aurait conduit à une page malveillante.'}
                    </div>
                    <div className="text-red-600 text-sm font-bold">−5 points</div>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">C'est en cliquant dans une simulation qu'on apprend vraiment. Voyons le bon réflexe.</p>
                  <button onClick={() => setPhase('reflexe')} className="inline-flex items-center gap-2 px-6 py-3 text-white font-bold text-sm" style={{ background: BLUE }}>
                    Voir le réflexe clé <ChevronRight size={15} />
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ═══ RÉPONSE ═════════════════════════════════════════════════════ */}
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

          {/* ═══ RÉFLEXE CLÉ ═════════════════════════════════════════════════ */}
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
                  {currentScenario.redFlags && (
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
              <div className="w-full lg:w-64 border-t lg:border-t-0 lg:border-l border-gray-100 flex flex-col" style={{ background: '#fafafa' }}>
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Score</div>
                  <div className="text-4xl font-black" style={{ color: score >= 0 ? BLUE : PINK }}>{score > 0 ? '+' : ''}{score}</div>
                  <div className="text-xs text-gray-400">/ {MAX_SCORE} pts</div>
                </div>
                <div className="px-6 py-5">
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

          {/* ═══ BILAN FINAL ══════════════════════════════════════════════════ */}
          {phase === 'final' && (
            <motion.div key="final" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col">
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
                  </div>
                </div>
              </div>
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
                          'Activer la double authentification sur tous vos comptes',
                          'Utiliser un gestionnaire de mots de passe',
                          'Ne jamais cliquer sur un lien reçu par email ou SMS',
                          'Vérifier l\'expéditeur avant de répondre à tout message urgent',
                          'Signaler les emails suspects à signal-spam.fr',
                        ].slice(0, 5).map((a, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <ChevronRight size={13} className="mt-0.5 flex-shrink-0" style={{ color: BLUE }} />{a}
                          </li>
                        ))}
                      </ul>
                    </div>
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
                <span className="text-xs text-gray-400">© {new Date().getFullYear()} FYNE by mc2i</span>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
