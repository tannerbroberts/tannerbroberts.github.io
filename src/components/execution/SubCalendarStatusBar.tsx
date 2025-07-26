import { useMemo } from "react";
import { Box, Typography, LinearProgress, Tooltip } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";
import { SubCalendarItem, Item } from "../../functions/utils/item/index";
import { getTaskProgress, getItemById } from "../../functions/utils/item/utils";
import { Child } from "../../functions/utils/item/Child";

// Define pulse animation
const pulse = keyframes`
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`;

// Styled components for enhanced visuals
const StatusBarContainer = styled(Box)(() => ({
  width: '100%',
  height: 60, // Increased height for better visual presence
  borderRadius: '8px 8px 0 0',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: 0,
  border: '1px solid',
  borderBottom: 'none',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
  },
}));

const PulsingIndicator = styled(Box)<{ color: string }>(({ color }) => ({
  width: 10,
  height: 10,
  borderRadius: '50%',
  backgroundColor: color,
  animation: `${pulse} 2s infinite`,
  flexShrink: 0,
}));

interface SubCalendarStatusBarProps {
  readonly item: SubCalendarItem;
  readonly taskChain: Item[];
  readonly currentTime: number;
  readonly startTime: number;
  readonly itemName?: string; // Optional item name to display instead of current child
  readonly isExpandable?: boolean; // Whether this header can be expanded/collapsed
  readonly isExpanded?: boolean; // Current expanded state
}

interface ChildStatus {
  child: Child; // Child from SubCalendarItem
  item: Item | null;
  isActive: boolean;
  isCompleted: boolean;
  startTime: number;
  endTime: number;
}

export default function SubCalendarStatusBar({
  item,
  taskChain,
  currentTime,
  startTime,
  itemName,
  isExpandable = false,
  isExpanded = false
}: SubCalendarStatusBarProps) {
  // Calculate overall progress for the SubCalendar
  const overallProgress = useMemo(() => {
    try {
      return getTaskProgress(item, currentTime, startTime);
    } catch (error) {
      console.error('Error calculating SubCalendar progress:', error);
      return 0;
    }
  }, [item, currentTime, startTime]);

  // Calculate elapsed and remaining time
  const timeInfo = useMemo(() => {
    const elapsed = Math.max(0, currentTime - startTime);
    const remaining = Math.max(0, item.duration - elapsed);

    return {
      elapsed,
      remaining,
      isComplete: elapsed >= item.duration
    };
  }, [currentTime, startTime, item.duration]);

  // Analyze children status and find current active child
  const childrenStatus = useMemo(() => {
    const statuses: ChildStatus[] = [];
    let activeChild: ChildStatus | null = null;

    // Sort children by start time for proper ordering
    const sortedChildren = [...item.children].sort((a, b) => a.start - b.start);

    for (const child of sortedChildren) {
      // Get the actual item for this child
      const childItem = getItemById(taskChain, child.id);

      const childStartTime = startTime + child.start;
      const childDuration = childItem?.duration || 0;
      const childEndTime = childStartTime + childDuration;

      const isCompleted = currentTime >= childEndTime;
      const isActive = currentTime >= childStartTime && currentTime < childEndTime;

      const status: ChildStatus = {
        child,
        item: childItem,
        isActive,
        isCompleted,
        startTime: childStartTime,
        endTime: childEndTime
      };

      statuses.push(status);

      if (isActive) {
        activeChild = status;
      }
    }

    return { statuses, activeChild };
  }, [item.children, taskChain, currentTime, startTime]);

  // Calculate progress color based on completion
  const progressColor = useMemo(() => {
    if (overallProgress >= 100) return "success";
    if (overallProgress >= 75) return "warning";
    return "primary";
  }, [overallProgress]);

  // Get status bar background color
  const statusBarBgColor = useMemo(() => {
    if (progressColor === 'success') return '#e8f5e8';
    if (progressColor === 'warning') return '#fff3cd';
    return '#e3f2fd';
  }, [progressColor]);

  // Get progress bar color
  const progressBarColor = useMemo(() => {
    if (progressColor === 'success') return '#4caf50';
    if (progressColor === 'warning') return '#ff9800';
    return '#2196f3';
  }, [progressColor]);

  // Format time in compact format (e.g., "2h 15m 30s")
  const formatCompactTime = (ms: number): string => {
    if (ms <= 0) return "0s";

    const hours = Math.floor(ms / (60 * 60 * 1000));
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((ms % (60 * 1000)) / 1000);

    const parts = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}s`);

    return parts.join(' ');
  };

  // Get border color based on progress
  const borderColor = useMemo(() => {
    if (progressColor === 'success') return 'success.light';
    if (progressColor === 'warning') return 'warning.light';
    return 'primary.light';
  }, [progressColor]);

  return (
    <StatusBarContainer
      sx={{
        backgroundColor: statusBarBgColor,
        borderColor: borderColor,
      }}
    >
      {/* Progress bar background with animation */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          height: '100%',
          width: `${Math.min(overallProgress, 100)}%`,
          backgroundColor: progressBarColor,
          opacity: 0.2,
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Main content overlay */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
        }}
      >
        {/* Left side: Progress percentage and item name or current child */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          <Tooltip
            title={`SubCalendar Progress: ${overallProgress.toFixed(1)}% complete`}
            arrow
            placement="top"
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                fontSize: '1.1rem',
                minWidth: '60px',
              }}
            >
              {overallProgress.toFixed(1)}%
            </Typography>
          </Tooltip>

          {/* Show item name if provided (for parent headers) */}
          {itemName && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.primary',
                  fontWeight: 'bold',
                  maxWidth: 250,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {itemName}
              </Typography>
              {/* Expand/collapse indicator */}
              {isExpandable && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 'medium',
                    fontSize: '0.875rem'
                  }}
                >
                  {isExpanded ? '▼' : '▶'}
                </Typography>
              )}
            </Box>
          )}

          {/* Show current active child if no item name provided */}
          {!itemName && childrenStatus.activeChild && (
            <Tooltip
              title={`Currently executing: ${childrenStatus.activeChild.item?.name || 'Unknown Task'}`}
              arrow
              placement="top"
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <PulsingIndicator color={progressBarColor} />
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 'medium',
                    maxWidth: 180,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {childrenStatus.activeChild.item?.name || 'Unknown Task'}
                </Typography>
              </Box>
            </Tooltip>
          )}
        </Box>

        {/* Right side: Time information */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Tooltip title="Time elapsed since SubCalendar started" arrow>
            <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                Elapsed
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                  fontFamily: 'monospace',
                  fontSize: '0.95rem'
                }}
              >
                {formatCompactTime(timeInfo.elapsed)}
              </Typography>
            </Box>
          </Tooltip>

          <Tooltip
            title={timeInfo.isComplete ? "SubCalendar completed!" : "Time remaining for SubCalendar"}
            arrow
          >
            <Box sx={{ textAlign: 'center', minWidth: '80px' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                Remaining
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 'bold',
                  lineHeight: 1.2,
                  fontFamily: 'monospace',
                  fontSize: '0.95rem',
                  color: timeInfo.isComplete ? 'success.main' : 'text.primary',
                }}
              >
                {timeInfo.isComplete ? 'Complete' : formatCompactTime(timeInfo.remaining)}
              </Typography>
            </Box>
          </Tooltip>
        </Box>
      </Box>

      {/* Enhanced progress indicator at the bottom */}
      <LinearProgress
        variant="determinate"
        value={Math.min(overallProgress, 100)}
        color={progressColor}
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: 'rgba(0, 0, 0, 0.05)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: progressBarColor,
            transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          },
        }}
      />
    </StatusBarContainer>
  );
}
