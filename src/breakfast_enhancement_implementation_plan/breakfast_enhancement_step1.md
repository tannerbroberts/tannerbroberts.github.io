# Step 1: Variable Enhancement

## Step Title & Dependencies
**Title**: Comprehensive Variable Definitions for Cooking Tasks  
**Dependencies**: None (first step)

## Detailed Requirements

### Variable Categories to Implement
1. **Ingredients** (consumed during cooking):
   - Eggs (-quantity needed)
   - Bacon (-strips needed)
   - Pancake mix (-cups needed)
   - Milk (-cups needed)
   - Butter (-tablespoons needed)
   - Oil (-teaspoons needed)

2. **Equipment** (used but not consumed):
   - Large frying pan (bacon)
   - Medium frying pan (eggs)
   - Non-stick pan (pancakes)
   - Spatulas
   - Measuring cups
   - Whisk
   - Paper towels

3. **Consumables** (used up during process):
   - Dish soap
   - Sponges
   - Paper towels for cleanup

4. **Waste Products** (generated):
   - Dirty dishes (+quantity)
   - Food scraps (+weight)
   - Used paper towels (+quantity)

### Specific Variable Assignments by Task

#### Setup Phase Variables
- **Clean Counters**: +1 clean_workspace, -1 cleaning_supplies
- **Gather Ingredients**: +1 ingredient_readiness
- **Gather Equipment**: +1 equipment_readiness
- **Wash Hands**: +1 hygiene_compliance
- **Place Pans**: +1 cooking_station_ready

#### Cooking Phase Variables
- **Start Bacon**: -6 bacon_strips, +1 large_frying_pan (in use)
- **Make Pancake Batter**: -1 pancake_mix cup, -0.75 milk cup, +1 whisk (dirty)
- **Flip Bacon**: +1 bacon_cooking_skill
- **Heat Pancake Pan**: -1 oil tsp, +1 nonstick_pan (in use)
- **First Pancake**: -0.25 pancake_batter cup
- **Remove Bacon**: +6 cooked_bacon_strips, +3 paper_towels (dirty), -1 large_frying_pan (freed)
- **Flip Pancake**: +1 pancake_flipping_skill
- **Start Eggs**: -2 eggs, -1 butter tbsp, +1 medium_frying_pan (in use)
- **Continue Cooking**: Progressive consumption of remaining batter and production of meals

#### Cleanup Phase Variables
- **Wash Pans**: +3 clean_pans, -1 dish_soap, -2 sponges
- **Wipe Counters**: +1 clean_workspace, -3 paper_towels
- **Put Away Ingredients**: +1 organized_kitchen
- **Sweep Floor**: +1 clean_floor, +1 food_scraps (disposed)
- **Final Inspection**: +1 kitchen_cleanliness_rating

## Code Changes Required

### File: `src/components/RandomItemButton.tsx`

#### Enhanced Variable Definitions
- Add import for Variable types and creation utilities
- Create variable definition functions for each cooking phase
- Integrate variables into item creation process
- Add variables to each BasicItem during creation

#### New Helper Functions
- `createSetupPhaseVariables()`: Return setup task variables
- `createCookingPhaseVariables()`: Return cooking task variables  
- `createCleanupPhaseVariables()`: Return cleanup task variables
- `applyVariablesToItems()`: Apply variables to created items

#### Integration Points
- Modify `createCompleteCookingLesson()` to include variable application
- Ensure variables are properly assigned during item dispatch
- Add variable summary validation

### File: `src/functions/utils/variable/utils.ts` (if needed)

#### Potential Enhancements
- Add cooking-specific variable categories if not present
- Enhance parsing for cooking measurements (cups, tbsp, tsp, strips)
- Add validation for cooking variable formats

## Testing Requirements

### Unit Tests
1. **Variable Creation**: Test that each cooking task has appropriate variables
2. **Variable Summary**: Verify aggregated summary calculations work correctly
3. **Category Grouping**: Test that variables are properly categorized
4. **Quantity Calculations**: Verify positive/negative quantities are handled correctly

### Integration Tests
1. **Item Creation**: Test that items are created with variables successfully
2. **Variable Inheritance**: Test that parent items show child variable summaries
3. **Display Integration**: Test that VariableSummaryDisplay works with cooking variables

### Manual Testing Steps
1. **Create Breakfast Lesson**: Click the cooking lesson button
2. **Verify Variables**: Open variable management for individual tasks
3. **Check Summaries**: Verify main lesson shows aggregated ingredient needs
4. **Variable Display**: Confirm variables show in execution view
5. **Category Grouping**: Verify variables are grouped by category appropriately

## Acceptance Criteria

### Variable Completeness
- [x] All setup tasks have relevant variables assigned
- [x] All cooking tasks have ingredient consumption variables
- [x] All cooking tasks have equipment usage variables
- [x] All cleanup tasks have consumable and waste variables
- [x] Variable quantities are realistic and accurate

### Variable Quality
- [x] Negative quantities for consumed items (ingredients, consumables)
- [x] Positive quantities for produced items (cooked food, waste)
- [x] Neutral quantities for equipment (marked as in-use/freed)
- [x] Appropriate units (cups, tbsp, tsp, strips, pieces)
- [x] Meaningful categories (ingredients, equipment, consumables, waste)

### Integration Success
- [x] Variables are automatically assigned when breakfast lesson is created
- [x] Variable summaries calculate correctly for parent items
- [x] Variable displays work in management dialog
- [x] Variable displays work in execution view
- [x] No errors in variable parsing or display

### Technical Quality
- [x] All TypeScript types are properly maintained
- [x] No console errors during variable creation or display
- [x] Variable data is properly persisted
- [x] Performance remains acceptable with added variables

## Rollback Plan

### Quick Rollback
1. **Revert RandomItemButton**: Remove variable assignments from cooking lesson creation
2. **Clear Variable Data**: Clear any stored variables for cooking items if needed
3. **Test Basic Functionality**: Verify cooking lesson still creates and works

### Graceful Degradation
- If variable display fails, items should still function normally
- If variable calculations fail, items should work without variable summaries
- If variable persistence fails, lesson should still be usable for current session

### Data Recovery
- Original cooking lesson structure remains intact
- Variables are additive - removing them doesn't break existing items
- All item relationships and timing remain unchanged
