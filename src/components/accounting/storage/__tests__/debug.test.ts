import { describe, it, expect } from 'vitest';
import { DEFAULT_TIME_THRESHOLDS, DEFAULT_BADGE_SETTINGS } from '../../types/badgeSettings';
import { getDefaultBadgeSettings } from '../badgeSettingsStorage';

describe('Debug Constants', () => {
  it('should show actual values', () => {
    console.log('DEFAULT_TIME_THRESHOLDS:', DEFAULT_TIME_THRESHOLDS);
    console.log('DEFAULT_BADGE_SETTINGS timeThresholds:', DEFAULT_BADGE_SETTINGS.timeThresholds);

    const defaults = getDefaultBadgeSettings();
    console.log('getDefaultBadgeSettings() timeThresholds:', defaults.timeThresholds);

    // Check if they're the same objects
    console.log('Are they the same?', DEFAULT_TIME_THRESHOLDS === DEFAULT_BADGE_SETTINGS.timeThresholds);
    console.log('Minimal comparison:', DEFAULT_TIME_THRESHOLDS.minimal, 'vs', defaults.timeThresholds.minimal);

    expect(true).toBe(true); // dummy assertion
  });
});
