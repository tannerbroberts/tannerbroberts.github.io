import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItem, ListItemText, Chip, Stack } from '@mui/material';

export type ConflictItem = {
  id: string;
  templateHash: string;
  start: number;
  end: number;
  priority?: number;
}

export function ConflictPrioritizationDialog({
  open,
  items,
  onChoose,
  onSnooze,
  onClose
}: Readonly<{
  open: boolean;
  items: ConflictItem[];
  onChoose: (id: string) => void;
  onSnooze: (minutes: number) => void;
  onClose: () => void;
}>) {
  const now = Date.now();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Choose which to do now</DialogTitle>
      <DialogContent>
        <List>
          {items.map(it => (
            <ListItem key={it.id} secondaryAction={
              <Button variant="contained" size="small" onClick={() => onChoose(it.id)}>Do this</Button>
            }>
              <ListItemText
                primary={`Item ${it.templateHash.slice(0, 6)}…`}
                secondary={`Priority ${it.priority ?? 0} • ${new Date(it.start).toLocaleTimeString()}–${new Date(it.end).toLocaleTimeString()}`}
              />
              {now >= it.start && now < it.end ? <Chip size="small" color="primary" label="Active" /> : null}
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" spacing={1} sx={{ mr: 1 }}>
          <Button onClick={() => onSnooze(5)}>Snooze 5m others</Button>
          <Button onClick={() => onSnooze(10)}>Snooze 10m others</Button>
        </Stack>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
