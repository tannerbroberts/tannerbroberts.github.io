# Step 1: Core Data Models and Types

## Step Overview
Create the fundamental data structures for ItemInstance, Variable, and supporting types. This step establishes the foundation for tracking execution instances and resource variables while maintaining clean separation from item templates.

## Dependencies
- None (foundational step)

## Detailed Requirements

### ItemInstance Data Model
```typescript
interface ItemInstance {
  readonly id: string; // Unique instance identifier
  readonly itemId: string; // Reference to the item template
  readonly calendarEntryId: string; // Reference to BaseCalendarEntry
  readonly scheduledStartTime: number; // When instance was scheduled to start
  readonly actualStartTime?: number; // When instance actually started (tracked)
  readonly completedAt?: number; // When instance was marked complete
  readonly isComplete: boolean; // Completion status
  readonly executionDetails: InstanceExecutionDetails; // Instance-specific data
}

interface InstanceExecutionDetails {
  readonly checklistStartTimes?: Map<string, number>; // For checklist children start tracking
  readonly variableState?: Map<string, number>; // Runtime variable quantities
  readonly notes?: string; // User notes for this execution
  readonly interruptionCount?: number; // Track execution interruptions
}
```

### Variable Data Model
```typescript
interface Variable {
  readonly type: "variable";
  readonly name: string; // Variable name (e.g., "egg", "flour cup")
  readonly quantity: number; // Positive or negative quantity
  readonly unit?: string; // Optional unit specification
  readonly category?: string; // Optional categorization
}

interface VariableSummary {
  readonly [variableName: string]: {
    readonly quantity: number;
    readonly unit?: string;
    readonly category?: string;
  };
}
```

### Enhanced Item Type Extensions
```typescript
// Extend existing Item classes to include variables
interface ItemWithVariables {
  readonly variables: Variable[]; // Variables defined for this item
}
```

## Code Changes Required

### 1. Create ItemInstance Types (`src/functions/utils/itemInstance/types.ts`)
```typescript
import { v4 as uuid } from "uuid";

export interface ItemInstance {
  readonly id: string;
  readonly itemId: string;
  readonly calendarEntryId: string;
  readonly scheduledStartTime: number;
  readonly actualStartTime?: number;
  readonly completedAt?: number;
  readonly isComplete: boolean;
  readonly executionDetails: InstanceExecutionDetails;
}

export interface InstanceExecutionDetails {
  readonly checklistStartTimes?: Record<string, number>;
  readonly variableState?: Record<string, number>;
  readonly notes?: string;
  readonly interruptionCount?: number;
}

export interface ItemInstanceJSON {
  id: string;
  itemId: string;
  calendarEntryId: string;
  scheduledStartTime: number;
  actualStartTime?: number;
  completedAt?: number;
  isComplete: boolean;
  executionDetails: InstanceExecutionDetails;
}

export class ItemInstanceImpl implements ItemInstance {
  readonly id: string;
  readonly itemId: string;
  readonly calendarEntryId: string;
  readonly scheduledStartTime: number;
  readonly actualStartTime?: number;
  readonly completedAt?: number;
  readonly isComplete: boolean;
  readonly executionDetails: InstanceExecutionDetails;

  constructor(data: {
    id?: string;
    itemId: string;
    calendarEntryId: string;
    scheduledStartTime: number;
    actualStartTime?: number;
    completedAt?: number;
    isComplete?: boolean;
    executionDetails?: Partial<InstanceExecutionDetails>;
  }) {
    this.id = data.id || uuid();
    this.itemId = data.itemId;
    this.calendarEntryId = data.calendarEntryId;
    this.scheduledStartTime = data.scheduledStartTime;
    this.actualStartTime = data.actualStartTime;
    this.completedAt = data.completedAt;
    this.isComplete = data.isComplete || false; // DEFAULT TO INCOMPLETE - never auto-complete
    this.executionDetails = {
      checklistStartTimes: {},
      variableState: {},
      notes: "",
      interruptionCount: 0,
      ...data.executionDetails
    };
  }

  toJSON(): ItemInstanceJSON {
    return {
      id: this.id,
      itemId: this.itemId,
      calendarEntryId: this.calendarEntryId,
      scheduledStartTime: this.scheduledStartTime,
      actualStartTime: this.actualStartTime,
      completedAt: this.completedAt,
      isComplete: this.isComplete,
      executionDetails: this.executionDetails
    };
  }

  static fromJSON(json: ItemInstanceJSON): ItemInstanceImpl {
    return new ItemInstanceImpl(json);
  }

  // Immutable update methods
  markStarted(startTime: number = Date.now()): ItemInstanceImpl {
    return new ItemInstanceImpl({
      ...this,
      actualStartTime: startTime,
      executionDetails: {
        ...this.executionDetails,
        interruptionCount: (this.executionDetails.interruptionCount || 0) + 1
      }
    });
  }

  markCompleted(completedAt: number = Date.now()): ItemInstanceImpl {
    return new ItemInstanceImpl({
      ...this,
      completedAt,
      isComplete: true
    });
  }

  updateExecutionDetails(details: Partial<InstanceExecutionDetails>): ItemInstanceImpl {
    return new ItemInstanceImpl({
      ...this,
      executionDetails: {
        ...this.executionDetails,
        ...details
      }
    });
  }
}
```

### 2. Create Variable Types (`src/functions/utils/variable/types.ts`)
```typescript
export interface Variable {
  readonly type: "variable";
  readonly name: string;
  readonly quantity: number;
  readonly unit?: string;
  readonly category?: string;
}

export interface VariableJSON {
  type: "variable";
  name: string;
  quantity: number;
  unit?: string;
  category?: string;
}

export interface VariableSummary {
  readonly [variableName: string]: {
    readonly quantity: number;
    readonly unit?: string;
    readonly category?: string;
  };
}

export class VariableImpl implements Variable {
  readonly type = "variable" as const;
  readonly name: string;
  readonly quantity: number;
  readonly unit?: string;
  readonly category?: string;

  constructor(data: {
    name: string;
    quantity: number;
    unit?: string;
    category?: string;
  }) {
    this.name = data.name.trim().toLowerCase(); // Normalize name for consistency
    this.quantity = data.quantity;
    this.unit = data.unit?.trim();
    this.category = data.category?.trim();
  }

  toJSON(): VariableJSON {
    return {
      type: this.type,
      name: this.name,
      quantity: this.quantity,
      unit: this.unit,
      category: this.category
    };
  }

  static fromJSON(json: VariableJSON): VariableImpl {
    return new VariableImpl(json);
  }

  // Combine with another variable of the same name
  combine(other: Variable): VariableImpl {
    if (this.name !== other.name) {
      throw new Error(`Cannot combine variables with different names: ${this.name} and ${other.name}`);
    }
    
    return new VariableImpl({
      name: this.name,
      quantity: this.quantity + other.quantity,
      unit: this.unit || other.unit, // Use first available unit
      category: this.category || other.category // Use first available category
    });
  }
}
```

### 3. Create Instance Utilities (`src/functions/utils/itemInstance/utils.ts`)
```typescript
import { ItemInstance, ItemInstanceImpl } from './types';
import { BaseCalendarEntry } from '../../reducers/AppReducer';

/**
 * Create an ItemInstance from a BaseCalendarEntry
 */
export function createInstanceFromCalendarEntry(
  calendarEntry: BaseCalendarEntry,
  additionalData?: Partial<ItemInstance>
): ItemInstanceImpl {
  return new ItemInstanceImpl({
    itemId: calendarEntry.itemId,
    calendarEntryId: calendarEntry.id,
    scheduledStartTime: calendarEntry.startTime,
    ...additionalData
  });
}

/**
 * Get instance by ID from instance map
 */
export function getInstanceById(
  instances: Map<string, ItemInstance>,
  instanceId: string | null
): ItemInstance | null {
  if (!instanceId) return null;
  return instances.get(instanceId) || null;
}

/**
 * Get instances by calendar entry ID
 */
export function getInstancesByCalendarEntryId(
  instances: Map<string, ItemInstance>,
  calendarEntryId: string
): ItemInstance[] {
  return Array.from(instances.values()).filter(
    instance => instance.calendarEntryId === calendarEntryId
  );
}

/**
 * Get instances by item ID
 */
export function getInstancesByItemId(
  instances: Map<string, ItemInstance>,
  itemId: string
): ItemInstance[] {
  return Array.from(instances.values()).filter(
    instance => instance.itemId === itemId
  );
}

/**
 * Get incomplete instances that are in the past
 */
export function getPastIncompleteInstances(
  instances: Map<string, ItemInstance>,
  currentTime: number = Date.now()
): ItemInstance[] {
  return Array.from(instances.values()).filter(instance => {
    // Not complete
    if (instance.isComplete) return false;
    
    // In the past (scheduled start time has passed)
    if (instance.scheduledStartTime > currentTime) return false;
    
    // Not currently executing (this will be determined by execution context)
    // For now, consider it past if it should have started
    return true;
  });
}

/**
 * Check if an instance is currently executing
 */
export function isInstanceCurrentlyExecuting(
  instance: ItemInstance,
  currentTaskChain: string[], // Array of currently executing item IDs
  currentTime: number = Date.now()
): boolean {
  // Instance must have started or be scheduled to start
  const startTime = instance.actualStartTime || instance.scheduledStartTime;
  if (startTime > currentTime) return false;
  
  // Must be in current execution chain
  return currentTaskChain.includes(instance.itemId);
}
```

### 4. Create Variable Utilities (`src/functions/utils/variable/utils.ts`)
```typescript
import { Variable, VariableImpl, VariableSummary } from './types';
import { Item, hasChildren, getChildren } from '../item/index';

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

  const summary: Record<string, Variable> = {};

  // FIRST: Add this item's OWN direct variables (parent variables)
  const itemVariables = variableMap.get(item.id) || [];
  for (const variable of itemVariables) {
    const key = variable.name;
    if (summary[key]) {
      summary[key] = summary[key].combine(variable);
    } else {
      summary[key] = new VariableImpl(variable);
    }
  }

  // SECOND: Add variables from children (child variables)
  if (hasChildren(item)) {
    const children = getChildren(item);
    for (const childRef of children) {
      const childId = 'id' in childRef ? childRef.id : childRef.itemId;
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

  // Convert to VariableSummary format
  const result: VariableSummary = {};
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
  const match = trimmed.match(/^([+-]?\d+(?:\.\d+)?)\s+(.+)$/);
  
  if (!match) return null;
  
  const quantity = parseFloat(match[1]);
  const namePart = match[2].trim();
  
  // Try to extract unit from the end
  const unitMatch = namePart.match(/^(.+?)\s+(cup|liter|gram|kg|lb|oz|tsp|tbsp|ml|l)$/i);
  
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
```

### 5. Update Index Files

#### `src/functions/utils/itemInstance/index.ts`
```typescript
export * from './types';
export * from './utils';
```

#### `src/functions/utils/variable/index.ts`
```typescript
export * from './types';
export * from './utils';
```

#### Update `src/functions/utils/item/index.ts`
```typescript
// Add to existing exports
export * from '../itemInstance';
export * from '../variable';
```

## Testing Requirements

### Unit Tests for ItemInstance (`src/functions/utils/itemInstance/__tests__/ItemInstance.test.ts`)
- Test instance creation from calendar entry
- Test immutable update methods (markStarted, markCompleted)
- Test JSON serialization/deserialization
- Test utility functions for filtering and finding instances

### Unit Tests for Variable (`src/functions/utils/variable/__tests__/Variable.test.ts`)
- Test variable creation and validation
- Test variable combination logic
- Test variable summary calculation
- Test string parsing functionality
- Test display formatting

### Integration Tests (`src/functions/utils/__tests__/integration.test.ts`)
- Test variable summary calculation with complex item hierarchies
- Test instance lifecycle with variable state tracking
- Test performance with large datasets

## Acceptance Criteria

- [x] ItemInstance provides clean separation from Item templates
- [x] ItemInstance tracks execution state without affecting Item
- [x] Variable system supports positive/negative quantities
- [x] Variable summaries correctly aggregate child variables
- [x] All types support JSON serialization for storage
- [x] Utility functions provide efficient data access patterns
- [x] Performance acceptable for typical use cases (< 100ms for complex calculations)
- [x] Type safety maintained throughout the system

## Rollback Plan

If issues are discovered:
1. Revert new files in `itemInstance/` and `variable/` directories
2. Remove exports from index files
3. Existing functionality remains unaffected as this is purely additive

## Next Steps

After completion of this step:
- Step 2 will integrate these types into the AppReducer and storage system
- The types defined here will be used throughout the remaining steps
- No breaking changes to existing functionality
