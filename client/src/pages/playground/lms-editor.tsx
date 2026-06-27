import React, { useEffect, useState } from 'react';
import { useLocation, useRoute } from 'wouter';

interface LmsCourse {
  id: string;
  title: string;
  description?: string;
  status: string;
  published: boolean;
  estimatedDurationMin?: number;
  content: {
    chapters: Array<{ id: string; title: string; lessons: any[] }>;
    scoringEnabled: boolean;
    completionMode: string;
  };
}

const palette = {
  bg: '#ffffff',
  text: '#0d0d0d',
  muted: '#6b7280',
  border: '#e5e7eb',
  accent: '#0057ff',
  surface: '#f9fafb',
};

const font = { sans: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };

export default function LmsEditorPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/playground/lms/editor/:id');
  const courseId = params?.id;

  const [course, setCourse] = useState<LmsCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/lms/courses/${courseId}`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: LmsCourse) => {
        setCourse(data);
        setLoading(false);
      })
      .catch(err => {
        setError('Impossible de charger le cours.');
        setLoading(false);
      });
  }, [courseId]);

  const chaptersCount = course?.content?.chapters?.length ?? 0;
  const lessonsCount = course?.content?.chapters?.reduce(
    (acc, ch) => acc + (ch.lessons?.length ?? 0), 0
  ) ?? 0;

  return (
    <div style={{ fontFamily: font.sans, background: palette.bg, minHeight: '100vh', color: palette.text }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${palette.border}`,
        padding: '20px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky', top: 0, background: palette.bg, zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => navigate('/playground/lms')}
            style={{
              background: 'none', border: `1px solid ${palette.border}`,
              borderRadius: 6, cursor: 'pointer', color: palette.text,
              fontFamily: font.sans, fontSize: 13, fontWeight: 500,
              padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ← Mes cours
          </button>
          {course && (
            <div>
              <span style={{
                fontSize: 11, color: palette.muted, fontFamily: font.mono,
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                {course.status === 'draft' ? 'Brouillon' : course.status}
              </span>
              <h1 style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700 }}>
                {course.title}
              </h1>
            </div>
          )}
        </div>

        {course && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: palette.muted, fontFamily: font.mono }}>
              {chaptersCount} chapitres · {lessonsCount} leçons
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{
        maxWidth: 760, margin: '0 auto', padding: '60px 40px',
        textAlign: 'center',
      }}>
        {loading && (
          <div style={{ color: palette.muted, fontSize: 15, padding: '60px 0' }}>
            Chargement du cours...
          </div>
        )}

        {error && (
          <div style={{
            background: '#fff5f5', border: '1px solid #fecaca',
            borderRadius: 8, padding: '16px 20px', color: '#dc2626', fontSize: 14,
          }}>
            {error}
          </div>
        )}

        {!loading && !error && course && (
          <>
            {/* Construction badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#fffbeb', border: '1px solid #fde68a',
              borderRadius: 8, padding: '8px 16px', marginBottom: 32,
              fontSize: 13, color: '#92400e', fontWeight: 500,
            }}>
              <span>🚧</span>
              Phase 2 — Éditeur en construction
            </div>

            {/* Course info */}
            <div style={{
              background: palette.surface, border: `1px solid ${palette.border}`,
              borderRadius: 12, padding: 32, textAlign: 'left', marginBottom: 32,
            }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 700 }}>
                {course.title}
              </h2>
              {course.description && (
                <p style={{ margin: '0 0 20px', color: palette.muted, fontSize: 14, lineHeight: 1.6 }}>
                  {course.description}
                </p>
              )}

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: font.mono, color: palette.accent }}>
                    {chaptersCount}
                  </div>
                  <div style={{ fontSize: 12, color: palette.muted }}>Chapitres</div>
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: font.mono, color: palette.accent }}>
                    {lessonsCount}
                  </div>
                  <div style={{ fontSize: 12, color: palette.muted }}>Leçons</div>
                </div>
                {course.estimatedDurationMin && (
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, fontFamily: font.mono, color: palette.accent }}>
                      {course.estimatedDurationMin}
                    </div>
                    <div style={{ fontSize: 12, color: palette.muted }}>Minutes estimées</div>
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: font.mono, color: palette.accent }}>
                    {course.content.scoringEnabled ? 'Oui' : 'Non'}
                  </div>
                  <div style={{ fontSize: 12, color: palette.muted }}>Scoring activé</div>
                </div>
              </div>
            </div>

            {/* Chapters preview */}
            {course.content.chapters.length > 0 && (
              <div style={{ textAlign: 'left', marginBottom: 32 }}>
                <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 600, color: palette.muted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  Structure du cours
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {course.content.chapters.map((ch, idx) => (
                    <div key={ch.id} style={{
                      background: palette.surface, border: `1px solid ${palette.border}`,
                      borderRadius: 8, padding: '12px 16px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: 6,
                          background: palette.accent, color: '#fff',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, fontWeight: 700, fontFamily: font.mono, flexShrink: 0,
                        }}>
                          {idx + 1}
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{ch.title}</span>
                      </div>
                      <span style={{ fontSize: 12, color: palette.muted, fontFamily: font.mono }}>
                        {ch.lessons?.length ?? 0} leçons
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p style={{ color: palette.muted, fontSize: 14, lineHeight: 1.6, margin: '0 0 8px' }}>
              L'éditeur de blocs (glisser-déposer, édition riche, génération IA) sera disponible en Phase 2.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
