import { useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { Schedule, Functions } from "@mui/icons-material";
import { SubCalendarItem } from "../../functions/utils/item/index";
import { getTaskProgress } from "../../functions/utils/item/utils";
import { formatDuration } from "../../functions/utils/formatTime";
import { getActiveChildForExecution } from "./executionUtils";
import { useAppState } from "../../reducerContexts/App";
import { useItemVariables } from "../../hooks/useItemVariables";
import VariableSummaryDisplay from "../variables/VariableSummaryDisplay";

interface PrimarySubCalendarItemDisplayProps {
  readonly item: SubCalendarItem;
  readonly currentTime: number;
  readonly startTime: number;
  readonly children?: React.ReactNode; // For recursive rendering
}

export default function PrimarySubCalendarItemDisplay({
  item,
  currentTime,
  startTime,
  children
}: PrimarySubCalendarItemDisplayProps) {
  const { items } = useAppState();
  const { variableSummary } = useItemVariables(item.id);
  const [showVariables, setShowVariables] = useState(false);

  // Check if item has variables to show
  const hasVariables = useMemo(() => {
    return Object.keys(variableSummary).length > 0;
  }, [variableSummary]);

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

  // Get progress bar color based on completion
  const progressColor = useMemo(() => {
    if (progress >= 100) return "success";
    if (progress >= 75) return "warning";
    return "primary";
  }, [progress]);

  // Get the currently executing child if any
  const activeChild = useMemo(() => {
    return getActiveChildForExecution(item, items, currentTime, startTime);
  }, [item, items, currentTime, startTime]);

  // Get next child to show "up next" section
  const nextChild = useMemo(() => {
    if (!item.children.length) return null;

    const elapsedTime = currentTime - startTime;
    const sortedChildren = [...item.children].sort((a, b) => a.start - b.start);

    // Find the next child that hasn't started yet
    for (const child of sortedChildren) {
      if (elapsedTime < child.start) {
        return {
          child,
          item: items.find(i => i.id === child.id),
          timeUntilStart: (startTime + child.start) - currentTime
        };
      }
    }
    return null;
  }, [item.children, items, currentTime, startTime]);

  // Get progress bar colors (two tones of the same color)
  const getProgressBarColors = (color: string) => {
    if (color === 'success') return { main: 'success.main', light: 'success.light' };
    if (color === 'warning') return { main: 'warning.main', light: 'warning.light' };
    return { main: 'primary.main', light: 'primary.light' };
  };

  const barColors = getProgressBarColors(progressColor);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Progress Bar */}
      <Box
        sx={{
          position: 'relative',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: barColors.light,
          borderRadius: 1,
          overflow: 'hidden',
          mb: children ? 0 : 2,
          cursor: hasVariables ? 'pointer' : 'default'
        }}
        onClick={hasVariables ? () => setShowVariables(!showVariables) : undefined}
      >
        {/* Progress bar background (darker tone) */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: barColors.main,
            transition: 'width 0.3s ease'
          }}
        />

        {/* Content overlay */}
        <Box sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          px: 2
        }}>
          {/* Left: Schedule icon, item name, and variables indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
            <Schedule sx={{ color: 'text.primary', fontSize: '1.5rem', flexShrink: 0 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '250px'
              }}
            >
              {item.name}
            </Typography>

            {/* Variables indicator */}
            {hasVariables && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                <Functions
                  sx={{
                    color: 'text.secondary',
                    fontSize: '1rem',
                    transform: showVariables ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                  {Object.keys(variableSummary).length}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Center: Progress percentage */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              mx: 2
            }}
          >
            {progress.toFixed(1)}%
          </Typography>

          {/* Right: Time remaining */}
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'medium',
              minWidth: 'fit-content',
              color: remainingTime <= 0 ? 'success.main' : 'text.primary'
            }}
          >
            {remainingTime <= 0 ? 'Complete' : formatDuration(remainingTime)}
          </Typography>
        </Box>
      </Box>

      {/* Variable Summary Display */}
      {hasVariables && (
        <Box sx={{ mb: 2 }}>
          <VariableSummaryDisplay
            summary={variableSummary}
            title="Resource Summary"
            defaultExpanded={showVariables}
            compact
          />
        </Box>
      )}

      {/* Show active child or up next section if no active child */}
      {!activeChild && nextChild && (
        <Box sx={{
          p: 2,
          backgroundColor: 'info.50',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'info.200',
          mb: 2
        }}>
          <Typography variant="subtitle2" color="info.main" sx={{ fontWeight: 'bold', mb: 1 }}>
            Up Next
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
            {nextChild.item?.name || 'Unknown Task'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Starts in {formatDuration(nextChild.timeUntilStart)}
          </Typography>
        </Box>
      )}

      {/* Render children directly with no extra styling */}
      {children}
    </Box>
  );
}
