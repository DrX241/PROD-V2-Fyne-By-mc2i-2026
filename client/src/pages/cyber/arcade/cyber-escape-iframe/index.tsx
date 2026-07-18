import React from 'react';
import { Link } from 'wouter';
import { ArrowLeft } from 'lucide-react';

const MONO = "'JetBrains Mono', monospace";
const SANS = "'Plus Jakarta Sans', sans-serif";

export default function CyberEscapeV2() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0a0e1a', fontFamily: SANS }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600&family=JetBrains+Mono:wght@400;500&display=swap');`}</style>

      {/* Top bar */}
      <div style={{
        height: 44,
        background: '#0f1117',
        borderBottom: '1px solid #1e2535',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        gap: 16,
        flexShrink: 0,
      }}>
        <Link href="/cyber/arcade">
          <button style={{
            fontFamily: MONO,
            fontSize: 10,
            color: '#64748b',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: 0,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.08em',
          }}>
            <ArrowLeft size={11} /> Arcade
          </button>
        </Link>
        <div style={{ width: 1, height: 16, background: '#1e2535' }} />
        <span style={{ fontFamily: MONO, fontSize: 10, color: '#475569', textTransform: 'uppercase' as const, letterSpacing: '0.08em' }}>
          CYBER ESCAPE — SESSION ACTIVE
        </span>
        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: MONO, fontSize: 9, color: '#334155' }}>FYNE · ARCADE</span>
      </div>

      {/* Iframe */}
      <iframe
        src="/escape-game/"
        style={{
          flex: 1,
          border: 'none',
          width: '100%',
        }}
        title="Cyber Escape Game"
        allow="fullscreen"
      />
    </div>
  );
}
