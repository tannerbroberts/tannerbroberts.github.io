import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveVariableDefinitionsToStorage,
  loadVariableDefinitionsFromStorage,
  saveVariableDescriptionsToStorage,
  loadVariableDescriptionsFromStorage
} from '../localStorageService';
import {
  serializeVariableDefinitions,
  deserializeVariableDefinitions,
  serializeVariableDescriptions,
  deserializeVariableDescriptions
} from '../variableStorageUtils';
import type { VariableDefinition, VariableDescription } from '../../functions/utils/item/types/VariableTypes';

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem(key: string) {
    return this.store[key] || null;
  },
  setItem(key: string, value: string) {
    this.store[key] = value;
  },
  removeItem(key: string) {
    delete this.store[key];
  },
  clear() {
    this.store = {};
  }
};

vi.stubGlobal('localStorage', localStorageMock);

describe('Variable Storage Functions', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Variable Definitions Storage', () => {
    it('should save and load variable definitions', () => {
      const definitions = new Map<string, VariableDefinition>();
      const definition: VariableDefinition = {
        id: 'def-1',
        name: 'Test Variable',
        unit: 'kg',
        category: 'test',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      definitions.set('def-1', definition);

      // Save definitions
      const saveResult = saveVariableDefinitionsToStorage(definitions);
      expect(saveResult.success).toBe(true);

      // Load definitions
      const loadResult = loadVariableDefinitionsFromStorage();
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toBeDefined();
      expect(loadResult.data!.size).toBe(1);

      const loadedDefinition = loadResult.data!.get('def-1');
      expect(loadedDefinition).toBeDefined();
      expect(loadedDefinition!.name).toBe('Test Variable');
      expect(loadedDefinition!.unit).toBe('kg');
      expect(loadedDefinition!.category).toBe('test');
    });

    it('should return empty map when no definitions stored', () => {
      const loadResult = loadVariableDefinitionsFromStorage();
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toBeDefined();
      expect(loadResult.data!.size).toBe(0);
    });

    it('should handle corrupted definition data', () => {
      // Manually set invalid data
      localStorageMock.setItem('atp_variable_definitions', 'invalid json');

      const loadResult = loadVariableDefinitionsFromStorage();
      expect(loadResult.success).toBe(false);
      expect(loadResult.error).toContain('Failed to load variable definitions');
    });
  });

  describe('Variable Descriptions Storage', () => {
    it('should save and load variable descriptions', () => {
      const descriptions = new Map<string, VariableDescription>();
      const description: VariableDescription = {
        id: 'desc-1',
        variableDefinitionId: 'def-1',
        content: 'Test description content',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      descriptions.set('desc-1', description);

      // Save descriptions
      const saveResult = saveVariableDescriptionsToStorage(descriptions);
      expect(saveResult.success).toBe(true);

      // Load descriptions
      const loadResult = loadVariableDescriptionsFromStorage();
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toBeDefined();
      expect(loadResult.data!.size).toBe(1);

      const loadedDescription = loadResult.data!.get('desc-1');
      expect(loadedDescription).toBeDefined();
      expect(loadedDescription!.variableDefinitionId).toBe('def-1');
      expect(loadedDescription!.content).toBe('Test description content');
    });

    it('should return empty map when no descriptions stored', () => {
      const loadResult = loadVariableDescriptionsFromStorage();
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toBeDefined();
      expect(loadResult.data!.size).toBe(0);
    });

    it('should handle corrupted description data', () => {
      // Manually set invalid data
      localStorageMock.setItem('atp_variable_descriptions', 'invalid json');

      const loadResult = loadVariableDescriptionsFromStorage();
      expect(loadResult.success).toBe(false);
      expect(loadResult.error).toContain('Failed to load variable descriptions');
    });
  });

  describe('Serialization Functions', () => {
    it('should serialize and deserialize variable definitions correctly', () => {
      const definitions = new Map<string, VariableDefinition>();
      const definition: VariableDefinition = {
        id: 'def-1',
        name: 'Test Variable',
        unit: 'kg',
        category: 'test',
        createdAt: 1234567890,
        updatedAt: 1234567891
      };
      definitions.set('def-1', definition);

      const serialized = serializeVariableDefinitions(definitions);
      expect(Array.isArray(serialized)).toBe(true);
      expect(serialized.length).toBe(1);
      expect(serialized[0][0]).toBe('def-1');
      expect(serialized[0][1].name).toBe('Test Variable');

      const deserialized = deserializeVariableDefinitions(serialized);
      expect(deserialized.size).toBe(1);
      const deserializedDef = deserialized.get('def-1');
      expect(deserializedDef).toBeDefined();
      expect(deserializedDef!.name).toBe('Test Variable');
      expect(deserializedDef!.unit).toBe('kg');
    });

    it('should serialize and deserialize variable descriptions correctly', () => {
      const descriptions = new Map<string, VariableDescription>();
      const description: VariableDescription = {
        id: 'desc-1',
        variableDefinitionId: 'def-1',
        content: 'Test description',
        createdAt: 1234567890,
        updatedAt: 1234567891
      };
      descriptions.set('desc-1', description);

      const serialized = serializeVariableDescriptions(descriptions);
      expect(Array.isArray(serialized)).toBe(true);
      expect(serialized.length).toBe(1);
      expect(serialized[0][0]).toBe('desc-1');
      expect(serialized[0][1].content).toBe('Test description');

      const deserialized = deserializeVariableDescriptions(serialized);
      expect(deserialized.size).toBe(1);
      const deserializedDesc = deserialized.get('desc-1');
      expect(deserializedDesc).toBeDefined();
      expect(deserializedDesc!.variableDefinitionId).toBe('def-1');
      expect(deserializedDesc!.content).toBe('Test description');
    });
  });
});
