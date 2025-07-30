import { Chip, Tooltip, Box } from '@mui/material';
import { Schedule, Error as ErrorIcon } from '@mui/icons-material';
import { useTimeCalculations } from '../hooks/useBadgeCalculations';
import { ItemInstance } from '../../../functions/utils/itemInstance/types';
import { Item } from '../../../functions/utils/item/Item';

interface ClockBadgeProps {
  readonly instances: ItemInstance[];
  readonly items: Item[];
  readonly variant?: 'outlined' | 'filled';
  readonly size?: 'small' | 'medium';
  readonly color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  readonly showIcon?: boolean;
  readonly onClick?: () => void;
}

/**
 * Clock badge component that displays total BasicItem time in accounting view
 * Shows formatted time duration with detailed tooltip
 */
export default function ClockBadge({
  instances,
  items,
  variant = 'outlined',
  size = 'small',
  color = 'info',
  showIcon = true,
  onClick
}: ClockBadgeProps) {
  const { totalTime, formattedTime, timeTooltip, errors } = useTimeCalculations(instances, items);

  // Handle error states
  if (errors.length > 0) {
    return (
      <Tooltip title={`Calculation errors: ${errors.join(', ')}`}>
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

  // Don't show badge if no time to account for
  if (totalTime === 0) {
    return null;
  }

  return (
    <Tooltip
      title={
        <Box>
          <div>{timeTooltip}</div>
          <div style={{ marginTop: 4, fontSize: '0.75em', opacity: 0.8 }}>
            Click for detailed breakdown
          </div>
        </Box>
      }
      arrow
    >
      <Chip
        icon={showIcon ? <Schedule /> : undefined}
        label={formattedTime}
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
        data-testid="clock-badge"
        aria-label={`${formattedTime} of BasicItem time requiring accounting`}
      />
    </Tooltip>
  );
}

/**
 * Lightweight version of ClockBadge with minimal features
 */
export function ClockBadgeSimple({
  instances,
  items,
  onClick
}: {
  readonly instances: ItemInstance[];
  readonly items: Item[];
  readonly onClick?: () => void;
}) {
  const { formattedTime, errors } = useTimeCalculations(instances, items);

  if (errors.length > 0 || !formattedTime || formattedTime === '0s') {
    return null;
  }

  return (
    <Chip
      icon={<Schedule />}
      label={formattedTime}
      variant="outlined"
      size="small"
      color="info"
      onClick={onClick}
      sx={{ cursor: onClick ? 'pointer' : 'default' }}
    />
  );
}
