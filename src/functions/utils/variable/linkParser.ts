import { VariableDefinition, BrokenLink, LinkValidationResult } from '../item/types/VariableTypes';

/**
 * Interface for parsed variable link
 */
export interface ParsedVariableLink {
  readonly text: string; // The variable name inside brackets
  readonly fullMatch: string; // The full [variable_name] string
  readonly position: { start: number; end: number };
  readonly isValid: boolean;
  readonly definitionId?: string; // ID of the matching variable definition
}

/**
 * Parse square bracket notation in description text
 * Extracts [variable_name] references and validates them
 */
export function parseVariableLinks(
  text: string,
  variableDefinitions: Map<string, VariableDefinition>
): ParsedVariableLink[] {
  const links: ParsedVariableLink[] = [];
  const regex = /\[([^\]]*)\]/g; // Changed from [^\]]+ to [^\]]* to allow empty brackets
  let match;

  // Create a map of variable names to their definitions for fast lookup
  const nameToDefinition = new Map<string, VariableDefinition>();
  variableDefinitions.forEach(def => {
    nameToDefinition.set(def.name.toLowerCase(), def);
  });

  while ((match = regex.exec(text)) !== null) {
    const fullMatch = match[0];
    const variableName = match[1];
    const start = match.index;
    const end = match.index + fullMatch.length;

    // Look for matching variable definition (case-insensitive)
    const definition = nameToDefinition.get(variableName.toLowerCase());

    links.push({
      text: variableName,
      fullMatch,
      position: { start, end },
      isValid: Boolean(definition),
      definitionId: definition?.id
    });
  }

  return links;
}

/**
 * Extract unique variable references from description text
 */
export function extractVariableReferences(
  text: string,
  variableDefinitions: Map<string, VariableDefinition>
): string[] {
  const links = parseVariableLinks(text, variableDefinitions);
  const validDefinitionIds = links
    .filter(link => link.isValid && link.definitionId)
    .map(link => link.definitionId!);

  return [...new Set(validDefinitionIds)];
}

/**
 * Validate variable links in description text
 */
export function validateVariableLinks(
  text: string,
  variableDefinitions: Map<string, VariableDefinition>
): LinkValidationResult {
  const links = parseVariableLinks(text, variableDefinitions);
  const validLinks: string[] = [];
  const brokenLinks: BrokenLink[] = [];

  // Create array of all variable names for suggestions
  const allVariableNames = Array.from(variableDefinitions.values()).map(def => def.name);

  links.forEach(link => {
    if (link.isValid && link.definitionId) {
      validLinks.push(link.definitionId);
    } else {
      // Generate suggestions for broken links
      const suggestions = generateVariableNameSuggestions(link.text, allVariableNames);

      brokenLinks.push({
        text: link.text,
        suggestions,
        position: link.position
      });
    }
  });

  return {
    validLinks: [...new Set(validLinks)],
    brokenLinks,
    lastValidated: Date.now()
  };
}

/**
 * Generate suggestions for misspelled variable names using edit distance
 */
export function generateVariableNameSuggestions(
  input: string,
  availableNames: string[],
  maxSuggestions: number = 3
): string[] {
  if (!input.trim()) return [];

  const inputLower = input.toLowerCase();
  const suggestions: Array<{ name: string; distance: number }> = [];

  availableNames.forEach(name => {
    const distance = calculateLevenshteinDistance(inputLower, name.toLowerCase());
    const maxDistance = Math.max(2, Math.floor(input.length * 0.3)); // Allow up to 30% difference

    if (distance <= maxDistance) {
      suggestions.push({ name, distance });
    }
  });

  // Sort by distance and return top suggestions
  suggestions.sort((a, b) => a.distance - b.distance);
  return suggestions
    .slice(0, maxSuggestions)
    .map(s => s.name);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function calculateLevenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Replace variable links in text with formatted HTML
 */
export function formatVariableLinksAsHtml(
  text: string,
  variableDefinitions: Map<string, VariableDefinition>,
  onVariableClick?: (definitionId: string) => void
): string {
  const links = parseVariableLinks(text, variableDefinitions);
  let result = text;

  // Process links in reverse order to maintain position accuracy
  const sortedLinks = [...links].sort((a, b) => b.position.start - a.position.start);

  sortedLinks.forEach(link => {
    const { position, isValid, definitionId } = link;
    const start = position.start;
    const end = position.end;

    let replacement: string;

    if (isValid && definitionId) {
      // Valid link - make it clickable if callback provided
      const clickHandler = onVariableClick ? `data-variable-id="${definitionId}"` : '';
      const clickable = onVariableClick ? 'cursor: pointer; text-decoration: underline;' : '';
      replacement = `<span ${clickHandler} style="background-color: #e3f2fd; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.875em; ${clickable}" class="variable-link valid">${link.text}</span>`;
    } else {
      // Broken link - show as error
      replacement = `<span style="background-color: #ffebee; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.875em; color: #d32f2f; text-decoration: line-through;" class="variable-link broken" title="Variable not found">${link.text}</span>`;
    }

    result = result.substring(0, start) + replacement + result.substring(end);
  });

  return result;
}

/**
 * Check for circular references in variable descriptions
 */
export function detectCircularReferences(
  descriptions: Map<string, { content: string; variableDefinitionId: string }>,
  variableDefinitions: Map<string, VariableDefinition>
): Array<{ path: string[]; variableNames: string[] }> {
  const circularPaths: Array<{ path: string[]; variableNames: string[] }> = [];
  const definitionIdToName = new Map<string, string>();

  // Build lookup map
  variableDefinitions.forEach(def => {
    definitionIdToName.set(def.id, def.name);
  });

  // Build adjacency list of variable references
  const adjacencyList = new Map<string, string[]>();
  descriptions.forEach((desc, definitionId) => {
    const referencedIds = extractVariableReferences(desc.content, variableDefinitions);
    adjacencyList.set(definitionId, referencedIds);
  });

  // Depth-first search to detect cycles
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const currentPath: string[] = [];

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);
    currentPath.push(nodeId);

    const neighbors = adjacencyList.get(nodeId) || [];
    for (const neighborId of neighbors) {
      if (!visited.has(neighborId)) {
        if (dfs(neighborId)) {
          return true;
        }
      } else if (recursionStack.has(neighborId)) {
        // Found a cycle - record it
        const cycleStart = currentPath.indexOf(neighborId);
        const cyclePath = currentPath.slice(cycleStart);
        cyclePath.push(neighborId); // Complete the cycle

        const variableNames = cyclePath.map(id => definitionIdToName.get(id) || id);
        circularPaths.push({
          path: [...cyclePath],
          variableNames
        });
        return true;
      }
    }

    recursionStack.delete(nodeId);
    currentPath.pop();
    return false;
  }

  // Check all unvisited nodes
  adjacencyList.forEach((_, nodeId) => {
    if (!visited.has(nodeId)) {
      dfs(nodeId);
    }
  });

  return circularPaths;
}

/**
 * Escape square brackets to prevent them from being parsed as links
 */
export function escapeSquareBrackets(text: string): string {
  return text.replace(/\\\[/g, '&#91;').replace(/\\\]/g, '&#93;');
}

/**
 * Unescape square brackets
 */
export function unescapeSquareBrackets(text: string): string {
  return text.replace(/&#91;/g, '[').replace(/&#93;/g, ']');
}
