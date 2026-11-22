import React, { useState } from 'react';
import { Preferences } from '@capacitor/preferences';

const APK_LINK = 'https://github.com';

export const SovereignAamAadmiMode: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [party, setParty] = useState('');
  const [amount, setAmount] = useState('');
  const [entryType, setEntryType] = useState<'IN' | 'UDHAAR'>('IN');
  const [msg, setMsg] = useState('');

  const speakFeedback = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ur-PK';
        window.speechSynthesis.speak(u);
      }
    } catch {}
  };

  const handleVoiceInput = () => {
    try {
      const SR = (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any }).SpeechRecognition ||
                 (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;
      if (!SR) {
        setMsg('Mic not supported on this browser; type number below.');
        return;
      }
      const rec = new SR();
      rec.lang = 'ur-PK';
      setMsg('Bolain... (Maslan: Ahmed 5000)');
      rec.onresult = (ev: any) => {
        const transcript = String(ev.results?.[0]?.[0]?.transcript || '');
        const numMatch = transcript.match(/(\d[\d,]*)/);
        if (numMatch) setAmount(numMatch[0].replace(/,/g, ''));
        const namePart = transcript.replace(/(\d[\d,]*)/g, '').trim();
        if (namePart) setParty(namePart);
        setMsg(`Suna gaya: ${transcript}`);
      };
      rec.start();
    } catch {
      setMsg('Mic permission check karein.');
    }
  };

  const saveAndShare = async (sendWhatsApp: boolean) => {
    const num = Number(amount || 0);
    if (!num) {
      setMsg('Pehle raqam (Amount) likhein ya bolein.');
      return;
    }
    const cleanParty = party.trim() || 'Gahak / Kisan';
    const record = {
      id: `BMZ-${Date.now()}`,
      timestamp: new Date().toISOString(),
      partyName: cleanParty,
      item: entryType === 'IN' ? 'Naqad Wasooli' : 'Udhaar Khata',
      type: entryType === 'IN' ? 'CASH_SALE' : 'CREDIT',
      amount: num,
      status: 'VERIFIED_OFFLINE',
      hash: btoa(`${Date.now()}-${num}`).slice(0, 18)
    };

    try {
      const key = 'bolmizan_sovereign_v1_ledger_entries';
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      const next = [record, ...list];
      const json = JSON.stringify(next);
      localStorage.setItem(key, json);
      await Preferences.set({ key, value: json });
    } catch {}

    speakFeedback(`${cleanParty} ke ${num} rupay save ho gaye`);
    setMsg(`Save ho gaya! (${cleanParty}: Rs. ${num})`);

    if (sendWhatsApp) {
      const label = entryType === 'IN' ? 'Naqad Jama (Cash Received)' : 'Udhaar Baqi (Credit)';
      const text = `🧾 *BOLMIZAN DIGITAL PARCHI*\n👤 Naam: ${cleanParty}\n📌 Tafseel: ${label}\n💰 Raqam: Rs. ${num.toLocaleString()}\n🔒 Code: ${record.hash}\n\n📲 Bina internet chalne wali free Khata & Scam Bachao App:\n${APK_LINK}`;
      window.open(`https://wa.me{encodeURIComponent(text)}`, '_blank');
    }

    setAmount('');
    setParty('');
  };

  return (
    <>
      <button
        onClick={() => { setOpen(!open); setMsg(''); }}
        style={{
          position: 'fixed',
          top: '12px',
          right: '12px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #10b981, #059669)',
          color: '#052e16',
          border: '2px solid #a7f3d0',
          borderRadius: '999px',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: 900,
          boxShadow: '0 4px 16px rgba(16,185,129,0.5)',
          cursor: 'pointer'
        }}
      >
        {open ? '✕ Band Karein' : '🎤 آسان کھاتہ (Easy Mode)'}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9998,
            background: '#090d16',
            color: '#ffffff',
            padding: '64px 18px 24px',
            overflowY: 'auto',
            fontFamily: 'sans-serif'
          }}
        >
          <div style={{ maxWidth: '420px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#34d399', textAlign: 'center', marginBottom: '4px' }}>
              آسان کھاتہ — Easy Mandi Mode
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', marginBottom: '18px' }}>
              Bina parhe likhe sirf 3 button se hisab aur parchi banayein
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <button
                onClick={() => setEntryType('IN')}
                style={{
                  padding: '18px 10px',
                  borderRadius: '16px',
                  border: entryType === 'IN' ? '3px solid #6ee7b7' : '1px solid #334155',
                  background: entryType === 'IN' ? '#065f46' : '#1e293b',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                🟢 پیسہ آیا<br /><span style={{ fontSize: '12px', fontWeight: 500 }}>(Cash In)</span>
              </button>

              <button
                onClick={() => setEntryType('UDHAAR')}
                style={{
                  padding: '18px 10px',
                  borderRadius: '16px',
                  border: entryType === 'UDHAAR' ? '3px solid #fca5a5' : '1px solid #334155',
                  background: entryType === 'UDHAAR' ? '#991b1b' : '#1e293b',
                  color: '#ffffff',
                  fontSize: '16px',
                  fontWeight: 800,
                  cursor: 'pointer'
                }}
              >
                🔴 ادھار دیا<br /><span style={{ fontSize: '12px', fontWeight: 500 }}>(Udhaar / Out)</span>
              </button>
            </div>

            <button
              onClick={handleVoiceInput}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                fontSize: '17px',
                fontWeight: 800,
                marginBottom: '14px',
                cursor: 'pointer'
              }}
            >
              🎤 بول کر لکھیں (Voice Entry)
            </button>

            <input
              type="text"
              placeholder="👤 گاہک یا کسان کا نام (Name)"
              value={party}
              onChange={(e) => setParty(e.target.value)}
              style={{
                width: '100%',
                padding: '15px',
                fontSize: '17px',
                borderRadius: '12px',
                border: '1px solid #475569',
                background: '#1e293b',
                color: '#ffffff',
                marginBottom: '12px',
                boxSizing: 'border-box'
              }}
            />

            <input
              type="number"
              inputMode="numeric"
              placeholder="💰 رقم لکھیں (Rupees)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '22px',
                fontWeight: 800,
                borderRadius: '12px',
                border: '1px solid #475569',
                background: '#1e293b',
                color: '#34d399',
                marginBottom: '16px',
                boxSizing: 'border-box'
              }}
            />

            <button
              onClick={() => saveAndShare(true)}
              style={{
                width: '100%',
                padding: '18px',
                borderRadius: '16px',
                background: '#25D366',
                color: '#052e16',
                border: 'none',
                fontSize: '17px',
                fontWeight: 900,
                marginBottom: '10px',
                cursor: 'pointer'
              }}
            >
              📲 محفوظ کریں اور پرچی بھیجیں (WhatsApp)
            </button>

            <button
              onClick={() => saveAndShare(false)}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                background: '#334155',
                color: '#f8fafc',
                border: 'none',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ✅ صرف محفوظ کریں (Offline Save)
            </button>

            {msg && (
              <div style={{ marginTop: '14px', padding: '12px', borderRadius: '10px', background: '#064e3b', color: '#6ee7b7', textAlign: 'center', fontSize: '14px', fontWeight: 700 }}>
                {msg}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};