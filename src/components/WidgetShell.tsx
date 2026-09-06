import type { ReactNode } from 'react';
import { playClickSound, playHoverSound } from '@/shared/soundUtils';
import type { WidgetStatus } from '@/shared/types';

type WidgetShellProps = {
  title: string;
  headerExtra?: ReactNode;
  className?: string;
  status?: WidgetStatus;
  showStatus?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
  children: ReactNode;
};

const statusLabel: Record<WidgetStatus, string> = {
  online: 'STABLE',
  offline: 'SEVERED',
  loading: 'CHRONO-SYNC',
};

export default function WidgetShell({
  title,
  headerExtra,
  className = '',
  status = 'online',
  showStatus = true,
  isCollapsed,
  onToggleCollapse,
  onRemove,
  children,
}: WidgetShellProps) {
  return (
    <div
      className={`widget r1999-dossier-card ${className}`.trim()}
      style={
        isCollapsed
          ? { padding: '22px 28px', overflow: 'hidden' }
          : { padding: '24px 28px 26px', display: 'flex', flexDirection: 'column' }
      }
    >
      {/* Archival Corner Facets and Seal */}
      <span className="r1999-corner r1999-corner-tl" aria-hidden="true" />
      <span className="r1999-corner r1999-corner-tr" aria-hidden="true" />
      <span className="r1999-corner r1999-corner-bl" aria-hidden="true" />
      <span className="r1999-corner r1999-corner-br" aria-hidden="true" />
      <span className="r1999-docket-tab" aria-hidden="true">CASE // 19</span>

      <div className="r1999-card-header">
        <div className="r1999-title-group">
          <span className="r1999-header-diamond" aria-hidden="true">◈</span>
          <h3 className="r1999-card-title">{title}</h3>
          {showStatus && (
            <span className={`r1999-status-badge status-${status}`}>
              <span className="r1999-status-pulse" />
              {statusLabel[status]}
            </span>
          )}
          {headerExtra}
        </div>

        <div className="r1999-card-actions">
          {onToggleCollapse && (
            <button
              type="button"
              className="r1999-btn-icon"
              onClick={() => {
                playClickSound();
                onToggleCollapse();
              }}
              onMouseEnter={playHoverSound}
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
              title={isCollapsed ? 'Expand dossier' : 'Fold dossier'}
            >
              {isCollapsed ? '+' : '—'}
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              className="r1999-btn-icon btn-remove"
              onClick={() => {
                playClickSound();
                onRemove();
              }}
              onMouseEnter={playHoverSound}
              aria-label={`Archive ${title} widget`}
              title="Archive dossier"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && <div className="widget-content r1999-card-body">{children}</div>}
    </div>
  );
}
