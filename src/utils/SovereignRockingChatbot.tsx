import React, { useState, useEffect } from 'react';
import { Preferences } from '@capacitor/preferences';
import { sovereignSound } from './sovereignSoundEngine';
import { telemetryAgent } from './SovereignTelemetryAgent';

interface ChatMsg {
  id: string;
  sender: string;
  text: string;
  time: string;
}

export const SovereignRockingChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [tone, setTone] = useState<string>('SINDHI');
  const [title, setTitle] = useState<string>('Saeen');
  const [voiceOn, setVoiceOn] = useState(true);
  const [messages, setMessages] = useState<ChatMsg[]>([]);

  const makeGreeting = (t: string, honor: string) => {
    const h = honor.trim() || 'Saeen';
    if (t === 'SINDHI') return 'Assalam-o-Alaikum ' + h + '! Aaon BolMizan Sindhi Voice AI aahyan (Sakrand Edition). Bina internet Khata likhan, Zakat/Ushr hisab ya 8171 scam check lai likho ya bolo!';
    if (t === 'URDU') return 'Assalam-o-Alaikum ' + h + '! Main BolMizan Urdu Voice AI hoon. Bina internet Khata likhne, Zakat/Ushr hisab, ya 8171 scam check ke liye poochein!';
    return 'Assalam-o-Alaikum ' + h + '! BolMizan Regional Voice AI ready offline & online.';
  };

  useEffect(() => {
    const t = localStorage.getItem('bolmizan_voice_tone') || 'SINDHI';
    const h = localStorage.getItem('bolmizan_user_honorific') || 'Saeen';
    setTone(t);
    setTitle(h);
    setMessages([{ id: 'INIT-1', sender: 'BOT', text: makeGreeting(t, h), time: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) }]);
  }, []);

  const speak = (txt: string, t: string) => {
    if (!voiceOn) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(txt);
        u.lang = t === 'ENGLISH' ? 'en-US' : 'ur-PK';
        window.speechSynthesis.speak(u);
      }
    } catch {}
  };

  const replyTo = async (query: string): Promise<string> => {
    const q = query.toLowerCase();
    const h = title.trim() || 'Saeen';

    if ((q.includes('jama') || q.includes('udhaar') || q.includes('likho')) && /\d+/.test(q)) {
      const m = q.match(/(\d[\d,]*)/);
      const amt = m ? Number(m.replace(/,/g, '')) : 0;
      const isUdhaar = q.includes('udhaar');
      const party = query.replace(/(\d[\d,]*)/g, '').replace(/(jama|udhaar|likho)/gi, '').trim() || 'Gahak';
      if (amt > 0) {
        try {
          const key = 'bolmizan_sovereign_v1_ledger_entries';
          const raw = localStorage.getItem(key);
          const list = raw ? JSON.parse(raw) : [];
          list.unshift({ id: 'BMZ-V-' + Date.now(), timestamp: new Date().toISOString(), partyName: party, item: isUdhaar ? 'Voice Udhaar' : 'Voice Cash In', type: isUdhaar ? 'CREDIT' : 'CASH_SALE', amount: amt, status: 'VERIFIED_OFFLINE' });
          const json = JSON.stringify(list);
          localStorage.setItem(key, json);
          await Preferences.set({ key, value: json });
        } catch {}
        return 'Ji ' + h + '! ' + party + ' ja Rs. ' + amt.toLocaleString() + ' (' + (isUdhaar ? 'Udhaar' : 'Cash Jama') + ') offline Khata mein save thi wya aahin!';
      }
    }

    if (q.includes('8171') || q.includes('bisp') || q.includes('otp') || q.includes('scam')) {
      return 'KHABARDAR ' + h + '! Asli 8171 kadhen b personal mobile number taan SMS natho moklay ain na hi JazzCash/EasyPaisa PIN mangay tho!';
    }

    if (q.includes('khata') || q.includes('balance') || q.includes('hisab')) {
      let cash = 0;
      let udhaar = 0;
      try {
        const raw = localStorage.getItem('bolmizan_sovereign_v1_ledger_entries');
        if (raw) {
          const list = JSON.parse(raw);
          for (const item of list) {
            const a = Number(item.amount || 0);
            if (String(item.type) === 'CREDIT') udhaar += a;
            else cash += a;
          }
        }
      } catch {}
      return h + ', Offline Khata Hisab: Cash In = Rs. ' + cash.toLocaleString() + ' | Udhaar = Rs. ' + udhaar.toLocaleString() + ' | Net = Rs. ' + (cash - udhaar).toLocaleString();
    }

    if (q.includes('zakat')) {
      const m = q.match(/\d[\d,]*/);
      const val = m ? Number(m.replace(/,/g, '')) : 100000;
      return h + ', Rs. ' + val.toLocaleString() + ' tay 2.5% Zakat = Rs. ' + Math.round(val * 0.025).toLocaleString() + ' thiye thi.';
    }

    if (q.includes('ushr')) {
      const m = q.match(/\d[\d,]*/);
      const val = m ? Number(m.replace(/,/g, '')) : 100000;
      return h + ', Rs. ' + val.toLocaleString() + ' fasal tay Nehri Ushr (5%) = Rs. ' + Math.round(val * 0.05).toLocaleString() + ' | Barani (10%) = Rs. ' + Math.round(val * 0.1).toLocaleString();
    }

    return 'Ji ' + h + '! Likho: "Ahmed 5000 jama likho", "Khata balance", "Zakat 500000", "Ushr 200000", ya "8171 scam check".';
  };

  const handleSend = async (customText?: string) => {
    const txt = (customText !== undefined ? customText : input).trim();
    if (!txt) return;
    const now = new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
    const rep = await replyTo(txt);
    setMessages((prev) => [
      ...prev,
      { id: 'U-' + Date.now(), sender: 'USER', text: txt, time: now },
      { id: 'B-' + (Date.now() + 1), sender: 'BOT', text: rep, time: now }
    ]);
    if (customText === undefined) setInput('');
    sovereignSound.playSuccessChime();
    speak(rep, tone);
    await telemetryAgent.track('REGIONAL_CHAT_' + tone, 'VOICE_AI');
  };

  const toggleBtn = React.createElement(
    'button',
    {
      onClick: () => setOpen(!open),
      style: { position: 'fixed', bottom: '16px', right: '16px', zIndex: 10000, background: 'linear-gradient(135deg, #059669, #0284c7)', color: '#ffffff', border: '1.5px solid #a7f3d0', borderRadius: '999px', padding: '8px 15px', fontSize: '12px', fontWeight: 900, boxShadow: '0 6px 20px rgba(16,185,129,0.5)', cursor: 'pointer' }
    },
    open ? '✕ Close Voice AI' : '🎤 Sindhi / Urdu AI'
  );

  const panel = open
    ? React.createElement(
        'div',
        {
          style: { position: 'fixed', bottom: '62px', right: '16px', zIndex: 10000, width: '335px', height: '440px', display: 'flex', flexDirection: 'column', background: '#090d16', color: '#f8fafc', border: '2px solid #10b981', borderRadius: '18px', overflow: 'hidden', fontFamily: 'sans-serif', boxShadow: '0 18px 46px rgba(0,0,0,0.9)' }
        },
        React.createElement(
          'div',
          { style: { background: '#064e3b', padding: '10px 12px', borderBottom: '1px solid #10b981' } },
          React.createElement(
            'div',
            { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' } },
            React.createElement('span', { style: { fontSize: '13px', fontWeight: 900 } }, 'BolMizan Regional Voice AI'),
            React.createElement('button', { onClick: () => setVoiceOn(!voiceOn), style: { background: '#0f172a', color: '#fbbf24', border: '1px solid #fbbf24', borderRadius: '999px', padding: '3px 8px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' } }, voiceOn ? '🔊 Voice On' : '🔇 Mute')
          ),
          React.createElement(
            'div',
            { style: { display: 'flex', gap: '4px' } },
            React.createElement('button', { onClick: () => { setTone('SINDHI'); localStorage.setItem('bolmizan_voice_tone', 'SINDHI'); }, style: { flex: 1, padding: '4px', borderRadius: '6px', border: 'none', fontSize: '10px', fontWeight: 800, cursor: 'pointer', background: tone === 'SINDHI' ? '#fbbf24' : '#0f172a', color: tone === 'SINDHI' ? '#090d16' : '#fff' } }, 'Sindhi Tone'),
            React.createElement('button', { onClick: () => { setTone('URDU'); localStorage.setItem('bolmizan_voice_tone', 'URDU'); }, style: { flex: 1, padding: '4px', borderRadius: '6px', border: 'none', fontSize: '10px', fontWeight: 800, cursor: 'pointer', background: tone === 'URDU' ? '#fbbf24' : '#0f172a', color: tone === 'URDU' ? '#090d16' : '#fff' } }, 'Urdu Tone'),
            React.createElement('input', { value: title, onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setTitle(e.target.value); localStorage.setItem('bolmizan_user_honorific', e.target.value); }, style: { width: '70px', padding: '4px', borderRadius: '6px', border: '1px solid #38bdf8', background: '#0f172a', color: '#fde68a', fontSize: '10px' } })
          )
        ),
        React.createElement(
          'div',
          { style: { display: 'flex', gap: '4px', padding: '6px 8px', background: '#0f172a', overflowX: 'auto' } },
          React.createElement('button', { onClick: () => handleSend('Ahmed 5000 jama likho'), style: { whiteSpace: 'nowrap', background: '#1e293b', color: '#38bdf8', border: 'none', borderRadius: '999px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' } }, '+5000 Jama'),
          React.createElement('button', { onClick: () => handleSend('Khata balance'), style: { whiteSpace: 'nowrap', background: '#1e293b', color: '#38bdf8', border: 'none', borderRadius: '999px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' } }, 'Khata Balance'),
          React.createElement('button', { onClick: () => handleSend('8171 scam check'), style: { whiteSpace: 'nowrap', background: '#1e293b', color: '#38bdf8', border: 'none', borderRadius: '999px', padding: '4px 8px', fontSize: '10px', cursor: 'pointer' } }, '8171 Check')
        ),
        React.createElement(
          'div',
          { style: { flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' } },
          messages.map((m) =>
            React.createElement(
              'div',
Use code with caution.
{ key: m.id, style: { alignSelf: m.sender === 'USER' ? 'flex-end' : 'flex-start', maxWidth: '85%', background: m.sender === 'USER' ? '#059669' : '#1e293b', color: '#fff', padding: '8px 10px', borderRadius: '12px', fontSize: '12px', lineHeight: 1.4 } },
m.text
)
)
),
React.createElement(
'div',
{ style: { padding: '8px', background: '#0f172a', display: 'flex', gap: '6px' } },
React.createElement('input', {
type: 'text',
placeholder: 'Sawal likhein...',
value: input,
onChange: (e: React.ChangeEvent) => setInput(e.target.value),
onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter') handleSend(); },
style: { flex: 1, padding: '8px', borderRadius: '8px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '12px' }
}),
React.createElement('button', { onClick: () => handleSend(), style: { background: '#10b981', color: '#052e16', fontWeight: 900, border: 'none', borderRadius: '8px', padding: '0 12px', fontSize: '12px', cursor: 'pointer' } }, 'Send')
)
)
: null;
return React.createElement(React.Fragment, null, toggleBtn, panel);
};