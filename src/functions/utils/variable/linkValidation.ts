import { VariableDefinition, BrokenLink, LinkValidationResult } from '../item/types/VariableTypes';
import { parseVariableLinks, generateVariableNameSuggestions, detectCircularReferences } from './linkParser';

/**
 * Comprehensive validation result for variable descriptions
 */
export interface DescriptionValidationResult extends LinkValidationResult {
  readonly hasCircularReferences: boolean;
  readonly circularPaths: Array<{ path: string[]; variableNames: string[] }>;
  readonly qualityScore: number; // 0-100 score based on various factors
  readonly qualityIssues: string[];
  readonly recommendations: string[];
}

/**
 * Validate variable links with comprehensive analysis
 */
export function validateVariableDescription(
  content: string,
  variableDefinitions: Map<string, VariableDefinition>,
  allDescriptions?: Map<string, { content: string; variableDefinitionId: string }>
): DescriptionValidationResult {
  // Basic link validation
  const links = parseVariableLinks(content, variableDefinitions);
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

  // Check for circular references if all descriptions are provided
  let hasCircularReferences = false;
  let circularPaths: Array<{ path: string[]; variableNames: string[] }> = [];

  if (allDescriptions) {
    circularPaths = detectCircularReferences(allDescriptions, variableDefinitions);
    hasCircularReferences = circularPaths.length > 0;
  }

  // Calculate quality score and issues
  const { qualityScore, qualityIssues, recommendations } = calculateQualityMetrics(
    content,
    validLinks.length,
    brokenLinks.length,
    hasCircularReferences
  );

  return {
    validLinks: [...new Set(validLinks)],
    brokenLinks,
    lastValidated: Date.now(),
    hasCircularReferences,
    circularPaths,
    qualityScore,
    qualityIssues,
    recommendations
  };
}

/**
 * Calculate quality metrics for a variable description
 */
function calculateQualityMetrics(
  content: string,
  validLinksCount: number,
  brokenLinksCount: number,
  hasCircularReferences: boolean
): {
  qualityScore: number;
  qualityIssues: string[];
  recommendations: string[];
} {
  let score = 100;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Length and content quality
  const wordCount = content.trim().split(/\s+/).length;
  const charCount = content.length;

  if (charCount < 20) {
    score -= 30;
    issues.push('Description is very short');
    recommendations.push('Add more detail to explain what this variable represents');
  } else if (charCount < 50) {
    score -= 15;
    issues.push('Description could be more detailed');
    recommendations.push('Consider adding examples or context');
  }

  if (wordCount < 3) {
    score -= 20;
    issues.push('Description lacks sufficient detail');
  }

  // Grammar and formatting
  if (!content.includes('.') && !content.includes('!') && !content.includes('?')) {
    score -= 10;
    issues.push('Missing punctuation');
    recommendations.push('Use proper punctuation to improve readability');
  }

  // Link quality
  if (brokenLinksCount > 0) {
    score -= brokenLinksCount * 15;
    issues.push(`${brokenLinksCount} broken variable link${brokenLinksCount === 1 ? '' : 's'}`);
    recommendations.push('Fix broken variable references or remove invalid links');
  }

  if (hasCircularReferences) {
    score -= 25;
    issues.push('Contains circular references');
    recommendations.push('Remove circular references to prevent navigation loops');
  }

  // Positive factors
  if (validLinksCount > 0) {
    score += Math.min(validLinksCount * 5, 15); // Bonus for good linking
  }

  if (content.includes('**') || content.includes('_')) {
    score += 5; // Bonus for formatting
  }

  if (content.includes('- ')) {
    score += 5; // Bonus for bullet points
  }

  // Vocabulary richness
  const uniqueWords = new Set(content.toLowerCase().split(/\s+/));
  if (uniqueWords.size / wordCount > 0.7) {
    score += 5; // Bonus for varied vocabulary
  }

  // Ensure score is within bounds
  score = Math.max(0, Math.min(100, score));

  return { qualityScore: Math.round(score), qualityIssues: issues, recommendations };
}

/**
 * Batch validate multiple variable descriptions
 */
export function batchValidateDescriptions(
  descriptions: Map<string, { content: string; variableDefinitionId: string }>,
  variableDefinitions: Map<string, VariableDefinition>
): Map<string, DescriptionValidationResult> {
  const results = new Map<string, DescriptionValidationResult>();

  descriptions.forEach((desc, definitionId) => {
    const result = validateVariableDescription(desc.content, variableDefinitions, descriptions);
    results.set(definitionId, result);
  });

  return results;
}

/**
 * Get validation summary statistics
 */
export function getValidationSummary(
  validationResults: Map<string, DescriptionValidationResult>
): {
  totalDescriptions: number;
  averageQualityScore: number;
  totalBrokenLinks: number;
  totalCircularReferences: number;
  descriptionsWithIssues: number;
  topIssues: Array<{ issue: string; count: number }>;
} {
  const results = Array.from(validationResults.values());

  if (results.length === 0) {
    return {
      totalDescriptions: 0,
      averageQualityScore: 0,
      totalBrokenLinks: 0,
      totalCircularReferences: 0,
      descriptionsWithIssues: 0,
      topIssues: []
    };
  }

  const totalBrokenLinks = results.reduce((sum, result) => sum + result.brokenLinks.length, 0);
  const totalCircularReferences = results.reduce((sum, result) =>
    sum + (result.hasCircularReferences ? 1 : 0), 0
  );
  const averageQualityScore = results.reduce((sum, result) => sum + result.qualityScore, 0) / results.length;
  const descriptionsWithIssues = results.filter(result => result.qualityIssues.length > 0).length;

  // Count top issues
  const issueCount = new Map<string, number>();
  results.forEach(result => {
    result.qualityIssues.forEach(issue => {
      issueCount.set(issue, (issueCount.get(issue) || 0) + 1);
    });
  });

  const topIssues = Array.from(issueCount.entries())
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalDescriptions: results.length,
    averageQualityScore: Math.round(averageQualityScore),
    totalBrokenLinks,
    totalCircularReferences,
    descriptionsWithIssues,
    topIssues
  };
}

/**
 * Generate validation report as human-readable text
 */
export function generateValidationReport(
  validationResults: Map<string, DescriptionValidationResult>,
  variableDefinitions: Map<string, VariableDefinition>
): string {
  const summary = getValidationSummary(validationResults);
  const definitionIdToName = new Map<string, string>();

  variableDefinitions.forEach(def => {
    definitionIdToName.set(def.id, def.name);
  });

  let report = '# Variable Description Validation Report\n\n';

  // Summary section
  report += '## Summary\n';
  report += `- Total Descriptions: ${summary.totalDescriptions}\n`;
  report += `- Average Quality Score: ${summary.averageQualityScore}/100\n`;
  report += `- Descriptions with Issues: ${summary.descriptionsWithIssues}\n`;
  report += `- Total Broken Links: ${summary.totalBrokenLinks}\n`;
  report += `- Circular References: ${summary.totalCircularReferences}\n\n`;

  // Top issues
  if (summary.topIssues.length > 0) {
    report += '## Most Common Issues\n';
    summary.topIssues.forEach((issue, index) => {
      report += `${index + 1}. ${issue.issue} (${issue.count} occurrences)\n`;
    });
    report += '\n';
  }

  // Detailed results
  report += '## Detailed Results\n\n';
  const sortedResults = Array.from(validationResults.entries())
    .sort(([, a], [, b]) => a.qualityScore - b.qualityScore);

  sortedResults.forEach(([definitionId, result]) => {
    const variableName = definitionIdToName.get(definitionId) || definitionId;
    report += `### ${variableName} (Score: ${result.qualityScore}/100)\n`;

    if (result.qualityIssues.length > 0) {
      report += '**Issues:**\n';
      result.qualityIssues.forEach(issue => {
        report += `- ${issue}\n`;
      });
    }

    if (result.brokenLinks.length > 0) {
      report += '**Broken Links:**\n';
      result.brokenLinks.forEach(link => {
        report += `- [${link.text}]`;
        if (link.suggestions.length > 0) {
          report += ` (suggested: ${link.suggestions.join(', ')})`;
        }
        report += '\n';
      });
    }

    if (result.recommendations.length > 0) {
      report += '**Recommendations:**\n';
      result.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
    }

    report += '\n';
  });

  return report;
}
