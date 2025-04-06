import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import { useCallback, useMemo } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts/App";
import { Item } from "../functions/utils/item";
import { Visibility } from "@mui/icons-material";

export default function PaginatedItemListItem({ item }: { item: Item }) {
  const { focusedListItemId, focusedItemId } = useAppState()
  const dispatch = useAppDispatch()

  const lengthString = useMemo(() => {
    const hours = Math.floor(item.duration / 3600000);
    const minutes = Math.floor((item.duration % 3600000) / 60000);
    const seconds = Math.floor((item.duration % 60000) / 1000);
    const milliseconds = item.duration % 1000;

    return `${hours ? `${hours}h` : ''} ${minutes ? `${minutes}m` : ''} ${seconds ? `${seconds}` : ''}${milliseconds ? `.${milliseconds}s` : 's'}`
  }, [item.duration])

  const setFocusedListItem = useCallback(() => {
    dispatch({ type: 'SET_FOCUSED_LIST_ITEM_BY_ID', payload: { focusedListItemId: item.id } })
  }, [dispatch, item.id])

  const isFocusedListItem = useMemo(() => focusedListItemId === item.id, [focusedListItemId, item.id])
  const isFocusedItem = useMemo(() => focusedItemId === item.id, [focusedItemId, item.id])

  return (
    <ListItem
      secondaryAction={isFocusedItem ? <Visibility /> : null}
    >
      <ListItemButton selected={isFocusedListItem} onClick={setFocusedListItem} >
        <ListItemText primary={item.name} secondary={`length: ${lengthString}`} />
      </ListItemButton>
    </ListItem >
  )
}
