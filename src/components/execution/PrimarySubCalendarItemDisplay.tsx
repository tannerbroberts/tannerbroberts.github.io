import { useMemo, useState } from "react";
import { Box, Typography, Chip, Divider } from "@mui/material";
import { Schedule, AccountTree } from "@mui/icons-material";
import { SubCalendarItem } from "../../functions/utils/item/index";
import { getTaskProgress } from "../../functions/utils/item/utils";
import { formatDuration } from "../../functions/utils/formatTime";

interface PrimarySubCalendarItemDisplayProps {
  readonly item: SubCalendarItem;
  readonly currentTime: number;
  readonly startTime: number;
  readonly isDeepest?: boolean;
  readonly children?: React.ReactNode; // For recursive rendering
}

export default function PrimarySubCalendarItemDisplay({
  item,
  currentTime,
  startTime,
  isDeepest = false,
  children
}: PrimarySubCalendarItemDisplayProps) {
  // Collapsed state - parents are collapsed by default, deepest is expanded
  const [isExpanded, setIsExpanded] = useState(isDeepest);

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

  // Calculate elapsed time
  const elapsedTime = useMemo(() => {
    return Math.max(0, currentTime - startTime);
  }, [currentTime, startTime]);

  // Get progress bar color
  const getProgressBarColor = (color: string, variant: 'light' | 'main') => {
    if (color === 'success') return `success.${variant}`;
    if (color === 'warning') return `warning.${variant}`;
    return `primary.${variant}`;
  };

  // Determine progress color based on completion
  const progressColor = useMemo(() => {
    if (progress >= 100) return "success";
    if (progress >= 75) return "warning";
    return "primary";
  }, [progress]);

  // For parent items (non-deepest), render as collapsible header
  if (!isDeepest) {
    return (
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'grey.300',
          borderRadius: 2,
          backgroundColor: 'background.paper',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Item name above the progress header */}
        <Box sx={{ p: 1.5, pb: 0 }}>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 'bold',
              textAlign: 'center',
              color: 'text.primary'
            }}
          >
            {item.name}
          </Typography>
        </Box>

        {/* Clickable progress bar header */}
        <Box
          onClick={() => setIsExpanded(!isExpanded)}
          sx={{
            cursor: 'pointer',
            position: 'relative',
            height: 48,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'grey.100',
            overflow: 'hidden',
            '&:hover': {
              backgroundColor: 'grey.200'
            }
          }}
        >
          {/* Progress bar background */}
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: getProgressBarColor(progressColor, 'light'),
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
            {/* Left: Time elapsed */}
            <Typography variant="body2" sx={{ fontWeight: 'medium', minWidth: 'fit-content' }}>
              {formatDuration(elapsedTime)}
            </Typography>

            {/* Center: Progress percentage */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary'
              }}
            >
              {progress.toFixed(1)}%
            </Typography>

            {/* Right: Time remaining */}
            <Typography
              variant="body2"
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

        {/* Child content area */}
        {children && (
          <>
            <Divider />
            <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
              {children}
            </Box>
          </>
        )}
      </Box>
    );
  }

  // For deepest item, render full content taking up most of the screen
  return (
    <Box
      sx={{
        border: '2px solid',
        borderColor: 'primary.main',
        borderRadius: 2,
        backgroundColor: 'primary.50',
        boxShadow: 2,
        width: '100%',
        overflow: 'hidden',
        minHeight: '60vh' // Take up most of the screen
      }}
    >
      {/* Item name above the progress header */}
      <Box sx={{ p: 3, pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'center' }}>
          <Schedule sx={{
            color: 'primary.main',
            fontSize: '2rem'
          }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              textAlign: 'center'
            }}
          >
            {item.name}
          </Typography>
          {/* Children count indicator */}
          {item.children.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountTree sx={{ color: 'text.secondary', fontSize: '1.2rem' }} />
              <Chip
                label={`${item.children.length} subtask${item.children.length > 1 ? 's' : ''}`}
                size="medium"
                variant="outlined"
                color="info"
              />
            </Box>
          )}
        </Box>
      </Box>

      {/* Large progress bar header */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Box
          sx={{
            position: 'relative',
            height: 80,
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'grey.100',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {/* Progress bar background */}
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: getProgressBarColor(progressColor, 'main'),
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
            px: 4
          }}>
            {/* Left: Time elapsed */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Elapsed
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {formatDuration(elapsedTime)}
              </Typography>
            </Box>

            {/* Center: Progress percentage */}
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary'
              }}
            >
              {progress.toFixed(1)}%
            </Typography>

            {/* Right: Time remaining */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary" display="block">
                Remaining
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 'bold',
                  color: remainingTime <= 0 ? 'success.main' : 'text.primary'
                }}
              >
                {remainingTime <= 0 ? 'Complete' : formatDuration(remainingTime)}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Status indicator for deepest item */}
        <Box sx={{
          mt: 2,
          p: 2,
          backgroundColor: 'primary.100',
          borderRadius: 2,
          textAlign: 'center'
        }}>
          <Typography variant="h6" sx={{
            fontWeight: 'bold',
            color: 'primary.main',
            textTransform: 'uppercase',
            letterSpacing: 2
          }}>
            Currently Executing
          </Typography>
        </Box>
      </Box>

      {/* Child content area for deepest item */}
      {children && (
        <>
          <Divider />
          <Box sx={{ p: 3, backgroundColor: 'background.paper' }}>
            {children}
          </Box>
        </>
      )}

      {/* Empty state for no children when deepest */}
      {!children && item.children.length === 0 && (
        <>
          <Divider />
          <Box sx={{
            p: 4,
            textAlign: 'center',
            backgroundColor: 'background.paper',
            color: 'text.secondary'
          }}>
            <Typography variant="h6">
              No scheduled subtasks
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
