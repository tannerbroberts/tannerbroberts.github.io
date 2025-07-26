import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SubCalendarStatusBar from './SubCalendarStatusBar';
import { SubCalendarItem } from '../../functions/utils/item/SubCalendarItem';
import { BasicItem } from '../../functions/utils/item/BasicItem';
import { Child } from '../../functions/utils/item/Child';

// Mock data for testing
const mockSubCalendarItem = new SubCalendarItem({
  id: 'test-subcalendar',
  name: 'Test SubCalendar',
  duration: 60000, // 1 minute
  children: [
    new Child({ id: 'child1', start: 0 }),
    new Child({ id: 'child2', start: 30000 })
  ]
});

const mockTaskChain = [
  new BasicItem({
    id: 'child1',
    name: 'First Task',
    duration: 30000
  }),
  new BasicItem({
    id: 'child2',
    name: 'Second Task',
    duration: 30000
  })
];

describe('SubCalendarStatusBar', () => {
  const defaultProps = {
    item: mockSubCalendarItem,
    taskChain: mockTaskChain,
    currentTime: 1000000, // Some time in the future
    startTime: 1000000 - 15000 // Started 15 seconds ago
  };

  it('renders without crashing', () => {
    render(<SubCalendarStatusBar {...defaultProps} />);
    expect(screen.getByText(/\d+\.\d+%/)).toBeInTheDocument();
  });

  it('displays progress percentage', () => {
    render(<SubCalendarStatusBar {...defaultProps} />);
    // Should show some progress percentage
    expect(screen.getByText(/\d+\.\d+%/)).toBeInTheDocument();
  });

  it('displays elapsed and remaining time', () => {
    render(<SubCalendarStatusBar {...defaultProps} />);
    expect(screen.getByText('Elapsed')).toBeInTheDocument();
    expect(screen.getByText('Remaining')).toBeInTheDocument();
  });

  it('shows current active child when available', () => {
    const propsWithActiveChild = {
      ...defaultProps,
      currentTime: 1000000,
      startTime: 1000000 - 5000 // Started 5 seconds ago, first child should be active
    };

    render(<SubCalendarStatusBar {...propsWithActiveChild} />);
    // The first task should be active since we're 5 seconds in
    expect(screen.getByText('First Task')).toBeInTheDocument();
  });

  it('handles edge case with no children', () => {
    const itemWithNoChildren = new SubCalendarItem({
      id: 'empty-subcalendar',
      name: 'Empty SubCalendar',
      duration: 60000,
      children: []
    });

    const propsWithNoChildren = {
      ...defaultProps,
      item: itemWithNoChildren
    };

    render(<SubCalendarStatusBar {...propsWithNoChildren} />);
    expect(screen.getByText(/\d+\.\d+%/)).toBeInTheDocument();
  });

  it('handles completion state correctly', () => {
    const completedProps = {
      ...defaultProps,
      currentTime: 1000000,
      startTime: 1000000 - 65000 // Started 65 seconds ago, should be complete
    };

    render(<SubCalendarStatusBar {...completedProps} />);
    expect(screen.getByText('Complete')).toBeInTheDocument();
  });
});
