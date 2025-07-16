import { Typography, Paper, LinearProgress, Box } from "@mui/material";
import { Item } from "../functions/utils/item";

interface CurrentTaskDisplayProps {
  task: Item;
  currentTime: number;
  rootItem: Item;
}

export default function CurrentTaskDisplay({ task, currentTime }: Readonly<CurrentTaskDisplayProps>) {
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

  // Calculate progress through the current task
  const getTaskProgress = (task: Item, currentTime: number): number => {
    if (!task.duration) return 0;

    // Find when this task started within its parent context
    // For now, we'll use a simple calculation - this would need to be more sophisticated
    // based on the actual scheduling within the parent
    const elapsed = currentTime % task.duration;
    return Math.min((elapsed / task.duration) * 100, 100);
  };

  const progress = getTaskProgress(task, currentTime);
  const remainingTime = task.duration - (currentTime % task.duration);

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

      {task.children.length > 0 && (
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
    </Paper>
  );
}
