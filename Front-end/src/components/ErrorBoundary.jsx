import React, { Component } from 'react';
import { AlertOctagon, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // In production, you can report this to a monitoring service (e.g. Sentry)
    console.error('🛡️ [ErrorBoundary Caught]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback passed via props, or default Cyber-Cinema fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-neutral-950 text-white selection:bg-[#FF0055]/30">
          {/* Background Ambient Glow */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF0055]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-rose-600/5 rounded-full blur-[100px]" />
          </div>

          <div className="relative z-10 max-w-xl w-full glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl flex flex-col items-center text-center">
            {/* Warning Icon Badge */}
            <div className="w-16 h-16 rounded-2xl bg-[#FF0055]/10 border border-[#FF0055]/30 flex items-center justify-center mb-6 shadow-lg shadow-[#FF0055]/20 animate-pulse">
              <AlertOctagon className="w-8 h-8 text-[#FF2E7E]" />
            </div>

            {/* Error Message */}
            <span className="text-xs font-bold uppercase tracking-widest text-[#FF2E7E] mb-2">
              Cinema Stream Interrupted
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-sm text-neutral-400 max-w-md leading-relaxed mb-8">
              An unexpected render error occurred in this view. Don't worry, your account and data are completely safe.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 w-full sm:w-auto">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-[#FF0055] hover:bg-[#FF0055]/90 text-white font-semibold text-sm shadow-lg shadow-[#FF0055]/25 hover:shadow-[#FF0055]/40 transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white font-semibold text-sm border border-white/10 transition-all cursor-pointer active:scale-95"
              >
                <Home className="w-4 h-4" />
                <span>Go to Home</span>
              </button>

              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-transparent hover:bg-white/5 text-neutral-400 hover:text-neutral-200 text-xs font-medium transition-colors cursor-pointer"
              >
                <span>Reload Page</span>
              </button>
            </div>

            {/* Developer Details Collapsible (in Dev mode) */}
            {isDev && this.state.error && (
              <div className="mt-8 w-full text-left">
                <button
                  onClick={this.toggleDetails}
                  className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
                >
                  <span>Stack Trace (Development Only)</span>
                  {this.state.showDetails ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {this.state.showDetails && (
                  <div className="mt-2 p-4 rounded-xl bg-neutral-900/90 border border-white/10 overflow-x-auto text-[11px] font-mono text-rose-400 max-h-56 scrollbar-thin">
                    <p className="font-bold mb-1">{this.state.error.toString()}</p>
                    <pre className="text-neutral-500 whitespace-pre-wrap leading-relaxed">
                      {this.state.errorInfo?.componentStack || this.state.error.stack}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
