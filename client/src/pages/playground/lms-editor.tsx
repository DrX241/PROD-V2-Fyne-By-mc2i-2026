import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation, useRoute } from 'wouter';
import type { LmsCourse } from '../../../../shared/schema';
import type { LmsCourseContent, Chapter, Lesson, Block, BlockType } from '../../../../shared/types/lms';
import { EditorSidebar } from '../../components/lms/EditorSidebar';
import { LessonCanvas } from '../../components/lms/LessonCanvas';
import { AiAssistPanel } from '../../components/lms/AiAssistPanel';

// ─── Helpers ────────────────────────────────────────────────────────────────

function createBlock(type: BlockType): Block {
  const id = crypto.randomUUID();
  switch (type) {
    case 'text':
      return { id, type, html: '', aiPlaceholder: 'Écrivez votre contenu ici...' };
    case 'image':
      return { id, type, url: '', caption: '', alt: '', width: 'full', aiPlaceholder: 'Ajoutez une image illustrant ce concept...' };
    case 'video':
      return { id, type, source: 'youtube', url: '', aiPlaceholder: 'Ajoutez une vidéo YouTube ou Vimeo...' };
    case 'audio':
      return { id, type, url: '', title: '', aiPlaceholder: 'Ajoutez un fichier audio...' };
    case 'accordion':
      return { id, type, items: [{ title: 'Section 1', content: '' }], aiPlaceholder: 'Organisez votre contenu en accordéon...' };
    case 'quote':
      return { id, type, text: '', author: '', role: '', aiPlaceholder: 'Ajoutez une citation marquante...' };
    case 'separator':
      return { id, type, style: 'line' };
    case 'callout':
      return { id, type, variant: 'info', title: 'À retenir', content: '', aiPlaceholder: 'Mettez en avant un point clé...' };
    case 'qcm':
      return {
        id, type,
        question: '',
        options: [
          { id: crypto.randomUUID(), text: '', correct: false },
          { id: crypto.randomUUID(), text: '', correct: false },
          { id: crypto.randomUUID(), text: '', correct: true },
          { id: crypto.randomUUID(), text: '', correct: false },
        ],
        explanation: '',
        showFeedback: true,
      };
    case 'qcm_scored':
      return {
        id, type,
        question: '',
        options: [
          { id: crypto.randomUUID(), text: '', correct: false },
          { id: crypto.randomUUID(), text: '', correct: false },
          { id: crypto.randomUUID(), text: '', correct: true },
          { id: crypto.randomUUID(), text: '', correct: false },
        ],
        explanation: '',
        points: 1,
      };
    case 'download':
      return { id, type, url: '', fileName: '', aiPlaceholder: 'Ajoutez un fichier à télécharger...' };
    default:
      return { id, type: 'text', html: '' } as any;
  }
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const font = { sans: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };
const palette = {
  bg: '#ffffff', text: '#0d0d0d', muted: '#6b7280',
  border: '#e5e7eb', accent: '#0057ff', green: '#059669', red: '#dc2626',
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LmsEditorPage() {
  const [, navigate] = useLocation();
  const [, params] = useRoute('/playground/lms/editor/:id');
  const courseId = params?.id;

  const [course, setCourse] = useState<LmsCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [aiTargetBlockId, setAiTargetBlockId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/lms/courses/${courseId}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: LmsCourse) => {
        setCourse(data);
        setTitleDraft(data.title);
        const chapters = (data.content as any)?.chapters ?? [];
        if (chapters.length > 0) {
          setActiveChapterId(chapters[0].id);
          if (chapters[0].lessons?.length > 0) {
            setActiveLessonId(chapters[0].lessons[0].id);
          }
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Impossible de charger le cours.');
        setLoading(false);
      });
  }, [courseId]);

  // ── Auto-save ─────────────────────────────────────────────────────────────

  const scheduleSave = useCallback((updatedCourse: LmsCourse) => {
    setSaveState('unsaved');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveState('saving');
      try {
        await fetch(`/api/lms/courses/${updatedCourse.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: updatedCourse.title,
            content: updatedCourse.content,
            description: updatedCourse.description,
            estimatedDurationMin: updatedCourse.estimatedDurationMin,
          }),
        });
        setSaveState('saved');
      } catch {
        setSaveState('unsaved');
      }
    }, 2000);
  }, []);

  // ── Content mutators ──────────────────────────────────────────────────────

  const updateCourse = useCallback((updater: (prev: LmsCourse) => LmsCourse) => {
    setCourse((prev) => {
      if (!prev) return prev;
      const updated = updater(prev);
      scheduleSave(updated);
      return updated;
    });
  }, [scheduleSave]);

  const getContent = (c: LmsCourse): LmsCourseContent => c.content as unknown as LmsCourseContent;

  const addChapter = () => {
    const id = crypto.randomUUID();
    updateCourse((prev) => {
      const content = getContent(prev);
      return {
        ...prev,
        content: {
          ...content,
          chapters: [
            ...content.chapters,
            { id, title: 'Nouveau chapitre', lessons: [], order: content.chapters.length },
          ],
        } as any,
      };
    });
    setActiveChapterId(id);
  };

  const addLesson = (chapterId: string) => {
    const id = crypto.randomUUID();
    updateCourse((prev) => {
      const content = getContent(prev);
      return {
        ...prev,
        content: {
          ...content,
          chapters: content.chapters.map((ch) =>
            ch.id === chapterId
              ? { ...ch, lessons: [...ch.lessons, { id, title: 'Nouvelle leçon', blocks: [], description: '' }] }
              : ch
          ),
        } as any,
      };
    });
    setActiveChapterId(chapterId);
    setActiveLessonId(id);
  };

  const addBlock = (chapterId: string, lessonId: string, type: BlockType) => {
    const block = createBlock(type);
    updateCourse((prev) => {
      const content = getContent(prev);
      return {
        ...prev,
        content: {
          ...content,
          chapters: content.chapters.map((ch) =>
            ch.id === chapterId
              ? {
                  ...ch,
                  lessons: ch.lessons.map((l) =>
                    l.id === lessonId ? { ...l, blocks: [...l.blocks, block] } : l
                  ),
                }
              : ch
          ),
        } as any,
      };
    });
  };

  const updateBlock = (chapterId: string, lessonId: string, blockId: string, patch: Partial<Block>) => {
    updateCourse((prev) => {
      const content = getContent(prev);
      return {
        ...prev,
        content: {
          ...content,
          chapters: content.chapters.map((ch) =>
            ch.id === chapterId
              ? {
                  ...ch,
                  lessons: ch.lessons.map((l) =>
                    l.id === lessonId
                      ? {
                          ...l,
                          blocks: l.blocks.map((b) => (b.id === blockId ? { ...b, ...patch } as Block : b)),
                        }
                      : l
                  ),
                }
              : ch
          ),
        } as any,
      };
    });
  };

  const deleteBlock = (chapterId: string, lessonId: string, blockId: string) => {
    updateCourse((prev) => {
      const content = getContent(prev);
      return {
        ...prev,
        content: {
          ...content,
          chapters: content.chapters.map((ch) =>
            ch.id === chapterId
              ? {
                  ...ch,
                  lessons: ch.lessons.map((l) =>
                    l.id === lessonId ? { ...l, blocks: l.blocks.filter((b) => b.id !== blockId) } : l
                  ),
                }
              : ch
          ),
        } as any,
      };
    });
  };

  const moveBlock = (chapterId: string, lessonId: string, fromIdx: number, toIdx: number) => {
    if (toIdx < 0) return;
    updateCourse((prev) => {
      const content = getContent(prev);
      return {
        ...prev,
        content: {
          ...content,
          chapters: content.chapters.map((ch) =>
            ch.id === chapterId
              ? {
                  ...ch,
                  lessons: ch.lessons.map((l) => {
                    if (l.id !== lessonId) return l;
                    if (toIdx >= l.blocks.length) return l;
                    const blocks = [...l.blocks];
                    const [removed] = blocks.splice(fromIdx, 1);
                    blocks.splice(toIdx, 0, removed);
                    return { ...l, blocks };
                  }),
                }
              : ch
          ),
        } as any,
      };
    });
  };

  const deleteLesson = (chapterId: string, lessonId: string) => {
    updateCourse((prev) => {
      const content = getContent(prev);
      const updatedChapters = content.chapters.map((ch) =>
        ch.id === chapterId ? { ...ch, lessons: ch.lessons.filter((l) => l.id !== lessonId) } : ch
      );
      // Reselect if active
      if (activeLessonId === lessonId) {
        const ch = updatedChapters.find((c) => c.id === chapterId);
        const newLesson = ch?.lessons[0] ?? null;
        setActiveLessonId(newLesson?.id ?? null);
        if (!newLesson) {
          const firstChWithLesson = updatedChapters.find((c) => c.lessons.length > 0);
          if (firstChWithLesson) {
            setActiveChapterId(firstChWithLesson.id);
            setActiveLessonId(firstChWithLesson.lessons[0].id);
          }
        }
      }
      return { ...prev, content: { ...content, chapters: updatedChapters } as any };
    });
  };

  const deleteChapter = (chapterId: string) => {
    updateCourse((prev) => {
      const content = getContent(prev);
      const chapters = content.chapters.filter((ch) => ch.id !== chapterId);
      if (activeChapterId === chapterId) {
        setActiveChapterId(chapters[0]?.id ?? null);
        setActiveLessonId(chapters[0]?.lessons[0]?.id ?? null);
      }
      return { ...prev, content: { ...content, chapters } as any };
    });
  };

  const updateLessonTitle = (chapterId: string, lessonId: string, title: string) => {
    updateCourse((prev) => {
      const content = getContent(prev);
      return {
        ...prev,
        content: {
          ...content,
          chapters: content.chapters.map((ch) =>
            ch.id === chapterId
              ? { ...ch, lessons: ch.lessons.map((l) => (l.id === lessonId ? { ...l, title } : l)) }
              : ch
          ),
        } as any,
      };
    });
  };

  const updateChapterTitle = (chapterId: string, title: string) => {
    updateCourse((prev) => {
      const content = getContent(prev);
      return {
        ...prev,
        content: {
          ...content,
          chapters: content.chapters.map((ch) => (ch.id === chapterId ? { ...ch, title } : ch)),
        } as any,
      };
    });
  };

  const updateLessonDescription = (chapterId: string, lessonId: string, description: string) => {
    updateCourse((prev) => {
      const content = getContent(prev);
      return {
        ...prev,
        content: {
          ...content,
          chapters: content.chapters.map((ch) =>
            ch.id === chapterId
              ? { ...ch, lessons: ch.lessons.map((l) => (l.id === lessonId ? { ...l, description } : l)) }
              : ch
          ),
        } as any,
      };
    });
  };

  const commitCourseTitle = () => {
    setEditingTitle(false);
    if (!titleDraft.trim()) return;
    updateCourse((prev) => ({ ...prev, title: titleDraft.trim() }));
  };

  const handlePublish = async () => {
    if (!course) return;
    try {
      await fetch(`/api/lms/courses/${course.id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: !course.published }),
      });
      setCourse((prev) => prev ? { ...prev, published: !prev.published } : prev);
    } catch {
      // silent
    }
  };

  // ── AI helpers ────────────────────────────────────────────────────────────

  const handleApplyAi = (content: string) => {
    if (!aiTargetBlockId || !activeChapterId || !activeLessonId) return;
    const ch = activeLesson;
    if (!ch) return;
    const block = activeLesson?.blocks.find((b) => b.id === aiTargetBlockId);
    if (!block) return;
    // Apply based on type
    switch (block.type) {
      case 'text':
        updateBlock(activeChapterId, activeLessonId, aiTargetBlockId, { html: content } as any);
        break;
      case 'callout':
        updateBlock(activeChapterId, activeLessonId, aiTargetBlockId, { content } as any);
        break;
      case 'quote':
        updateBlock(activeChapterId, activeLessonId, aiTargetBlockId, { text: content } as any);
        break;
      case 'qcm':
        updateBlock(activeChapterId, activeLessonId, aiTargetBlockId, { question: content } as any);
        break;
      default:
        break;
    }
  };

  // ── Derived values ────────────────────────────────────────────────────────

  const content = course ? getContent(course) : null;

  const activeChapter = content?.chapters.find((ch) => ch.id === activeChapterId) ?? null;
  const activeLesson = activeChapter?.lessons.find((l) => l.id === activeLessonId) ?? null;
  const aiTargetBlock = activeLesson?.blocks.find((b) => b.id === aiTargetBlockId) ?? null;

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ fontFamily: font.sans, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: palette.muted }}>
        Chargement du cours...
      </div>
    );
  }

  if (error || !course) {
    return (
      <div style={{ fontFamily: font.sans, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 8, padding: '16px 24px', color: palette.red }}>
          {error || 'Cours introuvable'}
        </div>
      </div>
    );
  }

  const saveLabel =
    saveState === 'saving' ? 'Enregistrement...' :
    saveState === 'unsaved' ? 'Non enregistré' :
    'Enregistré';
  const saveColor =
    saveState === 'saving' ? palette.muted :
    saveState === 'unsaved' ? '#d97706' :
    palette.green;

  return (
    <div
      style={{
        fontFamily: font.sans,
        background: palette.bg,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── HEADER ── */}
      <div
        style={{
          borderBottom: `1px solid ${palette.border}`,
          padding: '0 20px',
          height: 52,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: palette.bg,
          zIndex: 20,
          flexShrink: 0,
        }}
      >
        {/* Left: back + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => navigate('/playground/lms')}
            style={{
              background: 'none', border: `1px solid ${palette.border}`,
              borderRadius: 6, cursor: 'pointer', color: palette.text,
              fontFamily: font.sans, fontSize: 12, fontWeight: 500,
              padding: '5px 10px', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            ← Mes cours
          </button>

          <div style={{ height: 20, width: 1, background: palette.border }} />

          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitCourseTitle}
              onKeyDown={(e) => { if (e.key === 'Enter') commitCourseTitle(); if (e.key === 'Escape') { setEditingTitle(false); setTitleDraft(course.title); } }}
              style={{
                border: `1px solid ${palette.accent}`, borderRadius: 5, padding: '4px 8px',
                fontFamily: font.sans, fontSize: 15, fontWeight: 700, outline: 'none', minWidth: 200,
              }}
            />
          ) : (
            <span
              onDoubleClick={() => { setEditingTitle(true); setTitleDraft(course.title); }}
              title="Double-clic pour renommer"
              style={{
                fontSize: 15, fontWeight: 700, cursor: 'text',
                padding: '4px 6px', borderRadius: 4,
              }}
            >
              {course.title}
            </span>
          )}

          <span
            style={{
              fontSize: 10, fontFamily: font.mono, color: palette.muted,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              padding: '3px 7px', background: '#f1f5f9', borderRadius: 4,
            }}
          >
            {course.status}
          </span>
        </div>

        {/* Right: save state + AI toggle + publish */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontSize: 11, fontFamily: font.mono, color: saveColor,
              letterSpacing: '0.04em',
            }}
          >
            {saveLabel}
          </span>

          <button
            onClick={() => setAiPanelOpen((v) => !v)}
            style={{
              padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
              fontFamily: font.sans, fontSize: 12, fontWeight: 600,
              border: `1px solid ${aiPanelOpen ? palette.accent : palette.border}`,
              background: aiPanelOpen ? '#e8f0ff' : 'none',
              color: aiPanelOpen ? palette.accent : palette.muted,
              display: 'flex', alignItems: 'center', gap: 5,
            }}
          >
            <span>✦</span> IA
          </button>

          <button
            onClick={handlePublish}
            style={{
              padding: '5px 14px', borderRadius: 6, cursor: 'pointer',
              fontFamily: font.sans, fontSize: 12, fontWeight: 600,
              background: course.published ? '#fff' : palette.accent,
              color: course.published ? palette.text : '#fff',
              border: `1px solid ${course.published ? palette.border : palette.accent}`,
            }}
          >
            {course.published ? 'Dépublier' : 'Publier'}
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <EditorSidebar
          course={course as any}
          activeChapterId={activeChapterId}
          activeLessonId={activeLessonId}
          onSelectLesson={(chId, lId) => { setActiveChapterId(chId); setActiveLessonId(lId); }}
          onAddChapter={addChapter}
          onAddLesson={addLesson}
          onDeleteLesson={deleteLesson}
          onDeleteChapter={deleteChapter}
          onUpdateChapterTitle={updateChapterTitle}
          onUpdateLessonTitle={updateLessonTitle}
        />

        {/* Canvas */}
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {activeChapter && activeLesson ? (
            <LessonCanvas
              chapter={activeChapter}
              lesson={activeLesson}
              onAddBlock={(type) => addBlock(activeChapterId!, activeLessonId!, type)}
              onUpdateBlock={(blockId, patch) => updateBlock(activeChapterId!, activeLessonId!, blockId, patch)}
              onDeleteBlock={(blockId) => deleteBlock(activeChapterId!, activeLessonId!, blockId)}
              onMoveBlock={(fromIdx, toIdx) => moveBlock(activeChapterId!, activeLessonId!, fromIdx, toIdx)}
              onOpenAi={(blockId) => { setAiTargetBlockId(blockId); setAiPanelOpen(true); }}
              onUpdateLessonDescription={(desc) => updateLessonDescription(activeChapterId!, activeLessonId!, desc)}
            />
          ) : (
            <NoLessonPlaceholder
              hasChapters={(content?.chapters.length ?? 0) > 0}
              onAddChapter={addChapter}
              onAddLesson={() => {
                const firstChapter = content?.chapters[0];
                if (firstChapter) addLesson(firstChapter.id);
                else addChapter();
              }}
            />
          )}
        </div>

        {/* AI Panel */}
        <AiAssistPanel
          open={aiPanelOpen}
          onClose={() => setAiPanelOpen(false)}
          block={aiTargetBlock}
          lessonTitle={activeLesson?.title ?? ''}
          courseTitle={course.title}
          courseId={course.id}
          onApply={handleApplyAi}
        />
      </div>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function NoLessonPlaceholder({
  hasChapters,
  onAddChapter,
  onAddLesson,
}: {
  hasChapters: boolean;
  onAddChapter: () => void;
  onAddLesson: () => void;
}) {
  const font = { sans: "'DM Sans', sans-serif" };
  const palette = { muted: '#6b7280', border: '#e5e7eb', accent: '#0057ff' };

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 16,
        color: palette.muted,
        fontFamily: font.sans,
      }}
    >
      <div style={{ fontSize: 40 }}>📄</div>
      <div style={{ fontSize: 15, fontWeight: 500 }}>
        {hasChapters ? 'Sélectionnez ou créez une leçon' : 'Commencez par créer un chapitre'}
      </div>
      <button
        onClick={hasChapters ? onAddLesson : onAddChapter}
        style={{
          padding: '9px 20px', background: palette.accent, color: '#fff',
          border: 'none', borderRadius: 7, cursor: 'pointer',
          fontFamily: font.sans, fontSize: 13, fontWeight: 600,
        }}
      >
        {hasChapters ? '+ Nouvelle leçon' : '+ Nouveau chapitre'}
      </button>
    </div>
  );
}
