import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  MockTimeController,
  getTimeController,
  resetTimeController,
  mockUseCurrentTime,
  advanceTimeAndWait,
  setupTimeControl,
  cleanupTimeControl,
  withTimeControl,
  simulateTimeProgression,
  createTimeProgression
} from './timeControlUtils';

describe('MockTimeController', () => {
  let controller: MockTimeController;
  const initialTime = 1000000000000; // Fixed timestamp for testing

  beforeEach(() => {
    controller = new MockTimeController(initialTime);
  });

  afterEach(() => {
    controller.deactivate();
  });

  describe('Time Management', () => {
    it('should initialize with the specified time', () => {
      expect(controller.getCurrentTime()).toBe(initialTime);
    });

    it('should set time to a specific timestamp', () => {
      const newTime = initialTime + 5000;
      controller.setTime(newTime);
      expect(controller.getCurrentTime()).toBe(newTime);
    });

    it('should advance time by specified milliseconds', () => {
      const advancement = 3000;
      controller.advanceTime(advancement);
      expect(controller.getCurrentTime()).toBe(initialTime + advancement);
    });

    it('should reset time to new value', () => {
      controller.advanceTime(5000);
      const resetTime = 2000000000000;
      controller.resetTime(resetTime);
      expect(controller.getCurrentTime()).toBe(resetTime);
    });

    it('should reset time to current Date.now() if no value provided', () => {
      const beforeReset = Date.now();
      controller.resetTime();
      const afterReset = controller.getCurrentTime();

      // Should be close to current time (within 100ms)
      expect(Math.abs(afterReset - beforeReset)).toBeLessThan(100);
    });
  });

  describe('Activation and Deactivation', () => {
    it('should start inactive', () => {
      expect(controller.isTimeControlActive()).toBe(false);
    });

    it('should become active when activated', () => {
      controller.activate();
      expect(controller.isTimeControlActive()).toBe(true);
    });

    it('should mock Date.now() when activated', () => {
      controller.activate();
      expect(Date.now()).toBe(initialTime);
    });

    it('should advance mocked Date.now() when time advances', () => {
      controller.activate();
      controller.advanceTime(5000);
      expect(Date.now()).toBe(initialTime + 5000);
    });

    it('should restore Date.now() when deactivated', () => {
      const realDateNow = Date.now();
      controller.activate();
      controller.deactivate();

      // Date.now() should return real time again (within reasonable range)
      const afterDeactivation = Date.now();
      expect(afterDeactivation).toBeGreaterThan(realDateNow - 1000);
    });

    it('should handle multiple activations gracefully', () => {
      controller.activate();
      controller.activate(); // Second activation should be safe
      expect(controller.isTimeControlActive()).toBe(true);
    });

    it('should handle multiple deactivations gracefully', () => {
      controller.activate();
      controller.deactivate();
      controller.deactivate(); // Second deactivation should be safe
      expect(controller.isTimeControlActive()).toBe(false);
    });
  });
});

describe('Global Time Controller', () => {
  afterEach(() => {
    resetTimeController();
  });

  it('should create a global controller instance', () => {
    const controller1 = getTimeController();
    const controller2 = getTimeController();
    expect(controller1).toBe(controller2); // Same instance
  });

  it('should use initial time if provided', () => {
    const testTime = 1500000000000;
    const controller = getTimeController(testTime);
    expect(controller.getCurrentTime()).toBe(testTime);
  });

  it('should reset global controller', () => {
    const controller1 = getTimeController();
    controller1.activate();

    resetTimeController();

    const controller2 = getTimeController();
    expect(controller2).not.toBe(controller1); // New instance
    expect(controller2.isTimeControlActive()).toBe(false);
  });
});

describe('Mock UseCurrentTime', () => {
  beforeEach(() => {
    resetTimeController();
  });

  afterEach(() => {
    resetTimeController();
  });

  it('should return controlled time', () => {
    const testTime = 1600000000000;
    getTimeController(testTime);
    const mockHook = mockUseCurrentTime();

    expect(mockHook()).toBe(testTime);
  });

  it('should reflect time changes', () => {
    const testTime = 1600000000000;
    const controller = getTimeController(testTime);
    const mockHook = mockUseCurrentTime();

    controller.advanceTime(3000);
    expect(mockHook()).toBe(testTime + 3000);
  });
});

describe('Async Time Utilities', () => {
  beforeEach(() => {
    resetTimeController();
  });

  afterEach(() => {
    resetTimeController();
  });

  it('should advance time and wait', async () => {
    const testTime = 1700000000000;
    const controller = getTimeController(testTime);
    controller.activate();

    await advanceTimeAndWait(2000, 1); // Minimal wait time for testing

    expect(controller.getCurrentTime()).toBe(testTime + 2000);
  });

  it('should simulate time progression with steps', async () => {
    const testTime = 1700000000000;
    const controller = getTimeController(testTime);
    controller.activate();

    const callbackResults: number[] = [];
    const steps = [
      { duration: 1000, callback: () => callbackResults.push(1) },
      { duration: 2000, callback: () => callbackResults.push(2) },
      { duration: 500, callback: () => callbackResults.push(3) }
    ];

    await simulateTimeProgression(steps, 1);

    expect(controller.getCurrentTime()).toBe(testTime + 3500);
    expect(callbackResults).toEqual([1, 2, 3]);
  });
});

describe('Setup and Cleanup Utilities', () => {
  it('should setup and cleanup time control', () => {
    const testTime = 1800000000000;
    const controller = setupTimeControl(testTime);

    expect(controller.isTimeControlActive()).toBe(true);
    expect(controller.getCurrentTime()).toBe(testTime);

    cleanupTimeControl();

    // After cleanup, a new controller should be created and inactive
    const newController = getTimeController();
    expect(newController.isTimeControlActive()).toBe(false);
  });

  it('should work with withTimeControl wrapper', () => {
    const testTime = 1800000000000;
    let capturedTime = 0;

    const result = withTimeControl(testTime, (controller) => {
      expect(controller.isTimeControlActive()).toBe(true);
      capturedTime = controller.getCurrentTime();
      return 'test-result';
    });

    expect(result).toBe('test-result');
    expect(capturedTime).toBe(testTime);

    // Should be cleaned up automatically
    const newController = getTimeController();
    expect(newController.isTimeControlActive()).toBe(false);
  });
});

describe('Time Progression Planning', () => {
  it('should create time progression with correct steps', () => {
    const startTime = 1000000000000;
    const totalDuration = 10000;
    const stepCount = 4;

    const progression = createTimeProgression(startTime, totalDuration, stepCount);

    expect(progression.totalDuration).toBe(totalDuration);
    expect(progression.steps).toHaveLength(stepCount + 1); // +1 for start step

    // Check step timestamps
    expect(progression.steps[0].timestamp).toBe(startTime);
    expect(progression.steps[1].timestamp).toBe(startTime + 2500);
    expect(progression.steps[2].timestamp).toBe(startTime + 5000);
    expect(progression.steps[3].timestamp).toBe(startTime + 7500);
    expect(progression.steps[4].timestamp).toBe(startTime + 10000);
  });

  it('should include step descriptions', () => {
    const startTime = 1000000000000;
    const progression = createTimeProgression(startTime, 6000, 2);

    expect(progression.steps[0].description).toBe('Step 1/3');
    expect(progression.steps[1].description).toBe('Step 2/3');
    expect(progression.steps[2].description).toBe('Step 3/3');
  });
});

describe('Error Handling', () => {
  afterEach(() => {
    resetTimeController();
  });

  it('should handle time controller errors gracefully', () => {
    const controller = getTimeController();

    // These operations should not throw
    expect(() => controller.setTime(-1)).not.toThrow();
    expect(() => controller.advanceTime(-1000)).not.toThrow();
    expect(() => controller.resetTime(-1)).not.toThrow();
  });

  it('should handle activation errors gracefully', () => {
    const controller = getTimeController();

    expect(() => controller.activate()).not.toThrow();
    expect(() => controller.deactivate()).not.toThrow();
  });
});

describe('Integration Tests', () => {
  afterEach(() => {
    resetTimeController();
    vi.restoreAllMocks();
  });

  it('should integrate with vitest mocking', () => {
    const testTime = 2000000000000;
    const controller = getTimeController(testTime);
    controller.activate();

    // Verify that Date.now() is properly mocked
    expect(Date.now()).toBe(testTime);

    // Verify time advancement
    controller.advanceTime(1500);
    expect(Date.now()).toBe(testTime + 1500);

    controller.deactivate();
  });

  it('should restore mocks after deactivation', () => {
    const testTime = 2000000000000;
    const realTimeBefore = Date.now();

    const controller = getTimeController(testTime);
    controller.activate();

    expect(Date.now()).toBe(testTime); // Mocked time

    controller.deactivate();

    const realTimeAfter = Date.now();
    expect(realTimeAfter).toBeGreaterThan(realTimeBefore - 100); // Real time restored
  });
});
