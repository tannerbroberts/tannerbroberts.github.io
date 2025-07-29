import { vi } from 'vitest';

/**
 * Centralized time management for accounting tests
 * Provides controlled time progression and hook mocking
 */
export class MockTimeController {
  private currentTime: number;
  private isActive: boolean = false;

  constructor(initialTime: number = Date.now()) {
    this.currentTime = initialTime;
  }

  /**
   * Set the current time to a specific timestamp
   */
  setTime(timestamp: number): void {
    this.currentTime = timestamp;
  }

  /**
   * Advance time by the specified number of milliseconds
   */
  advanceTime(milliseconds: number): void {
    this.currentTime += milliseconds;
  }

  /**
   * Get the current mocked time
   */
  getCurrentTime(): number {
    return this.currentTime;
  }

  /**
   * Reset time to the initial value
   */
  resetTime(newTime: number = Date.now()): void {
    this.currentTime = newTime;
  }

  /**
   * Activate time mocking - should be called in test setup
   */
  activate(): void {
    if (this.isActive) {
      return;
    }

    // Mock Date.now()
    vi.spyOn(Date, 'now').mockImplementation(() => this.currentTime);

    // Mock useCurrentTime hook
    this.mockUseCurrentTime();

    this.isActive = true;
  }

  /**
   * Deactivate time mocking - should be called in test cleanup
   */
  deactivate(): void {
    if (!this.isActive) {
      return;
    }

    // Restore Date.now()
    vi.restoreAllMocks();

    this.isActive = false;
  }

  /**
   * Check if time controller is currently active
   */
  isTimeControlActive(): boolean {
    return this.isActive;
  }

  /**
   * Mock the useCurrentTime hook to use controlled time
   */
  private mockUseCurrentTime(): void {
    // We'll mock the hook module when we use this controller
    // The actual mocking will be done in the test setup
  }
}

/**
 * Global time controller instance for tests
 */
let globalTimeController: MockTimeController | null = null;

/**
 * Get or create the global time controller
 */
export function getTimeController(initialTime?: number): MockTimeController {
  globalTimeController ??= new MockTimeController(initialTime);
  return globalTimeController;
}

/**
 * Reset the global time controller
 */
export function resetTimeController(): void {
  if (globalTimeController) {
    globalTimeController.deactivate();
  }
  globalTimeController = null;
}

/**
 * Mock the useCurrentTime hook to return controlled time
 * Should be called in test setup with vi.mock()
 */
export function mockUseCurrentTime(): () => number {
  return () => {
    const controller = getTimeController();
    return controller.getCurrentTime();
  };
}

/**
 * Advance time and wait for React updates
 * Useful for async time progression in tests
 */
export async function advanceTimeAndWait(
  milliseconds: number,
  waitTime: number = 10
): Promise<void> {
  const controller = getTimeController();
  controller.advanceTime(milliseconds);

  // Allow React to process updates
  await new Promise(resolve => setTimeout(resolve, waitTime));
}

/**
 * Set up time control for a test
 * Call this in beforeEach or test setup
 */
export function setupTimeControl(initialTime?: number): MockTimeController {
  // Reset any existing controller to ensure fresh state
  if (globalTimeController) {
    globalTimeController.deactivate();
  }
  globalTimeController = new MockTimeController(initialTime);
  globalTimeController.activate();
  return globalTimeController;
}

/**
 * Clean up time control after a test
 * Call this in afterEach or test cleanup
 */
export function cleanupTimeControl(): void {
  const controller = getTimeController();
  controller.deactivate();
  resetTimeController();
}

/**
 * Create a controlled time environment for testing
 * Returns a function to clean up when done
 */
export function withTimeControl<T>(
  initialTime: number,
  testFn: (controller: MockTimeController) => T
): T {
  const controller = setupTimeControl(initialTime);

  try {
    return testFn(controller);
  } finally {
    cleanupTimeControl();
  }
}

/**
 * Utility to simulate passage of time with multiple steps
 * Useful for testing time-dependent sequences
 */
export async function simulateTimeProgression(
  steps: { duration: number; callback?: () => void }[],
  waitBetweenSteps: number = 10
): Promise<void> {
  for (const step of steps) {
    await advanceTimeAndWait(step.duration, waitBetweenSteps);
    if (step.callback) {
      step.callback();
    }
  }
}

/**
 * Types for time control testing
 */
export interface TimeStep {
  timestamp: number;
  description?: string;
  expectedState?: Record<string, unknown>;
}

export interface TimeProgression {
  steps: TimeStep[];
  totalDuration: number;
}

/**
 * Create a time progression plan from duration and step count
 */
export function createTimeProgression(
  startTime: number,
  totalDuration: number,
  stepCount: number
): TimeProgression {
  const stepDuration = totalDuration / stepCount;
  const steps: TimeStep[] = [];

  for (let i = 0; i <= stepCount; i++) {
    steps.push({
      timestamp: startTime + (i * stepDuration),
      description: `Step ${i + 1}/${stepCount + 1}`
    });
  }

  return {
    steps,
    totalDuration
  };
}
