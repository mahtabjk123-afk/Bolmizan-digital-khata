import React, { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { sovereignSound } from './sovereignSoundEngine';

interface FeedbackItem {
  id: string;
  rating: number;
  category: string;
  message: string;
  userRole: string;
  createdAt: string;
}

const STORAGE_KEY = 'bolmizan_sovereign_user_feedback';
const GITHUB_ISSUES_URL = 'https://github.com';

export const SovereignFeedbackWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('Mandi Feature Idea');
  const [userRole, setUserRole] = useState('Dukandar / Arthiya');
  const [message, setMessage] = useState('');
  const [savedList, setSavedList] = useState<FeedbackItem[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await Preferences.get({ key: STORAGE_KEY });
        const raw = res.value || localStorage.getItem(STORAGE_KEY);
        if (raw) setSavedList(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  const persistFeedback = async (items: FeedbackItem[]) => {
    setSavedList(items);
    const serialized = JSON.stringify(items);
    localStorage.setItem(STORAGE_KEY, serialized);
    try {
      await Preferences.set({ key: STORAGE_KEY, value: serialized });
    } catch {}
  };

  const handleSaveOffline = async () => {
    if (!message.trim()) {
      setStatus('Pehle apni raye ya masla likhein.');
      return;
    }
    const entry: FeedbackItem = {
      id: `FB-${Date.now()}`,
      rating,
      category,
      userRole,
      message: message.trim(),
      createdAt: new Date().toISOString()
    };
    await persistFeedback([entry, ...savedList]);
    sovereignSound.playSuccessChime();
    setMessage('');
    setStatus('Shukriya! Aapka feedback offline phone mein save ho gaya hai.');
  };

  const handleSendWhatsApp = () => {
    const text = `⭐ *BOLMIZAN USER FEEDBACK (${rating}/5 Stars)*\n👤 Role: ${userRole}\n📂 Category: ${category}\n💬 Message: ${message.trim() || 'App bohot achi chal rahi hai!'}\n📍 Device: Offline Android Build`;
    window.open(`https://wa.me{encodeURIComponent(text)}`, '_blank');
  };

  const handleSendGitHub = () => {
    const title = encodeURIComponent(`[User Feedback] ${category} (${rating}/5★)`);
    const body = encodeURIComponent(`**Role:** ${userRole}\n**Rating:** ${rating}/5\n**Category:** ${category}\n\n**Feedback:**\n${message.trim() || 'Great offline experience!'}`);
    window.open(`${GITHUB_ISSUES_URL}?title=${title}&body=${body}`, '_blank');
  };

  return (
    <>
      <button
        onClick={() => { setOpen(!open); setStatus(''); }}
        title="Send Feedback or Report Issue"
        style={{
          position: 'fixed',
          bottom: '54px',
          right: '16px',
          zIndex: 9999,
          background: '#1e1b4b',
          color: '#fbbf24',
          border: '1px solid #f59e0b',
          borderRadius: '999px',
          padding: '7px 14px',
          fontSize: '12px',
          fontWeight: 700,
          boxShadow: '0 4px 14px rgba(0,0,0,0.45)',
          cursor: 'pointer'
        }}
      >
        {open ? '✕ Close' : '⭐ Feedback'}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '16px',
            zIndex: 9999,
            width: '310px',
            maxHeight: '80vh',
            overflowY: 'auto',
            background: '#0f172a',
            color: '#f8fafc',
            border: '1px solid #f59e0b',
            borderRadius: '14px',
            padding: '16px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
            fontFamily: 'sans-serif'
          }}
        >
          <div style={{ fontWeight: 800, fontSize: '15px', color: '#fbbf24', marginBottom: '4px' }}>
            Aapki Raye / Feedback
          </div>
          <p style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '10px' }}>
            Bina internet offline save karein ya seedha developer ko WhatsApp/GitHub par bhejein:
          </p>

          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                style={{
                  flex: 1,
                  padding: '6px 0',
                  borderRadius: '8px',
                  border: star <= rating ? '1px solid #fbbf24' : '1px solid #334155',
                  background: star <= rating ? 'rgba(245,158,11,0.2)' : '#1e293b',
                  color: star <= rating ? '#fbbf24' : '#64748b',
                  fontWeight: 800,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                {star}★
              </button>
            ))}
          </div>

          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', background: '#1e293b', color: '#f8fafc', border: '1px solid #475569', fontSize: '12px', marginBottom: '8px' }}
          >
            <option>Dukandar / Arthiya</option>
            <option>Kisan / Farmer</option>
            <option>ISEF Judge / Evaluator</option>
            <option>Student / General User</option>
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', background: '#1e293b', color: '#f8fafc', border: '1px solid #475569', fontSize: '12px', marginBottom: '8px' }}
          >
            <option>Mandi Feature Idea</option>
            <option>Bug / Masla Report</option>
            <option>Sindhi / Urdu Translation</option>
            <option>App Tareef / Review</option>
          </select>

          <textarea
            rows={3}
            placeholder="Apni raye, masla ya naya idea yahan likhein..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: '100%', padding: '9px', borderRadius: '8px', background: '#1e293b', color: '#ffffff', border: '1px solid #475569', fontSize: '12px', marginBottom: '10px', boxSizing: 'border-box', resize: 'none' }}
          />

          <button
            onClick={handleSaveOffline}
            style={{ width: '100%', background: '#10b981', color: '#052e16', fontWeight: 800, border: 'none', borderRadius: '8px', padding: '9px', fontSize: '12px', cursor: 'pointer', marginBottom: '6px' }}
          >
            Offline Save Karein ({savedList.length})
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <button
              onClick={handleSendWhatsApp}
              style={{ background: '#25D366', color: '#052e16', fontWeight: 800, border: 'none', borderRadius: '8px', padding: '8px', fontSize: '11px', cursor: 'pointer' }}
            >
              WhatsApp Bhejein
            </button>
            <button
              onClick={handleSendGitHub}
              style={{ background: '#334155', color: '#f8fafc', fontWeight: 700, border: '1px solid #475569', borderRadius: '8px', padding: '8px', fontSize: '11px', cursor: 'pointer' }}
            >
              GitHub Issue
            </button>
          </div>

          {status && (
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#34d399', fontWeight: 600 }}>
              {status}
            </div>
          )}
        </div>
      )}
    </>
  );
};