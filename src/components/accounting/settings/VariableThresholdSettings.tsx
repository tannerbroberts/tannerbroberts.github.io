import { useCallback, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Switch,
  Paper,
  Button,
  Chip,
  IconButton
} from '@mui/material';
import { Star, Add, Delete } from '@mui/icons-material';
import type { VariableThresholdSettings, BadgeDisplaySettings } from '../types/badgeSettings';

interface VariableThresholdSettingsProps {
  readonly settings: VariableThresholdSettings;
  readonly displaySettings: BadgeDisplaySettings;
  readonly onChange: (settings: VariableThresholdSettings) => void;
  readonly onDisplayChange: (settings: BadgeDisplaySettings) => void;
}

export default function VariableThresholdSettings({
  settings,
  displaySettings,
  onChange,
  onDisplayChange
}: VariableThresholdSettingsProps) {
  const [newCategoryName, setNewCategoryName] = useState('');

  const handleDefaultMinimumChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value) || 0;
    onChange({
      ...settings,
      defaultMinimum: Math.max(0, value)
    });
  }, [settings, onChange]);

  const handleShowVariableBadgeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onDisplayChange({
      ...displaySettings,
      showVariableBadge: event.target.checked
    });
  }, [displaySettings, onDisplayChange]);

  const handleCategoryThresholdChange = useCallback((category: string, value: number) => {
    onChange({
      ...settings,
      categorySpecific: {
        ...settings.categorySpecific,
        [category]: Math.max(0, value)
      }
    });
  }, [settings, onChange]);

  const handleAlertThresholdChange = useCallback((level: string, value: number) => {
    onChange({
      ...settings,
      alertThresholds: {
        ...settings.alertThresholds,
        [level]: Math.max(0, value)
      }
    });
  }, [settings, onChange]);

  const handleAddCategory = useCallback(() => {
    if (newCategoryName.trim() && !settings.categorySpecific[newCategoryName.trim()]) {
      onChange({
        ...settings,
        categorySpecific: {
          ...settings.categorySpecific,
          [newCategoryName.trim()]: settings.defaultMinimum
        }
      });
      setNewCategoryName('');
    }
  }, [newCategoryName, settings, onChange]);

  const handleRemoveCategory = useCallback((category: string) => {
    const { [category]: _, ...remaining } = settings.categorySpecific;
    onChange({
      ...settings,
      categorySpecific: remaining
    });
  }, [settings, onChange]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Star />
        Variable Badge Thresholds
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Configure when variable badges should appear based on the number of distinct variables requiring accounting.
      </Typography>

      {/* Display Options */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Display Options</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={displaySettings.showVariableBadge}
              onChange={handleShowVariableBadgeChange}
            />
          }
          label="Show variable badge"
        />
      </Paper>

      {/* Default Threshold */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Default Threshold</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Minimum number of variables to trigger badge display for uncategorized variables.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 2 }}>
          <TextField
            size="small"
            type="number"
            value={settings.defaultMinimum}
            onChange={handleDefaultMinimumChange}
            slotProps={{
              htmlInput: { min: 0, max: 100 }
            }}
            label="Default minimum variables"
            sx={{ width: 200 }}
          />
          <Typography variant="caption" color="text.secondary">
            variables required to show badge
          </Typography>
        </Box>
      </Paper>

      {/* Category-Specific Thresholds */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Category-Specific Thresholds</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Set different thresholds for specific variable categories. These override the default threshold.
        </Typography>

        {/* Existing categories */}
        {Object.entries(settings.categorySpecific).length > 0 && (
          <Box sx={{ mb: 2 }}>
            {Object.entries(settings.categorySpecific).map(([category, threshold]) => (
              <Box key={category} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                <Chip
                  label={category}
                  size="small"
                  variant="outlined"
                  sx={{ minWidth: 80 }}
                />
                <TextField
                  size="small"
                  type="number"
                  value={threshold}
                  onChange={(e) => handleCategoryThresholdChange(category, parseInt(e.target.value) || 0)}
                  slotProps={{
                    htmlInput: { min: 0, max: 100 }
                  }}
                  label="Threshold"
                  sx={{ width: 120 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ minWidth: 60 }}>
                  variables
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveCategory(category)}
                  color="error"
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        {/* Add new category */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            size="small"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name"
            sx={{ width: 150 }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddCategory();
              }
            }}
          />
          <Button
            size="small"
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddCategory}
            disabled={!newCategoryName.trim() || Boolean(settings.categorySpecific[newCategoryName.trim()])}
          >
            Add Category
          </Button>
        </Box>
      </Paper>

      {/* Alert Thresholds */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Alert Thresholds</Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Configure when badges should change color to indicate high variable counts.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {Object.entries(settings.alertThresholds).map(([level, threshold]) => (
            <Box key={level} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Chip
                label={level.charAt(0).toUpperCase() + level.slice(1)}
                size="small"
                color={level === 'critical' ? 'error' : 'warning'}
                sx={{ minWidth: 80 }}
              />
              <TextField
                size="small"
                type="number"
                value={threshold}
                onChange={(e) => handleAlertThresholdChange(level, parseInt(e.target.value) || 0)}
                slotProps={{
                  htmlInput: { min: 1, max: 1000 }
                }}
                label={`${level} threshold`}
                sx={{ width: 150 }}
              />
              <Typography variant="caption" color="text.secondary">
                variables to trigger {level} color
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Summary */}
      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom>Summary</Typography>
        <Typography variant="body2">
          • Badge appears when variables exceed <strong>{settings.defaultMinimum}</strong> (default)
        </Typography>
        {Object.entries(settings.categorySpecific).map(([category, threshold]) => (
          <Typography key={category} variant="body2">
            • <strong>{category}</strong> variables: threshold of <strong>{threshold}</strong>
          </Typography>
        ))}
        {Object.entries(settings.alertThresholds).map(([level, threshold]) => (
          <Typography key={level} variant="body2">
            • Badge shows <strong>{level}</strong> color after <strong>{threshold}</strong> variables
          </Typography>
        ))}
      </Paper>
    </Box>
  );
}
