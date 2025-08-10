import { Box, Typography, Paper, Chip, Button } from '@mui/material';
import { Edit, Schedule, Delete, Add } from '@mui/icons-material';
import { SubCalendarItem, hasChildren, getChildren, getChildId, type ChildReference } from '../../functions/utils/item/index';
import { formatDuration } from '../../functions/utils/formatTime';
import { getItemById } from '../../functions/utils/item/utils';
import { useAppState, useAppDispatch } from '../../reducerContexts';
import { useViewportHeight } from '../../hooks/useViewportHeight';
import { useMemo, useCallback } from 'react';
import ItemSchedule from '../ItemSchedule';
import LedgerLines from '../LedgerLines';

interface FocusedSubCalendarItemDisplayProps {
  readonly item: SubCalendarItem;
}

export default function FocusedSubCalendarItemDisplay({ item }: FocusedSubCalendarItemDisplayProps) {
  const { items, pixelsPerSegment, millisecondsPerSegment } = useAppState();
  const appDispatch = useAppDispatch();
  const viewportHeight = useViewportHeight();

  const handleEditTemplate = useCallback(() => {
    // TODO: Implement template property editing (name, duration, description, etc.)
    alert('Edit Template Properties functionality not yet implemented');
  }, []);

  const handleScheduleChildTemplate = useCallback(() => {
    // Enter scheduling mode and open the sidebar
    appDispatch({
      type: 'BATCH', payload: [
        { type: 'SET_SCHEDULING_MODE', payload: { schedulingMode: true } },
        { type: 'SET_SIDE_DRAWER_OPEN', payload: { sideDrawerOpen: true } }
      ]
    });
  }, [appDispatch]);

  const handleCreateInstance = useCallback(() => {
    // Open the scheduling dialog to create an instance of this template
    appDispatch({ type: 'SET_SCHEDULING_DIALOG_OPEN', payload: { schedulingDialogOpen: true } });
  }, [appDispatch]);

  const handleDeleteTemplate = useCallback(() => {
    // Confirm deletion and delete the template
    if (window.confirm(`Are you sure you want to delete the SubCalendar template "${item.name}"? This action cannot be undone.`)) {
      appDispatch({ type: 'DELETE_ITEM_BY_ID', payload: { id: item.id } });
    }
  }, [appDispatch, item.id, item.name]);

  // Calculate if the template timeline would exceed maximum height
  const itemExceedsMaxHeight = useMemo(() => {
    return (item.duration * pixelsPerSegment / millisecondsPerSegment) > (viewportHeight * 2);
  }, [item.duration, pixelsPerSegment, millisecondsPerSegment, viewportHeight]);

  // Calculate template statistics
  const templateStats = useMemo(() => {
    const totalChildTemplates = item.children.length;
    const uniqueTemplates = new Set(item.children.map(child => child.id)).size;
    const totalScheduledDuration = item.children.reduce((acc, child) => {
      const childTemplate = getItemById(items, child.id);
      return acc + (childTemplate?.duration || 0);
    }, 0);

    return {
      total: totalChildTemplates,
      unique: uniqueTemplates,
      hasDuplicates: uniqueTemplates < totalChildTemplates,
      scheduledDuration: totalScheduledDuration,
      utilizationPercent: item.duration > 0 ? (totalScheduledDuration / item.duration) * 100 : 0
    };
  }, [item.children, item.duration, items]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header Information */}
      <Paper sx={{ p: 2, mb: 2, mx: 2, mt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
              {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              SubCalendar Template - Child Template Timeline
            </Typography>
          </Box>
          <Chip label="SubCalendar Template" color="info" variant="outlined" />
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">Template Duration</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {formatDuration(item.duration)}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">Child Templates</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {templateStats.total} template{templateStats.total !== 1 ? 's' : ''}
              {templateStats.hasDuplicates && (
                <Chip label="has duplicates" size="small" color="warning" variant="outlined" sx={{ ml: 1 }} />
              )}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">Timeline Utilization</Typography>
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {templateStats.utilizationPercent.toFixed(1)}%
            </Typography>
          </Box>

          {item.parents.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary">Used as Child Template</Typography>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {item.parents.length} parent{item.parents.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          )}

          {Object.keys(item.variables).length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary">Template Variables</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                {Object.entries(item.variables).map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Template Actions */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            color="primary"
            size="small"
            onClick={handleEditTemplate}
          >
            Edit Template Properties
          </Button>
          <Button
            variant="outlined"
            startIcon={<Schedule />}
            color="secondary"
            size="small"
            onClick={handleScheduleChildTemplate}
          >
            Schedule Child Template
          </Button>
          <Button
            variant="contained"
            startIcon={<Schedule />}
            color="secondary"
            size="small"
            onClick={handleCreateInstance}
          >
            Create Instance
          </Button>
          <Button
            variant="outlined"
            startIcon={<Delete />}
            color="error"
            size="small"
            onClick={handleDeleteTemplate}
          >
            Delete Template
          </Button>
        </Box>
      </Paper>

      {/* Template Timeline View */}
      <Box
        sx={{
          flex: 1,
          position: 'relative',
          mx: 2,
          border: '2px dashed',
          borderColor: 'primary.main',
          borderRadius: 1,
          // Add overflow scrolling when items exceed maximum height
          ...(itemExceedsMaxHeight && {
            maxHeight: `${viewportHeight * 2}px`,
            overflowY: 'auto',
            borderColor: 'warning.main',
            borderStyle: 'solid',
          })
        }}
      >
        <LedgerLines />

        {/* Render child templates on the timeline */}
        {hasChildren(item) && getChildren(item).map((child: ChildReference) => {
          const childId = getChildId(child);
          const childTemplate = getItemById(items, childId);
          if (childTemplate === null) {
            throw new Error(`Template with id ${childId} not found while rendering children in FocusedSubCalendarItemDisplay`);
          }
          return (
            <ItemSchedule
              key={child.relationshipId}
              item={childTemplate}
              start={'start' in child ? child.start : null}
              relationshipId={child.relationshipId}
            />
          );
        })}

        {/* Show a message when there are no child templates */}
        {(!hasChildren(item) || getChildren(item).length === 0) && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'rgba(0, 0, 0, 0.6)',
              fontSize: '16px',
              p: 3
            }}
          >
            <Typography variant="h6" gutterBottom>
              No Child Templates Scheduled
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              This template timeline is empty. To add child templates:
              {'\n'}• Select a template from the sidebar, then click the Timer icon (⏲) to schedule it as a child
              {'\n'}• Or use the "Schedule Child Template" button above for guided instructions
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Add />}
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleScheduleChildTemplate}
            >
              Add First Child Template
            </Button>
          </Box>
        )}
      </Box>

      {/* Template Info Footer */}
      <Box sx={{ p: 2, mx: 2, mb: 2 }}>
        <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
          <Typography variant="body2" color="info.contrastText">
            <strong>Template View:</strong> This shows the structural timeline of child templates within this SubCalendar template.
            When this template is instantiated, each child template will be scheduled at the relative times shown above.
            {itemExceedsMaxHeight && (
              <span style={{ display: 'block', marginTop: '8px', fontWeight: 'bold' }}>
                ⚠ Timeline is truncated due to size - scroll to see all child templates.
              </span>
            )}
          </Typography>
        </Paper>
      </Box>
    </Box>
  );
}
