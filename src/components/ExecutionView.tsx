import { useEffect, useMemo, useState } from "react";
import { useAppState } from "../reducerContexts/App";
import {
  getCurrentTaskChain,
  getItemById,
  isDeepestExecutableTask,
  getTaskProgress,
  getTaskStartTime
} from "../functions/utils/item";
import TaskBreadcrumbs from "./TaskBreadcrumbs";
import { useCurrentTime } from "../hooks/useCurrentTime";
import PieChartCountdown from "./PieChartCountdown";

interface ExecutionViewProps {
  readonly itemId?: string;
  readonly depth?: number;
  readonly currentTime?: number;
}

export default function ExecutionView({
  itemId,
  depth = 0,
  currentTime
}: ExecutionViewProps) {
  const { items, baseCalendar } = useAppState();
  const [focusedExecutionView, setFocusedExecutionView] = useState<string | null>(null);

  // Use real-time clock for root execution view, otherwise use passed currentTime
  const realtimeCurrentTime = useCurrentTime(1000);
  const effectiveCurrentTime = currentTime ?? realtimeCurrentTime;

  // Get the current task chain
  const taskChain = useMemo(() => {
    if (itemId) {
      // If itemId is provided, find the chain starting from this item
      const item = getItemById(items, itemId);
      if (!item) return [];

      // For child execution views, we need to find the sub-chain
      const fullChain = getCurrentTaskChain(items, effectiveCurrentTime, baseCalendar);
      const itemIndex = fullChain.findIndex(i => i.id === itemId);
      return itemIndex >= 0 ? fullChain.slice(itemIndex) : [item];
    }

    // For root execution view, get the full chain
    return getCurrentTaskChain(items, effectiveCurrentTime, baseCalendar);
  }, [items, baseCalendar, itemId, effectiveCurrentTime]);

  const currentItem = taskChain[0];
  const childItem = taskChain[1];

  // Determine if this execution view should be expanded
  const isDeepest = !childItem || isDeepestExecutableTask(items, currentItem, effectiveCurrentTime);
  const isFocused = focusedExecutionView === currentItem?.id;
  const isExpanded = isDeepest || isFocused;

  // Handle focus change
  const handleFocus = () => {
    if (currentItem) {
      setFocusedExecutionView(currentItem.id);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleFocus();
    }
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (clickedItemId: string) => {
    setFocusedExecutionView(clickedItemId);
  };

  // Auto-focus the deepest item on mount
  useEffect(() => {
    if (depth === 0 && taskChain.length > 0 && !focusedExecutionView) {
      const deepestItem = taskChain[taskChain.length - 1];
      if (deepestItem) {
        setFocusedExecutionView(deepestItem.id);
      }
    }
  }, [taskChain, focusedExecutionView, depth]);

  // Reset focused execution view when task chain changes
  useEffect(() => {
    if (depth === 0 && taskChain.length > 0) {
      const deepestItem = taskChain[taskChain.length - 1];
      if (deepestItem && (!focusedExecutionView || !taskChain.find(item => item.id === focusedExecutionView))) {
        setFocusedExecutionView(deepestItem.id);
      }
    }
  }, [taskChain, depth, focusedExecutionView]);

  // Calculate progress for the current item
  const taskProgress = useMemo(() => {
    if (!currentItem) return 0;

    const startTime = getTaskStartTime(taskChain, currentItem, baseCalendar);
    return getTaskProgress(currentItem, effectiveCurrentTime, startTime);
  }, [currentItem, taskChain, baseCalendar, effectiveCurrentTime]);

  // Debug logging for root execution view
  useEffect(() => {
    if (depth === 0) {
      console.log('ExecutionView update:', {
        currentTime: effectiveCurrentTime,
        taskChain: taskChain.map(item => item.name),
        baseCalendar: Array.from(baseCalendar.entries())
      });
    }
  }, [taskChain, effectiveCurrentTime, depth, baseCalendar]);

  if (!currentItem) {
    return (
      <div style={{
        width: '100%',
        padding: '20px',
        textAlign: 'center',
        color: '#666'
      }}>
        No active tasks at this time
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      marginLeft: `${depth * 20}px`,
      borderLeft: depth > 0 ? '2px solid #e0e0e0' : 'none',
      paddingLeft: depth > 0 ? '16px' : '0'
    }}>
      {/* Show breadcrumbs only for root execution view */}
      {depth === 0 && taskChain.length > 1 && (
        <TaskBreadcrumbs
          chain={taskChain}
          currentItemId={currentItem.id}
          onItemClick={handleBreadcrumbClick}
        />
      )}

      {/* Execution view header */}
      <button
        type="button"
        style={{
          width: '100%',
          padding: '12px 16px',
          backgroundColor: isExpanded ? '#f5f5f5' : '#fafafa',
          border: '1px solid #e0e0e0',
          borderRadius: '4px',
          marginBottom: isExpanded ? '8px' : '0',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'left'
        }}
        onClick={handleFocus}
        onKeyDown={handleKeyDown}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Collapse/Expand indicator */}
            {!isDeepest && (
              <span style={{
                fontSize: '12px',
                color: '#666',
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease'
              }}>
                ▶
              </span>
            )}

            {/* Item name */}
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: isFocused ? 'bold' : 'normal',
              color: isFocused ? '#333' : '#555'
            }}>
              {currentItem.name}
            </h3>
          </div>

          {/* Duration indicator and progress chart */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <PieChartCountdown
              progress={taskProgress}
              size={40}
              completedColor="#2196F3"
              showPercentage={false}
            />
            <span style={{
              fontSize: '12px',
              color: '#888',
              padding: '2px 8px',
              backgroundColor: '#e8e8e8',
              borderRadius: '12px'
            }}>
              {Math.round(currentItem.duration / 1000 / 60)}min
            </span>
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{
          paddingLeft: '16px',
          borderLeft: '2px solid #e0e0e0',
          marginLeft: '8px'
        }}>
          {/* Current task details */}
          <div style={{
            padding: '12px',
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            marginBottom: childItem ? '16px' : '0'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Executing: <strong>{currentItem.name}</strong>
            </p>
            {isDeepest && (
              <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#888' }}>
                This is the current active task
              </p>
            )}
          </div>

          {/* Render child execution view recursively */}
          {childItem && (
            <ExecutionView
              itemId={childItem.id}
              depth={depth + 1}
              currentTime={effectiveCurrentTime}
            />
          )}
        </div>
      )}
    </div>
  );
}
