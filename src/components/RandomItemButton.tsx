import { Button } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch } from "../reducerContexts/App";
import { BasicItem, SubCalendarItem, CheckListItem, CheckListChild, Child, Parent } from "../functions/utils/item/index";

export default function RandomItemButton() {
  const appDispatch = useAppDispatch();

  const createCookingLesson = useCallback(() => {
    const items = createCompleteCookingLesson();

    // Dispatch all items in a batch
    const actions = items.map(item => ({ type: "CREATE_ITEM" as const, payload: { newItem: item } }));
    appDispatch({ type: "BATCH", payload: actions });
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

  // Main cooking lesson (1 hour)
  const mainLesson = new SubCalendarItem({
    name: "Complete Breakfast Cooking Lesson",
    duration: 60 * 60 * 1000, // 1 hour
  });
  items.push(mainLesson);

  // Phase 1: Setup and Preparation (0-10 minutes)
  const setupPhase = new CheckListItem({
    name: "Kitchen Setup & Preparation",
    duration: 10 * 60 * 1000, // 10 minutes
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
    duration: 2 * 60 * 1000, // 2 minutes
    parents: [new Parent({ id: setupPhase.id })]
  });
  items.push(cleanCounters);

  const gatherIngredients = new BasicItem({
    name: "Gather ingredients: eggs, bacon, pancake mix, milk, oil",
    duration: 3 * 60 * 1000, // 3 minutes
    parents: [new Parent({ id: setupPhase.id })]
  });
  items.push(gatherIngredients);

  const gatherEquipment = new BasicItem({
    name: "Get equipment: 3 pans, spatulas, whisk, measuring cups",
    duration: 2 * 60 * 1000, // 2 minutes
    parents: [new Parent({ id: setupPhase.id })]
  });
  items.push(gatherEquipment);

  const washHands = new BasicItem({
    name: "Wash hands thoroughly with soap",
    duration: 1 * 60 * 1000, // 1 minute
    parents: [new Parent({ id: setupPhase.id })]
  });
  items.push(washHands);

  const preheatPans = new BasicItem({
    name: "Place all three pans on stove (don't turn on yet)",
    duration: 2 * 60 * 1000, // 2 minutes
    parents: [new Parent({ id: setupPhase.id })]
  });
  items.push(preheatPans);

  // Update checklist children with actual item IDs
  setupPhase.children[0].itemId = cleanCounters.id;
  setupPhase.children[1].itemId = gatherIngredients.id;
  setupPhase.children[2].itemId = gatherEquipment.id;
  setupPhase.children[3].itemId = washHands.id;
  setupPhase.children[4].itemId = preheatPans.id;

  // Phase 2: Timed Cooking Execution (10-45 minutes)
  const cookingPhase = new SubCalendarItem({
    name: "Timed Cooking Execution",
    duration: 35 * 60 * 1000, // 35 minutes
    parents: [new Parent({ id: mainLesson.id })],
  });
  items.push(cookingPhase);

  // Timed cooking tasks
  const startBacon = new BasicItem({
    name: "START: Place bacon in cold pan, turn heat to medium-low",
    duration: 2 * 60 * 1000, // 2 minutes
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(startBacon);

  const makePancakeBatter = new BasicItem({
    name: "Mix pancake batter (don't overmix - lumps are OK)",
    duration: 3 * 60 * 1000, // 3 minutes
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(makePancakeBatter);

  const flipBacon1 = new BasicItem({
    name: "CRITICAL: Flip bacon (should be lightly browned)",
    duration: 1 * 60 * 1000, // 1 minute
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(flipBacon1);

  const heatPancakePan = new BasicItem({
    name: "Heat pancake pan to medium, add small amount of oil",
    duration: 2 * 60 * 1000, // 2 minutes
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(heatPancakePan);

  const firstPancake = new BasicItem({
    name: "Pour first pancake (1/4 cup batter)",
    duration: 1 * 60 * 1000, // 1 minute
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(firstPancake);

  const removeBacon = new BasicItem({
    name: "CRITICAL: Remove bacon to paper towels (should be crispy)",
    duration: 2 * 60 * 1000, // 2 minutes
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(removeBacon);

  const flipFirstPancake = new BasicItem({
    name: "CRITICAL: Flip first pancake (bubbles on surface, edges set)",
    duration: 1 * 60 * 1000, // 1 minute
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(flipFirstPancake);

  const startEggs = new BasicItem({
    name: "Heat egg pan to medium-low, add butter",
    duration: 2 * 60 * 1000, // 2 minutes
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(startEggs);

  const removeFirstPancake = new BasicItem({
    name: "Remove first pancake, start second pancake",
    duration: 2 * 60 * 1000, // 2 minutes
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(removeFirstPancake);

  const crackEggs = new BasicItem({
    name: "CRITICAL: Crack eggs into pan, cook until whites are set",
    duration: 4 * 60 * 1000, // 4 minutes
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(crackEggs);

  const flipSecondPancake = new BasicItem({
    name: "CRITICAL: Flip second pancake",
    duration: 1 * 60 * 1000, // 1 minute
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(flipSecondPancake);

  const finishEggs = new BasicItem({
    name: "CRITICAL: Remove eggs (yolks should be desired consistency)",
    duration: 2 * 60 * 1000, // 2 minutes
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(finishEggs);

  const finishPancakes = new BasicItem({
    name: "Remove second pancake, make remaining pancakes",
    duration: 10 * 60 * 1000, // 10 minutes
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(finishPancakes);

  const plateFood = new BasicItem({
    name: "Plate all food attractively, keep warm",
    duration: 3 * 60 * 1000, // 3 minutes
    parents: [new Parent({ id: cookingPhase.id })]
  });
  items.push(plateFood);

  // Add timed tasks to cooking phase
  cookingPhase.children = [
    new Child({ id: startBacon.id, start: 0 }), // Start immediately
    new Child({ id: makePancakeBatter.id, start: 2 * 60 * 1000 }), // 2 minutes in
    new Child({ id: flipBacon1.id, start: 8 * 60 * 1000 }), // 8 minutes in
    new Child({ id: heatPancakePan.id, start: 10 * 60 * 1000 }), // 10 minutes in
    new Child({ id: firstPancake.id, start: 12 * 60 * 1000 }), // 12 minutes in
    new Child({ id: removeBacon.id, start: 15 * 60 * 1000 }), // 15 minutes in
    new Child({ id: flipFirstPancake.id, start: 16 * 60 * 1000 }), // 16 minutes in
    new Child({ id: startEggs.id, start: 18 * 60 * 1000 }), // 18 minutes in
    new Child({ id: removeFirstPancake.id, start: 20 * 60 * 1000 }), // 20 minutes in
    new Child({ id: crackEggs.id, start: 22 * 60 * 1000 }), // 22 minutes in
    new Child({ id: flipSecondPancake.id, start: 24 * 60 * 1000 }), // 24 minutes in
    new Child({ id: finishEggs.id, start: 26 * 60 * 1000 }), // 26 minutes in
    new Child({ id: finishPancakes.id, start: 28 * 60 * 1000 }), // 28 minutes in
    new Child({ id: plateFood.id, start: 32 * 60 * 1000 }), // 32 minutes in
  ];

  // Phase 3: Cleanup (45-60 minutes)
  const cleanupPhase = new CheckListItem({
    name: "Kitchen Cleanup",
    duration: 15 * 60 * 1000, // 15 minutes
    parents: [new Parent({ id: mainLesson.id })],
    sortType: "manual"
  });
  items.push(cleanupPhase);

  // Cleanup tasks
  const washPans = new BasicItem({
    name: "Wash all pans and utensils in hot soapy water",
    duration: 5 * 60 * 1000, // 5 minutes
    parents: [new Parent({ id: cleanupPhase.id })]
  });
  items.push(washPans);

  const wipeCounters2 = new BasicItem({
    name: "Wipe down all countertops and stovetop",
    duration: 3 * 60 * 1000, // 3 minutes
    parents: [new Parent({ id: cleanupPhase.id })]
  });
  items.push(wipeCounters2);

  const putAwayIngredients = new BasicItem({
    name: "Put away all ingredients and equipment",
    duration: 4 * 60 * 1000, // 4 minutes
    parents: [new Parent({ id: cleanupPhase.id })]
  });
  items.push(putAwayIngredients);

  const sweepFloor = new BasicItem({
    name: "Sweep floor and dispose of any food scraps",
    duration: 2 * 60 * 1000, // 2 minutes
    parents: [new Parent({ id: cleanupPhase.id })]
  });
  items.push(sweepFloor);

  const finalInspection = new BasicItem({
    name: "Final inspection - kitchen should sparkle!",
    duration: 1 * 60 * 1000, // 1 minute
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

  // Add main phases to the main lesson
  mainLesson.children = [
    new Child({ id: setupPhase.id, start: 0 }), // 0-10 minutes
    new Child({ id: cookingPhase.id, start: 10 * 60 * 1000 }), // 10-45 minutes
    new Child({ id: cleanupPhase.id, start: 45 * 60 * 1000 }), // 45-60 minutes
  ];

  return items;
}
