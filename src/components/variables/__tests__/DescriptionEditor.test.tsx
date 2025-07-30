import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DescriptionEditor from '../DescriptionEditor';

describe('DescriptionEditor', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders with default props', () => {
    render(
      <DescriptionEditor
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByPlaceholderText(/enter a description/i)).toBeInTheDocument();
  });

  it('calls onChange when text is entered', () => {
    render(
      <DescriptionEditor
        value=""
        onChange={mockOnChange}
      />
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test description' } });

    expect(mockOnChange).toHaveBeenCalledWith('Test description');
  });

  it('shows character count', () => {
    render(
      <DescriptionEditor
        value="Test"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/4\/2000 characters/)).toBeInTheDocument();
  });

  it('shows error for too short description', () => {
    render(
      <DescriptionEditor
        value="Short"
        onChange={mockOnChange}
        minLength={10}
      />
    );

    expect(screen.getByText(/should be at least 10 characters/)).toBeInTheDocument();
  });

  it('shows formatting toolbar', () => {
    render(
      <DescriptionEditor
        value=""
        onChange={mockOnChange}
        showFormatting={true}
      />
    );

    expect(screen.getByTitle(/bold/i)).toBeInTheDocument();
    expect(screen.getByTitle(/italic/i)).toBeInTheDocument();
  });

  it('toggles preview mode', () => {
    render(
      <DescriptionEditor
        value="**Bold text**"
        onChange={mockOnChange}
        showPreview={true}
      />
    );

    const previewButton = screen.getByTitle(/preview/i);
    fireEvent.click(previewButton);

    // In preview mode, should show rendered content
    expect(screen.getByText('Bold text')).toBeInTheDocument();
  });

  it('shows help text', () => {
    render(
      <DescriptionEditor
        value=""
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/write a clear description/i)).toBeInTheDocument();
  });

  it('indicates cross-references', () => {
    render(
      <DescriptionEditor
        value="This references [other_variable]"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/contains cross-references/i)).toBeInTheDocument();
  });

  it('indicates formatting', () => {
    render(
      <DescriptionEditor
        value="This has **bold** text"
        onChange={mockOnChange}
      />
    );

    expect(screen.getByText(/contains formatting/i)).toBeInTheDocument();
  });
});
