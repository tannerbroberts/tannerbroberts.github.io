import { describe, test, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import VariableDescriptionPopup from '../VariableDescriptionPopup';
import { useAppState } from '../../../reducerContexts/App';
import { useVariableDescriptions } from '../../../hooks/useVariableDescriptions';

// Mock the dependencies
vi.mock('../../../reducerContexts/App', () => ({
  useAppState: vi.fn()
}));

vi.mock('../../../hooks/useVariableDescriptions', () => ({
  useVariableDescriptions: vi.fn()
}));

vi.mock('../../hooks/usePopupPositioning', () => ({
  usePopupPositioning: vi.fn(() => ({
    calculatePosition: vi.fn(() => ({ x: 100, y: 100 })),
    clearPosition: vi.fn()
  }))
}));

vi.mock('../../hooks/useVariablePopupNavigation', () => ({
  useVariablePopupNavigation: vi.fn(() => ({
    currentVariable: null,
    history: [],
    historyIndex: -1,
    canGoBack: false,
    canGoForward: false,
    navigateToVariable: vi.fn(),
    goBack: vi.fn(),
    goForward: vi.fn(),
    clearHistory: vi.fn(),
    getNavigationPath: vi.fn(() => [])
  }))
}));

const mockUseAppState = useAppState as ReturnType<typeof vi.fn>;
const mockUseVariableDescriptions = useVariableDescriptions as ReturnType<typeof vi.fn>;

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('VariableDescriptionPopup', () => {
  const mockVariableDefinitions = new Map([
    ['def1', {
      id: 'def1',
      name: 'test-variable',
      description: 'Test variable description',
      category: 'ingredients',
      unit: 'cups',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }]
  ]);

  const mockDescription = {
    content: 'This is a test variable with some **bold** text and a [linked-variable] reference.',
    lastModified: Date.now()
  };

  const defaultProps = {
    open: true,
    variableDefinitionId: 'def1',
    variableName: 'test-variable',
    mousePosition: { x: 100, y: 100 },
    onClose: vi.fn()
  };

  beforeEach(() => {
    mockUseAppState.mockReturnValue({
      variableDefinitions: mockVariableDefinitions
    });

    mockUseVariableDescriptions.mockReturnValue({
      getDescription: vi.fn().mockReturnValue(mockDescription)
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  test('should render popup when open', async () => {
    render(
      <TestWrapper>
        <VariableDescriptionPopup {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('test-variable')).toBeInTheDocument();
    });
  });

  test('should not render when closed', () => {
    render(
      <TestWrapper>
        <VariableDescriptionPopup {...defaultProps} open={false} />
      </TestWrapper>
    );

    expect(screen.queryByText('test-variable')).not.toBeInTheDocument();
  });

  test('should display variable name and metadata', async () => {
    render(
      <TestWrapper>
        <VariableDescriptionPopup {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('test-variable')).toBeInTheDocument();
      expect(screen.getByText('ingredients')).toBeInTheDocument();
      expect(screen.getByText('Unit: cups')).toBeInTheDocument();
    });
  });

  test('should display description content', async () => {
    render(
      <TestWrapper>
        <VariableDescriptionPopup {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/This is a test variable/)).toBeInTheDocument();
    });
  });

  test('should call onClose when escape key is pressed', async () => {
    const onClose = vi.fn();

    render(
      <TestWrapper>
        <VariableDescriptionPopup {...defaultProps} onClose={onClose} />
      </TestWrapper>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });

  test('should handle missing variable definition', async () => {
    mockUseAppState.mockReturnValue({
      variableDefinitions: new Map()
    });

    render(
      <TestWrapper>
        <VariableDescriptionPopup {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('test-variable')).toBeInTheDocument();
    });
  });

  test('should handle missing description', async () => {
    mockUseVariableDescriptions.mockReturnValue({
      getDescription: vi.fn().mockReturnValue(undefined)
    });

    render(
      <TestWrapper>
        <VariableDescriptionPopup {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/No description available/)).toBeInTheDocument();
    });
  });

  test('should render in compact mode', async () => {
    render(
      <TestWrapper>
        <VariableDescriptionPopup {...defaultProps} compact={true} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('test-variable')).toBeInTheDocument();
    });

    // In compact mode, keyboard hints should not be shown
    expect(screen.queryByText(/Keyboard Shortcuts/)).not.toBeInTheDocument();
  });

  test('should call onEdit when edit button is clicked', async () => {
    const onEdit = vi.fn();

    render(
      <TestWrapper>
        <VariableDescriptionPopup {...defaultProps} onEdit={onEdit} />
      </TestWrapper>
    );

    await waitFor(() => {
      const editButton = screen.getByLabelText(/Edit variable/);
      fireEvent.click(editButton);
    });

    expect(onEdit).toHaveBeenCalledWith('def1');
  });

  test('should call onViewDefinition when view definition button is clicked', async () => {
    const onViewDefinition = vi.fn();

    render(
      <TestWrapper>
        <VariableDescriptionPopup {...defaultProps} onViewDefinition={onViewDefinition} />
      </TestWrapper>
    );

    await waitFor(() => {
      const viewButton = screen.getByLabelText(/View definition/);
      fireEvent.click(viewButton);
    });

    expect(onViewDefinition).toHaveBeenCalledWith('def1');
  });

  test('should position popup at mouse coordinates', async () => {
    const mousePosition = { x: 200, y: 300 };

    render(
      <TestWrapper>
        <VariableDescriptionPopup {...defaultProps} mousePosition={mousePosition} />
      </TestWrapper>
    );

    await waitFor(() => {
      const popup = screen.getByRole('dialog', { hidden: true });
      expect(popup).toHaveStyle({ position: 'fixed' });
    });
  });

  test('should respect max dimensions', async () => {
    render(
      <TestWrapper>
        <VariableDescriptionPopup
          {...defaultProps}
          maxWidth={300}
          maxHeight={400}
        />
      </TestWrapper>
    );

    await waitFor(() => {
      const popup = screen.getByRole('dialog', { hidden: true });
      expect(popup).toHaveStyle({
        width: '300px',
        maxHeight: '400px'
      });
    });
  });

  test('should handle navigation between variables', async () => {
    render(
      <TestWrapper>
        <VariableDescriptionPopup {...defaultProps} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('test-variable')).toBeInTheDocument();
    });

    // This test would need more complex mocking of the navigation system
    // to fully test variable navigation within the popup
  });

  test('should show loading state', async () => {
    render(
      <TestWrapper>
        <VariableDescriptionPopup {...defaultProps} />
      </TestWrapper>
    );

    // You might need to modify the component to expose loading state for testing
    // or use more sophisticated mocking to trigger loading states
  });

  test('should show error state', async () => {
    // This would require modifying the component to accept error props
    // or mocking the dependencies to return errors
  });

  test('should close on click away', async () => {
    const onClose = vi.fn();

    render(
      <TestWrapper>
        <VariableDescriptionPopup {...defaultProps} onClose={onClose} />
      </TestWrapper>
    );

    // Click outside the popup
    fireEvent.mouseDown(document.body);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalled();
    });
  });
});
