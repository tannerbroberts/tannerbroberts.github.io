import { TextField, Box } from '@mui/material';
import { useCallback } from 'react';

interface ItemListFilterProps {
  readonly value: string;
  readonly setValue: (value: string) => void;
  readonly onFilteredItemsChange: (filteredIds: string[]) => void;
}

export default function ItemListFilter({ value, setValue, onFilteredItemsChange }: ItemListFilterProps) {
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setValue(newValue);
    // For now, just return empty array - this can be enhanced later
    onFilteredItemsChange([]);
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
    </Box>
  );
}
