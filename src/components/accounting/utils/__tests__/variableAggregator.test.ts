import { describe, it, expect, beforeEach } from 'vitest';
import {
  VariableAggregator,
  collectVariablesFromHierarchy,
  deduplicateVariables,
  analyzeVariableCategories,
  validateVariableHierarchy,
  groupVariablesByUnit
} from '../variableAggregator';
import { ItemInstanceImpl } from '../../../../functions/utils/itemInstance/types';
import { BasicItem } from '../../../../functions/utils/item/BasicItem';
import { SubCalendarItem } from '../../../../functions/utils/item/SubCalendarItem';
import { CheckListItem } from '../../../../functions/utils/item/CheckListItem';
import { VariableImpl } from '../../../../functions/utils/variable/types';
import { Child } from '../../../../functions/utils/item/Child';
import { CheckListChild } from '../../../../functions/utils/item/CheckListChild';

describe('Variable Aggregator', () => {
  let basicItems: BasicItem[];
  let subCalendarItems: SubCalendarItem[];
  let checkListItems: CheckListItem[];
  let instances: ItemInstanceImpl[];
  let itemVariables: Map<string, VariableImpl[]>;

  beforeEach(() => {
    // Create test items with hierarchical relationships
    basicItems = [
      new BasicItem({ id: 'basic1', name: 'Basic Task 1', duration: 5000 }),
      new BasicItem({ id: 'basic2', name: 'Basic Task 2', duration: 10000 }),
      new BasicItem({ id: 'basic3', name: 'Basic Task 3', duration: 7500 })
    ];

    // Create SubCalendar that contains basic items
    subCalendarItems = [
      new SubCalendarItem({
        id: 'sub1',
        name: 'SubCalendar 1',
        duration: 20000,
        children: [
          new Child({ id: 'basic1', start: 0, relationshipId: 'rel1' }),
          new Child({ id: 'basic2', start: 5000, relationshipId: 'rel2' })
        ]
      })
    ];

    // Create CheckList that contains basic items
    checkListItems = [
      new CheckListItem({
        id: 'check1',
        name: 'CheckList 1',
        duration: 15000,
        children: [
          new CheckListChild({ itemId: 'basic3', relationshipId: 'rel3' })
        ]
      })
    ];

    instances = [
      new ItemInstanceImpl({
        id: 'inst1',
        itemId: 'basic1',
        calendarEntryId: 'cal1',
        scheduledStartTime: Date.now() - 100000,
        isComplete: true
      }),
      new ItemInstanceImpl({
        id: 'inst2',
        itemId: 'basic2',
        calendarEntryId: 'cal2',
        scheduledStartTime: Date.now() - 90000,
        isComplete: true
      }),
      new ItemInstanceImpl({
        id: 'inst3',
        itemId: 'sub1',
        calendarEntryId: 'cal3',
        scheduledStartTime: Date.now() - 80000,
        isComplete: true
      })
    ];

    // Create variables with various categories and units
    itemVariables = new Map([
      ['basic1', [
        new VariableImpl({ name: 'Hours', quantity: 2.5, unit: 'hours', category: 'Time' }),
        new VariableImpl({ name: 'Quality', quantity: 8, unit: 'points', category: 'Assessment' }),
        new VariableImpl({ name: 'Focus', quantity: 7, unit: 'points', category: 'Assessment' })
      ]],
      ['basic2', [
        new VariableImpl({ name: 'Hours', quantity: 1.5, unit: 'hours', category: 'Time' }),
        new VariableImpl({ name: 'Difficulty', quantity: 6, unit: 'points', category: 'Assessment' }),
        new VariableImpl({ name: 'Lines of Code', quantity: 150, unit: 'lines', category: 'Development' })
      ]],
      ['basic3', [
        new VariableImpl({ name: 'Hours', quantity: 0.5, unit: 'hours', category: 'Time' }),
        new VariableImpl({ name: 'Bug Fixes', quantity: 3, unit: 'fixes', category: 'Development' })
      ]],
      ['sub1', [
        new VariableImpl({ name: 'Complexity', quantity: 9, unit: 'points', category: 'Assessment' }),
        new VariableImpl({ name: 'Team Size', quantity: 4, unit: 'people', category: 'Resources' })
      ]],
      ['check1', [
        new VariableImpl({ name: 'Items Checked', quantity: 12, unit: 'items', category: 'Progress' })
      ]]
    ]);
  });

  describe('VariableAggregator', () => {
    it('collects variables from item hierarchy', () => {
      const allItems = [...basicItems, ...subCalendarItems, ...checkListItems];
      const aggregator = new VariableAggregator(allItems, itemVariables);

      const variables = aggregator.collectVariablesFromItem('sub1');

      // Should include variables from sub1 itself plus its children (basic1, basic2)
      expect(variables.length).toBeGreaterThan(0);

      // Check that we get variables from parent and children
      const variableNames = variables.map(v => v.name);
      expect(variableNames).toContain('Complexity'); // From sub1
      expect(variableNames).toContain('Team Size'); // From sub1
      expect(variableNames).toContain('Hours'); // From basic1 and basic2
      expect(variableNames).toContain('Quality'); // From basic1
    });

    it('prevents infinite recursion with circular references', () => {
      // Create items with potential circular reference
      const circularItems = [
        new BasicItem({ id: 'item1', name: 'Item 1', duration: 1000 }),
        new SubCalendarItem({
          id: 'item2',
          name: 'Item 2',
          duration: 2000,
          children: [new Child({ id: 'item1', start: 0, relationshipId: 'rel1' })]
        })
      ];

      const circularVariables = new Map([
        ['item1', [new VariableImpl({ name: 'Var1', quantity: 1 })]],
        ['item2', [new VariableImpl({ name: 'Var2', quantity: 2 })]]
      ]);

      const aggregator = new VariableAggregator(circularItems, circularVariables);

      // This should not hang or throw an error
      expect(() => {
        const variables = aggregator.collectVariablesFromItem('item2');
        expect(variables.length).toBeGreaterThan(0);
      }).not.toThrow();
    });

    it('limits recursion depth to prevent stack overflow', () => {
      // Create a deep hierarchy (more than 10 levels)
      const deepItems = Array.from({ length: 15 }, (_, i) =>
        new SubCalendarItem({
          id: `item${i}`,
          name: `Item ${i}`,
          duration: 1000,
          children: i < 14 ? [new Child({ id: `item${i + 1}`, start: 0, relationshipId: `rel${i}` })] : []
        })
      );

      const deepVariables = new Map(
        deepItems.map(item => [item.id, [new VariableImpl({ name: 'Depth', quantity: 1 })]])
      );

      const aggregator = new VariableAggregator(deepItems, deepVariables);

      // Should not collect variables beyond depth limit
      const variables = aggregator.collectVariablesFromItem('item0');
      expect(variables.length).toBeLessThanOrEqual(11); // Max depth + 1
    });

    it('resets state correctly between calls', () => {
      const allItems = [...basicItems, ...subCalendarItems];
      const aggregator = new VariableAggregator(allItems, itemVariables);

      const firstCall = aggregator.collectVariablesFromItem('sub1');
      aggregator.reset();
      const secondCall = aggregator.collectVariablesFromItem('sub1');

      expect(firstCall).toEqual(secondCall);
    });
  });

  describe('collectVariablesFromHierarchy', () => {
    it('is a convenience function that works correctly', () => {
      const allItems = [...basicItems, ...subCalendarItems];
      const variables = collectVariablesFromHierarchy('sub1', allItems, itemVariables);

      expect(variables.length).toBeGreaterThan(0);
      const variableNames = variables.map(v => v.name);
      expect(variableNames).toContain('Complexity');
      expect(variableNames).toContain('Hours');
    });
  });

  describe('deduplicateVariables', () => {
    it('merges variables with same name, unit, and category', () => {
      const variables = [
        new VariableImpl({ name: 'Hours', quantity: 2.5, unit: 'hours', category: 'Time' }),
        new VariableImpl({ name: 'Hours', quantity: 1.5, unit: 'hours', category: 'Time' }),
        new VariableImpl({ name: 'Points', quantity: 5, unit: 'points', category: 'Score' }),
        new VariableImpl({ name: 'Hours', quantity: 1.0, unit: 'hours', category: 'Time' })
      ];

      const deduplicated = deduplicateVariables(variables);

      expect(deduplicated).toHaveLength(2); // Hours and Points

      const hoursVar = deduplicated.find(v => v.name === 'Hours');
      expect(hoursVar?.quantity).toBe(5.0); // 2.5 + 1.5 + 1.0

      const pointsVar = deduplicated.find(v => v.name === 'Points');
      expect(pointsVar?.quantity).toBe(5);
    });

    it('treats variables with different units as separate', () => {
      const variables = [
        new VariableImpl({ name: 'Count', quantity: 10, unit: 'items' }),
        new VariableImpl({ name: 'Count', quantity: 5, unit: 'points' }),
        new VariableImpl({ name: 'Count', quantity: 3 }) // No unit
      ];

      const deduplicated = deduplicateVariables(variables);
      expect(deduplicated).toHaveLength(3); // All treated as separate
    });

    it('treats variables with different categories as separate', () => {
      const variables = [
        new VariableImpl({ name: 'Quality', quantity: 8, category: 'Assessment' }),
        new VariableImpl({ name: 'Quality', quantity: 6, category: 'Product' }),
        new VariableImpl({ name: 'Quality', quantity: 4 }) // No category
      ];

      const deduplicated = deduplicateVariables(variables);
      expect(deduplicated).toHaveLength(3);
    });

    it('handles empty input', () => {
      const deduplicated = deduplicateVariables([]);
      expect(deduplicated).toHaveLength(0);
    });
  });

  describe('analyzeVariableCategories', () => {
    it('groups variables by category correctly', () => {
      const variables = [
        new VariableImpl({ name: 'Hours', quantity: 2.5, category: 'Time' }),
        new VariableImpl({ name: 'Quality', quantity: 8, category: 'Assessment' }),
        new VariableImpl({ name: 'Difficulty', quantity: 6, category: 'Assessment' }),
        new VariableImpl({ name: 'Speed', quantity: 4 }) // No category (becomes 'Uncategorized')
      ];

      const analysis = analyzeVariableCategories(variables);

      expect(analysis.totalCategories).toBe(3); // Time, Assessment, Uncategorized
      expect(analysis.totalVariables).toBe(4);
      expect(analysis.totalQuantity).toBe(20.5);

      // Categories should be sorted by total quantity
      expect(analysis.categories[0].totalQuantity).toBeGreaterThanOrEqual(
        analysis.categories[1].totalQuantity
      );

      const assessmentCategory = analysis.categories.find(c => c.name === 'Assessment');
      expect(assessmentCategory?.count).toBe(2);
      expect(assessmentCategory?.totalQuantity).toBe(14); // 8 + 6
    });

    it('identifies most used category', () => {
      const variables = [
        new VariableImpl({ name: 'Var1', quantity: 10, category: 'Category A' }),
        new VariableImpl({ name: 'Var2', quantity: 5, category: 'Category B' }),
        new VariableImpl({ name: 'Var3', quantity: 15, category: 'Category A' })
      ];

      const analysis = analyzeVariableCategories(variables);
      expect(analysis.mostUsedCategory).toBe('Category A'); // Higher total quantity
    });

    it('handles variables without categories', () => {
      const variables = [
        new VariableImpl({ name: 'Var1', quantity: 5 }),
        new VariableImpl({ name: 'Var2', quantity: 3 })
      ];

      const analysis = analyzeVariableCategories(variables);
      expect(analysis.totalCategories).toBe(1);
      expect(analysis.mostUsedCategory).toBe('Uncategorized');
    });
  });

  describe('validateVariableHierarchy', () => {
    it('detects orphaned instances', () => {
      const orphanedInstances = [
        new ItemInstanceImpl({
          id: 'orphan1',
          itemId: 'nonexistent',
          calendarEntryId: 'cal1',
          scheduledStartTime: Date.now(),
          isComplete: true
        })
      ];

      const result = validateVariableHierarchy(orphanedInstances, basicItems, itemVariables);

      expect(result.isValid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0]).toContain('nonexistent');
    });

    it('detects variables with invalid quantities', () => {
      const invalidVariables = new Map([
        ['basic1', [
          new VariableImpl({ name: 'Invalid', quantity: -5 }),
          new VariableImpl({ name: 'Infinite', quantity: Infinity }),
          new VariableImpl({ name: 'NaN', quantity: NaN })
        ]]
      ]);

      const result = validateVariableHierarchy(instances, basicItems, invalidVariables);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('invalid quantities'))).toBe(true);
    });

    it('detects unusually large quantities', () => {
      const largeVariables = new Map([
        ['basic1', [
          new VariableImpl({ name: 'Large', quantity: 50000 })
        ]]
      ]);

      const result = validateVariableHierarchy(instances, basicItems, largeVariables);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('unusually large quantities'))).toBe(true);
    });

    it('detects duplicate variable names within items', () => {
      const duplicateVariables = new Map([
        ['basic1', [
          new VariableImpl({ name: 'Duplicate', quantity: 5 }),
          new VariableImpl({ name: 'Duplicate', quantity: 3 }),
          new VariableImpl({ name: 'Unique', quantity: 1 })
        ]]
      ]);

      const result = validateVariableHierarchy(instances, basicItems, duplicateVariables);

      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('duplicate variable names'))).toBe(true);
    });

    it('passes validation with clean data', () => {
      const result = validateVariableHierarchy(instances, [...basicItems, ...subCalendarItems], itemVariables);

      expect(result.isValid).toBe(true);
      expect(result.issues).toHaveLength(0);
      expect(result.summary.itemsChecked).toBe(instances.length);
    });
  });

  describe('groupVariablesByUnit', () => {
    it('groups variables by unit correctly', () => {
      const variables = [
        new VariableImpl({ name: 'Time1', quantity: 2.5, unit: 'hours' }),
        new VariableImpl({ name: 'Time2', quantity: 1.5, unit: 'hours' }),
        new VariableImpl({ name: 'Score1', quantity: 85, unit: 'points' }),
        new VariableImpl({ name: 'Score2', quantity: 92, unit: 'points' }),
        new VariableImpl({ name: 'Count', quantity: 10 }) // No unit
      ];

      const grouping = groupVariablesByUnit(variables);

      expect(grouping.totalUnits).toBe(3); // hours, points, No Unit
      expect(grouping.unitsWithoutUnit).toBe(1);

      const hoursUnit = grouping.units.find(u => u.unit === 'hours');
      expect(hoursUnit?.count).toBe(2);
      expect(hoursUnit?.totalQuantity).toBe(4.0);

      const pointsUnit = grouping.units.find(u => u.unit === 'points');
      expect(pointsUnit?.count).toBe(2);
      expect(pointsUnit?.totalQuantity).toBe(177);
    });

    it('identifies most common unit', () => {
      const variables = [
        new VariableImpl({ name: 'A', quantity: 1, unit: 'hours' }),
        new VariableImpl({ name: 'B', quantity: 2, unit: 'hours' }),
        new VariableImpl({ name: 'C', quantity: 3, unit: 'hours' }),
        new VariableImpl({ name: 'D', quantity: 4, unit: 'points' })
      ];

      const grouping = groupVariablesByUnit(variables);
      expect(grouping.mostCommonUnit).toBe('hours'); // 3 occurrences vs 1
    });

    it('sorts units by count', () => {
      const variables = [
        new VariableImpl({ name: 'A', quantity: 1, unit: 'rare' }),
        new VariableImpl({ name: 'B', quantity: 2, unit: 'common' }),
        new VariableImpl({ name: 'C', quantity: 3, unit: 'common' }),
        new VariableImpl({ name: 'D', quantity: 4, unit: 'common' })
      ];

      const grouping = groupVariablesByUnit(variables);
      expect(grouping.units[0].unit).toBe('common'); // Most frequent first
      expect(grouping.units[1].unit).toBe('rare');
    });

    it('handles empty input', () => {
      const grouping = groupVariablesByUnit([]);
      expect(grouping.totalUnits).toBe(0);
      expect(grouping.mostCommonUnit).toBe('None');
      expect(grouping.unitsWithoutUnit).toBe(0);
    });
  });
});
