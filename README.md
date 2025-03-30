# Features Roadmap

### Item Schedule

- ledger lines
  - BUG: Setting intervals is all messed up
  - Choose the spacing programatically with a single exported value
  - A few more intervals?
  - Intervals that aren't labeled?
  - Create a component designed to be the spacing that offsets the start of
    ledger lines and schedules from the top of the screen so I can change the
    height of that programatically and in one place

### Saving Items

- Needs to be one item object at a time to avoid the need for saving super
  complex trees, and loading only what's needed

- Save an object to localStorage for now

- Save each ID as the key in localStorage, and the item as the value

- Getter function emulates fetch by batching multiple item id's into a single
  "get" call

### UnScheduling

- Unscheduling button on items?

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
  - To gaurd against that, hows about making the crucial elements MUCH more
    composable.

# Key Product Indicators
- Users can quickly swap one meal for another
- Users maintain all benefits of meal scheduling through a swap
- Share mealplans with other individuals
