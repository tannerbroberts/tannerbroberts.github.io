import { Delete, Schedule, Visibility } from "@mui/icons-material";
import { Box, ButtonGroup, Drawer, IconButton, List, ListItem, Toolbar, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts/App";
import { TimeInputProvider } from "../reducerContexts/TimeInput";
import { getItemById } from "../functions/utils/item";
import ExportButton from "./ExportButton";
import ImportButton from "./ImportButton";
import ItemListFilter from "./ItemListFilter";
import NewItemButton from "./NewItemButton";
import PaginatedItemList from "./PaginatedItemList";
import RandomItemButton from "./RandomItemButton";
import SchedulingDialog from "./SchedulingDialog";

export default function SideBar() {
  const { sideDrawerOpen, focusedItemId, focusedListItemId, items } = useAppState()
  const appDispatch = useAppDispatch()

  const [filterString, setFilterString] = useState('')

  const closeDrawer = useCallback(() => {
    appDispatch({ type: 'SET_SIDE_DRAWER_OPEN', payload: { sideDrawerOpen: false } })
  }, [appDispatch])

  const deleteFocusedListItemById = useCallback(() => {
    appDispatch({ type: 'DELETE_ITEM_BY_ID', payload: { id: focusedListItemId } })
    appDispatch({ type: 'SET_FOCUSED_LIST_ITEM_BY_ID', payload: { focusedListItemId: null } })
  }, [appDispatch, focusedListItemId])

  const setFocusedItem = useCallback(() => {
    appDispatch({ type: 'SET_FOCUSED_ITEM_BY_ID', payload: { focusedItemId: focusedListItemId } })
  }, [appDispatch, focusedListItemId])

  const openSchedulingDialog = useCallback(() => {
    appDispatch({ type: 'SET_SCHEDULING_DIALOG_OPEN', payload: { schedulingDialogOpen: true } })
  }, [appDispatch])

  // Can schedule if:
  const focusedItem = useMemo(() => {
    if (!focusedItemId) return null
    return getItemById(items, focusedItemId)
  }, [focusedItemId, items])
  const focusedListItem = useMemo(() => {
    if (!focusedListItemId) return null
    return getItemById(items, focusedListItemId)
  }, [focusedListItemId, items])
  const canSchedule = useMemo(() => {
    if (!focusedItem) return false
    if (!focusedListItem) return false
    if (focusedItem.id === focusedListItem.id) return false
    if (focusedItem.duration < focusedListItem.duration) return false
    return true
  }, [focusedItem, focusedListItem])

  const disableSetFocusedItem = useMemo(() => {
    if (!focusedListItemId) return true
    if (focusedItemId === focusedListItemId) return true
  }, [focusedItemId, focusedListItemId])

  return (
    <>
      <Drawer
        variant='temporary'
        open={sideDrawerOpen}
        onClose={closeDrawer}
        sx={{
          // Mobile, fullscreen width
          '&.MuiDrawer-modal': {
            width: '66%',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem>
              <ButtonGroup>
                <RandomItemButton />
                <NewItemButton />
                <ImportButton />
                <ExportButton />
              </ButtonGroup>
            </ListItem>
            <hr />
            <ButtonGroup sx={{ display: 'flex', justifyContent: 'space-around' }}>
              <IconButton disabled={disableSetFocusedItem} onClick={setFocusedItem}>
                <Visibility />
              </IconButton>
              <IconButton disabled={!focusedListItemId} onClick={deleteFocusedListItemById}>
                <Delete />
              </IconButton>
              <IconButton disabled={!canSchedule} onClick={openSchedulingDialog}>
                <Schedule />
              </IconButton>
            </ButtonGroup>
            <hr />
            <ItemListFilter value={filterString} setValue={setFilterString} />
            <PaginatedItemList filterString={filterString} />
          </List>
          <hr />
          <List>
            <ListItem>
              <Typography>
                Name: {focusedListItem?.name}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                Milliseconds: {focusedListItem?.duration}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                Child Count: {focusedListItem?.children.length}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                Parent Count: {focusedListItem?.parents.length}
              </Typography>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <TimeInputProvider>
        <SchedulingDialog />
      </TimeInputProvider>
    </>
  )
}
