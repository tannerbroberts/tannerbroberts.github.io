# Step 2: Storage and Reducer Integration

## Step Overview
Integrate ItemInstance and Variable data models into the AppReducer and storage system. This step establishes the state management and persistence infrastructure for tracking instances and variables.

## Dependencies
- Step 1: Core Data Models and Types must be completed

## Detailed Requirements

### AppState Extensions
```typescript
export interface AppState {
  // ... existing fields
  itemInstances: Map<string, ItemInstance>;
  itemVariables: Map<string, Variable[]>; // keyed by itemId
  variableSummaryCache: Map<string, VariableSummary>; // cached calculations
}
```

### New Reducer Actions
```typescript
// Instance Management Actions
| { type: "CREATE_ITEM_INSTANCE"; payload: { instance: ItemInstance } }
| { type: "UPDATE_ITEM_INSTANCE"; payload: { instanceId: string; updates: Partial<ItemInstance> } }
| { type: "MARK_INSTANCE_STARTED"; payload: { instanceId: string; startTime?: number } }
| { type: "MARK_INSTANCE_COMPLETED"; payload: { instanceId: string; completedAt?: number } }
| { type: "DELETE_ITEM_INSTANCE"; payload: { instanceId: string } }

// Variable Management Actions  
| { type: "SET_ITEM_VARIABLES"; payload: { itemId: string; variables: Variable[] } }
| { type: "ADD_ITEM_VARIABLE"; payload: { itemId: string; variable: Variable } }
| { type: "REMOVE_ITEM_VARIABLE"; payload: { itemId: string; variableIndex: number } }
| { type: "UPDATE_ITEM_VARIABLE"; payload: { itemId: string; variableIndex: number; variable: Variable } }

// Caching and Performance Actions
| { type: "INVALIDATE_VARIABLE_CACHE"; payload: { itemId?: string } }
| { type: "UPDATE_VARIABLE_CACHE"; payload: { itemId: string; summary: VariableSummary } }

// Batch Operations
| { type: "BATCH_INSTANCE_OPERATIONS"; payload: { operations: AppAction[] } }
```

### Enhanced BaseCalendarEntry
```typescript
export interface BaseCalendarEntry {
  readonly id: string;
  readonly itemId: string;
  readonly startTime: number;
  readonly instanceId?: string; // Link to ItemInstance
}
```

## Code Changes Required

### 1. Update AppReducer Types (`src/functions/reducers/AppReducer.ts`)
```typescript
// Add imports
import { 
  ItemInstance, 
  ItemInstanceImpl, 
  Variable, 
  VariableImpl, 
  VariableSummary,
  createInstanceFromCalendarEntry,
  calculateVariableSummary
} from '../utils/item/index';

// Update AppState
export type AppState = typeof initialState;

// Update BaseCalendarEntry
export interface BaseCalendarEntry {
  readonly id: string;
  readonly itemId: string;
  readonly startTime: number; 
  readonly instanceId?: string; // New field linking to ItemInstance
}

// Add new action types
export type AppAction =
  | { type: "BATCH"; payload: AppAction[] }
  | {
    type: "CREATE_ITEM";
    payload: { newItem: Item };
  }
  // ... existing actions
  
  // Instance Management Actions
  | { type: "CREATE_ITEM_INSTANCE"; payload: { instance: ItemInstance } }
  | { type: "UPDATE_ITEM_INSTANCE"; payload: { instanceId: string; updates: Partial<ItemInstance> } }
  | { type: "MARK_INSTANCE_STARTED"; payload: { instanceId: string; startTime?: number } }
  | { type: "MARK_INSTANCE_COMPLETED"; payload: { instanceId: string; completedAt?: number } }
  | { type: "DELETE_ITEM_INSTANCE"; payload: { instanceId: string } }
  | { type: "CLEANUP_ORPHANED_INSTANCES"; payload: {} }
  
  // Variable Management Actions  
  | { type: "SET_ITEM_VARIABLES"; payload: { itemId: string; variables: Variable[] } }
  | { type: "ADD_ITEM_VARIABLE"; payload: { itemId: string; variable: Variable } }
  | { type: "REMOVE_ITEM_VARIABLE"; payload: { itemId: string; variableIndex: number } }
  | { type: "UPDATE_ITEM_VARIABLE"; payload: { itemId: string; variableIndex: number; variable: Variable } }
  
  // Caching Actions
  | { type: "INVALIDATE_VARIABLE_CACHE"; payload: { itemId?: string } }
  | { type: "UPDATE_VARIABLE_CACHE"; payload: { itemId: string; summary: VariableSummary } }
  
  // Enhanced calendar actions
  | { type: "ADD_BASE_CALENDAR_ENTRY_WITH_INSTANCE"; payload: { entry: BaseCalendarEntry; createInstance?: boolean } };

// Update initial state
export const initialState = {
  millisecondsPerSegment: 100,
  pixelsPerSegment: 30,
  expandSearchItems: false,
  focusedItemId: null as string | null,
  focusedListItemId: null as string | null,
  items: new Array<Item>(),
  baseCalendar: new Map<string, BaseCalendarEntry>(),
  itemInstances: new Map<string, ItemInstance>(), // New
  itemVariables: new Map<string, Variable[]>(), // New
  variableSummaryCache: new Map<string, VariableSummary>(), // New
  itemSearchWindowRange: { min: 0, max: DEFAULT_WINDOW_RANGE_SIZE },
  schedulingDialogOpen: false,
  durationDialogOpen: false,
  checkListChildDialogOpen: false,
  sideDrawerOpen: false,
  newItemDialogOpen: false,
};
```

### 2. Implement New Reducer Cases
```typescript
// Add to reducer function in AppReducer.ts

export default function reducer(
  previous: AppState,
  action: AppAction,
): AppState {
  switch (action.type) {
    // ... existing cases

    case "CREATE_ITEM_INSTANCE": {
      const { instance } = action.payload;
      const newInstances = new Map(previous.itemInstances);
      newInstances.set(instance.id, instance);
      
      return {
        ...previous,
        itemInstances: newInstances
      };
    }

    case "UPDATE_ITEM_INSTANCE": {
      const { instanceId, updates } = action.payload;
      const existingInstance = previous.itemInstances.get(instanceId);
      
      if (!existingInstance) {
        console.warn(`Instance ${instanceId} not found for update`);
        return previous;
      }

      const updatedInstance = new ItemInstanceImpl({
        ...existingInstance,
        ...updates
      });

      const newInstances = new Map(previous.itemInstances);
      newInstances.set(instanceId, updatedInstance);

      return {
        ...previous,
        itemInstances: newInstances
      };
    }

    case "MARK_INSTANCE_STARTED": {
      const { instanceId, startTime = Date.now() } = action.payload;
      const existingInstance = previous.itemInstances.get(instanceId);
      
      if (!existingInstance) {
        console.warn(`Instance ${instanceId} not found for start marking`);
        return previous;
      }

      const startedInstance = existingInstance.markStarted(startTime);
      const newInstances = new Map(previous.itemInstances);
      newInstances.set(instanceId, startedInstance);

      return {
        ...previous,
        itemInstances: newInstances
      };
    }

    case "MARK_INSTANCE_COMPLETED": {
      const { instanceId, completedAt = Date.now() } = action.payload;
      const existingInstance = previous.itemInstances.get(instanceId);
      
      if (!existingInstance) {
        console.warn(`Instance ${instanceId} not found for completion marking`);
        return previous;
      }

      const completedInstance = existingInstance.markCompleted(completedAt);
      const newInstances = new Map(previous.itemInstances);
      newInstances.set(instanceId, completedInstance);

      return {
        ...previous,
        itemInstances: newInstances
      };
    }

    case "DELETE_ITEM_INSTANCE": {
      const { instanceId } = action.payload;
      const newInstances = new Map(previous.itemInstances);
      newInstances.delete(instanceId);

      return {
        ...previous,
        itemInstances: newInstances
      };
    }

    case "CLEANUP_ORPHANED_INSTANCES": {
      // Remove instances that reference non-existent calendar entries or items
      const validItemIds = new Set(previous.items.map(item => item.id));
      const validCalendarEntryIds = new Set(Array.from(previous.baseCalendar.keys()));

      const cleanedInstances = new Map<string, ItemInstance>();
      for (const [instanceId, instance] of previous.itemInstances) {
        if (validItemIds.has(instance.itemId) && validCalendarEntryIds.has(instance.calendarEntryId)) {
          cleanedInstances.set(instanceId, instance);
        }
      }

      return {
        ...previous,
        itemInstances: cleanedInstances
      };
    }

    case "SET_ITEM_VARIABLES": {
      const { itemId, variables } = action.payload;
      const newVariables = new Map(previous.itemVariables);
      newVariables.set(itemId, variables);

      // Invalidate variable cache for affected items
      const newCache = new Map(previous.variableSummaryCache);
      
      // Remove cache entries for this item and any parent items
      for (const [cachedItemId] of newCache) {
        if (cachedItemId === itemId || itemHasDescendant(previous.items, cachedItemId, itemId)) {
          newCache.delete(cachedItemId);
        }
      }

      return {
        ...previous,
        itemVariables: newVariables,
        variableSummaryCache: newCache
      };
    }

    case "ADD_ITEM_VARIABLE": {
      const { itemId, variable } = action.payload;
      const existingVariables = previous.itemVariables.get(itemId) || [];
      const newVariables = new Map(previous.itemVariables);
      newVariables.set(itemId, [...existingVariables, variable]);

      // Invalidate cache
      const newCache = new Map(previous.variableSummaryCache);
      for (const [cachedItemId] of newCache) {
        if (cachedItemId === itemId || itemHasDescendant(previous.items, cachedItemId, itemId)) {
          newCache.delete(cachedItemId);
        }
      }

      return {
        ...previous,
        itemVariables: newVariables,
        variableSummaryCache: newCache
      };
    }

    case "REMOVE_ITEM_VARIABLE": {
      const { itemId, variableIndex } = action.payload;
      const existingVariables = previous.itemVariables.get(itemId) || [];
      
      if (variableIndex < 0 || variableIndex >= existingVariables.length) {
        console.warn(`Invalid variable index ${variableIndex} for item ${itemId}`);
        return previous;
      }

      const newVariableArray = existingVariables.filter((_, index) => index !== variableIndex);
      const newVariables = new Map(previous.itemVariables);
      
      if (newVariableArray.length === 0) {
        newVariables.delete(itemId);
      } else {
        newVariables.set(itemId, newVariableArray);
      }

      // Invalidate cache
      const newCache = new Map(previous.variableSummaryCache);
      for (const [cachedItemId] of newCache) {
        if (cachedItemId === itemId || itemHasDescendant(previous.items, cachedItemId, itemId)) {
          newCache.delete(cachedItemId);
        }
      }

      return {
        ...previous,
        itemVariables: newVariables,
        variableSummaryCache: newCache
      };
    }

    case "UPDATE_ITEM_VARIABLE": {
      const { itemId, variableIndex, variable } = action.payload;
      const existingVariables = previous.itemVariables.get(itemId) || [];
      
      if (variableIndex < 0 || variableIndex >= existingVariables.length) {
        console.warn(`Invalid variable index ${variableIndex} for item ${itemId}`);
        return previous;
      }

      const newVariableArray = [...existingVariables];
      newVariableArray[variableIndex] = variable;
      const newVariables = new Map(previous.itemVariables);
      newVariables.set(itemId, newVariableArray);

      // Invalidate cache
      const newCache = new Map(previous.variableSummaryCache);
      for (const [cachedItemId] of newCache) {
        if (cachedItemId === itemId || itemHasDescendant(previous.items, cachedItemId, itemId)) {
          newCache.delete(cachedItemId);
        }
      }

      return {
        ...previous,
        itemVariables: newVariables,
        variableSummaryCache: newCache
      };
    }

    case "INVALIDATE_VARIABLE_CACHE": {
      const { itemId } = action.payload;
      
      if (itemId) {
        // Invalidate cache for specific item and its ancestors
        const newCache = new Map(previous.variableSummaryCache);
        for (const [cachedItemId] of newCache) {
          if (cachedItemId === itemId || itemHasDescendant(previous.items, cachedItemId, itemId)) {
            newCache.delete(cachedItemId);
          }
        }
        
        return {
          ...previous,
          variableSummaryCache: newCache
        };
      } else {
        // Clear entire cache
        return {
          ...previous,
          variableSummaryCache: new Map()
        };
      }
    }

    case "UPDATE_VARIABLE_CACHE": {
      const { itemId, summary } = action.payload;
      const newCache = new Map(previous.variableSummaryCache);
      newCache.set(itemId, summary);

      return {
        ...previous,
        variableSummaryCache: newCache
      };
    }

    case "ADD_BASE_CALENDAR_ENTRY_WITH_INSTANCE": {
      const { entry, createInstance = true } = action.payload;
      
      // Add calendar entry
      const newCalendar = new Map(previous.baseCalendar);
      newCalendar.set(entry.id, entry);

      let newInstances = previous.itemInstances;
      
      // Create instance if requested and not already linked
      if (createInstance && !entry.instanceId) {
        const instance = createInstanceFromCalendarEntry(entry);
        newInstances = new Map(previous.itemInstances);
        newInstances.set(instance.id, instance);

        // Update calendar entry to link to instance
        const updatedEntry = { ...entry, instanceId: instance.id };
        newCalendar.set(entry.id, updatedEntry);
      }

      return {
        ...previous,
        baseCalendar: newCalendar,
        itemInstances: newInstances
      };
    }

    case "ADD_BASE_CALENDAR_ENTRY": {
      // Enhance existing action to create instance
      const { entry } = action.payload;
      
      // Delegate to new action
      return reducer(previous, {
        type: "ADD_BASE_CALENDAR_ENTRY_WITH_INSTANCE",
        payload: { entry, createInstance: true }
      });
    }

    // ... rest of existing cases
  }
}

// Helper function for cache invalidation
function itemHasDescendant(items: Item[], ancestorId: string, descendantId: string): boolean {
  const ancestor = items.find(item => item.id === ancestorId);
  if (!ancestor || !hasChildren(ancestor)) return false;

  const children = getChildren(ancestor);
  for (const childRef of children) {
    const childId = 'id' in childRef ? childRef.id : childRef.itemId;
    if (childId === descendantId) return true;
    
    if (itemHasDescendant(items, childId, descendantId)) return true;
  }
  
  return false;
}
```

### 3. Update Local Storage Integration

#### Extend Storage Types (`src/localStorageImplementation/types.ts`)
```typescript
// Add imports
import { ItemInstance, Variable, VariableSummary } from '../functions/utils/item/index';

// Update StoredAppState
export interface StoredAppState {
  items: ItemJSON[];
  baseCalendar: Record<string, BaseCalendarEntry>;
  itemInstances: Record<string, ItemInstanceJSON>; // New
  itemVariables: Record<string, VariableJSON[]>; // New
  variableSummaryCache?: Record<string, VariableSummary>; // Optional for backwards compatibility
  version: string;
  timestamp: number;
}
```

#### Update Storage Service (`src/localStorageImplementation/localStorageService.ts`)
```typescript
// Add imports
import { ItemInstanceImpl, VariableImpl } from '../functions/utils/item/index';

// Update serializeAppState function
export function serializeAppState(appState: AppState): StoredAppState {
  // Convert instances Map to Record
  const itemInstances: Record<string, ItemInstanceJSON> = {};
  for (const [id, instance] of appState.itemInstances) {
    itemInstances[id] = instance.toJSON();
  }

  // Convert variables Map to Record  
  const itemVariables: Record<string, VariableJSON[]> = {};
  for (const [itemId, variables] of appState.itemVariables) {
    itemVariables[itemId] = variables.map(v => v.toJSON());
  }

  // Convert cache Map to Record (optional)
  const variableSummaryCache: Record<string, VariableSummary> = {};
  for (const [itemId, summary] of appState.variableSummaryCache) {
    variableSummaryCache[itemId] = summary;
  }

  return {
    items: appState.items.map(item => item.toJSON()),
    baseCalendar: Object.fromEntries(appState.baseCalendar),
    itemInstances,
    itemVariables,
    variableSummaryCache,
    version: CURRENT_VERSION,
    timestamp: Date.now()
  };
}

// Update deserializeAppState function
export function deserializeAppState(stored: StoredAppState): Partial<AppState> {
  // Convert instances Record to Map
  const itemInstances = new Map<string, ItemInstance>();
  if (stored.itemInstances) {
    for (const [id, instanceData] of Object.entries(stored.itemInstances)) {
      try {
        itemInstances.set(id, ItemInstanceImpl.fromJSON(instanceData));
      } catch (error) {
        console.warn(`Failed to deserialize instance ${id}:`, error);
      }
    }
  }

  // Convert variables Record to Map
  const itemVariables = new Map<string, Variable[]>();
  if (stored.itemVariables) {
    for (const [itemId, variablesData] of Object.entries(stored.itemVariables)) {
      try {
        const variables = variablesData.map(vData => VariableImpl.fromJSON(vData));
        itemVariables.set(itemId, variables);
      } catch (error) {
        console.warn(`Failed to deserialize variables for item ${itemId}:`, error);
      }
    }
  }

  // Convert cache Record to Map (don't restore cache, let it rebuild)
  const variableSummaryCache = new Map<string, VariableSummary>();

  return {
    // ... existing deserialized data
    itemInstances,
    itemVariables,
    variableSummaryCache
  };
}
```

### 4. Update Migration Utils (`src/localStorageImplementation/migrationUtils.ts`)
```typescript
// Add migration for new data structures
export const MIGRATIONS: Record<string, MigrationFunction> = {
  // ... existing migrations
  
  '2.1.0': (data: any) => {
    // Add item instances and variables to existing data
    return {
      ...data,
      itemInstances: data.itemInstances || {},
      itemVariables: data.itemVariables || {},
      variableSummaryCache: {},
      version: '2.1.0'
    };
  },

  '2.1.1': (data: any) => {
    // Migrate existing calendar entries to create instances
    const itemInstances = { ...data.itemInstances };
    const baseCalendar = { ...data.baseCalendar };

    for (const [entryId, entry] of Object.entries(baseCalendar)) {
      if (!entry.instanceId) {
        // Create instance for existing calendar entry
        const instance = createInstanceFromCalendarEntry(entry);
        itemInstances[instance.id] = instance.toJSON();
        
        // Update calendar entry to reference instance
        baseCalendar[entryId] = {
          ...entry,
          instanceId: instance.id
        };
      }
    }

    return {
      ...data,
      itemInstances,
      baseCalendar,
      version: '2.1.1'
    };
  }
};
```

### 5. Create Instance Management Hooks

#### `src/hooks/useItemInstances.ts`
```typescript
import { useMemo } from 'react';
import { useAppState } from '../reducerContexts/App';
import { 
  ItemInstance, 
  getPastIncompleteInstances,
  getInstancesByItemId,
  isInstanceCurrentlyExecuting
} from '../functions/utils/item/index';
import { getCurrentTaskChain } from '../functions/utils/item/utils';

export function useItemInstances() {
  const { itemInstances, items, baseCalendar } = useAppState();

  const pastIncompleteInstances = useMemo(() => {
    return getPastIncompleteInstances(itemInstances);
  }, [itemInstances]);

  const currentTaskChain = useMemo(() => {
    return getCurrentTaskChain(items, Date.now(), baseCalendar);
  }, [items, baseCalendar]);

  const currentTaskIds = useMemo(() => {
    return currentTaskChain.map(item => item.id);
  }, [currentTaskChain]);

  const accountingInstances = useMemo(() => {
    return pastIncompleteInstances.filter(instance => 
      !isInstanceCurrentlyExecuting(instance, currentTaskIds)
    );
  }, [pastIncompleteInstances, currentTaskIds]);

  return {
    allInstances: itemInstances,
    pastIncompleteInstances,
    accountingInstances,
    currentTaskIds,
    getInstancesByItemId: (itemId: string) => getInstancesByItemId(itemInstances, itemId)
  };
}
```

#### `src/hooks/useItemVariables.ts`
```typescript
import { useMemo, useCallback } from 'react';
import { useAppState, useAppDispatch } from '../reducerContexts/App';
import { 
  Variable, 
  VariableSummary,
  calculateVariableSummary
} from '../functions/utils/item/index';

export function useItemVariables(itemId: string) {
  const { items, itemVariables, variableSummaryCache } = useAppState();
  const dispatch = useAppDispatch();

  const itemVariableList = useMemo(() => {
    return itemVariables.get(itemId) || [];
  }, [itemVariables, itemId]);

  const variableSummary = useMemo(() => {
    // Check cache first
    const cached = variableSummaryCache.get(itemId);
    if (cached) return cached;

    // Calculate and cache
    const item = items.find(i => i.id === itemId);
    if (!item) return {};

    const summary = calculateVariableSummary(item, items, itemVariables);
    
    // Update cache
    dispatch({
      type: 'UPDATE_VARIABLE_CACHE',
      payload: { itemId, summary }
    });

    return summary;
  }, [itemId, items, itemVariables, variableSummaryCache, dispatch]);

  const setVariables = useCallback((variables: Variable[]) => {
    dispatch({
      type: 'SET_ITEM_VARIABLES',
      payload: { itemId, variables }
    });
  }, [dispatch, itemId]);

  const addVariable = useCallback((variable: Variable) => {
    dispatch({
      type: 'ADD_ITEM_VARIABLE',
      payload: { itemId, variable }
    });
  }, [dispatch, itemId]);

  const removeVariable = useCallback((variableIndex: number) => {
    dispatch({
      type: 'REMOVE_ITEM_VARIABLE',
      payload: { itemId, variableIndex }
    });
  }, [dispatch, itemId]);

  const updateVariable = useCallback((variableIndex: number, variable: Variable) => {
    dispatch({
      type: 'UPDATE_ITEM_VARIABLE',
      payload: { itemId, variableIndex, variable }
    });
  }, [dispatch, itemId]);

  return {
    variables: itemVariableList,
    variableSummary,
    setVariables,
    addVariable,
    removeVariable,
    updateVariable
  };
}
```

## Testing Requirements

### Unit Tests for Reducer (`src/functions/reducers/__tests__/AppReducer.instances.test.ts`)
- Test instance creation, update, and deletion actions
- Test variable management actions
- Test cache invalidation logic
- Test batch operations
- Test orphaned instance cleanup

### Integration Tests for Storage (`src/localStorageImplementation/__tests__/storage.instances.test.ts`)
- Test serialization/deserialization of instances and variables
- Test migration from older versions
- Test data integrity after round-trip storage operations

### Hook Tests (`src/hooks/__tests__/`)
- Test useItemInstances hook behavior
- Test useItemVariables hook caching and update logic
- Test performance with large datasets

## Acceptance Criteria

- [x] AppState includes itemInstances and itemVariables maps
- [x] All new reducer actions work correctly and maintain immutability
- [x] Storage system persists and restores instances and variables correctly
- [x] Migration system handles upgrading existing data
- [x] Variable cache system improves performance for repeated calculations
- [x] Calendar entries automatically create linked instances
- [x] Orphaned instance cleanup prevents data corruption
- [x] Hooks provide convenient access to instance and variable data

## Rollback Plan

If issues are discovered:
1. Comment out new reducer cases
2. Revert AppState changes, keeping original fields
3. Disable new storage serialization code
4. Remove new hooks
5. Existing functionality continues to work without instances/variables

## Next Steps

After completion of this step:
- Step 3 will modify execution components to work with instances
- Step 4 will add variable UI components using the hooks created here
- All state management and persistence infrastructure is now ready
