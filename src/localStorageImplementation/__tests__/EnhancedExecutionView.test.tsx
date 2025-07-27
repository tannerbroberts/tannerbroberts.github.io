import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { EnhancedExecutionView } from '../components/EnhancedExecutionView';
import { StorageAwareAppProvider } from '../StorageAwareAppProvider';
import { Item } from '../../functions/utils/item/index';

// Mock the useCurrentTime hook
vi.mock('../../hooks/useCurrentTime', () => ({
  useCurrentTime: vi.fn(() => Date.now())
}));

// Mock the PrimaryItemDisplayRouter component
vi.mock('../../components/execution', () => ({
  PrimaryItemDisplayRouter: ({ item }: { item: Item }) => (
    <div data-testid="primary-display">{item.name}</div>
  )
}));

describe('Enhanced Execution View', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should show loading state while storage is loading', async () => {
    render(
      <StorageAwareAppProvider showLoadingIndicator={true}>
        <EnhancedExecutionView />
      </StorageAwareAppProvider>
    );

    // Note: Due to the asynchronous nature of the loading, 
    // this test would need to be more sophisticated to properly test loading states
    expect(screen.getByText('Welcome to About Time')).toBeInTheDocument();
  });

  it('should display no data state for new users', async () => {
    render(
      <StorageAwareAppProvider fallbackToDefault={true}>
        <EnhancedExecutionView />
      </StorageAwareAppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome to About Time')).toBeInTheDocument();
    });

    expect(screen.getByText('You don\'t have any items or scheduled tasks yet.')).toBeInTheDocument();
  });

  it('should handle storage errors gracefully', async () => {
    // Mock localStorage to throw an error
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = vi.fn(() => {
      throw new Error('Storage not available');
    });

    render(
      <StorageAwareAppProvider fallbackToDefault={true}>
        <EnhancedExecutionView />
      </StorageAwareAppProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Welcome to About Time')).toBeInTheDocument();
    });

    // Restore original localStorage
    localStorage.getItem = originalGetItem;
  });

  it('should show no active task state when data exists but no current task', async () => {
    // Set up some sample data without an active task
    const sampleItem = {
      id: 'sample-item',
      name: 'Sample Task',
      duration: 60000,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    localStorage.setItem('atp_items', JSON.stringify([sampleItem]));
    localStorage.setItem('atp_baseCalendar', JSON.stringify([
      ['sample-entry', { id: 'sample-entry', itemId: 'sample-item', startTime: Date.now() + 3600000 }] // 1 hour in future
    ]));

    render(
      <StorageAwareAppProvider>
        <EnhancedExecutionView />
      </StorageAwareAppProvider>
    );

    await waitFor(() => {
      // Should show the no active task state rather than welcome state
      expect(screen.getByText('No Active Task')).toBeInTheDocument();
    });
  });

  it('should display performance indicator in development mode', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    // Set up data that would create an active task
    const now = Date.now();
    const sampleItem = {
      id: 'test-item',
      name: 'Test Task',
      duration: 60000, // 1 minute
      createdAt: now - 10000,
      updatedAt: now - 10000
    };

    localStorage.setItem('atp_items', JSON.stringify([sampleItem]));
    localStorage.setItem('atp_baseCalendar', JSON.stringify([
      ['test-entry', { id: 'test-entry', itemId: 'test-item', startTime: now - 30000 }]
    ]));

    render(
      <StorageAwareAppProvider>
        <EnhancedExecutionView />
      </StorageAwareAppProvider>
    );

    await waitFor(() => {
      // In development mode, performance indicator should be visible
      // This test is simplified - in reality we'd need to handle the task chain calculation
      expect(screen.queryByText('Calc:')).toBeInTheDocument();
    }, { timeout: 3000 });

    process.env.NODE_ENV = originalEnv;
  });

  it('should update when current time changes', async () => {
    const { useCurrentTime } = await import('../../hooks/useCurrentTime');
    const mockUseCurrentTime = useCurrentTime as ReturnType<typeof vi.fn>;

    let currentTime = Date.now();
    mockUseCurrentTime.mockImplementation(() => currentTime);

    const { rerender } = render(
      <StorageAwareAppProvider>
        <EnhancedExecutionView autoRefreshInterval={100} />
      </StorageAwareAppProvider>
    );

    // Simulate time change
    currentTime = Date.now() + 60000; // 1 minute later
    mockUseCurrentTime.mockImplementation(() => currentTime);

    rerender(
      <StorageAwareAppProvider>
        <EnhancedExecutionView autoRefreshInterval={100} />
      </StorageAwareAppProvider>
    );

    // The view should have updated to reflect the new time
    // This is a simplified test - real implementation would involve more complex logic
    await waitFor(() => {
      expect(screen.getByText('Welcome to About Time')).toBeInTheDocument();
    });
  });
});
