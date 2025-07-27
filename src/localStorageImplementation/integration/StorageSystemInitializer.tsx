import { useState, useEffect, ReactNode } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { featureFlags } from './featureFlags';
import { AppProvider } from '../../reducerContexts/App';
import { StorageAwareAppProvider } from '../StorageAwareAppProvider';
import { AppMigrator } from './AppMigrator';
import { MigrationResult, checkMigrationStatus } from './migrationService';

interface StorageSystemInitializerProps {
  readonly children: ReactNode;
}

export function StorageSystemInitializer({
  children
}: StorageSystemInitializerProps) {
  const [initializationComplete, setInitializationComplete] = useState(false);
  const [useStorageSystem, setUseStorageSystem] = useState(false);
  const [showMigrator, setShowMigrator] = useState(false);

  useEffect(() => {
    initializeStorageSystem();
  }, []);

  const initializeStorageSystem = async (): Promise<void> => {
    try {
      // Check feature flags
      const storageEnabled = featureFlags.isEnabled('enableLocalStorage');

      if (storageEnabled) {
        setUseStorageSystem(true);
        setInitializationComplete(true);
      } else {
        // Check if migration is available and needed
        const migrationStatus = await checkMigrationStatus();

        if (migrationStatus.needsMigration && featureFlags.isEnabled('enableAutoMigration')) {
          setShowMigrator(true);
        } else {
          setUseStorageSystem(false);
          setInitializationComplete(true);
        }
      }
    } catch (error) {
      console.error('Failed to initialize storage system:', error);
      // Fall back to non-persistent system
      setUseStorageSystem(false);
      setInitializationComplete(true);
    }
  };

  const handleMigrationComplete = (result: MigrationResult): void => {
    if (result.success) {
      setUseStorageSystem(true);
    }
    setShowMigrator(false);
    setInitializationComplete(true);
  };

  const handleMigrationSkipped = (): void => {
    setUseStorageSystem(false);
    setShowMigrator(false);
    setInitializationComplete(true);
  };

  // Show loading while initializing
  if (!initializationComplete) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Initializing About Time...
        </Typography>
      </Box>
    );
  }

  // Show migrator if needed
  if (showMigrator) {
    return (
      <AppProvider>
        {children}
        <AppMigrator
          onMigrationComplete={handleMigrationComplete}
          onMigrationSkipped={handleMigrationSkipped}
        />
      </AppProvider>
    );
  }

  // Use appropriate provider based on storage system
  const Provider = useStorageSystem ? StorageAwareAppProvider : AppProvider;

  return (
    <Provider>
      {children}
    </Provider>
  );
}
