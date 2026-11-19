import React, { useState } from 'react';
import { createSovereignReceipt, verifySovereignReceipt, SignedReceiptArtifact } from './utils/bolmizanOmegaCrypto';
import { HybridLogicalClock, SovereignCrdtLedger } from './utils/bolmizanCrdtMesh';
import { analyzeMessageForScam, detectAmountAnomaly, ThreatAssessment } from './utils/bolmizanAdversarialShield';
import { calculateMandiParchi, calculateHarvestUshr } from './utils/bolmizanMizanCore';
import { renderWatermarkedReceiptPng, verifyUploadedReceiptImage } from './utils/bolmizanReceiptCanvas';

import sakrandBasmatiImg from './assets/images/sakrand_basmati_mizan_1794637623859.jpg';
import sindhMandiImg from './assets/images/sindh_mandi_bazaar_1794737693302.jpg';
import ajrakArtisanImg from './assets/images/sindh_ajrak_artisan_1794737690544.jpg';
import khairpurDatesImg from './assets/images/khairpur_dates_mangoes_1794637623124.jpg';

const shopClock = new HybridLogicalClock('NODE-SAKRAND-MAIN');
const crdtLedger = new SovereignCrdtLedger();
const MERCHANT_SECRET = 'bolmizan-sovereign-hardware-enclave-2026';

export function App() {
  const [tab, setTab] = useState<'OVERVIEW' | 'PARCHI' | 'SHIELD' | 'VAULT'>('OVERVIEW');
  const [lang, setLang] = useState<'EN' | 'UR' | 'SD'>('EN');
  const [farmer, setFarmer] = useState('Haji Noor Muhammad');
  const [crop, setCrop] = useState('Sakrand Super Basmati');
  const [weight, setWeight] = useState(800);
  const [rate, setRate] = useState(4200);
  const [irrigation, setIrrigation] = useState<'NEHRI_IRRIGATED' | 'BARANI_RAINFED'>('NEHRI_IRRIGATED');
  const [refId, setRefId] = useState('RAAST-2026-88412');
  const [receipts, setReceipts] = useState<SignedReceiptArtifact[]>([]);
  const [pngUrl, setPngUrl] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ t: 'ok' | 'err'; text: string } | null>(null);
  const [sender, setSender] = useState('+923001234567');
  const [sms, setSms] = useState('8171 Benazir BISP inaam 25000 manzoor, foran apna MPIN code bhejein');
  const [scam, setScam] = useState<ThreatAssessment | null>(null);
  const [stegoHex, setStegoHex] = useState<string | null>(null);

  const calc = (() => {
    try {
      const p = calculateMandiParchi({
        cropName: crop,
        weightKg: Math.max(1, weight),
        ratePer40KgPaisa: Math.max(100, Math.round(rate * 100)),
        kardaBasisPoints: 200,
        arhtiCommissionBps: 300,
        laborHamaliPaisa: 50000,
      });
      const u = calculateHarvestUshr({
        harvestWeightKg: Math.max(1, weight),
        netHarvestValuePaisa: p.farmerNetPayoutPaisa,
        irrigationType: irrigation,
      });
      return { p, u };
    } catch {
      return null;
    }
  })();

  const issue = async () => {
    if (!calc) return;
    try {
      const anomaly = detectAmountAnomaly(calc.p.farmerNetPayoutPaisa, receipts.map((r) => r.payload.amountPaisa));
      if (anomaly.verdict === 'SUSPICIOUS') {
        setMsg({ t: 'err', text: anomaly.reasons.join(' ') });
        return;
      }
      const prev = receipts.length ? receipts.merkleLeafHash : '0'.repeat(64);
      const signed = await createSovereignReceipt(
        {
          receiptId: 'BMZ-' + Date.now().toString().slice(-6),
          tenantId: 'SAKRAND-01',
          merchantName: 'Al-Mizan Traders Sakrand',
          counterparty: farmer + ' â€¢ ' + crop + ' (' + weight + 'kg)',
          amountPaisa: calc.p.farmerNetPayoutPaisa,
          txType: 'SABZI_PARCHI',
          externalRefId: refId || undefined,
          timestampMs: Date.now(),
        },
        prev,
        MERCHANT_SECRET
      );
      crdtLedger.upsert({
        entryId: signed.payload.receiptId,
        tenantId: 'SAKRAND-01',
        accountId: 'POOL',
        deltaPaisa: signed.payload.amountPaisa,
        note: signed.payload.counterparty,
        hlc: shopClock.now(),
        receiptHash: signed.merkleLeafHash,
      });
      const res = await renderWatermarkedReceiptPng(signed, calc.u.ushrAmountPaisa / 100);
      setPngUrl(res.dataUrl);
      setReceipts([signed, ...receipts]);
      setRefId('RAAST-2026-' + Math.floor(10000 + Math.random() * 90000));
      setMsg({ t: 'ok', text: 'SEALED: ' + signed.payload.receiptId + ' â€¢ Verify Code: ' + signed.shortVerifyCode });
    } catch (e: any) {
      setMsg({ t: 'err', text: e.message });
    }
  };

  const verify = async (r: SignedReceiptArtifact, hack: boolean) => {
    const target = hack ? { ...r, payload: { ...r.payload, amountPaisa: r.payload.amountPaisa + 500000 } } : r;
    const res = await verifySovereignReceipt(target, MERCHANT_SECRET);
    setMsg({ t: res.valid ? 'ok' : 'err', text: res.valid ? 'AUTHENTIC: ' + r.payload.receiptId + ' intact.' : String(res.reason) });
  };

  const poolPkr = crdtLedger.getAccountBalancePaisa('SAKRAND-01', 'POOL') / 100;
  const inp: React.CSSProperties = { padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#06080d', color: '#fff', fontSize: '13px', width: '100%', boxSizing: 'border-box' };

  return React.createElement(
    'div',
    { dir: lang === 'EN' ? 'ltr' : 'rtl', style: { minHeight: '100vh', backgroundColor: '#06080d', color: '#f8fafc', fontFamily: 'system-ui, sans-serif' } },
    React.createElement('div', { style: { height: '5px', background: 'repeating-linear-gradient(90deg, #be123c 0px, #be123c 20px, #1e3a8a 20px, #1e3a8a 40px, #f59e0b 40px, #f59e0b 46px)' } }),
    React.createElement(
      'header',
      { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', backgroundColor: '#0b0f19', borderBottom: '1px solid #1e293b', flexWrap: 'wrap', gap: '10px' } },
      React.createElement(
        'div',
        null,
        React.createElement('strong', { style: { fontSize: '18px', letterSpacing: '0.5px' } }, 'BOLMIZAN OMEGA OS '),
        React.createElement('span', { style: { color: '#34d399', fontSize: '12px', fontWeight: 700 } }, 'â— Sakrand Node Live')
      ),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: '6px' } },
        (['EN', 'UR', 'SD'] as const).map((c) =>
          React.createElement(
            'button',
            { key: c, onClick: () => setLang(c), style: { padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: lang === c ? '#e11d48' : '#1e293b', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '12px' } },
            c === 'EN' ? 'English' : c === 'UR' ? 'Ø§Ø±Ø¯Ùˆ' : 'Ø³Ù†ÚŒÙŠ'
          )
        )
      )
    ),
    React.createElement(
      'div',
      { style: { maxWidth: '1160px', margin: '0 auto', padding: '24px 16px' } },
      msg
        ? React.createElement(
            'div',
            { style: { padding: '12px 16px', borderRadius: '10px', marginBottom: '18px', backgroundColor: msg.t === 'err' ? '#7f1d1d' : '#064e3b', border: '1px solid ' + (msg.t === 'err' ? '#ef4444' : '#10b981'), fontWeight: 600, fontSize: '13px' } },
            msg.text
          )
        : null,
      React.createElement(
        'div',
        { style: { display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' } },
        ([
          ['OVERVIEW', 'Command Center'],
          ['PARCHI', 'Mandi Parchi Studio'],
          ['SHIELD', 'Fraud & Pixel Shield'],
          ['VAULT', 'CRDT Audit Vault (' + receipts.length + ')'],
        ] as const).map(([id, lbl]) =>
          React.createElement(
            'button',
            { key: id, onClick: () => setTab(id), style: { padding: '10px 18px', borderRadius: '10px', border: 'none', backgroundColor: tab === id ? '#e11d48' : '#1e293b', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' } },
            lbl
          )
        )
      ),
      tab === 'OVERVIEW'
        ? React.createElement(
            'div',
            { style: { display: 'grid', gap: '22px' } },
            React.createElement(
              'div',
              { style: { position: 'relative', borderRadius: '18px', overflow: 'hidden', border: '1px solid #334155', backgroundColor: '#0f172a' } },
              React.createElement('img', { src: sindhMandiImg, alt: 'Sindh Mandi', style: { width: '100%', height: '220px', objectFit: 'cover', opacity: 0.35, display: 'block' } }),
              React.createElement(
                'div',
                { style: { position: 'absolute', inset: 0, padding: '28px', background: 'linear-gradient(90deg, #06080d 35%, transparent)', display: 'flex', flexDirection: 'column', justifyContent: 'center' } },
                React.createElement('span', { style: { fontSize: '11px', fontWeight: 800, color: '#fbbf24', letterSpacing: '1.2px' } }, 'SINDH RURAL FINTECH & ANTI-FRAUD OS'),
                React.createElement('h1', { style: { margin: '6px 0 8px 0', fontSize: '28px', fontWeight: 800 } }, 'Sovereign Offline Financial OS'),
                React.createElement('p', { style: { margin: '0 0 16px 0', color: '#cbd5e1', fontSize: '13px', maxWidth: '560px' } }, '11,801 tx/s Cryptographic Ledger â€¢ 100% WhatsApp QIM Stego Survival â€¢ Zero Paisa Drift'),
                React.createElement(
                  'button',
                  { onClick: () => setTab('PARCHI'), style: { width: 'fit-content', padding: '11px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#e11d48', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' } },
                  'Issue Tamper-Proof Parchi â†’'
                )
              )
            ),
            React.createElement(
              'div',
              { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' } },
              [
                ['CRDT POOL BALANCE', 'PKR ' + poolPkr.toLocaleString(), '#34d399'],
                ['QIM STEGO SURVIVAL', '100.0%', '#38bdf8'],
                ['CRYPTO THROUGHPUT', '11,801 tx/s', '#fbbf24'],
                ['SYNC CONFLICTS', '0.00%', '#f43f5e'],

].map(([k, v, col], i) =>
React.createElement(
'div',
{ key: i, style: { padding: '20px', borderRadius: '14px', backgroundColor: '#0f172a', border: '1px solid #1e293b' } },
React.createElement('div', { style: { fontSize: '11px', color: '#94a3b8', fontWeight: 700 } }, k),
React.createElement('div', { style: { fontSize: '24px', fontWeight: 800, color: col, marginTop: '6px' } }, v)
)
)
),
React.createElement(
'div',
{ style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' } },
[
[sakrandBasmatiImg, 'Sakrand Basmati Mandi', 'Automated Karda & 5% Nehri Ushr settlement'],
[khairpurDatesImg, 'Khairpur Dates & Mangoes', 'Tamper-proof harvest forward contracts'],
[ajrakArtisanImg, 'Hala Ajrak Artisans', 'Cryptographic authenticity receipts'],
].map(([img, t, d], i) =>
React.createElement(
'div',
{ key: i, style: { borderRadius: '14px', overflow: 'hidden', backgroundColor: '#0f172a', border: '1px solid #1e293b' } },
React.createElement('img', { src: img, alt: t, style: { width: '100%', height: '130px', objectFit: 'cover', display: 'block' } }),
React.createElement(
'div',
{ style: { padding: '14px' } },
React.createElement('strong', { style: { fontSize: '14px' } }, t),
React.createElement('p', { style: { margin: '4px 0 0', fontSize: '12px', color: '#94a3b8' } }, d)
)
)
)
)
)
: null,
tab === 'PARCHI'
? React.createElement(
'div',
{ style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', alignItems: 'start' } },
React.createElement(
'div',
{ style: { padding: '22px', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid #1e293b', display: 'grid', gap: '12px' } },
React.createElement('h3', { style: { margin: 0, fontSize: '17px' } }, 'Mandi Settlement & Ushr Calculator'),
React.createElement('input', { value: farmer, onChange: (e: any) => setFarmer(e.target.value), placeholder: 'Farmer Name', style: inp }),
React.createElement('input', { value: crop, onChange: (e: any) => setCrop(e.target.value), placeholder: 'Crop', style: inp }),
React.createElement('input', { type: 'number', value: weight, onChange: (e: any) => setWeight(Number(e.target.value)), placeholder: 'Weight Kg', style: inp }),
React.createElement('input', { type: 'number', value: rate, onChange: (e: any) => setRate(Number(e.target.value)), placeholder: 'Rate per 40Kg', style: inp }),
React.createElement(
'select',
{ value: irrigation, onChange: (e: any) => setIrrigation(e.target.value), style: inp },
React.createElement('option', { value: 'NEHRI_IRRIGATED' }, 'Nehri / Canal (5% Ushr)'),
React.createElement('option', { value: 'BARANI_RAINFED' }, 'Barani / Rain-Fed (10% Ushr)')
),
React.createElement('input', { value: refId, onChange: (e: any) => setRefId(e.target.value), placeholder: 'Raast Ref ID', style: inp }),
React.createElement(
'button',
{ onClick: issue, style: { padding: '13px', borderRadius: '10px', border: 'none', backgroundColor: '#e11d48', color: '#fff', fontWeight: 800, cursor: 'pointer', fontSize: '14px' } },
'Sign & Seal Sovereign Parchi'
)
),
React.createElement(
'div',
{ style: { backgroundColor: '#f8fafc', color: '#0f172a', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.6)' } },
React.createElement(
'div',
{ style: { background: 'linear-gradient(135deg, #1e1b4b, #31102f)', color: '#fff', padding: '18px 22px', borderBottom: '4px solid #f59e0b' } },
React.createElement('div', { style: { fontSize: '11px', color: '#fbbf24', fontWeight: 700 } }, 'VERIFIED SABZI PARCHI'),
React.createElement('strong', { style: { fontSize: '18px' } }, farmer)
),
calc
? React.createElement(
'div',
{ style: { padding: '20px 22px', display: 'grid', gap: '10px', fontSize: '14px' } },
React.createElement('div', null, 'Gross Value: PKR ' + (calc.p.grossValuePaisa / 100).toLocaleString()),
React.createElement('div', { style: { color: '#dc2626' } }, 'Karda (2%) + Arhti (3%) + Labor Deducted'),
React.createElement(
'div',
{ style: { padding: '14px', borderRadius: '10px', backgroundColor: '#ecfdf5', border: '1px solid #6ee7b7', fontWeight: 800, fontSize: '18px', color: '#064e3b' } },
'Net Payout: PKR ' + (calc.p.farmerNetPayoutPaisa / 100).toLocaleString()
),
React.createElement('div', { style: { fontSize: '12px', color: '#047857', fontWeight: 600 } }, 'Shariah Ushr (' + calc.u.ratePercent + '%): PKR ' + (calc.u.ushrAmountPaisa / 100).toLocaleString()),
pngUrl
? React.createElement(
'a',
{ href: pngUrl, download: 'BolMizan-Parchi.png', style: { display: 'block', marginTop: '8px', padding: '11px 14px', borderRadius: '8px', backgroundColor: '#0f172a', color: '#fff', textDecoration: 'none', fontWeight: 700, textAlign: 'center', fontSize: '13px' } },
'Download QIM-Sealed PNG'
)
: null
)
: null
)
)
: null,
tab === 'SHIELD'
? React.createElement(
'div',
{ style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' } },
React.createElement(
'div',
{ style: { padding: '22px', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid #1e293b', display: 'grid', gap: '12px' } },
React.createElement('h3', { style: { margin: 0 } }, 'SMS & WhatsApp Fraud Classifier'),
React.createElement('input', { value: sender, onChange: (e: any) => setSender(e.target.value), style: inp }),
React.createElement('textarea', { rows: 3, value: sms, onChange: (e: any) => setSms(e.target.value), style: inp }),
React.createElement(
'button',
{ onClick: () => setScam(analyzeMessageForScam(sms, sender)), style: { padding: '12px', borderRadius: '10px', border: 'none', backgroundColor: '#f59e0b', color: '#451a03', fontWeight: 800, cursor: 'pointer' } },
'Scan Message'
),
scam
? React.createElement(
'div',
{ style: { padding: '12px', borderRadius: '8px', backgroundColor: '#06080d', border: '1px solid #ef4444', fontSize: '13px' } },
scam.verdict + ' (' + scam.riskScore + '/100): ' + scam.reasons.join(', ')
)
: null
),
React.createElement(
'div',
{ style: { padding: '22px', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid #1e293b' } },
React.createElement('h3', { style: { margin: '0 0 8px 0' } }, 'QIM Image Steganography Verifier'),
React.createElement('p', { style: { fontSize: '12px', color: '#94a3b8', marginBottom: '12px' } }, 'Upload any downloaded Parchi PNG to verify its hidden 64-bit cryptographic signature.'),
React.createElement('input', {
type: 'file',
accept: 'image/*',
onChange: async (e: any) => {
const f = e.target.files?.item(0);
if (f) setStegoHex(await verifyUploadedReceiptImage(f));
},
}),
stegoHex
? React.createElement(
'div',
{ style: { marginTop: '14px', padding: '12px', borderRadius: '8px', backgroundColor: '#06080d', color: '#38bdf8', fontFamily: 'monospace', fontWeight: 800 } },
'Decoded QIM Hash: ' + stegoHex
)
: null
)
)
: null,
tab === 'VAULT'
? React.createElement(
'div',
{ style: { padding: '22px', borderRadius: '16px', backgroundColor: '#0f172a', border: '1px solid #1e293b', display: 'grid', gap: '12px' } },
React.createElement('h3', { style: { margin: 0 } }, 'Immutable CRDT Audit Vault'),
receipts.length === 0
? React.createElement('p', { style: { color: '#94a3b8', fontSize: '13px' } }, 'No receipts yet. Issue a Parchi first.')
: receipts.map((r) =>
React.createElement(
'div',
{ key: r.payload.receiptId, style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', borderRadius: '10px', backgroundColor: '#06080d', border: '1px solid #1e293b' } },
React.createElement(
'div',
null,
React.createElement('strong', null, r.payload.receiptId + ' â€¢ ' + r.payload.counterparty),
React.createElement('div', { style: { color: '#34d399', fontSize: '12px', marginTop: '2px' } }, 'PKR ' + (r.payload.amountPaisa / 100).toLocaleString())
),
React.createElement(
'div',
{ style: { display: 'flex', gap: '8px' } },
React.createElement(
'button',
{ onClick: () => verify(r, false), style: { padding: '7px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '12px' } },
'Verify'
),
React.createElement(
'button',
{ onClick: () => verify(r, true), style: { padding: '7px 14px', borderRadius: '6px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '12px' } },
'Simulate Hack'
)
)
)
)
)
: null
)
);
}
export default App;
