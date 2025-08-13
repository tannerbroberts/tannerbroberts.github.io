import { describe, it, expect } from 'vitest';
import { ItemInstanceImpl, InstanceExecutionDetails } from '../types';

describe('ItemInstance', () => {
  const mockCalendarEntryId = 'test-calendar-entry';
  const mockItemId = 'test-item';
  const mockStartTime = Date.now();

  it('should create an instance with default pending status', () => {
    const instance = new ItemInstanceImpl({
      itemId: mockItemId,
      calendarEntryId: mockCalendarEntryId,
      scheduledStartTime: mockStartTime
    });

    expect(instance.status).toBe('pending');
    expect(instance.itemId).toBe(mockItemId);
    expect(instance.calendarEntryId).toBe(mockCalendarEntryId);
    expect(instance.scheduledStartTime).toBe(mockStartTime);
    expect(instance.actualStartTime).toBeUndefined();
    expect(instance.completedAt).toBeUndefined();
  });

  it('should migrate legacy isComplete=true to status complete', () => {
    const instance = new ItemInstanceImpl({
      itemId: mockItemId,
      calendarEntryId: mockCalendarEntryId,
      scheduledStartTime: mockStartTime,
      isComplete: true // This should be ignored per requirements
    });

    expect(instance.status).toBe('complete');
  // Transitional legacy flag still derived for backward compatibility
  expect(instance.isComplete).toBe(true);
  });

  it('should serialize and deserialize correctly', () => {
    const executionDetails: InstanceExecutionDetails = {
      checklistStartTimes: { 'child1': Date.now() },
      variableState: { 'eggs': 3 },
      notes: 'Test notes',
      interruptionCount: 1
    };

    const instance = new ItemInstanceImpl({
      itemId: mockItemId,
      calendarEntryId: mockCalendarEntryId,
      scheduledStartTime: mockStartTime,
      executionDetails
    });

    const json = instance.toJSON();
    const restored = ItemInstanceImpl.fromJSON(json);

    expect(restored.id).toBe(instance.id);
    expect(restored.itemId).toBe(instance.itemId);
    expect(restored.calendarEntryId).toBe(instance.calendarEntryId);
    expect(restored.executionDetails).toEqual(instance.executionDetails);
  });

  it('should mark as started with immutable update', () => {
    const instance = new ItemInstanceImpl({
      itemId: mockItemId,
      calendarEntryId: mockCalendarEntryId,
      scheduledStartTime: mockStartTime
    });

    const startTime = Date.now();
    const startedInstance = instance.markStarted(startTime);

    expect(startedInstance).not.toBe(instance); // Should be different object
    expect(startedInstance.actualStartTime).toBe(startTime);
    expect(startedInstance.executionDetails.interruptionCount).toBe(1);
    expect(instance.actualStartTime).toBeUndefined(); // Original unchanged
  });

  it('should mark as completed with immutable update', () => {
    const instance = new ItemInstanceImpl({
      itemId: mockItemId,
      calendarEntryId: mockCalendarEntryId,
      scheduledStartTime: mockStartTime
    });

    const completedTime = Date.now();
    const completedInstance = instance.markCompleted(completedTime);

    expect(completedInstance).not.toBe(instance); // Should be different object
  expect(completedInstance.status).toBe('complete');
    expect(completedInstance.completedAt).toBe(completedTime);
  expect(instance.status).toBe('pending'); // Original unchanged
  });

  it('should update execution details immutably', () => {
    const instance = new ItemInstanceImpl({
      itemId: mockItemId,
      calendarEntryId: mockCalendarEntryId,
      scheduledStartTime: mockStartTime
    });

    const newDetails = { notes: 'Updated notes' };
    const updatedInstance = instance.updateExecutionDetails(newDetails);

    expect(updatedInstance).not.toBe(instance);
    expect(updatedInstance.executionDetails.notes).toBe('Updated notes');
    expect(instance.executionDetails.notes).toBe(''); // Original unchanged
  });
});
