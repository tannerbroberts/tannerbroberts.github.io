# Step 1: Create VariableItem Core Types

## Step Dependencies
- **Prerequisites**: None - this is the foundation step
- **Next Steps**: Step 2 (AppReducer updates)

## Detailed Requirements

Create a new VariableItem class that extends the base Item class, making variables a first-class item type in the ATP system. Unlike other item types, VariableItem has no duration and no children, but includes a description field and follows the same parent-child relationship pattern.

### Core Requirements
1. **VariableItem Class**: Extend Item with variable-specific properties
2. **Type Integration**: Ensure VariableItem works with existing type guards and utilities
3. **JSON Serialization**: Support persistence via toJSON/fromJSON methods
4. **Immutability**: Follow existing immutable update patterns
5. **Validation**: Ensure name uniqueness and proper data validation

## Code Changes Required

### Create New Files

**File: `src/functions/utils/item/VariableItem.ts`**
- Define VariableItem class extending Item
- Include properties: name (from Item), parents (from Item), description, value (number)
- No duration (set to 0), no children capability
- JSON serialization support
- Immutable update methods

**File: `src/functions/utils/item/VariableItemDefinition.ts`**
- Define VariableDefinition interface for the template/definition of a variable
- Include: id, name, description, unit?, category?
- Separate from VariableItem instances that reference these definitions

**File: `src/functions/utils/item/types/VariableTypes.ts`**
- Define all TypeScript interfaces for variable-related types
- VariableItemJSON interface for serialization
- VariableDefinition interface
- VariableFilter interface (for future filtering)

### Modify Existing Files

**File: `src/functions/utils/item/ItemFactory.ts`**
- Add VariableItem creation support
- Update factory method to handle 'variable' type
- Add validation for variable-specific rules

**File: `src/functions/utils/item/itemUtils.ts`**
- Add type guard: `isVariableItem(item: Item): item is VariableItem`
- Update existing utilities to handle VariableItem appropriately
- Ensure getChildren returns empty array for VariableItem

**File: `src/functions/utils/item/index.ts`**
- Export VariableItem class and related types
- Update main item type union: `Item | BasicItem | SubCalendarItem | CheckListItem | VariableItem`

**File: `src/functions/utils/item/ItemJSON.ts`**
- Add VariableItemJSON to the ItemJSON union type
- Ensure proper type discrimination

## Testing Requirements

### Unit Tests
**File: `src/functions/utils/item/__tests__/VariableItem.test.ts`**
- Test VariableItem constructor with all property combinations
- Test JSON serialization/deserialization roundtrips
- Test immutable update methods
- Test validation rules (name required, description optional, etc.)
- Test that VariableItem has no children and duration is 0
- Test parent-child relationship management

### Integration Tests
**Update: `src/functions/utils/item/__tests__/itemUtils.test.ts`**
- Test type guard `isVariableItem` with all item types
- Test that getChildren returns empty array for VariableItem
- Test ItemFactory creation of VariableItem

**Update: `src/functions/utils/item/__tests__/Item.test.ts`**
- Test VariableItem integrates properly with existing Item tests
- Test polymorphic behavior with Item base class methods

## Acceptance Criteria

### Functional Criteria
- [ ] VariableItem class successfully extends Item base class
- [ ] VariableItem enforces duration = 0 and no children
- [ ] VariableItem.toJSON() produces valid serializable object
- [ ] VariableItem.fromJSON() correctly reconstructs object
- [ ] isVariableItem type guard accurately identifies VariableItem instances
- [ ] ItemFactory can create VariableItem instances
- [ ] All parent-child relationship methods work correctly

### Type Safety Criteria
- [ ] TypeScript compilation succeeds with no errors
- [ ] VariableItem properly typed in Item union type
- [ ] Type guards provide proper type narrowing
- [ ] JSON interfaces maintain type safety

### Validation Criteria
- [ ] VariableItem requires non-empty name
- [ ] VariableItem description is optional
- [ ] VariableItem value must be a number
- [ ] VariableItem cannot have children added
- [ ] VariableItem duration is always 0

### Test Coverage Criteria
- [ ] All VariableItem methods have unit tests
- [ ] Edge cases covered (empty name, missing description, etc.)
- [ ] Integration with existing item system verified
- [ ] Type guard coverage for all item types
- [ ] JSON serialization roundtrip tests pass

## Rollback Plan

If issues arise:
1. Remove new VariableItem files
2. Revert changes to existing files (itemUtils.ts, index.ts, ItemFactory.ts, ItemJSON.ts)
3. Remove VariableItem from Item union type
4. Remove VariableItem test files

The rollback should be clean since this step doesn't modify existing data structures or state management.

## Implementation Notes

### Design Decisions
- **No Duration**: VariableItem duration is always 0 since variables represent values, not time-based tasks
- **No Children**: Variables are leaf nodes in the item hierarchy
- **Description Field**: Required for the cross-linking feature in later steps
- **Value Field**: Numeric value that can be positive or negative

### Performance Considerations
- VariableItem should be lightweight since there may be many variable instances
- JSON serialization should be efficient for storage operations
- Type guards should be fast for frequent runtime checks

### Compatibility Notes
- Must work with existing item utilities without breaking changes
- Should integrate seamlessly with current parent-child relationship system
- Must be compatible with existing Item serialization patterns
