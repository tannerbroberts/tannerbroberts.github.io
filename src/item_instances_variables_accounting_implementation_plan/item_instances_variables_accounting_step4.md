# Step 4: Variables System Implementation

## Step Overview
Implement the variables system allowing items to define resource inputs/outputs and display variable summaries in execution views. This step adds variable management UI, calculation display, and collapsible variable summaries in execution headers.

## Dependencies
- Step 1: Core Data Models and Types must be completed
- Step 2: Storage and Reducer Integration must be completed
- Step 3: Instance Tracking in Execution must be completed

## Detailed Requirements

### Variable Definition UI
- Add variable input fields to item creation/editing dialogs
- Support parsing variables from text input (e.g., "-1 egg", "+2 flour cup")
- Validate variable names and quantities
- Support positive and negative quantities

### Variable Summary Display
- Calculate and display variable summaries for parent items
- Show summaries in collapsible sections on execution view headers
- Group variables by type/category for clear presentation
- Update summaries when child items change

### Variable Management
- Add/edit/remove variables for individual items
- Bulk variable operations for efficiency
- Variable validation and conflict detection

## Code Changes Required

### 1. Create Variable Input Components

#### `src/components/variables/VariableInput.tsx`
```typescript
import React, { useState, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Chip,
  InputAdornment,
  Alert
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { Variable, VariableImpl, parseVariableFromString, formatVariableForDisplay } from '../../functions/utils/item/index';

interface VariableInputProps {
  variables: Variable[];
  onChange: (variables: Variable[]) => void;
  disabled?: boolean;
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
    } catch (err) {
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
        InputProps={{
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
        }}
        sx={{ mb: 2 }}
      />

      {/* Variables list */}
      {variables.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {variables.map((variable, index) => (
            <Chip
              key={index}
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
```

#### `src/components/variables/VariableSummaryDisplay.tsx`
```typescript
import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Collapse,
  IconButton,
  Chip,
  Divider,
  useTheme
} from '@mui/material';
import { ExpandMore, ExpandLess, Functions } from '@mui/icons-material';
import { VariableSummary, groupVariablesByCategory } from '../../functions/utils/item/index';

interface VariableSummaryDisplayProps {
  summary: VariableSummary;
  title?: string;
  defaultExpanded?: boolean;
  compact?: boolean;
}

export default function VariableSummaryDisplay({
  summary,
  title = "Variable Summary",
  defaultExpanded = false,
  compact = false
}: VariableSummaryDisplayProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const theme = useTheme();

  const { hasVariables, variableCount, groupedVariables } = useMemo(() => {
    const variables = Object.entries(summary).map(([name, data]) => ({
      name,
      ...data
    }));

    const hasVariables = variables.length > 0;
    const variableCount = variables.length;
    const groupedVariables = groupVariablesByCategory(variables);

    return { hasVariables, variableCount, groupedVariables };
  }, [summary]);

  const renderVariableChip = (name: string, data: { quantity: number; unit?: string; category?: string }) => {
    const sign = data.quantity >= 0 ? '+' : '';
    const unit = data.unit ? ` ${data.unit}` : '';
    const label = `${sign}${data.quantity}${unit} ${name}`;

    return (
      <Chip
        key={name}
        label={label}
        size={compact ? 'small' : 'medium'}
        variant="outlined"
        color={data.quantity >= 0 ? 'success' : 'error'}
        sx={{ m: 0.25 }}
      />
    );
  };

  if (!hasVariables) {
    return null;
  }

  return (
    <Box
      sx={{
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        backgroundColor: theme.palette.background.paper,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: compact ? 1 : 1.5,
          backgroundColor: theme.palette.action.hover,
          cursor: 'pointer'
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Functions color="action" fontSize={compact ? 'small' : 'medium'} />
          <Typography variant={compact ? 'body2' : 'subtitle2'} fontWeight="medium">
            {title}
          </Typography>
          <Chip
            label={variableCount}
            size="small"
            variant="outlined"
            color="info"
          />
        </Box>

        <IconButton size="small">
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {/* Content */}
      <Collapse in={expanded}>
        <Box sx={{ p: compact ? 1 : 1.5 }}>
          {Object.entries(groupedVariables).map(([category, variables], categoryIndex) => (
            <Box key={category}>
              {Object.keys(groupedVariables).length > 1 && (
                <>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      textTransform: 'uppercase', 
                      fontWeight: 'bold',
                      mb: 1,
                      display: 'block'
                    }}
                  >
                    {category}
                  </Typography>
                </>
              )}
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                {variables.map(variable => 
                  renderVariableChip(variable.name, variable)
                )}
              </Box>

              {categoryIndex < Object.keys(groupedVariables).length - 1 && (
                <Divider sx={{ my: 1 }} />
              )}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
```

### 2. Update Item Creation/Editing Dialogs

#### Update `src/components/CreateNewItemDialog.tsx`
```typescript
// Add imports
import VariableInput from './variables/VariableInput';
import { Variable } from '../functions/utils/item/index';

// Add state for variables
const [variables, setVariables] = useState<Variable[]>([]);

// Add variables section to dialog content
<DialogContent sx={{ padding: 3, minWidth: 500 }}>
  {/* ... existing form fields */}
  
  <Box sx={{ mt: 3 }}>
    <VariableInput
      variables={variables}
      onChange={setVariables}
    />
  </Box>
</DialogContent>

// Update item creation to include variables
const handleCreateItem = useCallback(() => {
  // ... existing item creation logic
  
  // Save variables if any
  if (variables.length > 0) {
    dispatch({
      type: 'SET_ITEM_VARIABLES',
      payload: { itemId: newItem.id, variables }
    });
  }
  
  // Reset form
  setVariables([]);
  
  // ... rest of creation logic
}, [/* add variables to dependencies */]);
```

### 3. Create Variable Management Dialog

#### `src/components/dialogs/VariableManagementDialog.tsx`
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { useAppState, useAppDispatch } from '../../reducerContexts/App';
import { useItemVariables } from '../../hooks/useItemVariables';
import { getItemById } from '../../functions/utils/item/utils';
import VariableInput from '../variables/VariableInput';
import VariableSummaryDisplay from '../variables/VariableSummaryDisplay';

interface VariableManagementDialogProps {
  open: boolean;
  onClose: () => void;
  itemId: string | null;
}

export default function VariableManagementDialog({
  open,
  onClose,
  itemId
}: VariableManagementDialogProps) {
  const { items } = useAppState();
  const { variables, variableSummary, setVariables } = useItemVariables(itemId || '');
  const [localVariables, setLocalVariables] = useState(variables);

  const item = useMemo(() => {
    return itemId ? getItemById(items, itemId) : null;
  }, [items, itemId]);

  // Sync local state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalVariables(variables);
    }
  }, [open, variables]);

  const handleSave = useCallback(() => {
    if (itemId) {
      setVariables(localVariables);
    }
    onClose();
  }, [itemId, localVariables, setVariables, onClose]);

  const handleCancel = useCallback(() => {
    setLocalVariables(variables); // Reset to original
    onClose();
  }, [variables, onClose]);

  if (!item) return null;

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        Manage Variables for "{item.name}"
      </DialogTitle>
      
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <VariableInput
            variables={localVariables}
            onChange={setLocalVariables}
          />
        </Box>

        {Object.keys(variableSummary).length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Summary (including children)
            </Typography>
            <VariableSummaryDisplay
              summary={variableSummary}
              title="Calculated Summary"
              defaultExpanded
              compact
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleCancel}>Cancel</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Variables
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

### 4. Update Execution Components with Variable Display

#### Update `src/components/execution/PrimarySubCalendarItemDisplay.tsx`
```typescript
// Add imports
import { useItemVariables } from '../../hooks/useItemVariables';
import VariableSummaryDisplay from '../variables/VariableSummaryDisplay';
import { Functions } from '@mui/icons-material';

// Add to component
export default function PrimarySubCalendarItemDisplay({
  item,
  currentTime,
  startTime,
  children,
  executionContext
}: PrimarySubCalendarItemDisplayProps) {
  const { variableSummary } = useItemVariables(item.id);
  const [showVariables, setShowVariables] = useState(false);
  
  // Check if item has variables to show
  const hasVariables = useMemo(() => {
    return Object.keys(variableSummary).length > 0;
  }, [variableSummary]);

  // ... existing code

  return (
    <Box sx={{ width: '100%' }}>
      {/* Enhanced Header Progress Bar */}
      <Box
        sx={{
          position: 'relative',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          backgroundColor: barColors.light,
          borderRadius: 1,
          overflow: 'hidden',
          mb: children ? 0 : 2,
          cursor: hasVariables ? 'pointer' : 'default'
        }}
        onClick={hasVariables ? () => setShowVariables(!showVariables) : undefined}
      >
        {/* Progress bar background */}
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: '100%',
            width: `${Math.min(progress, 100)}%`,
            backgroundColor: barColors.main,
            transition: 'width 0.3s ease'
          }}
        />

        {/* Content overlay */}
        <Box sx={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          px: 2
        }}>
          {/* Left: Schedule icon, item name, and variables indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, flex: 1 }}>
            <Schedule sx={{ color: 'text.primary', fontSize: '1.5rem', flexShrink: 0 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '250px'
              }}
            >
              {item.name}
            </Typography>
            
            {/* Variables indicator */}
            {hasVariables && (
              <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                <Functions 
                  sx={{ 
                    color: 'text.secondary', 
                    fontSize: '1rem',
                    transform: showVariables ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s ease'
                  }} 
                />
                <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                  {Object.keys(variableSummary).length}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Center: Progress percentage */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              mx: 2
            }}
          >
            {progress.toFixed(1)}%
          </Typography>

          {/* Right: Time remaining */}
          <Typography
            variant="body1"
            sx={{
              fontWeight: 'medium',
              minWidth: 'fit-content',
              color: remainingTime <= 0 ? 'success.main' : 'text.primary'
            }}
          >
            {remainingTime <= 0 ? 'Complete' : formatDuration(remainingTime)}
          </Typography>
        </Box>
      </Box>

      {/* Variable Summary Display */}
      {hasVariables && (
        <Box sx={{ mb: 2 }}>
          <VariableSummaryDisplay
            summary={variableSummary}
            title="Resource Summary"
            defaultExpanded={showVariables}
            compact
          />
        </Box>
      )}

      {/* ... rest of existing component */}
    </Box>
  );
}
```

#### Update `src/components/execution/PrimaryCheckListItemDisplay.tsx`
```typescript
// Add similar variable display functionality
// Add imports and variable summary display in header section
// Include click handler to toggle variable summary visibility
```

### 5. Add Variable Management to Sidebar

#### Update `src/components/SideBar.tsx`
```typescript
// Add variable management button and dialog state
const [variableDialogOpen, setVariableDialogOpen] = useState(false);

// Add button to open variable management
<Button
  variant="outlined"
  fullWidth
  onClick={() => setVariableDialogOpen(true)}
  disabled={!focusedItemId}
  startIcon={<Functions />}
  sx={{ mb: 1 }}
>
  Manage Variables
</Button>

// Add dialog component
<VariableManagementDialog
  open={variableDialogOpen}
  onClose={() => setVariableDialogOpen(false)}
  itemId={focusedItemId}
/>
```

### 6. Create Variable Export/Import Utilities

#### `src/components/variables/VariableExportImport.tsx`
```typescript
import React, { useCallback } from 'react';
import { Button, Box, TextField, Typography } from '@mui/material';
import { Download, Upload } from '@mui/icons-material';
import { Variable, VariableImpl, formatVariableForDisplay, parseVariableFromString } from '../../functions/utils/item/index';

interface VariableExportImportProps {
  variables: Variable[];
  onImport: (variables: Variable[]) => void;
}

export default function VariableExportImport({
  variables,
  onImport
}: VariableExportImportProps) {
  const [importText, setImportText] = React.useState('');

  const handleExport = useCallback(() => {
    const exportData = variables.map(formatVariableForDisplay).join('\n');
    
    // Create downloadable file
    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'variables.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [variables]);

  const handleImport = useCallback(() => {
    const lines = importText.split('\n').filter(line => line.trim());
    const importedVariables: Variable[] = [];
    const errors: string[] = [];

    for (const line of lines) {
      try {
        const variable = parseVariableFromString(line.trim());
        if (variable) {
          importedVariables.push(variable);
        } else {
          errors.push(`Invalid format: ${line}`);
        }
      } catch (error) {
        errors.push(`Error parsing: ${line}`);
      }
    }

    if (errors.length > 0) {
      alert(`Import completed with errors:\n${errors.join('\n')}`);
    }

    if (importedVariables.length > 0) {
      onImport(importedVariables);
      setImportText('');
    }
  }, [importText, onImport]);

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
        >
          Export
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
      >
        Import
      </Button>
    </Box>
  );
}
```

## Testing Requirements

### Unit Tests for Variable Components (`src/components/variables/__tests__/`)
- Test VariableInput parsing and validation
- Test VariableSummaryDisplay rendering and grouping
- Test variable management dialog functionality
- Test export/import utilities

### Integration Tests for Variable System (`src/__tests__/variables.integration.test.tsx`)
- Test variable summary calculation with complex hierarchies
- Test variable display in execution components
- Test variable persistence and loading
- Test performance with large variable sets

### Visual Tests for Variable UI (`src/components/variables/__tests__/visual.test.tsx`)
- Test variable chip colors and formatting
- Test summary expansion/collapse behavior
- Test responsive layout for variable displays

## Acceptance Criteria

- [x] Items can define variables with positive/negative quantities
- [x] Variable input supports text parsing (e.g., "-1 egg", "+2 flour cup")
- [x] Variable summaries correctly aggregate child variables recursively
- [x] Variable summaries display in collapsible headers on execution components
- [x] Variable management dialog allows editing item variables
- [x] Variable calculations cache for performance
- [x] Variables support units and categories for organization
- [x] Export/import functionality works for variable sharing
- [x] Variable display updates in real-time as items change

## Rollback Plan

If issues are discovered:
1. Remove variable input components from item dialogs
2. Hide variable summary displays in execution components
3. Disable variable management features in sidebar
4. Remove variable-related UI components
5. Variable data remains in storage but is not displayed
6. Existing functionality continues to work without variable features

## Next Steps

After completion of this step:
- Step 5 will create the accounting view that uses variable information
- Step 6 will add final polish and performance optimizations
- Variable system is now fully functional and integrated with execution
