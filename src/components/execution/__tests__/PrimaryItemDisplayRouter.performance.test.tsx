import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import PrimaryItemDisplayRouter from '../PrimaryItemDisplayRouter';
import { BasicItem, SubCalendarItem, Item } from '../../../functions/utils/item/index';
import { Child } from '../../../functions/utils/item/Child';

// Performance and edge case test to identify potential optimization opportunities

const theme = createTheme();

describe('PrimaryItemDisplayRouter - Performance Edge Cases', () => {
  let mockItems: Item[] = [];
  let renderCount = 0;

  beforeEach(() => {
    mockItems = [];
    renderCount = 0;

    vi.clearAllMocks();

    vi.mocked(vi.fn()).mockImplementation(() => ({ items: mockItems }));
  });

  // Mock to track render frequency
  vi.mock('../../../reducerContexts/App', () => ({
    useAppState: () => ({ items: mockItems }),
  }));

  vi.mock('../PrimaryBasicItemDisplay', () => ({
    default: ({ item }: { item: Item }) => {
      renderCount++;
      return <div data-testid={`basic-${item.id}`}>{item.name}</div>;
    },
  }));

  vi.mock('../PrimarySubCalendarItemDisplay', () => ({
    default: ({ item, children }: { item: Item; children?: React.ReactNode }) => {
      renderCount++;
      return (
        <div data-testid={`subcalendar-${item.id}`}>
          {item.name}
          {children}
        </div>
      );
    },
  }));

  it('should handle items array reference changes gracefully', () => {
    const child1 = new BasicItem({ id: 'stable-child', name: 'Stable Child', duration: 5000 });
    const parent = new SubCalendarItem({
      id: 'stable-parent',
      name: 'Stable Parent',
      duration: 10000,
      children: [new Child({ id: child1.id, start: 0 })]
    });

    // Test with changing items array references but same content
    const items1 = [parent, child1];
    const items2 = [...items1]; // Different reference, same content
    const items3 = [parent, child1]; // Different reference again

    const baseProps = {
      item: parent,
      taskChain: [parent],
      currentTime: 3000,
      startTime: 1000,
      isDeepest: false,
      depth: 0,
    };

    // Set initial items
    mockItems.splice(0, mockItems.length, ...items1);

    const { rerender } = render(
      <ThemeProvider theme={theme}>
        <PrimaryItemDisplayRouter {...baseProps} />
      </ThemeProvider>
    );

    expect(screen.getByText('Stable Child')).toBeInTheDocument();
    const initialRenderCount = renderCount;

    // Change items array reference but keep same content
    mockItems.splice(0, mockItems.length, ...items2);
    rerender(
      <ThemeProvider theme={theme}>
        <PrimaryItemDisplayRouter {...baseProps} />
      </ThemeProvider>
    );

    // Still should show same child
    expect(screen.getByText('Stable Child')).toBeInTheDocument();

    // Change reference again
    mockItems.splice(0, mockItems.length, ...items3);
    rerender(
      <ThemeProvider theme={theme}>
        <PrimaryItemDisplayRouter {...baseProps} />
      </ThemeProvider>
    );

    expect(screen.getByText('Stable Child')).toBeInTheDocument();

    // Render count should not increase excessively due to array reference changes
    // (Some increase is expected due to React's reconciliation, but not excessive)
    expect(renderCount - initialRenderCount).toBeLessThan(10);
  });

  it('should handle missing child items gracefully', () => {
    // Create parent with child reference but missing child item
    const parent = new SubCalendarItem({
      id: 'missing-child-parent',
      name: 'Parent with Missing Child',
      duration: 10000,
      children: [new Child({ id: 'nonexistent-child', start: 0 })]
    });

    mockItems.push(parent); // Note: not adding the child item

    expect(() => {
      render(
        <ThemeProvider theme={theme}>
          <PrimaryItemDisplayRouter
            item={parent}
            taskChain={[parent]}
            currentTime={3000}
            startTime={1000}
            isDeepest={false}
            depth={0}
          />
        </ThemeProvider>
      );
    }).not.toThrow();

    // Should render parent but no child
    expect(screen.getByText('Parent with Missing Child')).toBeInTheDocument();
    expect(screen.queryByTestId('basic-nonexistent-child')).not.toBeInTheDocument();
  });

  it('should handle corrupted child references', () => {
    const child1 = new BasicItem({ id: 'valid-child', name: 'Valid Child', duration: 5000 });

    // Create parent with mix of valid and invalid child references
    const parent = new SubCalendarItem({
      id: 'corrupted-parent',
      name: 'Parent with Corrupted Children',
      duration: 10000,
      children: [
        new Child({ id: child1.id, start: 0 }),           // Valid
        new Child({ id: '', start: 2000 }),               // Invalid ID
        new Child({ id: 'missing-child', start: 4000 })   // Missing item
      ]
    });

    mockItems.push(parent, child1);

    render(
      <ThemeProvider theme={theme}>
        <PrimaryItemDisplayRouter
          item={parent}
          taskChain={[parent]}
          currentTime={3000} // Should activate first child
          startTime={1000}
          isDeepest={false}
          depth={0}
        />
      </ThemeProvider>
    );

    // Should render parent and find the valid child
    expect(screen.getByText('Parent with Corrupted Children')).toBeInTheDocument();
    expect(screen.getByText('Valid Child')).toBeInTheDocument();
  });

  it('should handle rapid time changes efficiently', () => {
    const child1 = new BasicItem({ id: 'rapid1', name: 'Rapid 1', duration: 1000 });
    const child2 = new BasicItem({ id: 'rapid2', name: 'Rapid 2', duration: 1000 });
    const child3 = new BasicItem({ id: 'rapid3', name: 'Rapid 3', duration: 1000 });

    const parent = new SubCalendarItem({
      id: 'rapid-parent',
      name: 'Rapid Parent',
      duration: 3000,
      children: [
        new Child({ id: child1.id, start: 0 }),
        new Child({ id: child2.id, start: 1000 }),
        new Child({ id: child3.id, start: 2000 })
      ]
    });

    mockItems.push(parent, child1, child2, child3);

    const baseProps = {
      item: parent,
      taskChain: [parent],
      startTime: 1000,
      isDeepest: false,
      depth: 0,
    };

    renderCount = 0;

    // Simulate rapid time progression
    const timeSteps = [1500, 1800, 2100, 2300, 2800, 3200];
    const expectedChildren = ['Rapid 1', 'Rapid 1', 'Rapid 2', 'Rapid 2', 'Rapid 3', null];

    const { rerender } = render(
      <ThemeProvider theme={theme}>
        <PrimaryItemDisplayRouter {...baseProps} currentTime={1500} />
      </ThemeProvider>
    );

    timeSteps.forEach((time, index) => {
      rerender(
        <ThemeProvider theme={theme}>
          <PrimaryItemDisplayRouter {...baseProps} currentTime={time} />
        </ThemeProvider>
      );

      const expected = expectedChildren[index];
      if (expected) {
        expect(screen.getByText(expected)).toBeInTheDocument();
      } else {
        // Should show parent but no child after execution
        expect(screen.getByText('Rapid Parent')).toBeInTheDocument();
        expect(screen.queryByText('Rapid 1')).not.toBeInTheDocument();
        expect(screen.queryByText('Rapid 2')).not.toBeInTheDocument();
        expect(screen.queryByText('Rapid 3')).not.toBeInTheDocument();
      }
    });

    // Should handle rapid changes without excessive renders
    expect(renderCount).toBeLessThan(50); // Reasonable threshold
  });

  it('should verify executionContext prop handling', () => {
    const child1 = new BasicItem({ id: 'context-child', name: 'Context Child', duration: 5000 });
    const parent = new SubCalendarItem({
      id: 'context-parent',
      name: 'Context Parent',
      duration: 10000,
      children: [new Child({ id: child1.id, start: 0 })]
    });

    mockItems.push(parent, child1);

    const mockExecutionContext = {
      currentItem: parent,
      currentInstance: null,
      taskChain: [{ item: parent, instance: null }],
      baseStartTime: 1000
    };

    render(
      <ThemeProvider theme={theme}>
        <PrimaryItemDisplayRouter
          item={parent}
          taskChain={[parent]}
          currentTime={3000}
          startTime={1000}
          isDeepest={false}
          depth={0}
          executionContext={mockExecutionContext}
        />
      </ThemeProvider>
    );

    // Should render normally with execution context
    expect(screen.getByText('Context Parent')).toBeInTheDocument();
    expect(screen.getByText('Context Child')).toBeInTheDocument();
  });
});
