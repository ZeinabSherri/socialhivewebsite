import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class VideoErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[VideoErrorBoundary] Video component error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          className="flex items-center justify-center bg-gray-900 text-white min-h-[200px] rounded-lg"
          style={{ backgroundColor: '#1a1a1a' }}
        >
          <div className="text-center p-4">
            <div className="text-sm opacity-70 mb-2">Video unavailable</div>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="text-xs px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default VideoErrorBoundary;