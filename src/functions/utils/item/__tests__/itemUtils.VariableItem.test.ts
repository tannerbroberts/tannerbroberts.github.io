import { describe, it, expect } from 'vitest';
import { VariableItem } from '../VariableItem';
import { BasicItem } from '../BasicItem';
import { Parent } from '../Parent';
import {
  isVariableItem,
  hasChildren,
  getChildren,
  addParentToItem,
  removeParentById,
  removeParentByRelationshipId,
  addChildToItem
} from '../itemUtils';
import { Child } from '../Child';

describe('itemUtils with VariableItem', () => {
  describe('type guards', () => {
    it('should identify VariableItem correctly', () => {
      const variableItem = new VariableItem({ name: 'test', value: 5 });
      const basicItem = new BasicItem({ name: 'test', duration: 1000 });

      expect(isVariableItem(variableItem)).toBe(true);
      expect(isVariableItem(basicItem)).toBe(false);
    });

    it('should correctly identify that VariableItem has no children', () => {
      const variableItem = new VariableItem({ name: 'test', value: 5 });

      expect(hasChildren(variableItem)).toBe(false);
    });

    it('should return empty array for VariableItem children', () => {
      const variableItem = new VariableItem({ name: 'test', value: 5 });

      expect(getChildren(variableItem)).toEqual([]);
    });
  });

  describe('parent manipulation', () => {
    it('should add parent to VariableItem', () => {
      const original = new VariableItem({ name: 'test', value: 5 });
      const parent = new Parent({ id: 'parent-1' });

      const updated = addParentToItem(original, parent);

      expect(updated).toBeInstanceOf(VariableItem);
      expect(updated.parents).toHaveLength(1);
      expect(updated.parents[0]).toBe(parent);
      expect((updated as VariableItem).value).toBe(5); // Preserve VariableItem properties
      expect(updated).not.toBe(original); // Immutable
    });

    it('should remove parent from VariableItem by ID', () => {
      const parent1 = new Parent({ id: 'parent-1' });
      const parent2 = new Parent({ id: 'parent-2' });
      const original = new VariableItem({
        name: 'test',
        value: 5,
        parents: [parent1, parent2]
      });

      const updated = removeParentById(original, 'parent-1');

      expect(updated).toBeInstanceOf(VariableItem);
      expect(updated.parents).toHaveLength(1);
      expect(updated.parents[0].id).toBe('parent-2');
      expect((updated as VariableItem).value).toBe(5); // Preserve VariableItem properties
      expect(updated).not.toBe(original); // Immutable
    });

    it('should remove parent from VariableItem by relationship ID', () => {
      const parent1 = new Parent({ id: 'parent-1', relationshipId: 'rel-1' });
      const parent2 = new Parent({ id: 'parent-2', relationshipId: 'rel-2' });
      const original = new VariableItem({
        name: 'test',
        value: 5,
        parents: [parent1, parent2]
      });

      const updated = removeParentByRelationshipId(original, 'rel-1');

      expect(updated).toBeInstanceOf(VariableItem);
      expect(updated.parents).toHaveLength(1);
      expect(updated.parents[0].relationshipId).toBe('rel-2');
      expect((updated as VariableItem).value).toBe(5); // Preserve VariableItem properties
      expect(updated).not.toBe(original); // Immutable
    });
  });

  describe('child manipulation', () => {
    it('should throw error when trying to add child to VariableItem', () => {
      const variableItem = new VariableItem({ name: 'test', value: 5 });
      const child = new Child({ id: 'child-1', start: 0 });

      expect(() => addChildToItem(variableItem, child)).toThrow(
        'Cannot add child of type Child to item of type VariableItem'
      );
    });
  });

  describe('property preservation', () => {
    it('should preserve VariableItem-specific properties during parent operations', () => {
      const original = new VariableItem({
        name: 'test-variable',
        value: 42,
        description: 'Test description',
        allOrNothing: true
      });
      const parent = new Parent({ id: 'parent-1' });

      const withParent = addParentToItem(original, parent);
      const withoutParent = removeParentById(withParent, 'parent-1');

      // Check that VariableItem properties are preserved
      expect((withParent as VariableItem).value).toBe(42);
      expect((withParent as VariableItem).description).toBe('Test description');
      expect((withoutParent as VariableItem).value).toBe(42);
      expect((withoutParent as VariableItem).description).toBe('Test description');

      // Check that base Item properties are preserved
      expect(withParent.name).toBe('test-variable');
      expect(withParent.allOrNothing).toBe(true);
      expect(withoutParent.name).toBe('test-variable');
      expect(withoutParent.allOrNothing).toBe(true);
    });
  });
});
