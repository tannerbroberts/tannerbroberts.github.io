# Features Roadmap

- Get testing environment setup

- better test item scafolding

- saving items

- Time input overlay

- ledger lines

- Item scheduling input

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
