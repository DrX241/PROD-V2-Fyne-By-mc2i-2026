import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

const BLUE = '#246f9f';
const PINK = '#e5007e';

interface CompanyInfo {
  token_quota: number | null;
  token_used_month: number | null;
  modules_enabled: string[] | null;
}

const MODULE_LABELS: Record<string, string> = {
  'ia': 'IA', 'data': 'DA', 'cyber': 'CY', 'rgpd': 'RG',
  'pe': 'PE', 'evaluation': 'EV', 'strategy': 'ST',
  'amoa': 'AM', 'formation-data': 'FD', 'playground': 'PG',
};

function getModuleInitials(key: string): string {
  return MODULE_LABELS[key] ?? key.slice(0, 2).toUpperCase();
}

interface UserRow {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  is_active: boolean;
  score: number;
  niveau: string;
  token_quota: number | null;
  token_used_month: number | null;
  last_login: string | null;
  modules_enabled: string[] | null;
}

export default function ClientGestionPage() {
  const [, setLocation] = useLocation();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editQuotaId, setEditQuotaId] = useState<number | null>(null);
  const [editQuotaValue, setEditQuotaValue] = useState(0);
  const [companyName, setCompanyName] = useState('');
  const [editModulesId, setEditModulesId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/client/auth/check', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated) { setLocation('/portail-client/login'); return; }
        if (d.user.role !== 'admin') { setLocation('/portail-client/accueil'); return; }
        setCompanyName(d.user.companyName || '');
        fetchUsers();
      })
      .catch(() => setLocation('/portail-client/login'));
  }, []);

  function fetchUsers() {
    setLoading(true);
    fetch('/api/client/admin/users', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setUsers(d.users);
          setCompany(d.company);
        } else {
          setError(d.message || 'Erreur lors du chargement');
        }
      })
      .catch(() => setError('Erreur réseau'))
      .finally(() => setLoading(false));
  }

  function notify(msg: string, isErr = false) {
    if (isErr) setError(msg); else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 4000);
  }

  async function handleToggle(u: UserRow) {
    const r = await fetch(`/api/client/admin/users/${u.id}/toggle`, { method: 'PATCH', credentials: 'include' });
    const d = await r.json();
    if (d.success) { notify(d.isActive ? 'Utilisateur activé' : 'Utilisateur désactivé'); fetchUsers(); }
    else notify(d.message || 'Erreur', true);
  }

  function startEditQuota(u: UserRow) {
    setEditQuotaId(u.id);
    setEditQuotaValue(u.token_quota ?? 0);
  }

  async function saveQuota(userId: number) {
    const r = await fetch(`/api/client/admin/users/${userId}/quota`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token_quota: editQuotaValue }),
    });
    const d = await r.json();
    if (d.success) { notify('Quota mis à jour'); setEditQuotaId(null); fetchUsers(); }
    else notify(d.message || 'Erreur', true);
  }

  async function toggleModule(u: UserRow, moduleKey: string) {
    const companyModules = company?.modules_enabled ?? [];
    const current: string[] = u.modules_enabled ?? companyModules;
    const updated = current.includes(moduleKey)
      ? current.filter(m => m !== moduleKey)
      : [...current, moduleKey];
    const r = await fetch(`/api/client/admin/users/${u.id}/modules`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ modules_enabled: updated }),
    });
    const d = await r.json();
    if (d.success) { fetchUsers(); }
    else notify(d.message || 'Erreur modules', true);
  }

  const cardStyle: React.CSSProperties = {
    background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', border: '1px solid #e8edf2',
  };

  const badgeStyle = (active: boolean): React.CSSProperties => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
    background: active ? '#dcfce7' : '#fee2e2', color: active ? '#166534' : '#991b1b',
  });

  const roleBadgeStyle = (role: string): React.CSSProperties => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
    background: role === 'admin' ? '#dbeafe' : '#f1f5f9', color: role === 'admin' ? '#1e40af' : '#475569',
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f8' }}>
        <div style={{ color: BLUE, fontSize: 14 }}>Chargement…</div>
      </div>
    );
  }

  const companyQuota = company?.token_quota ?? 0;
  const companyUsed = company?.token_used_month ?? 0;
  const quotaPct = companyQuota > 0 ? Math.min(100, (companyUsed / companyQuota) * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', width: '100%', background: '#f7f7f8', fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif' }}>
      <div style={{ padding: '48px 48px 96px', width: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, color: BLUE, margin: 0 }}>
              Gestion des utilisateurs
            </p>
            {companyName && (
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>{companyName}</p>
            )}
          </div>
          <button
            onClick={() => setLocation('/portail-client/accueil')}
            style={{ padding: '8px 16px', borderRadius: 8, background: '#f1f5f9', color: BLUE, fontWeight: 600, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 13 }}
            onMouseEnter={e => (e.currentTarget.style.background = '#e2e8f0')}
            onMouseLeave={e => (e.currentTarget.style.background = '#f1f5f9')}
          >
            ← Retour à l'accueil
          </button>
        </div>

        {/* Notifications */}
        {(error || success) && (
          <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, background: error ? '#fee2e2' : '#dcfce7', color: error ? '#991b1b' : '#166534', border: `1px solid ${error ? '#fecaca' : '#bbf7d0'}` }}>
            {error || success}
          </div>
        )}

        {/* Quota entreprise */}
        {company && (
          <div style={{ ...cardStyle, marginBottom: 24 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: BLUE, marginBottom: 12 }}>Quota tokens mensuel — entreprise</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', marginBottom: 6 }}>
                  <span>{companyUsed.toLocaleString()} utilisés</span>
                  <span>{companyQuota === 0 ? 'Illimité' : `${companyQuota.toLocaleString()} max`}</span>
                </div>
                <div style={{ width: '100%', height: 8, borderRadius: 99, background: '#e2e8f0', overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 99, width: `${quotaPct}%`, background: quotaPct > 85 ? '#ef4444' : quotaPct > 60 ? '#f59e0b' : BLUE, transition: 'width 0.6s ease' }} />
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#64748b', minWidth: 120, textAlign: 'right' }}>
                <span style={{ fontWeight: 700, color: BLUE, fontSize: 18 }}>{companyQuota === 0 ? '∞' : companyQuota.toLocaleString()}</span>
                <span style={{ display: 'block', fontSize: 11 }}>tokens / mois</span>
              </div>
            </div>
          </div>
        )}

        {/* Tableau utilisateurs */}
        <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Email', 'Prénom / Nom', 'Rôle', 'Statut', 'Modules', 'Quota alloué / Utilisé', 'Dernière connexion', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Aucun utilisateur</td></tr>
              ) : users.map((u, i) => {
                const companyMods = company?.modules_enabled ?? [];
                const userMods: string[] = u.modules_enabled ?? companyMods;
                return (
                <tr key={u.id} style={{ borderBottom: i < users.length - 1 ? '1px solid #f1f5f9' : 'none', background: u.is_active ? 'white' : '#fafafa', opacity: u.is_active ? 1 : 0.65 }}>
                  <td style={{ padding: '12px 16px', color: BLUE, fontWeight: 600 }}>{u.email}</td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>
                    {[u.first_name, u.last_name].filter(Boolean).join(' ') || <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td style={{ padding: '12px 16px' }}><span style={roleBadgeStyle(u.role)}>{u.role}</span></td>
                  <td style={{ padding: '12px 16px' }}><span style={badgeStyle(u.is_active)}>{u.is_active ? 'Actif' : 'Inactif'}</span></td>
                  <td style={{ padding: '12px 16px' }}>
                    {editModulesId === u.id ? (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
                        {companyMods.map(m => {
                          const active = userMods.includes(m);
                          return (
                            <button
                              key={m}
                              onClick={() => toggleModule(u, m)}
                              title={active ? `Désactiver ${m}` : `Activer ${m}`}
                              style={{
                                padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                border: `1px solid ${active ? '#16a34a' : '#cbd5e1'}`,
                                background: active ? '#dcfce7' : '#f8fafc',
                                color: active ? '#166534' : '#94a3b8',
                                transition: 'all 0.15s',
                              }}
                            >
                              {getModuleInitials(m)}
                            </button>
                          );
                        })}
                        <button onClick={() => setEditModulesId(null)} style={{ padding: '2px 8px', borderRadius: 4, background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer', fontSize: 11, marginLeft: 2 }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
                        {companyMods.length === 0 ? (
                          <span style={{ color: '#cbd5e1', fontSize: 12 }}>—</span>
                        ) : companyMods.map(m => {
                          const active = userMods.includes(m);
                          return (
                            <span key={m} style={{
                              padding: '2px 7px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                              background: active ? '#dcfce7' : '#f1f5f9',
                              color: active ? '#166534' : '#94a3b8',
                              border: `1px solid ${active ? '#bbf7d0' : '#e2e8f0'}`,
                            }}>
                              {getModuleInitials(m)}
                            </span>
                          );
                        })}
                        <button
                          onClick={() => setEditModulesId(u.id)}
                          style={{ padding: '2px 7px', borderRadius: 4, background: '#f1f5f9', color: BLUE, border: `1px solid #e2e8f0`, cursor: 'pointer', fontSize: 10, marginLeft: 2 }}
                        >
                          ✎
                        </button>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {editQuotaId === u.id ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input
                          type="number" min="0"
                          value={editQuotaValue}
                          onChange={e => setEditQuotaValue(Number(e.target.value))}
                          style={{ width: 90, padding: '4px 8px', borderRadius: 6, border: `1px solid ${BLUE}`, fontSize: 13, outline: 'none' }}
                          autoFocus
                        />
                        <button onClick={() => saveQuota(u.id)} style={{ padding: '4px 10px', borderRadius: 6, background: BLUE, color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>OK</button>
                        <button onClick={() => setEditQuotaId(null)} style={{ padding: '4px 10px', borderRadius: 6, background: '#f1f5f9', color: '#64748b', border: 'none', cursor: 'pointer', fontSize: 12 }}>✕</button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: '#475569' }}>
                          <span style={{ fontWeight: 600, color: BLUE }}>{(u.token_quota ?? 0) === 0 ? '∞' : (u.token_quota ?? 0).toLocaleString()}</span>
                          {' / '}
                          <span style={{ color: '#94a3b8' }}>{(u.token_used_month ?? 0).toLocaleString()} utilisés</span>
                        </span>
                        <button onClick={() => startEditQuota(u)} style={{ padding: '2px 8px', borderRadius: 6, background: '#f1f5f9', color: BLUE, border: '1px solid #e2e8f0', cursor: 'pointer', fontSize: 11 }}>Modifier</button>
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 12 }}>
                    {u.last_login ? new Date(u.last_login).toLocaleDateString('fr-FR') : '—'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => handleToggle(u)}
                      style={{ padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, background: u.is_active ? '#fee2e2' : '#dcfce7', color: u.is_active ? '#991b1b' : '#166534' }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                      onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                    >
                      {u.is_active ? 'Désactiver' : 'Activer'}
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Ligne décorative FYNE */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
          <span style={{ fontSize: 12, color: '#94a3b8' }}>
            <span style={{ color: PINK, fontWeight: 700 }}>F</span>or{' '}
            <span style={{ color: PINK, fontWeight: 700 }}>Y</span>our{' '}
            <span style={{ color: PINK, fontWeight: 700 }}>N</span>ext{' '}
            <span style={{ color: PINK, fontWeight: 700 }}>E</span>xperience
          </span>
        </div>

      </div>
    </div>
  );
}
