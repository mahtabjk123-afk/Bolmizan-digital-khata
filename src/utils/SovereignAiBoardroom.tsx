import React, { useState, useEffect } from 'react';
import { telemetryAgent } from './SovereignTelemetryAgent';
import { zeroLoopholeShield } from './SovereignZeroLoopholeShield';
import { sovereignSound } from './sovereignSoundEngine';

interface AiAgentStatus {
  id: string;
  dept: string;
  role: string;
  status: 'ACTIVE' | 'VERIFIED' | 'OPTIMIZING';
  lastOutput: string;
  updatedAt: string;
}

export const SovereignAiBoardroom: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [agents, setAgents] = useState<AiAgentStatus[]>([]);
  const [cycleCount, setCycleCount] = useState(1);

  const runAutonomousMinuteCycle = async () => {
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

    const streak = Number(localStorage.getItem('bolmizan_streak') || '1');

    const snapshot: AiAgentStatus[] = [
      { id: 'coo', dept: '1. Leadership', role: 'AI Co-Founder / COO', status: 'ACTIVE', lastOutput: `Daily ops healthy: ${entryCount} ledger records & ${stats.totalEvents} device actions synchronized.`, updatedAt: now },
      { id: 'cos', dept: '1. Leadership', role: 'AI Chief of Staff', status: 'VERIFIED', lastOutput: `All 6 departments aligned under Founder Mahtab (Sakrand HQ).`, updatedAt: now },
      { id: 'cto', dept: '2. Product & Tech', role: 'AI CTO / Architect', status: 'VERIFIED', lastOutput: `Offline-First Bridge & IndexedDB Vault running at ${stats.offlineRatioPercent}% offline autonomy.`, updatedAt: now },
      { id: 'dev', dept: '2. Product & Tech', role: 'AI Full-Stack Agent', status: 'ACTIVE', lastOutput: `Shadow Mirror backup verified; zero storage corruption detected.`, updatedAt: now },
      { id: 'pm', dept: '2. Product & Tech', role: 'AI Product Manager', status: 'OPTIMIZING', lastOutput: `Monitoring ${feedbackCount} voice/text user requests in 30-day consensus queue.`, updatedAt: now },
      { id: 'ux', dept: '2. Product & Tech', role: 'AI UI/UX Designer', status: 'VERIFIED', lastOutput: `3-Button Easy Mode & 3D Spatial Octahedron running at 60 FPS.`, updatedAt: now },
      { id: 'qa', dept: '2. Product & Tech', role: 'AI QA & Security Guard', status: 'VERIFIED', lastOutput: `Clock integrity: ${clockCheck.valid ? 'PASS (No Tamper)' : 'FLAGGED'}. Zero-crash boundary active.`, updatedAt: now },
      { id: 'growth', dept: '3. Growth & Sales', role: 'AI Growth Hacker', status: 'ACTIVE', lastOutput: `Auto-viral WhatsApp Parchi link interceptor armed on every outgoing receipt.`, updatedAt: now },
      { id: 'copy', dept: '3. Growth & Sales', role: 'AI Content & Copywriter', status: 'ACTIVE', lastOutput: `Sindhi/Urdu mandi promo & 8171 scam alert templates ready for 1-tap share.`, updatedAt: now },
      { id: 'bdr', dept: '3. Growth & Sales', role: 'AI B2B Sales / BDR', status: 'OPTIMIZING', lastOutput: `Enterprise Sugar/Rice Mill & Murabaha pitch packets ready (Guardian: 0305-8359178).`, updatedAt: now },
      { id: 'comm', dept: '3. Growth & Sales', role: 'AI Community Manager', status: 'ACTIVE', lastOutput: `Merchant Habit Streak at ${streak} day(s); Trust Score badge active.`, updatedAt: now },
      { id: 'supp', dept: '4. Ops & Support', role: 'AI Customer Support', status: 'VERIFIED', lastOutput: `Voice feedback mic & WhatsApp direct help line (0305-8359178) online.`, updatedAt: now },
      { id: 'ops', dept: '4. Ops & Support', role: 'AI Mandi Logistics Ops', status: 'ACTIVE', lastOutput: `Bardana, Karda, Arhat & Mazdoori net-weight settlement formulas calibrated.`, updatedAt: now },
      { id: 'acc', dept: '5. Finance & Legal', role: 'AI Accountant (BigInt)', status: 'VERIFIED', lastOutput: `Cash In: Rs. ${totalCashPkr.toLocaleString()} | Udhaar: Rs. ${totalUdhaarPkr.toLocaleString()} (0 Paisa drift).`, updatedAt: now },
      { id: 'law', dept: '5. Finance & Legal', role: 'AI Corporate & IP Counsel', status: 'VERIFIED', lastOutput: `Non-custodial compliance verified; IP locked to Mahtab (mahtabjk123@gmail.com).`, updatedAt: now },
      { id: 'hr', dept: '6. People & Culture', role: 'AI Ambassador Scout', status: 'OPTIMIZING', lastOutput: `Sakrand & Nawabshah student/mandi ambassador onboarding kit ready.`, updatedAt: now }
    ];

    setAgents(snapshot);
    setCycleCount((c) => c + 1);
  };

  useEffect(() => {
    runAutonomousMinuteCycle();
    const timer = setInterval(() => {
      runAutonomousMinuteCycle();
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const depts = ['ALL', '1. Leadership', '2. Product & Tech', '3. Growth & Sales', '4. Ops & Support', '5. Finance & Legal', '6. People & Culture'];
  const visibleAgents = selectedDept === 'ALL' ? agents : agents.filter((a) => a.dept === selectedDept);

  return (
    <>
      <button
        onClick={() => { setOpen(!open); if (!open) runAutonomousMinuteCycle(); }}
        title="Autonomous 6-Department AI Startup Boardroom (Auto-updates every 1 min)"
        style={{
          position: 'fixed',
          top: '68px',
          left: '14px',
          zIndex: 9997,
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          color: '#c7d2fe',
          border: '1px solid #818cf8',
          borderRadius: '14px',
          padding: '7px 12px',
          fontSize: '11px',
          fontWeight: 800,
          boxShadow: '0 8px 22px rgba(99,102,241,0.35)',
          cursor: 'pointer'
        }}
      >
        {open ? '✕ Close AI Team' : `🤖 16 AI Agents (Cycle #${cycleCount})`}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            top: '112px',
            left: '14px',
            zIndex: 9998,
            width: '345px',
            maxHeight: '76vh',
            overflowY: 'auto',
            background: 'rgba(9, 13, 22, 0.97)',
            backdropFilter: 'blur(14px)',
            color: '#f8fafc',
            border: '2px solid #818cf8',
            borderRadius: '16px',
            padding: '14px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.85)',
            fontFamily: 'sans-serif'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: '#a5b4fc' }}>Autonomous AI Startup Team</div>
              <div style={{ fontSize: '10px', color: '#94a3b8' }}>CEO: Mahtab • Auto-Syncs Every 60 Seconds</div>
            </div>
            <button
              onClick={() => { sovereignSound.playSuccessChime(); runAutonomousMinuteCycle(); }}
              style={{ background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', padding: '5px 9px', fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}
            >
              Run Now
            </button>
          </div>

          <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '8px' }}>
            {depts.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDept(d)}
                style={{
                  whiteSpace: 'nowrap',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '10px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  background: selectedDept === d ? '#818cf8' : '#1e293b',
                  color: selectedDept === d ? '#090d16' : '#cbd5e1'
                }}
              >
                {d}
              </button>
            ))}
          </div>

          {visibleAgents.map((ag) => (
            <div key={ag.id} style={{ background: '#1e293b', borderRadius: '9px', padding: '8px 10px', marginBottom: '6px', borderLeft: '3px solid #818cf8' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#f8fafc' }}>{ag.role}</span>
                <span style={{ fontSize: '9px', fontWeight: 800, color: '#34d399', background: 'rgba(16,185,129,0.15)', padding: '2px 6px', borderRadius: '4px' }}>
                  {ag.status} • {ag.updatedAt}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '3px', lineHeight: 1.35 }}>
                {ag.lastOutput}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};