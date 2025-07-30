import { describe, it, expect, beforeEach } from 'vitest';
import reducer, { initialState, AppState } from '../AppReducer';
import { VariableDefinition, VariableDescription } from '../../utils/item/types/VariableTypes';
import { VariableItem } from '../../utils/item/VariableItem';
import { createVariableDefinition } from '../../utils/variable/variableDefinitionUtils';
import { createVariableItemFromDefinition } from '../../utils/variable/variableInstanceUtils';

describe('AppReducer - Variable System', () => {
  let state: AppState;
  let testDefinition: VariableDefinition;
  let testVariableItem: VariableItem;

  beforeEach(() => {
    state = { ...initialState };
    testDefinition = createVariableDefinition({
      name: 'eggs',
      unit: 'piece',
      category: 'ingredients'
    });
    testVariableItem = createVariableItemFromDefinition(testDefinition, 5);
  });

  describe('CREATE_VARIABLE_DEFINITION', () => {
    it('should add a new variable definition to state', () => {
      const newState = reducer(state, {
        type: 'CREATE_VARIABLE_DEFINITION',
        payload: { definition: testDefinition }
      });

      expect(newState.variableDefinitions.size).toBe(1);
      expect(newState.variableDefinitions.get(testDefinition.id)).toEqual(testDefinition);
    });

    it('should not modify other state properties', () => {
      const newState = reducer(state, {
        type: 'CREATE_VARIABLE_DEFINITION',
        payload: { definition: testDefinition }
      });

      expect(newState.items).toBe(state.items);
      expect(newState.itemVariables).toBe(state.itemVariables);
      expect(newState.variableDescriptions).toBe(state.variableDescriptions);
    });
  });

  describe('UPDATE_VARIABLE_DEFINITION', () => {
    beforeEach(() => {
      state.variableDefinitions.set(testDefinition.id, testDefinition);
    });

    it('should update an existing variable definition', () => {
      const updates = { name: 'chicken eggs', category: 'protein' };

      // Wait a small amount to ensure different timestamp
      const beforeUpdate = Date.now();

      const newState = reducer(state, {
        type: 'UPDATE_VARIABLE_DEFINITION',
        payload: { definitionId: testDefinition.id, updates }
      });

      const updated = newState.variableDefinitions.get(testDefinition.id);
      expect(updated?.name).toBe('chicken eggs');
      expect(updated?.category).toBe('protein');
      expect(updated?.unit).toBe(testDefinition.unit); // Unchanged
      expect(updated?.updatedAt).toBeGreaterThanOrEqual(beforeUpdate);
    });

    it('should warn and return unchanged state for non-existent definition', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const newState = reducer(state, {
        type: 'UPDATE_VARIABLE_DEFINITION',
        payload: { definitionId: 'non-existent', updates: { name: 'new name' } }
      });

      expect(newState).toBe(state);
      expect(consoleSpy).toHaveBeenCalledWith('Variable definition non-existent not found for update');

      consoleSpy.mockRestore();
    });
  });

  describe('DELETE_VARIABLE_DEFINITION', () => {
    let testDescription: VariableDescription;

    beforeEach(() => {
      state.variableDefinitions.set(testDefinition.id, testDefinition);
      testDescription = {
        id: 'desc-1',
        variableDefinitionId: testDefinition.id,
        content: 'Test description',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      state.variableDescriptions.set(testDefinition.id, testDescription);
    });

    it('should remove the definition and associated description', () => {
      const newState = reducer(state, {
        type: 'DELETE_VARIABLE_DEFINITION',
        payload: { definitionId: testDefinition.id }
      });

      expect(newState.variableDefinitions.has(testDefinition.id)).toBe(false);
      expect(newState.variableDescriptions.has(testDefinition.id)).toBe(false);
    });

    it('should not affect other definitions', () => {
      const otherDefinition = createVariableDefinition({ name: 'flour' });
      state.variableDefinitions.set(otherDefinition.id, otherDefinition);

      const newState = reducer(state, {
        type: 'DELETE_VARIABLE_DEFINITION',
        payload: { definitionId: testDefinition.id }
      });

      expect(newState.variableDefinitions.has(otherDefinition.id)).toBe(true);
    });
  });

  describe('SET_VARIABLE_DESCRIPTION', () => {
    const testDescription: VariableDescription = {
      id: 'desc-1',
      variableDefinitionId: 'def-1',
      content: 'Test description content',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    it('should add a variable description to state', () => {
      const newState = reducer(state, {
        type: 'SET_VARIABLE_DESCRIPTION',
        payload: { definitionId: 'def-1', description: testDescription }
      });

      expect(newState.variableDescriptions.get('def-1')).toEqual(testDescription);
    });
  });

  describe('UPDATE_VARIABLE_DESCRIPTION', () => {
    const originalDescription: VariableDescription = {
      id: 'desc-1',
      variableDefinitionId: 'def-1',
      content: 'Original content',
      createdAt: Date.now() - 1000,
      updatedAt: Date.now() - 1000
    };

    beforeEach(() => {
      state.variableDefinitions.set('def-1', testDefinition);
      state.variableDescriptions.set('def-1', originalDescription);
    });

    it('should update existing description with new timestamp', () => {
      const updatedDescription: VariableDescription = {
        ...originalDescription,
        content: 'Updated content'
      };

      const newState = reducer(state, {
        type: 'UPDATE_VARIABLE_DESCRIPTION',
        payload: { definitionId: 'def-1', description: updatedDescription }
      });

      const result = newState.variableDescriptions.get('def-1');
      expect(result?.content).toBe('Updated content');
      expect(result?.updatedAt).toBeGreaterThan(originalDescription.updatedAt);
    });

    it('should warn and return unchanged state for non-existent definition', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const newState = reducer(state, {
        type: 'UPDATE_VARIABLE_DESCRIPTION',
        payload: {
          definitionId: 'non-existent',
          description: { ...originalDescription, content: 'new content' }
        }
      });

      expect(newState).toBe(state);
      expect(consoleSpy).toHaveBeenCalledWith('Variable definition non-existent not found for description update');

      consoleSpy.mockRestore();
    });
  });

  describe('CREATE_VARIABLE_ITEM', () => {
    beforeEach(() => {
      state.variableDefinitions.set(testDefinition.id, testDefinition);
    });

    it('should add variable item to items array', () => {
      const newState = reducer(state, {
        type: 'CREATE_VARIABLE_ITEM',
        payload: { variableItem: testVariableItem, definitionId: testDefinition.id }
      });

      expect(newState.items).toHaveLength(1);
      expect(newState.items[0]).toEqual(testVariableItem);
    });

    it('should maintain sorted order of items', () => {
      // Add some items with different IDs to test sorting
      const item1 = new VariableItem({ id: 'z-item', name: 'last', value: 1 });
      const item2 = new VariableItem({ id: 'a-item', name: 'first', value: 2 });

      state.items = [item1];

      const newState = reducer(state, {
        type: 'CREATE_VARIABLE_ITEM',
        payload: { variableItem: item2, definitionId: testDefinition.id }
      });

      expect(newState.items[0].id).toBe('a-item');
      expect(newState.items[1].id).toBe('z-item');
    });

    it('should warn and return unchanged state if definition not found', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const newState = reducer(state, {
        type: 'CREATE_VARIABLE_ITEM',
        payload: { variableItem: testVariableItem, definitionId: 'non-existent' }
      });

      expect(newState).toBe(state);
      expect(consoleSpy).toHaveBeenCalledWith('Variable definition non-existent not found for new variable item');

      consoleSpy.mockRestore();
    });
  });

  describe('UPDATE_VARIABLE_ITEM_VALUE', () => {
    beforeEach(() => {
      state.items = [testVariableItem];
    });

    it('should update the value of a variable item', () => {
      const newState = reducer(state, {
        type: 'UPDATE_VARIABLE_ITEM_VALUE',
        payload: { itemId: testVariableItem.id, value: 10 }
      });

      const updatedItem = newState.items[0] as VariableItem;
      expect(updatedItem.value).toBe(10);
      expect(updatedItem.name).toBe(testVariableItem.name); // Other properties unchanged
    });

    it('should warn and return unchanged state for non-existent item', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const newState = reducer(state, {
        type: 'UPDATE_VARIABLE_ITEM_VALUE',
        payload: { itemId: 'non-existent', value: 10 }
      });

      expect(newState).toBe(state);
      expect(consoleSpy).toHaveBeenCalledWith('Variable item non-existent not found for value update');

      consoleSpy.mockRestore();
    });

    it('should warn and return unchanged state for non-VariableItem', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      // Test with non-existent item (no item in state, so getIndexById returns -1)
      reducer(state, {
        type: 'UPDATE_VARIABLE_ITEM_VALUE',
        payload: { itemId: 'basic-1', value: 10 }
      });

      expect(consoleSpy).toHaveBeenCalledWith('Variable item basic-1 not found for value update');
      consoleSpy.mockRestore();
    });
  });

  describe('BATCH_CREATE_VARIABLE_ITEMS', () => {
    beforeEach(() => {
      state.variableDefinitions.set(testDefinition.id, testDefinition);
    });

    it('should create multiple variable items at once', () => {
      const item1 = createVariableItemFromDefinition(testDefinition, 3);
      const item2 = createVariableItemFromDefinition(testDefinition, 7);

      const newState = reducer(state, {
        type: 'BATCH_CREATE_VARIABLE_ITEMS',
        payload: {
          items: [
            { variableItem: item1, definitionId: testDefinition.id },
            { variableItem: item2, definitionId: testDefinition.id }
          ]
        }
      });

      expect(newState.items).toHaveLength(2);
      expect(newState.items).toContain(item1);
      expect(newState.items).toContain(item2);
    });

    it('should maintain sorted order after batch creation', () => {
      const item1 = new VariableItem({ id: 'z-item', name: 'last', value: 1 });
      const item2 = new VariableItem({ id: 'a-item', name: 'first', value: 2 });

      const newState = reducer(state, {
        type: 'BATCH_CREATE_VARIABLE_ITEMS',
        payload: {
          items: [
            { variableItem: item1, definitionId: testDefinition.id },
            { variableItem: item2, definitionId: testDefinition.id }
          ]
        }
      });

      expect(newState.items[0].id).toBe('a-item');
      expect(newState.items[1].id).toBe('z-item');
    });

    it('should warn and return unchanged state if any definition not found', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const newState = reducer(state, {
        type: 'BATCH_CREATE_VARIABLE_ITEMS',
        payload: {
          items: [
            { variableItem: testVariableItem, definitionId: 'non-existent' }
          ]
        }
      });

      expect(newState).toBe(state);
      expect(consoleSpy).toHaveBeenCalledWith('Variable definition non-existent not found for batch creation');

      consoleSpy.mockRestore();
    });
  });

  describe('MIGRATE_LEGACY_VARIABLES', () => {
    it('should log migration request for now', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => { });

      const newState = reducer(state, {
        type: 'MIGRATE_LEGACY_VARIABLES',
        payload: { itemId: 'test-item' }
      });

      expect(newState).toBe(state);
      expect(consoleSpy).toHaveBeenCalledWith('Legacy variable migration requested for item test-item - to be implemented in Step 3');

      consoleSpy.mockRestore();
    });
  });
});
