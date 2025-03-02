# Features Roadmap

- saving items
  - Needs to be one item object at a time to avoid the need for saving super complex trees, and loading only what's needed
  - Save an object to localStorage for now
  - Save each ID as the key in localStorage, and the item as the value
  - Getter function emulates fetch by batching multiple item id's into a single "get" call

- ledger lines

- Time interval

- Item scheduling input

- Scheduling focus
  - Button to schedule an item starting at "focus"
  - Scheduling an item moves "focus" cursor to the end moment of the scheduled item

- Get testing environment setup

- better test item scafolding

- Time input overlay

- variables in items

- variables in variables
  - variable summary
  - custom variable summary view

- recursive updating of items and variables
- Item change
  - Recreating the Item object in the reducer ought to be sufficient to render any updates to the UI
- Child start change
  - The child, and the parent reference of the child item, needs updating

- work out item schedule state
  - Memoizing is obviously good, but how to make sure updates in the reducer pair with needed updates in the UI?
  - Remember, changing object reference equality is the update command
  - perfect optimization is a 1:1 change to UI-consuming-change update ratio

- Accounting for the largest recent past item option, top-down

- Moving real-time scrolling with scheduled items

- Items can have a "scheduled" timestamp which allows derriving the "now" moment
  - "scheduled" items can't be scheduled in a larger item

# Product Launch Vision
I share mealplans with other individuals in such a compelling way that they begin using my app for food
  - Easy building of the "lasagna dinner" meal
  - Scheduling/saving a schedule (in localStorage is fine)
  - Easy Summaries like calories, macros, vitamins/minerals, dollars, required equipment, etc.
  - Easy sharing of the item (hard coded on a github pages site is fine)
  - Easy scheduling
  - Easy follow-along
  - Easy accounting with celabrations for completion
  - Simple priorities based conflict resolution (show this or that on the main schedule)
  - Container items don't conflict
  - Easy understanding of scheduling contract (clean kitchen before and after, calories, etc.)
