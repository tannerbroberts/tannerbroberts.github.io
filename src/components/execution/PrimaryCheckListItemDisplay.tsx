import { useMemo, useState } from "react";
import { Box, Typography, LinearProgress, Chip, Collapse, IconButton, List, ListItem, ListItemIcon, ListItemText, Divider } from "@mui/material";
import { ExpandMore, ExpandLess, CheckCircle, RadioButtonUnchecked, PlaylistAddCheck, Functions } from "@mui/icons-material";
import { CheckListItem, Item } from "../../functions/utils/item/index";
import { getTaskProgress, getItemById } from "../../functions/utils/item/utils";
import { formatDuration } from "../../functions/utils/formatTime";
import { useAppState } from "../../reducerContexts/App";
import { useItemVariables } from "../../hooks/useItemVariables";
import VariableSummaryDisplay from "../variables/VariableSummaryDisplay";

interface PrimaryCheckListItemDisplayProps {
  readonly item: CheckListItem;
  readonly taskChain: Item[];
  readonly currentTime: number;
  readonly startTime: number;
  readonly isDeepest?: boolean;
  readonly children?: React.ReactNode; // For recursive rendering
}

export default function PrimaryCheckListItemDisplay({
  item,
  // taskChain, // Reserved for future use in display router
  currentTime,
  startTime,
  isDeepest = false,
  children
}: PrimaryCheckListItemDisplayProps) {
  const { items } = useAppState();
  const { variableSummary } = useItemVariables(item.id);
  const [checklistExpanded, setChecklistExpanded] = useState(isDeepest);
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
      console.error('Error calculating progress for CheckListItem:', error);
      return 0;
    }
  }, [item, currentTime, startTime]);

  // Calculate checklist progress
  const checklistProgress = useMemo(() => {
    if (item.children.length === 0) return 0;
    const completedCount = item.children.filter(child => child.complete).length;
    return (completedCount / item.children.length) * 100;
  }, [item.children]);

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

  // Get checklist items with their corresponding Item data
  const checklistItems = useMemo(() => {
    return item.children.map(child => {
      const childItem = getItemById(items, child.itemId);
      return {
        checkListChild: child,
        item: childItem
      };
    }).filter(({ item: childItem }) => childItem !== null);
  }, [item.children, items]);

  const handleToggleChecklist = () => {
    setChecklistExpanded(!checklistExpanded);
  };

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
      {/* Header with item name and checklist controls */}
      <Box sx={{ p: 3, pb: 2 }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlaylistAddCheck sx={{
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

            {/* Variables indicator */}
            {hasVariables && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                <Functions
                  sx={{
                    color: 'text.secondary',
                    fontSize: '1rem',
                    transform: showVariables ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowVariables(!showVariables)}
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                  {Object.keys(variableSummary).length}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Checklist toggle and status */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`${item.children.filter(c => c.complete).length}/${item.children.length} complete`}
              size="small"
              variant="outlined"
              color={checklistProgress === 100 ? "success" : "info"}
            />
            {item.children.length > 0 && (
              <IconButton
                onClick={handleToggleChecklist}
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                {checklistExpanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            )}
          </Box>
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
              Time Remaining
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
              backgroundColor: 'grey.200',
              mb: 1
            }}
          />

          {/* Checklist progress */}
          {item.children.length > 0 && (
            <>
              <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1
              }}>
                <Typography variant="caption" color="text.secondary">
                  Checklist Progress
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  {checklistProgress.toFixed(0)}%
                </Typography>
              </Box>

              <LinearProgress
                variant="determinate"
                value={checklistProgress}
                color={checklistProgress === 100 ? "success" : "info"}
                sx={{
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: 'grey.200'
                }}
              />
            </>
          )}
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

        {/* Variable Summary Display */}
        {hasVariables && (
          <Box sx={{ mt: 2 }}>
            <VariableSummaryDisplay
              summary={variableSummary}
              title="Resource Summary"
              defaultExpanded={showVariables}
              compact
            />
          </Box>
        )}

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

      {/* Collapsible checklist */}
      {item.children.length > 0 && (
        <Collapse in={checklistExpanded}>
          <Divider />
          <Box sx={{ backgroundColor: 'grey.50' }}>
            <List dense sx={{ py: 1 }}>
              {checklistItems.map(({ checkListChild, item: childItem }) => (
                <ListItem key={checkListChild.relationshipId} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    {checkListChild.complete ? (
                      <CheckCircle sx={{ color: 'success.main', fontSize: '1.2rem' }} />
                    ) : (
                      <RadioButtonUnchecked sx={{ color: 'grey.400', fontSize: '1.2rem' }} />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={childItem?.name || 'Unknown Item'}
                    secondary={childItem ? formatDuration(childItem.duration) : ''}
                    slotProps={{
                      primary: {
                        variant: 'body2',
                        sx: {
                          textDecoration: checkListChild.complete ? 'line-through' : 'none',
                          color: checkListChild.complete ? 'text.secondary' : 'text.primary'
                        }
                      },
                      secondary: {
                        variant: 'caption'
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Collapse>
      )}

      {/* Child content area */}
      {children && (
        <>
          <Divider />
          <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
            {children}
          </Box>
        </>
      )}

      {/* Empty state for no checklist items when deepest */}
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
              No checklist items
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}
