import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts";
import { getItemById } from "../functions/utils/item/index";

export default function CheckListChildDialog() {
  const { checkListChildDialogOpen, items, focusedItemId } = useAppState();
  const dispatch = useAppDispatch();

  const handleClose = useCallback(() => {
    dispatch({ type: 'SET_CHECKLIST_CHILD_DIALOG_OPEN', payload: { checkListChildDialogOpen: false } });
  }, [dispatch]);

  // For now, disable this functionality since we need to redesign it without sidebar selection
  const focusedItem = focusedItemId ? getItemById(items, focusedItemId) : null;

  return (
    <Dialog open={checkListChildDialogOpen} onClose={handleClose}>
      <DialogTitle>
        Add Item to Checklist
      </DialogTitle>
      <DialogContent sx={{ padding: 3, minWidth: 400 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle1">
            Add child template to checklist:
          </Typography>

          {focusedItem && (
            <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Target checklist:
              </Typography>
              <Typography variant="body2">
                {focusedItem.name}
              </Typography>
            </Box>
          )}

          <Box sx={{ p: 2, bgcolor: '#fff3e0', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              🚧 This feature needs to be redesigned. For now, you can add child templates using the "Add Child Template" button in the focused item view, or drag items from the sidebar list into checklist child areas.
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button onClick={handleClose} color="inherit">Close</Button>
      </DialogActions>
    </Dialog>
  );
}
