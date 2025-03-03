# Features Roadmap

### Scheduling

- Time input component
  - New Item Dialog update
  - Schedule Item Dialog

### Saving Items

- Needs to be one item object at a time to avoid the need for saving super
  complex trees, and loading only what's needed
- Save an object to localStorage for now
- Save each ID as the key in localStorage, and the item as the value
- Getter function emulates fetch by batching multiple item id's into a single
  "get" call

### Item Schedule

- ledger lines

- Time interval

### Item List

- Item representing focusedItemId, if visible, shows with an eyeball

- Remove an item from another's schedule

### Item Model

- variables in items

- variables in variables
  - variable summary
  - custom variable summary view

### Dev

- Get testing environment setup

- better test item scafolding

### Accounting

- Accounting for the largest recent past item option, top-down

- Moving real-time scrolling with scheduled items

- Items can have a "scheduled" timestamp which allows derriving the "now" moment
  - "scheduled" items can't be scheduled in a larger item

### Nice to Have

- Scheduling focus
  - Button to schedule an item starting at "focus"
  - Scheduling an item moves "focus" cursor to the end moment of the scheduled
    item

- Simple exact match search filter
  - Highlighted search match portion in searched items

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
