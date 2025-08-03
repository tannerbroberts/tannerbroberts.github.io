import { Box, Typography, Paper, Divider, Chip, Button } from '@mui/material';
import { Edit, Schedule, Delete } from '@mui/icons-material';
import { BasicItem } from '../../functions/utils/item/index';
import { formatDuration } from '../../functions/utils/formatTime';
import { useCallback } from 'react';
import { useAppDispatch } from '../../reducerContexts/App';

interface FocusedBasicItemDisplayProps {
  readonly item: BasicItem;
}

export default function FocusedBasicItemDisplay({ item }: FocusedBasicItemDisplayProps) {
  const appDispatch = useAppDispatch();

  const handleEditTemplate = useCallback(() => {
    // TODO: Implement template editing - could open a dialog or navigate to edit view
    alert('Edit Template functionality not yet implemented');
  }, []);

  const handleCreateInstance = useCallback(() => {
    // Open the scheduling dialog to create an instance of this template
    appDispatch({ type: 'SET_SCHEDULING_DIALOG_OPEN', payload: { schedulingDialogOpen: true } });
  }, [appDispatch]);

  const handleDeleteTemplate = useCallback(() => {
    // Confirm deletion and delete the template
    if (window.confirm(`Are you sure you want to delete the template "${item.name}"? This action cannot be undone.`)) {
      appDispatch({ type: 'DELETE_ITEM_BY_ID', payload: { id: item.id } });
    }
  }, [appDispatch, item.id, item.name]);
  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Paper sx={{ p: 3, maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
            {item.name}
          </Typography>
          <Chip label="Basic Item Template" color="primary" variant="outlined" />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Template Properties */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Template Duration
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
              {formatDuration(item.duration)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Default duration for instances created from this template
            </Typography>
          </Box>

          {item.priority > 0 && (
            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Priority Level
              </Typography>
              <Chip
                label={`Priority ${item.priority}`}
                color="warning"
                variant="filled"
                size="medium"
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                Higher priority templates are shown more prominently
              </Typography>
            </Box>
          )}

          {item.parents.length > 0 && (
            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Used as Child Template
              </Typography>
              <Typography variant="body1">
                This template is used in {item.parents.length} parent template{item.parents.length > 1 ? 's' : ''}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Other templates reference this as a child
              </Typography>
            </Box>
          )}

          {Object.keys(item.variables).length > 0 && (
            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Template Variables
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                {Object.entries(item.variables).map(([key, value]) => (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    variant="outlined"
                    size="small"
                  />
                ))}
              </Box>
              <Typography variant="caption" color="text.secondary">
                Default variable values for instances of this template
              </Typography>
            </Box>
          )}
        </Box>

        {/* Template Actions */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            color="primary"
            onClick={handleEditTemplate}
          >
            Edit Template
          </Button>
          <Button
            variant="contained"
            startIcon={<Schedule />}
            color="secondary"
            onClick={handleCreateInstance}
          >
            Create Instance
          </Button>
          <Button
            variant="outlined"
            startIcon={<Delete />}
            color="error"
            onClick={handleDeleteTemplate}
          >
            Delete Template
          </Button>
        </Box>

        {/* Template Info */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="info.contrastText">
            <strong>Template View:</strong> This is an item template that can be instantiated multiple times.
            Use "Create Instance" to schedule this template on a calendar or as part of another template.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
