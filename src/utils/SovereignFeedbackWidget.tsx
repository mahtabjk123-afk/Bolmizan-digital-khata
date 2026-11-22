import React, { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { sovereignSound } from './sovereignSoundEngine';
import { telemetryAgent } from './SovereignTelemetryAgent';

const STORAGE_KEY = 'bolmizan_sovereign_user_feedback';

export const SovereignFeedbackWidget: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    telemetryAgent.init();
  }, []);

  const handleSaveOffline = async () => {
    if (!message.trim()) {
      setStatus('Pehle apni raye likhein.');
      return;
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift({ id: 'FB-' + Date.now(), message: message.trim(), createdAt: new Date().toISOString() });
      const serialized = JSON.stringify(list);
      localStorage.setItem(STORAGE_KEY, serialized);
      await Preferences.set({ key: STORAGE_KEY, value: serialized });
    } catch {}
    await telemetryAgent.track('FEEDBACK_SUBMITTED', 'FEEDBACK_AI');
    sovereignSound.playSuccessChime();
    setMessage('');
    setStatus('Saved in 30-Day AI Consensus Queue!');
  };

  const handleWhatsApp = () => {
    const stats = telemetryAgent.getStats();
    const text = 'BOLMIZAN FEEDBACK & TELEMETRY\nEvents: ' + stats.totalEvents + '\nMessage: ' + (message.trim() || 'App working great!');
    window.open('https://wa.me' + encodeURIComponent(text), '_blank');
  };

  const stats = telemetryAgent.getStats();

  const btn = React.createElement(
    'button',
    {
      onClick: () => { setOpen(!open); setStatus(''); },
      style: { position: 'fixed', bottom: '54px', right: '16px', zIndex: 9999, background: '#1e1b4b', color: '#fbbf24', border: '1px solid #f59e0b', borderRadius: '999px', padding: '7px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }
    },
    open ? 'Close' : 'AI Feedback (' + stats.totalEvents + ')'
  );

  const panel = open
    ? React.createElement(
        'div',
        {
          style: { position: 'fixed', bottom: '96px', right: '16px', zIndex: 9999, width: '315px', background: '#0f172a', color: '#f8fafc', border: '1px solid #f59e0b', borderRadius: '14px', padding: '15px', fontFamily: 'sans-serif' }
        },
        React.createElement('div', { style: { fontWeight: 900, fontSize: '14px', color: '#fbbf24', marginBottom: '6px' } }, 'Voice & AI Feedback Radar'),
        React.createElement('div', { style: { fontSize: '11px', color: '#94a3b8', marginBottom: '8px' } }, 'Offline Actions: ' + stats.offlineEvents + ' | Online: ' + stats.onlineEvents),
        React.createElement('textarea', {
          rows: 3,
          placeholder: 'Apni raye ya naya feature likhein...',
          value: message,
          onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value),
          style: { width: '100%', padding: '8px', borderRadius: '8px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }
        }),
        React.createElement('button', { onClick: handleSaveOffline, style: { width: '100%', background: '#10b981', color: '#052e16', fontWeight: 800, border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px', cursor: 'pointer', marginBottom: '6px' } }, 'Save Offline'),
        React.createElement('button', { onClick: handleWhatsApp, style: { width: '100%', background: '#25D366', color: '#052e16', fontWeight: 800, border: 'none', borderRadius: '8px', padding: '8px', fontSize: '12px', cursor: 'pointer' } }, 'Send to Founder WhatsApp'),
        status ? React.createElement('div', { style: { marginTop: '8px', fontSize: '11px', color: '#34d399', fontWeight: 700 } }, status) : null
      )
    : null;

  return React.createElement(React.Fragment, null, btn, panel);
};