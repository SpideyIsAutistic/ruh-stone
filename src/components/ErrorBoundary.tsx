'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  resetKey?: any;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[RUH STONE ErrorBoundary caught error]', error, errorInfo);
  }

  public componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  public reset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-[#FAF7F2] max-w-md w-full p-8 border border-[#E8E0D2] shadow-2xl text-center space-y-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#7A746C] block">
              RUH STONE ATELIER
            </span>
            <h3 className="font-serif text-2xl text-[#23201D] font-light">
              Presentation Notice
            </h3>
            <p className="text-xs text-[#7A746C] leading-relaxed">
              We encountered an issue preparing this piece&apos;s presentation. You can view the dedicated page or close this view.
            </p>
            <div className="pt-2 flex justify-center space-x-3">
              <button
                type="button"
                onClick={this.reset}
                className="px-6 py-2.5 bg-[#23201D] text-[#FAF7F2] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#3A3027] transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
