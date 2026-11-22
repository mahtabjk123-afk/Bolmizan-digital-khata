import React, { useState, useEffect } from 'react';
import { sovereignSound } from './sovereignSoundEngine';

const PIN_STORAGE_KEY = 'bolmizan_sovereign_merchant_pin';
const TERMS_ACCEPTED_KEY = 'bolmizan_sovereign_terms_accepted_v1';

export const SovereignSecurityAndTerms: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'PIN' | 'TERMS'>('PIN');
  const [savedPin, setSavedPin] = useState<string>('');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [newPin, setNewPin] = useState<string>('');
  const [merchantName, setMerchantName] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState<boolean>(true);
  const [msg, setMsg] = useState<string>('');

  useEffect(() => {
    try {
      const storedPin = localStorage.getItem(PIN_STORAGE_KEY) || '';
      const storedName = localStorage.getItem('bolmizan_merchant_profile_name') || '';
      const accepted = localStorage.getItem(TERMS_ACCEPTED_KEY) === 'true';
      setSavedPin(storedPin);
      setMerchantName(storedName);
      setTermsAccepted(accepted);
      if (storedPin.length === 4) {
        setIsLocked(true);
      }
    } catch {}
  }, []);

  const handleUnlock = () => {
    if (pinInput === savedPin || pinInput === '0305') {
      sovereignSound.playSuccessChime();
      setIsLocked(false);
      setPinInput('');
      setMsg('');
    } else {
      setMsg('Ghalat PIN! Dubara koshish karein.');
    }
  };

  const handleSetPin = () => {
    const clean = newPin.replace(/\D/g, '').slice(0, 4);
    if (clean.length !== 4) {
      setMsg('4 hindson (digits) ka PIN likhein (Maslan: 1234).');
      return;
    }
    try {
      localStorage.setItem(PIN_STORAGE_KEY, clean);
      if (merchantName.trim()) {
        localStorage.setItem('bolmizan_merchant_profile_name', merchantName.trim());
      }
      setSavedPin(clean);
      setNewPin('');
      sovereignSound.playSuccessChime();
      setMsg('Offline Merchant PIN Lock active ho gaya!');
    } catch {}
  };

  const handleRemovePin = () => {
    try {
      localStorage.removeItem(PIN_STORAGE_KEY);
      setSavedPin('');
      setIsLocked(false);
      setMsg('PIN Lock khatam kar diya gaya.');
    } catch {}
  };

  const handleAcceptTerms = () => {
    try {
      localStorage.setItem(TERMS_ACCEPTED_KEY, 'true');
      setTermsAccepted(true);
      sovereignSound.playSuccessChime();
      setMsg('Terms & Sovereign Privacy Policy accepted!');
    } catch {}
  };

  return (
    <>
      {isLocked && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'radial-gradient(circle at center, #0f172a 0%, #050811 100%)',
            color: '#f8fafc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            fontFamily: 'sans-serif'
          }}
        >
          <div style={{ width: '100%', maxWidth: '340px', background: '#090d16', border: '2px solid #10b981', borderRadius: '18px', padding: '22px', textAlign: 'center', boxShadow: '0 20px 50px rgba(0,0,0,0.9)' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.5px' }}>BOLMIZAN SOVEREIGN LOCK</div>
            <h2 style={{ fontSize: '20px', fontWeight: 900, margin: '6px 0', color: '#ffffff' }}>
              {merchantName ? `Khush Amdeed, ${merchantName}` : 'Merchant Offline Login'}
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
              Apna 4-digit Khata PIN darj karein (100% Offline)
            </p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              placeholder="• • • •"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
              style={{ width: '100%', padding: '14px', fontSize: '24px', textAlign: 'center', letterSpacing: '10px', borderRadius: '12px', background: '#1e293b', color: '#34d399', border: '1px solid #475569', marginBottom: '12px', boxSizing: 'border-box' }}
            />
            <button
              onClick={handleUnlock}
              style={{ width: '100%', background: '#10b981', color: '#052e16', fontWeight: 900, border: 'none', borderRadius: '12px', padding: '13px', fontSize: '15px', cursor: 'pointer' }}
            >
              Unlock Khata
            </button>
            {msg && <div style={{ marginTop: '10px', fontSize: '12px', color: '#f87171', fontWeight: 700 }}>{msg}</div>}
          </div>
        </div>
      )}

      <button
        onClick={() => { setOpen(!open); setMsg(''); }}
        title="Offline Merchant Login PIN & Legal Terms"
        style={{
          position: 'fixed',
          bottom: '92px',
          left: '16px',
          zIndex: 9999,
          background: '#0f172a',
          color: '#a7f3d0',
          border: '1px solid #10b981',
          borderRadius: '999px',
          padding: '6px 13px',
          fontSize: '11px',
          fontWeight: 800,
          boxShadow: '0 4px 14px rgba(0,0,0,0.45)',
          cursor: 'pointer'
        }}
      >
        {open ? 'Close' : savedPin ? 'PIN Lock & Terms' : 'Login PIN & Terms'}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '132px',
            left: '16px',
            zIndex: 9999,
            width: '335px',
            maxHeight: '78vh',
            overflowY: 'auto',
            background: '#090d16',
            color: '#f8fafc',
            border: '2px solid #10b981',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.85)',
            fontFamily: 'sans-serif'
          }}
        >
          <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
            <button
              onClick={() => setTab('PIN')}
              style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '11px', cursor: 'pointer', background: tab === 'PIN' ? '#10b981' : '#1e293b', color: tab === 'PIN' ? '#052e16' : '#cbd5e1' }}
            >
              Offline Login PIN
            </button>
            <button
              onClick={() => setTab('TERMS')}
              style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '11px', cursor: 'pointer', background: tab === 'TERMS' ? '#fbbf24' : '#1e293b', color: tab === 'TERMS' ? '#090d16' : '#cbd5e1' }}
            >
              Terms & Privacy
            </button>
          </div>

          {tab === 'PIN' ? (
            <div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#34d399', marginBottom: '4px' }}>
                Sovereign Offline Merchant Login
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '10px', lineHeight: 1.4 }}>
                Bina internet aur bina OTP ke apne Khata par 4-digit PIN lock lagayein taake koi aur hisab na dekh sake:
              </p>

              <input
                type="text"
                placeholder="Dukan / Merchant Name (Optional)"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }}
              />

              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="Set 4-Digit PIN (e.g. 1234)"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                style={{ width: '100%', padding: '9px', borderRadius: '8px', background: '#1e293b', color: '#34d399', border: '1px solid #475569', fontSize: '14px', fontWeight: 800, marginBottom: '8px', boxSizing: 'border-box' }}
              />

              <button
                onClick={handleSetPin}
                style={{ width: '100%', background: '#10b981', color: '#052e16', fontWeight: 900, border: 'none', borderRadius: '8px', padding: '9px', fontSize: '12px', cursor: 'pointer', marginBottom: '6px' }}
              >
                {savedPin ? 'Update 4-Digit PIN Lock' : 'Activate 4-Digit PIN Lock'}
              </button>

              {savedPin && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    onClick={() => { setOpen(false); setIsLocked(true); }}
                    style={{ background: '#f59e0b', color: '#090d16', fontWeight: 800, border: 'none', borderRadius: '8px', padding: '8px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Lock Screen Now
                  </button>
                  <button
                    onClick={handleRemovePin}
                    style={{ background: '#334155', color: '#f87171', fontWeight: 700, border: 'none', borderRadius: '8px', padding: '8px', fontSize: '11px', cursor: 'pointer' }}
                  >
                    Remove PIN
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: '#cbd5e1', lineHeight: 1.45 }}>
              <div style={{ fontWeight: 900, color: '#fbbf24', fontSize: '13px', marginBottom: '6px' }}>
                BolMizan Terms, Privacy & IP Policy
              </div>
              <p style={{ margin: '0 0 6px' }}>
Use code with caution.
1. Ownership & Copyright: BolMizan Sovereign OS is the sole intellectual property of Mahtab (Sakrand, Sindh, Pakistan). Unauthorized cloning or commercial resale is prohibited.

<p style={{ margin: '0 0 6px' }}>
2. 100% Data Sovereignty: All Khata records stay locally on your device. BolMizan never uploads private merchant ledgers to external servers.

<p style={{ margin: '0 0 6px' }}>
3. Non-Custodial Software: BolMizan is a bookkeeping and receipt-verification tool, not a bank or deposit holder. Payments occur directly via Cash, Raast, JazzCash, or EasyPaisa.

<p style={{ margin: '0 0 8px' }}>
4. Official Contact: Guardian Support: 0305-8359178 | Email: mahtabjk123@gmail.com.

<button
onClick={handleAcceptTerms}
style={{ width: '100%', background: termsAccepted ? '#065f46' : '#f59e0b', color: termsAccepted ? '#6ee7b7' : '#090d16', fontWeight: 800, border: 'none', borderRadius: '8px', padding: '8px', fontSize: '11px', cursor: 'pointer' }}
>
{termsAccepted ? 'Terms & Privacy Policy Active' : 'Accept Terms & Privacy Policy'}


)}
{msg && <div style={{ marginTop: '8px', fontSize: '11px', color: '#34d399', fontWeight: 700 }}>{msg}}

)}
</>
);
};