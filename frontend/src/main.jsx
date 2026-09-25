import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('DataPilot AI Application Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#020617', color: '#f8fafc', padding: '20px', fontFamily: 'sans-serif' }}>
          <div style={{ maxWidth: '600px', width: '100%', background: '#0f172a', padding: '30px', borderRadius: '16px', border: '1px solid #334155', textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f43f5e', marginBottom: '12px' }}>DataPilot AI Application Notice</h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '20px' }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <pre style={{ textAlign: 'left', background: '#020617', padding: '12px', borderRadius: '8px', fontSize: '11px', color: '#fb7185', overflowX: 'auto', marginBottom: '20px' }}>
              {String(this.state.error?.stack || '')}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '10px 24px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
            >
              Reload DataPilot AI
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
