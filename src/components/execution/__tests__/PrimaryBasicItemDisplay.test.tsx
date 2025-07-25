import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PrimaryBasicItemDisplay from '../PrimaryBasicItemDisplay';
import { BasicItem } from '../../../functions/utils/item/BasicItem';

// Mock the formatTime utility
vi.mock('../../../functions/utils/formatTime', () => ({
  formatDuration: vi.fn((ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }),
}));

// Mock the task progress utility
vi.mock('../../../functions/utils/item/utils', () => ({
  getTaskProgress: vi.fn((item, currentTime, startTime) => {
    const elapsed = currentTime - startTime;
    const progress = (elapsed / item.duration) * 100;
    return Math.min(100, Math.max(0, progress));
  }),
}));

const theme = createTheme();

// Helper function to render component with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

// Mock data
const createMockBasicItem = (overrides = {}) => new BasicItem({
  id: 'test-basic-item',
  name: 'Test Basic Task',
  duration: 60000, // 1 minute
  priority: 0,
  ...overrides,
});

// Create proper mock task chain with all required Item properties
const createMockTaskChain = () => [
  new BasicItem({
    id: 'test-basic-item',
    name: 'Test Basic Task',
    duration: 60000,
  })
];

describe('PrimaryBasicItemDisplay', () => {
  const defaultProps = {
    item: createMockBasicItem(),
    taskChain: createMockTaskChain(),
    currentTime: 1000000,
    startTime: 1000000 - 15000, // Started 15 seconds ago
    isDeepest: false,
  };

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      renderWithTheme(<PrimaryBasicItemDisplay {...defaultProps} />);
      expect(screen.getByText('Test Basic Task')).toBeInTheDocument();
    });

    it('displays item name correctly', () => {
      renderWithTheme(<PrimaryBasicItemDisplay {...defaultProps} />);
      expect(screen.getByText('Test Basic Task')).toBeInTheDocument();
    });

    it('shows progress percentage', () => {
      renderWithTheme(<PrimaryBasicItemDisplay {...defaultProps} />);
      // Should show progress percentage (15000ms out of 60000ms = 25%)
      expect(screen.getByText('25.0%')).toBeInTheDocument();
    });

    it('displays duration information', () => {
      renderWithTheme(<PrimaryBasicItemDisplay {...defaultProps} />);
      expect(screen.getByText('Duration')).toBeInTheDocument();
      expect(screen.getByText('1m 0s')).toBeInTheDocument();
    });

    it('displays remaining time', () => {
      renderWithTheme(<PrimaryBasicItemDisplay {...defaultProps} />);
      expect(screen.getByText('Remaining')).toBeInTheDocument();
      expect(screen.getByText('45s')).toBeInTheDocument();
    });
  });

  describe('Priority Handling', () => {
    it('does not show priority indicator for priority 0', () => {
      const item = createMockBasicItem({ priority: 0 });
      renderWithTheme(<PrimaryBasicItemDisplay {...defaultProps} item={item} />);
      expect(screen.queryByText(/Priority/)).not.toBeInTheDocument();
    });

    it('shows priority indicator for priority > 0', () => {
      const item = createMockBasicItem({ priority: 2 });
      renderWithTheme(<PrimaryBasicItemDisplay {...defaultProps} item={item} />);
      expect(screen.getByText('Priority 2')).toBeInTheDocument();
    });
  });

  describe('Progress States', () => {
    it('shows correct progress for partially completed task', () => {
      const props = {
        ...defaultProps,
        currentTime: 1000000,
        startTime: 1000000 - 30000, // 30 seconds elapsed out of 60 seconds = 50%
      };
      renderWithTheme(<PrimaryBasicItemDisplay {...props} />);
      expect(screen.getByText('50.0%')).toBeInTheDocument();
    });

    it('shows completion state when task is finished', () => {
      const props = {
        ...defaultProps,
        currentTime: 1000000,
        startTime: 1000000 - 70000, // 70 seconds elapsed (more than 60 second duration)
      };
      renderWithTheme(<PrimaryBasicItemDisplay {...props} />);
      expect(screen.getByText('Complete')).toBeInTheDocument();
    });

    it('handles zero progress correctly', () => {
      const props = {
        ...defaultProps,
        currentTime: 1000000,
        startTime: 1000000, // Just started
      };
      renderWithTheme(<PrimaryBasicItemDisplay {...props} />);
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });
  });

  describe('Deepest Item Styling', () => {
    it('shows "Currently Executing" badge when isDeepest is true', () => {
      const props = { ...defaultProps, isDeepest: true };
      renderWithTheme(<PrimaryBasicItemDisplay {...props} />);
      expect(screen.getByText('⚡ Currently Executing')).toBeInTheDocument();
    });

    it('does not show execution badge when isDeepest is false', () => {
      const props = { ...defaultProps, isDeepest: false };
      renderWithTheme(<PrimaryBasicItemDisplay {...props} />);
      expect(screen.queryByText('⚡ Currently Executing')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles errors in progress calculation gracefully', async () => {
      // Mock console.error to avoid noise in tests
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

      // Mock getTaskProgress to throw an error
      const utils = await import('../../../functions/utils/item/utils');
      vi.mocked(utils.getTaskProgress).mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      renderWithTheme(<PrimaryBasicItemDisplay {...defaultProps} />);

      // Should still render and show 0% progress
      expect(screen.getByText('0.0%')).toBeInTheDocument();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('handles very short durations', () => {
      const item = createMockBasicItem({ duration: 1000 }); // 1 second
      const props = {
        ...defaultProps,
        item,
        currentTime: 1000000,
        startTime: 1000000 - 500, // 0.5 seconds elapsed
      };
      renderWithTheme(<PrimaryBasicItemDisplay {...props} />);
      expect(screen.getByText('50.0%')).toBeInTheDocument();
    });

    it('handles items with no name', () => {
      const item = createMockBasicItem({ name: '' });
      renderWithTheme(<PrimaryBasicItemDisplay {...defaultProps} item={item} />);
      // Should still render without crashing
      expect(screen.getByText('Progress')).toBeInTheDocument();
    });
  });
});
