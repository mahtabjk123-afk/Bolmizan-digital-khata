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

const shopClock = new HybridLogicalClock('NODE-SAKRAND-MAIN');
const crdtLedger = new SovereignCrdtLedger();
const MERCHANT_SECRET = 'bolmizan-sovereign-hardware-enclave-2026';

export const BolMizanOmegaCommand: React.FC = () => {
  const [cropName, setCropName] = useState('Sakrand Super Basmati');
  const [weightKg, setWeightKg] = useState(800);
  const [ratePerMannPkr, setRatePerMannPkr] = useState(4000);
  const [irrigation, setIrrigation] = useState<'NEHRI_IRRIGATED' | 'BARANI_RAINFED'>('NEHRI_IRRIGATED');
  const [externalRef, setExternalRef] = useState('RAAST-2026-88412');

  const [receipts, setReceipts] = useState<SignedReceiptArtifact[]>([]);
  const [statusBanner, setStatusBanner] = useState<string>('System Armed: Zero-Loophole Omega Core Active');
  const [isError, setIsError] = useState(false);

  const [smsInput, setSmsInput] = useState(
    '8171 Benazir BISP inaam 25000 manzoor, foran apna MPIN code bhejein'
  );
  const [smsSender, setSmsSender] = useState('+923001234567');
  const [scamResult, setScamResult] = useState<ThreatAssessment | null>(null);

  const handleIssueSovereignParchi = async () => {
    try {
      setIsError(false);
      const parchi = calculateMandiParchi({
        cropName,
        weightKg,
        ratePer40KgPaisa: Math.round(ratePerMannPkr * 100),
        kardaBasisPoints: 200,
        arhtiCommissionBps: 300,
        laborHamaliPaisa: 50000,
      });

      const ushr = calculateHarvestUshr({
        harvestWeightKg: weightKg,
        netHarvestValuePaisa: parchi.farmerNetPayoutPaisa,
        irrigationType: irrigation,
      });

      const history = receipts.map((r) => r.payload.amountPaisa);
      const anomaly = detectAmountAnomaly(parchi.farmerNetPayoutPaisa, history);
      if (anomaly.verdict === 'SUSPICIOUS') {
        setIsError(true);
        setStatusBanner(`ANOMALY WARNING: ${anomaly.reasons}`);
        return;
      }

      const prevHash = receipts.length > 0 ? receipts.merkleLeafHash : '0'.repeat(64);
      const signed = await createSovereignReceipt(
        {
          receiptId: `RCP-${Date.now().toString().slice(-6)}`,
          tenantId: 'TENANT-SAKRAND-MANDI',
          merchantName: 'Al-Mizan Grain & Sabzi Traders',
          counterparty: `${cropName} (${weightKg}kg) | Ushr: PKR ${(ushr.ushrAmountPaisa / 100).toFixed(2)}`,
          amountPaisa: parchi.farmerNetPayoutPaisa,
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
        accountId: 'FARMER-POOL',
        deltaPaisa: signed.payload.amountPaisa,
        note: signed.payload.counterparty,
        hlc: shopClock.now(),
        receiptHash: signed.merkleLeafHash,
      });

      setReceipts([signed, ...receipts]);
      setExternalRef(`RAAST-2026-${Math.floor(10000 + Math.random() * 90000)}`);
      setStatusBanner(
        `VERIFIED & LOCKED: Payout PKR ${(parchi.farmerNetPayoutPaisa / 100).toLocaleString()} | Ushr: PKR ${(
          ushr.ushrAmountPaisa / 100
        ).toLocaleString()} | Verify Code: ${signed.shortVerifyCode}`
      );
    } catch (err: any) {
      setIsError(true);
      setStatusBanner(err.message || 'Security Block Triggered');
    }
  };

  const handleVerifyArtifact = async (artifact: SignedReceiptArtifact, simulateTamper = false) => {
    const target = simulateTamper
      ? { ...artifact, payload: { ...artifact.payload, amountPaisa: artifact.payload.amountPaisa + 500000 } }
      : artifact;
    const res = await verifySovereignReceipt(target, MERCHANT_SECRET);
    setIsError(!res.valid);
    setStatusBanner(
      res.valid
        ? `CRYPTO PROOF VALID: Receipt ${artifact.payload.receiptId} is 100% authentic & untampered.`
        : `${res.reason}`
    );
  };

  const handleRunScamCheck = () => {
    setScamResult(analyzeMessageForScam(smsInput, smsSender));
  };

  const totalCrdtBalancePkr = crdtLedger.getAccountBalancePaisa('TENANT-SAKRAND-MANDI', 'FARMER-POOL') / 100;

  return (
    <div style={{ padding: '20px', maxWidth: '960px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', color: '#f8fafc', backgroundColor: '#0f172a', borderRadius: '12px' }}>
      <h2 style={{ borderBottom: '1px solid #334155', paddingBottom: '10px', marginTop: 0 }}>
        BolMizan Omega Command — Zero-Loophole Execution Engine
      </h2>

      <div
        style={{
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: isError ? '#7f1d1d' : '#064e3b',
          border: `1px solid ${isError ? '#ef4444' : '#10b981'}`,
          fontWeight: 600,
        }}
      >
        {statusBanner}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>1. Tamper-Proof Mandi Parchi & Ushr</h3>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
            Crop / Commodity:
            <input
              value={cropName}
              onChange={(e) => setCropName(e.target.value)}
              style={{ width: '100%', padding: '6px', marginTop: '4px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }}
            />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
            <label style={{ fontSize: '13px' }}>
              Weight (Kg):
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                style={{ width: '100%', padding: '6px', marginTop: '4px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }}
              />
            </label>
            <label style={{ fontSize: '13px' }}>
              Rate / 40Kg (PKR):
              <input
                type="number"
                value={ratePerMannPkr}
                onChange={(e) => setRatePerMannPkr(Number(e.target.value))}
                style={{ width: '100%', padding: '6px', marginTop: '4px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }}
              />
            </label>
          </div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
            Land Irrigation (Ushr Rule):
            <select
              value={irrigation}
              onChange={(e) => setIrrigation(e.target.value as any)}
              style={{ width: '100%', padding: '6px', marginTop: '4px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }}
            >
              <option value="NEHRI_IRRIGATED">Nehri / Canal (5% Ushr)</option>
              <option value="BARANI_RAINFED">Barani / Rain-Fed (10% Ushr)</option>
            </select>
          </label>
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '13px' }}>
            Raast / EasyPaisa Ref ID (Anti-Replay Checked):
            <input
              value={externalRef}
              onChange={(e) => setExternalRef(e.target.value)}
              style={{ width: '100%', padding: '6px', marginTop: '4px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }}
            />
          </label>
          <button
            onClick={handleIssueSovereignParchi}
            style={{ width: '100%', padding: '10px', backgroundColor: '#10b981', color: '#064e3b', fontWeight: 700, border: 'none', borderRadius: '6px', cursor: 'pointer' }}
          >
            Sign & Commit Offline CRDT Parchi
          </button>
        </div>

        <div style={{ backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px' }}>
          <h3 style={{ marginTop: 0 }}>2. Live Adversarial Scam Shield</h3>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>
            Sender Number / ID:
            <input
              value={smsSender}
              onChange={(e) => setSmsSender(e.target.value)}
              style={{ width: '100%', padding: '6px', marginTop: '4px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }}
            />
          </label>
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '13px' }}>
            Incoming SMS / WhatsApp Payment Claim:
            <textarea
              rows={3}
              value={smsInput}
              onChange={(e) => setSmsInput(e.target.value)}
              style={{ width: '100%', padding: '6px', marginTop: '4px', borderRadius: '4px', border: '1px solid #475569', backgroundColor: '#0f172a', color: '#fff' }}
            />
          </label>
          <button
            onClick={handleRunScamCheck}
            style={{ width: '100%', padding: '10px', backgroundColor: '#f59e0b', color: '#451a03', fontWeight: 700, border: 'none', borderRadius: '6px', cursor: 'pointer' }}
Use code with caution.
>
Scan Message for Fraud

{scamResult && (
<div style={{ marginTop: '12px', padding: '10px', borderRadius: '6px', backgroundColor: '#0f172a', fontSize: '13px' }}>
Verdict: {scamResult.verdict} (Risk: {scamResult.riskScore}/100)
<ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
{scamResult.reasons.map((r, idx) => (
{r}
))}


)}

<div style={{ marginTop: '20px', backgroundColor: '#1e293b', padding: '16px', borderRadius: '8px' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
<h3 style={{ margin: 0 }}>3. Immutable CRDT Offline Ledger ({receipts.length} Entries)
<span style={{ fontWeight: 700, color: '#34d399' }}>
Converged CRDT Pool: PKR {totalCrdtBalancePkr.toLocaleString()}

{receipts.length === 0 ? (
<p style={{ color: '#94a3b8', fontSize: '13px' }}>
Issue a Mandi Parchi above to generate a cryptographic receipt and test live tamper detection.

) : (
<div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
{receipts.map((r) => (
<div
key={r.payload.receiptId}
style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#0f172a', borderRadius: '6px', fontSize: '13px' }}
>

{r.payload.receiptId} — {r.payload.counterparty} |{' '}
<span style={{ color: '#34d399' }}>PKR {(r.payload.amountPaisa / 100).toLocaleString()}
<div style={{ color: '#64748b', fontSize: '11px' }}>
Hash: {r.merkleLeafHash.slice(0, 24)}... | Short Code: {r.shortVerifyCode}


<div style={{ display: 'flex', gap: '8px' }}>
<button
onClick={() => handleVerifyArtifact(r, false)}
style={{ padding: '6px 10px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
>
Verify Real

<button
onClick={() => handleVerifyArtifact(r, true)}
style={{ padding: '6px 10px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
>
Simulate Hack



))}

)}


);
};
export default BolMizanOmegaCommand;
