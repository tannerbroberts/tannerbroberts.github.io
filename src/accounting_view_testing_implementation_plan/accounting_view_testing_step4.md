# Step 4: Expandable Accounting View Header

## Step Title & Dependencies
**Title**: Add collapsible header with expand/collapse functionality  
**Dependencies**: Step 3 (Accounting View Test Suite) should be completed to ensure base functionality works

## Detailed Requirements

### Expandable Header Design
Create a new header section for the AccountingView that:
1. **Default State**: Starts collapsed (closed) when first loaded
2. **Toggle Functionality**: Users can click to expand/collapse the main accounting content
3. **Visual Indicators**: Clear expand/collapse state indication (▶/▼ arrows)
4. **Smooth Animation**: Use Material-UI Collapse component for smooth transitions
5. **Header Content**: Display summary information even when collapsed

### Header Information Display
When collapsed, the header should show:
- Total number of incomplete accounting instances
- Quick action buttons (if applicable)
- Space reserved for badges (to be implemented in Step 5)

When expanded, show the full accounting view content as it currently exists.

### State Management
- Use local component state for expand/collapse status
- Persist user preference in localStorage (optional enhancement)
- Ensure state doesn't interfere with accounting view functionality

## Code Changes Required

### Files to Modify

#### `src/components/accounting/AccountingView.tsx`
- Add state for expanded/collapsed status
- Implement header section with toggle controls
- Wrap existing content in Material-UI Collapse component
- Add expand/collapse animation and visual indicators
- Maintain existing filtering and sorting functionality

### Implementation Details

#### Component Structure Changes
```typescript
// Example structure (not actual code):
const [isExpanded, setIsExpanded] = useState(false);

return (
  <Box>
    {/* New collapsible header */}
    <AccountingViewHeader 
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      instanceCount={accountingInstances.length}
    />
    
    {/* Existing content wrapped in Collapse */}
    <Collapse in={isExpanded}>
      {/* All existing AccountingView content */}
    </Collapse>
  </Box>
);
```

#### Header Component Design
- Clean, minimal design following Material-UI patterns
- Consistent with existing application header styles
- Responsive layout for different screen sizes
- Accessible with proper ARIA labels

#### Animation Requirements
- Smooth collapse/expand transitions (300ms duration)
- Proper handling of nested component animations
- No layout jumping or flickering during transitions
- Maintain scroll position when appropriate

### New Components to Create

#### `src/components/accounting/AccountingViewHeader.tsx`
- Dedicated header component for reusability
- Props for expanded state, toggle handler, and summary data
- Badge placeholder areas for Step 5 implementation
- Material-UI styling consistent with application theme

## Testing Requirements

### Unit Tests for Header Component
- Verify expand/collapse toggle functionality
- Test header renders correctly in both states
- Confirm animation properties are applied correctly
- Test accessibility features (ARIA labels, keyboard navigation)

### Integration Tests with AccountingView
- Ensure header integration doesn't break existing functionality
- Test that collapsed state properly hides content
- Verify expanded state shows all existing features
- Test responsive behavior at different screen sizes

### User Experience Tests
- Verify smooth animation performance
- Test rapid toggle operations
- Confirm no memory leaks during repeated toggling
- Test with large amounts of accounting data

### Test Files to Create/Modify
- `src/components/accounting/__tests__/AccountingViewHeader.test.tsx`
- Update existing `AccountingView.test.tsx` with collapse functionality tests

## Acceptance Criteria

### Core Functionality
- [ ] Accounting view starts in collapsed state by default
- [ ] Click interaction toggles between expanded and collapsed states
- [ ] Collapse animation is smooth and visually appealing (300ms duration)
- [ ] All existing accounting view functionality works when expanded
- [ ] Header shows basic summary information when collapsed

### Visual Design Requirements
- [ ] Clear visual indicators for expand/collapse state (arrows or icons)
- [ ] Header design is consistent with Material-UI theme
- [ ] Responsive layout works on mobile and desktop
- [ ] Loading states and empty states handled gracefully
- [ ] No layout shifts or jumping during animations

### User Experience Requirements
- [ ] Toggle is responsive and intuitive
- [ ] Keyboard navigation works properly (Enter/Space to toggle)
- [ ] Screen reader accessibility with proper ARIA labels
- [ ] Performance remains smooth with large datasets
- [ ] State persists appropriately during user session

### Integration Requirements
- [ ] No breaking changes to existing accounting view functionality
- [ ] Filters and sorting work correctly when expanded
- [ ] Component props and state management follow existing patterns
- [ ] No conflicts with other collapsible components in the application

## Rollback Plan

### UI Issues Recovery
1. **Animation Problems**: Remove animations and use instant show/hide
2. **Layout Issues**: Fall back to simple show/hide without Material-UI Collapse
3. **Performance Problems**: Implement lazy loading for collapsed content
4. **Responsive Issues**: Use simpler responsive design or remove responsive features

### State Management Issues
1. **State Conflicts**: Use more specific state keys or component-local state only
2. **Persistence Problems**: Remove localStorage integration and use session state only
3. **Re-render Issues**: Optimize component structure to minimize unnecessary renders

### Integration Problems
1. **Existing Feature Breaks**: Temporarily disable header and keep existing design
2. **Component Conflicts**: Isolate new header component from existing code
3. **Styling Conflicts**: Use more specific CSS classes or inline styles

### Clean Rollback Steps
1. Remove AccountingViewHeader component
2. Restore original AccountingView component structure
3. Remove any new dependencies or imports
4. Verify all existing tests pass
5. Ensure accounting view functionality is fully restored

### Partial Implementation Options
If full implementation encounters issues:
1. Implement basic show/hide without animations
2. Use simple button toggle instead of sophisticated header
3. Maintain existing layout with minimal changes
4. Focus on core toggle functionality first, enhance later
5. Implement desktop version first, mobile responsiveness later
