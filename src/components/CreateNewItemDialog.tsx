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
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from "@mui/material";
import { useCallback, useState, useEffect } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts";
import { TimeInputProvider, useTimeInputDispatch, useTimeInputState } from "../reducerContexts/TimeInput";
import { NewItemProvider, useNewItemDispatch, useNewItemState } from "../reducerContexts/NewItem";
import { BasicItem, SubCalendarItem, CheckListItem } from "../functions/utils/item/index";
import type { ConditionStep, ActionExpr } from "../functions/utils/item/types/Scheduling";
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
  // Scheduling rules (Condition/Operation builder)
  type ConditionKind = 'none' | 'parentHasChild' | 'parentHasChecklist' | 'parentHasChildNameIncludes'
  type OperationKind = 'none' | 'createItem' | 'addExistingToChecklist'
  type UIRule = {
    id: string
    conditionKind: ConditionKind
    conditionItemId?: string
    conditionText?: string
    operationKind: OperationKind
    // createItem fields
    createName?: string
    createDuration?: number
    createAddToChecklist?: boolean
    // addExistingToChecklist fields
    existingItemId?: string
    targetChecklistId?: string // empty string => firstMatch
  }
  const [rules, setRules] = useState<UIRule[]>([])
  const [tmpRule, setTmpRule] = useState<UIRule>({ id: crypto.randomUUID(), conditionKind: 'none', operationKind: 'none', createDuration: 120000, createAddToChecklist: true, targetChecklistId: 'firstMatch' })
  const addRule = useCallback(() => {
    setRules(r => [...r, { ...tmpRule, id: crypto.randomUUID() }])
    setTmpRule({ id: crypto.randomUUID(), conditionKind: 'none', operationKind: 'none', createDuration: 120000, createAddToChecklist: true, targetChecklistId: 'firstMatch' })
  }, [tmpRule])
  const removeRule = useCallback((id: string) => setRules(rs => rs.filter(r => r.id !== id)), [])

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
    setTmpRule({ id: crypto.randomUUID(), conditionKind: 'none', operationKind: 'none', createDuration: 120000, createAddToChecklist: true, targetChecklistId: 'firstMatch' });
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

  const { items } = useAppState()

  const buildScheduling = useCallback(() => {
    if (rules.length === 0) return undefined
    return {
      rules: rules.map((r): { when: { start: 'parent'; chain?: ConditionStep[]; assert?: { kind: 'exists'; value: boolean }[] }; then: ActionExpr[] } => {
        // Build condition
        const chain: ConditionStep[] = []
        let assert: Array<{ kind: 'exists'; value: boolean }> | undefined

        switch (r.conditionKind) {
          case 'parentHasChild':
            chain.push({ op: 'findChildren' }, { op: 'filter', match: r.conditionItemId ? { idEquals: r.conditionItemId } : undefined })
            assert = [{ kind: 'exists', value: true }]
            break
          case 'parentHasChecklist':
            chain.push({ op: 'findChildren' }, { op: 'filter', match: r.conditionItemId ? { idEquals: r.conditionItemId } : { typeIs: 'CheckListItem' } })
            assert = [{ kind: 'exists', value: true }]
            break
          case 'parentHasChildNameIncludes':
            chain.push({ op: 'findChildren' }, { op: 'filter', match: r.conditionText ? { nameIncludes: r.conditionText } : undefined })
            assert = [{ kind: 'exists', value: true }]
            break
          case 'none':
          default:
          // No assert => always true (scope is [parent])
        }

        // Build operations
        const then: ActionExpr[] = []
        if (r.operationKind === 'createItem' && r.createName && (r.createDuration ?? 0) > 0) {
          then.push({ type: 'createItem', name: r.createName, duration: r.createDuration as number })
          if (r.createAddToChecklist) {
            then.push({ type: 'addToChecklist', target: 'firstMatch', source: 'lastCreatedItem' })
          }
        } else if (r.operationKind === 'addExistingToChecklist' && r.existingItemId) {
          const target = r.targetChecklistId ? { checklistId: r.targetChecklistId } as const : 'firstMatch'
          then.push({ type: 'addExistingToChecklist', sourceItemId: r.existingItemId, target })
        }

        return { when: { start: 'parent', chain, assert }, then }
      })
    }
  }, [rules])

  const renderRuleSummary = (r: UIRule, itemsList: { id: string; name: string }[]) => {
    const nameById = (id?: string) => itemsList.find(i => i.id === id)?.name
    let cond = 'No condition'
    if (r.conditionKind === 'parentHasChild' && r.conditionItemId) {
      cond = `If parent has child "${nameById(r.conditionItemId) || 'item'}"`
    } else if (r.conditionKind === 'parentHasChecklist') {
      cond = r.conditionItemId ? `If parent has checklist "${nameById(r.conditionItemId) || 'checklist'}"` : 'If parent has a checklist'
    } else if (r.conditionKind === 'parentHasChildNameIncludes' && r.conditionText) {
      cond = `If parent has child name includes "${r.conditionText}"`
    }
    let op = 'No operation'
    if (r.operationKind === 'createItem' && r.createName) {
      op = `Create "${r.createName}" (${r.createDuration ?? 0}ms)`
      if (r.createAddToChecklist) op += ' and add to first matching checklist'
    } else if (r.operationKind === 'addExistingToChecklist' && r.existingItemId) {
      const src = nameById(r.existingItemId) || 'existing item'
      const tgt = nameById(r.targetChecklistId) || 'first matching checklist'
      op = `Add "${src}" to ${tgt}`
    }
    return `${cond} → ${op}`
  }

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
              Scheduling Rules
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Add a Condition and/or an Operation. If only Condition is set, it becomes a required precondition. If only Operation is set, it runs every time.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, alignItems: 'start', mb: 2 }}>
              {/* Condition */}
              <Box>
                <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                  <InputLabel id="condition-kind-label">Condition</InputLabel>
                  <Select labelId="condition-kind-label" label="Condition" value={tmpRule.conditionKind} onChange={(e) => setTmpRule(v => ({ ...v, conditionKind: e.target.value as ConditionKind }))}>
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="parentHasChild">Parent has child…</MenuItem>
                    <MenuItem value="parentHasChecklist">Parent has checklist…</MenuItem>
                    <MenuItem value="parentHasChildNameIncludes">Parent has child name includes…</MenuItem>
                  </Select>
                </FormControl>
                {tmpRule.conditionKind === 'parentHasChild' && (
                  <FormControl fullWidth size="small">
                    <InputLabel id="condition-item-label">Select item</InputLabel>
                    <Select labelId="condition-item-label" label="Select item" value={tmpRule.conditionItemId || ''} onChange={(e) => setTmpRule(v => ({ ...v, conditionItemId: String(e.target.value) }))}>
                      {items.map(i => (
                        <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {tmpRule.conditionKind === 'parentHasChecklist' && (
                  <FormControl fullWidth size="small">
                    <InputLabel id="condition-checklist-label">Select checklist (optional)</InputLabel>
                    <Select labelId="condition-checklist-label" label="Select checklist (optional)" value={tmpRule.conditionItemId || ''} onChange={(e) => setTmpRule(v => ({ ...v, conditionItemId: String(e.target.value) }))}>
                      <MenuItem value="">Any checklist</MenuItem>
                      {items.filter(i => i.constructor.name === 'CheckListItem').map(i => (
                        <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {tmpRule.conditionKind === 'parentHasChildNameIncludes' && (
                  <TextField fullWidth size="small" label="Name includes" value={tmpRule.conditionText || ''} onChange={(e) => setTmpRule(v => ({ ...v, conditionText: e.target.value }))} />
                )}
              </Box>

              {/* Operation */}
              <Box>
                <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                  <InputLabel id="operation-kind-label">Operation</InputLabel>
                  <Select labelId="operation-kind-label" label="Operation" value={tmpRule.operationKind} onChange={(e) => setTmpRule(v => ({ ...v, operationKind: e.target.value as OperationKind }))}>
                    <MenuItem value="none">None</MenuItem>
                    <MenuItem value="createItem">Create item…</MenuItem>
                    <MenuItem value="addExistingToChecklist">Add existing item to checklist…</MenuItem>
                  </Select>
                </FormControl>

                {tmpRule.operationKind === 'createItem' && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: 1, alignItems: 'end' }}>
                    <TextField size="small" label="Name" value={tmpRule.createName || ''} onChange={(e) => setTmpRule(v => ({ ...v, createName: e.target.value }))} />
                    <TextField size="small" label="Duration (ms)" type="number" value={tmpRule.createDuration ?? 0} onChange={(e) => setTmpRule(v => ({ ...v, createDuration: parseInt(e.target.value) || 0 }))} />
                    <Box sx={{ gridColumn: '1 / span 2', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <input id="create-add-to-checklist" type="checkbox" checked={!!tmpRule.createAddToChecklist} onChange={(e) => setTmpRule(v => ({ ...v, createAddToChecklist: e.target.checked }))} />
                      <label htmlFor="create-add-to-checklist">Add to first matching checklist</label>
                    </Box>
                  </Box>
                )}

                {tmpRule.operationKind === 'addExistingToChecklist' && (
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="existing-item-label">Existing item</InputLabel>
                      <Select labelId="existing-item-label" label="Existing item" value={tmpRule.existingItemId || ''} onChange={(e) => setTmpRule(v => ({ ...v, existingItemId: String(e.target.value) }))}>
                        {items.map(i => (
                          <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel id="target-checklist-label">Target checklist</InputLabel>
                      <Select labelId="target-checklist-label" label="Target checklist" value={tmpRule.targetChecklistId || ''} onChange={(e) => setTmpRule(v => ({ ...v, targetChecklistId: String(e.target.value) }))}>
                        <MenuItem value="">First matching in Condition scope</MenuItem>
                        {items.filter(i => i.constructor.name === 'CheckListItem').map(i => (
                          <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </Box>
            </Box>

            <Button variant="outlined" size="small" onClick={addRule}>Add Rule</Button>
            {rules.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                {rules.map((r) => (
                  <Box key={r.id} sx={{ p: 1, border: '1px solid', borderColor: 'grey.300', borderRadius: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2">
                      {renderRuleSummary(r, items)}
                    </Typography>
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
