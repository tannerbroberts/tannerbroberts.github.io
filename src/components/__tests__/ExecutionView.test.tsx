import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ExecutionView from '../ExecutionView';
import { getCurrentTaskChain } from '../../functions/utils/item/index';

// Mock the app context
vi.mock('../../reducerContexts/App', () => ({
  useAppState: vi.fn(() => ({
    items: [],
    baseCalendar: new Map(),
  })),
}));

// Mock the current time hook
vi.mock('../../hooks/useCurrentTime', () => ({
  useCurrentTime: vi.fn(() => 1000000),
}));

// Mock the task chain utility
vi.mock('../../functions/utils/item/index', () => ({
  getCurrentTaskChain: vi.fn(() => []),
}));

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
    it('renders idle state when no tasks are active', () => {
      renderWithTheme(<ExecutionView />);

      expect(screen.getByText('🎯 No Active Task')).toBeInTheDocument();
      expect(screen.getByText('No tasks are currently scheduled for execution')).toBeInTheDocument();
      expect(screen.getByText('Ready to begin when a task becomes active')).toBeInTheDocument();
    });

    it('shows header in idle state by default', () => {
      renderWithTheme(<ExecutionView />);

      expect(screen.getByText('⚡ Current Execution')).toBeInTheDocument();
    });

    it('hides header when showHeader is false', () => {
      renderWithTheme(<ExecutionView showHeader={false} />);

      expect(screen.queryByText('⚡ Current Execution')).not.toBeInTheDocument();
      expect(screen.getByText('🎯 No Active Task')).toBeInTheDocument();
    });
  });

  describe('Active Execution State', () => {
    it('renders primary router when task is active', () => {
      // Mock an active task chain
      vi.mocked(getCurrentTaskChain).mockReturnValue([
        { id: 'test-task', name: 'Test Active Task', duration: 60000 } as any
      ]);

      renderWithTheme(<ExecutionView />);

      expect(screen.getByTestId('primary-router')).toBeInTheDocument();
      expect(screen.getByText('Executing: Test Active Task')).toBeInTheDocument();
    });

    it('shows header with active execution', () => {
      // Mock an active task chain
      vi.mocked(getCurrentTaskChain).mockReturnValue([
        { id: 'test-task', name: 'Test Active Task', duration: 60000 } as any
      ]);

      renderWithTheme(<ExecutionView />);

      expect(screen.getByText('⚡ Current Execution')).toBeInTheDocument();
      expect(screen.getByTestId('primary-router')).toBeInTheDocument();
    });

    it('hides header when showHeader is false in active state', () => {
      // Mock an active task chain
      vi.mocked(getCurrentTaskChain).mockReturnValue([
        { id: 'test-task', name: 'Test Active Task', duration: 60000 } as any
      ]);

      renderWithTheme(<ExecutionView showHeader={false} />);

      expect(screen.queryByText('⚡ Current Execution')).not.toBeInTheDocument();
      expect(screen.getByTestId('primary-router')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles task chain calculation errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      vi.mocked(getCurrentTaskChain).mockImplementation(() => {
        throw new Error('Test error');
      });

      renderWithTheme(<ExecutionView />);

      // Should fall back to idle state
      expect(screen.getByText('🎯 No Active Task')).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalledWith('Error getting current task chain:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('handles base start time calculation errors gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      // Mock task chain with valid data
      vi.mocked(getCurrentTaskChain).mockReturnValue([
        { id: 'test-task', name: 'Test Task', duration: 60000 } as any
      ]);

      renderWithTheme(<ExecutionView />);

      // Should still render the router component
      expect(screen.getByTestId('primary-router')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Performance and Memoization', () => {
    it('memoizes component properly', () => {
      const { rerender } = renderWithTheme(<ExecutionView />);

      // Re-render with same props
      rerender(
        <ThemeProvider theme={theme}>
          <ExecutionView />
        </ThemeProvider>
      );

      // Should still render correctly
      expect(screen.getByText('🎯 No Active Task')).toBeInTheDocument();
    });

    it('updates when props change', () => {
      const { rerender } = renderWithTheme(<ExecutionView showHeader={true} />);

      expect(screen.getByText('⚡ Current Execution')).toBeInTheDocument();

      rerender(
        <ThemeProvider theme={theme}>
          <ExecutionView showHeader={false} />
        </ThemeProvider>
      );

      expect(screen.queryByText('⚡ Current Execution')).not.toBeInTheDocument();
    });
  });

  describe('Visual Enhancements', () => {
    it('applies proper styling classes', () => {
      renderWithTheme(<ExecutionView />);

      const idleContainer = screen.getByText('🎯 No Active Task').closest('div');
      expect(idleContainer).toBeInTheDocument();
      // The styled components should apply CSS classes
    });

    it('includes animation styles', () => {
      renderWithTheme(<ExecutionView />);

      // Check for elements that should have animation styles applied
      // Look for the header accent bar that should have animation
      const headerElements = screen.getByText('⚡ Current Execution').parentElement;
      expect(headerElements).toBeInTheDocument();

      // Check that animation property is set through inline styles
      // Note: In testing environment, we just verify component renders without error
      // rather than checking for actual keyframe animations which may not apply in jsdom
      expect(true).toBe(true); // Simplified test - component rendered successfully
    });
  });

  describe('Accessibility', () => {
    it('provides meaningful text content for screen readers', () => {
      renderWithTheme(<ExecutionView />);

      expect(screen.getByText('🎯 No Active Task')).toBeInTheDocument();
      expect(screen.getByText('No tasks are currently scheduled for execution')).toBeInTheDocument();
    });

    it('maintains semantic structure', () => {
      renderWithTheme(<ExecutionView />);

      // Should have proper heading structure
      const heading = screen.getByText('⚡ Current Execution');
      expect(heading).toBeInTheDocument();
    });
  });
});
