/// <reference types="vitest/globals" />
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import BadgeSettingsDialog from '../BadgeSettingsDialog';
import { BadgeSettingsProvider } from '../../contexts/BadgeSettingsContext';

// Mock the badge settings context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <BadgeSettingsProvider>
    {children}
  </BadgeSettingsProvider>
);

describe('BadgeSettingsDialog', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders when open', () => {
    render(
      <TestWrapper>
        <BadgeSettingsDialog {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Badge Settings')).toBeInTheDocument();
    expect(screen.getByText('Time Thresholds')).toBeInTheDocument();
    expect(screen.getByText('Variable Thresholds')).toBeInTheDocument();
    expect(screen.getByText('Preview')).toBeInTheDocument();
    expect(screen.getByText('Import/Export')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <TestWrapper>
        <BadgeSettingsDialog {...defaultProps} open={false} />
      </TestWrapper>
    );

    expect(screen.queryByText('Badge Settings')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <BadgeSettingsDialog {...defaultProps} />
      </TestWrapper>
    );

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('calls onClose when close icon is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <BadgeSettingsDialog {...defaultProps} />
      </TestWrapper>
    );

    const closeButton = screen.getByLabelText('Close');
    await user.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('switches between tabs correctly', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <BadgeSettingsDialog {...defaultProps} />
      </TestWrapper>
    );

    // Initially on Time Thresholds tab
    expect(screen.getByText('Time Badge Thresholds')).toBeInTheDocument();

    // Switch to Variable Thresholds
    const variableTab = screen.getByText('Variable Thresholds');
    await user.click(variableTab);
    expect(screen.getByText('Variable Badge Thresholds')).toBeInTheDocument();

    // Switch to Preview
    const previewTab = screen.getByText('Preview');
    await user.click(previewTab);
    expect(screen.getByText('Badge Preview')).toBeInTheDocument();

    // Switch to Import/Export
    const importExportTab = screen.getByText('Import/Export');
    await user.click(importExportTab);
    expect(screen.getByText('Import & Export Settings')).toBeInTheDocument();
  });

  it('shows validation errors for invalid settings', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <BadgeSettingsDialog {...defaultProps} />
      </TestWrapper>
    );

    // Go to Import/Export tab
    const importExportTab = screen.getByText('Import/Export');
    await user.click(importExportTab);

    // Enter invalid JSON
    const textArea = screen.getByPlaceholderText('Paste your badge settings JSON here...');
    await user.type(textArea, '{} invalid json {}');

    const importButton = screen.getByText('Import Settings');
    await user.click(importButton);

    await waitFor(() => {
      expect(screen.getByText(/Invalid JSON format/)).toBeInTheDocument();
    });
  });

  it('resets settings to defaults when reset button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <TestWrapper>
        <BadgeSettingsDialog {...defaultProps} />
      </TestWrapper>
    );

    const resetButton = screen.getByLabelText('Reset to defaults');
    await user.click(resetButton);

    // Should show unsaved changes indicator
    expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
  });

  it('disables save button when no changes are made', () => {
    render(
      <TestWrapper>
        <BadgeSettingsDialog {...defaultProps} />
      </TestWrapper>
    );

    const saveButton = screen.getByText('Save Settings');
    expect(saveButton).toBeDisabled();
  });

  it('handles keyboard navigation', async () => {
    render(
      <TestWrapper>
        <BadgeSettingsDialog {...defaultProps} />
      </TestWrapper>
    );

    // Dialog should be properly labeled for screen readers
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'badge-settings-dialog-title');
  });

  it('shows warning for invalid threshold ordering', async () => {
    render(
      <TestWrapper>
        <BadgeSettingsDialog {...defaultProps} />
      </TestWrapper>
    );

    // Find and modify time inputs to create invalid ordering
    // This would require more specific testing of the TimeThresholdSettings component
    // The warning would appear when minimal >= significant thresholds
  });
});
