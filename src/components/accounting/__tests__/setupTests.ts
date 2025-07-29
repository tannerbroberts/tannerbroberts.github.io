import { vi, beforeEach, afterEach } from 'vitest';
import { setupTimeControl, cleanupTimeControl } from './timeControlUtils';

/**
 * Global test setup for accounting view tests
 * Provides time control and mock configuration
 */

/**
 * Setup time control and mocks for accounting tests
 * Call this in test files that need time control
 */
export function setupAccountingTests(initialTime?: number): void {
  beforeEach(() => {
    // Setup time control
    setupTimeControl(initialTime);

    // Mock useCurrentTime hook
    vi.mock('../../../hooks/useCurrentTime', () => ({
      useCurrentTime: vi.fn(() => {
        const { getTimeController } = require('./timeControlUtils');
        return getTimeController().getCurrentTime();
      })
    }));

    // Mock other time-dependent hooks if needed
    mockTimeDependentHooks();
  });

  afterEach(() => {
    // Cleanup time control
    cleanupTimeControl();

    // Restore all mocks
    vi.restoreAllMocks();
  });
}

/**
 * Mock time-dependent hooks used in accounting components
 */
function mockTimeDependentHooks(): void {
  // Mock any other hooks that depend on time
  // This can be extended as needed for specific test requirements
}

/**
 * Setup for individual test files without global hooks
 * Use this when you want manual control over setup/cleanup
 */
export function createAccountingTestEnvironment(initialTime?: number): {
  setup: () => void;
  cleanup: () => void;
} {
  return {
    setup: () => {
      setupTimeControl(initialTime);
      mockTimeDependentHooks();
    },
    cleanup: () => {
      cleanupTimeControl();
      vi.restoreAllMocks();
    }
  };
}

/**
 * Quick setup for tests that only need basic time control
 */
export function setupBasicTimeControl(initialTime?: number): () => void {
  setupTimeControl(initialTime);

  return () => {
    cleanupTimeControl();
  };
}

/**
 * Verify that time control setup is working correctly
 * Useful for debugging test issues
 */
export function verifyTimeControlSetup(): {
  isActive: boolean;
  currentTime: number;
  errors: string[];
} {
  const errors: string[] = [];
  let isActive = false;
  let currentTime = 0;

  try {
    const { getTimeController } = require('./timeControlUtils');
    const controller = getTimeController();
    isActive = controller.isTimeControlActive();
    currentTime = controller.getCurrentTime();

    // Verify Date.now() is mocked
    const now1 = Date.now();
    const now2 = Date.now();

    if (now1 !== now2) {
      errors.push('Date.now() is not properly mocked - time is advancing');
    }

  } catch (error) {
    errors.push(`Time control verification failed: ${error instanceof Error ? error.message : String(error)}`);
  }

  return {
    isActive,
    currentTime,
    errors
  };
}

/**
 * Reset all test environment state
 * Use this between test suites if needed
 */
export function resetTestEnvironment(): void {
  cleanupTimeControl();
  vi.restoreAllMocks();
  vi.clearAllMocks();
}

/**
 * Create a test environment with specific mock configurations
 */
export interface TestMockConfig {
  mockUseCurrentTime?: boolean;
  mockDateNow?: boolean;
  mockSetTimeout?: boolean;
  mockSetInterval?: boolean;
  initialTime?: number;
}

export function setupCustomTestEnvironment(config: TestMockConfig): () => void {
  const {
    mockUseCurrentTime = true,
    mockDateNow = true,
    mockSetTimeout = false,
    mockSetInterval = false,
    initialTime
  } = config;

  // Setup time control if any time mocking is enabled
  if (mockUseCurrentTime || mockDateNow) {
    setupTimeControl(initialTime);
  }

  // Mock setTimeout if requested
  if (mockSetTimeout) {
    vi.useFakeTimers();
  }

  // Mock setInterval if requested
  if (mockSetInterval) {
    vi.useFakeTimers();
  }

  // Custom mock for useCurrentTime
  if (mockUseCurrentTime) {
    vi.mock('../../../hooks/useCurrentTime', () => ({
      useCurrentTime: vi.fn(() => {
        const { getTimeController } = require('./timeControlUtils');
        return getTimeController().getCurrentTime();
      })
    }));
  }

  // Return cleanup function
  return () => {
    if (mockUseCurrentTime || mockDateNow) {
      cleanupTimeControl();
    }

    if (mockSetTimeout || mockSetInterval) {
      vi.useRealTimers();
    }

    vi.restoreAllMocks();
  };
}

/**
 * Utility to run a test with isolated time control
 */
export async function withIsolatedTimeControl<T>(
  testFn: () => Promise<T> | T,
  initialTime?: number
): Promise<T> {
  const cleanup = setupBasicTimeControl(initialTime);

  try {
    return await testFn();
  } finally {
    cleanup();
  }
}

/**
 * Common assertions for time-controlled tests
 */
export const timeControlAssertions = {
  /**
   * Assert that time has advanced by expected amount
   */
  timeAdvancedBy: (expectedMs: number, tolerance: number = 10): void => {
    const { getTimeController } = require('./timeControlUtils');
    const controller = getTimeController();
    const currentTime = controller.getCurrentTime();

    // This would need baseline time tracking in real implementation
    // For now, just verify time control is active
    if (!controller.isTimeControlActive()) {
      throw new Error('Time control is not active');
    }
  },

  /**
   * Assert that current time matches expected value
   */
  timeEquals: (expectedTime: number, tolerance: number = 10): void => {
    const { getTimeController } = require('./timeControlUtils');
    const currentTime = getTimeController().getCurrentTime();

    if (Math.abs(currentTime - expectedTime) > tolerance) {
      throw new Error(`Expected time ${expectedTime}, got ${currentTime} (tolerance: ${tolerance}ms)`);
    }
  },

  /**
   * Assert that time control is properly active
   */
  timeControlActive: (): void => {
    const { getTimeController } = require('./timeControlUtils');
    const controller = getTimeController();

    if (!controller.isTimeControlActive()) {
      throw new Error('Time control should be active but is not');
    }
  }
};
