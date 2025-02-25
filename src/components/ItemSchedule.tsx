import { Typography } from "@mui/material";
import { useAppDispatch, useAppState } from "../context/App.ts";
import { getItemById, Item } from "../store/utils/item";
import { useCallback } from "react";

export default function ItemSchedule({ item, start = null }: { item: Item, start?: number | null }) {
  const { items } = useAppState();
  const appDispatch = useAppDispatch();
  const { duration } = item;

  const toggleShowChildren = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    appDispatch({
      type: "TOGGLE_ITEM_SHOW_CHILDREN_BY_ID",
      payload: { id: item.id, showChildren: !item.showChildren },
    });
  }, [item, appDispatch]);

  return (
    <div
      onClick={toggleShowChildren}
      style={{
        boxSizing: 'border-box',
        width: start !== null ? 'calc(100% - 140px)' : '100%',
        position: start !== null ? 'absolute' : 'relative',
        top: start !== null ? `${start}px` : '0px',
        height: duration + 'px',
        backgroundColor: 'rgba(0, 0, 150, 0.3)',
        marginLeft: start !== null ? `140px` : '0px',
      }}>
      <Typography>
        {item.name}
      </Typography>
      {item.showChildren &&
        item.children.map((child) => {
          const { id, start: childStart } = child
          const childItem = getItemById(items, id);
          if (!childItem) throw new Error(`Item with id ${id} not found whilest rendering children in ItemSchedule of ${item.name}`);
          return (
            <div key={id}>
              <ItemSchedule item={childItem} start={childStart} />
            </div>
          )
        })
      }
    </div>
  );
}
