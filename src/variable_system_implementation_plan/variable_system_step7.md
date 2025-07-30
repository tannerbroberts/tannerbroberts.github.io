# Step 7: Variable-based Filtering

## Step Dependencies
- **Prerequisites**: Step 6 (Description Cross-linking must be completed)
- **Next Steps**: Step 8 (Variable Description Popup)

## Detailed Requirements

Implement advanced filtering capabilities in the item search system that allows users to filter items based on variable quantities. This includes creating a new filter type in the library search bar that enables queries like "only show items with eggs >= 5" or "show items with dietary fat <= 10". The filtering operates on pre-calculated variable summaries for performance.

### Core Requirements
1. **Variable Filter UI**: Add variable filtering option to existing search/filter interface
2. **Filter Query Language**: Simple, user-friendly syntax for variable quantity filters
3. **Filter Parsing**: Parse user input into executable filter criteria
4. **Summary-based Filtering**: Use pre-calculated variable summaries for performance
5. **Multiple Filter Support**: Allow combining variable filters with existing name filters
6. **Filter Persistence**: Remember commonly used filters for user convenience

## Code Changes Required

### Create New Files

**File: `src/components/filters/VariableFilter.tsx`** (New)
- UI component for variable-based filtering
- Dropdown selector for variable names
- Operator selector (>=, <=, =, !=, >, <)
- Number input for filter value
- Integration with existing filter system

**File: `src/components/filters/VariableFilterBuilder.tsx`** (New)
- Advanced filter builder for complex variable queries
- Support for multiple variable filters with AND/OR logic
- Visual filter query builder interface
- Save/load custom filter combinations
- Export/import filter sets

**File: `src/functions/utils/filtering/variableFilterParser.ts`** (New)
- Parse natural language variable filter queries
- Convert user input to executable filter criteria
- Support for various input formats:
  - "eggs >= 5"
  - "dietary fat <= 10 grams"
  - "milk = 2 cups"
- Validate filter syntax and provide error messages

**File: `src/functions/utils/filtering/variableFilterEngine.ts`** (New)
- Execute variable filters against item variable summaries
- Combine multiple filter criteria efficiently
- Cache filter results for performance
- Support for fuzzy matching and unit conversion

**File: `src/hooks/useVariableFiltering.ts`** (New)
- Hook for managing variable filter state
- Integration with existing filter hooks
- Debounced filter execution
- Filter result caching and invalidation

### Modify Existing Files

**File: `src/components/ItemListFilter.tsx`**
- Add variable filter option to existing filter input
- Support for switching between name and variable filter modes
- Display active variable filters as chips
- Integration with new variable filtering system

**File: `src/components/PaginatedItemList.tsx`**
- Update filtering logic to include variable filters
- Combine name filters with variable filters
- Maintain performance with complex filter combinations

**File: `src/components/SideBar.tsx`**
- Add variable filter controls to sidebar
- Show active variable filters status
- Quick access to common variable filters

### Create Filter Components

**File: `src/components/filters/FilterChip.tsx`** (New)
- Display active variable filters as removable chips
- Visual representation of filter criteria
- One-click removal of individual filters
- Hover effects showing filter details

**File: `src/components/filters/VariableFilterSuggestions.tsx`** (New)
- Auto-complete suggestions for variable names
- Common filter templates (e.g., "low fat", "high protein")
- Recently used filters
- Integration with variable definitions

### Update Filtering Infrastructure

**File: `src/functions/utils/filtering/filterTypes.ts`** (New)
- Type definitions for variable filter system
- Filter criteria interfaces
- Filter result types
- Filter persistence types

**File: `src/hooks/useItemFiltering.ts`** (Update existing or create new)
- Unified hook for all item filtering (name + variable)
- Combine multiple filter types efficiently
- Maintain filter state across navigation
- Performance optimization for large item sets

## Testing Requirements

### Unit Tests

**File: `src/functions/utils/filtering/__tests__/variableFilterParser.test.ts`** (New)
- Test parsing of various filter syntax formats
- Test handling of malformed filter input
- Test unit conversion in filter criteria
- Test variable name resolution and validation
- Test error message generation for invalid syntax

**File: `src/functions/utils/filtering/__tests__/variableFilterEngine.test.ts`** (New)
- Test filter execution against variable summaries
- Test performance with large datasets
- Test combination of multiple filter criteria
- Test edge cases (missing variables, zero quantities)
- Test fuzzy matching and partial matches

**File: `src/components/filters/__tests__/VariableFilter.test.tsx`** (New)
- Test variable filter UI component functionality
- Test user interaction flow (select variable, operator, value)
- Test integration with filter parsing system
- Test validation and error display
- Test accessibility compliance

### Integration Tests

**File: `src/components/__tests__/ItemFiltering.integration.test.tsx`** (New)
- Test complete filtering workflow from UI to results
- Test combination of name and variable filters
- Test filter persistence across sessions
- Test performance with realistic data volumes
- Test filter result accuracy

**File: `src/hooks/__tests__/useVariableFiltering.test.ts`** (New)
- Test hook integration with AppState
- Test filter state management
- Test caching and invalidation logic
- Test performance optimization features
- Test error handling and recovery

### Performance Tests

**File: `src/functions/utils/filtering/__tests__/variableFilterPerformance.test.ts`** (New)
- Benchmark filter execution with large item sets
- Test memory usage with complex filter combinations
- Test filter cache effectiveness
- Test UI responsiveness during filtering
- Test optimization strategies

## Acceptance Criteria

### Filter Functionality Criteria
- [ ] Users can filter items by variable quantities using operators (>=, <=, =, !=, >, <)
- [ ] Multiple variable filters can be combined with AND logic
- [ ] Filters operate on pre-calculated variable summaries for performance
- [ ] Filter results are accurate and update dynamically
- [ ] Complex nested variable hierarchies are filtered correctly

### User Interface Criteria
- [ ] Variable filter UI is intuitive and easy to use
- [ ] Auto-complete helps users select variable names and common values
- [ ] Active filters are clearly displayed and easily removable
- [ ] Filter input supports natural language queries
- [ ] Error messages guide users to correct invalid filter syntax

### Performance Criteria
- [ ] Filtering large item sets (1000+ items) completes in under 500ms
- [ ] Filter results are cached to prevent redundant calculations
- [ ] UI remains responsive during filter execution
- [ ] Memory usage remains bounded with complex filter combinations
- [ ] Filter updates don't cause unnecessary re-renders

### Integration Criteria
- [ ] Variable filters work alongside existing name filters
- [ ] Filtered results integrate with pagination system
- [ ] Filter state persists across navigation
- [ ] Filters work in all contexts where items are displayed
- [ ] Filter system is extensible for future filter types

### Validation Criteria
- [ ] Invalid variable names are rejected with helpful error messages
- [ ] Malformed filter syntax is handled gracefully
- [ ] Unit mismatches are detected and reported
- [ ] Circular filter logic is prevented
- [ ] Filter criteria validation prevents performance issues

### Accessibility Criteria
- [ ] Filter controls are fully accessible to screen readers
- [ ] Keyboard navigation works throughout filter interface
- [ ] Filter status is announced to assistive technology
- [ ] High contrast mode is supported
- [ ] Filter controls follow WCAG accessibility guidelines

## Rollback Plan

If critical issues arise:
1. **UI Rollback**:
   - Remove variable filter controls from ItemListFilter
   - Remove variable filter displays from SideBar
   - Hide variable filter options in all UI locations

2. **Functionality Rollback**:
   - Disable variable filtering in PaginatedItemList
   - Revert to name-only filtering
   - Remove variable filter engine integration

3. **Component Rollback**:
   - Remove VariableFilter and related components
   - Remove VariableFilterBuilder advanced features
   - Remove filter suggestions and auto-complete

4. **Data Rollback**:
   - Remove filter state from AppState if added
   - Clear any cached filter results
   - Remove filter persistence data

## Implementation Notes

### Filter Query Language Design
- **Simple Syntax**: Support intuitive queries like "eggs >= 5"
- **Natural Language**: Accept various phrasings ("at least 5 eggs", "5+ eggs")
- **Unit Awareness**: Handle unit specifications ("10 grams fat")
- **Error Prevention**: Clear syntax rules with helpful error messages

### Performance Strategy
- **Summary-based**: Always filter against pre-calculated variable summaries
- **Indexing**: Create indexes for common variable filter queries
- **Caching**: Cache filter results with proper invalidation
- **Lazy Evaluation**: Only calculate filters when needed

### User Experience Design
- **Progressive Disclosure**: Start with simple filters, allow complexity
- **Discoverability**: Make variable filtering feature discoverable
- **Feedback**: Provide immediate feedback on filter effectiveness
- **Efficiency**: Minimize clicks and typing for common filters

### Integration Strategy
- **Non-breaking**: Add variable filtering without breaking existing functionality
- **Composable**: Design filters to compose with other filter types
- **Extensible**: Architecture supports adding more filter types later
- **Consistent**: Follow existing filter UI and interaction patterns

### Data Considerations
- **Summary Dependency**: Ensure variable summaries are always up-to-date
- **Relationship Tracking**: Handle variable filters across item hierarchies
- **Unit Normalization**: Consistent unit handling for filter comparisons
- **Missing Data**: Graceful handling of items without variables

### Performance Optimizations
- **Debouncing**: Debounce filter input to prevent excessive execution
- **Batching**: Batch filter updates for multiple simultaneous changes
- **Memoization**: Memoize expensive filter calculations
- **Pagination**: Integrate efficiently with pagination system
