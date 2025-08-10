import { ListItem, ListItemButton, ListItemText } from "@mui/material"
import { useCallback } from "react"
import { Item } from "../functions/utils/item/index"
import { useAppDispatch, useAppState } from "../reducerContexts"

interface AboutTimeListItemProps {
  readonly item: Item
}

export default function AboutTimeListItem({ item }: AboutTimeListItemProps) {
  const dispatch = useAppDispatch()
  const { schedulingMode } = useAppState()

  const handleItemClick = useCallback(() => {
    if (schedulingMode) {
      // Scheduling flow: select as child and open duration dialog
      dispatch({ type: 'SET_SELECTED_ITEM_BY_ID', payload: { selectedItemId: item.id } })
      dispatch({ type: 'SET_DURATION_DIALOG_OPEN', payload: { durationDialogOpen: true } })
    } else {
      // Normal navigation: set both focused and selected
      dispatch({ type: 'SET_FOCUSED_ITEM_BY_ID', payload: { focusedItemId: item.id } })
      dispatch({ type: 'SET_SELECTED_ITEM_BY_ID', payload: { selectedItemId: item.id } })
    }
  }, [dispatch, item.id, schedulingMode])

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
