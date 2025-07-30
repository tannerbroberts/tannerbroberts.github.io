import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { VariableDefinition } from '../../functions/utils/item/types/VariableTypes';

interface VariableCategoryAutocompleteProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly variableDefinitions: VariableDefinition[];
}

// Common categories for suggestions
const COMMON_CATEGORIES = [
  'ingredients',
  'tools',
  'nutrients',
  'supplies',
  'materials',
  'equipment',
  'resources',
  'consumables',
  'components',
  'outputs'
];

export default function VariableCategoryAutocomplete({
  value,
  onChange,
  disabled = false,
  variableDefinitions
}: VariableCategoryAutocompleteProps) {
  // Get unique categories from existing variable definitions
  const existingCategories = React.useMemo(() => {
    const categories = new Set<string>();
    variableDefinitions.forEach(def => {
      if (def.category) {
        categories.add(def.category);
      }
    });
    return Array.from(categories).sort((a, b) => a.localeCompare(b));
  }, [variableDefinitions]);

  // Combine existing categories with common categories, removing duplicates
  const allCategories = React.useMemo(() => {
    const combinedCategories = new Set([...existingCategories, ...COMMON_CATEGORIES]);
    return Array.from(combinedCategories).sort((a, b) => a.localeCompare(b));
  }, [existingCategories]);

  return (
    <Autocomplete
      size="small"
      options={allCategories}
      value={value}
      onChange={(_, newValue) => onChange(newValue || '')}
      onInputChange={(_, newInputValue) => onChange(newInputValue)}
      freeSolo
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Category"
          placeholder="e.g., ingredients"
        />
      )}
      renderOption={(props, option) => (
        <li {...props} key={option}>
          {option}
        </li>
      )}
    />
  );
}
