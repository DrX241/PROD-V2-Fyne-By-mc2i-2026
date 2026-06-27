import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { LayoutDashboard, BookOpen, BookMarked, TrendingUp, Award, ArrowLeft, Search, Clock, Layers, Plus } from 'lucide-react';

const P = {
  bg: '#f4f5f7', white: '#ffffff', dark: '#111827', pink: '#E8006C',
  blue: '#0057ff', green: '#059669', amber: '#d97706', muted: '#6b7280',
  border: '#e5e7eb', sidebarBg: '#111827',
};
const F = { sans: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };

const NAV = [
  { icon: LayoutDashboard, label: 'Accueil', path: '/playground/lms/dashboard' },
  { icon: BookOpen, label: 'Mes cours', path: '/playground/lms' },
  { icon: BookMarked, label: 'Catalogue', path: '/playground/lms/catalogue' },
  { icon: TrendingUp, label: 'Parcours', path: '/playground/lms/parcours' },
  { icon: Award, label: 'Certifs', path: null },
];

const COVER_BG = ['#dbeafe', '#fce7f3', '#d1fae5', '#fef3c7', '#ede9fe', '#ffedd5'];
const COVER_FG = [P.blue, P.pink, P.green, P.amber, '#7c3aed', '#ea580c'];

function hashIdx(id: string | number, len: number) {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % len;
  return h;
}

interface Course {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  estimatedDurationMin?: number;
  audience?: string;
  content: { chapters: { lessons?: unknown[] }[] };
}

const CHIPS = ['Tous', 'RH', 'Sécurité', 'RGPD', 'IT', 'Management'];

function Sidebar({ active }: { active: string }) {
  const [, nav] = useLocation();
  return (
    <div style={{ width: 220, background: P.sidebarBg, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 18, color: P.pink }}>FYNE</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontFamily: F.mono }}>Espace Apprenant</div>
      </div>
      <nav style={{ flex: 1, padding: '12px 10px' }}>
        {NAV.map(({ icon: Icon, label, path }) => {
          const isActive = path === active;
          return (
            <div key={label} onClick={() => path && nav(path)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
              borderRadius: 8, marginBottom: 2, cursor: path ? 'pointer' : 'default',
              background: isActive ? 'rgba(232,0,108,0.15)' : 'transparent',
              color: isActive ? P.pink : 'rgba(255,255,255,0.55)',
            }}>
              <Icon size={16} />
              <span style={{ fontFamily: F.sans, fontSize: 14, fontWeight: isActive ? 600 : 400 }}>{label}</span>
            </div>
          );
        })}
      </nav>
      <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div onClick={() => nav('/playground')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.4)' }}>
          <ArrowLeft size={16} />
          <span style={{ fontFamily: F.sans, fontSize: 13 }}>Retour au Studio</span>
        </div>
      </div>
    </div>
  );
}

export default function LmsCataloguePage() {
  const [, nav] = useLocation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [chip, setChip] = useState('Tous');
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    fetch('/api/auth/check', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.authenticated) setUserRole(d.user?.role || ''); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/lms/courses', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setCourses(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setCourses([]); setLoading(false); });
  }, []);

  const isMaker = ['maker', 'admin', 'superadmin'].includes(userRole);

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || '').toLowerCase().includes(search.toLowerCase());
    const matchChip = chip === 'Tous' || (c.audience || '').toLowerCase().includes(chip.toLowerCase()) ||
      c.title.toLowerCase().includes(chip.toLowerCase());
    return matchSearch && matchChip;
  });

  return (
    <div style={{ height: '100vh', display: 'flex', fontFamily: F.sans, overflow: 'hidden' }}>
      <Sidebar active="/playground/lms/catalogue" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: P.bg }}>
        {/* Topbar */}
        <div style={{ background: P.white, borderBottom: `1px solid ${P.border}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h1 style={{ margin: '0 0 2px', fontSize: 22, fontWeight: 700, color: P.dark }}>Catalogue</h1>
            <p style={{ margin: 0, fontSize: 13, color: P.muted }}>
              {loading ? '…' : `${filtered.length} formation${filtered.length !== 1 ? 's' : ''} disponible${filtered.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          {isMaker && (
            <button onClick={() => nav('/playground/lms/new')} style={{ background: P.pink, color: '#fff', border: 'none', padding: '9px 16px', borderRadius: 8, cursor: 'pointer', fontFamily: F.sans, fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Nouveau cours
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
          {/* Search */}
          <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 10, padding: '11px 16px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <Search size={16} color={P.muted} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une formation..."
              style={{ flex: 1, border: 'none', outline: 'none', fontFamily: F.sans, fontSize: 14, color: P.dark, background: 'transparent' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: P.muted, fontSize: 16, padding: 0, lineHeight: 1 }}>×</button>
            )}
          </div>

          {/* Chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {CHIPS.map(c => (
              <button key={c} onClick={() => setChip(c)} style={{
                padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: chip === c ? 600 : 400,
                cursor: 'pointer', border: 'none', transition: 'all 0.1s',
                background: chip === c ? P.pink : P.white,
                color: chip === c ? '#fff' : P.dark,
                boxShadow: chip === c ? 'none' : `0 0 0 1px ${P.border}`,
              }}>
                {c}
              </button>
            ))}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', color: P.muted, padding: '60px 0', fontSize: 14 }}>Chargement des formations...</div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', background: P.white, borderRadius: 12, border: `1px solid ${P.border}` }}>
              <BookOpen size={40} color={P.border} style={{ marginBottom: 14 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: P.dark, marginBottom: 6 }}>
                {search ? `Aucun résultat pour "${search}"` : 'Aucune formation disponible'}
              </div>
              <div style={{ fontSize: 13, color: P.muted, marginBottom: 20 }}>
                {isMaker ? 'Créez votre premier cours LMS.' : 'Revenez bientôt, de nouvelles formations seront publiées.'}
              </div>
              {isMaker && (
                <button onClick={() => nav('/playground/lms/new')} style={{ background: P.pink, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontFamily: F.sans, fontWeight: 600, fontSize: 14 }}>
                  Créer un cours →
                </button>
              )}
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {filtered.map(course => {
                const idx = hashIdx(course.id, COVER_BG.length);
                const chapCount = course.content?.chapters?.length ?? 0;
                const lessonCount = course.content?.chapters?.reduce((a, ch) => a + (ch.lessons?.length ?? 0), 0) ?? 0;
                return (
                  <div
                    key={course.id}
                    style={{ background: P.white, borderRadius: 12, overflow: 'hidden', border: `1px solid ${P.border}`, cursor: 'pointer' }}
                    onClick={() => nav(isMaker ? `/playground/lms/editor/${course.id}` : `/playground/lms/editor/${course.id}`)}
                  >
                    <div style={{ height: 100, background: COVER_BG[idx], display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <BookOpen size={32} color={COVER_FG[idx]} style={{ opacity: 0.4 }} />
                      <div style={{ position: 'absolute', bottom: 10, left: 12, background: COVER_FG[idx], color: '#fff', fontSize: 11, fontFamily: F.mono, padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                        Micro Learning
                      </div>
                      {isMaker && (
                        <div style={{ position: 'absolute', top: 10, right: 12, background: course.published ? '#dcfce7' : '#f3f4f6', color: course.published ? P.green : P.muted, fontSize: 10, fontFamily: F.mono, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>
                          {course.published ? 'Publié' : 'Brouillon'}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '16px 18px' }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: P.dark, marginBottom: 4, lineHeight: 1.3 }}>{course.title}</div>
                      {course.description && (
                        <div style={{ fontSize: 12, color: P.muted, marginBottom: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {course.description}
                        </div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: P.muted }}>
                          <Layers size={12} /> {chapCount} chapitre{chapCount !== 1 ? 's' : ''}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: P.muted }}>
                          <BookOpen size={12} /> {lessonCount} leçon{lessonCount !== 1 ? 's' : ''}
                        </span>
                        {course.estimatedDurationMin ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: P.muted }}>
                            <Clock size={12} /> {course.estimatedDurationMin} min
                          </span>
                        ) : null}
                      </div>
                      <button style={{ width: '100%', background: P.pink, color: '#fff', border: 'none', padding: '10px 0', borderRadius: 8, fontFamily: F.sans, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        {isMaker ? 'Ouvrir l\'éditeur →' : 'Commencer →'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
