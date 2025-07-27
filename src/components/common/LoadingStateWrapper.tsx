import React from 'react';
import { Box, Typography, Fade } from '@mui/material';
import SkeletonCard from './SkeletonCard';

interface LoadingStateWrapperProps {
  readonly loading: boolean;
  readonly error?: string | null;
  readonly empty?: boolean;
  readonly emptyMessage?: string;
  readonly loadingComponent?: React.ReactNode;
  readonly skeletonVariant?: 'instance' | 'variable' | 'execution';
  readonly skeletonCount?: number;
  readonly children: React.ReactNode;
}

export default function LoadingStateWrapper({
  loading,
  error,
  empty = false,
  emptyMessage = "No data available",
  loadingComponent,
  skeletonVariant = 'instance',
  skeletonCount = 3,
  children
}: LoadingStateWrapperProps) {
  if (loading) {
    return (
      <Fade in timeout={300}>
        <Box>
          {loadingComponent || <SkeletonCard variant={skeletonVariant} count={skeletonCount} />}
        </Box>
      </Fade>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Data
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {error}
        </Typography>
      </Box>
    );
  }

  if (empty) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          {emptyMessage}
        </Typography>
      </Box>
    );
  }

  return <>{children}</>;
}
