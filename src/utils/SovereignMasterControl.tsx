import React, { useState, useEffect } from 'react';
import { sovereignSound } from './sovereignSoundEngine';

const CONTROL_STATE_KEY = 'bolmizan_sovereign_master_control_v1';
const REMOTE_CONTROL_URL = 'https://githubusercontent.com';

interface SovereignControlState {
  protocolStatus: 'ACTIVE' | 'PAUSED';
  tier: 'FREE_COMMUNITY' | 'ARTHIYA_GOLD_PRO' | 'ENTERPRISE_MILL';
  bannerMessage: string;
  lastSyncedAt: string;
}

export const SovereignMasterControl: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [state, setState] = useState<SovereignControlState>({
    protocolStatus: 'ACTIVE',
    tier: 'FREE_COMMUNITY',
    bannerMessage: '',
    lastSyncedAt: 'Offline Ready'
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CONTROL_STATE_KEY);
      if (raw) setState(JSON.parse(raw));
    } catch {}

    (async () => {
      if (!navigator.onLine) return;
      try {
        const res = await fetch(`${REMOTE_CONTROL_URL}?t=${Date.now()}`);
        if (res.ok) {
          const remote = await res.json();
          const next: SovereignControlState = {
            protocolStatus: remote.emergencyMaintenanceLock ? 'PAUSED' : 'ACTIVE',
            tier: state.tier,
            bannerMessage: String(remote.globalBroadcastBanner || ''),
            lastSyncedAt: new Date().toLocaleTimeString('en-PK')
          };
          setState(next);
          localStorage.setItem(CONTROL_STATE_KEY, JSON.stringify(next));
        }
      } catch {}
    })();
  }, []);

  const applyOfflineCommand = (rawCmd: string) => {
    const cmd = rawCmd.trim().toUpperCase();
    let next: SovereignControlState | null = null;

    if (cmd === 'BMZ-PRO-0305') {
      next = { ...state, tier: 'ARTHIYA_GOLD_PRO', bannerMessage: 'Arthiya Gold Pro Unlocked by Founder Mahtab', lastSyncedAt: 'Offline Command' };
      setStatusMsg('Arthiya Gold Pro activated offline!');
    } else if (cmd === 'BMZ-MILL-0305') {
      next = { ...state, tier: 'ENTERPRISE_MILL', bannerMessage: 'Enterprise Mill License Active (Authorized by Mahtab)', lastSyncedAt: 'Offline Command' };
      setStatusMsg('Enterprise Mill License activated offline!');
    } else if (cmd === 'BMZ-PAUSE-0305') {
      next = { ...state, protocolStatus: 'PAUSED', bannerMessage: 'System paused by Founder Mahtab (Contact: 0305-8359178)', lastSyncedAt: 'Offline Kill-Switch' };
      setStatusMsg('Offline Kill-Switch engaged!');
    } else if (cmd === 'BMZ-RESUME-0305') {
      next = { ...state, protocolStatus: 'ACTIVE', bannerMessage: '', lastSyncedAt: 'Offline Command' };
      setStatusMsg('System restored to ACTIVE!');
    } else {
      setStatusMsg('Invalid Founder Command Key.');
      return;
    }

    if (next) {
      sovereignSound.playSuccessChime();
      setState(next);
      localStorage.setItem(CONTROL_STATE_KEY, JSON.stringify(next));
      setCommandInput('');
    }
  };

  return (
    <>
      {state.protocolStatus === 'PAUSED' && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100000, background: '#050811', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'sans-serif', textAlign: 'center' }}>
          <div style={{ maxWidth: '360px', background: '#090d16', border: '2px solid #ef4444', borderRadius: '18px', padding: '22px' }}>
            <div style={{ fontSize: '12px', fontWeight: 900, color: '#f87171' }}>FOUNDER SOVEREIGN HOLD</div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, margin: '8px 0' }}>System Paused by Founder Mahtab</h2>
            <p style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '14px' }}>
              {state.bannerMessage || 'Official authorization required. Contact Founder Guardian: 0305-8359178'}
            </p>
            <input
              type="text"
              placeholder="Enter Founder Resume Key..."
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '13px', marginBottom: '8px', boxSizing: 'border-box' }}
            />
            <button onClick={() => applyOfflineCommand(commandInput)} style={{ width: '100%', background: '#10b981', color: '#052e16', fontWeight: 900, border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', cursor: 'pointer' }}>
              Execute Founder Key
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => { setOpen(!open); setStatusMsg(''); }}
        title="1-Click Online & Offline Founder Master Control"
        style={{
          position: 'fixed',
          bottom: '128px',
          left: '16px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #450a0a, #7f1d1d)',
          color: '#fecaca',
          border: '1px solid #ef4444',
          borderRadius: '999px',
          padding: '6px 13px',
          fontSize: '11px',
          fontWeight: 800,
          cursor: 'pointer'
        }}
      >
        {open ? 'Close Control' : `⚡ Master Control (${state.tier === 'FREE_COMMUNITY' ? 'Free' : 'PRO'})`}
      </button>

      {open && (
        <div style={{ position: 'fixed', bottom: '166px', left: '16px', zIndex: 9999, width: '335px', background: '#090d16', color: '#f8fafc', border: '2px solid #ef4444', borderRadius: '16px', padding: '16px', fontFamily: 'sans-serif', boxShadow: '0 16px 40px rgba(0,0,0,0.85)' }}>
          <div style={{ fontSize: '14px', fontWeight: 900, color: '#f87171', marginBottom: '4px' }}>
            1-Click Founder Master Control (Mahtab)
          </div>
          <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '10px', lineHeight: 1.4 }}>
            Control any device 100% offline via Cryptographic Command Keys or globally online via GitHub Sovereign Feed:
          </p>

          <div style={{ background: '#1e293b', padding: '8px 10px', borderRadius: '8px', fontSize: '11px', marginBottom: '10px' }}>
            <div><strong>Active Tier:</strong> <span style={{ color: '#34d399' }}>{state.tier}</span></div>
            <div><strong>Status:</strong> <span style={{ color: '#fbbf24' }}>{state.protocolStatus}</span> ({state.lastSyncedAt})</div>
          </div>

          <input
            type="text"
            placeholder="Enter Offline Command Key (e.g. BMZ-PRO-0305)"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            style={{ width: '100%', padding: '9px', borderRadius: '8px', background: '#1e293b', color: '#fbbf24', border: '1px solid #475569', fontSize: '12px', fontWeight: 800, marginBottom: '8px', boxSizing: 'border-box' }}
          />

          <button onClick={() => applyOfflineCommand(commandInput)} style={{ width: '100%', background: '#ef4444', color: '#ffffff', fontWeight: 900, border: 'none', borderRadius: '8px', padding: '9px', fontSize: '12px', cursor: 'pointer', marginBottom: '8px' }}>
            Execute Offline Command Instantly
          </button>

          <button onClick={() => window.open('https://github.com', '_blank')} style={{ width: '100%', background: '#1e293b', color: '#38bdf8', fontWeight: 800, border: '1px solid #38bdf8', borderRadius: '8px', padding: '8px', fontSize: '11px', cursor: 'pointer' }}>
            1-Click Global Online Control (Edit GitHub Feed)
          </button>

          {statusMsg && <div style={{ marginTop: '8px', fontSize: '11px', color: '#34d399', fontWeight: 700 }}>{statusMsg}</div>}
        </div>
      )}
    </>
  );
};