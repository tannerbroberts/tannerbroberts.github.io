import { useState, useEffect } from "react";
import { useAppState } from "../reducerContexts/App";
import { getItemById, Item } from "../functions/utils/item";
import TaskBreadcrumbs from "./TaskBreadcrumbs";
import CurrentTaskDisplay from "./CurrentTaskDisplay";

export default function ExecutionView() {
  const { items } = useAppState();
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Find the root/lifeline item (assuming it's the one with no parents)
  const rootItem = items.find(item => item.parents.length === 0);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Get the currently active task chain at this moment
  const getCurrentTaskChain = (item: Item, currentTime: number): Item[] => {
    if (!item) return [];

    // Find the active child at the current time
    const activeChild = item.children.find(child => {
      const childItem = getItemById(items, child.id);
      if (!childItem) return false;

      const childStart = child.start;
      const childEnd = childStart + childItem.duration;

      return currentTime >= childStart && currentTime < childEnd;
    });

    if (!activeChild) {
      // No active child, this is the current task
      return [item];
    }

    // Get the child item and recurse
    const childItem = getItemById(items, activeChild.id);
    if (!childItem) return [item];

    // Adjust current time relative to child's start time
    const relativeTime = currentTime - activeChild.start;
    const childChain = getCurrentTaskChain(childItem, relativeTime);

    return [item, ...childChain];
  };

  if (!rootItem) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#666',
        fontStyle: 'italic'
      }}>
        No root item found. Please create a lifeline/root item to use the execution view.
      </div>
    );
  }

  const currentTaskChain = getCurrentTaskChain(rootItem, currentTime);
  const currentTask = currentTaskChain[currentTaskChain.length - 1];

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      minHeight: '400px'
    }}>
      <h2 style={{
        marginBottom: '20px',
        color: '#333',
        textAlign: 'center'
      }}>
        Execution View
      </h2>

      <TaskBreadcrumbs taskChain={currentTaskChain} />

      <CurrentTaskDisplay
        task={currentTask}
        currentTime={currentTime}
        rootItem={rootItem}
      />
    </div>
  );
}
