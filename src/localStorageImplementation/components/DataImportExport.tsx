import { useState, useRef, ReactElement } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  List,
  ListItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import {
  Upload,
  Download,
  FileDownload,
  FileUpload,
  DataObject
} from '@mui/icons-material';
import { devTools } from '../devTools';

interface DataImportExportProps {
  onImportComplete?: (success: boolean, message: string) => void;
  onExportComplete?: (success: boolean, filename: string) => void;
}

interface ImportStatus {
  status: 'idle' | 'processing' | 'success' | 'error';
  message: string;
  details?: string[];
}

interface ExportStatus {
  status: 'idle' | 'processing' | 'success' | 'error';
  message: string;
  filename?: string;
}

export function DataImportExport({
  onImportComplete,
  onExportComplete
}: Readonly<DataImportExportProps>): ReactElement {
  const [importStatus, setImportStatus] = useState<ImportStatus>({ status: 'idle', message: '' });
  const [exportStatus, setExportStatus] = useState<ExportStatus>({ status: 'idle', message: '' });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('json');
  const [customFilename, setCustomFilename] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (): void => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportStatus({ status: 'processing', message: 'Reading file...' });

    try {
      const text = await file.text();
      let data;

      // Try to parse as JSON
      try {
        data = JSON.parse(text);
      } catch {
        setImportStatus({
          status: 'error',
          message: 'Invalid file format. Please upload a valid JSON file.',
        });
        return;
      }

      // Validate the data structure
      const validation = validateImportData(data);
      if (!validation.valid) {
        setImportStatus({
          status: 'error',
          message: 'Invalid data structure',
          details: validation.errors
        });
        return;
      }

      setImportStatus({ status: 'processing', message: 'Importing data...' });

      // Import the data using devTools
      if (devTools) {
        // For now, use a simplified import via localStorage
        try {
          localStorage.setItem('atp-items', JSON.stringify(data.items || []));
          localStorage.setItem('atp-calendar', JSON.stringify(data.calendar || []));

          setImportStatus({
            status: 'success',
            message: `Successfully imported data`,
            details: [`Items: ${data.items?.length || 0}`, `Calendar entries: ${data.calendar?.length || 0}`]
          });
          onImportComplete?.(true, 'Import completed');
        } catch (error) {
          console.error('Import error:', error);
          setImportStatus({
            status: 'error',
            message: 'Failed to save imported data'
          });
          onImportComplete?.(false, 'Import failed');
        }
      } else {
        setImportStatus({
          status: 'error',
          message: 'Development tools not available'
        });
      }
    } catch (error) {
      setImportStatus({
        status: 'error',
        message: `Error reading file: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      onImportComplete?.(false, 'File read error');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExport = async (): Promise<void> => {
    if (!devTools) {
      setExportStatus({
        status: 'error',
        message: 'Development tools not available'
      });
      return;
    }

    setExportStatus({ status: 'processing', message: 'Preparing export...' });

    try {
      const filename = customFilename || `atp-data-${new Date().toISOString().split('T')[0]}`;

      // Export using existing storage
      const items = JSON.parse(localStorage.getItem('atp-items') || '[]');
      const calendar = JSON.parse(localStorage.getItem('atp-calendar') || '[]');

      const exportData = {
        items,
        calendar,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      let dataString: string;
      if (exportFormat === 'json') {
        dataString = JSON.stringify(exportData, null, 2);
      } else {
        // Simple CSV export for items
        const csvHeaders = 'ID,Name,Type,Description\n';
        const csvRows = items.map((item: { id: string; name: string; type: string; description?: string }) =>
          `"${item.id}","${item.name}","${item.type}","${item.description || ''}"`
        ).join('\n');
        dataString = csvHeaders + csvRows;
      }

      // Create and trigger download
      const blob = new Blob([dataString], {
        type: exportFormat === 'json' ? 'application/json' : 'text/csv'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus({
        status: 'success',
        message: 'Export completed successfully',
        filename: `${filename}.${exportFormat}`
      });
      onExportComplete?.(true, `${filename}.${exportFormat}`);
    } catch (error) {
      console.error('Export error:', error);
      setExportStatus({
        status: 'error',
        message: 'Export failed'
      });
      onExportComplete?.(false, '');
    }

    setShowExportDialog(false);
  };

  const resetImportStatus = (): void => {
    setImportStatus({ status: 'idle', message: '' });
  };

  const resetExportStatus = (): void => {
    setExportStatus({ status: 'idle', message: '' });
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Typography variant="h6" gutterBottom>
        Data Import/Export
      </Typography>

      {/* Import Section */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            <FileUpload sx={{ verticalAlign: 'middle', mr: 1 }} />
            Import Data
          </Typography>

          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Import ATP data from a JSON file. This will replace existing data.
          </Typography>

          <Box display="flex" gap={2} alignItems="center" mb={2}>
            <Button
              variant="contained"
              startIcon={<Upload />}
              onClick={handleFileSelect}
              disabled={importStatus.status === 'processing'}
            >
              {importStatus.status === 'processing' ? 'Processing...' : 'Select File'}
            </Button>

            {importStatus.status !== 'idle' && (
              <Button
                variant="outlined"
                size="small"
                onClick={resetImportStatus}
              >
                Clear
              </Button>
            )}
          </Box>

          {importStatus.status === 'processing' && (
            <LinearProgress sx={{ mb: 2 }} />
          )}

          {importStatus.status !== 'idle' && (
            <Alert
              severity={getAlertSeverity(importStatus.status)}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2">{importStatus.message}</Typography>
              {importStatus.details && (
                <List dense>
                  {importStatus.details.map((detail, index) => (
                    <ListItem key={`detail-${detail}-${index}`} disablePadding>
                      <Typography variant="caption" color="textSecondary">
                        • {detail}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              )}
            </Alert>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json"
            style={{ display: 'none' }}
          />
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            <FileDownload sx={{ verticalAlign: 'middle', mr: 1 }} />
            Export Data
          </Typography>

          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Export all ATP data to a file for backup or transfer.
          </Typography>

          <Box display="flex" gap={2} alignItems="center" mb={2}>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => setShowExportDialog(true)}
              disabled={exportStatus.status === 'processing'}
            >
              {exportStatus.status === 'processing' ? 'Exporting...' : 'Export Data'}
            </Button>

            {exportStatus.status !== 'idle' && (
              <Button
                variant="outlined"
                size="small"
                onClick={resetExportStatus}
              >
                Clear
              </Button>
            )}
          </Box>

          {exportStatus.status === 'processing' && (
            <LinearProgress sx={{ mb: 2 }} />
          )}

          {exportStatus.status !== 'idle' && (
            <Alert
              severity={getAlertSeverity(exportStatus.status)}
              sx={{ mb: 2 }}
            >
              <Typography variant="body2">{exportStatus.message}</Typography>
              {exportStatus.filename && (
                <Typography variant="caption" color="textSecondary">
                  File: {exportStatus.filename}
                </Typography>
              )}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onClose={() => setShowExportDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Configuration</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Export Format
              </Typography>
              <Box display="flex" gap={1}>
                <Chip
                  label="JSON"
                  icon={<DataObject />}
                  clickable
                  color={exportFormat === 'json' ? 'primary' : 'default'}
                  onClick={() => setExportFormat('json')}
                />
                <Chip
                  label="CSV"
                  icon={<DataObject />}
                  clickable
                  color={exportFormat === 'csv' ? 'primary' : 'default'}
                  onClick={() => setExportFormat('csv')}
                />
              </Box>
            </Box>

            <TextField
              label="Custom Filename (optional)"
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
              placeholder="atp-data-2024-01-01"
              fullWidth
              size="small"
              helperText={`File extension .${exportFormat} will be added automatically`}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExportDialog(false)}>Cancel</Button>
          <Button onClick={handleExport} variant="contained">
            Export
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Helper functions
function validateImportData(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('Data must be a valid object');
    return { valid: false, errors };
  }

  const dataObj = data as Record<string, unknown>;

  // Check for required top-level properties
  if (!dataObj.items && !dataObj.calendar) {
    errors.push('Data must contain either "items" or "calendar" property');
  }

  // Validate items array
  if (dataObj.items !== undefined && !Array.isArray(dataObj.items)) {
    errors.push('Items property must be an array');
  }

  // Validate calendar array
  if (dataObj.calendar !== undefined && !Array.isArray(dataObj.calendar)) {
    errors.push('Calendar property must be an array');
  }

  return { valid: errors.length === 0, errors };
}

function getAlertSeverity(status: string): 'success' | 'error' | 'warning' | 'info' {
  switch (status) {
    case 'success': return 'success';
    case 'error': return 'error';
    case 'processing': return 'info';
    default: return 'info';
  }
}
