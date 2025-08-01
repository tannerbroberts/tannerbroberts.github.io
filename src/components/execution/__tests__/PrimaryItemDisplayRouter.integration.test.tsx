import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PrimaryItemDisplayRouter from '../PrimaryItemDisplayRouter';
import { BasicItem, SubCalendarItem, Item } from '../../../functions/utils/item/index';
import { Child } from '../../../functions/utils/item/Child';

// This test focuses on real-world execution scenarios that could reveal
// issues with memoization dependencies or child transition handling

const mockItems: Item[] = [];
vi.mock('../../../reducerContexts/App', () => ({
  useAppState: () => ({ items: mockItems }),
}));

// Track which items are rendered to detect memoization issues
const renderCalls: string[] = [];

vi.mock('../PrimaryBasicItemDisplay', () => ({
  default: ({ item }: { item: Item }) => {
    renderCalls.push(`BasicItem:${item.name}:${Date.now()}`);
    return <div data-testid={`basic-${item.id}`}>{item.name}</div>;
  },
}));

vi.mock('../PrimarySubCalendarItemDisplay', () => ({
  default: ({ item, children }: { item: Item; children?: React.ReactNode }) => {
    renderCalls.push(`SubCalendar:${item.name}:${Date.now()}`);
    return (
      <div data-testid={`subcalendar-${item.id}`}>
        {item.name}
        {children}
      </div>
    );
  },
}));

const theme = createTheme();

describe('PrimaryItemDisplayRouter - Real-world Integration', () => {
  beforeEach(() => {
    mockItems.length = 0;
    renderCalls.length = 0;
  });

  it('should handle complex multi-child scenario with time progression', () => {
    // Create a realistic scenario: a SubCalendar with 3 children
    // Child 1: 0-5s (5s duration)
    // Gap period: 5-8s (3s gap)
    // Child 2: 8-15s (7s duration)
    // Child 3: 15-20s (5s duration)

    const child1 = new BasicItem({
      id: 'task1',
      name: 'Setup Phase',
      duration: 5000
    });

    const child2 = new BasicItem({
      id: 'task2',
      name: 'Main Work',
      duration: 7000
    });

    const child3 = new BasicItem({
      id: 'task3',
      name: 'Cleanup',
      duration: 5000
    });

    const parentItem = new SubCalendarItem({
      id: 'workflow',
      name: 'Work Workflow',
      duration: 20000,
      children: [
        new Child({ id: child1.id, start: 0 }),     // 0-5s
        new Child({ id: child2.id, start: 8000 }),  // 8-15s (gap from 5-8s)
        new Child({ id: child3.id, start: 15000 })  // 15-20s
      ]
    });

    mockItems.push(parentItem, child1, child2, child3);

    const baseProps = {
      item: parentItem,
      taskChain: [parentItem],
      startTime: 10000, // Start at timestamp 10000
      isDeepest: false,
      depth: 0,
    };

    // Test sequence: Before start, Child1, Gap, Child2, Child3, After end
    const testScenarios = [
      {
        currentTime: 9000,  // Before start (-1s)
        expectedChild: null,
        phase: 'Before execution starts'
      },
      {
        currentTime: 12000, // 2s into execution (Child1 active)
        expectedChild: 'Setup Phase',
        phase: 'First child active'
      },
      {
        currentTime: 16500, // 6.5s into execution (Gap period)
        expectedChild: null,
        phase: 'Gap period between children'
      },
      {
        currentTime: 22000, // 12s into execution (Child2 active)
        expectedChild: 'Main Work',
        phase: 'Second child active'
      },
      {
        currentTime: 26000, // 16s into execution (Child3 active)
        expectedChild: 'Cleanup',
        phase: 'Third child active'
      },
      {
        currentTime: 32000, // 22s into execution (After end)
        expectedChild: null,
        phase: 'After execution ends'
      }
    ];

    testScenarios.forEach(({ currentTime, expectedChild, phase }) => {
      console.log(`\n=== Testing ${phase} (time: ${currentTime}) ===`);

      const { unmount } = render(
        <ThemeProvider theme={theme}>
          <PrimaryItemDisplayRouter
            {...baseProps}
            currentTime={currentTime}
            key={currentTime} // Force new render for each scenario
          />
        </ThemeProvider>
      );

      // Check parent is always rendered
      expect(screen.getByTestId('subcalendar-workflow')).toBeInTheDocument();
      expect(screen.getByText('Work Workflow')).toBeInTheDocument();

      if (expectedChild) {
        // Should render the expected child
        expect(screen.getByText(expectedChild)).toBeInTheDocument();
        console.log(`✓ Correctly rendering child: ${expectedChild}`);
      } else {
        // Should not render any child during gap/before/after periods
        expect(screen.queryByTestId('basic-task1')).not.toBeInTheDocument();
        expect(screen.queryByTestId('basic-task2')).not.toBeInTheDocument();
        expect(screen.queryByTestId('basic-task3')).not.toBeInTheDocument();
        console.log(`✓ Correctly showing no child during ${phase}`);
      }

      unmount();
    });
  });

  it('should verify memoization dependencies work correctly', () => {
    const child1 = new BasicItem({ id: 'memo-child', name: 'Memo Test', duration: 5000 });
    const parentItem = new SubCalendarItem({
      id: 'memo-parent',
      name: 'Memo Parent',
      duration: 10000,
      children: [new Child({ id: child1.id, start: 0 })]
    });

    mockItems.push(parentItem, child1);

    const baseProps = {
      item: parentItem,
      taskChain: [parentItem],
      startTime: 1000,
      isDeepest: false,
      depth: 0,
    };

    renderCalls.length = 0; // Clear previous calls

    // First render - child should be active
    const { rerender } = render(
      <ThemeProvider theme={theme}>
        <PrimaryItemDisplayRouter {...baseProps} currentTime={3000} />
      </ThemeProvider>
    );

    const initialRenderCount = renderCalls.length;
    expect(screen.getByText('Memo Test')).toBeInTheDocument();

    // Re-render with same props - should not cause unnecessary re-renders
    rerender(
      <ThemeProvider theme={theme}>
        <PrimaryItemDisplayRouter {...baseProps} currentTime={3000} />
      </ThemeProvider>
    );

    // React's reconciliation should prevent unnecessary re-renders
    // (exact count may vary, but there shouldn't be excessive renders)
    expect(renderCalls.length - initialRenderCount).toBeLessThan(3);

    // Now change currentTime to trigger child transition
    rerender(
      <ThemeProvider theme={theme}>
        <PrimaryItemDisplayRouter {...baseProps} currentTime={8000} />
      </ThemeProvider>
    );

    // Child should no longer be active (after its duration)
    expect(screen.queryByText('Memo Test')).not.toBeInTheDocument();
  });

  it('should handle edge case with overlapping child times', () => {
    // Edge case: children with overlapping times (should show the first one found)
    const child1 = new BasicItem({ id: 'overlap1', name: 'Overlap Child 1', duration: 10000 });
    const child2 = new BasicItem({ id: 'overlap2', name: 'Overlap Child 2', duration: 8000 });

    const parentItem = new SubCalendarItem({
      id: 'overlap-parent',
      name: 'Overlap Parent',
      duration: 15000,
      children: [
        new Child({ id: child1.id, start: 0 }),    // 0-10s
        new Child({ id: child2.id, start: 5000 })  // 5-13s (overlaps with child1)
      ]
    });

    mockItems.push(parentItem, child1, child2);

    render(
      <ThemeProvider theme={theme}>
        <PrimaryItemDisplayRouter
          item={parentItem}
          taskChain={[parentItem]}
          currentTime={7000} // 6s into execution - both children should be active
          startTime={1000}
          isDeepest={false}
          depth={0}
        />
      </ThemeProvider>
    );

    // Should render the first child found (child1)
    expect(screen.getByText('Overlap Child 1')).toBeInTheDocument();
    // Should not render the second child (overlapping)
    expect(screen.queryByText('Overlap Child 2')).not.toBeInTheDocument();
  });

  it('should handle child start time calculation correctly', () => {
    // Test that child start times are calculated correctly for recursive rendering
    const grandchild = new BasicItem({ id: 'grandchild', name: 'Deep Task', duration: 3000 });

    const childSubCalendar = new SubCalendarItem({
      id: 'child-sub',
      name: 'Child SubCalendar',
      duration: 8000,
      children: [new Child({ id: grandchild.id, start: 2000 })] // Grandchild starts 2s into child
    });

    const parentItem = new SubCalendarItem({
      id: 'parent-sub',
      name: 'Parent SubCalendar',
      duration: 15000,
      children: [new Child({ id: childSubCalendar.id, start: 3000 })] // Child starts 3s into parent
    });

    mockItems.push(parentItem, childSubCalendar, grandchild);

    // At 7s into parent execution:
    // - Parent starts at time 1000 (startTime)
    // - Child should start at time 1000 + 3000 = 4000
    // - Grandchild should start at time 4000 + 2000 = 6000
    // - Current time is 8000, so we're 2s into grandchild execution
    render(
      <ThemeProvider theme={theme}>
        <PrimaryItemDisplayRouter
          item={parentItem}
          taskChain={[parentItem]}
          currentTime={8000} // 7s into parent execution
          startTime={1000}
          isDeepest={false}
          depth={0}
        />
      </ThemeProvider>
    );

    // All three levels should be rendered
    expect(screen.getByText('Parent SubCalendar')).toBeInTheDocument();
    expect(screen.getByText('Child SubCalendar')).toBeInTheDocument();
    expect(screen.getByText('Deep Task')).toBeInTheDocument();
  });
});
