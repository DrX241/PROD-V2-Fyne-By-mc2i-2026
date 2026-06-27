import React, { useState } from 'react';
import type { LmsCourseContent, Chapter, Lesson } from '../../../../shared/types/lms';

interface EditorSidebarProps {
  course: { content: LmsCourseContent; title: string };
  activeChapterId: string | null;
  activeLessonId: string | null;
  onSelectLesson: (chapterId: string, lessonId: string) => void;
  onAddChapter: () => void;
  onAddLesson: (chapterId: string) => void;
  onDeleteLesson: (chapterId: string, lessonId: string) => void;
  onDeleteChapter: (chapterId: string) => void;
  onUpdateChapterTitle: (chapterId: string, title: string) => void;
  onUpdateLessonTitle: (chapterId: string, lessonId: string, title: string) => void;
}

const font = { sans: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };
const palette = {
  bg: '#f8f9fa', text: '#0d0d0d', muted: '#6b7280',
  border: '#e5e7eb', accent: '#0057ff',
};

function ChapterRow({
  chapter,
  activeChapterId,
  activeLessonId,
  onSelectLesson,
  onAddLesson,
  onDeleteChapter,
  onUpdateChapterTitle,
  onDeleteLesson,
  onUpdateLessonTitle,
}: {
  chapter: Chapter;
  activeChapterId: string | null;
  activeLessonId: string | null;
  onSelectLesson: (chapterId: string, lessonId: string) => void;
  onAddLesson: (chapterId: string) => void;
  onDeleteChapter: (chapterId: string) => void;
  onUpdateChapterTitle: (chapterId: string, title: string) => void;
  onDeleteLesson: (chapterId: string, lessonId: string) => void;
  onUpdateLessonTitle: (chapterId: string, lessonId: string, title: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chapter.title);
  const [chapterHover, setChapterHover] = useState(false);

  const commitTitle = () => {
    setEditing(false);
    if (editTitle.trim()) onUpdateChapterTitle(chapter.id, editTitle.trim());
    else setEditTitle(chapter.title);
  };

  return (
    <div>
      <div
        onMouseEnter={() => setChapterHover(true)}
        onMouseLeave={() => setChapterHover(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '7px 12px',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span
          onClick={() => setExpanded((v) => !v)}
          style={{
            fontSize: 10, color: palette.muted, flexShrink: 0,
            transition: 'transform 0.15s',
            transform: expanded ? 'rotate(0)' : 'rotate(-90deg)',
            display: 'inline-block',
          }}
        >
          ▾
        </span>

        {editing ? (
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => { if (e.key === 'Enter') commitTitle(); if (e.key === 'Escape') { setEditing(false); setEditTitle(chapter.title); } }}
            style={{
              flex: 1, border: `1px solid ${palette.accent}`, borderRadius: 4,
              padding: '2px 6px', fontFamily: font.sans, fontSize: 12, fontWeight: 600,
              outline: 'none',
            }}
          />
        ) : (
          <span
            onDoubleClick={() => setEditing(true)}
            style={{
              flex: 1, fontSize: 12, fontWeight: 600, color: palette.text,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {chapter.title}
          </span>
        )}

        {chapterHover && !editing && (
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
            <button
              onClick={(e) => { e.stopPropagation(); onAddLesson(chapter.id); }}
              title="Ajouter une leçon"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: palette.accent, fontSize: 14, padding: '1px 3px', lineHeight: 1,
              }}
            >
              +
            </button>
            {chapter.lessons.length === 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteChapter(chapter.id); }}
                title="Supprimer le chapitre"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#dc2626', fontSize: 13, padding: '1px 3px', lineHeight: 1,
                }}
              >
                🗑
              </button>
            )}
          </div>
        )}
      </div>

      {expanded && (
        <div>
          {chapter.lessons.map((lesson) => (
            <LessonRow
              key={lesson.id}
              chapter={chapter}
              lesson={lesson}
              isActive={activeLessonId === lesson.id}
              onSelect={() => onSelectLesson(chapter.id, lesson.id)}
              onDelete={() => onDeleteLesson(chapter.id, lesson.id)}
              onUpdateTitle={(title) => onUpdateLessonTitle(chapter.id, lesson.id, title)}
            />
          ))}
          {chapter.lessons.length === 0 && (
            <div
              style={{
                paddingLeft: 32, paddingBottom: 6, fontSize: 11,
                color: palette.muted, fontStyle: 'italic',
              }}
            >
              Aucune leçon
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function LessonRow({
  chapter,
  lesson,
  isActive,
  onSelect,
  onDelete,
  onUpdateTitle,
}: {
  chapter: Chapter;
  lesson: Lesson;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onUpdateTitle: (title: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(lesson.title);

  const commitTitle = () => {
    setEditing(false);
    if (editTitle.trim()) onUpdateTitle(editTitle.trim());
    else setEditTitle(lesson.title);
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onSelect}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        paddingLeft: 28,
        paddingRight: 8,
        paddingTop: 6,
        paddingBottom: 6,
        cursor: 'pointer',
        background: isActive ? '#fff' : hovered ? '#f1f5f9' : 'transparent',
        borderLeft: isActive ? '2px solid #0057ff' : '2px solid transparent',
        marginLeft: 0,
      }}
    >
      <span style={{ fontSize: 10, color: palette.muted, flexShrink: 0 }}>›</span>

      {editing ? (
        <input
          autoFocus
          value={editTitle}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => setEditTitle(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => { if (e.key === 'Enter') commitTitle(); if (e.key === 'Escape') { setEditing(false); setEditTitle(lesson.title); } }}
          style={{
            flex: 1, border: `1px solid ${palette.accent}`, borderRadius: 4,
            padding: '2px 6px', fontFamily: font.sans, fontSize: 12,
            outline: 'none',
          }}
        />
      ) : (
        <span
          onDoubleClick={(e) => { e.stopPropagation(); setEditing(true); }}
          style={{
            flex: 1, fontSize: 12, color: isActive ? palette.accent : palette.text,
            fontWeight: isActive ? 600 : 400,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {lesson.title}
        </span>
      )}

      {hovered && !editing && (
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Supprimer"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#dc2626', fontSize: 12, padding: '1px 3px', lineHeight: 1, flexShrink: 0,
          }}
        >
          ×
        </button>
      )}
    </div>
  );
}

export function EditorSidebar({
  course,
  activeChapterId,
  activeLessonId,
  onSelectLesson,
  onAddChapter,
  onAddLesson,
  onDeleteLesson,
  onDeleteChapter,
  onUpdateChapterTitle,
  onUpdateLessonTitle,
}: EditorSidebarProps) {
  return (
    <div
      style={{
        width: 240,
        flexShrink: 0,
        background: palette.bg,
        borderRight: `1px solid ${palette.border}`,
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Sidebar header */}
      <div
        style={{
          padding: '14px 12px 10px',
          borderBottom: `1px solid ${palette.border}`,
          fontSize: 10,
          fontFamily: font.mono,
          color: palette.muted,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        Structure du cours
      </div>

      {/* Chapters */}
      <div style={{ flex: 1 }}>
        {course.content.chapters.map((chapter) => (
          <ChapterRow
            key={chapter.id}
            chapter={chapter}
            activeChapterId={activeChapterId}
            activeLessonId={activeLessonId}
            onSelectLesson={onSelectLesson}
            onAddLesson={onAddLesson}
            onDeleteChapter={onDeleteChapter}
            onUpdateChapterTitle={onUpdateChapterTitle}
            onDeleteLesson={onDeleteLesson}
            onUpdateLessonTitle={onUpdateLessonTitle}
          />
        ))}

        {course.content.chapters.length === 0 && (
          <div
            style={{
              padding: '20px 16px',
              textAlign: 'center',
              color: palette.muted,
              fontSize: 12,
              fontStyle: 'italic',
            }}
          >
            Aucun chapitre
          </div>
        )}
      </div>

      {/* Add chapter button */}
      <div
        style={{
          borderTop: `1px solid ${palette.border}`,
          padding: '10px 12px',
        }}
      >
        <button
          onClick={onAddChapter}
          style={{
            width: '100%',
            padding: '8px 0',
            border: `1px dashed ${palette.border}`,
            borderRadius: 6,
            background: 'none',
            cursor: 'pointer',
            fontFamily: font.sans,
            fontSize: 12,
            color: palette.muted,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <span style={{ fontSize: 15, lineHeight: 1 }}>+</span>
          Ajouter un chapitre
        </button>
      </div>
    </div>
  );
}
