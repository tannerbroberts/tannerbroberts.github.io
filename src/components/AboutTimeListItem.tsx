import { Delete } from "@mui/icons-material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Accordion, AccordionActions, AccordionDetails, AccordionSummary, ButtonGroup, IconButton, ListItemButton, ListItemText } from "@mui/material";
import React, { useCallback, useMemo } from "react";
import { useAppDispatch } from "../context/App";
import { Item } from "../store/utils/item";

export default function AboutTimeListItem({ item }: { item: Item }) {
  const appDispatch = useAppDispatch()

  const deleteItem = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    appDispatch({ type: 'DELETE_ITEM_BY_ID', payload: { id: item.id } })
  }, [item.id, appDispatch])

  const viewItem = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    appDispatch({ type: 'SET_FOCUSED_ITEM_BY_ID', payload: { focusedItemId: item.id } })
  }
    , [item.id, appDispatch])

  const childrenString = useMemo(() => {
    return item.children.map((child) => {
      return `{id:${child.id}}`
    }).join(", ")
  }, [item.children])

  const parentString = useMemo(() => {
    return item.parents.map((parent) => {
      return `{id:${parent.id}}`
    }).join(", ")
  }, [item.parents])

  const lengthString = useMemo(() => {
    const hours = Math.floor(item.duration / 3600000);
    const minutes = Math.floor((item.duration % 3600000) / 60000);
    const seconds = Math.floor((item.duration % 60000) / 1000);
    const milliseconds = item.duration % 1000;

    return `${hours}h ${minutes}m ${seconds}s ${milliseconds}ms`
  }, [item.duration])

  return (
    <Accordion style={{ border: "1px solid black" }} key={item.id}>
      <AccordionSummary>
        <ListItemButton>
          <ListItemText primary={item.name} secondary={`length: ${lengthString}`} />
        </ListItemButton>
        <AccordionActions>
          <IconButton onClick={deleteItem}>
            <Delete />
          </IconButton>
          <IconButton onClick={viewItem}>
            <VisibilityIcon />
          </IconButton>
        </AccordionActions>
      </AccordionSummary>
      <AccordionDetails>
        <ListItemText sx={{ wordBreak: "," }} primary={`Children: ${childrenString}`} secondary={`Parents: ${parentString}`} />
      </AccordionDetails>
    </Accordion>
  )
}
