import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert
} from '@mui/material';
import { Download, Upload } from '@mui/icons-material';
import { Variable } from '../../functions/utils/variable/types';
import { parseVariableFromString, formatVariableForDisplay } from '../../functions/utils/variable/utils';

interface VariableExportImportProps {
  readonly variables: Variable[];
  readonly onImport: (variables: Variable[]) => void;
}

export default function VariableExportImport({
  variables,
  onImport
}: VariableExportImportProps) {
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = useCallback(() => {
    const variableStrings = variables.map(formatVariableForDisplay);
    const content = variableStrings.join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = 'variables.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [variables]);

  const processVariableLine = useCallback((line: string, importedVariables: Variable[], errors: string[]) => {
    try {
      const variable = parseVariableFromString(line.trim());
      if (!variable) {
        errors.push(`Invalid format: ${line}`);
        return;
      }

      // Check for duplicates in imported variables
      const existingIndex = importedVariables.findIndex(v =>
        v.name.toLowerCase() === variable.name.toLowerCase()
      );

      if (existingIndex >= 0) {
        // Combine quantities for duplicate names
        const existing = importedVariables[existingIndex];
        const combinedQuantity = existing.quantity + variable.quantity;

        importedVariables[existingIndex] = {
          ...existing,
          quantity: combinedQuantity,
          unit: existing.unit || variable.unit,
          category: existing.category || variable.category
        };
      } else {
        importedVariables.push(variable);
      }
    } catch (parseError) {
      errors.push(`Error parsing: ${line} - ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  }, []);

  const handleImport = useCallback(() => {
    setImportError(null);

    const lines = importText.split('\n').filter(line => line.trim());
    const importedVariables: Variable[] = [];
    const errors: string[] = [];

    for (const line of lines) {
      processVariableLine(line, importedVariables, errors);
    }

    if (errors.length > 0) {
      setImportError(`Import completed with errors:\n${errors.join('\n')}`);
    }

    if (importedVariables.length > 0) {
      onImport(importedVariables);
      setImportText('');

      if (errors.length === 0) {
        setImportError(null);
      }
    } else if (errors.length > 0) {
      setImportError('No valid variables found to import');
    }
  }, [importText, onImport, processVariableLine]);

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Export/Import Variables
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          startIcon={<Download />}
          onClick={handleExport}
          disabled={variables.length === 0}
          size="small"
          variant="outlined"
        >
          Export ({variables.length})
        </Button>
      </Box>

      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder="Paste variables here (one per line)&#10;e.g.:&#10;-1 egg&#10;+2 flour cup"
        value={importText}
        onChange={(e) => setImportText(e.target.value)}
        size="small"
        sx={{ mb: 1 }}
      />

      <Button
        startIcon={<Upload />}
        onClick={handleImport}
        disabled={!importText.trim()}
        size="small"
        variant="outlined"
        fullWidth
      >
        Import Variables
      </Button>

      {importError && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {importError}
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
