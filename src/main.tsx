import './index.css';
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

const LIVE_URL = 'https://bolmizan-sakrand.surge.sh';
const STORE = 'bolmizan_ultimate_vault_v1';
const CHIPS = [100, 500, 1000, 5000];
const E = React.createElement;

const LANGS: Record<string, any> = {
  sd: { code: 'sd-PK', name: 'Sindhi', welcome: 'BHALI KARE AAYA!', culture: 'Sindhi Ajrak Heritage', mic: 'AJRAK PARCHI BANAYEIN (BOLEIN)', search: 'Naalo dhoondein...' },
  ur: { code: 'ur-PK', name: 'Urdu', welcome: 'KHUSH AMDEED!', culture: 'Mizan Islamic Heritage', mic: 'BOL KAR AJRAK PARCHI BANAYEIN', search: 'Naam dhoondein...' },
  ps: { code: 'ps-AF', name: 'Pashto', welcome: 'PA KHAIR RAGHLAY!', culture: 'Pashtun Khattak Heritage', mic: 'PAH GHAG PARCHI JORA KRAI', search: 'Noom woltawai...' },
  bal: { code: 'ur-PK', name: 'Balochi', welcome: 'WASH AATKAY!', culture: 'Balochi Doch Heritage', mic: 'TAWAR KAN PARCHI JOR KAN', search: 'Naam bagir...' },
  skr: { code: 'ur-PK', name: 'Saraiki', welcome: 'JEE AAYAN NOON!', culture: 'Multani Kashi Heritage', mic: 'BOL KE SHAH PARCHI BANAO', search: 'Naan golo...' },
  pa: { code: 'pa-PK', name: 'Punjabi', welcome: 'JEE AAYAN NOON!', culture: 'Punjabi Phulkari Heritage', mic: 'BOL KE PARCHI BANAO', search: 'Naan labho...' },
  ar: { code: 'ar-SA', name: 'Arabic', welcome: 'AHLAN WA SAHLAN!', culture: 'Al-Mizan Andalusi Gold', mic: 'TAHADDATH LI INSHA AL-FATOURAH', search: 'Ibhaith...' },
  en: { code: 'en-PK', name: 'English', welcome: 'WELCOME TO MIZAN!', culture: 'Global Trade Collaboration', mic: 'SPEAK TO CREATE RECEIPT', search: 'Search record...' }
};

const ROLES: Record<string, any> = {
  SHOP: { label: 'Dukaandar', tag: 'MIZAN', title: 'SINDH BAZAAR POS', sub: 'AJRAK & MIZAN VERIFIED DUKAAN', theme: 'linear-gradient(145deg,#022C22,#064E3B 65%,#0F766E)', def: 'Aziz Jamali Shahi Bazar Sakrand', inL: 'Wasool (Cash)', outL: 'Udhaar (Due)', pL: 'GAHAK / CUSTOMER', eL: 'Maal / Item Tafseel', ePh: 'e.g. 5 kg Cheeni, 2 Pack Chai', ph: 'e.g. Bilal 2500 udhaar ya Ahmed 1200 wasool', pre: ['2 kg Cheeni 320 udhaar', '1 Pack Chai 450 wasool', '5 Ltr Oil 2600 udhaar', '1000 Jama'] },
  KISAN: { label: 'Kisan / Mandi', tag: 'FASAL', title: 'DHARTI & FASAL MANDI', sub: 'MANN / DHARI AUTO-HISAB & PARCHI', theme: 'linear-gradient(145deg,#14532D,#166534 65%,#4D7C0F)', def: 'Sakrand Ghalla & Sabzi Mandi', inL: 'Fasal Wasool', outL: 'Arhat / Baqi', pL: 'KISAN / ARHATI', eL: 'Fasal & Wazan', ePh: 'e.g. 40 Mann Gandum @ 4150', ph: 'e.g. Haji Aslam 40 mann gandum 4150 udhaar', pre: ['40 mann gandum 4150 udhaar', '10 mann kapas 8500 wasool', '5 bori khad 22500 udhaar', '20 dhari sabzi 1500 wasool'] },
  DOCTOR: { label: 'Doctor / Clinic', tag: 'SHIFA', title: 'AL-SHIFA CLINIC & RX', sub: 'PATIENT RECEIPT & DAWAI RECORD', theme: 'linear-gradient(145deg,#0C4A6E,#0369A1 65%,#0284C7)', def: 'Al-Shifa Medical & Clinic Sakrand', inL: 'Fee Wasool', outL: 'Baqi Fee / Dawai', pL: 'MAREEZ (PATIENT)', eL: 'Dawai / Diagnosis', ePh: 'e.g. Checkup + Panadol + Syrup', ph: 'e.g. Mareez Ali 1000 fee wasool', pre: ['Checkup Fee 500 wasool', 'Lab Test 1800 baqi', 'Followup 300 wasool', 'Drip & Injection 1200 wasool'] },
  TEACHER: { label: 'Ustad / Academy', tag: 'ACADEMY', title: 'ILM-O-HUNAR ACADEMY', sub: 'STUDENT FEE & PARENT PARCHI', theme: 'linear-gradient(145deg,#312E81,#4338CA 65%,#4F46E5)', def: 'Mizan CS & Skill Academy', inL: 'Fees Jama', outL: 'Baqi Fees', pL: 'STUDENT / WALID', eL: 'Class / Course', ePh: 'e.g. Class 10th - November Fee', ph: 'e.g. Student Hamza 3000 monthly fees jama', pre: ['Monthly Tuition 2000 jama', 'Computer Course 3500 jama', 'Books & Notes 800 baqi', 'Exam Fee 1000 jama'] },
  AGENCY: { label: 'B2B / Agency', tag: 'GLOBAL', title: 'GLOBAL B2B UNITY', sub: 'SINDH X WORLD AUTOMATION RECEIPT', theme: 'linear-gradient(145deg,#1E1B4B,#0F172A 65%,#0D9488)', def: 'BolMizan AI Solutions', inL: 'Invoice Paid', outL: 'Client Due', pL: 'CLIENT / COMPANY', eL: 'Deliverable / Scope', ePh: 'e.g. WhatsApp AI Bot + Global Deal', ph: 'e.g. Dubai Clinic AI Bot 45000 paid', pre: ['WhatsApp AI Setup 25000 paid', 'Retainer 10000 due', 'Voice Bot 50000 paid', 'Training 15000 paid'] },
  GHAR: { label: 'Ghar / Personal', tag: 'GHAR', title: 'HALAL GHAR & BACHAT', sub: 'ROZMARRA KHARCHA & BARKAT', theme: 'linear-gradient(145deg,#3F3F46,#18181B 65%,#065F46)', def: 'Mera Halal Ghar & Bachat', inL: 'Aamdani / Bachat', outL: 'Kharcha / Qarz', pL: 'MAD / KHARCHA', eL: 'Zaroorat / Note', ePh: 'e.g. Mahana Rashan / Bijli Bill', ph: 'e.g. Ghar Rashan 6500 kharcha', pre: ['Bijli Bill 4500 kharcha', 'Ghar Rashan 8000 kharcha', 'Fees 3000 kharcha', 'Sadqah 1000 kharcha'] }
};

const makeSeal = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return 'MZN-' + (h >>> 0).toString(16).toUpperCase().padStart(8, '0');
};

const makeOtp = (seal: string, amt: number) => {
  let h = 5381;
  const raw = seal + ':' + String(amt);
  for (let i = 0; i < raw.length; i++) { h = ((h << 5) + h) + raw.charCodeAt(i); }
  return String(Math.abs(h) % 900000 + 100000);
};

const encodeVerifyUrl = (b: any, shop: string, seal: string, otp: string) => {
  const payload = [shop, b.customerName, String(b.amount), b.type, seal, otp].join('|');
  return LIVE_URL + '?proof=' + encodeURIComponent(btoa(unescape(encodeURIComponent(payload))));
};

const decodeVerifyUrl = () => {
  try {
    const p = new URLSearchParams(window.location.search).get('proof');
    if (!p) return null;
    const parts = decodeURIComponent(escape(atob(p))).split('|');
    if (parts.length < 6) return null;
    const expectedOtp = makeOtp(parts[4], Number(parts[2]));
    return { shop: parts[0], name: parts[1], amount: Number(parts[2]), type: parts[3], seal: parts[4], otp: parts[5], valid: expectedOtp === parts[5] };
  } catch { return null; }
};

const checkScam = (raw: string) => {
  const t = raw.trim();
  if (!t) return null;
  const red: string[] = [];
  if (/lottery|inaam|jeet|benazir|ehsaas|8171|bisp/i.test(t)) red.push('Fake Govt/Lottery Inaam fraud');
  if (/pin|otp|mpin|password|cvv/i.test(t)) red.push('OTP ya PIN code churane wala dhoka');
  if (/wapas\s*bhej|ghalti\s*se|refund|click|bit\.ly|tinyurl/i.test(t)) red.push('Ghalti se paisay aane ka jhoota bahana');
  if (/03\d{9}/.test(t) && /(easypaisa|jazzcash|raast|8558|3737)/i.test(t) && !/from\s*(8558|3737|9999)/i.test(t)) red.push('Aam number (03xx) se bheja gaya nakli SMS');
  if (red.length > 0) return { safe: false, title: 'RED ALERT: 100% NAKLI / FRAUD!', reason: red.join(' + ') + '. Har-giz paisa ya maal na dein!' };
  if (/(8558|3737|9999|raast)/i.test(t) && /(tid|trx)/i.test(t) && /rs\.?\s*\d+/i.test(t)) return { safe: true, title: 'GREEN: OFFICIAL SMS FORMAT', reason: '8558/3737 aur TID format sahi hai. Apni app khol kar balance bhi check karein.' };
  return { safe: false, title: 'YELLOW WARNING: UNVERIFIED SMS', reason: 'Official 8558/3737 sender code ya TID missing hai.' };
};

const parseEntry = (raw: string) => {
  let clean = raw.trim();
  const pm = clean.match(/(?:0092|0)3\d{2}[\s-]?\d{7}/);
  const extractedPhone = pm ? pm[0].replace(/[\s-]/g, '') : '';
  if (pm) clean = clean.replace(pm[0], ' ');
  const type = /(wasool|jama|mil|paid|cash|diye|naqad|rok|chukta|aamdani)/i.test(clean) ? 'PAID' : 'UDHAAR';
  const m = clean.match(/(\d+(?:\.\d+)?)\s*(?:mann|man|dhari|dharri|ser|seer|bori|goni|katta|khandi|acre|jireb|kg|kilo|bag|peti)\s+.*?(\d+(?:\.\d+)?)/i);
  const nums = clean.match(/\d+(?:\.\d+)?/g);
  const isM = Boolean(m && m[1] && m[2]);
  const amount = isM ? Math.round(parseFloat(m![1]) * parseFloat(m![2])) : nums && nums.length ? Math.round(parseFloat(nums[nums.length - 1])) : 0;
  const formula = isM ? m![1] + ' x ' + m![2] + ' = Rs. ' + amount.toLocaleString() : '';
  const name = clean
    .replace(/(\d+(?:\.\d+)?)\s*(?:mann|man|dhari|dharri|ser|seer|bori|goni|katta|khandi|acre|jireb|kg|kilo|bag|peti)\s+.*?(\d+(?:\.\d+)?)/gi, '')
    .replace(/\d+(?:\.\d+)?/g, '')
    .replace(/(udhaar|udhar|qarz|baqaya|baqi|wasool|jama|mil|gaye|paid|cash|naqad|rok|chukta|biyana|sai|kapas|phutti|gandum|kanak|chawal|sari|ganna|kamad|khad|beej|fee|fees|mareez|student|kharcha|aamdani|rupay|rs|ka|ki|ke|naam|hisab|se|likh|lo|ko)/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { customerName: name ? name.replace(/\b\w/g, (c) => c.toUpperCase()) : 'Customer', extractedPhone, amount, type, details: raw.trim(), formula };
};

const makeParchiPNG = (b: any, shop: string, rCfg: any, lCfg: any) => {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1520;
  const ctx = c.getContext('2d')!;
  const isPaid = b.type === 'PAID';
  const seal = makeSeal(b.id + '|' + b.customerName + '|' + b.amount);
  const otp = makeOtp(seal, Number(b.amount));
  const proofUrl = encodeVerifyUrl(b, shop, seal, otp);

  if (!(ctx as any).roundRect) { (ctx as any).roundRect = function(x:number,y:number,w:number,h:number){ this.rect(x,y,w,h); }; }
  ctx.fillStyle = '#4C0519'; ctx.fillRect(0, 0, 1080, 1520);
  ctx.fillStyle = '#FFFDF8'; ctx.beginPath(); ctx.roundRect(34, 34, 1012, 1452, 32); ctx.fill();
  ctx.fillStyle = '#881337'; ctx.fillRect(34, 34, 1012, 44); ctx.fillRect(34, 1442, 1012, 44);
  ctx.fillStyle = '#022C22'; ctx.fillRect(34, 78, 1012, 285);
  ctx.fillStyle = '#F59E0B'; ctx.fillRect(34, 363, 1012, 10);

  ctx.fillStyle = '#F59E0B'; ctx.beginPath(); ctx.arc(145, 195, 52, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#022C22'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('BM', 145, 205);

  const ini = (shop || 'BM').trim().slice(0, 2).toUpperCase();
  ctx.fillStyle = '#881337'; ctx.beginPath(); ctx.arc(935, 195, 52, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#FDE68A'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#FDE68A'; ctx.fillText(ini, 935, 205);

  ctx.fillStyle = '#FDE68A'; ctx.font = 'bold 20px sans-serif';
  ctx.fillText('BISMILLAH-IR-RAHMAN-IR-RAHIM  •  BOLMIZAN x ' + rCfg.label.toUpperCase(), 540, 122);

ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 38px sans-serif'; ctx.fillText(shop.toUpperCase(), 540, 190, 620);
ctx.fillStyle = '#A7F3D0'; ctx.font = 'bold 20px sans-serif'; ctx.fillText('SEAL: ' + seal + '  |  OTP PIN: ' + otp, 540, 245);
ctx.fillStyle = '#CBD5E1'; ctx.font = '19px sans-serif'; ctx.fillText(new Date(b.createdAt || Date.now()).toLocaleString('en-PK') + ' • ' + lCfg.culture, 540, 295);
ctx.strokeStyle = '#94A3B8'; ctx.lineWidth = 2.5; ctx.strokeRect(80, 405, 920, 220);
ctx.textAlign = 'left'; ctx.fillStyle = '#881337'; ctx.font = 'bold 20px sans-serif'; ctx.fillText(rCfg.pL, 110, 450);
ctx.fillStyle = '#0F172A'; ctx.font = 'bold 48px sans-serif'; ctx.fillText(b.customerName, 110, 510, 860);
ctx.fillStyle = '#334155'; ctx.font = '600 24px sans-serif'; ctx.fillText('Details: ' + (b.extra ? b.extra + ' | ' : '') + b.details, 110, 570, 860);
ctx.fillStyle = isPaid ? '#ECFDF5' : '#FFF1F2';
ctx.beginPath(); ctx.roundRect(80, 655, 920, 240, 26); ctx.fill();
ctx.strokeStyle = isPaid ? '#10B981' : '#F43F5E'; ctx.lineWidth = 4; ctx.stroke();
ctx.textAlign = 'center'; ctx.fillStyle = isPaid ? '#059669' : '#E11D48'; ctx.font = 'bold 28px sans-serif';
ctx.fillText(isPaid ? rCfg.inL.toUpperCase() + ' (PAID)' : rCfg.outL.toUpperCase() + ' (DUE)', 540, 715);
ctx.fillStyle = '#0F172A'; ctx.font = 'bold 88px sans-serif'; ctx.fillText('Rs. ' + Number(b.amount).toLocaleString(), 540, 835, 840);
ctx.fillStyle = '#ECFDF5'; ctx.beginPath(); ctx.roundRect(80, 925, 920, 210, 22); ctx.fill();
ctx.strokeStyle = '#059669'; ctx.lineWidth = 3; ctx.stroke();
ctx.fillStyle = '#022C22'; ctx.fillRect(115, 958, 144, 144);
ctx.fillStyle = '#FDE68A'; ctx.font = 'bold 24px sans-serif'; ctx.fillText('VERIFIED', 187, 1020); ctx.fillText('OTP: ' + otp, 187, 1060);
ctx.textAlign = 'left'; ctx.fillStyle = '#064E3B'; ctx.font = 'bold 24px sans-serif'; ctx.fillText('BOLMIZAN GUARANTEED • ZERO-TAMPERING STAMP', 295, 975);
ctx.fillStyle = '#0F172A'; ctx.font = 'bold 22px sans-serif'; ctx.fillText('Seal: ' + seal + '  |  OTP: ' + otp, 295, 1020);
ctx.fillStyle = '#334155'; ctx.font = '19px sans-serif'; ctx.fillText('Duniya ke kisi bhi phone par verify karein:', 295, 1065);
ctx.fillText(LIVE_URL + ' (Verify? button)', 295, 1100);
ctx.textAlign = 'center';
ctx.fillStyle = '#FEF3C7'; ctx.beginPath(); ctx.roundRect(80, 1165, 920, 200, 24); ctx.fill();
ctx.strokeStyle = '#F59E0B'; ctx.lineWidth = 3; ctx.stroke();
ctx.fillStyle = '#0F172A'; ctx.font = 'bold 24px sans-serif'; ctx.fillText('Apni Dukaan ya Clinic ka Free Co-Branded Khata Lagwayein:', 540, 1225);
ctx.fillStyle = '#881337'; ctx.font = 'bold 34px sans-serif'; ctx.fillText(LIVE_URL, 540, 1280);
ctx.fillStyle = '#064E3B'; ctx.font = 'bold 20px sans-serif'; ctx.fillText('BHALI KARE AAYA  •  MADE IN SAKRAND, SINDH', 540, 1330);
return { dataUrl: c.toDataURL('image/png'), seal, otp, proofUrl };
};
const loadBills = (): any[] => {
try {
const d = JSON.parse(localStorage.getItem(STORE) || '[]');
if (!Array.isArray(d)) return [];
return d.filter((x) => x && typeof x === 'object').map((x, i) => ({
id: String(x.id || Date.now() + i), role: String(x.role || 'SHOP'), customerName: String(x.customerName || 'Customer'),
customerPhone: String(x.customerPhone || ''), amount: Number(x.amount) || 0, type: x.type === 'PAID' ? 'PAID' : 'UDHAAR',
details: String(x.details || ''), extra: String(x.extra || ''), createdAt: Number(x.createdAt) || Date.now()
}));
} catch { return []; }
};
const App = () => {
const urlProof = decodeVerifyUrl();
const [lang, setLang] = useState(() => localStorage.getItem('bm_lang') || 'sd');
const [role, setRole] = useState(() => localStorage.getItem('bm_role') || 'SHOP');
const [bills, setBills] = useState<any[]>(loadBills);
const [shop, setShop] = useState(() => localStorage.getItem('bm_shop_name') || ROLES.SHOP.def);
const [text, setText] = useState('');
const [extra, setExtra] = useState('');
const [phone, setPhone] = useState('');
const [search, setSearch] = useState('');
const [tab, setTab] = useState('ALL');
const [mic, setMic] = useState(false);
const [msg, setMsg] = useState('');
const [scamOpen, setScamOpen] = useState(false);
const [verifyOpen, setVerifyOpen] = useState(Boolean(urlProof));
const [guideOpen, setGuideOpen] = useState(false);
const [scamIn, setScamIn] = useState('');
const [vSeal, setVSeal] = useState(urlProof ? urlProof.seal || '' : '');
const [vOtp, setVOtp] = useState(urlProof ? urlProof.otp || '' : '');
const [modal, setModal] = useState<any>(null);
const [curtain, setCurtain] = useState(!urlProof);
const ref = useRef<HTMLInputElement | null>(null);
const fileRef = useRef<HTMLInputElement | null>(null);
useEffect(() => { try { localStorage.setItem(STORE, JSON.stringify(bills)); } catch {} }, [bills]);
useEffect(() => { const t = setTimeout(() => setCurtain(false), 2200); return () => clearTimeout(t); }, []);
const lCfg = LANGS[lang] || LANGS.sd;
const rCfg = ROLES[role] || ROLES.SHOP;
const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 4000); };
const changeRole = (k: string) => { setRole(k); localStorage.setItem('bm_role', k); setShop(ROLES[k].def); localStorage.setItem('bm_shop_name', ROLES[k].def); setExtra(''); flash('Mode: ' + ROLES[k].label); };
const addChip = (v: number) => {
const ns = text.match(/\d+/g);
if (ns && ns.length) { const last = ns[ns.length - 1]; setText(text.replace(new RegExp(last + '$'), String(parseInt(last, 10) + v))); }
else setText((text ? text.trim() + ' ' : 'Customer ') + v);
ref.current?.focus();
};
const saveRecord = (forced?: string, spoken?: string) => {
const raw = (spoken ?? text).trim();
if (!raw) { ref.current?.focus(); flash('Pehle naam aur raqam likhein'); return; }
const p = parseEntry(raw);
const ft = forced || p.type;
if (p.amount <= 0) { flash('Raqam bhi likhein'); return; }
const item = { id: String(Date.now()), role, customerName: p.customerName, customerPhone: phone.trim() || p.extractedPhone, amount: p.amount, type: ft, details: p.details, extra: extra.trim(), createdAt: Date.now() };
setBills([item, ...bills]);
setText(''); setExtra(''); setPhone('');
const out = makeParchiPNG(item, shop, rCfg, lCfg);
setModal({ bill: item, dataUrl: out.dataUrl, seal: out.seal, otp: out.otp, proofUrl: out.proofUrl });
flash('Verified Ajrak Parchi Tayyar!');
};
const runMic = () => {
const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
if (!SR) { ref.current?.focus(); flash('Keyboard ka Mic dabayein ya neeche likhein'); return; }
try {
const r = new SR(); r.lang = lCfg.code || 'ur-PK'; r.interimResults = false; setMic(true);
r.onresult = (e: any) => { const x = e.results[0][0].transcript; setText(x); saveRecord(undefined, x); };
r.onerror = () => { setMic(false); flash('Mic check karein ya neeche likhein'); };
r.onend = () => setMic(false); r.start();
} catch { setMic(false); }
};
const openReceipt = (b: any) => { const out = makeParchiPNG(b, shop, rCfg, lCfg); setModal({ bill: b, dataUrl: out.dataUrl, seal: out.seal, otp: out.otp, proofUrl: out.proofUrl }); };
const dataUrlToBlob = (dataUrl: string) => {
  const arr = dataUrl.split(',');
  const mime = 'image/png';
  const bstr = atob(arr.slice(1).join(','));
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) { u8arr[n] = bstr.charCodeAt(n); }
  return new Blob([u8arr], { type: mime });
};

const openWaLink = (fp: string, textMsg: string) => {
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const url = isMobile
    ? (fp ? 'https://whatsapp.com' + fp + '&text=' + encodeURIComponent(textMsg) : 'https://whatsapp.com' + encodeURIComponent(textMsg))
    : (fp ? 'https://whatsapp.com' + fp + '&text=' + encodeURIComponent(textMsg) : 'https://whatsapp.com' + encodeURIComponent(textMsg));
  const w = window.open(url, '_blank');
  if (!w) { window.location.href = url; }
};

const shareWhatsApp = async () => {
  if (!modal) return;
  const { bill, dataUrl, seal, otp, proofUrl } = modal;
  const waText = '*' + shop.toUpperCase() + '*\nBolMizan Guaranteed Parchi\nNaam: ' + bill.customerName + '\nRaqam: Rs. ' + Number(bill.amount).toLocaleString() + ' (' + bill.type + ')\nSeal: ' + seal + ' | OTP: ' + otp + '\nOnline Verify Link:\n' + proofUrl;
  const p = String(bill.customerPhone || '').replace(/\D/g, '');
  const fp = p.startsWith('03') ? '92' + p.slice(1) : p;
  const fileName = 'BolMizan_Parchi_' + seal + '.png';
  const blob = dataUrlToBlob(dataUrl);

  try {
    const file = new File([blob], fileName, { type: 'image/png' });
    if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: shop + ' Parchi', text: waText });
      flash('Ajrak Parchi WhatsApp par Share Ho Gayi!');
      return;
    }
  } catch (err: any) {
    if (err && err.name === 'AbortError') return;
  }

  try {
    if (navigator.clipboard && (window as any).ClipboardItem) {
      await navigator.clipboard.write([new (window as any).ClipboardItem({ 'image/png': blob })]);
    }
  } catch {}

  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.download = fileName;
  a.href = blobUrl;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);

  flash('Image Save + Copy Ho Gayi! WhatsApp Web khul raha hai — Ctrl+V se Image bhejein!');
  openWaLink(fp, waText);
};

const shareHisabWA = (customerName: string) => {
  const custBills = bills.filter((x) => x.customerName.toLowerCase() === customerName.toLowerCase());
  const dueTotal = custBills.filter((x) => x.type === 'UDHAAR').reduce((s, x) => s + Number(x.amount || 0), 0);
  const paidTotal = custBills.filter((x) => x.type === 'PAID').reduce((s, x) => s + Number(x.amount || 0), 0);
  const phoneNum = custBills.find((x) => x.customerPhone)?.customerPhone || '';
  const p = String(phoneNum).replace(/\D/g, '');
  const fp = p.startsWith('03') ? '92' + p.slice(1) : p;
  const lines = custBills.slice(0, 10).map((x) => `• ${x.type}: Rs. ${Number(x.amount).toLocaleString()} (${x.details})`);
  const txt = `*${shop.toUpperCase()} — MUKAMMAL HISAB*\nCustomer: *${customerName}*\nTotal Wasool: Rs. ${paidTotal.toLocaleString()}\nTotal Baqi (Udhaar): *Rs. ${dueTotal.toLocaleString()}*\n\nRecent Entries:\n${lines.join("\n")}\n\nVerified by BolMizan AI: ${LIVE_URL}`;
  openWaLink(fp, txt);
};

const shareSMS = (b: any) => {
  const p = String(b.customerPhone || '').replace(/\D/g, '');
  const seal = makeSeal(b.id + '|' + b.customerName + '|' + b.amount);
  const otp = makeOtp(seal, Number(b.amount));
  const body = shop.toUpperCase() + ' [Seal:' + seal + ' OTP:' + otp + ']: ' + b.customerName + ' Rs.' + Number(b.amount).toLocaleString() + ' ' + LIVE_URL;
  window.location.href = 'sms:' + p + '?body=' + encodeURIComponent(body);
};

const maango = (b: any) => {
  const amt = Number(b.amount).toLocaleString();
  const txt = 'Assalam-o-Alaikum ' + b.customerName + '! ' + shop + ' ke khata mein aapki taraf Rs. ' + amt + ' baqi hain. Meharbani kar ke adaigi kar dein. (' + LIVE_URL + ')';
  const p = String(b.customerPhone || '').replace(/\D/g, '');
  const fp = p.startsWith('03') ? '92' + p.slice(1) : p;
  openWaLink(fp, txt);
};

const invite = () => {
  const txt = 'Bhali Kare Aaya! Apni dukaan, kheti-baari, ya clinic ka FREE Voice Khata & QR-Verified Ajrak Parchi lagwayein: ' + LIVE_URL;
  openWaLink('', txt);
};
const settle = (b: any) => { setBills(bills.map((x) => x.id === b.id ? { ...x, type: 'PAID' } : x)); flash('Done: ' + b.customerName); };
const removeBill = (b: any) => { if (window.confirm('Delete ' + b.customerName + '?')) setBills(bills.filter((x) => x.id !== b.id)); };
const exportBackup = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(bills)], { type: 'application/json' })); a.download = 'BolMizan_Backup.json'; a.click(); };
const restoreBackup = (e: any) => { const f = e.target.files?.[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(String(r.result || '[]')); if (Array.isArray(d)) { setBills(d); flash('Backup Restored!'); } } catch { flash('Invalid File'); } }; r.readAsText(f); };
const preview = text.trim() ? parseEntry(text) : null;
const shown = bills.filter((b) => (tab === 'ALL' || b.type === tab) && (!search.trim() || b.customerName.toLowerCase().includes(search.toLowerCase())));
const udhaar = shown.filter((b) => b.type === 'UDHAAR').reduce((s, b) => s + Number(b.amount || 0), 0);
const paid = shown.filter((b) => b.type === 'PAID').reduce((s, b) => s + Number(b.amount || 0), 0);
const scamRes = scamIn.trim() ? checkScam(scamIn) : null;
const ini = (shop || 'BM').trim().slice(0, 2).toUpperCase();
return E('div', { className: 'wrap' },
curtain ? E('div', { className: 'curtain-wrap' },
E('div', { className: 'curtain-half curtain-l' }),
E('div', { className: 'curtain-half curtain-r' }),
E('div', { className: 'welcome-badge' },
E('div', { className: 'coin-disc' }, 'MZN'),
E('div', { style: { fontSize: '18px', fontWeight: 900 } }, lCfg.welcome),
E('div', { className: 'deal-anim' }, 'SINDH x GLOBAL TRADE'),
E('div', { style: { fontSize: '11px', color: '#A7F3D0', fontWeight: 700 } }, 'BOLMIZAN AI • GUARANTEED LEDGER')
)
) : null,
E('input', { ref: fileRef, type: 'file', accept: '.json', onChange: restoreBackup, className: 'hidden' }),
modal ? E('div', { className: 'modal-bg', onClick: () => setModal(null) },
E('div', { className: 'modal-box', onClick: (e: any) => e.stopPropagation() },
E('div', { style: { fontSize: '12px', fontWeight: 900, color: '#881337', marginBottom: '8px' } }, 'VERIFIED AJRAK PARCHI (SEAL + OTP)'),
E('img', { src: modal.dataUrl, alt: 'Ajrak Parchi', style: { width: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '16px', border: '2px solid #881337' } }),
E('div', { className: 'g2', style: { marginTop: '12px' } },
E('button', { onClick: shareWhatsApp, className: 'btn-in' }, 'WhatsApp + Save IMG'),
E('button', { onClick: () => setModal(null), className: 'btn-out' }, 'Close')
)
)
) : null,
E('div', { className: 'culture-strip' }),
E('div', { className: 'hdr', style: { background: rCfg.theme } },
E('div', { className: 'box' },
E('div', { className: 'bismillah' }, lCfg.welcome + ' • BOLMIZAN x ' + ini),
E('div', { className: 'row' },
E('div', { style: { width: '36px', height: '36px', borderRadius: '50%', background: '#F59E0B', color: '#022C22', fontWeight: 900, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, 'BM'),
E('input', { className: 'shop-in', value: shop, onChange: (e: any) => { setShop(e.target.value); localStorage.setItem('bm_shop_name', e.target.value); } }),
E('div', { style: { width: '36px', height: '36px', borderRadius: '50%', background: '#881337', color: '#FDE68A', border: '2px solid #FDE68A', fontWeight: 900, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } }, ini)
),
E('div', { className: 'row', style: { marginTop: '10px', justifyContent: 'center' } },
E('button', { onClick: () => setVerifyOpen(!verifyOpen), className: 'pill-gold' }, 'Verify?'),
E('button', { onClick: () => setScamOpen(!scamOpen), className: 'pill-red' }, 'Scam?'),
E('button', { onClick: () => setGuideOpen(!guideOpen), className: 'pill' }, 'Backup'),
E('button', { onClick: invite, className: 'pill' }, 'Invite')
)
)
),
E('div', { className: 'main' },
msg ? E('div', { className: 'toast' }, msg) : null,
verifyOpen ? E('div', { className: 'card', style: { border: '2px solid #059669' } },
E('div', { className: 'row', style: { marginBottom: '8px' } },
E('strong', { style: { color: '#064E3B', fontSize: '13px' } }, 'UNIVERSAL PARCHI GUARANTEE & OTP VERIFIER'),
E('button', { onClick: () => setVerifyOpen(false), className: 'chip' }, 'Close')
),
urlProof ? E('div', { style: { padding: '10px', borderRadius: '12px', marginBottom: '8px', background: urlProof.valid ? '#ECFDF5' : '#FFF1F2', color: urlProof.valid ? '#065F46' : '#9F1239', fontSize: '12px', fontWeight: 800 } },
urlProof.valid ? ('LINK VERIFIED BY BOLMIZAN AI: ' + urlProof.shop + ' -> ' + urlProof.name + ' (Rs. ' + urlProof.amount.toLocaleString() + ' • ' + urlProof.type + ')') : 'INVALID PROOF LINK!'
) : null,
E('div', { className: 'g2', style: { marginBottom: '8px' } },
E('input', { value: vSeal, onChange: (e: any) => setVSeal(e.target.value.toUpperCase()), placeholder: 'Seal (e.g. MZN-EA413274)' }),
E('input', { value: vOtp, onChange: (e: any) => setVOtp(e.target.value), placeholder: '6-Digit OTP PIN' })
),
(() => {
if (!vSeal.trim() || !vOtp.trim()) return E('div', { style: { fontSize: '11px', color: '#475569' } }, 'Parchi par likha Seal aur 6-Digit OTP daal kar tasdeeq karein.');
const found = bills.find((x) => makeSeal(x.id + '|' + x.customerName + '|' + x.amount) === vSeal.trim() && makeOtp(vSeal.trim(), Number(x.amount)) === vOtp.trim());
return found
? E('div', { style: { padding: '10px', borderRadius: '12px', background: '#ECFDF5', color: '#065F46', fontSize: '12px', fontWeight: 800 } }, '100% GUARANTEED & VERIFIED: ' + found.customerName + ' — Rs. ' + Number(found.amount).toLocaleString() + ' (' + found.type + ')')
: E('div', { style: { padding: '10px', borderRadius: '12px', background: '#FFF1F2', color: '#9F1239', fontSize: '12px', fontWeight: 800 } }, 'UNVERIFIED: Local ledger mein yeh Seal/OTP nahi mila (WhatsApp Proof Link se check karein).');
})()
) : null,
guideOpen ? E('div', { className: 'card', style: { border: '2px solid #0284C7', fontSize: '13px' } },
E('div', { className: 'row', style: { marginBottom: '8px' } }, E('strong', null, 'DATA VAULT BACKUP & RESTORE'), E('button', { onClick: () => setGuideOpen(false), className: 'chip' }, 'Close')),
E('div', { className: 'g2' }, E('button', { onClick: exportBackup, className: 'btn-in' }, 'Download Backup'), E('button', { onClick: () => fileRef.current?.click(), className: 'chip' }, 'Restore Backup'))
) : null,
E('div', { className: 'strip' }, Object.keys(LANGS).map((lk) => E('button', { key: lk, onClick: () => { setLang(lk); localStorage.setItem('bm_lang', lk); flash(LANGS[lk].welcome); }, className: 'tab-btn ' + (lang === lk ? 'tab-act' : '') }, LANGS[lk].name))),
E('div', { className: 'strip' }, Object.keys(ROLES).map((rk) => E('button', { key: rk, onClick: () => changeRole(rk), className: 'tab-btn ' + (role === rk ? 'tab-act' : '') }, ROLES[rk].label))),
scamOpen ? E('div', { className: 'card', style: { border: '2px solid #E11D48' } },
E('div', { className: 'row', style: { marginBottom: '8px' } }, E('strong', { style: { color: '#BE123C', fontSize: '13px' } }, 'FAKE PAYMENT & SMS SCAM SHIELD'), E('button', { onClick: () => setScamOpen(false), className: 'chip' }, 'Close')),
E('div', { className: 'g3', style: { marginBottom: '8px' } },
E('button', { onClick: () => setScamIn('03001234567: Rs 5000 Easypaisa received TID 998811 ghalti se aa gaye wapas bhej dein'), className: 'chip' }, 'Test Fake SMS'),
E('button', { onClick: () => setScamIn('Mubarak ho Benazir 8171 inaam Rs 25000 apna OTP pin batayein'), className: 'chip' }, 'Test OTP Fraud'),
E('button', { onClick: () => setScamIn('From 8558: You have received Rs. 15,000 from Ahmed TID 1234567890'), className: 'chip' }, 'Test Asli 8558')
),
E('textarea', { rows: 2, value: scamIn, onChange: (e: any) => setScamIn(e.target.value), placeholder: 'EasyPaisa / JazzCash SMS paste karein...' }),
scamRes ? E('div', { style: { marginTop: '8px', padding: '10px', borderRadius: '12px', background: scamRes.safe ? '#ECFDF5' : '#FFF1F2', color: scamRes.safe ? '#065F46' : '#9F1239', fontSize: '12px' } }, E('strong', null, scamRes.title), E('div', { style: { marginTop: '4px' } }, scamRes.reason)) : null
) : null,
E('div', { className: 'g2' },
E('div', { className: 'card' }, E('div', { style: { fontSize: '11px', fontWeight: 800, color: '#047857' } }, rCfg.inL.toUpperCase()), E('div', { style: { fontSize: '21px', fontWeight: 900, color: '#047857', marginTop: '4px' } }, 'Rs. ' + paid.toLocaleString())),
E('div', { className: 'card' }, E('div', { style: { fontSize: '11px', fontWeight: 800, color: '#E11D48' } }, rCfg.outL.toUpperCase()), E('div', { style: { fontSize: '21px', fontWeight: 900, color: '#E11D48', marginTop: '4px' } }, 'Rs. ' + udhaar.toLocaleString()))
),
E('button', { onClick: runMic, className: 'voice-btn ' + (mic ? 'voice-on' : ''), style: { background: rCfg.theme } }, mic ? 'SUN RAHA HOON...' : lCfg.mic),
E('div', { className: 'card', style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
E('div', { style: { background: rCfg.theme, border: '2px solid #F59E0B', borderRadius: '16px', padding: '10px 14px', color: '#FFF' } },
E('div', { style: { fontWeight: 900, fontSize: '14px', color: '#FDE68A' } }, rCfg.title),
E('div', { style: { fontSize: '11px', color: '#E2E8F0', fontWeight: 700 } }, rCfg.sub)
),
E('div', { className: 'strip' }, rCfg.pre.map((pr: string) => E('button', { key: pr, type: 'button', onClick: () => setText(pr), className: 'chip' }, pr))),
E('div', null, E('span', { className: 'lbl' }, rCfg.pL + ' & RAQAM'), E('input', { ref: ref, value: text, onChange: (e: any) => setText(e.target.value), onKeyDown: (e: any) => { if (e.key === 'Enter') saveRecord(); }, placeholder: rCfg.ph })),
E('div', null, E('span', { className: 'lbl' }, rCfg.eL), E('input', { value: extra, onChange: (e: any) => setExtra(e.target.value), placeholder: rCfg.ePh })),
preview && preview.amount > 0 ? E('div', { style: { background: '#ECFDF5', padding: '8px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 800, color: '#065F46', display: 'flex', justifyContent: 'space-between' } }, E('span', null, preview.customerName + (preview.formula ? ' (' + preview.formula + ')' : '')), E('span', null, 'Rs. ' + preview.amount.toLocaleString())) : null,
E('div', { className: 'g4' }, CHIPS.map((a) => E('button', { key: a, type: 'button', onClick: () => addChip(a), className: 'chip' }, '+' + a))),
E('input', { type: 'tel', value: phone, onChange: (e: any) => setPhone(e.target.value), placeholder: 'Mobile / WhatsApp Number (0300...)' }),
E('div', { className: 'g2' },
E('button', { onClick: () => saveRecord('PAID'), className: 'btn-in' }, rCfg.inL.toUpperCase() + ' + AJRAK IMG'),
E('button', { onClick: () => saveRecord('UDHAAR'), className: 'btn-out' }, rCfg.outL.toUpperCase() + ' + AJRAK IMG')
)
),
E('div', { className: 'row' },
E('input', { value: search, onChange: (e: any) => setSearch(e.target.value), placeholder: lCfg.search }),
search && shown.length > 0 ? E('button', { onClick: () => shareHisabWA(shown[0].customerName), className: 'pill-gold', style: { whiteSpace: 'nowrap' } }, 'Hisab WA') : null,
search ? E('button', { onClick: () => setSearch(''), className: 'pill-red' }, 'Clear') : null
),
E('div', { className: 'g3' }, ['ALL', 'UDHAAR', 'PAID'].map((t) => E('button', { key: t, onClick: () => setTab(t), style: { padding: '10px', fontSize: '12px', background: tab === t ? '#064E3B' : '#FFF', color: tab === t ? '#FFF' : '#475569', border: '1px solid #E2E8F0' } }, t === 'ALL' ? 'Sab (' + bills.length + ')' : (t === 'PAID' ? rCfg.inL : rCfg.outL)))),
shown.slice(0, 30).map((b) => {
const isPaid = b.type === 'PAID';
const bSeal = makeSeal(b.id + '|' + b.customerName + '|' + b.amount);
const bOtp = makeOtp(bSeal, Number(b.amount));
return E('div', { key: b.id, className: 'card', style: { display: 'flex', flexDirection: 'column', gap: '10px' } },
E('div', { className: 'row' },
E('div', { style: { flex: 1, minWidth: 0, cursor: 'pointer' }, onClick: () => setSearch(b.customerName) },
E('div', { style: { fontWeight: 900, fontSize: '16px' } }, b.customerName),
E('div', { style: { fontSize: '12px', color: '#64748B', marginTop: '2px' } }, (b.extra ? b.extra + ' | ' : '') + b.details),
E('div', { style: { fontSize: '10px', fontWeight: 800, color: '#065F46', marginTop: '3px' } }, 'Seal: ' + bSeal + ' • OTP: ' + bOtp)
),
E('div', { style: { textAlign: 'right' } },
E('div', { style: { fontWeight: 900, fontSize: '18px', color: isPaid ? '#059669' : '#E11D48' } }, 'Rs. ' + Number(b.amount).toLocaleString()),
E('button', { onClick: () => removeBill(b), className: 'chip', style: { padding: '2px 8px', fontSize: '10px', marginTop: '4px' } }, 'Delete')
)
),
E('div', { className: 'g3' },
E('button', { onClick: () => openReceipt(b), className: 'act-img' }, 'Ajrak IMG Parchi'),
E('button', { onClick: () => shareSMS(b), className: 'act-sms' }, 'Keypad SMS'),
!isPaid ? E('button', { onClick: () => maango(b), className: 'act-mng' }, 'Maango') : E('div', { className: 'act-done' }, 'GUARANTEED')
),
!isPaid ? E('button', { onClick: () => settle(b), className: 'btn-in', style: { padding: '9px', fontSize: '12px' } }, 'Mark as ' + rCfg.inL + ' (Done)') : null
);
})
)
);
};
ReactDOM.createRoot(document.getElementById('root')!).render(E(App, null));





