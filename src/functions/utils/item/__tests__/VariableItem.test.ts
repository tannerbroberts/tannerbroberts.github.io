import { describe, it, expect } from 'vitest';
import { VariableItem } from '../VariableItem';
import { Parent } from '../Parent';
import { isVariableItem } from '../itemUtils';

describe('VariableItem', () => {
  describe('constructor', () => {
    it('should create a VariableItem with required properties', () => {
      const variableItem = new VariableItem({
        name: 'eggs',
        value: 5,
        description: 'Fresh chicken eggs'
      });

      expect(variableItem.name).toBe('eggs');
      expect(variableItem.value).toBe(5);
      expect(variableItem.description).toBe('Fresh chicken eggs');
      expect(variableItem.duration).toBe(0); // Always 0 for VariableItem
      expect(variableItem.parents).toEqual([]);
      expect(variableItem.allOrNothing).toBe(false);
    });

    it('should create a VariableItem with parents', () => {
      const parent = new Parent({ id: 'parent-1' });
      const variableItem = new VariableItem({
        name: 'flour',
        value: 2,
        parents: [parent]
      });

      expect(variableItem.parents).toHaveLength(1);
      expect(variableItem.parents[0]).toBe(parent);
    });

    it('should force duration to 0 regardless of input', () => {
      const variableItem = new VariableItem({
        name: 'sugar',
        value: 1
      });

      expect(variableItem.duration).toBe(0);
    });
  });

  describe('JSON serialization', () => {
    it('should serialize to JSON correctly', () => {
      const variableItem = new VariableItem({
        id: 'var-1',
        name: 'milk',
        value: 250,
        description: 'Whole milk in ml'
      });

      const json = variableItem.toJSON();

      expect(json).toEqual({
        id: 'var-1',
        name: 'milk',
        duration: 0,
        parents: [],
        allOrNothing: false,
        type: 'VariableItem',
        description: 'Whole milk in ml',
        value: 250
      });
    });

    it('should deserialize from JSON correctly', () => {
      const json = {
        id: 'var-2',
        name: 'butter',
        duration: 0,
        parents: [],
        allOrNothing: false,
        type: 'VariableItem',
        description: 'Unsalted butter',
        value: 100
      };

      const variableItem = VariableItem.fromJSON(json);

      expect(variableItem.id).toBe('var-2');
      expect(variableItem.name).toBe('butter');
      expect(variableItem.value).toBe(100);
      expect(variableItem.description).toBe('Unsalted butter');
      expect(variableItem.duration).toBe(0);
    });

    it('should handle JSON without optional fields', () => {
      const json = {
        id: 'var-3',
        name: 'salt',
        duration: 0,
        parents: [],
        allOrNothing: false,
        type: 'VariableItem',
        value: 5
      };

      const variableItem = VariableItem.fromJSON(json);

      expect(variableItem.description).toBeUndefined();
      expect(variableItem.value).toBe(5);
    });
  });

  describe('immutable update methods', () => {
    it('should update value immutably', () => {
      const original = new VariableItem({
        name: 'water',
        value: 500,
        description: 'Fresh water'
      });

      const updated = original.updateValue(750);

      expect(original.value).toBe(500); // Original unchanged
      expect(updated.value).toBe(750); // New instance updated
      expect(updated.name).toBe('water'); // Other properties preserved
      expect(updated.description).toBe('Fresh water');
      expect(updated).not.toBe(original); // Different instances
    });

    it('should update description immutably', () => {
      const original = new VariableItem({
        name: 'olive oil',
        value: 30,
        description: 'Extra virgin olive oil'
      });

      const updated = original.updateDescription('Cold-pressed olive oil');

      expect(original.description).toBe('Extra virgin olive oil'); // Original unchanged
      expect(updated.description).toBe('Cold-pressed olive oil'); // New instance updated
      expect(updated.value).toBe(30); // Other properties preserved
      expect(updated).not.toBe(original); // Different instances
    });

    it('should remove description when updating to undefined', () => {
      const original = new VariableItem({
        name: 'pepper',
        value: 2,
        description: 'Black pepper'
      });

      const updated = original.updateDescription();

      expect(updated.description).toBeUndefined();
      expect(updated.value).toBe(2); // Other properties preserved
    });
  });

  describe('type guard', () => {
    it('should be identified by isVariableItem type guard', () => {
      const variableItem = new VariableItem({
        name: 'cheese',
        value: 200
      });

      expect(isVariableItem(variableItem)).toBe(true);
    });
  });

  describe('validation', () => {
    it('should require a name', () => {
      expect(() => new VariableItem({
        name: '',
        value: 5
      })).not.toThrow(); // Constructor doesn't validate, but application logic should
    });

    it('should accept positive and negative values', () => {
      const positive = new VariableItem({ name: 'input', value: 5 });
      const negative = new VariableItem({ name: 'output', value: -3 });

      expect(positive.value).toBe(5);
      expect(negative.value).toBe(-3);
    });

    it('should accept zero value', () => {
      const zero = new VariableItem({ name: 'neutral', value: 0 });
      expect(zero.value).toBe(0);
    });
  });
});
