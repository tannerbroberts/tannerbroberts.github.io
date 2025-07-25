import { useMemo } from "react";
import { Box, Typography, LinearProgress, Chip, Divider } from "@mui/material";
import { Schedule, AccountTree } from "@mui/icons-material";
import { SubCalendarItem, Item } from "../../functions/utils/item/index";
import { getTaskProgress } from "../../functions/utils/item/utils";
import { formatDuration } from "../../functions/utils/formatTime";
import SubCalendarStatusBar from "./SubCalendarStatusBar";

interface PrimarySubCalendarItemDisplayProps {
  readonly item: SubCalendarItem;
  readonly taskChain: Item[];
  readonly currentTime: number;
  readonly startTime: number;
  readonly isDeepest?: boolean;
  readonly children?: React.ReactNode; // For recursive rendering
}

export default function PrimarySubCalendarItemDisplay({
  item,
  taskChain,
  currentTime,
  startTime,
  isDeepest = false,
  children
}: PrimarySubCalendarItemDisplayProps) {
  // Calculate progress using existing utility
  const progress = useMemo(() => {
    try {
      return getTaskProgress(item, currentTime, startTime);
    } catch (error) {
      console.error('Error calculating progress for SubCalendarItem:', error);
      return 0;
    }
  }, [item, currentTime, startTime]);

  // Calculate remaining time
  const remainingTime = useMemo(() => {
    const elapsed = currentTime - startTime;
    const remaining = Math.max(0, item.duration - elapsed);
    return remaining;
  }, [item.duration, currentTime, startTime]);

  // Determine progress color based on completion
  const progressColor = useMemo(() => {
    if (progress >= 100) return "success";
    if (progress >= 75) return "warning";
    return "primary";
  }, [progress]);

  return (
    <Box
      sx={{
        border: '2px solid',
        borderColor: isDeepest ? 'primary.main' : 'grey.300',
        borderRadius: 2,
        backgroundColor: isDeepest ? 'primary.50' : 'background.paper',
        boxShadow: isDeepest ? 2 : 1,
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Status bar showing progress and timing information */}
      <SubCalendarStatusBar
        item={item}
        taskChain={taskChain}
        currentTime={currentTime}
        startTime={startTime}
      />

      {/* Header with item name and children count */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Schedule sx={{
              color: isDeepest ? 'primary.main' : 'text.secondary',
              fontSize: '1.5rem'
            }} />
            <Typography
              variant={isDeepest ? "h5" : "h6"}
              sx={{
                fontWeight: 'bold',
                color: isDeepest ? 'primary.main' : 'text.primary'
              }}
            >
              {item.name}
            </Typography>
          </Box>

          {/* Children count indicator */}
          {item.children.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountTree sx={{ color: 'text.secondary', fontSize: '1rem' }} />
              <Chip
                label={`${item.children.length} subtask${item.children.length > 1 ? 's' : ''}`}
                size="small"
                variant="outlined"
                color="info"
              />
            </Box>
          )}
        </Box>

        {/* Progress section */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 1
          }}>
            <Typography variant="body2" color="text.secondary">
              Overall Progress
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                color: progressColor === 'success' ? 'success.main' : 'text.primary'
              }}
            >
              {progress.toFixed(1)}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            color={progressColor}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: 'grey.200'
            }}
          />
        </Box>

        {/* Duration and timing information */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Total Duration
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
              {formatDuration(item.duration)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Remaining
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'medium',
                color: remainingTime <= 0 ? 'success.main' : 'text.primary'
              }}
            >
              {remainingTime <= 0 ? 'Complete' : formatDuration(remainingTime)}
            </Typography>
          </Box>
        </Box>

        {/* Status indicator for deepest item */}
        {isDeepest && (
          <Box sx={{
            mt: 2,
            p: 1,
            backgroundColor: 'primary.100',
            borderRadius: 1,
            textAlign: 'center'
          }}>
            <Typography variant="caption" sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              textTransform: 'uppercase',
              letterSpacing: 1
            }}>
              Currently Executing
            </Typography>
          </Box>
        )}
      </Box>

      {/* Child content area */}
      {children && (
        <>
          <Divider />
          <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
            {children}
          </Box>
        </>
      )}

      {/* Empty state for no children when deepest */}
      {isDeepest && !children && item.children.length === 0 && (
        <>
          <Divider />
          <Box sx={{
            p: 3,
            textAlign: 'center',
            backgroundColor: 'grey.50',
            color: 'text.secondary'
          }}>
            <Typography variant="body2">
              No scheduled subtasks
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
