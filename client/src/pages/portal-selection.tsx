import { motion } from 'framer-motion';
import mcLogoPath from '@assets/mc2i.png';

const FONT = '"DM Sans", system-ui, sans-serif';

const D = {
  bg: '#07090f',
  surface: '#0d1117',
  card: '#111827',
  border: '#1a2332',
  accent: '#0057ff',
  green: '#10b981',
  text: '#f1f5f9',
  sub: '#64748b',
  muted: '#334155',
};

export default function PortalSelection() {
  return (
    <div style={{
      minHeight: '100vh',
      background: D.bg,
      fontFamily: FONT,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: 'linear-gradient(#0057ff 1px, transparent 1px), linear-gradient(90deg, #0057ff 1px, transparent 1px)',
        backgroundSize: '48px 48px',
      }} />

      {/* Glow top */}
      <div style={{
        position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(0,87,255,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '820px' }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '56px', justifyContent: 'center' }}>
          <img src={mcLogoPath} alt="mc2i" style={{ height: '28px', opacity: 0.9 }} />
          <div style={{ width: '1px', height: '24px', background: D.border }} />
          <span style={{ fontSize: '20px', fontWeight: 700, color: D.text, letterSpacing: '-0.3px' }}>FYNE</span>
        </div>

        {/* Headline */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h1 style={{
            fontSize: '32px', fontWeight: 800, color: D.text,
            letterSpacing: '-0.5px', margin: 0, lineHeight: 1.2,
          }}>
            Choisissez votre espace
          </h1>
          <p style={{ color: D.sub, fontSize: '15px', marginTop: '10px' }}>
            Deux portails, deux expériences
          </p>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Internal portal */}
          <motion.a
            href="/home"
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'block', textDecoration: 'none',
              background: D.card,
              border: `1px solid ${D.border}`,
              borderRadius: '12px',
              padding: '36px 32px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
              background: 'linear-gradient(90deg, #0057ff, #3b82f6)',
            }} />

            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: 'rgba(0,87,255,0.12)',
              border: '1px solid rgba(0,87,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '20px',
              fontSize: '20px',
            }}>
              🔒
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 700, color: D.text, margin: '0 0 8px' }}>
              Portail Interne
            </h2>
            <p style={{ fontSize: '13px', color: D.sub, margin: '0 0 24px', lineHeight: 1.6 }}>
              Réservé aux collaborateurs mc2i. Accès aux modules Cyber, AMOA, Data & IA et aux outils internes.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Cyber', 'AMOA', 'Data & IA', 'Évaluation'].map(tag => (
                <span key={tag} style={{
                  fontSize: '11px', fontWeight: 500,
                  color: '#3b82f6', background: 'rgba(0,87,255,0.08)',
                  border: '1px solid rgba(0,87,255,0.15)',
                  borderRadius: '4px', padding: '2px 8px',
                }}>
                  {tag}
                </span>
              ))}
            </div>

            <div style={{
              marginTop: '28px', fontSize: '13px', fontWeight: 600,
              color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              Accéder <span style={{ fontSize: '16px' }}>→</span>
            </div>
          </motion.a>

          {/* Client portal */}
          <motion.a
            href="/portail-client"
            whileHover={{ y: -4, scale: 1.01 }}
            transition={{ duration: 0.2 }}
            style={{
              display: 'block', textDecoration: 'none',
              background: D.card,
              border: `1px solid ${D.border}`,
              borderRadius: '12px',
              padding: '36px 32px',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
              background: 'linear-gradient(90deg, #10b981, #34d399)',
            }} />

            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '20px',
              fontSize: '20px',
            }}>
              ✦
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 700, color: D.text, margin: '0 0 8px' }}>
              Portail Client
            </h2>
            <p style={{ fontSize: '13px', color: D.sub, margin: '0 0 24px', lineHeight: 1.6 }}>
              Créez et diffusez des formations interactives en quelques secondes grâce à l'IA. Accessible à tous.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['Studio IA', 'Formations', 'Partage', 'Analytics'].map(tag => (
                <span key={tag} style={{
                  fontSize: '11px', fontWeight: 500,
                  color: '#10b981', background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.15)',
                  borderRadius: '4px', padding: '2px 8px',
                }}>
                  {tag}
                </span>
              ))}
            </div>

            <div style={{
              marginTop: '28px', fontSize: '13px', fontWeight: 600,
              color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              Accéder <span style={{ fontSize: '16px' }}>→</span>
            </div>
          </motion.a>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '48px', color: D.muted, fontSize: '12px' }}>
          © {new Date().getFullYear()} mc2i — FYNE Platform
        </div>
      </motion.div>
    </div>
  );
}
