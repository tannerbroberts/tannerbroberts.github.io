import { VariableDefinition } from '../item/types/VariableTypes';

/**
 * Extract variable references from description text
 * Looks for patterns like [variable_name] and returns array of variable names
 */
export function extractVariableReferences(
  text: string,
  variableDefinitions: Map<string, VariableDefinition>
): string[] {
  const matches = text.match(/\[([^\]]+)\]/g);
  if (!matches) return [];

  const referencedVariables: string[] = [];
  const allVariableNames = new Set(
    Array.from(variableDefinitions.values()).map(def => def.name)
  );

  for (const match of matches) {
    const variableName = match.slice(1, -1); // Remove brackets
    if (allVariableNames.has(variableName)) {
      referencedVariables.push(variableName);
    }
  }

  // Return unique variable names
  return [...new Set(referencedVariables)];
}

/**
 * Validate description content for quality and standards
 */
export function validateDescription(text: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (!text.trim()) {
    errors.push('Description cannot be empty');
    return { isValid: false, errors, warnings };
  }

  if (text.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  if (text.length > 2000) {
    errors.push('Description cannot exceed 2000 characters');
  }

  // Quality checks
  if (text.trim().length < 50) {
    warnings.push('Consider adding more detail to make this description more helpful');
  }

  if (!text.includes('.') && !text.includes('!') && !text.includes('?')) {
    warnings.push('Consider using proper punctuation to improve readability');
  }

  const wordCount = text.trim().split(/\s+/).length;
  if (wordCount < 5) {
    warnings.push('Very short description - consider expanding with more details');
  }

  // Check for potential variable references that aren't properly formatted
  const potentialRefs = text.match(/\b[a-z_]+[a-z0-9_]*\b/gi);
  if (potentialRefs) {
    const unformattedRefs = potentialRefs.filter(ref =>
      ref.includes('_') && !text.includes(`[${ref}]`)
    );
    if (unformattedRefs.length > 0) {
      warnings.push('Consider using [brackets] around variable names for cross-linking');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Sanitize description text to prevent XSS and ensure clean content
 */
export function sanitizeDescription(text: string): string {
  return text
    .trim()
    // Remove potentially dangerous HTML tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n'); // Normalize multiple newlines
}

/**
 * Create search index for description content
 * Returns normalized text for efficient searching
 */
export function createSearchIndex(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s[\]]/g, ' ') // Keep brackets for variable references
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Highlight search terms in description text
 * Returns HTML with highlighted matches
 */
export function highlightSearchTerms(text: string, searchTerm: string): string {
  if (!searchTerm.trim()) return text;

  const regex = new RegExp(
    `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi'
  );

  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Format description for display with basic markdown-like formatting
 */
export function formatDescriptionForDisplay(text: string): string {
  return text
    // Bold formatting
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic formatting
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Variable references
    .replace(/\[([^\]]+)\]/g, '<span class="variable-ref">$1</span>')
    // Convert newlines to breaks
    .replace(/\n/g, '<br>')
    // Handle bullet points
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
}

/**
 * Extract variable usage statistics from description
 */
export function getVariableUsageStats(text: string): {
  totalReferences: number;
  uniqueVariables: string[];
  referenceMap: Map<string, number>;
} {
  const matches = text.match(/\[([^\]]+)\]/g);
  if (!matches) {
    return {
      totalReferences: 0,
      uniqueVariables: [],
      referenceMap: new Map()
    };
  }

  const referenceMap = new Map<string, number>();

  for (const match of matches) {
    const variableName = match.slice(1, -1);
    referenceMap.set(variableName, (referenceMap.get(variableName) || 0) + 1);
  }

  return {
    totalReferences: matches.length,
    uniqueVariables: Array.from(referenceMap.keys()),
    referenceMap
  };
}

/**
 * Export description data for backup/import
 */
export function exportDescriptions(
  descriptions: Map<string, { content: string; variableName: string }>
): string {
  const exportData = Array.from(descriptions.entries()).map(([id, desc]) => ({
    id,
    variableName: desc.variableName,
    content: desc.content,
    exportedAt: new Date().toISOString()
  }));

  return JSON.stringify(exportData, null, 2);
}

/**
 * Import description data from exported JSON
 */
export function importDescriptions(jsonData: string): Array<{
  variableName: string;
  content: string;
}> {
  try {
    const data = JSON.parse(jsonData);
    if (!Array.isArray(data)) {
      throw new Error('Invalid format: expected array');
    }

    return data.map(item => {
      if (!item.variableName || !item.content) {
        throw new Error('Invalid format: missing variableName or content');
      }
      return {
        variableName: item.variableName,
        content: sanitizeDescription(item.content)
      };
    });
  } catch (error) {
    throw new Error(`Failed to import descriptions: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
