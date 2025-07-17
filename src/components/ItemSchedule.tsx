import { Typography, Button, Box, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts/App";
import { getItemById, Item } from "../functions/utils/item";
import { ExpandMore } from "@mui/icons-material";
import { useViewportHeight } from "../hooks/useViewportHeight";

export default function ItemSchedule({ item, start = null, relationshipId = null }: Readonly<{ item: Item, start?: number | null, relationshipId?: string | null }>) {
  const { items, millisecondsPerSegment, pixelsPerSegment } = useAppState();
  const appDispatch = useAppDispatch();
  const viewportHeight = useViewportHeight();
  const { duration } = item;

  const updateShowChildren = useCallback((e: React.SyntheticEvent, expanded: boolean) => {
    e.stopPropagation();
    appDispatch({
      type: "TOGGLE_ITEM_SHOW_CHILDREN_BY_ID",
      payload: { id: item.id, showChildren: expanded },
    });
  }, [item, appDispatch]);

  const handleMoveItem = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    // Placeholder for move functionality - to be implemented
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

  // Calculate the natural height based on duration
  const naturalHeight = (duration * pixelsPerSegment) / millisecondsPerSegment;
  // Limit to maximum of 2 screen heights
  const maxHeight = viewportHeight * 2;
  const scheduleHeight = Math.min(naturalHeight, maxHeight);
  const startHeight = start !== null ? start * pixelsPerSegment / millisecondsPerSegment : 0;

  return (
    <div
      style={{
        boxSizing: 'border-box',
        width: 'calc(100% - 40px)',
        position: 'absolute',
        top: start !== null ? `${startHeight}px` : 0,
        height: scheduleHeight + 'px',
        backgroundColor: 'rgba(0, 0, 150, 0.3)',
        marginLeft: `40px`,
        // Add overflow scrolling when content exceeds maximum height
        ...(naturalHeight > maxHeight && {
          overflowY: 'auto',
          border: '2px solid rgba(255, 165, 0, 0.8)', // Orange border to indicate truncation
        }),
      }}>

      <Accordion
        expanded={item.showChildren}
        onChange={updateShowChildren}
        sx={{
          height: '100%',
          '&:before': {
            display: 'none'
          },
          '& .MuiAccordionSummary-root': {
            minHeight: '48px',
            '&.Mui-expanded': {
              minHeight: '48px'
            }
          }
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
              {item.name}
            </Typography>

            {start !== null && (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleMoveItem}
                  sx={{
                    minWidth: '60px',
                    height: '28px',
                    fontSize: '0.7rem',
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
                    minWidth: '60px',
                    height: '28px',
                    fontSize: '0.7rem',
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
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 1 }}>
          {item.children.map((child) => {
            const { id, start: childStart, relationshipId } = child
            const childItem = getItemById(items, id);
            if (childItem === null) throw new Error(`Item with id ${id} not found whilest rendering children in ItemSchedule of ${item.name}`);
            return (
              <div key={relationshipId}>
                <ItemSchedule item={childItem} start={childStart} relationshipId={relationshipId} />
              </div>
            )
          })}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
