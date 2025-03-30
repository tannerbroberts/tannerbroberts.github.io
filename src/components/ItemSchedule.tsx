import { Typography } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch, useAppState } from "../context/App.ts";
import { getItemById, Item } from "../store/utils/item";

export default function ItemSchedule({ item, start = null }: { item: Item, start?: number | null }) {
  const { items, millisecondsPerSegment, pixelsPerSegment } = useAppState();
  const appDispatch = useAppDispatch();
  const { duration } = item;

  const updateShowChildren = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    appDispatch({
      type: "TOGGLE_ITEM_SHOW_CHILDREN_BY_ID",
      payload: { id: item.id, showChildren: !item.showChildren },
    });
  }, [item, appDispatch]);

  const scheduleHeight = (duration * pixelsPerSegment) / millisecondsPerSegment;
  const startHeight = start !== null ? start * pixelsPerSegment / millisecondsPerSegment : 0;

  return (
    <div
      onClick={updateShowChildren}
      style={{
        boxSizing: 'border-box',
        width: 'calc(100% - 40px)',
        position: 'absolute',
        top: start !== null ? `${startHeight}px` : 0,
        height: scheduleHeight + 'px',
        backgroundColor: 'rgba(0, 0, 150, 0.3)',
        marginLeft: `40px`,
      }}>
      <Typography>
        {`${item.name} (${item.showChildren ? '-' : '+'})`}
      </Typography>
      {item.showChildren &&
        item.children.map((child) => {
          const { id, start: childStart, relationshipId } = child
          const childItem = getItemById(items, id);
          if (childItem === null) throw new Error(`Item with id ${id} not found whilest rendering children in ItemSchedule of ${item.name}`);
          return (
            <div key={relationshipId}>
              <ItemSchedule item={childItem} start={childStart} />
            </div>
          )
        })
      }
    </div>
  );
}
