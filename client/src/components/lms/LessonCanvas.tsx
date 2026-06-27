import React, { useState } from 'react';
import type { Chapter, Lesson, Block, BlockType } from '../../../../shared/types/lms';
import { BlockItem } from './BlockItem';

interface LessonCanvasProps {
  chapter: Chapter;
  lesson: Lesson;
  courseId?: string;
  onAddBlock: (type: BlockType) => void;
  onUpdateBlock: (blockId: string, patch: Partial<Block>) => void;
  onDeleteBlock: (blockId: string) => void;
  onMoveBlock: (fromIdx: number, toIdx: number) => void;
  onOpenAi: (blockId: string) => void;
  onUpdateLessonDescription: (description: string) => void;
}

const font = { sans: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };
const palette = { bg: '#ffffff', text: '#0d0d0d', muted: '#6b7280', border: '#e5e7eb', accent: '#0057ff' };

function AddBlockZone({ onAdd }: { onAdd: () => void }) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      style={{ height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '2px 0', position: 'relative' }}
    >
      {visible && (
        <>
          <div style={{ position: 'absolute', left: 0, right: 0, height: 1, background: palette.accent, opacity: 0.3 }} />
          <button
            onClick={onAdd}
            style={{
              padding: '2px 12px', border: `1px solid ${palette.accent}`, borderRadius: 12,
              background: '#fff', cursor: 'pointer', fontFamily: font.sans, fontSize: 11,
              color: palette.accent, fontWeight: 600, zIndex: 1, position: 'relative',
              display: 'flex', alignItems: 'center', gap: 3,
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>+</span> Insérer ici
          </button>
        </>
      )}
    </div>
  );
}

export function LessonCanvas({
  chapter,
  lesson,
  courseId,
  onAddBlock,
  onUpdateBlock,
  onDeleteBlock,
  onMoveBlock,
  onOpenAi,
  onUpdateLessonDescription,
}: LessonCanvasProps) {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '40px 48px 80px', background: palette.bg }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 11, fontFamily: font.mono, color: palette.muted, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 16 }}>
        {chapter.title} / {lesson.title}
      </div>

      {/* Lesson title */}
      <h2 style={{ margin: '0 0 12px', fontSize: 26, fontWeight: 700, fontFamily: font.sans, color: palette.text, lineHeight: 1.3 }}>
        {lesson.title}
      </h2>

      {/* Lesson description */}
      <textarea
        placeholder="Description de la leçon (optionnel)..."
        value={lesson.description || ''}
        onChange={(e) => onUpdateLessonDescription(e.target.value)}
        rows={2}
        style={{
          width: '100%', border: 'none', fontFamily: font.sans, fontSize: 14,
          color: palette.muted, resize: 'none', outline: 'none', background: 'transparent',
          lineHeight: 1.6, marginBottom: 24, boxSizing: 'border-box', padding: 0,
        }}
      />

      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
        {lesson.blocks.length === 0 ? (
          <EmptyLessonState onAdd={onAddBlock} />
        ) : (
          <>
            <AddBlockZone onAdd={() => onAddBlock('text')} />
            {lesson.blocks.map((block, idx) => (
              <React.Fragment key={block.id}>
                <BlockItem
                  block={block}
                  courseId={courseId}
                  onUpdate={(patch) => onUpdateBlock(block.id, patch)}
                  onDelete={() => onDeleteBlock(block.id)}
                  onMoveUp={() => onMoveBlock(idx, idx - 1)}
                  onMoveDown={() => onMoveBlock(idx, idx + 1)}
                  onOpenAi={() => onOpenAi(block.id)}
                />
                <AddBlockZone onAdd={() => onAddBlock('text')} />
              </React.Fragment>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

const QUICK_BLOCKS: { type: BlockType; icon: string; label: string }[] = [
  { type: 'text', icon: 'T', label: 'Texte' },
  { type: 'image', icon: '⬜', label: 'Image' },
  { type: 'video', icon: '▶', label: 'Vidéo' },
  { type: 'qcm', icon: '?', label: 'QCM' },
  { type: 'callout', icon: '!', label: 'Callout' },
  { type: 'accordion', icon: '≡', label: 'Accordéon' },
  { type: 'quote', icon: '"', label: 'Citation' },
  { type: 'code', icon: '</>', label: 'Code' },
];

function EmptyLessonState({ onAdd }: { onAdd: (type: BlockType) => void }) {
  return (
    <div style={{ padding: '48px 0 32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: palette.text, marginBottom: 4 }}>
          Ajoutez votre premier bloc
        </div>
        <div style={{ fontSize: 12, color: palette.muted }}>
          Choisissez un type dans la bibliothèque à gauche, ou cliquez sur un bloc ci-dessous
        </div>
      </div>

      {/* Quick block picker */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', maxWidth: 480 }}>
        {QUICK_BLOCKS.map(b => (
          <QuickBlockChip key={b.type} icon={b.icon} label={b.label} onClick={() => onAdd(b.type)} />
        ))}
      </div>
    </div>
  );
}

function QuickBlockChip({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px',
        border: `1px solid ${hov ? palette.accent : palette.border}`,
        borderRadius: 6, background: hov ? '#e8f0ff' : '#fff', cursor: 'pointer',
        fontFamily: font.sans, fontSize: 12, color: hov ? palette.accent : palette.text,
        fontWeight: 500, transition: 'all 0.1s',
      }}
    >
      <span style={{ fontFamily: font.mono, fontSize: 11 }}>{icon}</span>
      {label}
    </button>
  );
}
