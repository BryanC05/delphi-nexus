import type { ReactNode } from 'react';
import { playHoverSound } from '@/shared/soundUtils';
import type { WidgetStatus } from '@/shared/types';

type WidgetShellProps = {
  title: string;
  className?: string;
  status?: WidgetStatus;
  showStatus?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onRemove?: () => void;
  children: ReactNode;
};

const statusLabel: Record<WidgetStatus, string> = {
  online: 'ONLINE',
  offline: 'OFFLINE',
  loading: 'SYNCING',
};

export default function WidgetShell({
  title,
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
      className={`widget ${className}`.trim()}
      style={
        isCollapsed
          ? { padding: '24px', overflow: 'hidden' }
          : { padding: '24px', display: 'flex', flexDirection: 'column' }
      }
    >
      <h3
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isCollapsed ? 0 : '16px',
          borderBottom: isCollapsed ? 'none' : '2px solid var(--accent-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontFamily: 'var(--font-p3r)', textTransform: 'uppercase' }}>{title}</span>
          {showStatus && status !== 'loading' && (
            <span className="api-indicator">{statusLabel[status]}</span>
          )}
          {showStatus && status === 'loading' && (
            <span className="api-indicator" style={{ opacity: 0.7 }}>
              {statusLabel.loading}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {onToggleCollapse && (
            <button
              type="button"
              className="collapse-btn"
              onClick={onToggleCollapse}
              onMouseEnter={playHoverSound}
              aria-expanded={!isCollapsed}
              aria-label={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
            >
              {isCollapsed ? '+' : '-'}
            </button>
          )}
          {onRemove && (
            <button
              type="button"
              className="remove-btn"
              onClick={onRemove}
              onMouseEnter={playHoverSound}
              aria-label={`Remove ${title} widget`}
            >
              ×
            </button>
          )}
        </div>
      </h3>
      {!isCollapsed && <div className="widget-content">{children}</div>}
    </div>
  );
}
