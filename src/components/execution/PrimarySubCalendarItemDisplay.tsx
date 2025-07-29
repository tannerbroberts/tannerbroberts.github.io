import { useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { SubCalendarItem } from "../../functions/utils/item/index";
import { formatDuration } from "../../functions/utils/formatTime";
import { getActiveChildForExecution, getChildExecutionStatus, getGapPeriodContext } from "./executionUtils";
import { useAppState } from "../../reducerContexts/App";
import { useItemVariables } from "../../hooks/useItemVariables";
import VariableSummaryDisplay from "../variables/VariableSummaryDisplay";
import SubCalendarStatusBar from "./SubCalendarStatusBar";

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
  const [showVariables, setShowVariables] = useState(false);

  // Check if item has variables to show
  const hasVariables = useMemo(() => {
    return Object.keys(variableSummary).length > 0;
  }, [variableSummary]);

  // Get enhanced child execution status
  const childExecutionStatus = useMemo(() => {
    return getChildExecutionStatus(item, items, currentTime, startTime);
  }, [item, items, currentTime, startTime]);

  // Get the currently executing child if any (for backward compatibility)
  const activeChild = useMemo(() => {
    return getActiveChildForExecution(item, items, currentTime, startTime);
  }, [item, items, currentTime, startTime]);

  // Enhanced next child information with countdown
  const { nextChild, gapPeriod, currentPhase } = childExecutionStatus;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Enhanced SubCalendar Status Bar with variable click handler */}
      <Box sx={{ position: 'relative' }}>
        <SubCalendarStatusBar
          item={item}
          taskChain={items}
          currentTime={currentTime}
          startTime={startTime}
          itemName={item.name}
          isExpandable={hasVariables}
          isExpanded={showVariables}
          childExecutionStatus={childExecutionStatus}
          showCountdown={true}
          showPreparationHints={true}
        />

        {/* Variables click handler overlay */}
        {hasVariables && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 60,
              zIndex: 10,
              cursor: 'pointer',
              backgroundColor: 'transparent'
            }}
            onClick={() => setShowVariables(!showVariables)}
          />
        )}
      </Box>

      {/* Variable Summary Display */}
      {hasVariables && (
        <Box sx={{ mb: 2 }}>
          <VariableSummaryDisplay
            summary={variableSummary}
            title="Resource Summary"
            defaultExpanded={showVariables}
            compact
          />
        </Box>
      )}

      {/* Show enhanced child status information */}
      {!activeChild && nextChild && (
        <Box sx={{
          p: 2,
          backgroundColor: gapPeriod ? 'warning.50' : 'info.50',
          borderRadius: 1,
          border: '1px solid',
          borderColor: gapPeriod ? 'warning.200' : 'info.200',
          mb: 2
        }}>
          <Typography variant="subtitle2" color={gapPeriod ? 'warning.main' : 'info.main'} sx={{ fontWeight: 'bold', mb: 1 }}>
            {gapPeriod ? 'Gap Period' : 'Up Next'}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
            {nextChild.item?.name || 'Unknown Task'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {getGapPeriodContext(nextChild, currentPhase)}
          </Typography>
          {nextChild.timeUntilStart > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Time remaining: {formatDuration(nextChild.timeUntilStart)}
            </Typography>
          )}
        </Box>
      )}

      {/* Show gap period context when no next child but in gap */}
      {!activeChild && !nextChild && gapPeriod && (
        <Box sx={{
          p: 2,
          backgroundColor: 'grey.50',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.200',
          mb: 2
        }}>
          <Typography variant="body2" color="text.secondary">
            {getGapPeriodContext(null, currentPhase)}
          </Typography>
        </Box>
      )}

      {/* Render children directly with no extra styling */}
      {children}
    </Box>
  );
}
