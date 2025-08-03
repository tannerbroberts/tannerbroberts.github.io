import { Box, Typography, Paper, Divider, Chip, List, ListItem, ListItemText, Button, IconButton } from '@mui/material';
import { Edit, Schedule, Delete, Add, Remove, DragIndicator } from '@mui/icons-material';
import { CheckListItem } from '../../functions/utils/item/index';
import { formatDuration } from '../../functions/utils/formatTime';
import { getItemById } from '../../functions/utils/item/utils';
import { useAppState, useAppDispatch } from '../../reducerContexts/App';
import { useMemo, useCallback } from 'react';

interface FocusedCheckListItemDisplayProps {
  readonly item: CheckListItem;
}

export default function FocusedCheckListItemDisplay({ item }: FocusedCheckListItemDisplayProps) {
  const { items } = useAppState();
  const appDispatch = useAppDispatch();

  const handleEditTemplate = useCallback(() => {
    // TODO: Implement template property editing (name, checklist items, etc.)
    alert('Edit Template Properties functionality not yet implemented');
  }, []);

  const handleAddChildTemplate = useCallback(() => {
    // TODO: Open a template picker dialog to select which template to add as a child
    // For now, direct users to use the drag and drop workflow from the sidebar
    alert('To add child templates to this checklist:\n\n1. Drag a template from the sidebar list\n2. Drop it into the checklist child areas\n\nA dedicated template picker dialog will be added in a future update.');
  }, []);

  const handleCreateInstance = useCallback(() => {
    // Open the scheduling dialog to create an instance of this template
    appDispatch({ type: 'SET_SCHEDULING_DIALOG_OPEN', payload: { schedulingDialogOpen: true } });
  }, [appDispatch]);

  const handleDeleteTemplate = useCallback(() => {
    // Confirm deletion and delete the template
    if (window.confirm(`Are you sure you want to delete the checklist template "${item.name}"? This action cannot be undone.`)) {
      appDispatch({ type: 'DELETE_ITEM_BY_ID', payload: { id: item.id } });
    }
  }, [appDispatch, item.id, item.name]);

  const handleRemoveChild = useCallback((relationshipId: string) => {
    if (window.confirm('Are you sure you want to remove this child template from the checklist?')) {
      appDispatch({
        type: 'REMOVE_INSTANCE_BY_RELATIONSHIP_ID',
        payload: { relationshipId }
      });
    }
  }, [appDispatch]);

  // Calculate template statistics (not completion)
  const templateStats = useMemo(() => {
    const totalChildTemplates = item.children.length;
    const uniqueTemplates = new Set(item.children.map(child => child.itemId)).size;

    return {
      total: totalChildTemplates,
      unique: uniqueTemplates,
      hasDuplicates: uniqueTemplates < totalChildTemplates
    };
  }, [item.children]);

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Paper sx={{ p: 3, maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 'bold' }}>
            {item.name}
          </Typography>
          <Chip label="Checklist Template" color="secondary" variant="outlined" />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Template Properties */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Template Duration
              </Typography>
              <Typography variant="body1" sx={{ fontSize: '1.1rem' }}>
                {formatDuration(item.duration)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Total estimated time for all child templates
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Sort Order
              </Typography>
              <Chip
                label={item.sortType}
                variant="outlined"
                size="small"
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                How child templates are ordered in instances
              </Typography>
            </Box>
          </Box>

          {item.parents.length > 0 && (
            <Box>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Used as Child Template
              </Typography>
              <Typography variant="body1">
                This template is used in {item.parents.length} parent template{item.parents.length > 1 ? 's' : ''}
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
        <Box sx={{ display: 'flex', gap: 2, mb: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            color="primary"
            onClick={handleEditTemplate}
          >
            Edit Template Properties
          </Button>
          <Button
            variant="outlined"
            startIcon={<Add />}
            color="secondary"
            onClick={handleAddChildTemplate}
          >
            Add Child Template
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

        <Divider sx={{ mb: 3 }} />

        {/* Child Templates */}
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Child Templates ({templateStats.total})
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip label={`${templateStats.unique} unique`} size="small" variant="outlined" />
              {templateStats.hasDuplicates && (
                <Chip label="has duplicates" size="small" color="warning" variant="outlined" />
              )}
            </Box>
          </Box>

          {item.children.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                No child templates defined yet.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                color="primary"
                size="small"
                onClick={handleAddChildTemplate}
              >
                Add First Child Template
              </Button>
            </Box>
          ) : (
            <List sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              {item.children.map((child, index) => {
                const childTemplate = getItemById(items, child.itemId);
                if (!childTemplate) return null;

                return (
                  <ListItem
                    key={child.relationshipId}
                    divider={index < item.children.length - 1}
                    sx={{
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <IconButton size="small" sx={{ mr: 1 }}>
                      <DragIndicator />
                    </IconButton>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                            {index + 1}. {childTemplate.name}
                          </Typography>
                          <Chip
                            label={childTemplate.constructor.name.replace('Item', '')}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={`Template Duration: ${formatDuration(childTemplate.duration)}`}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton size="small" color="primary">
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveChild(child.relationshipId)}
                      >
                        <Remove />
                      </IconButton>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Box>

        {/* Template Info */}
        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="info.contrastText">
            <strong>Template View:</strong> This checklist template defines the structure and order of child templates.
            When instantiated, each child template will become a checkable task item in the order specified.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
