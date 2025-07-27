import { ItemInstance, Variable } from '../functions/utils/item/index';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateItemInstance(instance: ItemInstance): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!instance.id) errors.push('Instance ID is required');
  if (!instance.itemId) errors.push('Item ID is required');
  if (!instance.calendarEntryId) errors.push('Calendar entry ID is required');
  if (!instance.scheduledStartTime) errors.push('Scheduled start time is required');

  // Logical validations
  if (instance.actualStartTime && instance.actualStartTime < instance.scheduledStartTime) {
    warnings.push('Actual start time is before scheduled start time');
  }

  if (instance.completedAt && instance.actualStartTime && instance.completedAt < instance.actualStartTime) {
    errors.push('Completion time cannot be before start time');
  }

  if (instance.isComplete && !instance.completedAt) {
    warnings.push('Instance marked complete but no completion time recorded');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateVariable(variable: Variable): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!variable.name?.trim()) {
    errors.push('Variable name is required');
  }

  if (typeof variable.quantity !== 'number') {
    errors.push('Variable quantity must be a number');
  }

  if (isNaN(variable.quantity)) {
    errors.push('Variable quantity cannot be NaN');
  }

  // Warnings
  if (variable.quantity === 0) {
    warnings.push('Variable quantity is zero - consider removing this variable');
  }

  if (variable.name && variable.name.length > 50) {
    warnings.push('Variable name is very long - consider shortening');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function validateBatchOperation(instances: ItemInstance[]): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (instances.length === 0) {
    errors.push('No instances provided for batch operation');
    return { isValid: false, errors, warnings };
  }

  if (instances.length > 100) {
    warnings.push(`Large batch operation (${instances.length} instances) - consider breaking into smaller batches`);
  }

  // Check for duplicate instance IDs
  const ids = instances.map(i => i.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate instance IDs found: ${duplicates.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
