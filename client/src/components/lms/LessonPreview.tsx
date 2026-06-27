import React, { useState } from 'react';
import type { Chapter, Lesson, Block } from '../../../../shared/types/lms';

interface LessonPreviewProps {
  chapter: Chapter;
  lesson: Lesson;
  courseTitle: string;
}

const font = { sans: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };
const palette = {
  bg: '#ffffff', text: '#0d0d0d', muted: '#6b7280',
  border: '#e5e7eb', accent: '#0057ff', green: '#059669', red: '#dc2626',
};

// ─── Individual block renderers ───────────────────────────────────────────────

function PreviewText({ block }: { block: any }) {
  return (
    <div
      dangerouslySetInnerHTML={{ __html: block.html || '' }}
      style={{ fontFamily: font.sans, fontSize: 15, lineHeight: 1.75, color: palette.text, marginBottom: 20 }}
    />
  );
}

function PreviewImage({ block }: { block: any }) {
  if (!block.url) return null;
  return (
    <figure style={{ margin: '20px 0' }}>
      <img
        src={block.url}
        alt={block.alt || ''}
        style={{
          width: block.width === 'small' ? '40%' : block.width === 'medium' ? '70%' : '100%',
          display: 'block',
          maxWidth: '100%',
          borderRadius: 6,
          margin: '0 auto',
        }}
      />
      {block.caption && (
        <figcaption
          style={{
            textAlign: 'center', fontSize: 12, color: palette.muted,
            marginTop: 6, fontFamily: font.sans, fontStyle: 'italic',
          }}
        >
          {block.caption}
        </figcaption>
      )}
    </figure>
  );
}

function PreviewVideo({ block }: { block: any }) {
  if (!block.url) return null;

  if (block.source === 'youtube') {
    const vid = block.url.match(/(?:v=|youtu\.be\/)([^&?/]+)/)?.[1];
    if (!vid) return null;
    return (
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 8, margin: '20px 0' }}>
        <iframe
          src={`https://www.youtube.com/embed/${vid}`}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          allowFullScreen
          title={block.title || 'video'}
        />
      </div>
    );
  }

  if (block.source === 'vimeo') {
    const vid = block.url.match(/vimeo\.com\/(\d+)/)?.[1];
    if (!vid) return null;
    return (
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 8, margin: '20px 0' }}>
        <iframe
          src={`https://player.vimeo.com/video/${vid}`}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
          allowFullScreen
          title={block.title || 'video'}
        />
      </div>
    );
  }

  // upload
  return (
    <video controls style={{ width: '100%', borderRadius: 8, margin: '20px 0' }}>
      <source src={block.url} type="video/mp4" />
    </video>
  );
}

function PreviewAudio({ block }: { block: any }) {
  if (!block.url) return null;
  return (
    <div style={{ margin: '16px 0' }}>
      {block.title && (
        <div style={{ fontSize: 13, color: palette.muted, fontFamily: font.sans, marginBottom: 6 }}>
          {block.title}
        </div>
      )}
      <audio controls src={block.url} style={{ width: '100%' }} />
    </div>
  );
}

function PreviewCode({ block }: { block: any }) {
  return (
    <div style={{ margin: '20px 0' }}>
      {block.language && block.language !== 'plaintext' && (
        <div
          style={{
            fontFamily: font.mono, fontSize: 10, color: '#e6edf3', background: '#161b22',
            padding: '4px 16px', display: 'inline-block', borderRadius: '4px 4px 0 0',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}
        >
          {block.language}
        </div>
      )}
      <pre
        style={{
          background: '#0d1117', color: '#e6edf3', padding: 20, margin: 0,
          fontFamily: font.mono, fontSize: 13, lineHeight: 1.6,
          overflowX: 'auto', borderRadius: block.language && block.language !== 'plaintext' ? '0 4px 4px 4px' : 4,
        }}
      >
        <code>{block.code || ''}</code>
      </pre>
    </div>
  );
}

function PreviewAccordion({ block }: { block: any }) {
  return (
    <div style={{ margin: '16px 0' }}>
      {(block.items || []).map((item: any, idx: number) => (
        <details
          key={idx}
          style={{ border: `1px solid ${palette.border}`, marginBottom: 4, borderRadius: 4 }}
        >
          <summary
            style={{
              padding: '12px 16px', cursor: 'pointer', fontWeight: 600,
              fontSize: 14, fontFamily: font.sans, color: palette.text,
              background: '#f8f9fa', userSelect: 'none',
              listStyle: 'none',
            }}
          >
            {item.title || ''}
          </summary>
          <div
            style={{ padding: '12px 16px', fontFamily: font.sans, fontSize: 14, lineHeight: 1.65, color: palette.text }}
          >
            {item.content || ''}
          </div>
        </details>
      ))}
    </div>
  );
}

function PreviewQuote({ block }: { block: any }) {
  return (
    <blockquote
      style={{
        borderLeft: `4px solid ${palette.accent}`, paddingLeft: 16,
        margin: '20px 0', fontStyle: 'italic', color: '#374151',
        background: '#f8faff', padding: '12px 16px',
        borderRadius: '0 6px 6px 0',
      }}
    >
      <p style={{ fontFamily: font.sans, fontSize: 16, lineHeight: 1.7, margin: 0 }}>
        {block.text || ''}
      </p>
      {block.author && (
        <cite
          style={{
            display: 'block', marginTop: 8, fontSize: 13, fontStyle: 'normal',
            color: palette.muted, fontWeight: 600, fontFamily: font.sans,
          }}
        >
          — {block.author}{block.role ? ` · ${block.role}` : ''}
        </cite>
      )}
    </blockquote>
  );
}

function PreviewSeparator({ block }: { block: any }) {
  const style = block.style || 'line';
  if (style === 'dots') {
    return (
      <div style={{ textAlign: 'center', color: palette.muted, letterSpacing: 8, margin: '24px 0', fontSize: 20 }}>
        • • •
      </div>
    );
  }
  if (style === 'space') {
    return <div style={{ height: 40 }} />;
  }
  return <hr style={{ border: 'none', borderTop: `1px solid ${palette.border}`, margin: '24px 0' }} />;
}

function PreviewCallout({ block }: { block: any }) {
  const variantStyles: Record<string, { bg: string; border: string; color: string; icon: string }> = {
    info:    { bg: '#eff6ff', border: '#0057ff', color: '#1e3a8a', icon: 'ℹ️' },
    warning: { bg: '#fffbeb', border: '#d97706', color: '#92400e', icon: '⚠️' },
    tip:     { bg: '#f0fdf4', border: '#059669', color: '#065f46', icon: '💡' },
    danger:  { bg: '#fef2f2', border: '#dc2626', color: '#991b1b', icon: '❌' },
  };
  const vs = variantStyles[block.variant] || variantStyles.info;
  return (
    <div
      style={{
        background: vs.bg, borderLeft: `4px solid ${vs.border}`,
        padding: '14px 18px', margin: '16px 0', borderRadius: '0 6px 6px 0',
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 16, flexShrink: 0 }}>{vs.icon}</span>
        <div>
          {block.title && (
            <div style={{ fontWeight: 700, fontSize: 14, color: vs.color, marginBottom: 4, fontFamily: font.sans }}>
              {block.title}
            </div>
          )}
          <div style={{ fontSize: 14, color: vs.color, fontFamily: font.sans, lineHeight: 1.6 }}>
            {block.content || ''}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewQcm({ block }: { block: any }) {
  const [selected, setSelected] = useState<string | null>(null);
  const answered = selected !== null;

  const handleAnswer = (optId: string) => {
    if (!answered) setSelected(optId);
  };

  return (
    <div
      style={{
        background: '#f8f9fa', padding: 20, margin: '16px 0',
        borderRadius: 8, border: `1px solid ${palette.border}`,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 15, fontFamily: font.sans, marginBottom: 14, color: palette.text }}>
        {block.question || ''}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {(block.options || []).map((opt: any, i: number) => {
          let bg = '#fff';
          let border = palette.border;
          let color = palette.text;
          if (answered) {
            if (opt.correct) {
              bg = '#f0fdf4'; border = palette.green; color = '#065f46';
            } else if (selected === opt.id) {
              bg = '#fef2f2'; border = palette.red; color = '#991b1b';
            }
          }
          return (
            <button
              key={opt.id}
              onClick={() => handleAnswer(opt.id)}
              disabled={answered}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '10px 14px', border: `1.5px solid ${border}`,
                background: bg, cursor: answered ? 'default' : 'pointer',
                fontFamily: font.sans, fontSize: 14, color,
                fontWeight: opt.correct && answered ? 600 : 400,
                borderRadius: 4,
                transition: 'border-color 0.15s, background 0.15s',
              }}
            >
              <span style={{ fontWeight: 700, marginRight: 8 }}>{'ABCD'[i]}.</span>
              {opt.text}
            </button>
          );
        })}
      </div>
      {answered && block.explanation && (
        <div
          style={{
            marginTop: 12, padding: '10px 14px', background: '#f9fafb',
            borderLeft: `2px solid ${palette.border}`, fontSize: 13,
            color: palette.muted, fontFamily: font.sans, borderRadius: '0 4px 4px 0',
          }}
        >
          {block.explanation}
        </div>
      )}
    </div>
  );
}

function PreviewDownload({ block }: { block: any }) {
  if (!block.url) return null;
  return (
    <div style={{ margin: '16px 0' }}>
      <a
        href={block.url}
        download={block.fileName}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '10px 20px', background: palette.accent, color: '#fff',
          fontWeight: 700, fontSize: 14, textDecoration: 'none',
          borderRadius: 6, fontFamily: font.sans,
        }}
      >
        ↓ {block.fileName || 'Télécharger'}
      </a>
    </div>
  );
}

// ─── Block router ─────────────────────────────────────────────────────────────

function PreviewBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'text':      return <PreviewText block={block} />;
    case 'image':     return <PreviewImage block={block} />;
    case 'video':     return <PreviewVideo block={block} />;
    case 'audio':     return <PreviewAudio block={block} />;
    case 'code':      return <PreviewCode block={block} />;
    case 'accordion': return <PreviewAccordion block={block} />;
    case 'quote':     return <PreviewQuote block={block} />;
    case 'separator': return <PreviewSeparator block={block} />;
    case 'callout':   return <PreviewCallout block={block} />;
    case 'qcm':       return <PreviewQcm block={block} />;
    case 'qcm_scored': return <PreviewQcm block={block} />;
    case 'download':  return <PreviewDownload block={block} />;
    default:          return null;
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LessonPreview({ chapter, lesson, courseTitle }: LessonPreviewProps) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* Barre top LMS */}
      <div style={{
        borderBottom: `1px solid ${palette.border}`, padding: '10px 32px',
        display: 'flex', alignItems: 'center', gap: 12, background: '#fff', flexShrink: 0,
      }}>
        <span style={{
          fontSize: 10, fontFamily: font.mono, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: palette.accent,
          background: '#e8f0ff', padding: '3px 8px', fontWeight: 700,
        }}>Aperçu apprenant</span>
        <span style={{ fontSize: 12, color: palette.muted, fontFamily: font.mono }}>
          {courseTitle} · {chapter.title} · {lesson.title}
        </span>
      </div>

      {/* Layout LMS : sidebar + contenu */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar navigation leçon (simulée) */}
        <div style={{
          width: 220, flexShrink: 0, borderRight: `1px solid ${palette.border}`,
          background: '#fafafa', padding: '24px 0', overflowY: 'auto',
        }}>
          <div style={{ padding: '0 16px 12px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: palette.muted }}>
            {chapter.title}
          </div>
          <div style={{
            padding: '10px 16px', background: '#fff',
            borderLeft: `3px solid ${palette.accent}`,
            fontSize: 13, fontWeight: 600, color: palette.accent,
          }}>
            {lesson.title}
          </div>
          <div style={{ padding: '8px 16px', color: palette.muted, fontSize: 12, lineHeight: 1.5 }}>
            {lesson.description || ''}
          </div>
        </div>

        {/* Contenu principal — pleine largeur */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px 80px', background: '#fff' }}>

          {/* En-tête leçon */}
          <div style={{ borderBottom: `2px solid ${palette.border}`, paddingBottom: 20, marginBottom: 36 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: palette.muted, marginBottom: 6 }}>
              {chapter.title}
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: palette.text, margin: 0, lineHeight: 1.2, fontFamily: font.sans }}>
              {lesson.title}
            </h1>
            {lesson.description && (
              <p style={{ fontSize: 15, color: palette.muted, margin: '10px 0 0', lineHeight: 1.6 }}>
                {lesson.description}
              </p>
            )}
          </div>

          {/* Blocs */}
          {lesson.blocks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: palette.muted, fontSize: 14 }}>
              Cette leçon ne contient pas encore de contenu.
            </div>
          ) : (
            lesson.blocks.map((block) => (
              <PreviewBlock key={block.id} block={block} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
