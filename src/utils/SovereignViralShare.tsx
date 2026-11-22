import React, { useState } from 'react';

const APK_URL = 'https://github.com';

export const SovereignViralShare: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const viralMessage = `🌾 *BolMizan Sovereign OS (100% Free & Offline)*\nBina internet chalne wali Digital Khata, Sindhi/Urdu Voice Sabzi Parchi aur BISP/8171 Scam Bachao App!\n\n📲 Direct Free Android APK Download:\n${APK_URL}`;

  const handleWhatsAppShare = () => {
    const waUrl = `https://wa.me{encodeURIComponent(viralMessage)}`;
    window.open(waUrl, '_blank');
  };

  const handleCopyFooter = async () => {
    try {
      await navigator.clipboard.writeText(viralMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        title="Share BolMizan App via WhatsApp"
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          zIndex: 9999,
          background: '#059669',
          color: '#ffffff',
          border: '1px solid #34d399',
          borderRadius: '999px',
          padding: '8px 14px',
          fontSize: '12px',
          fontWeight: 700,
          boxShadow: '0 4px 14px rgba(5,150,105,0.45)',
          cursor: 'pointer'
        }}
      >
        {open ? 'Close Share' : 'Share App (Free)'}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '60px',
            left: '16px',
            zIndex: 9999,
            width: '295px',
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #10b981',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.65)',
            fontFamily: 'sans-serif'
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#34d399', marginBottom: '6px' }}>
            Doston & Dukandaron Ko Bhejein
          </div>
          <p style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '12px', lineHeight: 1.4 }}>
            Har Sabzi Parchi ya Khata message ke saath apna free download link share karein taake har kisan aur dukandar offline app use kar sake.
          </p>
          <button
            onClick={handleWhatsAppShare}
            style={{
              width: '100%',
              background: '#25D366',
              color: '#052e16',
              fontWeight: 800,
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              fontSize: '13px',
              cursor: 'pointer',
              marginBottom: '8px'
            }}
          >
            WhatsApp Par Share Karein
          </button>
          <button
            onClick={handleCopyFooter}
            style={{
              width: '100%',
              background: '#1e293b',
              color: '#f8fafc',
              fontWeight: 600,
              border: '1px solid #475569',
              borderRadius: '8px',
              padding: '9px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            {copied ? 'Copied! Ab Parchi Ke Saath Paste Karein' : 'Parchi Viral Footer Copy Karein'}
          </button>
        </div>
      )}
    </>
  );
};