import { describe, it, expect } from 'vitest';
import {
  ItemInstanceImpl,
  createInstanceFromCalendarEntry,
  VariableImpl,
  calculateVariableSummary,
  getPastIncompleteInstances,
  BasicItem
} from '../item/index';
import { BaseCalendarEntry } from '../../reducers/AppReducer';

describe('Integration Tests', () => {
  describe('ItemInstance Integration', () => {
    it('should create instance from calendar entry', () => {
      const calendarEntry: BaseCalendarEntry = {
        id: 'cal-1',
        itemId: 'item-1',
        startTime: Date.now()
      };

      const instance = createInstanceFromCalendarEntry(calendarEntry);

      expect(instance.calendarEntryId).toBe(calendarEntry.id);
      expect(instance.itemId).toBe(calendarEntry.itemId);
      expect(instance.scheduledStartTime).toBe(calendarEntry.startTime);
      expect(instance.isComplete).toBe(false);
    });

    it('should filter past incomplete instances correctly', () => {
      const currentTime = Date.now();
      const pastTime = currentTime - 60000; // 1 minute ago
      const futureTime = currentTime + 60000; // 1 minute from now

      const pastIncompleteInstance = new ItemInstanceImpl({
        id: 'past-incomplete',
        itemId: 'item1',
        calendarEntryId: 'cal1',
        scheduledStartTime: pastTime,
        isComplete: false
      });

      const pastCompleteInstance = new ItemInstanceImpl({
        id: 'past-complete',
        itemId: 'item2',
        calendarEntryId: 'cal2',
        scheduledStartTime: pastTime,
        isComplete: true
      });

      const futureIncompleteInstance = new ItemInstanceImpl({
        id: 'future-incomplete',
        itemId: 'item3',
        calendarEntryId: 'cal3',
        scheduledStartTime: futureTime,
        isComplete: false
      });

      const instances = new Map([
        ['past-incomplete', pastIncompleteInstance],
        ['past-complete', pastCompleteInstance],
        ['future-incomplete', futureIncompleteInstance]
      ]);

      const pastIncomplete = getPastIncompleteInstances(instances, currentTime);

      expect(pastIncomplete).toHaveLength(1);
      expect(pastIncomplete[0].id).toBe('past-incomplete');
    });
  });

  describe('Variable Integration', () => {
    it('should calculate variable summary for single item', () => {
      const item = new BasicItem({
        id: 'item1',
        name: 'Test Item',
        duration: 1000
      });

      const variables = [
        new VariableImpl({ name: 'eggs', quantity: 2 }),
        new VariableImpl({ name: 'flour', quantity: -1, unit: 'cup' })
      ];

      const variableMap = new Map([
        ['item1', variables]
      ]);

      const summary = calculateVariableSummary(item, [item], variableMap);

      expect(summary.eggs).toEqual({ quantity: 2, unit: undefined, category: undefined });
      expect(summary.flour).toEqual({ quantity: -1, unit: 'cup', category: undefined });
    });

    it('should handle empty variable map', () => {
      const item = new BasicItem({
        id: 'item1',
        name: 'Test Item',
        duration: 1000
      });

      const variableMap = new Map();
      const summary = calculateVariableSummary(item, [item], variableMap);

      expect(Object.keys(summary)).toHaveLength(0);
    });
  });

  describe('Cross-module Integration', () => {
    it('should track variable state in instance execution details', () => {
      const instance = new ItemInstanceImpl({
        itemId: 'item1',
        calendarEntryId: 'cal1',
        scheduledStartTime: Date.now(),
        executionDetails: {
          variableState: { 'eggs': 3, 'flour': -2 }
        }
      });

      expect(instance.executionDetails.variableState).toEqual({ 'eggs': 3, 'flour': -2 });

      const updatedInstance = instance.updateExecutionDetails({
        variableState: { 'eggs': 5, 'flour': -2, 'milk': 1 }
      });

      expect(updatedInstance.executionDetails.variableState).toEqual({
        'eggs': 5,
        'flour': -2,
        'milk': 1
      });
    });
  });
});
