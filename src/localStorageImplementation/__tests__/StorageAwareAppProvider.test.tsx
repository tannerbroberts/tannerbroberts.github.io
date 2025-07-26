import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { StorageAwareAppProvider } from '../StorageAwareAppProvider';
import { useAppState, useAppDispatch } from '../contexts';
import { useStorageStatus } from '../hooks/useStorageStatus';
import * as storageService from '../localStorageService';
import * as dataValidation from '../dataValidation';
import { Item } from '../../functions/utils/item/index';
import type { ItemJSON } from '../../functions/utils/item/ItemJSON';
import React from 'react';

// Mock the storage service
vi.mock('../localStorageService');
vi.mock('../dataValidation');

const mockStorageService = vi.mocked(storageService);
const mockDataValidation = vi.mocked(dataValidation);

// Mock Item class for testing
class MockItem extends Item {
  constructor(data: { id: string; name: string; duration: number; parents?: any[]; allOrNothing?: boolean }) {
    super(data);
  }

  toJSON(): ItemJSON {
    return {
      id: this.id,
      name: this.name,
      duration: this.duration,
      parents: this.parents.map(p => ({ id: p.id, relationshipId: p.relationshipId })),
      allOrNothing: this.allOrNothing,
      type: 'BasicItem'
    };
  }
}

// Mock the storage service
vi.mock('../localStorageService');
vi.mock('../dataValidation');

const mockStorageService = vi.mocked(storageService);
const mockDataValidation = vi.mocked(dataValidation);

// Test component that uses the contexts
function TestComponent(): React.JSX.Element {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const storageStatus = useStorageStatus();

  return (
    <div>
      <div data-testid="items-count">{state.items.length}</div>
      <div data-testid="calendar-size">{state.baseCalendar.size}</div>
      <div data-testid="loading">{storageStatus.isLoading.toString()}</div>
      <div data-testid="has-loaded">{storageStatus.hasLoaded.toString()}</div>
      <div data-testid="data-source">{storageStatus.dataSource}</div>
      <div data-testid="error">{storageStatus.error || 'none'}</div>
      <button
        data-testid="test-dispatch"
        onClick={() => dispatch({ type: 'SET_SIDE_DRAWER_OPEN', payload: { sideDrawerOpen: true } })}
      >
        Test Dispatch
      </button>
    </div>
  );
}

describe('StorageAwareAppProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock setup
    mockStorageService.loadAllDataFromStorage.mockReturnValue({
      success: true,
      data: {
        items: [],
        baseCalendar: new Map()
      }
    });

    mockDataValidation.validateAndMigrateData.mockReturnValue({
      isValid: true,
      errors: [],
      warnings: [],
      repairedData: {
        items: [],
        baseCalendar: new Map()
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load data from storage on mount', async () => {
    const mockItems = [
      new MockItem({ id: '1', name: 'Test Item', duration: 1000, parents: [], allOrNothing: false })
    ];
    const mockCalendar = new Map([
      ['entry1', { id: 'entry1', itemId: '1', startTime: Date.now() }]
    ]);

    mockStorageService.loadAllDataFromStorage.mockReturnValue({
      success: true,
      data: { items: mockItems, baseCalendar: mockCalendar }
    });

    mockDataValidation.validateAndMigrateData.mockReturnValue({
      isValid: true,
      errors: [],
      warnings: [],
      repairedData: { items: mockItems, baseCalendar: mockCalendar }
    });

    render(
      <StorageAwareAppProvider>
        <TestComponent />
      </StorageAwareAppProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('has-loaded')).toHaveTextContent('true');
    expect(screen.getByTestId('data-source')).toHaveTextContent('localStorage');
    expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });

  it('should show loading indicator while loading', () => {
    render(
      <StorageAwareAppProvider showLoadingIndicator={true}>
        <TestComponent />
      </StorageAwareAppProvider>
    );

    expect(screen.getByText('Loading your data...')).toBeInTheDocument();
    expect(screen.getByText('Restoring items and schedule from storage')).toBeInTheDocument();
  });

  it('should handle storage errors gracefully', async () => {
    mockStorageService.loadAllDataFromStorage.mockReturnValue({
      success: false,
      error: 'Storage quota exceeded'
    });

    render(
      <StorageAwareAppProvider fallbackToDefault={true}>
        <TestComponent />
      </StorageAwareAppProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('has-loaded')).toHaveTextContent('true');
    expect(screen.getByTestId('data-source')).toHaveTextContent('error-fallback');
    expect(screen.getByTestId('items-count')).toHaveTextContent('0'); // Should use default empty state
    expect(screen.getByTestId('error')).toHaveTextContent('Failed to load data: Storage quota exceeded');
  });

  it('should fall back to default state when no storage data', async () => {
    mockStorageService.loadAllDataFromStorage.mockReturnValue({
      success: true,
      data: { items: [], baseCalendar: new Map() }
    });

    render(
      <StorageAwareAppProvider>
        <TestComponent />
      </StorageAwareAppProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('has-loaded')).toHaveTextContent('true');
    expect(screen.getByTestId('data-source')).toHaveTextContent('localStorage');
    expect(screen.getByTestId('items-count')).toHaveTextContent('0');
    expect(screen.getByTestId('calendar-size')).toHaveTextContent('0');
  });

  it('should validate and repair corrupted data', async () => {
    const corruptedItems = [
      new MockItem({ id: '1', name: 'Test Item', duration: 1000, parents: [], allOrNothing: false })
    ];
    const repairedItems = [
      new MockItem({ id: '1', name: 'Test Item', duration: 1000, parents: [], allOrNothing: false })
    ];

    mockStorageService.loadAllDataFromStorage.mockReturnValue({
      success: true,
      data: { items: corruptedItems, baseCalendar: new Map() }
    });

    mockDataValidation.validateAndMigrateData.mockReturnValue({
      isValid: false,
      errors: ['Invalid parent reference'],
      warnings: ['Removed invalid parent reference: parent1'],
      repairedData: { items: repairedItems, baseCalendar: new Map() }
    });

    render(
      <StorageAwareAppProvider>
        <TestComponent />
      </StorageAwareAppProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('has-loaded')).toHaveTextContent('true');
    expect(screen.getByTestId('data-source')).toHaveTextContent('localStorage');
    expect(screen.getByTestId('items-count')).toHaveTextContent('1');
    expect(screen.getByTestId('error')).toHaveTextContent('Data loaded with warnings: Removed invalid parent reference: parent1');
  });

  it('should maintain context API compatibility', async () => {
    render(
      <StorageAwareAppProvider>
        <TestComponent />
      </StorageAwareAppProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    // Test that dispatch works
    const dispatchButton = screen.getByTestId('test-dispatch');
    expect(dispatchButton).toBeInTheDocument();

    // The button should be clickable without throwing errors
    dispatchButton.click();
  });

  it('should not show loading indicator when disabled', async () => {
    render(
      <StorageAwareAppProvider showLoadingIndicator={false}>
        <TestComponent />
      </StorageAwareAppProvider>
    );

    // Should not show loading screen
    expect(screen.queryByText('Loading your data...')).not.toBeInTheDocument();

    // Should show the test component immediately
    expect(screen.getByTestId('items-count')).toBeInTheDocument();
  });

  it('should throw error when not fallback mode and storage fails', async () => {
    mockStorageService.loadAllDataFromStorage.mockReturnValue({
      success: false,
      error: 'Storage error'
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

    render(
      <StorageAwareAppProvider fallbackToDefault={false}>
        <TestComponent />
      </StorageAwareAppProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('has-loaded')).toHaveTextContent('false');
    expect(screen.getByTestId('error')).toHaveTextContent('Failed to load data: Storage error');

    consoleSpy.mockRestore();
  });

  it('should handle validation failure when repair is not possible', async () => {
    mockStorageService.loadAllDataFromStorage.mockReturnValue({
      success: true,
      data: { items: [], baseCalendar: new Map() }
    });

    mockDataValidation.validateAndMigrateData.mockReturnValue({
      isValid: false,
      errors: ['Critical validation error'],
      warnings: [],
      // No repairedData provided - repair failed
    });

    render(
      <StorageAwareAppProvider fallbackToDefault={true}>
        <TestComponent />
      </StorageAwareAppProvider>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(screen.getByTestId('has-loaded')).toHaveTextContent('true');
    expect(screen.getByTestId('data-source')).toHaveTextContent('error-fallback');
    expect(screen.getByTestId('error')).toHaveTextContent('Data validation failed: Critical validation error. Using default settings.');
  });
});

describe('useStorageStatus', () => {
  it('should throw error when used outside provider', () => {
    const TestComponent = (): React.JSX.Element => {
      useStorageStatus();
      return <div>Test</div>;
    };

    expect(() => render(<TestComponent />)).toThrow(
      'useStorageStatus must be used within StorageAwareAppProvider'
    );
  });
});

describe('useAppState', () => {
  it('should throw error when used outside provider', () => {
    const TestComponent = (): React.JSX.Element => {
      useAppState();
      return <div>Test</div>;
    };

    expect(() => render(<TestComponent />)).toThrow(
      'useAppState must be used within StorageAwareAppProvider'
    );
  });
});

describe('useAppDispatch', () => {
  it('should throw error when used outside provider', () => {
    const TestComponent = (): React.JSX.Element => {
      useAppDispatch();
      return <div>Test</div>;
    };

    expect(() => render(<TestComponent />)).toThrow(
      'useAppDispatch must be used within StorageAwareAppProvider'
    );
  });
});
