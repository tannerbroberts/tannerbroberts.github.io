import { ItemInstance } from '../../../functions/utils/itemInstance/types';
import { Item } from '../../../functions/utils/item/Item';
import { Variable } from '../../../functions/utils/variable/types';
import { hasChildren, getChildren } from '../../../functions/utils/item/itemUtils';

/**
 * Advanced variable aggregator for complex item hierarchies
 */
export class VariableAggregator {
  private itemMap: Map<string, Item>;
  private itemVariables: Map<string, Variable[]>;
  private visited: Set<string> = new Set();

  constructor(items: Item[], itemVariables: Map<string, Variable[]>) {
    this.itemMap = new Map(items.map(item => [item.id, item]));
    this.itemVariables = itemVariables;
  }

  /**
   * Collect all variables from an item and its hierarchy
   */
  collectVariablesFromItem(itemId: string, depth: number = 0): Variable[] {
    // Prevent infinite recursion and excessive depth
    if (depth > 10 || this.visited.has(itemId)) {
      return [];
    }

    this.visited.add(itemId);

    try {
      const item = this.itemMap.get(itemId);
      if (!item) return [];

      const variables: Variable[] = [];

      // Get direct variables for this item
      const directVariables = this.itemVariables.get(itemId) || [];
      variables.push(...directVariables);

      // Recursively collect from children if this is a parent item
      if (hasChildren(item)) {
        const children = getChildren(item);

        for (const child of children) {
          const childId = 'id' in child ? child.id : child.itemId;
          const childVariables = this.collectVariablesFromItem(childId, depth + 1);
          variables.push(...childVariables);
        }
      }

      return variables;
    } finally {
      this.visited.delete(itemId);
    }
  }

  /**
   * Reset internal state for fresh collection
   */
  reset(): void {
    this.visited.clear();
  }
}

/**
 * Collect variables from item hierarchy with optimized traversal
 */
export function collectVariablesFromHierarchy(
  itemId: string,
  items: Item[],
  itemVariables: Map<string, Variable[]>
): Variable[] {
  const aggregator = new VariableAggregator(items, itemVariables);
  return aggregator.collectVariablesFromItem(itemId);
}

/**
 * Deduplicate variables with intelligent merging
 */
export function deduplicateVariables(variables: Variable[]): Variable[] {
  const variableMap = new Map<string, Variable>();

  for (const variable of variables) {
    const key = `${variable.name}|${variable.unit || ''}|${variable.category || ''}`;
    const existing = variableMap.get(key);

    if (existing) {
      // Merge quantities for same variable
      variableMap.set(key, {
        ...existing,
        quantity: existing.quantity + variable.quantity
      });
    } else {
      variableMap.set(key, { ...variable });
    }
  }

  return Array.from(variableMap.values());
}

/**
 * Analyze variable categories and provide insights
 */
export function analyzeVariableCategories(variables: Variable[]): CategoryAnalysis {
  const categoryMap = new Map<string, CategoryInfo>();

  for (const variable of variables) {
    const category = variable.category || 'Uncategorized';
    const existing = categoryMap.get(category);

    if (existing) {
      existing.count++;
      existing.totalQuantity += variable.quantity;
      existing.variables.push(variable);
    } else {
      categoryMap.set(category, {
        name: category,
        count: 1,
        totalQuantity: variable.quantity,
        variables: [variable]
      });
    }
  }

  const categories = Array.from(categoryMap.values());

  // Sort categories by total quantity (descending)
  categories.sort((a, b) => b.totalQuantity - a.totalQuantity);

  return {
    categories,
    totalCategories: categories.length,
    mostUsedCategory: categories[0]?.name || 'None',
    totalVariables: variables.length,
    totalQuantity: variables.reduce((sum, v) => sum + v.quantity, 0)
  };
}

/**
 * Check for potential issues in variable hierarchies
 */
export function validateVariableHierarchy(
  instances: ItemInstance[],
  items: Item[],
  itemVariables: Map<string, Variable[]>
): ValidationResult {
  const issues: string[] = [];
  const warnings: string[] = [];

  const itemMap = new Map(items.map(item => [item.id, item]));

  for (const instance of instances) {
    const item = itemMap.get(instance.itemId);
    if (!item) {
      issues.push(`Instance ${instance.id} references non-existent item ${instance.itemId}`);
      continue;
    }

    const variables = itemVariables.get(item.id) || [];

    // Check for variables with invalid quantities
    const invalidQuantities = variables.filter(v =>
      !isFinite(v.quantity) || v.quantity < 0
    );

    if (invalidQuantities.length > 0) {
      warnings.push(`Item ${item.name} has ${invalidQuantities.length} variables with invalid quantities`);
    }

    // Check for variables with very large quantities (potential data issues)
    const largeQuantities = variables.filter(v => v.quantity > 10000);
    if (largeQuantities.length > 0) {
      warnings.push(`Item ${item.name} has ${largeQuantities.length} variables with unusually large quantities`);
    }

    // Check for duplicate variable names within the same item
    const nameMap = new Map<string, number>();
    for (const variable of variables) {
      const count = nameMap.get(variable.name) || 0;
      nameMap.set(variable.name, count + 1);
    }

    const duplicates = Array.from(nameMap.entries()).filter(([, count]) => count > 1);
    if (duplicates.length > 0) {
      warnings.push(`Item ${item.name} has duplicate variable names: ${duplicates.map(([name]) => name).join(', ')}`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
    summary: {
      totalIssues: issues.length,
      totalWarnings: warnings.length,
      itemsChecked: instances.length
    }
  };
}

/**
 * Group variables by unit for unit-based analysis
 */
export function groupVariablesByUnit(variables: Variable[]): UnitGrouping {
  const unitMap = new Map<string, UnitInfo>();

  for (const variable of variables) {
    const unit = variable.unit || 'No Unit';
    const existing = unitMap.get(unit);

    if (existing) {
      existing.count++;
      existing.totalQuantity += variable.quantity;
      existing.variables.push(variable);
    } else {
      unitMap.set(unit, {
        unit,
        count: 1,
        totalQuantity: variable.quantity,
        variables: [variable]
      });
    }
  }

  const units = Array.from(unitMap.values());
  units.sort((a, b) => b.count - a.count);

  return {
    units,
    totalUnits: units.length,
    mostCommonUnit: units[0]?.unit || 'None',
    unitsWithoutUnit: unitMap.get('No Unit')?.count || 0
  };
}

// Type definitions

export interface CategoryInfo {
  name: string;
  count: number;
  totalQuantity: number;
  variables: Variable[];
}

export interface CategoryAnalysis {
  categories: CategoryInfo[];
  totalCategories: number;
  mostUsedCategory: string;
  totalVariables: number;
  totalQuantity: number;
}

export interface ValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  summary: {
    totalIssues: number;
    totalWarnings: number;
    itemsChecked: number;
  };
}

export interface UnitInfo {
  unit: string;
  count: number;
  totalQuantity: number;
  variables: Variable[];
}

export interface UnitGrouping {
  units: UnitInfo[];
  totalUnits: number;
  mostCommonUnit: string;
  unitsWithoutUnit: number;
}
