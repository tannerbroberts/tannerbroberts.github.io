# Step 4: Enhanced Variable Input UI

## Step Dependencies
- **Prerequisites**: Step 3 (Storage layer changes must be completed)
- **Next Steps**: Step 5 (Variable Description System)

## Detailed Requirements

Replace the current single-field variable input that requires string parsing (e.g., "-1 egg") with a user-friendly interface that has separate word and number input fields. This step also introduces the first-time variable description capture dialog that appears when a new variable name is encountered.

### Core Requirements
1. **Dual Input Fields**: Separate text input for variable name and number input for quantity
2. **Unit Selection**: Optional unit field with autocomplete from existing units
3. **Category Selection**: Optional category field with autocomplete from existing categories
4. **New Variable Detection**: Detect when a variable name hasn't been seen before
5. **Description Capture Dialog**: Prompt for description when creating new variable definitions
6. **Enhanced User Experience**: Improved validation, clear error messages, better accessibility

## Code Changes Required

### Create New Files

**File: `src/components/variables/EnhancedVariableInput.tsx`** (New)
- Replace current VariableInput with enhanced dual-field interface
- Include word input, number input, optional unit/category fields
- Real-time validation and error feedback
- Integration with variable definition system

**File: `src/components/variables/VariableDefinitionDialog.tsx`** (New)
- Dialog for capturing variable descriptions on first creation
- Rich text input for description
- Preview of variable definition being created
- Integration with square bracket notation (preparation for Step 6)

**File: `src/components/variables/VariableUnitAutocomplete.tsx`** (New)
- Autocomplete component for unit selection
- Populate suggestions from existing variable definitions
- Support for custom unit entry
- Common unit suggestions (grams, cups, pieces, etc.)

**File: `src/components/variables/VariableCategoryAutocomplete.tsx`** (New)
- Autocomplete component for category selection
- Populate suggestions from existing variable definitions
- Support for custom category entry
- Common category suggestions (ingredients, tools, nutrients, etc.)

**File: `src/hooks/useVariableDefinitions.ts`** (New)
- Hook for managing variable definitions
- Functions to check if variable name exists
- Create new variable definitions
- Retrieve existing definitions by name

### Modify Existing Files

**File: `src/components/CreateNewItemDialog.tsx`**
- Replace VariableInput with EnhancedVariableInput
- Add state management for variable definitions dialog
- Handle new variable creation workflow
- Update validation logic for enhanced input

**File: `src/components/dialogs/VariableManagementDialog.tsx`**
- Update to use EnhancedVariableInput
- Add support for editing variable definitions
- Handle variable definition updates

### Update Supporting Files

**File: `src/hooks/useItemVariables.ts`**
- Add integration with variable definitions
- Support creating VariableItem instances from definitions
- Handle relationship between legacy variables and new system

**File: `src/components/variables/VariableInput.tsx`** (Deprecate)
- Mark as deprecated but maintain for migration period
- Add migration helper to convert to new format

## Testing Requirements

### Unit Tests

**File: `src/components/variables/__tests__/EnhancedVariableInput.test.tsx`** (New)
- Test dual input field functionality
- Test validation for name and quantity fields
- Test unit and category autocomplete
- Test integration with variable definition system
- Test accessibility compliance

**File: `src/components/variables/__tests__/VariableDefinitionDialog.test.tsx`** (New)
- Test dialog opening/closing
- Test description capture and validation
- Test variable definition creation
- Test integration with parent component

**File: `src/hooks/__tests__/useVariableDefinitions.test.ts`** (New)
- Test variable definition lookup by name
- Test creation of new variable definitions
- Test handling of duplicate names
- Test integration with AppReducer

### Integration Tests

**File: `src/components/__tests__/CreateNewItemDialog.enhanced.test.tsx`** (New)
- Test complete workflow of creating items with new variable input
- Test variable definition dialog integration
- Test that new variables are properly saved
- Test backward compatibility with existing data

### User Experience Tests

**File: `src/components/variables/__tests__/VariableInput.e2e.test.tsx`** (New)
- Test complete user workflow from start to finish
- Test error handling and recovery
- Test autocomplete behavior
- Test keyboard navigation and accessibility

## Acceptance Criteria

### User Interface Criteria
- [ ] Variable name input accepts text and validates for non-empty strings
- [ ] Quantity input accepts numbers (positive and negative) with proper validation
- [ ] Unit autocomplete shows suggestions from existing variables
- [ ] Category autocomplete shows suggestions from existing variables
- [ ] All input fields are properly labeled and accessible
- [ ] Error messages are clear and helpful

### Variable Definition Criteria
- [ ] New variable names trigger description capture dialog
- [ ] Existing variable names auto-populate unit and category from definition
- [ ] Variable definitions are properly created and stored
- [ ] Duplicate variable names are handled appropriately
- [ ] Description dialog can be skipped with warning

### Integration Criteria
- [ ] EnhancedVariableInput works in CreateNewItemDialog
- [ ] EnhancedVariableInput works in VariableManagementDialog
- [ ] Variable instances are properly linked to definitions
- [ ] Legacy variable data continues to work
- [ ] Migration from old to new input format is seamless

### Validation Criteria
- [ ] Variable names cannot be empty or whitespace-only
- [ ] Quantities must be valid numbers
- [ ] Units and categories are optional but validated if provided
- [ ] Proper error handling for invalid input combinations
- [ ] Form validation prevents submission of invalid data

### Performance Criteria
- [ ] Autocomplete responds quickly with large numbers of existing variables
- [ ] Input validation doesn't cause UI lag
- [ ] Variable definition lookups are efficient
- [ ] UI remains responsive during variable operations

### Accessibility Criteria
- [ ] All inputs are properly labeled for screen readers
- [ ] Keyboard navigation works throughout the interface
- [ ] Error messages are announced to assistive technology
- [ ] Color contrast meets accessibility standards
- [ ] Focus management is logical and predictable

## Rollback Plan

If issues arise:
1. **Immediate UI Rollback**:
   - Revert CreateNewItemDialog to use original VariableInput
   - Disable new variable definition dialogs
   - Fall back to string parsing input method

2. **Component Rollback**:
   - Remove new EnhancedVariableInput component
   - Remove VariableDefinitionDialog component
   - Remove autocomplete components

3. **Hook Rollback**:
   - Remove useVariableDefinitions hook
   - Revert useItemVariables to previous version

4. **Data Integrity**:
   - Ensure no data loss from partially created variable definitions
   - Provide migration path back to legacy format if needed

## Implementation Notes

### User Experience Design
- **Progressive Enhancement**: Start with basic inputs, add autocomplete as enhancement
- **Error Prevention**: Validate inputs in real-time to prevent errors
- **Discoverability**: Make it obvious when new variables are being created
- **Efficiency**: Minimize clicks and typing for common operations

### Technical Implementation
- **State Management**: Use local state for form, global state for definitions
- **Validation**: Implement both client-side and model-level validation
- **Performance**: Debounce autocomplete queries and cache results
- **Accessibility**: Follow WCAG guidelines throughout

### Integration Strategy
- **Backward Compatibility**: Support both old and new formats during transition
- **Migration Path**: Provide clear upgrade path for existing users
- **Feature Flags**: Allow disabling new UI if issues arise
- **Documentation**: Clear documentation for new workflow

### Component Design
- **Reusability**: Design components to work in multiple contexts
- **Composition**: Use small, focused components that compose well
- **Testing**: Design with testability in mind
- **Maintainability**: Clear separation of concerns and good abstractions

### Data Flow
1. User enters variable name and quantity
2. System checks if variable definition exists
3. If new variable, show definition capture dialog
4. If existing variable, auto-populate unit/category
5. Create VariableItem instance linked to definition
6. Update parent item with new variable
