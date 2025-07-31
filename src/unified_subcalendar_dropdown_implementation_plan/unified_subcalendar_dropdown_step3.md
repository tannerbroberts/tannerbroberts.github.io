# Step 3: Create Unified Dropdown Content Component

## Step Title & Dependencies
**Create a new UnifiedDropdownContent component that combines task details and variable summary**
- **Dependencies**: Steps 1-2 must be completed
- **Estimated Time**: 60 minutes

## Audit Requirements
During this step, the implementing agent must:
- Update `src/components/execution/feature-description.md` to document the new UnifiedDropdownContent component
- Ensure the new component follows established component patterns in `src/components/feature-description.md`
- Document the component's role in the unified dropdown architecture
- Cross-reference with variable system documentation to ensure proper integration
- Create comprehensive component documentation with usage examples

## Detailed Requirements
- Create a new component `UnifiedDropdownContent.tsx` in the execution folder
- Design the component to display both task execution details and variable summary information
- Use Material-UI components consistent with the existing design system
- Implement proper spacing and layout using Material-UI Grid or Box components
- Add smooth animations for expand/collapse transitions
- Support both compact and expanded view modes
- Ensure responsive design for different screen sizes
- Include proper TypeScript interfaces and props validation

## Code Changes Required

### Files to Create
1. **`/Users/tannerbrobers/dev/ATP/src/components/execution/UnifiedDropdownContent.tsx`**
   - Create interface for component props including variable summary and task details
   - Implement layout that shows both variable information and task execution details
   - Use Collapse component from Material-UI for smooth animations
   - Include sections for: variable summary, next task information, gap period guidance
   - Add proper styling consistent with existing execution components
   - Implement responsive design with proper breakpoints

### Component Interface
```typescript
interface UnifiedDropdownContentProps {
  readonly isExpanded: boolean;
  readonly variableSummary: VariableSummary;
  readonly hasVariables: boolean;
  readonly nextChild?: NextChildInfo;
  readonly gapPeriod?: boolean;
  readonly currentPhase?: string;
  readonly childExecutionStatus?: ChildExecutionStatus;
}
```

### Layout Structure
- **Variable Summary Section**: Display variables with proper categorization and styling
- **Task Details Section**: Show next task information, gap periods, and execution guidance
- **Status Information**: Display current execution phase and contextual guidance
- **Visual Separators**: Use dividers and spacing to clearly separate sections

## Testing Requirements

### Unit Tests
- Test component renders correctly with various prop combinations
- Verify expand/collapse animations work smoothly
- Test responsive behavior at different screen sizes
- Ensure proper handling when no variables are present
- Test that all sections render correctly with different data states
- Verify TypeScript type checking for all props

### Integration Tests
- Test integration with Material-UI theme system
- Verify component works within Collapse animations
- Test component accessibility with screen readers
- Ensure proper spacing and layout in different contexts

### Manual Testing Steps
1. Create test instances with various variable combinations
2. Test expand/collapse animations for smoothness
3. Verify responsive design on mobile and desktop
4. Check that all sections display correctly with real data
5. Test accessibility with keyboard navigation
6. Verify proper styling consistency with existing components

## Acceptance Criteria
- [ ] UnifiedDropdownContent component created in execution folder
- [ ] Component accepts all required props with proper TypeScript interfaces
- [ ] Layout displays both variable summary and task details clearly
- [ ] Smooth expand/collapse animations implemented
- [ ] Responsive design works on all screen sizes
- [ ] Component follows existing Material-UI styling patterns
- [ ] Proper spacing and visual hierarchy implemented
- [ ] Accessibility attributes and keyboard navigation support
- [ ] Handles edge cases (no variables, no next tasks, etc.)
- [ ] All TypeScript types properly defined and validated
- [ ] Component exports and imports work correctly

## Rollback Plan
If issues arise during this step:
1. Delete the UnifiedDropdownContent.tsx file
2. Remove any imports or references to the new component
3. Ensure no broken imports remain in the codebase
4. Run tests to verify system stability
5. Document any lessons learned for future implementation attempts

## Documentation Updates
- Add comprehensive JSDoc comments for the component and its props
- Document the component's role in the unified dropdown architecture
- Create usage examples showing different prop combinations
- Document responsive behavior and accessibility features
- Add notes about integration with the variable system
