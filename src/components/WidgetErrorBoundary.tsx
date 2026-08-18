import React from 'react';

type Props = {
  widgetId: string;
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  retryKey: number;
};

export default class WidgetErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, retryKey: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(`Widget ${this.props.widgetId} failed:`, error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, retryKey: this.state.retryKey + 1 });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="widget widget-offline" role="alert">
          <h3 style={{ fontFamily: 'var(--font-p3r)', textTransform: 'uppercase', marginBottom: '12px' }}>
            MODULE OFFLINE — {this.props.widgetId}
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
            This module encountered an error and was isolated from the rest of the dashboard.
          </p>
          <button type="button" className="news-search-button" onClick={this.handleRetry}>
            RETRY UPLINK
          </button>
        </div>
      );
    }

    return <React.Fragment key={this.state.retryKey}>{this.props.children}</React.Fragment>;
  }
}
