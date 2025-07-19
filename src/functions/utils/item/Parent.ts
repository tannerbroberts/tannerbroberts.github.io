import { v4 as uuid } from "uuid";

export class Parent {
  id: string;
  relationshipId: string;
  constructor({ id, relationshipId = uuid() }: { id: string; relationshipId?: string }) {
    this.id = id;
    this.relationshipId = relationshipId;
  }
}
