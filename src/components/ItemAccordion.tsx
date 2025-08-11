import { useState, useMemo, useCallback } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Button
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import PieChartCountdown from "./PieChartCountdown";
import { useAppDispatch, useAppState } from "../reducerContexts";
import { useCurrentTime } from "../hooks/useCurrentTime";
import { getItemById, getTaskProgress, getTaskStartTime, Item, SubCalendarItem, CheckListItem, type ChildReference } from "../functions/utils/item/index";

interface ItemAccordionProps {
  readonly item: Item;
  readonly taskChain: Item[];
  readonly isDeepest?: boolean;
  readonly showMoveDeleteButtons?: boolean;
  readonly relationshipId?: string | null;
}

export default function ItemAccordion({
  item,
  taskChain,
  isDeepest = false,
  showMoveDeleteButtons = false,
  relationshipId = null
}: ItemAccordionProps) {
  const { items, baseCalendar } = useAppState();
  const appDispatch = useAppDispatch();
  const currentTime = useCurrentTime(20);
  const [expanded, setExpanded] = useState(true);

  // Calculate progress for this item (memoized with less frequent updates)
  const taskProgress = useMemo(() => {
    if (!item) return 0;
    try {
      const startTime = getTaskStartTime(taskChain, item, baseCalendar);
      return getTaskProgress(item, currentTime, startTime);
    } catch (error) {
      console.error('Error calculating task progress:', error);
      return 0;
    }
  }, [item, currentTime, taskChain, baseCalendar]);

  // Calculate remaining time (memoized with less frequent updates)
  const remainingTime = useMemo(() => {
    if (!item) return 0;
    try {
      const startTime = getTaskStartTime(taskChain, item, baseCalendar);
      const elapsed = currentTime - startTime;
      return Math.max(0, item.duration - elapsed);
    } catch (error) {
      console.error('Error calculating remaining time:', error);
      return 0;
    }
  }, [item, currentTime, taskChain, baseCalendar]);

  // Format time helper
  const formatTime = useCallback((milliseconds: number) => {
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }, []);

  // Dynamic color based on progress
  const progressColor = useMemo(() => {
    if (taskProgress > 90) return '#4caf50'; // Green for nearly complete
    if (taskProgress > 50) return '#ff9800'; // Orange for half complete
    return '#2196f3'; // Blue for just started
  }, [taskProgress]);

  const handleAccordionToggle = useCallback(() => {
    setExpanded(!expanded);
  }, [expanded]);

  const handleMoveItem = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Placeholder for move functionality - to be implemented
    console.log('Move item:', relationshipId || item.id);
  }, [item, relationshipId]);

  const handleDeleteFromSchedule = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (relationshipId) {
      appDispatch({
        type: "REMOVE_INSTANCE_BY_RELATIONSHIP_ID",
        payload: { relationshipId },
      });
    } else {
      appDispatch({
        type: "REMOVE_INSTANCES_BY_ID",
        payload: { id: item.id },
      });
    }
  }, [item, appDispatch, relationshipId]);

  return (
    <Accordion
      expanded={expanded}
      onChange={handleAccordionToggle}
      sx={{
        width: '100%',
        mb: 1,
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        '&:before': {
          display: 'none'
        }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          backgroundColor: isDeepest ? '#e3f2fd' : '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          '&:hover': { backgroundColor: isDeepest ? '#bbdefb' : '#e8f4f8' }
        }}
      >
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          width: '100%',
          pr: 2
        }}>
          <PieChartCountdown
            progress={taskProgress}
            size={40}
            showPercentage={false}
            completedColor={progressColor}
          />

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
              {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatTime(remainingTime)} remaining
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Chip
              label={`${taskProgress.toFixed(1)}%`}
              size="small"
              color="primary"
            />
            {(item instanceof SubCalendarItem || item instanceof CheckListItem) && item.children.length > 0 && (
              <Chip
                label={`${item.children.length} child${item.children.length > 1 ? 'ren' : ''}`}
                size="small"
                variant="outlined"
              />
            )}
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Item Details */}
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Task Details:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Duration: {formatTime(item.duration)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Progress: {taskProgress.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Remaining: {formatTime(remainingTime)}
              </Typography>
            </Box>

            {/* Action Buttons */}
            {showMoveDeleteButtons && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleMoveItem}
                  sx={{
                    minWidth: '70px',
                    height: '32px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    backgroundColor: '#2196f3',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#1976d2',
                    }
                  }}
                >
                  Move
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleDeleteFromSchedule}
                  sx={{
                    minWidth: '70px',
                    height: '32px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    backgroundColor: '#f44336',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#d32f2f',
                    }
                  }}
                >
                  Delete
                </Button>
              </Box>
            )}
          </Box>

          {/* Children Info */}
          {(item instanceof SubCalendarItem || item instanceof CheckListItem) && item.children.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Child Tasks:
              </Typography>
              {item.children.map((child: ChildReference, index: number) => {
                const childId = 'id' in child ? child.id : child.itemId;
                const childItem = getItemById(items, childId);
                if (!childItem) return null;

                return (
                  <Box key={child.relationshipId} sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    py: 1,
                    px: 2,
                    mb: 1,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1
                  }}>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        {childItem.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {'start' in child && child.start !== undefined ? `Starts at ${formatTime(child.start)} • ` : ''}Duration: {formatTime(childItem.duration)}
                      </Typography>
                    </Box>
                    <Chip
                      label={`Child ${index + 1}`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
