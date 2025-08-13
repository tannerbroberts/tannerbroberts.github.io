// no React hooks needed beyond custom hook
import { Box, Typography, LinearProgress, Chip } from "@mui/material";
import { Star } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { BasicItem } from "../../functions/utils/item/index";
import { formatDuration } from "../../functions/utils/formatTime";
import useTimedProgress from "../../hooks/useTimedProgress";

// Styled components for enhanced visuals
const ItemContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isDeepest',
})<{ isDeepest: boolean }>(({ theme, isDeepest }) => ({
  padding: theme.spacing(3),
  border: `2px solid`,
  borderColor: isDeepest ? theme.palette.primary.main : theme.palette.grey[300],
  borderRadius: theme.spacing(2),
  backgroundColor: isDeepest ? theme.palette.background.default : theme.palette.background.paper,
  boxShadow: isDeepest ? theme.shadows[4] : theme.shadows[2],
  width: '100%',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    boxShadow: isDeepest ? theme.shadows[6] : theme.shadows[4],
    transform: 'translateY(-2px)',
    borderColor: isDeepest ? theme.palette.primary.dark : theme.palette.primary.main,
  },
  ...(isDeepest && {
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
      background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    },
  }),
}));


interface PrimaryBasicItemDisplayProps {
  readonly item: BasicItem;
  readonly currentTime: number;
  readonly startTime: number;
  readonly isDeepest?: boolean;
}

export default function PrimaryBasicItemDisplay({
  item,
  currentTime,
  startTime,
  isDeepest = false
}: PrimaryBasicItemDisplayProps) {
  // Calculate timed progress only if executing (deepest)
  const isExecuting = isDeepest;
  const { progress, remaining, color } = useTimedProgress(item, currentTime, startTime, isExecuting);
  const remainingTime = remaining; // rename for existing code clarity
  const progressColor = color;

  return (
    <ItemContainer isDeepest={isDeepest}>
      {/* Header with item name and priority */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
        <Typography
          variant={isDeepest ? "h5" : "h6"}
          sx={{
            fontWeight: 'bold',
            color: isDeepest ? 'primary.main' : 'text.primary',
            transition: 'color 0.3s ease-in-out',
          }}
        >
          {item.name}
        </Typography>

        {/* Priority indicator */}
        {item.priority > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Star sx={{
              color: 'warning.main',
              fontSize: '1.3rem',
              animation: 'pulse 2s infinite',
            }} />
            <Chip
              label={`Priority ${item.priority}`}
              size="small"
              color="warning"
              variant="outlined"
              sx={{
                fontWeight: 'bold',
                animation: item.priority >= 3 ? 'pulse 2s infinite' : 'none',
              }}
            />
          </Box>
        )}
      </Box>

      {/* Progress section: always render shell, only show active bar if executing */}
      <Box sx={{ mb: 2, position: 'relative' }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 1
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
            Progress
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'bold',
              color: progressColor === 'success' ? 'success.main' : 'text.primary',
              fontSize: '1.1rem',
              fontFamily: 'monospace',
              visibility: isExecuting ? 'visible' : 'hidden',
            }}
          >
            {progress.toFixed(1)}%
          </Typography>
        </Box>

        {/* Always render the LinearProgress shell, but only show the bar if executing */}
        <LinearProgress
          key={isExecuting ? `active-${item.id}` : `inactive-${item.id}`}
          variant="determinate"
          value={isExecuting ? Math.min(progress, 100) : 0}
          color={progressColor}
          sx={{
            opacity: isExecuting ? 1 : 0,
            transition: 'none',
          }}
          role={isExecuting ? 'progressbar' : undefined}
          aria-valuenow={isExecuting ? Math.min(progress, 100) : undefined}
          aria-valuemin={isExecuting ? 0 : undefined}
          aria-valuemax={isExecuting ? 100 : undefined}
          aria-label={isExecuting ? `${item.name} progress ${progress.toFixed(1)} percent` : undefined}
        />
      </Box>

      {/* Duration and timing information */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 3,
        mb: isDeepest ? 2 : 0,
      }}>
        <Box sx={{ textAlign: 'center', minWidth: '120px' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
            Duration
          </Typography>
          <Typography variant="body1" sx={{
            fontWeight: 'bold',
            fontFamily: 'monospace',
            fontSize: '0.95rem',
          }}>
            {formatDuration(item.duration)}
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', minWidth: '120px' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'medium' }}>
            Remaining
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'bold',
              fontFamily: 'monospace',
              fontSize: '0.95rem',
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
          p: 1.5,
          backgroundColor: 'primary.main',
          borderRadius: 1.5,
          textAlign: 'center',
          background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
          boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
        }}>
          <Typography variant="caption" sx={{
            fontWeight: 'bold',
            color: 'white',
            textTransform: 'uppercase',
            letterSpacing: 1.2,
            fontSize: '0.8rem',
          }}>
            ⚡ Currently Executing
          </Typography>
        </Box>
      )}

      {/* Pulse animation keyframes */}
      <style>
        {`
              @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.6; }
                100% { opacity: 1; }
              }
            `}
      </style>
    </ItemContainer>
  );
}
