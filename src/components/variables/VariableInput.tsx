import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  InputAdornment
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import { Variable, parseVariableFromString, formatVariableForDisplay } from '../../functions/utils/item/index';

interface VariableInputProps {
  readonly variables: Variable[];
  readonly onChange: (variables: Variable[]) => void;
  readonly disabled?: boolean;
}

export default function VariableInput({
  variables,
  onChange,
  disabled = false
}: VariableInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAddVariable = useCallback(() => {
    if (!inputValue.trim()) return;

    try {
      const newVariable = parseVariableFromString(inputValue.trim());
      if (!newVariable) {
        setError('Invalid format. Use format like "-1 egg" or "+2 flour cup"');
        return;
      }

      // Check for duplicate names
      const existingNames = variables.map(v => v.name.toLowerCase());
      if (existingNames.includes(newVariable.name.toLowerCase())) {
        setError('Variable with this name already exists');
        return;
      }

      if (editingIndex !== null) {
        // Update existing variable
        const updatedVariables = [...variables];
        updatedVariables[editingIndex] = newVariable;
        onChange(updatedVariables);
        setEditingIndex(null);
      } else {
        // Add new variable
        onChange([...variables, newVariable]);
      }

      setInputValue('');
      setError(null);
    } catch {
      setError('Failed to parse variable');
    }
  }, [inputValue, variables, onChange, editingIndex]);

  const handleEditVariable = useCallback((index: number) => {
    const variable = variables[index];
    setInputValue(formatVariableForDisplay(variable));
    setEditingIndex(index);
  }, [variables]);

  const handleDeleteVariable = useCallback((index: number) => {
    const updatedVariables = variables.filter((_, i) => i !== index);
    onChange(updatedVariables);

    if (editingIndex === index) {
      setEditingIndex(null);
      setInputValue('');
    }
  }, [variables, onChange, editingIndex]);

  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
    setInputValue('');
    setError(null);
  }, []);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddVariable();
    } else if (event.key === 'Escape') {
      handleCancelEdit();
    }
  }, [handleAddVariable, handleCancelEdit]);

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        Variables
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        Define resource inputs/outputs (e.g., "-1 egg", "+2 flour cup", "-0.5 water liter")
      </Typography>

      {/* Input field */}
      <TextField
        fullWidth
        size="small"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="e.g., -1 egg or +2 flour cup"
        disabled={disabled}
        error={Boolean(error)}
        helperText={error}
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                {editingIndex !== null ? (
                  <>
                    <Button size="small" onClick={handleAddVariable} disabled={!inputValue.trim()}>
                      Update
                    </Button>
                    <Button size="small" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    size="small"
                    onClick={handleAddVariable}
                    disabled={!inputValue.trim()}
                    startIcon={<Add />}
                  >
                    Add
                  </Button>
                )}
              </InputAdornment>
            )
          }
        }}
        sx={{ mb: 2 }}
      />

      {/* Variables list */}
      {variables.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {variables.map((variable, index) => (
            <Chip
              key={`${variable.name}-${variable.quantity}-${index}`}
              label={formatVariableForDisplay(variable)}
              variant="outlined"
              color={variable.quantity >= 0 ? 'success' : 'error'}
              onDelete={disabled ? undefined : () => handleDeleteVariable(index)}
              onClick={disabled ? undefined : () => handleEditVariable(index)}
              deleteIcon={<Delete />}
              sx={{
                cursor: disabled ? 'default' : 'pointer',
                '&:hover': {
                  backgroundColor: disabled ? 'transparent' : 'action.hover'
                }
              }}
            />
          ))}
        </Box>
      )}

      {variables.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          No variables defined
        </Typography>
      )}
    </Box>
  );
}
