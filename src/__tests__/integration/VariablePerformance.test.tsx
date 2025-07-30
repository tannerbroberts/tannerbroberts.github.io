import { describe, it, expect, beforeEach, vi } from 'vitest';
import AppReducer, { initialState, AppAction } from '../../functions/reducers/AppReducer';
import { VariableItem } from '../../functions/utils/item/VariableItem';
import { BasicItem } from '../../functions/utils/item/BasicItem';
import { ItemFactory } from '../../functions/utils/item/ItemFactory';

describe('Variable Performance Integration Tests', () => {
  let state: typeof initialState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('Large Dataset Performance', () => {
    it('should handle 1000+ items with variables efficiently', async () => {
      const startTime = performance.now();

      // Create 100 variable definitions
      const variableIds: string[] = [];
      for (let i = 0; i < 100; i++) {
        const variableItem = new VariableItem({
          name: `var${i}`,
          value: i,
          description: `Variable ${i} description`
        });

        const createAction: AppAction = {
          type: 'CREATE_VARIABLE_ITEM',
          payload: {
            variableItem,
            definitionId: `def-${i}`
          }
        };

        state = AppReducer(state, createAction);
        variableIds.push(variableItem.id);
      }

      // Create 1000 items using these variables
      for (let i = 0; i < 1000; i++) {
        const item = ItemFactory.createBasicItem({
          name: `Item ${i}`,
          duration: 60000, // 1 minute
        });

        const createAction: AppAction = {
          type: 'CREATE_ITEM',
          payload: { newItem: item }
        };

        state = AppReducer(state, createAction);

        // Add random variables to each item
        const numVariables = Math.floor(Math.random() * 5) + 1;
        for (let j = 0; j < numVariables; j++) {
          const randomVarId = variableIds[Math.floor(Math.random() * variableIds.length)];
          const addVariableAction: AppAction = {
            type: 'ADD_ITEM_VARIABLE',
            payload: {
              itemId: item.id,
              variable: {
                name: `var${Math.floor(Math.random() * 100)}`,
                quantity: Math.floor(Math.random() * 100) + 1
              }
            }
          };

          state = AppReducer(state, addVariableAction);
        }
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within 2 seconds
      expect(executionTime).toBeLessThan(2000);
      expect(state.items.length).toBe(1100); // 100 variables + 1000 items
    });

    it('should handle complex hierarchy with 10+ levels efficiently', async () => {
      const startTime = performance.now();

      // Create a variable to use throughout the hierarchy
      const variableItem = new VariableItem({
        name: 'testVar',
        value: 1,
        description: 'Test variable for hierarchy'
      });

      const createVarAction: AppAction = {
        type: 'CREATE_VARIABLE_ITEM',
        payload: {
          variableItem,
          definitionId: 'test-def'
        }
      };

      state = AppReducer(state, createVarAction);

      // Create 10-level hierarchy
      let currentParentId: string | undefined = undefined;
      const itemIds: string[] = [];

      for (let level = 0; level < 10; level++) {
        for (let itemInLevel = 0; itemInLevel < 5; itemInLevel++) {
          const item = ItemFactory.createBasicItem({
            name: `Level ${level} Item ${itemInLevel}`,
            duration: 60000,
            ...(currentParentId && {
              parents: [{ id: currentParentId, relationshipId: `rel-${level}-${itemInLevel}` }]
            })
          });

          const createAction: AppAction = {
            type: 'CREATE_ITEM',
            payload: { newItem: item }
          };

          state = AppReducer(state, createAction);
          itemIds.push(item.id);

          // Add variable to each item
          const addVariableAction: AppAction = {
            type: 'ADD_ITEM_VARIABLE',
            payload: {
              itemId: item.id,
              variable: {
                name: 'testVar',
                quantity: level + 1
              }
            }
          };

          state = AppReducer(state, addVariableAction);

          if (itemInLevel === 0) {
            currentParentId = item.id; // Use first item in level as parent for next level
          }
        }
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within 1 second for hierarchy operations
      expect(executionTime).toBeLessThan(1000);
      expect(state.items.length).toBe(51); // 1 variable + 50 items (10 levels * 5 items)
    });

    it('should handle 500+ variable definitions with cross-links efficiently', async () => {
      const startTime = performance.now();

      const variableIds: string[] = [];

      // Create 500 variables with cross-references
      for (let i = 0; i < 500; i++) {
        const crossLinkedVar = i > 0 ? `var${i - 1}` : `var${499}`;
        const description = `Variable ${i} linked to [${crossLinkedVar}]`;

        const variableItem = new VariableItem({
          name: `var${i}`,
          value: i,
          description
        });

        const createAction: AppAction = {
          type: 'CREATE_VARIABLE_ITEM',
          payload: {
            variableItem,
            definitionId: `def-${i}`
          }
        };

        state = AppReducer(state, createAction);
        variableIds.push(variableItem.id);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Should complete within 1 second
      expect(executionTime).toBeLessThan(1000);
      expect(state.items.length).toBe(500);

      // Verify cross-links are preserved
      const firstVariable = state.items[0] as VariableItem;
      expect(firstVariable.description).toContain('[var499]');
    });
  });

  describe('Real-time Update Performance', () => {
    it('should handle rapid variable modifications efficiently', async () => {
      // Create initial dataset
      const variableItem = new VariableItem({
        name: 'rapidVar',
        value: 0,
        description: 'Variable for rapid updates'
      });

      const createAction: AppAction = {
        type: 'CREATE_VARIABLE_ITEM',
        payload: {
          variableItem,
          definitionId: 'rapid-def'
        }
      };

      state = AppReducer(state, createAction);

      // Create 100 items using this variable
      const itemIds: string[] = [];
      for (let i = 0; i < 100; i++) {
        const item = ItemFactory.createBasicItem({
          name: `Item ${i}`,
          duration: 60000
        });

        const createItemAction: AppAction = {
          type: 'CREATE_ITEM',
          payload: { newItem: item }
        };

        state = AppReducer(state, createItemAction);
        itemIds.push(item.id);

        const addVariableAction: AppAction = {
          type: 'ADD_ITEM_VARIABLE',
          payload: {
            itemId: item.id,
            variable: {
              name: 'rapidVar',
              quantity: i
            }
          }
        };

        state = AppReducer(state, addVariableAction);
      }

      // Perform rapid updates
      const startTime = performance.now();

      for (let update = 0; update < 1000; update++) {
        const randomItemId = itemIds[Math.floor(Math.random() * itemIds.length)];
        const updateAction: AppAction = {
          type: 'UPDATE_ITEM_VARIABLE',
          payload: {
            itemId: randomItemId,
            variableIndex: 0,
            variable: {
              name: 'rapidVar',
              quantity: Math.floor(Math.random() * 1000)
            }
          }
        };

        state = AppReducer(state, updateAction);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // 1000 updates should complete within 500ms
      expect(executionTime).toBeLessThan(500);
    });

    it('should handle concurrent summary calculations efficiently', async () => {
      // Create hierarchy for summary calculations
      const variableItem = new VariableItem({
        name: 'summaryVar',
        value: 0,
        description: 'Variable for summary testing'
      });

      const createVarAction: AppAction = {
        type: 'CREATE_VARIABLE_ITEM',
        payload: {
          variableItem,
          definitionId: 'summary-def'
        }
      };

      state = AppReducer(state, createVarAction);

      // Create parent item
      const parentItem = ItemFactory.createBasicItem({
        name: 'Parent Item',
        duration: 0
      });

      const createParentAction: AppAction = {
        type: 'CREATE_ITEM',
        payload: { newItem: parentItem }
      };

      state = AppReducer(state, createParentAction);

      // Create 50 child items
      for (let i = 0; i < 50; i++) {
        const childItem = ItemFactory.createBasicItem({
          name: `Child ${i}`,
          duration: 60000,
          parents: [{ id: parentItem.id, relationshipId: `child-rel-${i}` }]
        });

        const createChildAction: AppAction = {
          type: 'CREATE_ITEM',
          payload: { newItem: childItem }
        };

        state = AppReducer(state, createChildAction);

        const addVariableAction: AppAction = {
          type: 'ADD_ITEM_VARIABLE',
          payload: {
            itemId: childItem.id,
            variable: {
              name: 'summaryVar',
              quantity: i + 1
            }
          }
        };

        state = AppReducer(state, addVariableAction);
      }

      // Simulate concurrent summary calculations
      const startTime = performance.now();

      // Multiple concurrent cache updates
      for (let i = 0; i < 10; i++) {
        const invalidateAction: AppAction = {
          type: 'INVALIDATE_VARIABLE_CACHE',
          payload: { itemId: parentItem.id }
        };

        state = AppReducer(state, invalidateAction);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      // Cache operations should be very fast
      expect(executionTime).toBeLessThan(100);
    });
  });

  describe('Memory Usage Performance', () => {
    it('should maintain stable memory usage during extended operations', async () => {
      // This test would be more meaningful with actual memory profiling
      // For now, we'll verify that operations don't cause obvious memory leaks

      const initialItemCount = state.items.length;

      // Perform many create/delete cycles
      for (let cycle = 0; cycle < 100; cycle++) {
        // Create variable
        const variableItem = new VariableItem({
          name: `tempVar${cycle}`,
          value: cycle,
          description: `Temporary variable ${cycle}`
        });

        const createAction: AppAction = {
          type: 'CREATE_VARIABLE_ITEM',
          payload: {
            variableItem,
            definitionId: `temp-def-${cycle}`
          }
        };

        state = AppReducer(state, createAction);

        // Delete variable
        const deleteAction: AppAction = {
          type: 'DELETE_ITEM_BY_ID',
          payload: { id: variableItem.id }
        };

        state = AppReducer(state, deleteAction);
      }

      // Should return to initial state
      expect(state.items.length).toBe(initialItemCount);
    });

    it('should handle large state serialization efficiently', async () => {
      // Create large state
      for (let i = 0; i < 100; i++) {
        const variableItem = new VariableItem({
          name: `serVar${i}`,
          value: i,
          description: `Serialization test variable ${i}`
        });

        const createAction: AppAction = {
          type: 'CREATE_VARIABLE_ITEM',
          payload: {
            variableItem,
            definitionId: `ser-def-${i}`
          }
        };

        state = AppReducer(state, createAction);
      }

      // Test serialization performance
      const startTime = performance.now();
      const serialized = JSON.stringify(state);
      const parsed = JSON.parse(serialized);
      const endTime = performance.now();

      const executionTime = endTime - startTime;

      // Serialization should be fast
      expect(executionTime).toBeLessThan(100);
      expect(parsed.items.length).toBe(state.items.length);
    });
  });
});
