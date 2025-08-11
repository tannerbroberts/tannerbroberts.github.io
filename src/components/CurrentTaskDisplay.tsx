import { Typography, Paper, LinearProgress, Box } from "@mui/material";
import { Item, SubCalendarItem, CheckListItem } from "../functions/utils/item/index";

interface CurrentTaskDisplayProps {
  task: Item;
  currentTime: number;
  taskChain: Item[];
  rootStartTime: number;
}

import { getTaskProgress } from "../functions/utils/item/utils";

export default function CurrentTaskDisplay({ task, currentTime, taskChain, rootStartTime }: Readonly<CurrentTaskDisplayProps>) {
  const formatDuration = (duration: number): string => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Compute absolute start time for the current task from the chain
  const computeAbsoluteStarts = (taskChain: Item[], rootStartTime: number): number[] => {
    const starts: number[] = [];
    let acc = rootStartTime;
    starts.push(acc);
    for (let i = 1; i < taskChain.length; i++) {
      const parent = taskChain[i - 1];
      const child = taskChain[i];
      if (parent instanceof SubCalendarItem) {
        const ref = parent.children.find((c) => c.id === child.id);
        acc = acc + (ref?.start ?? 0);
      } else if (parent instanceof CheckListItem) {
        // Checklist children share parent start (no change)
      }
      starts.push(acc);
    }
    return starts;
  };

  const starts = computeAbsoluteStarts(taskChain, rootStartTime);
  const idx = taskChain.findIndex(it => it.id === task.id);
  const startTime = starts[idx] ?? rootStartTime;

  const progress = getTaskProgress(task, currentTime, startTime);
  const remainingTime = Math.max(0, task.duration - (currentTime - startTime));

  return (
    <Paper
      style={{
        padding: '24px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginTop: '20px'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Typography variant="h4" style={{
          marginBottom: '8px',
          color: '#1976d2',
          fontWeight: 'bold'
        }}>
          {task.name}
        </Typography>

        <Typography variant="subtitle1" style={{
          color: '#666',
          marginBottom: '16px'
        }}>
          Current Time: {formatTime(currentTime)}
        </Typography>
      </div>

      <Box style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <Typography variant="body2" style={{ color: '#666' }}>
            Progress
          </Typography>
          <Typography variant="body2" style={{ color: '#666' }}>
            {progress.toFixed(1)}%
          </Typography>
        </div>

        <LinearProgress
          variant="determinate"
          value={progress}
          style={{
            height: '8px',
            borderRadius: '4px',
            backgroundColor: '#e0e0e0'
          }}
        />

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px'
        }}>
          <Typography variant="body2" style={{ color: '#666' }}>
            Duration: {formatDuration(task.duration)}
          </Typography>
          <Typography variant="body2" style={{ color: '#666' }}>
            Remaining: {formatDuration(remainingTime)}
          </Typography>
        </div>
      </Box>

      {/* Show children if this is a SubCalendarItem with scheduled children */}
      {task instanceof SubCalendarItem && task.children.length > 0 && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '16px'
        }}>
          <Typography variant="h6" style={{ marginBottom: '12px' }}>
            Upcoming Subtasks
          </Typography>

          {[...task.children]
            .sort((a, b) => a.start - b.start)
            .slice(0, 3)
            .map((child, index) => (
              <div key={child.relationshipId} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: index < 2 ? '1px solid #e0e0e0' : 'none'
              }}>
                <Typography variant="body2">
                  Subtask {index + 1}
                </Typography>
                <Typography variant="body2" style={{ color: '#666' }}>
                  Starts at {formatDuration(child.start)}
                </Typography>
              </div>
            ))
          }
        </div>
      )}

      {/* Show checklist items if this is a CheckListItem */}
      {task instanceof CheckListItem && task.children.length > 0 && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '16px',
          borderRadius: '8px',
          marginTop: '16px'
        }}>
          <Typography variant="h6" style={{ marginBottom: '12px' }}>
            Checklist Items
          </Typography>

          {task.children.slice(0, 3).map((child, index) => (
            <div key={child.relationshipId} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              borderBottom: index < 2 ? '1px solid #e0e0e0' : 'none'
            }}>
              <Typography variant="body2">
                Item {index + 1}
              </Typography>
              <Typography variant="body2" style={{
                color: child.complete ? '#4caf50' : '#666'
              }}>
                {child.complete ? 'Complete' : 'Pending'}
              </Typography>
            </div>
          ))}
        </div>
      )}
    </Paper>
  );
}
