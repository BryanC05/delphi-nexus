import { useState } from 'react';
import { CIPHER_DB, ELEMENT_DB, PHILOSOPHY_DB, type CipherMachine, type ElementInfo, type PhilosophySchool } from './intelData';

export default function IntelKnowledgeTab() {
  const [knowledgeSubTab, setKnowledgeSubTab] = useState<'science' | 'history' | 'humanities'>('science');
  const [selectedElement, setSelectedElement] = useState<ElementInfo>(ELEMENT_DB[0]);
  const [selectedCipher, setSelectedCipher] = useState<CipherMachine>(CIPHER_DB[0]);
  const [selectedPhilosophy, setSelectedPhilosophy] = useState<PhilosophySchool>(PHILOSOPHY_DB[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '4px' }}>
        {(['science', 'history', 'humanities'] as const).map((sub) => (
          <button key={sub} type="button" onClick={() => setKnowledgeSubTab(sub)} style={{ flexGrow: 1, background: knowledgeSubTab === sub ? 'var(--p3r-blue-light)' : 'transparent', color: knowledgeSubTab === sub ? '#000' : 'var(--text-muted)', border: 'none', padding: '4px 8px', fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer', textTransform: 'uppercase' }}>
            {sub}
          </button>
        ))}
      </div>
      {knowledgeSubTab === 'science' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-color)' }}>CHEMICAL ELEMENTS REGISTRY</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {ELEMENT_DB.map((el) => (
              <button key={el.symbol} type="button" onClick={() => setSelectedElement(el)} style={{ background: selectedElement.symbol === el.symbol ? 'var(--p3r-blue-light)' : 'rgba(0, 45, 98, 0.15)', color: selectedElement.symbol === el.symbol ? '#000' : '#fff', border: '1px solid rgba(0, 163, 224, 0.2)', padding: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                {el.symbol}
              </button>
            ))}
          </div>
          <div style={{ padding: '10px', background: 'rgba(0, 45, 98, 0.1)', borderLeft: '3px solid var(--p3r-blue-light)' }}>
            <div style={{ fontWeight: 'bold', color: '#fff' }}>{selectedElement.name} (Atomic #{selectedElement.number})</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>ATOMIC WEIGHT: {selectedElement.weight} u · {selectedElement.group}</div>
            <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>{selectedElement.desc}</div>
          </div>
        </div>
      )}
      {knowledgeSubTab === 'history' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-color)' }}>HISTORIC CIPHER MACHINES</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {CIPHER_DB.map((cipher) => (
              <button key={cipher.name} type="button" onClick={() => setSelectedCipher(cipher)} style={{ background: selectedCipher.name === cipher.name ? 'var(--p3r-blue-light)' : 'rgba(0, 45, 98, 0.15)', color: selectedCipher.name === cipher.name ? '#000' : '#fff', border: '1px solid rgba(0, 163, 224, 0.2)', padding: '4px 8px', cursor: 'pointer', fontSize: '0.7rem' }}>
                {cipher.name}
              </button>
            ))}
          </div>
          <div style={{ padding: '10px', background: 'rgba(0, 45, 98, 0.1)', borderLeft: '3px solid var(--p3r-blue-light)' }}>
            <div style={{ fontWeight: 'bold', color: '#fff' }}>{selectedCipher.name} ({selectedCipher.year})</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{selectedCipher.country} · {selectedCipher.type}</div>
            <div style={{ fontSize: '0.75rem', marginTop: '4px' }}>{selectedCipher.desc}</div>
          </div>
        </div>
      )}
      {knowledgeSubTab === 'humanities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--accent-color)' }}>PHILOSOPHY SCHOOLS & TENETS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {PHILOSOPHY_DB.map((p) => (
              <button key={p.school} type="button" onClick={() => setSelectedPhilosophy(p)} style={{ background: selectedPhilosophy.school === p.school ? 'var(--p3r-blue-light)' : 'rgba(0, 45, 98, 0.15)', color: selectedPhilosophy.school === p.school ? '#000' : '#fff', border: '1px solid rgba(0, 163, 224, 0.2)', padding: '4px 8px', cursor: 'pointer', fontSize: '0.7rem' }}>
                {p.school}
              </button>
            ))}
          </div>
          <div style={{ padding: '10px', background: 'rgba(0, 45, 98, 0.1)', borderLeft: '3px solid var(--p3r-blue-light)' }}>
            <div style={{ fontWeight: 'bold', color: '#fff' }}>{selectedPhilosophy.school} School</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>CORE: {selectedPhilosophy.core}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>THINKERS: {selectedPhilosophy.thinkers}</div>
            <div style={{ fontSize: '0.75rem', fontStyle: 'italic', marginTop: '6px' }}>&ldquo;{selectedPhilosophy.quote}&rdquo;</div>
          </div>
        </div>
      )}
    </div>
  );
}
