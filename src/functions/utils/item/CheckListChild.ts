import { v4 as uuid } from "uuid";

export class CheckListChild {
  itemId: string;
  complete: boolean;
  relationshipId: string;

  constructor({ itemId, complete = false, relationshipId = uuid() }: { itemId: string; complete?: boolean; relationshipId?: string }) {
    this.itemId = itemId;
    this.complete = complete;
    this.relationshipId = relationshipId;
  }
}
