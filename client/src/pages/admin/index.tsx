import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Trash2, RefreshCw, ToggleLeft, ToggleRight,
  Eye, EyeOff, ChevronLeft, Check, X, Crown,
  Activity, TrendingUp, Database, Clock, FileDown, Zap, Lock, Save, FlaskConical,
  LayoutDashboard, Settings, ChevronRight, AlertCircle, ArrowUpRight,
  ShieldAlert, ShieldCheck, Globe, AlertTriangle, LogIn, LogOut, Ban,
} from 'lucide-react';
import mcLogoPath from '@assets/mc2i.png';

/* ─── TYPES ─── */
interface UserRow {
  id: number; username: string; email: string | null;
  firstName: string | null; lastName: string | null;
  role: string; isActive: boolean; lastLogin: string | null; createdAt: string;
  modulesEnabled?: string[] | null;
}
interface Stats {
  totalUsers: number; activeUsers: number; adminUsers: number;
  recentLogins30d: number; newUsers30d: number;
  learningProgressRecords: number; investigationRecords: number; cacheHitsTotal: number;
  recentUsers: UserRow[]; signupsByMonth: { month: string; count: string }[];
}
interface LlmUserUsage {
  user_id: number; username: string; requests: string;
  total_tokens: string; prompt_tokens: string; completion_tokens: string; last_used: string;
}
interface LlmFeatureUsage { feature: string; requests: string; total_tokens: string; prompt_tokens: string; completion_tokens: string; models_used: string; }
interface LlmModelUsage { model: string; requests: string; total_tokens: string; prompt_tokens: string; completion_tokens: string; unique_users: string; }
type Modal = { type: 'create' } | { type: 'reset'; user: UserRow } | { type: 'delete'; user: UserRow } | { type: 'modules'; user: UserRow } | null;
type Tab = 'dashboard' | 'users' | 'llm' | 'sso' | 'security';

interface SsoConfigData {
  provider: string; clientId: string; clientSecret: string; tenantId: string;
  discoveryUrl: string; callbackUrl: string; isEnabled: boolean;
  allowedDomains: string[]; autoCreateUsers: boolean; defaultRole: string;
}

/* ─── DESIGN TOKENS — Microsoft 365 Admin Center light ─── */
const T = {
  /* surfaces */
  bg:          '#f3f2f1',   /* Fluent neutral bg */
  canvas:      '#ffffff',
  sidebar:     '#ffffff',
  sidebarHov:  '#edebe9',
  sidebarSel:  '#e1dfdd',
  header:      '#ffffff',
  rowHov:      '#faf9f8',
  /* borders */
  border:      '#e1dfdd',
  borderMid:   '#c8c6c4',
  /* brand */
  brand:       '#0f6cbd',   /* Fluent blue */
  brandHov:    '#0d5ea6',
  brandLight:  '#eff6fc',
  brandText:   '#0f6cbd',
  /* status */
  green:       '#107c10',
  greenBg:     '#dff6dd',
  amber:       '#835b00',
  amberBg:     '#fff4ce',
  red:         '#a4262c',
  redBg:       '#fde7e9',
  violet:      '#5c2e91',
  violetBg:    '#f4effe',
  /* text */
  textPrimary: '#201f1e',
  textSecond:  '#605e5c',
  textDisable: '#a19f9d',
  textInvert:  '#ffffff',
};

/* ─── SHARED STYLE HELPERS ─── */
const font = `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif`;

const inputCls: React.CSSProperties = {
  width: '100%', padding: '5px 8px', fontSize: 13, fontFamily: font,
  border: `1px solid ${T.borderMid}`, background: T.canvas, color: T.textPrimary,
  borderRadius: 2, outline: 'none', boxSizing: 'border-box',
};
const selectCls: React.CSSProperties = { ...inputCls, cursor: 'pointer', appearance: 'none' };

const thCls: React.CSSProperties = {
  padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600,
  color: T.textSecond, background: T.bg, borderBottom: `1px solid ${T.border}`,
  fontFamily: font, whiteSpace: 'nowrap', letterSpacing: 0,
};
const tdCls: React.CSSProperties = {
  padding: '8px 12px', fontSize: 13, color: T.textPrimary,
  borderBottom: `1px solid ${T.border}`, fontFamily: font, verticalAlign: 'middle',
};

/* ─── SUB-COMPONENTS ─── */

const Badge: React.FC<{ label: string; color: string; bg: string; icon?: React.ReactNode }> = ({ label, color, bg, icon }) => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 2, fontSize: 11, fontWeight: 600, color, background: bg, fontFamily: font, whiteSpace: 'nowrap' }}>
    {icon}{label}
  </span>
);

const KpiCard: React.FC<{ label: string; value: number | string; sub?: string; icon: React.ReactNode; iconBg: string; iconColor: string; trend?: string }> = ({ label, value, sub, icon, iconBg, iconColor, trend }) => (
  <div style={{ background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 4, padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div style={{ fontSize: 12, color: T.textSecond, fontFamily: font, fontWeight: 400 }}>{label}</div>
      <div style={{ width: 32, height: 32, borderRadius: 4, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: iconColor, flexShrink: 0 }}>
        {icon}
      </div>
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 600, color: T.textPrimary, fontFamily: font, lineHeight: 1 }}>{value}</div>
      {(sub || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
          {trend && <ArrowUpRight size={12} color={T.green} />}
          <span style={{ fontSize: 11, color: trend ? T.green : T.textDisable, fontFamily: font }}>{trend || sub}</span>
        </div>
      )}
    </div>
  </div>
);

const SectionHeader: React.FC<{ title: string; subtitle?: string; icon: React.ReactNode; action?: React.ReactNode }> = ({ title, subtitle, icon, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${T.border}` }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: T.brand }}>{icon}</span>
      <div>
        <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: T.textPrimary, fontFamily: font }}>{title}</h1>
        {subtitle && <div style={{ fontSize: 12, color: T.textSecond, fontFamily: font, marginTop: 2 }}>{subtitle}</div>}
      </div>
    </div>
    {action}
  </div>
);

const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 4, overflow: 'hidden', ...style }}>{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.border}`, fontSize: 12, fontWeight: 600, color: T.textSecond, fontFamily: font, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
    {children}
  </div>
);

const Field: React.FC<{ label: string; required?: boolean; hint?: string; children: React.ReactNode }> = ({ label, required, hint, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.textSecond, marginBottom: 4, fontFamily: font }}>
      {label}
      {required && <span style={{ color: T.red, marginLeft: 2 }}>*</span>}
      {hint && <span style={{ fontWeight: 400, color: T.textDisable, marginLeft: 6 }}>{hint}</span>}
    </label>
    {children}
  </div>
);

const PrimaryBtn: React.FC<{ children: React.ReactNode; onClick?: () => void; disabled?: boolean; type?: 'button' | 'submit' }> = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: disabled ? T.borderMid : T.brand, color: T.textInvert, border: 'none', borderRadius: 2, fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: font, transition: 'background 0.1s' }}
    onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = T.brandHov; }}
    onMouseLeave={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = T.brand; }}
  >{children}</button>
);

const SecondaryBtn: React.FC<{ children: React.ReactNode; onClick?: () => void; disabled?: boolean }> = ({ children, onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled}
    style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: T.canvas, color: disabled ? T.textDisable : T.textPrimary, border: `1px solid ${T.borderMid}`, borderRadius: 2, fontSize: 13, fontWeight: 400, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: font }}
    onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = T.bg; }}
    onMouseLeave={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = T.canvas; }}
  >{children}</button>
);

const IconBtn: React.FC<{ children: React.ReactNode; onClick?: () => void; title?: string; danger?: boolean }> = ({ children, onClick, title, danger }) => (
  <button onClick={onClick} title={title}
    style={{ width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: 'transparent', borderRadius: 2, cursor: 'pointer', color: danger ? T.red : T.textSecond }}
    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = danger ? T.redBg : T.sidebarHov; }}
    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
  >{children}</button>
);

/* ─── MAIN ─── */
const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [llmData, setLlmData] = useState<{ usageByUser: LlmUserUsage[]; usageByFeature: LlmFeatureUsage[]; usageByModel: LlmModelUsage[]; totalTokens30d: number } | null>(null);
  const [llmLoading, setLlmLoading] = useState(false);
  const [secStats, setSecStats] = useState<{ failedLogins24h: number; failedLogins7d: number; successLogins24h: number; topIps: { ip: string; cnt: string }[]; recentFails: { username: string; ip: string; created_at: string; details: any }[] } | null>(null);
  const [secEvents, setSecEvents] = useState<{ id: number; type: string; severity: string; ip: string | null; username: string | null; created_at: string; details: any }[]>([]);
  const [secLoading, setSecLoading] = useState(false);

  const [ssoConfig, setSsoConfig] = useState<SsoConfigData>({
    provider: 'azure', clientId: '', clientSecret: '', tenantId: '', discoveryUrl: '',
    callbackUrl: `${window.location.origin}/auth/sso/callback`,
    isEnabled: false, allowedDomains: [], autoCreateUsers: true, defaultRole: 'user',
  });
  const [ssoLoading, setSsoLoading] = useState(false);
  const [ssoSaving, setSsoSaving] = useState(false);
  const [ssoTesting, setSsoTesting] = useState(false);
  const [ssoTestResult, setSsoTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [allowedDomainsInput, setAllowedDomainsInput] = useState('');
  const [modal, setModal] = useState<Modal>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [form, setForm] = useState({ username: '', password: '', email: '', firstName: '', lastName: '', role: 'user' });
  const [showPwd, setShowPwd] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [showNewPwd, setShowNewPwd] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/';
  };

  const notify = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try { const r = await fetch('/api/admin/users', { credentials: 'include' }); const d = await r.json(); if (d.success) setUsers(d.users); }
    finally { setLoading(false); }
  };
  const fetchStats = async () => {
    setStatsLoading(true);
    try { const r = await fetch('/api/admin/stats', { credentials: 'include' }); const d = await r.json(); if (d.success) setStats(d.stats); }
    finally { setStatsLoading(false); }
  };
  const fetchLlmUsage = async () => {
    setLlmLoading(true);
    try { const r = await fetch('/api/admin/llm-usage', { credentials: 'include' }); const d = await r.json(); if (d.success) setLlmData({ usageByUser: d.usageByUser, usageByFeature: d.usageByFeature, usageByModel: d.usageByModel ?? [], totalTokens30d: d.totalTokens30d }); }
    finally { setLlmLoading(false); }
  };
  const fetchSsoConfig = async () => {
    setSsoLoading(true);
    try { const r = await fetch('/api/admin/sso', { credentials: 'include' }); const d = await r.json(); if (d.success && d.config) { setSsoConfig(c => ({ ...c, ...d.config })); setAllowedDomainsInput((d.config.allowedDomains ?? []).join(', ')); } }
    finally { setSsoLoading(false); }
  };
  const saveSsoConfig = async () => {
    setSsoSaving(true); setSsoTestResult(null);
    try {
      const domains = allowedDomainsInput.split(',').map(d => d.trim()).filter(Boolean);
      const r = await fetch('/api/admin/sso', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ ...ssoConfig, allowedDomains: domains }) });
      const d = await r.json(); notify(d.success ? 'Configuration SSO enregistrée' : (d.message || 'Erreur'), d.success);
    } finally { setSsoSaving(false); }
  };
  const testSsoConfig = async () => {
    setSsoTesting(true); setSsoTestResult(null);
    try { const r = await fetch('/api/admin/sso/test', { method: 'POST', credentials: 'include' }); const d = await r.json(); setSsoTestResult({ ok: d.success, msg: d.message || (d.success ? 'Test réussi' : 'Échec') }); }
    finally { setSsoTesting(false); }
  };
  const handleCreate = async () => {
    const r = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(form) });
    const d = await r.json();
    if (d.success) { notify('Compte créé'); setModal(null); setForm({ username: '', password: '', email: '', firstName: '', lastName: '', role: 'user' }); fetchUsers(); fetchStats(); }
    else notify(d.message || 'Erreur', false);
  };
  const handleToggle = async (u: UserRow) => {
    const r = await fetch(`/api/admin/users/${u.id}/toggle`, { method: 'PATCH', credentials: 'include' }); const d = await r.json();
    if (d.success) { notify(d.isActive ? 'Compte activé' : 'Compte désactivé'); fetchUsers(); fetchStats(); } else notify(d.message || 'Erreur', false);
  };
  const handleResetPassword = async () => {
    if (modal?.type !== 'reset') return;
    const r = await fetch(`/api/admin/users/${modal.user.id}/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ newPassword: newPwd }) });
    const d = await r.json();
    if (d.success) { notify('Mot de passe réinitialisé'); setModal(null); setNewPwd(''); } else notify(d.message || 'Erreur', false);
  };
  const handleDelete = async () => {
    if (modal?.type !== 'delete') return;
    const r = await fetch(`/api/admin/users/${modal.user.id}`, { method: 'DELETE', credentials: 'include' }); const d = await r.json();
    if (d.success) { notify('Utilisateur supprimé'); setModal(null); fetchUsers(); fetchStats(); } else notify(d.message || 'Erreur', false);
  };

  // Module management state for admin/index
  const [modulesEditValue, setModulesEditValue] = useState<string[]>([]);
  const handleSaveModules = async () => {
    if (modal?.type !== 'modules') return;
    const r = await fetch(`/api/admin/users/${modal.user.id}/modules`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ modulesEnabled: modulesEditValue }),
    });
    const d = await r.json();
    if (d.success) { notify('Modules mis à jour'); setModal(null); fetchUsers(); }
    else notify(d.message || 'Erreur', false);
  };

  useEffect(() => { fetchUsers(); fetchStats(); }, []);
  const fetchSecurity = async () => {
    setSecLoading(true);
    try {
      const [statsRes, eventsRes] = await Promise.all([
        fetch('/api/superadmin/security-stats', { credentials: 'include' }),
        fetch('/api/superadmin/security-events?limit=200', { credentials: 'include' }),
      ]);
      const statsData = await statsRes.json();
      const eventsData = await eventsRes.json();
      if (statsData.success) setSecStats(statsData.stats);
      if (eventsData.success) setSecEvents(eventsData.events);
    } finally { setSecLoading(false); }
  };

  useEffect(() => {
    if (tab === 'llm' && !llmData) fetchLlmUsage();
    if (tab === 'sso') fetchSsoConfig();
    if (tab === 'security') fetchSecurity();
  }, [tab]);

  const fmt = (d: string | null) => d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
  const maxSig = Math.max(...(stats?.signupsByMonth?.map(s => Number(s.count)) ?? [1]), 1);

  const navItems: { id: Tab; label: string; icon: React.ReactNode; superadminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Vue d\'ensemble',  icon: <LayoutDashboard size={16} /> },
    { id: 'users',     label: 'Utilisateurs',     icon: <Users size={16} /> },
    { id: 'llm',       label: 'Consommation LLM', icon: <Zap size={16} /> },
    { id: 'sso',       label: 'SSO / Identité',   icon: <Lock size={16} /> },
    { id: 'security',  label: 'Forteresse',        icon: <ShieldAlert size={16} />, superadminOnly: true },
  ];

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: font, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Segoe+UI:wght@400;600&display=swap');
        *{box-sizing:border-box}
        input:focus,select:focus,textarea:focus{outline:none!important;border-color:${T.brand}!important;box-shadow:0 0 0 1px ${T.brand}!important}
        .tr-row:hover td{background:${T.rowHov}!important}
        a:focus{outline:none}
      `}</style>

      {/* ── TOP BAR ── */}
      <header style={{ background: T.brand, height: 44, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 0, flexShrink: 0, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
          <img src={mcLogoPath} alt="mc2i" style={{ height: 20, filter: 'brightness(0) invert(1)', opacity: 0.95 }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: 200 }}>|</span>
          <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 13, fontWeight: 600 }}>FYNE</span>
          <ChevronRight size={12} color="rgba(255,255,255,0.4)" />
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Centre d'administration</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6fcf97', display: 'inline-block' }} />
            {user?.username}
          </span>
          <button onClick={() => setLocation('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 2, color: 'rgba(255,255,255,0.85)', fontSize: 12, cursor: 'pointer', fontFamily: font }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
          >
            <ChevronLeft size={13} /> Retour à FYNE
          </button>
          <button onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 2, color: 'rgba(255,255,255,0.65)', fontSize: 12, cursor: 'pointer', fontFamily: font }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.18)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
          >
            Se déconnecter
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', flex: 1 }}>

        {/* ── SIDEBAR ── */}
        <nav style={{ width: 220, background: T.sidebar, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 44, height: 'calc(100vh - 44px)', overflowY: 'auto' }}>
          <div style={{ padding: '12px 16px 6px', fontSize: 11, fontWeight: 600, color: T.textDisable, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Console
          </div>
          {navItems.filter(n => !n.superadminOnly || user?.role === 'superadmin').map(({ id, label, icon }) => {
            const active = tab === id;
            return (
              <button key={id} onClick={() => setTab(id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px 8px 12px', border: 'none', cursor: 'pointer', textAlign: 'left', background: active ? T.brandLight : 'transparent', color: active ? T.brand : T.textPrimary, fontSize: 13, fontWeight: active ? 600 : 400, fontFamily: font, borderLeft: `3px solid ${active ? T.brand : 'transparent'}`, transition: 'background 0.08s' }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = T.sidebarHov; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                {icon}{label}
              </button>
            );
          })}

          <div style={{ marginTop: 'auto', padding: '12px 14px', borderTop: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, color: T.textDisable, lineHeight: 1.8 }}>
              <div style={{ fontWeight: 600, color: T.textSecond, marginBottom: 2 }}>Environnement</div>
              <div>Prod · EC2 · eu-west-3</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, display: 'inline-block' }} />
                Opérationnel
              </div>
            </div>
          </div>
        </nav>

        {/* ── MAIN CONTENT ── */}
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto', minWidth: 0 }}>

          {/* ────────── DASHBOARD ────────── */}
          {tab === 'dashboard' && (
            <div>
              <SectionHeader
                title="Vue d'ensemble"
                subtitle={`Données au ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}`}
                icon={<LayoutDashboard size={18} />}
              />
              {statsLoading ? <Spinner /> : !stats ? <EmptyMsg msg="Impossible de charger les statistiques" /> : (
                <>
                  {/* KPI row 1 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
                    <KpiCard label="Utilisateurs total"   value={stats.totalUsers}         icon={<Users size={16} />}      iconBg={T.brandLight}  iconColor={T.brand}   />
                    <KpiCard label="Comptes actifs"        value={stats.activeUsers}         icon={<Activity size={16} />}   iconBg={T.greenBg}     iconColor={T.green}   trend={`${stats.activeUsers} / ${stats.totalUsers}`} />
                    <KpiCard label="Connexions (30 j)"     value={stats.recentLogins30d}     icon={<Clock size={16} />}      iconBg={T.amberBg}     iconColor={T.amber}   />
                    <KpiCard label="Nouveaux (30 j)"       value={stats.newUsers30d}         icon={<TrendingUp size={16} />} iconBg={T.violetBg}    iconColor={T.violet}  />
                  </div>
                  {/* KPI row 2 */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                    <KpiCard label="Administrateurs"            value={stats.adminUsers}               icon={<Crown size={16} />}    iconBg={T.redBg}    iconColor={T.red}    />
                    <KpiCard label="Parcours apprentissage"     value={stats.learningProgressRecords}  icon={<TrendingUp size={16} />} iconBg={T.violetBg} iconColor={T.violet} />
                    <KpiCard label="Cache LLM total"            value={stats.cacheHitsTotal}           icon={<Database size={16} />} iconBg={T.brandLight} iconColor={T.brand} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

                    {/* Bar chart inscriptions */}
                    {stats.signupsByMonth.length > 0 && (
                      <Card>
                        <CardTitle>Inscriptions — 6 mois</CardTitle>
                        <div style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100 }}>
                            {stats.signupsByMonth.map(s => {
                              const h = Math.max(3, Math.round((Number(s.count) / maxSig) * 80));
                              return (
                                <div key={s.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                  <span style={{ fontSize: 11, fontWeight: 600, color: T.textPrimary }}>{s.count}</span>
                                  <div style={{ width: '100%', height: h, background: T.brand, borderRadius: '2px 2px 0 0', opacity: 0.75 }} />
                                  <span style={{ fontSize: 10, color: T.textDisable, textAlign: 'center', lineHeight: 1.3 }}>{s.month}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Dernières connexions */}
                    <Card>
                      <CardTitle>Dernières connexions</CardTitle>
                      <div>
                        {stats.recentUsers.map((u, i) => (
                          <div key={u.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px', borderBottom: i < stats.recentUsers.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.brandLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: T.brand, textTransform: 'uppercase' }}>
                                {u.username[0]}
                              </div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 500, color: T.textPrimary, display: 'flex', alignItems: 'center', gap: 6 }}>
                                  {u.username}
                                  {u.role === 'admin' && <Badge label="Admin" color={T.red} bg={T.redBg} icon={<Crown size={9} />} />}
                                </div>
                                <div style={{ fontSize: 11, color: T.textDisable }}>{u.email || '—'}</div>
                              </div>
                            </div>
                            <span style={{ fontSize: 11, color: T.textDisable }}>{fmt(u.lastLogin)}</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ────────── UTILISATEURS ────────── */}
          {tab === 'users' && (
            <div>
              <SectionHeader
                title="Utilisateurs"
                subtitle={`${users.length} compte${users.length > 1 ? 's' : ''} enregistré${users.length > 1 ? 's' : ''}`}
                icon={<Users size={18} />}
                action={
                  <PrimaryBtn onClick={() => setModal({ type: 'create' })}>
                    <Plus size={14} /> Nouveau compte
                  </PrimaryBtn>
                }
              />

              <Card>
                {loading ? <Spinner /> : users.length === 0 ? <EmptyMsg msg="Aucun utilisateur" /> : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={thCls}>Utilisateur</th>
                          <th style={thCls}>Email</th>
                          <th style={thCls}>Rôle</th>
                          <th style={thCls}>Statut</th>
                          <th style={thCls}>Dernière connexion</th>
                          <th style={thCls}>Inscrit le</th>
                          <th style={{ ...thCls, textAlign: 'right' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(u => (
                          <tr key={u.id} className="tr-row" style={{ opacity: u.isActive ? 1 : 0.55 }}>
                            <td style={tdCls}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ width: 28, height: 28, borderRadius: '50%', background: T.brandLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: T.brand, textTransform: 'uppercase', flexShrink: 0 }}>
                                  {u.username[0]}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {u.username}
                                    {u.id === user?.id && <span style={{ fontSize: 11, color: T.textDisable }}>(vous)</span>}
                                  </div>
                                  {(u.firstName || u.lastName) && <div style={{ fontSize: 11, color: T.textDisable }}>{[u.firstName, u.lastName].filter(Boolean).join(' ')}</div>}
                                </div>
                              </div>
                            </td>
                            <td style={{ ...tdCls, color: T.textSecond, fontSize: 12 }}>{u.email || '—'}</td>
                            <td style={tdCls}>
                              {u.role === 'admin'
                                ? <Badge label="Administrateur" color={T.red}     bg={T.redBg}     icon={<Crown size={10} />} />
                                : <Badge label="Utilisateur"    color={T.textSecond} bg={T.bg}     />}
                            </td>
                            <td style={tdCls}>
                              {u.isActive
                                ? <Badge label="Actif"   color={T.green} bg={T.greenBg} icon={<span style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, display: 'inline-block' }} />} />
                                : <Badge label="Inactif" color={T.textSecond} bg={T.bg} icon={<span style={{ width: 6, height: 6, borderRadius: '50%', background: T.textDisable, display: 'inline-block' }} />} />}
                            </td>
                            <td style={{ ...tdCls, color: T.textSecond, fontSize: 12 }}>{fmt(u.lastLogin)}</td>
                            <td style={{ ...tdCls, color: T.textSecond, fontSize: 12 }}>{fmt(u.createdAt)}</td>
                            <td style={{ ...tdCls, textAlign: 'right' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'flex-end' }}>
                                <a href={`/api/admin/users/${u.id}/report`} target="_blank" rel="noreferrer" title="Télécharger rapport PDF"
                                  style={{ width: 28, height: 28, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 2, color: T.textSecond, textDecoration: 'none' }}
                                  onMouseEnter={e => (e.currentTarget.style.background = T.sidebarHov)}
                                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                  <FileDown size={14} />
                                </a>
                                {u.id !== user?.id && (
                                  <>
                                    <IconBtn
                                      onClick={() => {
                                        setModulesEditValue(u.modulesEnabled ?? user?.modulesEnabled ?? []);
                                        setModal({ type: 'modules', user: u });
                                      }}
                                      title="Gérer les modules"
                                    >
                                      <Settings size={13} />
                                    </IconBtn>
                                    <IconBtn onClick={() => handleToggle(u)} title={u.isActive ? 'Désactiver' : 'Activer'}>
                                      {u.isActive ? <ToggleRight size={14} color={T.green} /> : <ToggleLeft size={14} />}
                                    </IconBtn>
                                    <IconBtn onClick={() => { setModal({ type: 'reset', user: u }); setNewPwd(''); }} title="Réinitialiser le mot de passe">
                                      <RefreshCw size={13} />
                                    </IconBtn>
                                    <IconBtn onClick={() => setModal({ type: 'delete', user: u })} title="Supprimer" danger>
                                      <Trash2 size={13} />
                                    </IconBtn>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ────────── LLM ────────── */}
          {tab === 'llm' && (
            <div>
              <SectionHeader
                title="Consommation IA"
                subtitle="30 derniers jours · suivi des appels aux modèles d'intelligence artificielle"
                icon={<Zap size={18} />}
                action={<SecondaryBtn onClick={fetchLlmUsage}><RefreshCw size={13} /> Actualiser</SecondaryBtn>}
              />
              {llmLoading ? <Spinner /> : !llmData ? <EmptyMsg msg="Impossible de charger les données" /> : (
                <>
                  {/* Explication lexique */}
                  <div style={{ background: T.brandLight, border: `1px solid #c7e0f4`, borderLeft: `3px solid ${T.brand}`, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: T.brandText, borderRadius: 2 }}>
                    <strong>Lexique :</strong>{' '}
                    <span style={{ marginRight: 16 }}><strong>Token</strong> = unité de texte (~¾ d'un mot). L'IA facture à la consommation de tokens.</span>
                    <span style={{ marginRight: 16 }}><strong>Tokens envoyés</strong> = votre question + contexte envoyés au modèle.</span>
                    <span><strong>Tokens reçus</strong> = la réponse générée par le modèle.</span>
                  </div>

                  {/* KPIs */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                    <KpiCard label="Total tokens consommés (30 j)" value={llmData.totalTokens30d.toLocaleString('fr-FR')} icon={<Zap size={16} />} iconBg={T.amberBg} iconColor={T.amber} sub="≈ coût IA du mois" />
                    <KpiCard label="Utilisateurs actifs" value={llmData.usageByUser.length} icon={<Users size={16} />} iconBg={T.brandLight} iconColor={T.brand} />
                    <KpiCard label="Modules utilisés" value={llmData.usageByFeature.length} icon={<Activity size={16} />} iconBg={T.violetBg} iconColor={T.violet} />
                    <KpiCard label="Modèles IA distincts" value={llmData.usageByModel.length} icon={<Database size={16} />} iconBg={T.greenBg} iconColor={T.green} />
                  </div>

                  {/* Par modèle IA */}
                  {llmData.usageByModel.length > 0 && (
                    <Card style={{ marginBottom: 16 }}>
                      <CardTitle>Modèles IA utilisés</CardTitle>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={thCls}>Modèle</th>
                              <th style={{ ...thCls, textAlign: 'right' }}>Appels</th>
                              <th style={{ ...thCls, textAlign: 'right' }}>
                                <span title="Total des tokens envoyés + reçus">Total tokens ⓘ</span>
                              </th>
                              <th style={{ ...thCls, textAlign: 'right' }}>
                                <span title="Tokens envoyés au modèle (votre question + contexte)">Envoyés ⓘ</span>
                              </th>
                              <th style={{ ...thCls, textAlign: 'right' }}>
                                <span title="Tokens générés par le modèle (la réponse)">Reçus ⓘ</span>
                              </th>
                              <th style={{ ...thCls, textAlign: 'right' }}>Utilisateurs</th>
                            </tr>
                          </thead>
                          <tbody>
                            {llmData.usageByModel.map(m => (
                              <tr key={m.model} className="tr-row">
                                <td style={tdCls}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.green, flexShrink: 0 }} />
                                    <span style={{ fontWeight: 600, color: T.textPrimary }}>{m.model}</span>
                                  </div>
                                </td>
                                <td style={{ ...tdCls, textAlign: 'right', color: T.textSecond }}>{Number(m.requests).toLocaleString('fr-FR')}</td>
                                <td style={{ ...tdCls, textAlign: 'right', fontWeight: 700, color: T.amber }}>{Number(m.total_tokens).toLocaleString('fr-FR')}</td>
                                <td style={{ ...tdCls, textAlign: 'right', color: T.textSecond }}>{Number(m.prompt_tokens).toLocaleString('fr-FR')}</td>
                                <td style={{ ...tdCls, textAlign: 'right', color: T.textSecond }}>{Number(m.completion_tokens).toLocaleString('fr-FR')}</td>
                                <td style={{ ...tdCls, textAlign: 'right', color: T.textSecond }}>{m.unique_users}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  )}

                  {/* Par utilisateur */}
                  <Card style={{ marginBottom: 16 }}>
                    <CardTitle>Par utilisateur</CardTitle>
                    {llmData.usageByUser.length === 0 ? <EmptyMsg msg="Aucune donnée — les appels IA seront tracés automatiquement." /> : (
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={thCls}>Utilisateur</th>
                              <th style={thCls}>Modèles utilisés</th>
                              <th style={{ ...thCls, textAlign: 'right' }}>Appels</th>
                              <th style={{ ...thCls, textAlign: 'right' }}>
                                <span title="Tokens envoyés + reçus au total">Total tokens ⓘ</span>
                              </th>
                              <th style={{ ...thCls, textAlign: 'right' }}>
                                <span title="Tokens envoyés au modèle (questions, contexte)">Envoyés ⓘ</span>
                              </th>
                              <th style={{ ...thCls, textAlign: 'right' }}>
                                <span title="Tokens générés en réponse par le modèle">Reçus ⓘ</span>
                              </th>
                              <th style={{ ...thCls, textAlign: 'right' }}>Dernier appel</th>
                            </tr>
                          </thead>
                          <tbody>
                            {llmData.usageByUser.map(u => (
                              <tr key={u.user_id} className="tr-row">
                                <td style={tdCls}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: T.brandLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: T.brand, textTransform: 'uppercase' }}>{u.username[0]}</div>
                                    <span style={{ fontWeight: 500 }}>{u.username}</span>
                                  </div>
                                </td>
                                <td style={{ ...tdCls, fontSize: 11, color: T.textSecond }}>
                                  {(u as any).models_used ? (u as any).models_used.split(', ').map((m: string) => (
                                    <span key={m} style={{ display: 'inline-block', background: T.greenBg, color: T.green, fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 2, marginRight: 3 }}>{m}</span>
                                  )) : '—'}
                                </td>
                                <td style={{ ...tdCls, textAlign: 'right', color: T.textSecond }}>{Number(u.requests).toLocaleString('fr-FR')}</td>
                                <td style={{ ...tdCls, textAlign: 'right', fontWeight: 700, color: T.amber }}>{Number(u.total_tokens).toLocaleString('fr-FR')}</td>
                                <td style={{ ...tdCls, textAlign: 'right', color: T.textSecond, fontSize: 12 }}>{Number(u.prompt_tokens).toLocaleString('fr-FR')}</td>
                                <td style={{ ...tdCls, textAlign: 'right', color: T.textSecond, fontSize: 12 }}>{Number(u.completion_tokens).toLocaleString('fr-FR')}</td>
                                <td style={{ ...tdCls, textAlign: 'right', color: T.textDisable, fontSize: 12 }}>{fmt(u.last_used)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card>

                  {/* Par module/fonctionnalité */}
                  <Card>
                    <CardTitle>Par module / fonctionnalité</CardTitle>
                    {llmData.usageByFeature.length === 0 ? <EmptyMsg msg="Aucune donnée." /> : (
                      <div style={{ padding: '14px 16px' }}>
                        {llmData.usageByFeature.map(f => {
                          const mx = Math.max(...llmData.usageByFeature.map(x => Number(x.total_tokens)), 1);
                          const pct = Math.round((Number(f.total_tokens) / mx) * 100);
                          const totalTok = Number(f.total_tokens);
                          const sent = Number(f.prompt_tokens ?? 0);
                          const recv = Number(f.completion_tokens ?? 0);
                          return (
                            <div key={f.feature} style={{ marginBottom: 14 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                                <div>
                                  <span style={{ fontWeight: 600, fontSize: 13, color: T.textPrimary }}>{f.feature}</span>
                                  {(f as any).models_used && (
                                    <span style={{ marginLeft: 8, fontSize: 10, background: T.greenBg, color: T.green, padding: '1px 6px', borderRadius: 2, fontWeight: 600 }}>{(f as any).models_used}</span>
                                  )}
                                </div>
                                <div style={{ textAlign: 'right', fontSize: 12, color: T.textSecond }}>
                                  <span style={{ fontWeight: 700, color: T.amber }}>{totalTok.toLocaleString('fr-FR')} tokens</span>
                                  <span style={{ color: T.textDisable, margin: '0 6px' }}>·</span>
                                  <span>{Number(f.requests).toLocaleString('fr-FR')} appels</span>
                                  {sent > 0 && <span style={{ color: T.textDisable, marginLeft: 8, fontSize: 11 }}>↑{sent.toLocaleString('fr-FR')} envoyés · ↓{recv.toLocaleString('fr-FR')} reçus</span>}
                                </div>
                              </div>
                              <div style={{ height: 6, background: T.bg, borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: T.brand, borderRadius: 3, transition: 'width 0.4s ease' }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </>
              )}
            </div>
          )}

          {/* ────────── SSO ────────── */}
          {tab === 'sso' && (
            <div style={{ maxWidth: 640 }}>
              <SectionHeader
                title="SSO / Identité"
                subtitle="Authentification unique via Azure AD · OpenID Connect"
                icon={<Lock size={18} />}
              />

              {ssoLoading ? <Spinner /> : (
                <>
                  <Card style={{ marginBottom: 16 }}>
                    {/* Toggle */}
                    <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary }}>Activer le SSO</div>
                        <div style={{ fontSize: 12, color: T.textSecond, marginTop: 2 }}>Les utilisateurs peuvent se connecter via leur compte entreprise</div>
                      </div>
                      <button onClick={() => setSsoConfig(c => ({ ...c, isEnabled: !c.isEnabled }))}
                        style={{ width: 44, height: 22, borderRadius: 11, border: 'none', cursor: 'pointer', background: ssoConfig.isEnabled ? T.brand : T.borderMid, position: 'relative', transition: 'background 0.15s', flexShrink: 0 }}
                      >
                        <span style={{ position: 'absolute', top: 2, left: ssoConfig.isEnabled ? 24 : 2, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left 0.15s', display: 'block', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                      </button>
                    </div>

                    {/* Form */}
                    <div style={{ padding: '16px', display: 'grid', gap: 14 }}>
                      <Field label="Fournisseur">
                        <select style={selectCls} value={ssoConfig.provider} onChange={e => setSsoConfig(c => ({ ...c, provider: e.target.value }))}>
                          <option value="azure">Azure AD / Microsoft Entra</option>
                          <option value="okta">Okta</option>
                          <option value="google">Google Workspace</option>
                          <option value="generic">OpenID Connect générique</option>
                        </select>
                      </Field>

                      {ssoConfig.provider === 'azure'
                        ? <Field label="Tenant ID" hint="(Azure AD)"><input style={inputCls} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={ssoConfig.tenantId} onChange={e => setSsoConfig(c => ({ ...c, tenantId: e.target.value }))} /></Field>
                        : <Field label="URL de découverte OIDC"><input style={inputCls} placeholder="https://provider/.well-known/openid-configuration" value={ssoConfig.discoveryUrl} onChange={e => setSsoConfig(c => ({ ...c, discoveryUrl: e.target.value }))} /></Field>
                      }

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Client ID" required><input style={inputCls} placeholder="Application (client) ID" value={ssoConfig.clientId} onChange={e => setSsoConfig(c => ({ ...c, clientId: e.target.value }))} /></Field>
                        <Field label="Client Secret" required><input type="password" style={inputCls} placeholder="Secret de l'application" value={ssoConfig.clientSecret} onChange={e => setSsoConfig(c => ({ ...c, clientSecret: e.target.value }))} /></Field>
                      </div>

                      <Field label="URL de callback" hint="(à enregistrer dans votre fournisseur)">
                        <input style={{ ...inputCls, background: T.bg }} value={ssoConfig.callbackUrl} onChange={e => setSsoConfig(c => ({ ...c, callbackUrl: e.target.value }))} />
                      </Field>

                      <Field label="Domaines autorisés" hint="séparés par virgules · vide = tous">
                        <input style={inputCls} placeholder="mc2i.fr, exemple.com" value={allowedDomainsInput} onChange={e => setAllowedDomainsInput(e.target.value)} />
                      </Field>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <Field label="Rôle par défaut">
                          <select style={selectCls} value={ssoConfig.defaultRole} onChange={e => setSsoConfig(c => ({ ...c, defaultRole: e.target.value }))}>
                            <option value="user">Utilisateur</option>
                            <option value="admin">Administrateur</option>
                          </select>
                        </Field>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
                          <input type="checkbox" id="autoCreate" checked={ssoConfig.autoCreateUsers} onChange={e => setSsoConfig(c => ({ ...c, autoCreateUsers: e.target.checked }))}
                            style={{ width: 14, height: 14, accentColor: T.brand, cursor: 'pointer' }} />
                          <label htmlFor="autoCreate" style={{ fontSize: 12, color: T.textSecond, cursor: 'pointer' }}>Créer les comptes automatiquement</label>
                        </div>
                      </div>

                      {ssoTestResult && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: ssoTestResult.ok ? T.greenBg : T.redBg, border: `1px solid ${ssoTestResult.ok ? '#bad7ba' : '#f4b8bb'}`, borderRadius: 2, fontSize: 13, color: ssoTestResult.ok ? T.green : T.red }}>
                          {ssoTestResult.ok ? <Check size={14} /> : <AlertCircle size={14} />}
                          {ssoTestResult.msg}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 8, paddingTop: 4, borderTop: `1px solid ${T.border}` }}>
                        <SecondaryBtn onClick={testSsoConfig} disabled={ssoTesting || !ssoConfig.clientId}>
                          <FlaskConical size={13} />{ssoTesting ? 'Test en cours...' : 'Tester la connexion'}
                        </SecondaryBtn>
                        <div style={{ marginLeft: 'auto' }}>
                          <PrimaryBtn onClick={saveSsoConfig} disabled={ssoSaving || !ssoConfig.clientId || !ssoConfig.clientSecret}>
                            <Save size={13} />{ssoSaving ? 'Enregistrement...' : 'Enregistrer'}
                          </PrimaryBtn>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Instructions */}
                  <div style={{ background: T.brandLight, border: `1px solid #c7e0f4`, borderLeft: `3px solid ${T.brand}`, padding: '14px 16px', borderRadius: 2 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: T.brandText, marginBottom: 10 }}>
                      <Settings size={13} /> Configuration Azure AD — étapes
                    </div>
                    <ol style={{ margin: 0, paddingLeft: 18 }}>
                      {[
                        'Azure Portal → App registrations → New registration',
                        `Ajouter comme Redirect URI : ${ssoConfig.callbackUrl}`,
                        'Copier Application (client) ID et Tenant ID',
                        'Certificates & secrets → New client secret',
                        'Renseigner les valeurs ci-dessus et enregistrer',
                      ].map((s, i) => (
                        <li key={i} style={{ fontSize: 12, color: T.brandText, marginBottom: 4, lineHeight: 1.5 }}>{s}</li>
                      ))}
                    </ol>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ────────── FORTERESSE ────────── */}
          {tab === 'security' && (
            <div>
              <SectionHeader
                title="Forteresse"
                subtitle="Surveillance de sécurité · Accès superadmin uniquement"
                icon={<ShieldAlert size={18} />}
                action={
                  <button onClick={fetchSecurity} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', background: T.canvas, border: `1px solid ${T.borderMid}`, borderRadius: 2, fontSize: 12, cursor: 'pointer', color: T.textSecond, fontFamily: font }}>
                    <RefreshCw size={12} /> Actualiser
                  </button>
                }
              />
              {secLoading ? <Spinner /> : (
                <>
                  {/* KPI sécurité */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                    <div style={{ background: T.canvas, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.red}`, borderRadius: 4, padding: '14px 16px' }}>
                      <div style={{ fontSize: 11, color: T.textSecond, fontFamily: font, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tentatives échouées · 24h</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: secStats && secStats.failedLogins24h > 5 ? T.red : T.textPrimary, fontFamily: font }}>{secStats?.failedLogins24h ?? 0}</div>
                    </div>
                    <div style={{ background: T.canvas, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.amber}`, borderRadius: 4, padding: '14px 16px' }}>
                      <div style={{ fontSize: 11, color: T.textSecond, fontFamily: font, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Tentatives échouées · 7 jours</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: T.textPrimary, fontFamily: font }}>{secStats?.failedLogins7d ?? 0}</div>
                    </div>
                    <div style={{ background: T.canvas, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.green}`, borderRadius: 4, padding: '14px 16px' }}>
                      <div style={{ fontSize: 11, color: T.textSecond, fontFamily: font, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Connexions réussies · 24h</div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: T.green, fontFamily: font }}>{secStats?.successLogins24h ?? 0}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 16, marginBottom: 20 }}>
                    {/* Top IPs suspectes */}
                    <Card>
                      <CardTitle>IPs avec le plus d'échecs (7j)</CardTitle>
                      <div style={{ padding: '0 0 4px' }}>
                        {!secStats?.topIps?.length ? (
                          <div style={{ padding: '20px 16px', fontSize: 13, color: T.textDisable, fontFamily: font }}>Aucune IP suspecte détectée</div>
                        ) : secStats.topIps.map((row, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 16px', borderBottom: `1px solid ${T.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <Globe size={13} color={T.textSecond} />
                              <span style={{ fontSize: 13, fontFamily: 'monospace', color: T.textPrimary }}>{row.ip || '—'}</span>
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 600, color: Number(row.cnt) > 10 ? T.red : T.amber, background: Number(row.cnt) > 10 ? T.redBg : T.amberBg, padding: '1px 7px', borderRadius: 2 }}>
                              {row.cnt} tentatives
                            </span>
                          </div>
                        ))}
                      </div>
                    </Card>

                    {/* Dernières tentatives échouées */}
                    <Card>
                      <CardTitle>Dernières tentatives de connexion échouées</CardTitle>
                      <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>
                              <th style={thCls}>Utilisateur</th>
                              <th style={thCls}>IP</th>
                              <th style={thCls}>Raison</th>
                              <th style={thCls}>Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {!secStats?.recentFails?.length ? (
                              <tr><td colSpan={4} style={{ ...tdCls, textAlign: 'center', color: T.textDisable }}>Aucune tentative récente</td></tr>
                            ) : secStats.recentFails.map((f, i) => (
                              <tr key={i} className="tr-row">
                                <td style={tdCls}><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{f.username || '—'}</span></td>
                                <td style={tdCls}><span style={{ fontFamily: 'monospace', fontSize: 12 }}>{f.ip || '—'}</span></td>
                                <td style={tdCls}>
                                  <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 2, background: T.amberBg, color: T.amber, fontWeight: 600 }}>
                                    {f.details?.reason === 'wrong_password' ? 'Mauvais mot de passe' : f.details?.reason === 'user_not_found' ? 'Utilisateur inconnu' : f.details?.reason || '—'}
                                  </span>
                                </td>
                                <td style={{ ...tdCls, fontSize: 11, color: T.textSecond }}>
                                  {new Date(f.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Card>
                  </div>

                  {/* Journal complet */}
                  <Card>
                    <CardTitle>Journal des événements de sécurité (7 derniers jours)</CardTitle>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            <th style={thCls}>Type</th>
                            <th style={thCls}>Sévérité</th>
                            <th style={thCls}>Utilisateur</th>
                            <th style={thCls}>IP</th>
                            <th style={thCls}>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {secEvents.length === 0 ? (
                            <tr><td colSpan={5} style={{ ...tdCls, textAlign: 'center', color: T.textDisable }}>Aucun événement enregistré</td></tr>
                          ) : secEvents.slice(0, 100).map((ev) => {
                            const isWarn = ev.severity === 'warning';
                            const isInfo = ev.severity === 'info';
                            return (
                              <tr key={ev.id} className="tr-row">
                                <td style={tdCls}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {ev.type === 'login_failed' ? <AlertTriangle size={12} color={T.amber} /> : ev.type === 'login_success' ? <LogIn size={12} color={T.green} /> : <ShieldCheck size={12} color={T.brand} />}
                                    <span style={{ fontSize: 12, fontFamily: 'monospace' }}>{ev.type}</span>
                                  </div>
                                </td>
                                <td style={tdCls}>
                                  <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 2, fontWeight: 600, background: isWarn ? T.amberBg : isInfo ? T.greenBg : T.redBg, color: isWarn ? T.amber : isInfo ? T.green : T.red }}>
                                    {ev.severity}
                                  </span>
                                </td>
                                <td style={{ ...tdCls, fontFamily: 'monospace', fontSize: 12 }}>{ev.username || '—'}</td>
                                <td style={{ ...tdCls, fontFamily: 'monospace', fontSize: 12 }}>{ev.ip || '—'}</td>
                                <td style={{ ...tdCls, fontSize: 11, color: T.textSecond }}>
                                  {new Date(ev.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </>
              )}
            </div>
          )}

        </main>
      </div>

      {/* ── MODALS ── */}
      <AnimatePresence>
        {modal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget) setModal(null); }}
          >
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              style={{ background: T.canvas, border: `1px solid ${T.border}`, borderRadius: 4, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', width: '100%', maxWidth: 460, padding: 24, fontFamily: font }}
            >
              {modal.type === 'create' && (
                <>
                  <h2 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 600, color: T.textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Plus size={16} color={T.brand} /> Nouveau compte utilisateur
                  </h2>
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      <Field label="Prénom"><input style={inputCls} placeholder="Prénom" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} /></Field>
                      <Field label="Nom"><input style={inputCls} placeholder="Nom" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} /></Field>
                    </div>
                    <Field label="Nom d'utilisateur" required><input style={inputCls} placeholder="jdupont" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} /></Field>
                    <Field label="Email"><input type="email" style={inputCls} placeholder="email@mc2i.fr" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></Field>
                    <Field label="Mot de passe" required>
                      <div style={{ position: 'relative' }}>
                        <input type={showPwd ? 'text' : 'password'} style={{ ...inputCls, paddingRight: 34 }} placeholder="Min. 6 caractères" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
                        <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: T.textDisable, cursor: 'pointer' }}>
                          {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </Field>
                    <Field label="Rôle">
                      <select style={selectCls} value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                        <option value="user">Utilisateur</option>
                        <option value="admin">Administrateur</option>
                      </select>
                    </Field>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
                    <SecondaryBtn onClick={() => setModal(null)}>Annuler</SecondaryBtn>
                    <PrimaryBtn onClick={handleCreate} disabled={!form.username || !form.password}>Créer le compte</PrimaryBtn>
                  </div>
                </>
              )}

              {modal.type === 'reset' && (
                <>
                  <h2 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: T.textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <RefreshCw size={16} color={T.brand} /> Réinitialiser le mot de passe
                  </h2>
                  <p style={{ margin: '0 0 16px', fontSize: 13, color: T.textSecond }}>Compte : <strong>{modal.user.username}</strong></p>
                  <Field label="Nouveau mot de passe">
                    <div style={{ position: 'relative' }}>
                      <input type={showNewPwd ? 'text' : 'password'} style={{ ...inputCls, paddingRight: 34 }} placeholder="Min. 6 caractères" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                      <button type="button" onClick={() => setShowNewPwd(v => !v)} style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: T.textDisable, cursor: 'pointer' }}>
                        {showNewPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </Field>
                  <div style={{ display: 'flex', gap: 8, marginTop: 20, justifyContent: 'flex-end' }}>
                    <SecondaryBtn onClick={() => setModal(null)}>Annuler</SecondaryBtn>
                    <PrimaryBtn onClick={handleResetPassword} disabled={newPwd.length < 6}>Enregistrer</PrimaryBtn>
                  </div>
                </>
              )}

              {modal.type === 'delete' && (
                <>
                  <h2 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 600, color: T.textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Trash2 size={16} color={T.red} /> Supprimer le compte
                  </h2>
                  <div style={{ display: 'flex', gap: 10, padding: '12px 14px', background: T.redBg, border: `1px solid #f4b8bb`, borderRadius: 2, marginBottom: 20, fontSize: 13, color: T.textPrimary }}>
                    <AlertCircle size={16} color={T.red} style={{ flexShrink: 0, marginTop: 1 }} />
                    <span>Supprimer <strong>{modal.user.username}</strong> est une action irréversible. Toutes les données associées seront perdues.</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <SecondaryBtn onClick={() => setModal(null)}>Annuler</SecondaryBtn>
                    <button onClick={handleDelete}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: T.red, color: '#fff', border: 'none', borderRadius: 2, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: font }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#8a1a1f')}
                      onMouseLeave={e => (e.currentTarget.style.background = T.red)}
                    >
                      <Trash2 size={13} /> Supprimer définitivement
                    </button>
                  </div>
                </>
              )}

              {modal.type === 'modules' && (() => {
                // modules disponibles = modules de l'admin connecté (limites)
                const adminModules: string[] = user?.modulesEnabled ?? [];
                return (
                  <>
                    <h2 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 600, color: T.textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Settings size={16} color={T.brand} /> Modules — {modal.user.username}
                    </h2>
                    <p style={{ margin: '0 0 16px', fontSize: 12, color: T.textSecond }}>
                      Cochez les modules à accorder. Vous ne pouvez accorder que vos propres modules.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 20 }}>
                      {adminModules.length === 0 ? (
                        <div style={{ gridColumn: '1/-1', fontSize: 13, color: T.textDisable }}>Aucun module disponible dans votre compte.</div>
                      ) : adminModules.map(m => {
                        const checked = modulesEditValue.includes(m);
                        return (
                          <label key={m} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: `1px solid ${checked ? T.brand : T.border}`, borderRadius: 2, cursor: 'pointer', background: checked ? T.brandLight : T.canvas, transition: 'all 0.1s' }}>
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => setModulesEditValue(prev =>
                                prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]
                              )}
                              style={{ width: 14, height: 14, accentColor: T.brand, cursor: 'pointer', flexShrink: 0 }}
                            />
                            <span style={{ fontSize: 13, fontWeight: checked ? 600 : 400, color: checked ? T.brand : T.textPrimary, fontFamily: font }}>{m}</span>
                          </label>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
                      <SecondaryBtn onClick={() => setModal(null)}>Annuler</SecondaryBtn>
                      <PrimaryBtn onClick={handleSaveModules}>
                        <Save size={13} /> Enregistrer
                      </PrimaryBtn>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── TOAST ── */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            style={{ position: 'fixed', bottom: 20, right: 20, background: T.canvas, border: `1px solid ${toast.ok ? '#bad7ba' : '#f4b8bb'}`, borderLeft: `3px solid ${toast.ok ? T.green : T.red}`, borderRadius: 2, padding: '10px 16px', fontSize: 13, fontFamily: font, color: toast.ok ? T.green : T.red, zIndex: 60, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', fontWeight: 500 }}
          >
            {toast.ok ? <Check size={14} /> : <X size={14} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Spinner = () => (
  <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 13, color: '#a19f9d', fontFamily: `'Segoe UI', sans-serif` }}>
    Chargement...
  </div>
);
const EmptyMsg: React.FC<{ msg: string }> = ({ msg }) => (
  <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: 13, color: '#a19f9d', fontFamily: `'Segoe UI', sans-serif` }}>{msg}</div>
);

export default AdminPage;
