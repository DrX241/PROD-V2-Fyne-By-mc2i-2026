import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import {
  LayoutDashboard, BookOpen, BookMarked, TrendingUp, Award,
  ArrowLeft, Play, ChevronRight, Clock, Layers, Plus,
} from 'lucide-react';

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
  content: { chapters: { lessons?: unknown[] }[] };
  updatedAt: string;
}

function Sidebar({ active }: { active: string }) {
  const [, nav] = useLocation();
  return (
    <div style={{ width: 220, background: P.sidebarBg, display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontFamily: F.mono, fontWeight: 700, fontSize: 18, color: P.pink, letterSpacing: '-0.5px' }}>FYNE</div>
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

export default function LmsDashboardPage() {
  const [, nav] = useLocation();
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/check', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) {
          const u = d.user;
          setUserName(u?.firstName || u?.username || u?.email?.split('@')[0] || '');
          setUserRole(u?.role || '');
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/api/lms/courses', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setCourses(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const published = courses.filter(c => c.published);
  const drafts = courses.filter(c => !c.published);
  const totalLessons = courses.reduce((acc, c) =>
    acc + (c.content?.chapters?.reduce((a, ch) => a + (ch.lessons?.length ?? 0), 0) ?? 0), 0);
  const totalChapters = courses.reduce((acc, c) => acc + (c.content?.chapters?.length ?? 0), 0);

  const lastUpdated = [...courses].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  const resumeCourse = lastUpdated[0] ?? null;

  const isMaker = ['maker', 'admin', 'superadmin'].includes(userRole);

  return (
    <div style={{ height: '100vh', display: 'flex', fontFamily: F.sans, overflow: 'hidden' }}>
      <Sidebar active="/playground/lms/dashboard" />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: P.bg }}>
        {/* Topbar */}
        <div style={{ background: P.white, borderBottom: `1px solid ${P.border}`, padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: P.dark }}>
              Bonjour{userName ? `, ${userName}` : ''} 👋
            </h1>
            <p style={{ margin: '2px 0 0', fontSize: 13, color: P.muted }}>
              {isMaker ? 'Tableau de bord de vos formations LMS' : 'Votre espace de formation personnalisé'}
            </p>
          </div>
          <button
            onClick={() => nav('/playground/lms/catalogue')}
            style={{ background: P.pink, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontFamily: F.sans, fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            Explorer le catalogue <ChevronRight size={14} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}>

          {/* Stats — différentes selon le rôle */}
          <div style={{ display: 'grid', gridTemplateColumns: isMaker ? 'repeat(4, 1fr)' : 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
            {isMaker ? (
              <>
                <StatCard value={String(courses.length)} label="Cours créés" sub="Total" color={P.pink} />
                <StatCard value={String(published.length)} label="Cours publiés" sub="Visibles par les apprenants" color={P.green} />
                <StatCard value={String(drafts.length)} label="Brouillons" sub="En cours de création" color={P.amber} />
                <StatCard value={String(totalLessons)} label="Leçons" sub={`${totalChapters} chapitres`} color={P.blue} />
              </>
            ) : (
              <>
                <StatCard value={String(published.length)} label="Formations disponibles" sub="Dans le catalogue" color={P.pink} />
                <StatCard value="0" label="Formations en cours" sub="Vos progressions" color={P.blue} />
                <StatCard value="0" label="Formations terminées" sub="Certifications obtenues" color={P.green} />
              </>
            )}
          </div>

          {/* Bannière reprendre / CTA principal */}
          {loading ? null : resumeCourse ? (
            <div style={{
              background: 'linear-gradient(135deg, #E8006C 0%, #9d004a 100%)',
              borderRadius: 14, padding: '24px 28px', marginBottom: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: F.mono, fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  {isMaker ? 'Dernière modification' : 'Reprendre où vous étiez'}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 6 }}>{resumeCourse.title}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                  {resumeCourse.content?.chapters?.length ?? 0} chapitre{(resumeCourse.content?.chapters?.length ?? 0) !== 1 ? 's' : ''}
                  {resumeCourse.estimatedDurationMin ? ` · ${resumeCourse.estimatedDurationMin} min` : ''}
                </div>
              </div>
              <button
                onClick={() => nav(isMaker ? `/playground/lms/editor/${resumeCourse.id}` : `/playground/lms/catalogue`)}
                style={{ marginLeft: 24, background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: '50%', width: 52, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                <Play size={20} fill="#fff" color="#fff" />
              </button>
            </div>
          ) : (
            <div style={{ background: 'linear-gradient(135deg, #0057ff 0%, #003db3 100%)', borderRadius: 14, padding: '24px 28px', marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontFamily: F.mono, fontSize: 11, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Commencer</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 6 }}>Créez votre premier cours</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>Choisissez un template ou partez de zéro</div>
              </div>
              <button onClick={() => nav('/playground/lms/new')} style={{ marginLeft: 24, background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.4)', borderRadius: 50, padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: '#fff', fontFamily: F.sans, fontWeight: 600, fontSize: 14, flexShrink: 0 }}>
                <Plus size={16} /> Créer
              </button>
            </div>
          )}

          {/* Liste des cours récents */}
          {courses.length > 0 && (
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: P.dark, margin: 0 }}>
                  {isMaker ? 'Mes cours récents' : 'Formations disponibles'}
                </h2>
                <button onClick={() => nav(isMaker ? '/playground/lms' : '/playground/lms/catalogue')} style={{ background: 'none', border: 'none', color: P.blue, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: F.sans, display: 'flex', alignItems: 'center', gap: 4 }}>
                  Voir tout <ChevronRight size={14} />
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                {lastUpdated.slice(0, 4).map(course => {
                  const idx = hashIdx(course.id, COVER_BG.length);
                  const chapCount = course.content?.chapters?.length ?? 0;
                  const lessonCount = course.content?.chapters?.reduce((a, ch) => a + (ch.lessons?.length ?? 0), 0) ?? 0;
                  return (
                    <div
                      key={course.id}
                      onClick={() => nav(isMaker ? `/playground/lms/editor/${course.id}` : `/playground/lms/catalogue`)}
                      style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}
                    >
                      <div style={{ height: 72, background: COVER_BG[idx], display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <BookOpen size={24} color={COVER_FG[idx]} style={{ opacity: 0.4 }} />
                        {isMaker && (
                          <div style={{ position: 'absolute', top: 8, right: 10, background: course.published ? '#dcfce7' : '#f3f4f6', color: course.published ? P.green : P.muted, fontSize: 10, fontWeight: 600, fontFamily: F.mono, padding: '2px 8px', borderRadius: 20 }}>
                            {course.published ? 'Publié' : 'Brouillon'}
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '14px 16px' }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: P.dark, marginBottom: 4, lineHeight: 1.3 }}>{course.title}</div>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: P.muted }}>
                            <Layers size={11} /> {chapCount} ch.
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: P.muted }}>
                            <BookOpen size={11} /> {lessonCount} leç.
                          </span>
                          {course.estimatedDurationMin ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: P.muted }}>
                              <Clock size={11} /> {course.estimatedDurationMin} min
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Si aucun cours et maker */}
          {!loading && courses.length === 0 && isMaker && (
            <div style={{ textAlign: 'center', padding: '40px 20px', border: `2px dashed ${P.border}`, borderRadius: 12, background: P.white }}>
              <BookOpen size={36} color={P.border} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: P.dark, marginBottom: 6 }}>Aucun cours pour l'instant</div>
              <div style={{ fontSize: 13, color: P.muted, marginBottom: 16 }}>Créez votre premier cours LMS à partir d'un template.</div>
              <button onClick={() => nav('/playground/lms/new')} style={{ background: P.pink, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontFamily: F.sans, fontWeight: 600, fontSize: 14 }}>
                Créer un cours →
              </button>
            </div>
          )}

          {/* Si aucun cours et apprenant */}
          {!loading && courses.length === 0 && !isMaker && (
            <div style={{ textAlign: 'center', padding: '40px 20px', border: `2px dashed ${P.border}`, borderRadius: 12, background: P.white }}>
              <BookOpen size={36} color={P.border} style={{ marginBottom: 12 }} />
              <div style={{ fontSize: 15, fontWeight: 600, color: P.dark, marginBottom: 6 }}>Aucune formation disponible</div>
              <div style={{ fontSize: 13, color: P.muted }}>Revenez bientôt, de nouvelles formations seront publiées.</div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, sub, color }: { value: string; label: string; sub: string; color: string }) {
  return (
    <div style={{ background: P.white, border: `1px solid ${P.border}`, borderRadius: 12, padding: '20px 22px' }}>
      <div style={{ fontSize: 30, fontWeight: 800, color, fontFamily: F.mono, lineHeight: 1, marginBottom: 8 }}>{value}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: P.dark, marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 12, color: P.muted }}>{sub}</div>
    </div>
  );
}
