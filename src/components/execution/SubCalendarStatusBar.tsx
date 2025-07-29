import React, { useMemo } from "react";
import { Box, Typography, LinearProgress, Tooltip } from "@mui/material";
import { Timer } from "@mui/icons-material";
import { styled, keyframes } from "@mui/material/styles";
import { SubCalendarItem, Item } from "../../functions/utils/item/index";
import { getTaskProgress, getItemById } from "../../functions/utils/item/utils";
import { Child } from "../../functions/utils/item/Child";
import { ChildExecutionStatus } from "./executionUtils";

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

// Enhanced countdown formatting with multiple time units
const formatCountdown = (milliseconds: number): string => {
  if (milliseconds <= 0) return '0s';

  const minutes = Math.floor(milliseconds / (60 * 1000));
  const seconds = Math.floor((milliseconds % (60 * 1000)) / 1000);

  if (minutes > 0) {
    return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
  } else {
    return `${seconds}s`;
  }
};

// Context guidance for gap periods
const getGapPeriodGuidance = (status: ChildExecutionStatus | undefined): string => {
  if (!status?.nextChild) return 'Monitor current cooking tasks';

  const { nextChild } = status;
  const timeUntil = nextChild.timeUntilStart;

  if (timeUntil < 30000) { // 30 seconds
    return `Get ready for ${nextChild.item.name} - starting very soon!`;
  } else if (timeUntil < 120000) { // 2 minutes
    return `Prepare for ${nextChild.item.name} - gather needed items`;
  } else {
    return `Continue monitoring current tasks - ${nextChild.item.name} starts in ${formatCountdown(timeUntil)}`;
  }
};

// Add countdown timer component
const CountdownTimer = ({ timeMs, color }: { timeMs: number; color: string }) => {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 1,
      py: 0.5,
      borderRadius: 1,
      backgroundColor: `${color}.50`,
      border: `1px solid`,
      borderColor: `${color}.200`
    }}>
      <Timer fontSize="small" sx={{ color: `${color}.main` }} />
      <Typography
        variant="body2"
        sx={{
          fontFamily: 'monospace',
          fontWeight: 'bold',
          color: `${color}.main`,
          minWidth: '60px'
        }}
      >
        {formatCountdown(timeMs)}
      </Typography>
    </Box>
  );
};

// Add preparation indicator
const PreparationIndicator = ({ visible }: { visible: boolean }) => (
  <Box sx={{
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 0.5
  }}>
    <Box sx={{
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: 'warning.main',
      animation: `${pulse} 2s infinite`
    }} />
    <Typography variant="caption" color="warning.main">
      PREP
    </Typography>
  </Box>
);

interface SubCalendarStatusBarProps {
  readonly item: SubCalendarItem;
  readonly taskChain: Item[];
  readonly currentTime: number;
  readonly startTime: number;
  readonly itemName?: string; // Optional item name to display instead of current child
  readonly isExpandable?: boolean; // Whether this header can be expanded/collapsed
  readonly isExpanded?: boolean; // Current expanded state
  readonly childExecutionStatus?: ChildExecutionStatus; // Enhanced child execution status
  readonly showCountdown?: boolean; // Whether to show countdown timers
  readonly showPreparationHints?: boolean; // Whether to show preparation hints
}

interface ChildStatus {
  child: Child; // Child from SubCalendarItem
  item: Item | null;
  isActive: boolean;
  isCompleted: boolean;
  startTime: number;
  endTime: number;
}

function SubCalendarStatusBar({
  item,
  taskChain,
  currentTime,
  startTime,
  itemName,
  isExpandable = false,
  isExpanded = false,
  childExecutionStatus,
  showCountdown = true,
  showPreparationHints = true
}: SubCalendarStatusBarProps) {
  // Add state type for status bar
  type StatusBarState = 'active' | 'countdown' | 'gap' | 'preparation' | 'complete';

  // Enhanced state calculation
  const statusBarState = useMemo((): StatusBarState => {
    if (!childExecutionStatus) return 'gap';

    const { activeChild, nextChild, gapPeriod } = childExecutionStatus;

    if (activeChild) return 'active';
    if (nextChild && nextChild.timeUntilStart < 30000) return 'preparation'; // 30 seconds
    if (nextChild) return 'countdown';
    if (gapPeriod) return 'gap';
    return 'complete';
  }, [childExecutionStatus]);

  // Enhanced display content calculation
  const displayContent = useMemo(() => {
    if (!childExecutionStatus) {
      return {
        primaryText: itemName || 'SubCalendar',
        secondaryText: null,
        countdownText: null,
        color: 'primary'
      };
    }

    const { activeChild, nextChild } = childExecutionStatus;

    switch (statusBarState) {
      case 'active':
        return {
          primaryText: `Executing: ${activeChild?.name}`,
          secondaryText: 'Follow instructions carefully',
          countdownText: null,
          color: 'success'
        };

      case 'preparation':
        return {
          primaryText: `Prepare: ${nextChild?.item.name}`,
          secondaryText: 'Get ready for next task',
          countdownText: nextChild ? formatCountdown(nextChild.timeUntilStart) : null,
          color: 'warning'
        };

      case 'countdown':
        return {
          primaryText: `Next: ${nextChild?.item.name}`,
          secondaryText: 'Continue monitoring current tasks',
          countdownText: nextChild ? formatCountdown(nextChild.timeUntilStart) : null,
          color: 'info'
        };

      case 'gap':
        return {
          primaryText: 'Monitoring cooking',
          secondaryText: 'Watch for cooking progress',
          countdownText: nextChild ? formatCountdown(nextChild.timeUntilStart) : null,
          color: 'primary'
        };

      default:
        return {
          primaryText: 'SubCalendar Complete',
          secondaryText: 'All tasks finished',
          countdownText: null,
          color: 'success'
        };
    }
  }, [statusBarState, childExecutionStatus, itemName]);
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
        {/* Enhanced Left side: Progress percentage and dynamic status display */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
          {/* Progress percentage */}
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {overallProgress.toFixed(1)}%
          </Typography>

          {/* Primary status display - enhanced with childExecutionStatus */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{
              fontWeight: 'bold',
              color: `${displayContent.color}.main`,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {displayContent.primaryText}
            </Typography>

            {displayContent.secondaryText && (
              <Typography variant="caption" color="text.secondary">
                {displayContent.secondaryText}
              </Typography>
            )}
          </Box>

          {/* Countdown timer */}
          {showCountdown && displayContent.countdownText && (
            <CountdownTimer
              timeMs={childExecutionStatus?.nextChild?.timeUntilStart || 0}
              color={displayContent.color}
            />
          )}

          {/* Preparation indicator */}
          {showPreparationHints && (
            <PreparationIndicator visible={statusBarState === 'preparation'} />
          )}

          {/* Fallback: Show item name if provided and no enhanced status */}
          {itemName && !childExecutionStatus && (
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

          {/* Fallback: Show current active child if no item name and no enhanced status */}
          {!itemName && !childExecutionStatus && childrenStatus.activeChild && (
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

      {/* Enhanced context display below status bar */}
      {childExecutionStatus?.gapPeriod && showPreparationHints && (
        <Box sx={{
          position: 'absolute',
          bottom: 3,
          left: 3,
          right: 3,
          zIndex: 3,
          p: 1,
          backgroundColor: 'info.50',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'info.200'
        }}>
          <Typography variant="body2" color="info.main" sx={{ fontWeight: 'medium', fontSize: '0.75rem' }}>
            💡 {getGapPeriodGuidance(childExecutionStatus)}
          </Typography>
        </Box>
      )}

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

export default React.memo(SubCalendarStatusBar);
