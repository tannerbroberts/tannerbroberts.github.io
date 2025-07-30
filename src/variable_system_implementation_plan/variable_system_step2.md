# Step 2: Update AppReducer for VariableItem

## Step Dependencies
- **Prerequisites**: Step 1 (VariableItem core types must be completed)
- **Next Steps**: Step 3 (Storage layer implementation)

## Detailed Requirements

Update the AppReducer to handle VariableItem as a first-class item type, including state management for variable definitions, variable instance creation, and the relationship between variable definitions and their instances. This step establishes the state management foundation for the variable system.

### Core Requirements
1. **State Updates**: Add variable definitions storage to AppState
2. **New Actions**: Add actions for variable definition and instance management
3. **Variable Definition Management**: Store and manage variable templates
4. **Variable Instance Management**: Track relationships between instances and definitions
5. **Variable Description Storage**: Manage descriptions with cross-linking metadata

## Code Changes Required

### Modify Existing Files

**File: `src/functions/reducers/AppReducer.ts`**

**Add to AppState:**
```typescript
// Add to initialState
export const initialState = {
  // ... existing state
  variableDefinitions: new Map<string, VariableDefinition>(),
  variableDescriptions: new Map<string, VariableDescription>(),
  // itemVariables and variableSummaryCache remain for backward compatibility during migration
};
```

**Add new action types:**
```typescript
export type AppAction =
  // ... existing actions
  | { type: "CREATE_VARIABLE_DEFINITION"; payload: { definition: VariableDefinition } }
  | { type: "UPDATE_VARIABLE_DEFINITION"; payload: { definitionId: string; updates: Partial<VariableDefinition> } }
  | { type: "DELETE_VARIABLE_DEFINITION"; payload: { definitionId: string } }
  | { type: "SET_VARIABLE_DESCRIPTION"; payload: { definitionId: string; description: VariableDescription } }
  | { type: "UPDATE_VARIABLE_DESCRIPTION"; payload: { definitionId: string; description: VariableDescription } }
  | { type: "CREATE_VARIABLE_ITEM"; payload: { variableItem: VariableItem; definitionId: string } }
  | { type: "UPDATE_VARIABLE_ITEM_VALUE"; payload: { itemId: string; value: number } }
  | { type: "BATCH_CREATE_VARIABLE_ITEMS"; payload: { items: Array<{ variableItem: VariableItem; definitionId: string }> } }
  | { type: "MIGRATE_LEGACY_VARIABLES"; payload: { itemId: string } };
```

**Add reducer case handlers:**
- Handle variable definition CRUD operations
- Handle variable description management
- Handle variable item creation and updates
- Handle batch operations for efficiency
- Handle legacy variable migration

**File: `src/functions/utils/item/types/VariableTypes.ts`** (New file)
```typescript
interface VariableDefinition {
  readonly id: string;
  readonly name: string;
  readonly unit?: string;
  readonly category?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

interface VariableDescription {
  readonly definitionId: string;
  readonly text: string;
  readonly linkedVariables: string[]; // IDs of other variable definitions mentioned
  readonly lastUpdated: number;
}

interface VariableFilter {
  readonly definitionId: string;
  readonly operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
  readonly value: number;
  readonly unit?: string;
}
```

### Create New Files

**File: `src/functions/utils/variable/variableDefinitionUtils.ts`**
- Utility functions for variable definition management
- Functions to find, create, update variable definitions
- Name uniqueness validation
- Cross-reference tracking for descriptions

**File: `src/functions/utils/variable/variableInstanceUtils.ts`**
- Functions for creating variable instances from definitions
- Relationship management between instances and definitions
- Batch creation utilities for multiple variables

**File: `src/functions/utils/variable/migrationUtils.ts`**
- Utilities to migrate existing Variable objects to new VariableItem system
- Convert old itemVariables map entries to VariableDefinition + VariableItem combinations
- Preserve existing data integrity during migration

### Update Existing Files

**File: `src/hooks/useItemVariables.ts`**
- Add support for new variable definition system
- Maintain backward compatibility during migration period
- Add hooks for variable definition management

**File: `src/localStorageImplementation/types.ts`**
- Add serialization types for VariableDefinition and VariableDescription
- Update storage schema version for migration

## Testing Requirements

### Unit Tests

**File: `src/functions/reducers/__tests__/AppReducer.variableItems.test.ts`** (New)
- Test all new variable-related action types
- Test state transitions for variable definition CRUD
- Test variable description management
- Test variable item creation and value updates
- Test batch operations
- Test error handling for invalid operations

**File: `src/functions/utils/variable/__tests__/variableDefinitionUtils.test.ts`** (New)
- Test variable definition creation and validation
- Test name uniqueness enforcement
- Test cross-reference tracking
- Test search and lookup functions

**File: `src/functions/utils/variable/__tests__/variableInstanceUtils.test.ts`** (New)
- Test variable instance creation from definitions
- Test relationship tracking
- Test batch creation operations

**File: `src/functions/utils/variable/__tests__/migrationUtils.test.ts`** (New)
- Test migration from old Variable objects to new system
- Test data preservation during migration
- Test handling of edge cases (missing data, invalid data)

### Integration Tests

**Update: `src/functions/reducers/__tests__/AppReducer.test.ts`**
- Test integration between variable actions and existing item actions
- Test that variable items appear in main items array
- Test state consistency after variable operations

## Acceptance Criteria

### Functional Criteria
- [ ] AppState includes variableDefinitions and variableDescriptions maps
- [ ] All new action types properly update state
- [ ] Variable definition CRUD operations work correctly
- [ ] Variable description management works with cross-linking
- [ ] Variable item creation links properly to definitions
- [ ] Batch operations handle multiple variables efficiently
- [ ] Legacy variable migration preserves all data

### State Management Criteria
- [ ] State updates are immutable and follow existing patterns
- [ ] Actions are properly typed with no TypeScript errors
- [ ] State transitions are predictable and testable
- [ ] Error handling prevents invalid state transitions

### Integration Criteria
- [ ] Variable items appear in main items array
- [ ] Variable items work with existing item utilities
- [ ] Variable definitions are properly referenced by instances
- [ ] Cross-linking data is maintained accurately

### Performance Criteria
- [ ] Variable definition lookups are efficient (O(1) map access)
- [ ] Batch operations handle large numbers of variables
- [ ] Memory usage remains reasonable with many variable definitions
- [ ] State updates don't cause unnecessary re-renders

### Test Coverage Criteria
- [ ] All new action types have comprehensive test coverage
- [ ] Edge cases and error conditions are tested
- [ ] Migration utilities are thoroughly tested
- [ ] Integration with existing reducer logic is verified

## Rollback Plan

If issues arise:
1. Remove new action types from AppAction union
2. Remove new state properties from AppState and initialState
3. Remove new reducer case handlers
4. Delete new utility files
5. Revert changes to existing files (hooks, types)
6. Remove new test files

## Implementation Notes

### Design Decisions
- **Separate Definitions and Instances**: Variable definitions are templates, variable items are instances
- **Map Storage**: Use Maps for O(1) lookup performance
- **Immutable Updates**: Follow existing reducer patterns for consistency
- **Migration Strategy**: Gradual migration to maintain backward compatibility

### Performance Considerations
- Use Maps instead of arrays for variable definitions to enable fast lookups
- Implement batch operations to minimize state updates
- Consider using selectors for complex state queries
- Optimize for common operations (creating variables, looking up definitions)

### State Design Notes
- Variable definitions are global and shared
- Variable items are instances with values and relationships
- Descriptions are linked to definitions, not instances
- Cross-linking data is computed and cached for performance

### Migration Strategy
- Maintain old itemVariables map during transition
- Provide migration utilities to convert on-demand
- Ensure no data loss during migration process
- Allow gradual adoption of new system
