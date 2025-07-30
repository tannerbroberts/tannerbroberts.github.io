/**
 * Type definitions for variable filter system
 */

// Filter operators for variable comparisons
export type FilterOperator = 'eq' | 'gt' | 'gte' | 'lt' | 'lte' | 'ne' | 'range';

// Variable filter criteria
export interface VariableFilterCriteria {
  readonly variableName: string;
  readonly operator: FilterOperator;
  readonly value: number;
  readonly maxValue?: number; // For range operator
  readonly unit?: string;
  readonly category?: string;
}

// Combined filter criteria (name + variable filters)
export interface FilterCriteria {
  readonly nameFilter?: string;
  readonly variableFilters: VariableFilterCriteria[];
  readonly combineMode: 'AND' | 'OR'; // How to combine multiple variable filters
}

// Filter result metadata
export interface FilterResult {
  readonly itemId: string;
  readonly matchedFilters: string[]; // Which filters matched
  readonly variableValues: Record<string, number>; // Variable values for this item
}

// Filter parsing result
export interface FilterParseResult {
  readonly isValid: boolean;
  readonly criteria?: VariableFilterCriteria;
  readonly error?: string;
  readonly suggestions?: string[];
}

// Saved filter for persistence
export interface SavedFilter {
  readonly id: string;
  readonly name: string;
  readonly criteria: FilterCriteria;
  readonly createdAt: number;
  readonly lastUsed: number;
  readonly useCount: number;
}

// Filter state for UI management
export interface VariableFilterState {
  readonly activeFilters: FilterCriteria;
  readonly savedFilters: SavedFilter[];
  readonly recentFilters: FilterCriteria[];
  readonly isEnabled: boolean;
}

// Filter validation result
export interface FilterValidationResult {
  readonly isValid: boolean;
  readonly errors: string[];
  readonly warnings: string[];
}

// Auto-complete suggestion for filters
export interface FilterSuggestion {
  readonly type: 'variable' | 'operator' | 'value' | 'template';
  readonly text: string;
  readonly description?: string;
  readonly insertText?: string;
}

// Filter performance metrics
export interface FilterPerformanceMetrics {
  readonly executionTime: number;
  readonly itemsEvaluated: number;
  readonly itemsFiltered: number;
  readonly cacheHits: number;
  readonly cacheMisses: number;
}
