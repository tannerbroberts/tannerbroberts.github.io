import { describe, it, expect, beforeEach } from 'vitest';
import { migrateVariableData } from '../../localStorageImplementation/variableMigration';
import { featureFlags } from '../../localStorageImplementation/integration/featureFlags';
import { checkMigrationStatus } from '../../localStorageImplementation/integration/migrationService';

describe('Variable Migration Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    featureFlags.clearAllOverrides();
  });

  describe('Full Migration Tests', () => {
    it('should migrate complete legacy dataset to new system', async () => {
      // Set up legacy data structure
      const legacyData = {
        version: '1.0.0',
        items: [
          {
            id: 'item-1',
            name: 'Recipe 1',
            type: 'BasicItem',
            duration: 3600000,
            variables: [
              { name: 'flour', quantity: 2, type: 'cups' },
              { name: 'eggs', quantity: 3, type: 'whole' }
            ]
          },
          {
            id: 'item-2',
            name: 'Recipe 2',
            type: 'BasicItem',
            duration: 1800000,
            variables: [
              { name: 'flour', quantity: 1, type: 'cups' },
              { name: 'milk', quantity: 1, type: 'cup' }
            ]
          },
          {
            id: 'item-3',
            name: 'Shopping List',
            type: 'CheckListItem',
            children: [
              { id: 'child-1', name: 'Buy flour', isComplete: false }
            ],
            variables: [
              { name: 'flour', quantity: 5, type: 'cups' }
            ]
          }
        ],
        itemVariables: {
          'item-1': [
            { name: 'flour', quantity: 2, type: 'cups' },
            { name: 'eggs', quantity: 3, type: 'whole' }
          ],
          'item-2': [
            { name: 'flour', quantity: 1, type: 'cups' },
            { name: 'milk', quantity: 1, type: 'cup' }
          ]
        }
      };

      localStorage.setItem('atp-data', JSON.stringify(legacyData));

      // Check migration status
      const migrationStatus = checkMigrationStatus();
      expect(migrationStatus.needsMigration).toBe(true);
      expect(migrationStatus.version).toBe('1.0.0');

      // Perform migration
      const migrationResult = await migrateVariableData();

      expect(migrationResult.success).toBe(true);
      expect(migrationResult.migratedVariables).toBeGreaterThan(0);
      expect(migrationResult.migratedItems).toBe(3);

      // Verify migrated data structure
      const migratedData = JSON.parse(localStorage.getItem('atp-data') || '{}');
      expect(migratedData.version).toBe('2.0.0'); // New version

      // Should have variable items for each unique variable
      const variableItems = migratedData.items.filter((item: any) => item.type === 'VariableItem');
      expect(variableItems).toHaveLength(3); // flour, eggs, milk

      // Verify variable definitions
      const flourVar = variableItems.find((v: any) => v.name === 'flour');
      expect(flourVar).toBeDefined();
      expect(flourVar.value).toBe(0); // Default value for definition

      // Verify original items still exist with references
      const originalItems = migratedData.items.filter((item: any) =>
        ['item-1', 'item-2', 'item-3'].includes(item.id)
      );
      expect(originalItems).toHaveLength(3);

      // Verify variable references are converted
      const recipe1 = originalItems.find((item: any) => item.id === 'item-1');
      expect(recipe1.variableReferences).toBeDefined();
      expect(recipe1.variableReferences).toHaveLength(2);
    });

    it('should preserve all data without loss during migration', async () => {
      const legacyData = {
        version: '1.0.0',
        items: [
          {
            id: 'test-item',
            name: 'Test Item',
            type: 'BasicItem',
            duration: 60000,
            description: 'Test description',
            variables: [
              { name: 'testVar', quantity: 42, type: 'units' }
            ],
            parents: [{ id: 'parent-1', relationshipId: 'rel-1' }],
            children: [{ id: 'child-1', relationshipId: 'rel-2' }]
          }
        ],
        itemInstances: [
          {
            id: 'instance-1',
            itemId: 'test-item',
            startTime: Date.now(),
            isComplete: false
          }
        ],
        baseCalendar: [
          {
            id: 'cal-1',
            itemId: 'test-item',
            startTime: Date.now(),
            instanceId: 'instance-1'
          }
        ]
      };

      localStorage.setItem('atp-data', JSON.stringify(legacyData));

      const migrationResult = await migrateVariableData();
      expect(migrationResult.success).toBe(true);

      const migratedData = JSON.parse(localStorage.getItem('atp-data') || '{}');

      // Verify all original data is preserved
      expect(migratedData.itemInstances).toEqual(legacyData.itemInstances);
      expect(migratedData.baseCalendar).toEqual(legacyData.baseCalendar);

      // Verify item structure is preserved (except for variable changes)
      const migratedItem = migratedData.items.find((item: any) => item.id === 'test-item');
      expect(migratedItem.name).toBe('Test Item');
      expect(migratedItem.duration).toBe(60000);
      expect(migratedItem.description).toBe('Test description');
      expect(migratedItem.parents).toEqual(legacyData.items[0].parents);
      expect(migratedItem.children).toEqual(legacyData.items[0].children);
    });

    it('should handle edge cases in legacy data', async () => {
      const edgeCaseData = {
        version: '1.0.0',
        items: [
          // Item with no variables
          {
            id: 'item-no-vars',
            name: 'No Variables',
            type: 'BasicItem'
          },
          // Item with empty variables array
          {
            id: 'item-empty-vars',
            name: 'Empty Variables',
            type: 'BasicItem',
            variables: []
          },
          // Item with duplicate variable names
          {
            id: 'item-duplicate-vars',
            name: 'Duplicate Variables',
            type: 'BasicItem',
            variables: [
              { name: 'duplicateVar', quantity: 1, type: 'unit' },
              { name: 'duplicateVar', quantity: 2, type: 'unit' }
            ]
          },
          // Item with invalid variable data
          {
            id: 'item-invalid-vars',
            name: 'Invalid Variables',
            type: 'BasicItem',
            variables: [
              { name: '', quantity: 1, type: 'unit' }, // Empty name
              { name: 'validVar', quantity: -1, type: 'unit' }, // Negative quantity
              { name: 'anotherValid', quantity: 'invalid', type: 'unit' } // Invalid quantity type
            ]
          }
        ]
      };

      localStorage.setItem('atp-data', JSON.stringify(edgeCaseData));

      const migrationResult = await migrateVariableData();
      expect(migrationResult.success).toBe(true);

      const migratedData = JSON.parse(localStorage.getItem('atp-data') || '{}');

      // Should handle items with no variables gracefully
      const noVarsItem = migratedData.items.find((item: any) => item.id === 'item-no-vars');
      expect(noVarsItem.variableReferences).toEqual([]);

      // Should handle empty variables array
      const emptyVarsItem = migratedData.items.find((item: any) => item.id === 'item-empty-vars');
      expect(emptyVarsItem.variableReferences).toEqual([]);

      // Should deduplicate variables and sum quantities
      const duplicateVarsItem = migratedData.items.find((item: any) => item.id === 'item-duplicate-vars');
      expect(duplicateVarsItem.variableReferences).toHaveLength(1);
      expect(duplicateVarsItem.variableReferences[0].quantity).toBe(3); // 1 + 2

      // Should skip invalid variables and keep valid ones
      const invalidVarsItem = migratedData.items.find((item: any) => item.id === 'item-invalid-vars');
      expect(invalidVarsItem.variableReferences).toHaveLength(1); // Only 'validVar' should remain
      expect(invalidVarsItem.variableReferences[0].name).toBe('validVar');
    });
  });

  describe('Incremental Migration Tests', () => {
    it('should handle partial migration scenarios', async () => {
      const partialData = {
        version: '1.5.0', // Intermediate version
        items: [
          {
            id: 'item-1',
            name: 'Already Migrated',
            type: 'BasicItem',
            variableReferences: [
              { variableId: 'var-1', quantity: 5 }
            ]
          },
          {
            id: 'item-2',
            name: 'Needs Migration',
            type: 'BasicItem',
            variables: [
              { name: 'oldVar', quantity: 10, type: 'units' }
            ]
          }
        ],
        variableDefinitions: [
          {
            id: 'var-1',
            name: 'existingVar',
            description: 'Already migrated variable'
          }
        ]
      };

      localStorage.setItem('atp-data', JSON.stringify(partialData));

      const migrationResult = await migrateVariableData();
      expect(migrationResult.success).toBe(true);

      const migratedData = JSON.parse(localStorage.getItem('atp-data') || '{}');

      // Should preserve already migrated items
      const alreadyMigrated = migratedData.items.find((item: any) => item.id === 'item-1');
      expect(alreadyMigrated.variableReferences).toEqual([
        { variableId: 'var-1', quantity: 5 }
      ]);

      // Should migrate remaining items
      const newlyMigrated = migratedData.items.find((item: any) => item.id === 'item-2');
      expect(newlyMigrated.variableReferences).toBeDefined();
      expect(newlyMigrated.variables).toBeUndefined(); // Old format removed
    });

    it('should support rollback capability', async () => {
      const originalData = {
        version: '1.0.0',
        items: [
          {
            id: 'item-1',
            name: 'Test Item',
            type: 'BasicItem',
            variables: [
              { name: 'testVar', quantity: 5, type: 'units' }
            ]
          }
        ]
      };

      localStorage.setItem('atp-data', JSON.stringify(originalData));

      // Create backup before migration
      localStorage.setItem('atp-data-backup', JSON.stringify(originalData));

      // Perform migration
      const migrationResult = await migrateVariableData();
      expect(migrationResult.success).toBe(true);

      // Simulate rollback
      const backupData = localStorage.getItem('atp-data-backup');
      expect(backupData).toBeDefined();

      localStorage.setItem('atp-data', backupData!);

      // Verify rollback restored original data
      const rolledBackData = JSON.parse(localStorage.getItem('atp-data') || '{}');
      expect(rolledBackData).toEqual(originalData);
    });
  });

  describe('Migration Performance Tests', () => {
    it('should complete large dataset migration within time limits', async () => {
      // Create large legacy dataset
      const largeData = {
        version: '1.0.0',
        items: []
      };

      // Generate 1000 items with variables
      for (let i = 0; i < 1000; i++) {
        largeData.items.push({
          id: `item-${i}`,
          name: `Item ${i}`,
          type: 'BasicItem',
          variables: [
            { name: `var${i % 50}`, quantity: i, type: 'units' } // 50 unique variables
          ]
        });
      }

      localStorage.setItem('atp-data', JSON.stringify(largeData));

      const startTime = performance.now();
      const migrationResult = await migrateVariableData();
      const endTime = performance.now();

      expect(migrationResult.success).toBe(true);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds

      const migratedData = JSON.parse(localStorage.getItem('atp-data') || '{}');
      expect(migratedData.items).toHaveLength(1050); // 1000 items + 50 variables
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle corrupted legacy data gracefully', async () => {
      const corruptedData = {
        version: '1.0.0',
        items: [
          // Valid item
          {
            id: 'valid-item',
            name: 'Valid Item',
            type: 'BasicItem',
            variables: [{ name: 'validVar', quantity: 5, type: 'units' }]
          },
          // Corrupted item (missing required fields)
          {
            id: 'corrupted-item',
            // Missing name and type
            variables: [{ name: 'orphanVar', quantity: 10 }]
          },
          // Item with corrupted variables
          {
            id: 'bad-vars-item',
            name: 'Bad Variables',
            type: 'BasicItem',
            variables: 'not-an-array' // Invalid format
          }
        ]
      };

      localStorage.setItem('atp-data', JSON.stringify(corruptedData));

      const migrationResult = await migrateVariableData();

      // Migration should succeed but report issues
      expect(migrationResult.success).toBe(true);
      expect(migrationResult.errors).toBeDefined();
      expect(migrationResult.errors.length).toBeGreaterThan(0);

      const migratedData = JSON.parse(localStorage.getItem('atp-data') || '{}');

      // Valid items should still be migrated
      const validItem = migratedData.items.find((item: any) => item.id === 'valid-item');
      expect(validItem).toBeDefined();
      expect(validItem.variableReferences).toBeDefined();
    });

    it('should provide detailed error reporting', async () => {
      const problematicData = {
        version: '1.0.0',
        items: [
          {
            id: 'problem-item',
            name: 'Problem Item',
            type: 'BasicItem',
            variables: [
              { name: 'goodVar', quantity: 5, type: 'units' },
              { /* missing name */ quantity: 10, type: 'units' },
              { name: 'badQuantity', quantity: null, type: 'units' }
            ]
          }
        ]
      };

      localStorage.setItem('atp-data', JSON.stringify(problematicData));

      const migrationResult = await migrateVariableData();

      expect(migrationResult.errors).toBeDefined();
      expect(migrationResult.errors.length).toBeGreaterThan(0);

      // Should provide specific error details
      const errorMessages = migrationResult.errors.map((e: any) => e.message);
      expect(errorMessages.some((msg: string) => msg.includes('missing name'))).toBe(true);
      expect(errorMessages.some((msg: string) => msg.includes('invalid quantity'))).toBe(true);
    });
  });
});
