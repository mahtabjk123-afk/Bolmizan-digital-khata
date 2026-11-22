import React, { useState, useEffect, useRef } from 'react';
import { Preferences } from '@capacitor/preferences';
import { sovereignSound } from './sovereignSoundEngine';
import { telemetryAgent } from './SovereignTelemetryAgent';

type RegionalTone = 'SINDHI' | 'URDU' | 'ENGLISH';

interface ChatMsg {
  id: string;
  sender: 'USER' | 'BOT';
  text: string;
  time: string;
}

export const SovereignRockingChatbot: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [tone, setTone] = useState<RegionalTone>('SINDHI');
  const [customHonorific, setCustomHonorific] = useState('Saeen');
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : false);
  const [listening, setListening] = useState(false);
  const [voiceSpeak, setVoiceSpeak] = useState(true);
  const [messages, setMessages] = useState<ChatMsg[]>([]);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const getGreeting = (t: RegionalTone, title: string): string => {
    const cleanTitle = title.trim() || (t === 'SINDHI' ? 'سائين' : t === 'URDU' ? 'بھائی جان' : 'Partner');
    if (t === 'SINDHI') {
      return `اسلام عليڪم ${cleanTitle}! آئون ٻول ميزان آواز اسسٽنٽ آهيان (سڪرنڊ منڊي ايڊيشن). بنا انٽرنيٽ جي کاتو لکڻ، زڪوات/عشر حساب، يا 8171 فراڊ چيڪ ڪرڻ لاءِ مائڪ دٻائي ڳالهايو!`;
    }
    if (t === 'URDU') {
      return `السلام علیکم ${cleanTitle}! میں بول میزان علاقائی وائس اسسٹنٹ ہوں۔ بنا انٹرنیٹ کھاتہ لکھنے، منڈی حساب، زکوٰۃ/عشر، یا 8171 فراڈ چیک کرنے کے لیے مائیک دبا کر بولیں!`;
    }
    return `Assalam-o-Alaikum ${cleanTitle}! I am BolMizan Regional Voice AI. Speak or type to record offline Khata entries, calculate Zakat/Ushr, or detect 8171 scams.`;
  };

  useEffect(() => {
    try {
      const savedTone = (localStorage.getItem('bolmizan_voice_tone') as RegionalTone) || 'SINDHI';
      const savedTitle = localStorage.getItem('bolmizan_user_honorific') || 'Saeen';
      setTone(savedTone);
      setCustomHonorific(savedTitle);
      setMessages([
        {
          id: 'init-1',
          sender: 'BOT',
          text: getGreeting(savedTone, savedTitle),
          time: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch {}

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

  const speakRegionalVoice = (text: string, activeTone: RegionalTone) => {
    if (!voiceSpeak) return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = activeTone === 'ENGLISH' ? 'en-US' : 'ur-PK';
        u.rate = 0.96;
        u.pitch = 1.02;
        window.speechSynthesis.speak(u);
      }
    } catch {}
  };

  const switchTone = (nextTone: RegionalTone) => {
    setTone(nextTone);
    try {
      localStorage.setItem('bolmizan_voice_tone', nextTone);
    } catch {}
    const greet = getGreeting(nextTone, customHonorific);
    setMessages((prev) => [
      ...prev,
      { id: `T-${Date.now()}`, sender: 'BOT', text: greet, time: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' }) }
    ]);
    speakRegionalVoice(greet, nextTone);
  };

  const saveDirectVoiceEntry = async (party: string, amount: number, isUdhaar: boolean) => {
    const record = {
      id: `BMZ-V-${Date.now()}`,
      timestamp: new Date().toISOString(),
      partyName: party,
      item: isUdhaar ? 'Voice Udhaar Entry' : 'Voice Cash Wasooli',
      type: isUdhaar ? 'CREDIT' : 'CASH_SALE',
      amount,
      status: 'VERIFIED_OFFLINE',
      hash: btoa(`${Date.now()}-${amount}`).slice(0, 18)
    };
    try {
      const key = 'bolmizan_sovereign_v1_ledger_entries';
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      const json = JSON.stringify([record, ...list]);
      localStorage.setItem(key, json);
      await Preferences.set({ key, value: json });
    } catch {}
  };

  const buildRegionalReply = async (query: string): Promise<string> => {
    const q = query.toLowerCase();
    const honor = customHonorific.trim() || (tone === 'SINDHI' ? 'سائين' : 'بھائی');

    if ((q.includes('jama') || q.includes('udhaar') || q.includes('likho') || q.includes('لکھو') || q.includes('لکو')) && /\d+/.test(q)) {
      const numMatch = q.match(/(\d[\d,]*)/);
      const amt = numMatch ? Number(numMatch.replace(/,/g, '')) : 0;
      const isUdhaar = q.includes('udhaar') || q.includes('ادھار') || q.includes('اوڌار');
      const partyClean = query.replace(/(\d[\d,]*)/g, '').replace(/(jama|udhaar|likho|لکھو|لکو|جمع|ادھار|اوڌار)/gi, '').trim() || 'Gahak';
      if (amt > 0) {
        await saveDirectVoiceEntry(partyClean, amt, isUdhaar);
        if (tone === 'SINDHI') {
          return `جي ${honor}! ${partyClean} جا ${amt.toLocaleString()} رپيا (${isUdhaar ? 'اوڌار' : 'نقد جمع'}) توهان جي آف لائن کاتي ۾ محفوظ ٿي ويا آهن.`;
        }
        if (tone === 'URDU') {
          return `جی ${honor}! ${partyClean} کے ${amt.toLocaleString()} روپے (${isUdhaar ? 'ادھار' : 'نقد جمع'}) آپ کے آف لائن کھاتے میں محفوظ کر دیے گئے ہیں۔`;
        }
        return `Done ${honor}! Saved Rs. ${amt.toLocaleString()} (${isUdhaar ? 'Credit/Udhaar' : 'Cash In'}) for ${partyClean} in your offline ledger.`;
      }
    }

    if (q.includes('8171') || q.includes('bisp') || q.includes('otp') || q.includes('scam') || q.includes('فراڊ')) {
      if (tone === 'SINDHI') {
        return `خبردار ${honor}! سرڪاري 8171 ڪڏهن به ذاتي موبائل نمبر تان ميسيج نٿو موڪلي ۽ نه ئي جيز ڪيش يا ايزي پيسا جو ڪوڊ گهري ٿو. اهڙي فراڊ نمبر تي هرگز جواب نه ڏيو!`;
      }
      if (tone === 'URDU') {
        return `خبردار ${honor}! اصلی 8171 کبھی بھی ذاتی موبائل نمبر سے میسج نہیں بھیجتا اور نہ ہی جاز کیش یا ایزی پیسہ کا پن کوڈ مانگتا ہے۔ ایسے فراڈ سے ہوشیار رہیں!`;
      }
      return `WARNING ${honor}: Official 8171 BISP never sends messages from personal mobile numbers or asks for wallet OTP/PIN codes.`;
    }

    if (q.includes('khata') || q.includes('balance') || q.includes('hisab') || q.includes('کاتو') || q.includes('کھاتہ')) {
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
      if (tone === 'SINDHI') {
        return `${honor}، توهان جي آف لائن کاتي جو تازو حساب (${count} داخلائون):\n• ڪل نقد آمدني: Rs. ${cash.toLocaleString()}\n• ڪل اوڌار باقي: Rs. ${udhaar.toLocaleString()}\n• صافي بيلنس: Rs. ${(cash - udhaar).toLocaleString()}`;
      }
      if (tone === 'URDU') {
        return `${honor}، آپ کے آف لائن کھاتے کا تازہ حساب (${count} انٹریز):\n• کل نقد آمدنی: Rs. ${cash.toLocaleString()}\n• کل ادھار باقی: Rs. ${udhaar.toLocaleString()}\n• صافی بیلنس: Rs. ${(cash - udhaar).toLocaleString()}`;
      }
      return `${honor}, your offline ledger summary (${count} entries):\n• Cash In: Rs. ${cash.toLocaleString()}\n• Udhaar Receivable: Rs. ${udhaar.toLocaleString()}\n• Net Balance: Rs. ${(cash - udhaar).toLocaleString()}`;
    }

    if (q.includes('zakat') || q.includes('زڪوات') || q.includes('زکوٰۃ')) {
      const nums = q.match(/\d[\d,]*/g);
      const val = nums && nums.length > 0 ? Number(nums.replace(/,/g, '')) : 100000;
      const z = Math.round(val * 0.025);
      if (tone === 'SINDHI') return `${honor}، Rs. ${val.toLocaleString()} تي 2.5% شرعي زڪوات Rs. ${z.toLocaleString()} ٿئي ٿي.`;
      if (tone === 'URDU') return `${honor}، Rs. ${val.toLocaleString()} پر 2.5% شرعی زکوٰۃ Rs. ${z.toLocaleString()} بنتی ہے۔`;
      return `${honor}, 2.5% Zakat on Rs. ${val.toLocaleString()} is Rs. ${z.toLocaleString()}.`;
    }

    if (q.includes('ushr') || q.includes('عشر') || q.includes('fasal')) {
      const nums = q.match(/\d[\d,]*/g);
      const val = nums && nums.length > 0 ? Number(nums.replace(/,/g, '')) : 100000;
      if (tone === 'SINDHI') return `${honor}، Rs. ${val.toLocaleString()} فصل تي عشر:\n• نهري زمين (5%): Rs. ${Math.round(val * 0.05).toLocaleString()}\n• باراني زمين (10%): Rs. ${Math.round(val * 0.1).toLocaleString()}`;
      if (tone === 'URDU') return `${honor}، Rs. ${val.toLocaleString()} فصل پر عشر:\n• نہری زمین (5%): Rs. ${Math.round(val * 0.05).toLocaleString()}\n• بارانی زمین (10%): Rs. ${Math.round(val * 0.1).toLocaleString()}`;
      return `${honor}, Ushr on Rs. ${val.toLocaleString()}: Irrigated (5%) = Rs. ${Math.round(val * 0.05).toLocaleString()} | Rain-fed (10%) = Rs. ${Math.round(val * 0.1).toLocaleString()}.`;
    }

    if (tone === 'SINDHI') {
      return `جي ${honor}! توهان مون کي چئي سگهو ٿا:\n• "احمد 5000 جمع لکو"\n• "منهنجو کاتو بيلنس ٻڌايو"\n• "زڪوات 500000" يا "عشر 200000"\n• "8171 ميسيج چيڪ ڪريو"`;
    }
    if (tone === 'URDU') {
      return `جی ${honor}! آپ مجھ سے بول کر یہ کام کروا سکتے ہیں:\n• "احمد 5000 جمع لکھو"\n• "میرا کھاتہ بیلنس بتائیں"\n• "زکوٰۃ 500000" یا "عشر 200000"\n• "8171 میسج چیک کریں"`;
    }
    return `Yes ${honor}! Try saying: "Ahmed 5000 jama likho", "Khata balance", "Zakat 500000", or "8171 scam check".`;
  };

  const handleSend = async (customText?: string) => {
Use code with caution.
const text = (customText !== undefined ? customText : input).trim();
if (!text) return;
const timeStr = new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
const userMsg: ChatMsg = { id: U-${Date.now()}, sender: 'USER', text, time: timeStr };
const reply = await buildRegionalReply(text);
const botMsg: ChatMsg = { id: B-${Date.now() + 1}, sender: 'BOT', text: reply, time: timeStr };
setMessages((prev) => [...prev, userMsg, botMsg]);
if (customText === undefined) setInput('');
sovereignSound.playSuccessChime();
speakRegionalVoice(reply, tone);
await telemetryAgent.track(REGIONAL_VOICE_${tone}, 'VOICE_AI');
};
const handleVoiceMic = () => {
try {
const SR = (window as unknown as { SpeechRecognition?: new () => any; webkitSpeechRecognition?: new () => any }).SpeechRecognition ||
(window as unknown as { webkitSpeechRecognition?: new () => any }).webkitSpeechRecognition;
if (!SR) return;
const rec = new SR();
rec.lang = tone === 'ENGLISH' ? 'en-US' : 'ur-PK';
setListening(true);
rec.onresult = (ev: any) => {
const spoken = String(ev.results?.?.?.transcript || '');
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
title="Regional Sindhi / Urdu Customized Voice AI"
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
{open ? '✕ Close Voice AI' : 🎤 ${tone === 'SINDHI' ? 'سنڌي آواز AI' : tone === 'URDU' ? 'اردو وائس AI' : 'Voice AI'} (${isOnline ? 'Online' : 'Offline'})}
{open && (
<div
style={{
position: 'fixed',
bottom: '136px',
right: '16px',
zIndex: 9999,
width: '345px',
height: '490px',
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
<div style={{ background: 'linear-gradient(135deg, #064e3b, #0c4a6e)', padding: '10px 12px', borderBottom: '1px solid #10b981' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
<div style={{ fontSize: '13px', fontWeight: 900, color: '#ffffff' }}>BolMizan Regional Voice AI
<button
onClick={() => setVoiceSpeak(!voiceSpeak)}
style={{ background: 'rgba(0,0,0,0.35)', color: '#fbbf24', border: '1px solid #fbbf24', borderRadius: '999px', padding: '3px 8px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}
>
{voiceSpeak ? '🔊 Voice On' : '🔇 Mute'}

<div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
{(['SINDHI', 'URDU', 'ENGLISH'] as const).map((t) => (
<button
key={t}
onClick={() => switchTone(t)}
style={{
flex: 1,
padding: '4px 6px',
borderRadius: '6px',
border: 'none',
fontSize: '10px',
fontWeight: 800,
cursor: 'pointer',
background: tone === t ? '#fbbf24' : 'rgba(15,23,42,0.7)',
color: tone === t ? '#090d16' : '#e2e8f0'
}}
>
{t === 'SINDHI' ? 'سنڌي ٽون' : t === 'URDU' ? 'اردو ٹون' : 'English'}

))}
<input
type="text"
placeholder="Title (Saeen)"
value={customHonorific}
onChange={(e) => {
setCustomHonorific(e.target.value);
try { localStorage.setItem('bolmizan_user_honorific', e.target.value); } catch {}
}}
style={{ width: '74px', padding: '4px 6px', borderRadius: '6px', border: '1px solid #38bdf8', background: '#0f172a', color: '#fde68a', fontSize: '10px', fontWeight: 700 }}
/>

<div style={{ display: 'flex', gap: '4px', padding: '6px 10px', background: '#0f172a', overflowX: 'auto', borderBottom: '1px solid #1e293b' }}>
{['Ahmed 5000 jama likho', 'Khata balance', 'Zakat 500000', '8171 scam check'].map((chip) => (
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
maxWidth: '86%',
background: m.sender === 'USER' ? '#059669' : '#1e293b',
color: '#ffffff',
padding: '9px 11px',
borderRadius: m.sender === 'USER' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
fontSize: '12px',
lineHeight: 1.45,
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
onClick={handleVoiceMic}
title="Tap and speak in Sindhi / Urdu / English"
style={{ background: listening ? '#ef4444' : '#0284c7', color: '#fff', border: 'none', borderRadius: '10px', padding: '0 12px', fontSize: '15px', cursor: 'pointer' }}
>
{listening ? '🔴' : '🎤'}

<input
type="text"
placeholder="ڳالهايو يا لکو / بولیں یا لکھیں..."
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