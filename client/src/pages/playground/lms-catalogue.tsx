import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

const palette = {
  bg: '#f8f8fc',
  white: '#ffffff',
  dark: '#1c1c2e',
  pink: '#E8006C',
  blue: '#1B7A9C',
  green: '#22a359',
  amber: '#f0b429',
  muted: '#888888',
  border: '#e5e7eb',
};
const font = { sans: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };

const navItems = [
  { icon: '⊞', label: 'Accueil', path: '/playground/lms/dashboard' },
  { icon: '◧', label: 'Formations', path: '/playground/lms' },
  { icon: '⊡', label: 'Catalogue', path: '/playground/lms/catalogue' },
  { icon: '⇢', label: 'Parcours', path: '/playground/lms/parcours' },
  { icon: '◎', label: 'Certif.', path: null },
];

const coverColors = ['#c8dff0', '#f5d0e0', '#d0f0e0', '#f0e8c8', '#e0d0f5', '#c8e8d0'];

interface Course {
  id: number;
  title: string;
  chapters?: unknown[];
  estimatedDurationMin?: number;
}

export default function LmsCataloguePage() {
  const [, navigate] = useLocation();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeChip, setActiveChip] = useState('Tous');

  useEffect(() => {
    fetch('/api/lms/courses', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setCourses(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => { setCourses([]); setLoading(false); });
  }, []);

  const chips = ['Tous', 'RH', 'Sécurité', 'RGPD', 'IT', 'Management'];

  const filtered = courses.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ height: '100vh', display: 'flex', overflow: 'hidden', fontFamily: font.sans, background: palette.bg }}>
      {/* Sidebar */}
      <div style={{ width: 60, background: palette.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', flexShrink: 0 }}>
        <div style={{ fontFamily: font.mono, fontWeight: 700, fontSize: 13, color: palette.pink, marginBottom: 18 }}>FY</div>
        {navItems.map((item) => {
          const isActive = item.path === '/playground/lms/catalogue';
          return (
            <div
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              style={{
                width: 44,
                padding: '8px 0',
                borderRadius: 6,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
                cursor: item.path ? 'pointer' : 'default',
                background: isActive ? 'rgba(232,0,108,.18)' : 'transparent',
                color: isActive ? palette.pink : 'rgba(255,255,255,0.55)',
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              <span style={{ fontFamily: font.mono, fontSize: 7, letterSpacing: 0.3 }}>{item.label}</span>
            </div>
          );
        })}
        <div style={{ flex: 1 }} />
        <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#2B6CB0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>AP</div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '14px 24px', background: palette.white, borderBottom: `1px solid ${palette.border}`, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: palette.dark }}>Catalogue</div>
          <div style={{ fontSize: 11, color: palette.muted }}>{filtered.length} formations</div>
        </div>

        {/* Content scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {/* Search bar */}
          <div style={{ background: palette.white, border: `1px solid ${palette.border}`, borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 18, color: palette.muted }}>⌕</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher une formation..."
              style={{ flex: 1, border: 'none', outline: 'none', fontFamily: font.sans, fontSize: 13, color: palette.dark, background: 'transparent' }}
            />
          </div>

          {/* Filter chips */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
            {chips.map(chip => (
              <div
                key={chip}
                onClick={() => setActiveChip(chip)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 20,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  background: activeChip === chip ? palette.pink : palette.white,
                  color: activeChip === chip ? '#fff' : palette.dark,
                  border: activeChip === chip ? `1px solid ${palette.pink}` : `1px solid ${palette.border}`,
                }}
              >
                {chip}
              </div>
            ))}
          </div>

          {loading && (
            <div style={{ textAlign: 'center', color: palette.muted, padding: 40 }}>Chargement...</div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ color: palette.muted, fontSize: 13, marginBottom: 8 }}>Aucune formation disponible pour le moment.</div>
              <span
                onClick={() => navigate('/playground/lms/new')}
                style={{ color: palette.pink, fontSize: 13, cursor: 'pointer', fontWeight: 600 }}
              >
                Créer un cours →
              </span>
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {filtered.map((course, i) => (
                <div
                  key={course.id}
                  style={{ background: palette.white, borderRadius: 10, overflow: 'hidden', border: `1px solid ${palette.border}` }}
                >
                  <div style={{ position: 'relative', height: 60, background: coverColors[course.id % coverColors.length] || '#e8e8e8' }}>
                    <div style={{
                      position: 'absolute',
                      bottom: 6,
                      left: 6,
                      background: palette.pink,
                      color: '#fff',
                      fontSize: 8,
                      fontFamily: font.mono,
                      padding: '2px 6px',
                      borderRadius: 10,
                    }}>
                      Micro Learning
                    </div>
                  </div>
                  <div style={{ padding: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: palette.dark, marginBottom: 4 }}>{course.title}</div>
                    <div style={{ fontSize: 9, color: palette.muted, marginBottom: 8 }}>
                      {Array.isArray(course.chapters) ? course.chapters.length : 0} chapitres · {course.estimatedDurationMin ?? '—'} min
                    </div>
                    <div
                      onClick={() => navigate(`/playground/lms/editor/${course.id}`)}
                      style={{
                        background: palette.pink,
                        color: '#fff',
                        borderRadius: 5,
                        padding: '5px 0',
                        textAlign: 'center',
                        fontSize: 10,
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      S'inscrire
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
