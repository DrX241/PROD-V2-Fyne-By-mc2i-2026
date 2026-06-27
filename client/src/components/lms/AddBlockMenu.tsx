import React, { useEffect, useRef } from 'react';
import type { BlockType } from '../../../../shared/types/lms';

interface AddBlockMenuProps {
  onAdd: (type: BlockType) => void;
  onClose: () => void;
}

const BLOCK_GROUPS = [
  {
    label: 'Contenu',
    items: [
      { type: 'text' as BlockType, icon: 'T', label: 'Texte' },
      { type: 'image' as BlockType, icon: '🖼', label: 'Image' },
      { type: 'video' as BlockType, icon: '▶', label: 'Vidéo' },
      { type: 'audio' as BlockType, icon: '♪', label: 'Audio' },
      { type: 'code' as BlockType, icon: '{ }', label: 'Code' },
    ],
  },
  {
    label: 'Structure',
    items: [
      { type: 'accordion' as BlockType, icon: '≡', label: 'Accordéon' },
      { type: 'quote' as BlockType, icon: '"', label: 'Citation' },
      { type: 'separator' as BlockType, icon: '—', label: 'Séparateur' },
      { type: 'callout' as BlockType, icon: '!', label: 'Callout' },
    ],
  },
  {
    label: 'Interactif',
    items: [
      { type: 'qcm' as BlockType, icon: '?', label: 'QCM' },
    ],
  },
  {
    label: 'Ressources',
    items: [
      { type: 'download' as BlockType, icon: '↓', label: 'Téléchargement' },
    ],
  },
];

export function AddBlockMenu({ onAdd, onClose }: AddBlockMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: 4,
        background: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: 10,
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        zIndex: 200,
        width: 280,
        overflow: 'hidden',
      }}
    >
      {BLOCK_GROUPS.map((group) => (
        <div key={group.label}>
          <div
            style={{
              padding: '8px 14px 4px',
              fontSize: 10,
              fontFamily: "'DM Mono', monospace",
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#6b7280',
              fontWeight: 600,
            }}
          >
            {group.label}
          </div>
          {group.items.map((item) => (
            <button
              key={item.type}
              onClick={() => { onAdd(item.type); onClose(); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 14px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 13,
                color: '#0d0d0d',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#f1f5f9'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  flexShrink: 0,
                  fontWeight: 600,
                }}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
