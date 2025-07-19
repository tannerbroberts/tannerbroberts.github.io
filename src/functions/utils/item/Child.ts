import { v4 as uuid } from "uuid";

export class Child {
  id: string;
  start: number;
  relationshipId: string;
  constructor({ id, start, relationshipId = uuid() }: { id: string; start: number; relationshipId?: string }) {
    this.id = id;
    this.start = start;
    this.relationshipId = relationshipId;
  }
}
