import { Delete } from "@mui/icons-material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Accordion, AccordionDetails, AccordionSummary, ButtonGroup, ListItemButton, ListItemText } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch } from "../context/App";
import { Item } from "../store/utils/item";

export default function AboutTimeListItem({ item }: { item: Item }) {
  const appDispatch = useAppDispatch()

  const deleteItem = useCallback(() => {
    appDispatch({ type: 'DELETE_ITEM_BY_ID', payload: { id: item.id } })
  }, [item.id, appDispatch])

  const viewItem = useCallback(() => {
    appDispatch({ type: 'SET_FOCUSED_ITEM_BY_ID', payload: { focusedItemId: item.id } })
  }
    , [item.id, appDispatch])

  const childrenString = item.children.map((child) => {
    return `{id:${child.id}}`
  }).join(", ")

  const parentString = item.parents.map((parent) => {
    return `{id:${parent.id}}`
  }).join(", ")

  return (
    <Accordion style={{ border: "1px solid black" }} key={item.id}>
      <AccordionSummary>
        <ListItemButton>
          <ListItemText primary={`children: (${item.children.length})`} secondary={`parents: (${item.parents.length})`} />
        </ListItemButton>
        <ButtonGroup>
          <Delete onClick={deleteItem} />
          <VisibilityIcon onClick={viewItem} />
        </ButtonGroup>
      </AccordionSummary>
      <AccordionDetails>
        <ListItemText sx={{ wordBreak: "," }} primary={`Children: ${childrenString}`} secondary={`Parents: ${parentString}`} />
      </AccordionDetails>
    </Accordion>
  )
}
