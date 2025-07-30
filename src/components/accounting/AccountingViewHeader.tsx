import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Schedule,
  Warning,
  Settings
} from '@mui/icons-material';
import ClockBadge from './badges/ClockBadge';
import StarBadge from './badges/StarBadge';
import { ItemInstance } from '../../functions/utils/itemInstance/types';
import { Item } from '../../functions/utils/item/Item';
import { Variable } from '../../functions/utils/variable/types';

interface AccountingViewHeaderProps {
  readonly isExpanded: boolean;
  readonly onToggle: () => void;
  readonly totalIncompleteCount: number;
  readonly overdueCount: number;
  readonly filteredCount?: number;
  readonly instances: ItemInstance[];
  readonly items: Item[];
  readonly itemVariables: Map<string, Variable[]>;
  readonly onBadgeClick?: (badgeType: 'time' | 'variables') => void;
  readonly onSettingsClick?: () => void;
}

export default function AccountingViewHeader({
  isExpanded,
  onToggle,
  totalIncompleteCount,
  overdueCount,
  filteredCount,
  instances,
  items,
  itemVariables,
  onBadgeClick,
  onSettingsClick
}: AccountingViewHeaderProps) {
  const showFilteredCount = filteredCount !== undefined && filteredCount !== totalIncompleteCount;

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ pb: '16px !important' }}>
        <Button
          variant="text"
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            justifyContent: 'flex-start',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'action.hover'
            },
            p: 1,
            borderRadius: 1
          }}
          onClick={onToggle}
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? 'Collapse' : 'Expand'} accounting view`}
          startIcon={isExpanded ? <ExpandLess /> : <ExpandMore />}
        >
          <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
            Accounting View
          </Typography>

          {/* Summary badges */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              icon={<Schedule />}
              label={`${totalIncompleteCount} Incomplete`}
              variant="outlined"
              color="info"
              size="small"
            />
            {overdueCount > 0 && (
              <Chip
                icon={<Warning />}
                label={`${overdueCount} Overdue`}
                variant="outlined"
                color="warning"
                size="small"
              />
            )}
            {showFilteredCount && (
              <Chip
                label={`${filteredCount} Filtered`}
                variant="outlined"
                size="small"
              />
            )}
            {/* Enhanced badges showing time and variable calculations */}
            <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
              <ClockBadge
                instances={instances}
                items={items}
                onClick={() => onBadgeClick?.('time')}
              />
              <StarBadge
                instances={instances}
                items={items}
                itemVariables={itemVariables}
                onClick={() => onBadgeClick?.('variables')}
              />
              {onSettingsClick && (
                <Tooltip title="Badge Settings">
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSettingsClick();
                    }}
                    sx={{ ml: 0.5 }}
                  >
                    <Settings fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Button>

        {/* Collapsed state description */}
        {!isExpanded && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, ml: 4 }}
          >
            Review and complete past scheduled items that haven't been marked as finished.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
