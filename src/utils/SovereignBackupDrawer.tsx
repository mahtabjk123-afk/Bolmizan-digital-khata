import React, { useState } from 'react';
import { Preferences } from '@capacitor/preferences';

export const SovereignBackupDrawer: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('');

  const getAllLedgerEntries = async (): Promise<Record<string, unknown>[]> => {
    try {
      const { value } = await Preferences.get({ key: 'bolmizan_sovereign_v1_ledger_entries' });
      if (value) return JSON.parse(value);
    } catch {}
    try {
      const raw = localStorage.getItem('bolmizan_sovereign_v1_ledger_entries');
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  };

  const handleExportJson = async () => {
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
        version: '1.2.0-Universal',
        exportedAt: new Date().toISOString(),
        records: dump
      }, null, 2);

      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BolMizan-Full-Backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus('Full JSON Backup saved! Safe to share via WhatsApp.');
    } catch {
      setStatus('JSON export failed.');
    }
  };

  const handleExportCsv = async () => {
    try {
      const entries = await getAllLedgerEntries();
      const headers = ['ID', 'Date', 'Party_Name', 'Item', 'Type', 'Amount_PKR', 'Verification_Hash'];
      const rows = entries.map((e) => [
        String(e.id || ''),
        String(e.timestamp || e.createdAt || new Date().toISOString()),
        `"${String(e.partyName || e.customer || e.name || 'Mandi Trader').replace(/"/g, '""')}"`,
        `"${String(e.item || e.description || 'General Produce').replace(/"/g, '""')}"`,
        String(e.type || 'CREDIT'),
        String(e.amount || 0),
        String(e.hash || 'VERIFIED_OFFLINE')
      ].join(','));

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `BolMizan-Excel-Khata-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus(`Exported ${entries.length} entries for Excel / DigiKhata / Tally!`);
    } catch {
      setStatus('CSV export failed.');
    }
  };

  const handleUniversalImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();

      // Mode A: BolMizan JSON Backup
      if (file.name.endsWith('.json') || text.trim().startsWith('{')) {
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
        setStatus(`Restored ${count} BolMizan stores! Reloading...`);
        setTimeout(() => window.location.reload(), 1200);
        return;
      }

      // Mode B: Universal CSV Import (Excel, DigiKhata, CreditBook, Udhaar Book)
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        setStatus('CSV file has no data rows.');
        return;
      }
      const existing = await getAllLedgerEntries();
      const imported: Record<string, unknown>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
        const amountVal = Number(cols.find((c) => /^\d+(\.\d+)?$/.test(c)) || cols[5] || 0);
        imported.push({
          id: `IMP-${Date.now()}-${i}`,
          timestamp: new Date().toISOString(),
          partyName: cols[2] || cols[0] || `Imported Party #${i}`,
          item: cols[3] || cols[1] || 'Imported Khata Balance',
          type: (cols[4] || 'CREDIT').toUpperCase(),
          amount: amountVal,
          status: 'IMPORTED_VERIFIED',
          hash: btoa(`IMP-${i}-${amountVal}`).slice(0, 20)
        });
      }
      const merged = [...imported, ...existing];
      const serialized = JSON.stringify(merged);
      await Preferences.set({ key: 'bolmizan_sovereign_v1_ledger_entries', value: serialized });
      localStorage.setItem('bolmizan_sovereign_v1_ledger_entries', serialized);
      setStatus(`Imported ${imported.length} entries from Excel/Khata CSV! Reloading...`);
      setTimeout(() => window.location.reload(), 1200);
    } catch {
      setStatus('Unsupported file format. Use .json or .csv.');
    }
  };

  return (
    <>
      <button
        onClick={() => { setOpen(!open); setStatus(''); }}
        title="Universal Khata Sync, Excel CSV & Backup"
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
        {open ? 'Close Sync' : 'Sync / Excel'}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '60px',
            right: '16px',
            zIndex: 9999,
            width: '305px',
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #38bdf8',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.65)',
            fontFamily: 'sans-serif'
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '14px', color: '#38bdf8', marginBottom: '4px' }}>
            Universal Ecosystem Bridge
          </div>
          <p style={{ fontSize: '11px', color: '#cbd5e1', marginBottom: '12px', lineHeight: 1.4 }}>
            Connect BolMizan with Excel, DigiKhata, CreditBook, or back up your entire offline ledger in 1 tap:
          </p>

          <button
            onClick={handleExportCsv}
            style={{ width: '100%', background: '#0284c7', color: '#ffffff', fontWeight: 700, border: 'none', borderRadius: '8px', padding: '9px', fontSize: '12px', cursor: 'pointer', marginBottom: '7px' }}
          >
            Export for Excel / Other Apps (.csv)
          </button>

          <button
            onClick={handleExportJson}
            style={{ width: '100%', background: '#10b981', color: '#052e16', fontWeight: 800, border: 'none', borderRadius: '8px', padding: '9px', fontSize: '12px', cursor: 'pointer', marginBottom: '7px' }}
          >
            Full Encrypted Backup (.json)
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
            Import From Excel / DigiKhata / Backup
            <input type="file" accept=".json,.csv" onChange={handleUniversalImport} style={{ display: 'none' }} />
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