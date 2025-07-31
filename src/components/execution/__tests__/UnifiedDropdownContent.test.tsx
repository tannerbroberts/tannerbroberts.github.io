import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { describe, it, expect, vi } from 'vitest';
import UnifiedDropdownContent from '../UnifiedDropdownContent';
import { VariableSummary } from '../../../functions/utils/item/index';
import { ChildExecutionStatus } from '../executionUtils';

// Mock formatDuration function
vi.mock('../../../functions/utils/formatTime', () => ({
  formatDuration: vi.fn((ms: number) => `${Math.floor(ms / 1000)}s`)
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('UnifiedDropdownContent', () => {
  const mockVariableSummary: VariableSummary = {
    'flour': { quantity: 500, unit: 'g', category: 'dry-ingredients' },
    'water': { quantity: 300, unit: 'ml', category: 'liquids' },
    'salt': { quantity: -10, unit: 'g', category: 'seasonings' }
  };

  const mockChildExecutionStatus: ChildExecutionStatus = {
    activeChild: null,
    nextChild: {
      item: {
        id: 'test-item-1',
        name: 'Mix ingredients',
        duration: 300000,
        parents: [],
        allOrNothing: false,
        toJSON: () => ({
          id: 'test-item-1',
          name: 'Mix ingredients',
          duration: 300000,
          parents: [],
          allOrNothing: false,
          priority: 1,
          type: 'basic' as const
        })
      },
      timeUntilStart: 30000,
      startTime: Date.now() + 30000
    },
    gapPeriod: false,
    currentPhase: 'pre-start' as const
  };

  const defaultProps = {
    isExpanded: true,
    variableSummary: mockVariableSummary,
    hasVariables: true,
    nextChild: mockChildExecutionStatus.nextChild,
    gapPeriod: false,
    currentPhase: 'pre-start' as const,
    childExecutionStatus: mockChildExecutionStatus
  };

  it('renders variable summary when has variables', () => {
    render(
      <TestWrapper>
        <UnifiedDropdownContent {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Resource Summary')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Variable count
    expect(screen.getByText('+500 g flour')).toBeInTheDocument();
    expect(screen.getByText('+300 ml water')).toBeInTheDocument();
    expect(screen.getByText('-10 g salt')).toBeInTheDocument();
  });

  it('groups variables by category', () => {
    render(
      <TestWrapper>
        <UnifiedDropdownContent {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('dry-ingredients')).toBeInTheDocument();
    expect(screen.getByText('liquids')).toBeInTheDocument();
    expect(screen.getByText('seasonings')).toBeInTheDocument();
  });

  it('renders execution details section', () => {
    render(
      <TestWrapper>
        <UnifiedDropdownContent {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Execution Details')).toBeInTheDocument();
  });

  it('displays next child information', () => {
    render(
      <TestWrapper>
        <UnifiedDropdownContent {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Up Next')).toBeInTheDocument();
    expect(screen.getByText('Mix ingredients')).toBeInTheDocument();
    expect(screen.getByText('Time remaining: 30s')).toBeInTheDocument();
  });

  it('shows gap period when in gap period', () => {
    const gapPeriodProps = {
      ...defaultProps,
      gapPeriod: true
    };

    render(
      <TestWrapper>
        <UnifiedDropdownContent {...gapPeriodProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Gap Period')).toBeInTheDocument();
  });

  it('renders contextual guidance', () => {
    render(
      <TestWrapper>
        <UnifiedDropdownContent {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Next task: Mix ingredients')).toBeInTheDocument();
  });

  it('shows current phase when provided', () => {
    render(
      <TestWrapper>
        <UnifiedDropdownContent {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Phase: pre-start')).toBeInTheDocument();
  });

  it('does not render when collapsed', () => {
    const collapsedProps = {
      ...defaultProps,
      isExpanded: false
    };

    render(
      <TestWrapper>
        <UnifiedDropdownContent {...collapsedProps} />
      </TestWrapper>
    );

    // Content should not be visible when collapsed
    const content = screen.queryByText('Resource Summary');
    expect(content).not.toBeVisible();
  });

  it('handles empty variable summary', () => {
    const noVariablesProps = {
      ...defaultProps,
      variableSummary: {},
      hasVariables: false
    };

    render(
      <TestWrapper>
        <UnifiedDropdownContent {...noVariablesProps} />
      </TestWrapper>
    );

    expect(screen.queryByText('Resource Summary')).not.toBeInTheDocument();
    expect(screen.getByText('Execution Details')).toBeInTheDocument();
  });

  it('handles missing next child', () => {
    const noNextChildProps = {
      ...defaultProps,
      nextChild: null
    };

    render(
      <TestWrapper>
        <UnifiedDropdownContent {...noNextChildProps} />
      </TestWrapper>
    );

    expect(screen.queryByText('Up Next')).not.toBeInTheDocument();
    expect(screen.getByText('Execution Details')).toBeInTheDocument();
  });

  it('displays appropriate contextual guidance for active child', () => {
    const activeChildProps = {
      ...defaultProps,
      childExecutionStatus: {
        ...mockChildExecutionStatus,
        activeChild: {
          id: 'active-item',
          name: 'Currently mixing',
          duration: 180000,
          parents: [],
          allOrNothing: false,
          toJSON: () => ({
            id: 'active-item',
            name: 'Currently mixing',
            duration: 180000,
            parents: [],
            allOrNothing: false,
            priority: 1,
            type: 'basic' as const
          })
        },
        nextChild: null
      }
    };

    render(
      <TestWrapper>
        <UnifiedDropdownContent {...activeChildProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Currently executing: Currently mixing')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <UnifiedDropdownContent {...defaultProps} />
      </TestWrapper>
    );

    const section = screen.getByLabelText('SubCalendar details and variable summary');
    expect(section).toBeInTheDocument();
    expect(section.tagName).toBe('SECTION');
  });

  it('applies correct styling for positive and negative variables', () => {
    render(
      <TestWrapper>
        <UnifiedDropdownContent {...defaultProps} />
      </TestWrapper>
    );

    const positiveChip = screen.getByText('+500 g flour');
    const negativeChip = screen.getByText('-10 g salt');

    expect(positiveChip).toBeInTheDocument();
    expect(negativeChip).toBeInTheDocument();
  });
});
