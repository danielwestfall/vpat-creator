import { Component, type ErrorInfo, type ReactNode } from 'react';
import './ErrorBoundary.css';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    this.setState({
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="error-boundary" role="alert">
          <div className="error-boundary__content">
            <div className="error-boundary__icon" aria-hidden="true">
              ⚠️
            </div>
            <h1 className="error-boundary__title">Something went wrong</h1>
            <p className="error-boundary__message">
              We're sorry, but something unexpected happened. Please try refreshing the page or
              contact support if the problem persists.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="error-boundary__details">
                <summary>Error details (development only)</summary>
                <pre className="error-boundary__stack">
                  <code>
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </code>
                </pre>
              </details>
            )}

            <div className="error-boundary__actions">
              <button
                type="button"
                className="error-boundary__button error-boundary__button--primary"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </button>
              <button
                type="button"
                className="error-boundary__button error-boundary__button--secondary"
                onClick={this.handleReset}
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
