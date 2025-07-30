import { useState, useCallback, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  TextField,
  Divider
} from '@mui/material';
import { Download, Upload, ContentCopy, Restore } from '@mui/icons-material';
import type { BadgeSettings } from '../types/badgeSettings';
import { validateBadgeSettings, DEFAULT_BADGE_SETTINGS } from '../types/badgeSettings';

interface SettingsImportExportProps {
  readonly onImport: (settings: BadgeSettings) => void;
  readonly onExport: () => BadgeSettings;
}

export default function SettingsImportExport({ onImport, onExport }: SettingsImportExportProps) {
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [exportText, setExportText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    const settings = onExport();
    const jsonString = JSON.stringify(settings, null, 2);
    setExportText(jsonString);
  }, [onExport]);

  const handleDownload = useCallback(() => {
    const settings = onExport();
    const jsonString = JSON.stringify(settings, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `badge-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [onExport]);

  const handleCopyToClipboard = useCallback(async () => {
    if (exportText) {
      try {
        await navigator.clipboard.writeText(exportText);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  }, [exportText]);

  const validateAndImport = useCallback((jsonString: string) => {
    try {
      const parsed = JSON.parse(jsonString);
      const validation = validateBadgeSettings(parsed);

      if (!validation.isValid) {
        setImportError(`Invalid settings: ${validation.errors.join(', ')}`);
        setImportSuccess(false);
        return;
      }

      if (validation.warnings.length > 0) {
        console.warn('Settings warnings:', validation.warnings);
      }

      onImport(parsed as BadgeSettings);
      setImportError(null);
      setImportSuccess(true);
      setImportText('');
    } catch (error) {
      console.error('Failed to parse settings JSON:', error);
      setImportError('Invalid JSON format');
      setImportSuccess(false);
    }
  }, [onImport]);

  const handleImportFromText = useCallback(() => {
    if (!importText.trim()) {
      setImportError('Please enter settings JSON');
      return;
    }
    validateAndImport(importText);
  }, [importText, validateAndImport]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        validateAndImport(content);
      }
    };
    reader.onerror = () => {
      setImportError('Failed to read file');
      setImportSuccess(false);
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [validateAndImport]);

  const handleRestoreDefaults = useCallback(() => {
    onImport(DEFAULT_BADGE_SETTINGS);
    setImportError(null);
    setImportSuccess(true);
  }, [onImport]);

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Import & Export Settings
      </Typography>

      <Typography variant="body2" color="text.secondary" gutterBottom>
        Backup your badge settings or share them with others. You can export to a file or copy the JSON directly.
      </Typography>

      {/* Export Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Download />
          Export Settings
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Button variant="outlined" onClick={handleExport}>
            Generate Export
          </Button>
          <Button
            variant="outlined"
            onClick={handleDownload}
            disabled={!exportText}
            startIcon={<Download />}
          >
            Download File
          </Button>
          <Button
            variant="outlined"
            onClick={handleCopyToClipboard}
            disabled={!exportText}
            startIcon={<ContentCopy />}
          >
            Copy JSON
          </Button>
        </Box>

        {exportText && (
          <TextField
            multiline
            fullWidth
            rows={8}
            value={exportText}
            label="Exported Settings (JSON)"
            variant="outlined"
            slotProps={{
              input: {
                readOnly: true,
                style: { fontFamily: 'monospace', fontSize: '0.875rem' }
              }
            }}
          />
        )}
      </Paper>

      <Divider sx={{ my: 2 }} />

      {/* Import Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Upload />
          Import Settings
        </Typography>

        {importError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {importError}
          </Alert>
        )}

        {importSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Settings imported successfully!
          </Alert>
        )}

        {/* File Upload */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Import from File
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            startIcon={<Upload />}
          >
            Choose File
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Text Import */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Import from JSON Text
          </Typography>
          <TextField
            multiline
            fullWidth
            rows={6}
            value={importText}
            onChange={(e) => {
              setImportText(e.target.value);
              setImportError(null);
              setImportSuccess(false);
            }}
            placeholder="Paste your badge settings JSON here..."
            variant="outlined"
            sx={{ mb: 1, fontFamily: 'monospace' }}
          />
          <Button
            variant="outlined"
            onClick={handleImportFromText}
            disabled={!importText.trim()}
          >
            Import Settings
          </Button>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Restore Defaults */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Restore Defaults
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Reset all badge settings to their default values.
          </Typography>
          <Button
            variant="outlined"
            color="warning"
            onClick={handleRestoreDefaults}
            startIcon={<Restore />}
          >
            Restore Default Settings
          </Button>
        </Box>
      </Paper>

      {/* Usage Instructions */}
      <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom>
          Usage Tips
        </Typography>
        <Typography variant="body2" component="div">
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li>Export settings before making major changes as a backup</li>
            <li>Share settings files with team members to maintain consistency</li>
            <li>Settings are automatically validated when imported</li>
            <li>Invalid settings will show error messages with details</li>
            <li>Partial settings will be merged with defaults</li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
}
