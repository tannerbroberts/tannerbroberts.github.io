import { BasicItem, CheckListItem, ItemInstanceImpl } from '../functions/utils/item/index';
import { AppState } from '../functions/reducers/AppReducer';
import { v4 as uuid } from 'uuid';

/**
 * Sample data with item instances for testing the accounting view
 */
export function createSampleDataWithInstances(): Partial<AppState> {
  // Create sample items
  const morningWorkoutItem = new BasicItem({
    id: 'workout-basic',
    name: 'Morning Workout',
    duration: 45 * 60 * 1000 // 45 minutes
  });

  const prepareLunchItem = new BasicItem({
    id: 'lunch-prep',
    name: 'Prepare Lunch',
    duration: 30 * 60 * 1000 // 30 minutes
  });

  const readingSessionItem = new CheckListItem({
    id: 'reading-session',
    name: 'Study Session',
    duration: 60 * 60 * 1000 // 1 hour
  });

  const items = [morningWorkoutItem, prepareLunchItem, readingSessionItem];

  // Create sample instances (some incomplete, some past)
  const instances = new Map<string, ItemInstanceImpl>();

  // Yesterday's incomplete workout
  const yesterdayWorkout = new ItemInstanceImpl({
    id: uuid(),
    itemId: morningWorkoutItem.id,
    calendarEntryId: 'entry-1',
    scheduledStartTime: Date.now() - (24 * 60 * 60 * 1000) + (7 * 60 * 60 * 1000), // Yesterday 7 AM
    isComplete: false
  });
  instances.set(yesterdayWorkout.id, yesterdayWorkout);

  // Today's incomplete lunch prep
  const todayLunchPrep = new ItemInstanceImpl({
    id: uuid(),
    itemId: prepareLunchItem.id,
    calendarEntryId: 'entry-2',
    scheduledStartTime: Date.now() - (2 * 60 * 60 * 1000), // 2 hours ago
    isComplete: false
  });
  instances.set(todayLunchPrep.id, todayLunchPrep);

  // This week's incomplete reading session
  const thisWeekReading = new ItemInstanceImpl({
    id: uuid(),
    itemId: readingSessionItem.id,
    calendarEntryId: 'entry-3',
    scheduledStartTime: Date.now() - (3 * 24 * 60 * 60 * 1000) + (19 * 60 * 60 * 1000), // 3 days ago at 7 PM
    actualStartTime: Date.now() - (3 * 24 * 60 * 60 * 1000) + (19 * 60 * 60 * 1000), // Was started
    isComplete: false
  });
  instances.set(thisWeekReading.id, thisWeekReading);

  // Older incomplete workout
  const olderWorkout = new ItemInstanceImpl({
    id: uuid(),
    itemId: morningWorkoutItem.id,
    calendarEntryId: 'entry-4',
    scheduledStartTime: Date.now() - (10 * 24 * 60 * 60 * 1000) + (8 * 60 * 60 * 1000), // 10 days ago at 8 AM
    isComplete: false
  });
  instances.set(olderWorkout.id, olderWorkout);

  return {
    items,
    itemInstances: instances,
    itemVariables: new Map(),
    variableSummaryCache: new Map()
  };
}

// Sample datasets for easy access
export const SAMPLE_DATASETS = {
  withInstances: createSampleDataWithInstances
};
