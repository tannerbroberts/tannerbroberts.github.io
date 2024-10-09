import { act } from 'react'
import { renderHook } from "@testing-library/react";
import { useSchedule, useLibrary } from "./Component_AboutTime";

describe("useSchedule", () => {

  it('should return an object with all expected properties', async () => {
    const { result } = await renderHook(() => useSchedule());
    expect(result.current).toHaveProperty("addItem");
    expect(result.current).toHaveProperty("dropItem");
    expect(result.current).toHaveProperty("addRecurrence");
    expect(result.current).toHaveProperty("getRecurrences");
    expect(result.current).toHaveProperty("dropRecurrenceById");
    expect(result.current).toHaveProperty("getItemsInWindow");
    expect(result.current).toBeInstanceOf(Object);
  });

  it('can and remove an item by name and positionMillis', async () => {
    const { result } = await renderHook(() => useSchedule());

    // Set a test item
    await act(async () => result.current.addItem({ itemName: "test", positionMillis: 0 }));
    const items = result.current.getItemsInWindow({ start: 0, end: 1000 });
    expect(items).toHaveLength(1);

    // Drop by name only does not work
    await act(async () => result.current.dropItem("test"));
    const itemsAfterDropByName = result.current.getItemsInWindow({ start: 0, end: 1000 });
    expect(itemsAfterDropByName).toHaveLength(1);

    // Drop the test item
    await act(async () => result.current.dropItem({ itemName: "test", positionMillis: 0 }));
    const itemsAfterDrop = result.current.getItemsInWindow({ start: 0, end: 1000 });
    expect(itemsAfterDrop).toHaveLength(0);
  });

  it('can add remove recurrence with count', async () => {
    const { result } = await renderHook(() => useSchedule());

    // We'll delete the recurrences we add by id
    let recurrenceIdReference = '';

    // A test recurrence
    const bySpecifyingRepeatCount = { itemName: "test", startPositionMillis: 0, count: 2, interval: 500 }
    expect(result.current.getRecurrences()).toHaveLength(0);

    // Add one
    await act(async () => recurrenceIdReference = result.current.addRecurrence(bySpecifyingRepeatCount));
    expect(result.current.getRecurrences()).toHaveLength(1);

    // There are two because the interval is 500 and the count is 2
    const scheduledRecurrences = result.current.getItemsInWindow({ start: 0, end: 1000 });
    expect(scheduledRecurrences).toHaveLength(2);

    // Drop the test recurrence
    await act(async () => result.current.dropRecurrenceById(recurrenceIdReference));
    expect(result.current.getRecurrences()).toHaveLength(0);

    // Try for virtual items again
    const scheduledRecurrencesAfterDrop = result.current.getItemsInWindow({ start: 0, end: 1000 });
    expect(scheduledRecurrencesAfterDrop).toHaveLength(0);
  });

  it('can and remove recurrence with endPositionMillis', async () => {
    const { result } = await renderHook(() => useSchedule());

    // We'll delete the recurrences we add by id
    let recurrenceIdReference = '';

    // A test recurrence
    const bySpecifyingEndPositionInclusive = { itemName: "test", startPositionMillis: 0, endPositionMillis: 1000, interval: 500 }

    // Start with none
    expect(result.current.getRecurrences()).toHaveLength(0);

    // Add one
    await act(async () => recurrenceIdReference = result.current.addRecurrence(bySpecifyingEndPositionInclusive));

    // It was added
    expect(result.current.getRecurrences()).toHaveLength(1);

    // Get the virtual items that exist because of the recurrence
    const scheduledRecurrencesByEndPosition = result.current.getItemsInWindow({ start: 0, end: 1000 });

    // There are three because the interval is 500 and the endPositionMillis is 1000
    expect(scheduledRecurrencesByEndPosition).toHaveLength(3);

    // Drop the test recurrence
    await act(async () => result.current.dropRecurrenceById(recurrenceIdReference));

    // It's gone
    expect(result.current.getRecurrences()).toHaveLength(0);

    // Try for virtual items again
    const scheduledRecurrencesByEndPositionAfterDrop = result.current.getItemsInWindow({ start: 0, end: 1000 });

    // There are none
    expect(scheduledRecurrencesByEndPositionAfterDrop).toHaveLength(0);
  });
});

describe("useLibrary", () => {
  it('should return an object with all expected properties', async () => {
    const { result } = await renderHook(() => useLibrary());
    expect(result.current).toHaveProperty("setItem");
    expect(result.current).toHaveProperty("deleteItem");
    expect(result.current).toHaveProperty("getItems");
    expect(result.current).toBeInstanceOf(Object);
  });

  it('can add and remove an item by name and length', async () => {
    const { result } = renderHook(() => useLibrary());

    // Set a test item
    await act(async () => result.current.setItem({ name: "test", lengthMillis: 1000 }));
    expect(result.current.getItems()).toHaveLength(1);
    expect(result.current.getItems()[0].name).toBe("test");

    // Drop by name works
    await act(async () => result.current.deleteItem("test"));
    expect(result.current.getItems()).toHaveLength(0);
  });

  it('has a function, getItems, that can filter by name', async () => {
    const { result } = renderHook(() => useLibrary());

    // Set a number of test items
    await act(async () => result.current.setItem({ name: "test", lengthMillis: 1000 }));
    await act(async () => result.current.setItem({ name: "test2", lengthMillis: 1000 }));
    await act(async () => result.current.setItem({ name: "test3", lengthMillis: 1000 }));

    // Filter by name
    const byName = (item) => item.name === "test";
    const filteredItems = result.current.getItems({ byName });
    expect(filteredItems).toHaveLength(1);

    // Drop the items
    await act(async () => result.current.deleteItem("test"));
    await act(async () => result.current.deleteItem("test2"));
    await act(async () => result.current.deleteItem("test3"));

    // They're gone
    expect(result.current.getItems()).toHaveLength(0);
  })
})
