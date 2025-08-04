import { ListItem, ListItemButton, ListItemText } from "@mui/material"
import { useCallback } from "react"
import { Item } from "../functions/utils/item/index"
import { useAppDispatch, useAppState } from "../reducerContexts/App"

interface AboutTimeListItemProps {
  readonly item: Item
}

export default function AboutTimeListItem({ item }: AboutTimeListItemProps) {
  const dispatch = useAppDispatch()
  const { durationDialogOpen } = useAppState()

  const handleItemClick = useCallback(() => {
    if (durationDialogOpen) {
      // During child scheduling workflow: only set selected item (preserve focused parent)
      dispatch({ type: 'SET_SELECTED_ITEM_BY_ID', payload: { selectedItemId: item.id } })
    } else {
      // Normal navigation: set both focused and selected
      dispatch({ type: 'SET_FOCUSED_ITEM_BY_ID', payload: { focusedItemId: item.id } })
      dispatch({ type: 'SET_SELECTED_ITEM_BY_ID', payload: { selectedItemId: item.id } })
    }
  }, [dispatch, item.id, durationDialogOpen])

  return (
    <ListItem disablePadding>
      <ListItemButton onClick={handleItemClick}>
        <ListItemText
          primary={item.name}
          secondary={`Duration: ${item.duration}ms`}
        />
      </ListItemButton>
    </ListItem>
  )
}
