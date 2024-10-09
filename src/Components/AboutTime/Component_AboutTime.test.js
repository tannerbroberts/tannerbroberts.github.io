import { act } from 'react'
import { renderHook } from "@testing-library/react";
import { useSchedule, useLibrary } from "./Component_AboutTime";

describe("useSchedule", () => {

  it('should return an object with all expected properties', async () => {
    const { result } = await renderHook(() => useSchedule());
    expect(result.current).toHaveProperty("addItem");
    expect(result.current).toHaveProperty("dropItem");
    expect(result.current).toHaveProperty("addRecurrence");
    expect(result.current).toHaveProperty("dropRecurrence");
    expect(result.current).toHaveProperty("getItemsInWindow");
    expect(result.current).toBeInstanceOf(Object);
  });

  it('Add and remove an item by name and positionMillis', async () => {
    const { result } = await renderHook(() => useSchedule());

    // Set a test item
    await act(async () => result.current.addItem({ itemName: "test", positionMillis: 0 }));
    const items = result.current.getItemsInWindow({ start: 0, end: 1000 });
    expect(items).toHaveLength(1);

    // Drop the test item
    await act(async () => result.current.dropItem({ itemName: "test", positionMillis: 0 }));
    const itemsAfterDrop = result.current.getItemsInWindow({ start: 0, end: 1000 });
    expect(itemsAfterDrop).toHaveLength(0);
  });

  it('Add and remove a recurrence in several ways', async () => {
    const { result } = await renderHook(() => useSchedule());

    const bySpecifyingRepeatCount = { itemName: "test", startPositionMillis: 0, repeatCount: 2, interval: 500 }
    // Set a test recurrence
    await act(async () => result.current.addRecurrence({ recurrence: bySpecifyingRepeatCount }));
    const scheduledRecurrences = result.current.getItemsInWindow({ start: 0, end: 1000 });
    expect(scheduledRecurrences).toHaveLength(2);

    // Drop the test recurrence
    await act(async () => result.current.dropRecurrence({ recurrenceId: "test" }));
    const scheduledRecurrencesAfterDrop = result.current.getItemsInWindow({ start: 0, end: 1000 });
    expect(scheduledRecurrencesAfterDrop).toHaveLength(0);

    const bySpecifyingEndPosition = { itemName: "test", startPositionMillis: 0, endPositionMillis: 1000, interval: 500 }
    // Set a test recurrence
    await act(async () => result.current.addRecurrence({ recurrence: bySpecifyingEndPosition }));
    const scheduledRecurrencesByEndPosition = result.current.getItemsInWindow({ start: 0, end: 1000 });
    expect(scheduledRecurrencesByEndPosition).toHaveLength(3);

    // Drop the test recurrence
    await act(async () => result.current.dropRecurrence({ recurrenceId: "test" }));
    const scheduledRecurrencesByEndPositionAfterDrop = result.current.getItemsInWindow({ start: 0, end: 1000 });
    expect(scheduledRecurrencesByEndPositionAfterDrop).toHaveLength(0);
  });
});

describe("useLibrary", () => {
  it('should return an object with all expected properties', async () => {
    const { result } = await renderHook(() => useLibrary());
    expect(result.current).toHaveProperty("setItem");
    expect(result.current).toHaveProperty("deleteItem");
    expect(result.current).toHaveProperty("items");
    expect(result.current).toBeInstanceOf(Object);
  });

  it('Add and remove an item by name and length', async () => {
    const { result } = await renderHook(() => useLibrary());

    // Set a test item
    await act(async () => result.current.setItem({ name: "test", length: 1000 }));
    const items = result.current.items;
    expect(items).toHaveProperty("test");

    // Drop the test item
    await act(async () => result.current.deleteItem("test"));
    const itemsAfterDrop = result.current.items;
    expect(itemsAfterDrop).not.toHaveProperty("test");
  });
})
