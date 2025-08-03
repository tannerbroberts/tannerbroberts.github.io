import { Delete, Schedule, Timer, PlaylistAdd, Functions } from "@mui/icons-material";
import { Box, ButtonGroup, Drawer, IconButton, List, ListItem, Toolbar, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts/App";
import { TimeInputProvider } from "../reducerContexts/TimeInput";
import { getItemById, getChildren, CheckListItem, SubCalendarItem } from "../functions/utils/item/index";
import ExportButton from "./ExportButton";
import ImportButton from "./ImportButton";
import ItemListFilter from "./ItemListFilter";
import NewItemButton from "./NewItemButton";
import PaginatedItemList from "./PaginatedItemList";
import RandomItemButton from "./RandomItemButton";
import SchedulingDialog from "./SchedulingDialog";
import DurationDialog from "./DurationDialog";
import CheckListChildDialog from "./CheckListChildDialog";
import VariableManagementDialog from "./VariableManagementDialog";
import CreateNewItemDialog from "./CreateNewItemDialog";

export default function SideBar() {
  const { sideDrawerOpen, focusedItemId, items } = useAppState()
  const appDispatch = useAppDispatch()

  const [filterString, setFilterString] = useState('')
  const [filteredItemIds, setFilteredItemIds] = useState<string[]>([])
  const [variableDialogOpen, setVariableDialogOpen] = useState(false)

  const closeDrawer = useCallback(() => {
    appDispatch({ type: 'SET_SIDE_DRAWER_OPEN', payload: { sideDrawerOpen: false } })
  }, [appDispatch])

  const deleteFocusedItemById = useCallback(() => {
    appDispatch({ type: 'DELETE_ITEM_BY_ID', payload: { id: focusedItemId } })
  }, [appDispatch, focusedItemId])

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

  const canSchedule = useMemo(() => {
    // Can always schedule to the base calendar
    return true
  }, [])

  const canAddToChecklist = useMemo(() => {
    if (!focusedItem) return false
    return focusedItem instanceof CheckListItem
  }, [focusedItem])

  const canScheduleIntoFocusedItem = useMemo(() => {
    if (!focusedItem) return false
    return focusedItem instanceof SubCalendarItem
  }, [focusedItem])

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
              <IconButton disabled={!focusedItemId} onClick={deleteFocusedItemById}>
                <Delete />
              </IconButton>

              {focusedItemId ? (
                <>
                  <IconButton disabled={!canScheduleIntoFocusedItem} onClick={openDurationDialog}>
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
                Name: {focusedItem?.name}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                Milliseconds: {focusedItem?.duration}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                Child Count: {focusedItem ? getChildren(focusedItem).length : 0}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                Parent Count: {focusedItem?.parents.length}
              </Typography>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      <TimeInputProvider>
        <SchedulingDialog />
        <DurationDialog />
        <CheckListChildDialog />
        <CreateNewItemDialog />
      </TimeInputProvider>
      <VariableManagementDialog
        open={variableDialogOpen}
        onClose={closeVariableDialog}
        itemId={focusedItemId}
      />
    </>
  )
}
