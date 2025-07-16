import { Typography, Button, Box } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts/App";
import { getItemById, Item } from "../functions/utils/item";

export default function ItemSchedule({ item, start = null, relationshipId = null }: Readonly<{ item: Item, start?: number | null, relationshipId?: string | null }>) {
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
    console.log('Move item:', relationshipId || item.id);
  }, [item, relationshipId]);

  const handleDeleteFromSchedule = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (relationshipId) {
      appDispatch({
        type: "REMOVE_INSTANCE_BY_RELATIONSHIP_ID",
        payload: { relationshipId },
      });
    } else {
      appDispatch({
        type: "REMOVE_INSTANCES_BY_ID",
        payload: { id: item.id },
      });
    }
  }, [item, appDispatch, relationshipId]);

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
              variant="contained"
              size="small"
              onClick={handleMoveItem}
              sx={{
                minWidth: '70px',
                height: '28px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                backgroundColor: '#2196f3',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#1976d2',
                },
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                border: 'none'
              }}
            >
              Move
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleDeleteFromSchedule}
              sx={{
                minWidth: '70px',
                height: '28px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                backgroundColor: '#f44336',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#d32f2f',
                },
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                border: 'none'
              }}
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
              <ItemSchedule item={childItem} start={childStart} relationshipId={relationshipId} />
            </div>
          )
        })
      }
    </div>
  );
}
