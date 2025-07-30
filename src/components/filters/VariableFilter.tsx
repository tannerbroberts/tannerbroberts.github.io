import { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Typography,
  Autocomplete,
  Paper,
  Divider,
  Tooltip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Speed as SpeedIcon
} from '@mui/icons-material';
import { VariableFilterCriteria, FilterOperator } from '../../functions/utils/filtering/filterTypes';
import { parseVariableFilter, filterToString } from '../../functions/utils/filtering/variableFilterParser';

interface VariableFilterProps {
  readonly availableVariables: string[];
  readonly activeFilters: VariableFilterCriteria[];
  readonly onAddFilter: (filter: VariableFilterCriteria) => void;
  readonly onRemoveFilter: (index: number) => void;
  readonly onClearAll: () => void;
  readonly combineMode: 'AND' | 'OR';
  readonly onCombineModeChange: (mode: 'AND' | 'OR') => void;
  readonly isEnabled: boolean;
  readonly onEnabledChange: (enabled: boolean) => void;
  readonly performanceMetrics?: {
    readonly executionTime: number;
    readonly itemsEvaluated: number;
    readonly itemsFiltered: number;
  } | null;
}

const OPERATORS: { value: FilterOperator; label: string; description: string }[] = [
  { value: 'gte', label: '>=', description: 'Greater than or equal to' },
  { value: 'lte', label: '<=', description: 'Less than or equal to' },
  { value: 'gt', label: '>', description: 'Greater than' },
  { value: 'lt', label: '<', description: 'Less than' },
  { value: 'eq', label: '=', description: 'Equal to' },
  { value: 'ne', label: '!=', description: 'Not equal to' },
  { value: 'range', label: 'between', description: 'Between two values' }
];

export default function VariableFilter({
  availableVariables,
  activeFilters,
  onAddFilter,
  onRemoveFilter,
  onClearAll,
  combineMode,
  onCombineModeChange,
  isEnabled,
  onEnabledChange,
  performanceMetrics
}: VariableFilterProps) {
  const [newFilter, setNewFilter] = useState<Partial<VariableFilterCriteria>>({
    variableName: '',
    operator: 'gte',
    value: 0
  });
  const [parseError, setParseError] = useState<string>('');
  const [quickFilterInput, setQuickFilterInput] = useState('');

  // Quick filter parsing
  const handleQuickFilterSubmit = useCallback(() => {
    if (!quickFilterInput.trim()) return;

    const parseResult = parseVariableFilter(quickFilterInput);
    if (parseResult.isValid && parseResult.criteria) {
      onAddFilter(parseResult.criteria);
      setQuickFilterInput('');
      setParseError('');
    } else {
      setParseError(parseResult.error || 'Invalid filter syntax');
    }
  }, [quickFilterInput, onAddFilter]);

  // Manual filter creation
  const handleAddFilter = useCallback(() => {
    if (!newFilter.variableName || newFilter.value === undefined) {
      setParseError('Please fill in all required fields');
      return;
    }

    const filter: VariableFilterCriteria = {
      variableName: newFilter.variableName,
      operator: newFilter.operator || 'gte',
      value: newFilter.value,
      maxValue: newFilter.maxValue,
      unit: newFilter.unit
    };

    onAddFilter(filter);
    setNewFilter({
      variableName: '',
      operator: 'gte',
      value: 0
    });
    setParseError('');
  }, [newFilter, onAddFilter]);

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterIcon sx={{ mr: 1 }} />
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Variable Filters
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isEnabled}
              onChange={(e) => onEnabledChange(e.target.checked)}
              color="primary"
            />
          }
          label="Enable"
        />
      </Box>

      {isEnabled && (
        <>
          <Divider sx={{ mb: 2 }} />

          {/* Quick Filter Input */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Quick Filter (Natural Language)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder='e.g., "eggs >= 5", "fat <= 10", "milk between 1 and 3"'
                value={quickFilterInput}
                onChange={(e) => setQuickFilterInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickFilterSubmit()}
                error={!!parseError}
                helperText={parseError}
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleQuickFilterSubmit}
                disabled={!quickFilterInput.trim()}
              >
                Add
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Manual Filter Builder */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Manual Filter Builder
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              <Autocomplete
                size="small"
                options={availableVariables}
                value={newFilter.variableName || ''}
                onChange={(_e, value) => setNewFilter(prev => ({ ...prev, variableName: value || '' }))}
                renderInput={(params) => (
                  <TextField {...params} label="Variable" sx={{ minWidth: 120 }} />
                )}
                sx={{ flexGrow: 1, minWidth: 120 }}
              />

              <FormControl size="small" sx={{ minWidth: 80 }}>
                <InputLabel>Operator</InputLabel>
                <Select
                  value={newFilter.operator || 'gte'}
                  onChange={(e) => setNewFilter(prev => ({ ...prev, operator: e.target.value as FilterOperator }))}
                  label="Operator"
                >
                  {OPERATORS.map(op => (
                    <MenuItem key={op.value} value={op.value}>
                      <Tooltip title={op.description} placement="right">
                        <span>{op.label}</span>
                      </Tooltip>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                size="small"
                label="Value"
                type="number"
                value={newFilter.value || 0}
                onChange={(e) => setNewFilter(prev => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                sx={{ width: 80 }}
              />

              {newFilter.operator === 'range' && (
                <TextField
                  size="small"
                  label="Max"
                  type="number"
                  value={newFilter.maxValue || 0}
                  onChange={(e) => setNewFilter(prev => ({ ...prev, maxValue: parseFloat(e.target.value) || 0 }))}
                  sx={{ width: 80 }}
                />
              )}

              <TextField
                size="small"
                label="Unit (optional)"
                value={newFilter.unit || ''}
                onChange={(e) => setNewFilter(prev => ({ ...prev, unit: e.target.value }))}
                sx={{ width: 100 }}
              />

              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleAddFilter}
                disabled={!newFilter.variableName || newFilter.value === undefined}
              >
                Add
              </Button>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Active Filters */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2">
                Active Filters ({activeFilters.length})
              </Typography>
              {activeFilters.length > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FormControl size="small">
                    <InputLabel>Combine</InputLabel>
                    <Select
                      value={combineMode}
                      onChange={(e) => onCombineModeChange(e.target.value as 'AND' | 'OR')}
                      label="Combine"
                    >
                      <MenuItem value="AND">AND (all must match)</MenuItem>
                      <MenuItem value="OR">OR (any must match)</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    size="small"
                    startIcon={<ClearIcon />}
                    onClick={onClearAll}
                    color="error"
                  >
                    Clear All
                  </Button>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {activeFilters.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No active filters. Add filters above to start filtering items.
                </Typography>
              ) : (
                activeFilters.map((filter, index) => (
                  <Chip
                    key={`${filter.variableName}-${filter.operator}-${filter.value}-${index}`}
                    label={filterToString(filter)}
                    onDelete={() => onRemoveFilter(index)}
                    deleteIcon={<DeleteIcon />}
                    color="primary"
                    variant="outlined"
                  />
                ))
              )}
            </Box>
          </Box>

          {/* Performance Metrics */}
          {performanceMetrics && (
            <>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <SpeedIcon color="action" />
                <Typography variant="caption" color="text.secondary">
                  Filtered {performanceMetrics.itemsFiltered} of {performanceMetrics.itemsEvaluated} items
                  in {performanceMetrics.executionTime.toFixed(1)}ms
                </Typography>
              </Box>
            </>
          )}
        </>
      )}
    </Paper>
  );
}
