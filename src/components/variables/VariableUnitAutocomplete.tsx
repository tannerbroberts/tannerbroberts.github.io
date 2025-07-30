import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { VariableDefinition } from '../../functions/utils/item/types/VariableTypes';

interface VariableUnitAutocompleteProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly disabled?: boolean;
  readonly variableDefinitions: VariableDefinition[];
}

// Common units for suggestions
const COMMON_UNITS = [
  'cup', 'cups',
  'liter', 'liters', 'l',
  'gram', 'grams', 'g',
  'kg', 'kilogram', 'kilograms',
  'lb', 'pound', 'pounds',
  'oz', 'ounce', 'ounces',
  'tsp', 'teaspoon', 'teaspoons',
  'tbsp', 'tablespoon', 'tablespoons',
  'ml', 'milliliter', 'milliliters',
  'piece', 'pieces',
  'slice', 'slices',
  'clove', 'cloves',
  'bunch', 'bunches'
];

export default function VariableUnitAutocomplete({
  value,
  onChange,
  disabled = false,
  variableDefinitions
}: VariableUnitAutocompleteProps) {
  // Get unique units from existing variable definitions
  const existingUnits = React.useMemo(() => {
    const units = new Set<string>();
    variableDefinitions.forEach(def => {
      if (def.unit) {
        units.add(def.unit);
      }
    });
    return Array.from(units).sort((a, b) => a.localeCompare(b));
  }, [variableDefinitions]);

  // Combine existing units with common units, removing duplicates
  const allUnits = React.useMemo(() => {
    const combinedUnits = new Set([...existingUnits, ...COMMON_UNITS]);
    return Array.from(combinedUnits).sort((a, b) => a.localeCompare(b));
  }, [existingUnits]);

  return (
    <Autocomplete
      size="small"
      options={allUnits}
      value={value}
      onChange={(_, newValue) => onChange(newValue || '')}
      onInputChange={(_, newInputValue) => onChange(newInputValue)}
      freeSolo
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Unit"
          placeholder="e.g., cup, gram"
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
