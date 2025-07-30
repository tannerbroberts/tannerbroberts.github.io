/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import TimeThresholdSettings from '../TimeThresholdSettings';
import { DEFAULT_TIME_THRESHOLDS, DEFAULT_DISPLAY_SETTINGS } from '../../types/badgeSettings';

describe('TimeThresholdSettings', () => {
  const mockOnChange = vi.fn();
  const mockOnDisplayChange = vi.fn();

  const defaultProps = {
    settings: DEFAULT_TIME_THRESHOLDS,
    displaySettings: DEFAULT_DISPLAY_SETTINGS,
    onChange: mockOnChange,
    onDisplayChange: mockOnDisplayChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders time threshold settings', () => {
    render(<TimeThresholdSettings {...defaultProps} />);

    expect(screen.getByText('Time Badge Thresholds')).toBeInTheDocument();
    expect(screen.getByText('Display Options')).toBeInTheDocument();
    expect(screen.getByText('Threshold Values')).toBeInTheDocument();
  });

  it('displays current threshold values', () => {
    render(<TimeThresholdSettings {...defaultProps} />);

    // Should show formatted durations
    expect(screen.getByText(/Minimal Threshold: 5m/)).toBeInTheDocument();
    expect(screen.getByText(/Significant Threshold: 30m/)).toBeInTheDocument();
    expect(screen.getByText(/Critical Threshold: 2h 0m/)).toBeInTheDocument();
  });

  it('shows display option switches', () => {
    render(<TimeThresholdSettings {...defaultProps} />);

    expect(screen.getByText('Show time badge')).toBeInTheDocument();
    expect(screen.getByText('Enable color coding based on thresholds')).toBeInTheDocument();
  });

  it('calls onChange when slider values change', async () => {
    const user = userEvent.setup();
    render(<TimeThresholdSettings {...defaultProps} />);

    const minimalSlider = screen.getAllByRole('slider')[0];
    await user.type(minimalSlider, '10');

    // Should call onChange with updated minimal threshold
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('calls onDisplayChange when switches are toggled', async () => {
    const user = userEvent.setup();
    render(<TimeThresholdSettings {...defaultProps} />);

    const showTimeBadgeSwitch = screen.getByLabelText('Show time badge');
    await user.click(showTimeBadgeSwitch);

    expect(mockOnDisplayChange).toHaveBeenCalledWith({
      ...DEFAULT_DISPLAY_SETTINGS,
      showTimeBadge: !DEFAULT_DISPLAY_SETTINGS.showTimeBadge,
    });
  });

  it('shows warning for invalid threshold ordering', () => {
    const invalidSettings = {
      minimal: 30 * 60 * 1000, // 30 minutes
      significant: 5 * 60 * 1000, // 5 minutes (less than minimal)
      critical: 2 * 60 * 60 * 1000, // 2 hours
    };

    render(
      <TimeThresholdSettings
        {...defaultProps}
        settings={invalidSettings}
      />
    );

    expect(screen.getByText(/Thresholds should increase/)).toBeInTheDocument();
  });

  it('formats time durations correctly', () => {
    const customSettings = {
      minimal: 90 * 60 * 1000, // 1h 30m
      significant: 150 * 60 * 1000, // 2h 30m
      critical: 8 * 60 * 60 * 1000, // 8h 0m
    };

    render(
      <TimeThresholdSettings
        {...defaultProps}
        settings={customSettings}
      />
    );

    expect(screen.getAllByText(/1h 30m/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/2h 30m/)[0]).toBeInTheDocument();
    expect(screen.getByText(/8h 0m/)).toBeInTheDocument();
  });

  it('disables color coding switch when time badge is disabled', () => {
    const disabledDisplaySettings = {
      ...DEFAULT_DISPLAY_SETTINGS,
      showTimeBadge: false,
    };

    render(
      <TimeThresholdSettings
        {...defaultProps}
        displaySettings={disabledDisplaySettings}
      />
    );

    const colorCodingSwitch = screen.getByLabelText('Enable color coding based on thresholds');
    expect(colorCodingSwitch).toBeDisabled();
  });
});
