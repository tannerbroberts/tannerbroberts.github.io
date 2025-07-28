# Step 2: Time Frame Realism

## Step Title & Dependencies
**Title**: Realistic Cooking Time Adjustments  
**Dependencies**: Step 1 (Variable Enhancement) complete

## Detailed Requirements

### Cooking Physics Research

#### Heat Transfer Considerations
- **Pan Heating**: 2-3 minutes for proper temperature
- **Bacon Cooking**: 8-10 minutes total for crispy results
- **Pancake Cooking**: 2-3 minutes per side, multiple batches
- **Egg Cooking**: 3-4 minutes for over-easy, 2-3 for scrambled
- **Temperature Recovery**: 30-60 seconds when adding new food

#### Multi-tasking Reality
- **Attention Splitting**: Tasks that require active monitoring
- **Prep Work**: Tasks that can be done while other things cook
- **Critical Timing**: Tasks that cannot be delayed or food will burn
- **Buffer Time**: Extra time for learning curve and safety

### Current vs. Realistic Time Analysis

#### Setup Phase (Currently 10 minutes → Proposed 12 minutes)
- **Clean Counters**: 2 min → 3 min (thorough cleaning)
- **Gather Ingredients**: 3 min → 4 min (checking expiration, organizing)
- **Gather Equipment**: 2 min → 3 min (finding, checking condition)
- **Wash Hands**: 1 min → 1 min (appropriate)
- **Place Pans**: 2 min → 1 min (simple task)

#### Cooking Phase (Currently 35 minutes → Proposed 38 minutes)
- **Start Bacon**: 2 min → 3 min (proper cold start, temperature setting)
- **Make Batter**: 3 min → 4 min (proper mixing technique, no lumps)
- **Flip Bacon**: 1 min → 1 min (appropriate for simple flip)
- **Heat Pancake Pan**: 2 min → 3 min (proper non-stick temperature)
- **First Pancake**: 1 min → 2 min (batter pouring, spreading)
- **Remove Bacon**: 2 min → 3 min (draining, paper towel setup)
- **Flip Pancake**: 1 min → 1 min (appropriate)
- **Start Eggs**: 2 min → 3 min (butter melting, temperature adjustment)
- **Continue Tasks**: Adjust remaining tasks proportionally

#### Cleanup Phase (Currently 15 minutes → Proposed 20 minutes)
- **Wash Pans**: 5 min → 7 min (grease removal, proper cleaning)
- **Wipe Counters**: 3 min → 4 min (thorough grease cleanup)
- **Put Away**: 4 min → 5 min (proper storage, organization)
- **Sweep Floor**: 2 min → 3 min (thorough floor cleaning)
- **Final Inspection**: 1 min → 1 min (appropriate)

### Critical Timing Adjustments

#### Bacon Timing Sequence
- **Start**: 0 minutes (cold pan start)
- **First Flip**: 6 minutes (proper browning)
- **Second Flip**: 12 minutes (even cooking)
- **Remove**: 18 minutes (crispy finish)

#### Pancake Timing Sequence
- **Heat Pan**: Start at 15 minutes (overlap with bacon)
- **First Pour**: 18 minutes (after pan is ready)
- **First Flip**: 21 minutes (bubbles formed, edges set)
- **First Remove**: 23 minutes (golden brown)
- **Continue Batches**: 3-4 minute intervals

#### Egg Timing Sequence
- **Heat Pan**: 24 minutes (final cooking phase)
- **Add Butter**: 26 minutes (proper melting)
- **Crack Eggs**: 27 minutes (controlled technique)
- **Monitor Cooking**: 28-32 minutes (desired doneness)

## Code Changes Required

### File: `src/components/RandomItemButton.tsx`

#### Duration Updates for Setup Phase
```typescript
// Update each setup task duration
const cleanCounters = new BasicItem({
  name: "Clean and clear all countertops",
  duration: 3 * 60 * 1000, // 3 minutes (was 2)
  // ... rest unchanged
});

const gatherIngredients = new BasicItem({
  name: "Gather ingredients: eggs, bacon, pancake mix, milk, oil",
  duration: 4 * 60 * 1000, // 4 minutes (was 3)
  // ... rest unchanged
});

// Similar updates for all setup tasks
```

#### Duration Updates for Cooking Phase
```typescript
// Update cooking phase total duration
const cookingPhase = new SubCalendarItem({
  name: "Timed Cooking Execution",
  duration: 38 * 60 * 1000, // 38 minutes (was 35)
  // ... rest unchanged
});

// Update individual cooking task durations
const startBacon = new BasicItem({
  name: "START: Place bacon in cold pan, turn heat to medium-low",
  duration: 3 * 60 * 1000, // 3 minutes (was 2)
  // ... rest unchanged
});

// Similar updates for all cooking tasks
```

#### Child Start Time Adjustments
```typescript
// Update cooking phase children timing
cookingPhase.children = [
  new Child({ id: startBacon.id, start: 0 }), // Start immediately
  new Child({ id: makePancakeBatter.id, start: 2 * 60 * 1000 }), // 2 minutes in (was 2)
  new Child({ id: flipBacon1.id, start: 6 * 60 * 1000 }), // 6 minutes in (was 8) - earlier flip
  new Child({ id: heatPancakePan.id, start: 15 * 60 * 1000 }), // 15 minutes in (was 10)
  new Child({ id: firstPancake.id, start: 18 * 60 * 1000 }), // 18 minutes in (was 12)
  new Child({ id: removeBacon.id, start: 18 * 60 * 1000 }), // 18 minutes in (was 15)
  // ... continue with adjusted timing
];
```

#### Main Lesson Duration Update
```typescript
// Update main lesson total duration
const mainLesson = new SubCalendarItem({
  name: "Complete Breakfast Cooking Lesson",
  duration: 70 * 60 * 1000, // 70 minutes (was 60)
});

// Update phase start times
mainLesson.children = [
  new Child({ id: setupPhase.id, start: 0 }), // 0-12 minutes
  new Child({ id: cookingPhase.id, start: 12 * 60 * 1000 }), // 12-50 minutes
  new Child({ id: cleanupPhase.id, start: 50 * 60 * 1000 }), // 50-70 minutes
];
```

## Testing Requirements

### Timing Validation Tests
1. **Setup Phase**: Verify 12-minute total duration with realistic task times
2. **Cooking Phase**: Verify 38-minute total with proper task overlaps
3. **Cleanup Phase**: Verify 20-minute total with thorough cleaning times
4. **Overall Lesson**: Verify 70-minute total lesson duration

### Critical Timing Tests
1. **Bacon Sequence**: Verify bacon tasks are properly spaced for cooking physics
2. **Pancake Sequence**: Verify pancake tasks allow for proper cooking times
3. **Egg Sequence**: Verify egg tasks allow for proper preparation and cooking
4. **Overlap Validation**: Verify multiple tasks can run simultaneously when appropriate

### Manual Testing Steps
1. **Create Enhanced Lesson**: Generate breakfast lesson with new timing
2. **Step Through Phases**: Manually verify each phase duration feels realistic
3. **Critical Task Timing**: Pay special attention to bacon/pancake/egg timing
4. **Multi-task Periods**: Verify that simultaneous tasks are manageable
5. **Learning Curve**: Verify timing allows for learning and mistakes

## Acceptance Criteria

### Timing Realism
- [x] Setup tasks allow sufficient time for thorough preparation
- [x] Cooking tasks reflect actual cooking physics and heat transfer
- [x] Critical cooking moments have adequate time buffers
- [x] Multi-tasking periods are realistic for a learning cook
- [x] Cleanup tasks allow for thorough kitchen restoration

### Cooking Physics Compliance
- [x] Bacon timing allows for proper cold-start cooking method
- [x] Pancake timing allows for proper batter rest and cooking
- [x] Egg timing allows for proper pan preparation and cooking
- [x] Pan heating times are realistic for temperature achievement
- [x] Food safety timing is maintained throughout

### User Experience
- [x] No task feels rushed or unrealistically quick
- [x] Adequate time for inexperienced cooks to follow along
- [x] Critical timing tasks have clear time boundaries
- [x] Overall lesson duration feels reasonable for the meal complexity
- [x] Timing promotes good cooking practices and safety

### Technical Compliance
- [x] All duration changes are properly implemented
- [x] Child start times are mathematically correct
- [x] Phase transitions occur at appropriate times
- [x] No timing conflicts or overlaps that would cause execution issues
- [x] Existing execution logic handles new timing correctly

## Rollback Plan

### Quick Rollback
1. **Revert Duration Constants**: Return all durations to original values
2. **Revert Child Timing**: Return all child start times to original values
3. **Test Original Timing**: Verify original 60-minute lesson works correctly

### Gradual Rollback
- **Phase-by-Phase**: Can revert individual phases if specific timing proves problematic
- **Task-by-Task**: Can revert individual tasks that prove too long or short
- **Critical Tasks**: Can specifically adjust critical cooking tasks independently

### Timing Validation
- **Real-world Testing**: Test timing with actual cooking if needed
- **User Feedback**: Adjust based on user experience with timing
- **Iterative Improvement**: Can fine-tune timing in subsequent updates
