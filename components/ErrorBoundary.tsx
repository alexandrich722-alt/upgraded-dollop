import { Component, type ReactNode, type ErrorInfo } from 'react';
import { AlertTriangle, RefreshCw, Download, Trash2 } from 'lucide-react';
import { STORAGE_KEY } from '../lib/constants';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('NOVA Error Boundary:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleExport = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const blob = new Blob([raw], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nova-error-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch { /* ignore */ }
  };

  handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-nova-bg flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-rose/15 flex items-center justify-center border border-accent-rose/20">
                <AlertTriangle className="w-8 h-8 text-accent-rose" />
              </div>
              <h1 className="font-display text-xl font-bold text-nova-text mb-2">Something went wrong</h1>
              <p className="text-sm text-nova-dim">NOVA encountered an error. Your data is safe — export it before resetting.</p>
            </div>

            {this.state.error && (
              <div className="glass rounded-xl p-3 mb-4 max-h-32 overflow-y-auto no-scrollbar">
                <p className="text-xs font-mono text-accent-rose/80">{this.state.error.message}</p>
              </div>
            )}

            <div className="space-y-2">
              <button onClick={this.handleReload} className="btn-primary w-full">
                <RefreshCw className="w-4 h-4" /> Reload App
              </button>
              <button onClick={this.handleExport} className="btn-ghost w-full">
                <Download className="w-4 h-4" /> Export Data (Backup)
              </button>
              <button onClick={this.handleReset} className="btn-danger w-full">
                <Trash2 className="w-4 h-4" /> Reset Local Cache
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
