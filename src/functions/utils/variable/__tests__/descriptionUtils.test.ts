import { describe, it, expect } from 'vitest';
import {
  extractVariableReferences,
  validateDescription,
  sanitizeDescription,
  createSearchIndex,
  highlightSearchTerms,
  formatDescriptionForDisplay,
  getVariableUsageStats,
  exportDescriptions,
  importDescriptions
} from '../descriptionUtils';

describe('descriptionUtils', () => {
  const mockVariableDefinitions = new Map([
    ['def1', { id: 'def1', name: 'test_variable', createdAt: Date.now(), updatedAt: Date.now() }],
    ['def2', { id: 'def2', name: 'another_variable', createdAt: Date.now(), updatedAt: Date.now() }]
  ]);

  describe('extractVariableReferences', () => {
    it('extracts variable references from text', () => {
      const text = 'This references [test_variable] and [another_variable]';
      const result = extractVariableReferences(text, mockVariableDefinitions);

      expect(result).toEqual(['test_variable', 'another_variable']);
    });

    it('returns empty array for no references', () => {
      const text = 'This has no variable references';
      const result = extractVariableReferences(text, mockVariableDefinitions);

      expect(result).toEqual([]);
    });

    it('filters out invalid variable names', () => {
      const text = 'This references [test_variable] and [invalid_variable]';
      const result = extractVariableReferences(text, mockVariableDefinitions);

      expect(result).toEqual(['test_variable']);
    });

    it('handles duplicate references', () => {
      const text = 'This references [test_variable] and [test_variable] again';
      const result = extractVariableReferences(text, mockVariableDefinitions);

      expect(result).toEqual(['test_variable']);
    });
  });

  describe('validateDescription', () => {
    it('validates valid description', () => {
      const result = validateDescription('This is a valid description with enough content to pass validation.');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects empty description', () => {
      const result = validateDescription('');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description cannot be empty');
    });

    it('rejects too short description', () => {
      const result = validateDescription('Short');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description must be at least 10 characters long');
    });

    it('rejects too long description', () => {
      const longText = 'a'.repeat(2001);
      const result = validateDescription(longText);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Description cannot exceed 2000 characters');
    });

    it('provides warnings for short descriptions', () => {
      const result = validateDescription('This is short but valid.');

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain('Consider adding more detail to make this description more helpful');
    });

    it('provides warnings for missing punctuation', () => {
      const result = validateDescription('This description has no punctuation marks');

      expect(result.warnings).toContain('Consider using proper punctuation to improve readability');
    });
  });

  describe('sanitizeDescription', () => {
    it('sanitizes HTML content', () => {
      const result = sanitizeDescription('Test <script>alert("xss")</script> description');

      expect(result).toBe('Test description');
    });

    it('sanitizes iframes', () => {
      const result = sanitizeDescription('Test <iframe src="evil"></iframe> description');

      expect(result).toBe('Test description');
    });

    it('removes javascript URLs', () => {
      const result = sanitizeDescription('Test javascript:alert(1) description');

      expect(result).toBe('Test alert(1) description');
    });

    it('normalizes whitespace', () => {
      const result = sanitizeDescription('Test    multiple   spaces\n\n\n\nhere');

      expect(result).toBe('Test multiple spaces here');
    });
  });

  describe('createSearchIndex', () => {
    it('creates normalized search index', () => {
      const result = createSearchIndex('Test Description with [variable]!');

      expect(result).toBe('test description with [variable]');
    });

    it('preserves brackets for variable references', () => {
      const result = createSearchIndex('[test_variable] is used here');

      expect(result).toBe('[test_variable] is used here');
    });
  });

  describe('highlightSearchTerms', () => {
    it('highlights search terms', () => {
      const result = highlightSearchTerms('This is a test description', 'test');

      expect(result).toBe('This is a <mark>test</mark> description');
    });

    it('returns original text for empty search term', () => {
      const result = highlightSearchTerms('This is a test description', '');

      expect(result).toBe('This is a test description');
    });

    it('handles case insensitive matching', () => {
      const result = highlightSearchTerms('This is a Test description', 'test');

      expect(result).toBe('This is a <mark>Test</mark> description');
    });
  });

  describe('formatDescriptionForDisplay', () => {
    it('formats bold text', () => {
      const result = formatDescriptionForDisplay('This is **bold** text');

      expect(result).toBe('This is <strong>bold</strong> text');
    });

    it('formats italic text', () => {
      const result = formatDescriptionForDisplay('This is _italic_ text');

      expect(result).toBe('This is <em>italic</em> text');
    });

    it('formats variable references', () => {
      const result = formatDescriptionForDisplay('This uses [test_variable]');

      expect(result).toBe('This uses <span class="variable-ref">test_variable</span>');
    });

    it('converts newlines to br tags', () => {
      const result = formatDescriptionForDisplay('List:\n- Item 1\n- Item 2');

      expect(result).toBe('List:<br>- Item 1<br>- Item 2');
    });
  });

  describe('getVariableUsageStats', () => {
    it('calculates usage statistics', () => {
      const text = 'Uses [var1], [var2], and [var1] again';
      const result = getVariableUsageStats(text);

      expect(result.totalReferences).toBe(3);
      expect(result.uniqueVariables).toEqual(['var1', 'var2']);
      expect(result.referenceMap.get('var1')).toBe(2);
      expect(result.referenceMap.get('var2')).toBe(1);
    });

    it('handles no references', () => {
      const text = 'No variable references here';
      const result = getVariableUsageStats(text);

      expect(result.totalReferences).toBe(0);
      expect(result.uniqueVariables).toEqual([]);
      expect(result.referenceMap.size).toBe(0);
    });
  });

  describe('exportDescriptions', () => {
    it('exports descriptions to JSON', () => {
      const descriptions = new Map([
        ['1', { content: 'Description 1', variableName: 'var1' }],
        ['2', { content: 'Description 2', variableName: 'var2' }]
      ]);

      const result = exportDescriptions(descriptions);
      const parsed = JSON.parse(result);

      expect(parsed).toHaveLength(2);
      expect(parsed[0]).toMatchObject({
        id: '1',
        variableName: 'var1',
        content: 'Description 1'
      });
      expect(parsed[0].exportedAt).toBeDefined();
    });
  });

  describe('importDescriptions', () => {
    it('imports descriptions from JSON', () => {
      const jsonData = JSON.stringify([
        { variableName: 'var1', content: 'Description 1' },
        { variableName: 'var2', content: 'Description 2' }
      ]);

      const result = importDescriptions(jsonData);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ variableName: 'var1', content: 'Description 1' });
      expect(result[1]).toEqual({ variableName: 'var2', content: 'Description 2' });
    });

    it('throws error for invalid JSON', () => {
      expect(() => importDescriptions('invalid json')).toThrow();
    });

    it('throws error for non-array data', () => {
      expect(() => importDescriptions('{"not": "array"}')).toThrow();
    });

    it('throws error for missing required fields', () => {
      const jsonData = JSON.stringify([{ variableName: 'var1' }]); // missing content

      expect(() => importDescriptions(jsonData)).toThrow();
    });

    it('sanitizes imported content', () => {
      const jsonData = JSON.stringify([
        { variableName: 'var1', content: 'Description with <script>alert("xss")</script>' }
      ]);

      const result = importDescriptions(jsonData);

      expect(result[0].content).toBe('Description with ');
    });
  });
});
