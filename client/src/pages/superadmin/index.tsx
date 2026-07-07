import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Users, Zap, Settings, ChevronRight, Plus, Trash2, RefreshCw,
  Check, X, Edit2, Save, BarChart2, Lock, Unlock, Crown, UserCheck,
  Package, AlertTriangle, LogOut, Home, Building2, UserCog, ToggleLeft, ToggleRight,
  Server, HardDrive, Cpu, Database, Activity, Play, Layers, Wifi,
  ShieldAlert, Globe, LogIn,
} from 'lucide-react';

const ALL_MODULES = [
  { id: 'cyber',          label: 'ESPACE CYBER',            color: 'bg-indigo-500' },
  { id: 'data',           label: 'ESPACE DATA & IA',         color: 'bg-purple-500' },
  { id: 'amoa',           label: 'ESPACE AMOA',       color: 'bg-emerald-500' },
  { id: 'formation-data', label: 'FORMATION DATA',         color: 'bg-[#006a9e]' },
  { id: 'evaluation',     label: 'ESPACE CHALLENGE',       color: 'bg-amber-500' },
  { id: 'playground',     label: 'PLAYGROUND / GÉNÉRATEUR',color: 'bg-rose-500' },
];

const SUBSCRIPTION_LABELS = ['Gratuit', 'Starter', 'Pro', 'Enterprise', 'Illimité'];
const ROLES = ['user', 'evaluateur', 'admin', 'superadmin'];

const ROLE_BADGE: Record<string, string> = {
  user: 'bg-gray-100 text-gray-700',
  evaluateur: 'bg-green-100 text-green-700',
  admin: 'bg-blue-100 text-blue-700',
  superadmin: 'bg-amber-100 text-amber-700',
};

const ROLE_ICON: Record<string, React.ReactNode> = {
  user: <Users className="w-3 h-3" />,
  evaluateur: <UserCheck className="w-3 h-3" />,
  admin: <Shield className="w-3 h-3" />,
  superadmin: <Crown className="w-3 h-3" />,
};

interface UserRow {
  id: number;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  modulesEnabled: string[];
  tokenQuota: number;
  tokenUsedMonth: number;
  subscriptionLabel: string;
  subscriptionExpiresAt: string | null;
}

const ALL_PERMISSIONS = [
  { id: 'evaluateur', label: 'Évaluateur', desc: 'Accès direct à l\'espace évaluation', color: 'bg-green-500' },
];

type Tab = 'users' | 'subscriptions' | 'roles' | 'tokens' | 'clients' | 'system' | 'security';

interface SystemHealth {
  disk: { used: string; total: string; usedPct: number; avail: string };
  memory: { total: number; used: number; free: number; usedPct: number };
  cpu: { user: number; system: number; idle: number };
  docker: { images: string; imageCount: number; containers: string; buildCache: string; imageList: { name: string; size: string; createdAt: string; id: string }[] };
  uptime: string;
  app: { name: string; status: string; image: string }[];
  npmCache: string;
  checkedAt: string;
}

const CLIENT_MODULES = [
  { id: 'ia',            label: 'Espace IA' },
  { id: 'data',          label: 'Espace Data' },
  { id: 'cyber',         label: 'Espace Cyber' },
  { id: 'reglementaire', label: 'Espace Réglementaire' },
  { id: 'personnalise',  label: 'Espace à personnaliser' },
  { id: 'evaluation',    label: 'Mode Évaluation' },
  { id: 'studio',        label: 'Studio Formation' },
];

interface ClientCompany {
  id: number; name: string; slug: string; is_active: boolean;
  active_users: string; total_users: string; created_at: string;
  modules_enabled: string[] | null; token_quota: number | null; token_used_month: number | null;
}
interface ClientUserRow {
  id: number; company_id: number; email: string;
  first_name: string | null; last_name: string | null;
  role: string; is_active: boolean;
  score: number; niveau: string; last_login: string | null;
}
type ClientModal =
  | { type: 'create-company' }
  | { type: 'delete-company'; company: ClientCompany }
  | { type: 'create-user'; companyId: number; companyName: string }
  | { type: 'reset-user-pwd'; user: ClientUserRow }
  | { type: 'move-user'; user: ClientUserRow }
  | { type: 'delete-user'; user: ClientUserRow }
  | null;

async function api<T = any>(path: string, opts?: RequestInit): Promise<T> {
  const r = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const data = await r.json();
  if (!data.success) throw new Error(data.message || 'Erreur API');
  return data;
}

function DockerPanel({ systemHealth, systemActionLoading, runSystemAction }: {
  systemHealth: SystemHealth | null;
  systemActionLoading: string | null;
  runSystemAction: (action: string, label: string) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const images = systemHealth?.docker.imageList ?? [];
  const count = systemHealth?.docker.imageCount ?? 0;
  const isWarn = count > 3;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Layers className="w-4 h-4 text-[#0057ff]" />
        <span className="text-sm font-semibold text-gray-300">Docker</span>
        {systemHealth && (
          <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${isWarn ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-gray-400'}`}>
            {count} image{count !== 1 ? 's' : ''}
          </span>
        )}
        {images.length > 0 && (
          <button onClick={() => setExpanded(v => !v)} className="ml-auto text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1 transition-colors">
            {expanded ? 'Masquer' : 'Voir la liste'}
            <ChevronRight className={`w-3 h-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="space-y-1.5 mb-3">
        {systemHealth && [
          { label: 'Taille images', value: systemHealth.docker.images || '0B' },
          { label: 'Build cache', value: systemHealth.docker.buildCache || '0B' },
          { label: 'Conteneurs actifs', value: '0 — app PM2 direct' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-xs">
            <span className="text-gray-500">{label}</span>
            <span className="font-mono text-gray-300">{value}</span>
          </div>
        ))}
      </div>

      {/* Image list */}
      {expanded && images.length > 0 && (
        <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-white/5 text-gray-500">
                <th className="text-left px-3 py-1.5 font-medium">Image</th>
                <th className="text-right px-3 py-1.5 font-medium">Taille</th>
                <th className="text-right px-3 py-1.5 font-medium hidden sm:table-cell">Créée</th>
                <th className="text-right px-3 py-1.5 font-medium hidden sm:table-cell">ID</th>
              </tr>
            </thead>
            <tbody>
              {images.map((img, i) => (
                <tr key={img.id || i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-3 py-1.5 font-mono text-gray-300 max-w-[140px] truncate">{img.name}</td>
                  <td className="px-3 py-1.5 font-mono text-right text-gray-400">{img.size}</td>
                  <td className="px-3 py-1.5 text-right text-gray-500 hidden sm:table-cell whitespace-nowrap">{img.createdAt?.slice(0, 16) ?? ''}</td>
                  <td className="px-3 py-1.5 font-mono text-right text-gray-600 hidden sm:table-cell">{img.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Purge button */}
      {systemHealth && count > 0 && (
        <button
          onClick={() => runSystemAction('docker-prune', 'Nettoyer Docker')}
          disabled={systemActionLoading !== null}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
          style={{ background: '#f59e0b20', color: '#f59e0b', border: '1px solid #f59e0b40' }}
        >
          {systemActionLoading === 'docker-prune'
            ? <RefreshCw className="w-3 h-3 animate-spin" />
            : <Trash2 className="w-3 h-3" />}
          Purger les images inutilisées · libère ~{systemHealth.docker.images}
        </button>
      )}
    </div>
  );
}

export default function SuperAdminPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<UserRow>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', email: '', firstName: '', lastName: '', role: 'user', tokenQuota: 100000, subscriptionLabel: 'Gratuit', modulesEnabled: ALL_MODULES.map(m => m.id) });
  const [tokenStats, setTokenStats] = useState<any[]>([]);

  // ── System health state ──
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [systemLoading, setSystemLoading] = useState(false);
  const [systemActionLoading, setSystemActionLoading] = useState<string | null>(null);
  // CPU live stream (SSE)
  const [cpuHistory, setCpuHistory] = useState<{ ts: number; used: number; mem: number }[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<{ cpu: number; mem: number; load1: number; load5: number } | null>(null);
  const sseRef = React.useRef<EventSource | null>(null);

  // ── Security state ──
  const [secStats, setSecStats] = useState<{ failedLogins24h: number; failedLogins7d: number; successLogins24h: number; topIps: { ip: string; cnt: string }[]; recentFails: { username: string; ip: string; created_at: string; details: any }[] } | null>(null);
  const [secEvents, setSecEvents] = useState<{ id: number; type: string; severity: string; ip: string | null; username: string | null; created_at: string }[]>([]);
  const [secLoading, setSecLoading] = useState(false);

  async function fetchSecurity() {
    setSecLoading(true);
    try {
      const [statsData, eventsData] = await Promise.all([
        api('/api/superadmin/security-stats'),
        api('/api/superadmin/security-events?limit=200'),
      ]);
      if (statsData.success) setSecStats(statsData.stats);
      if (eventsData.success) setSecEvents(eventsData.events);
    } catch (e: any) { setError(e.message); }
    finally { setSecLoading(false); }
  }

  // ── Clients state ──
  const [companies, setCompanies] = useState<ClientCompany[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<ClientCompany | null>(null);
  const [clientUsers, setClientUsers] = useState<ClientUserRow[]>([]);
  const [clientUsersLoading, setClientUsersLoading] = useState(false);
  const [clientModal, setClientModal] = useState<ClientModal>(null);
  const [clientForm, setClientForm] = useState({ companyName: '', email: '', password: '', firstName: '', lastName: '', role: 'user' });
  const [clientNewPwd, setClientNewPwd] = useState('');
  const [showClientPwd, setShowClientPwd] = useState(false);
  const [moveTargetCompanyId, setMoveTargetCompanyId] = useState<number | ''>('');
  const [editingCompanyConfig, setEditingCompanyConfig] = useState<{ modules: string[]; quota: number } | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => { fetchUsers(); }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const data = await api('/api/superadmin/users');
      setUsers(data.users);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  async function fetchTokenStats() {
    try {
      const data = await api('/api/superadmin/token-stats');
      setTokenStats(data.stats);
    } catch (e: any) { setError(e.message); }
  }

  useEffect(() => { if (tab === 'tokens') fetchTokenStats(); }, [tab]);
  useEffect(() => { if (tab === 'clients') fetchCompanies(); }, [tab]);
  useEffect(() => { if (tab === 'security') fetchSecurity(); }, [tab]);
  useEffect(() => {
    if (tab === 'system') {
      fetchSystemHealth();
      // Ouvrir le flux SSE CPU
      if (sseRef.current) sseRef.current.close();
      const sse = new EventSource('/api/superadmin/cpu-stream');
      sse.onmessage = (e) => {
        try {
          const d = JSON.parse(e.data);
          setLiveMetrics({ cpu: d.cpu.used, mem: d.mem.pct, load1: d.load.m1, load5: d.load.m5 });
          setCpuHistory(prev => {
            const next = [...prev, { ts: d.ts, used: d.cpu.used, mem: d.mem.pct }];
            return next.slice(-40); // 40 points = ~2 minutes d'historique
          });
        } catch {}
      };
      sseRef.current = sse;
    } else {
      sseRef.current?.close();
      sseRef.current = null;
    }
    return () => { sseRef.current?.close(); sseRef.current = null; };
  }, [tab]);

  async function fetchSystemHealth() {
    setSystemLoading(true);
    try {
      const r = await fetch('/api/superadmin/system-health');
      const d = await r.json();
      if (d.success) setSystemHealth(d);
    } catch (e: any) { notify('Impossible de récupérer la santé système', true); }
    finally { setSystemLoading(false); }
  }

  async function runSystemAction(action: string, label: string) {
    if (!confirm(`Exécuter : ${label} ?`)) return;
    setSystemActionLoading(action);
    try {
      const r = await fetch('/api/superadmin/system-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const d = await r.json();
      if (d.success) { notify(`✓ ${label} — ${d.output?.slice(0, 80) || 'OK'}`); fetchSystemHealth(); }
      else notify(d.error || 'Erreur', true);
    } catch { notify('Erreur lors de l\'action', true); }
    finally { setSystemActionLoading(null); }
  }

  const fetchCompanies = async () => {
    setCompaniesLoading(true);
    try { const r = await fetch('/api/admin/client-companies', { credentials: 'include' }); const d = await r.json(); if (d.success) setCompanies(d.companies); }
    finally { setCompaniesLoading(false); }
  };
  const fetchClientUsers = async (companyId: number) => {
    setClientUsersLoading(true);
    try { const r = await fetch(`/api/admin/client-users?companyId=${companyId}`, { credentials: 'include' }); const d = await r.json(); if (d.success) setClientUsers(d.users); }
    finally { setClientUsersLoading(false); }
  };
  const handleSaveCompanyConfig = async () => {
    if (!selectedCompany || !editingCompanyConfig) return;
    setSavingConfig(true);
    try {
      const r = await fetch(`/api/admin/client-companies/${selectedCompany.id}/config`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ modules_enabled: editingCompanyConfig.modules, token_quota: editingCompanyConfig.quota }),
      });
      const d = await r.json();
      if (d.success) { notify('Configuration sauvegardée'); fetchCompanies(); }
      else notify(d.message || 'Erreur', true);
    } finally { setSavingConfig(false); }
  };
  const handleCreateCompany = async () => {
    const r = await fetch('/api/admin/client-companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ name: clientForm.companyName }) });
    const d = await r.json();
    if (d.success) { notify('Entreprise créée'); setClientModal(null); setClientForm(f => ({ ...f, companyName: '' })); fetchCompanies(); }
    else notify(d.message || 'Erreur', true);
  };
  const handleToggleCompany = async (c: ClientCompany) => {
    const r = await fetch(`/api/admin/client-companies/${c.id}/toggle`, { method: 'PATCH', credentials: 'include' }); const d = await r.json();
    if (d.success) { notify(d.isActive ? 'Entreprise activée' : 'Entreprise désactivée'); fetchCompanies(); }
    else notify(d.message || 'Erreur', true);
  };
  const handleDeleteCompany = async () => {
    if (clientModal?.type !== 'delete-company') return;
    const r = await fetch(`/api/admin/client-companies/${clientModal.company.id}`, { method: 'DELETE', credentials: 'include' }); const d = await r.json();
    if (d.success) { notify('Entreprise supprimée'); setClientModal(null); if (selectedCompany?.id === clientModal.company.id) { setSelectedCompany(null); setClientUsers([]); } fetchCompanies(); }
    else notify(d.message || 'Erreur', true);
  };
  const handleCreateClientUser = async () => {
    if (clientModal?.type !== 'create-user') return;
    const r = await fetch('/api/admin/client-users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ companyId: clientModal.companyId, email: clientForm.email, password: clientForm.password, firstName: clientForm.firstName, lastName: clientForm.lastName, role: clientForm.role }) });
    const d = await r.json();
    if (d.success) { notify('Utilisateur créé'); setClientModal(null); setClientForm(f => ({ ...f, email: '', password: '', firstName: '', lastName: '', role: 'user' })); fetchClientUsers(clientModal.companyId); }
    else notify(d.message || 'Erreur', true);
  };
  const handleToggleClientUser = async (u: ClientUserRow) => {
    const r = await fetch(`/api/admin/client-users/${u.id}/toggle`, { method: 'PATCH', credentials: 'include' }); const d = await r.json();
    if (d.success) { notify(d.isActive ? 'Utilisateur activé' : 'Utilisateur désactivé'); if (selectedCompany) fetchClientUsers(selectedCompany.id); }
    else notify(d.message || 'Erreur', true);
  };
  const handleResetClientUserPwd = async () => {
    if (clientModal?.type !== 'reset-user-pwd') return;
    const r = await fetch(`/api/admin/client-users/${clientModal.user.id}/reset-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ newPassword: clientNewPwd }) });
    const d = await r.json();
    if (d.success) { notify('Mot de passe réinitialisé'); setClientModal(null); setClientNewPwd(''); }
    else notify(d.message || 'Erreur', true);
  };
  const handleDeleteClientUser = async () => {
    if (clientModal?.type !== 'delete-user') return;
    const r = await fetch(`/api/admin/client-users/${clientModal.user.id}`, { method: 'DELETE', credentials: 'include' }); const d = await r.json();
    if (d.success) { notify('Utilisateur supprimé'); setClientModal(null); if (selectedCompany) fetchClientUsers(selectedCompany.id); }
    else notify(d.message || 'Erreur', true);
  };
  const handleMoveUser = async () => {
    if (clientModal?.type !== 'move-user' || !moveTargetCompanyId) return;
    const r = await fetch(`/api/admin/client-users/${clientModal.user.id}/move`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify({ newCompanyId: moveTargetCompanyId }) });
    const d = await r.json();
    if (d.success) { notify('Utilisateur déplacé'); setClientModal(null); setMoveTargetCompanyId(''); if (selectedCompany) fetchClientUsers(selectedCompany.id); }
    else notify(d.message || 'Erreur', true);
  };

  function notify(msg: string, isError = false) {
    if (isError) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 4000);
  }

  async function saveSubscription(u: UserRow) {
    try {
      await api(`/api/superadmin/users/${u.id}/subscription`, {
        method: 'PATCH',
        body: JSON.stringify({ modulesEnabled: editData.modulesEnabled ?? u.modulesEnabled, tokenQuota: editData.tokenQuota ?? u.tokenQuota, subscriptionLabel: editData.subscriptionLabel ?? u.subscriptionLabel, subscriptionExpiresAt: editData.subscriptionExpiresAt ?? u.subscriptionExpiresAt }),
      });
      notify('Abonnement mis à jour.');
      setEditingId(null);
      fetchUsers();
    } catch (e: any) { notify(e.message, true); }
  }

  async function updateRole(id: number, role: string) {
    try {
      await api(`/api/superadmin/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });
      notify(`Rôle mis à jour : ${role}`);
      fetchUsers();
    } catch (e: any) { notify(e.message, true); }
  }

  async function togglePermission(u: UserRow, permId: string) {
    const current = u.permissions ?? [];
    const updated = current.includes(permId) ? current.filter(p => p !== permId) : [...current, permId];
    try {
      await api(`/api/superadmin/users/${u.id}/role`, { method: 'PATCH', body: JSON.stringify({ permissions: updated }) });
      notify(`Permission "${permId}" ${updated.includes(permId) ? 'ajoutée' : 'retirée'}`);
      fetchUsers();
    } catch (e: any) { notify(e.message, true); }
  }

  async function toggleUser(id: number) {
    try {
      await api(`/api/superadmin/users/${id}/toggle`, { method: 'PATCH', body: '{}' });
      fetchUsers();
    } catch (e: any) { notify(e.message, true); }
  }

  async function deleteUser(id: number, username: string) {
    if (!confirm(`Supprimer définitivement "${username}" ?`)) return;
    try {
      await api(`/api/superadmin/users/${id}`, { method: 'DELETE', body: '{}' });
      notify('Utilisateur supprimé.');
      fetchUsers();
    } catch (e: any) { notify(e.message, true); }
  }

  async function resetTokens(id: number) {
    try {
      await api(`/api/superadmin/users/${id}/reset-tokens`, { method: 'POST', body: '{}' });
      notify('Compteur de tokens réinitialisé.');
      fetchUsers();
      if (tab === 'tokens') fetchTokenStats();
    } catch (e: any) { notify(e.message, true); }
  }

  async function createUser() {
    try {
      await api('/api/superadmin/users', { method: 'POST', body: JSON.stringify(newUser) });
      notify('Utilisateur créé.');
      setShowCreate(false);
      setNewUser({ username: '', password: '', email: '', firstName: '', lastName: '', role: 'user', tokenQuota: 100000, subscriptionLabel: 'Gratuit', modulesEnabled: ALL_MODULES.map(m => m.id) });
      fetchUsers();
    } catch (e: any) { notify(e.message, true); }
  }

  function startEdit(u: UserRow) {
    setEditingId(u.id);
    setEditData({ modulesEnabled: [...(u.modulesEnabled || [])], tokenQuota: u.tokenQuota, subscriptionLabel: u.subscriptionLabel, subscriptionExpiresAt: u.subscriptionExpiresAt });
  }

  function toggleModule(moduleId: string) {
    const current = editData.modulesEnabled || [];
    setEditData(prev => ({
      ...prev,
      modulesEnabled: current.includes(moduleId) ? current.filter(m => m !== moduleId) : [...current, moduleId],
    }));
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'users', label: 'Utilisateurs mc2i', icon: <Users className="w-4 h-4" /> },
    { id: 'subscriptions', label: 'Abonnements & Modules', icon: <Package className="w-4 h-4" /> },
    { id: 'roles', label: 'Gestion des rôles', icon: <Shield className="w-4 h-4" /> },
    { id: 'tokens', label: 'Quotas Tokens', icon: <Zap className="w-4 h-4" /> },
    { id: 'clients', label: 'Portail Clients', icon: <Building2 className="w-4 h-4" /> },
    { id: 'system',   label: 'Santé Système', icon: <Server className="w-4 h-4" /> },
    { id: 'security', label: 'Forteresse',    icon: <ShieldAlert className="w-4 h-4" /> },
  ];

  if (user?.role !== 'superadmin') {
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
        <div className="text-center text-white">
          <Lock className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold mb-2">Accès refusé</h2>
          <p className="text-gray-400 mb-6">Cette page est réservée au super administrateur.</p>
          <button onClick={() => setLocation('/')} className="px-6 py-3 bg-[#0057ff] rounded-lg text-white font-semibold">Retour à l'accueil</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0f1117]/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-amber-400" />
            <span className="text-xl font-bold">Super Admin</span>
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">FYNE</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">{user?.username}</span>
            <button onClick={() => setLocation('/')} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg transition-colors">
              <Home className="w-3.5 h-3.5" /> Accueil
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Notifications */}
        <AnimatePresence>
          {(error || success) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`mb-6 px-4 py-3 rounded-lg flex items-center gap-2 text-sm font-medium ${error ? 'bg-red-500/10 border border-red-500/30 text-red-400' : 'bg-green-500/10 border border-green-500/30 text-green-400'}`}>
              {error ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
              {error || success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-white/5 p-1 rounded-xl w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-[#0057ff] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-[#0057ff] animate-spin" />
          </div>
        ) : (
          <>
            {/* ── TAB USERS ─────────────────────────────────────── */}
            {tab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold">{users.length} utilisateurs</h2>
                  <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-[#0057ff] rounded-lg text-sm font-semibold hover:bg-[#0048d4] transition-colors">
                    <Plus className="w-4 h-4" /> Nouvel utilisateur
                  </button>
                </div>

                {/* Create form */}
                <AnimatePresence>
                  {showCreate && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      className="mb-6 bg-white/5 border border-white/10 rounded-xl p-6">
                      <h3 className="text-sm font-semibold mb-4 text-gray-300">Créer un utilisateur</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                        {[['username','Identifiant *'],['password','Mot de passe *'],['email','Email'],['firstName','Prénom'],['lastName','Nom']].map(([k,l]) => (
                          <div key={k}>
                            <label className="text-xs text-gray-400 mb-1 block">{l}</label>
                            <input type={k === 'password' ? 'password' : 'text'} value={(newUser as any)[k]} onChange={e => setNewUser(p => ({...p, [k]: e.target.value}))}
                              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#0057ff]" />
                          </div>
                        ))}
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Rôle</label>
                          <select value={newUser.role} onChange={e => setNewUser(p => ({...p, role: e.target.value}))}
                            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0057ff]">
                            {ROLES.map(r => <option key={r} value={r} className="bg-[#1a1f2e]">{r}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Abonnement</label>
                          <select value={newUser.subscriptionLabel} onChange={e => setNewUser(p => ({...p, subscriptionLabel: e.target.value}))}
                            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0057ff]">
                            {SUBSCRIPTION_LABELS.map(s => <option key={s} value={s} className="bg-[#1a1f2e]">{s}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block">Quota tokens/mois</label>
                          <input type="number" value={newUser.tokenQuota} onChange={e => setNewUser(p => ({...p, tokenQuota: parseInt(e.target.value)}))}
                            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0057ff]" />
                        </div>
                      </div>
                      <div className="mb-4">
                        <label className="text-xs text-gray-400 mb-2 block">Modules activés</label>
                        <div className="flex flex-wrap gap-2">
                          {ALL_MODULES.map(m => (
                            <button key={m.id} onClick={() => setNewUser(p => ({ ...p, modulesEnabled: p.modulesEnabled.includes(m.id) ? p.modulesEnabled.filter(x => x !== m.id) : [...p.modulesEnabled, m.id] }))}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${newUser.modulesEnabled.includes(m.id) ? 'bg-[#0057ff]/20 border-[#0057ff] text-white' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                              <span className={`w-2 h-2 rounded-full ${m.color}`}></span>{m.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={createUser} className="px-4 py-2 bg-[#0057ff] rounded-lg text-sm font-semibold hover:bg-[#0048d4] transition-colors">Créer</button>
                        <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">Annuler</button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Table */}
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        {['Utilisateur','Email','Rôle','Abonnement','Statut','Actions'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-white">{u.username}</div>
                            <div className="text-xs text-gray-500">{u.firstName} {u.lastName}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{u.email || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[u.role] || 'bg-gray-100 text-gray-700'}`}>
                              {ROLE_ICON[u.role]}{u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-xs text-gray-300 bg-white/10 px-2 py-0.5 rounded-full">{u.subscriptionLabel}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium ${u.isActive ? 'text-green-400' : 'text-red-400'}`}>{u.isActive ? 'Actif' : 'Inactif'}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => toggleUser(u.id)} title={u.isActive ? 'Désactiver' : 'Activer'}
                                className={`p-1.5 rounded-lg border transition-colors ${u.isActive ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>
                                {u.isActive ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                              </button>
                              <button onClick={() => deleteUser(u.id, u.username)} title="Supprimer"
                                className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── TAB SUBSCRIPTIONS ─────────────────────────────── */}
            {tab === 'subscriptions' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold mb-6">Abonnements & Modules par utilisateur</h2>
                {users.map(u => (
                  <div key={u.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{u.username}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[u.role]}`}>
                            {ROLE_ICON[u.role]}{u.role}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">{u.email}</div>
                      </div>
                      <div className="flex gap-2">
                        {editingId === u.id ? (
                          <>
                            <button onClick={() => saveSubscription(u)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00c781] rounded-lg text-xs font-semibold text-white hover:bg-green-500 transition-colors">
                              <Save className="w-3.5 h-3.5" /> Sauvegarder
                            </button>
                            <button onClick={() => setEditingId(null)} className="px-3 py-1.5 bg-white/5 rounded-lg text-xs text-gray-400 hover:text-white transition-colors">
                              Annuler
                            </button>
                          </>
                        ) : (
                          <button onClick={() => startEdit(u)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 rounded-lg text-xs font-medium text-gray-300 hover:text-white hover:bg-white/15 transition-colors">
                            <Edit2 className="w-3.5 h-3.5" /> Modifier
                          </button>
                        )}
                      </div>
                    </div>

                    {editingId === u.id ? (
                      <div className="space-y-4">
                        {/* Modules */}
                        <div>
                          <label className="text-xs text-gray-400 mb-2 block font-medium">Modules activés</label>
                          <div className="flex flex-wrap gap-2">
                            {ALL_MODULES.map(m => (
                              <button key={m.id} onClick={() => toggleModule(m.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${(editData.modulesEnabled || []).includes(m.id) ? 'bg-[#0057ff]/20 border-[#0057ff] text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'}`}>
                                <span className={`w-2 h-2 rounded-full ${m.color}`}></span>{m.label}
                                {(editData.modulesEnabled || []).includes(m.id) && <Check className="w-3 h-3 ml-0.5" />}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Quota + abonnement */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Quota tokens/mois (0 = illimité)</label>
                            <input type="number" value={editData.tokenQuota ?? 0} onChange={e => setEditData(p => ({...p, tokenQuota: parseInt(e.target.value)}))}
                              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0057ff]" />
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Abonnement</label>
                            <select value={editData.subscriptionLabel ?? 'Gratuit'} onChange={e => setEditData(p => ({...p, subscriptionLabel: e.target.value}))}
                              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0057ff]">
                              {SUBSCRIPTION_LABELS.map(s => <option key={s} value={s} className="bg-[#1a1f2e]">{s}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs text-gray-400 mb-1 block">Expiration abonnement</label>
                            <input type="date" value={editData.subscriptionExpiresAt ? editData.subscriptionExpiresAt.substring(0, 10) : ''} onChange={e => setEditData(p => ({...p, subscriptionExpiresAt: e.target.value || null}))}
                              className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0057ff]" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Modules display */}
                        <div className="flex flex-wrap gap-1.5">
                          {ALL_MODULES.map(m => {
                            const active = (u.modulesEnabled || []).includes(m.id);
                            return (
                              <span key={m.id} className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${active ? 'bg-white/10 text-white' : 'bg-white/3 text-gray-600 line-through'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${active ? m.color : 'bg-gray-600'}`}></span>
                                {m.label}
                              </span>
                            );
                          })}
                        </div>
                        {/* Token quota */}
                        <div className="flex items-center gap-6 text-xs text-gray-400">
                          <span className="flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            Quota: <span className="text-white font-medium">{u.tokenQuota === 0 ? 'Illimité' : u.tokenQuota?.toLocaleString()}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            Consommé ce mois: <span className="text-white font-medium">{(u.tokenUsedMonth || 0).toLocaleString()}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            Plan: <span className="text-amber-400 font-medium">{u.subscriptionLabel}</span>
                          </span>
                          {u.subscriptionExpiresAt && (
                            <span className="flex items-center gap-1.5">
                              Expire: <span className="text-red-400 font-medium">{new Date(u.subscriptionExpiresAt).toLocaleDateString('fr-FR')}</span>
                            </span>
                          )}
                        </div>
                        {/* Token bar */}
                        {u.tokenQuota && u.tokenQuota > 0 && (
                          <div className="w-full bg-white/10 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full transition-all ${(u.tokenUsedMonth / u.tokenQuota) > 0.85 ? 'bg-red-500' : (u.tokenUsedMonth / u.tokenQuota) > 0.6 ? 'bg-amber-500' : 'bg-[#00c781]'}`}
                              style={{ width: `${Math.min(100, ((u.tokenUsedMonth || 0) / u.tokenQuota) * 100)}%` }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* ── TAB ROLES ─────────────────────────────────────── */}
            {tab === 'roles' && (
              <div>
                <h2 className="text-lg font-bold mb-6">Gestion des rôles</h2>
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-white/5 border-b border-white/10">
                      <tr>
                        {['Utilisateur','Email','Rôle actuel','Changer le rôle'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {users.map(u => (
                        <tr key={u.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-white">{u.username}</div>
                          </td>
                          <td className="px-4 py-3 text-gray-400 text-xs">{u.email || '—'}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_BADGE[u.role]}`}>
                              {ROLE_ICON[u.role]}{u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              {ROLES.filter(r => r !== u.role).map(r => (
                                <button key={r} onClick={() => updateRole(u.id, r)}
                                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                                    ${r === 'superadmin' ? 'border-amber-500/40 text-amber-400 hover:bg-amber-500/10' : r === 'admin' ? 'border-blue-500/40 text-blue-400 hover:bg-blue-500/10' : r === 'evaluateur' ? 'border-green-500/40 text-green-400 hover:bg-green-500/10' : 'border-white/20 text-gray-400 hover:bg-white/10'}`}>
                                  {ROLE_ICON[r]} → {r}
                                </button>
                              ))}
                            </div>
                            {/* Permissions cumulables */}
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {ALL_PERMISSIONS.map(p => {
                                const has = (u.permissions ?? []).includes(p.id);
                                return (
                                  <button key={p.id} onClick={() => togglePermission(u, p.id)}
                                    title={p.desc}
                                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${has ? 'border-green-500/60 text-green-300 bg-green-500/15' : 'border-white/10 text-gray-600 hover:border-green-500/30 hover:text-green-500/70'}`}>
                                    <UserCheck className="w-2.5 h-2.5" />
                                    {p.label}
                                    {has ? ' ✓' : ' +'}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Légende des rôles */}
                <div className="mt-6 grid grid-cols-3 gap-4">
                  {[
                    { role: 'user', desc: 'Accès aux modules activés dans son abonnement. Pas d\'accès admin.', color: 'border-gray-500/30' },
                    { role: 'evaluateur', desc: 'Accès direct à l\'espace évaluateur /evaluation sans saisir d\'identifiant. Crée automatiquement un compte évaluateur lié à son username.', color: 'border-green-500/30' },
                    { role: 'admin', desc: 'Gestion des utilisateurs, statistiques, LLM, SSO. Pas d\'accès super admin.', color: 'border-blue-500/30' },
                    { role: 'superadmin', desc: 'Accès total : rôles, abonnements, modules, quotas, tout. Vous.', color: 'border-amber-500/30' },
                  ].map(({ role, desc, color }) => (
                    <div key={role} className={`bg-white/5 border ${color} rounded-xl p-4`}>
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2 ${ROLE_BADGE[role]}`}>
                        {ROLE_ICON[role]}{role}
                      </div>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB TOKENS ─────────────────────────────────────── */}
            {tab === 'tokens' && (
              <div>
                <h2 className="text-lg font-bold mb-6">Quotas & Consommation de tokens</h2>
                <div className="space-y-3">
                  {(tokenStats.length ? tokenStats : users).map((u: any) => {
                    const quota = Number(u.token_quota ?? u.tokenQuota ?? 0);
                    const used = Number(u.tokens_this_month ?? u.tokenUsedMonth ?? 0);
                    const pct = quota > 0 ? Math.min(100, (used / quota) * 100) : 0;
                    return (
                      <div key={u.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-40 shrink-0">
                          <div className="font-medium text-sm text-white">{u.username}</div>
                          <div className="text-xs text-gray-500">{u.subscription_label ?? u.subscriptionLabel}</div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>{used.toLocaleString()} tokens utilisés</span>
                            <span>{quota === 0 ? 'Illimité' : `${quota.toLocaleString()} max`}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div className={`h-2 rounded-full transition-all ${pct > 85 ? 'bg-red-500' : pct > 60 ? 'bg-amber-500' : 'bg-[#00c781]'}`}
                              style={{ width: `${pct}%` }} />
                          </div>
                          {pct > 85 && <div className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Quota presque atteint</div>}
                        </div>
                        <div className="shrink-0 flex gap-2 items-center">
                          <div className="text-right mr-2">
                            <div className="text-xs text-gray-500">Quota mensuel</div>
                            <div className="text-sm font-bold text-white">{quota === 0 ? '∞' : quota.toLocaleString()}</div>
                          </div>
                          <button onClick={() => resetTokens(u.id)} title="Remettre à zéro"
                            className="p-2 bg-white/10 rounded-lg text-gray-400 hover:text-white hover:bg-white/15 transition-colors" >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* ── TAB CLIENTS ─────────────────────────────────────── */}
            {tab === 'clients' && (
              <div className="flex gap-6 items-start">

                {/* Liste entreprises */}
                <div className="w-72 shrink-0">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold flex items-center gap-2"><Building2 className="w-5 h-5 text-amber-400" /> Entreprises</h2>
                    <button onClick={() => { setClientModal({ type: 'create-company' }); setClientForm(f => ({ ...f, companyName: '' })); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0057ff] rounded-lg text-xs font-semibold hover:bg-[#0048d4] transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Nouvelle
                    </button>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    {companiesLoading ? (
                      <div className="py-10 flex justify-center"><RefreshCw className="w-5 h-5 animate-spin text-gray-500" /></div>
                    ) : companies.length === 0 ? (
                      <div className="py-10 text-center text-sm text-gray-500">Aucune entreprise</div>
                    ) : companies.map((c, i) => {
                      const active = selectedCompany?.id === c.id;
                      return (
                        <div key={c.id} onClick={() => { setSelectedCompany(c); fetchClientUsers(c.id); setEditingCompanyConfig({ modules: c.modules_enabled ?? [], quota: c.token_quota ?? 0 }); }}
                          className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors border-l-2 ${active ? 'bg-[#0057ff]/10 border-[#0057ff]' : 'border-transparent hover:bg-white/5'} ${i > 0 ? 'border-t border-t-white/5' : ''}`}>
                          <div>
                            <div className="text-sm font-medium text-white">{c.name}</div>
                            <div className="text-xs text-gray-500">{c.total_users} utilisateur{Number(c.total_users) > 1 ? 's' : ''}</div>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`text-xs font-medium ${c.is_active ? 'text-green-400' : 'text-gray-500'}`}>{c.is_active ? '●' : '○'}</span>
                            <button onClick={e => { e.stopPropagation(); handleToggleCompany(c); }} className="p-1 rounded text-gray-500 hover:text-white transition-colors" title={c.is_active ? 'Désactiver' : 'Activer'}>
                              {c.is_active ? <ToggleRight className="w-4 h-4 text-green-400" /> : <ToggleLeft className="w-4 h-4" />}
                            </button>
                            <button onClick={e => { e.stopPropagation(); setClientModal({ type: 'delete-company', company: c }); }} className="p-1 rounded text-gray-500 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Utilisateurs de l'entreprise */}
                <div className="flex-1 min-w-0">
                  {!selectedCompany ? (
                    <div className="py-20 text-center text-gray-500">
                      <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                      <div className="text-sm">Sélectionnez une entreprise</div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                          <UserCog className="w-5 h-5 text-amber-400" /> {selectedCompany.name}
                          <span className="text-sm font-normal text-gray-400">— {selectedCompany.total_users} utilisateur{Number(selectedCompany.total_users) > 1 ? 's' : ''}</span>
                        </h2>
                        <button onClick={() => { setClientModal({ type: 'create-user', companyId: selectedCompany.id, companyName: selectedCompany.name }); setClientForm(f => ({ ...f, email: '', password: '', firstName: '', lastName: '', role: 'user' })); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0057ff] rounded-lg text-xs font-semibold hover:bg-[#0048d4] transition-colors">
                          <Plus className="w-3.5 h-3.5" /> Nouvel utilisateur
                        </button>
                      </div>

                      {/* ── Panneau configuration entreprise ── */}
                      {editingCompanyConfig && (
                        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-4">
                          <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                            <Settings className="w-4 h-4 text-amber-400" /> Configuration modules &amp; quota
                          </h3>
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-2">Modules activés</p>
                            <div className="flex flex-wrap gap-2">
                              {CLIENT_MODULES.map(m => {
                                const active = editingCompanyConfig.modules.includes(m.id);
                                return (
                                  <button key={m.id}
                                    onClick={() => setEditingCompanyConfig(prev => prev ? {
                                      ...prev,
                                      modules: active ? prev.modules.filter(x => x !== m.id) : [...prev.modules, m.id],
                                    } : prev)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${active ? 'bg-[#0057ff]/20 border-[#0057ff] text-[#4d8bff]' : 'bg-white/5 border-white/10 text-gray-500 hover:text-gray-300'}`}>
                                    {active && <Check className="w-3 h-3 inline mr-1" />}{m.label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Quota tokens mensuel</p>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number" min="0"
                                  value={editingCompanyConfig.quota}
                                  onChange={e => setEditingCompanyConfig(prev => prev ? { ...prev, quota: Number(e.target.value) } : prev)}
                                  className="w-40 bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#0057ff]"
                                />
                                <span className="text-xs text-gray-500">tokens (0 = illimité)</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              Utilisé ce mois : <span className="text-white font-medium">{(selectedCompany.token_used_month ?? 0).toLocaleString()}</span> / {editingCompanyConfig.quota === 0 ? '∞' : editingCompanyConfig.quota.toLocaleString()}
                            </div>
                            <button onClick={handleSaveCompanyConfig} disabled={savingConfig}
                              className="ml-auto flex items-center gap-1.5 px-4 py-1.5 bg-[#0057ff] rounded-lg text-xs font-semibold hover:bg-[#0048d4] disabled:opacity-50 transition-colors">
                              {savingConfig ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Sauvegarder
                            </button>
                          </div>
                        </div>
                      )}
                      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                        {clientUsersLoading ? (
                          <div className="py-10 flex justify-center"><RefreshCw className="w-5 h-5 animate-spin text-gray-500" /></div>
                        ) : clientUsers.length === 0 ? (
                          <div className="py-10 text-center text-sm text-gray-500">Aucun utilisateur</div>
                        ) : (
                          <table className="w-full text-sm">
                            <thead className="bg-white/5 border-b border-white/10">
                              <tr>{['Utilisateur', 'Rôle', 'Statut', 'Score / Niveau', 'Dernière connexion', ''].map(h => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide">{h}</th>
                              ))}</tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                              {clientUsers.map(u => (
                                <tr key={u.id} className={`hover:bg-white/5 transition-colors ${!u.is_active ? 'opacity-50' : ''}`}>
                                  <td className="px-4 py-3">
                                    <div className="font-medium text-white">{u.email}</div>
                                    {(u.first_name || u.last_name) && <div className="text-xs text-gray-500">{[u.first_name, u.last_name].filter(Boolean).join(' ')}</div>}
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-gray-300'}`}>{u.role}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`text-xs font-medium ${u.is_active ? 'text-green-400' : 'text-red-400'}`}>{u.is_active ? 'Actif' : 'Inactif'}</span>
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-400">
                                    <div className="text-white font-medium">{u.score} pts</div>
                                    <div>{u.niveau}</div>
                                  </td>
                                  <td className="px-4 py-3 text-xs text-gray-500">{u.last_login ? new Date(u.last_login).toLocaleDateString('fr-FR') : '—'}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center gap-1.5 justify-end">
                                      <button onClick={() => handleToggleClientUser(u)} title={u.is_active ? 'Désactiver' : 'Activer'}
                                        className={`p-1.5 rounded-lg border transition-colors ${u.is_active ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-green-500/30 text-green-400 hover:bg-green-500/10'}`}>
                                        {u.is_active ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                                      </button>
                                      <button onClick={() => { setClientModal({ type: 'reset-user-pwd', user: u }); setClientNewPwd(''); }} title="Réinitialiser mot de passe"
                                        className="p-1.5 rounded-lg border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                                        <RefreshCw className="w-3.5 h-3.5" />
                                      </button>
                                      <button onClick={() => { setClientModal({ type: 'move-user', user: u }); setMoveTargetCompanyId(''); }} title="Déplacer vers une autre organisation"
                                        className="p-1.5 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-colors">
                                        <UserCog className="w-3.5 h-3.5" />
                                      </button>
                                      <button onClick={() => setClientModal({ type: 'delete-user', user: u })} title="Supprimer"
                                        className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
            {/* ── TAB SYSTEM ─────────────────────────────────────── */}
            {tab === 'system' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <Server className="w-5 h-5 text-[#0057ff]" /> EC2 — Paris · eu-west-3
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                      {cpuHistory.length > 0
                        ? <><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" /> Flux live actif · mise à jour toutes les 3s</>
                        : systemLoading ? 'Chargement…' : 'Connexion…'
                      }
                      {systemHealth && <span>· {systemHealth.uptime?.replace(/.*up\s+/, '').split(',').slice(0,2).join(',').trim()}</span>}
                    </p>
                  </div>
                  <button onClick={fetchSystemHealth} disabled={systemLoading}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/8 border border-white/10 rounded-lg text-xs font-medium text-gray-400 hover:text-white hover:bg-white/12 disabled:opacity-40 transition-colors">
                    <RefreshCw className={`w-3.5 h-3.5 ${systemLoading ? 'animate-spin' : ''}`} />
                    Rafraîchir infos statiques
                  </button>
                </div>

                {(() => {
                  // ── Sparkline SVG inline ──────────────────────────────────────────
                  const Sparkline = ({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) => {
                    if (data.length < 2) return <div style={{ height }} />;
                    const w = 100, h = height, max = Math.max(...data, 10);
                    const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - (v / max) * h}`).join(' ');
                    const area = `0,${h} ${pts} ${w},${h}`;
                    return (
                      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ width: '100%', height }}>
                        <defs>
                          <linearGradient id={`sg-${color.replace('#','')}`} x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                          </linearGradient>
                        </defs>
                        <polygon points={area} fill={`url(#sg-${color.replace('#','')})`} />
                        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
                      </svg>
                    );
                  };

                  // ── Gauge circulaire ─────────────────────────────────────────────
                  const CircleGauge = ({ pct, color, size = 72 }: { pct: number; color: string; size?: number }) => {
                    const r = 28, circ = 2 * Math.PI * r;
                    const dash = (pct / 100) * circ;
                    return (
                      <svg width={size} height={size} viewBox="0 0 64 64" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6"
                          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                          style={{ transition: 'stroke-dasharray 0.6s ease' }} />
                      </svg>
                    );
                  };

                  const cpuUsed   = liveMetrics?.cpu ?? (systemHealth ? 100 - (systemHealth.cpu?.idle ?? 100) : 0);
                  const memPct    = liveMetrics?.mem ?? (systemHealth?.memory.usedPct ?? 0);
                  const diskPct   = systemHealth?.disk.usedPct ?? 0;
                  const load1     = liveMetrics?.load1 ?? 0;
                  const load5     = liveMetrics?.load5 ?? 0;
                  const isLive    = cpuHistory.length > 0;

                  const metricColor = (v: number, warn: number, crit: number) =>
                    v >= crit ? '#ef4444' : v >= warn ? '#f59e0b' : '#10b981';
                  const metricLabel = (v: number, warn: number, crit: number) =>
                    v >= crit ? 'CRITIQUE' : v >= warn ? 'ATTENTION' : 'OK';

                  const cpuColor  = metricColor(cpuUsed, 50, 80);
                  const memColor  = metricColor(memPct, 65, 85);
                  const diskColor = metricColor(diskPct, 60, 80);

                  return (
                    <div className="space-y-4">

                      {/* ── Bandeau live CPU + RAM ── */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#10b981] animate-pulse' : 'bg-gray-600'}`} />
                            <span className="text-sm font-semibold text-gray-300">
                              {isLive ? 'Temps réel — mise à jour toutes les 3s' : 'En attente du flux…'}
                            </span>
                            {isLive && liveMetrics && (
                              <span className="text-xs text-gray-500 font-mono">
                                load avg: {load1.toFixed(2)} / {load5.toFixed(2)}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3 text-xs text-gray-600 font-mono">
                            <span style={{ color: '#0057ff' }}>━ CPU</span>
                            <span style={{ color: '#8b5cf6' }}>━ RAM</span>
                          </div>
                        </div>

                        {/* Sparklines superposées */}
                        <div className="relative">
                          <Sparkline data={cpuHistory.map(p => p.used)} color="#0057ff" height={56} />
                          <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.6 }}>
                            <Sparkline data={cpuHistory.map(p => p.mem)} color="#8b5cf6" height={56} />
                          </div>
                          {/* Labels Y */}
                          <div className="absolute right-0 top-0 flex flex-col justify-between h-full text-right pointer-events-none" style={{ fontSize: 9, color: '#475569' }}>
                            <span>100%</span><span>50%</span><span>0%</span>
                          </div>
                        </div>

                        {/* Valeurs instantanées */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          {[
                            { label: 'CPU utilisé', value: cpuUsed, color: cpuColor, unit: '%', detail: `User ${liveMetrics ? liveMetrics.cpu.toFixed(1) : (systemHealth?.cpu.user ?? 0)}%` },
                            { label: 'RAM utilisée', value: memPct, color: memColor, unit: '%', detail: systemHealth ? `${systemHealth.memory.used} / ${systemHealth.memory.total} Mo` : '—' },
                          ].map(({ label, value, color, unit, detail }) => (
                            <div key={label} className="flex items-center gap-3">
                              <CircleGauge pct={value} color={color} />
                              <div>
                                <div className="text-xs text-gray-500">{label}</div>
                                <div className="text-2xl font-black leading-none" style={{ color }}>{value.toFixed(0)}{unit}</div>
                                <div className="text-xs text-gray-600 font-mono mt-0.5">{detail}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ── Jauges statiques : Disque + infos système ── */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Disque */}
                        {systemHealth && (() => {
                          const pct = diskPct;
                          return (
                            <div className={`bg-white/5 border rounded-xl p-5 ${pct > 80 ? 'border-red-500/30' : pct > 60 ? 'border-amber-500/30' : 'border-white/10'}`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-300">
                                  <HardDrive className="w-4 h-4" style={{ color: diskColor }} /> Disque SSD
                                </div>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${diskColor}18`, color: diskColor }}>
                                  {metricLabel(pct, 60, 80)}
                                </span>
                              </div>
                              <div className="flex items-end gap-3 mb-3">
                                <div className="text-4xl font-black" style={{ color: diskColor }}>{pct}%</div>
                                <div className="text-xs text-gray-500 pb-1 font-mono">{systemHealth.disk.used} / {systemHealth.disk.total}</div>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-1.5 mb-1">
                                <div className="h-1.5 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: diskColor }} />
                              </div>
                              <div className="flex justify-between text-xs text-gray-600 mt-1">
                                <span>{systemHealth.disk.avail} libres</span>
                                <span className="font-mono">Nettoyage auto dim. 3h</span>
                              </div>

                              {/* Détail stockage */}
                              <div className="mt-4 space-y-1.5 border-t border-white/5 pt-3">
                                {[
                                  { label: 'node_modules', value: '~923 Mo', note: 'runtime' },
                                  { label: 'dist (build)', value: '~18 Mo', note: '' },
                                  { label: 'Cache npm', value: systemHealth.npmCache, note: 'purgé auto' },
                                  { label: 'Logs journald', value: '~25 Mo', note: 'max 20 Mo' },
                                ].map(({ label, value, note }) => (
                                  <div key={label} className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">{label}</span>
                                    <span className="font-mono text-gray-400">{value} {note && <span className="text-gray-600">· {note}</span>}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                        {/* Infos système */}
                        <div className="space-y-3">
                          {/* App status */}
                          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Activity className="w-4 h-4 text-[#10b981]" />
                              <span className="text-sm font-semibold text-gray-300">Application</span>
                              <div className="ml-auto flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                                <span className="text-xs text-[#10b981] font-medium">ONLINE</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs"><span className="text-gray-500">Processus</span><span className="font-mono text-gray-300">PM2 · Node.js 20</span></div>
                              <div className="flex justify-between text-xs"><span className="text-gray-500">Uptime</span><span className="font-mono text-gray-300 truncate max-w-[200px]">{systemHealth?.uptime?.replace(/.*up\s+/, '') ?? '—'}</span></div>
                              <div className="flex justify-between text-xs"><span className="text-gray-500">Instance</span><span className="font-mono text-gray-300">i-0e9e693a42f252889</span></div>
                              <div className="flex justify-between text-xs"><span className="text-gray-500">Région</span><span className="font-mono text-gray-300">eu-west-3 (Paris)</span></div>
                            </div>
                          </div>

                          {/* Docker */}
                          <DockerPanel systemHealth={systemHealth} systemActionLoading={systemActionLoading} runSystemAction={runSystemAction} />
                        </div>
                      </div>

                      {/* ── Actions ── */}
                      <div className="bg-white/5 border border-white/10 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-gray-300 mb-4 flex items-center gap-2">
                          <Settings className="w-4 h-4 text-amber-400" /> Actions de maintenance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {[
                            {
                              action: 'docker-prune',
                              label: 'Nettoyer Docker',
                              desc: 'Supprime images et build cache inutilisés',
                              icon: <Trash2 className="w-4 h-4" />,
                              color: '#f59e0b',
                              risk: null,
                            },
                            {
                              action: 'clear-npm-cache',
                              label: 'Vider cache npm',
                              desc: 'Supprime /root/.npm/_cacache',
                              icon: <HardDrive className="w-4 h-4" />,
                              color: '#0057ff',
                              risk: null,
                            },
                            {
                              action: 'restart-app',
                              label: 'Redémarrer l\'app',
                              desc: 'PM2 relance Node.js — 2-5s de downtime',
                              icon: <RefreshCw className="w-4 h-4" />,
                              color: '#ef4444',
                              risk: '⚠ downtime',
                            },
                          ].map(({ action, label, desc, icon, color, risk }) => (
                            <button
                              key={action}
                              onClick={() => runSystemAction(action, label)}
                              disabled={systemActionLoading !== null}
                              className="flex flex-col gap-1.5 p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:border-white/25 disabled:opacity-40 transition-all"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 font-semibold text-sm" style={{ color }}>
                                  {systemActionLoading === action ? <RefreshCw className="w-4 h-4 animate-spin" /> : icon}
                                  {label}
                                </div>
                                {risk && <span className="text-xs font-medium px-1.5 py-0.5 rounded" style={{ background: '#ef444420', color: '#ef4444' }}>{risk}</span>}
                              </div>
                              <p className="text-xs text-gray-500">{desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      {!systemHealth && !isLive && (
                        <div className="text-center py-12 text-gray-500">
                          <Server className="w-10 h-10 mx-auto mb-3 text-gray-700" />
                          <p className="text-sm">Connexion au flux de métriques…</p>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </>
        )}

        {/* ── TAB FORTERESSE ── */}
        {tab === 'security' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-red-400" /> Forteresse</h2>
                <p className="text-sm text-gray-500 mt-1">Surveillance des accès · Tentatives d'intrusion · Journal de sécurité</p>
              </div>
              <button onClick={fetchSecurity} className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                <RefreshCw className="w-3 h-3" /> Actualiser
              </button>
            </div>

            {secLoading ? (
              <div className="flex items-center justify-center py-20 text-gray-500">Chargement...</div>
            ) : (
              <>
                {/* KPI */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-white/5 border border-red-500/20 rounded-xl p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tentatives échouées · 24h</div>
                    <div className={`text-4xl font-black ${secStats && secStats.failedLogins24h > 5 ? 'text-red-400' : 'text-white'}`}>{secStats?.failedLogins24h ?? 0}</div>
                    {secStats && secStats.failedLogins24h > 5 && <div className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Activité suspecte</div>}
                  </div>
                  <div className="bg-white/5 border border-amber-500/20 rounded-xl p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Tentatives échouées · 7 jours</div>
                    <div className="text-4xl font-black text-amber-400">{secStats?.failedLogins7d ?? 0}</div>
                  </div>
                  <div className="bg-white/5 border border-emerald-500/20 rounded-xl p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">Connexions réussies · 24h</div>
                    <div className="text-4xl font-black text-emerald-400">{secStats?.successLogins24h ?? 0}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Top IPs */}
                  <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-3 h-3" /> IPs suspectes · 7 jours
                    </div>
                    {!secStats?.topIps?.length ? (
                      <div className="px-4 py-6 text-sm text-gray-600 text-center">Aucune IP suspecte</div>
                    ) : secStats.topIps.map((row, i) => (
                      <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 hover:bg-white/5">
                        <span className="font-mono text-sm text-gray-300">{row.ip || '—'}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${Number(row.cnt) > 10 ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
                          {row.cnt} tentatives
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Derniers échecs */}
                  <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">Dernières tentatives échouées</div>
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-white/5">
                        <th className="px-4 py-2 text-left text-gray-500 font-medium">Utilisateur</th>
                        <th className="px-4 py-2 text-left text-gray-500 font-medium">IP</th>
                        <th className="px-4 py-2 text-left text-gray-500 font-medium">Raison</th>
                        <th className="px-4 py-2 text-left text-gray-500 font-medium">Date</th>
                      </tr></thead>
                      <tbody>
                        {!secStats?.recentFails?.length ? (
                          <tr><td colSpan={4} className="px-4 py-6 text-center text-gray-600">Aucune tentative récente</td></tr>
                        ) : secStats.recentFails.map((f, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-2 font-mono text-gray-300">{f.username || '—'}</td>
                            <td className="px-4 py-2 font-mono text-gray-400">{f.ip || '—'}</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-medium">
                                {f.details?.reason === 'wrong_password' ? 'Mauvais mdp' : f.details?.reason === 'user_not_found' ? 'Inconnu' : f.details?.reason || '—'}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-gray-600">{new Date(f.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Journal complet */}
                <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">Journal des événements · 7 derniers jours</div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead><tr className="border-b border-white/5">
                        <th className="px-4 py-2 text-left text-gray-500 font-medium">Type</th>
                        <th className="px-4 py-2 text-left text-gray-500 font-medium">Sévérité</th>
                        <th className="px-4 py-2 text-left text-gray-500 font-medium">Utilisateur</th>
                        <th className="px-4 py-2 text-left text-gray-500 font-medium">IP</th>
                        <th className="px-4 py-2 text-left text-gray-500 font-medium">Date</th>
                      </tr></thead>
                      <tbody>
                        {secEvents.length === 0 ? (
                          <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-600">Aucun événement enregistré — les prochaines connexions apparaîtront ici</td></tr>
                        ) : secEvents.slice(0, 100).map(ev => (
                          <tr key={ev.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                {ev.type === 'login_failed' ? <AlertTriangle className="w-3 h-3 text-amber-400" /> : <LogIn className="w-3 h-3 text-emerald-400" />}
                                <span className="font-mono text-gray-300">{ev.type}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-0.5 rounded-full font-medium ${ev.severity === 'warning' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                {ev.severity}
                              </span>
                            </td>
                            <td className="px-4 py-2 font-mono text-gray-300">{ev.username || '—'}</td>
                            <td className="px-4 py-2 font-mono text-gray-400">{ev.ip || '—'}</td>
                            <td className="px-4 py-2 text-gray-600">{new Date(ev.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── MODALS CLIENTS ── */}
        <AnimatePresence>
          {clientModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setClientModal(null)}>
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#1a1f2e] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                onClick={e => e.stopPropagation()}>

                {clientModal.type === 'create-company' && (
                  <>
                    <h3 className="text-base font-bold mb-4 flex items-center gap-2"><Building2 className="w-4 h-4 text-amber-400" /> Nouvelle entreprise</h3>
                    <label className="text-xs text-gray-400 mb-1 block">Nom de l'entreprise *</label>
                    <input value={clientForm.companyName} onChange={e => setClientForm(f => ({ ...f, companyName: e.target.value }))} placeholder="Ex: BNP Paribas"
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#0057ff] mb-4" />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setClientModal(null)} className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">Annuler</button>
                      <button onClick={handleCreateCompany} disabled={!clientForm.companyName.trim()} className="px-4 py-2 bg-[#0057ff] rounded-lg text-sm font-semibold hover:bg-[#0048d4] disabled:opacity-40 transition-colors">Créer</button>
                    </div>
                  </>
                )}

                {clientModal.type === 'delete-company' && (
                  <>
                    <h3 className="text-base font-bold mb-3 text-red-400">Supprimer l'entreprise</h3>
                    <p className="text-sm text-gray-400 mb-5">Supprimer <span className="text-white font-semibold">{clientModal.company.name}</span> et tous ses utilisateurs ? Cette action est irréversible.</p>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setClientModal(null)} className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">Annuler</button>
                      <button onClick={handleDeleteCompany} className="px-4 py-2 bg-red-500 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">Supprimer</button>
                    </div>
                  </>
                )}

                {clientModal.type === 'create-user' && (
                  <>
                    <h3 className="text-base font-bold mb-1 flex items-center gap-2"><UserCog className="w-4 h-4 text-amber-400" /> Nouvel utilisateur</h3>
                    <p className="text-xs text-gray-500 mb-4">{clientModal.companyName}</p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {([['email', 'Email *', 'email'], ['password', 'Mot de passe *', 'password'], ['firstName', 'Prénom', 'text'], ['lastName', 'Nom', 'text']] as [string, string, string][]).map(([k, l, t]) => (
                        <div key={k} className={k === 'email' || k === 'password' ? 'col-span-2' : ''}>
                          <label className="text-xs text-gray-400 mb-1 block">{l}</label>
                          <input type={t} value={(clientForm as any)[k]} onChange={e => setClientForm(f => ({ ...f, [k]: e.target.value }))}
                            className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#0057ff]" />
                        </div>
                      ))}
                      <div>
                        <label className="text-xs text-gray-400 mb-1 block">Rôle</label>
                        <select value={clientForm.role} onChange={e => setClientForm(f => ({ ...f, role: e.target.value }))}
                          className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0057ff]">
                          <option value="user" className="bg-[#1a1f2e]">Utilisateur</option>
                          <option value="admin" className="bg-[#1a1f2e]">Admin client</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setClientModal(null)} className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">Annuler</button>
                      <button onClick={handleCreateClientUser} disabled={!clientForm.email || !clientForm.password} className="px-4 py-2 bg-[#0057ff] rounded-lg text-sm font-semibold hover:bg-[#0048d4] disabled:opacity-40 transition-colors">Créer</button>
                    </div>
                  </>
                )}

                {clientModal.type === 'reset-user-pwd' && (
                  <>
                    <h3 className="text-base font-bold mb-3">Réinitialiser le mot de passe</h3>
                    <p className="text-xs text-gray-400 mb-3">{clientModal.user.email}</p>
                    <div className="relative mb-4">
                      <input type={showClientPwd ? 'text' : 'password'} value={clientNewPwd} onChange={e => setClientNewPwd(e.target.value)} placeholder="Nouveau mot de passe"
                        className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white pr-10 focus:outline-none focus:border-[#0057ff]" />
                      <button onClick={() => setShowClientPwd(p => !p)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                        {showClientPwd ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setClientModal(null)} className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">Annuler</button>
                      <button onClick={handleResetClientUserPwd} disabled={!clientNewPwd} className="px-4 py-2 bg-[#0057ff] rounded-lg text-sm font-semibold hover:bg-[#0048d4] disabled:opacity-40 transition-colors">Réinitialiser</button>
                    </div>
                  </>
                )}

                {clientModal.type === 'move-user' && (
                  <>
                    <h3 className="text-base font-bold mb-1 flex items-center gap-2"><UserCog className="w-4 h-4 text-amber-400" /> Déplacer l'utilisateur</h3>
                    <p className="text-sm text-gray-400 mb-4"><span className="text-white font-medium">{clientModal.user.email}</span> — actuellement dans <span className="text-white font-medium">{selectedCompany?.name}</span></p>
                    <label className="block text-xs text-gray-400 mb-1 font-medium">Nouvelle organisation</label>
                    <select
                      value={moveTargetCompanyId}
                      onChange={e => setMoveTargetCompanyId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#0057ff] mb-4"
                    >
                      <option value="">— Sélectionner une organisation —</option>
                      {companies.filter(c => c.id !== selectedCompany?.id).map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setClientModal(null)} className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">Annuler</button>
                      <button onClick={handleMoveUser} disabled={!moveTargetCompanyId} className="px-4 py-2 bg-amber-500 rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-40 transition-colors">Déplacer</button>
                    </div>
                  </>
                )}

                {clientModal.type === 'delete-user' && (
                  <>
                    <h3 className="text-base font-bold mb-3 text-red-400">Supprimer l'utilisateur</h3>
                    <p className="text-sm text-gray-400 mb-5">Supprimer <span className="text-white font-semibold">{clientModal.user.email}</span> ? Cette action est irréversible.</p>
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setClientModal(null)} className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-400 hover:text-white transition-colors">Annuler</button>
                      <button onClick={handleDeleteClientUser} className="px-4 py-2 bg-red-500 rounded-lg text-sm font-semibold hover:bg-red-600 transition-colors">Supprimer</button>
                    </div>
                  </>
                )}

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
