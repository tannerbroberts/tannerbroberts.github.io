import { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Collapse,
  IconButton,
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import { ExpandMore, ExpandLess, Functions } from '@mui/icons-material';
import { VariableSummary } from '../../functions/utils/item/index';

interface VariableSummaryDisplayProps {
  readonly summary: VariableSummary;
  readonly title?: string;
  readonly defaultExpanded?: boolean;
  readonly compact?: boolean;
}

export default function VariableSummaryDisplay({
  summary,
  title = "Variable Summary",
  defaultExpanded = false,
  compact = false
}: VariableSummaryDisplayProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const theme = useTheme();

  const { hasVariables, variableCount, groupedVariables } = useMemo(() => {
    const variables = Object.entries(summary).map(([name, data]) => ({
      type: "variable" as const,
      name,
      quantity: data.quantity,
      unit: data.unit,
      category: data.category
    }));

    const hasVariables = variables.length > 0;
    const variableCount = variables.length;

    // Simple grouping by category for display
    const grouped: Record<string, typeof variables> = {};
    for (const variable of variables) {
      const category = variable.category || 'uncategorized';
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(variable);
    }

    return { hasVariables, variableCount, groupedVariables: grouped };
  }, [summary]);

  const renderVariableChip = (name: string, data: { quantity: number; unit?: string; category?: string }) => {
    const sign = data.quantity >= 0 ? '+' : '';
    const unit = data.unit ? ` ${data.unit}` : '';
    const label = `${sign}${data.quantity}${unit} ${name}`;

    return (
      <Chip
        key={name}
        label={label}
        size={compact ? 'small' : 'medium'}
        variant="outlined"
        color={data.quantity >= 0 ? 'success' : 'error'}
        sx={{ m: 0.25 }}
      />
    );
  };

  if (!hasVariables) {
    return null;
  }

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        backgroundColor: theme.palette.background.paper,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: compact ? 1 : 1.5,
          backgroundColor: theme.palette.action.hover,
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Functions color="action" fontSize={compact ? 'small' : 'medium'} />
          <Typography variant={compact ? 'body2' : 'subtitle2'} fontWeight="medium">
            {title}
          </Typography>
          <Chip
            label={variableCount}
            size="small"
            variant="outlined"
            color="info"
          />
        </Box>

        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Content */}
      <Collapse in={expanded}>
        <Box sx={{ p: compact ? 1 : 1.5 }}>
          {Object.entries(groupedVariables).map(([category, variables], categoryIndex) => (
            <Box key={category}>
              {Object.keys(groupedVariables).length > 1 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                    mb: 1,
                    display: 'block'
                  }}
                >
                  {category}
                </Typography>
              )}

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {variables.map(variable =>
                  renderVariableChip(variable.name, variable)
                )}
              </Box>

              {categoryIndex < Object.keys(groupedVariables).length - 1 && (
                <Divider sx={{ my: 1 }} />
              )}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
