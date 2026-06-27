import React, { useState } from 'react';
import type { Chapter, Lesson, Block, BlockType } from '../../../../shared/types/lms';
import { BlockItem } from './BlockItem';
import { AddBlockMenu } from './AddBlockMenu';

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
const palette = {
  bg: '#ffffff', text: '#0d0d0d', muted: '#6b7280',
  border: '#e5e7eb', accent: '#0057ff',
};

function AddBlockZone({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <div
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => { setVisible(false); }}
      style={{
        position: 'relative',
        height: 32,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '4px 0',
      }}
    >
      {(visible || open) && (
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            padding: '3px 12px',
            border: `1px dashed ${palette.border}`,
            borderRadius: 16,
            background: '#fff',
            cursor: 'pointer',
            fontFamily: font.sans,
            fontSize: 12,
            color: palette.muted,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Ajouter un bloc
        </button>
      )}
      {open && (
        <AddBlockMenu
          onAdd={(type) => { onAdd(type); setOpen(false); setVisible(false); }}
          onClose={() => { setOpen(false); setVisible(false); }}
        />
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
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '40px 48px 80px',
        background: palette.bg,
      }}
    >
      {/* Breadcrumb */}
      <div
        style={{
          fontSize: 11,
          fontFamily: font.mono,
          color: palette.muted,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        {chapter.title} / {lesson.title}
      </div>

      {/* Lesson title */}
      <h2
        style={{
          margin: '0 0 12px',
          fontSize: 26,
          fontWeight: 700,
          fontFamily: font.sans,
          color: palette.text,
          lineHeight: 1.3,
        }}
      >
        {lesson.title}
      </h2>

      {/* Lesson description */}
      <textarea
        placeholder="Description de la leçon (optionnel)..."
        value={lesson.description || ''}
        onChange={(e) => onUpdateLessonDescription(e.target.value)}
        rows={2}
        style={{
          width: '100%',
          border: 'none',
          fontFamily: font.sans,
          fontSize: 14,
          color: palette.muted,
          resize: 'none',
          outline: 'none',
          background: 'transparent',
          lineHeight: 1.6,
          marginBottom: 24,
          boxSizing: 'border-box',
          padding: 0,
        }}
      />

      <div
        style={{
          borderTop: `1px solid #f1f5f9`,
          paddingTop: 8,
        }}
      >
        {/* First add zone */}
        {lesson.blocks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✦</div>
            <div style={{ color: palette.muted, fontSize: 14, marginBottom: 16 }}>
              Cette leçon est vide. Ajoutez votre premier bloc de contenu.
            </div>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <EmptyAddButton onAdd={onAddBlock} />
            </div>
          </div>
        ) : (
          <>
            <AddBlockZone onAdd={onAddBlock} />
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
                <AddBlockZone onAdd={onAddBlock} />
              </React.Fragment>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyAddButton({ onAdd }: { onAdd: (type: BlockType) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: '10px 24px',
          border: `1px solid ${palette.accent}`,
          borderRadius: 8,
          background: palette.accent,
          cursor: 'pointer',
          fontFamily: font.sans,
          fontSize: 14,
          fontWeight: 600,
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Ajouter un bloc
      </button>
      {open && (
        <AddBlockMenu
          onAdd={(type) => { onAdd(type); setOpen(false); }}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
