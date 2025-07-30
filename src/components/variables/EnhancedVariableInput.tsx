import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Chip,
  Autocomplete
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { Variable, VariableImpl } from '../../functions/utils/variable/types';
import { formatVariableForDisplay } from '../../functions/utils/variable/utils';

interface EnhancedVariableInputProps {
  readonly variables: Variable[];
  readonly onChange: (variables: Variable[]) => void;
  readonly disabled?: boolean;
}

// Common units for suggestions
const COMMON_UNITS = [
  'cup', 'cups', 'liter', 'liters', 'l', 'gram', 'grams', 'g',
  'kg', 'kilogram', 'kilograms', 'lb', 'pound', 'pounds',
  'oz', 'ounce', 'ounces', 'tsp', 'teaspoon', 'teaspoons',
  'tbsp', 'tablespoon', 'tablespoons', 'ml', 'milliliter', 'milliliters',
  'piece', 'pieces', 'slice', 'slices', 'clove', 'cloves'
];

// Common categories for suggestions
const COMMON_CATEGORIES = [
  'ingredients', 'tools', 'nutrients', 'supplies', 'materials',
  'equipment', 'resources', 'consumables', 'components', 'outputs'
];

export default function EnhancedVariableInput({
  variables,
  onChange,
  disabled = false
}: EnhancedVariableInputProps) {
  // Form state
  const [variableName, setVariableName] = useState('');
  const [quantity, setQuantity] = useState<string>('');
  const [unit, setUnit] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Error state
  const [errors, setErrors] = useState<{
    name?: string;
    quantity?: string;
  }>({});

  // Get existing units and categories from variables
  const existingUnits = React.useMemo(() => {
    const units = new Set<string>();
    variables.forEach(v => {
      if (v.unit) units.add(v.unit);
    });
    return Array.from(units).sort((a, b) => a.localeCompare(b));
  }, [variables]);

  const existingCategories = React.useMemo(() => {
    const categories = new Set<string>();
    variables.forEach(v => {
      if (v.category) categories.add(v.category);
    });
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [variables]);

  const allUnits = React.useMemo(() => {
    const combined = new Set([...existingUnits, ...COMMON_UNITS]);
    return Array.from(combined).sort((a, b) => a.localeCompare(b));
  }, [existingUnits]);

  const allCategories = React.useMemo(() => {
    const combined = new Set([...existingCategories, ...COMMON_CATEGORIES]);
    return Array.from(combined).sort((a, b) => a.localeCompare(b));
  }, [existingCategories]);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors: typeof errors = {};

    if (!variableName.trim()) {
      newErrors.name = 'Variable name is required';
    }

    const quantityNum = parseFloat(quantity);
    if (quantity === '' || isNaN(quantityNum)) {
      newErrors.quantity = 'Valid quantity is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [variableName, quantity]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setVariableName('');
    setQuantity('');
    setUnit('');
    setCategory('');
    setErrors({});
  }, []);

  // Handle adding or updating variable
  const handleAddVariable = useCallback(() => {
    if (!validateForm()) return;

    const quantityNum = parseFloat(quantity);
    const normalizedName = variableName.trim().toLowerCase();

    // Check for duplicate names (excluding current edit)
    const duplicateIndex = variables.findIndex(
      (v, index) => v.name === normalizedName && index !== editingIndex
    );

    if (duplicateIndex !== -1) {
      setErrors({ name: 'Variable with this name already exists' });
      return;
    }

    const newVariable = new VariableImpl({
      name: normalizedName,
      quantity: quantityNum,
      unit: unit.trim() || undefined,
      category: category.trim() || undefined
    });

    // Add or update the variable
    if (editingIndex !== null) {
      const updatedVariables = [...variables];
      updatedVariables[editingIndex] = newVariable;
      onChange(updatedVariables);
      setEditingIndex(null);
    } else {
      onChange([...variables, newVariable]);
    }

    // Reset form
    resetForm();
  }, [
    validateForm,
    quantity,
    variableName,
    unit,
    category,
    variables,
    editingIndex,
    onChange,
    resetForm
  ]);

  // Handle editing existing variable
  const handleEditVariable = useCallback((index: number) => {
    const variable = variables[index];
    setVariableName(variable.name);
    setQuantity(variable.quantity.toString());
    setUnit(variable.unit || '');
    setCategory(variable.category || '');
    setEditingIndex(index);
    setErrors({});
  }, [variables]);

  // Handle deleting variable
  const handleDeleteVariable = useCallback((index: number) => {
    const updatedVariables = variables.filter((_, i) => i !== index);
    onChange(updatedVariables);

    if (editingIndex === index) {
      setEditingIndex(null);
      resetForm();
    }
  }, [variables, onChange, editingIndex, resetForm]);

  // Handle canceling edit
  const handleCancelEdit = useCallback(() => {
    setEditingIndex(null);
    resetForm();
  }, [resetForm]);

  // Handle keyboard shortcuts
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
        Define resource inputs/outputs using separate fields for quantity and name
      </Typography>

      {/* Input fields */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          label="Quantity"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={disabled}
          error={Boolean(errors.quantity)}
          helperText={errors.quantity}
          placeholder="e.g., -1 or 2.5"
          sx={{ minWidth: 120 }}
          slotProps={{
            htmlInput: {
              step: 0.1
            }
          }}
        />

        <TextField
          size="small"
          label="Variable Name"
          value={variableName}
          onChange={(e) => setVariableName(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={disabled}
          error={Boolean(errors.name)}
          helperText={errors.name}
          placeholder="e.g., eggs, flour"
          sx={{ minWidth: 150 }}
        />

        <Autocomplete
          size="small"
          options={allUnits}
          value={unit}
          onChange={(_, newValue) => setUnit(newValue || '')}
          onInputChange={(_, newInputValue) => setUnit(newInputValue)}
          freeSolo
          disabled={disabled}
          sx={{ minWidth: 120 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Unit"
              placeholder="e.g., cup, gram"
            />
          )}
        />

        <Autocomplete
          size="small"
          options={allCategories}
          value={category}
          onChange={(_, newValue) => setCategory(newValue || '')}
          onInputChange={(_, newInputValue) => setCategory(newInputValue)}
          freeSolo
          disabled={disabled}
          sx={{ minWidth: 140 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Category"
              placeholder="e.g., ingredients"
            />
          )}
        />
      </Box>

      {/* Action button */}
      <Box sx={{ mb: 2 }}>
        {editingIndex !== null ? (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleAddVariable}
              disabled={!variableName.trim() || !quantity.trim()}
              startIcon={<Edit />}
            >
              Update Variable
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            size="small"
            onClick={handleAddVariable}
            disabled={!variableName.trim() || !quantity.trim()}
            startIcon={<Add />}
          >
            Add Variable
          </Button>
        )}
      </Box>

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
