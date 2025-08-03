import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography, Box } from "@mui/material";
import { useState, useCallback } from "react";
import { clearAllPersistedData } from "../functions/utils/localStorage";

export default function StorageManagementButton() {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  const handleClearStorage = useCallback(() => {
    if (window.confirm("Are you sure you want to clear all saved data? This action cannot be undone.")) {
      clearAllPersistedData();
      handleClose();
      // Refresh the page to reload with empty state
      window.location.reload();
    }
  }, [handleClose]);

  const getStorageSize = useCallback(() => {
    let total = 0;
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('about-time-')) {
        total += localStorage[key].length + key.length;
      }
    }
    return total;
  }, []);

  const getStorageInfo = useCallback(() => {
    const keys = ['about-time-items', 'about-time-base-calendar', 'about-time-item-instances', 'about-time-app-settings'];
    return keys.map(key => ({
      key,
      exists: localStorage.getItem(key) !== null,
      size: localStorage.getItem(key)?.length || 0
    }));
  }, []);

  return (
    <>
      <Button variant="outlined" onClick={handleOpen}>
        Storage
      </Button>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Storage Management</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Storage Information
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total size: ~{Math.round(getStorageSize() / 1024 * 100) / 100} KB
            </Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Data Sources
            </Typography>
            {getStorageInfo().map(info => (
              <Typography key={info.key} variant="body2" sx={{ ml: 1 }}>
                • {info.key.replace('about-time-', '')}: {info.exists ? `${Math.round(info.size / 1024 * 100) / 100} KB` : 'Not saved'}
              </Typography>
            ))}
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Your items, calendar entries, execution instances, and app settings are automatically saved to your browser's local storage.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>
            Close
          </Button>
          <Button onClick={handleClearStorage} color="error" variant="contained">
            Clear All Data
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
