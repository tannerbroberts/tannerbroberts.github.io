import { Typography, Button, Box, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts";
import { getItemById, Item, SubCalendarItem, CheckListItem, getChildId, type ChildReference } from "../functions/utils/item/index";
import { ExpandMore } from "@mui/icons-material";

export default function ItemSchedule({ item, start = null, relationshipId = null }: Readonly<{ item: Item, start?: number | null, relationshipId?: string | null }>) {
  const { items, millisecondsPerSegment, pixelsPerSegment } = useAppState();
  const appDispatch = useAppDispatch();
  const { duration } = item;

  const updateShowChildren = useCallback((e: React.SyntheticEvent, expanded: boolean) => {
    e.stopPropagation();
    // For now, just log the action - UI state management can be added later if needed
    console.log('Toggle showChildren for item:', item.id, 'expanded:', expanded);
  }, [item]);

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

  // Calculate the height based on duration and pixel ratio
  const scheduleHeight = (duration * pixelsPerSegment) / millisecondsPerSegment;
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
        border: '1px solid rgba(0, 0, 150, 0.6)',
        borderRadius: '4px',
        zIndex: 1, // Ensure items appear above ledger lines
      }}>

      <Accordion
        expanded={false} // Default to collapsed - can be made stateful later if needed
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

            {/* Always show move and delete buttons when this is a scheduled child */}
            {relationshipId && (
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

        <AccordionDetails sx={{ p: 1, position: 'relative' }}>
          {(item instanceof SubCalendarItem || item instanceof CheckListItem) && Array.isArray(item.children) && item.children.map((child: ChildReference) => {
            // SubCalendarItem: child has id, start, relationshipId
            // CheckListItem: child has itemId, complete, relationshipId
            const childId = getChildId(child);
            const childStart = 'start' in child ? child.start : null;
            const relationshipId = child.relationshipId;
            const childItem = getItemById(items, childId);
            if (childItem === null) throw new Error(`Item with id ${childId} not found while rendering children in ItemSchedule of ${item.name}`);
            return (
              <ItemSchedule
                key={relationshipId}
                item={childItem}
                start={childStart}
                relationshipId={relationshipId}
              />
            );
          })}
        </AccordionDetails>
      </Accordion>
    </div>
  );
}
