import { useMemo, useCallback } from "react";
import { Box } from "@mui/material";
import {
  BasicItem,
  SubCalendarItem,
  CheckListItem,
  Item
} from "../../functions/utils/item/index";
import { useAppState } from "../../reducerContexts/App";
import PrimaryBasicItemDisplay from "./PrimaryBasicItemDisplay";
import PrimarySubCalendarItemDisplay from "./PrimarySubCalendarItemDisplay";
import PrimaryCheckListItemDisplay from "./PrimaryCheckListItemDisplay";
import {
  getActiveChildForExecution,
  calculateChildStartTime,
  isRecursionDepthValid,
  ExecutionContextWithInstances
} from "./executionUtils";

interface PrimaryItemDisplayRouterProps {
  readonly item: Item;
  readonly taskChain: Item[];
  readonly currentTime: number;
  readonly startTime: number;
  readonly isDeepest?: boolean;
  readonly depth?: number; // For preventing infinite recursion
  readonly executionContext?: ExecutionContextWithInstances; // New optional prop
}

export default function PrimaryItemDisplayRouter({
  item,
  taskChain,
  currentTime,
  startTime,
  isDeepest = false,
  depth = 0,
  executionContext
}: PrimaryItemDisplayRouterProps) {
  const { items } = useAppState();

  // Prevent infinite recursion
  const canRenderChildren = useMemo(() => {
    return isRecursionDepthValid(depth);
  }, [depth]);

  // Get active child for container items
  const activeChild = useMemo(() => {
    if (!canRenderChildren) return null;

    if (item instanceof SubCalendarItem || item instanceof CheckListItem) {
      return getActiveChildForExecution(item, items, currentTime, startTime);
    }
    return null;
  }, [item, items, currentTime, startTime, canRenderChildren]);

  // Calculate child start time
  const childStartTime = useMemo(() => {
    if (!activeChild || !(item instanceof SubCalendarItem || item instanceof CheckListItem)) {
      return startTime;
    }

    if (item instanceof SubCalendarItem) {
      // Find the child reference to get the start offset
      const childRef = item.children.find(child => child.id === activeChild.id);
      if (childRef) {
        return calculateChildStartTime(startTime, childRef);
      }
    } else if (item instanceof CheckListItem) {
      // CheckList children use the same start time as parent
      const childRef = item.children.find(child => child.itemId === activeChild.id);
      if (childRef) {
        return calculateChildStartTime(startTime, childRef);
      }
    }

    return startTime;
  }, [activeChild, item, startTime]);

  // Render child content recursively
  const renderChildContent = useCallback(() => {
    if (!activeChild || !canRenderChildren) return null;

    return (
      <PrimaryItemDisplayRouter
        item={activeChild}
        taskChain={taskChain}
        currentTime={currentTime}
        startTime={childStartTime}
        isDeepest={isDeepest}
        depth={depth + 1}
        executionContext={executionContext}
      />
    );
  }, [activeChild, taskChain, currentTime, childStartTime, isDeepest, depth, canRenderChildren, executionContext]);

  // Route to appropriate primary display component
  const renderPrimaryDisplay = useCallback(() => {
    const commonProps = {
      taskChain,
      currentTime,
      startTime,
      isDeepest,
      executionContext
    };

    if (item instanceof BasicItem) {
      return (
        <PrimaryBasicItemDisplay
          item={item}
          {...commonProps}
        />
      );
    } else if (item instanceof SubCalendarItem) {
      return (
        <PrimarySubCalendarItemDisplay
          item={item}
          {...commonProps}
        >
          {renderChildContent()}
        </PrimarySubCalendarItemDisplay>
      );
    } else if (item instanceof CheckListItem) {
      return (
        <PrimaryCheckListItemDisplay
          item={item}
          {...commonProps}
        >
          {renderChildContent()}
        </PrimaryCheckListItemDisplay>
      );
    }

    // Fallback for unknown item types
    return (
      <Box sx={{
        p: 2,
        border: '1px solid red',
        borderRadius: 1,
        backgroundColor: 'error.light',
        color: 'error.contrastText'
      }}>
        Unknown item type: {item.constructor.name}
      </Box>
    );
  }, [item, taskChain, currentTime, startTime, isDeepest, renderChildContent, executionContext]);

  // Handle depth limit reached
  if (!canRenderChildren && (item instanceof SubCalendarItem || item instanceof CheckListItem)) {
    return (
      <Box sx={{
        p: 2,
        border: '1px solid orange',
        borderRadius: 1,
        backgroundColor: 'warning.light',
        color: 'warning.contrastText',
        textAlign: 'center'
      }}>
        Maximum nesting depth reached for {item.name}
      </Box>
    );
  }

  return renderPrimaryDisplay();
}
