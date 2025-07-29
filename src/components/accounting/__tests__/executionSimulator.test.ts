import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  ExecutionSimulator,
  createTestSimulation,
  runQuickSimulation,
  createCustomSimulationSteps,
  SimulationStep
} from './executionSimulator';
import { resetTimeController, setupTimeControl, cleanupTimeControl } from './timeControlUtils';
import { TIMING_CONSTANTS, TEST_ITEM_IDS } from './testUtils';

describe('ExecutionSimulator', () => {
  const baseStartTime = 1000000000000;

  beforeEach(() => {
    setupTimeControl(baseStartTime);
  });

  afterEach(() => {
    cleanupTimeControl();
    resetTimeController();
  });

  describe('Initialization', () => {
    it('should create simulator with default configuration', () => {
      const simulator = new ExecutionSimulator();

      expect(simulator.getProgress().totalSteps).toBeGreaterThan(0);
      expect(simulator.getProgress().currentStep).toBe(0);
      expect(simulator.getProgress().isComplete).toBe(false);
      expect(simulator.getProgress().isRunning).toBe(false);
    });

    it('should create simulator with custom configuration', () => {
      const config = {
        baseStartTime: baseStartTime + 5000,
        validateState: false,
        pauseBetweenSteps: true,
        pauseDuration: 50
      };

      const simulator = new ExecutionSimulator(config);
      const instances = simulator.getInstances();

      expect(instances.parentInstance.scheduledStartTime).toBe(baseStartTime + 5000);
      expect(instances.childInstances).toHaveLength(5);
    });

    it('should create test instances with proper timing', () => {
      const simulator = createTestSimulation({ baseStartTime });
      const instances = simulator.getInstances();

      // Check parent instance
      expect(instances.parentInstance.itemId).toBe(TEST_ITEM_IDS.PARENT_SUBCALENDAR);
      expect(instances.parentInstance.scheduledStartTime).toBe(baseStartTime);

      // Check child instances timing
      instances.childInstances.forEach((childInstance, index) => {
        const expectedStartTime = baseStartTime + TIMING_CONSTANTS.CHILD_STARTS[index];
        expect(childInstance.scheduledStartTime).toBe(expectedStartTime);
      });
    });
  });

  describe('Default Step Generation', () => {
    it('should generate correct number of steps', () => {
      const simulator = createTestSimulation({ baseStartTime });
      const steps = simulator.getSteps();

      // Parent start + 5 children * 2 (start + complete) + parent complete = 12 steps
      expect(steps).toHaveLength(12);
    });

    it('should generate steps in chronological order', () => {
      const simulator = createTestSimulation({ baseStartTime });
      const steps = simulator.getSteps();

      for (let i = 1; i < steps.length; i++) {
        expect(steps[i].timestamp).toBeGreaterThanOrEqual(steps[i - 1].timestamp);
      }
    });

    it('should include parent start as first step', () => {
      const simulator = createTestSimulation({ baseStartTime });
      const steps = simulator.getSteps();

      const firstStep = steps[0];
      expect(firstStep.eventType).toBe('start');
      expect(firstStep.itemId).toBe(TEST_ITEM_IDS.PARENT_SUBCALENDAR);
      expect(firstStep.timestamp).toBe(baseStartTime);
    });

    it('should include parent complete as last step', () => {
      const simulator = createTestSimulation({ baseStartTime });
      const steps = simulator.getSteps();

      const lastStep = steps[steps.length - 1];
      expect(lastStep.eventType).toBe('complete');
      expect(lastStep.itemId).toBe(TEST_ITEM_IDS.PARENT_SUBCALENDAR);
      expect(lastStep.timestamp).toBe(baseStartTime + TIMING_CONSTANTS.PARENT_DURATION);
    });

    it('should include child start and complete steps', () => {
      const simulator = createTestSimulation({ baseStartTime });
      const steps = simulator.getSteps();

      // Find child steps
      const childSteps = steps.filter(step =>
        step.itemId !== TEST_ITEM_IDS.PARENT_SUBCALENDAR
      );

      expect(childSteps).toHaveLength(10); // 5 children * 2 (start + complete)

      // Check that each child has both start and complete steps
      for (let i = 1; i <= 5; i++) {
        const childId = Object.values(TEST_ITEM_IDS)[i];
        const childStartSteps = childSteps.filter(
          step => step.itemId === childId && step.eventType === 'start'
        );
        const childCompleteSteps = childSteps.filter(
          step => step.itemId === childId && step.eventType === 'complete'
        );

        expect(childStartSteps).toHaveLength(1);
        expect(childCompleteSteps).toHaveLength(1);
      }
    });

    it('should set correct timing for child steps', () => {
      const simulator = createTestSimulation({ baseStartTime });
      const steps = simulator.getSteps();

      // Check first child timing
      const firstChildStartStep = steps.find(
        step => step.itemId === TEST_ITEM_IDS.CHILD_1 && step.eventType === 'start'
      );
      const firstChildCompleteStep = steps.find(
        step => step.itemId === TEST_ITEM_IDS.CHILD_1 && step.eventType === 'complete'
      );

      expect(firstChildStartStep?.timestamp).toBe(baseStartTime + TIMING_CONSTANTS.CHILD_STARTS[0]);
      expect(firstChildCompleteStep?.timestamp).toBe(
        baseStartTime + TIMING_CONSTANTS.CHILD_STARTS[0] + TIMING_CONSTANTS.CHILD_DURATION
      );
    });
  });

  describe('Step Execution', () => {
    it('should execute single step successfully', async () => {
      const simulator = createTestSimulation({ baseStartTime, validateState: false });
      const steps = simulator.getSteps();

      const result = await simulator.executeStep(steps[0]);

      expect(result.success).toBe(true);
      expect(result.step).toBe(steps[0]);
      expect(result.actualTimestamp).toBe(steps[0].timestamp);
    });

    it('should execute step with callback', async () => {
      const simulator = createTestSimulation({ baseStartTime, validateState: false });

      let callbackExecuted = false;
      const testStep: SimulationStep = {
        timestamp: baseStartTime + 1000,
        eventType: 'checkpoint',
        itemId: 'test-item',
        description: 'Test step with callback',
        callback: () => { callbackExecuted = true; }
      };

      const result = await simulator.executeStep(testStep);

      expect(result.success).toBe(true);
      expect(callbackExecuted).toBe(true);
    });

    it('should step forward through simulation', async () => {
      const simulator = createTestSimulation({ baseStartTime, validateState: false });

      let stepCount = 0;
      let result = await simulator.stepForward();

      while (result !== null) {
        stepCount++;
        expect(result.success).toBe(true);
        result = await simulator.stepForward();
      }

      expect(stepCount).toBe(simulator.getSteps().length);
      expect(simulator.getProgress().isComplete).toBe(true);
    });
  });

  describe('Complete Simulation', () => {
    it('should run complete simulation successfully', async () => {
      const simulator = createTestSimulation({
        baseStartTime,
        validateState: false,
        pauseBetweenSteps: false
      });

      const result = await simulator.runCompleteSimulation();

      expect(result.success).toBe(true);
      expect(result.totalSteps).toBe(simulator.getSteps().length);
      expect(result.completedSteps).toBe(result.totalSteps);
      expect(result.errors).toHaveLength(0);
      expect(result.totalDuration).toBe(TIMING_CONSTANTS.PARENT_DURATION);
    });

    it('should run quick simulation', async () => {
      const result = await runQuickSimulation(baseStartTime);

      expect(result.success).toBe(true);
      expect(result.totalSteps).toBeGreaterThan(0);
      expect(result.completedSteps).toBe(result.totalSteps);
    });

    it('should handle simulation with pauses', async () => {
      const simulator = createTestSimulation({
        baseStartTime,
        validateState: false,
        pauseBetweenSteps: true,
        pauseDuration: 1 // Minimal pause for testing
      });

      const startTime = Date.now();
      const result = await simulator.runCompleteSimulation();
      const endTime = Date.now();

      expect(result.success).toBe(true);
      // Should take at least some time due to pauses
      expect(endTime - startTime).toBeGreaterThan(0);
    });
  });

  describe('State Validation', () => {
    it('should validate state when enabled', async () => {
      const simulator = createTestSimulation({
        baseStartTime,
        validateState: true
      });

      const steps = simulator.getSteps();
      const firstStep = steps[0]; // Parent start step

      const result = await simulator.executeStep(firstStep);

      expect(result.actualState).toBeDefined();
      expect(result.actualState?.activeItems).toContain(TEST_ITEM_IDS.PARENT_SUBCALENDAR);
    });

    it('should skip validation when disabled', async () => {
      const simulator = createTestSimulation({
        baseStartTime,
        validateState: false
      });

      const steps = simulator.getSteps();
      const firstStep = steps[0];

      const result = await simulator.executeStep(firstStep);

      expect(result.actualState).toBeUndefined();
    });
  });

  describe('Progress Tracking', () => {
    it('should track progress correctly', async () => {
      const simulator = createTestSimulation({ baseStartTime, validateState: false });
      const totalSteps = simulator.getSteps().length;

      expect(simulator.getProgress().currentStep).toBe(0);
      expect(simulator.getProgress().totalSteps).toBe(totalSteps);
      expect(simulator.getProgress().isComplete).toBe(false);

      // Step forward a few times
      await simulator.stepForward();
      await simulator.stepForward();

      expect(simulator.getProgress().currentStep).toBe(2);
      expect(simulator.getProgress().isComplete).toBe(false);
    });

    it('should mark complete when all steps done', async () => {
      const simulator = createTestSimulation({ baseStartTime, validateState: false });

      await simulator.runCompleteSimulation();

      expect(simulator.getProgress().isComplete).toBe(true);
      expect(simulator.getProgress().currentStep).toBe(simulator.getProgress().totalSteps);
    });

    it('should track running state', async () => {
      const simulator = createTestSimulation({ baseStartTime, validateState: false });

      expect(simulator.getProgress().isRunning).toBe(false);

      // Start simulation but don't await (so it's running)
      const simulationPromise = simulator.runCompleteSimulation();

      // Give it a moment to start
      await new Promise(resolve => setTimeout(resolve, 1));

      // Note: This test is tricky because the simulation might complete very quickly
      // In a real implementation, we might need to add delays or pause points

      await simulationPromise;
      expect(simulator.getProgress().isRunning).toBe(false);
    });
  });

  describe('Reset Functionality', () => {
    it('should reset simulation state', async () => {
      const simulator = createTestSimulation({ baseStartTime, validateState: false });

      // Run a few steps
      await simulator.stepForward();
      await simulator.stepForward();

      expect(simulator.getProgress().currentStep).toBe(2);
      expect(simulator.getStepResults()).toHaveLength(2);

      // Reset
      simulator.reset();

      expect(simulator.getProgress().currentStep).toBe(0);
      expect(simulator.getStepResults()).toHaveLength(0);
      expect(simulator.getProgress().isComplete).toBe(false);
      expect(simulator.getProgress().isRunning).toBe(false);
    });
  });

  describe('Custom Steps', () => {
    it('should accept custom simulation steps', () => {
      const customSteps: SimulationStep[] = [
        {
          timestamp: baseStartTime,
          eventType: 'start',
          itemId: 'custom-item',
          description: 'Custom start step'
        },
        {
          timestamp: baseStartTime + 1000,
          eventType: 'complete',
          itemId: 'custom-item',
          description: 'Custom complete step'
        }
      ];

      const simulator = new ExecutionSimulator({
        baseStartTime,
        customSteps
      });

      const steps = simulator.getSteps();
      expect(steps).toHaveLength(2);
      expect(steps[0].itemId).toBe('custom-item');
      expect(steps[1].itemId).toBe('custom-item');
    });

    it('should create custom simulation steps for different scenarios', () => {
      const normalSteps = createCustomSimulationSteps(baseStartTime, 'normal');
      const delayedSteps = createCustomSimulationSteps(baseStartTime, 'delayed');
      const interruptedSteps = createCustomSimulationSteps(baseStartTime, 'interrupted');

      expect(normalSteps).toHaveLength(12); // Default step count
      expect(delayedSteps).toHaveLength(1); // Minimal delayed scenario
      expect(interruptedSteps).toHaveLength(1); // Minimal interrupted scenario
    });
  });

  describe('Error Handling', () => {
    it('should handle step execution errors', async () => {
      const simulator = createTestSimulation({ baseStartTime, validateState: false });

      const errorStep: SimulationStep = {
        timestamp: baseStartTime,
        eventType: 'start',
        itemId: 'error-item',
        description: 'Error step',
        callback: () => { throw new Error('Test error'); }
      };

      const result = await simulator.executeStep(errorStep);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Test error');
    });

    it('should continue simulation on step errors', async () => {
      const errorStep: SimulationStep = {
        timestamp: baseStartTime + 500,
        eventType: 'checkpoint',
        itemId: 'error-item',
        description: 'Error step',
        callback: () => { throw new Error('Test error'); }
      };

      const simulator = new ExecutionSimulator({
        baseStartTime,
        validateState: false,
        customSteps: [errorStep]
      });

      const result = await simulator.runCompleteSimulation();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Test error');
      expect(result.completedSteps).toBe(0);
      expect(result.totalSteps).toBe(1);
    });
  });

  describe('Time Integration', () => {
    it('should set time correctly for each step', async () => {
      const simulator = createTestSimulation({ baseStartTime, validateState: false });
      const steps = simulator.getSteps();

      for (const step of steps.slice(0, 3)) { // Test first few steps
        const result = await simulator.executeStep(step);
        expect(result.actualTimestamp).toBe(step.timestamp);
      }
    });
  });
});
