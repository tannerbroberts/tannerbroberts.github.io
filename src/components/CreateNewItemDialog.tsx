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
import { useAppDispatch, useAppState } from "../reducerContexts/App";
import { TimeInputProvider, useTimeInputDispatch, useTimeInputState } from "../reducerContexts/TimeInput";
import { NewItemProvider, useNewItemDispatch, useNewItemState } from "../reducerContexts/NewItem";
import { BasicItem, Variable } from "../functions/utils/item/index";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { formatDuration } from "../functions/utils/formatTime";
import VariableInput from "./variables/VariableInput";

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

  // Add variables state
  const [variables, setVariables] = useState<Variable[]>([]);

  const setName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    newItemDispatch({ type: "SET_NAME", payload: { name: event.target.value } });
  }, [newItemDispatch]);

  const handleClose = useCallback(() => {
    dispatch({ type: "SET_NEW_ITEM_DIALOG_OPEN", payload: { newItemDialogOpen: false } });
    // Reset form on close
    newItemDispatch({ type: "SET_NAME", payload: { name: "" } });
    timeInputDispatch({ type: "RESET" });
    setVariables([]);
  }, [dispatch, newItemDispatch, timeInputDispatch]);

  const createNewItem = useCallback(() => {
    if (name.trim() === "") {
      alert("Please enter a name for the new item");
      return;
    }
    if (total === 0) {
      alert("Please enter a duration for the new item");
      return;
    }
    const newItem = new BasicItem({ name: name.trim(), duration: total });
    dispatch({ type: "CREATE_ITEM", payload: { newItem } });

    // Save variables if any
    if (variables.length > 0) {
      dispatch({
        type: 'SET_ITEM_VARIABLES',
        payload: { itemId: newItem.id, variables }
      });
    }

    handleClose();
  }, [dispatch, name, total, variables, handleClose]);

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
            <VariableInput
              variables={variables}
              onChange={setVariables}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={createNewItem}
          variant="contained"
          disabled={!name.trim() || total === 0}
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
