import { VariableSummary } from '../types';

/**
 * Represents a specific parent-child relationship for variable calculations
 */
export interface VariableRelationship {
  readonly relationshipId: string;
  readonly parentItemId: string;
  readonly childItemId: string;
  readonly multiplier: number; // For multiple usage cases
  readonly contributionSummary: VariableSummary;
}

/**
 * Comprehensive summary including direct variables and relationship contributions
 */
export interface RelationshipSummary {
  readonly itemId: string;
  readonly directVariables: VariableSummary;
  readonly relationshipContributions: Map<string, VariableSummary>;
  readonly totalSummary: VariableSummary;
  readonly lastUpdated: number;
}

/**
 * Configuration for update propagation through relationship hierarchy
 */
export interface UpdatePropagation {
  readonly sourceItemId: string;
  readonly sourceRelationshipId?: string;
  readonly affectedRelationships: string[];
  readonly propagationDepth: number;
  readonly updateType: 'DIRECT_VARIABLE' | 'RELATIONSHIP_CHANGE' | 'CASCADED_UPDATE';
}

/**
 * Performance tracking for relationship-based calculations
 */
export interface RelationshipPerformanceMetrics {
  readonly calculationTime: number;
  readonly cacheHitRate: number;
  readonly relationshipsProcessed: number;
  readonly cascadeDepth: number;
  readonly memoryUsage: number;
}

/**
 * Bidirectional relationship mapping for efficient queries
 */
export interface RelationshipMapping {
  readonly parentToChildren: Map<string, Set<string>>; // parentId -> Set<relationshipId>
  readonly childToParents: Map<string, Set<string>>; // childId -> Set<relationshipId>
  readonly relationshipDetails: Map<string, VariableRelationship>;
}

/**
 * Update operation context for batch processing
 */
export interface RelationshipUpdateContext {
  readonly operationId: string;
  readonly initiatingItemId: string;
  readonly timestamp: number;
  readonly updatedRelationships: Map<string, VariableSummary>;
  readonly invalidatedCacheKeys: Set<string>;
  readonly rollbackData?: Map<string, VariableSummary>;
}

/**
 * Cache entry structure for relationship-based summaries
 */
export interface RelationshipCacheEntry {
  readonly summary: RelationshipSummary;
  readonly dependencies: Set<string>; // relationshipIds that affect this calculation
  readonly timestamp: number;
  readonly accessCount: number;
  readonly lastAccessed: number;
}

/**
 * Configuration for relationship-based summary calculation
 */
export interface RelationshipCalculationConfig {
  readonly maxCascadeDepth: number;
  readonly enableCaching: boolean;
  readonly batchSize: number;
  readonly timeoutMs: number;
  readonly validateCircularReferences: boolean;
}
