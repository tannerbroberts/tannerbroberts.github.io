import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { Refresh, BugReport } from '@mui/icons-material';

interface Props {
  readonly children: ReactNode;
  readonly fallback?: ReactNode;
  readonly onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    this.props.onError?.(error, errorInfo);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Paper sx={{ p: 3, m: 2, textAlign: 'center' }}>
          <Box sx={{ mb: 2 }}>
            <BugReport sx={{ fontSize: 48, color: 'error.main', mb: 1 }} />
            <Typography variant="h5" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              An unexpected error occurred. Please try refreshing or contact support if the problem persists.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={this.handleRetry}
            >
              Try Again
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Box>

          {process.env.NODE_ENV === 'development' && this.state.error && (
            <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Error Details (Development Mode):
              </Typography>
              <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                {this.state.error.message}
                {this.state.errorInfo?.componentStack}
              </Typography>
            </Alert>
          )}
        </Paper>
      );
    }

    return this.props.children;
  }
}
