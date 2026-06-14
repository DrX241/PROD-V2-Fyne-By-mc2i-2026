import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Award, Clock, ChevronRight, Loader2, CheckCircle, PlayCircle } from 'lucide-react';

interface Training {
  id: number;
  title: string;
  description: string;
  cover_color: string;
  cover_emoji: string;
  module_count: number;
  completed_count: number;
  due_date: string | null;
  assignment_mandatory: boolean;
  certified: boolean | null;
  cert_score: number | null;
  estimated_minutes: number;
}

export default function MesFormationsPage() {
  const [, setLocation] = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/client/auth/check', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (!d.authenticated) { setLocation('/portail-client/login'); return; }
        setAuthChecked(true);
      });
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    fetch('/api/client/training/my', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setTrainings(d.trainings); })
      .finally(() => setLoading(false));
  }, [authChecked]);

  if (!authChecked || loading) {
    return (
      <div style={{ background: '#0f1117', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={32} style={{ color: '#246f9f', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: '#0f1117', minHeight: '100vh', color: '#e2e8f0', fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: '#0d1117', borderBottom: '1px solid #1e2d3d', padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <button onClick={() => setLocation('/portail-client/accueil')} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
          <ArrowLeft size={16} /> Accueil
        </button>
        <div style={{ width: 1, height: 20, background: '#1e2d3d' }} />
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#246f9f', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Mes formations</span>
      </div>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', margin: '0 0 6px' }}>Mes formations</h1>
        <p style={{ color: '#64748b', margin: '0 0 36px', fontSize: 14 }}>Vos parcours de formation assignés</p>

        {trainings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 40px', color: '#475569' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>📚</div>
            <h2 style={{ color: '#64748b', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>Aucune formation assignée</h2>
            <p style={{ fontSize: 14 }}>Contactez votre administrateur pour accéder aux formations.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {trainings.map(t => {
              const progress = t.module_count > 0 ? Math.round(((t.completed_count ?? 0) / t.module_count) * 100) : 0;
              const done = progress === 100;

              return (
                <button
                  key={t.id}
                  onClick={() => setLocation(`/portail-client/formation/${t.id}`)}
                  style={{
                    background: '#0d1117', border: `1px solid ${t.certified ? '#00c78133' : '#1e2d3d'}`,
                    borderRadius: 10, padding: '0', cursor: 'pointer', textAlign: 'left', overflow: 'hidden',
                    display: 'flex', transition: 'border-color 0.15s', width: '100%',
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#246f9f'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = t.certified ? '#00c78133' : '#1e2d3d'}
                >
                  <div style={{ width: 80, background: t.cover_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
                    {t.cover_emoji || '🎓'}
                  </div>
                  <div style={{ flex: 1, padding: '16px 20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 16, color: '#f1f5f9' }}>{t.title}</span>
                        {t.assignment_mandatory && <span style={{ marginLeft: 8, fontSize: 10, padding: '2px 6px', background: '#ff3b4e15', color: '#ff3b4e', borderRadius: 3, fontFamily: "'DM Mono', monospace" }}>OBLIGATOIRE</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, marginLeft: 16 }}>
                        {t.certified ? (
                          <span style={{ fontSize: 11, padding: '3px 8px', background: '#00c78122', color: '#00c781', borderRadius: 3, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>✓ CERTIFIÉ {t.cert_score}%</span>
                        ) : done ? (
                          <span style={{ fontSize: 11, color: '#f6ab2f', fontFamily: "'DM Mono', monospace" }}>CERTIFICATION DISPONIBLE</span>
                        ) : null}
                        <ChevronRight size={16} style={{ color: '#475569' }} />
                      </div>
                    </div>
                    {t.description && <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 12px', lineHeight: 1.5 }}>{t.description}</p>}
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <div style={{ flex: 1, height: 4, background: '#1e2d3d', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: `${progress}%`, height: '100%', background: t.certified ? '#00c781' : '#246f9f', borderRadius: 2, transition: 'width 0.5s ease' }} />
                      </div>
                      <span style={{ fontSize: 12, color: '#64748b', fontFamily: "'DM Mono', monospace", whiteSpace: 'nowrap' }}>{t.completed_count ?? 0}/{t.module_count} modules</span>
                      {t.estimated_minutes && (
                        <span style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                          <Clock size={12} /> {t.estimated_minutes} min
                        </span>
                      )}
                      {t.due_date && (
                        <span style={{ fontSize: 12, color: new Date(t.due_date) < new Date() ? '#ff3b4e' : '#475569', whiteSpace: 'nowrap' }}>
                          Échéance : {new Date(t.due_date).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
