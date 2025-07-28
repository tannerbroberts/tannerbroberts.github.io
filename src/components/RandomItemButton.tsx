import { Button } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch } from "../reducerContexts/App";
import { BasicItem, SubCalendarItem, CheckListItem, CheckListChild, Child, Parent, VariableImpl, Variable } from "../functions/utils/item/index";

/**
 * Create setup phase variables for cooking lesson items
 */
function createSetupPhaseVariables(taskName: string): Variable[] {
  switch (taskName.toLowerCase()) {
    case 'clean counters':
      return [
        new VariableImpl({ name: 'clean_workspace', quantity: 1, category: 'workspace' }),
        new VariableImpl({ name: 'cleaning_supplies', quantity: -1, category: 'consumables' })
      ];
    case 'gather ingredients':
      return [
        new VariableImpl({ name: 'ingredient_readiness', quantity: 1, category: 'preparation' })
      ];
    case 'gather equipment':
      return [
        new VariableImpl({ name: 'equipment_readiness', quantity: 1, category: 'preparation' })
      ];
    case 'wash hands':
      return [
        new VariableImpl({ name: 'hygiene_compliance', quantity: 1, category: 'safety' })
      ];
    case 'place pans':
      return [
        new VariableImpl({ name: 'cooking_station_ready', quantity: 1, category: 'preparation' })
      ];
    default:
      return [];
  }
}

/**
 * Create cooking phase variables for cooking lesson items
 */
function createCookingPhaseVariables(taskName: string): Variable[] {
  const task = taskName.toLowerCase();

  // Bacon-related tasks
  if (task.includes('bacon')) {
    return createBaconVariables(task);
  }

  // Pancake-related tasks
  if (task.includes('pancake')) {
    return createPancakeVariables(task);
  }

  // Egg-related tasks
  if (task.includes('egg')) {
    return createEggVariables(task);
  }

  // Final preparation tasks
  if (task.includes('plate food')) {
    return [
      new VariableImpl({ name: 'plated_breakfast', quantity: 1, category: 'food' }),
      new VariableImpl({ name: 'dirty_plates', quantity: 2, category: 'waste' })
    ];
  }

  return [];
}

/**
 * Create variables for bacon-related cooking tasks
 */
function createBaconVariables(task: string): Variable[] {
  if (task.includes('start') && task.includes('bacon')) {
    return [
      new VariableImpl({ name: 'bacon_strips', quantity: -6, category: 'ingredients' }),
      new VariableImpl({ name: 'large_frying_pan', quantity: 1, category: 'equipment' })
    ];
  }

  if (task.includes('flip bacon')) {
    return [
      new VariableImpl({ name: 'bacon_cooking_skill', quantity: 1, category: 'skills' })
    ];
  }

  if (task.includes('remove bacon')) {
    return [
      new VariableImpl({ name: 'cooked_bacon_strips', quantity: 6, category: 'food' }),
      new VariableImpl({ name: 'paper_towels', quantity: -3, category: 'consumables' }),
      new VariableImpl({ name: 'large_frying_pan', quantity: -1, category: 'equipment' })
    ];
  }

  return [];
}

/**
 * Create variables for pancake-related cooking tasks
 */
function createPancakeVariables(task: string): Variable[] {
  if (task.includes('pancake batter')) {
    return [
      new VariableImpl({ name: 'pancake_mix', quantity: -1, unit: 'cup', category: 'ingredients' }),
      new VariableImpl({ name: 'milk', quantity: -0.75, unit: 'cup', category: 'ingredients' }),
      new VariableImpl({ name: 'whisk', quantity: 1, category: 'equipment' })
    ];
  }

  if (task.includes('heat pancake pan')) {
    return [
      new VariableImpl({ name: 'oil', quantity: -1, unit: 'tsp', category: 'ingredients' }),
      new VariableImpl({ name: 'nonstick_pan', quantity: 1, category: 'equipment' })
    ];
  }

  if (task.includes('first pancake')) {
    return [
      new VariableImpl({ name: 'pancake_batter', quantity: -0.25, unit: 'cup', category: 'ingredients' })
    ];
  }

  if (task.includes('flip') && task.includes('pancake')) {
    return [
      new VariableImpl({ name: 'pancake_flipping_skill', quantity: 1, category: 'skills' })
    ];
  }

  if (task.includes('remove') && task.includes('pancake')) {
    return [
      new VariableImpl({ name: 'cooked_pancakes', quantity: 1, category: 'food' }),
      new VariableImpl({ name: 'pancake_batter', quantity: -0.25, unit: 'cup', category: 'ingredients' })
    ];
  }

  if (task.includes('finish pancakes')) {
    return [
      new VariableImpl({ name: 'cooked_pancakes', quantity: 4, category: 'food' }),
      new VariableImpl({ name: 'pancake_batter', quantity: -1, unit: 'cup', category: 'ingredients' }),
      new VariableImpl({ name: 'nonstick_pan', quantity: -1, category: 'equipment' })
    ];
  }

  return [];
}

/**
 * Create variables for egg-related cooking tasks
 */
function createEggVariables(task: string): Variable[] {
  if (task.includes('start eggs') || task.includes('heat egg pan')) {
    return [
      new VariableImpl({ name: 'butter', quantity: -1, unit: 'tbsp', category: 'ingredients' }),
      new VariableImpl({ name: 'medium_frying_pan', quantity: 1, category: 'equipment' })
    ];
  }

  if (task.includes('crack eggs')) {
    return [
      new VariableImpl({ name: 'eggs', quantity: -2, category: 'ingredients' }),
      new VariableImpl({ name: 'egg_cooking_skill', quantity: 1, category: 'skills' })
    ];
  }

  if (task.includes('finish eggs')) {
    return [
      new VariableImpl({ name: 'cooked_eggs', quantity: 2, category: 'food' }),
      new VariableImpl({ name: 'medium_frying_pan', quantity: -1, category: 'equipment' })
    ];
  }

  return [];
}

/**
 * Create cleanup phase variables for cooking lesson items
 */
function createCleanupPhaseVariables(taskName: string): Variable[] {
  const task = taskName.toLowerCase();

  if (task.includes('wash pans')) {
    return [
      new VariableImpl({ name: 'clean_pans', quantity: 3, category: 'equipment' }),
      new VariableImpl({ name: 'dish_soap', quantity: -1, category: 'consumables' }),
      new VariableImpl({ name: 'sponges', quantity: -2, category: 'consumables' })
    ];
  }

  if (task.includes('wipe counters')) {
    return [
      new VariableImpl({ name: 'clean_workspace', quantity: 1, category: 'workspace' }),
      new VariableImpl({ name: 'paper_towels', quantity: -3, category: 'consumables' })
    ];
  }

  if (task.includes('put away ingredients')) {
    return [
      new VariableImpl({ name: 'organized_kitchen', quantity: 1, category: 'workspace' })
    ];
  }

  if (task.includes('sweep floor')) {
    return [
      new VariableImpl({ name: 'clean_floor', quantity: 1, category: 'workspace' }),
      new VariableImpl({ name: 'food_scraps', quantity: 1, category: 'waste' })
    ];
  }

  if (task.includes('final inspection')) {
    return [
      new VariableImpl({ name: 'kitchen_cleanliness_rating', quantity: 10, category: 'quality' })
    ];
  }

  return [];
}

/**
 * Apply variables to a BasicItem based on its task name
 */
function applyVariablesToItem(item: BasicItem, phase: 'setup' | 'cooking' | 'cleanup'): Variable[] {
  switch (phase) {
    case 'setup':
      return createSetupPhaseVariables(item.name);
    case 'cooking':
      return createCookingPhaseVariables(item.name);
    case 'cleanup':
      return createCleanupPhaseVariables(item.name);
    default:
      return [];
  }
}

export default function RandomItemButton() {
  const appDispatch = useAppDispatch();

  const createCookingLesson = useCallback(() => {
    const items = createCompleteCookingLesson();

    // Create a map for quick lookup of parent names
    const itemNameMap = new Map<string, string>();
    items.forEach(item => itemNameMap.set(item.id, item.name));

    // Dispatch all items in a batch
    const actions = items.map(item => ({ type: "CREATE_ITEM" as const, payload: { newItem: item } }));

    // Add variable assignments for all BasicItems
    const variableActions: Array<{ type: "SET_ITEM_VARIABLES"; payload: { itemId: string; variables: Variable[] } }> = [];

    items.forEach(item => {
      if (item instanceof BasicItem) {
        let variables: Variable[] = [];

        // Find the parent item name to determine phase
        const parentName = item.parents[0]?.id ? itemNameMap.get(item.parents[0].id) : '';

        if (parentName === "Kitchen Setup & Preparation") {
          variables = applyVariablesToItem(item, 'setup');
        } else if (parentName === "Timed Cooking Execution") {
          variables = applyVariablesToItem(item, 'cooking');
        } else if (parentName === "Kitchen Cleanup") {
          variables = applyVariablesToItem(item, 'cleanup');
        }

        if (variables.length > 0) {
          variableActions.push({
            type: "SET_ITEM_VARIABLES",
            payload: { itemId: item.id, variables }
          });
        }
      }
    });

    // Dispatch items first, then variables
    appDispatch({ type: "BATCH", payload: [...actions, ...variableActions] });
  }, [appDispatch]);

  return (
    <Button variant="contained" onClick={createCookingLesson}>
      COOKING LESSON
    </Button>
  );
}

/**
 * Creates a complete cooking lesson for pancakes, eggs, and bacon
 * Returns all items needed for the lesson
 */
function createCompleteCookingLesson() {
  const items: Array<BasicItem | SubCalendarItem | CheckListItem> = [];

  // Main cooking lesson (70 minutes - more realistic)
  const mainLesson = new SubCalendarItem({
    name: "Complete Breakfast Cooking Lesson",
    duration: 70 * 60 * 1000, // 70 minutes
  });
  items.push(mainLesson);

  // Phase 1: Setup and Preparation (0-12 minutes - more realistic)
  const setupPhase = new CheckListItem({
    name: "Kitchen Setup & Preparation",
    duration: 12 * 60 * 1000, // 12 minutes
    parents: [new Parent({ id: mainLesson.id })],
    sortType: "manual"
  });

  setupPhase.children = [
    new CheckListChild({ itemId: "" }), // Will be filled after creating items
    new CheckListChild({ itemId: "" }),
    new CheckListChild({ itemId: "" }),
    new CheckListChild({ itemId: "" }),
    new CheckListChild({ itemId: "" }),
  ];
  items.push(setupPhase);

  // Setup tasks
  const cleanCounters = new BasicItem({
    name: "Clean and clear all countertops",
    duration: 3 * 60 * 1000, // 3 minutes (was 2 - thorough cleaning)
    parents: [new Parent({ id: setupPhase.id })]
  });
  items.push(cleanCounters);

  const gatherIngredients = new BasicItem({
    name: "Gather ingredients: eggs, bacon, pancake mix, milk, oil",
    duration: 4 * 60 * 1000, // 4 minutes (was 3 - checking expiration, organizing)
    parents: [new Parent({ id: setupPhase.id })]
  });
  items.push(gatherIngredients);

  const gatherEquipment = new BasicItem({
    name: "Get equipment: 3 pans, spatulas, whisk, measuring cups",
    duration: 3 * 60 * 1000, // 3 minutes (was 2 - finding, checking condition)
    parents: [new Parent({ id: setupPhase.id })]
  });
  items.push(gatherEquipment);

  const washHands = new BasicItem({
    name: "Wash hands thoroughly with soap",
    duration: 1 * 60 * 1000, // 1 minute (appropriate)
    parents: [new Parent({ id: setupPhase.id })]
  });
  items.push(washHands);

  const preheatPans = new BasicItem({
    name: "Place all three pans on stove (don't turn on yet)",
    duration: 1 * 60 * 1000, // 1 minute (was 2 - simple task)
    parents: [new Parent({ id: setupPhase.id })]
  });
  items.push(preheatPans);

  // Update checklist children with actual item IDs
  setupPhase.children[0].itemId = cleanCounters.id;
  setupPhase.children[1].itemId = gatherIngredients.id;
  setupPhase.children[2].itemId = gatherEquipment.id;
  setupPhase.children[3].itemId = washHands.id;
  setupPhase.children[4].itemId = preheatPans.id;

  // Phase 2: Timed Cooking Execution (12-50 minutes - more realistic)
  const cookingPhase = new SubCalendarItem({
    name: "Timed Cooking Execution",
    duration: 38 * 60 * 1000, // 38 minutes (was 35 - realistic cooking physics)
    parents: [new Parent({ id: mainLesson.id })],
  });
  items.push(cookingPhase);

  // Timed cooking tasks
  const startBacon = new BasicItem({
    name: "START: Place bacon in cold pan, turn heat to medium-low",
    duration: 3 * 60 * 1000, // 3 minutes (was 2 - proper cold start, temperature setting)
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(startBacon);

  const makePancakeBatter = new BasicItem({
    name: "Mix pancake batter (don't overmix - lumps are OK)",
    duration: 4 * 60 * 1000, // 4 minutes (was 3 - proper mixing technique)
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(makePancakeBatter);

  const flipBacon1 = new BasicItem({
    name: "CRITICAL: Flip bacon (should be lightly browned)",
    duration: 1 * 60 * 1000, // 1 minute (appropriate for simple flip)
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(flipBacon1);

  const heatPancakePan = new BasicItem({
    name: "Heat pancake pan to medium, add small amount of oil",
    duration: 3 * 60 * 1000, // 3 minutes (was 2 - proper non-stick temperature)
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(heatPancakePan);

  const firstPancake = new BasicItem({
    name: "Pour first pancake (1/4 cup batter)",
    duration: 2 * 60 * 1000, // 2 minutes (was 1 - batter pouring, spreading)
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(firstPancake);

  const removeBacon = new BasicItem({
    name: "CRITICAL: Remove bacon to paper towels (should be crispy)",
    duration: 3 * 60 * 1000, // 3 minutes (was 2 - draining, paper towel setup)
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(removeBacon);

  const flipFirstPancake = new BasicItem({
    name: "CRITICAL: Flip first pancake (bubbles on surface, edges set)",
    duration: 1 * 60 * 1000, // 1 minute (appropriate)
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(flipFirstPancake);

  const startEggs = new BasicItem({
    name: "Heat egg pan to medium-low, add butter",
    duration: 3 * 60 * 1000, // 3 minutes (was 2 - butter melting, temperature adjustment)
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(startEggs);

  const removeFirstPancake = new BasicItem({
    name: "Remove first pancake, start second pancake",
    duration: 2 * 60 * 1000, // 2 minutes (appropriate)
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(removeFirstPancake);

  const crackEggs = new BasicItem({
    name: "CRITICAL: Crack eggs into pan, cook until whites are set",
    duration: 4 * 60 * 1000, // 4 minutes (appropriate for proper cooking)
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(crackEggs);

  const flipSecondPancake = new BasicItem({
    name: "CRITICAL: Flip second pancake",
    duration: 1 * 60 * 1000, // 1 minute (appropriate)
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(flipSecondPancake);

  const finishEggs = new BasicItem({
    name: "CRITICAL: Remove eggs (yolks should be desired consistency)",
    duration: 2 * 60 * 1000, // 2 minutes (appropriate)
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(finishEggs);

  const finishPancakes = new BasicItem({
    name: "Remove second pancake, make remaining pancakes",
    duration: 10 * 60 * 1000, // 10 minutes (appropriate for multiple batches)
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(finishPancakes);

  const plateFood = new BasicItem({
    name: "Plate all food attractively, keep warm",
    duration: 3 * 60 * 1000, // 3 minutes (appropriate)
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(plateFood);

  // Add timed tasks to cooking phase - updated for realistic cooking physics
  cookingPhase.children = [
    new Child({ id: startBacon.id, start: 0 }), // Start immediately
    new Child({ id: makePancakeBatter.id, start: 2 * 60 * 1000 }), // 2 minutes in (overlap with bacon start)
    new Child({ id: flipBacon1.id, start: 6 * 60 * 1000 }), // 6 minutes in (was 8 - proper browning time)
    new Child({ id: heatPancakePan.id, start: 15 * 60 * 1000 }), // 15 minutes in (overlap with bacon cooking)
    new Child({ id: firstPancake.id, start: 18 * 60 * 1000 }), // 18 minutes in (after pan is ready)
    new Child({ id: removeBacon.id, start: 18 * 60 * 1000 }), // 18 minutes in (crispy finish)
    new Child({ id: flipFirstPancake.id, start: 21 * 60 * 1000 }), // 21 minutes in (bubbles formed, edges set)
    new Child({ id: startEggs.id, start: 24 * 60 * 1000 }), // 24 minutes in (final cooking phase)
    new Child({ id: removeFirstPancake.id, start: 23 * 60 * 1000 }), // 23 minutes in (golden brown)
    new Child({ id: crackEggs.id, start: 27 * 60 * 1000 }), // 27 minutes in (controlled technique)
    new Child({ id: flipSecondPancake.id, start: 25 * 60 * 1000 }), // 25 minutes in (second pancake timing)
    new Child({ id: finishEggs.id, start: 31 * 60 * 1000 }), // 31 minutes in (desired doneness)
    new Child({ id: finishPancakes.id, start: 28 * 60 * 1000 }), // 28 minutes in (continue batches)
    new Child({ id: plateFood.id, start: 35 * 60 * 1000 }), // 35 minutes in (final presentation)
  ];

  // Phase 3: Cleanup (50-70 minutes - more realistic)
  const cleanupPhase = new CheckListItem({
    name: "Kitchen Cleanup",
    duration: 20 * 60 * 1000, // 20 minutes (was 15 - thorough cleanup)
    parents: [new Parent({ id: mainLesson.id })],
    sortType: "manual"
  });
  items.push(cleanupPhase);

  // Cleanup tasks
  const washPans = new BasicItem({
    name: "Wash all pans and utensils in hot soapy water",
    duration: 7 * 60 * 1000, // 7 minutes (was 5 - grease removal, proper cleaning)
    parents: [new Parent({ id: cleanupPhase.id })]
  });
  items.push(washPans);

  const wipeCounters2 = new BasicItem({
    name: "Wipe down all countertops and stovetop",
    duration: 4 * 60 * 1000, // 4 minutes (was 3 - thorough grease cleanup)
    parents: [new Parent({ id: cleanupPhase.id })]
  });
  items.push(wipeCounters2);

  const putAwayIngredients = new BasicItem({
    name: "Put away all ingredients and equipment",
    duration: 5 * 60 * 1000, // 5 minutes (was 4 - proper storage, organization)
    parents: [new Parent({ id: cleanupPhase.id })]
  });
  items.push(putAwayIngredients);

  const sweepFloor = new BasicItem({
    name: "Sweep floor and dispose of any food scraps",
    duration: 3 * 60 * 1000, // 3 minutes (was 2 - thorough floor cleaning)
    parents: [new Parent({ id: cleanupPhase.id })]
  });
  items.push(sweepFloor);

  const finalInspection = new BasicItem({
    name: "Final inspection - kitchen should sparkle!",
    duration: 1 * 60 * 1000, // 1 minute (appropriate)
    parents: [new Parent({ id: cleanupPhase.id })]
  });
  items.push(finalInspection);

  // Update cleanup checklist
  cleanupPhase.children = [
    new CheckListChild({ itemId: washPans.id }),
    new CheckListChild({ itemId: wipeCounters2.id }),
    new CheckListChild({ itemId: putAwayIngredients.id }),
    new CheckListChild({ itemId: sweepFloor.id }),
    new CheckListChild({ itemId: finalInspection.id }),
  ];

  // Add main phases to the main lesson - updated timing
  mainLesson.children = [
    new Child({ id: setupPhase.id, start: 0 }), // 0-12 minutes
    new Child({ id: cookingPhase.id, start: 12 * 60 * 1000 }), // 12-50 minutes
    new Child({ id: cleanupPhase.id, start: 50 * 60 * 1000 }), // 50-70 minutes
  ];

  return items;
}
