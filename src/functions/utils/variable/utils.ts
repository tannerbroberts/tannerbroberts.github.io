import { Variable, VariableImpl, VariableSummary } from './types';
import { Item, hasChildren, getChildren } from '../item/index';
import { getChildId } from '../item/itemUtils';

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
 */
export function calculateVariableSummary(
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
