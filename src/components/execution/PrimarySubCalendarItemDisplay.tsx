import { useMemo, useState } from "react";
import { Box } from "@mui/material";
import { SubCalendarItem } from "../../functions/utils/item/index";
import { getChildExecutionStatus, getHierarchyStatus } from "./executionUtils";
import { useAppState } from "../../reducerContexts";
import { useItemVariables } from "../../hooks/useItemVariables";
import SubCalendarStatusBar from "./SubCalendarStatusBar";
import UnifiedDropdownContent from "./UnifiedDropdownContent";

interface PrimarySubCalendarItemDisplayProps {
  readonly item: SubCalendarItem;
  readonly currentTime: number;
  readonly startTime: number;
  readonly children?: React.ReactNode; // For recursive rendering
}

export default function PrimarySubCalendarItemDisplay({
  item,
  currentTime,
  startTime,
  children
}: PrimarySubCalendarItemDisplayProps) {
  const { items } = useAppState();
  const { variableSummary } = useItemVariables(item.id);
  const [isExpanded, setIsExpanded] = useState(false);

  // Check if item has variables to show
  const hasVariables = useMemo(() => {
    return Object.keys(variableSummary).length > 0;
  }, [variableSummary]);

  // Click handler for expanding/collapsing the unified dropdown
  const handleToggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  // Get enhanced child execution status
  const childExecutionStatus = useMemo(() => {
    return getChildExecutionStatus(item, items, currentTime, startTime);
  }, [item, items, currentTime, startTime]);

  const hierarchyStatus = useMemo(() => {
    return getHierarchyStatus(item, items, currentTime, startTime);
  }, [item, items, currentTime, startTime]);

  // Enhanced next child information with countdown
  const { nextChild, gapPeriod, currentPhase } = childExecutionStatus;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Enhanced SubCalendar Status Bar with click handling */}
      <SubCalendarStatusBar
        item={item}
        taskChain={items}
        currentTime={currentTime}
        startTime={startTime}
        itemName={item.name}
        isExpandable={hasVariables}
        isExpanded={isExpanded}
        onClick={hasVariables ? handleToggleExpansion : undefined}
        childExecutionStatus={childExecutionStatus}
        showCountdown={true}
        showPreparationHints={true}
        totalChildren={hierarchyStatus.totalChildren}
        completedChildren={hierarchyStatus.completedChildren}
        nextBasicDescendant={hierarchyStatus.nextBasicDescendant}
        hasActiveBasicDescendant={hierarchyStatus.hasActiveBasicDescendant}
      />

      {/* Unified Dropdown Content */}
      <UnifiedDropdownContent
        isExpanded={isExpanded}
        variableSummary={variableSummary}
        hasVariables={hasVariables}
        nextChild={nextChild}
        gapPeriod={gapPeriod}
        currentPhase={currentPhase}
        childExecutionStatus={childExecutionStatus}
        totalChildren={hierarchyStatus.totalChildren}
        completedChildren={hierarchyStatus.completedChildren}
        nextBasicDescendant={hierarchyStatus.nextBasicDescendant}
        hasActiveBasicDescendant={hierarchyStatus.hasActiveBasicDescendant}
      />

      {/* Render children directly with no extra styling */}
      {children}
    </Box>
  );
}
