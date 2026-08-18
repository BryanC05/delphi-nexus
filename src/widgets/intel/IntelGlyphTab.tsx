import { useState } from 'react';
import { GLYPH_DATABASE, type Glyph } from './intelData';

export default function IntelGlyphTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGlyph, setSelectedGlyph] = useState<Glyph | null>(null);

  const filteredGlyphs = GLYPH_DATABASE.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input
        type="text"
        placeholder="Search glyph metadata (e.g. hazard, security)..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ background: '#000', border: '1px solid rgba(0, 163, 224, 0.3)', color: '#fff', padding: '8px 12px', fontSize: '0.8rem', fontFamily: 'var(--font-tech)', outline: 'none', width: '100%', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' }}>
        {filteredGlyphs.map((g) => (
          <button key={g.symbol} type="button" onClick={() => setSelectedGlyph(g)} title={g.name} style={{ background: selectedGlyph?.symbol === g.symbol ? 'var(--p3r-blue-light)' : 'rgba(0, 45, 98, 0.15)', color: selectedGlyph?.symbol === g.symbol ? '#000' : '#fff', border: '1px solid rgba(0, 163, 224, 0.2)', fontSize: '1.25rem', padding: '8px', cursor: 'pointer' }}>
            {g.symbol}
          </button>
        ))}
      </div>
      {selectedGlyph ? (
        <div style={{ padding: '10px 12px', background: 'rgba(0, 45, 98, 0.15)', borderLeft: '3px solid var(--p3r-blue-light)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 'bold' }}>{selectedGlyph.symbol} {selectedGlyph.name}</span>
            <span style={{ fontSize: '0.65rem', background: 'rgba(0, 163, 224, 0.2)', color: 'var(--p3r-blue-light)', padding: '2px 6px' }}>{selectedGlyph.tag}</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{selectedGlyph.desc}</div>
        </div>
      ) : (
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', fontStyle: 'italic', padding: '10px' }}>Select a glyph to decode its system attributes.</div>
      )}
    </div>
  );
}
