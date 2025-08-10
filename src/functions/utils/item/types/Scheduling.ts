export type ItemTypeName = 'BasicItem' | 'CheckListItem' | 'SubCalendarItem'

export interface MatchCriteria {
  nameEquals?: string;
  nameIncludes?: string;
  nameRegex?: string;
  colorEquals?: string;
  patternEquals?: string;
  typeIs?: ItemTypeName;
}

export type ConditionStep =
  | { op: 'findChildren'; match?: MatchCriteria }
  | { op: 'filter'; match?: MatchCriteria };

export type ComparisonOp = '>=' | '<=' | '==' | '!=' | '>' | '<'

export type ConditionAssertion =
  | { kind: 'exists'; value: boolean }
  | { kind: 'count'; op: ComparisonOp; value: number };

export interface ConditionExpr {
  start: 'parent' | 'child';
  chain?: ConditionStep[];
  assert?: ConditionAssertion[];
}

export type ActionExpr =
  | {
    type: 'createItem';
    itemType?: ItemTypeName; // defaults to BasicItem
    name: string;
    duration: number; // ms
    color?: string;
    pattern?: string;
    variables?: Record<string, number>;
  }
  | {
    type: 'addToChecklist';
    target: 'firstMatch';
    source: 'lastCreatedItem';
  };

export interface SchedulingRule {
  when: ConditionExpr;
  then: ActionExpr[];
}

export interface SchedulingConfig {
  rules?: SchedulingRule[];
}
