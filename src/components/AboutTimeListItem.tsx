import {
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
  Chip
} from "@mui/material";
import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts/App";
import { Item, SubCalendarItem, CheckListItem } from "../functions/utils/item/index";
import { Visibility } from "@mui/icons-material";

export default function PaginatedItemListItem({ item }: Readonly<{ item: Item }>) {
  const { focusedListItemId, focusedItemId } = useAppState()
  const dispatch = useAppDispatch()

  const lengthString = useMemo(() => {
    const hours = Math.floor(item.duration / 3600000);
    const minutes = Math.floor((item.duration % 3600000) / 60000);
    const seconds = Math.floor((item.duration % 60000) / 1000);
    const milliseconds = item.duration % 1000;

    const hoursStr = hours ? `${hours}h` : '';
    const minutesStr = minutes ? `${minutes}m` : '';
    const secondsStr = seconds ? `${seconds}` : '';
    const millisecondsStr = milliseconds ? `.${milliseconds}s` : 's';

    return `${hoursStr} ${minutesStr} ${secondsStr}${millisecondsStr}`;
  }, [item.duration])

  const setFocusedListItem = useCallback(() => {
    dispatch({ type: 'SET_FOCUSED_LIST_ITEM_BY_ID', payload: { focusedListItemId: item.id } })
  }, [dispatch, item.id])

  const isFocusedListItem = useMemo(() => focusedListItemId === item.id, [focusedListItemId, item.id])
  const isFocusedItem = useMemo(() => focusedItemId === item.id, [focusedItemId, item.id])

  // If item has children, show as regular list item with child count
  if ((item instanceof SubCalendarItem || item instanceof CheckListItem) && item.children.length > 0) {
    return (
      <ListItem
        secondaryAction={isFocusedItem ? <Visibility /> : null}
        sx={{
          border: isFocusedListItem ? '2px solid #1976d2' : '1px solid #e0e0e0',
          borderRadius: 1,
          mb: 1,
          backgroundColor: isFocusedListItem ? '#e3f2fd' : 'transparent'
        }}
      >
        <ListItemButton selected={isFocusedListItem} onClick={setFocusedListItem}>
          <ListItemText
            primary={item.name}
            secondary={`Duration: ${lengthString}`}
          />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', ml: 2 }}>
            <Chip
              label={`${item.children.length} child${item.children.length > 1 ? 'ren' : ''}`}
              size="small"
              variant="outlined"
            />
          </Box>
        </ListItemButton>
      </ListItem>
    );
  }

  // If item has no children, show as regular list item
  return (
    <ListItem
      secondaryAction={isFocusedItem ? <Visibility /> : null}
      sx={{
        border: isFocusedListItem ? '2px solid #1976d2' : '1px solid #e0e0e0',
        borderRadius: 1,
        mb: 1,
        backgroundColor: isFocusedListItem ? '#e3f2fd' : 'transparent'
      }}
    >
      <ListItemButton selected={isFocusedListItem} onClick={setFocusedListItem} >
        <ListItemText primary={item.name} secondary={`Duration: ${lengthString}`} />
      </ListItemButton>
    </ListItem>
  )
}
