import React, { useState } from 'react';
import type {
  Block, TextBlock, ImageBlock, VideoBlock, AudioBlock,
  AccordionBlock, QuoteBlock, SeparatorBlock, CalloutBlock, QcmBlock, DownloadBlock, CodeBlock,
} from '../../../../shared/types/lms';
import { MediaUploader } from './MediaUploader';

interface BlockItemProps {
  block: Block;
  courseId?: string;
  onUpdate: (patch: Partial<Block>) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onOpenAi: () => void;
}

const font = { sans: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };
const palette = {
  bg: '#ffffff', text: '#0d0d0d', muted: '#6b7280',
  border: '#e5e7eb', accent: '#0057ff', green: '#059669', red: '#dc2626',
};

function TextEditor({ block, onUpdate }: { block: TextBlock; onUpdate: (p: Partial<TextBlock>) => void }) {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onUpdate({ html: e.currentTarget.innerHTML })}
      dangerouslySetInnerHTML={{ __html: block.html || '' }}
      data-placeholder={block.aiPlaceholder || 'Écrivez votre contenu ici...'}
      style={{
        minHeight: 60,
        fontFamily: font.sans,
        fontSize: 15,
        lineHeight: 1.7,
        color: palette.text,
        outline: 'none',
        padding: '4px 0',
      }}
    />
  );
}

function ImageEditor({ block, onUpdate, courseId }: { block: ImageBlock; onUpdate: (p: Partial<ImageBlock>) => void; courseId?: string }) {
  const [uploadMode, setUploadMode] = useState<'url' | 'upload'>('url');

  if (!block.url) {
    return (
      <div
        style={{
          border: `2px dashed ${palette.border}`,
          borderRadius: 8,
          padding: '24px 16px',
        }}
      >
        <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
          {(['url', 'upload'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setUploadMode(m)}
              style={{
                padding: '4px 12px', borderRadius: 5, cursor: 'pointer', fontSize: 12,
                fontFamily: font.mono, border: `1px solid ${uploadMode === m ? palette.accent : palette.border}`,
                background: uploadMode === m ? '#e8f0ff' : 'none',
                color: uploadMode === m ? palette.accent : palette.muted,
              }}
            >
              {m === 'url' ? 'URL' : 'Upload'}
            </button>
          ))}
        </div>
        {uploadMode === 'upload' && courseId ? (
          <MediaUploader
            courseId={courseId}
            accept="image/*"
            label="Glissez une image ou cliquez pour parcourir"
            onUploaded={(url, fileName) => onUpdate({ url, alt: fileName })}
          />
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🖼</div>
              <div style={{ color: palette.muted, fontSize: 13, marginBottom: 12 }}>
                {block.aiPlaceholder || 'Ajoutez une image'}
              </div>
            </div>
            <input
              type="text"
              placeholder="URL de l'image..."
              onBlur={(e) => e.target.value && onUpdate({ url: e.target.value })}
              style={{
                width: '100%', padding: '8px 12px', border: `1px solid ${palette.border}`,
                borderRadius: 6, fontFamily: font.sans, fontSize: 13, boxSizing: 'border-box',
              }}
            />
          </>
        )}
      </div>
    );
  }
  return (
    <div>
      <img
        src={block.url}
        alt={block.alt}
        style={{
          width: block.width === 'small' ? '40%' : block.width === 'medium' ? '70%' : '100%',
          borderRadius: 8,
          display: 'block',
        }}
      />
      <input
        type="text"
        placeholder="Légende..."
        value={block.caption}
        onChange={(e) => onUpdate({ caption: e.target.value })}
        style={{
          marginTop: 6,
          width: '100%', padding: '6px 10px', border: `1px solid ${palette.border}`,
          borderRadius: 6, fontFamily: font.sans, fontSize: 12, color: palette.muted,
          boxSizing: 'border-box',
        }}
      />
      <button
        onClick={() => onUpdate({ url: '' })}
        style={{
          marginTop: 6, fontSize: 11, color: palette.red,
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}
      >
        Changer l'image
      </button>
    </div>
  );
}

function VideoEditor({ block, onUpdate, courseId }: { block: VideoBlock; onUpdate: (p: Partial<VideoBlock>) => void; courseId?: string }) {
  function getEmbedUrl(url: string): string | null {
    if (!url) return null;
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return null;
  }

  const embedUrl = block.source !== 'upload' ? getEmbedUrl(block.url) : null;

  return (
    <div>
      {/* Source toggle */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {(['youtube', 'vimeo', 'upload'] as const).map((s) => (
          <button
            key={s}
            onClick={() => onUpdate({ source: s, url: '' })}
            style={{
              padding: '3px 10px', borderRadius: 5, cursor: 'pointer', fontSize: 11,
              fontFamily: font.mono, border: `1px solid ${block.source === s ? palette.accent : palette.border}`,
              background: block.source === s ? '#e8f0ff' : 'none',
              color: block.source === s ? palette.accent : palette.muted,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {block.source === 'upload' && courseId ? (
        block.url ? (
          <div>
            <video controls src={block.url} style={{ width: '100%', borderRadius: 8 }} />
            <button
              onClick={() => onUpdate({ url: '' })}
              style={{ marginTop: 6, fontSize: 11, color: palette.red, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              Changer la vidéo
            </button>
          </div>
        ) : (
          <MediaUploader
            courseId={courseId}
            accept="video/*"
            label="Glissez une vidéo ou cliquez pour parcourir"
            onUploaded={(url, fileName) => onUpdate({ url, title: fileName })}
          />
        )
      ) : (
        <>
          <input
            type="text"
            placeholder={`URL ${block.source === 'vimeo' ? 'Vimeo' : 'YouTube'}...`}
            value={block.url}
            onChange={(e) => onUpdate({ url: e.target.value })}
            style={{
              width: '100%', padding: '8px 12px', border: `1px solid ${palette.border}`,
              borderRadius: 6, fontFamily: font.sans, fontSize: 13, marginBottom: 10,
              boxSizing: 'border-box',
            }}
          />
          {embedUrl && (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 8 }}>
              <iframe
                src={embedUrl}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allowFullScreen
                title="video"
              />
            </div>
          )}
          {!embedUrl && block.url && (
            <div style={{ color: palette.red, fontSize: 12 }}>URL YouTube ou Vimeo invalide</div>
          )}
        </>
      )}
    </div>
  );
}

function AudioEditor({ block, onUpdate, courseId }: { block: AudioBlock; onUpdate: (p: Partial<AudioBlock>) => void; courseId?: string }) {
  return (
    <div>
      <input
        type="text"
        placeholder="Titre audio..."
        value={block.title || ''}
        onChange={(e) => onUpdate({ title: e.target.value })}
        style={{
          width: '100%', padding: '7px 12px', border: `1px solid ${palette.border}`,
          borderRadius: 6, fontFamily: font.sans, fontSize: 13, marginBottom: 8,
          boxSizing: 'border-box',
        }}
      />
      <input
        type="text"
        placeholder="URL du fichier audio..."
        value={block.url}
        onChange={(e) => onUpdate({ url: e.target.value })}
        style={{
          width: '100%', padding: '7px 12px', border: `1px solid ${palette.border}`,
          borderRadius: 6, fontFamily: font.sans, fontSize: 13, marginBottom: 8,
          boxSizing: 'border-box',
        }}
      />
      {block.url && (
        <audio controls src={block.url} style={{ width: '100%' }} />
      )}
      {courseId && !block.url && (
        <MediaUploader
          courseId={courseId}
          accept="audio/*"
          label="Ou uploadez un fichier audio"
          onUploaded={(url, fileName) => onUpdate({ url, title: block.title || fileName })}
        />
      )}
    </div>
  );
}

function AccordionEditor({ block, onUpdate }: { block: AccordionBlock; onUpdate: (p: Partial<AccordionBlock>) => void }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const updateItem = (idx: number, field: 'title' | 'content', value: string) => {
    const items = block.items.map((item, i) =>
      i === idx ? { ...item, [field]: value } : item
    );
    onUpdate({ items });
  };

  const addItem = () => {
    onUpdate({ items: [...block.items, { title: `Section ${block.items.length + 1}`, content: '' }] });
  };

  const removeItem = (idx: number) => {
    onUpdate({ items: block.items.filter((_, i) => i !== idx) });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {block.items.map((item, idx) => (
        <div key={idx} style={{ border: `1px solid ${palette.border}`, borderRadius: 8, overflow: 'hidden' }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 12px', background: '#f8f9fa', cursor: 'pointer',
            }}
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
          >
            <span style={{ fontSize: 12, color: palette.muted, flexShrink: 0 }}>
              {openIdx === idx ? '▾' : '▸'}
            </span>
            <input
              type="text"
              value={item.title}
              onChange={(e) => updateItem(idx, 'title', e.target.value)}
              onClick={(e) => e.stopPropagation()}
              style={{
                flex: 1, border: 'none', background: 'none', fontFamily: font.sans,
                fontSize: 13, fontWeight: 600, color: palette.text, outline: 'none',
              }}
            />
            <button
              onClick={(e) => { e.stopPropagation(); removeItem(idx); }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: palette.red, fontSize: 14, padding: '0 4px', flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
          {openIdx === idx && (
            <textarea
              value={item.content}
              onChange={(e) => updateItem(idx, 'content', e.target.value)}
              rows={3}
              placeholder="Contenu..."
              style={{
                width: '100%', padding: '10px 12px', border: 'none', borderTop: `1px solid ${palette.border}`,
                fontFamily: font.sans, fontSize: 13, color: palette.text, resize: 'vertical',
                outline: 'none', boxSizing: 'border-box', background: '#fff',
              }}
            />
          )}
        </div>
      ))}
      <button
        onClick={addItem}
        style={{
          alignSelf: 'flex-start', padding: '6px 12px', border: `1px dashed ${palette.border}`,
          borderRadius: 6, background: 'none', cursor: 'pointer', fontFamily: font.sans,
          fontSize: 12, color: palette.muted,
        }}
      >
        + Ajouter une section
      </button>
    </div>
  );
}

function QuoteEditor({ block, onUpdate }: { block: QuoteBlock; onUpdate: (p: Partial<QuoteBlock>) => void }) {
  return (
    <div
      style={{
        borderLeft: `4px solid ${palette.accent}`,
        paddingLeft: 16,
        fontStyle: 'italic',
      }}
    >
      <textarea
        placeholder="Texte de la citation..."
        value={block.text}
        onChange={(e) => onUpdate({ text: e.target.value })}
        rows={3}
        style={{
          width: '100%', border: 'none', fontFamily: font.sans, fontSize: 15,
          color: palette.text, fontStyle: 'italic', resize: 'none', outline: 'none',
          background: 'transparent', lineHeight: 1.7, boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
        <input
          type="text"
          placeholder="Auteur..."
          value={block.author || ''}
          onChange={(e) => onUpdate({ author: e.target.value })}
          style={{
            flex: 1, padding: '5px 10px', border: `1px solid ${palette.border}`,
            borderRadius: 5, fontFamily: font.sans, fontSize: 12, fontStyle: 'normal',
          }}
        />
        <input
          type="text"
          placeholder="Rôle..."
          value={block.role || ''}
          onChange={(e) => onUpdate({ role: e.target.value })}
          style={{
            flex: 1, padding: '5px 10px', border: `1px solid ${palette.border}`,
            borderRadius: 5, fontFamily: font.sans, fontSize: 12, fontStyle: 'normal',
          }}
        />
      </div>
    </div>
  );
}

function SeparatorEditor({ block, onUpdate }: { block: SeparatorBlock; onUpdate: (p: Partial<SeparatorBlock>) => void }) {
  const style = block.style || 'line';
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {(['line', 'space', 'dots'] as const).map((s) => (
          <button
            key={s}
            onClick={() => onUpdate({ style: s })}
            style={{
              padding: '4px 10px', borderRadius: 4, cursor: 'pointer', fontSize: 11,
              fontFamily: font.mono, border: `1px solid ${style === s ? palette.accent : palette.border}`,
              background: style === s ? '#e8f0ff' : 'none',
              color: style === s ? palette.accent : palette.muted,
            }}
          >
            {s}
          </button>
        ))}
      </div>
      {style === 'line' && <hr style={{ border: 'none', borderTop: `1px solid ${palette.border}`, margin: 0 }} />}
      {style === 'space' && <div style={{ height: 32 }} />}
      {style === 'dots' && <div style={{ textAlign: 'center', color: palette.muted, letterSpacing: 8 }}>• • •</div>}
    </div>
  );
}

function CalloutEditor({ block, onUpdate }: { block: CalloutBlock; onUpdate: (p: Partial<CalloutBlock>) => void }) {
  const variantColors: Record<string, string> = {
    info: '#0057ff', warning: '#d97706', tip: '#059669', danger: '#dc2626',
  };
  const variantIcons: Record<string, string> = {
    info: 'ℹ', warning: '⚠', tip: '✓', danger: '🚨',
  };
  const color = variantColors[block.variant] || palette.accent;

  return (
    <div
      style={{
        background: `${color}15`,
        borderRadius: 8,
        padding: 16,
        border: `1px solid ${color}33`,
      }}
    >
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {(['info', 'warning', 'tip', 'danger'] as const).map((v) => (
          <button
            key={v}
            onClick={() => onUpdate({ variant: v })}
            style={{
              padding: '3px 9px', borderRadius: 4, cursor: 'pointer', fontSize: 11,
              fontFamily: font.mono, border: `1px solid ${block.variant === v ? variantColors[v] : palette.border}`,
              background: block.variant === v ? `${variantColors[v]}20` : 'none',
              color: block.variant === v ? variantColors[v] : palette.muted,
            }}
          >
            {v}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{variantIcons[block.variant]}</span>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Titre..."
            value={block.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            style={{
              width: '100%', border: 'none', background: 'transparent', fontFamily: font.sans,
              fontSize: 13, fontWeight: 700, color: color, outline: 'none',
              marginBottom: 6, boxSizing: 'border-box',
            }}
          />
          <textarea
            placeholder="Contenu..."
            value={block.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            rows={2}
            style={{
              width: '100%', border: 'none', background: 'transparent', fontFamily: font.sans,
              fontSize: 13, color: palette.text, resize: 'none', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>
    </div>
  );
}

function QcmEditor({ block, onUpdate }: { block: QcmBlock; onUpdate: (p: Partial<QcmBlock>) => void }) {
  const setCorrect = (id: string) => {
    onUpdate({ options: block.options.map((o) => ({ ...o, correct: o.id === id })) });
  };
  const updateOption = (id: string, text: string) => {
    onUpdate({ options: block.options.map((o) => (o.id === id ? { ...o, text } : o)) });
  };
  const removeOption = (id: string) => {
    onUpdate({ options: block.options.filter((o) => o.id !== id) });
  };
  const addOption = () => {
    onUpdate({ options: [...block.options, { id: crypto.randomUUID(), text: '', correct: false }] });
  };

  return (
    <div>
      <textarea
        placeholder="Question..."
        value={block.question}
        onChange={(e) => onUpdate({ question: e.target.value })}
        rows={2}
        style={{
          width: '100%', padding: '8px 12px', border: `1px solid ${palette.border}`,
          borderRadius: 6, fontFamily: font.sans, fontSize: 14, fontWeight: 600,
          resize: 'none', outline: 'none', marginBottom: 12, boxSizing: 'border-box',
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
        {block.options.map((opt) => (
          <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="radio"
              name={`qcm-${block.id}`}
              checked={opt.correct}
              onChange={() => setCorrect(opt.id)}
              title="Bonne réponse"
              style={{ accentColor: palette.green, flexShrink: 0 }}
            />
            <input
              type="text"
              placeholder="Réponse..."
              value={opt.text}
              onChange={(e) => updateOption(opt.id, e.target.value)}
              style={{
                flex: 1, padding: '6px 10px', border: `1px solid ${opt.correct ? palette.green : palette.border}`,
                borderRadius: 5, fontFamily: font.sans, fontSize: 13,
                background: opt.correct ? '#f0fdf4' : '#fff',
              }}
            />
            <button
              onClick={() => removeOption(opt.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: palette.red, fontSize: 14, padding: '0 4px', flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={addOption}
        style={{
          padding: '5px 12px', border: `1px dashed ${palette.border}`,
          borderRadius: 5, background: 'none', cursor: 'pointer',
          fontFamily: font.sans, fontSize: 12, color: palette.muted, marginBottom: 10,
        }}
      >
        + Ajouter une option
      </button>
      <textarea
        placeholder="Explication pédagogique..."
        value={block.explanation || ''}
        onChange={(e) => onUpdate({ explanation: e.target.value })}
        rows={2}
        style={{
          width: '100%', padding: '7px 12px', border: `1px solid ${palette.border}`,
          borderRadius: 6, fontFamily: font.sans, fontSize: 12, color: palette.muted,
          resize: 'none', outline: 'none', boxSizing: 'border-box',
        }}
      />
      <label
        style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, fontSize: 12, color: palette.muted, cursor: 'pointer' }}
      >
        <input
          type="checkbox"
          checked={block.showFeedback}
          onChange={(e) => onUpdate({ showFeedback: e.target.checked })}
          style={{ accentColor: palette.accent }}
        />
        Afficher le feedback après réponse
      </label>
    </div>
  );
}

function CodeEditor({ block, onUpdate }: { block: CodeBlock; onUpdate: (p: Partial<CodeBlock>) => void }) {
  const langs = ['javascript', 'typescript', 'python', 'sql', 'bash', 'html', 'css', 'json', 'plaintext'];
  return (
    <div>
      <select
        value={block.language}
        onChange={(e) => onUpdate({ language: e.target.value })}
        style={{
          fontFamily: font.mono, fontSize: 11, marginBottom: 8,
          padding: '4px 8px', border: `1px solid ${palette.border}`,
          background: '#f8f9fa', color: palette.text,
        }}
      >
        {langs.map((l) => <option key={l} value={l}>{l}</option>)}
      </select>
      <textarea
        value={block.code}
        onChange={(e) => onUpdate({ code: e.target.value })}
        placeholder={block.aiPlaceholder || 'Votre code ici...'}
        style={{
          width: '100%', minHeight: 140, fontFamily: font.mono, fontSize: 13,
          lineHeight: 1.6, padding: 16, background: '#0d1117', color: '#e6edf3',
          border: 'none', resize: 'vertical', boxSizing: 'border-box', outline: 'none',
        }}
        spellCheck={false}
      />
    </div>
  );
}

function DownloadEditor({ block, onUpdate }: { block: DownloadBlock; onUpdate: (p: Partial<DownloadBlock>) => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        type="text"
        placeholder="URL du fichier..."
        value={block.url}
        onChange={(e) => onUpdate({ url: e.target.value })}
        style={{
          width: '100%', padding: '7px 12px', border: `1px solid ${palette.border}`,
          borderRadius: 6, fontFamily: font.sans, fontSize: 13, boxSizing: 'border-box',
        }}
      />
      <input
        type="text"
        placeholder="Nom du fichier..."
        value={block.fileName}
        onChange={(e) => onUpdate({ fileName: e.target.value })}
        style={{
          width: '100%', padding: '7px 12px', border: `1px solid ${palette.border}`,
          borderRadius: 6, fontFamily: font.sans, fontSize: 13, boxSizing: 'border-box',
        }}
      />
      {(block.fileType || block.fileSize) && (
        <div style={{ display: 'flex', gap: 6 }}>
          {block.fileType && (
            <span
              style={{
                padding: '2px 8px', borderRadius: 4, background: '#f1f5f9',
                fontSize: 11, fontFamily: font.mono, color: palette.muted,
              }}
            >
              {block.fileType}
            </span>
          )}
          {block.fileSize && (
            <span
              style={{
                padding: '2px 8px', borderRadius: 4, background: '#f1f5f9',
                fontSize: 11, fontFamily: font.mono, color: palette.muted,
              }}
            >
              {Math.round(block.fileSize / 1024)} Ko
            </span>
          )}
        </div>
      )}
      {block.url && (
        <a
          href={block.url}
          download={block.fileName}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', background: '#f8f9fa', border: `1px solid ${palette.border}`,
            borderRadius: 6, fontFamily: font.sans, fontSize: 13, color: palette.text,
            textDecoration: 'none', alignSelf: 'flex-start',
          }}
        >
          ↓ {block.fileName || 'Télécharger'}
        </a>
      )}
    </div>
  );
}

function BlockContent({ block, onUpdate, courseId }: { block: Block; onUpdate: (patch: Partial<Block>) => void; courseId?: string }) {
  switch (block.type) {
    case 'text':
      return <TextEditor block={block} onUpdate={onUpdate as (p: Partial<TextBlock>) => void} />;
    case 'image':
      return <ImageEditor block={block} onUpdate={onUpdate as (p: Partial<ImageBlock>) => void} courseId={courseId} />;
    case 'video':
      return <VideoEditor block={block} onUpdate={onUpdate as (p: Partial<VideoBlock>) => void} courseId={courseId} />;
    case 'audio':
      return <AudioEditor block={block} onUpdate={onUpdate as (p: Partial<AudioBlock>) => void} courseId={courseId} />;
    case 'accordion':
      return <AccordionEditor block={block} onUpdate={onUpdate as (p: Partial<AccordionBlock>) => void} />;
    case 'quote':
      return <QuoteEditor block={block} onUpdate={onUpdate as (p: Partial<QuoteBlock>) => void} />;
    case 'separator':
      return <SeparatorEditor block={block} onUpdate={onUpdate as (p: Partial<SeparatorBlock>) => void} />;
    case 'callout':
      return <CalloutEditor block={block} onUpdate={onUpdate as (p: Partial<CalloutBlock>) => void} />;
    case 'qcm':
      return <QcmEditor block={block} onUpdate={onUpdate as (p: Partial<QcmBlock>) => void} />;
    case 'qcm_scored':
      return (
        <div style={{ color: palette.muted, fontSize: 13, fontStyle: 'italic' }}>
          QCM scoré — éditeur similaire au QCM standard
        </div>
      );
    case 'download':
      return <DownloadEditor block={block} onUpdate={onUpdate as (p: Partial<DownloadBlock>) => void} />;
    case 'code':
      return <CodeEditor block={block} onUpdate={onUpdate as (p: Partial<CodeBlock>) => void} />;
    default:
      return <div style={{ color: palette.muted, fontSize: 13 }}>Type de bloc non supporté</div>;
  }
}

const BLOCK_TYPE_LABELS: Record<string, string> = {
  text: 'Texte', image: 'Image', video: 'Vidéo', audio: 'Audio',
  accordion: 'Accordéon', quote: 'Citation', separator: 'Séparateur',
  callout: 'Callout', qcm: 'QCM', qcm_scored: 'QCM scoré', download: 'Téléchargement',
  code: 'Code',
};

export function BlockItem({ block, courseId, onUpdate, onDelete, onMoveUp, onMoveDown, onOpenAi }: BlockItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        padding: '16px 0',
        borderBottom: `1px solid #f1f5f9`,
        display: 'flex',
        gap: 8,
      }}
    >
      {/* Left toolbar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s',
          flexShrink: 0,
          width: 24,
          paddingTop: 2,
        }}
      >
        <button
          title="Déplacer"
          style={{
            background: 'none', border: 'none', cursor: 'grab', color: palette.muted,
            fontSize: 14, padding: '2px', lineHeight: 1,
          }}
        >
          ≡
        </button>
        <button
          onClick={onMoveUp}
          title="Monter"
          style={{
            background: 'none', border: 'none', cursor: 'pointer', color: palette.muted,
            fontSize: 11, padding: '2px', lineHeight: 1,
          }}
        >
          ↑
        </button>
        <button
          onClick={onMoveDown}
          title="Descendre"
          style={{
            background: 'none', border: 'none', cursor: 'pointer', color: palette.muted,
            fontSize: 11, padding: '2px', lineHeight: 1,
          }}
        >
          ↓
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Block type badge */}
        <div
          style={{
            fontSize: 10, fontFamily: font.mono, color: palette.muted,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            marginBottom: 8, opacity: hovered ? 1 : 0, transition: 'opacity 0.15s',
          }}
        >
          {BLOCK_TYPE_LABELS[block.type] || block.type}
        </div>
        <BlockContent block={block} onUpdate={onUpdate} courseId={courseId} />
      </div>

      {/* Right toolbar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s',
          flexShrink: 0,
          paddingTop: 2,
        }}
      >
        <button
          onClick={onOpenAi}
          title="Assistant IA"
          style={{
            background: 'none', border: `1px solid ${palette.accent}`,
            borderRadius: 5, cursor: 'pointer', color: palette.accent,
            fontSize: 12, padding: '3px 6px', lineHeight: 1,
          }}
        >
          ✦
        </button>
        <button
          onClick={onDelete}
          title="Supprimer"
          style={{
            background: 'none', border: `1px solid ${palette.border}`,
            borderRadius: 5, cursor: 'pointer', color: palette.red,
            fontSize: 14, padding: '2px 6px', lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
}
