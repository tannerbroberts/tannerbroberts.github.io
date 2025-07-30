/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import VariableThresholdSettings from '../VariableThresholdSettings';
import { DEFAULT_VARIABLE_THRESHOLDS, DEFAULT_DISPLAY_SETTINGS } from '../../types/badgeSettings';

describe('VariableThresholdSettings', () => {
  const mockOnChange = vi.fn();
  const mockOnDisplayChange = vi.fn();

  const defaultProps = {
    settings: DEFAULT_VARIABLE_THRESHOLDS,
    displaySettings: DEFAULT_DISPLAY_SETTINGS,
    onChange: mockOnChange,
    onDisplayChange: mockOnDisplayChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders variable threshold settings', () => {
    render(<VariableThresholdSettings {...defaultProps} />);

    expect(screen.getByText('Variable Badge Thresholds')).toBeInTheDocument();
    expect(screen.getByText('Display Options')).toBeInTheDocument();
    expect(screen.getByText('Default Threshold')).toBeInTheDocument();
    expect(screen.getByText('Category-Specific Thresholds')).toBeInTheDocument();
    expect(screen.getByText('Alert Thresholds')).toBeInTheDocument();
  });

  it('displays current default threshold value', () => {
    render(<VariableThresholdSettings {...defaultProps} />);

    const defaultInput = screen.getByLabelText('Default minimum variables');
    expect(defaultInput).toHaveValue(DEFAULT_VARIABLE_THRESHOLDS.defaultMinimum);
  });

  it('shows existing category-specific thresholds', () => {
    render(<VariableThresholdSettings {...defaultProps} />);

    // Should show the default category chips
    expect(screen.getAllByText('time')[0]).toBeInTheDocument();
    expect(screen.getByText('quantity')).toBeInTheDocument();
    expect(screen.getByText('text')).toBeInTheDocument();
  });

  it('calls onChange when default threshold changes', async () => {
    const user = userEvent.setup();
    render(<VariableThresholdSettings {...defaultProps} />);

    const defaultInput = screen.getByLabelText('Default minimum variables');
    await user.clear(defaultInput);
    await user.type(defaultInput, '5');

    // Find the last call since clear() triggers an additional onChange
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1];
    expect(lastCall[0]).toEqual({
      ...DEFAULT_VARIABLE_THRESHOLDS,
      defaultMinimum: 5,
    });
  });

  it('calls onDisplayChange when variable badge switch is toggled', async () => {
    const user = userEvent.setup();
    render(<VariableThresholdSettings {...defaultProps} />);

    const showVariableBadgeSwitch = screen.getByLabelText('Show variable badge');
    await user.click(showVariableBadgeSwitch);

    expect(mockOnDisplayChange).toHaveBeenCalledWith({
      ...DEFAULT_DISPLAY_SETTINGS,
      showVariableBadge: !DEFAULT_DISPLAY_SETTINGS.showVariableBadge,
    });
  });

  it('allows adding new categories', async () => {
    const user = userEvent.setup();
    render(<VariableThresholdSettings {...defaultProps} />);

    const categoryInput = screen.getByPlaceholderText('Category name');
    const addButton = screen.getByText('Add Category');

    await user.type(categoryInput, 'custom');
    await user.click(addButton);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...DEFAULT_VARIABLE_THRESHOLDS,
      categorySpecific: {
        ...DEFAULT_VARIABLE_THRESHOLDS.categorySpecific,
        custom: DEFAULT_VARIABLE_THRESHOLDS.defaultMinimum,
      },
    });
  });

  it('allows removing categories', async () => {
    const user = userEvent.setup();
    render(<VariableThresholdSettings {...defaultProps} />);

    // Find the delete button for the 'time' category - look for buttons without text
    const deleteButtons = screen.getAllByRole('button').filter(button =>
      button.getAttribute('class')?.includes('MuiIconButton-colorError')
    );
    expect(deleteButtons.length).toBeGreaterThan(0);
    await user.click(deleteButtons[0]);

    expect(mockOnChange).toHaveBeenCalledWith({
      ...DEFAULT_VARIABLE_THRESHOLDS,
      categorySpecific: {
        quantity: 5,
        text: 1,
      },
    });
  });

  it('allows modifying category thresholds', async () => {
    const user = userEvent.setup();
    render(<VariableThresholdSettings {...defaultProps} />);

    // Find the threshold input for the first category
    const thresholdInputs = screen.getAllByLabelText('Threshold');
    await user.clear(thresholdInputs[0]);
    await user.type(thresholdInputs[0], '10');

    expect(mockOnChange).toHaveBeenCalled();
  });

  it('disables add button for duplicate category names', async () => {
    const user = userEvent.setup();
    render(<VariableThresholdSettings {...defaultProps} />);

    const categoryInput = screen.getByPlaceholderText('Category name');
    const addButton = screen.getByText('Add Category');

    await user.type(categoryInput, 'time'); // existing category

    expect(addButton).toBeDisabled();
  });

  it('handles Enter key for adding categories', async () => {
    const user = userEvent.setup();
    render(<VariableThresholdSettings {...defaultProps} />);

    const categoryInput = screen.getByPlaceholderText('Category name');
    await user.type(categoryInput, 'newcategory{enter}');

    expect(mockOnChange).toHaveBeenCalledWith({
      ...DEFAULT_VARIABLE_THRESHOLDS,
      categorySpecific: {
        ...DEFAULT_VARIABLE_THRESHOLDS.categorySpecific,
        newcategory: DEFAULT_VARIABLE_THRESHOLDS.defaultMinimum,
      },
    });
  });

  it('shows alert threshold settings', () => {
    render(<VariableThresholdSettings {...defaultProps} />);

    expect(screen.getByText('High')).toBeInTheDocument();
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('displays summary information', () => {
    render(<VariableThresholdSettings {...defaultProps} />);

    expect(screen.getByText(/Badge appears when variables exceed/)).toBeInTheDocument();
    expect(screen.getAllByText((_content, element) =>
      element?.textContent?.includes('time variables: threshold of') || false
    )[0]).toBeInTheDocument();
    expect(screen.getByText(/Badge shows high color after/)).toBeInTheDocument();
    expect(screen.getByText(/Badge shows critical color after/)).toBeInTheDocument();
  });
});
