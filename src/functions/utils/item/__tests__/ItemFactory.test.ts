import { describe, it, expect } from 'vitest';
import { ItemFactory } from '../ItemFactory';
import { BasicItem } from '../BasicItem';
import { SubCalendarItem } from '../SubCalendarItem';
import { CheckListItem } from '../CheckListItem';

describe('ItemFactory', () => {
  describe('fromJSON', () => {
    it('should create BasicItem from JSON', () => {
      const json = {
        id: 'basic-1',
        name: 'test-basic',
        duration: 1000,
        parents: [],
        allOrNothing: false,
        type: 'BasicItem',
        priority: 1
      };

      const item = ItemFactory.fromJSON(json);

      expect(item).toBeInstanceOf(BasicItem);
      expect(item.id).toBe('basic-1');
      expect(item.name).toBe('test-basic');
    });

    it('should create SubCalendarItem from JSON', () => {
      const json = {
        id: 'sub-1',
        name: 'test-sub',
        duration: 2000,
        parents: [],
        allOrNothing: false,
        type: 'SubCalendarItem',
        children: []
      };

      const item = ItemFactory.fromJSON(json);

      expect(item).toBeInstanceOf(SubCalendarItem);
      expect(item.id).toBe('sub-1');
      expect(item.name).toBe('test-sub');
    });

    it('should create CheckListItem from JSON', () => {
      const json = {
        id: 'check-1',
        name: 'test-checklist',
        duration: 3000,
        parents: [],
        allOrNothing: false,
        type: 'CheckListItem',
        children: [],
        sortType: 'manual' as const
      };

      const item = ItemFactory.fromJSON(json);

      expect(item).toBeInstanceOf(CheckListItem);
      expect(item.id).toBe('check-1');
      expect(item.name).toBe('test-checklist');
    });

    it('should default to BasicItem for unknown types', () => {
      const json = {
        id: 'unknown-1',
        name: 'test-unknown',
        duration: 1000,
        parents: [],
        allOrNothing: false,
        type: 'UnknownType'
      };

      const item = ItemFactory.fromJSON(json);

      expect(item).toBeInstanceOf(BasicItem);
      expect(item.id).toBe('unknown-1');
      expect(item.name).toBe('test-unknown');
    });
  });

  describe('fromJSONArray', () => {
    it('should create array of items from JSON array', () => {
      const jsonArray = [
        {
          id: 'sub-1',
          name: 'subcalendar-item',
          duration: 2000,
          parents: [],
          allOrNothing: false,
          type: 'SubCalendarItem',
          children: []
        },
        {
          id: 'basic-1',
          name: 'basic-item',
          duration: 1000,
          parents: [],
          allOrNothing: false,
          type: 'BasicItem'
        }
      ];

      const items = ItemFactory.fromJSONArray(jsonArray);

      expect(items).toHaveLength(2);
      expect(items[0]).toBeInstanceOf(SubCalendarItem);
      expect(items[1]).toBeInstanceOf(BasicItem);
      expect(items[0].id).toBe('sub-1');
      expect(items[1].id).toBe('basic-1');
    });

    it('should handle empty array', () => {
      const items = ItemFactory.fromJSONArray([]);
      expect(items).toEqual([]);
    });
  });
});
