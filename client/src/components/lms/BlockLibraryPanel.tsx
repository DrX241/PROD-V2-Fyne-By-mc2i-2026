import React, { useState } from 'react';
import type { BlockType } from '../../../../shared/types/lms';

interface BlockLibraryPanelProps {
  onAdd: (type: BlockType) => void;
}

const font = { sans: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };
const palette = { bg: '#f8f9fa', text: '#0d0d0d', muted: '#6b7280', border: '#e5e7eb', accent: '#0057ff' };

const BLOCK_GROUPS = [
  {
    label: 'IA',
    color: '#0057ff',
    items: [
      { type: 'text' as BlockType, icon: '✦', label: 'Bloc IA', desc: 'Générer du texte avec l\'IA', ai: true },
      { type: 'qcm' as BlockType, icon: '✦', label: 'QCM IA', desc: 'Générer un quiz avec l\'IA', ai: true },
    ],
  },
  {
    label: 'Contenu',
    color: palette.muted,
    items: [
      { type: 'text' as BlockType, icon: 'T', label: 'Texte', desc: 'Paragraphe ou titre' },
      { type: 'image' as BlockType, icon: '⬜', label: 'Image', desc: 'Photo ou illustration' },
      { type: 'video' as BlockType, icon: '▶', label: 'Vidéo', desc: 'YouTube ou Vimeo' },
      { type: 'audio' as BlockType, icon: '♪', label: 'Audio', desc: 'Fichier sonore' },
      { type: 'code' as BlockType, icon: '</>', label: 'Code', desc: 'Bloc de code coloré' },
    ],
  },
  {
    label: 'Structure',
    color: palette.muted,
    items: [
      { type: 'accordion' as BlockType, icon: '≡', label: 'Accordéon', desc: 'Sections dépliables' },
      { type: 'callout' as BlockType, icon: '!', label: 'Callout', desc: 'Info, conseil, alerte' },
      { type: 'quote' as BlockType, icon: '"', label: 'Citation', desc: 'Citation d\'expert' },
      { type: 'separator' as BlockType, icon: '—', label: 'Séparateur', desc: 'Ligne de séparation' },
    ],
  },
  {
    label: 'Interactif',
    color: '#059669',
    items: [
      { type: 'qcm' as BlockType, icon: '?', label: 'QCM', desc: 'Question à choix multiple' },
      { type: 'qcm_scored' as BlockType, icon: '★', label: 'QCM scoré', desc: 'QCM avec points' },
    ],
  },
  {
    label: 'Ressources',
    color: palette.muted,
    items: [
      { type: 'download' as BlockType, icon: '↓', label: 'Téléchargement', desc: 'Fichier à télécharger' },
    ],
  },
];

export function BlockLibraryPanel({ onAdd }: BlockLibraryPanelProps) {
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const allItems = BLOCK_GROUPS.flatMap(g =>
    g.items.map(item => ({ ...item, groupLabel: g.label, groupColor: g.color }))
  );

  const filtered = search
    ? allItems.filter(i => i.label.toLowerCase().includes(search.toLowerCase()) || i.desc.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div
      style={{
        width: 200,
        flexShrink: 0,
        background: palette.bg,
        borderRight: `1px solid ${palette.border}`,
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}
    >
      {/* Header */}
      <div style={{ padding: '12px 12px 8px', borderBottom: `1px solid ${palette.border}`, flexShrink: 0 }}>
        <div style={{ fontSize: 10, fontFamily: font.mono, color: palette.muted, letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>
          Bibliothèque
        </div>
        <input
          placeholder="Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '5px 8px', border: `1px solid ${palette.border}`,
            borderRadius: 5, fontFamily: font.sans, fontSize: 12, outline: 'none',
            background: '#fff', boxSizing: 'border-box', color: palette.text,
          }}
        />
      </div>

      {/* Block list */}
      <div style={{ flex: 1, padding: '8px 0' }}>
        {filtered ? (
          <div>
            {filtered.map((item, i) => (
              <BlockLibItem
                key={`${item.type}-${item.groupLabel}-${i}`}
                icon={item.icon}
                label={item.label}
                desc={item.desc}
                isAi={(item as any).ai}
                hovered={hoveredType === `${item.type}-${item.groupLabel}-${i}`}
                onMouseEnter={() => setHoveredType(`${item.type}-${item.groupLabel}-${i}`)}
                onMouseLeave={() => setHoveredType(null)}
                onClick={() => onAdd(item.type)}
              />
            ))}
          </div>
        ) : (
          BLOCK_GROUPS.map(group => (
            <div key={group.label}>
              <div style={{ padding: '10px 12px 4px', fontSize: 9, fontFamily: font.mono, color: palette.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}>
                {group.label}
              </div>
              {group.items.map((item, i) => (
                <BlockLibItem
                  key={`${item.type}-${i}`}
                  icon={item.icon}
                  label={item.label}
                  desc={item.desc}
                  isAi={(item as any).ai}
                  hovered={hoveredType === `${group.label}-${item.type}-${i}`}
                  onMouseEnter={() => setHoveredType(`${group.label}-${item.type}-${i}`)}
                  onMouseLeave={() => setHoveredType(null)}
                  onClick={() => onAdd(item.type)}
                />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function BlockLibItem({
  icon, label, desc, isAi, hovered, onMouseEnter, onMouseLeave, onClick,
}: {
  icon: string; label: string; desc: string; isAi?: boolean;
  hovered: boolean; onMouseEnter: () => void; onMouseLeave: () => void; onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 12px', cursor: 'pointer',
        background: hovered ? '#fff' : 'transparent',
        transition: 'background 0.1s',
      }}
    >
      <div style={{
        width: 28, height: 28, borderRadius: 6, flexShrink: 0,
        background: isAi ? '#e8f0ff' : (hovered ? '#f1f5f9' : '#ebebeb'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: isAi ? '#0057ff' : '#6b7280',
        fontFamily: "'DM Mono', monospace",
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: isAi ? '#0057ff' : '#0d0d0d', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </div>
        <div style={{ fontSize: 10, color: '#9ca3af', fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {desc}
        </div>
      </div>
    </div>
  );
}
