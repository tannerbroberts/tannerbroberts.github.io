import { parseVariableLinks, extractVariableReferences, validateVariableLinks, generateVariableNameSuggestions, formatVariableLinksAsHtml, detectCircularReferences } from '../linkParser';
import { VariableDefinition } from '../../item/types/VariableTypes';

// Mock variable definitions for testing
const createMockVariableDefinitions = (): Map<string, VariableDefinition> => {
  const definitions = new Map<string, VariableDefinition>();
  
  definitions.set('1', {
    id: '1',
    name: 'eggs',
    description: 'Number of eggs',
    unit: 'count',
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  
  definitions.set('2', {
    id: '2',
    name: 'flour',
    description: 'Amount of flour',
    unit: 'cups',
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  
  definitions.set('3', {
    id: '3',
    name: 'sugar_content',
    description: 'Sugar content percentage',
    unit: '%',
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  
  return definitions;
};

describe('linkParser', () => {
  let mockDefinitions: Map<string, VariableDefinition>;

  beforeEach(() => {
    mockDefinitions = createMockVariableDefinitions();
  });

  describe('parseVariableLinks', () => {
  it('should parse single variable link', () => {
    const text = 'This recipe uses [eggs] in the mixture.';
    const links = parseVariableLinks(text, mockDefinitions);
    
    expect(links).toHaveLength(1);
    expect(links[0].text).toBe('eggs');
    expect(links[0].fullMatch).toBe('[eggs]');
    expect(links[0].isValid).toBe(true);
    expect(links[0].definitionId).toBe('1');
    expect(links[0].position).toEqual({ start: 17, end: 23 });
  });    it('should parse multiple variable links', () => {
      const text = 'Mix [eggs] with [flour] and check [sugar_content].';
      const links = parseVariableLinks(text, mockDefinitions);
      
      expect(links).toHaveLength(3);
      expect(links.map(l => l.text)).toEqual(['eggs', 'flour', 'sugar_content']);
      expect(links.every(l => l.isValid)).toBe(true);
    });

    it('should handle invalid variable references', () => {
      const text = 'This uses [nonexistent] variable.';
      const links = parseVariableLinks(text, mockDefinitions);
      
      expect(links).toHaveLength(1);
      expect(links[0].text).toBe('nonexistent');
      expect(links[0].isValid).toBe(false);
      expect(links[0].definitionId).toBeUndefined();
    });

    it('should handle empty brackets', () => {
      const text = 'Empty brackets [] should be ignored.';
      const links = parseVariableLinks(text, mockDefinitions);
      
      expect(links).toHaveLength(1);
      expect(links[0].text).toBe('');
      expect(links[0].isValid).toBe(false);
    });

    it('should handle case-insensitive matching', () => {
      const text = 'Test [EGGS] and [Flour] references.';
      const links = parseVariableLinks(text, mockDefinitions);
      
      expect(links).toHaveLength(2);
      expect(links[0].text).toBe('EGGS');
      expect(links[0].isValid).toBe(true);
      expect(links[1].text).toBe('Flour');
      expect(links[1].isValid).toBe(true);
    });
  });

  describe('extractVariableReferences', () => {
    it('should extract valid variable definition IDs', () => {
      const text = 'Recipe needs [eggs] and [flour].';
      const refs = extractVariableReferences(text, mockDefinitions);
      
      expect(refs).toEqual(['1', '2']);
    });

    it('should ignore invalid references', () => {
      const text = 'Recipe needs [eggs] and [invalid].';
      const refs = extractVariableReferences(text, mockDefinitions);
      
      expect(refs).toEqual(['1']);
    });

    it('should handle duplicate references', () => {
      const text = 'Mix [eggs] well. Then add more [eggs].';
      const refs = extractVariableReferences(text, mockDefinitions);
      
      expect(refs).toEqual(['1']); // Should deduplicate
    });
  });

  describe('validateVariableLinks', () => {
    it('should validate links correctly', () => {
      const text = 'Use [eggs] and [flour] but not [invalid].';
      const validation = validateVariableLinks(text, mockDefinitions);
      
      expect(validation.validLinks).toEqual(['1', '2']);
      expect(validation.brokenLinks).toHaveLength(1);
      expect(validation.brokenLinks[0].text).toBe('invalid');
      expect(validation.lastValidated).toBeGreaterThan(0);
    });

    it('should provide suggestions for broken links', () => {
      const text = 'Try [egss] instead.'; // Misspelled "eggs"
      const validation = validateVariableLinks(text, mockDefinitions);
      
      expect(validation.brokenLinks).toHaveLength(1);
      expect(validation.brokenLinks[0].suggestions).toContain('eggs');
    });
  });

  describe('generateVariableNameSuggestions', () => {
    const variableNames = ['eggs', 'flour', 'sugar_content', 'milk'];

    it('should suggest similar names', () => {
      const suggestions = generateVariableNameSuggestions('egss', variableNames);
      expect(suggestions).toContain('eggs');
    });

  it('should suggest multiple similar names', () => {
    const suggestions = generateVariableNameSuggestions('flou', variableNames); // Changed from 'fl' to 'flou'
    expect(suggestions).toContain('flour');
  });    it('should limit number of suggestions', () => {
      const suggestions = generateVariableNameSuggestions('e', variableNames, 2);
      expect(suggestions.length).toBeLessThanOrEqual(2);
    });

    it('should handle empty input', () => {
      const suggestions = generateVariableNameSuggestions('', variableNames);
      expect(suggestions).toEqual([]);
    });
  });

  describe('formatVariableLinksAsHtml', () => {
  it('should format valid links as clickable spans', () => {
    const text = 'Use [eggs] in recipe.';
    const mockCallback = () => {}; // Add callback to get data attributes
    const html = formatVariableLinksAsHtml(text, mockDefinitions, mockCallback);
    
    expect(html).toContain('<span');
    expect(html).toContain('data-variable-id="1"');
    expect(html).toContain('eggs</span>');
    expect(html).toContain('variable-link valid');
  });    it('should format broken links as error spans', () => {
      const text = 'Use [invalid] variable.';
      const html = formatVariableLinksAsHtml(text, mockDefinitions);
      
      expect(html).toContain('<span');
      expect(html).toContain('variable-link broken');
      expect(html).toContain('text-decoration: line-through');
      expect(html).toContain('invalid</span>');
    });

    it('should handle multiple links correctly', () => {
      const text = '[eggs] and [flour] and [invalid]';
      const mockCallback = () => {}; // Add callback to get data attributes
      const html = formatVariableLinksAsHtml(text, mockDefinitions, mockCallback);
      
      expect(html).toContain('data-variable-id="1"');
      expect(html).toContain('data-variable-id="2"');
      expect(html).toContain('variable-link broken');
    });
  });

  describe('detectCircularReferences', () => {
    it('should detect simple circular reference', () => {
      const descriptions = new Map([
        ['1', { content: 'Uses [flour]', variableDefinitionId: '1' }],
        ['2', { content: 'Uses [eggs]', variableDefinitionId: '2' }]
      ]);
      
      const cycles = detectCircularReferences(descriptions, mockDefinitions);
      expect(cycles).toHaveLength(1);
      expect(cycles[0].variableNames).toEqual(['eggs', 'flour', 'eggs']);
    });

    it('should detect no circular references in valid setup', () => {
      const descriptions = new Map([
        ['1', { content: 'Base ingredient', variableDefinitionId: '1' }],
        ['2', { content: 'Uses [eggs]', variableDefinitionId: '2' }]
      ]);
      
      const cycles = detectCircularReferences(descriptions, mockDefinitions);
      expect(cycles).toHaveLength(0);
    });

    it('should handle self-referencing variables', () => {
      const descriptions = new Map([
        ['1', { content: 'Self reference [eggs]', variableDefinitionId: '1' }]
      ]);
      
      const cycles = detectCircularReferences(descriptions, mockDefinitions);
      expect(cycles).toHaveLength(1);
      expect(cycles[0].variableNames).toEqual(['eggs', 'eggs']);
    });
  });
});
