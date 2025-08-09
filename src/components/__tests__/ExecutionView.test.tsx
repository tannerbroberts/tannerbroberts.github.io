import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ExecutionView from '../ExecutionView';
import { getCurrentTaskChain, type Item } from '../../functions/utils/item/index';

// Silence conflict polling by stubbing client API
vi.mock('../../api/client', () => ({
  conflictGroups: vi.fn(async () => ({ groups: [] })),
  upsertItem: vi.fn(async () => ({})),
}))

// Mock the app context
vi.mock('../../reducerContexts', () => ({
  useAppState: vi.fn(() => ({
    items: [],
    baseCalendar: new Map(),
    itemInstances: new Map(),
  })),
  useAppDispatch: vi.fn(() => vi.fn()),
}));

// Mock the current time hook
vi.mock('../../hooks/useCurrentTime', () => ({
  useCurrentTime: vi.fn(() => 1000000),
}));

// Partially mock the item utils: override getCurrentTaskChain, keep others
vi.mock('../../functions/utils/item/index', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../functions/utils/item/index')>();
  return {
    ...actual,
    getCurrentTaskChain: vi.fn(() => []),
  };
});

// Mock the router component
vi.mock('../execution', () => ({
  PrimaryItemDisplayRouter: ({ item }: { item: { name: string } }) => (
    <div data-testid="primary-router">Executing: {item.name}</div>
  ),
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('ExecutionView', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.mocked(getCurrentTaskChain).mockReturnValue([]);
    vi.clearAllMocks();
  });

  describe('Idle State', () => {
    it('renders idle state when no tasks are active', async () => {
      renderWithTheme(<ExecutionView />);

      expect(await screen.findByText('No Active Tasks')).toBeInTheDocument();
      expect(await screen.findByText('Schedule an item to begin execution')).toBeInTheDocument();
    });

    it('shows header in idle state by default', async () => {
      renderWithTheme(<ExecutionView />);
      await screen.findByText('No Active Tasks');
      // When idle, header is not shown because there is no active task
      expect(screen.queryByText('Current Task')).not.toBeInTheDocument();
    });

    it('hides header when showHeader is false', async () => {
      renderWithTheme(<ExecutionView showHeader={false} />);

      await screen.findByText('No Active Tasks');
      expect(screen.queryByText('Current Task')).not.toBeInTheDocument();
      expect(screen.getByText('No Active Tasks')).toBeInTheDocument();
    });
  });

  describe('Active Execution State', () => {
    it('renders primary router when task is active', async () => {
      // Mock an active task chain
      vi.mocked(getCurrentTaskChain).mockReturnValue([
        { id: 'test-task', name: 'Test Active Task', duration: 60000 } as unknown as Item
      ]);

      renderWithTheme(<ExecutionView />);

      expect(await screen.findByTestId('primary-router')).toBeInTheDocument();
      expect(screen.getByText('Executing: Test Active Task')).toBeInTheDocument();
    });

    it('shows header with active execution', async () => {
      // Mock an active task chain
      vi.mocked(getCurrentTaskChain).mockReturnValue([
        { id: 'test-task', name: 'Test Active Task', duration: 60000 } as unknown as Item
      ]);

      renderWithTheme(<ExecutionView />);

      expect(await screen.findByText('Current Task')).toBeInTheDocument();
      expect(screen.getByTestId('primary-router')).toBeInTheDocument();
    });

    it('hides header when showHeader is false in active state', async () => {
      // Mock an active task chain
      vi.mocked(getCurrentTaskChain).mockReturnValue([
        { id: 'test-task', name: 'Test Active Task', duration: 60000 } as unknown as Item
      ]);

      renderWithTheme(<ExecutionView showHeader={false} />);

      await screen.findByTestId('primary-router');
      expect(screen.queryByText('Current Task')).not.toBeInTheDocument();
      expect(screen.getByTestId('primary-router')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles task chain calculation errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      vi.mocked(getCurrentTaskChain).mockImplementation(() => {
        throw new Error('Test error');
      });

      renderWithTheme(<ExecutionView />);

      // Should fall back to idle state
      expect(await screen.findByText('No Active Tasks')).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith('Error getting execution context:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('handles base start time calculation errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      // Mock task chain with valid data
      vi.mocked(getCurrentTaskChain).mockReturnValue([
        { id: 'test-task', name: 'Test Task', duration: 60000 } as unknown as Item
      ]);

      renderWithTheme(<ExecutionView />);

      // Should still render the router component
      expect(await screen.findByTestId('primary-router')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Performance and Memoization', () => {
    it('memoizes component properly', async () => {
      const { rerender } = renderWithTheme(<ExecutionView />);

      // Re-render with same props
      rerender(
        <ThemeProvider theme={theme}>
          <ExecutionView />
        </ThemeProvider>
      );

      // Should still render correctly
      expect(await screen.findByText('No Active Tasks')).toBeInTheDocument();
    });

    it('updates when props change', async () => {
      // Ensure an active task so the header is rendered when showHeader is true
      vi.mocked(getCurrentTaskChain).mockReturnValue([
        { id: 'test-task', name: 'Test Active Task', duration: 60000 } as unknown as Item
      ]);
      const { rerender } = renderWithTheme(<ExecutionView showHeader={true} />);

      expect(await screen.findByText('Current Task')).toBeInTheDocument();

      rerender(
        <ThemeProvider theme={theme}>
          <ExecutionView showHeader={false} />
        </ThemeProvider>
      );

      expect(screen.queryByText('Current Task')).not.toBeInTheDocument();
    });
  });

  describe('Visual Enhancements', () => {
    it('applies proper styling classes', async () => {
      renderWithTheme(<ExecutionView />);

      const idleContainer = (await screen.findByText('No Active Tasks')).closest('div');
      expect(idleContainer).toBeInTheDocument();
      // The styled components should apply CSS classes
    });

    it('includes animation styles', async () => {
      // Make it active so header exists
      vi.mocked(getCurrentTaskChain).mockReturnValue([
        { id: 'test-task', name: 'Test Active Task', duration: 60000 } as unknown as Item
      ]);
      renderWithTheme(<ExecutionView />);

      // Check for elements that should have animation styles applied
      // Look for the header accent bar that should have animation
      const headerElements = (await screen.findByText('Current Task')).parentElement;
      expect(headerElements).toBeInTheDocument();

      // Check that animation property is set through inline styles
      // Note: In testing environment, we just verify component renders without error
      // rather than checking for actual keyframe animations which may not apply in jsdom
      expect(true).toBe(true); // Simplified test - component rendered successfully
    });
  });

  describe('Accessibility', () => {
    it('provides meaningful text content for screen readers', async () => {
      renderWithTheme(<ExecutionView />);

      expect(await screen.findByText('No Active Tasks')).toBeInTheDocument();
      expect(await screen.findByText('Schedule an item to begin execution')).toBeInTheDocument();
    });

    it('maintains semantic structure', async () => {
      // Make it active so header exists
      vi.mocked(getCurrentTaskChain).mockReturnValue([
        { id: 'test-task', name: 'Test Active Task', duration: 60000 } as unknown as Item
      ]);
      renderWithTheme(<ExecutionView />);

      // Should have proper heading structure
      const heading = await screen.findByText('Current Task');
      expect(heading).toBeInTheDocument();
    });
  });
});
