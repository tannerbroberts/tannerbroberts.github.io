/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import BadgePreview from '../BadgePreview';
import { DEFAULT_BADGE_SETTINGS } from '../../types/badgeSettings';

describe('BadgePreview', () => {
  const defaultProps = {
    settings: DEFAULT_BADGE_SETTINGS,
  };

  it('renders badge preview', () => {
    render(<BadgePreview {...defaultProps} />);

    expect(screen.getByText('Badge Preview')).toBeInTheDocument();
    expect(screen.getByText('Current Settings')).toBeInTheDocument();
  });

  it('shows current settings summary', () => {
    render(<BadgePreview {...defaultProps} />);

    expect(screen.getByText(/Time Thresholds:/)).toBeInTheDocument();
    expect(screen.getByText(/Variable Thresholds:/)).toBeInTheDocument();
    expect(screen.getByText(/Display:/)).toBeInTheDocument();
  });

  it('shows time badge scenarios when time badge is enabled', () => {
    render(<BadgePreview {...defaultProps} />);

    expect(screen.getByText('Time Badge Scenarios')).toBeInTheDocument();
    expect(screen.getAllByText('No Badge')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Minimal')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Significant')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Critical')[0]).toBeInTheDocument();
  });

  it('shows variable badge scenarios when variable badge is enabled', () => {
    render(<BadgePreview {...defaultProps} />);

    expect(screen.getByText('Variable Badge Scenarios')).toBeInTheDocument();
    expect(screen.getByText('Normal')).toBeInTheDocument();
    expect(screen.getByText('High Alert')).toBeInTheDocument();
  });

  it('shows category-specific thresholds when they exist', () => {
    render(<BadgePreview {...defaultProps} />);

    expect(screen.getByText('Category-Specific Thresholds')).toBeInTheDocument();
    expect(screen.getByText('time')).toBeInTheDocument();
    expect(screen.getByText('quantity')).toBeInTheDocument();
    expect(screen.getByText('text')).toBeInTheDocument();
  });

  it('hides time badge scenarios when time badge is disabled', () => {
    const settingsWithDisabledTimeBadge = {
      ...DEFAULT_BADGE_SETTINGS,
      displaySettings: {
        ...DEFAULT_BADGE_SETTINGS.displaySettings,
        showTimeBadge: false,
      },
    };

    render(<BadgePreview settings={settingsWithDisabledTimeBadge} />);

    expect(screen.queryByText('Time Badge Scenarios')).not.toBeInTheDocument();
  });

  it('hides variable badge scenarios when variable badge is disabled', () => {
    const settingsWithDisabledVariableBadge = {
      ...DEFAULT_BADGE_SETTINGS,
      displaySettings: {
        ...DEFAULT_BADGE_SETTINGS.displaySettings,
        showVariableBadge: false,
      },
    };

    render(<BadgePreview settings={settingsWithDisabledVariableBadge} />);

    expect(screen.queryByText('Variable Badge Scenarios')).not.toBeInTheDocument();
  });

  it('shows warning when both badges are disabled', () => {
    const settingsWithNoBadges = {
      ...DEFAULT_BADGE_SETTINGS,
      displaySettings: {
        ...DEFAULT_BADGE_SETTINGS.displaySettings,
        showTimeBadge: false,
        showVariableBadge: false,
      },
    };

    render(<BadgePreview settings={settingsWithNoBadges} />);

    expect(screen.getByText(/Both time and variable badges are disabled/)).toBeInTheDocument();
  });

  it('shows info when color coding is disabled', () => {
    const settingsWithoutColorCoding = {
      ...DEFAULT_BADGE_SETTINGS,
      displaySettings: {
        ...DEFAULT_BADGE_SETTINGS.displaySettings,
        colorCoding: false,
      },
    };

    render(<BadgePreview settings={settingsWithoutColorCoding} />);

    expect(screen.getByText(/Color coding is disabled/)).toBeInTheDocument();
  });

  it('formats time correctly in scenarios', () => {
    const customSettings = {
      ...DEFAULT_BADGE_SETTINGS,
      timeThresholds: {
        minimal: 90 * 60 * 1000, // 1h 30m
        significant: 150 * 60 * 1000, // 2h 30m  
        critical: 8 * 60 * 60 * 1000, // 8h 0m
      },
    };

    render(<BadgePreview settings={customSettings} />);

    expect(screen.getByText(/1h 30m → 2h 30m → 8h 0m/)).toBeInTheDocument();
  });

  it('displays variable thresholds correctly', () => {
    const customSettings = {
      ...DEFAULT_BADGE_SETTINGS,
      variableThresholds: {
        ...DEFAULT_BADGE_SETTINGS.variableThresholds,
        defaultMinimum: 5,
        alertThresholds: {
          high: 15,
          critical: 25,
        },
      },
    };

    render(<BadgePreview settings={customSettings} />);

    expect(screen.getByText(/5 → 15 → 25/)).toBeInTheDocument();
  });
});
