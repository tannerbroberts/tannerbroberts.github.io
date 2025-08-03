import { describe, it, expect } from 'vitest';
import { BasicItem } from '../BasicItem';
import { SubCalendarItem } from '../SubCalendarItem';
import { Child } from '../Child';
import { Parent } from '../Parent';
import {
  setVariableOnItem,
  calculateVariableSummary,
  propagateVariableUpdates,
  getTotalVariableQuantity,
  getAllVariableNames,
  hasVariable
} from '../itemUtils';

describe('Variable utilities', () => {
  describe('setVariableOnItem', () => {
    it('should add a variable to a BasicItem', () => {
      const item = new BasicItem({ name: 'Test Item', duration: 1000 });
      const updated = setVariableOnItem(item, 'apples', 5);

      expect(updated.variables['apples']).toBe(5);
      expect(updated.id).toBe(item.id); // Same item, just updated
      expect(updated.name).toBe(item.name);
    });

    it('should update an existing variable', () => {
      const item = new BasicItem({
        name: 'Test Item',
        duration: 1000,
        variables: { apples: 3, oranges: 2 }
      });
      const updated = setVariableOnItem(item, 'apples', 7);

      expect(updated.variables['apples']).toBe(7);
      expect(updated.variables['oranges']).toBe(2); // Other variables preserved
    });
  });

  describe('calculateVariableSummary', () => {
    it('should calculate summary for SubCalendarItem with children', () => {
      // Create child items with variables
      const child1 = new BasicItem({
        id: 'child1',
        name: 'Child 1',
        duration: 500,
        variables: { apples: 3, oranges: 2 }
      });

      const child2 = new BasicItem({
        id: 'child2',
        name: 'Child 2',
        duration: 600,
        variables: { apples: 2, bananas: 1 }
      });

      // Create parent with children
      const parent = new SubCalendarItem({
        name: 'Parent Item',
        duration: 1500,
        variables: { apples: 1 }, // Parent's own variables
        children: [
          new Child({ id: 'child1', start: 0 }),
          new Child({ id: 'child2', start: 500 })
        ]
      });

      const allItems = [parent, child1, child2];
      const summary = calculateVariableSummary(parent, allItems);

      // Summary should aggregate children's variables (not including parent's own)
      expect(summary['apples']).toBe(5); // child1: 3 + child2: 2
      expect(summary['oranges']).toBe(2); // child1: 2
      expect(summary['bananas']).toBe(1); // child2: 1
    });

    it('should return empty summary for BasicItem (no children)', () => {
      const item = new BasicItem({
        name: 'Basic Item',
        duration: 1000,
        variables: { apples: 5 }
      });

      const summary = calculateVariableSummary(item, [item]);
      expect(Object.keys(summary)).toHaveLength(0);
    });
  });

  describe('propagateVariableUpdates', () => {
    it('should propagate updates up parent hierarchy', () => {
      const grandchild = new BasicItem({
        id: 'grandchild',
        name: 'Grandchild',
        duration: 100,
        variables: { apples: 10 }
      });

      const child = new SubCalendarItem({
        id: 'child',
        name: 'Child',
        duration: 500,
        variables: { oranges: 5 },
        children: [new Child({ id: 'grandchild', start: 0 })]
      });

      const parent = new SubCalendarItem({
        id: 'parent',
        name: 'Parent',
        duration: 1000,
        variables: { bananas: 3 },
        children: [new Child({ id: 'child', start: 0 })]
      });

      // Set up parent relationships
      grandchild.parents.push(new Parent({ id: 'child', relationshipId: 'rel1' }));
      child.parents.push(new Parent({ id: 'parent', relationshipId: 'rel2' }));

      const allItems = [grandchild, child, parent];
      const updates = propagateVariableUpdates('grandchild', allItems);

      // Child should have grandchild's apples in summary
      const updatedChild = updates.get('child');
      expect(updatedChild?.variableSummary['apples']).toBe(10);

      // Parent should have child's oranges + grandchild's apples in summary
      const updatedParent = updates.get('parent');
      expect(updatedParent?.variableSummary['oranges']).toBe(5);
      expect(updatedParent?.variableSummary['apples']).toBe(10);
    });
  });

  describe('utility functions', () => {
    const item = new BasicItem({
      name: 'Test Item',
      duration: 1000,
      variables: { apples: 5, oranges: 3 },
      variableSummary: { bananas: 2, apples: 1 } // Some overlap with own variables
    });

    it('getTotalVariableQuantity should sum own + summary', () => {
      expect(getTotalVariableQuantity(item, 'apples')).toBe(6); // 5 + 1
      expect(getTotalVariableQuantity(item, 'oranges')).toBe(3); // 3 + 0
      expect(getTotalVariableQuantity(item, 'bananas')).toBe(2); // 0 + 2
      expect(getTotalVariableQuantity(item, 'nonexistent')).toBe(0);
    });

    it('getAllVariableNames should return unique names', () => {
      const names = getAllVariableNames(item);
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
      expect(sortedNames).toEqual(['apples', 'bananas', 'oranges']);
    });

    it('hasVariable should check both own and summary', () => {
      expect(hasVariable(item, 'apples')).toBe(true);
      expect(hasVariable(item, 'oranges')).toBe(true);
      expect(hasVariable(item, 'bananas')).toBe(true);
      expect(hasVariable(item, 'nonexistent')).toBe(false);
    });
  });
});
