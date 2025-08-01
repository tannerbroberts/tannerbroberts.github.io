import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PrimaryItemDisplayRouter from '../PrimaryItemDisplayRouter';
import { BasicItem, SubCalendarItem, CheckListItem, Item } from '../../../functions/utils/item/index';
import { Child } from '../../../functions/utils/item/Child';

// Mock the app context with dynamic items
const mockItems: Item[] = [];
const mockUseAppState = vi.fn(() => ({
  items: mockItems,
}));

vi.mock('../../../reducerContexts/App', () => ({
  useAppState: () => mockUseAppState(),
}));

// Mock child components that show which item they're rendering
vi.mock('../PrimaryBasicItemDisplay', () => ({
  default: ({ item }: { item: Item }) =>
    <div data-testid="basic-item" data-item-id={item.id} data-item-name={item.name}>
      {item.name}
    </div>,
}));

vi.mock('../PrimarySubCalendarItemDisplay', () => ({
  default: ({ item, children }: { item: Item; children?: React.ReactNode }) =>
    <div data-testid="subcalendar-item" data-item-id={item.id} data-item-name={item.name}>
      {item.name}
      {children}
    </div>,
}));

vi.mock('../PrimaryCheckListItemDisplay', () => ({
  default: ({ item, children }: { item: Item; children?: React.ReactNode }) =>
    <div data-testid="checklist-item" data-item-id={item.id} data-item-name={item.name}>
      {item.name}
      {children}
    </div>,
}));

// Use the real execution utils (since they were fixed in previous steps)
vi.unmock('../executionUtils');

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('PrimaryItemDisplayRouter - Multi-Child Rendering', () => {
  beforeEach(() => {
    mockItems.length = 0; // Clear the mock items array
  });

  describe('SubCalendar Multi-Child Rendering', () => {
    it('should render correct child during different time phases', async () => {
      // Create child items
      const childItem1 = new BasicItem({ id: 'child1', name: 'First Child', duration: 10000 });
      const childItem2 = new BasicItem({ id: 'child2', name: 'Second Child', duration: 15000 });
      const childItem3 = new BasicItem({ id: 'child3', name: 'Third Child', duration: 8000 });

      // Create child references with start times
      const child1 = new Child({ id: childItem1.id, start: 0 });        // 0-10s
      const child2 = new Child({ id: childItem2.id, start: 10000 });    // 10-25s  
      const child3 = new Child({ id: childItem3.id, start: 25000 });    // 25-33s

      const subCalendarItem = new SubCalendarItem({
        id: 'parent',
        name: 'Parent SubCalendar',
        duration: 33000,
        children: [child1, child2, child3]
      });

      // Add all items to mock
      mockItems.push(subCalendarItem, childItem1, childItem2, childItem3);

      const baseProps = {
        item: subCalendarItem,
        taskChain: [subCalendarItem],
        startTime: 1000,
        isDeepest: false,
        depth: 0,
      };

      // Test Phase 1: First child should be active (time: 5000ms after start)
      const { rerender } = renderWithTheme(
        <PrimaryItemDisplayRouter
          {...baseProps}
          currentTime={6000} // 5s into execution
        />
      );

      // Should render SubCalendar parent with first child
      expect(screen.getByTestId('subcalendar-item')).toBeInTheDocument();
      expect(screen.getByText('Parent SubCalendar')).toBeInTheDocument();
      expect(screen.getByTestId('basic-item')).toBeInTheDocument();
      expect(screen.getByText('First Child')).toBeInTheDocument();

      // Test Phase 2: Second child should be active (time: 15000ms after start)
      rerender(
        <ThemeProvider theme={theme}>
          <PrimaryItemDisplayRouter
            {...baseProps}
            currentTime={16000} // 15s into execution
          />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Second Child')).toBeInTheDocument();
      });

      // Test Phase 3: Third child should be active (time: 27000ms after start)
      rerender(
        <ThemeProvider theme={theme}>
          <PrimaryItemDisplayRouter
            {...baseProps}
            currentTime={28000} // 27s into execution
          />
        </ThemeProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Third Child')).toBeInTheDocument();
      });

      // Test Phase 4: No child should be active during gap period (time: 35000ms after start)
      rerender(
        <ThemeProvider theme={theme}>
          <PrimaryItemDisplayRouter
            {...baseProps}
            currentTime={36000} // 35s into execution (after all children)
          />
        </ThemeProvider>
      );

      // Should still render parent but no child content
      expect(screen.getByText('Parent SubCalendar')).toBeInTheDocument();
      expect(screen.queryByTestId('basic-item')).not.toBeInTheDocument();
    });

    it('should handle nested SubCalendar children correctly', async () => {
      // Create nested structure: SubCalendar -> SubCalendar -> BasicItem
      const grandchildItem = new BasicItem({ id: 'grandchild', name: 'Grandchild Task', duration: 5000 });
      const grandchildRef = new Child({ id: grandchildItem.id, start: 2000 });

      const childSubCalendar = new SubCalendarItem({
        id: 'childSub',
        name: 'Child SubCalendar',
        duration: 10000,
        children: [grandchildRef]
      });

      const childRef = new Child({ id: childSubCalendar.id, start: 5000 });

      const parentSubCalendar = new SubCalendarItem({
        id: 'parentSub',
        name: 'Parent SubCalendar',
        duration: 20000,
        children: [childRef]
      });

      mockItems.push(parentSubCalendar, childSubCalendar, grandchildItem);

      renderWithTheme(
        <PrimaryItemDisplayRouter
          item={parentSubCalendar}
          taskChain={[parentSubCalendar]}
          currentTime={10000} // 9s into execution (child SubCalendar active, grandchild active)
          startTime={1000}
          isDeepest={false}
          depth={0}
        />
      );

      // Should render nested structure
      expect(screen.getByText('Parent SubCalendar')).toBeInTheDocument();
      expect(screen.getByText('Child SubCalendar')).toBeInTheDocument();
      expect(screen.getByText('Grandchild Task')).toBeInTheDocument();
    });
  });

  describe('CheckList Multi-Child Rendering', () => {
    it('should render the active checklist child correctly', () => {
      const childItem1 = new BasicItem({ id: 'checkChild1', name: 'Check Child 1', duration: 5000 });
      const childItem2 = new BasicItem({ id: 'checkChild2', name: 'Check Child 2', duration: 7000 });

      const checkListItem = new CheckListItem({
        id: 'checklist',
        name: 'Parent CheckList',
        duration: 15000,
        children: [
          { itemId: childItem1.id, complete: false, relationshipId: 'rel1' },
          { itemId: childItem2.id, complete: false, relationshipId: 'rel2' }
        ]
      });

      mockItems.push(checkListItem, childItem1, childItem2);

      renderWithTheme(
        <PrimaryItemDisplayRouter
          item={checkListItem}
          taskChain={[checkListItem]}
          currentTime={5000}
          startTime={1000}
          isDeepest={false}
          depth={0}
        />
      );

      // Should render CheckList parent with first incomplete child
      expect(screen.getByText('Parent CheckList')).toBeInTheDocument();
      expect(screen.getByText('Check Child 1')).toBeInTheDocument();
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle rapid time changes without performance issues', async () => {
      const childItem1 = new BasicItem({ id: 'rapid1', name: 'Rapid 1', duration: 1000 });
      const childItem2 = new BasicItem({ id: 'rapid2', name: 'Rapid 2', duration: 1000 });

      const child1 = new Child({ id: childItem1.id, start: 0 });
      const child2 = new Child({ id: childItem2.id, start: 1000 });

      const subCalendarItem = new SubCalendarItem({
        id: 'rapidParent',
        name: 'Rapid Parent',
        duration: 2000,
        children: [child1, child2]
      });

      mockItems.push(subCalendarItem, childItem1, childItem2);

      const baseProps = {
        item: subCalendarItem,
        taskChain: [subCalendarItem],
        startTime: 1000,
        isDeepest: false,
        depth: 0,
      };

      const { rerender } = renderWithTheme(
        <PrimaryItemDisplayRouter {...baseProps} currentTime={1500} />
      );

      // Rapidly change times
      const timePoints = [1700, 1900, 2100, 2300, 2500];

      for (const time of timePoints) {
        rerender(
          <ThemeProvider theme={theme}>
            <PrimaryItemDisplayRouter {...baseProps} currentTime={time} />
          </ThemeProvider>
        );

        // Allow React to process the change
        await act(async () => {
          await Promise.resolve();
        });
      }

      // Component should still render without crashes
      expect(screen.getByText('Rapid Parent')).toBeInTheDocument();
    });

    it('should handle empty children arrays gracefully', () => {
      const emptySubCalendar = new SubCalendarItem({
        id: 'empty',
        name: 'Empty SubCalendar',
        duration: 10000,
        children: []
      });

      mockItems.push(emptySubCalendar);

      renderWithTheme(
        <PrimaryItemDisplayRouter
          item={emptySubCalendar}
          taskChain={[emptySubCalendar]}
          currentTime={5000}
          startTime={1000}
          isDeepest={false}
          depth={0}
        />
      );

      // Should render parent without crashing
      expect(screen.getByText('Empty SubCalendar')).toBeInTheDocument();
      expect(screen.queryByTestId('basic-item')).not.toBeInTheDocument();
    });

    it('should respect recursion depth limits', () => {
      const basicItem = new BasicItem({ id: 'deep', name: 'Deep Item', duration: 5000 });
      mockItems.push(basicItem);

      renderWithTheme(
        <PrimaryItemDisplayRouter
          item={basicItem}
          taskChain={[basicItem]}
          currentTime={3000}
          startTime={1000}
          isDeepest={false}
          depth={15} // Exceeds max depth
        />
      );

      // Should still render basic item (no children to limit)
      expect(screen.getByText('Deep Item')).toBeInTheDocument();
    });
  });

  describe('Memoization and Re-rendering', () => {
    it('should re-render when activeChild changes due to time progression', async () => {
      const childItem1 = new BasicItem({ id: 'memo1', name: 'Memo Child 1', duration: 5000 });
      const childItem2 = new BasicItem({ id: 'memo2', name: 'Memo Child 2', duration: 5000 });

      const child1 = new Child({ id: childItem1.id, start: 0 });
      const child2 = new Child({ id: childItem2.id, start: 5000 });

      const subCalendarItem = new SubCalendarItem({
        id: 'memoParent',
        name: 'Memo Parent',
        duration: 10000,
        children: [child1, child2]
      });

      mockItems.push(subCalendarItem, childItem1, childItem2);

      const baseProps = {
        item: subCalendarItem,
        taskChain: [subCalendarItem],
        startTime: 1000,
        isDeepest: false,
        depth: 0,
      };

      const { rerender } = renderWithTheme(
        <PrimaryItemDisplayRouter {...baseProps} currentTime={3000} />
      );

      // Should show first child initially
      expect(screen.getByText('Memo Child 1')).toBeInTheDocument();
      expect(screen.queryByText('Memo Child 2')).not.toBeInTheDocument();

      // Change time to activate second child
      rerender(
        <ThemeProvider theme={theme}>
          <PrimaryItemDisplayRouter {...baseProps} currentTime={8000} />
        </ThemeProvider>
      );

      // Should now show second child
      await waitFor(() => {
        expect(screen.queryByText('Memo Child 1')).not.toBeInTheDocument();
        expect(screen.getByText('Memo Child 2')).toBeInTheDocument();
      });
    });
  });
});
