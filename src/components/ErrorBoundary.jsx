import React from 'react';

/**
 * Global Error Boundary — prevents blank white screen on runtime JS errors.
 * Shows a friendly recovery UI and logs the error for debugging.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log to console for debugging
    console.error('[FoodBridge] Unhandled React error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
            {/* Logo / Icon */}
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="#065F46" strokeWidth="2" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              FoodBridge encountered an unexpected error. Your data is safe — please reload to continue.
            </p>

            {/* Error detail (collapsible in dev) */}
            {this.state.error && (
              <details className="mb-6 text-left bg-red-50 rounded-lg p-3 text-xs text-red-700 font-mono">
                <summary className="cursor-pointer font-semibold mb-1">Error details</summary>
                <pre className="whitespace-pre-wrap break-all mt-2">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl font-semibold hover:bg-emerald-800 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
              >
                Try Again
              </button>
            </div>

            <p className="text-xs text-gray-400 mt-4">
              FoodBridge — Universal Surplus Food Redistribution Network
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
