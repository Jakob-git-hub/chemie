import { Component, ErrorInfo, ReactNode } from 'react';
import ErrorCard from './ErrorCard';

interface Props {
  children: ReactNode;
  fallbackError?: string;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const errorMessage =
        this.props.fallbackError || this.state.error?.message || 'Ein unerwarteter Fehler ist aufgetreten.';
      return <ErrorCard error={errorMessage} onRetry={this.handleReset} />;
    }
    return this.props.children;
  }
}
