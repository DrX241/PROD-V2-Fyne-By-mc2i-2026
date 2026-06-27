import React, { useState } from 'react';
import type { Block } from '../../../../shared/types/lms';

interface AiAssistPanelProps {
  open: boolean;
  onClose: () => void;
  block: Block | null;
  lessonTitle: string;
  courseTitle: string;
  courseId?: string;
  onApply: (content: string, structured?: any) => void;
}

const font = { sans: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };
const palette = {
  bg: '#ffffff', text: '#0d0d0d', muted: '#6b7280',
  border: '#e5e7eb', accent: '#0057ff',
};

const BLOCK_TYPE_LABELS: Record<string, string> = {
  text: 'Texte', image: 'Image', video: 'Vidéo', audio: 'Audio',
  accordion: 'Accordéon', quote: 'Citation', separator: 'Séparateur',
  callout: 'Callout', qcm: 'QCM', qcm_scored: 'QCM scoré', download: 'Téléchargement',
};

const PLACEHOLDER_BY_TYPE: Record<string, string> = {
  text: 'Ex: Explique ce concept en 3 points clés...',
  callout: 'Ex: Synthétise les points à retenir...',
  qcm: 'Ex: Génère une question sur les bonnes pratiques...',
  accordion: 'Ex: Propose 3 sections pour organiser ce sujet...',
  quote: 'Ex: Trouve une citation d\'expert sur ce sujet...',
  image: 'Ex: Décris l\'image idéale pour illustrer ce point...',
};

function getBlockCurrentContent(block: Block): string {
  switch (block.type) {
    case 'text': return block.html || '';
    case 'callout': return `${block.title || ''}\n${block.content}`;
    case 'qcm': return block.question;
    case 'quote': return block.text;
    case 'accordion': return block.items.map((i) => i.title).join(', ');
    default: return '';
  }
}

function SuggestionPreview({ block, structured, raw }: { block: Block; structured: any; raw: string }) {
  if (!structured) {
    return (
      <div style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: '#0d0d0d', lineHeight: 1.6, marginBottom: 4, whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto' }}>
        {raw}
      </div>
    );
  }

  if (block.type === 'qcm' || block.type === 'qcm_scored') {
    return (
      <div style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: 8, padding: '12px 14px', fontSize: 12, marginBottom: 4 }}>
        <div style={{ fontWeight: 700, marginBottom: 10, color: '#111827' }}>{structured.question}</div>
        {(structured.options || []).map((opt: any, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', marginBottom: 4, borderRadius: 5, background: opt.correct ? '#dcfce7' : '#fff', border: `1px solid ${opt.correct ? '#86efac' : '#e5e7eb'}` }}>
            <span style={{ width: 18, height: 18, borderRadius: '50%', background: opt.correct ? '#059669' : '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: opt.correct ? '#fff' : '#6b7280', flexShrink: 0, fontWeight: 700 }}>
              {'ABCD'[i]}
            </span>
            <span style={{ color: opt.correct ? '#065f46' : '#374151', fontWeight: opt.correct ? 600 : 400 }}>{opt.text}</span>
          </div>
        ))}
        {structured.explanation && (
          <div style={{ marginTop: 8, padding: '6px 10px', background: '#eff6ff', borderRadius: 5, fontSize: 11, color: '#1e40af' }}>
            💡 {structured.explanation}
          </div>
        )}
      </div>
    );
  }

  if (block.type === 'accordion') {
    return (
      <div style={{ background: '#f8f9fa', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 12px', fontSize: 12, marginBottom: 4 }}>
        {(structured.items || []).map((item: any, i: number) => (
          <div key={i} style={{ marginBottom: 8, borderBottom: i < structured.items.length - 1 ? '1px solid #e5e7eb' : 'none', paddingBottom: 8 }}>
            <div style={{ fontWeight: 700, color: '#111827', marginBottom: 3 }}>▸ {item.title}</div>
            <div style={{ color: '#6b7280' }}>{item.content}</div>
          </div>
        ))}
      </div>
    );
  }

  if (block.type === 'callout') {
    const icons: Record<string, string> = { info: 'ℹ️', warning: '⚠️', tip: '💡', danger: '❌' };
    return (
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 12px', fontSize: 12, marginBottom: 4 }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{icons[structured.variant] || 'ℹ️'} {structured.title}</div>
        <div style={{ color: '#374151' }}>{structured.content}</div>
      </div>
    );
  }

  if (block.type === 'quote') {
    return (
      <div style={{ background: '#f8f9fa', borderLeft: '3px solid #0057ff', padding: '10px 14px', borderRadius: '0 8px 8px 0', fontSize: 12, marginBottom: 4 }}>
        <div style={{ fontStyle: 'italic', color: '#374151', marginBottom: 6 }}>"{structured.text}"</div>
        <div style={{ fontWeight: 600, color: '#111827' }}>— {structured.author}{structured.role ? `, ${structured.role}` : ''}</div>
      </div>
    );
  }

  if (block.type === 'text' && structured.html) {
    return (
      <div style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 12px', fontSize: 13, lineHeight: 1.6, marginBottom: 4, maxHeight: 160, overflowY: 'auto' }}
        dangerouslySetInnerHTML={{ __html: structured.html }}
      />
    );
  }

  return (
    <div style={{ background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '10px 12px', fontSize: 13, lineHeight: 1.6, marginBottom: 4, whiteSpace: 'pre-wrap', maxHeight: 160, overflowY: 'auto' }}>
      {raw}
    </div>
  );
}

export function AiAssistPanel({
  open,
  onClose,
  block,
  lessonTitle,
  courseTitle,
  courseId,
  onApply,
}: AiAssistPanelProps) {
  const [instruction, setInstruction] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [structured, setStructured] = useState<any>(null);
  const [history, setHistory] = useState<{ text: string; structured: any }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!block) return;
    setLoading(true);
    setError(null);
    setSuggestion(null);
    setStructured(null);
    try {
      const resp = await fetch('/api/lms/ai/inspire-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          blockType: block.type,
          currentContent: getBlockCurrentContent(block),
          lessonContext: lessonTitle,
          courseTitle,
          userInstruction: instruction,
          courseId,
        }),
      });
      if (!resp.ok) throw new Error('Erreur serveur');
      const data = await resp.json();
      setSuggestion(data.suggestion);
      setStructured(data.structured || null);
      if (data.suggestion) {
        setHistory((prev) => [{ text: data.suggestion, structured: data.structured || null }, ...prev].slice(0, 3));
      }
    } catch (e) {
      setError('Impossible de générer du contenu. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        width: 300,
        flexShrink: 0,
        background: palette.bg,
        borderLeft: `1px solid ${palette.border}`,
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: `1px solid ${palette.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>✦</span>
          <span style={{ fontSize: 13, fontWeight: 700, fontFamily: font.sans }}>Assistant IA</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: palette.muted, fontSize: 18, padding: '0 2px', lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {!block ? (
          <div
            style={{
              color: palette.muted, fontSize: 13, textAlign: 'center',
              padding: '32px 0', fontStyle: 'italic',
            }}
          >
            Sélectionnez un bloc pour activer l'assistant IA.
          </div>
        ) : (
          <>
            {/* Block context */}
            <div
              style={{
                background: '#f8f9fa', borderRadius: 6, padding: '8px 10px',
                fontSize: 11, color: palette.muted, fontFamily: font.mono,
              }}
            >
              <span style={{ fontWeight: 600 }}>Bloc</span> : {BLOCK_TYPE_LABELS[block.type] || block.type}
              <br />
              <span style={{ fontWeight: 600 }}>Leçon</span> : {lessonTitle}
            </div>

            {/* Instruction */}
            <div>
              <label
                style={{
                  display: 'block', fontSize: 11, fontFamily: font.mono,
                  color: palette.muted, marginBottom: 6,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}
              >
                Instruction
              </label>
              <textarea
                placeholder={PLACEHOLDER_BY_TYPE[block.type] || 'Décrivez ce que vous souhaitez...'}
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                rows={3}
                style={{
                  width: '100%', padding: '8px 10px', border: `1px solid ${palette.border}`,
                  borderRadius: 6, fontFamily: font.sans, fontSize: 13,
                  resize: 'none', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{
                padding: '9px 0',
                background: loading ? '#e5e7eb' : palette.accent,
                color: loading ? palette.muted : '#fff',
                border: 'none',
                borderRadius: 7,
                fontFamily: font.sans,
                fontSize: 13,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              {loading ? (
                <>
                  <span style={{ fontSize: 14 }}>⟳</span> Génération...
                </>
              ) : (
                <>
                  <span style={{ fontSize: 14 }}>✦</span> Générer
                </>
              )}
            </button>

            {error && (
              <div
                style={{
                  padding: '8px 12px', background: '#fff5f5', border: '1px solid #fecaca',
                  borderRadius: 6, fontSize: 12, color: '#dc2626',
                }}
              >
                {error}
              </div>
            )}

            {/* Suggestion */}
            {suggestion && (
              <div>
                <div style={{ fontSize: 10, fontFamily: font.mono, color: palette.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Résultat IA
                </div>
                <SuggestionPreview block={block} structured={structured} raw={suggestion} />
                <button
                  onClick={() => { onApply(suggestion, structured); setSuggestion(null); setStructured(null); }}
                  style={{
                    width: '100%', padding: '9px 0', background: palette.accent,
                    border: 'none', borderRadius: 6,
                    fontFamily: font.sans, fontSize: 13, fontWeight: 600,
                    color: '#fff', cursor: 'pointer', marginTop: 8,
                  }}
                >
                  ✓ Appliquer au bloc
                </button>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontFamily: font.mono, color: palette.muted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Générations précédentes
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {history.slice(0, 3).map((h, i) => (
                    <div
                      key={i}
                      style={{ background: '#f8f9fa', borderRadius: 6, padding: '7px 10px', fontSize: 11, color: palette.muted, lineHeight: 1.5, cursor: 'pointer', overflow: 'hidden', maxHeight: 56 }}
                      onClick={() => onApply(h.text, h.structured)}
                      title="Cliquer pour appliquer"
                    >
                      {(h.structured?.question || h.structured?.html || h.text).slice(0, 100)}...
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
