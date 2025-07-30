import React, { useState, useCallback } from 'react';
import {
  Chip,
  Tooltip,
  Box,
  Typography,
  IconButton,
  Popover,
  Paper
} from '@mui/material';
import { Edit, Info } from '@mui/icons-material';
import { useVariableDescriptions } from '../../hooks/useVariableDescriptions';
import { useAppState } from '../../reducerContexts/App';
import DescriptionDisplay from './DescriptionDisplay';

interface VariableChipProps {
  variableName: string;
  value?: number;
  unit?: string;
  category?: string;
  size?: 'small' | 'medium';
  clickable?: boolean;
  onEdit?: (variableName: string) => void;
  onVariableClick?: (variableName: string) => void;
  showDescription?: boolean;
  disabled?: boolean;
}

export default function VariableChip({
  variableName,
  value,
  unit,
  category,
  size = 'medium',
  clickable = false,
  onEdit,
  onVariableClick,
  showDescription = true,
  disabled = false
}: Readonly<VariableChipProps>) {
  const { variableDefinitions } = useAppState();
  const { getDescription } = useVariableDescriptions();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Find the variable definition
  const variableDefinition = React.useMemo(() => {
    for (const [defId, definition] of variableDefinitions) {
      if (definition.name === variableName) {
        return { definitionId: defId, ...definition };
      }
    }
    return null;
  }, [variableDefinitions, variableName]);

  const description = variableDefinition ? getDescription(variableDefinition.definitionId) : undefined;

  const handleChipClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    if (disabled) return;

    if (clickable && onVariableClick) {
      onVariableClick(variableName);
    } else if (description && showDescription) {
      setAnchorEl(event.currentTarget);
    }
  }, [clickable, onVariableClick, variableName, description, showDescription, disabled]);

  const handlePopoverClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleEditClick = useCallback((event: React.MouseEvent) => {
    event.stopPropagation();
    if (onEdit) {
      onEdit(variableName);
    }
  }, [onEdit, variableName]);

  // Format the chip label
  const formatLabel = useCallback(() => {
    let label = variableName;

    if (value !== undefined) {
      const sign = value >= 0 ? '+' : '';
      label = `${sign}${value} ${label}`;
    }

    if (unit) {
      label += ` ${unit}`;
    }

    return label;
  }, [variableName, value, unit]);

  // Determine chip color based on category
  const getChipColor = useCallback(() => {
    if (disabled) return 'default';

    switch (category?.toLowerCase()) {
      case 'ingredients':
        return 'primary';
      case 'equipment':
        return 'secondary';
      case 'skills':
        return 'success';
      case 'food':
        return 'warning';
      case 'consumables':
        return 'info';
      default:
        return 'default';
    }
  }, [category, disabled]);

  const chipLabel = formatLabel();
  const chipColor = getChipColor();
  const popoverOpen = Boolean(anchorEl);

  // Simple tooltip for when there's no description
  if (!description || !showDescription) {
    const tooltipContent = variableDefinition ? (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {variableName}
        </Typography>
        {category && (
          <Typography variant="caption" color="text.secondary">
            Category: {category}
          </Typography>
        )}
        {!description && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            No description available
          </Typography>
        )}
      </Box>
    ) : (
      `Variable: ${variableName}`
    );

    return (
      <Tooltip title={tooltipContent} arrow>
        <Chip
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {chipLabel}
              {onEdit && (
                <IconButton
                  size="small"
                  onClick={handleEditClick}
                  sx={{
                    ml: 0.5,
                    p: 0.25,
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                  }}
                >
                  <Edit sx={{ fontSize: 12 }} />
                </IconButton>
              )}
            </Box>
          }
          size={size}
          color={chipColor}
          clickable={clickable}
          onClick={handleChipClick}
          disabled={disabled}
          variant={description ? 'filled' : 'outlined'}
        />
      </Tooltip>
    );
  }

  // Full description popover for variables with descriptions
  return (
    <>
      <Chip
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {chipLabel}
            <Info sx={{ fontSize: 14, opacity: 0.7 }} />
            {onEdit && (
              <IconButton
                size="small"
                onClick={handleEditClick}
                sx={{
                  ml: 0.5,
                  p: 0.25,
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
                }}
              >
                <Edit sx={{ fontSize: 12 }} />
              </IconButton>
            )}
          </Box>
        }
        size={size}
        color={chipColor}
        clickable={!disabled}
        onClick={handleChipClick}
        disabled={disabled}
        variant="filled"
        sx={{
          cursor: disabled ? 'default' : 'pointer',
          '&:hover': disabled ? {} : {
            transform: 'scale(1.02)',
            transition: 'transform 0.15s ease-in-out'
          }
        }}
      />

      <Popover
        open={popoverOpen}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{ mt: 1 }}
      >
        <Paper sx={{ p: 2, maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            {variableName}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            {category && (
              <Chip size="small" label={category} variant="outlined" />
            )}
            {unit && (
              <Chip size="small" label={`Unit: ${unit}`} variant="outlined" />
            )}
          </Box>

          <DescriptionDisplay
            description={description.content}
            showExpandToggle={true}
            onVariableClick={onVariableClick}
          />
        </Paper>
      </Popover>
    </>
  );
}
