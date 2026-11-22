import React, { useState } from 'react';
import { sovereignSound } from './sovereignSoundEngine';

export const SovereignBrandIdentity: React.FC = () => {
  const [muted, setMuted] = useState(false);

  const toggleSound = () => {
    const next = !muted;
    setMuted(next);
    sovereignSound.enabled = !next;
    if (!next) sovereignSound.playSuccessChime();
  };

  return (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #070d1f 0%, #0f1f3d 55%, #064e3b 100%)',
        borderBottom: '2px solid rgba(16, 185, 129, 0.45)',
        padding: '14px 16px 26px',
        color: '#f8fafc',
        fontFamily: 'sans-serif'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width="46" height="46" viewBox="0 0 64 64" fill="none" xmlns="http://w3.org" style={{ flexShrink: 0, filter: 'drop-shadow(0 4px 10px rgba(245,158,11,0.35))' }}>
            <defs>
              <linearGradient id="bmzShield" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#047857" />
              </linearGradient>
              <linearGradient id="bmzGold" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>
            </defs>
            <path d="M32 3L55 12L61 32L55 52L32 61L9 52L3 32L9 12L32 3Z" fill="url(#bmzShield)" stroke="url(#bmzGold)" strokeWidth="2.5" />
            <path d="M32 16V46M22 46H42M16 24H48" stroke="url(#bmzGold)" strokeWidth="3" strokeLinecap="round" />
            <path d="M16 24L11 35H21L16 24Z" fill="#FDE68A" />
            <path d="M48 24L43 35H53L48 24Z" fill="#FDE68A" />
            <circle cx="32" cy="15" r="3.5" fill="#FEF3C7" />
          </svg>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '19px', fontWeight: 900, letterSpacing: '0.3px', color: '#ffffff' }}>
                BolMizan <span style={{ color: '#fbbf24' }}>Sovereign OS</span>
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, background: 'rgba(16,185,129,0.2)', color: '#6ee7b7', border: '1px solid #10b981', padding: '2px 8px', borderRadius: '999px' }}>
                100% OFFLINE
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px', fontWeight: 600 }}>
              BolMizan Mizan Engine — <span style={{ color: '#93c5fd' }}>Sakrand & Sindh Agri-Fintech Ledger</span>
            </div>
          </div>
        </div>

        <button
          onClick={toggleSound}
          style={{
            background: 'rgba(15, 23, 42, 0.75)',
            color: muted ? '#94a3b8' : '#fbbf24',
            border: '1px solid rgba(251, 191, 36, 0.45)',
            borderRadius: '999px',
            padding: '6px 12px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            marginRight: '155px'
          }}
        >
          {muted ? 'Sound Off' : 'Sound On'}
        </button>
      </div>

      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '28px',
          pointerEvents: 'none'
        }}
      >
        <path fill="rgba(16, 185, 129, 0.25)">
          <animate
            attributeName="d"
            dur="7s"
            repeatCount="indefinite"
            values="M0,45 C320,85 520,5 840,45 C1120,80 1300,20 1440,45 L1440,90 L0,90 Z; M0,35 C360,5 620,85 960,35 C1200,5 1340,65 1440,35 L1440,90 L0,90 Z; M0,45 C320,85 520,5 840,45 C1120,80 1300,20 1440,45 L1440,90 L0,90 Z"
          />
        </path>
        <path fill="rgba(245, 158, 11, 0.22)">
          <animate
            attributeName="d"
            dur="5s"
            repeatCount="indefinite"
            values="M0,55 C280,15 580,85 900,45 C1160,15 1320,70 1440,50 L1440,90 L0,90 Z; M0,40 C340,80 640,10 980,55 C1220,85 1350,25 1440,40 L1440,90 L0,90 Z; M0,55 C280,15 580,85 900,45 C1160,15 1320,70 1440,50 L1440,90 L0,90 Z"
          />
        </path>
      </svg>
    </div>
  );
};