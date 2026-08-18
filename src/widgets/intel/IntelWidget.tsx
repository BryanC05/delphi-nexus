import { useState, type CSSProperties } from 'react';
import WidgetShell from '@/components/WidgetShell';
import type { WidgetShellProps } from '@/shared/types';
import IntelFactTab from './IntelFactTab';
import IntelGlyphTab from './IntelGlyphTab';
import IntelDossierTab from './IntelDossierTab';
import IntelKnowledgeTab from './IntelKnowledgeTab';

type IntelTab = 'fact' | 'glyph' | 'dossier' | 'knowledge';

const tabButtonStyle = (active: boolean): CSSProperties => ({
  background: active ? 'var(--p3r-blue-light)' : 'transparent',
  color: active ? '#000' : 'var(--text-muted)',
  border: '1px solid rgba(0, 163, 224, 0.3)',
  padding: '6px 12px',
  fontSize: '0.7rem',
  fontFamily: 'var(--font-p3r)',
  cursor: 'pointer',
  fontWeight: 'bold',
  textTransform: 'uppercase',
});

export default function IntelWidget({ isCollapsed, onToggleCollapse, onRemove }: WidgetShellProps) {
  const [activeTab, setActiveTab] = useState<IntelTab>('fact');

  return (
    <WidgetShell title="Daily Intel" isCollapsed={isCollapsed} onToggleCollapse={onToggleCollapse} onRemove={onRemove} showStatus={activeTab === 'fact'}>
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(0, 163, 224, 0.2)', paddingBottom: '8px', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        <button type="button" onClick={() => setActiveTab('fact')} style={tabButtonStyle(activeTab === 'fact')}>Intel Fact</button>
        <button type="button" onClick={() => setActiveTab('glyph')} style={tabButtonStyle(activeTab === 'glyph')}>Glyph Decoder</button>
        <button type="button" onClick={() => setActiveTab('dossier')} style={tabButtonStyle(activeTab === 'dossier')}>Net Dossier</button>
        <button type="button" onClick={() => setActiveTab('knowledge')} style={tabButtonStyle(activeTab === 'knowledge')}>Knowledge Archive</button>
      </div>
      {activeTab === 'fact' && <IntelFactTab />}
      {activeTab === 'glyph' && <IntelGlyphTab />}
      {activeTab === 'dossier' && <IntelDossierTab />}
      {activeTab === 'knowledge' && <IntelKnowledgeTab />}
    </WidgetShell>
  );
}
