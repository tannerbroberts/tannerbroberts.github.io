import type { SortType } from "./SortType";

export interface ItemJSON {
  id: string;
  name: string;
  duration: number;
  parents: Array<{ id: string; relationshipId?: string }>;
  type: string;
  variables?: Record<string, number>;
  variableSummary?: Record<string, number>;
  priority?: number;
  children?: unknown[];
  sortType?: SortType;
  color?: string;
  pattern?: string;
}