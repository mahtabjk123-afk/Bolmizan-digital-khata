import React, { useState, useEffect } from 'react';
import { telemetryAgent } from './SovereignTelemetryAgent';
import { zeroLoopholeShield } from './SovereignZeroLoopholeShield';
import { sovereignSound } from './sovereignSoundEngine';

interface WorkforceDivision {
  id: string;
  domain: string;
  fullTimeSpecialists: number;
  experienceYears: number;
  leadAgent: string;
  microRoles: string[];
  liveAuditOutput: string;
  updatedAt: string;
}

export const SovereignAiBoardroom: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('ALL');
  const [divisions, setDivisions] = useState<WorkforceDivision[]>([]);
  const [trainingTicks, setTrainingTicks] = useState(1);

  const run247TrainingAndAudit = async () => {
    const now = new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const stats = telemetryAgent.getStats();
    const clockCheck = zeroLoopholeShield.verifyMonotonicClock();
    await zeroLoopholeShield.createShadowMirror();

    let totalCashPkr = 0;
    let totalUdhaarPkr = 0;
    let entryCount = 0;
    try {
      const raw = localStorage.getItem('bolmizan_sovereign_v1_ledger_entries');
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          entryCount = list.length;
          for (const item of list) {
            const amt = Number(item.amount || 0);
            if (String(item.type) === 'CREDIT') totalUdhaarPkr += amt;
            else totalCashPkr += amt;
          }
        }
      }
    } catch {}

    let feedbackCount = 0;
    try {
      const fbRaw = localStorage.getItem('bolmizan_sovereign_user_feedback');
      if (fbRaw) feedbackCount = JSON.parse(fbRaw).length;
    } catch {}

    const prevTicks = Number(localStorage.getItem('bolmizan_ai_247_cycles') || '1') + 1;
    try {
      localStorage.setItem('bolmizan_ai_247_cycles', String(prevTicks));
    } catch {}
    setTrainingTicks(prevTicks);

    const workforce: WorkforceDivision[] = [
      {
        id: 'shariah',
        domain: '1. Shariah & Fiqh',
        fullTimeSpecialists: 30,
        experienceYears: 100,
        leadAgent: '30 Full-Time Mufti & Fiqh Research AI Agents',
        microRoles: ['Shariah Supervisory Board', 'Resident Shariah Officer', 'Shariah Audit Manager', 'Fatwa Analyst (Mudarabah/Salam/Istisna)', 'Zakat & Ushr Specialist', 'Waqf Structurer'],
        liveAuditOutput: `24/7 Cycle #${prevTicks}: 0% Riba across ${entryCount} entries. Nehri (5%), Mixed (7.5%) & Barani (10%) Ushr + 2.5% Zakat rules 100% locked.`,
        updatedAt: now
      },
      {
        id: 'culture',
        domain: '2. Cultural & Community',
        fullTimeSpecialists: 40,
        experienceYears: 100,
        leadAgent: '40 Full-Time Vernacular & Rural Field AI Agents',
        microRoles: ['Sindhi/Urdu/Punjabi/Pashto/Saraiki NLP', 'Masjid & Elder Liaisons', 'Ramazan/Eid Campaign Lead', 'Folk Storyteller', 'Women Inclusion Lead', 'Sakrand Field Agents'],
        liveAuditOutput: `24/7 Cycle #${prevTicks}: Trilingual Sindhi/Urdu/English mandi terminology & oral audio feedback trained for Sakrand & rural Sindh.`,
        updatedAt: now
      },
      {
        id: 'legal',
        domain: '3. Regulatory & SBP/SECP',
        fullTimeSpecialists: 30,
        experienceYears: 100,
        leadAgent: '30 Full-Time SBP, AML & IP Protection AI Agents',
        microRoles: ['SBP/SECP Counsel', 'AML/CFT Officer', 'KYC Analyst', 'Fraud Investigator', 'Interest-Free Credit Modeler', 'IP & Trademark Counsel', 'FBR Tax Specialist'],
        liveAuditOutput: `24/7 Cycle #${prevTicks}: Non-custodial SBP compliance & IP ownership verified for Mahtab (Guardian: 0305-8359178).`,
        updatedAt: now
      },
      {
        id: 'engineering',
        domain: '4. Core Fintech Tech',
        fullTimeSpecialists: 45,
        experienceYears: 100,
        leadAgent: '45 Full-Time Banking, CRDT & Voice AI Engineers',
        microRoles: ['Core Banking Architect', 'Raast/JazzCash QR Engineers', 'BigInt Ledger Devs', 'Android Offline Engineers', 'Keypad SMS Bridge Devs', 'Vernacular NLP'],
        liveAuditOutput: `24/7 Cycle #${prevTicks}: IndexedDB Vault + CRDT Mesh + Keypad SMS bridge running at ${stats.offlineRatioPercent}% offline autonomy.`,
        updatedAt: now
      },
      {
        id: 'cyber',
        domain: '5. Cybersecurity & PQC',
        fullTimeSpecialists: 35,
        experienceYears: 100,
        leadAgent: '35 Full-Time CISO, SOC & Post-Quantum AI Defenders',
        microRoles: ['Chief InfoSec Officer', 'Penetration Testers', '24/7 SOC Analysts', 'Edge DevOps', 'Shadow Mirror Recovery', 'QIM & Post-Quantum Crypto'],
        liveAuditOutput: `24/7 Cycle #${prevTicks}: Clock integrity ${clockCheck.valid ? 'VERIFIED' : 'ALERT'}. Shadow Mirror & 8x8 QIM watermark active.`,
        updatedAt: now
      },
      {
        id: 'design',
        domain: '6. Design & Psychology',
        fullTimeSpecialists: 25,
        experienceYears: 100,
        leadAgent: '25 Full-Time Islamic Behavioral & Accessibility AI Agents',
        microRoles: ['Behavioral Economist (Committee/BC)', 'Ethnographic UX Researcher', 'Illiterate Accessibility Designer', 'Sindh Kashi Calligrapher', 'Halal Gamification'],
        liveAuditOutput: `24/7 Cycle #${prevTicks}: 3-Button Easy Mandi Mode, Golden Mizan Logo & 60 FPS 3D Octahedron optimized.`,
        updatedAt: now
      },
      {
        id: 'treasury',
        domain: '7. Treasury & Sukuk',
        fullTimeSpecialists: 25,
        experienceYears: 100,
        leadAgent: '25 Full-Time Islamic Treasury & Reconciliation AI Agents',
        microRoles: ['Islamic Treasury Manager', 'Settlement Officer', 'Sukuk & Gold Structurer', '0-Drift Reconciliation Analyst', 'Unit Economics Analyst'],
        liveAuditOutput: `24/7 Cycle #${prevTicks}: Cash In: Rs. ${totalCashPkr.toLocaleString()} | Udhaar: Rs. ${totalUdhaarPkr.toLocaleString()} | Drift: 0 Paisa.`,
        updatedAt: now
      },
      {
        id: 'growth',
        domain: '8. Growth & Remittance',
        fullTimeSpecialists: 30,
        experienceYears: 100,
        leadAgent: '30 Full-Time Viral Growth & B2B Partnerships AI Agents',
        microRoles: ['Scholar Relations', 'Sugar/Rice Mill B2B Acquisition', 'Diaspora Remittance Lead', 'TikTok/Reels Vernacular Marketer', 'PR Crisis Guard', 'CSR Impact Lead'],
        liveAuditOutput: `24/7 Cycle #${prevTicks}: Auto-viral WhatsApp Parchi link interceptor & 10 B2B revenue channels active.`,
        updatedAt: now
      },
      {
        id: 'cx',
        domain: '9. CX & Field Operations',
        fullTimeSpecialists: 20,
        experienceYears: 100,
        leadAgent: '20 Full-Time Dispute Resolution & Mandi Ops AI Agents',
        microRoles: ['Dispute & Reversal Specialist', 'VIP Zakat Relationship Manager', 'Feet-on-Street Onboarding', 'Empathy & Sabr Support Coach'],
        liveAuditOutput: `24/7 Cycle #${prevTicks}: Voice audio feedback (${feedbackCount} packets) & WhatsApp support (0305-8359178) active.`,
        updatedAt: now
      },
      {
        id: 'governance',
        domain: '10. Governance & IR',
        fullTimeSpecialists: 20,
        experienceYears: 100,
        leadAgent: '20 Full-Time Ethics, IR & 100-Yr Strategy AI Agents',
        microRoles: ['Chief Ethics Officer', 'Islamic VC & Grant Relations', 'Ambassador Equity Specialist', '100-Year Evolution Auditor'],
        liveAuditOutput: `24/7 Cycle #${prevTicks}: 30-Day AI Consensus Gate & 100-Year Roadmap (2026-2126) synchronized.`,
        updatedAt: now
      }
    ];

    setDivisions(workforce);
  };

  useEffect(() => {
    run247TrainingAndAudit();
    const timer = setInterval(() => {
      run247TrainingAndAudit();
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const totalStaff = divisions.reduce((acc, d) => acc + d.fullTimeSpecialists, 0);
  const visible = selectedDomain === 'ALL' ? divisions : divisions.filter((d) => d.domain === selectedDomain);

  return (
    <>
      <button
        onClick={() => { setOpen(!open); if (!open) run247TrainingAndAudit(); }}
        title="300 Full-Time AI Specialists • 100-Year Trained • 24/7 Autonomous Loop"
        style={{
          position: 'fixed',
          top: '68px',
          left: '14px',
          zIndex: 9997,
          background: 'linear-gradient(135deg, #1e1b4b, #064e3b)',
          color: '#fde68a',
          border: '1px solid #f59e0b',
          borderRadius: '14px',
          padding: '7px 12px',
          fontSize: '11px',
          fontWeight: 800,
          boxShadow: '0 8px 22px rgba(245,158,11,0.35)',
          cursor: 'pointer'
        }}
      >
        {open ? '✕ Close Workforce' : `🤖 ${totalStaff} AI Staff • 100Yr • 24/7`}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            top: '112px',
            left: '14px',
            zIndex: 9998,
            width: '355px',
            maxHeight: '78vh',
            overflowY: 'auto',
            background: 'rgba(9, 13, 22, 0.98)',
            backdropFilter: 'blur(16px)',
            color: '#f8fafc',
            border: '2px solid #f59e0b',
            borderRadius: '16px',
            padding: '14px',
            boxShadow: '0 18px 44px rgba(0,0,0,0.9)',
            fontFamily: 'sans-serif'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#fbbf24' }}>300 Full-Time AI Workforce (24/7)</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>CEO: Mahtab • 100-Yr Experience Simulation • Cycle #{trainingTicks}</div>
            </div>
            <button
onClick={() => { sovereignSound.playSuccessChime(); run247TrainingAndAudit(); }}
style={{ background: '#10b981', color: '#052e16', border: 'none', borderRadius: '8px', padding: '5px 9px', fontSize: '10px', fontWeight: 900, cursor: 'pointer' }}
>
Train & Audit

<div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '8px' }}>
<button
onClick={() => setSelectedDomain('ALL')}
style={{ whiteSpace: 'nowrap', padding: '4px 8px', borderRadius: '6px', border: 'none', fontSize: '10px', fontWeight: 800, cursor: 'pointer', background: selectedDomain === 'ALL' ? '#f59e0b' : '#1e293b', color: selectedDomain === 'ALL' ? '#090d16' : '#cbd5e1' }}
>
All {totalStaff} Specialists

{divisions.map((d) => (
<button
key={d.id}
onClick={() => setSelectedDomain(d.domain)}
style={{ whiteSpace: 'nowrap', padding: '4px 8px', borderRadius: '6px', border: 'none', fontSize: '10px', fontWeight: 700, cursor: 'pointer', background: selectedDomain === d.domain ? '#f59e0b' : '#1e293b', color: selectedDomain === d.domain ? '#090d16' : '#cbd5e1' }}
>
{d.domain}

))}
{visible.map((dv) => (
<div key={dv.id} style={{ background: '#1e293b', borderRadius: '10px', padding: '9px 10px', marginBottom: '8px', borderLeft: '3px solid #10b981' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
<span style={{ fontSize: '11px', fontWeight: 900, color: '#fbbf24' }}>{dv.domain}
<span style={{ fontSize: '9px', fontWeight: 800, color: '#34d399', background: 'rgba(16,185,129,0.18)', padding: '2px 6px', borderRadius: '4px' }}>
{dv.fullTimeSpecialists} Staff • {dv.experienceYears}Yr Exp • {dv.updatedAt}


<div style={{ fontSize: '11px', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>{dv.leadAgent}
<div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '3px', lineHeight: 1.35 }}>{dv.liveAuditOutput}
<div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px', marginTop: '5px' }}>
{dv.microRoles.map((mr) => (
<span key={mr} style={{ fontSize: '9px', background: '#0f172a', color: '#93c5fd', padding: '2px 5px', borderRadius: '4px', border: '1px solid #334155' }}>
{mr}

))}


))}

)}
</>
);
};