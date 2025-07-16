/**
 * Formats a duration in milliseconds to a human-readable string
 * Example: 3665000 -> "1 hour, 1 min, 5 sec"
 */
export function formatDuration(milliseconds: number): string {
  if (milliseconds === 0) return "0 sec";

  const units = [
    { name: 'year', value: 365 * 24 * 60 * 60 * 1000 },
    { name: 'week', value: 7 * 24 * 60 * 60 * 1000 },
    { name: 'day', value: 24 * 60 * 60 * 1000 },
    { name: 'hour', value: 60 * 60 * 1000 },
    { name: 'min', value: 60 * 1000 },
    { name: 'sec', value: 1000 },
  ];

  const parts = [];
  let remaining = milliseconds;

  for (const unit of units) {
    if (remaining >= unit.value) {
      const count = Math.floor(remaining / unit.value);
      if (count > 0) {
        parts.push(`${count} ${unit.name}${count > 1 ? 's' : ''}`);
        remaining -= count * unit.value;
      }
    }
  }

  // Don't show milliseconds unless it's the only unit
  if (parts.length === 0 && remaining > 0) {
    parts.push(`${remaining} ms`);
  }

  return parts.join(', ');
}
