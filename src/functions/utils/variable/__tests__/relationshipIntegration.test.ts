import {
  initializeRelationshipCalculation,
  getRelationshipTracker,
  getVariableSummaryCalculator,
  calculateVariableSummary,
  synchronizeRelationships
} from '../utils';
import { BasicItem } from '../../item/BasicItem';
import { VariableImpl } from '../types';

describe('Relationship-based Variable System Integration', () => {
  beforeEach(() => {
    // Initialize the relationship system
    initializeRelationshipCalculation();

    // Clear any existing relationships
    const tracker = getRelationshipTracker();
    tracker.clear();

    const calculator = getVariableSummaryCalculator();
    calculator.clearCache();
  });

  test('should integrate relationship tracking with variable calculation', () => {
    // Create test items with parent-child relationships
    const recipe = new BasicItem({
      id: 'recipe',
      name: 'Cake Recipe',
      duration: 60
    });

    const flour = new BasicItem({
      id: 'flour',
      name: 'Flour',
      duration: 0,
      parents: [{ id: 'recipe', relationshipId: 'rel-flour' }]
    });

    const sugar = new BasicItem({
      id: 'sugar',
      name: 'Sugar',
      duration: 0,
      parents: [{ id: 'recipe', relationshipId: 'rel-sugar' }]
    });

    const items = [recipe, flour, sugar];

    // Create variable map
    const variableMap = new Map([
      ['recipe', [new VariableImpl({ name: 'servings', quantity: 8 })]],
      ['flour', [new VariableImpl({ name: 'flour', quantity: 2, unit: 'cups' })]],
      ['sugar', [new VariableImpl({ name: 'sugar', quantity: 1, unit: 'cup' })]]
    ]);

    // Synchronize relationships from items
    const relationshipsCreated = synchronizeRelationships(items);
    expect(relationshipsCreated).toBe(2);

    // Get the tracker and update multipliers
    const tracker = getRelationshipTracker();
    tracker.updateRelationshipMultiplier('rel-flour', 2); // Double flour
    tracker.updateRelationshipMultiplier('rel-sugar', 1.5); // 1.5x sugar

    // Calculate summary using relationship-based calculation
    const summary = calculateVariableSummary(recipe, items, variableMap);

    expect(summary).toEqual({
      servings: { quantity: 8 },
      flour: { quantity: 4, unit: 'cups' }, // 2 * 2 cups
      sugar: { quantity: 1.5, unit: 'cup' }  // 1.5 * 1 cup
    });
  });

  test('should handle complex hierarchical relationships', () => {
    // Create a 3-level hierarchy: meal -> recipe -> ingredients
    const meal = new BasicItem({ id: 'meal', name: 'Dinner', duration: 120 });
    const recipe = new BasicItem({
      id: 'recipe',
      name: 'Main Course',
      duration: 60,
      parents: [{ id: 'meal', relationshipId: 'rel-meal-recipe' }]
    });
    const ingredient = new BasicItem({
      id: 'ingredient',
      name: 'Chicken',
      duration: 0,
      parents: [{ id: 'recipe', relationshipId: 'rel-recipe-ingredient' }]
    });

    const items = [meal, recipe, ingredient];

    const variableMap = new Map([
      ['meal', [new VariableImpl({ name: 'calories', quantity: 100 })]],
      ['recipe', [new VariableImpl({ name: 'protein', quantity: 20, unit: 'g' })]],
      ['ingredient', [new VariableImpl({ name: 'fat', quantity: 5, unit: 'g' })]]
    ]);

    // Synchronize relationships
    synchronizeRelationships(items);

    // Set multipliers for a larger meal
    const tracker = getRelationshipTracker();
    tracker.updateRelationshipMultiplier('rel-meal-recipe', 2); // 2 servings of recipe
    tracker.updateRelationshipMultiplier('rel-recipe-ingredient', 3); // 3 pieces of chicken per recipe

    const summary = calculateVariableSummary(meal, items, variableMap);

    expect(summary).toEqual({
      calories: { quantity: 100 },
      protein: { quantity: 40, unit: 'g' }, // 2 * 20g
      fat: { quantity: 30, unit: 'g' }      // 2 * 3 * 5g
    });
  });

  test('should fallback to legacy calculation when relationship system fails', () => {
    const item = new BasicItem({ id: 'test', name: 'Test Item', duration: 30 });
    const items = [item];
    const variableMap = new Map([
      ['test', [new VariableImpl({ name: 'value', quantity: 42 })]]
    ]);

    // Calculate without any relationships - should use direct variables only
    const summary = calculateVariableSummary(item, items, variableMap);

    expect(summary).toEqual({
      value: { quantity: 42 }
    });
  });

  test('should provide accurate metrics for relationship system', () => {
    const items = [
      new BasicItem({ id: 'parent1', name: 'Parent 1', duration: 60 }),
      new BasicItem({
        id: 'child1',
        name: 'Child 1',
        duration: 30,
        parents: [{ id: 'parent1', relationshipId: 'rel1' }]
      }),
      new BasicItem({
        id: 'child2',
        name: 'Child 2',
        duration: 30,
        parents: [{ id: 'parent1', relationshipId: 'rel2' }]
      })
    ];

    synchronizeRelationships(items);

    const tracker = getRelationshipTracker();
    const metrics = tracker.getMetrics();

    expect(metrics.totalRelationships).toBe(2);
    expect(metrics.averageChildrenPerParent).toBe(2);
    expect(metrics.averageParentsPerChild).toBe(1);
    expect(metrics.circularReferences).toBe(0);
  });

  test('should handle variable calculation with cache efficiency', () => {
    const items = [
      new BasicItem({ id: 'parent', name: 'Parent', duration: 60 }),
      new BasicItem({
        id: 'child',
        name: 'Child',
        duration: 30,
        parents: [{ id: 'parent', relationshipId: 'rel1' }]
      })
    ];

    const variableMap = new Map([
      ['parent', [new VariableImpl({ name: 'cost', quantity: 10 })]],
      ['child', [new VariableImpl({ name: 'materials', quantity: 5 })]]
    ]);

    synchronizeRelationships(items);

    const calculator = getVariableSummaryCalculator();

    // Calculate multiple times to test caching
    const summary1 = calculateVariableSummary(items[0], items, variableMap);
    const summary2 = calculateVariableSummary(items[0], items, variableMap);

    expect(summary1).toEqual(summary2);

    const stats = calculator.getCacheStats();
    expect(stats.hitRate).toBeGreaterThan(0);
  });
});
