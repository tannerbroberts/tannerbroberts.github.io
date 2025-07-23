import type { ItemJSON } from "./ItemJSON";
import { Item } from "./Item";
import { BasicItem } from "./BasicItem";
import { SubCalendarItem } from "./SubCalendarItem";
import { CheckListItem } from "./CheckListItem";

export class ItemFactory {
  static fromJSON(json: ItemJSON): Item {
    switch (json.type) {
      case 'BasicItem':
        return BasicItem.fromJSON(json);
      case 'SubCalendarItem':
        return SubCalendarItem.fromJSON(json);
      case 'CheckListItem':
        return CheckListItem.fromJSON(json);
      default:
        // Default to BasicItem for backwards compatibility
        return BasicItem.fromJSON(json);
    }
  }

  static fromJSONArray(jsonArray: ItemJSON[]): Item[] {
    return jsonArray.map(json => ItemFactory.fromJSON(json));
  }
}
