import React, { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { sovereignSound } from './sovereignSoundEngine';
import { telemetryAgent } from './SovereignTelemetryAgent';

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
  const [tab, setTab] = useState<'FEEDBACK' | 'ACTIVITY'>('FEEDBACK');
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('Missing Feature Request');
  const [userRole, setUserRole] = useState('Dukandar / Arthiya');
  const [message, setMessage] = useState('');
  const [savedList, setSavedList] = useState<FeedbackItem[]>([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    telemetryAgent.init();
    (async () => {
      try {
        const res = await Preferences.get({ key: STORAGE_KEY });
        const raw = res.value || localStorage.getItem(STORAGE_KEY);
        if (raw) setSavedList(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  const handleSaveOffline = async () => {
    if (!message.trim()) {
      setStatus('Pehle apni raye ya masla likhein.');
      return;
    }
    const entry: FeedbackItem = {
      id: 'FB-' + Date.now(),
      rating,
      category,
      userRole,
      message: message.trim(),
      createdAt: new Date().toISOString()
    };
    const next = [entry, ...savedList];
    setSavedList(next);
    const serialized = JSON.stringify(next);
    localStorage.setItem(STORAGE_KEY, serialized);
    try { await Preferences.set({ key: STORAGE_KEY, value: serialized }); } catch {}
    await telemetryAgent.track('FEEDBACK_SUBMITTED', 'FEEDBACK_AI');
    sovereignSound.playSuccessChime();
    setMessage('');
    setStatus('Saved in 30-Day AI Consensus Queue!');
  };

  const handleSendToAiOrchestrator = () => {
    const title = encodeURIComponent('[AI-EVOLVE][' + rating + '/5] ' + category);
    const body = encodeURIComponent('Role: ' + userRole + '\nRating: ' + rating + '/5\n\n' + (message.trim() || 'Great offline app'));
    window.open(GITHUB_ISSUES_URL + '?title=' + title + '&body=' + body, '_blank');
  };

  const handleSendWhatsApp = () => {
Use code with caution.
const text = 'BOLMIZAN FEEDBACK (' + rating + '/5)\nRole: ' + userRole + '\nType: ' + category + '\nMessage: ' + (message.trim() || 'App zabardast hai!');
window.open('wa.me' + encodeURIComponent(text), '_blank');
};
const stats = telemetryAgent.getStats();
return (
<>
<button onClick={() => { setOpen(!open); setStatus(''); }} style={{ position: 'fixed', bottom: '54px', right: '16px', zIndex: 9999, background: '#1e1b4b', color: '#fbbf24', border: '1px solid #f59e0b', borderRadius: '999px', padding: '7px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
{open ? 'Close' : 'AI Feedback & Radar'}
{open && (
<div style={{ position: 'fixed', bottom: '96px', right: '16px', zIndex: 9999, width: '325px', maxHeight: '82vh', overflowY: 'auto', background: '#0f172a', color: '#f8fafc', border: '1px solid #f59e0b', borderRadius: '14px', padding: '16px', fontFamily: 'sans-serif' }}>
<div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
<button onClick={() => setTab('FEEDBACK')} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '11px', cursor: 'pointer', background: tab === 'FEEDBACK' ? '#f59e0b' : '#1e293b', color: tab === 'FEEDBACK' ? '#0f172a' : '#cbd5e1' }}>Voice & AI Feedback
<button onClick={() => setTab('ACTIVITY')} style={{ flex: 1, padding: '7px', borderRadius: '8px', border: 'none', fontWeight: 800, fontSize: '11px', cursor: 'pointer', background: tab === 'ACTIVITY' ? '#38bdf8' : '#1e293b', color: tab === 'ACTIVITY' ? '#0f172a' : '#cbd5e1' }}>Activity Radar ({stats.totalEvents})
{tab === 'FEEDBACK' ? (
<>
<div style={{ display: 'flex', gap: '5px', marginBottom: '8px' }}>
{.map((star) => (
<button key={star} onClick={() => setRating(star)} style={{ flex: 1, padding: '5px 0', borderRadius: '6px', border: star <= rating ? '1px solid #fbbf24' : '1px solid #334155', background: star <= rating ? 'rgba(245,158,11,0.2)' : '#1e293b', color: star <= rating ? '#fbbf24' : '#64748b', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}>{star}
))}

<select value={userRole} onChange={(e) => setUserRole(e.target.value)} style={{ width: '100%', padding: '7px', borderRadius: '8px', background: '#1e293b', color: '#f8fafc', border: '1px solid #475569', fontSize: '11px', marginBottom: '6px' }}>
Dukandar / Arthiya
Kisan / Farmer
ISEF Judge / Evaluator

<select value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', padding: '7px', borderRadius: '8px', background: '#1e293b', color: '#f8fafc', border: '1px solid #475569', fontSize: '11px', marginBottom: '8px' }}>
Missing Feature Request
Bug / Problem Report
Sindhi / Urdu Voice Improvement

<textarea rows={3} placeholder="Apni raye ya naya feature likhein..." value={message} onChange={(e) => setMessage(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', background: '#1e293b', color: '#ffffff', border: '1px solid #475569', fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box', resize: 'none' }} />
<button onClick={handleSaveOffline} style={{ width: '100%', background: '#10b981', color: '#052e16', fontWeight: 800, border: 'none', borderRadius: '8px', padding: '9px', fontSize: '12px', cursor: 'pointer', marginBottom: '6px' }}>Save Offline ({savedList.length})
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
<button onClick={handleSendToAiOrchestrator} style={{ background: '#6366f1', color: '#ffffff', fontWeight: 800, border: 'none', borderRadius: '8px', padding: '8px', fontSize: '11px', cursor: 'pointer' }}>Send to AI Agent
<button onClick={handleSendWhatsApp} style={{ background: '#25D366', color: '#052e16', fontWeight: 800, border: 'none', borderRadius: '8px', padding: '8px', fontSize: '11px', cursor: 'pointer' }}>WhatsApp Founder

{status && <div style={{ marginTop: '8px', fontSize: '11px', color: '#34d399', fontWeight: 600 }}>{status}}
</>
) : (

<div style={{ fontWeight: 800, fontSize: '14px', color: '#38bdf8', marginBottom: '8px' }}>Live Consumer Telemetry Radar
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
<div style={{ background: '#1e293b', padding: '8px', borderRadius: '8px' }}>
<div style={{ fontSize: '10px', color: '#94a3b8' }}>Offline Actions
<div style={{ fontSize: '16px', fontWeight: 800, color: '#34d399' }}>{stats.offlineEvents} ({stats.offlineRatioPercent}%)

<div style={{ background: '#1e293b', padding: '8px', borderRadius: '8px' }}>
<div style={{ fontSize: '10px', color: '#94a3b8' }}>Online Actions
<div style={{ fontSize: '16px', fontWeight: 800, color: '#38bdf8' }}>{stats.onlineEvents}


<button onClick={() => {
const pkt = JSON.stringify({ totalEvents: stats.totalEvents, offline: stats.offlineEvents, online: stats.onlineEvents });
window.open('wa.me' + encodeURIComponent('BOLMIZAN TELEMETRY: ' + pkt), '_blank');
}} style={{ width: '100%', background: '#0284c7', color: '#ffffff', fontWeight: 800, border: 'none', borderRadius: '8px', padding: '8px', fontSize: '11px', cursor: 'pointer' }}>Send Telemetry to Founder

)}

)}
</>
);
};