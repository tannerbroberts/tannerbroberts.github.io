import {
  VariableRelationship,
  RelationshipMapping,
  RelationshipUpdateContext,
  RelationshipCalculationConfig
} from './types/RelationshipTypes';
import { v4 as uuid } from 'uuid';

/**
 * Manages relationship tracking for variable calculations using relationshipId
 */
export class RelationshipTracker {
  private readonly mapping: RelationshipMapping;
  private readonly config: RelationshipCalculationConfig;
  private readonly listeners: Map<string, Set<(context: RelationshipUpdateContext) => void>>;

  constructor(config: Partial<RelationshipCalculationConfig> = {}) {
    this.mapping = {
      parentToChildren: new Map(),
      childToParents: new Map(),
      relationshipDetails: new Map()
    };

    this.config = {
      maxCascadeDepth: 10,
      enableCaching: true,
      batchSize: 50,
      timeoutMs: 5000,
      validateCircularReferences: true,
      ...config
    };

    this.listeners = new Map();
  }

  /**
   * Create or update a relationship between parent and child items
   */
  public createRelationship(
    relationshipId: string,
    parentItemId: string,
    childItemId: string,
    multiplier: number = 1
  ): VariableRelationship {
    // Validate inputs
    if (!relationshipId || !parentItemId || !childItemId) {
      throw new Error('Invalid relationship parameters');
    }

    if (parentItemId === childItemId) {
      throw new Error('Self-referential relationships are not allowed');
    }

    // Check for circular references if enabled
    if (this.config.validateCircularReferences && this.wouldCreateCircle(parentItemId, childItemId)) {
      throw new Error(`Creating relationship would create circular reference: ${parentItemId} -> ${childItemId}`);
    }

    const relationship: VariableRelationship = {
      relationshipId,
      parentItemId,
      childItemId,
      multiplier,
      contributionSummary: {}
    };

    // Update mapping
    this.addToMapping(relationship);

    // Notify listeners
    this.notifyListeners({
      operationId: uuid(),
      initiatingItemId: parentItemId,
      timestamp: Date.now(),
      updatedRelationships: new Map(),
      invalidatedCacheKeys: new Set([relationshipId])
    });

    return relationship;
  }

  /**
   * Remove a relationship by its ID
   */
  public removeRelationship(relationshipId: string): boolean {
    const relationship = this.mapping.relationshipDetails.get(relationshipId);
    if (!relationship) {
      return false;
    }

    // Remove from mapping
    this.removeFromMapping(relationship);

    // Notify listeners
    this.notifyListeners({
      operationId: uuid(),
      initiatingItemId: relationship.parentItemId,
      timestamp: Date.now(),
      updatedRelationships: new Map(),
      invalidatedCacheKeys: new Set([relationshipId])
    });

    return true;
  }

  /**
   * Get all child relationships for a parent item
   */
  public getChildRelationships(parentItemId: string): VariableRelationship[] {
    const childRelationshipIds = this.mapping.parentToChildren.get(parentItemId) || new Set();
    return Array.from(childRelationshipIds)
      .map(id => this.mapping.relationshipDetails.get(id))
      .filter((rel): rel is VariableRelationship => rel !== undefined);
  }

  /**
   * Get all parent relationships for a child item
   */
  public getParentRelationships(childItemId: string): VariableRelationship[] {
    const parentRelationshipIds = this.mapping.childToParents.get(childItemId) || new Set();
    return Array.from(parentRelationshipIds)
      .map(id => this.mapping.relationshipDetails.get(id))
      .filter((rel): rel is VariableRelationship => rel !== undefined);
  }

  /**
   * Get specific relationship by ID
   */
  public getRelationship(relationshipId: string): VariableRelationship | undefined {
    return this.mapping.relationshipDetails.get(relationshipId);
  }

  /**
   * Update the multiplier for a relationship
   */
  public updateRelationshipMultiplier(relationshipId: string, multiplier: number): boolean {
    const existing = this.mapping.relationshipDetails.get(relationshipId);
    if (!existing) {
      return false;
    }

    const updated: VariableRelationship = {
      ...existing,
      multiplier
    };

    this.mapping.relationshipDetails.set(relationshipId, updated);

    // Notify listeners
    this.notifyListeners({
      operationId: uuid(),
      initiatingItemId: existing.parentItemId,
      timestamp: Date.now(),
      updatedRelationships: new Map([[relationshipId, existing.contributionSummary]]),
      invalidatedCacheKeys: new Set([relationshipId])
    });

    return true;
  }

  /**
   * Get all relationships that would be affected by changes to an item
   */
  public getAffectedRelationships(itemId: string): Set<string> {
    const affected = new Set<string>();

    // Add relationships where this item is a child
    const parentRelationships = this.mapping.childToParents.get(itemId) || new Set();
    parentRelationships.forEach((relationshipId: string) => affected.add(relationshipId));

    // Recursively add parent relationships that depend on this item
    this.addAncestorRelationships(itemId, affected, new Set(), 0);

    return affected;
  }

  /**
   * Check if creating a relationship would create a circular reference
   */
  public wouldCreateCircle(parentItemId: string, childItemId: string): boolean {
    return this.hasPath(childItemId, parentItemId, new Set());
  }

  /**
   * Subscribe to relationship change notifications
   */
  public subscribe(itemId: string, callback: (context: RelationshipUpdateContext) => void): () => void {
    if (!this.listeners.has(itemId)) {
      this.listeners.set(itemId, new Set());
    }
    this.listeners.get(itemId)!.add(callback);

    // Return unsubscribe function
    return () => {
      const itemListeners = this.listeners.get(itemId);
      if (itemListeners) {
        itemListeners.delete(callback);
        if (itemListeners.size === 0) {
          this.listeners.delete(itemId);
        }
      }
    };
  }

  /**
   * Get performance metrics for the relationship system
   */
  public getMetrics(): {
    totalRelationships: number;
    averageChildrenPerParent: number;
    averageParentsPerChild: number;
    maxDepth: number;
    circularReferences: number;
  } {
    const totalRelationships = this.mapping.relationshipDetails.size;
    const parentCount = this.mapping.parentToChildren.size;
    const childCount = this.mapping.childToParents.size;

    let totalChildren = 0;
    let totalParents = 0;

    for (const children of this.mapping.parentToChildren.values()) {
      totalChildren += children.size;
    }

    for (const parents of this.mapping.childToParents.values()) {
      totalParents += parents.size;
    }

    return {
      totalRelationships,
      averageChildrenPerParent: parentCount > 0 ? totalChildren / parentCount : 0,
      averageParentsPerChild: childCount > 0 ? totalParents / childCount : 0,
      maxDepth: this.calculateMaxDepth(),
      circularReferences: this.detectCircularReferences()
    };
  }

  /**
   * Clear all relationships (useful for testing)
   */
  public clear(): void {
    this.mapping.parentToChildren.clear();
    this.mapping.childToParents.clear();
    this.mapping.relationshipDetails.clear();
    this.listeners.clear();
  }

  // Private helper methods

  private addToMapping(relationship: VariableRelationship): void {
    const { relationshipId, parentItemId, childItemId } = relationship;

    // Add to relationship details
    this.mapping.relationshipDetails.set(relationshipId, relationship);

    // Add to parent->children mapping
    if (!this.mapping.parentToChildren.has(parentItemId)) {
      this.mapping.parentToChildren.set(parentItemId, new Set());
    }
    this.mapping.parentToChildren.get(parentItemId)!.add(relationshipId);

    // Add to child->parents mapping
    if (!this.mapping.childToParents.has(childItemId)) {
      this.mapping.childToParents.set(childItemId, new Set());
    }
    this.mapping.childToParents.get(childItemId)!.add(relationshipId);
  }

  private removeFromMapping(relationship: VariableRelationship): void {
    const { relationshipId, parentItemId, childItemId } = relationship;

    // Remove from relationship details
    this.mapping.relationshipDetails.delete(relationshipId);

    // Remove from parent->children mapping
    const parentChildren = this.mapping.parentToChildren.get(parentItemId);
    if (parentChildren) {
      parentChildren.delete(relationshipId);
      if (parentChildren.size === 0) {
        this.mapping.parentToChildren.delete(parentItemId);
      }
    }

    // Remove from child->parents mapping
    const childParents = this.mapping.childToParents.get(childItemId);
    if (childParents) {
      childParents.delete(relationshipId);
      if (childParents.size === 0) {
        this.mapping.childToParents.delete(childItemId);
      }
    }
  }

  private addAncestorRelationships(itemId: string, affected: Set<string>, visited: Set<string>, depth: number): void {
    if (depth >= this.config.maxCascadeDepth || visited.has(itemId)) {
      return;
    }

    visited.add(itemId);

    const parentRelationships = this.mapping.childToParents.get(itemId) || new Set();
    for (const relationshipId of parentRelationships) {
      affected.add(relationshipId);

      const relationship = this.mapping.relationshipDetails.get(relationshipId);
      if (relationship) {
        this.addAncestorRelationships(relationship.parentItemId, affected, visited, depth + 1);
      }
    }

    visited.delete(itemId);
  }

  private hasPath(fromItemId: string, toItemId: string, visited: Set<string>): boolean {
    if (fromItemId === toItemId) {
      return true;
    }

    if (visited.has(fromItemId)) {
      return false;
    }

    visited.add(fromItemId);

    const childRelationships = this.mapping.parentToChildren.get(fromItemId) || new Set();
    for (const relationshipId of childRelationships) {
      const relationship = this.mapping.relationshipDetails.get(relationshipId);
      if (relationship && this.hasPath(relationship.childItemId, toItemId, visited)) {
        return true;
      }
    }

    visited.delete(fromItemId);
    return false;
  }

  private notifyListeners(context: RelationshipUpdateContext): void {
    // Notify specific item listeners
    const itemListeners = this.listeners.get(context.initiatingItemId);
    if (itemListeners) {
      itemListeners.forEach(callback => {
        try {
          callback(context);
        } catch (error) {
          console.error('Error in relationship listener:', error);
        }
      });
    }

    // Notify global listeners (registered with '*' as itemId)
    const globalListeners = this.listeners.get('*');
    if (globalListeners) {
      globalListeners.forEach(callback => {
        try {
          callback(context);
        } catch (error) {
          console.error('Error in global relationship listener:', error);
        }
      });
    }
  }

  private calculateMaxDepth(): number {
    let maxDepth = 0;

    for (const [parentId] of this.mapping.parentToChildren) {
      const depth = this.getDepthFromItem(parentId, new Set());
      maxDepth = Math.max(maxDepth, depth);
    }

    return maxDepth;
  }

  private getDepthFromItem(itemId: string, visited: Set<string>): number {
    if (visited.has(itemId)) {
      return 0; // Circular reference, don't count further
    }

    visited.add(itemId);

    const childRelationships = this.mapping.parentToChildren.get(itemId) || new Set();
    let maxChildDepth = 0;

    for (const relationshipId of childRelationships) {
      const relationship = this.mapping.relationshipDetails.get(relationshipId);
      if (relationship) {
        const childDepth = this.getDepthFromItem(relationship.childItemId, visited);
        maxChildDepth = Math.max(maxChildDepth, childDepth);
      }
    }

    visited.delete(itemId);
    return 1 + maxChildDepth;
  }

  private detectCircularReferences(): number {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    let circularCount = 0;

    for (const [itemId] of this.mapping.parentToChildren) {
      if (!visited.has(itemId)) {
        if (this.dfsCircularDetection(itemId, visited, recursionStack)) {
          circularCount++;
        }
      }
    }

    return circularCount;
  }

  private dfsCircularDetection(itemId: string, visited: Set<string>, recursionStack: Set<string>): boolean {
    visited.add(itemId);
    recursionStack.add(itemId);

    const childRelationships = this.mapping.parentToChildren.get(itemId) || new Set();
    for (const relationshipId of childRelationships) {
      const relationship = this.mapping.relationshipDetails.get(relationshipId);
      if (relationship) {
        const childId = relationship.childItemId;

        if (!visited.has(childId)) {
          if (this.dfsCircularDetection(childId, visited, recursionStack)) {
            return true;
          }
        } else if (recursionStack.has(childId)) {
          return true;
        }
      }
    }

    recursionStack.delete(itemId);
    return false;
  }
}
