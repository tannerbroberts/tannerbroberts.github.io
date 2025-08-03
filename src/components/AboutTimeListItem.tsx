import { ListItem, ListItemButton, ListItemText } from "@mui/material"
import { useCallback } from "react"
import { Item } from "../functions/utils/item/index"
import { useAppDispatch } from "../reducerContexts/App"

interface AboutTimeListItemProps {
  readonly item: Item
}

export default function AboutTimeListItem({ item }: AboutTimeListItemProps) {
  const dispatch = useAppDispatch()

  const setFocusedItem = useCallback(() => {
    dispatch({ type: 'SET_FOCUSED_ITEM_BY_ID', payload: { focusedItemId: item.id } })
  }, [dispatch, item.id])

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={setFocusedItem}>
        <ListItemText
          primary={item.name}
          secondary={`Duration: ${item.duration}ms`}
        />
      </ListItemButton>
    </ListItem>
  )
}
