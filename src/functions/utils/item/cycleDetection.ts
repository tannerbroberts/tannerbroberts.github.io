import { Item } from './Item';

// Find duplicate durations across all items (load-time advisory)
export function findDuplicateDurations(items: Item[]): Map<number, string[]> {
  const map = new Map<number, string[]>();
  for (const item of items) {
    const list = map.get(item.duration) || [];
    list.push(item.id);
    map.set(item.duration, list);
  }
  for (const [duration, ids] of map) {
    if (ids.length < 2) map.delete(duration);
  }
  return map;
}

// Validate proposed parent-child edge based on duration uniqueness
export function validateDurationForLink(parent: Item, child: Item): void {
  if (parent.duration === child.duration) {
    throw new Error(`Cannot link items with identical duration (${parent.duration}ms): parent=${parent.id} child=${child.id}`);
  }
}
