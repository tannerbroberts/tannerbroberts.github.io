import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DescriptionDisplay from '../DescriptionDisplay';

describe('DescriptionDisplay', () => {
  const mockOnVariableClick = vi.fn();

  beforeEach(() => {
    mockOnVariableClick.mockClear();
  });

  it('renders empty state', () => {
    render(
      <DescriptionDisplay description="" />
    );

    expect(screen.getByText(/no description available/i)).toBeInTheDocument();
  });

  it('renders basic description', () => {
    render(
      <DescriptionDisplay description="This is a test description" />
    );

    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  it('renders bold formatting', () => {
    render(
      <DescriptionDisplay description="This has **bold** text" />
    );

    const boldElement = screen.getByText('bold');
    expect(boldElement.tagName).toBe('STRONG');
  });

  it('renders italic formatting', () => {
    render(
      <DescriptionDisplay description="This has _italic_ text" />
    );

    const italicElement = screen.getByText('italic');
    expect(italicElement.tagName).toBe('EM');
  });

  it('renders variable references', () => {
    render(
      <DescriptionDisplay description="References [test_variable]" />
    );

    expect(screen.getByText('test_variable')).toBeInTheDocument();
  });

  it('calls onVariableClick when variable is clicked', () => {
    render(
      <DescriptionDisplay
        description="References [test_variable]"
        onVariableClick={mockOnVariableClick}
      />
    );

    const variableElement = screen.getByText('test_variable');
    fireEvent.click(variableElement);

    expect(mockOnVariableClick).toHaveBeenCalledWith('test_variable');
  });

  it('highlights search terms', () => {
    render(
      <DescriptionDisplay
        description="This is a test description"
        searchTerm="test"
      />
    );

    expect(screen.getByText('test')).toHaveStyle({ backgroundColor: '#fff59d' });
  });

  it('shows expand/collapse for long content', () => {
    const longDescription = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
    render(
      <DescriptionDisplay
        description={longDescription}
        maxLines={3}
        showExpandToggle={true}
      />
    );

    expect(screen.getByText(/show more/i)).toBeInTheDocument();
  });

  it('expands when expand button is clicked', () => {
    const longDescription = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';
    render(
      <DescriptionDisplay
        description={longDescription}
        maxLines={2}
        showExpandToggle={true}
      />
    );

    const expandButton = screen.getByText(/show more/i);
    fireEvent.click(expandButton);

    expect(screen.getByText(/show less/i)).toBeInTheDocument();
  });

  it('shows referenced variables as chips', () => {
    render(
      <DescriptionDisplay
        description="Uses [variable1] and [variable2]"
        compact={false}
      />
    );

    expect(screen.getByText('variable1')).toBeInTheDocument();
    expect(screen.getByText('variable2')).toBeInTheDocument();
    expect(screen.getByText(/references:/i)).toBeInTheDocument();
  });

  it('renders bullet lists', () => {
    render(
      <DescriptionDisplay description="List:\n- Item 1\n- Item 2" />
    );

    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  it('handles compact mode', () => {
    render(
      <DescriptionDisplay
        description="Test description"
        compact={true}
      />
    );

    // In compact mode, should not show references section
    expect(screen.queryByText(/references:/i)).not.toBeInTheDocument();
  });
});
