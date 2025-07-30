import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Button
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Schedule,
  Warning
} from '@mui/icons-material';

interface AccountingViewHeaderProps {
  readonly isExpanded: boolean;
  readonly onToggle: () => void;
  readonly totalIncompleteCount: number;
  readonly overdueCount: number;
  readonly filteredCount?: number;
}

export default function AccountingViewHeader({
  isExpanded,
  onToggle,
  totalIncompleteCount,
  overdueCount,
  filteredCount
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
            {/* Placeholder for badges to be implemented in Step 5 */}
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {/* Clock badge placeholder */}
              {/* Star badge placeholder */}
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
