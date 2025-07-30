import { useCallback } from 'react';
import {
  Box,
  Typography,
  Slider,
  TextField,
  FormControlLabel,
  Switch,
  Paper,
  Alert
} from '@mui/material';
import { AccessTime, Warning, Error } from '@mui/icons-material';
import type { TimeThresholdSettings, BadgeDisplaySettings } from '../types/badgeSettings';

interface TimeThresholdSettingsProps {
  readonly settings: TimeThresholdSettings;
  readonly displaySettings: BadgeDisplaySettings;
  readonly onChange: (settings: TimeThresholdSettings) => void;
  readonly onDisplayChange: (settings: BadgeDisplaySettings) => void;
}

// Helper functions for time conversion
const msToMinutes = (ms: number): number => Math.round(ms / (60 * 1000));
const minutesToMs = (minutes: number): number => minutes * 60 * 1000;
const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / (60 * 1000));
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
};

export default function TimeThresholdSettings({
  settings,
  displaySettings,
  onChange,
  onDisplayChange
}: TimeThresholdSettingsProps) {
  const handleMinimalChange = useCallback((value: number) => {
    const newMs = minutesToMs(value);
    onChange({
      ...settings,
      minimal: newMs
    });
  }, [settings, onChange]);

  const handleSignificantChange = useCallback((value: number) => {
    const newMs = minutesToMs(value);
    onChange({
      ...settings,
      significant: newMs
    });
  }, [settings, onChange]);

  const handleCriticalChange = useCallback((value: number) => {
    const newMs = minutesToMs(value);
    onChange({
      ...settings,
      critical: newMs
    });
  }, [settings, onChange]);

  const handleShowTimeBadgeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onDisplayChange({
      ...displaySettings,
      showTimeBadge: event.target.checked
    });
  }, [displaySettings, onDisplayChange]);

  const handleColorCodingChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onDisplayChange({
      ...displaySettings,
      colorCoding: event.target.checked
    });
  }, [displaySettings, onDisplayChange]);

  const minimalMinutes = msToMinutes(settings.minimal);
  const significantMinutes = msToMinutes(settings.significant);
  const criticalMinutes = msToMinutes(settings.critical);

  // Validation warnings
  const hasWarnings = minimalMinutes >= significantMinutes || significantMinutes >= criticalMinutes;

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AccessTime />
        Time Badge Thresholds
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Configure when time badges should appear and change color based on accumulated time.
      </Typography>

      {hasWarnings && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Thresholds should increase: Minimal &lt; Significant &lt; Critical
        </Alert>
      )}

      {/* Display Options */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Display Options</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={displaySettings.showTimeBadge}
              onChange={handleShowTimeBadgeChange}
            />
          }
          label="Show time badge"
        />
        <FormControlLabel
          control={
            <Switch
              checked={displaySettings.colorCoding}
              onChange={handleColorCodingChange}
              disabled={!displaySettings.showTimeBadge}
            />
          }
          label="Enable color coding based on thresholds"
        />
      </Paper>

      {/* Threshold Settings */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>Threshold Values</Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Minimal Threshold */}
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Minimal Threshold: {formatDuration(settings.minimal)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Time badge appears when total time exceeds this value
              </Typography>
              <Slider
                value={minimalMinutes}
                onChange={(_, value) => handleMinimalChange(value as number)}
                min={1}
                max={120}
                step={1}
                marks={[
                  { value: 5, label: '5m' },
                  { value: 15, label: '15m' },
                  { value: 30, label: '30m' },
                  { value: 60, label: '1h' },
                  { value: 120, label: '2h' }
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}m`}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  size="small"
                  type="number"
                  value={minimalMinutes}
                  onChange={(e) => handleMinimalChange(parseInt(e.target.value) || 0)}
                  slotProps={{
                    htmlInput: { min: 1, max: 1440 }
                  }}
                  label="Minutes"
                  sx={{ width: 120 }}
                />
              </Box>
            </Box>
          </Box>

          {/* Significant Threshold */}
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Warning color="warning" fontSize="small" />
                Significant Threshold: {formatDuration(settings.significant)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Badge changes to warning color when time exceeds this value
              </Typography>
              <Slider
                value={significantMinutes}
                onChange={(_, value) => handleSignificantChange(value as number)}
                min={minimalMinutes + 1}
                max={240}
                step={5}
                marks={[
                  { value: 30, label: '30m' },
                  { value: 60, label: '1h' },
                  { value: 120, label: '2h' },
                  { value: 180, label: '3h' },
                  { value: 240, label: '4h' }
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}m`}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  size="small"
                  type="number"
                  value={significantMinutes}
                  onChange={(e) => handleSignificantChange(parseInt(e.target.value) || 0)}
                  slotProps={{
                    htmlInput: { min: minimalMinutes + 1, max: 1440 }
                  }}
                  label="Minutes"
                  sx={{ width: 120 }}
                />
              </Box>
            </Box>
          </Box>

          {/* Critical Threshold */}
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Error color="error" fontSize="small" />
                Critical Threshold: {formatDuration(settings.critical)}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Badge changes to error color when time exceeds this value
              </Typography>
              <Slider
                value={criticalMinutes}
                onChange={(_, value) => handleCriticalChange(value as number)}
                min={significantMinutes + 1}
                max={480}
                step={15}
                marks={[
                  { value: 120, label: '2h' },
                  { value: 180, label: '3h' },
                  { value: 240, label: '4h' },
                  { value: 360, label: '6h' },
                  { value: 480, label: '8h' }
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value}m`}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField
                  size="small"
                  type="number"
                  value={criticalMinutes}
                  onChange={(e) => handleCriticalChange(parseInt(e.target.value) || 0)}
                  slotProps={{
                    htmlInput: { min: significantMinutes + 1, max: 1440 }
                  }}
                  label="Minutes"
                  sx={{ width: 120 }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Summary */}
      <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom>Summary</Typography>
        <Typography variant="body2">
          • Badge appears when total time exceeds <strong>{formatDuration(settings.minimal)}</strong>
        </Typography>
        <Typography variant="body2">
          • Badge shows warning color after <strong>{formatDuration(settings.significant)}</strong>
        </Typography>
        <Typography variant="body2">
          • Badge shows error color after <strong>{formatDuration(settings.critical)}</strong>
        </Typography>
      </Paper>
    </Box>
  );
}
