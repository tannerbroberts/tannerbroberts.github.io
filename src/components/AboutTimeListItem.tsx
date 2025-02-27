import { Accordion, AccordionDetails, AccordionSummary, ListItemButton, ListItemText } from "@mui/material";
import { getItemById, Item } from "../store/utils/item";
import { useCallback } from "react";
import { Delete } from "@mui/icons-material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useAppDispatch, useAppState } from "../context/App";

export default function AboutTimeListItem({ item }: { item: Item }) {
  const { items } = useAppState()
  const appDispatch = useAppDispatch()

  const deleteItem = useCallback(() => {
    appDispatch({ type: 'DELETE_ITEM_BY_ID', payload: { id: item.id } })
  }, [item.id, appDispatch])

  const childrenString = item.children.map(child => {
    const childItem = getItemById(items, child.id)
    if (!childItem) throw new Error(`Child with id ${child.id} not found`)
    return `${child.id}`
  }).join(', ')

  return (
    <Accordion defaultExpanded style={{ border: "1px solid black" }} key={item.id}>
      <AccordionSummary>
        <ListItemButton>
          <ListItemText primary={item.id} secondary={`${item.duration}ms`} />
        </ListItemButton>
      </AccordionSummary>
      <AccordionDetails>
        <ListItemText primary={childrenString} />
        <Delete onClick={deleteItem} />
        <VisibilityIcon onClick={() => appDispatch({ type: 'SET_FOCUSED_ITEM_BY_ID', payload: { focusedItemId: item.id } })} />
      </AccordionDetails>
    </Accordion>
  )
}
