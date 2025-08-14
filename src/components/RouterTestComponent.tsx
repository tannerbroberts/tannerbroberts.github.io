import { Box, Typography } from '@mui/material';
import { PrimaryItemDisplayRouter } from './execution';
import { useAppState } from '../reducerContexts';
import type { Item } from '../functions/utils/item';
import { BasicItem, SubCalendarItem, CheckListItem } from '../functions/utils/item';
import { useCurrentTime } from '../hooks/useCurrentTime';

/**
 * Test component to verify the router functionality
 * This component can be temporarily added to the app to test the router
 */
// Removed RouterTestComponent after execution view teardown.
export default function RouterTestComponent() { return null; }
