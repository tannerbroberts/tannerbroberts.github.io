# About Time Project (ATP)

Documentation Hub: See [docs/README.md](./docs/README.md) for the hierarchical index and update process.

<!-- GOV-SUMMARY:BEGIN -->
<!-- Auto-generated governance summary. Do not edit inside markers; run `npm run docs:gov` -->
### Stats
- Mapped markdown files: 28
- Process doc hash: 822a9380
- Coverage map hash: 851d65a7
- Breadcrumb map hash: 8f0860bd

### Code → Doc Coverage
- src/components/ → src/components/feature-description.md
- src/functions/ → src/functions/feature-description.md
- src/hooks/ → src/hooks/feature-description.md
- src/reducerContexts/ → src/reducerContexts/feature-description.md
- src/utils/ → src/utils/feature-description.md
- server/ → server/README.md


_Last updated: 2025-08-13T16:37:26.386Z_
<!-- GOV-SUMMARY:END -->

# About Time Project (ATP)

## Key Architectural Concepts

### Item Templates vs. Scheduled Instances
**Critical Distinction**: The system has two fundamental concepts:

1. **Item Templates** - Reusable definitions that can be instantiated multiple times
   - BasicItem templates define simple tasks
   - CheckListItem templates define task lists with child templates
   - SubCalendarItem templates define schedulable containers with child templates
   - Templates have no completion state, execution time, or instance-specific data
   - Templates are what users create, edit, and manage in the sidebar

2. **Scheduled Instances** - Actual executions of templates placed on the calendar
   - Created when templates are scheduled via the scheduling dialogs
   - Have start times, completion states, and execution-specific data
   - Previously appeared in a dedicated execution view (now removed) and the calendar timeline
   - Multiple instances can be created from the same template

### Focused Views for Template Editing
The focused item views (when selecting from sidebar) are for **editing templates**, not viewing instances:
- FocusedBasicItemDisplay: Template properties and configuration
- FocusedCheckListItemDisplay: Template structure and child template relationships  
- FocusedSubCalendarItemDisplay: Template timeline and child template scheduling

---

## Current Issues & Notes

The time increments need to auto-scale with the size of the item being viewed, and the user, instead of picking a time unit, needs to be able to pick small, medium and large sizes that correspond to 1 screen height per calendar duration, 2 screen heights per calendar duration, and 6 screen heights per calendar duration.

The scheduler needs to give the units in terms of offset from the current moment. That moment should be calculated when the user schedules the item. They should also be able to round to the nearest minute, hour, day, etc.

The ItemSchedule needs to show for only subcalendar items and there needs to be corresponding view types to view checklist items, basic items, and variables.

Scheduling children doesn't seem to allow for more than one child.

Checklists need filter options to do things like show only the top 3 items, show only started items, show only complete items, only pending items, etc.

Checklists and Sub Calendar items need to enable a prioritization decision from of users.

David says all priority levels need to show on the execution view... Or something
  Tanner says maybe we need another view.

Up next should show on the execution view

```javascript
"I don't like a lot about the 'Variable' idea in this application. My goal is that a variable be incredibly simple, but at the moment it's much too complex. Variables should literally just be a name and an associated quantity. They shouldn't have a definition file, they shouldn't have units, they shouldn't extend off of the item class, they should simply be hosted inside of an item definition. Items should all be able to have variables, so the hosting should be done on the item class level. Each item should have a variable property in its JSON, and that variable property should be an object. Each variable name should be a key in that object. Each variable value specific to that item should be a value corresponding to that key. Similarly, there should be a variable summary object that adds up all of the variables of children in each item. It should be an object with key value pairs, but it should specifically not include an items own variables, only variables of its children. This should lead to an optimization strategy where variable summaries are calculated and propagated up the graph of all parents that schedule the updated item within them."
```