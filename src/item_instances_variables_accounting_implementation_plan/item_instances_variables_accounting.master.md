# Item Instances, Variables, and Accounting View Implementation Plan

## Feature Overview

This feature addresses three interconnected requirements to transform the ATP application from a simple template system to a robust execution tracking and resource management system:

1. **Item Instances**: Track individual execution instances of scheduled items, maintaining pure item templates while capturing execution-specific details
2. **Variables System**: Implement a variable system where items can define resource inputs/outputs (e.g., "-1 egg", "+1 cracked egg") 
3. **Accounting View**: Create a view for tracking past incomplete items and variable accounting

## Architecture Impact

### Current State Analysis
- Items are currently treated as both templates and execution instances
- No tracking of individual scheduled execution sessions
- No concept of variables or resource management
- No accounting for past incomplete tasks

### New Architecture Components
- **ItemInstance**: New entity tracking execution state for each scheduled item
- **Variable**: New entity for resource tracking with quantity management
- **VariableSummary**: Computed summaries for parent items showing child variable totals
- **Accounting View**: New UI component for incomplete task and variable management
- **Enhanced Storage**: Extensions to handle instances and variables persistence

## Key Behavioral Requirements

### Completion Control
- **NO AUTOMATIC COMPLETION**: Items/instances are never marked complete by the application automatically
- **USER-ONLY COMPLETION**: Only explicit user actions can mark items complete
- **CASCADING COMPLETION**: When user marks a parent complete, all children are marked complete (saves time for adherent execution)
- **DEVIATION HANDLING**: Users who deviate from planned execution should not mark parent complete (would be lying)

### Variable Summaries
- **INCLUSIVE CALCULATION**: Variable summaries include BOTH parent item's variables AND recursively summed children variables
- **COMPLETE ACCOUNTING**: Provides full picture of resource impact for any item

### Accounting View Behavior
- **LARGEST PARENT GROUPING**: Show largest possible past incomplete items to avoid redundancy
- **NO CHILD OVERLAP**: If 10-minute item is complete but hour-long parent is still executing, show neither until hour-long completes
- **HIERARCHICAL EFFICIENCY**: When hour-long item completes, it replaces all its children in the accounting view
- **POSITION**: Accounting view appears ABOVE execution view in main interface

### Execution View Enhancements
- **CHILD STARTING**: Checklist items in execution can start their children (marks as "in progress")
- **START TIME TRACKING**: Starting a child begins timing that specific item
- **MAIN USE SCREEN**: Execution view + Accounting view together form primary user interface

### Instance Management
- **DEFAULT INCOMPLETE**: All instances start incomplete by default
- **TEMPLATE PRESERVATION**: Item templates remain pure - no execution state contamination
- **INDEPENDENT TRACKING**: Multiple schedules of same item create separate instances

## Implementation Strategy

The implementation follows a layered approach:
1. **Foundation**: Core data models and types
2. **Integration**: Reducer and storage system updates
3. **Execution**: Enhanced execution view with instance tracking
4. **Variables**: Variable system implementation
5. **Accounting**: New accounting view
6. **Polish**: UI enhancements and testing

## Step Breakdown

### [Step 1: Core Data Models](./item_instances_variables_accounting_step1.md)
- Create ItemInstance, Variable, and related types
- Implement JSON serialization/deserialization
- Create utility functions for instance management
- Ensure all instances default to incomplete status

### [Step 2: Storage and Reducer Integration](./item_instances_variables_accounting_step2.md)
- Extend AppReducer with instance and variable actions
- Update storage system to persist instances and variables
- Implement migration for existing data
- Add actions for user-controlled completion only

### [Step 3: Instance Tracking in Execution](./item_instances_variables_accounting_step3.md)
- Modify execution system to create and track instances
- Update execution components to work with instances
- Implement start time tracking for checklist items
- Add UI for starting children from execution view

### [Step 4: Variables System](./item_instances_variables_accounting_step4.md)
- Add variable definition UI to item creation/editing
- Implement variable summary calculations (parent + children)
- Add collapsible variable display to execution views
- Ensure variable summaries include both parent and child variables

### [Step 5: Accounting View](./item_instances_variables_accounting_step5.md)
- Create AccountingView component positioned above ExecutionView
- Implement incomplete task filtering with largest-parent grouping
- Add variable accounting aggregation
- Handle completion cascading for user-marked items only
- Prevent automatic completion - only user actions mark complete

### [Step 6: Enhanced UI and Polish](./item_instances_variables_accounting_step6.md)
- Integrate accounting view above execution view in main interface
- Implement user-controlled completion controls
- Add validation and error handling
- Performance optimizations
- Ensure proper hierarchical grouping in accounting view

## Acceptance Criteria

### Item Instances
- [x] Items remain pure templates without execution residue
- [x] Each scheduled item creates a separate instance
- [x] Instances track completion status and start times
- [x] Multiple schedules of the same item create independent instances

### Variables System
- [x] Items can define variables with quantities (e.g., {"type": "variable", "name": "egg", "quantity": 1})
- [x] Variable summaries display on parent items by recursively summing child variables AND including parent's own variables
- [x] Variable summaries are collapsible in execution view headers
- [x] Variables support positive and negative quantities

### Accounting View
- [x] Shows all past incomplete instances (not currently executing)
- [x] Filters out instances currently in execution
- [x] Groups instances by largest possible parent (avoids showing children of visible parents)
- [x] Supports marking instances as complete (ONLY user action marks complete - never automatic)
- [x] Completion of parent instances cascades to auto-complete children (user-initiated only)
- [x] Variable accounting reflects completion status changes
- [x] Positioned above execution view in main interface

### New Functionality
- [x] Checklist items can track when they start (for child scheduling in execution view)
- [x] Instance completion doesn't affect item template
- [x] Variable tracking enables resource planning and validation
- [x] All instances start incomplete by default - NO automatic completion
- [x] Execution view enables starting children of checklist items

## Risk Assessment

### Technical Risks
- **Data Migration**: Existing scheduled items need to create instances retroactively
- **Performance**: Variable calculation recursion could impact large hierarchies  
- **Storage Bloat**: Instance tracking may significantly increase storage usage

### Mitigation Strategies
- Implement careful migration with fallback recovery
- Add memoization and lazy loading for variable calculations
- Use efficient storage patterns and cleanup old instances
- Comprehensive testing for edge cases and performance

### Complexity Risks
- Multiple new concepts may overwhelm users
- Variable system adds significant UI complexity
- Accounting view requires careful UX design

### User Experience Mitigation
- Progressive disclosure for advanced features
- Clear documentation and onboarding
- Intuitive defaults and smart suggestions
- Consistent visual language across new components

## Dependencies

- All steps are sequential due to data model dependencies
- Step 3 requires completion of Steps 1-2 for instance infrastructure
- Step 4 can be developed in parallel with Step 3 after Step 2
- Step 5 requires Steps 3-4 for complete functionality
- Step 6 is polish and can be done incrementally

## Data Model Changes

### New Entities
```typescript
interface ItemInstance {
  id: string;
  itemId: string;
  calendarEntryId: string;
  startTime?: number; // When instance actually started
  completedAt?: number;
  isComplete: boolean;
  executionDetails: Record<string, any>;
}

interface Variable {
  type: "variable";
  name: string;
  quantity: number;
}

interface VariableSummary {
  [variableName: string]: number; // Net quantity (includes parent + children)
}
```

### Storage Schema Extensions
- Add `itemInstances: Map<string, ItemInstance>` to AppState
- Add `variables: Map<string, Variable[]>` to AppState (keyed by itemId)
- Extend BaseCalendarEntry to reference ItemInstance

## Testing Strategy

### Unit Tests
- Data model serialization/deserialization
- Variable calculation accuracy
- Instance lifecycle management
- Reducer action handling

### Integration Tests
- End-to-end instance creation from scheduling
- Variable summary calculation with complex hierarchies
- Accounting view filtering and completion
- Storage persistence and migration

### Manual Testing
- User workflows for all three features
- Performance with large datasets
- Edge cases: orphaned instances, missing data
- Cross-browser compatibility

## Success Metrics

- Items remain pure templates (no execution state bleeding)
- Variable calculations perform under 100ms for typical hierarchies
- Accounting view loads under 500ms with 1000+ instances
- Zero data loss during migration
- User can complete full workflow: schedule → execute → start children → account → mark complete
- NO automatic completion occurs anywhere in the system
- Variable summaries accurately reflect parent + children totals
- Accounting view efficiently groups by largest incomplete parents
- Main interface provides seamless accounting + execution workflow

## Comprehensive Requirements Summary

### Core Behavioral Requirements
1. **NO AUTOMATIC COMPLETION**: Items/instances are NEVER marked complete automatically by the system
2. **USER-ONLY COMPLETION**: Only explicit user actions (button clicks, UI interactions) can mark items complete
3. **CASCADING COMPLETION**: When user marks parent complete, system cascades to mark all children complete (saves time for adherent execution)
4. **TEMPLATE PRESERVATION**: Item templates remain pure - execution state only exists in instances
5. **DEFAULT INCOMPLETE**: All instances start incomplete and remain so until user explicitly marks complete

### Variable System Requirements
1. **INCLUSIVE SUMMARIES**: Variable summaries include BOTH parent item's own variables AND recursively summed children variables
2. **COMPLETE ACCOUNTING**: Provides full resource impact picture for any item at any level
3. **POSITIVE/NEGATIVE QUANTITIES**: Support for resource consumption (-1 egg) and production (+1 cracked egg)

### Accounting View Requirements
1. **HIERARCHICAL GROUPING**: Show largest possible incomplete parents to avoid redundancy
2. **NO CHILD OVERLAP**: If parent is visible, don't show its children
3. **SMART FILTERING**: Example: If 10-min item complete but hour-long parent executing, show neither until hour-long completes
4. **POSITION**: Above execution view in main interface for seamless workflow
5. **PAST INCOMPLETE ONLY**: Only show instances that are past scheduled time and incomplete

### Execution View Requirements
1. **CHILD STARTING**: Enable manual starting of children from checklist execution (marks as "in progress")
2. **START TIME TRACKING**: When child starts, begin timing that specific item
3. **MAIN WORKFLOW**: Combined with accounting view, forms primary user interface
4. **INSTANCE AWARENESS**: Work with instances instead of directly modifying item templates

### Interface Layout Requirements
1. **UNIFIED MAIN SCREEN**: Accounting view above, execution view below
2. **SEAMLESS WORKFLOW**: Users mark completion above, start tasks below
3. **RESPONSIVE DESIGN**: Both views scale appropriately
4. **NO AUTOMATIC TRANSITIONS**: All actions require explicit user interaction

This implementation transforms ATP into a comprehensive execution tracking and resource management system while maintaining strict user control over all completion actions and providing intelligent hierarchical organization of tasks.
