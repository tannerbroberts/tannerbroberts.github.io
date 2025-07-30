import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Tabs,
  Tab,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip
} from '@mui/material';
import { Edit, Description, Search } from '@mui/icons-material';
import { useAppState } from '../../reducerContexts/App';
import { useItemVariables } from '../../hooks/useItemVariables';
import { useVariableDescriptions } from '../../hooks/useVariableDescriptions';
import { getItemById } from '../../functions/utils/item/utils';
import VariableInput from '../variables/VariableInput';
import VariableSummaryDisplay from '../variables/VariableSummaryDisplay';
import VariableExportImport from '../variables/VariableExportImport';
import EditDescriptionDialog from './EditDescriptionDialog';
import DescriptionDisplay from '../variables/DescriptionDisplay';
import { Variable } from '../../functions/utils/variable/types';

interface VariableManagementDialogProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly itemId: string | null;
}

export default function VariableManagementDialog({
  open,
  onClose,
  itemId
}: VariableManagementDialogProps) {
  const { items, variableDefinitions } = useAppState();
  const { variables, variableSummary, setVariables } = useItemVariables(itemId || '');
  const { getDescription, setDescription, searchDescriptions } = useVariableDescriptions();
  const [localVariables, setLocalVariables] = useState(variables);
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingDescription, setEditingDescription] = useState<{
    definitionId: string;
    variableName: string;
  } | null>(null);

  const item = useMemo(() => {
    return itemId ? getItemById(items, itemId) : null;
  }, [items, itemId]);

  // Get unique variable names from current variables
  const uniqueVariableNames = useMemo(() => {
    const names = new Set(localVariables.map(v => v.name));
    return Array.from(names);
  }, [localVariables]);

  // Get variable definitions for current variables
  const currentVariableDefinitions = useMemo(() => {
    const definitions: Array<{ id: string; name: string; hasDescription: boolean }> = [];

    for (const [defId, definition] of variableDefinitions) {
      if (uniqueVariableNames.includes(definition.name)) {
        definitions.push({
          id: defId,
          name: definition.name,
          hasDescription: Boolean(getDescription(defId))
        });
      }
    }

    return definitions.sort((a, b) => a.name.localeCompare(b.name));
  }, [variableDefinitions, uniqueVariableNames, getDescription]);

  // Search results for descriptions
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return searchDescriptions(searchTerm);
  }, [searchTerm, searchDescriptions]);

  // Sync local state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalVariables(variables);
      setActiveTab(0);
      setSearchTerm('');
      setEditingDescription(null);
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

  const handleImportVariables = useCallback((importedVariables: Variable[]) => {
    // Merge imported variables with existing ones
    const mergedVariables = [...localVariables];

    for (const importedVar of importedVariables) {
      const existingIndex = mergedVariables.findIndex(v =>
        v.name.toLowerCase() === importedVar.name.toLowerCase()
      );

      if (existingIndex >= 0) {
        // Combine quantities for duplicate names
        const existing = mergedVariables[existingIndex];
        mergedVariables[existingIndex] = {
          ...existing,
          quantity: existing.quantity + importedVar.quantity,
          unit: existing.unit || importedVar.unit,
          category: existing.category || importedVar.category
        };
      } else {
        mergedVariables.push(importedVar);
      }
    }

    setLocalVariables(mergedVariables);
  }, [localVariables]);

  const handleEditDescription = useCallback((definitionId: string, variableName: string) => {
    setEditingDescription({ definitionId, variableName });
  }, []);

  const handleSaveDescription = useCallback((description: string) => {
    if (editingDescription) {
      setDescription(editingDescription.definitionId, description);
      setEditingDescription(null);
    }
  }, [editingDescription, setDescription]);

  const handleCloseDescriptionDialog = useCallback(() => {
    setEditingDescription(null);
  }, []);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  }, []);

  const handleVariableClick = useCallback((variableName: string) => {
    // Find the definition ID for this variable name
    for (const [defId, definition] of variableDefinitions) {
      if (definition.name === variableName) {
        handleEditDescription(defId, variableName);
        break;
      }
    }
  }, [variableDefinitions, handleEditDescription]);

  if (!item) return null;

  return (
    <>
      <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
        <DialogTitle>
          Manage Variables for "{item.name}"
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Variables" />
            <Tab label="Descriptions" />
            <Tab label="Search" />
          </Tabs>

          {activeTab === 0 && (
            <>
              <Box sx={{ mb: 3 }}>
                <VariableInput
                  variables={localVariables}
                  onChange={setLocalVariables}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <VariableExportImport
                  variables={localVariables}
                  onImport={handleImportVariables}
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
            </>
          )}

          {activeTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Variable Descriptions
              </Typography>

              {currentVariableDefinitions.length === 0 ? (
                <Typography color="text.secondary">
                  No variables to describe. Add some variables first.
                </Typography>
              ) : (
                <List>
                  {currentVariableDefinitions.map((varDef) => {
                    const description = getDescription(varDef.id);
                    return (
                      <ListItem key={varDef.id} divider>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle1">
                                {varDef.name}
                              </Typography>
                              {varDef.hasDescription && (
                                <Chip size="small" label="Has Description" color="success" />
                              )}
                            </Box>
                          }
                          secondary={
                            description ? (
                              <DescriptionDisplay
                                description={description.content}
                                compact
                                maxLines={2}
                                onVariableClick={handleVariableClick}
                              />
                            ) : (
                              <Typography color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                No description yet. Click edit to add one.
                              </Typography>
                            )
                          }
                        />
                        <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                          <IconButton
                            onClick={() => handleEditDescription(varDef.id, varDef.name)}
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          )}

          {activeTab === 2 && (
            <Box>
              <TextField
                fullWidth
                label="Search variable descriptions"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter search term..."
                sx={{ mb: 2 }}
                slotProps={{
                  input: {
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }
                }}
              />

              {searchResults.length === 0 ? (
                <Typography color="text.secondary">
                  {searchTerm.trim() ? 'No matching descriptions found.' : 'Enter a search term to find variable descriptions.'}
                </Typography>
              ) : (
                <List>
                  {searchResults.map((result) => (
                    <ListItem key={result.definitionId} divider>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {result.variableName}
                            </Typography>
                            <Chip size="small" label="Match" color="primary" />
                          </Box>
                        }
                        secondary={
                          <DescriptionDisplay
                            description={result.description.content}
                            searchTerm={searchTerm}
                            compact
                            maxLines={3}
                            onVariableClick={handleVariableClick}
                          />
                        }
                      />
                      <Box sx={{ ml: 'auto' }}>
                        <IconButton
                          onClick={() => handleEditDescription(result.definitionId, result.variableName)}
                          size="small"
                        >
                          <Description />
                        </IconButton>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
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

      {/* Description Edit Dialog */}
      {editingDescription && (
        <EditDescriptionDialog
          open={Boolean(editingDescription)}
          onClose={handleCloseDescriptionDialog}
          onSave={handleSaveDescription}
          initialDescription={getDescription(editingDescription.definitionId)?.content || ''}
          variableName={editingDescription.variableName}
        />
      )}
    </>
  );
}
