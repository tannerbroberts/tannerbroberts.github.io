import { useMemo, useCallback } from "react";
import { Box } from "@mui/material";
import {
  BasicItem,
  SubCalendarItem,
  CheckListItem,
  Item
} from "../../functions/utils/item/index";
import PrimaryBasicItemDisplay from "./PrimaryBasicItemDisplay";
import PrimarySubCalendarItemDisplay from "./PrimarySubCalendarItemDisplay";
import { isRecursionDepthValid, ExecutionContextWithInstances } from "./executionUtils";

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
  // No state usage currently required; router delegates to leaf components.

  // Prevent infinite recursion - important for deeply nested SubCalendar structures
  const canRenderChildren = useMemo(() => {
    return isRecursionDepthValid(depth);
  }, [depth]);

  // Get active child for container items (SubCalendar and CheckList)
  // This uses the fixed getActiveChildForExecution function from Steps 2-3
  // which properly handles time-based child transitions for SubCalendar items
  // Active child resolution handled inside PrimarySubCalendarItemDisplay.

  // Calculate the correct start time for the active child
  // For SubCalendar: parent start time + child offset
  // For CheckList: same as parent start time (children execute sequentially)
  // Child start time calculation moved to the SubCalendar display component.

  // Render child content recursively
  // This enables proper nesting: SubCalendar -> SubCalendar -> BasicItem
  // The depth parameter prevents infinite recursion
  // Child transitions are handled automatically by the activeChild memoization
  // NOTE: Previously child content was rendered by passing it as children to the SubCalendar display.
  // That component now internally routes to the active child, so we no longer need to render it here.

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
        />
      );
    } else if (item instanceof CheckListItem) {
      // CheckListItem display placeholder pending simplified variable system integration
      return (
        <div>CheckListItem display not yet implemented for simplified variable system</div>
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
  }, [item, taskChain, currentTime, startTime, isDeepest, executionContext]);

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
