import React from 'react';

export class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('RouteErrorBoundary', error, info?.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-[40vh] max-w-md flex-col items-center justify-center gap-4 px-6 py-16 text-center">
          <p className="text-sm font-medium text-primary">Something went wrong in this view.</p>
          <p className="text-xs text-secondary">You can reload the page to recover. If the problem persists, try signing in again.</p>
          <button
            type="button"
            className="rounded-lg border border-border-light bg-base px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-accent-primary/40"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
