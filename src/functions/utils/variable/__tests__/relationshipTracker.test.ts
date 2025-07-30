import { RelationshipTracker } from '../relationshipTracker';
import { RelationshipCalculationConfig } from '../types/RelationshipTypes';

describe('RelationshipTracker', () => {
  let tracker: RelationshipTracker;

  beforeEach(() => {
    tracker = new RelationshipTracker();
  });

  afterEach(() => {
    tracker.clear();
  });

  describe('Basic Relationship Management', () => {
    test('should create a relationship between two items', () => {
      const relationship = tracker.createRelationship('rel1', 'parent1', 'child1', 2);

      expect(relationship).toEqual({
        relationshipId: 'rel1',
        parentItemId: 'parent1',
        childItemId: 'child1',
        multiplier: 2,
        contributionSummary: {}
      });
    });

    test('should retrieve child relationships for a parent', () => {
      tracker.createRelationship('rel1', 'parent1', 'child1');
      tracker.createRelationship('rel2', 'parent1', 'child2');
      tracker.createRelationship('rel3', 'parent2', 'child1');

      const childRelationships = tracker.getChildRelationships('parent1');

      expect(childRelationships).toHaveLength(2);
      expect(childRelationships.map(r => r.relationshipId)).toContain('rel1');
      expect(childRelationships.map(r => r.relationshipId)).toContain('rel2');
    });

    test('should retrieve parent relationships for a child', () => {
      tracker.createRelationship('rel1', 'parent1', 'child1');
      tracker.createRelationship('rel2', 'parent2', 'child1');
      tracker.createRelationship('rel3', 'parent1', 'child2');

      const parentRelationships = tracker.getParentRelationships('child1');

      expect(parentRelationships).toHaveLength(2);
      expect(parentRelationships.map(r => r.relationshipId)).toContain('rel1');
      expect(parentRelationships.map(r => r.relationshipId)).toContain('rel2');
    });

    test('should remove a relationship', () => {
      tracker.createRelationship('rel1', 'parent1', 'child1');
      tracker.createRelationship('rel2', 'parent1', 'child2');

      const removed = tracker.removeRelationship('rel1');
      expect(removed).toBe(true);

      const childRelationships = tracker.getChildRelationships('parent1');
      expect(childRelationships).toHaveLength(1);
      expect(childRelationships[0].relationshipId).toBe('rel2');
    });

    test('should return false when trying to remove non-existent relationship', () => {
      const removed = tracker.removeRelationship('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('Multiplier Updates', () => {
    test('should update relationship multiplier', () => {
      tracker.createRelationship('rel1', 'parent1', 'child1', 1);

      const updated = tracker.updateRelationshipMultiplier('rel1', 3);
      expect(updated).toBe(true);

      const relationship = tracker.getRelationship('rel1');
      expect(relationship?.multiplier).toBe(3);
    });

    test('should return false when updating non-existent relationship multiplier', () => {
      const updated = tracker.updateRelationshipMultiplier('non-existent', 3);
      expect(updated).toBe(false);
    });
  });

  describe('Circular Reference Detection', () => {
    test('should detect circular references', () => {
      tracker.createRelationship('rel1', 'item1', 'item2');
      tracker.createRelationship('rel2', 'item2', 'item3');

      const wouldCreateCircle = tracker.wouldCreateCircle('item3', 'item1');
      expect(wouldCreateCircle).toBe(true);
    });

    test('should prevent creating circular relationships', () => {
      tracker.createRelationship('rel1', 'item1', 'item2');
      tracker.createRelationship('rel2', 'item2', 'item3');

      expect(() => {
        tracker.createRelationship('rel3', 'item3', 'item1');
      }).toThrow('Creating relationship would create circular reference');
    });

    test('should allow creating non-circular relationships', () => {
      tracker.createRelationship('rel1', 'item1', 'item2');
      tracker.createRelationship('rel2', 'item1', 'item3');

      const wouldCreateCircle = tracker.wouldCreateCircle('item2', 'item3');
      expect(wouldCreateCircle).toBe(false);

      expect(() => {
        tracker.createRelationship('rel3', 'item2', 'item3');
      }).not.toThrow();
    });

    test('should prevent self-referential relationships', () => {
      expect(() => {
        tracker.createRelationship('rel1', 'item1', 'item1');
      }).toThrow('Self-referential relationships are not allowed');
    });
  });

  describe('Affected Relationships', () => {
    test('should get all relationships affected by item changes', () => {
      tracker.createRelationship('rel1', 'parent1', 'child1');
      tracker.createRelationship('rel2', 'parent2', 'child1');
      tracker.createRelationship('rel3', 'grandparent', 'parent1');
      tracker.createRelationship('rel4', 'unrelated1', 'unrelated2');

      const affected = tracker.getAffectedRelationships('child1');

      expect(affected.size).toBe(3);
      expect(affected.has('rel1')).toBe(true);
      expect(affected.has('rel2')).toBe(true);
      expect(affected.has('rel3')).toBe(true);
      expect(affected.has('rel4')).toBe(false);
    });
  });

  describe('Performance and Metrics', () => {
    test('should provide relationship metrics', () => {
      tracker.createRelationship('rel1', 'parent1', 'child1');
      tracker.createRelationship('rel2', 'parent1', 'child2');
      tracker.createRelationship('rel3', 'parent2', 'child1');

      const metrics = tracker.getMetrics();

      expect(metrics.totalRelationships).toBe(3);
      expect(metrics.averageChildrenPerParent).toBe(1.5); // (2 + 1) / 2
      expect(metrics.averageParentsPerChild).toBe(1.5); // (2 + 1) / 2
      expect(metrics.circularReferences).toBe(0);
    });

    test('should calculate max depth correctly', () => {
      tracker.createRelationship('rel1', 'level0', 'level1');
      tracker.createRelationship('rel2', 'level1', 'level2');
      tracker.createRelationship('rel3', 'level2', 'level3');

      const metrics = tracker.getMetrics();
      expect(metrics.maxDepth).toBe(4); // 4 levels total
    });
  });

  describe('Event Subscription', () => {
    test('should notify subscribers of relationship changes', () => {
      const mockCallback = vi.fn();
      const unsubscribe = tracker.subscribe('parent1', mockCallback);

      tracker.createRelationship('rel1', 'parent1', 'child1');

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          initiatingItemId: 'parent1',
          invalidatedCacheKeys: expect.any(Set)
        })
      );

      unsubscribe();
    });

    test('should allow unsubscribing from notifications', () => {
      const mockCallback = vi.fn();
      const unsubscribe = tracker.subscribe('parent1', mockCallback);

      unsubscribe();
      tracker.createRelationship('rel1', 'parent1', 'child1');

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    test('should respect custom configuration', () => {
      const config: Partial<RelationshipCalculationConfig> = {
        maxCascadeDepth: 3,
        validateCircularReferences: false
      };

      const customTracker = new RelationshipTracker(config);

      // Should allow circular references when validation is disabled
      customTracker.createRelationship('rel1', 'item1', 'item2');
      customTracker.createRelationship('rel2', 'item2', 'item3');

      expect(() => {
        customTracker.createRelationship('rel3', 'item3', 'item1');
      }).not.toThrow();

      customTracker.clear();
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty relationship queries gracefully', () => {
      const childRelationships = tracker.getChildRelationships('non-existent');
      const parentRelationships = tracker.getParentRelationships('non-existent');

      expect(childRelationships).toEqual([]);
      expect(parentRelationships).toEqual([]);
    });

    test('should handle clearing empty tracker', () => {
      expect(() => tracker.clear()).not.toThrow();

      const metrics = tracker.getMetrics();
      expect(metrics.totalRelationships).toBe(0);
    });

    test('should handle invalid relationship parameters', () => {
      expect(() => {
        tracker.createRelationship('', 'parent1', 'child1');
      }).toThrow('Invalid relationship parameters');

      expect(() => {
        tracker.createRelationship('rel1', '', 'child1');
      }).toThrow('Invalid relationship parameters');

      expect(() => {
        tracker.createRelationship('rel1', 'parent1', '');
      }).toThrow('Invalid relationship parameters');
    });
  });
});
