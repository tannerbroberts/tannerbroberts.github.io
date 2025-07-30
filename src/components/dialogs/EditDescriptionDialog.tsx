import React, { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Divider
} from '@mui/material';
import { Save, Close, Preview } from '@mui/icons-material';
import DescriptionEditor from '../variables/DescriptionEditor';
import DescriptionDisplay from '../variables/DescriptionDisplay';

interface EditDescriptionDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (description: string) => void;
  initialDescription: string;
  variableName: string;
  title?: string;
  saving?: boolean;
  error?: string;
}

export default function EditDescriptionDialog({
  open,
  onClose,
  onSave,
  initialDescription,
  variableName,
  title,
  saving = false,
  error
}: Readonly<EditDescriptionDialogProps>) {
  const [description, setDescription] = useState(initialDescription);
  const [showPreview, setShowPreview] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (open) {
      setDescription(initialDescription);
      setHasUnsavedChanges(false);
      setShowPreview(false);
    }
  }, [open, initialDescription]);

  // Track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(description !== initialDescription);
  }, [description, initialDescription]);

  const handleDescriptionChange = useCallback((newDescription: string) => {
    setDescription(newDescription);
  }, []);

  const handleSave = useCallback(() => {
    if (description.trim().length < 10) {
      return; // Don't save if description is too short
    }
    onSave(description.trim());
  }, [description, onSave]);

  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      const shouldDiscard = window.confirm(
        'You have unsaved changes. Are you sure you want to discard them?'
      );
      if (!shouldDiscard) {
        return;
      }
    }
    onClose();
  }, [hasUnsavedChanges, onClose]);

  const handleTogglePreview = useCallback(() => {
    setShowPreview(!showPreview);
  }, [showPreview]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      handleCancel();
    } else if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      handleSave();
    }
  }, [handleCancel, handleSave]);

  const isValid = description.trim().length >= 10;
  const dialogTitle = title || `Edit Description: ${variableName}`;

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      onKeyDown={handleKeyDown}
      slotProps={{
        paper: {
          sx: { minHeight: '60vh' }
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          {dialogTitle}
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={handleTogglePreview}
          startIcon={<Preview />}
          disabled={saving}
        >
          {showPreview ? 'Edit' : 'Preview'}
        </Button>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Provide a clear description of what the <strong>{variableName}</strong> variable represents.
            Use square brackets to reference other variables, e.g., [ingredient_name].
          </Typography>
        </Box>

        {showPreview ? (
          <>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Preview:
            </Typography>
            <Box
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                p: 2,
                backgroundColor: 'background.paper',
                minHeight: 200
              }}
            >
              <DescriptionDisplay
                description={description}
                showExpandToggle={false}
                onVariableClick={(variableName) => {
                  console.log('Variable clicked:', variableName);
                }}
              />
            </Box>
          </>
        ) : (
          <DescriptionEditor
            value={description}
            onChange={handleDescriptionChange}
            disabled={saving}
            showPreview={false}
            placeholder={`Describe what ${variableName} represents, how it's used, and any important details...`}
          />
        )}

        {hasUnsavedChanges && (
          <Alert severity="info" sx={{ mt: 2 }}>
            You have unsaved changes.
          </Alert>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handleCancel}
          disabled={saving}
          startIcon={<Close />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !isValid}
          startIcon={<Save />}
        >
          {saving ? 'Saving...' : 'Save Description'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
