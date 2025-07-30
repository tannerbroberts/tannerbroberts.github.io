// Variable Definition interface for template/definition of variables
export interface VariableDefinition {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly unit?: string;
  readonly category?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

// JSON representation of VariableDefinition for serialization
export interface VariableDefinitionJSON {
  id: string;
  name: string;
  description?: string;
  unit?: string;
  category?: string;
  createdAt: number;
  updatedAt: number;
}

// Interface for VariableItem JSON serialization (extends base ItemJSON)
export interface VariableItemJSON {
  id: string;
  name: string;
  duration: number; // Always 0 for VariableItem
  parents: Array<{ id: string; relationshipId?: string }>;
  allOrNothing: boolean;
  type: "VariableItem";
  description?: string;
  value: number;
}

// Filter interface for future variable filtering functionality
export interface VariableFilter {
  readonly variableName?: string;
  readonly quantityMin?: number;
  readonly quantityMax?: number;
  readonly unit?: string;
  readonly category?: string;
  readonly operator?: "eq" | "gt" | "gte" | "lt" | "lte" | "range";
}

// Variable description with cross-linking support
export interface VariableDescription {
  readonly id: string;
  readonly variableDefinitionId: string;
  readonly content: string; // Rich text content with potential square bracket references
  readonly linkedVariables: string[]; // Referenced variable definition IDs
  readonly referencedBy: string[]; // Variable definition IDs that reference this one
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly linkValidation?: LinkValidationResult;
}

// Link validation result for cross-references
export interface LinkValidationResult {
  readonly validLinks: string[];
  readonly brokenLinks: BrokenLink[];
  readonly lastValidated: number;
}

// Information about broken variable links
export interface BrokenLink {
  readonly text: string;
  readonly suggestions: string[];
  readonly position: { start: number; end: number };
}

// JSON representation of VariableDescription
export interface VariableDescriptionJSON {
  id: string;
  variableDefinitionId: string;
  content: string;
  linkedVariables: string[];
  referencedBy: string[];
  createdAt: number;
  updatedAt: number;
  linkValidation?: {
    validLinks: string[];
    brokenLinks: Array<{
      text: string;
      suggestions: string[];
      position: { start: number; end: number };
    }>;
    lastValidated: number;
  };
}
