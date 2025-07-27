import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider
} from '@mui/material';
import { useAppState } from '../../reducerContexts/App';
import { useItemVariables } from '../../hooks/useItemVariables';
import { getItemById } from '../../functions/utils/item/utils';
import VariableInput from '../variables/VariableInput';
import VariableSummaryDisplay from '../variables/VariableSummaryDisplay';
import VariableExportImport from '../variables/VariableExportImport';
import { Variable } from '../../functions/utils/variable/types';

interface VariableManagementDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly itemId: string | null;
}

export default function VariableManagementDialog({
  open,
  onClose,
  itemId
}: VariableManagementDialogProps) {
  const { items } = useAppState();
  const { variables, variableSummary, setVariables } = useItemVariables(itemId || '');
  const [localVariables, setLocalVariables] = useState(variables);

  const item = useMemo(() => {
    return itemId ? getItemById(items, itemId) : null;
  }, [items, itemId]);

  // Sync local state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalVariables(variables);
    }
  }, [open, variables]);

  const handleSave = useCallback(() => {
    if (itemId) {
      setVariables(localVariables);
    }
    onClose();
  }, [itemId, localVariables, setVariables, onClose]);

  const handleCancel = useCallback(() => {
    setLocalVariables(variables); // Reset to original
    onClose();
  }, [variables, onClose]);

  const handleImportVariables = useCallback((importedVariables: Variable[]) => {
    // Merge imported variables with existing ones
    const mergedVariables = [...localVariables];

    for (const importedVar of importedVariables) {
      const existingIndex = mergedVariables.findIndex(v =>
        v.name.toLowerCase() === importedVar.name.toLowerCase()
      );

      if (existingIndex >= 0) {
        // Combine quantities for duplicate names
        const existing = mergedVariables[existingIndex];
        mergedVariables[existingIndex] = {
          ...existing,
          quantity: existing.quantity + importedVar.quantity,
          unit: existing.unit || importedVar.unit,
          category: existing.category || importedVar.category
        };
      } else {
        mergedVariables.push(importedVar);
      }
    }

    setLocalVariables(mergedVariables);
  }, [localVariables]);

  if (!item) return null;

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Variables for "{item.name}"
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <VariableInput
            variables={localVariables}
            onChange={setLocalVariables}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <VariableExportImport
            variables={localVariables}
            onImport={handleImportVariables}
          />
        </Box>

        {Object.keys(variableSummary).length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Summary (including children)
            </Typography>
            <VariableSummaryDisplay
              summary={variableSummary}
              title="Calculated Summary"
              defaultExpanded
              compact
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Variables
        </Button>
      </DialogActions>
    </Dialog>
  );
}
