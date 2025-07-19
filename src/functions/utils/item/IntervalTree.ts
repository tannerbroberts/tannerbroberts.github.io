export class IntervalTree<T> {
  intervals: { start: number; end: number; data: T }[] = [];

  insert(start: number, end: number, data: T) {
    this.intervals.push({ start, end, data });
    this.intervals.sort((a, b) => a.start - b.start);
  }

  overlaps(start: number, end: number): boolean {
    return this.intervals.some(
      (iv) => Math.max(iv.start, start) < Math.min(iv.end, end)
    );
  }

  removeByData(data: T) {
    this.intervals = this.intervals.filter((iv) => iv.data !== data);
  }

  findAllOverlapping(start: number, end: number): T[] {
    return this.intervals.filter(
      (iv) => Math.max(iv.start, start) < Math.min(iv.end, end)
    ).map((iv) => iv.data);
  }
}
