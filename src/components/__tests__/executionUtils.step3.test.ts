import { describe, it, expect } from 'vitest';
import {
  getChildExecutionStatus,
  isInGapPeriod,
  getGapPeriodContext
} from '../execution/executionUtils';
import {
  SubCalendarItem,
  CheckListItem,
  BasicItem,
  Child,
  CheckListChild,
  Item
} from '../../functions/utils/item/index';

describe('Step 3: Enhanced Child Execution Status', () => {
  describe('getChildExecutionStatus', () => {
    describe('SubCalendarItem scenarios', () => {
      it('should return pre-start phase when parent has not started', () => {
        const childItem = new BasicItem({ name: 'Child', duration: 500 });
        const child = new Child({ id: childItem.id, start: 100 });
        const parentItem = new SubCalendarItem({
          name: 'Parent',
          duration: 1000,
          children: [child]
        });

        const items = [parentItem, childItem];
        const parentStartTime = 1000;
        const currentTime = 800; // 200ms before parent starts

        const result = getChildExecutionStatus(parentItem, items, currentTime, parentStartTime);

        expect(result.activeChild).toBeNull();
        expect(result.nextChild).not.toBeNull();
        expect(result.nextChild?.item.id).toBe(childItem.id);
        expect(result.nextChild?.timeUntilStart).toBe(300); // 200 + 100
        expect(result.gapPeriod).toBe(false);
        expect(result.currentPhase).toBe('pre-start');
      });

      it('should return active phase when child is executing', () => {
        const childItem = new BasicItem({ name: 'Child', duration: 500 });
        const child = new Child({ id: childItem.id, start: 100 });
        const parentItem = new SubCalendarItem({
          name: 'Parent',
          duration: 1000,
          children: [child]
        });

        const items = [parentItem, childItem];
        const parentStartTime = 1000;
        const currentTime = 1200; // 200ms after parent start, within child execution

        const result = getChildExecutionStatus(parentItem, items, currentTime, parentStartTime);

        expect(result.activeChild?.id).toBe(childItem.id);
        expect(result.nextChild).toBeNull();
        expect(result.gapPeriod).toBe(false);
        expect(result.currentPhase).toBe('active');
      });

      it('should return gap phase between children', () => {
        const childItem1 = new BasicItem({ name: 'Child 1', duration: 300 });
        const childItem2 = new BasicItem({ name: 'Child 2', duration: 400 });
        const child1 = new Child({ id: childItem1.id, start: 100 });
        const child2 = new Child({ id: childItem2.id, start: 500 });
        const parentItem = new SubCalendarItem({
          name: 'Parent',
          duration: 1000,
          children: [child1, child2]
        });

        const items = [parentItem, childItem1, childItem2];
        const parentStartTime = 1000;
        const currentTime = 1450; // 450ms elapsed, between child1 end (400) and child2 start (500)

        const result = getChildExecutionStatus(parentItem, items, currentTime, parentStartTime);

        expect(result.activeChild).toBeNull();
        expect(result.nextChild?.item.id).toBe(childItem2.id);
        expect(result.nextChild?.timeUntilStart).toBe(50); // 500 - 450
        expect(result.gapPeriod).toBe(true);
        expect(result.currentPhase).toBe('gap');
      });

      it('should return complete phase when all children finished', () => {
        const childItem = new BasicItem({ name: 'Child', duration: 300 });
        const child = new Child({ id: childItem.id, start: 100 });
        const parentItem = new SubCalendarItem({
          name: 'Parent',
          duration: 1000,
          children: [child]
        });

        const items = [parentItem, childItem];
        const parentStartTime = 1000;
        const currentTime = 1500; // 500ms elapsed, past child end (100 + 300 = 400)

        const result = getChildExecutionStatus(parentItem, items, currentTime, parentStartTime);

        expect(result.activeChild).toBeNull();
        expect(result.nextChild).toBeNull();
        expect(result.gapPeriod).toBe(false);
        expect(result.currentPhase).toBe('complete');
      });

      it('should handle multiple children with correct next child detection', () => {
        const childItem1 = new BasicItem({ name: 'Child 1', duration: 200 });
        const childItem2 = new BasicItem({ name: 'Child 2', duration: 300 });
        const childItem3 = new BasicItem({ name: 'Child 3', duration: 400 });
        const child1 = new Child({ id: childItem1.id, start: 0 });
        const child2 = new Child({ id: childItem2.id, start: 250 });
        const child3 = new Child({ id: childItem3.id, start: 600 });
        const parentItem = new SubCalendarItem({
          name: 'Parent',
          duration: 1200,
          children: [child1, child2, child3]
        });

        const items = [parentItem, childItem1, childItem2, childItem3];
        const parentStartTime = 1000;
        const currentTime = 1150; // 150ms elapsed, during child1 execution

        const result = getChildExecutionStatus(parentItem, items, currentTime, parentStartTime);

        expect(result.activeChild?.id).toBe(childItem1.id);
        expect(result.nextChild?.item.id).toBe(childItem2.id);
        expect(result.gapPeriod).toBe(false);
        expect(result.currentPhase).toBe('active');
      });
    });

    describe('CheckListItem scenarios', () => {
      it('should return active child for incomplete checklist item', () => {
        const childItem1 = new BasicItem({ name: 'Child 1', duration: 500 });
        const childItem2 = new BasicItem({ name: 'Child 2', duration: 600 });
        const checkListChild1 = new CheckListChild({ itemId: childItem1.id, complete: true });
        const checkListChild2 = new CheckListChild({ itemId: childItem2.id, complete: false });
        const parentItem = new CheckListItem({
          name: 'Parent',
          duration: 1000,
          children: [checkListChild1, checkListChild2]
        });

        const items = [parentItem, childItem1, childItem2];

        const result = getChildExecutionStatus(parentItem, items, Date.now(), Date.now());

        expect(result.activeChild?.id).toBe(childItem2.id);
        expect(result.nextChild).toBeNull();
        expect(result.gapPeriod).toBe(false);
        expect(result.currentPhase).toBe('active');
      });

      it('should return complete phase when all checklist items are complete', () => {
        const childItem1 = new BasicItem({ name: 'Child 1', duration: 500 });
        const childItem2 = new BasicItem({ name: 'Child 2', duration: 600 });
        const checkListChild1 = new CheckListChild({ itemId: childItem1.id, complete: true });
        const checkListChild2 = new CheckListChild({ itemId: childItem2.id, complete: true });
        const parentItem = new CheckListItem({
          name: 'Parent',
          duration: 1000,
          children: [checkListChild1, checkListChild2]
        });

        const items = [parentItem, childItem1, childItem2];

        const result = getChildExecutionStatus(parentItem, items, Date.now(), Date.now());

        expect(result.activeChild).toBeNull();
        expect(result.nextChild).toBeNull();
        expect(result.gapPeriod).toBe(false);
        expect(result.currentPhase).toBe('complete');
      });

      it('should show next child for checklist with multiple incomplete items', () => {
        const childItem1 = new BasicItem({ name: 'Child 1', duration: 500 });
        const childItem2 = new BasicItem({ name: 'Child 2', duration: 600 });
        const childItem3 = new BasicItem({ name: 'Child 3', duration: 700 });
        const checkListChild1 = new CheckListChild({ itemId: childItem1.id, complete: false });
        const checkListChild2 = new CheckListChild({ itemId: childItem2.id, complete: false });
        const checkListChild3 = new CheckListChild({ itemId: childItem3.id, complete: false });
        const parentItem = new CheckListItem({
          name: 'Parent',
          duration: 1000,
          children: [checkListChild1, checkListChild2, checkListChild3]
        });

        const items = [parentItem, childItem1, childItem2, childItem3];

        const result = getChildExecutionStatus(parentItem, items, Date.now(), Date.now());

        expect(result.activeChild?.id).toBe(childItem1.id);
        expect(result.nextChild?.item.id).toBe(childItem2.id);
        expect(result.gapPeriod).toBe(false);
        expect(result.currentPhase).toBe('active');
      });
    });

    describe('Edge cases', () => {
      it('should handle empty children array', () => {
        const parentItem = new SubCalendarItem({
          name: 'Parent',
          duration: 1000,
          children: []
        });

        const result = getChildExecutionStatus(parentItem, [], Date.now(), Date.now());

        expect(result.activeChild).toBeNull();
        expect(result.nextChild).toBeNull();
        expect(result.gapPeriod).toBe(false);
        expect(result.currentPhase).toBe('complete');
      });

      it('should handle missing child items', () => {
        const child = new Child({ id: 'non-existent-id', start: 100 });
        const parentItem = new SubCalendarItem({
          name: 'Parent',
          duration: 1000,
          children: [child]
        });

        const items: Item[] = [parentItem]; // Missing child item
        const parentStartTime = 1000;
        const currentTime = 1200;

        const result = getChildExecutionStatus(parentItem, items, currentTime, parentStartTime);

        expect(result.activeChild).toBeNull();
        expect(result.nextChild).toBeNull();
        expect(result.gapPeriod).toBe(false);
        expect(result.currentPhase).toBe('complete');
      });
    });
  });

  describe('isInGapPeriod', () => {
    it('should return true when in gap between children', () => {
      const childItem1 = new BasicItem({ name: 'Child 1', duration: 200 });
      const childItem2 = new BasicItem({ name: 'Child 2', duration: 300 });
      const child1 = new Child({ id: childItem1.id, start: 100 });
      const child2 = new Child({ id: childItem2.id, start: 400 });
      const parentItem = new SubCalendarItem({
        name: 'Parent',
        duration: 1000,
        children: [child1, child2]
      });

      const items = [parentItem, childItem1, childItem2];
      const parentStartTime = 1000;
      const currentTime = 1350; // 350ms elapsed, between child1 end (300) and child2 start (400)

      const result = isInGapPeriod(parentItem, items, currentTime, parentStartTime);

      expect(result).toBe(true);
    });

    it('should return false when child is active', () => {
      const childItem = new BasicItem({ name: 'Child', duration: 500 });
      const child = new Child({ id: childItem.id, start: 100 });
      const parentItem = new SubCalendarItem({
        name: 'Parent',
        duration: 1000,
        children: [child]
      });

      const items = [parentItem, childItem];
      const parentStartTime = 1000;
      const currentTime = 1200; // 200ms elapsed, within child execution

      const result = isInGapPeriod(parentItem, items, currentTime, parentStartTime);

      expect(result).toBe(false);
    });
  });

  describe('getGapPeriodContext', () => {
    it('should format context for gap with next child', () => {
      const nextChild = {
        item: new BasicItem({ name: 'Heat Pan', duration: 180000 }),
        timeUntilStart: 90000, // 1m 30s
        startTime: Date.now() + 90000
      };

      const result = getGapPeriodContext(nextChild, 'gap');

      expect(result).toBe('Next: Heat Pan in 1m 30s');
    });

    it('should format context for pre-start phase', () => {
      const nextChild = {
        item: new BasicItem({ name: 'Gather Ingredients', duration: 300000 }),
        timeUntilStart: 120000,
        startTime: Date.now() + 120000
      };

      const result = getGapPeriodContext(nextChild, 'pre-start');

      expect(result).toBe('Preparing to start: Gather Ingredients');
    });

    it('should handle seconds-only countdown', () => {
      const nextChild = {
        item: new BasicItem({ name: 'Flip Pancake', duration: 120000 }),
        timeUntilStart: 45000, // 45 seconds
        startTime: Date.now() + 45000
      };

      const result = getGapPeriodContext(nextChild, 'gap');

      expect(result).toBe('Next: Flip Pancake in 45s');
    });

    it('should handle no next child', () => {
      const result = getGapPeriodContext(null, 'complete');

      expect(result).toBe('All tasks complete');
    });

    it('should handle unknown phase with next child', () => {
      const nextChild = {
        item: new BasicItem({ name: 'Clean Up', duration: 900000 }),
        timeUntilStart: 0,
        startTime: Date.now()
      };

      const result = getGapPeriodContext(nextChild, 'unknown');

      expect(result).toBe('Next: Clean Up');
    });
  });
});
