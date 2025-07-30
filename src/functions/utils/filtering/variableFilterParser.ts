import { FilterParseResult, VariableFilterCriteria, FilterSuggestion } from './filterTypes';

/**
 * Natural language patterns for variable filter parsing
 */
const FILTER_PATTERNS = [
  // Basic patterns: "eggs >= 5", "fat <= 10"
  {
    regex: /^([a-zA-Z\s]+)\s*(>=|<=|>|<|=|!=)\s*(\d+(?:\.\d+)?)\s*(.+)?$/,
    parse: (match: RegExpMatchArray): VariableFilterCriteria => ({
      variableName: match[1].trim(),
      operator: operatorMap[match[2]],
      value: parseFloat(match[3]),
      unit: match[4]?.trim()
    })
  },
  // Range patterns: "eggs 5-10", "fat between 5 and 10"
  {
    regex: /^([a-zA-Z\s]+)\s+(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)\s*(.+)?$/,
    parse: (match: RegExpMatchArray): VariableFilterCriteria => ({
      variableName: match[1].trim(),
      operator: 'range',
      value: parseFloat(match[2]),
      maxValue: parseFloat(match[3]),
      unit: match[4]?.trim()
    })
  },
  {
    regex: /^([a-zA-Z ]+)\s+between\s+(\d+(?:\.\d+)?)\s+and\s+(\d+(?:\.\d+)?)\s*(.+)?$/i,
    parse: (match: RegExpMatchArray): VariableFilterCriteria => ({
      variableName: match[1].trim(),
      operator: 'range',
      value: parseFloat(match[2]),
      maxValue: parseFloat(match[3]),
      unit: match[4]?.trim()
    })
  },
  // Natural language patterns: "at least 5 eggs", "more than 10 grams fat"
  {
    regex: /^(?:at least|minimum)\s+(\d+(?:\.\d+)?)\s+([a-zA-Z ]+)\s*(.+)?$/i,
    parse: (match: RegExpMatchArray): VariableFilterCriteria => ({
      variableName: match[2].trim(),
      operator: 'gte',
      value: parseFloat(match[1]),
      unit: match[3]?.trim()
    })
  },
  {
    regex: /^(?:at most|maximum)\s+(\d+(?:\.\d+)?)\s+([a-zA-Z ]+)\s*(.+)?$/i,
    parse: (match: RegExpMatchArray): VariableFilterCriteria => ({
      variableName: match[2].trim(),
      operator: 'lte',
      value: parseFloat(match[1]),
      unit: match[3]?.trim()
    })
  },
  {
    regex: /^(?:more than|greater than)\s+(\d+(?:\.\d+)?)\s+([a-zA-Z]+)\s+([\w ]+)$/i,
    parse: (match: RegExpMatchArray): VariableFilterCriteria => ({
      variableName: match[3].trim(),
      operator: 'gt',
      value: parseFloat(match[1]),
      unit: match[2].trim()
    })
  },
  {
    regex: /^(?:less than)\s+(\d+(?:\.\d+)?)\s+([a-zA-Z]+)\s+([\w ]+)$/i,
    parse: (match: RegExpMatchArray): VariableFilterCriteria => ({
      variableName: match[3].trim(),
      operator: 'lt',
      value: parseFloat(match[1]),
      unit: match[2].trim()
    })
  },
  {
    regex: /^(?:exactly)\s+(\d+(?:\.\d+)?)\s+([a-zA-Z]+)\s+([\w ]+)$/i,
    parse: (match: RegExpMatchArray): VariableFilterCriteria => ({
      variableName: match[3].trim(),
      operator: 'eq',
      value: parseFloat(match[1]),
      unit: match[2].trim()
    })
  }
];

/**
 * Operator mapping from string to FilterOperator
 */
const operatorMap: Record<string, VariableFilterCriteria['operator']> = {
  '>=': 'gte',
  '<=': 'lte',
  '>': 'gt',
  '<': 'lt',
  '=': 'eq',
  '==': 'eq',
  '!=': 'ne',
  '<>': 'ne'
};

/**
 * Parse natural language variable filter queries
 */
export function parseVariableFilter(query: string): FilterParseResult {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return {
      isValid: false,
      error: 'Filter query cannot be empty'
    };
  }

  // Try each pattern until one matches
  for (const pattern of FILTER_PATTERNS) {
    const match = pattern.regex.exec(trimmedQuery);
    if (match) {
      try {
        const criteria = pattern.parse(match);

        // Validate the parsed criteria
        const validation = validateFilterCriteria(criteria);
        if (!validation.isValid) {
          return {
            isValid: false,
            error: validation.error,
            suggestions: validation.suggestions
          };
        }

        return {
          isValid: true,
          criteria
        };
      } catch (error) {
        return {
          isValid: false,
          error: `Failed to parse filter: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
      }
    }
  }

  // No pattern matched
  return {
    isValid: false,
    error: 'Invalid filter syntax. Try patterns like "eggs >= 5" or "fat <= 10 grams"',
    suggestions: generateSyntaxSuggestions(trimmedQuery)
  };
}

/**
 * Validate filter criteria
 */
function validateFilterCriteria(criteria: VariableFilterCriteria): {
  isValid: boolean;
  error?: string;
  suggestions?: string[];
} {
  // Validate variable name
  if (!criteria.variableName || criteria.variableName.length === 0) {
    return {
      isValid: false,
      error: 'Variable name cannot be empty'
    };
  }

  // Validate value
  if (isNaN(criteria.value) || !isFinite(criteria.value)) {
    return {
      isValid: false,
      error: 'Filter value must be a valid number'
    };
  }

  // Validate range values
  if (criteria.operator === 'range') {
    if (!criteria.maxValue || isNaN(criteria.maxValue) || !isFinite(criteria.maxValue)) {
      return {
        isValid: false,
        error: 'Range filter requires a valid maximum value'
      };
    }

    if (criteria.value >= criteria.maxValue) {
      return {
        isValid: false,
        error: 'Range minimum must be less than maximum'
      };
    }
  }

  // Validate negative values for certain operators
  if (criteria.value < 0 && ['gt', 'gte'].includes(criteria.operator)) {
    return {
      isValid: false,
      error: 'Negative values may not make sense with "greater than" operators',
      suggestions: ['Consider using "less than" operators for negative values']
    };
  }

  return { isValid: true };
}

/**
 * Generate syntax suggestions for invalid queries
 */
function generateSyntaxSuggestions(query: string): string[] {
  const suggestions: string[] = [];

  // Look for common patterns that might be typos
  if (query.includes('greater than')) {
    suggestions.push('Try using ">" or ">=" instead of "greater than"');
  }

  if (query.includes('less than')) {
    suggestions.push('Try using "<" or "<=" instead of "less than"');
  }

  if (query.includes('equals')) {
    suggestions.push('Try using "=" instead of "equals"');
  }

  // Check for missing operators
  const hasNumber = /\d/.test(query);
  const hasOperator = /[><=!]/.test(query);

  if (hasNumber && !hasOperator) {
    suggestions.push('Add an operator like ">", "<", ">=", "<=", or "="');
  }

  // Common examples
  suggestions.push(
    'Examples: "eggs >= 5", "fat <= 10", "milk = 2 cups"',
    'Range examples: "eggs 5-10", "fat between 5 and 10"',
    'Natural language: "at least 5 eggs", "more than 10 grams fat"'
  );

  return suggestions;
}

/**
 * Generate auto-complete suggestions for filter input
 */
export function generateFilterSuggestions(
  input: string,
  availableVariables: string[]
): FilterSuggestion[] {
  const suggestions: FilterSuggestion[] = [];
  const trimmedInput = input.trim().toLowerCase();

  if (!trimmedInput) {
    // Show common variable names and templates
    availableVariables.slice(0, 10).forEach(variableName => {
      suggestions.push({
        type: 'variable',
        text: variableName,
        description: `Filter by ${variableName}`,
        insertText: `${variableName} >= `
      });
    });

    // Add common templates
    suggestions.push(
      {
        type: 'template',
        text: 'Low fat items',
        description: 'Items with fat content <= 5',
        insertText: 'fat <= 5'
      },
      {
        type: 'template',
        text: 'High protein items',
        description: 'Items with protein >= 20',
        insertText: 'protein >= 20'
      },
      {
        type: 'template',
        text: 'Items with eggs',
        description: 'Items containing eggs',
        insertText: 'eggs > 0'
      }
    );
  } else {
    // Variable name suggestions
    const matchingVariables = availableVariables.filter(name =>
      name.toLowerCase().includes(trimmedInput)
    );

    matchingVariables.slice(0, 5).forEach(variableName => {
      suggestions.push({
        type: 'variable',
        text: variableName,
        description: `Filter by ${variableName}`
      });
    });

    // Operator suggestions if input looks like a variable name
    if (matchingVariables.length > 0 && !trimmedInput.includes(' ')) {
      ['>=', '<=', '>', '<', '=', '!='].forEach(op => {
        suggestions.push({
          type: 'operator',
          text: op,
          description: `${trimmedInput} ${op} value`
        });
      });
    }

    // Value suggestions for common ranges
    if (trimmedInput.includes('>=') || trimmedInput.includes('<=')) {
      ['0', '1', '5', '10', '20', '50', '100'].forEach(value => {
        suggestions.push({
          type: 'value',
          text: value,
          description: `Use ${value} as filter value`
        });
      });
    }
  }

  return suggestions;
}

/**
 * Convert FilterOperator to human-readable string
 */
export function operatorToString(operator: VariableFilterCriteria['operator']): string {
  const operatorStrings = {
    'eq': '=',
    'gt': '>',
    'gte': '>=',
    'lt': '<',
    'lte': '<=',
    'ne': '!=',
    'range': 'between'
  };

  return operatorStrings[operator] || operator;
}

/**
 * Convert filter criteria to human-readable string
 */
export function filterToString(criteria: VariableFilterCriteria): string {
  const { variableName, operator, value, maxValue, unit } = criteria;
  const unitStr = unit ? ` ${unit}` : '';

  if (operator === 'range') {
    return `${variableName} between ${value}${unitStr} and ${maxValue}${unitStr}`;
  }

  return `${variableName} ${operatorToString(operator)} ${value}${unitStr}`;
}
