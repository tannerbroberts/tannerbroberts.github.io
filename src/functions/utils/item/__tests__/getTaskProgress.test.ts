import { describe, it, expect } from 'vitest';
import { getTaskProgress } from '../../item/utils';
import { BasicItem } from '../../item/BasicItem';

const makeItem = (duration: number) => new BasicItem({ id: 'i'+duration, name: 'Test', duration });

describe('getTaskProgress', () => {
  it('returns 0 for no duration', () => {
    const item = makeItem(0);
  expect(getTaskProgress(item, 1000, 0)).toBe(0);
  });

  it('returns 0 before start', () => {
    const item = makeItem(1000);
  expect(getTaskProgress(item, -100, 0)).toBe(0);
  });

  it('returns 50 mid-way', () => {
    const item = makeItem(2000);
  expect(getTaskProgress(item, 1000, 0)).toBeCloseTo(50, 5);
  });

  it('returns 100 at or after end', () => {
    const item = makeItem(2000);
  expect(getTaskProgress(item, 2500, 0)).toBe(100);
  });

  it('clamps between 0 and 100', () => {
    const item = makeItem(2000);
  expect(getTaskProgress(item, -500, 0)).toBe(0);
  expect(getTaskProgress(item, 999999, 0)).toBe(100);
  });
});
