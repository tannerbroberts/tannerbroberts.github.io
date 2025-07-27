import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import {
  Storage,
  Backup,
  CheckCircle,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material';
import { migrationService, MigrationResult, checkMigrationStatus } from './migrationService';
import { featureFlags } from './featureFlags';
import { useAppState } from '../../reducerContexts/App';

interface AppMigratorProps {
  readonly onMigrationComplete: (result: MigrationResult) => void;
  readonly onMigrationSkipped: () => void;
}

export function AppMigrator({
  onMigrationComplete,
  onMigrationSkipped
}: AppMigratorProps) {
  const currentState = useAppState();
  const [migrationNeeded, setMigrationNeeded] = useState<boolean>(false);
  const [migrationInProgress, setMigrationInProgress] = useState<boolean>(false);
  const [migrationStep] = useState<string>('');
  const [migrationProgress] = useState<number>(0);
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if migration is needed on mount
  useEffect(() => {
    checkMigrationNeeded();
  }, []);

  const checkMigrationNeeded = async (): Promise<void> => {
    try {
      const status = await checkMigrationStatus();
      setMigrationNeeded(status.needsMigration);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check migration status');
    }
  };

  const handleStartMigration = useCallback(async (): Promise<void> => {
    setMigrationInProgress(true);
    setError(null);

    try {
      const result = await migrationService.migrateToStorageSystem(currentState, {
        createBackup: true,
        validateData: true,
        repairData: true,
        preserveUIState: true,
        dryRun: false
      });

      setMigrationResult(result);

      if (result.success) {
        // Enable local storage feature flag
        featureFlags.setOverride('enableLocalStorage', true);
        featureFlags.saveOverrides();
        onMigrationComplete(result);
      } else {
        setError(result.errors.join('; '));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Migration failed');
    } finally {
      setMigrationInProgress(false);
    }
  }, [currentState, onMigrationComplete]);

  const handleSkipMigration = useCallback((): void => {
    featureFlags.setOverride('enableLocalStorage', false);
    featureFlags.saveOverrides();
    onMigrationSkipped();
  }, [onMigrationSkipped]);

  const handleRollback = useCallback(async (): Promise<void> => {
    if (!migrationResult?.migrationId) return;

    try {
      setMigrationInProgress(true);
      await migrationService.rollbackMigration(migrationResult.migrationId);

      // Disable local storage feature flag
      featureFlags.setOverride('enableLocalStorage', false);
      featureFlags.saveOverrides();

      // Reload the page to reset state
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rollback failed');
    } finally {
      setMigrationInProgress(false);
    }
  }, [migrationResult]);

  // Don't show if migration not needed
  if (!migrationNeeded) {
    return <></>;
  }

  return (
    <Dialog
      open={true}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
      aria-labelledby="migration-dialog-title"
    >
      <DialogTitle id="migration-dialog-title">
        <Box display="flex" alignItems="center" gap={2}>
          <Storage color="primary" />
          <Typography variant="h5">
            Enable Data Persistence
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {!migrationInProgress && !migrationResult && (
          <MigrationIntroduction />
        )}

        {migrationInProgress && (
          <MigrationProgress
            step={migrationStep}
            progress={migrationProgress}
          />
        )}

        {migrationResult && (
          <MigrationResults
            result={migrationResult}
            onRollback={handleRollback}
          />
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        {!migrationInProgress && !migrationResult && (
          <>
            <Button onClick={handleSkipMigration}>
              Skip for Now
            </Button>
            <Button
              variant="contained"
              onClick={handleStartMigration}
              startIcon={<Storage />}
            >
              Enable Persistence
            </Button>
          </>
        )}

        {migrationResult?.success && (
          <Button
            variant="contained"
            onClick={() => onMigrationComplete(migrationResult)}
          >
            Continue
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

// Sub-components
function MigrationIntroduction() {
  return (
    <Box>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Enable data persistence to keep your tasks and schedule across browser sessions.
      </Typography>

      <Typography variant="h6" gutterBottom>
        What will happen:
      </Typography>

      <List>
        <ListItem>
          <ListItemIcon>
            <Backup color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Create backup"
            secondary="Your current data will be backed up for safety"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <Storage color="primary" />
          </ListItemIcon>
          <ListItemText
            primary="Enable storage"
            secondary="Data will be saved to your browser's local storage"
          />
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <CheckCircle color="success" />
          </ListItemIcon>
          <ListItemText
            primary="Verify data"
            secondary="Ensure all data was migrated correctly"
          />
        </ListItem>
      </List>

      <Alert severity="info" sx={{ mt: 2 }}>
        Your data will only be stored locally in your browser. No data is sent to external servers.
      </Alert>
    </Box>
  );
}

function MigrationProgress({ step, progress }: { readonly step: string; readonly progress: number }) {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Migrating your data...
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {step}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{ mt: 1 }}
        />
        <Typography variant="caption" color="text.secondary">
          {Math.round(progress)}% complete
        </Typography>
      </Box>

      <Stepper orientation="vertical" activeStep={Math.floor(progress / 20)}>
        <Step>
          <StepLabel>Creating backup</StepLabel>
        </Step>
        <Step>
          <StepLabel>Validating data</StepLabel>
        </Step>
        <Step>
          <StepLabel>Migrating items</StepLabel>
        </Step>
        <Step>
          <StepLabel>Migrating calendar</StepLabel>
        </Step>
        <Step>
          <StepLabel>Verifying migration</StepLabel>
        </Step>
        <Step>
          <StepLabel>Enabling persistence</StepLabel>
        </Step>
      </Stepper>
    </Box>
  );
}

function MigrationResults({
  result,
  onRollback
}: {
  readonly result: MigrationResult;
  readonly onRollback: () => void
}) {
  if (result.success) {
    return (
      <Box>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <CheckCircle color="success" />
          <Typography variant="h6" color="success.main">
            Migration Complete!
          </Typography>
        </Box>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Your data has been successfully migrated to persistent storage.
          Your tasks and schedule will now be saved across browser sessions.
        </Typography>

        {result.warnings.length > 0 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            <Typography variant="subtitle2">Warnings:</Typography>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {result.warnings.map((warning) => (
                <li key={warning.substring(0, 50)}>{warning}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
          Migration completed in {result.executionTime}ms
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} mb={2}>
        <ErrorIcon color="error" />
        <Typography variant="h6" color="error.main">
          Migration Failed
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 2 }}>
        The migration could not be completed. Your data has not been changed.
      </Typography>

      <Alert severity="error" sx={{ mt: 2 }}>
        <Typography variant="subtitle2">Errors:</Typography>
        <ul style={{ margin: 0, paddingLeft: 20 }}>
          {result.errors.map((error) => (
            <li key={error.substring(0, 50)}>{error}</li>
          ))}
        </ul>
      </Alert>

      {result.rollbackAvailable && (
        <Box sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            color="warning"
            onClick={onRollback}
            startIcon={<Warning />}
          >
            Rollback Changes
          </Button>
        </Box>
      )}
    </Box>
  );
}
