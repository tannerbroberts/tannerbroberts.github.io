import { describe, it, expect } from 'vitest';
import { VariableImpl } from '../types';
import { parseVariableFromString, formatVariableForDisplay, groupVariablesByCategory } from '../utils';

describe('Variable', () => {
  it('should create a variable with normalized name', () => {
    const variable = new VariableImpl({
      name: '  EGG  ',
      quantity: 2,
      unit: 'piece'
    });

    expect(variable.name).toBe('egg'); // Should be trimmed and lowercase
    expect(variable.quantity).toBe(2);
    expect(variable.unit).toBe('piece');
    expect(variable.type).toBe('variable');
  });

  it('should combine variables of the same name', () => {
    const var1 = new VariableImpl({ name: 'egg', quantity: 2 });
    const var2 = new VariableImpl({ name: 'egg', quantity: -1 });

    const combined = var1.combine(var2);

    expect(combined.name).toBe('egg');
    expect(combined.quantity).toBe(1);
  });

  it('should throw error when combining variables with different names', () => {
    const var1 = new VariableImpl({ name: 'egg', quantity: 2 });
    const var2 = new VariableImpl({ name: 'flour', quantity: 1 });

    expect(() => var1.combine(var2)).toThrow('Cannot combine variables with different names');
  });

  it('should serialize and deserialize correctly', () => {
    const variable = new VariableImpl({
      name: 'flour',
      quantity: 2.5,
      unit: 'cup',
      category: 'baking'
    });

    const json = variable.toJSON();
    const restored = VariableImpl.fromJSON(json);

    expect(restored.name).toBe(variable.name);
    expect(restored.quantity).toBe(variable.quantity);
    expect(restored.unit).toBe(variable.unit);
    expect(restored.category).toBe(variable.category);
  });
});

describe('parseVariableFromString', () => {
  it('should parse positive quantity without unit', () => {
    const variable = parseVariableFromString('2 eggs');

    expect(variable).toBeTruthy();
    expect(variable!.name).toBe('eggs');
    expect(variable!.quantity).toBe(2);
    expect(variable!.unit).toBeUndefined();
  });

  it('should parse negative quantity with unit', () => {
    const variable = parseVariableFromString('-1.5 flour cup');

    expect(variable).toBeTruthy();
    expect(variable!.name).toBe('flour');
    expect(variable!.quantity).toBe(-1.5);
    expect(variable!.unit).toBe('cup');
  });

  it('should parse with explicit positive sign', () => {
    const variable = parseVariableFromString('+3 sugar tsp');

    expect(variable).toBeTruthy();
    expect(variable!.name).toBe('sugar');
    expect(variable!.quantity).toBe(3);
    expect(variable!.unit).toBe('tsp');
  });

  it('should return null for invalid format', () => {
    expect(parseVariableFromString('invalid')).toBeNull();
    expect(parseVariableFromString('eggs 2')).toBeNull();
    expect(parseVariableFromString('')).toBeNull();
  });
});

describe('formatVariableForDisplay', () => {
  it('should format positive quantity without unit', () => {
    const variable = new VariableImpl({ name: 'eggs', quantity: 2 });
    expect(formatVariableForDisplay(variable)).toBe('+2 eggs');
  });

  it('should format negative quantity with unit', () => {
    const variable = new VariableImpl({ name: 'flour', quantity: -1.5, unit: 'cup' });
    expect(formatVariableForDisplay(variable)).toBe('-1.5 cup flour');
  });

  it('should format zero quantity', () => {
    const variable = new VariableImpl({ name: 'salt', quantity: 0, unit: 'tsp' });
    expect(formatVariableForDisplay(variable)).toBe('+0 tsp salt');
  });
});

describe('groupVariablesByCategory', () => {
  it('should group variables by category', () => {
    const variables = [
      new VariableImpl({ name: 'flour', quantity: 2, category: 'baking' }),
      new VariableImpl({ name: 'egg', quantity: 1, category: 'protein' }),
      new VariableImpl({ name: 'sugar', quantity: 1, category: 'baking' }),
      new VariableImpl({ name: 'salt', quantity: 0.5 }) // No category
    ];

    const grouped = groupVariablesByCategory(variables);

    expect(grouped.baking).toHaveLength(2);
    expect(grouped.protein).toHaveLength(1);
    expect(grouped.uncategorized).toHaveLength(1);
    expect(grouped.baking.map(v => v.name)).toEqual(['flour', 'sugar']);
  });
});
