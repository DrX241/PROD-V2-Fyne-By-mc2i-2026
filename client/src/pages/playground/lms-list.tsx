import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

interface LmsCourse {
  id: string;
  title: string;
  description?: string;
  status: string;
  published: boolean;
  estimatedDurationMin?: number;
  audience?: string;
  difficulty?: string;
  content: { chapters: any[] };
  createdAt: string;
  updatedAt: string;
}

const palette = {
  bg: '#ffffff',
  text: '#0d0d0d',
  muted: '#6b7280',
  border: '#e5e7eb',
  accent: '#0057ff',
  surface: '#f9fafb',
  danger: '#ff3b4e',
  success: '#00c781',
};

const font = { sans: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };

export default function LmsListPage() {
  const [, navigate] = useLocation();
  const [courses, setCourses] = useState<LmsCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/lms/courses')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: LmsCourse[]) => {
        setCourses(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Impossible de charger les cours. Veuillez réessayer.');
        setLoading(false);
      });
  }, []);

  const difficultyLabel: Record<string, string> = {
    debutant: 'Débutant',
    intermediaire: 'Intermédiaire',
    avance: 'Avancé',
  };

  const audienceLabel: Record<string, string> = {
    grand_public: 'Grand public',
    managers: 'Managers',
    rh: 'RH',
    commercial: 'Commercial',
  };

  return (
    <div style={{ fontFamily: font.sans, background: palette.bg, minHeight: '100vh', color: palette.text }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${palette.border}`,
        padding: '24px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        background: palette.bg,
        zIndex: 10,
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
            <button
              onClick={() => navigate('/playground')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: palette.muted, fontSize: 14, fontFamily: font.sans, padding: 0,
              }}
            >
              ← Playground
            </button>
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
            Mes cours LMS
          </h1>
          <p style={{ margin: '4px 0 0', color: palette.muted, fontSize: 14 }}>
            {courses.length} cours · Créez et gérez vos formations interactives
          </p>
        </div>
        <button
          onClick={() => navigate('/playground/lms/new')}
          style={{
            background: palette.accent, color: '#fff', border: 'none',
            padding: '10px 20px', borderRadius: 6, cursor: 'pointer',
            fontFamily: font.sans, fontWeight: 600, fontSize: 14,
            display: 'flex', alignItems: 'center', gap: 8,
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Nouveau cours
        </button>
      </div>

      {/* Body */}
      <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: palette.muted }}>
            <div style={{ fontSize: 16 }}>Chargement des cours...</div>
          </div>
        )}

        {error && (
          <div style={{
            background: '#fff5f5', border: `1px solid #fecaca`,
            borderRadius: 8, padding: '16px 20px', color: palette.danger, fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 20px',
            border: `2px dashed ${palette.border}`, borderRadius: 12,
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📚</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 600 }}>Aucun cours pour l'instant</h2>
            <p style={{ color: palette.muted, margin: '0 0 24px', fontSize: 15 }}>
              Créez votre premier cours LMS à partir d'un template ou de zéro.
            </p>
            <button
              onClick={() => navigate('/playground/lms/new')}
              style={{
                background: palette.accent, color: '#fff', border: 'none',
                padding: '10px 20px', borderRadius: 6, cursor: 'pointer',
                fontFamily: font.sans, fontWeight: 600, fontSize: 14,
              }}
            >
              Créer mon premier cours
            </button>
          </div>
        )}

        {!loading && !error && courses.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 20,
          }}>
            {courses.map(course => {
              const chaptersCount = course.content?.chapters?.length ?? 0;
              const lessonsCount = course.content?.chapters?.reduce(
                (acc: number, ch: any) => acc + (ch.lessons?.length ?? 0), 0
              ) ?? 0;

              return (
                <div
                  key={course.id}
                  onClick={() => navigate(`/playground/lms/editor/${course.id}`)}
                  style={{
                    background: palette.bg, border: `1px solid ${palette.border}`,
                    borderRadius: 10, padding: 20, cursor: 'pointer',
                    transition: 'box-shadow 0.15s, border-color 0.15s',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,87,255,0.08)';
                    (e.currentTarget as HTMLDivElement).style.borderColor = palette.accent;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                    (e.currentTarget as HTMLDivElement).style.borderColor = palette.border;
                  }}
                >
                  {/* Status badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
                      textTransform: 'uppercase', padding: '3px 8px', borderRadius: 4,
                      background: course.published ? '#ecfdf5' : '#f3f4f6',
                      color: course.published ? '#059669' : palette.muted,
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: course.published ? '#059669' : palette.muted,
                        display: 'inline-block',
                      }} />
                      {course.published ? 'Publié' : 'Brouillon'}
                    </span>
                    {course.difficulty && (
                      <span style={{ fontSize: 11, color: palette.muted, fontFamily: font.mono }}>
                        {difficultyLabel[course.difficulty] ?? course.difficulty}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, lineHeight: 1.3 }}>
                    {course.title}
                  </h3>

                  {/* Description */}
                  {course.description && (
                    <p style={{
                      margin: '0 0 16px', color: palette.muted, fontSize: 13,
                      lineHeight: 1.5, display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    }}>
                      {course.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div style={{
                    display: 'flex', gap: 16, marginTop: course.description ? 0 : 16,
                    paddingTop: 14, borderTop: `1px solid ${palette.border}`,
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: font.mono }}>{chaptersCount}</div>
                      <div style={{ fontSize: 11, color: palette.muted }}>chapitres</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, fontFamily: font.mono }}>{lessonsCount}</div>
                      <div style={{ fontSize: 11, color: palette.muted }}>leçons</div>
                    </div>
                    {course.estimatedDurationMin && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, fontFamily: font.mono }}>{course.estimatedDurationMin}</div>
                        <div style={{ fontSize: 11, color: palette.muted }}>min</div>
                      </div>
                    )}
                    {course.audience && (
                      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                        <span style={{
                          fontSize: 11, background: palette.surface,
                          padding: '2px 8px', borderRadius: 4, color: palette.muted,
                        }}>
                          {audienceLabel[course.audience] ?? course.audience}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
