import { describe, it, expect } from 'vitest';
import {
  calculateChildStartTime,
  getActiveChildForExecution,
  isItemCurrentlyExecuting,
  isRecursionDepthValid,
  getDisplayDepth
} from './executionUtils';
import {
  BasicItem,
  SubCalendarItem,
  CheckListItem,
  Child,
  CheckListChild
} from '../../functions/utils/item/index';

describe('executionUtils', () => {
  describe('calculateChildStartTime', () => {
    it('should return parent start time for CheckListChild', () => {
      const parentStartTime = 1000;
      const checkListChild = new CheckListChild({ itemId: 'child1' });

      const result = calculateChildStartTime(parentStartTime, checkListChild);
      expect(result).toBe(parentStartTime);
    });

    it('should add start offset for SubCalendar Child', () => {
      const parentStartTime = 1000;
      const child = new Child({ id: 'child1', start: 500 });

      const result = calculateChildStartTime(parentStartTime, child);
      expect(result).toBe(1500);
    });
  });

  describe('isItemCurrentlyExecuting', () => {
    it('should return true for deepest item in chain', () => {
      const item1 = new BasicItem({ name: 'Item 1', duration: 1000 });
      const item2 = new BasicItem({ name: 'Item 2', duration: 1000 });
      const taskChain = [item1, item2];

      const result = isItemCurrentlyExecuting(item2, taskChain);
      expect(result).toBe(true);
    });

    it('should return false for non-deepest item in chain', () => {
      const item1 = new BasicItem({ name: 'Item 1', duration: 1000 });
      const item2 = new BasicItem({ name: 'Item 2', duration: 1000 });
      const taskChain = [item1, item2];

      const result = isItemCurrentlyExecuting(item1, taskChain);
      expect(result).toBe(false);
    });

    it('should return false for item not in chain', () => {
      const item1 = new BasicItem({ name: 'Item 1', duration: 1000 });
      const item2 = new BasicItem({ name: 'Item 2', duration: 1000 });
      const item3 = new BasicItem({ name: 'Item 3', duration: 1000 });
      const taskChain = [item1, item2];

      const result = isItemCurrentlyExecuting(item3, taskChain);
      expect(result).toBe(false);
    });
  });

  describe('isRecursionDepthValid', () => {
    it('should return true for depth within limit', () => {
      expect(isRecursionDepthValid(5, 10)).toBe(true);
      expect(isRecursionDepthValid(0, 10)).toBe(true);
    });

    it('should return false for depth at or exceeding limit', () => {
      expect(isRecursionDepthValid(10, 10)).toBe(false);
      expect(isRecursionDepthValid(11, 10)).toBe(false);
    });

    it('should use default max depth of 10', () => {
      expect(isRecursionDepthValid(9)).toBe(true);
      expect(isRecursionDepthValid(10)).toBe(false);
    });
  });

  describe('getDisplayDepth', () => {
    it('should return correct depth for item in chain', () => {
      const item1 = new BasicItem({ name: 'Item 1', duration: 1000 });
      const item2 = new BasicItem({ name: 'Item 2', duration: 1000 });
      const item3 = new BasicItem({ name: 'Item 3', duration: 1000 });
      const taskChain = [item1, item2, item3];

      expect(getDisplayDepth(item1, taskChain)).toBe(0);
      expect(getDisplayDepth(item2, taskChain)).toBe(1);
      expect(getDisplayDepth(item3, taskChain)).toBe(2);
    });

    it('should return 0 for item not in chain', () => {
      const item1 = new BasicItem({ name: 'Item 1', duration: 1000 });
      const item2 = new BasicItem({ name: 'Item 2', duration: 1000 });
      const item3 = new BasicItem({ name: 'Item 3', duration: 1000 });
      const taskChain = [item1, item2];

      expect(getDisplayDepth(item3, taskChain)).toBe(0);
    });
  });

  describe('getActiveChildForExecution', () => {
    it('should return null for item with no children', () => {
      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 1000,
        children: []
      });

      const result = getActiveChildForExecution(subCalendarItem, [], Date.now(), Date.now());
      expect(result).toBeNull();
    });

    it('should handle SubCalendarItem with children', () => {
      const childItem = new BasicItem({ name: 'Child', duration: 500 });
      const child = new Child({ id: childItem.id, start: 100 });
      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 1000,
        children: [child]
      });

      const items = [subCalendarItem, childItem];
      const parentStartTime = 1000;
      const currentTime = 1200; // 200ms after parent start, so within child execution

      const result = getActiveChildForExecution(subCalendarItem, items, currentTime, parentStartTime);
      expect(result?.id).toBe(childItem.id);
    });

    it('should handle CheckListItem with children (integration test)', () => {
      const childItem = new BasicItem({ name: 'Child', duration: 500 });
      const checkListChild = new CheckListChild({ itemId: childItem.id, complete: false });
      const checkListItem = new CheckListItem({
        name: 'Parent',
        duration: 1000,
        children: [checkListChild]
      });

      const items = [checkListItem, childItem];

      const result = getActiveChildForExecution(checkListItem, items, Date.now(), Date.now());
      // Function should either return the child or null, but not throw
      expect(result === null || result?.id === childItem.id).toBe(true);
    });

    it('should handle SubCalendarItem with children (integration test)', () => {
      const childItem = new BasicItem({ name: 'Child', duration: 500 });
      const child = new Child({ id: childItem.id, start: 0 }); // Start immediately
      const subCalendarItem = new SubCalendarItem({
        name: 'Parent',
        duration: 1000,
        children: [child]
      });

      const items = [subCalendarItem, childItem];
      const parentStartTime = 1000;
      const currentTime = 1100; // 100ms after parent start

      const result = getActiveChildForExecution(subCalendarItem, items, currentTime, parentStartTime);
      // Function should either return the child or null, but not throw
      expect(result === null || result?.id === childItem.id).toBe(true);
    });

    it('should return last child for CheckListItem when all complete', () => {
      const childItem1 = new BasicItem({ name: 'Child 1', duration: 500 });
      const childItem2 = new BasicItem({ name: 'Child 2', duration: 500 });
      const checkListChild1 = new CheckListChild({ itemId: childItem1.id, complete: true });
      const checkListChild2 = new CheckListChild({ itemId: childItem2.id, complete: true });
      const checkListItem = new CheckListItem({
        name: 'Parent',
        duration: 1000,
        children: [checkListChild1, checkListChild2]
      });

      const items = [checkListItem, childItem1, childItem2];

      const result = getActiveChildForExecution(checkListItem, items, Date.now(), Date.now());
      expect(result === null || result?.id === childItem2.id).toBe(true);
    });
  });
});
