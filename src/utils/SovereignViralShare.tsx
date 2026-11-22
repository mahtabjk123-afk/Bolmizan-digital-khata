import React, { useState, useEffect } from 'react';

const APK_URL = 'https://github.com';

export const SovereignViralShare: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState('');
  const [streak, setStreak] = useState(1);
  const [trustScore, setTrustScore] = useState(100);

  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const lastDay = localStorage.getItem('bolmizan_last_active_day');
      let currentStreak = Number(localStorage.getItem('bolmizan_streak') || '1');
      if (lastDay && lastDay !== today) {
        currentStreak += 1;
      }
      localStorage.setItem('bolmizan_last_active_day', today);
      localStorage.setItem('bolmizan_streak', String(currentStreak));
      setStreak(currentStreak);
      setTrustScore(Math.min(999, 100 + currentStreak * 15));
    } catch {}
  }, []);

  const templates = {
    merchant: `🌾 *BolMizan Sovereign OS (100% Free & Offline)*\nBina internet chalne wali Digital Khata, Sindhi/Urdu Voice Sabzi Parchi aur Ushr/Karda App!\n\n📲 Direct Free Android APK:\n${APK_URL}`,
    scam: `🚨 *ZARORI WARNING (BISP 8171 / JazzCash Fraud Bachao)*\nKisi ko apna OTP ya PIN na dein! Apne phone par bina internet fake SMS check karne ke liye *BolMizan Scam Shield* free download karein:\n${APK_URL}`,
    vasooli: `📒 *Mizan Digital Khata Reminder*\nMohtaram, aapka mandi/dukan ka hisab BolMizan cryptographic ledger par mehfooz hai. Apni tasdeeq shuda digital parchi aur free app yahan se hasil karein:\n${APK_URL}`,
    badge: `🏆 *Verified Sovereign Merchant (Trust Score: ${trustScore} | ${streak}-Day Streak)*\nHamari dukan ka poora hisab-kitab aur Sabzi Parchi ab *BolMizan Cryptographic Ledger* par 100% transparent aur mehfooz hai.\n📲 Free App Download:\n${APK_URL}`
  };

  const shareViaWhatsApp = (text: string) => {
    window.open(`https://wa.me{encodeURIComponent(text)}`, '_blank');
  };

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(''), 2500);
    } catch {}
  };

  return (
    <>
      <button
        onClick={() => { setOpen(!open); setCopied(''); }}
        style={{
          position: 'fixed',
          bottom: '16px',
          left: '16px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #059669, #047857)',
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
        {open ? 'Close' : `🔥 ${streak}d | Share Free`}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '60px',
            left: '16px',
            zIndex: 9999,
            width: '310px',
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #10b981',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 12px 30px rgba(0,0,0,0.65)',
            fontFamily: 'sans-serif'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800, fontSize: '14px', color: '#34d399' }}>Sovereign Growth Hub</span>
            <span style={{ background: '#1e293b', color: '#fbbf24', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
              Trust: {trustScore}
            </span>
          </div>

          <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '12px', lineHeight: 1.4 }}>
            Har roz app kholne par aapka Merchant Trust Score barhta hai. 1 click mein WhatsApp par viral cards bhejein:
          </p>

          <button
            onClick={() => shareViaWhatsApp(templates.merchant)}
            style={{ width: '100%', background: '#25D366', color: '#052e16', fontWeight: 800, border: 'none', borderRadius: '8px', padding: '9px', fontSize: '12px', cursor: 'pointer', marginBottom: '7px' }}
          >
            1. Dukandar / Kisan Ko App Bhejein
          </button>

          <button
            onClick={() => shareViaWhatsApp(templates.scam)}
            style={{ width: '100%', background: '#ef4444', color: '#ffffff', fontWeight: 700, border: 'none', borderRadius: '8px', padding: '9px', fontSize: '12px', cursor: 'pointer', marginBottom: '7px' }}
          >
            2. BISP / 8171 Scam Alert Forward Karein
          </button>

          <button
            onClick={() => shareViaWhatsApp(templates.vasooli)}
            style={{ width: '100%', background: '#0284c7', color: '#ffffff', fontWeight: 700, border: 'none', borderRadius: '8px', padding: '9px', fontSize: '12px', cursor: 'pointer', marginBottom: '7px' }}
          >
            3. Udhaar / Vasooli Slip Bhejein
          </button>

          <button
            onClick={() => shareViaWhatsApp(templates.badge)}
            style={{ width: '100%', background: '#d97706', color: '#ffffff', fontWeight: 700, border: 'none', borderRadius: '8px', padding: '9px', fontSize: '12px', cursor: 'pointer', marginBottom: '7px' }}
          >
            4. WhatsApp Status Badge Lagayein
          </button>

          <button
            onClick={() => copyText('link', APK_URL)}
            style={{ width: '100%', background: '#1e293b', color: '#cbd5e1', fontWeight: 600, border: '1px solid #475569', borderRadius: '8px', padding: '7px', fontSize: '11px', cursor: 'pointer' }}
          >
            {copied === 'link' ? 'Direct APK Link Copied!' : 'Direct APK Link Copy Karein'}
          </button>
        </div>
      )}
    </>
  );
};