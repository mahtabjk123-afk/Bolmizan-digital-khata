import React, { useState, useEffect } from 'react';
import { sovereignSound } from './sovereignSoundEngine';

const APK_URL = 'https://github.com';

export const SovereignHabitEngine: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [udhaarTotal, setUdhaarTotal] = useState(0);
  const [topDebtor, setTopDebtor] = useState<{ name: string; amount: number } | null>(null);

  const refreshHabitStats = () => {
    try {
      const raw = localStorage.getItem('bolmizan_sovereign_v1_ledger_entries');
      if (!raw) return;
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return;
      let sum = 0;
      let maxItem: { name: string; amount: number } | null = null;
      for (const item of list) {
        if (String(item.type) === 'CREDIT') {
          const amt = Number(item.amount || 0);
          sum += amt;
          if (!maxItem || amt > maxItem.amount) {
            maxItem = { name: String(item.partyName || 'Gahak'), amount: amt };
          }
        }
      }
      setUdhaarTotal(sum);
      setTopDebtor(maxItem);
    } catch {}
  };

  useEffect(() => {
    refreshHabitStats();
  }, [open]);

  const sendPoliteUdhaarReminder = () => {
    sovereignSound.playSuccessChime();
    const who = topDebtor ? topDebtor.name : 'Mohtaram Gahak';
    const amt = topDebtor ? topDebtor.amount.toLocaleString() : udhaarTotal.toLocaleString();
    const msg = `Assalam-o-Alaikum ${who},\n\nYaad-dehani: BolMizan Digital Khata ke mutabiq aap ke zimme Rs. ${amt} baqi (Udhaar) hain. Barah-e-karam sahulat ke mutabiq tasfiya farma lein.\n\nShukriya!\n— Verified via BolMizan Sovereign OS (${APK_URL})`;
    window.open(`https://wa.me{encodeURIComponent(msg)}`, '_blank');
  };

  const shareMorningMandiBoard = () => {
    sovereignSound.playSuccessChime();
    const today = new Date().toLocaleDateString('en-PK');
    const board = `🌾 *SAKRAND & SINDH MANDI MORNING RATE (${today})*\n• Gandum (Wheat): Rs. 3,850 / 40kg\n• Kapas (Cotton): Rs. 8,400 / 40kg\n• Tamatar (Tomato): Rs. 2,200 / Crate\n• Piyaz (Onion): Rs. 2,600 / 40kg\n\n📲 Bina internet rozana mandi rate aur pakki digital parchi ke liye BolMizan download karein:\n${APK_URL}`;
    window.open(`https://wa.me{encodeURIComponent(board)}`, '_blank');
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        title="Morning Sakrand Mandi Rates & 1-Tap Udhaar Recovery"
        style={{
          position: 'fixed',
          bottom: '128px',
          right: '16px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #b45309, #047857)',
          color: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '999px',
          padding: '6px 13px',
          fontSize: '11px',
          fontWeight: 800,
          cursor: 'pointer'
        }}
      >
        {open ? 'Close' : '🌾 Mandi Rate & Wasooli'}
      </button>

      {open && (
        <div style={{ position: 'fixed', bottom: '166px', right: '16px', zIndex: 9999, width: '325px', background: '#090d16', color: '#f8fafc', border: '2px solid #fbbf24', borderRadius: '16px', padding: '15px', fontFamily: 'sans-serif', boxShadow: '0 16px 40px rgba(0,0,0,0.85)' }}>
          <div style={{ fontSize: '14px', fontWeight: 900, color: '#fbbf24', marginBottom: '4px' }}>
            Sakrand Morning Mandi & Wasooli Loop
          </div>
          <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '10px' }}>
            Subah ke mandi rates share karein ya 1 tap mein polite WhatsApp udhaar reminder bhejein:
          </p>

          <div style={{ background: '#1e293b', padding: '10px', borderRadius: '10px', marginBottom: '10px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Kul Market Udhaar:</span>
              <strong style={{ color: '#f87171' }}>Rs. {udhaarTotal.toLocaleString()}</strong>
            </div>
            {topDebtor && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Sab Se Bara Baqi:</span>
                <strong>{topDebtor.name} (Rs. {topDebtor.amount.toLocaleString()})</strong>
              </div>
            )}
          </div>

          <button onClick={sendPoliteUdhaarReminder} style={{ width: '100%', background: '#10b981', color: '#052e16', fontWeight: 900, border: 'none', borderRadius: '8px', padding: '9px', fontSize: '11px', cursor: 'pointer', marginBottom: '6px' }}>
            Send Polite Udhaar Reminder (WhatsApp)
          </button>

          <button onClick={shareMorningMandiBoard} style={{ width: '100%', background: '#f59e0b', color: '#090d16', fontWeight: 900, border: 'none', borderRadius: '8px', padding: '9px', fontSize: '11px', cursor: 'pointer' }}>
            Share Sakrand Morning Mandi Rates
          </button>
        </div>
      )}
    </>
  );
};