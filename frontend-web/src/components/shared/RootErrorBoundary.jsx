import React from 'react';

export default class RootErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error) {
    console.error('Root rendering error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ink-50 p-6 text-ink-900">
          <div className="mx-auto max-w-2xl rounded-2xl border border-rose-200 bg-white p-6 shadow-card">
            <h1 className="text-2xl font-black text-rose-700">Application error</h1>
            <p className="mt-2 text-sm text-ink-600">
              Une erreur runtime a empeche le rendu. Recharge la page apres avoir vide le localStorage.
            </p>
            <pre className="mt-4 overflow-auto rounded-xl bg-ink-100 p-3 text-xs text-ink-800">
              {String(this.state.error?.message || this.state.error || 'Unknown error')}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
