import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Box,
  Typography,
  Divider,
  Stack,
  Chip
} from "@mui/material";
import { useCallback, useState, useEffect } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts";
import { TimeInputProvider, useTimeInputDispatch, useTimeInputState } from "../reducerContexts/TimeInput";
import { NewItemProvider, useNewItemDispatch, useNewItemState } from "../reducerContexts/NewItem";
import { BasicItem, SubCalendarItem, CheckListItem } from "../functions/utils/item/index";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import PlaylistPlayIcon from '@mui/icons-material/PlaylistPlay';
import ChecklistIcon from '@mui/icons-material/Checklist';
import TaskIcon from '@mui/icons-material/Task';
import { formatDuration } from "../functions/utils/formatTime";

// Default time presets - now using milliseconds values, labels will be generated dynamically
const DEFAULT_TIME_PRESETS = [
  { label: "5 mins", milliseconds: 5 * 60 * 1000 },
  { label: "10 mins", milliseconds: 10 * 60 * 1000 },
  { label: "15 mins", milliseconds: 15 * 60 * 1000 },
  { label: "30 mins", milliseconds: 30 * 60 * 1000 },
  { label: "1 hour", milliseconds: 60 * 60 * 1000 },
  { label: "2 hours", milliseconds: 2 * 60 * 60 * 1000 },
  { label: "1 day", milliseconds: 24 * 60 * 60 * 1000 },
  { label: "1 week", milliseconds: 7 * 24 * 60 * 60 * 1000 },
];

type TimePreset = {
  label: string;
  milliseconds: number;
};

type ItemType = 'basic' | 'subcalendar' | 'checklist';

type ItemTypeOption = {
  type: ItemType;
  label: string;
  description: string;
  icon: React.ReactNode;
};

const ITEM_TYPE_OPTIONS: ItemTypeOption[] = [
  {
    type: 'basic',
    label: 'Basic Item',
    description: 'Simple task with priority',
    icon: <TaskIcon />
  },
  {
    type: 'subcalendar',
    label: 'SubCalendar',
    description: 'Task with scheduled children',
    icon: <PlaylistPlayIcon />
  },
  {
    type: 'checklist',
    label: 'CheckList',
    description: 'Task with checklist items',
    icon: <ChecklistIcon />
  }
];

// Local storage utilities
const STORAGE_KEY = 'about-time-presets';

function loadPresets(): TimePreset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn('Failed to load presets from localStorage:', error);
  }
  return DEFAULT_TIME_PRESETS;
}

function savePresets(presets: TimePreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch (error) {
    console.warn('Failed to save presets to localStorage:', error);
  }
}

function EditableTimePresets({ presets, setPresets }: Readonly<{ presets: TimePreset[], setPresets: (presets: TimePreset[]) => void }>) {
  const timeInputDispatch = useTimeInputDispatch();
  const { total } = useTimeInputState();
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);

  // Check if the current total matches any preset exactly
  const currentMatchingPresetIndex = presets.findIndex(preset => preset.milliseconds === total);

  // Update selected preset when total changes
  useEffect(() => {
    if (currentMatchingPresetIndex !== -1) {
      setSelectedPresetIndex(currentMatchingPresetIndex);
    } else {
      setSelectedPresetIndex(null);
    }
  }, [total, currentMatchingPresetIndex]);

  const applyPreset = useCallback((milliseconds: number, index: number) => {
    // Reset first
    timeInputDispatch({ type: "RESET" });

    // Set the selected preset index
    setSelectedPresetIndex(index);

    // Calculate the most appropriate unit representation
    const totalSeconds = Math.floor(milliseconds / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);
    const totalWeeks = Math.floor(totalDays / 7);

    if (totalWeeks > 0 && totalDays % 7 === 0) {
      timeInputDispatch({ type: "SET_WEEKS", payload: { weeks: totalWeeks } });
    } else if (totalDays > 0 && totalHours % 24 === 0) {
      timeInputDispatch({ type: "SET_DAYS", payload: { days: totalDays } });
    } else if (totalHours > 0 && totalMinutes % 60 === 0) {
      timeInputDispatch({ type: "SET_HOURS", payload: { hours: totalHours } });
    } else if (totalMinutes > 0 && totalSeconds % 60 === 0) {
      timeInputDispatch({ type: "SET_MINUTES", payload: { minutes: totalMinutes } });
    } else if (totalSeconds > 0 && milliseconds % 1000 === 0) {
      timeInputDispatch({ type: "SET_SECONDS", payload: { seconds: totalSeconds } });
    } else {
      timeInputDispatch({ type: "SET_MILLIS", payload: { millis: milliseconds } });
    }
  }, [timeInputDispatch]);

  const handleDeletePreset = useCallback((index: number) => {
    const newPresets = presets.filter((_, i) => i !== index);
    setPresets(newPresets);
    savePresets(newPresets);
  }, [presets, setPresets]);

  const toggleEditMode = useCallback(() => {
    setIsEditMode(!isEditMode);
  }, [isEditMode]);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Quick presets:
        </Typography>
        <Button
          size="small"
          onClick={toggleEditMode}
          startIcon={<EditIcon />}
          color="secondary"
        >
          {isEditMode ? 'Done' : 'Edit'}
        </Button>
      </Box>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {presets.map((preset, index) => (
          <Chip
            key={`${preset.label}-${index}`}
            label={formatDuration(preset.milliseconds)}
            variant={selectedPresetIndex === index ? "filled" : "outlined"}
            color={selectedPresetIndex === index ? "primary" : "default"}
            size="medium"
            onClick={isEditMode ? undefined : () => applyPreset(preset.milliseconds, index)}
            onDelete={isEditMode ? () => handleDeletePreset(index) : undefined}
            deleteIcon={<CloseIcon />}
            sx={{
              cursor: isEditMode ? 'default' : 'pointer',
              height: '48px', // Double the default height
              fontSize: '0.9rem',
              '& .MuiChip-deleteIcon': {
                color: 'error.main',
                '&:hover': {
                  color: 'error.dark'
                }
              }
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}

function ItemTypeSelector({ selectedType, setSelectedType }: Readonly<{ selectedType: ItemType | null, setSelectedType: (type: ItemType) => void }>) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TaskIcon sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="h6">Item Type</Typography>
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        Choose the type of item to create. This cannot be changed after creation.
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {ITEM_TYPE_OPTIONS.map((option) => (
          <Chip
            key={option.type}
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {option.icon}
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {option.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {option.description}
                  </Typography>
                </Box>
              </Box>
            }
            variant={selectedType === option.type ? "filled" : "outlined"}
            color={selectedType === option.type ? "primary" : "default"}
            size="medium"
            onClick={() => setSelectedType(option.type)}
            sx={{
              cursor: 'pointer',
              height: 'auto',
              minHeight: '56px',
              padding: '8px 12px',
              '& .MuiChip-label': {
                padding: 0,
                whiteSpace: 'normal',
                textAlign: 'left'
              },
              '&:hover': {
                backgroundColor: selectedType === option.type ? undefined : 'action.hover'
              }
            }}
          />
        ))}
      </Stack>

      {!selectedType && (
        <Typography variant="body2" color="error" sx={{ mt: 1, fontStyle: 'italic' }}>
          Please select an item type to continue
        </Typography>
      )}
    </Box>
  );
}

function ImprovedTimeInput() {
  const { total, millis, seconds, minutes, hours, days, weeks, years } = useTimeInputState();
  const timeInputDispatch = useTimeInputDispatch();
  const [presets, setPresets] = useState<TimePreset[]>(loadPresets);

  const formatDuration = useCallback((ms: number) => {
    if (ms === 0) return "0ms";

    const units = [
      { name: 'y', value: 365 * 24 * 60 * 60 * 1000 },
      { name: 'w', value: 7 * 24 * 60 * 60 * 1000 },
      { name: 'd', value: 24 * 60 * 60 * 1000 },
      { name: 'h', value: 60 * 60 * 1000 },
      { name: 'm', value: 60 * 1000 },
      { name: 's', value: 1000 },
      { name: 'ms', value: 1 },
    ];

    const parts = [];
    let remaining = ms;

    for (const unit of units) {
      if (remaining >= unit.value) {
        const count = Math.floor(remaining / unit.value);
        parts.push(`${count}${unit.name}`);
        remaining -= count * unit.value;
      }
    }

    return parts.join(' ');
  }, []);

  const addCurrentTimeAsPreset = useCallback(() => {
    if (total === 0) {
      alert("Please set a duration first");
      return;
    }

    // Check if this duration already exists
    const existingPreset = presets.find(preset => preset.milliseconds === total);
    if (existingPreset) {
      alert(`A preset with this duration already exists: ${formatDuration(total)}`);
      return;
    }

    // Create new preset with formatted duration as label
    const newPreset: TimePreset = {
      label: formatDuration(total),
      milliseconds: total
    };

    // Add to presets and sort by duration
    const newPresets = [...presets, newPreset].sort((a, b) => a.milliseconds - b.milliseconds);
    setPresets(newPresets);
    savePresets(newPresets);

    alert(`Added preset: ${formatDuration(total)}`);
  }, [total, presets, formatDuration]);

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AccessTimeIcon sx={{ mr: 1, color: 'text.secondary' }} />
        <Typography variant="h6">Duration</Typography>
      </Box>

      <EditableTimePresets presets={presets} setPresets={setPresets} />

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Or set individual units:
          </Typography>
          <Button
            size="small"
            onClick={addCurrentTimeAsPreset}
            startIcon={<AddIcon />}
            variant="outlined"
            disabled={total === 0}
          >
            Add to Presets
          </Button>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {[
            { label: 'Years', value: years, key: 'years' },
            { label: 'Weeks', value: weeks, key: 'weeks' },
            { label: 'Days', value: days, key: 'days' },
            { label: 'Hours', value: hours, key: 'hours' },
            { label: 'Minutes', value: minutes, key: 'minutes' },
            { label: 'Seconds', value: seconds, key: 'seconds' },
            { label: 'Milliseconds', value: millis, key: 'millis' },
          ].map(({ label, value, key }) => (
            <TextField
              key={key}
              label={label}
              type="number"
              value={value}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                switch (key) {
                  case 'years':
                    timeInputDispatch({ type: 'SET_YEARS', payload: { years: val } });
                    break;
                  case 'weeks':
                    timeInputDispatch({ type: 'SET_WEEKS', payload: { weeks: val } });
                    break;
                  case 'days':
                    timeInputDispatch({ type: 'SET_DAYS', payload: { days: val } });
                    break;
                  case 'hours':
                    timeInputDispatch({ type: 'SET_HOURS', payload: { hours: val } });
                    break;
                  case 'minutes':
                    timeInputDispatch({ type: 'SET_MINUTES', payload: { minutes: val } });
                    break;
                  case 'seconds':
                    timeInputDispatch({ type: 'SET_SECONDS', payload: { seconds: val } });
                    break;
                  case 'millis':
                    timeInputDispatch({ type: 'SET_MILLIS', payload: { millis: val } });
                    break;
                }
              }}
              size="small"
              sx={{ width: '100px' }}
              slotProps={{
                htmlInput: { min: 0 }
              }}
            />
          ))}
        </Stack>
      </Box>

      <Box sx={{
        p: 2,
        bgcolor: 'grey.50',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'grey.300'
      }}>
        <Typography variant="body2" color="text.secondary">
          Total duration: <strong>{formatDuration(total)}</strong>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ({total.toLocaleString()} milliseconds)
        </Typography>
      </Box>
    </Box>
  );
}

function CreateNewItemDialogContent() {
  const { newItemDialogOpen } = useAppState();
  const dispatch = useAppDispatch();

  const { total } = useTimeInputState();
  const timeInputDispatch = useTimeInputDispatch();

  const { name } = useNewItemState();
  const newItemDispatch = useNewItemDispatch();

  // Add item type state
  const [selectedItemType, setSelectedItemType] = useState<ItemType | null>(null);

  // Add variables state
  const [variables, setVariables] = useState<Record<string, number>>({});
  const [variableName, setVariableName] = useState('');
  const [variableQuantity, setVariableQuantity] = useState('');
  // Scheduling rules (minimal builder v1)
  type Rule = {
    id: string;
    whenNameIncludes: string;
    thenCreateName: string;
    thenCreateDuration: number;
    thenAddToChecklist: boolean;
  };
  const [rules, setRules] = useState<Rule[]>([]);
  const [tmpRule, setTmpRule] = useState<Rule>({ id: crypto.randomUUID(), whenNameIncludes: '', thenCreateName: '', thenCreateDuration: 120000, thenAddToChecklist: true });
  const addRule = useCallback(() => {
    setRules(r => [...r, { ...tmpRule, id: crypto.randomUUID() }])
    setTmpRule({ id: crypto.randomUUID(), whenNameIncludes: '', thenCreateName: '', thenCreateDuration: 120000, thenAddToChecklist: true })
  }, [tmpRule]);
  const removeRule = useCallback((id: string) => setRules(rs => rs.filter(r => r.id !== id)), []);

  const setName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    newItemDispatch({ type: "SET_NAME", payload: { name: event.target.value } });
  }, [newItemDispatch]);

  const handleClose = useCallback(() => {
    dispatch({ type: "SET_NEW_ITEM_DIALOG_OPEN", payload: { newItemDialogOpen: false } });
    // Reset form on close
    newItemDispatch({ type: "SET_NAME", payload: { name: "" } });
    timeInputDispatch({ type: "RESET" });
    setSelectedItemType(null);
    setVariables({});
    setVariableName('');
    setVariableQuantity('');
    setRules([]);
    setTmpRule({ id: crypto.randomUUID(), whenNameIncludes: '', thenCreateName: '', thenCreateDuration: 120000, thenAddToChecklist: true });
  }, [dispatch, newItemDispatch, timeInputDispatch]);

  const handleAddVariable = useCallback(() => {
    if (!variableName.trim() || !variableQuantity.trim()) return;

    const quantity = parseFloat(variableQuantity);
    if (isNaN(quantity)) return;

    setVariables(prev => ({
      ...prev,
      [variableName.trim()]: quantity
    }));

    setVariableName('');
    setVariableQuantity('');
  }, [variableName, variableQuantity]);

  const buildScheduling = useCallback(() => {
    if (rules.length === 0) return undefined
    return {
      rules: rules.map(r => ({
        when: {
          start: 'parent' as const,
          chain: [{ op: 'findChildren' as const }, { op: 'filter' as const, match: { nameIncludes: r.whenNameIncludes || undefined } }],
          assert: [{ kind: 'exists' as const, value: true }]
        },
        then: [
          ...(r.thenCreateName ? [{ type: 'createItem' as const, name: r.thenCreateName, duration: r.thenCreateDuration }] : []),
          ...(r.thenAddToChecklist ? [{ type: 'addToChecklist' as const, target: 'firstMatch' as const, source: 'lastCreatedItem' as const }] : [])
        ]
      }))
    }
  }, [rules]);

  const createNewItem = useCallback(() => {
    if (name.trim() === "") {
      alert("Please enter a name for the new item");
      return;
    }
    if (total === 0) {
      alert("Please enter a duration for the new item");
      return;
    }
    if (!selectedItemType) {
      alert("Please select an item type");
      return;
    }

    let newItem;
    switch (selectedItemType) {
      case 'basic':
        newItem = new BasicItem({
          name: name.trim(),
          duration: total,
          variables: variables,
          scheduling: buildScheduling()
        });
        break;
      case 'subcalendar':
        newItem = new SubCalendarItem({
          name: name.trim(),
          duration: total,
          variables: variables,
          scheduling: buildScheduling()
        });
        break;
      case 'checklist':
        newItem = new CheckListItem({
          name: name.trim(),
          duration: total,
          variables: variables,
          scheduling: buildScheduling()
        });
        break;
      default:
        alert("Invalid item type selected");
        return;
    }

    dispatch({ type: "CREATE_ITEM", payload: { newItem } });

    // Variables will be added via separate mechanism if needed

    handleClose();
  }, [dispatch, name, total, variables, selectedItemType, handleClose, buildScheduling]);

  return (
    <Dialog
      open={newItemDialogOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Create New Item</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          <ItemTypeSelector
            selectedType={selectedItemType}
            setSelectedType={setSelectedItemType}
          />

          <TextField
            fullWidth
            label="Item Name"
            placeholder="Enter a name for your item"
            value={name}
            onChange={setName}
            variant="outlined"
            size="small"
            sx={{ mb: 3 }}
            autoFocus
          />

          <ImprovedTimeInput />

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Variables
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Define resource inputs/outputs (optional)
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'flex-end' }}>
              <TextField
                size="small"
                label="Variable Name"
                placeholder="e.g., eggs, flour"
                value={variableName}
                onChange={(e) => setVariableName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddVariable()}
                sx={{ minWidth: 120 }}
              />
              <TextField
                size="small"
                label="Quantity"
                type="number"
                placeholder="e.g., 2, -1"
                value={variableQuantity}
                onChange={(e) => setVariableQuantity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddVariable()}
                sx={{ minWidth: 80 }}
              />
              <Button
                variant="outlined"
                size="small"
                onClick={handleAddVariable}
                disabled={!variableName.trim() || !variableQuantity.trim()}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>

            {/* Display existing variables */}
            {Object.keys(variables).length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {Object.entries(variables).map(([name, quantity]) => (
                  <Chip
                    key={name}
                    label={`${quantity >= 0 ? '+' : ''}${quantity} ${name}`}
                    color={quantity >= 0 ? 'success' : 'error'}
                    variant="outlined"
                    onDelete={() => {
                      setVariables(prev => {
                        const updated = { ...prev };
                        delete updated[name];
                        return updated;
                      });
                    }}
                  />
                ))}
              </Box>
            )}

            {Object.keys(variables).length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No variables defined
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Scheduling Rules (beta)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Build rules that run when this item is scheduled.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 1, alignItems: 'end', mb: 1 }}>
              <TextField size="small" label="When child of parent has name including" value={tmpRule.whenNameIncludes} onChange={(e) => setTmpRule(v => ({ ...v, whenNameIncludes: e.target.value }))} />
              <TextField size="small" label="Then create item named" value={tmpRule.thenCreateName} onChange={(e) => setTmpRule(v => ({ ...v, thenCreateName: e.target.value }))} />
              <TextField size="small" label="Duration (ms)" type="number" value={tmpRule.thenCreateDuration} onChange={(e) => setTmpRule(v => ({ ...v, thenCreateDuration: parseInt(e.target.value) || 0 }))} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input id="add-to-checklist" type="checkbox" checked={tmpRule.thenAddToChecklist} onChange={(e) => setTmpRule(v => ({ ...v, thenAddToChecklist: e.target.checked }))} />
                <label htmlFor="add-to-checklist">Add to checklist</label>
              </Box>
            </Box>
            <Button variant="outlined" size="small" onClick={addRule}>Add Rule</Button>
            {rules.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {rules.map((r) => (
                  <Box key={r.id} sx={{ p: 1, border: '1px solid', borderColor: 'grey.300', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">When child name includes "{r.whenNameIncludes}" then create "{r.thenCreateName}" ({r.thenCreateDuration}ms){r.thenAddToChecklist ? ' and add to checklist' : ''}</Typography>
                    <Button size="small" onClick={() => removeRule(r.id)}>Remove</Button>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={createNewItem}
          variant="contained"
          disabled={!name.trim() || total === 0 || !selectedItemType}
        >
          Create Item
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function CreateNewItemDialog() {
  return (
    <NewItemProvider>
      <TimeInputProvider>
        <CreateNewItemDialogContent />
      </TimeInputProvider>
    </NewItemProvider>
  );
}
