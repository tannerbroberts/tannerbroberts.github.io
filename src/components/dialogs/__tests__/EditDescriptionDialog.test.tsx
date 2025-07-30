import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EditDescriptionDialog from '../../dialogs/EditDescriptionDialog';

describe('EditDescriptionDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnSave.mockClear();
  });

  it('renders when open', () => {
    render(
      <EditDescriptionDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialDescription=""
        variableName="test_variable"
      />
    );

    expect(screen.getByText(/edit description: test_variable/i)).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <EditDescriptionDialog
        open={false}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialDescription=""
        variableName="test_variable"
      />
    );

    expect(screen.queryByText(/edit description/i)).not.toBeInTheDocument();
  });

  it('shows initial description', () => {
    render(
      <EditDescriptionDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialDescription="Initial description"
        variableName="test_variable"
      />
    );

    expect(screen.getByDisplayValue('Initial description')).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', async () => {
    render(
      <EditDescriptionDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialDescription=""
        variableName="test_variable"
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'New description that is long enough' } });

    const saveButton = screen.getByText(/save description/i);
    fireEvent.click(saveButton);

    expect(mockOnSave).toHaveBeenCalledWith('New description that is long enough');
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <EditDescriptionDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialDescription=""
        variableName="test_variable"
      />
    );

    const cancelButton = screen.getByText(/cancel/i);
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables save button for short descriptions', () => {
    render(
      <EditDescriptionDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialDescription=""
        variableName="test_variable"
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Short' } });

    const saveButton = screen.getByText(/save description/i);
    expect(saveButton).toBeDisabled();
  });

  it('enables save button for valid descriptions', () => {
    render(
      <EditDescriptionDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialDescription=""
        variableName="test_variable"
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'This is a valid description that is long enough' } });

    const saveButton = screen.getByText(/save description/i);
    expect(saveButton).not.toBeDisabled();
  });

  it('shows unsaved changes warning', () => {
    render(
      <EditDescriptionDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialDescription=""
        variableName="test_variable"
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Changed description' } });

    expect(screen.getByText(/you have unsaved changes/i)).toBeInTheDocument();
  });

  it('toggles preview mode', () => {
    render(
      <EditDescriptionDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialDescription="**Bold text**"
        variableName="test_variable"
      />
    );

    const previewButton = screen.getByText(/preview/i);
    fireEvent.click(previewButton);

    expect(screen.getByText(/preview:/i)).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(
      <EditDescriptionDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialDescription=""
        variableName="test_variable"
        error="Test error message"
      />
    );

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('shows saving state', () => {
    render(
      <EditDescriptionDialog
        open={true}
        onClose={mockOnClose}
        onSave={mockOnSave}
        initialDescription=""
        variableName="test_variable"
        saving={true}
      />
    );

    expect(screen.getByText(/saving\.\.\./i)).toBeInTheDocument();
  });
});
