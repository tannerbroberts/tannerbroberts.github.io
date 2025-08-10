import { TextField, Box, Divider } from '@mui/material';
import { useCallback } from 'react';
import PantryFilter from './PantryFilter';

interface ItemListFilterProps {
  readonly value: string;
  readonly setValue: (value: string) => void;
  readonly onFilteredItemsChange: (filteredIds: string[] | null) => void;
}

export default function ItemListFilter({ value, setValue, onFilteredItemsChange }: ItemListFilterProps) {
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    // Clear variable filtering when user types in name filter
    onFilteredItemsChange(null);
  }, [setValue, onFilteredItemsChange]);

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        label="Filter Items"
        variant="outlined"
        fullWidth
        size="small"
        value={value}
        onChange={handleChange}
        placeholder="Type to filter items..."
      />
      <Divider sx={{ my: 2 }} />
      <PantryFilter onFiltered={onFilteredItemsChange} />
    </Box>
  );
}
