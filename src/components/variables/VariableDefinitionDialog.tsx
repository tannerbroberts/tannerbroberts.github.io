import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { Description, WarningAmber } from '@mui/icons-material';

interface VariableDefinitionDialogProps {
  readonly open: boolean;
  readonly variableName: string;
  readonly onComplete: (description?: string, skipDescription?: boolean) => void;
  readonly onCancel: () => void;
}

export default function VariableDefinitionDialog({
  open,
  variableName,
  onComplete,
  onCancel
}: VariableDefinitionDialogProps) {
  const [description, setDescription] = useState('');
  const [showSkipWarning, setShowSkipWarning] = useState(false);

  // Handle save with description
  const handleSave = useCallback(() => {
    onComplete(description.trim() || undefined);
    setDescription('');
    setShowSkipWarning(false);
  }, [description, onComplete]);

  // Handle skip description
  const handleSkip = useCallback(() => {
    if (!showSkipWarning) {
      setShowSkipWarning(true);
      return;
    }
    onComplete(undefined, true);
    setDescription('');
    setShowSkipWarning(false);
  }, [showSkipWarning, onComplete]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    onCancel();
    setDescription('');
    setShowSkipWarning(false);
  }, [onCancel]);

  // Handle keyboard shortcuts
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && event.ctrlKey) {
      event.preventDefault();
      handleSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      maxWidth="md"
      fullWidth
      aria-labelledby="variable-definition-dialog-title"
    >
      <DialogTitle id="variable-definition-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Description />
          <Typography variant="h6">
            New Variable: "{variableName}"
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          This is the first time you're using the variable "{variableName}".
          You can add a description to help you remember what this variable represents.
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Describe what this variable represents, its typical uses, or any important notes..."
          helperText="You can use [square brackets] to reference other variables (feature coming soon)"
        />

        {showSkipWarning && (
          <Alert
            severity="warning"
            sx={{ mt: 2 }}
            icon={<WarningAmber />}
          >
            <Typography variant="body2">
              Are you sure you want to skip adding a description?
              You can always add one later, but descriptions help with organization and searching.
            </Typography>
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleCancel}>
          Cancel
        </Button>

        <Button
          onClick={handleSkip}
          color={showSkipWarning ? "warning" : "inherit"}
        >
          {showSkipWarning ? "Yes, Skip" : "Skip Description"}
        </Button>

        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!description.trim() && !showSkipWarning}
        >
          {description.trim() ? "Save with Description" : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
