import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-6">⚠️</div>
            <h1 className="text-2xl font-semibold text-surface-50 mb-3">Something went wrong</h1>
            <p className="text-surface-400 text-sm mb-8 leading-relaxed">
              An unexpected error occurred. Refreshing the page should resolve it.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-8 py-3 bg-primary-500 hover:bg-primary-400 text-white font-semibold rounded-full transition-all"
            >
              Reload page
            </button>
            {process.env.NODE_ENV !== 'production' && (
              <pre className="mt-8 text-left text-xs text-danger-400 bg-danger-500/5 border border-danger-500/20 rounded-xl p-4 overflow-auto max-h-48">
                {this.state.error.message}
              </pre>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
