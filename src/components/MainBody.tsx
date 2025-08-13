import { Box, Typography } from '@mui/material';
import { useAppState } from "../reducerContexts";
import { getItemById, BasicItem, CheckListItem, SubCalendarItem } from "../functions/utils/item/index";
import { useViewportHeight } from "../hooks/useViewportHeight";
import ExecutionView from "./ExecutionView";
import DayView from "./day/DayView.tsx";
import AccountingView from './accounting/AccountingView';
import { FocusedBasicItemDisplay, FocusedCheckListItemDisplay, FocusedSubCalendarItemDisplay } from "./focused";
// Import accounting components when they exist
// import AccountingView from "./accounting/AccountingView";
// import { BadgeSettingsProvider } from "./accounting/contexts/BadgeSettingsContext";

export default function MainBody() {
  const { focusedItemId, currentView } = useAppState();
  const viewportHeight = useViewportHeight();
  const focusedItem = getItemById(useAppState().items, focusedItemId);

  // Helper function to render main content based on current state
  const renderMainContent = () => {
    if (focusedItem) {
      // Route to the appropriate focused display component based on item type
      if (focusedItem instanceof BasicItem) {
        return <FocusedBasicItemDisplay item={focusedItem} />;
      } else if (focusedItem instanceof CheckListItem) {
        return <FocusedCheckListItemDisplay item={focusedItem} />;
      } else if (focusedItem instanceof SubCalendarItem) {
        return <FocusedSubCalendarItemDisplay item={focusedItem} />;
      } else {
        // Fallback for unknown item types
        return (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <Typography variant="h6" color="error">
              Unknown item type: {focusedItem.constructor.name}
            </Typography>
          </Box>
        );
      }
    }

    if (currentView === 'execution') {
      return (
        <Box sx={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          <ExecutionView />
        </Box>
      );
    }

    if (currentView === 'day') {
      return (
        <Box sx={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          <DayView />
        </Box>
      );
    }

    // Accounting view
    if (currentView === 'accounting') {
      return (
        <Box sx={{ flex: 1, overflow: 'auto', padding: '20px' }}>
          <AccountingView />
        </Box>
      );
    }

    // Fallback
    return <Box sx={{ flex: 1 }} />;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: viewportHeight,
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      {renderMainContent()}
    </Box>
  );
}
