import { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Badge
} from '@mui/material';
import { AccessTime, Star, Schedule, Warning, Error } from '@mui/icons-material';
import type { BadgeSettings } from '../types/badgeSettings';

interface BadgePreviewProps {
  readonly settings: BadgeSettings;
}

interface PreviewBadgeProps {
  readonly icon: React.ReactElement;
  readonly value: string | number;
  readonly color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  readonly label: string;
  readonly description: string;
}

function PreviewBadge({ icon, value, color = 'default', label, description }: PreviewBadgeProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
      <Badge badgeContent={value} color={color} max={999}>
        <Chip
          icon={icon}
          label={label}
          variant="outlined"
          size="small"
        />
      </Badge>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
        {description}
      </Typography>
    </Box>
  );
}

export default function BadgePreview({ settings }: BadgePreviewProps) {
  // Generate preview scenarios
  const timeScenarios = useMemo(() => {
    const { minimal, significant, critical } = settings.timeThresholds;

    return [
      {
        label: 'No Badge',
        time: minimal - 60000, // 1 minute less than minimal
        description: 'Time below minimal threshold'
      },
      {
        label: 'Minimal',
        time: minimal + 60000, // 1 minute more than minimal
        description: 'Shows badge, normal color'
      },
      {
        label: 'Significant',
        time: significant + 60000, // 1 minute more than significant
        description: 'Warning color'
      },
      {
        label: 'Critical',
        time: critical + 60000, // 1 minute more than critical
        description: 'Error color'
      }
    ];
  }, [settings.timeThresholds]);

  const variableScenarios = useMemo(() => {
    const { defaultMinimum, alertThresholds } = settings.variableThresholds;

    return [
      {
        label: 'No Badge',
        count: defaultMinimum - 1,
        description: 'Variables below threshold'
      },
      {
        label: 'Normal',
        count: defaultMinimum + 2,
        description: 'Shows badge, normal color'
      },
      {
        label: 'High Alert',
        count: alertThresholds.high + 2,
        description: 'Warning color'
      },
      {
        label: 'Critical',
        count: alertThresholds.critical + 2,
        description: 'Error color'
      }
    ];
  }, [settings.variableThresholds]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / (60 * 1000));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const getTimeColor = (time: number): 'default' | 'warning' | 'error' => {
    const { minimal, significant, critical } = settings.timeThresholds;

    if (time < minimal) return 'default';
    if (time < significant) return 'default';
    if (time < critical) return 'warning';
    return 'error';
  };

  const getVariableColor = (count: number): 'default' | 'warning' | 'error' => {
    const { defaultMinimum, alertThresholds } = settings.variableThresholds;

    if (count < defaultMinimum) return 'default';
    if (count < alertThresholds.high) return 'default';
    if (count < alertThresholds.critical) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Badge Preview
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        See how your badge settings will appear in different scenarios.
      </Typography>

      {/* Current Settings Summary */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle1" gutterBottom>Current Settings</Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="body2">
            <strong>Time Thresholds:</strong>
            {` ${formatTime(settings.timeThresholds.minimal)} → ${formatTime(settings.timeThresholds.significant)} → ${formatTime(settings.timeThresholds.critical)}`}
          </Typography>
          <Typography variant="body2">
            <strong>Variable Thresholds:</strong>
            {` ${settings.variableThresholds.defaultMinimum} → ${settings.variableThresholds.alertThresholds.high} → ${settings.variableThresholds.alertThresholds.critical}`}
          </Typography>
          <Typography variant="body2">
            <strong>Display:</strong>
            {` Time Badge: ${settings.displaySettings.showTimeBadge ? 'ON' : 'OFF'}, Variable Badge: ${settings.displaySettings.showVariableBadge ? 'ON' : 'OFF'}, Color Coding: ${settings.displaySettings.colorCoding ? 'ON' : 'OFF'}`}
          </Typography>
        </Box>
      </Paper>

      {/* Time Badge Preview */}
      {settings.displaySettings.showTimeBadge && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime />
            Time Badge Scenarios
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-around' }}>
            {timeScenarios.map((scenario) => (
              <PreviewBadge
                key={scenario.label}
                icon={<Schedule />}
                value={scenario.time >= settings.timeThresholds.minimal ? formatTime(scenario.time) : ''}
                color={settings.displaySettings.colorCoding ? getTimeColor(scenario.time) : 'default'}
                label={scenario.label}
                description={scenario.description}
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* Variable Badge Preview */}
      {settings.displaySettings.showVariableBadge && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star />
            Variable Badge Scenarios
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'space-around' }}>
            {variableScenarios.map((scenario) => (
              <PreviewBadge
                key={scenario.label}
                icon={<Star />}
                value={scenario.count >= settings.variableThresholds.defaultMinimum ? scenario.count : ''}
                color={settings.displaySettings.colorCoding ? getVariableColor(scenario.count) : 'default'}
                label={scenario.label}
                description={scenario.description}
              />
            ))}
          </Box>
        </Paper>
      )}

      {/* Category-Specific Preview */}
      {settings.displaySettings.showVariableBadge && Object.keys(settings.variableThresholds.categorySpecific).length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Category-Specific Thresholds
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {Object.entries(settings.variableThresholds.categorySpecific).map(([category, threshold]) => (
              <Box key={category} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip label={category} size="small" variant="outlined" />
                <Typography variant="body2">
                  Badge appears at <strong>{threshold}</strong> variables
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      {/* Disabled Badges Notice */}
      {(!settings.displaySettings.showTimeBadge && !settings.displaySettings.showVariableBadge) && (
        <Paper sx={{ p: 2, bgcolor: 'warning.light' }}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning />
            Both time and variable badges are disabled. Enable them in the respective threshold settings.
          </Typography>
        </Paper>
      )}

      {/* Color Coding Disabled Notice */}
      {(!settings.displaySettings.colorCoding && (settings.displaySettings.showTimeBadge || settings.displaySettings.showVariableBadge)) && (
        <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Error />
            Color coding is disabled. Badges will appear in default color regardless of threshold values.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
