import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import LinkedDescription from '../LinkedDescription';
import { VariableDefinition } from '../../../functions/utils/item/types/VariableTypes';

// Mock variable definitions for testing
const createMockVariableDefinitions = (): Map<string, VariableDefinition> => {
  const definitions = new Map<string, VariableDefinition>();
  
  definitions.set('1', {
    id: '1',
    name: 'eggs',
    description: 'Number of eggs',
    unit: 'count',
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  
  definitions.set('2', {
    id: '2',
    name: 'flour',
    description: 'Amount of flour',
    unit: 'cups',
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  
  return definitions;
};

describe('LinkedDescription', () => {
  let mockDefinitions: Map<string, VariableDefinition>;
  const mockOnVariableClick = vi.fn();

  beforeEach(() => {
    mockDefinitions = createMockVariableDefinitions();
    mockOnVariableClick.mockClear();
  });

  it('should render description with variable links', () => {
    const description = 'This recipe uses [eggs] and [flour].';
    
    render(
      <LinkedDescription
        description={description}
        variableDefinitions={mockDefinitions}
        onVariableClick={mockOnVariableClick}
      />
    );

    // Check that variable links are rendered
    expect(screen.getByText('eggs')).toBeInTheDocument();
    expect(screen.getByText('flour')).toBeInTheDocument();
  });

  it('should handle variable link clicks', () => {
    const description = 'This recipe uses [eggs].';
    
    render(
      <LinkedDescription
        description={description}
        variableDefinitions={mockDefinitions}
        onVariableClick={mockOnVariableClick}
      />
    );

    const eggLink = screen.getByText('eggs');
    fireEvent.click(eggLink);
    
    expect(mockOnVariableClick).toHaveBeenCalledWith('1');
  });

  it('should show validation status for broken links', () => {
    const description = 'This recipe uses [eggs] and [invalid].';
    
    render(
      <LinkedDescription
        description={description}
        variableDefinitions={mockDefinitions}
        showValidation={true}
      />
    );

    // Should show both valid and broken link indicators
    expect(screen.getByText('1 linked')).toBeInTheDocument();
    expect(screen.getByText('1 broken')).toBeInTheDocument();
  });

  it('should expand and collapse long descriptions', () => {
    const longDescription = 'This is a very long description that should be truncated initially. '.repeat(10) + '[eggs]';
    
    render(
      <LinkedDescription
        description={longDescription}
        variableDefinitions={mockDefinitions}
        maxLines={2}
        showExpandToggle={true}
      />
    );

    // Should show expand button initially
    const expandButton = screen.getByText('Show More');
    expect(expandButton).toBeInTheDocument();

    // Click to expand
    fireEvent.click(expandButton);
    expect(screen.getByText('Show Less')).toBeInTheDocument();
  });

  it('should highlight search terms', () => {
    const description = 'This recipe uses [eggs] and flour.';
    
    render(
      <LinkedDescription
        description={description}
        variableDefinitions={mockDefinitions}
        searchTerm="recipe"
      />
    );

    // Should show search indicator
    expect(screen.getByText('Highlighting search: "recipe"')).toBeInTheDocument();
  });

  it('should show empty state for no description', () => {
    render(
      <LinkedDescription
        description=""
        variableDefinitions={mockDefinitions}
      />
    );

    expect(screen.getByText('No description available')).toBeInTheDocument();
  });

  it('should handle compact mode', () => {
    const description = 'This recipe uses [eggs] and [flour].';
    
    render(
      <LinkedDescription
        description={description}
        variableDefinitions={mockDefinitions}
        compact={true}
        showValidation={false}
      />
    );

    // In compact mode, validation chips should not be shown
    expect(screen.queryByText('1 linked')).not.toBeInTheDocument();
  });

  it('should render markdown formatting', () => {
    const description = 'This is **bold** and _italic_ text with [eggs].';
    
    render(
      <LinkedDescription
        description={description}
        variableDefinitions={mockDefinitions}
      />
    );

    // Check that HTML formatting is applied (bold and italic)
    const container = screen.getByText('eggs').closest('div');
    expect(container?.innerHTML).toContain('<strong>bold</strong>');
    expect(container?.innerHTML).toContain('<em>italic</em>');
  });

  it('should handle bullet lists', () => {
    const description = 'Ingredients:\n- [eggs]\n- [flour]\n- Salt';
    
    render(
      <LinkedDescription
        description={description}
        variableDefinitions={mockDefinitions}
      />
    );

    // Check that list formatting is applied
    const container = screen.getByText('eggs').closest('div');
    expect(container?.innerHTML).toContain('<ul');
    expect(container?.innerHTML).toContain('<li>');
  });

  it('should show broken link details when clicked', () => {
    const description = 'This recipe uses [eggs] and [invalid].';
    
    render(
      <LinkedDescription
        description={description}
        variableDefinitions={mockDefinitions}
        showValidation={true}
      />
    );

    // Click the broken links chip to expand details
    const brokenChip = screen.getByText('1 broken');
    fireEvent.click(brokenChip);
    
    expect(screen.getByText('Broken Variable Links:')).toBeInTheDocument();
    // Use getByText with a function to handle split text content
    expect(screen.getByText((_content, element) => {
      return element?.textContent === '[invalid]';
    })).toBeInTheDocument();
    expect(screen.getByText('- Variable not found')).toBeInTheDocument();
  });
});
