import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Settings,
  Close,
  RestoreSharp
} from '@mui/icons-material';
import { useBadgeSettings } from '../contexts/BadgeSettingsContext';
import type { BadgeSettings } from '../types/badgeSettings';
import { DEFAULT_BADGE_SETTINGS, validateBadgeSettings } from '../types/badgeSettings';
import TimeThresholdSettings from './TimeThresholdSettings';
import VariableThresholdSettings from './VariableThresholdSettings';
import BadgePreview from './BadgePreview';
import SettingsImportExport from './SettingsImportExport';

interface BadgeSettingsDialogProps {
  open: boolean;
  onClose: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: Readonly<TabPanelProps>) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  };
}

export default function BadgeSettingsDialog({ open, onClose }: Readonly<BadgeSettingsDialogProps>) {
  const { settings, updateSettings, isLoading, error } = useBadgeSettings();
  const [localSettings, setLocalSettings] = useState<BadgeSettings>(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Update local settings when context settings change
  useEffect(() => {
    setLocalSettings(settings);
    setHasChanges(false);
    setValidationError(null);
  }, [settings]);

  // Validate settings whenever they change
  useEffect(() => {
    const validation = validateBadgeSettings(localSettings);
    if (!validation.isValid) {
      setValidationError(validation.errors.join(', '));
    } else {
      setValidationError(null);
    }
  }, [localSettings]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleTimeThresholdsChange = useCallback((timeThresholds: BadgeSettings['timeThresholds']) => {
    setLocalSettings(prev => ({ ...prev, timeThresholds }));
    setHasChanges(true);
  }, []);

  const handleVariableThresholdsChange = useCallback((variableThresholds: BadgeSettings['variableThresholds']) => {
    setLocalSettings(prev => ({ ...prev, variableThresholds }));
    setHasChanges(true);
  }, []);

  const handleDisplaySettingsChange = useCallback((displaySettings: BadgeSettings['displaySettings']) => {
    setLocalSettings(prev => ({ ...prev, displaySettings }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(async () => {
    try {
      await updateSettings(localSettings);
      setHasChanges(false);
      onClose();
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [localSettings, updateSettings, onClose]);

  const handleCancel = useCallback(() => {
    setLocalSettings(settings);
    setHasChanges(false);
    setValidationError(null);
    onClose();
  }, [settings, onClose]);

  const handleReset = useCallback(() => {
    setLocalSettings(DEFAULT_BADGE_SETTINGS);
    setHasChanges(true);
  }, []);

  const handleImport = useCallback((importedSettings: BadgeSettings) => {
    setLocalSettings(importedSettings);
    setHasChanges(true);
  }, []);

  const handleExport = useCallback(() => {
    return localSettings;
  }, [localSettings]);

  const canSave = hasChanges && !validationError && !isLoading;

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      scroll="paper"
      aria-labelledby="badge-settings-dialog-title"
    >
      <DialogTitle
        id="badge-settings-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pr: 1
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings />
          <Typography variant="h6">Badge Settings</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Reset to defaults">
            <IconButton onClick={handleReset} size="small">
              <RestoreSharp />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close">
            <IconButton onClick={handleCancel} size="small">
              <Close />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {validationError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {validationError}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="settings tabs">
            <Tab label="Time Thresholds" {...a11yProps(0)} />
            <Tab label="Variable Thresholds" {...a11yProps(1)} />
            <Tab label="Preview" {...a11yProps(2)} />
            <Tab label="Import/Export" {...a11yProps(3)} />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <TimeThresholdSettings
            settings={localSettings.timeThresholds}
            displaySettings={localSettings.displaySettings}
            onChange={handleTimeThresholdsChange}
            onDisplayChange={handleDisplaySettingsChange}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <VariableThresholdSettings
            settings={localSettings.variableThresholds}
            displaySettings={localSettings.displaySettings}
            onChange={handleVariableThresholdsChange}
            onDisplayChange={handleDisplaySettingsChange}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <BadgePreview settings={localSettings} />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <SettingsImportExport
            onImport={handleImport}
            onExport={handleExport}
          />
        </TabPanel>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            {hasChanges && (
              <Typography variant="caption" color="info.main">
                You have unsaved changes
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={!canSave}
            >
              Save Settings
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
