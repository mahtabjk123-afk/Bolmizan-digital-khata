import React, { useEffect, useRef, useState } from 'react';
import { sovereignDbVault, LedgerFilterQuery } from './sovereignIndexedDbVault';

export const Sovereign3DSpatialLayer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [results, setResults] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId = 0;
    let angle = 0;
    const render = () => {
      angle += 0.025;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const r = 13;
      const x1 = cx + Math.cos(angle) * r;
      const x2 = cx - Math.cos(angle) * r;
      const z1 = Math.sin(angle) * 5;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(x1, cy + z1 * 0.3);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(x2, cy - z1 * 0.3);
      ctx.closePath();
      ctx.stroke();
      animId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  const runDbFilter = async (nextSearch = searchText, nextType = typeFilter) => {
    const q: LedgerFilterQuery = { searchText: nextSearch, typeFilter: nextType as 'ALL' | 'CASH_SALE' | 'CREDIT' };
    const rows = await sovereignDbVault.queryFilteredEntries(q);
    setResults(rows);
  };

  useEffect(() => {
    if (filterOpen) runDbFilter();
  }, [filterOpen]);

  const dock = React.createElement(
    'div',
    {
      onClick: () => setFilterOpen(!filterOpen),
      style: { position: 'fixed', top: '68px', right: '14px', zIndex: 9997, background: 'rgba(15, 23, 42, 0.9)', border: '1px solid #10b981', borderRadius: '14px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }
    },
    React.createElement('canvas', { ref: canvasRef, width: 36, height: 36 }),
    React.createElement('div', { style: { fontSize: '10px', fontWeight: 800, color: '#6ee7b7', lineHeight: 1.2 } }, '3D VAULT • Filter')
  );

  const drawer = filterOpen
    ? React.createElement(
        'div',
        {
          style: { position: 'fixed', top: '120px', right: '14px', zIndex: 9998, width: '320px', maxHeight: '72vh', overflowY: 'auto', background: '#090d16', color: '#f8fafc', border: '1px solid #10b981', borderRadius: '16px', padding: '14px', fontFamily: 'sans-serif' }
        },
        React.createElement(
          'div',
          { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' } },
          React.createElement('span', { style: { fontSize: '13px', fontWeight: 900, color: '#34d399' } }, '3D IndexedDB Smart Filter'),
          React.createElement('button', { onClick: () => setFilterOpen(false), style: { background: '#1e293b', color: '#cbd5e1', border: 'none', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' } }, 'Close')
        ),
        React.createElement('input', {
          type: 'text',
          placeholder: 'Search Party or Crop...',
          value: searchText,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => { setSearchText(e.target.value); runDbFilter(e.target.value, typeFilter); },
          style: { width: '100%', padding: '8px', borderRadius: '8px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }
        }),
        React.createElement(
          'div',
          { style: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginBottom: '10px' } },
          React.createElement('button', { onClick: () => { setTypeFilter('ALL'); runDbFilter(searchText, 'ALL'); }, style: { padding: '6px', borderRadius: '7px', border: 'none', fontSize: '10px', fontWeight: 800, cursor: 'pointer', background: typeFilter === 'ALL' ? '#10b981' : '#1e293b', color: typeFilter === 'ALL' ? '#052e16' : '#cbd5e1' } }, 'All'),
          React.createElement('button', { onClick: () => { setTypeFilter('CASH_SALE'); runDbFilter(searchText, 'CASH_SALE'); }, style: { padding: '6px', borderRadius: '7px', border: 'none', fontSize: '10px', fontWeight: 800, cursor: 'pointer', background: typeFilter === 'CASH_SALE' ? '#10b981' : '#1e293b', color: typeFilter === 'CASH_SALE' ? '#052e16' : '#cbd5e1' } }, 'Cash In'),
          React.createElement('button', { onClick: () => { setTypeFilter('CREDIT'); runDbFilter(searchText, 'CREDIT'); }, style: { padding: '6px', borderRadius: '7px', border: 'none', fontSize: '10px', fontWeight: 800, cursor: 'pointer', background: typeFilter === 'CREDIT' ? '#10b981' : '#1e293b', color: typeFilter === 'CREDIT' ? '#052e16' : '#cbd5e1' } }, 'Udhaar')
        ),
        results.slice(0, 15).map((r, idx) =>
          React.createElement(
            'div',
            { key: String(r.id || idx), style: { background: '#1e293b', padding: '8px', borderRadius: '8px', marginBottom: '6px', borderLeft: String(r.type) === 'CREDIT' ? '3px solid #ef4444' : '3px solid #10b981' } },
            React.createElement('div', { style: { fontSize: '12px', fontWeight: 800 } }, String(r.partyName || 'Trader') + ' — Rs. ' + Number(r.amount || 0).toLocaleString()),
            React.createElement('div', { style: { fontSize: '10px', color: '#94a3b8' } }, String(r.item || 'Entry'))
          )
        )
      )
    : null;

  return React.createElement(React.Fragment, null, dock, drawer);
};