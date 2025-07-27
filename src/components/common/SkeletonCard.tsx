import React from 'react';
import { Card, CardContent, Skeleton, Box } from '@mui/material';

interface SkeletonCardProps {
  readonly variant?: 'instance' | 'variable' | 'execution';
  readonly count?: number;
}

export default function SkeletonCard({ variant = 'instance', count = 1 }: SkeletonCardProps) {
  const renderInstanceSkeleton = () => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Skeleton variant="text" width="40%" height={32} />
          <Skeleton variant="rounded" width={80} height={24} />
        </Box>
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={20} sx={{ mb: 2 }} />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rounded" width={60} height={20} />
          <Skeleton variant="rounded" width={80} height={20} />
        </Box>
      </CardContent>
    </Card>
  );

  const renderVariableSkeleton = () => (
    <Box sx={{ mb: 1 }}>
      <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Skeleton variant="rounded" width={80} height={32} />
        <Skeleton variant="rounded" width={80} height={32} />
        <Skeleton variant="rounded" width={80} height={32} />
      </Box>
    </Box>
  );

  const renderExecutionSkeleton = () => (
    <Box>
      <Skeleton variant="rounded" width="100%" height={60} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={20} />
    </Box>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'variable':
        return renderVariableSkeleton();
      case 'execution':
        return renderExecutionSkeleton();
      case 'instance':
      default:
        return renderInstanceSkeleton();
    }
  };

  return (
    <>
      {[...Array(count)].map((_, index) => (
        <React.Fragment key={`skeleton-${variant}-${index}`}>
          {renderSkeleton()}
        </React.Fragment>
      ))}
    </>
  );
}
