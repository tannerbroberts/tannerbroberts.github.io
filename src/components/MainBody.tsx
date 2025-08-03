import { Box, Typography } from '@mui/material';
import { useAppState } from "../reducerContexts/App";
import { getItemById, hasChildren, getChildren, getChildId, type ChildReference } from "../functions/utils/item/index";
import { useViewportHeight } from "../hooks/useViewportHeight";
import ItemSchedule from "./ItemSchedule";
import LedgerLines from "./LedgerLines";
import ExecutionView from "./ExecutionView";
// Import accounting components when they exist
// import AccountingView from "./accounting/AccountingView";
// import { BadgeSettingsProvider } from "./accounting/contexts/BadgeSettingsContext";

export default function MainBody() {
  const { focusedItemId, currentView, items, millisecondsPerSegment, pixelsPerSegment } = useAppState();
  const viewportHeight = useViewportHeight();
  const focusedItem = getItemById(items, focusedItemId);

  // Calculate if the focused item would exceed maximum height
  const itemExceedsMaxHeight = focusedItem &&
    (focusedItem.duration * pixelsPerSegment / millisecondsPerSegment) > (viewportHeight * 2);

  // Helper function to render main content based on current state
  const renderMainContent = () => {
    if (focusedItem) {
      return (
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            // Add overflow scrolling when items exceed maximum height
            ...(itemExceedsMaxHeight && {
              maxHeight: `${viewportHeight * 2}px`,
              overflowY: 'auto',
              border: '2px solid rgba(255, 165, 0, 0.8)', // Orange border to indicate truncation
              borderRadius: '4px',
            })
          }}
        >
          <LedgerLines />
          {/* Render children of the focused item instead of the focused item itself */}
          {hasChildren(focusedItem) && getChildren(focusedItem).map((child: ChildReference) => {
            const childId = getChildId(child);
            const childItem = getItemById(items, childId);
            if (childItem === null) {
              throw new Error(`Item with id ${childId} not found while rendering children in MainBody`);
            }
            return (
              <ItemSchedule
                key={child.relationshipId}
                item={childItem}
                start={'start' in child ? child.start : null}
                relationshipId={child.relationshipId}
              />
            );
          })}
          {/* Show a message when there are no children */}
          {(!hasChildren(focusedItem) || getChildren(focusedItem).length === 0) && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center',
                color: 'rgba(0, 0, 0, 0.6)',
                fontSize: '16px'
              }}
            >
              No scheduled items. Use the schedule dialog to add items to this timeline.
            </Box>
          )}
        </Box>
      );
    }

    if (currentView === 'execution') {
      return (
        <Box sx={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          <ExecutionView />
        </Box>
      );
    }

    // Accounting view placeholder
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Accounting View - Coming Soon
        </Typography>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: viewportHeight,
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
        padding: focusedItem ? '20px' : '0'
      }}
    >
      {renderMainContent()}
    </Box>
  );
}
