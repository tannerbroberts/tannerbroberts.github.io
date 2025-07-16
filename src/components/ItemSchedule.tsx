import { Typography, Button, Box } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts/App";
import { getItemById, Item } from "../functions/utils/item";

export default function ItemSchedule({ item, start = null }: Readonly<{ item: Item, start?: number | null }>) {
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

  const handleMoveItem = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // TODO: Implement move functionality
    console.log('Move item:', item.id);
  }, [item]);

  const handleDeleteFromSchedule = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    appDispatch({
      type: "REMOVE_INSTANCES_BY_ID",
      payload: { id: item.id },
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px' }}>
        <Typography>
          {`${item.name} (${item.showChildren ? '-' : '+'})`}
        </Typography>
        {item.showChildren && start !== null && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleMoveItem}
              sx={{ minWidth: '60px', height: '24px', fontSize: '0.75rem' }}
            >
              Move
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handleDeleteFromSchedule}
              color="error"
              sx={{ minWidth: '60px', height: '24px', fontSize: '0.75rem' }}
            >
              Delete
            </Button>
          </Box>
        )}
      </div>
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
