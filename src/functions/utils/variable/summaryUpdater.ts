import { RelationshipTracker } from './relationshipTracker';
import { VariableSummaryCalculator } from './variableSummaryCalculator';
import { VariableSummary } from './types';
import { Item } from '../item/index';
import {
  RelationshipUpdateContext,
  UpdatePropagation,
  RelationshipCalculationConfig
} from './types/RelationshipTypes';
import { v4 as uuid } from 'uuid';

/**
 * Type for variable objects in the map
 */
interface VariableMapEntry {
  name: string;
  quantity: number;
  unit?: string;
  category?: string;
}

/**
 * Handles automated summary updates when variables change
 */
export class SummaryUpdater {
  private readonly relationshipTracker: RelationshipTracker;
  private readonly calculator: VariableSummaryCalculator;
  private readonly config: RelationshipCalculationConfig;
  private readonly updateQueue: Map<string, UpdatePropagation>;
  private readonly batchTimer: NodeJS.Timeout | null = null;

  constructor(
    relationshipTracker: RelationshipTracker,
    calculator: VariableSummaryCalculator,
    config: Partial<RelationshipCalculationConfig> = {}
  ) {
    this.relationshipTracker = relationshipTracker;
    this.calculator = calculator;
    this.config = {
      maxCascadeDepth: 10,
      enableCaching: true,
      batchSize: 50,
      timeoutMs: 5000,
      validateCircularReferences: true,
      ...config
    };
    this.updateQueue = new Map();
  }

  /**
   * Trigger update cascade when item variables change
   */
  public async updateVariables(
    itemId: string,
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>,
    changeType: 'DIRECT_VARIABLE' | 'RELATIONSHIP_CHANGE' = 'DIRECT_VARIABLE'
  ): Promise<Map<string, VariableSummary>> {
    const propagation: UpdatePropagation = {
      sourceItemId: itemId,
      affectedRelationships: Array.from(this.relationshipTracker.getAffectedRelationships(itemId)),
      propagationDepth: 0,
      updateType: changeType
    };

    return this.executeUpdatePropagation(propagation, allItems, variableMap);
  }

  /**
   * Update specific relationship multiplier and cascade changes
   */
  public async updateRelationshipMultiplier(
    relationshipId: string,
    multiplier: number,
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>
  ): Promise<Map<string, VariableSummary>> {
    const relationship = this.relationshipTracker.getRelationship(relationshipId);
    if (!relationship) {
      throw new Error(`Relationship ${relationshipId} not found`);
    }

    // Update the multiplier
    const success = this.relationshipTracker.updateRelationshipMultiplier(relationshipId, multiplier);
    if (!success) {
      throw new Error(`Failed to update multiplier for relationship ${relationshipId}`);
    }

    // Propagate updates starting from the parent item
    const propagation: UpdatePropagation = {
      sourceItemId: relationship.parentItemId,
      sourceRelationshipId: relationshipId,
      affectedRelationships: [relationshipId],
      propagationDepth: 0,
      updateType: 'RELATIONSHIP_CHANGE'
    };

    return this.executeUpdatePropagation(propagation, allItems, variableMap);
  }

  /**
   * Batch update multiple items for efficiency
   */
  public async batchUpdate(
    itemIds: string[],
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>
  ): Promise<Map<string, VariableSummary>> {
    const results = new Map<string, VariableSummary>();
    const processedItems = new Set<string>();

    // Group updates by affected relationships to minimize redundant calculations
    const allAffectedRelationships = new Set<string>();

    for (const itemId of itemIds) {
      const affected = this.relationshipTracker.getAffectedRelationships(itemId);
      affected.forEach(rel => allAffectedRelationships.add(rel));
    }

    // Process updates in batches to manage memory and performance
    const batches = this.createBatches(Array.from(allAffectedRelationships), this.config.batchSize);

    for (const batch of batches) {
      const batchResults = await this.processBatch(batch, allItems, variableMap, processedItems);

      // Merge batch results
      for (const [itemId, summary] of batchResults) {
        results.set(itemId, summary);
      }
    }

    return results;
  }

  /**
   * Validate update consistency and detect potential issues
   */
  public validateUpdate(
    itemId: string,
    expectedSummary: VariableSummary,
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>
  ): {
    isValid: boolean;
    actualSummary: VariableSummary;
    discrepancies: Array<{
      variable: string;
      expected: number;
      actual: number;
      difference: number;
    }>;
  } {
    const item = allItems.find(i => i.id === itemId);
    if (!item) {
      throw new Error(`Item ${itemId} not found`);
    }

    const actualSummary = this.calculator.calculateSummary(item, allItems, variableMap);
    const discrepancies: Array<{
      variable: string;
      expected: number;
      actual: number;
      difference: number;
    }> = [];

    // Compare expected vs actual summaries
    const allVariableNames = new Set([
      ...Object.keys(expectedSummary),
      ...Object.keys(actualSummary)
    ]);

    let isValid = true;

    for (const variableName of allVariableNames) {
      const expected = expectedSummary[variableName]?.quantity || 0;
      const actual = actualSummary[variableName]?.quantity || 0;
      const difference = Math.abs(expected - actual);

      if (difference > 0.001) { // Allow for small floating point differences
        isValid = false;
        discrepancies.push({
          variable: variableName,
          expected,
          actual,
          difference
        });
      }
    }

    return {
      isValid,
      actualSummary,
      discrepancies
    };
  }

  /**
   * Rollback updates in case of errors
   */
  public async rollbackUpdate(
    context: RelationshipUpdateContext,
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>
  ): Promise<boolean> {
    if (!context.rollbackData) {
      console.warn('No rollback data available for context:', context.operationId);
      return false;
    }

    try {
      // Restore cached summaries
      for (const [itemId, summary] of context.rollbackData) {
        // Invalidate current cache entries
        this.calculator.invalidateCache(itemId);

        // Note: In a real implementation, you'd need a way to restore the cache
        // This is a simplified version
        console.log(`Would restore summary for item ${itemId}:`, summary);
      }

      return true;
    } catch (error) {
      console.error('Error during rollback:', error);
      return false;
    }
  }

  // Private helper methods

  private async executeUpdatePropagation(
    propagation: UpdatePropagation,
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>
  ): Promise<Map<string, VariableSummary>> {
    const results = new Map<string, VariableSummary>();
    const context: RelationshipUpdateContext = {
      operationId: uuid(),
      initiatingItemId: propagation.sourceItemId,
      timestamp: Date.now(),
      updatedRelationships: new Map(),
      invalidatedCacheKeys: new Set()
    };

    try {
      // Invalidate cache for affected items
      for (const relationshipId of propagation.affectedRelationships) {
        const relationship = this.relationshipTracker.getRelationship(relationshipId);
        if (relationship) {
          this.calculator.invalidateCache(relationship.parentItemId);
          this.calculator.invalidateCache(relationship.childItemId);
          context.invalidatedCacheKeys.add(relationship.parentItemId);
          context.invalidatedCacheKeys.add(relationship.childItemId);
        }
      }

      // Calculate new summaries for affected items
      const affectedItems = this.getAffectedItems(propagation.affectedRelationships, allItems);

      for (const item of affectedItems) {
        const newSummary = this.calculator.calculateSummary(item, allItems, variableMap);
        results.set(item.id, newSummary);
        context.updatedRelationships.set(item.id, newSummary);
      }

      return results;
    } catch (error) {
      console.error('Error executing update propagation:', error);

      // Attempt rollback
      await this.rollbackUpdate(context, allItems, variableMap);

      throw error;
    }
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];

    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }

    return batches;
  }

  private async processBatch(
    relationshipIds: string[],
    allItems: Item[],
    variableMap: Map<string, VariableMapEntry[]>,
    processedItems: Set<string>
  ): Promise<Map<string, VariableSummary>> {
    const results = new Map<string, VariableSummary>();

    for (const relationshipId of relationshipIds) {
      const relationship = this.relationshipTracker.getRelationship(relationshipId);
      if (!relationship) continue;

      // Process parent item if not already processed
      if (!processedItems.has(relationship.parentItemId)) {
        const parentItem = allItems.find(i => i.id === relationship.parentItemId);
        if (parentItem) {
          const summary = this.calculator.calculateSummary(parentItem, allItems, variableMap);
          results.set(parentItem.id, summary);
          processedItems.add(parentItem.id);
        }
      }
    }

    return results;
  }

  private getAffectedItems(relationshipIds: string[], allItems: Item[]): Item[] {
    const itemIds = new Set<string>();

    for (const relationshipId of relationshipIds) {
      const relationship = this.relationshipTracker.getRelationship(relationshipId);
      if (relationship) {
        itemIds.add(relationship.parentItemId);
        itemIds.add(relationship.childItemId);
      }
    }

    return allItems.filter(item => itemIds.has(item.id));
  }
}
