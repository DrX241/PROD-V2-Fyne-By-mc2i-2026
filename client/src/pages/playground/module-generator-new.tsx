import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Sparkles, Upload, ArrowRight,
  BookOpen, Trash2, Play, Calendar, Library, CheckSquare, Square, Building2, X
} from 'lucide-react';
import mcLogoPath from '@assets/mc2i.png';

const BLUE = '#006a9e';
const PINK = '#dd0061';
const DARK = '#061019';

interface SavedTraining {
  id: string;
  title: string;
  tagline: string;
  source: string;
  audience: string;
  gamificationLevel: string;
  createdAt: string;
  isPublished?: boolean;
  assignedCompanies?: { id: number; name: string }[];
}

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function sourceLabel(source: string) {
  if (source === 'prompt') return 'IA from scratch';
  if (source === 'documents') return 'Documents';
  if (source === 'url') return 'URL / Site web';
  if (source === 'lesson') return 'Micro Learning';
  return source;
}

function playerRoute(training: SavedTraining) {
  if (training.source === 'lesson') return `/playground/lesson/${training.id}`;
  return `/playground/player/${training.id}`;
}

export default function ModuleGenerator() {
  const [, setLocation] = useLocation();
  const [trainings, setTrainings] = useState<SavedTraining[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [publishModal, setPublishModal] = useState<{ id: string; title: string; assignedCompanies?: { id: number; name: string }[] } | null>(null);
  const [companies, setCompanies] = useState<{ id: number; name: string; slug: string }[]>([]);
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<Set<number>>(new Set());
  const [publishing, setPublishing] = useState(false);
  const [userRole, setUserRole] = useState<string>('');
  const loadTrainings = useCallback(() => {
    fetch('/api/studio/trainings')
      .then(r => r.json())
      .then(data => setTrainings(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  useEffect(() => { loadTrainings(); }, [loadTrainings]);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    fetch('/api/auth/check', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.authenticated) {
          const role = d.user?.role ?? '';
          setUserRole(role);
          if (['superadmin', 'admin', 'maker'].includes(role)) {
            fetch('/api/companies', { credentials: 'include' })
              .then(r => r.json())
              .then(d2 => { if (d2.success) setCompanies(d2.companies); })
              .catch(() => {});
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const training = trainings.find(t => t.id === id);
    setDeleteConfirm({ id, title: training?.title || 'cette formation' });
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
    if (selectedIds.size === trainings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(trainings.map(t => t.id)));
    }
  };

  const confirmBulkDelete = async () => {
    setBulkDeleteConfirm(false);
    setBulkDeleting(true);
    const ids = Array.from(selectedIds);
    await Promise.all(ids.map(id => fetch(`/api/studio/training/${id}`, { method: 'DELETE' }).catch(() => {})));
    setTrainings(prev => prev.filter(t => !ids.includes(t.id)));
    setSelectedIds(new Set());
    setBulkDeleting(false);
  };

  const openPublishModal = (training: SavedTraining, e: React.MouseEvent) => {
    e.stopPropagation();
    const preselected = new Set<number>((training.assignedCompanies ?? []).map(c => c.id));
    setSelectedCompanyIds(preselected);
    setPublishModal({ id: training.id, title: training.title, assignedCompanies: training.assignedCompanies ?? [] });
  };

  const handlePublish = async () => {
    if (!publishModal) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/modules/${publishModal.id}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyIds: Array.from(selectedCompanyIds) }),
      });
      const data = await res.json();
      if (data.success) {
        const assignedCos = companies.filter(c => selectedCompanyIds.has(c.id)).map(c => ({ id: c.id, name: c.name }));
        setTrainings(prev => prev.map(t =>
          t.id === publishModal.id
            ? { ...t, isPublished: true, assignedCompanies: assignedCos }
            : t
        ));
        setPublishModal(null);
      }
    } catch {}
    setPublishing(false);
  };

  const handleUnassign = async (moduleId: string, companyId: number) => {
    try {
      await fetch(`/api/modules/${moduleId}/companies/${companyId}`, { method: 'DELETE' });
      setTrainings(prev => prev.map(t => {
        if (t.id !== moduleId) return t;
        const newAssigned = (t.assignedCompanies ?? []).filter(c => c.id !== companyId);
        return { ...t, isPublished: newAssigned.length > 0, assignedCompanies: newAssigned };
      }));
      if (publishModal && publishModal.id === moduleId) {
        setPublishModal(prev => prev ? { ...prev, assignedCompanies: (prev.assignedCompanies ?? []).filter(c => c.id !== companyId) } : null);
        setSelectedCompanyIds(prev => { const next = new Set(prev); next.delete(companyId); return next; });
      }
    } catch {}
  };

  const cards = [
    {
      id: 'ia',
      badge: 'IA from scratch',
      title: 'Générer à partir de votre prompt',
      description: 'Décrivez votre besoin en quelques mots. L\'IA génère un micro learning interactif théorie/pratique avec un QCM de validation, adapté à votre public.',
      bullets: [
        'Pitchez votre besoin en langage naturel',
        'Modules théorie alternés avec pratique',
        'QCM de 5 questions à la fin',
        'Prêt en moins de 60 secondes',
      ],
      color: PINK,
      route: '/playground/studio-ia',
    },
    {
      id: 'docs',
      badge: 'Depuis vos documents',
      title: 'Importer mes contenus',
      description: 'Apportez vos supports existants — PDF, PowerPoint, Word. L\'IA les transforme en micro learning interactif théorie/pratique et QCM de validation.',
      bullets: [
        'PDF, PowerPoint, Word acceptés',
        'Modules théorie alternés avec pratique',
        'QCM de 5 questions à la fin',
        'Contenu fidèle à vos documents',
      ],
      color: PINK,
      route: '/playground/studio-documents',
    },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'white', color: DARK, overflow: 'hidden' }}>
      {/* Header */}
      <header style={{ flexShrink: 0, borderBottom: '1px solid #f3f4f6', zIndex: 50, background: 'white' }}>
        <div style={{ height: 2, background: PINK }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px' }}>
          <button onClick={() => setLocation('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <ArrowLeft size={18} style={{ color: BLUE }} />
          </button>
          <img src={mcLogoPath} alt="mc2i" style={{ height: 28, width: 'auto' }} />
          <div style={{ width: 1, height: 16, background: '#e5e7eb' }} />
          <span style={{ fontWeight: 700, fontSize: 14, color: BLUE }}>FYNE</span>
          <div style={{ width: 1, height: 16, background: '#e5e7eb' }} />
          <span style={{ fontSize: 14, color: '#6b7280', fontWeight: 500 }}>Studio de Formation</span>
        </div>
      </header>

      {/* Body — 2 colonnes fixes sous le header */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── Colonne gauche : création (fixe, ne scrolle pas) ── */}
        <div style={{
          width: '38%',
          minWidth: 300,
          maxWidth: 480,
          borderRight: '1px solid #f3f4f6',
          display: 'flex',
          flexDirection: 'column',
          padding: '32px 28px',
          overflowY: 'auto',
          flexShrink: 0,
        }}>
          {/* Titre */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 10px', background: `${BLUE}12`, color: BLUE, display: 'inline-block', marginBottom: 10 }}>
              Studio
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.1, margin: 0 }}>
              <span style={{ color: PINK }}>Créez votre </span>
              <span style={{ color: DARK }}>micro </span>
              <span style={{ color: PINK }}>learning</span>
            </h1>
            <div style={{ width: 40, height: 3, background: PINK, marginTop: 10 }} />
          </div>

          {/* Cartes de création empilées */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {cards.map((card, idx) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                whileHover={{ y: -2 }}
                onClick={() => setLocation(card.route)}
                style={{ cursor: 'pointer', border: '1px solid #e5e7eb', background: 'white' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#9ca3af')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
              >
                <div style={{ padding: '20px 20px 16px' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '2px 8px', background: `${card.color}12`, color: card.color }}>
                    {card.badge}
                  </span>
                  <h2 style={{ fontSize: 15, fontWeight: 800, margin: '10px 0 6px', color: DARK }}>
                    {card.title}
                  </h2>
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.55, margin: '0 0 12px' }}>
                    {card.description}
                  </p>
                  <ul style={{ margin: '0 0 14px', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {card.bullets.map((b, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#374151' }}>
                        <div style={{ width: 5, height: 5, flexShrink: 0, background: card.color }} />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <button
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 0', background: card.color, color: 'white', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', width: '100%', justifyContent: 'center' }}
                  >
                    {card.id === 'ia' ? <Sparkles size={14} /> : <Upload size={14} />}
                    {card.title}
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Colonne droite : bibliothèque (scrollable) ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* En-tête de la bibliothèque (fixe) */}
          <div style={{ flexShrink: 0, padding: '20px 28px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Library size={16} style={{ color: PINK }} />
              <h2 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: DARK }}>Modules sauvegardés</h2>
              {trainings.length > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', background: `${BLUE}12`, color: BLUE }}>
                  {trainings.length}
                </span>
              )}
            </div>
            {trainings.length > 0 && (
              <button
                onClick={toggleSelectAll}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {selectedIds.size === trainings.length
                  ? <CheckSquare size={14} style={{ color: PINK }} />
                  : <Square size={14} />}
                {selectedIds.size === trainings.length ? 'Tout désélectionner' : 'Tout sélectionner'}
              </button>
            )}
          </div>

          {/* Bulk action bar */}
          <AnimatePresence>
            {selectedIds.size > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 28px', background: '#fef2f2', borderBottom: '1px solid #fecaca' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#991b1b' }}>
                  {selectedIds.size} formation{selectedIds.size > 1 ? 's' : ''} sélectionnée{selectedIds.size > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => setBulkDeleteConfirm(true)}
                  disabled={bulkDeleting}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 16px', background: '#dc2626', color: 'white', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer', opacity: bulkDeleting ? 0.5 : 1 }}>
                  <Trash2 size={12} />
                  {bulkDeleting ? 'Suppression...' : `Supprimer (${selectedIds.size})`}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Liste scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px 28px' }}>
            {trainings.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 200 }}>
                <BookOpen size={32} style={{ color: '#d1d5db', marginBottom: 12 }} />
                <p style={{ fontSize: 14, color: '#9ca3af', margin: '0 0 4px' }}>Aucune formation générée pour l'instant.</p>
                <p style={{ fontSize: 12, color: '#d1d5db', margin: 0 }}>Vos formations apparaîtront ici après génération.</p>
              </div>
            ) : (
              <AnimatePresence>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {trainings.map((t, idx) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ delay: idx * 0.03 }}
                      style={{ border: '1px solid #e5e7eb', background: 'white' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = '#9ca3af')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = '#e5e7eb')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
                        {/* Checkbox */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSelect(t.id); }}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, color: '#d1d5db' }}
                          title="Sélectionner">
                          {selectedIds.has(t.id)
                            ? <CheckSquare size={16} style={{ color: PINK }} />
                            : <Square size={16} />}
                        </button>

                        {/* Icon */}
                        <div style={{ width: 36, height: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #f3f4f6', background: `${BLUE}08`, color: BLUE }}>
                          <BookOpen size={14} />
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontSize: 13, fontWeight: 700, margin: '0 0 2px', color: DARK, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</h3>
                          {t.tagline && (
                            <p style={{ fontSize: 11, color: '#6b7280', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.tagline}</p>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', background: `${BLUE}10`, color: BLUE }}>
                              {sourceLabel(t.source)}
                            </span>
                            {t.createdAt && (
                              <span style={{ fontSize: 10, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Calendar size={9} /> {formatDate(t.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          {/* Publish badge / button — visible for admin/maker */}
                          {['superadmin', 'admin', 'maker'].includes(userRole) && (
                            t.isPublished ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', background: '#ecfdf5', color: '#059669', border: '1px solid #6ee7b7' }}>
                                  Publié
                                </span>
                                <button
                                  onClick={(e) => openPublishModal(t, e)}
                                  style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'white', color: BLUE, fontWeight: 700, fontSize: 11, border: `1px solid ${BLUE}`, cursor: 'pointer' }}>
                                  <Building2 size={11} /> Gérer
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => openPublishModal(t, e)}
                                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 10px', background: 'white', color: BLUE, fontWeight: 700, fontSize: 11, border: `1px solid ${BLUE}`, cursor: 'pointer' }}>
                                <Building2 size={11} /> Publier
                              </button>
                            )
                          )}
                          <button
                            onClick={() => setLocation(playerRoute(t))}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: t.source === 'lesson' ? PINK : BLUE, color: 'white', fontWeight: 700, fontSize: 11, border: 'none', cursor: 'pointer' }}>
                            <Play size={11} /> {t.source === 'lesson' ? 'Voir' : 'Jouer'}
                          </button>
                          <button
                            onClick={(e) => handleDelete(t.id, e)}
                            disabled={deleting === t.id}
                            style={{ width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', color: '#9ca3af', opacity: deleting === t.id ? 0.4 : 1 }}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#fca5a5'; (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e5e7eb'; (e.currentTarget as HTMLButtonElement).style.color = '#9ca3af'; }}
                            title="Supprimer">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* ── Modale bulk delete ── */}
      <AnimatePresence>
        {bulkDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setBulkDeleteConfirm(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(6,16,25,0.65)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', width: '100%', maxWidth: 440, padding: '32px 28px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#dc2626' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Trash2 size={18} style={{ color: '#dc2626' }} />
                </div>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: DARK }}>Supprimer {selectedIds.size} formation{selectedIds.size > 1 ? 's' : ''} ?</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                    Ces {selectedIds.size} formation{selectedIds.size > 1 ? 's' : ''} seront supprimées définitivement. Cette action est irréversible.
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setBulkDeleteConfirm(false)}
                  style={{ padding: '10px 20px', border: '1px solid #e5e7eb', background: 'white', color: DARK, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                  Annuler
                </button>
                <button
                  onClick={confirmBulkDelete}
                  style={{ padding: '10px 24px', border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Trash2 size={14} /> Supprimer tout
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modale de publication ── */}
      <AnimatePresence>
        {publishModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setPublishModal(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', width: '100%', maxWidth: 480, padding: '28px 28px 24px', position: 'relative' }}>
              {/* Blue top bar */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: BLUE }} />
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Building2 size={16} style={{ color: BLUE }} />
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: BLUE }}>Publier</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: DARK, maxWidth: 380, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {publishModal.title}
                  </p>
                </div>
                <button onClick={() => setPublishModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: 4 }}>
                  <X size={16} />
                </button>
              </div>

              {/* Already assigned companies */}
              {(publishModal.assignedCompanies ?? []).length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280' }}>Déjà assigné à</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(publishModal.assignedCompanies ?? []).map(c => (
                      <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '3px 8px', background: '#ecfdf5', color: '#059669', border: '1px solid #6ee7b7' }}>
                        {c.name}
                        <button
                          onClick={() => handleUnassign(publishModal.id, c.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#059669', display: 'flex', lineHeight: 1 }}>
                          <X size={11} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Company list */}
              {companies.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 20px' }}>Aucune company disponible.</p>
              ) : (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ margin: '0 0 10px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280' }}>
                    Sélectionner les companies
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
                    {companies.map(c => {
                      const checked = selectedCompanyIds.has(c.id);
                      return (
                        <label
                          key={c.id}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: `1px solid ${checked ? BLUE : '#e5e7eb'}`, background: checked ? `${BLUE}06` : 'white', cursor: 'pointer', transition: 'all 0.12s' }}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => setSelectedCompanyIds(prev => {
                              const next = new Set(prev);
                              if (next.has(c.id)) next.delete(c.id); else next.add(c.id);
                              return next;
                            })}
                            style={{ accentColor: BLUE, width: 14, height: 14, flexShrink: 0 }}
                          />
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: DARK }}>{c.name}</p>
                            <p style={{ margin: 0, fontSize: 10, color: '#9ca3af', fontFamily: 'monospace' }}>{c.slug}</p>
                          </div>
                          {checked && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', background: `${BLUE}15`, color: BLUE }}>✓</span>}
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setPublishModal(null)}
                  style={{ padding: '10px 20px', border: '1px solid #e5e7eb', background: 'white', color: DARK, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  Annuler
                </button>
                <button
                  onClick={handlePublish}
                  disabled={publishing || selectedCompanyIds.size === 0}
                  style={{ padding: '10px 24px', border: 'none', background: selectedCompanyIds.size === 0 ? '#9ca3af' : BLUE, color: 'white', cursor: selectedCompanyIds.size === 0 ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8, opacity: publishing ? 0.7 : 1 }}>
                  <Building2 size={13} /> {publishing ? 'Publication...' : `Publier (${selectedCompanyIds.size})`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modale de confirmation de suppression ── */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setDeleteConfirm(null)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(6,16,25,0.65)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 8 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.94, opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'white', width: '100%', maxWidth: 420, padding: '32px 28px', position: 'relative' }}>
              {/* Barre rouge en haut */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: '#dc2626' }} />

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Trash2 size={18} style={{ color: '#dc2626' }} />
                </div>
                <div>
                  <p style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: DARK }}>Supprimer la formation ?</p>
                  <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                    <strong style={{ color: DARK }}>« {deleteConfirm.title} »</strong> sera supprimée définitivement. Cette action est irréversible.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{ padding: '10px 20px', border: '1px solid #e5e7eb', background: 'white', color: DARK, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                  Annuler
                </button>
                <button
                  onClick={confirmDelete}
                  style={{ padding: '10px 24px', border: 'none', background: '#dc2626', color: 'white', cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
