import { renderHook, act } from '@testing-library/react';
import { useRelationshipBasedSummary } from '../useRelationshipBasedSummary';
import { BasicItem } from '../../functions/utils/item/BasicItem';

describe('useRelationshipBasedSummary', () => {
  let items: BasicItem[];
  let variableMap: Map<string, Array<{
    name: string;
    quantity: number;
    unit?: string;
    category?: string;
  }>>;

  beforeEach(() => {
    items = [
      new BasicItem({ id: 'item1', name: 'Recipe', duration: 60 }),
      new BasicItem({ id: 'item2', name: 'Ingredient A', duration: 0 }),
      new BasicItem({ id: 'item3', name: 'Ingredient B', duration: 0 })
    ];

    variableMap = new Map([
      ['item1', [{ name: 'calories', quantity: 100 }]],
      ['item2', [{ name: 'flour', quantity: 2, unit: 'cups' }]],
      ['item3', [{ name: 'sugar', quantity: 1, unit: 'cup' }]]
    ]);
  });

  test('should initialize with relationship tracker and calculator', () => {
    const { result } = renderHook(() => useRelationshipBasedSummary());

    expect(result.current.relationshipTracker).toBeDefined();
    expect(result.current.calculator).toBeDefined();
    expect(result.current.updater).toBeDefined();
  });

  test('should calculate basic variable summary', () => {
    const { result } = renderHook(() => useRelationshipBasedSummary());

    const summary = result.current.calculateSummary(items[0], items, variableMap);

    expect(summary).toEqual({
      calories: { quantity: 100 }
    });
  });

  test('should create and manage relationships', () => {
    const { result } = renderHook(() => useRelationshipBasedSummary());

    act(() => {
      result.current.createRelationship('rel1', 'item1', 'item2', 2);
    });

    const childRelationships = result.current.getChildRelationships('item1');
    expect(childRelationships).toHaveLength(1);
    expect(childRelationships[0].relationshipId).toBe('rel1');
    expect(childRelationships[0].multiplier).toBe(2);

    const parentRelationships = result.current.getParentRelationships('item2');
    expect(parentRelationships).toHaveLength(1);
    expect(parentRelationships[0].relationshipId).toBe('rel1');
  });

  test('should calculate summary with relationships', () => {
    const { result } = renderHook(() => useRelationshipBasedSummary());

    act(() => {
      result.current.createRelationship('rel1', 'item1', 'item2', 2);
      result.current.createRelationship('rel2', 'item1', 'item3', 1);
    });

    const summary = result.current.calculateSummary(items[0], items, variableMap);

    expect(summary).toEqual({
      calories: { quantity: 100 },
      flour: { quantity: 4, unit: 'cups' }, // 2 * 2 cups
      sugar: { quantity: 1, unit: 'cup' }   // 1 * 1 cup
    });
  });

  test('should remove relationships', () => {
    const { result } = renderHook(() => useRelationshipBasedSummary());

    act(() => {
      result.current.createRelationship('rel1', 'item1', 'item2', 2);
      result.current.createRelationship('rel2', 'item1', 'item3', 1);
    });

    let childRelationships = result.current.getChildRelationships('item1');
    expect(childRelationships).toHaveLength(2);

    act(() => {
      const removed = result.current.removeRelationship('rel1');
      expect(removed).toBe(true);
    });

    childRelationships = result.current.getChildRelationships('item1');
    expect(childRelationships).toHaveLength(1);
    expect(childRelationships[0].relationshipId).toBe('rel2');
  });

  test('should get relationship summary with contributions', () => {
    const { result } = renderHook(() => useRelationshipBasedSummary());

    act(() => {
      result.current.createRelationship('rel1', 'item1', 'item2', 2);
    });

    const relationshipSummary = result.current.getRelationshipSummary(items[0], items, variableMap);

    expect(relationshipSummary.itemId).toBe('item1');
    expect(relationshipSummary.directVariables).toEqual({
      calories: { quantity: 100 }
    });
    expect(relationshipSummary.totalSummary).toEqual({
      calories: { quantity: 100 },
      flour: { quantity: 4, unit: 'cups' }
    });
  });

  test('should initialize relationships from items', () => {
    const { result } = renderHook(() => useRelationshipBasedSummary());

    // Add parent references to items
    const itemWithParents = new BasicItem({
      id: 'child',
      name: 'Child Item',
      duration: 30,
      parents: [
        { id: 'parent1', relationshipId: 'rel1' },
        { id: 'parent2', relationshipId: 'rel2' }
      ]
    });

    const allItems = [...items, itemWithParents];

    act(() => {
      const count = result.current.initializeFromItems(allItems);
      expect(count).toBe(2);
    });

    const parentRelationships = result.current.getParentRelationships('child');
    expect(parentRelationships).toHaveLength(2);
  });

  test('should provide cache statistics', () => {
    const { result } = renderHook(() => useRelationshipBasedSummary());

    act(() => {
      result.current.createRelationship('rel1', 'item1', 'item2', 1);
    });

    // Trigger some calculations to populate cache
    result.current.calculateSummary(items[0], items, variableMap);
    result.current.calculateSummary(items[1], items, variableMap);

    const stats = result.current.getCacheStats();
    expect(stats.size).toBeGreaterThanOrEqual(0);
    expect(stats.relationshipCacheSize).toBeGreaterThanOrEqual(0);
    expect(stats.relationshipMetrics).toBeDefined();
  });

  test('should clear caches', () => {
    const { result } = renderHook(() => useRelationshipBasedSummary());

    act(() => {
      result.current.createRelationship('rel1', 'item1', 'item2', 1);
    });

    // Populate caches
    result.current.calculateSummary(items[0], items, variableMap);
    result.current.getRelationshipSummary(items[0], items, variableMap);

    act(() => {
      result.current.clearCaches();
    });

    const stats = result.current.getCacheStats();
    expect(stats.size).toBe(0);
    expect(stats.relationshipCacheSize).toBe(0);
  });

  test('should validate relationships', () => {
    const { result } = renderHook(() => useRelationshipBasedSummary());

    act(() => {
      result.current.createRelationship('rel1', 'item1', 'item2', 1);
      result.current.createRelationship('rel2', 'item1', 'item3', 1);
    });

    const metrics = result.current.validateRelationships();
    expect(metrics.totalRelationships).toBe(2);
    expect(metrics.circularReferences).toBe(0);
  });

  test('should get performance metrics', () => {
    const { result } = renderHook(() => useRelationshipBasedSummary());

    act(() => {
      result.current.createRelationship('rel1', 'item1', 'item2', 1);
    });

    // Trigger calculation to generate metrics
    result.current.calculateSummary(items[0], items, variableMap);

    const metrics = result.current.getPerformanceMetrics();
    expect(metrics.calculationTime).toBeGreaterThanOrEqual(0);
    expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0);
  });
});
