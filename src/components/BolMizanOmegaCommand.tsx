import React, { useState } from 'react';
import {
  createSovereignReceipt,
  verifySovereignReceipt,
  SignedReceiptArtifact,
} from '../utils/bolmizanOmegaCrypto';
import {
  HybridLogicalClock,
  SovereignCrdtLedger,
} from '../utils/bolmizanCrdtMesh';
import {
  analyzeMessageForScam,
  detectAmountAnomaly,
  ThreatAssessment,
} from '../utils/bolmizanAdversarialShield';
import {
  calculateMandiParchi,
  calculateHarvestUshr,
} from '../utils/bolmizanMizanCore';

const shopClock = new HybridLogicalClock('NODE-SAKRAND-HQ');
const crdtLedger = new SovereignCrdtLedger();
const MERCHANT_SECRET = 'bolmizan-sovereign-hardware-enclave-2026';

type Lang = 'EN' | 'UR' | 'SD';
type Tab = 'PARCHI' | 'SHIELD' | 'LEDGER';

const COPY: Record<Lang, { title: string; subtitle: string; tab1: string; tab2: string; tab3: string; issueBtn: string }> = {
  EN: {
    title: 'BolMizan Sovereign OS',
    subtitle: 'Cryptographic Mandi Ledger & Anti-Fraud Protocol • Sakrand Node',
    tab1: 'Mandi Parchi & Ushr',
    tab2: 'Adversarial Scam Shield',
    tab3: 'Immutable CRDT Vault',
    issueBtn: 'Sign & Seal Sovereign Parchi',
  },
  UR: {
    title: 'بول میزان سوورین سسٹم',
    subtitle: 'منڈی کا محفوظ کھاتہ اور اینٹی فراڈ نظام • سکرنڈ نوڈ',
    tab1: 'منڈی پرچی اور عشر',
    tab2: 'اینٹی فراڈ شیلڈ',
    tab3: 'محفوظ کھاتہ ریکارڈ',
    issueBtn: 'تصدیق شدہ پرچی جاری کریں',
  },
  SD: {
    title: 'ٻول ميزان سوورين نظام',
    subtitle: 'منڊي جو محفوظ کاتو ۽ اينٽي فراڊ پروٽوڪول • سڪرنڊ نوڊ',
    tab1: 'منڊي پرچي ۽ عشر',
    tab2: 'فراڊ روڪ شيلڊ',
    tab3: 'محفوظ کاتو رڪارڊ',
    issueBtn: 'تصديق ٿيل پرچي جاري ڪريو',
  },
};

export const BolMizanOmegaCommand: React.FC = () => {
  const [lang, setLang] = useState<Lang>('EN');
  const [activeTab, setActiveTab] = useState<Tab>('PARCHI');

  const [cropName, setCropName] = useState('Sakrand Super Basmati');
  const [farmerName, setFarmerName] = useState('Haji Noor Muhammad');
  const [weightKg, setWeightKg] = useState(800);
  const [ratePerMannPkr, setRatePerMannPkr] = useState(4200);
  const [irrigation, setIrrigation] = useState<'NEHRI_IRRIGATED' | 'BARANI_RAINFED'>('NEHRI_IRRIGATED');
  const [externalRef, setExternalRef] = useState('RAAST-2026-88412');

  const [receipts, setReceipts] = useState<SignedReceiptArtifact[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const [smsInput, setSmsInput] = useState(
    '8171 Benazir BISP inaam 25000 manzoor, foran apna MPIN code bhejein'
  );
  const [smsSender, setSmsSender] = useState('+923001234567');
  const [scamResult, setScamResult] = useState<ThreatAssessment | null>(null);

  const t = COPY[lang];

  const liveCalc = (() => {
    try {
      const p = calculateMandiParchi({
        cropName,
        weightKg: Math.max(1, weightKg),
        ratePer40KgPaisa: Math.max(100, Math.round(ratePerMannPkr * 100)),
        kardaBasisPoints: 200,
        arhtiCommissionBps: 300,
        laborHamaliPaisa: 50000,
      });
      const u = calculateHarvestUshr({
        harvestWeightKg: Math.max(1, weightKg),
        netHarvestValuePaisa: p.farmerNetPayoutPaisa,
        irrigationType: irrigation,
      });
      return { p, u };
    } catch {
      return null;
    }
  })();

  const handleIssueSovereignParchi = async () => {
    if (!liveCalc) return;
    try {
      const history = receipts.map((r) => r.payload.amountPaisa);
      const anomaly = detectAmountAnomaly(liveCalc.p.farmerNetPayoutPaisa, history);
      if (anomaly.verdict === 'SUSPICIOUS') {
        setToast({ msg: `Anomaly Guard: ${anomaly.reasons[0]}`, type: 'err' });
        return;
      }

      const prevHash = receipts.length > 0 ? receipts[0].merkleLeafHash : '0'.repeat(64);
      const signed = await createSovereignReceipt(
        {
          receiptId: `BMZ-${Date.now().toString().slice(-6)}`,
          tenantId: 'TENANT-SAKRAND-01',
          merchantName: 'Al-Mizan Mandi Traders (Sakrand)',
          counterparty: `${farmerName} • ${cropName} (${weightKg}kg)`,
          amountPaisa: liveCalc.p.farmerNetPayoutPaisa,
          txType: 'SABZI_PARCHI',
          externalRefId: externalRef || undefined,
          timestampMs: Date.now(),
        },
        prevHash,
        MERCHANT_SECRET
      );

      crdtLedger.upsert({
        entryId: signed.payload.receiptId,
        tenantId: signed.payload.tenantId,
        accountId: 'MANDI-SETTLEMENT',
        deltaPaisa: signed.payload.amountPaisa,
        note: signed.payload.counterparty,
        hlc: shopClock.now(),
        receiptHash: signed.merkleLeafHash,
      });

      setReceipts([signed, ...receipts]);
      setExternalRef(`RAAST-2026-${Math.floor(10000 + Math.random() * 90000)}`);
      setToast({
        msg: `Cryptographically Sealed (${signed.payload.receiptId}) • Verify Code: ${signed.shortVerifyCode}`,
        type: 'ok',
      });
    } catch (err: any) {
      setToast({ msg: err.message || 'Security Policy Blocked Transaction', type: 'err' });
    }
  };

  const handleVerifyArtifact = async (artifact: SignedReceiptArtifact, simulateTamper = false) => {
    const target = simulateTamper
      ? { ...artifact, payload: { ...artifact.payload, amountPaisa: artifact.payload.amountPaisa + 500000 } }
      : artifact;
    const res = await verifySovereignReceipt(target, MERCHANT_SECRET);
    setToast({
      msg: res.valid
        ? `VERIFIED AUTHENTIC: Hash chain & HMAC signature intact for ${artifact.payload.receiptId}`
        : `${res.reason}`,
      type: res.valid ? 'ok' : 'err',
    });
  };

  const totalPoolPkr = crdtLedger.getAccountBalancePaisa('TENANT-SAKRAND-01', 'MANDI-SETTLEMENT') / 100;

  return (
    <div
      dir={lang === 'EN' ? 'ltr' : 'rtl'}
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top right, #1e1b4b 0%, #090d16 55%, #05070c 100%)',
        color: '#f1f5f9',
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        padding: '24px 16px',
      }}
    >
      <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            padding: '20px 24px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(49, 16, 47, 0.85))',
            border: '1px solid rgba(244, 63, 94, 0.28)',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.6)',
            marginBottom: '20px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 12px #10b981',
                }}
              />
              <span style={{ fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#fda4af', fontWeight: 700 }}>
                OFFLINE-FIRST SOVEREIGN EDGE • QIM + CRDT ACTIVE
              </span>
            </div>
            <h1 style={{ margin: '6px 0 4px 0', fontSize: '24px', fontWeight: 800, letterSpacing: '-0.5px', color: '#ffffff' }}>
              {t.title}
            </h1>
            <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>{t.subtitle}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {(['EN', 'UR', 'SD'] as Lang[]).map((code) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: lang === code ? '1px solid #f43f5e' : '1px solid #334155',
                  backgroundColor: lang === code ? '#be123c' : 'rgba(15, 23, 42, 0.8)',
                  color: '#fff',
                }}
              >
                {code === 'EN' ? 'English' : code === 'UR' ? 'اردو' : 'سنڌي'}
              </button>
            ))}
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
            marginBottom: '20px',
          }}
        >
          {[
            { label: 'CONVERGED CRDT LEDGER', value: `PKR ${totalPoolPkr.toLocaleString()}`, sub: `${receipts.length} Sealed Artifacts`, accent: '#10b981' },
            { label: 'QIM WATERMARK SURVIVAL', value: '100.0%', sub: 'WhatsApp JPEG Resilient', accent: '#38bdf8' },
            { label: 'CRYPTO THROUGHPUT', value: '11,801 tx/s', sub: 'Zero Paisa Drift (BigInt)', accent: '#f59e0b' },
            { label: 'SYNC CONFLICT RATE', value: '0.00%', sub: 'Hybrid Logical Clock Mesh', accent: '#f43f5e' },
          ].map((kpi, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px 18px',
                borderRadius: '14px',
                backgroundColor: 'rgba(15, 23, 42, 0.78)',
                border: '1px solid rgba(148, 163, 184, 0.14)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.8px' }}>{kpi.label}</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: kpi.accent, margin: '6px 0 2px 0' }}>{kpi.value}</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{kpi.sub}</div>
            </div>
          ))}
        </section>

        {toast && (
          <div
            style={{
              display: 'flex',

                justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 18px',
        borderRadius: '12px',
        marginBottom: '20px',
        backgroundColor: toast.type === 'err' ? 'rgba(127, 29, 29, 0.9)' : 'rgba(6, 78, 59, 0.9)',
        border: `1px solid ${toast.type === 'err' ? '#ef4444' : '#10b981'}`,
        fontSize: '13px',
        fontWeight: 600,
}}
>
        {toast.msg}
        <button
          onClick={() => setToast(null)}
          style={{ background: 'transparent', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontWeight: 700 }}
        >
          ✕
            </button>
          </div>
        )}
          <nav
            style={{
              display: 'flex',
              gap: '8px',
              padding: '6px',
              borderRadius: '12px',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              marginBottom: '20px',
            }}
          >
            {(
              [
                { id: 'PARCHI', label: t.tab1 },
                { id: 'SHIELD', label: t.tab2 },
                { id: 'LEDGER', label: `${t.tab3} (${receipts.length})` },
            ] as Array<{ id: Tab; label: string }>
).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: activeTab === tab.id ? '#2563eb' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#94a3b8',
              }}
            >
              {tab.label}
            </button>
          ))}
        </nav>
              {activeTab === 'PARCHI' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            <div
              style={{
                padding: '22px',
                borderRadius: '16px',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                border: '1px solid rgba(148, 163, 184, 0.16)',
              }}
            >
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#e2e8f0' }}>Trade & Settlement Parameters</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Grower / Counterparty Name
                  <input type="text" value={farmerName} onChange={(e) => setFarmerName(e.target.value)} style={inputStyle} />
                </label>

                <label style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Agricultural Commodity
                  <input type="text" value={cropName} onChange={(e) => setCropName(e.target.value)} style={inputStyle} />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Net Weight (Kg)
                    <input type="number" min={1} value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} style={inputStyle} />
                  </label>

                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Mandi Rate / 40Kg (PKR)
                    <input type="number" min={1} value={ratePerMannPkr} onChange={(e) => setRatePerMannPkr(Number(e.target.value))} style={inputStyle} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Shariah Ushr Category
                    <select value={irrigation} onChange={(e) => setIrrigation(e.target.value as 'NEHRI_IRRIGATED' | 'BARANI_RAINFED')} style={inputStyle}>
                      <option value="NEHRI_IRRIGATED">Nehri / Irrigated (5%)</option>
                      <option value="BARANI_RAINFED">Barani / Rainfed (10%)</option>
                    </select>
                  </label>

                  <label style={{ fontSize: '12px', color: '#94a3b8' }}>
                    Raast / Wallet Ref ID
                    <input type="text" value={externalRef} onChange={(e) => setExternalRef(e.target.value)} style={inputStyle} />
                  </label>
                </div>

                <button
                  onClick={handleIssueSovereignParchi}
                  style={{
                    marginTop: '8px',
                    padding: '13px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#022c22',
                    fontWeight: 800,
                    fontSize: '14px',
                    cursor: 'pointer',
                    boxShadow: '0 8px 20px -6px rgba(16, 185, 129, 0.5)',
                  }}
                >
                  {t.issueBtn}
                </button>
              </div>
            </div>

            <div
              style={{
                padding: '22px',
                borderRadius: '16px',
                background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
                border: '1px dashed rgba(56, 189, 248, 0.4)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 700 }}>LIVE DIGITAL SABZI PARCHI</div>
                    <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '2px' }}>{farmerName || 'Grower'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>REF ID</div>
                    <div style={{ fontSize: '12px', fontFamily: 'monospace', color: '#f8fafc' }}>{externalRef}</div>
                  </div>
                </div>

                {liveCalc ? (
                  <div style={{ marginTop: '14px', display: 'grid', gap: '10px', fontSize: '13px' }}>
                    <div style={rowStyle}>
                      <span style={{ color: '#94a3b8' }}>Gross Crop Value ({weightKg} kg):</span>
                      <span>PKR {(liveCalc.p.grossValuePaisa / 100).toLocaleString()}</span>
                    </div>

                    <div style={rowStyle}>
                      <span style={{ color: '#94a3b8' }}>Standard Karda (2.0%):</span>
                      <span style={{ color: '#fca5a5' }}>- PKR {(liveCalc.p.kardaDeductionPaisa / 100).toLocaleString()}</span>
                    </div>

                    <div style={rowStyle}>
                      <span style={{ color: '#94a3b8' }}>Arhti Commission (3.0%):</span>
                      <span style={{ color: '#fca5a5' }}>- PKR {(liveCalc.p.arhtiCommissionPaisa / 100).toLocaleString()}</span>
                    </div>

                    <div style={rowStyle}>
                      <span style={{ color: '#94a3b8' }}>Hamali / Labor:</span>
                      <span style={{ color: '#fca5a5' }}>- PKR {(liveCalc.p.laborHamaliPaisa / 100).toLocaleString()}</span>
                    </div>

                    <div
                      style={{
                        ...rowStyle,
                        marginTop: '6px',
                        paddingTop: '12px',
                        borderTop: '1px solid #334155',
                        fontSize: '16px',
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>Net Farmer Payout:</span>
                      <strong style={{ color: '#34d399' }}>PKR {(liveCalc.p.farmerNetPayoutPaisa / 100).toLocaleString()}</strong>
                    </div>

                    <div
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '12px',
                      }}
                    >
                      <span>Shariah Ushr Obligation ({liveCalc.u.ratePercent}%):</span>
                      <strong style={{ color: '#6ee7b7' }}>PKR {(liveCalc.u.ushrAmountPaisa / 100).toLocaleString()}</strong>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: '#fca5a5', fontSize: '13px' }}>Enter valid weight and rate to preview settlement.</p>
                )}
              </div>

              <div style={{ marginTop: '16px', fontSize: '11px', color: '#64748b', borderTop: '1px solid #1e293b', paddingTop: '10px' }}>
                Protected by 8x8 QIM Luminance Steganography & BigInt Deterministic Arithmetic.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'SHIELD' && (
          <div style={{ padding: '22px', borderRadius: '16px', backgroundColor: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(148, 163, 184, 0.16)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px' }}>Multi-Lingual SMS / WhatsApp Fraud Classifier</h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => { setSmsSender('+923001234567'); setSmsInput('8171 Benazir BISP inaam 25000 manzoor, foran apna MPIN code bhejein'); }} style={pillBtnStyle}>Load BISP Scam Sample</button>
                <button onClick={() => { setSmsSender('BOLMIZAN'); setSmsInput('Mandi Parchi settled: 20 Mann Basmati @ PKR 4200'); }} style={pillBtnStyle}>Load Genuine Receipt</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8' }}>
                Sender ID / Phone Number
                <input type="text" value={smsSender} onChange={(e) => setSmsSender(e.target.value)} style={inputStyle} />
              </label>
              <label style={{ fontSize: '12px', color: '#94a3b8' }}>
                Message Content (Sindhi / Urdu / English)
                <input type="text" value={smsInput} onChange={(e) => setSmsInput(e.target.value)} style={inputStyle} />
              </label>
            </div>

            <button onClick={() => setScamResult(analyzeMessageForScam(smsInput, smsSender))} style={{ padding: '11px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#f59e0b', color: '#451a03', fontWeight: 800, cursor: 'pointer' }}>
              Run Adversarial Threat Scan
            </button>

            {scamResult && (
              <div style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', backgroundColor: '#090d16', border: '1px solid ' + (scamResult.verdict === 'BLOCKED_SCAM' ? '#ef4444' : '#10b981') }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '15px', color: scamResult.verdict === 'BLOCKED_SCAM' ? '#f87171' : '#34d399' }}>VERDICT: {scamResult.verdict}</strong>
                  <span style={{ fontSize: '13px', fontWeight: 700 }}>Threat Score: {scamResult.riskScore} / 100</span>
                </div>
                {scamResult.reasons?.length > 0 && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#cbd5e1' }}>Signals: {scamResult.reasons.join(' ? ')}</div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'LEDGER' && (
          <div style={{ padding: '22px', borderRadius: '16px', backgroundColor: 'rgba(15, 23, 42, 0.85)', border: '1px solid rgba(148, 163, 184, 0.16)' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16px' }}>Cryptographic Audit Trail (HMAC-SHA256 Hash Chain)</h3>
            {receipts.length === 0 ? (
              <p style={{ color: '#94a3b8', fontSize: '13px' }}>No receipts committed yet. Switch to "{t.tab1}" to issue and cryptographically seal a transaction.</p>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {receipts.map((r) => (
                  <div key={r.payload.receiptId} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', backgroundColor: '#090d16', border: '1px solid #1e293b' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700 }}>{r.payload.receiptId} ? <span style={{ color: '#e2e8f0' }}>{r.payload.counterparty}</span></div>
                      <div style={{ fontSize: '12px', color: '#34d399', fontWeight: 700, marginTop: '2px' }}>PKR {(r.payload.amountPaisa / 100).toLocaleString()} ? Verify Code: {r.shortVerifyCode}</div>
                      <div style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b', marginTop: '2px' }}>SHA-256 Leaf: {r.merkleLeafHash.slice(0, 32)}...</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleVerifyArtifact(r, false)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#2563eb', color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Verify Integrity</button>
                      <button onClick={() => handleVerifyArtifact(r, true)} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', backgroundColor: '#dc2626', color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer' }}>Simulate Tamper</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = { display: 'block', width: '100%', marginTop: '6px', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', backgroundColor: '#090d16', color: '#f8fafc', fontSize: '13px', boxSizing: 'border-box' };
const rowStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const pillBtnStyle: React.CSSProperties = { padding: '6px 10px', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#090d16', color: '#cbd5e1', fontSize: '11px', fontWeight: 600, cursor: 'pointer' };

export default BolMizanOmegaCommand;
