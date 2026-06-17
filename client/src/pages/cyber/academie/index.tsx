import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Upload, Play, Trash2, Calendar, BookOpen,
  CheckSquare, Square, Plus, ChevronLeft, Library
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import HomeLayout from '@/components/layout/HomeLayout';

interface SavedTraining {
  id: string;
  title: string;
  tagline: string;
  source: string;
  audience: string;
  gamificationLevel: string;
  createdAt: string;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function sourceLabel(source: string) {
  if (source === 'prompt') return 'IA from scratch';
  if (source === 'documents') return 'Documents';
  if (source === 'lesson') return 'Micro Learning';
  return source;
}

const ACC = '#0057ff';
const BG = '#0f1117';
const SURFACE = '#111827';
const BORDER = '#1e2d45';
const TEXT = '#f1f5f9';
const SUB = '#64748b';
const MONO = "'DM Mono', monospace";
const SANS = "'DM Sans', sans-serif";

export default function CyberAcademie() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const isAdmin = (user as any)?.role === 'admin' || (user as any)?.role === 'superadmin';

  const [trainings, setTrainings] = useState<SavedTraining[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadTrainings = useCallback(() => {
    setLoading(true);
    fetch('/api/studio/trainings?scope=cyber')
      .then(r => r.json())
      .then(data => setTrainings(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadTrainings(); }, [loadTrainings]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const t = trainings.find(t => t.id === id);
    setDeleteConfirm({ id, title: t?.title || 'cette formation' });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setDeleteConfirm(null);
    setDeleting(id);
    try {
      await fetch(`/api/studio/training/${id}`, { method: 'DELETE' });
      setTrainings(prev => prev.filter(t => t.id !== id));
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
    } catch {}
    setDeleting(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.size === trainings.length ? new Set() : new Set(trainings.map(t => t.id)));
  };

  const confirmBulkDelete = async () => {
    setBulkDeleteConfirm(false);
    setBulkDeleting(true);
    await Promise.all(Array.from(selectedIds).map(id =>
      fetch(`/api/studio/training/${id}`, { method: 'DELETE' }).catch(() => {})
    ));
    setTrainings(prev => prev.filter(t => !selectedIds.has(t.id)));
    setSelectedIds(new Set());
    setBulkDeleting(false);
  };

  return (
    <HomeLayout>
      <div style={{ minHeight: '100vh', backgroundColor: BG, fontFamily: SANS, color: TEXT }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '48px 32px 80px' }}>

          {/* Back */}
          <button
            onClick={() => setLocation('/cyber/sas-academie')}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: SUB, fontSize: '0.8rem', marginBottom: 40, padding: 0, fontFamily: MONO }}
          >
            <ChevronLeft size={14} /> Retour
          </button>

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 48 }}>
            <p style={{ fontFamily: MONO, fontSize: '0.65rem', letterSpacing: '0.15em', color: ACC, marginBottom: 12 }}>
              CYBER ACADÉMIE — FORMATIONS
            </p>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontFamily: MONO, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>
                  Bibliothèque de formations
                </h1>
                <p style={{ color: SUB, fontSize: '0.9rem', marginTop: 6 }}>
                  {loading ? 'Chargement…' : `${trainings.length} formation${trainings.length !== 1 ? 's' : ''} cybersécurité disponible${trainings.length !== 1 ? 's' : ''}`}
                </p>
              </div>

              {isAdmin && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setLocation('/cyber/academie/studio-ia')}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '10px 18px', background: ACC, color: '#fff',
                      border: 'none', cursor: 'pointer', fontFamily: MONO,
                      fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em',
                    }}
                  >
                    <Sparkles size={14} /> IA from scratch
                  </button>
                  <button
                    onClick={() => setLocation('/cyber/academie/studio-documents')}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '10px 18px', background: SURFACE, color: TEXT,
                      border: `1px solid ${BORDER}`, cursor: 'pointer', fontFamily: MONO,
                      fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em',
                    }}
                  >
                    <Upload size={14} /> Depuis documents
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Bulk action bar */}
          <AnimatePresence>
            {selectedIds.size > 0 && isAdmin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#1a0a0a', border: `1px solid #3f1515`, marginBottom: 12 }}
              >
                <span style={{ fontFamily: MONO, fontSize: '0.7rem', color: '#ff3b4e' }}>
                  {selectedIds.size} formation{selectedIds.size > 1 ? 's' : ''} sélectionnée{selectedIds.size > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setBulkDeleteConfirm(true)}
                  disabled={bulkDeleting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: '#ff3b4e', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: '0.7rem', fontWeight: 600, opacity: bulkDeleting ? 0.5 : 1 }}
                >
                  <Trash2 size={11} /> {bulkDeleting ? 'Suppression…' : `Supprimer (${selectedIds.size})`}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List header */}
          {trainings.length > 0 && isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${BORDER}`, marginBottom: 4 }}>
              <button
                onClick={toggleSelectAll}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: SUB, background: 'none', border: 'none', cursor: 'pointer', fontFamily: MONO }}
              >
                {selectedIds.size === trainings.length ? <CheckSquare size={13} style={{ color: ACC }} /> : <Square size={13} />}
                {selectedIds.size === trainings.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
              <span style={{ fontFamily: MONO, fontSize: '0.65rem', color: BORDER }}>
                <Library size={11} style={{ display: 'inline', marginRight: 4 }} />
                {trainings.length}
              </span>
            </div>
          )}

          {/* Training list */}
          {loading ? (
            <div style={{ padding: '80px 0', textAlign: 'center', color: SUB, fontFamily: MONO, fontSize: '0.75rem' }}>
              Chargement des formations…
            </div>
          ) : trainings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ padding: '80px 0', textAlign: 'center' }}
            >
              <BookOpen size={36} style={{ color: BORDER, margin: '0 auto 16px' }} />
              <p style={{ color: SUB, fontFamily: MONO, fontSize: '0.8rem', margin: '0 0 6px' }}>Aucune formation disponible.</p>
              {isAdmin && (
                <p style={{ color: BORDER, fontFamily: MONO, fontSize: '0.7rem', margin: 0 }}>
                  Créez votre première formation cyber avec l'IA.
                </p>
              )}
            </motion.div>
          ) : (
            <AnimatePresence>
              <div style={{ borderBottom: `1px solid ${BORDER}` }}>
                {trainings.map((t, idx) => (
                  <motion.div
                    key={t.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ delay: idx * 0.03 }}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: isAdmin ? '32px 1fr auto' : '1fr auto',
                      alignItems: 'center',
                      gap: 16,
                      padding: '16px 0',
                      borderTop: `1px solid ${BORDER}`,
                      cursor: 'pointer',
                    }}
                    onClick={() => setLocation(`/cyber/academie/player/${t.id}`)}
                  >
                    {/* Checkbox (admin only) */}
                    {isAdmin && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelect(t.id); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: BORDER }}
                      >
                        {selectedIds.has(t.id)
                          ? <CheckSquare size={14} style={{ color: ACC }} />
                          : <Square size={14} />}
                      </button>
                    )}

                    {/* Content */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                        <span style={{ fontFamily: MONO, fontSize: '0.82rem', fontWeight: 600, color: TEXT }}>
                          {t.title}
                        </span>
                        {t.tagline && (
                          <span style={{ fontFamily: SANS, fontSize: '0.78rem', color: SUB, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {t.tagline}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontFamily: MONO, fontSize: '0.62rem', padding: '1px 6px', background: `${ACC}15`, color: ACC, border: `1px solid ${ACC}30` }}>
                          {sourceLabel(t.source)}
                        </span>
                        {t.createdAt && (
                          <span style={{ fontFamily: MONO, fontSize: '0.62rem', color: BORDER, display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Calendar size={9} /> {formatDate(t.createdAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); setLocation(`/cyber/academie/player/${t.id}`); }}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: ACC, color: '#fff', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: '0.68rem', fontWeight: 600 }}
                      >
                        <Play size={10} /> Suivre
                      </button>
                      {isAdmin && (
                        <button
                          onClick={(e) => handleDelete(t.id, e)}
                          disabled={deleting === t.id}
                          style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${BORDER}`, background: 'transparent', cursor: 'pointer', color: BORDER, opacity: deleting === t.id ? 0.4 : 1 }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ff3b4e'; (e.currentTarget as HTMLButtonElement).style.color = '#ff3b4e'; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = BORDER; (e.currentTarget as HTMLButtonElement).style.color = BORDER; }}
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Delete single confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: SURFACE, border: `1px solid ${BORDER}`, width: '100%', maxWidth: 420, padding: '32px 28px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#ff3b4e' }} />
              <p style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700, fontFamily: MONO, color: TEXT }}>Supprimer la formation ?</p>
              <p style={{ margin: '0 0 24px', fontSize: '0.85rem', color: SUB, fontFamily: SANS }}>
                <strong style={{ color: TEXT }}>« {deleteConfirm.title} »</strong> sera supprimée définitivement.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setDeleteConfirm(null)} style={{ padding: '9px 18px', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT, cursor: 'pointer', fontFamily: MONO, fontSize: '0.72rem' }}>Annuler</button>
                <button onClick={confirmDelete} style={{ padding: '9px 18px', border: 'none', background: '#ff3b4e', color: '#fff', cursor: 'pointer', fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Trash2 size={12} /> Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk delete confirm */}
      <AnimatePresence>
        {bulkDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setBulkDeleteConfirm(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ background: SURFACE, border: `1px solid ${BORDER}`, width: '100%', maxWidth: 440, padding: '32px 28px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#ff3b4e' }} />
              <p style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: 700, fontFamily: MONO, color: TEXT }}>Supprimer {selectedIds.size} formations ?</p>
              <p style={{ margin: '0 0 24px', fontSize: '0.85rem', color: SUB, fontFamily: SANS }}>Action irréversible.</p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button onClick={() => setBulkDeleteConfirm(false)} style={{ padding: '9px 18px', border: `1px solid ${BORDER}`, background: 'transparent', color: TEXT, cursor: 'pointer', fontFamily: MONO, fontSize: '0.72rem' }}>Annuler</button>
                <button onClick={confirmBulkDelete} style={{ padding: '9px 18px', border: 'none', background: '#ff3b4e', color: '#fff', cursor: 'pointer', fontFamily: MONO, fontSize: '0.72rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Trash2 size={12} /> Supprimer tout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </HomeLayout>
  );
}
