import React, { useState } from 'react';
import { sovereignSound } from './sovereignSoundEngine';

export const FOUNDER_CONFIG = {
  founderName: 'Mahtab — Founder & Chief Architect',
  origin: 'Sakrand, Shaheed Benazirabad, Sindh, Pakistan',
  copyright: '© 2026 Mahtab. All Rights Reserved. Sovereign Proprietary Architecture.',
  guardianPhoneDisplay: '0305-8359178',
  guardianWhatsAppIntl: '923058359178',
  officialEmail: 'mahtabjk123@gmail.com',
  repoUrl: 'https://github.com',
  supportNote: 'Under-18 Founder Mode: Verified Guardian Account (0305-8359178) & Official Email (mahtabjk123@gmail.com) for B2B licensing, grants, and voluntary community support.'
};

const REVENUE_CHANNELS = [
  { id: 1, title: 'Voluntary Founder Support (JazzCash / EasyPaisa)', target: 'Happy Merchants & Supporters', model: 'Zero-pressure voluntary contribution to Guardian Account: 0305-8359178.' },
  { id: 2, title: 'Sugar & Rice Mill Enterprise SaaS', target: 'Factories & Ginning Mills', model: 'PKR 35,000/month per factory for 500+ outgrower QIM-verified weighbridge ledgers.' },
  { id: 3, title: 'Islamic Murabaha Credit Origination', target: 'Islamic Banks & Microfinance', model: '1.5% - 3% origination fee on interest-free seed/fertilizer financing using BolMizan Trust Scores.' },
  { id: 4, title: 'B2B Fertilizer & Seed Bulk Commission', target: 'Agri-Input Manufacturers', model: '2% - 5% fulfillment commission on bulk mandi input orders.' },
  { id: 5, title: 'Custom Branded Arthiya Gold Parchi', target: 'Large Commission Agents', model: 'Custom firm letterhead, stamp & thermal print layout for big mandi firms.' },
  { id: 6, title: 'Cold-Storage & Mandi Transport Booking', target: 'Logistics & Cold Chains', model: 'Per-truck / per-crate booking commission for produce storage & transit.' },
  { id: 7, title: 'Parametric Crop Takaful (Islamic Insurance)', target: 'Takaful Operators', model: '10% - 15% agency commission on flood/drought micro-Takaful policies.' },
  { id: 8, title: 'Bluetooth Thermal Printer & QR Kits', target: 'Mandi Shops & Retail', model: 'Hardware margin on plug-and-play offline receipt printers & laminated QR stands.' },
  { id: 9, title: 'Anonymized Mandi Commodity Rate API', target: 'Exporters & Agri-Research', model: 'Privacy-preserving daily crop price index subscriptions across Sindh & Pakistan.' },
  { id: 10, title: 'Global Innovation Grants & CSR', target: 'ISEF, UNICEF, Mozilla & CSR', model: 'Non-equity R&D grants and corporate rural financial inclusion sponsorships.' }
];

export const SovereignFounderHub: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [selectedStream, setSelectedStream] = useState<string>('Enterprise Mill License');
  const [partnerOrg, setPartnerOrg] = useState('');
  const [copiedNum, setCopiedNum] = useState(false);

  const handleCopyWallet = async () => {
    try {
      await navigator.clipboard.writeText('03058359178');
      sovereignSound.playSuccessChime();
      setCopiedNum(true);
      setTimeout(() => setCopiedNum(false), 2500);
    } catch {}
  };

  const handleDirectWhatsAppFounder = () => {
    sovereignSound.playSuccessChime();
    const text = `👑 *BOLMIZAN OFFICIAL FOUNDER & B2B INQUIRY*\n👤 To: ${FOUNDER_CONFIG.founderName}\n🏢 Firm/Org: ${partnerOrg.trim() || 'Mandi / Enterprise Partner'}\n💼 Channel: ${selectedStream}\n📍 Location: ${FOUNDER_CONFIG.origin}\n\nAssalam-o-Alaikum, I want to connect regarding BolMizan licensing / partnership.`;
    window.open(`https://wa.me{FOUNDER_CONFIG.guardianWhatsAppIntl}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleEmailFounder = () => {
    const subject = encodeURIComponent(`BolMizan Partnership / Licensing - ${selectedStream}`);
    const body = encodeURIComponent(`Dear Mahtab,\n\nOrganization: ${partnerOrg.trim() || 'Partner'}\nInterest: ${selectedStream}\n\nPlease share official onboarding details.`);
    window.open(`mailto:${FOUNDER_CONFIG.officialEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        title="Mahtab — Official Founder & 10-Stream Licensing"
        style={{
          position: 'fixed',
          bottom: '54px',
          left: '16px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, #78350f, #b45309)',
          color: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '999px',
          padding: '7px 13px',
          fontSize: '11px',
          fontWeight: 800,
          boxShadow: '0 4px 14px rgba(180,83,9,0.5)',
          cursor: 'pointer'
        }}
      >
        {open ? '✕ Close' : '👑 Mahtab (Founder)'}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            bottom: '96px',
            left: '16px',
            zIndex: 9999,
            width: '335px',
            maxHeight: '82vh',
            overflowY: 'auto',
            background: '#090d16',
            color: '#f8fafc',
            border: '2px solid #f59e0b',
            borderRadius: '16px',
            padding: '16px',
            boxShadow: '0 14px 36px rgba(0,0,0,0.8)',
            fontFamily: 'sans-serif'
          }}
        >
          <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '12px', borderRadius: '12px', border: '1px solid #fbbf24', marginBottom: '10px' }}>
            <div style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Official Sovereign Copyright & Ownership
            </div>
            <div style={{ fontSize: '16px', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
              {FOUNDER_CONFIG.founderName}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              {FOUNDER_CONFIG.origin}
            </div>
            <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '4px', fontWeight: 700 }}>
              📞 {FOUNDER_CONFIG.guardianPhoneDisplay} | ✉️ {FOUNDER_CONFIG.officialEmail}
            </div>
            <div style={{ fontSize: '10px', color: '#34d399', marginTop: '4px', fontWeight: 600 }}>
              {FOUNDER_CONFIG.copyright}
            </div>
          </div>

          <button
            onClick={handleCopyWallet}
            style={{ width: '100%', background: '#065f46', color: '#a7f3d0', fontWeight: 800, border: '1px solid #10b981', borderRadius: '8px', padding: '8px', fontSize: '11px', cursor: 'pointer', marginBottom: '10px' }}
          >
            {copiedNum ? '✅ Copied: 0305-8359178 (JazzCash / EasyPaisa)' : '💚 Copy Support Number: 0305-8359178'}
          </button>

          <div style={{ fontSize: '12px', fontWeight: 800, color: '#fbbf24', marginBottom: '6px' }}>
            10-Stream Commercial & Impact Revenue Engine
          </div>

          <div style={{ maxHeight: '170px', overflowY: 'auto', marginBottom: '10px', paddingRight: '4px' }}>
            {REVENUE_CHANNELS.map((ch) => (
              <div
                key={ch.id}
                onClick={() => setSelectedStream(ch.title)}
                style={{
                  background: selectedStream === ch.title ? 'rgba(245,158,11,0.18)' : '#1e293b',
                  border: selectedStream === ch.title ? '1px solid #fbbf24' : '1px solid #334155',
                  borderRadius: '8px',
                  padding: '8px',
                  marginBottom: '6px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 800, color: '#f8fafc' }}>
                  {ch.id}. {ch.title}
                </div>
                <div style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 600 }}>
                  Partner: {ch.target}
                </div>
                <div style={{ fontSize: '10px', color: '#cbd5e1', marginTop: '2px', lineHeight: 1.3 }}>
                  {ch.model}
                </div>
              </div>
            ))}
          </div>

          <input
            type="text"
            placeholder="Partner Firm / Sugar Mill / Bank Name"
            value={partnerOrg}
            onChange={(e) => setPartnerOrg(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', background: '#1e293b', color: '#ffffff', border: '1px solid #475569', fontSize: '11px', marginBottom: '8px', boxSizing: 'border-box' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
            <button
              onClick={handleDirectWhatsAppFounder}
              style={{ background: '#25D366', color: '#052e16', fontWeight: 900, border: 'none', borderRadius: '8px', padding: '9px', fontSize: '11px', cursor: 'pointer' }}
            >
              WhatsApp Founder
            </button>
            <button
              onClick={handleEmailFounder}
              style={{ background: '#f59e0b', color: '#090d16', fontWeight: 900, border: 'none', borderRadius: '8px', padding: '9px', fontSize: '11px', cursor: 'pointer' }}
            >
              Email Founder
            </button>
          </div>

          <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.35 }}>
            {FOUNDER_CONFIG.supportNote}
          </div>
        </div>
      )}
    </>
  );
};