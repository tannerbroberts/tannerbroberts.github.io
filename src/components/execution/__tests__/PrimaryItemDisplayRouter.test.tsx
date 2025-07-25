import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PrimaryItemDisplayRouter from '../PrimaryItemDisplayRouter';
import { BasicItem, SubCalendarItem, CheckListItem, Item } from '../../../functions/utils/item/index';
import { Child } from '../../../functions/utils/item/Child';

// Mock the app context
vi.mock('../../../reducerContexts/App', () => ({
  useAppState: vi.fn(() => ({
    items: [],
  })),
}));

// Mock child components
vi.mock('../PrimaryBasicItemDisplay', () => ({
  default: ({ item }: { item: Item }) => <div data-testid="basic-item">{item.name}</div>,
}));

vi.mock('../PrimarySubCalendarItemDisplay', () => ({
  default: ({ item }: { item: Item }) => <div data-testid="subcalendar-item">{item.name}</div>,
}));

vi.mock('../PrimaryCheckListItemDisplay', () => ({
  default: ({ item }: { item: Item }) => <div data-testid="checklist-item">{item.name}</div>,
}));

// Mock execution utils
vi.mock('../executionUtils', () => ({
  getActiveChildForExecution: vi.fn(() => null),
  calculateChildStartTime: vi.fn(() => 1000000),
  isRecursionDepthValid: vi.fn(() => true),
}));

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('PrimaryItemDisplayRouter', () => {
  const baseProps = {
    taskChain: [],
    currentTime: 1000000,
    startTime: 1000000 - 15000,
    isDeepest: false,
    depth: 0,
  };

  describe('BasicItem Routing', () => {
    it('renders BasicItem correctly', () => {
      const item = new BasicItem({
        id: 'test-basic',
        name: 'Test Basic Item',
        duration: 60000,
      });

      renderWithTheme(
        <PrimaryItemDisplayRouter {...baseProps} item={item} />
      );

      expect(screen.getByTestId('basic-item')).toBeInTheDocument();
      expect(screen.getByText('Test Basic Item')).toBeInTheDocument();
    });
  });

  describe('SubCalendarItem Routing', () => {
    it('renders SubCalendarItem correctly', () => {
      const item = new SubCalendarItem({
        id: 'test-subcalendar',
        name: 'Test SubCalendar Item',
        duration: 60000,
        children: [
          new Child({ id: 'child1', start: 0 })
        ],
      });

      renderWithTheme(
        <PrimaryItemDisplayRouter {...baseProps} item={item} />
      );

      expect(screen.getByTestId('subcalendar-item')).toBeInTheDocument();
      expect(screen.getByText('Test SubCalendar Item')).toBeInTheDocument();
    });
  });

  describe('CheckListItem Routing', () => {
    it('renders CheckListItem correctly', () => {
      const item = new CheckListItem({
        id: 'test-checklist',
        name: 'Test CheckList Item',
        duration: 60000,
        children: [],
      });

      renderWithTheme(
        <PrimaryItemDisplayRouter {...baseProps} item={item} />
      );

      expect(screen.getByTestId('checklist-item')).toBeInTheDocument();
      expect(screen.getByText('Test CheckList Item')).toBeInTheDocument();
    });
  });

  describe('Recursion Protection', () => {
    it('handles maximum recursion depth', async () => {
      const utils = await import('../executionUtils');
      vi.mocked(utils.isRecursionDepthValid).mockReturnValueOnce(false);

      const item = new BasicItem({
        id: 'test-deep',
        name: 'Deep Item',
        duration: 60000,
      });

      renderWithTheme(
        <PrimaryItemDisplayRouter {...baseProps} item={item} depth={20} />
      );

      // Should still render the basic item
      expect(screen.getByTestId('basic-item')).toBeInTheDocument();
    });
  });

  describe('Props Passing', () => {
    it('passes all props correctly to child components', () => {
      const item = new BasicItem({
        id: 'test-props',
        name: 'Props Test Item',
        duration: 60000,
      });

      const customProps = {
        ...baseProps,
        isDeepest: true,
        depth: 2,
      };

      renderWithTheme(
        <PrimaryItemDisplayRouter {...customProps} item={item} />
      );

      expect(screen.getByTestId('basic-item')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('handles unknown item types gracefully', () => {
      // Create a mock item that doesn't match any known types
      const unknownItem = new BasicItem({
        id: 'unknown',
        name: 'Unknown Item',
        duration: 60000,
      });

      // Should not crash, should render as BasicItem
      expect(() => {
        renderWithTheme(
          <PrimaryItemDisplayRouter {...baseProps} item={unknownItem} />
        );
      }).not.toThrow();

      expect(screen.getByTestId('basic-item')).toBeInTheDocument();
    });
  });
});
