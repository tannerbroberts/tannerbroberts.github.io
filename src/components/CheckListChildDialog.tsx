import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts/App";
import { getItemById, CheckListItem } from "../functions/utils/item/index";

export default function CheckListChildDialog() {
  const { checkListChildDialogOpen, items, focusedListItemId, focusedItemId } = useAppState();
  const dispatch = useAppDispatch();

  const handleClose = useCallback(() => {
    dispatch({ type: 'SET_CHECKLIST_CHILD_DIALOG_OPEN', payload: { checkListChildDialogOpen: false } });
  }, [dispatch]);

  const addChildToChecklist = useCallback(() => {
    if (!focusedListItemId || !focusedItemId) {
      throw new Error('Both focusedListItemId and focusedItemId are required');
    }

    const focusedListItem = getItemById(items, focusedListItemId);
    const focusedItem = getItemById(items, focusedItemId);

    if (!focusedListItem) {
      throw new Error(`Item with id ${focusedListItemId} not found`);
    }

    if (!focusedItem) {
      throw new Error(`Item with id ${focusedItemId} not found`);
    }

    if (!(focusedItem instanceof CheckListItem)) {
      throw new Error('Focused item must be a CheckListItem to add children');
    }

    // Use the new reducer action to add child
    dispatch({
      type: "ADD_CHILD_TO_ITEM",
      payload: { parentId: focusedItemId, childId: focusedListItemId }
    });

    handleClose();
  }, [dispatch, focusedItemId, focusedListItemId, items, handleClose]);

  // Can add child if we have both a focused list item and a focused CheckListItem
  const focusedItem = focusedItemId ? getItemById(items, focusedItemId) : null;
  const canAddChild = focusedListItemId !== null &&
    focusedItemId !== null &&
    focusedItem instanceof CheckListItem &&
    focusedListItemId !== focusedItemId; // Can't add item to itself

  const focusedListItem = focusedListItemId ? getItemById(items, focusedListItemId) : null;

  return (
    <Dialog open={checkListChildDialogOpen} onClose={handleClose}>
      <DialogTitle>
        Add Item to Checklist
      </DialogTitle>
      <DialogContent sx={{ padding: 3, minWidth: 400 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="subtitle1">
            Add selected item to focused checklist:
          </Typography>

          {focusedListItem && (
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Item to add:
              </Typography>
              <Typography variant="body2">
                {focusedListItem.name}
              </Typography>
            </Box>
          )}

          {focusedItem && (
            <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                Add to checklist:
              </Typography>
              <Typography variant="body2">
                {focusedItem.name}
              </Typography>
            </Box>
          )}

          {!canAddChild && (
            <Box sx={{ p: 2, bgcolor: '#ffebee', borderRadius: 1 }}>
              <Typography variant="body2" color="error">
                {!focusedListItemId && "⚠ No item selected to add"}
                {!focusedItemId && "⚠ No checklist selected"}
                {focusedItemId && focusedItem && !(focusedItem instanceof CheckListItem) &&
                  "⚠ Focused item is not a checklist"}
                {focusedListItemId === focusedItemId && "⚠ Cannot add item to itself"}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ padding: 2 }}>
        <Button onClick={handleClose} color="inherit">Cancel</Button>
        <Button
          onClick={addChildToChecklist}
          variant="contained"
          color="primary"
          disabled={!canAddChild}
        >
          Add to Checklist
        </Button>
      </DialogActions>
    </Dialog>
  );
}
