import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Trash2, Pencil, Plus, Users, BookOpen, Clock, ArrowLeft, Eye } from 'lucide-react';

interface LmsCourse {
  id: string;
  title: string;
  description?: string;
  status: string;
  published: boolean;
  estimatedDurationMin?: number;
  audience?: string;
  difficulty?: string;
  content: { chapters: { lessons?: unknown[] }[] };
  createdAt: string;
  updatedAt: string;
}

const P = {
  bg: '#ffffff', text: '#0d0d0d', muted: '#6b7280', border: '#e5e7eb',
  accent: '#0057ff', surface: '#f9fafb', danger: '#dc2626', success: '#059669',
};
const F = { sans: "'DM Sans', sans-serif", mono: "'DM Mono', monospace" };

const DIFFICULTY: Record<string, string> = { debutant: 'Débutant', intermediaire: 'Intermédiaire', avance: 'Avancé' };
const AUDIENCE: Record<string, string> = { grand_public: 'Grand public', managers: 'Managers', rh: 'RH', commercial: 'Commercial' };
const COVER = ['#dbeafe', '#fce7f3', '#d1fae5', '#fef3c7', '#ede9fe', '#ffedd5'];
const COVER_FG = [P.accent, '#E8006C', '#059669', '#d97706', '#7c3aed', '#ea580c'];

function hashColor(id: string, arr: string[]) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % arr.length;
  return arr[h];
}

export default function LmsListPage() {
  const [, nav] = useLocation();
  const [courses, setCourses] = useState<LmsCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/lms/courses', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { setCourses(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/lms/courses/${id}`, { method: 'DELETE', credentials: 'include' });
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch {}
    setDeleting(null);
    setDeleteConfirm(null);
  };

  return (
    <div style={{ fontFamily: F.sans, background: P.bg, minHeight: '100vh', color: P.text }}>
      {/* Header */}
      <div style={{ borderBottom: `1px solid ${P.border}`, padding: '20px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: P.bg, zIndex: 10 }}>
        <div>
          <button onClick={() => nav('/playground')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: P.muted, fontSize: 13, fontFamily: F.sans, padding: 0, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <ArrowLeft size={14} /> Playground
          </button>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700 }}>Mes cours LMS</h1>
          <p style={{ margin: '2px 0 0', color: P.muted, fontSize: 13 }}>{courses.length} cours · Créez et gérez vos formations</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => nav('/playground/lms/dashboard')} style={{ background: 'none', color: P.accent, border: `1px solid ${P.accent}`, padding: '9px 16px', cursor: 'pointer', fontFamily: F.sans, fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Eye size={14} /> Vue Apprenant
          </button>
          <button onClick={() => nav('/playground/lms/new')} style={{ background: P.accent, color: '#fff', border: 'none', padding: '9px 18px', cursor: 'pointer', fontFamily: F.sans, fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> Nouveau cours
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: P.muted, fontSize: 14 }}>Chargement...</div>
        )}

        {!loading && courses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 20px', border: `2px dashed ${P.border}` }}>
            <BookOpen size={40} color={P.border} style={{ marginBottom: 16 }} />
            <h2 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600 }}>Aucun cours pour l'instant</h2>
            <p style={{ color: P.muted, margin: '0 0 20px', fontSize: 14 }}>Créez votre premier cours à partir d'un template ou de zéro.</p>
            <button onClick={() => nav('/playground/lms/new')} style={{ background: P.accent, color: '#fff', border: 'none', padding: '10px 20px', cursor: 'pointer', fontFamily: F.sans, fontWeight: 600, fontSize: 14 }}>
              Créer mon premier cours
            </button>
          </div>
        )}

        {!loading && courses.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 18 }}>
            {courses.map(course => {
              const chapCount = course.content?.chapters?.length ?? 0;
              const lessonCount = course.content?.chapters?.reduce((acc, ch) => acc + (ch.lessons?.length ?? 0), 0) ?? 0;
              const bg = hashColor(course.id, COVER);
              const fg = hashColor(course.id, COVER_FG);
              const isDeleting = deleting === course.id;

              return (
                <div key={course.id} style={{ background: P.bg, border: `1px solid ${P.border}`, overflow: 'hidden', opacity: isDeleting ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                  {/* Cover */}
                  <div style={{ height: 80, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                    <BookOpen size={28} color={fg} style={{ opacity: 0.4 }} />
                    <div style={{ position: 'absolute', top: 10, left: 12 }}>
                      <span style={{ background: course.published ? '#dcfce7' : '#f3f4f6', color: course.published ? P.success : P.muted, fontSize: 10, fontWeight: 600, fontFamily: F.mono, padding: '3px 8px', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: course.published ? P.success : P.muted, display: 'inline-block' }} />
                        {course.published ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>
                    {/* Action buttons */}
                    <div style={{ position: 'absolute', top: 8, right: 10, display: 'flex', gap: 6 }}>
                      <button
                        onClick={e => { e.stopPropagation(); nav(`/playground/lms/editor/${course.id}`); }}
                        title="Éditer"
                        style={{ background: 'rgba(255,255,255,0.9)', border: 'none', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Pencil size={13} color={P.muted} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setDeleteConfirm(course.id); }}
                        title="Supprimer"
                        style={{ background: 'rgba(255,255,255,0.9)', border: 'none', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      >
                        <Trash2 size={13} color={P.danger} />
                      </button>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '16px 18px' }}>
                    <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, lineHeight: 1.3 }}>{course.title}</h3>
                    {course.description && (
                      <p style={{ margin: '0 0 12px', color: P.muted, fontSize: 12, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {course.description}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: 14, paddingTop: 12, borderTop: `1px solid ${P.border}`, marginTop: course.description ? 0 : 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: P.muted }}>
                        <BookOpen size={12} /> {chapCount} chapitre{chapCount !== 1 ? 's' : ''}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: P.muted }}>
                        <Users size={12} /> {lessonCount} leçon{lessonCount !== 1 ? 's' : ''}
                      </div>
                      {course.estimatedDurationMin ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: P.muted }}>
                          <Clock size={12} /> {course.estimatedDurationMin} min
                        </div>
                      ) : null}
                    </div>

                    <button
                      onClick={() => nav(`/playground/lms/editor/${course.id}`)}
                      style={{ marginTop: 14, width: '100%', background: P.accent, color: '#fff', border: 'none', padding: '9px 0', fontFamily: F.sans, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
                    >
                      Ouvrir l'éditeur →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modale confirmation suppression */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: '28px 32px', maxWidth: 400, width: '90%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 8px', fontSize: 17, fontWeight: 700, color: P.text }}>Supprimer ce cours ?</h3>
            <p style={{ margin: '0 0 24px', color: P.muted, fontSize: 14, lineHeight: 1.5 }}>
              Cette action est irréversible. Le cours et tout son contenu seront définitivement supprimés.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ background: P.surface, color: P.text, border: `1px solid ${P.border}`, padding: '9px 18px', cursor: 'pointer', fontFamily: F.sans, fontWeight: 500, fontSize: 13 }}>
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ background: P.danger, color: '#fff', border: 'none', padding: '9px 18px', cursor: 'pointer', fontFamily: F.sans, fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Trash2 size={13} /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
