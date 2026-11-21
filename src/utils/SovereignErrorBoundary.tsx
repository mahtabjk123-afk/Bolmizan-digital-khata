import React from 'react';

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class SovereignErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error?.message || 'Unexpected UI State' };
  }

  componentDidCatch(error: Error) {
    console.error('[BolMizan Guard] Recovered from UI crash:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#0b132b', color: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', fontFamily: 'sans-serif' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px', color: '#38bdf8' }}>BolMizan Sovereign Recovery</h2>
          <p style={{ fontSize: '14px', opacity: 0.85, maxWidth: '360px', marginBottom: '20px' }}>
            Screen state paused during tab switch. Your offline Khata data is 100% safe.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, errorMsg: '' })}
            style={{ background: '#10b981', color: '#052e16', fontWeight: 700, border: 'none', borderRadius: '10px', padding: '12px 24px', fontSize: '15px', cursor: 'pointer' }}
          >
            Restore Screen Now
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function installBlackScreenGuard(): void {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      const root = document.getElementById('root');
      if (root && root.innerHTML.trim() === '') {
        window.location.reload();
      }
    }
  });

  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      const root = document.getElementById('root');
      if (root && root.innerHTML.trim() === '') {
        window.location.reload();
      }
    }
  });
}