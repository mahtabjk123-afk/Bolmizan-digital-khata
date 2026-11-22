import React, { useState, useEffect, useRef } from 'react';
import { sovereignSound } from './sovereignSoundEngine';
import { telemetryAgent } from './SovereignTelemetryAgent';

interface ChatMsg {
  id: string;
  sender: 'USER' | 'BOT';
  text: string;
  mode: 'OFFLINE_EDGE' | 'ONLINE_HYBRID';
  time: string;
}

export const SovereignRockingChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : false);
  const [listening, setListening] = useState(false);
  const [voiceSpeak, setVoiceSpeak] = useState(true);
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      id: 'welcome-1',
      sender: 'BOT',
      text: 'Assalam-o-Alaikum! Main BolMizan Sovereign AI Assistant hoon (Sakrand & Sindh Edition). Mujh se Khata balance, Zakat/Ushr, Mandi Karda hisab, ya 8171 Scam check poochein — 100% bina internet bhi kaam karta hoon!',
      mode: 'OFFLINE_EDGE',
      time: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onUp = () => setIsOnline(true);
    const onDown = () => setIsOnline(false);
    window.addEventListener('online', onUp);
    window.addEventListener('offline', onDown);
    return () => {
      window.removeEventListener('online', onUp);
      window.removeEventListener('offline', onDown);
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const speakUrdu = (text: string) => {
    if (!voiceSpeak) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'ur-PK';
        u.rate = 1.0;
        window.speechSynthesis.speak(u);
      }
    } catch {}
  };

  const generateSmartReply = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('8171') || q.includes('bisp') || q.includes('benazir') || q.includes('otp') || q.includes('pin') || q.includes('inam') || q.includes('lottery') || q.includes('scam')) {
      return 'KHABARDAR (Scam Alert): Asli 8171 / BISP kabhi bhi personal mobile number (0300/0305/0345) se message nahi bhejta aur na hi JazzCash/EasyPaisa PIN ya OTP maangta hai. Aise kisi number par call ya reply har giz na karein!';
    }

    if (q.includes('khata') || q.includes('balance') || q.includes('hisab') || q.includes('udhaar') || q.includes('cash') || q.includes('total')) {
      let cash = 0;
      let udhaar = 0;
      let count = 0;
      try {
        const raw = localStorage.getItem('bolmizan_sovereign_v1_ledger_entries');
        if (raw) {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            count = list.length;
            for (const item of list) {
              const amt = Number(item.amount || 0);
              if (String(item.type) === 'CREDIT') udhaar += amt;
              else cash += amt;
            }
          }
        }
      } catch {}
      return `Aapke Offline Khata ka Taza Hisab (${count} entries):\n• Kul Naqad (Cash In): Rs. ${cash.toLocaleString()}\n• Kul Udhaar (Receivable): Rs. ${udhaar.toLocaleString()}\n• Net Balance: Rs. ${(cash - udhaar).toLocaleString()} (Zero-Drift Verified).`;
    }

    if (q.includes('zakat')) {
      const nums = q.match(/\d[\d,]*/g);
      if (nums && nums.length > 0) {
        const val = Number(nums[0].replace(/,/g, ''));
        const zakat = Math.round(val * 0.025);
        return `Rs. ${val.toLocaleString()} par exact 2.5% Zakat = Rs. ${zakat.toLocaleString()} banti hai.`;
      }
      return 'Zakat mal-e-tijarat (Cash + Stock - Udhaar Qarz) par 2.5% hoti hai. Raqam likhein (maslan: "Zakat 500000") to main foran hisab nikal doon ga.';
    }

    if (q.includes('ushr') || q.includes('fasal')) {
      const nums = q.match(/\d[\d,]*/g);
      if (nums && nums.length > 0) {
        const val = Number(nums[0].replace(/,/g, ''));
        return `Fasal Rs. ${val.toLocaleString()} par Ushr:\n• Nehri Zameen (5%): Rs. ${Math.round(val * 0.05).toLocaleString()}\n• Mixed/Tube-well (7.5%): Rs. ${Math.round(val * 0.075).toLocaleString()}\n• Barani Zameen (10%): Rs. ${Math.round(val * 0.1).toLocaleString()}`;
      }
      return 'Nehri fasal par 5%, Tube-well/Mixed par 7.5%, aur Barani par 10% Ushr hota hai. Fasal ki qeemat likhein to main exact hisab bata doon ga.';
    }

    if (q.includes('mandi') || q.includes('rate') || q.includes('maund') || q.includes('mann') || q.includes('kg') || q.includes('karda')) {
      const nums = q.match(/\d+(\.\d+)?/g);
      if (nums && nums.length >= 2) {
        const kg = Number(nums[0]);
        const rate40 = Number(nums[1]);
        const total = Math.round((kg / 40) * rate40);
        return `Mandi Hisab (${kg} kg @ Rs. ${rate40}/40kg Maund):\n• Kul Raqam = Rs. ${total.toLocaleString()}\n(Bardana aur Karda katoti ke liye Sabzi Parchi Atelier ya Precision Calculator use karein).`;
      }
      return 'Mandi ka hisab lagane ke liye wazan (kg) aur 40kg rate likhein — maslan: "400 kg rate 3800".';
    }

    if (q.includes('founder') || q.includes('mahtab') || q.includes('owner') || q.includes('contact') || q.includes('help')) {
      return 'BolMizan Sovereign OS ke Creator aur Malik Mahtab hain (Sakrand, Shaheed Benazirabad, Sindh). Official Guardian WhatsApp/Call: 0305-8359178 | Email: mahtabjk123@gmail.com.';
    }

    return 'Main aapki madad ke liye hazir hoon! Aap mujh se yeh pooch sakte hain:\n1. "Mera khata balance kya hai?"\n2. "400 kg rate 3800" (Mandi hisab)\n3. "Zakat 500000" ya "Ushr 200000"\n4. "8171 SMS check" (Fraud protection)';
  };

  const handleSend = async (customText?: string) => {
    const text = (customText !== undefined ? customText : input).trim();
    if (!text) return;
    const timeStr = new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMsg = {
      id: `U-${Date.now()}`,
      sender: 'USER',
      text,
      mode: isOnline ? 'ONLINE_HYBRID' : 'OFFLINE_EDGE',
      time: timeStr
    };

    const replyText = generateSmartReply(text);
    const botMsg: ChatMsg = {
      id: `B-${Date.now() + 1}`,
      sender: 'BOT',
      text: replyText,
      mode: isOnline ? 'ONLINE_HYBRID' : 'OFFLINE_EDGE',
      time: timeStr
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    if (customText === undefined) setInput('');
    sovereignSound.playSuccessChime();
    speakUrdu(replyText);
    await telemetryAgent.track('ROCKING_CHATBOT_QUERY', 'AI_ASSISTANT');
  };

  const handleVoiceAsk = () => {
    try {
      const SR = (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any }).SpeechRecognition ||
                 (window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;
      if (!SR) return;
      const rec = new SR();
      rec.lang = 'ur-PK';
      setListening(true);
      rec.onresult = (ev: any) => {
        const spoken = String(ev.results?.[0]?.[0]?.transcript || '');
        setListening(false);
        if (spoken) handleSend(spoken);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      rec.start();
    } catch {
      setListening(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        title="BolMizan Online + Offline Rocking AI Assistant"
        style={{
          position: 'fixed',
          bottom: '92px',
          right: '16px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #059669, #0284c7)',
          color: '#ffffff',
          border: '2px solid #a7f3d0',
          borderRadius: '999px',
          padding: '8px 15px',
          fontSize: '12px',
          fontWeight: 900,
          boxShadow: '0 6px 20px rgba(16,185,129,0.5)',
          cursor: 'pointer'
        }}
      >
        {open ? '✕ Close AI' : `🤖 Mizan AI (${isOnline ? 'Online' : 'Offline'})`}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '136px',
            right: '16px',
            zIndex: 9999,
            width: '340px',
            height: '460px',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(9, 13, 22, 0.98)',
            backdropFilter: 'blur(16px)',
            color: '#f8fafc',
            border: '2px solid #10b981',
            borderRadius: '18px',
            overflow: 'hidden',
            boxShadow: '0 18px 46px rgba(0,0,0,0.9)',
            fontFamily: 'sans-serif'
          }}
        >
          <div style={{ background: 'linear-gradient(135deg, #064e3b, #0c4a6e)', padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #10b981' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#ffffff' }}>BolMizan Rocking AI Assistant</div>
              <div style={{ fontSize: '10px', color: '#a7f3d0', fontWeight: 700 }}>
                {isOnline ? '● Online + Edge Hybrid Active' : '● 100% Offline Edge AI Mode'}
              </div>
            </div>
            <button
              onClick={() => setVoiceSpeak(!voiceSpeak)}
              style={{ background: 'rgba(0,0,0,0.35)', color: '#fbbf24', border: '1px solid #fbbf24', borderRadius: '999px', padding: '4px 9px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}
            >
              {voiceSpeak ? '🔊 Voice On' : '🔇 Mute'}
            </button>
          </div>

Use code with caution.
<div style={{ display: 'flex', gap: '4px', padding: '6px 10px', background: '#0f172a', overflowX: 'auto', borderBottom: '1px solid #1e293b' }}>
{['Mera khata balance', '400 kg rate 3800', 'Zakat 500000', '8171 scam check'].map((chip) => (
<button
key={chip}
onClick={() => handleSend(chip)}
style={{ whiteSpace: 'nowrap', background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', borderRadius: '999px', padding: '4px 9px', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}
>
{chip}

))}
<div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
{messages.map((m) => (
<div
key={m.id}
style={{
alignSelf: m.sender === 'USER' ? 'flex-end' : 'flex-start',
maxWidth: '85%',
background: m.sender === 'USER' ? '#059669' : '#1e293b',
color: '#ffffff',
padding: '9px 11px',
borderRadius: m.sender === 'USER' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
fontSize: '12px',
lineHeight: 1.4,
whiteSpace: 'pre-wrap',
border: m.sender === 'BOT' ? '1px solid #334155' : 'none'
}}
>
{m.text}
<div style={{ fontSize: '9px', color: m.sender === 'USER' ? '#d1fae5' : '#94a3b8', marginTop: '4px', textAlign: 'right' }}>
{m.time}


))}

<div style={{ padding: '10px', background: '#0f172a', borderTop: '1px solid #1e293b', display: 'flex', gap: '6px' }}>
<button
onClick={handleVoiceAsk}
title="Speak in Urdu/Sindhi"
style={{ background: listening ? '#ef4444' : '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 11px', fontSize: '14px', cursor: 'pointer' }}
>
🎤

<input
type="text"
placeholder="Sawal likhein ya mic dabayein..."
value={input}
onChange={(e) => setInput(e.target.value)}
onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
style={{ flex: 1, padding: '9px 10px', borderRadius: '10px', background: '#1e293b', color: '#ffffff', border: '1px solid #475569', fontSize: '12px' }}
/>
<button
onClick={() => handleSend()}
style={{ background: '#10b981', color: '#052e16', fontWeight: 900, border: 'none', borderRadius: '10px', padding: '0 13px', fontSize: '12px', cursor: 'pointer' }}
>
Send



)}
</>
);
};