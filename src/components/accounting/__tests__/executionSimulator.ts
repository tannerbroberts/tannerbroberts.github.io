import { ItemInstanceImpl } from '../../../functions/utils/itemInstance/types';
import { getTimeController } from './timeControlUtils';
import { createTestItemInstances, TIMING_CONSTANTS } from './testUtils';

/**
 * Represents a single step in the execution simulation
 */
export interface SimulationStep {
  /** Absolute timestamp when this step occurs */
  timestamp: number;
  /** Type of event occurring */
  eventType: 'start' | 'complete' | 'checkpoint';
  /** ID of the item involved in this step */
  itemId: string;
  /** Human-readable description of what happens */
  description: string;
  /** Optional callback to execute during this step */
  callback?: () => void;
  /** Expected state after this step */
  expectedState?: {
    activeItems?: string[];
    completedItems?: string[];
    isParentComplete?: boolean;
  };
}

/**
 * Result of a simulation step execution
 */
export interface SimulationStepResult {
  step: SimulationStep;
  actualTimestamp: number;
  success: boolean;
  error?: string;
  actualState?: {
    activeItems: string[];
    completedItems: string[];
    isParentComplete: boolean;
  };
}

/**
 * Complete simulation execution result
 */
export interface SimulationResult {
  success: boolean;
  totalSteps: number;
  completedSteps: number;
  stepResults: SimulationStepResult[];
  totalDuration: number;
  errors: string[];
}

/**
 * Configuration for execution simulation
 */
export interface SimulationConfig {
  /** Base start time for the simulation */
  baseStartTime: number;
  /** Whether to validate state at each step */
  validateState: boolean;
  /** Whether to pause between steps */
  pauseBetweenSteps: boolean;
  /** Milliseconds to pause between steps if enabled */
  pauseDuration: number;
  /** Custom step definitions (overrides default) */
  customSteps?: SimulationStep[];
}

/**
 * Manages execution simulation for accounting tests
 * Provides step-by-step execution control with state validation
 */
export class ExecutionSimulator {
  private readonly config: SimulationConfig;
  private readonly instances: {
    parentInstance: ItemInstanceImpl;
    childInstances: ItemInstanceImpl[];
    allInstances: ItemInstanceImpl[];
  };
  private readonly steps: SimulationStep[];
  private currentStepIndex: number = 0;
  private isRunning: boolean = false;
  private stepResults: SimulationStepResult[] = [];

  constructor(config: Partial<SimulationConfig> = {}) {
    this.config = {
      baseStartTime: Date.now(),
      validateState: true,
      pauseBetweenSteps: false,
      pauseDuration: 10,
      ...config
    };

    // Create test instances
    this.instances = createTestItemInstances(this.config.baseStartTime);

    // Generate simulation steps
    this.steps = this.config.customSteps || this.generateDefaultSteps();
  }

  /**
   * Generate default simulation steps based on test timing constants
   */
  private generateDefaultSteps(): SimulationStep[] {
    const steps: SimulationStep[] = [];
    const baseTime = this.config.baseStartTime;

    // Parent starts
    steps.push({
      timestamp: baseTime,
      eventType: 'start',
      itemId: this.instances.parentInstance.itemId,
      description: 'SubCalendar execution begins',
      expectedState: {
        activeItems: [this.instances.parentInstance.itemId],
        completedItems: [],
        isParentComplete: false
      }
    });

    // Children start and complete
    this.instances.childInstances.forEach((childInstance, index) => {
      const startTime = baseTime + TIMING_CONSTANTS.CHILD_STARTS[index];
      const endTime = startTime + TIMING_CONSTANTS.CHILD_DURATION;

      // Child starts
      steps.push({
        timestamp: startTime,
        eventType: 'start',
        itemId: childInstance.itemId,
        description: `Child ${index + 1} starts execution`,
        expectedState: {
          activeItems: [this.instances.parentInstance.itemId, childInstance.itemId],
          completedItems: [],
          isParentComplete: false
        }
      });

      // Child completes
      steps.push({
        timestamp: endTime,
        eventType: 'complete',
        itemId: childInstance.itemId,
        description: `Child ${index + 1} completes execution`,
        expectedState: {
          activeItems: [this.instances.parentInstance.itemId],
          completedItems: this.instances.childInstances
            .slice(0, index + 1)
            .map(inst => inst.itemId),
          isParentComplete: false
        }
      });
    });

    // Parent completes
    steps.push({
      timestamp: baseTime + TIMING_CONSTANTS.PARENT_DURATION,
      eventType: 'complete',
      itemId: this.instances.parentInstance.itemId,
      description: 'SubCalendar execution completes',
      expectedState: {
        activeItems: [],
        completedItems: this.instances.allInstances.map(inst => inst.itemId),
        isParentComplete: true
      }
    });

    return steps.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Run the complete simulation from start to finish
   */
  async runCompleteSimulation(): Promise<SimulationResult> {
    this.reset();
    this.isRunning = true;

    const timeController = getTimeController();
    const errors: string[] = [];
    let completedSteps = 0;

    try {
      // Set initial time
      timeController.setTime(this.config.baseStartTime);

      for (let i = 0; i < this.steps.length; i++) {
        const step = this.steps[i];
        this.currentStepIndex = i;

        try {
          const result = await this.executeStep(step);
          this.stepResults.push(result);

          if (result.success) {
            completedSteps++;
          } else {
            errors.push(result.error || `Step failed: ${step.description}`);
          }

          // Pause between steps if configured
          if (this.config.pauseBetweenSteps) {
            await new Promise(resolve =>
              setTimeout(resolve, this.config.pauseDuration)
            );
          }

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          errors.push(`Exception during step: ${step.description} - ${errorMessage}`);

          this.stepResults.push({
            step,
            actualTimestamp: timeController.getCurrentTime(),
            success: false,
            error: errorMessage
          });
        }
      }

      // Mark as complete
      this.currentStepIndex = this.steps.length;

    } finally {
      this.isRunning = false;
    }

    return {
      success: errors.length === 0,
      totalSteps: this.steps.length,
      completedSteps,
      stepResults: this.stepResults,
      totalDuration: TIMING_CONSTANTS.PARENT_DURATION,
      errors
    };
  }

  /**
   * Execute a single simulation step
   */
  async executeStep(step: SimulationStep): Promise<SimulationStepResult> {
    const timeController = getTimeController();

    // Advance time to step timestamp
    timeController.setTime(step.timestamp);

    const result: SimulationStepResult = {
      step,
      actualTimestamp: timeController.getCurrentTime(),
      success: true
    };

    try {
      // Execute step callback if provided
      if (step.callback) {
        step.callback();
      }

      // Validate state if configured
      if (this.config.validateState && step.expectedState) {
        const actualState = this.getCurrentState();
        result.actualState = actualState;

        const validation = this.validateStepState(step.expectedState, actualState);
        if (!validation.isValid) {
          result.success = false;
          result.error = validation.error;
        }
      }

    } catch (error) {
      result.success = false;
      result.error = error instanceof Error ? error.message : String(error);
    }

    return result;
  }

  /**
   * Step through simulation one step at a time
   */
  async stepForward(): Promise<SimulationStepResult | null> {
    if (this.currentStepIndex >= this.steps.length) {
      return null;
    }

    const step = this.steps[this.currentStepIndex];
    const result = await this.executeStep(step);

    this.stepResults.push(result);
    this.currentStepIndex++;

    return result;
  }

  /**
   * Get the current state of the simulation
   */
  private getCurrentState(): {
    activeItems: string[];
    completedItems: string[];
    isParentComplete: boolean;
  } {
    // This would integrate with actual execution state
    // For now, return a mock state based on current time
    const currentTime = getTimeController().getCurrentTime();
    const elapsed = currentTime - this.config.baseStartTime;

    const activeItems: string[] = [];
    const completedItems: string[] = [];

    // Check parent status
    if (elapsed >= 0 && elapsed < TIMING_CONSTANTS.PARENT_DURATION) {
      activeItems.push(this.instances.parentInstance.itemId);
    } else if (elapsed >= TIMING_CONSTANTS.PARENT_DURATION) {
      completedItems.push(this.instances.parentInstance.itemId);
    }

    // Check children status
    this.instances.childInstances.forEach((childInstance, index) => {
      const childStart = TIMING_CONSTANTS.CHILD_STARTS[index];
      const childEnd = childStart + TIMING_CONSTANTS.CHILD_DURATION;

      if (elapsed >= childStart && elapsed < childEnd) {
        activeItems.push(childInstance.itemId);
      } else if (elapsed >= childEnd) {
        completedItems.push(childInstance.itemId);
      }
    });

    return {
      activeItems,
      completedItems,
      isParentComplete: elapsed >= TIMING_CONSTANTS.PARENT_DURATION
    };
  }

  /**
   * Validate that actual state matches expected state
   */
  private validateStepState(
    expected: SimulationStep['expectedState'],
    actual: ReturnType<ExecutionSimulator['getCurrentState']>
  ): { isValid: boolean; error?: string } {
    if (!expected) {
      return { isValid: true };
    }

    // Check active items
    if (expected.activeItems) {
      const expectedActive = new Set(expected.activeItems);
      const actualActive = new Set(actual.activeItems);

      if (expectedActive.size !== actualActive.size ||
        ![...expectedActive].every(id => actualActive.has(id))) {
        return {
          isValid: false,
          error: `Active items mismatch. Expected: [${[...expectedActive].join(', ')}], Actual: [${[...actualActive].join(', ')}]`
        };
      }
    }

    // Check completed items
    if (expected.completedItems) {
      const expectedCompleted = new Set(expected.completedItems);
      const actualCompleted = new Set(actual.completedItems);

      if (expectedCompleted.size !== actualCompleted.size ||
        ![...expectedCompleted].every(id => actualCompleted.has(id))) {
        return {
          isValid: false,
          error: `Completed items mismatch. Expected: [${[...expectedCompleted].join(', ')}], Actual: [${[...actualCompleted].join(', ')}]`
        };
      }
    }

    // Check parent completion
    if (expected.isParentComplete !== undefined &&
      expected.isParentComplete !== actual.isParentComplete) {
      return {
        isValid: false,
        error: `Parent completion mismatch. Expected: ${expected.isParentComplete}, Actual: ${actual.isParentComplete}`
      };
    }

    return { isValid: true };
  }

  /**
   * Reset simulation to initial state
   */
  reset(): void {
    this.currentStepIndex = 0;
    this.stepResults = [];
    this.isRunning = false;
  }

  /**
   * Get simulation progress information
   */
  getProgress(): {
    currentStep: number;
    totalSteps: number;
    isComplete: boolean;
    isRunning: boolean;
  } {
    return {
      currentStep: this.currentStepIndex,
      totalSteps: this.steps.length,
      isComplete: this.currentStepIndex >= this.steps.length,
      isRunning: this.isRunning
    };
  }

  /**
   * Get all simulation steps
   */
  getSteps(): SimulationStep[] {
    return [...this.steps];
  }

  /**
   * Get step results so far
   */
  getStepResults(): SimulationStepResult[] {
    return [...this.stepResults];
  }

  /**
   * Get current instances
   */
  getInstances(): typeof this.instances {
    return this.instances;
  }
}

/**
 * Create a simulation with default test configuration
 */
export function createTestSimulation(config?: Partial<SimulationConfig>): ExecutionSimulator {
  return new ExecutionSimulator(config);
}

/**
 * Helper to run a quick simulation and return results
 */
export async function runQuickSimulation(
  baseStartTime?: number
): Promise<SimulationResult> {
  const simulator = createTestSimulation({
    baseStartTime: baseStartTime || Date.now(),
    validateState: false,  // Disable state validation for quick runs
    pauseBetweenSteps: false
  });

  return await simulator.runCompleteSimulation();
}

/**
 * Create custom simulation steps for specific test scenarios
 */
export function createCustomSimulationSteps(
  baseTime: number,
  scenario: 'normal' | 'delayed' | 'interrupted'
): SimulationStep[] {
  switch (scenario) {
    case 'delayed':
      // Simulate delayed child execution
      return [
        {
          timestamp: baseTime,
          eventType: 'start',
          itemId: 'test-subcalendar-parent',
          description: 'Delayed execution scenario starts'
        }
        // Add more delayed steps...
      ];

    case 'interrupted':
      // Simulate interrupted execution
      return [
        {
          timestamp: baseTime,
          eventType: 'start',
          itemId: 'test-subcalendar-parent',
          description: 'Interrupted execution scenario starts'
        }
        // Add interruption steps...
      ];

    default: {
      // Return normal execution steps
      const simulator = new ExecutionSimulator({ baseStartTime: baseTime });
      return simulator.getSteps();
    }
  }
}
