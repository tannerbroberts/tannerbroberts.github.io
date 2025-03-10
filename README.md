# Features Roadmap

### UnScheduling

- Unscheduling button on items?

### Item List

- Item representing focusedItemId, if visible, shows with an eyeball

### Item Schedule

- ledger lines

- Time interval

### Saving Items

- Needs to be one item object at a time to avoid the need for saving super
  complex trees, and loading only what's needed

- Save an object to localStorage for now

- Save each ID as the key in localStorage, and the item as the value

- Getter function emulates fetch by batching multiple item id's into a single
  "get" call

# Item

- variables in items

- variables in variables
  - variable summary
  - custom variable summary view

## Item View

- Overlapping items
  - Overlapping containers
  - Overlapping Busy items

- Busy/Container item addition
  - Container item names show in a dropdown on the edge of any item view

### Accounting

- Accounting for the largest recent past item option, top-down

- Force priority decision for overlapping Busy items

- Items can have a "scheduled" timestamp which allows derriving the "now" moment
  - "scheduled" items can't be scheduled in a larger item

### Nice to Have

- Scheduling focus
  - Button to schedule an item starting at "focus"
  - Scheduling an item moves "focus" cursor to the end moment of the scheduled
    item

- Simple exact match search filter
  - Highlighted search match portion in searched items

### Felxibility...
- What the hell happens when I launch the app and users can't stand the UI?
  - To gaurd against that, hows about making the crucial elements MUCH more composable.

# Product Launch Vision

I share mealplans with other individuals in such a compelling way that they
begin using my app for food

- Easy building of the "lasagna dinner" meal
- Scheduling/saving a schedule (in localStorage is fine)
- Easy Summaries like calories, macros, vitamins/minerals, dollars, required
  equipment, etc.
- Easy sharing of the item (hard coded on a github pages site is fine)
- Easy scheduling
- Easy follow-along
- Easy accounting with celabrations for completion
- Simple priorities based conflict resolution (show this or that on the main
  schedule)
- Container items don't conflict
- Easy understanding of scheduling contract (clean kitchen before and after,
  calories, etc.)
