export interface ItemJSON {
  id: string;
  name: string;
  duration: number;
  parents: Array<{ id: string; relationshipId?: string }>;
  allOrNothing: boolean;
  type: string;
  priority?: number;
  children?: unknown[];
  sortType?: SortType;
}
