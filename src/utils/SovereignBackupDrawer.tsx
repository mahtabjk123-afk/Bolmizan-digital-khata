import React, { useState } from 'react';
import { Preferences } from '@capacitor/preferences';

export const SovereignBackupDrawer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');

  const handleExport = async () => {
    try {
      const { keys } = await Preferences.keys();
      const dump: Record<string, string | null> = {};
      for (const k of keys) {
        if (k.startsWith('bolmizan_')) {
          const res = await Preferences.get({ key: k });
          dump[k] = res.value;
        }
      }
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('bolmizan_') && !(k in dump)) {
          dump[k] = localStorage.getItem(k);
        }
      }
      const payload = JSON.stringify({
        app: 'BolMizan Sovereign OS',
        version: '1.1.0',
        exportedAt: new Date().toISOString(),
        records: dump
      }, null, 2);

      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BolMizan-Khata-Backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('Backup file saved! Safe to share via WhatsApp.');
    } catch {
      setStatus('Backup export failed. Please try again.');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const records = parsed.records || parsed;
      let count = 0;
      for (const [k, v] of Object.entries(records)) {
        if (typeof v === 'string') {
          await Preferences.set({ key: k, value: v });
          localStorage.setItem(k, v);
          count++;
        }
      }
      setStatus(`Restored ${count} offline ledger stores! Reloading...`);
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setStatus('Invalid backup file format.');
    }
  };

  return (
    <>
      <button
        onClick={() => { setOpen(!open); setStatus(''); }}
        title="Offline Khata Backup & Restore"
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          zIndex: 9999,
          background: '#0f172a',
          color: '#38bdf8',
          border: '1px solid #38bdf8',
          borderRadius: '999px',
          padding: '8px 14px',
          fontSize: '12px',
          fontWeight: 700,
          boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
          cursor: 'pointer'
        }}
      >
        {open ? 'Close Backup' : 'Khata Backup'}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '60px',
            right: '16px',
            zIndex: 9999,
            width: '290px',
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
            fontFamily: 'sans-serif'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#38bdf8', marginBottom: '6px' }}>
            Offline Sovereign Backup
          </div>
          <p style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '12px', lineHeight: 1.4 }}>
            Export your entire Khata ledger to a file (shareable on WhatsApp) or restore on a new phone without internet.
          </p>
          <button
            onClick={handleExport}
            style={{
              width: '100%',
              background: '#10b981',
              color: '#052e16',
              fontWeight: 700,
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '13px',
              cursor: 'pointer',
              marginBottom: '8px'
            }}
          >
            Download Backup (.json)
          </button>
          <label
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'center',
              background: '#1e293b',
              color: '#f8fafc',
              fontWeight: 600,
              border: '1px solid #475569',
              borderRadius: '8px',
              padding: '9px',
              fontSize: '12px',
              cursor: 'pointer',
              boxSizing: 'border-box'
            }}
          >
            Restore From Backup File
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          {status && (
            <div style={{ marginTop: '10px', fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
              {status}
            </div>
          )}
        </div>
      )}
    </>
  );
};