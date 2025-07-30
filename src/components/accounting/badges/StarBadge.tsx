import { Chip, Tooltip, Box, Typography } from '@mui/material';
import { Star, Error as ErrorIcon } from '@mui/icons-material';
import { useVariableCalculations } from '../hooks/useBadgeCalculations';
import { ItemInstance } from '../../../functions/utils/itemInstance/types';
import { Item } from '../../../functions/utils/item/Item';
import { Variable } from '../../../functions/utils/variable/types';

interface StarBadgeProps {
  readonly instances: ItemInstance[];
  readonly items: Item[];
  readonly itemVariables: Map<string, Variable[]>;
  readonly variant?: 'outlined' | 'filled';
  readonly size?: 'small' | 'medium';
  readonly color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  readonly showIcon?: boolean;
  readonly onClick?: () => void;
  readonly showDetailedTooltip?: boolean;
}

/**
 * Star badge component that displays count of distinct variables requiring accounting
 * Shows variable count with detailed tooltip including categories
 */
export default function StarBadge({
  instances,
  items,
  itemVariables,
  variant = 'outlined',
  size = 'small',
  color = 'warning',
  showIcon = true,
  onClick,
  showDetailedTooltip = true
}: StarBadgeProps) {
  const { distinctCount, variableTooltip, errors } = useVariableCalculations(
    instances,
    items,
    itemVariables
  );

  // Handle error states
  if (errors.length > 0) {
    return (
      <Tooltip title={`Variable calculation errors: ${errors.join(', ')}`}>
        <Chip
          icon={<ErrorIcon />}
          label="Error"
          variant={variant}
          size={size}
          color="error"
          onClick={onClick}
          sx={{
            cursor: onClick ? 'pointer' : 'default',
            '&:hover': onClick ? {
              backgroundColor: 'error.light',
            } : {}
          }}
        />
      </Tooltip>
    );
  }

  // Don't show badge if no variables to account for
  if (distinctCount === 0) {
    return null;
  }

  const tooltipContent = showDetailedTooltip ? (
    <Box>
      <Typography variant="body2" component="div">
        {variableTooltip}
      </Typography>
      {onClick && (
        <Typography
          variant="caption"
          component="div"
          sx={{ mt: 0.5, opacity: 0.8 }}
        >
          Click for detailed variable breakdown
        </Typography>
      )}
    </Box>
  ) : (
    variableTooltip
  );

  return (
    <Tooltip
      title={tooltipContent}
      arrow
    >
      <Chip
        icon={showIcon ? <Star /> : undefined}
        label={distinctCount}
        variant={variant}
        size={size}
        color={color}
        onClick={onClick}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? {
            backgroundColor: `${color}.light`,
            transform: 'scale(1.02)',
            transition: 'all 0.2s ease-in-out'
          } : {},
          // Add subtle animation for value changes
          transition: 'all 0.3s ease-in-out'
        }}
        data-testid="star-badge"
        aria-label={`${distinctCount} distinct variable${distinctCount === 1 ? '' : 's'} requiring accounting`}
      />
    </Tooltip>
  );
}

/**
 * Lightweight version of StarBadge with minimal features
 */
export function StarBadgeSimple({
  instances,
  items,
  itemVariables,
  onClick
}: {
  readonly instances: ItemInstance[];
  readonly items: Item[];
  readonly itemVariables: Map<string, Variable[]>;
  readonly onClick?: () => void;
}) {
  const { distinctCount, errors } = useVariableCalculations(instances, items, itemVariables);

  if (errors.length > 0 || distinctCount === 0) {
    return null;
  }

  return (
    <Chip
      icon={<Star />}
      label={distinctCount}
      variant="outlined"
      size="small"
      color="warning"
      onClick={onClick}
      sx={{ cursor: onClick ? 'pointer' : 'default' }}
    />
  );
}

/**
 * Star badge that shows threshold-based colors
 */
export function StarBadgeWithThreshold({
  instances,
  items,
  itemVariables,
  warningThreshold = 5,
  errorThreshold = 10,
  onClick
}: {
  readonly instances: ItemInstance[];
  readonly items: Item[];
  readonly itemVariables: Map<string, Variable[]>;
  readonly warningThreshold?: number;
  readonly errorThreshold?: number;
  readonly onClick?: () => void;
}) {
  const { distinctCount, variableTooltip, errors } = useVariableCalculations(
    instances,
    items,
    itemVariables
  );

  if (errors.length > 0 || distinctCount === 0) {
    return null;
  }

  let color: 'info' | 'warning' | 'error' = 'info';
  if (distinctCount >= errorThreshold) {
    color = 'error';
  } else if (distinctCount >= warningThreshold) {
    color = 'warning';
  }

  return (
    <Tooltip title={variableTooltip} arrow>
      <Chip
        icon={<Star />}
        label={distinctCount}
        variant="outlined"
        size="small"
        color={color}
        onClick={onClick}
        sx={{
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick ? {
            backgroundColor: `${color}.light`,
          } : {}
        }}
        data-testid="star-badge-threshold"
      />
    </Tooltip>
  );
}
