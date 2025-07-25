import { Box, Typography } from '@mui/material';
import { PrimaryItemDisplayRouter } from './execution';
import { useAppState } from '../reducerContexts/App';
import { BasicItem, SubCalendarItem, CheckListItem } from '../functions/utils/item';
import { useCurrentTime } from '../hooks/useCurrentTime';

/**
 * Test component to verify the router functionality
 * This component can be temporarily added to the app to test the router
 */
export default function RouterTestComponent() {
  const { items } = useAppState();
  const currentTime = useCurrentTime();

  // Find different types of items for testing
  const basicItem = items.find(item => item instanceof BasicItem);
  const subCalendarItem = items.find(item => item instanceof SubCalendarItem);
  const checkListItem = items.find(item => item instanceof CheckListItem);

  const baseStartTime = currentTime - 30000; // 30 seconds ago

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Router Test Component
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        This component tests the PrimaryItemDisplayRouter with different item types.
      </Typography>

      {/* Test BasicItem */}
      {basicItem && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            BasicItem Test
          </Typography>
          <PrimaryItemDisplayRouter
            item={basicItem}
            taskChain={[basicItem]}
            currentTime={currentTime}
            startTime={baseStartTime}
            isDeepest={true}
            depth={0}
          />
        </Box>
      )}

      {/* Test SubCalendarItem */}
      {subCalendarItem && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            SubCalendarItem Test
          </Typography>
          <PrimaryItemDisplayRouter
            item={subCalendarItem}
            taskChain={[subCalendarItem]}
            currentTime={currentTime}
            startTime={baseStartTime}
            isDeepest={true}
            depth={0}
          />
        </Box>
      )}

      {/* Test CheckListItem */}
      {checkListItem && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            CheckListItem Test
          </Typography>
          <PrimaryItemDisplayRouter
            item={checkListItem}
            taskChain={[checkListItem]}
            currentTime={currentTime}
            startTime={baseStartTime}
            isDeepest={true}
            depth={0}
          />
        </Box>
      )}

      {/* Test nested scenario if we have a SubCalendar with children */}
      {subCalendarItem && subCalendarItem.children.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Nested SubCalendarItem Test
          </Typography>
          <PrimaryItemDisplayRouter
            item={subCalendarItem}
            taskChain={[subCalendarItem]}
            currentTime={currentTime}
            startTime={baseStartTime}
            isDeepest={false}
            depth={0}
          />
        </Box>
      )}

      {items.length === 0 && (
        <Typography color="text.secondary">
          No items found in the app state. Please add some items to test the router.
        </Typography>
      )}
    </Box>
  );
}
