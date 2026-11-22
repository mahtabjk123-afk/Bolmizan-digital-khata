import React, { useEffect, useRef, useState } from 'react';
import { sovereignDbVault, LedgerFilterQuery } from './sovereignIndexedDbVault';
export const Sovereign3DSpatialLayer: React.FC = () => {
const canvasRef = useRef<HTMLCanvasElement | null>(null);
const [filterOpen, setFilterOpen] = useState(false);
const [searchText, setSearchText] = useState('');
const [typeFilter, setTypeFilter] = useState<'ALL' | 'CASH_SALE' | 'CREDIT'>('ALL');
const [results, setResults] = useState<Record<string, unknown>[]>([]);
useEffect(() => {
const canvas = canvasRef.current;
if (!canvas) return;
const ctx = canvas.getContext('2d');
if (!ctx) return;
let animId = 0;
let angle = 0;
const vertices = [[0, -1, 0], [1, 0, 0], [0, 0, 1], [-1, 0, 0], [0, 0, -1], [0, 1, 0]];
const edges = [[0, 1], [0, 2], [0, 3], [0, 4], [5, 1], [5, 2], [5, 3], [5, 4], [1, 2], [2, 3], [3, 4], [4, 1]];
const render = () => {
angle += 0.022;
ctx.clearRect(0, 0, canvas.width, canvas.height);
const cx = canvas.width / 2;
const cy = canvas.height / 2;
const scale = 22;
const projected = vertices.map(([x, y, z]) => {
const rx = x * Math.cos(angle) - z * Math.sin(angle);
const rz = x * Math.sin(angle) + z * Math.cos(angle);
const ry = y * Math.cos(angle * 0.6) - rz * Math.sin(angle * 0.6);
const fz = y * Math.sin(angle * 0.6) + rz * Math.cos(angle * 0.6) + 3.2;
const factor = scale / (fz * 0.42);
return [cx + rx * factor, cy + ry * factor];
});
ctx.strokeStyle = '#10b981';
ctx.lineWidth = 1.6;
for (const [a, b] of edges) {
ctx.beginPath();
ctx.moveTo(projected[a][0], projected[a][1]);
ctx.lineTo(projected[b][0], projected[b][1]);
ctx.stroke();
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
<div onClick={() => setFilterOpen(!filterOpen)} style={{ position: 'fixed', top: '68px', right: '14px', zIndex: 9997, background: 'rgba(15, 23, 42, 0.88)', border: '1px solid rgba(16, 185, 129, 0.6)', borderRadius: '14px', padding: '4px 10px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>

<div style={{ fontSize: '10px', fontWeight: 800, color: '#6ee7b7', lineHeight: 1.2 }}>3D VAULT
<span style={{ color: '#fbbf24' }}>Smart Filter
{filterOpen && (
<div style={{ position: 'fixed', top: '120px', right: '14px', zIndex: 9998, width: '320px', maxHeight: '72vh', overflowY: 'auto', background: '#090d16', color: '#f8fafc', border: '1px solid #10b981', borderRadius: '16px', padding: '14px', fontFamily: 'sans-serif' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
<span style={{ fontSize: '13px', fontWeight: 900, color: '#34d399' }}>3D IndexedDB Smart Filter
<button onClick={() => setFilterOpen(false)} style={{ background: '#1e293b', color: '#cbd5e1', border: 'none', borderRadius: '6px', padding: '3px 8px', fontSize: '11px', cursor: 'pointer' }}>Close

<input type="text" placeholder="Search Party or Crop..." value={searchText} onChange={(e) => { setSearchText(e.target.value); runDbFilter(e.target.value, typeFilter); }} style={{ width: '100%', padding: '8px', borderRadius: '8px', background: '#1e293b', color: '#fff', border: '1px solid #475569', fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }} />
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', marginBottom: '10px' }}>
{(['ALL', 'CASH_SALE', 'CREDIT'] as const).map((t) => (
<button key={t} onClick={() => { setTypeFilter(t); runDbFilter(searchText, t); }} style={{ padding: '6px 4px', borderRadius: '7px', border: 'none', fontSize: '10px', fontWeight: 800, cursor: 'pointer', background: typeFilter === t ? '#10b981' : '#1e293b', color: typeFilter === t ? '#052e16' : '#cbd5e1' }}>
{t === 'ALL' ? 'All' : t === 'CASH_SALE' ? 'Cash In' : 'Udhaar'}

))}

{results.slice(0, 15).map((r, idx) => (
<div key={String(r.id || idx)} style={{ background: '#1e293b', padding: '8px', borderRadius: '8px', marginBottom: '6px', borderLeft: String(r.type) === 'CREDIT' ? '3px solid #ef4444' : '3px solid #10b981' }}>
<div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 800 }}>
{String(r.partyName || 'Trader')}
<span style={{ color: '#34d399' }}>Rs. {Number(r.amount || 0).toLocaleString()}

<div style={{ fontSize: '10px', color: '#94a3b8' }}>{String(r.item || 'Entry')}

))}

)}
</>
);
};