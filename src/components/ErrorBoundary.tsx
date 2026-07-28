import { Component } from 'react';
import ErrorCard from './ErrorCard';

interface Props {
  children: React.ReactNode;
  fallbackError?: string;
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

  render() {
    if (this.state.hasError) {
      const errorMessage = this.props.fallbackError || this.state.error?.message || 'An unexpected error occurred';
      return <ErrorCard error={errorMessage} />;
    }
    return this.props.children;
  }
}