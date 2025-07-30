import { useState, useEffect } from 'react';
import {
  Box,
  Input,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Collapse
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import VariableFilter from './filters/VariableFilter';
import { useVariableFiltering } from '../hooks/useVariableFiltering';

interface ItemListFilterProps {
  readonly value: string;
  readonly setValue: (value: string) => void;
  readonly onFilteredItemsChange?: (itemIds: string[]) => void;
}

export default function ItemListFilter({ value, setValue, onFilteredItemsChange }: ItemListFilterProps) {
  const [filterMode, setFilterMode] = useState<'name' | 'variable'>('name');

  const {
    filterState,
    availableVariableNames,
    lastPerformance,
    filteredResults,
    enableFiltering,
    addVariableFilter,
    removeVariableFilter,
    clearAllFilters,
    setCombineMode,
    isFiltering
  } = useVariableFiltering();

  // Notify parent of filtered items when results change
  useEffect(() => {
    if (onFilteredItemsChange) {
      onFilteredItemsChange(filteredResults.map(result => result.itemId));
    }
  }, [filteredResults, onFilteredItemsChange]);

  return (
    <Box sx={{ margin: '10px', width: '90%' }}>
      {/* Filter Mode Toggle */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="caption" sx={{ mr: 1 }}>
          Filter by:
        </Typography>
        <ToggleButtonGroup
          value={filterMode}
          exclusive
          onChange={(_, newMode) => newMode && setFilterMode(newMode)}
          size="small"
        >
          <ToggleButton value="name">
            <SearchIcon fontSize="small" sx={{ mr: 0.5 }} />
            Name
          </ToggleButton>
          <ToggleButton value="variable">
            <FilterIcon fontSize="small" sx={{ mr: 0.5 }} />
            Variables
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Name Filter */}
      <Collapse in={filterMode === 'name'}>
        <Input
          placeholder="Filter items by name"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          sx={{
            width: '100%',
            backgroundColor: 'white',
            borderRadius: '5px',
            padding: '5px'
          }}
          inputProps={{
            'aria-label': 'Filter items by name',
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              event.stopPropagation()
            }
          }}
        />
      </Collapse>

      {/* Variable Filter */}
      <Collapse in={filterMode === 'variable'}>
        <VariableFilter
          availableVariables={availableVariableNames}
          activeFilters={filterState.activeFilters.variableFilters}
          onAddFilter={addVariableFilter}
          onRemoveFilter={removeVariableFilter}
          onClearAll={clearAllFilters}
          combineMode={filterState.activeFilters.combineMode}
          onCombineModeChange={setCombineMode}
          isEnabled={isFiltering}
          onEnabledChange={enableFiltering}
          performanceMetrics={lastPerformance}
        />
      </Collapse>
    </Box>
  );
}