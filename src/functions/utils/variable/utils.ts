import { Variable, VariableImpl, VariableSummary } from './types';
import { Item, hasChildren, getChildren } from '../item/index';
import { getChildId } from '../item/itemUtils';
import { RelationshipTracker } from './relationshipTracker';
import { VariableSummaryCalculator } from './variableSummaryCalculator';
import { OptimizedSummaryCalculator } from './optimizedSummaryCalculator';
import { measurePerformance } from '../performance/variablePerformanceMonitor';

// Global instances for relationship-based calculations
let globalRelationshipTracker: RelationshipTracker | null = null;
let globalCalculator: VariableSummaryCalculator | null = null;
let globalOptimizedCalculator: OptimizedSummaryCalculator | null = null;

/**
 * Initialize relationship-based calculation system with optimization
 */
export function initializeRelationshipCalculation(): void {
  if (!globalRelationshipTracker) {
    globalRelationshipTracker = new RelationshipTracker();
    globalCalculator = new VariableSummaryCalculator(globalRelationshipTracker);
    globalOptimizedCalculator = new OptimizedSummaryCalculator(globalRelationshipTracker, {
      enableMemoization: true,
      enableIncrementalUpdates: true,
      maxCacheSize: 1000,
      cacheTTL: 5 * 60 * 1000 // 5 minutes
    });
  }
}

/**
 * Get the global relationship tracker (creates if not exists)
 */
export function getRelationshipTracker(): RelationshipTracker {
  if (!globalRelationshipTracker) {
    initializeRelationshipCalculation();
  }
  return globalRelationshipTracker!;
}

/**
 * Get the global variable summary calculator (creates if not exists)
 */
export function getVariableSummaryCalculator(): VariableSummaryCalculator {
  if (!globalCalculator) {
    initializeRelationshipCalculation();
  }
  return globalCalculator!;
}

/**
 * Add parent item's direct variables to summary
 */
function addParentVariables(
  item: Item,
  variableMap: Map<string, Variable[]>,
  summary: Record<string, VariableImpl>
): void {
  const itemVariables = variableMap.get(item.id) || [];
  for (const variable of itemVariables) {
    const key = variable.name;
    if (summary[key]) {
      summary[key] = summary[key].combine(variable);
    } else {
      summary[key] = new VariableImpl(variable);
    }
  }
}

/**
 * Add child variables to summary recursively
 */
function addChildVariables(
  item: Item,
  allItems: Item[],
  variableMap: Map<string, Variable[]>,
  summary: Record<string, VariableImpl>,
  visited: Set<string>
): void {
  if (!hasChildren(item)) return;

  const children = getChildren(item);
  for (const childRef of children) {
    const childId = getChildId(childRef);
    const childItem = allItems.find(i => i.id === childId);

    if (childItem) {
      const childSummary = calculateVariableSummary(childItem, allItems, variableMap, visited);

      // Merge child summary into parent summary
      for (const [varName, varData] of Object.entries(childSummary)) {
        const childVariable = new VariableImpl({
          name: varName,
          quantity: varData.quantity,
          unit: varData.unit,
          category: varData.category
        });

        if (summary[varName]) {
          summary[varName] = summary[varName].combine(childVariable);
        } else {
          summary[varName] = childVariable;
        }
      }
    }
  }
}

/**
 * Calculate variable summary for an item including BOTH parent variables AND recursively summed child variables
 * Now supports both legacy parent-child relationships and new relationshipId-based tracking with optimizations
 */
export function calculateVariableSummary(
  item: Item,
  allItems: Item[],
  variableMap: Map<string, Variable[]>,
  visited: Set<string> = new Set(),
  useRelationshipTracking: boolean = true,
  useOptimizedCalculation: boolean = true
): VariableSummary {
  // Try optimized calculation first if enabled
  if (useOptimizedCalculation && globalOptimizedCalculator) {
    try {
      // Convert Variable[] to VariableMapEntry[] format
      const convertedVariableMap = new Map<string, Array<{
        name: string;
        quantity: number;
        unit?: string;
        category?: string;
      }>>();

      for (const [itemId, variables] of variableMap) {
        convertedVariableMap.set(itemId, variables.map(v => ({
          name: v.name,
          quantity: v.quantity,
          unit: v.unit,
          category: v.category
        })));
      }

      return measurePerformance('optimized-variable-summary', () =>
        globalOptimizedCalculator!.calculateSummary(item, allItems, convertedVariableMap)
      );
    } catch (error) {
      console.warn('Optimized calculation failed, falling back to regular method:', error);
    }
  }

  // Try relationship-based calculation if enabled
  if (useRelationshipTracking && globalCalculator) {
    try {
      // Convert Variable[] to VariableMapEntry[] format
      const convertedVariableMap = new Map<string, Array<{
        name: string;
        quantity: number;
        unit?: string;
        category?: string;
      }>>();

      for (const [itemId, variables] of variableMap) {
        convertedVariableMap.set(itemId, variables.map(v => ({
          name: v.name,
          quantity: v.quantity,
          unit: v.unit,
          category: v.category
        })));
      }

      return globalCalculator.calculateSummary(item, allItems, convertedVariableMap);
    } catch (error) {
      console.warn('Relationship-based calculation failed, falling back to legacy method:', error);
    }
  }

  // Fallback to legacy calculation method
  return calculateVariableSummaryLegacy(item, allItems, variableMap, visited);
}

/**
 * Legacy variable summary calculation using parent-child relationships
 */
function calculateVariableSummaryLegacy(
  item: Item,
  allItems: Item[],
  variableMap: Map<string, Variable[]>,
  visited: Set<string> = new Set()
): VariableSummary {
  // Prevent infinite recursion
  if (visited.has(item.id)) {
    console.warn(`Circular dependency detected for item ${item.id}`);
    return {};
  }
  visited.add(item.id);

  const summary: Record<string, VariableImpl> = {};

  // Add parent and child variables
  addParentVariables(item, variableMap, summary);
  addChildVariables(item, allItems, variableMap, summary, visited);

  // Convert to VariableSummary format
  const result: Record<string, {
    readonly quantity: number;
    readonly unit?: string;
    readonly category?: string;
  }> = {};

  for (const [name, variable] of Object.entries(summary)) {
    result[name] = {
      quantity: variable.quantity,
      unit: variable.unit,
      category: variable.category
    };
  }

  visited.delete(item.id);
  return result;
}

/**
 * Parse variable from string format (e.g., "-1 egg", "+2 flour cup")
 */
export function parseVariableFromString(input: string): Variable | null {
  const trimmed = input.trim();
  const quantityRegex = /^([+-]?\d+(?:\.\d+)?)\s+(.+)$/;
  const match = quantityRegex.exec(trimmed);

  if (!match) return null;

  const quantity = parseFloat(match[1]);
  const namePart = match[2].trim();

  // Try to extract unit from the end
  const unitRegex = /^(.+?)\s+(cup|liter|gram|kg|lb|oz|tsp|tbsp|ml|l)$/i;
  const unitMatch = unitRegex.exec(namePart);

  if (unitMatch) {
    return new VariableImpl({
      name: unitMatch[1].trim(),
      quantity,
      unit: unitMatch[2].toLowerCase()
    });
  } else {
    return new VariableImpl({
      name: namePart,
      quantity
    });
  }
}

/**
 * Format variable for display
 */
export function formatVariableForDisplay(variable: Variable): string {
  const sign = variable.quantity >= 0 ? '+' : '';
  const unit = variable.unit ? ` ${variable.unit}` : '';
  return `${sign}${variable.quantity}${unit} ${variable.name}`;
}

/**
 * Synchronize relationship tracker with current item hierarchy
 * This should be called when items are loaded or when parent-child relationships change
 */
export function synchronizeRelationships(items: Item[]): number {
  const tracker = getRelationshipTracker();
  let relationshipsCreated = 0;

  // Clear existing relationships
  tracker.clear();

  // Create relationships from item parent references
  for (const item of items) {
    for (const parent of item.parents) {
      try {
        tracker.createRelationship(
          parent.relationshipId,
          parent.id,
          item.id,
          1 // Default multiplier, could be extended later
        );
        relationshipsCreated++;
      } catch (error) {
        console.warn(`Failed to create relationship ${parent.relationshipId} for item ${item.id}:`, error);
      }
    }
  }

  console.log(`Synchronized ${relationshipsCreated} relationships from ${items.length} items`);
  return relationshipsCreated;
}

/**
 * Get the optimized variable summary calculator
 */
export function getOptimizedVariableSummaryCalculator(): OptimizedSummaryCalculator | null {
  return globalOptimizedCalculator;
}

/**
 * Update variable summary calculation to use relationship tracking
 * This function invalidates caches and triggers recalculation for affected items
 */
export function invalidateVariableSummaries(itemId: string): void {
  const calculator = getVariableSummaryCalculator();
  calculator.invalidateCache(itemId);

  // Also invalidate optimized calculator if available
  if (globalOptimizedCalculator) {
    globalOptimizedCalculator.invalidateCache(itemId);
  }
}
/**
 * Group variables by category
 */
export function groupVariablesByCategory(variables: Variable[]): Record<string, Variable[]> {
  const grouped: Record<string, Variable[]> = {};

  for (const variable of variables) {
    const category = variable.category || 'uncategorized';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(variable);
  }

  return grouped;
}
