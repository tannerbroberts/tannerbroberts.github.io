import { describe, it, expect } from 'vitest';
import { parseVariableFilter, generateFilterSuggestions, operatorToString, filterToString } from '../variableFilterParser';

describe('variableFilterParser', () => {
  describe('parseVariableFilter', () => {
    it('should parse basic comparison filters', () => {
      const result1 = parseVariableFilter('eggs >= 5');
      expect(result1.isValid).toBe(true);
      expect(result1.criteria).toEqual({
        variableName: 'eggs',
        operator: 'gte',
        value: 5,
        unit: undefined
      });

      const result2 = parseVariableFilter('fat <= 10.5');
      expect(result2.isValid).toBe(true);
      expect(result2.criteria).toEqual({
        variableName: 'fat',
        operator: 'lte',
        value: 10.5,
        unit: undefined
      });

      const result3 = parseVariableFilter('protein > 20');
      expect(result3.isValid).toBe(true);
      expect(result3.criteria).toEqual({
        variableName: 'protein',
        operator: 'gt',
        value: 20,
        unit: undefined
      });
    });

    it('should parse filters with units', () => {
      const result = parseVariableFilter('milk = 2 cups');
      expect(result.isValid).toBe(true);
      expect(result.criteria).toEqual({
        variableName: 'milk',
        operator: 'eq',
        value: 2,
        unit: 'cups'
      });
    });

    it('should parse range filters', () => {
      const result1 = parseVariableFilter('eggs 5-10');
      expect(result1.isValid).toBe(true);
      expect(result1.criteria).toEqual({
        variableName: 'eggs',
        operator: 'range',
        value: 5,
        maxValue: 10,
        unit: undefined
      });

      const result2 = parseVariableFilter('fat between 5 and 15');
      expect(result2.isValid).toBe(true);
      expect(result2.criteria).toEqual({
        variableName: 'fat',
        operator: 'range',
        value: 5,
        maxValue: 15,
        unit: undefined
      });
    });

    it('should parse natural language filters', () => {
      const result1 = parseVariableFilter('at least 5 eggs');
      expect(result1.isValid).toBe(true);
      expect(result1.criteria).toEqual({
        variableName: 'eggs',
        operator: 'gte',
        value: 5,
        unit: undefined
      });

      const result2 = parseVariableFilter('more than 10 grams fat');
      expect(result2.isValid).toBe(true);
      expect(result2.criteria).toEqual({
        variableName: 'fat',
        operator: 'gt',
        value: 10,
        unit: 'grams'
      });

      const result3 = parseVariableFilter('exactly 2 cups milk');
      expect(result3.isValid).toBe(true);
      expect(result3.criteria).toEqual({
        variableName: 'milk',
        operator: 'eq',
        value: 2,
        unit: 'cups'
      });
    });

    it('should handle multi-word variable names', () => {
      const result = parseVariableFilter('olive oil >= 2');
      expect(result.isValid).toBe(true);
      expect(result.criteria?.variableName).toBe('olive oil');
    });

    it('should reject invalid syntax', () => {
      const result1 = parseVariableFilter('eggs');
      expect(result1.isValid).toBe(false);
      expect(result1.error).toContain('Invalid filter syntax');

      const result2 = parseVariableFilter('eggs >= ');
      expect(result2.isValid).toBe(false);

      const result3 = parseVariableFilter('');
      expect(result3.isValid).toBe(false);
      expect(result3.error).toContain('empty');
    });

    it('should provide suggestions for invalid syntax', () => {
      const result = parseVariableFilter('eggs greater than 5');
      expect(result.isValid).toBe(false);
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions?.some(s => s.includes('>'))).toBe(true);
    });
  });

  describe('generateFilterSuggestions', () => {
    const availableVariables = ['eggs', 'flour', 'milk', 'butter', 'olive oil'];

    it('should suggest variable names for empty input', () => {
      const suggestions = generateFilterSuggestions('', availableVariables);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.type === 'variable')).toBe(true);
      expect(suggestions.some(s => s.type === 'template')).toBe(true);
    });

    it('should suggest matching variable names', () => {
      const suggestions = generateFilterSuggestions('egg', availableVariables);
      expect(suggestions.some(s => s.text === 'eggs')).toBe(true);
    });

    it('should suggest operators for variable names', () => {
      const suggestions = generateFilterSuggestions('eggs', availableVariables);
      expect(suggestions.some(s => s.type === 'operator')).toBe(true);
    });

    it('should suggest values for partial filters', () => {
      const suggestions = generateFilterSuggestions('eggs >=', availableVariables);
      expect(suggestions.some(s => s.type === 'value')).toBe(true);
    });
  });

  describe('operatorToString', () => {
    it('should convert operators to readable strings', () => {
      expect(operatorToString('gte')).toBe('>=');
      expect(operatorToString('lte')).toBe('<=');
      expect(operatorToString('gt')).toBe('>');
      expect(operatorToString('lt')).toBe('<');
      expect(operatorToString('eq')).toBe('=');
      expect(operatorToString('ne')).toBe('!=');
      expect(operatorToString('range')).toBe('between');
    });
  });

  describe('filterToString', () => {
    it('should convert filter criteria to readable strings', () => {
      expect(filterToString({
        variableName: 'eggs',
        operator: 'gte',
        value: 5
      })).toBe('eggs >= 5');

      expect(filterToString({
        variableName: 'milk',
        operator: 'eq',
        value: 2,
        unit: 'cups'
      })).toBe('milk = 2 cups');

      expect(filterToString({
        variableName: 'fat',
        operator: 'range',
        value: 5,
        maxValue: 15,
        unit: 'grams'
      })).toBe('fat between 5 grams and 15 grams');
    });
  });
});
