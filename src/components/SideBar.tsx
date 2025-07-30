import { Delete, Schedule, Visibility, Timer, PlaylistAdd, Functions } from "@mui/icons-material";
import { Box, ButtonGroup, Drawer, IconButton, List, ListItem, Toolbar, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts/App";
import { TimeInputProvider } from "../reducerContexts/TimeInput";
import { getItemById, getChildren, CheckListItem } from "../functions/utils/item/index";
import ExportButton from "./ExportButton";
import ImportButton from "./ImportButton";
import ItemListFilter from "./ItemListFilter";
import NewItemButton from "./NewItemButton";
import PaginatedItemList from "./PaginatedItemList";
import RandomItemButton from "./RandomItemButton";
import SchedulingDialog from "./SchedulingDialog";
import DurationDialog from "./DurationDialog";
import CheckListChildDialog from "./CheckListChildDialog";
import VariableManagementDialog from "./dialogs/VariableManagementDialog";

export default function SideBar() {
  const { sideDrawerOpen, focusedItemId, focusedListItemId, items } = useAppState()
  const appDispatch = useAppDispatch()

  const [filterString, setFilterString] = useState('')
  const [filteredItemIds, setFilteredItemIds] = useState<string[]>([])
  const [variableDialogOpen, setVariableDialogOpen] = useState(false)

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

  const openDurationDialog = useCallback(() => {
    appDispatch({ type: 'SET_DURATION_DIALOG_OPEN', payload: { durationDialogOpen: true } })
  }, [appDispatch])

  const openCheckListChildDialog = useCallback(() => {
    appDispatch({ type: 'SET_CHECKLIST_CHILD_DIALOG_OPEN', payload: { checkListChildDialogOpen: true } })
  }, [appDispatch])

  const openVariableDialog = useCallback(() => {
    setVariableDialogOpen(true)
  }, [])

  const closeVariableDialog = useCallback(() => {
    setVariableDialogOpen(false)
  }, [])

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
    if (!focusedItem) return true // Can always schedule to the base calendar
    if (!focusedListItem) return false
    if (focusedItem.id === focusedListItem.id) return false
    if (focusedItem.duration < focusedListItem.duration) return false
    return true
  }, [focusedItem, focusedListItem])

  const disableSetFocusedItem = useMemo(() => {
    if (!focusedListItemId) return true
    if (focusedItemId === focusedListItemId) return true
  }, [focusedItemId, focusedListItemId])

  const canAddToChecklist = useMemo(() => {
    if (!focusedListItem || !focusedItem) return false
    if (focusedItem.id === focusedListItem.id) return false // Can't add to itself
    return focusedItem instanceof CheckListItem
  }, [focusedItem, focusedListItem])

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

              {focusedItemId ? (
                <>
                  <IconButton disabled={!focusedListItemId} onClick={openDurationDialog}>
                    <Timer />
                  </IconButton>
                  <IconButton disabled={!canAddToChecklist} onClick={openCheckListChildDialog}>
                    <PlaylistAdd />
                  </IconButton>
                  <IconButton disabled={!focusedItemId} onClick={openVariableDialog}>
                    <Functions />
                  </IconButton>
                </>
              ) : (<IconButton disabled={!canSchedule} onClick={openSchedulingDialog}>
                <Schedule />
              </IconButton>)}
            </ButtonGroup>
            <hr />
            <ItemListFilter
              value={filterString}
              setValue={setFilterString}
              onFilteredItemsChange={setFilteredItemIds}
            />
            <PaginatedItemList
              filterString={filterString}
              filteredItemIds={filteredItemIds}
            />
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
                Child Count: {focusedListItem ? getChildren(focusedListItem).length : 0}
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
        <DurationDialog />
        <CheckListChildDialog />
      </TimeInputProvider>
      <VariableManagementDialog
        open={variableDialogOpen}
        onClose={closeVariableDialog}
        itemId={focusedItemId}
      />
    </>
  )
}
