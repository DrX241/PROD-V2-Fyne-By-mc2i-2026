import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { LMS_TEMPLATES, type LmsCourseTemplate } from '@/data/lmsTemplates';

const palette = {
  bg: '#ffffff',
  text: '#0d0d0d',
  muted: '#6b7280',
  border: '#e5e7eb',
  accent: '#0057ff',
  surface: '#f9fafb',
};

const font = { sans: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };

function TemplateCard({
  tpl,
  onSelect,
  loading,
}: {
  tpl: LmsCourseTemplate | null;
  onSelect: () => void;
  loading: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const isBlank = tpl === null;

  const chaptersCount = tpl?.content.chapters.length ?? 0;
  const lessonsCount = tpl?.content.chapters.reduce(
    (acc, ch) => acc + ch.lessons.length, 0
  ) ?? 0;

  const accentColor = tpl?.accentColor ?? '#6b7280';

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: palette.bg,
        border: `2px solid ${hovered ? accentColor : palette.border}`,
        borderRadius: 12,
        padding: 24,
        cursor: loading ? 'wait' : 'pointer',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxShadow: hovered ? `0 6px 24px ${accentColor}22` : 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        opacity: loading ? 0.6 : 1,
      }}
    >
      {/* Icon / accent bar */}
      <div style={{
        height: 4,
        borderRadius: 2,
        background: isBlank
          ? `linear-gradient(90deg, #e5e7eb, #d1d5db)`
          : accentColor,
        marginBottom: 4,
      }} />

      {/* Header */}
      <div>
        <h3 style={{
          margin: '0 0 6px',
          fontSize: 16,
          fontWeight: 700,
          color: palette.text,
          lineHeight: 1.3,
        }}>
          {isBlank ? 'Partir de zéro' : tpl!.title}
        </h3>
        <p style={{
          margin: 0,
          fontSize: 13,
          color: palette.muted,
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {isBlank
            ? 'Créer un cours entièrement vierge, sans structure prédéfinie.'
            : tpl!.description}
        </p>
      </div>

      {/* Tags */}
      {!isBlank && tpl && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 4,
            background: `${accentColor}15`, color: accentColor,
            fontWeight: 600, letterSpacing: '0.03em',
          }}>
            {tpl.domain}
          </span>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 4,
            background: palette.surface, color: palette.muted,
          }}>
            {tpl.difficulty}
          </span>
          <span style={{
            fontSize: 11, padding: '2px 8px', borderRadius: 4,
            background: palette.surface, color: palette.muted,
          }}>
            {tpl.audience}
          </span>
        </div>
      )}

      {/* Stats */}
      {!isBlank && (
        <div style={{
          display: 'flex', gap: 16,
          paddingTop: 12, borderTop: `1px solid ${palette.border}`,
        }}>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: font.mono }}>{chaptersCount}</span>
            <span style={{ fontSize: 11, color: palette.muted, marginLeft: 4 }}>chapitres</span>
          </div>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, fontFamily: font.mono }}>{lessonsCount}</span>
            <span style={{ fontSize: 11, color: palette.muted, marginLeft: 4 }}>leçons</span>
          </div>
          {tpl && (
            <div>
              <span style={{ fontSize: 16, fontWeight: 700, fontFamily: font.mono }}>{tpl.estimatedDurationMin}</span>
              <span style={{ fontSize: 11, color: palette.muted, marginLeft: 4 }}>min</span>
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <div style={{
        marginTop: 'auto',
        paddingTop: 4,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        color: isBlank ? palette.muted : accentColor,
        fontSize: 13,
        fontWeight: 600,
      }}>
        {loading ? 'Création en cours...' : (isBlank ? 'Créer un cours vierge' : 'Utiliser ce template')}
        {!loading && <span style={{ fontSize: 16 }}>→</span>}
      </div>
    </div>
  );
}

export default function LmsTemplatePickerPage() {
  const [, navigate] = useLocation();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(tpl: LmsCourseTemplate | null) {
    const id = tpl?.id ?? '__blank__';
    if (loadingId) return;
    setLoadingId(id);
    setError(null);

    try {
      const body: Record<string, any> = {
        title: tpl ? tpl.title : 'Nouveau cours',
        content: tpl
          ? tpl.content
          : { chapters: [], scoringEnabled: false, completionMode: 'free' },
      };
      if (tpl) body.templateId = tpl.id;

      const res = await fetch('/api/lms/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const course = await res.json();
      navigate(`/playground/lms/editor/${course.id}`);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la création du cours.');
      setLoadingId(null);
    }
  }

  return (
    <div style={{ fontFamily: font.sans, background: palette.bg, minHeight: '100vh', color: palette.text }}>
      {/* Header */}
      <div style={{
        borderBottom: `1px solid ${palette.border}`,
        padding: '24px 40px',
        position: 'sticky', top: 0, background: palette.bg, zIndex: 10,
      }}>
        <button
          onClick={() => navigate('/playground/lms')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: palette.muted, fontSize: 14, fontFamily: font.sans,
            padding: 0, marginBottom: 8,
          }}
        >
          ← Mes cours
        </button>
        <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
          Choisir un template
        </h1>
        <p style={{ margin: 0, color: palette.muted, fontSize: 14 }}>
          Sélectionnez un modèle préconçu ou partez de zéro. Le contenu sera entièrement personnalisable.
        </p>
      </div>

      {/* Body */}
      <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
        {error && (
          <div style={{
            background: '#fff5f5', border: '1px solid #fecaca',
            borderRadius: 8, padding: '14px 18px', color: '#dc2626',
            fontSize: 14, marginBottom: 24,
          }}>
            {error}
          </div>
        )}

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 20,
        }}>
          {/* Blank template first */}
          <TemplateCard
            tpl={null}
            onSelect={() => handleSelect(null)}
            loading={loadingId === '__blank__'}
          />

          {/* All templates */}
          {LMS_TEMPLATES.map(tpl => (
            <TemplateCard
              key={tpl.id}
              tpl={tpl}
              onSelect={() => handleSelect(tpl)}
              loading={loadingId === tpl.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
