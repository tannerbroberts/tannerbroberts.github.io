import { useState } from "react";
import { Typography, Button, Collapse, Paper } from "@mui/material";
import { ChevronRight, ExpandMore, ExpandLess } from "@mui/icons-material";
import { Item } from "../functions/utils/item";

interface TaskBreadcrumbsProps {
  taskChain: Item[];
}

export default function TaskBreadcrumbs({ taskChain }: Readonly<TaskBreadcrumbsProps>) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const formatDuration = (duration: number): string => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        {taskChain.map((item, index) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => toggleExpanded(item.id)}
              endIcon={expandedItems.has(item.id) ? <ExpandLess /> : <ExpandMore />}
              style={{
                backgroundColor: index === taskChain.length - 1 ? '#e3f2fd' : 'white',
                borderColor: index === taskChain.length - 1 ? '#2196f3' : '#ccc',
                color: '#333',
                textTransform: 'none',
                fontSize: '0.9rem',
                padding: '6px 12px'
              }}
            >
              {item.name}
            </Button>

            {index < taskChain.length - 1 && (
              <ChevronRight style={{ margin: '0 4px', color: '#666' }} />
            )}
          </div>
        ))}
      </div>

      {/* Expanded item summaries */}
      {taskChain.map((item) => (
        <Collapse key={`summary-${item.id}`} in={expandedItems.has(item.id)}>
          <Paper
            style={{
              marginTop: '12px',
              padding: '16px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #e0e0e0'
            }}
          >
            <Typography variant="h6" style={{ marginBottom: '8px' }}>
              {item.name}
            </Typography>

            <Typography variant="body2" style={{ marginBottom: '8px' }}>
              <strong>Duration:</strong> {formatDuration(item.duration)}
            </Typography>

            <Typography variant="body2" style={{ marginBottom: '8px' }}>
              <strong>Subtasks:</strong> {item.children.length}
            </Typography>

            {item.children.length > 0 && (
              <div style={{ marginTop: '12px' }}>
                <Typography variant="subtitle2" style={{ marginBottom: '8px' }}>
                  Scheduled Subtasks:
                </Typography>
                {item.children.map((child, index) => (
                  <div key={child.relationshipId} style={{
                    marginLeft: '16px',
                    marginBottom: '4px',
                    fontSize: '0.85rem',
                    color: '#666'
                  }}>
                    {index + 1}. Starts at {formatDuration(child.start)}
                  </div>
                ))}
              </div>
            )}
          </Paper>
        </Collapse>
      ))}
    </div>
  );
}
