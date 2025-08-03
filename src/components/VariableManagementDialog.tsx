import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface VariableManagementDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly itemId: string | null;
}

export default function VariableManagementDialog({ open, onClose, itemId }: VariableManagementDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Variable Management</DialogTitle>
      <DialogContent>
        <Typography>
          Variable management system for item: {itemId || 'None selected'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This is a placeholder for the simplified variable system.
          Advanced variable features will be implemented here.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
