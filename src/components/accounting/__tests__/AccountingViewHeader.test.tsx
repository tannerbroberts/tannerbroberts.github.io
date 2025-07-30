import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import AccountingViewHeader from '../AccountingViewHeader';

const theme = createTheme();

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

describe('AccountingViewHeader', () => {
  const defaultProps = {
    isExpanded: false,
    onToggle: vi.fn(),
    totalIncompleteCount: 10,
    overdueCount: 3,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with correct title', () => {
    render(
      <TestWrapper>
        <AccountingViewHeader {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('Accounting View')).toBeInTheDocument();
  });

  it('shows expand icon when collapsed', () => {
    render(
      <TestWrapper>
        <AccountingViewHeader {...defaultProps} isExpanded={false} />
      </TestWrapper>
    );

    const button = screen.getByRole('button', { name: /expand accounting view/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('shows collapse icon when expanded', () => {
    render(
      <TestWrapper>
        <AccountingViewHeader {...defaultProps} isExpanded={true} />
      </TestWrapper>
    );

    const button = screen.getByRole('button', { name: /collapse accounting view/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });

  it('calls onToggle when header is clicked', () => {
    const onToggle = vi.fn();
    render(
      <TestWrapper>
        <AccountingViewHeader {...defaultProps} onToggle={onToggle} />
      </TestWrapper>
    );

    const button = screen.getByRole('button', { name: /expand accounting view/i });
    fireEvent.click(button);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('shows correct badge counts', () => {
    render(
      <TestWrapper>
        <AccountingViewHeader {...defaultProps} />
      </TestWrapper>
    );

    expect(screen.getByText('10 Incomplete')).toBeInTheDocument();
    expect(screen.getByText('3 Overdue')).toBeInTheDocument();
  });

  it('hides overdue badge when count is zero', () => {
    render(
      <TestWrapper>
        <AccountingViewHeader {...defaultProps} overdueCount={0} />
      </TestWrapper>
    );

    expect(screen.getByText('10 Incomplete')).toBeInTheDocument();
    expect(screen.queryByText('0 Overdue')).not.toBeInTheDocument();
  });

  it('shows filtered count when provided and different from total', () => {
    render(
      <TestWrapper>
        <AccountingViewHeader {...defaultProps} filteredCount={5} />
      </TestWrapper>
    );

    expect(screen.getByText('5 Filtered')).toBeInTheDocument();
  });

  it('hides filtered count when same as total', () => {
    render(
      <TestWrapper>
        <AccountingViewHeader {...defaultProps} filteredCount={10} />
      </TestWrapper>
    );

    expect(screen.queryByText('10 Filtered')).not.toBeInTheDocument();
  });

  it('shows description when collapsed', () => {
    render(
      <TestWrapper>
        <AccountingViewHeader {...defaultProps} isExpanded={false} />
      </TestWrapper>
    );

    expect(screen.getByText(/review and complete past scheduled items/i)).toBeInTheDocument();
  });

  it('hides description when expanded', () => {
    render(
      <TestWrapper>
        <AccountingViewHeader {...defaultProps} isExpanded={true} />
      </TestWrapper>
    );

    expect(screen.queryByText(/review and complete past scheduled items/i)).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <AccountingViewHeader {...defaultProps} />
      </TestWrapper>
    );

    const button = screen.getByRole('button', { name: /expand accounting view/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toBeInTheDocument();

    // Button should be focusable
    expect(button).toHaveAttribute('tabindex', '0');
  });
});
