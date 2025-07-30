import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AppReducer, initialState, AppAction } from '../../functions/reducers/AppReducer';
import { VariableItem } from '../../functions/utils/item/VariableItem';
import { BasicItem } from '../../functions/utils/item/BasicItem';
import { calculateVariableSummary } from '../../hooks/useRelationshipBasedSummary';
import { validateVariableConsistency } from '../../utils/validation';

describe('Variable Data Consistency Tests', () => {
  let state: typeof initialState;

  beforeEach(() => {
    state = { ...initialState };
  });

  describe('Variable Definition Consistency', () => {
    it('should maintain consistency when variable definition changes', () => {
      // Create initial variable
      const createAction: AppAction = {
        type: 'CREATE_VARIABLE_ITEM',
        payload: {
          name: 'testVar',
          value: 10,
          description: 'Test variable'
        }
      };

      state = AppReducer(state, createAction);
      const variableId = state.items[0].id;

      // Create items that use this variable
      const createItem1: AppAction = {
        type: 'CREATE_BASIC_ITEM',
        payload: {
          name: 'Item 1',
          variables: [{ variableId, quantity: 5 }]
        }
      };

      const createItem2: AppAction = {
        type: 'CREATE_BASIC_ITEM',
        payload: {
          name: 'Item 2',
          variables: [{ variableId, quantity: 3 }]
        }
      };

      state = AppReducer(state, createItem1);
      state = AppReducer(state, createItem2);

      // Update variable name
      const updateAction: AppAction = {
        type: 'UPDATE_VARIABLE_ITEM',
        payload: {
          id: variableId,
          name: 'renamedVar'
        }
      };

      state = AppReducer(state, updateAction);

      // Verify all references are updated
      const variable = state.items.find(item => item.id === variableId) as VariableItem;
      expect(variable.name).toBe('renamedVar');

      // Verify all items still reference the correct variable
      const items = state.items.filter(item => item instanceof BasicItem) as BasicItem[];
      items.forEach(item => {
        const variableRef = item.variables?.find(v => v.variableId === variableId);
        expect(variableRef).toBeDefined();
      });
    });

    it('should maintain cross-link consistency when variables are modified', () => {
      // Create variables with cross-links
      const createVar1: AppAction = {
        type: 'CREATE_VARIABLE_ITEM',
        payload: {
          name: 'var1',
          value: 10,
          description: 'First variable linked to [var2]'
        }
      };

      const createVar2: AppAction = {
        type: 'CREATE_VARIABLE_ITEM',
        payload: {
          name: 'var2',
          value: 20,
          description: 'Second variable linked back to [var1]'
        }
      };

      state = AppReducer(state, createVar1);
      state = AppReducer(state, createVar2);

      const var1Id = state.items[0].id;
      const var2Id = state.items[1].id;

      // Rename var2 to newVar2
      const updateAction: AppAction = {
        type: 'UPDATE_VARIABLE_ITEM',
        payload: {
          id: var2Id,
          name: 'newVar2'
        }
      };

      state = AppReducer(state, updateAction);

      // Verify cross-links are updated in var1's description
      const var1 = state.items.find(item => item.id === var1Id) as VariableItem;
      expect(var1.description).toBe('First variable linked to [newVar2]');
    });

    it('should handle bulk variable operations consistently', () => {
      // Create multiple variables
      const variables = ['var1', 'var2', 'var3', 'var4', 'var5'];

      variables.forEach(name => {
        const createAction: AppAction = {
          type: 'CREATE_VARIABLE_ITEM',
          payload: {
            name,
            value: 1,
            description: `Description for ${name}`
          }
        };
        state = AppReducer(state, createAction);
      });

      expect(state.items.length).toBe(5);
      expect(state.items.every(item => item instanceof VariableItem)).toBe(true);

      // Bulk update all variables
      const bulkUpdateAction: AppAction = {
        type: 'BULK_UPDATE_VARIABLES',
        payload: {
          updates: state.items.map(item => ({
            id: item.id,
            value: (item as VariableItem).value * 2
          }))
        }
      };

      state = AppReducer(state, bulkUpdateAction);

      // Verify all variables were updated consistently
      state.items.forEach(item => {
        const variable = item as VariableItem;
        expect(variable.value).toBe(2);
      });
    });
  });

  describe('Relationship-based Summary Accuracy', () => {
    it('should calculate accurate summaries using relationshipId', () => {
      // Create variable definition
      const createVariable: AppAction = {
        type: 'CREATE_VARIABLE_ITEM',
        payload: {
          name: 'calories',
          value: 0,
          description: 'Calorie tracker'
        }
      };

      state = AppReducer(state, createVariable);
      const variableId = state.items[0].id;

      // Create hierarchy of items using the variable
      const createParent: AppAction = {
        type: 'CREATE_BASIC_ITEM',
        payload: {
          name: 'Meal Plan',
          variables: [{ variableId, quantity: 0 }]
        }
      };

      state = AppReducer(state, createParent);
      const parentId = state.items[1].id;

      const createChild1: AppAction = {
        type: 'CREATE_BASIC_ITEM',
        payload: {
          name: 'Breakfast',
          parentId,
          variables: [{ variableId, quantity: 300 }]
        }
      };

      const createChild2: AppAction = {
        type: 'CREATE_BASIC_ITEM',
        payload: {
          name: 'Lunch',
          parentId,
          variables: [{ variableId, quantity: 500 }]
        }
      };

      state = AppReducer(state, createChild1);
      state = AppReducer(state, createChild2);

      // Calculate summary for parent item
      const summary = calculateVariableSummary(parentId, variableId, state.items);

      // Should sum child quantities: 300 + 500 = 800
      expect(summary.total).toBe(800);
      expect(summary.children).toHaveLength(2);
    });

    it('should handle complex variable hierarchies correctly', () => {
      // Create nested hierarchy with multiple variables
      const createProtein: AppAction = {
        type: 'CREATE_VARIABLE_ITEM',
        payload: {
          name: 'protein',
          value: 0,
          description: 'Protein content'
        }
      };

      const createCarbs: AppAction = {
        type: 'CREATE_VARIABLE_ITEM',
        payload: {
          name: 'carbs',
          value: 0,
          description: 'Carbohydrate content'
        }
      };

      state = AppReducer(state, createProtein);
      state = AppReducer(state, createCarbs);

      const proteinId = state.items[0].id;
      const carbsId = state.items[1].id;

      // Create complex hierarchy
      const createMealPlan: AppAction = {
        type: 'CREATE_BASIC_ITEM',
        payload: {
          name: 'Weekly Meal Plan',
          variables: [
            { variableId: proteinId, quantity: 0 },
            { variableId: carbsId, quantity: 0 }
          ]
        }
      };

      state = AppReducer(state, createMealPlan);
      const mealPlanId = state.items[2].id;

      // Add daily meals
      for (let day = 1; day <= 7; day++) {
        const createDay: AppAction = {
          type: 'CREATE_BASIC_ITEM',
          payload: {
            name: `Day ${day}`,
            parentId: mealPlanId,
            variables: [
              { variableId: proteinId, quantity: 150 },
              { variableId: carbsId, quantity: 300 }
            ]
          }
        };
        state = AppReducer(state, createDay);
      }

      // Calculate summaries
      const proteinSummary = calculateVariableSummary(mealPlanId, proteinId, state.items);
      const carbsSummary = calculateVariableSummary(mealPlanId, carbsId, state.items);

      expect(proteinSummary.total).toBe(1050); // 7 days * 150
      expect(carbsSummary.total).toBe(2100); // 7 days * 300
    });
  });

  describe('Filter Result Consistency', () => {
    it('should maintain consistency between filter results and summaries', () => {
      // Create test data
      const createCalories: AppAction = {
        type: 'CREATE_VARIABLE_ITEM',
        payload: {
          name: 'calories',
          value: 0,
          description: 'Calorie content'
        }
      };

      state = AppReducer(state, createCalories);
      const caloriesId = state.items[0].id;

      // Create items with different calorie values
      const items = [
        { name: 'Light Snack', calories: 150 },
        { name: 'Regular Meal', calories: 500 },
        { name: 'Heavy Meal', calories: 800 }
      ];

      items.forEach(item => {
        const createAction: AppAction = {
          type: 'CREATE_BASIC_ITEM',
          payload: {
            name: item.name,
            variables: [{ variableId: caloriesId, quantity: item.calories }]
          }
        };
        state = AppReducer(state, createAction);
      });

      // Apply filter for calories > 400
      const filteredItems = state.items.filter(item => {
        if (!(item instanceof BasicItem)) return false;
        const calorieVar = item.variables?.find(v => v.variableId === caloriesId);
        return calorieVar && calorieVar.quantity > 400;
      });

      expect(filteredItems).toHaveLength(2);
      expect(filteredItems.map(item => item.name)).toEqual(['Regular Meal', 'Heavy Meal']);

      // Verify filter results match summary calculations
      filteredItems.forEach(item => {
        const summary = calculateVariableSummary(item.id, caloriesId, state.items);
        expect(summary.total).toBeGreaterThan(400);
      });
    });
  });

  describe('Data Validation and Integrity', () => {
    it('should validate variable consistency across operations', () => {
      // This would use a validation utility to check data integrity
      const isValid = validateVariableConsistency(state);
      expect(isValid).toBe(true);

      // Add some data
      const createVariable: AppAction = {
        type: 'CREATE_VARIABLE_ITEM',
        payload: {
          name: 'testVar',
          value: 10,
          description: 'Test variable'
        }
      };

      state = AppReducer(state, createVariable);

      // Should still be valid
      expect(validateVariableConsistency(state)).toBe(true);
    });

    it('should detect and handle data inconsistencies', () => {
      // Create corrupted state (this would be detected by validation)
      const corruptedState = {
        ...state,
        items: [
          new VariableItem({ name: 'test', value: 10 }),
          // Simulate orphaned variable reference
          new BasicItem({
            name: 'item',
            variables: [{ variableId: 'non-existent-id', quantity: 5 }]
          })
        ]
      };

      const isValid = validateVariableConsistency(corruptedState);
      expect(isValid).toBe(false);
    });
  });
});
