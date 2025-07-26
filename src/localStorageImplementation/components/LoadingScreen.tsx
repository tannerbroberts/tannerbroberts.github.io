import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import type { StorageStatus } from '../hooks/useStorageStatus';

interface LoadingScreenProps {
  readonly status: StorageStatus;
}

export function LoadingScreen({ status }: LoadingScreenProps): React.JSX.Element {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      padding={3}
      sx={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white'
      }}
    >
      {status.isLoading && (
        <>
          <CircularProgress
            size={60}
            sx={{ color: 'white', mb: 2 }}
          />
          <Typography variant="h6" sx={{ mt: 2, textAlign: 'center' }}>
            Loading your data...
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, textAlign: 'center', opacity: 0.8 }}>
            Restoring items and schedule from storage
          </Typography>
        </>
      )}

      {status.error && (
        <Alert
          severity="warning"
          sx={{
            mt: 2,
            maxWidth: 600,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white'
            }
          }}
        >
          <Typography variant="body2">
            {status.error}
          </Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.8 }}>
            Don&apos;t worry - your data is safe. The app will continue with default settings.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
