import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import enhancedAppReducer, { initialState, AppAction, AppState } from '../enhancedAppReducer';
import * as storageService from '../localStorageService';
import * as persistenceMiddleware from '../persistenceMiddleware';
import { Item, BasicItem, CheckListItem } from '../../functions/utils/item/index';
import { BaseCalendarEntry } from '../../functions/reducers/AppReducer';

// Mock the storage service
vi.mock('../localStorageService', () => ({
  saveAllDataToStorage: vi.fn()
}));

// Mock the persistence middleware
vi.mock('../persistenceMiddleware', () => ({
  queuePersistence: vi.fn(),
  persistenceManager: {
    queuePersistence: vi.fn(),
    flush: vi.fn(),
    clear: vi.fn()
  }
}));

describe('Enhanced App Reducer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(storageService, 'saveAllDataToStorage').mockReturnValue({ success: true });
    vi.spyOn(persistenceMiddleware, 'queuePersistence').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Original Reducer Functionality', () => {
    it('should call original reducer for all actions', () => {
      const action: AppAction = {
        type: 'SET_FOCUSED_ITEM_BY_ID',
        payload: { focusedItemId: 'test-id' }
      };

      const result = enhancedAppReducer(initialState, action);

      expect(result.focusedItemId).toBe('test-id');
      expect(result).not.toBe(initialState); // Should return new state object
    });

    it('should preserve all state properties from original reducer', () => {
      const testItem = new BasicItem({ name: 'Test Item', duration: 1000 });
      const action: AppAction = {
        type: 'CREATE_ITEM',
        payload: { newItem: testItem }
      };

      const result = enhancedAppReducer(initialState, action);

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toBe(testItem);
      expect(result.baseCalendar).toBeDefined();
      expect(result.focusedItemId).toBe(initialState.focusedItemId);
      expect(result.millisecondsPerSegment).toBe(initialState.millisecondsPerSegment);
    });

    it('should handle BATCH actions correctly', () => {
      const testItem1 = new BasicItem({ name: 'Test Item 1', duration: 1000 });
      const testItem2 = new BasicItem({ name: 'Test Item 2', duration: 1000 });

      const batchAction: AppAction = {
        type: 'BATCH',
        payload: [
          { type: 'CREATE_ITEM', payload: { newItem: testItem1 } },
          { type: 'CREATE_ITEM', payload: { newItem: testItem2 } }
        ]
      };

      const result = enhancedAppReducer(initialState, batchAction);

      expect(result.items).toHaveLength(2);
      // BATCH action with persistent nested actions should trigger persistence
      expect(persistenceMiddleware.queuePersistence).toHaveBeenCalledTimes(1);
    });

    it('should not persist for BATCH actions with only UI actions', () => {
      const batchAction: AppAction = {
        type: 'BATCH',
        payload: [
          { type: 'SET_FOCUSED_ITEM_BY_ID', payload: { focusedItemId: 'test-1' } },
          { type: 'SET_SIDE_DRAWER_OPEN', payload: { sideDrawerOpen: true } }
        ]
      };

      const result = enhancedAppReducer(initialState, batchAction);

      expect(result.focusedItemId).toBe('test-1');
      expect(result.sideDrawerOpen).toBe(true);
      // BATCH action with only UI actions should not trigger persistence
      expect(persistenceMiddleware.queuePersistence).toHaveBeenCalledTimes(0);
    });
  });

  describe('Persistence Triggering', () => {
    it('should persist data for CREATE_ITEM action', () => {
      const testItem = new BasicItem({ name: 'Test Item', duration: 1000 });
      const action: AppAction = {
        type: 'CREATE_ITEM',
        payload: { newItem: testItem }
      };

      const result = enhancedAppReducer(initialState, action);

      expect(persistenceMiddleware.queuePersistence).toHaveBeenCalledWith(
        result.items,
        result.baseCalendar
      );
    });

    it('should persist data for DELETE_ITEM_BY_ID action', () => {
      const action: AppAction = {
        type: 'DELETE_ITEM_BY_ID',
        payload: { id: 'test-id' }
      };

      const result = enhancedAppReducer(initialState, action);

      expect(persistenceMiddleware.queuePersistence).toHaveBeenCalledWith(
        result.items,
        result.baseCalendar
      );
    });

    it('should persist data for UPDATE_ITEMS action', () => {
      // First create an item to update
      const testItem = new BasicItem({ name: 'Original Item', duration: 1000 });
      const createState = enhancedAppReducer(initialState, {
        type: 'CREATE_ITEM',
        payload: { newItem: testItem }
      });

      vi.clearAllMocks();

      // Now update the item
      const updatedItem = new BasicItem({
        id: testItem.id,
        name: 'Updated Item',
        duration: 2000
      });
      const testItems: Item[] = [updatedItem];
      const action: AppAction = {
        type: 'UPDATE_ITEMS',
        payload: { updatedItems: testItems }
      };

      const result = enhancedAppReducer(createState, action);

      expect(persistenceMiddleware.queuePersistence).toHaveBeenCalledWith(
        result.items,
        result.baseCalendar
      );
    });

    it('should persist data for ADD_CHILD_TO_ITEM action', () => {
      // First create parent CheckListItem and child BasicItem
      const parentItem = new CheckListItem({ name: 'Parent Item', duration: 1000 });
      const childItem = new BasicItem({ name: 'Child Item', duration: 500 });

      let currentState = enhancedAppReducer(initialState, {
        type: 'CREATE_ITEM',
        payload: { newItem: parentItem }
      });

      currentState = enhancedAppReducer(currentState, {
        type: 'CREATE_ITEM',
        payload: { newItem: childItem }
      });

      vi.clearAllMocks();

      const action: AppAction = {
        type: 'ADD_CHILD_TO_ITEM',
        payload: { parentId: parentItem.id, childId: childItem.id }
      };

      const result = enhancedAppReducer(currentState, action);

      expect(persistenceMiddleware.queuePersistence).toHaveBeenCalledWith(
        result.items,
        result.baseCalendar
      );
    });

    it('should persist data for calendar-related actions', () => {
      const testEntry: BaseCalendarEntry = {
        id: 'entry-id',
        itemId: 'item-id',
        startTime: Date.now()
      };

      const addAction: AppAction = {
        type: 'ADD_BASE_CALENDAR_ENTRY',
        payload: { entry: testEntry }
      };

      const result1 = enhancedAppReducer(initialState, addAction);
      expect(persistenceMiddleware.queuePersistence).toHaveBeenCalledWith(
        result1.items,
        result1.baseCalendar
      );

      const updateAction: AppAction = {
        type: 'UPDATE_BASE_CALENDAR_ENTRY',
        payload: { entry: { ...testEntry, startTime: Date.now() + 1000 } }
      };

      const result2 = enhancedAppReducer(result1, updateAction);
      expect(persistenceMiddleware.queuePersistence).toHaveBeenCalledWith(
        result2.items,
        result2.baseCalendar
      );

      const removeAction: AppAction = {
        type: 'REMOVE_BASE_CALENDAR_ENTRY',
        payload: { entryId: 'entry-id' }
      };

      const result3 = enhancedAppReducer(result2, removeAction);
      expect(persistenceMiddleware.queuePersistence).toHaveBeenCalledWith(
        result3.items,
        result3.baseCalendar
      );
    });
  });

  describe('Non-Persistent Actions', () => {
    it('should not persist data for UI-only actions', () => {
      const uiActions: AppAction[] = [
        { type: 'SET_FOCUSED_ITEM_BY_ID', payload: { focusedItemId: 'test-id' } },
        { type: 'SET_FOCUSED_LIST_ITEM_BY_ID', payload: { focusedListItemId: 'test-id' } },
        { type: 'SET_MILLISECONDS_PER_SEGMENT', payload: { millisecondsPerSegment: 200 } },
        { type: 'SET_NEW_ITEM_DIALOG_OPEN', payload: { newItemDialogOpen: true } },
        { type: 'SET_SCHEDULING_DIALOG_OPEN', payload: { schedulingDialogOpen: true } },
        { type: 'SET_DURATION_DIALOG_OPEN', payload: { durationDialogOpen: true } },
        { type: 'SET_CHECKLIST_CHILD_DIALOG_OPEN', payload: { checkListChildDialogOpen: true } },
        { type: 'SET_PIXELS_PER_SEGMENT', payload: { pixelsPerSegment: 40 } },
        { type: 'SET_SIDE_DRAWER_OPEN', payload: { sideDrawerOpen: true } },
        { type: 'TOGGLE_ITEM_SHOW_CHILDREN_BY_ID', payload: { id: 'test-id', showChildren: true } },
        { type: 'SET_ITEM_SEARCH_WINDOW_RANGE', payload: { min: 1, max: 5 } }
      ];

      uiActions.forEach((action) => {
        enhancedAppReducer(initialState, action);
        expect(persistenceMiddleware.queuePersistence).toHaveBeenCalledTimes(0);
        vi.clearAllMocks();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle storage failures gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
      vi.mocked(persistenceMiddleware.queuePersistence).mockImplementation(() => {
        throw new Error('Storage failed');
      });

      const testItem = new BasicItem({ name: 'Test Item', duration: 1000 });
      const action: AppAction = {
        type: 'CREATE_ITEM',
        payload: { newItem: testItem }
      };

      // Should not throw error
      const result = enhancedAppReducer(initialState, action);

      // Should still return the correct state
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toBe(testItem);

      // Should log the error
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to queue persistence for action:',
        'CREATE_ITEM',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should continue normal operation when persistence fails', () => {
      vi.mocked(persistenceMiddleware.queuePersistence).mockImplementation(() => {
        throw new Error('Persistence error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      const testItem1 = new BasicItem({ name: 'Test Item 1', duration: 1000 });
      const testItem2 = new BasicItem({ name: 'Test Item 2', duration: 1000 });

      const action1: AppAction = {
        type: 'CREATE_ITEM',
        payload: { newItem: testItem1 }
      };

      const action2: AppAction = {
        type: 'CREATE_ITEM',
        payload: { newItem: testItem2 }
      };

      const result1 = enhancedAppReducer(initialState, action1);
      const result2 = enhancedAppReducer(result1, action2);

      // State should still be updated correctly
      expect(result2.items).toHaveLength(2);
      expect(result2.items.some(item => item.name === 'Test Item 1')).toBe(true);
      expect(result2.items.some(item => item.name === 'Test Item 2')).toBe(true);

      consoleSpy.mockRestore();
    });
  });

  describe('Performance Requirements', () => {
    it('should complete actions quickly despite persistence overhead', () => {
      const testItem = new BasicItem({ name: 'Test Item', duration: 1000 });
      const action: AppAction = {
        type: 'CREATE_ITEM',
        payload: { newItem: testItem }
      };

      const startTime = performance.now();
      enhancedAppReducer(initialState, action);
      const endTime = performance.now();

      // Should complete in less than 5ms (performance requirement)
      expect(endTime - startTime).toBeLessThan(5);
    });

    it('should handle rapid consecutive actions efficiently', () => {
      const actions: AppAction[] = Array.from({ length: 10 }, (_, i) => ({
        type: 'CREATE_ITEM',
        payload: { newItem: new BasicItem({ name: `Test Item ${i}`, duration: 1000 }) }
      }));

      const startTime = performance.now();
      let currentState = initialState;

      actions.forEach(action => {
        currentState = enhancedAppReducer(currentState, action);
      });

      const endTime = performance.now();

      // Should handle 10 actions in reasonable time
      expect(endTime - startTime).toBeLessThan(50);
      expect(currentState.items).toHaveLength(10);

      // Persistence should be queued for each action
      expect(persistenceMiddleware.queuePersistence).toHaveBeenCalledTimes(10);
    });
  });

  describe('API Compatibility', () => {
    it('should export the same initialState', () => {
      expect(initialState).toBeDefined();
      expect(initialState.items).toEqual([]);
      expect(initialState.baseCalendar).toBeInstanceOf(Map);
      expect(typeof initialState.focusedItemId).toBe('object'); // null
    });

    it('should maintain the same reducer signature', () => {
      // This test ensures the function signature matches the original
      const state: AppState = initialState;
      const action: AppAction = { type: 'SET_FOCUSED_ITEM_BY_ID', payload: { focusedItemId: null } };

      const result: AppState = enhancedAppReducer(state, action);

      expect(typeof result).toBe('object');
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('baseCalendar');
      expect(result).toHaveProperty('focusedItemId');
    });
  });
});
