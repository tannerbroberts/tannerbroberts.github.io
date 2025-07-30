import { describe, it, expect, beforeEach } from 'vitest';
import {
  migrateVariablesToNewSystem,
  createVariableDefinitionFromLegacy,
  createVariableItemFromLegacy,
  isMigrationNeeded,
  safeMigrateVariables
} from '../variableMigration';
import { validateMigratedVariableData } from '../dataValidation';
import { VariableImpl } from '../../functions/utils/variable/types';
import { Item } from '../../functions/utils/item/index';
import { VariableItem } from '../../functions/utils/item/VariableItem';
import type { VariableDefinition } from '../../functions/utils/item/types/VariableTypes';

describe('Variable Migration Functions', () => {
  let mockLegacyVariables: Map<string, VariableImpl[]>;

  beforeEach(() => {
    // Create mock legacy variables for testing
    mockLegacyVariables = new Map();

    const variable1 = new VariableImpl({
      name: 'Test Variable 1',
      quantity: 5.5,
      unit: 'kg',
      category: 'weight'
    });

    const variable2 = new VariableImpl({
      name: 'Test Variable 2',
      quantity: 10,
      unit: 'cm',
      category: 'length'
    });

    const variable3 = new VariableImpl({
      name: 'Test Variable 1', // Same name as var-1 to test deduplication
      quantity: 7.2,
      unit: 'kg',
      category: 'weight'
    });

    mockLegacyVariables.set('item-1', [variable1, variable2]);
    mockLegacyVariables.set('item-2', [variable3]);
  });

  describe('Legacy Variable to New System Migration', () => {
    it('should migrate all legacy variables to new system', () => {
      const result = migrateVariablesToNewSystem(mockLegacyVariables);

      expect(result.success).toBe(true);
      expect(result.totalVariablesMigrated).toBe(3);
      expect(result.definitionsCreated).toBeGreaterThan(0);
      expect(result.variableItems.length).toBe(3);
      expect(result.migrationLog.length).toBeGreaterThan(0);

      // Check that definitions were created
      expect(result.definitions.size).toBeGreaterThan(0);

      // Check that variable items were created
      expect(result.variableItems[0].name).toBe('test variable 1');
      expect(result.variableItems[1].name).toBe('test variable 2');
      expect(result.variableItems[2].name).toBe('test variable 1');

      // Check values were preserved
      expect(result.variableItems[0].value).toBe(5.5);
      expect(result.variableItems[1].value).toBe(10);
      expect(result.variableItems[2].value).toBe(7.2);
    });

    it('should create appropriate variable definitions', () => {
      const result = migrateVariablesToNewSystem(mockLegacyVariables);

      expect(result.success).toBe(true);
      expect(result.definitions.size).toBeGreaterThan(0);

      // Should find definitions for our test variables
      const definitions = Array.from(result.definitions.values());
      const hasVar1Definition = definitions.some(def => def.name === 'test variable 1' && def.unit === 'kg');
      const hasVar2Definition = definitions.some(def => def.name === 'test variable 2' && def.unit === 'cm');

      expect(hasVar1Definition).toBe(true);
      expect(hasVar2Definition).toBe(true);
    });

    it('should create variable descriptions when appropriate', () => {
      const result = migrateVariablesToNewSystem(mockLegacyVariables);

      expect(result.success).toBe(true);
      expect(result.descriptionsCreated).toBeGreaterThan(0);
      expect(result.descriptions.size).toBeGreaterThan(0);

      // Check that descriptions reference valid definition IDs
      for (const description of result.descriptions.values()) {
        const hasValidDefinition = Array.from(result.definitions.values()).some(
          def => def.id === description.variableDefinitionId
        );
        expect(hasValidDefinition).toBe(true);
      }
    });

    it('should handle empty legacy variables gracefully', () => {
      const emptyVariables = new Map<string, VariableImpl[]>();
      const result = migrateVariablesToNewSystem(emptyVariables);

      expect(result.success).toBe(true);
      expect(result.totalVariablesMigrated).toBe(0);
      expect(result.definitionsCreated).toBe(0);
      expect(result.variableItems.length).toBe(0);
      expect(result.definitions.size).toBe(0);
    });
  });

  describe('Legacy Variable Definition Creation', () => {
    it('should create definition from legacy variable', () => {
      const legacyVariable = new VariableImpl({
        name: 'Test Variable',
        quantity: 5.5,
        unit: 'kg',
        category: 'weight'
      });

      const definition = createVariableDefinitionFromLegacy(legacyVariable);

      expect(definition.name).toBe('test variable');
      expect(definition.unit).toBe('kg');
      expect(definition.category).toBe('weight');
      expect(definition.id).toBeDefined();
      expect(definition.createdAt).toBeDefined();
      expect(definition.updatedAt).toBeDefined();
    });
  });

  describe('Legacy Variable Item Creation', () => {
    it('should create variable item from legacy variable', () => {
      const legacyVariable = new VariableImpl({
        name: 'Test Variable',
        quantity: 5.5,
        unit: 'kg',
        category: 'weight'
      });

      const variableItem = createVariableItemFromLegacy(legacyVariable, 'def-1', 'parent-1');

      expect(variableItem.name).toBe('test variable');
      expect(variableItem.value).toBe(5.5);
      expect(variableItem.duration).toBe(0);
      expect(variableItem.parents.length).toBe(1);
      expect(variableItem.parents[0].id).toBe('parent-1');
    });
  });

  describe('Migration Detection', () => {
    it('should detect when migration is needed', () => {
      const mockDefinitions = new Map<string, VariableDefinition>();
      const mockVariableItems: Item[] = [];

      const needsMigration = isMigrationNeeded(mockLegacyVariables, mockDefinitions, mockVariableItems);
      expect(needsMigration).toBe(true);
    });

    it('should detect when migration is not needed', () => {
      const mockDefinitions = new Map<string, VariableDefinition>();
      mockDefinitions.set('def-1', {
        id: 'def-1',
        name: 'Test',
        createdAt: Date.now(),
        updatedAt: Date.now()
      });

      const mockVariableItems: Item[] = [
        new VariableItem({
          id: 'var-item-1',
          name: 'test variable 1',
          value: 5.0,
          parents: []
        })
      ];

      const needsMigration = isMigrationNeeded(mockLegacyVariables, mockDefinitions, mockVariableItems);
      expect(needsMigration).toBe(false);
    });

    it('should not need migration when no legacy variables exist', () => {
      const emptyLegacyVariables = new Map<string, VariableImpl[]>();
      const mockDefinitions = new Map<string, VariableDefinition>();
      const mockVariableItems: Item[] = [];

      const needsMigration = isMigrationNeeded(emptyLegacyVariables, mockDefinitions, mockVariableItems);
      expect(needsMigration).toBe(false);
    });
  });

  describe('Safe Migration', () => {
    it('should perform safe migration with validation', () => {
      const result = safeMigrateVariables(mockLegacyVariables, {
        createBackup: true,
        validateAfterMigration: true,
        logProgress: true
      });

      expect(result.success).toBe(true);
      expect(result.totalVariablesMigrated).toBe(3);
      expect(result.migrationLog.some(log => log.includes('backup'))).toBe(true);
      expect(result.migrationLog.some(log => log.includes('validation'))).toBe(true);
    });

    it('should handle migration without options', () => {
      const result = safeMigrateVariables(mockLegacyVariables);

      expect(result.success).toBe(true);
      expect(result.totalVariablesMigrated).toBe(3);
    });
  });

  describe('Migration Validation', () => {
    it('should validate successful migration result', () => {
      const migrationResult = migrateVariablesToNewSystem(mockLegacyVariables);
      const validation = validateMigratedVariableData(migrationResult);

      expect(validation.isValid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });
  });
});
