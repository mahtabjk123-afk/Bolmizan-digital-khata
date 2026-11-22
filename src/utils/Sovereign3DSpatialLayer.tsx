import React, { useEffect, useRef, useState } from 'react';
import { sovereignDbVault, LedgerFilterQuery } from './sovereignIndexedDbVault';

export const Sovereign3DSpatialLayer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CASH_SALE' | 'CREDIT'>('ALL');
  const [results, setResults] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    const styleId = 'bolmizan-3d-spatial-theme';
    if (!document.getElementById(styleId)) {
      const st = document.createElement('style');
      st.id = styleId;
      st.textContent = `
        body {
          perspective: 1400px;
          background: radial-gradient(circle at 20% 10%, #0f172a 0%, #050811 100%) !important;
        }
        button {
          transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.22s ease !important;
          transform-style: preserve-3d;
        }
        button:hover {
          transform: translateY(-2px) scale(1.02) !important;
        }
        button:active {
          transform: translateY(1px) scale(0.98) !important;
        }
      `;
      document.head.appendChild(st);
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let angle = 0;

    const vertices = [
      [0, -1, 0],
,
 ,
      [-1, 0, 0],
      [0, 0, -1],
      [0, 1, 0]
    ];
    const edges = [, [0, 2], [0, 3], [0, 4],
, [5, 2], [5, 3], [5, 4],
, [2, 3], [3, 4], [4, 1]
    ];

    const render = () => {
      angle += 0.022;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const scale = 22;

      const projected = vertices.map(([x, y, z]) => {
        const cosY = Math.cos(angle);
        const sinY = Math.sin(angle);
        const rx = x * cosY - z * sinY;
        const rz = x * sinY + z * cosY;
        const cosX = Math.cos(angle * 0.6);
        const sinX = Math.sin(angle * 0.6);
        const ry = y * cosX - rz * sinX;
        const fz = y * sinX + rz * cosX + 3.2;
        const factor = scale / (fz * 0.42);
        return [cx + rx * factor, cy + ry * factor];
      });

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.6;
      for (const [a, b] of edges) {
        ctx.beginPath();
        ctx.moveTo(projected[a], projected[a]);
        ctx.lineTo(projected[b], projected[b]);
        ctx.stroke();
      }

      for (const [px, py] of projected) {
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const runDbFilter = async (nextSearch = searchText, nextType = typeFilter) => {
    const q: LedgerFilterQuery = { searchText: nextSearch, typeFilter: nextType };
    const rows = await sovereignDbVault.queryFilteredEntries(q);
    setResults(rows);
  };

  useEffect(() => {
    if (filterOpen) runDbFilter();
  }, [filterOpen]);

  return (
    <>
      <div
        onClick={() => setFilterOpen(!filterOpen)}
        title="3D Sovereign Core & IndexedDB Smart Filter"
        style={{
          position: 'fixed',
          top: '68px',
          right: '14px',
          zIndex: 9997,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(16, 185, 129, 0.6)',
          borderRadius: '14px',
          padding: '4px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(16,185,129,0.25)'
        }}
      >
        <canvas ref={canvasRef} width={38} height={38} />
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#6ee7b7', lineHeight: 1.2 }}>
          3D VAULT<br /><span style={{ color: '#fbbf24' }}>Smart Filter</span>
        </div>
      </div>

      {filterOpen && (
        <div
          style={{
            position: 'fixed',
            top: '122px',
            right: '14px',
            zIndex: 9998,
            width: '320px',
            maxHeight: '72vh',
            overflowY: 'auto',
            background: 'rgba(9, 13, 22, 0.96)',
            backdropFilter: 'blur(14px)',
            color: '#f8fafc',
            border: '1px solid #10b981',
            borderRadius: '16px',
            padding: '14px',
            boxShadow: '0 16px 40px rgba(0,0,0,0.8)',
            fontFamily: 'sans-serif'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 900, color: '#34d399' }}>3D IndexedDB Vault & Filter</span>
            <button onClick={() => setFilterOpen(false)} style={{ background: '#1e293b', color: '#cbd5e1', border: 'none', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>Close</button>
          </div>

          <input
            type="text"
            placeholder="Search Party, Crop or Hash..."
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); runDbFilter(e.target.value, typeFilter); }}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginBottom: '10px' }}>
            {(['ALL', 'CASH_SALE', 'CREDIT'] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTypeFilter(t); runDbFilter(searchText, t); }}
                style={{
                  padding: '6px 4px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '10px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  background: typeFilter === t ? '#10b981' : '#1e293b',
                  color: typeFilter === t ? '#052e16' : '#cbd5e1'
                }}
              >
                {t === 'ALL' ? 'All Entries' : t === 'CASH_SALE' ? 'Cash In' : 'Udhaar'}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '6px' }}>
            Matched Offline Records: <strong style={{ color: '#fbbf24' }}>{results.length}</strong>
          </div>

          {results.slice(0, 15).map((r, idx) => (
Use code with caution.
<div key={String(r.id || idx)} style={{ background: '#1e293b', padding: '8px', borderRadius: '8px', marginBottom: '6px', borderLeft: String(r.type) === 'CREDIT' ? '3px solid #ef4444' : '3px solid #10b981' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800 }}>
{String(r.partyName || 'Trader')}
<span style={{ color: '#34d399' }}>Rs. {Number(r.amount || 0).toLocaleString()}

<div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
{String(r.item || 'Entry')} • Seal: {String(r.hash || 'VERIFIED')}


))}

)}
</>
);
};