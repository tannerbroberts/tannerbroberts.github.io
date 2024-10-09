import { renderHook } from "@testing-library/react";
import { useSchedule } from "./Component_AboutTime";

test('useSchedule should return an object with a "schedule" property', async () => {
  const { result } = await renderHook(() => useSchedule());
  expect(result.current).toHaveProperty("addItem");
});