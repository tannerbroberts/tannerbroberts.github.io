import { Delete, Schedule, Timer, PlaylistAdd, Functions, Close } from "@mui/icons-material";
import { Box, ButtonGroup, Drawer, IconButton, List, ListItem, Toolbar, Typography } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useAppDispatch, useAppState } from "../reducerContexts";
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
  const { sideDrawerOpen, focusedItemId, selectedItemId, items, schedulingMode } = useAppState()
  const appDispatch = useAppDispatch()

  const [filterString, setFilterString] = useState('')
  const [filteredItemIds, setFilteredItemIds] = useState<string[] | null>(null)
  const [variableDialogOpen, setVariableDialogOpen] = useState(false)

  const closeDrawer = useCallback(() => {
    appDispatch({
      type: 'BATCH', payload: [
        { type: 'SET_SIDE_DRAWER_OPEN', payload: { sideDrawerOpen: false } },
        { type: 'SET_SCHEDULING_MODE', payload: { schedulingMode: false } },
        { type: 'SET_DURATION_DIALOG_OPEN', payload: { durationDialogOpen: false } }
      ]
    })
  }, [appDispatch])

  const deleteFocusedItemById = useCallback(() => {
    appDispatch({ type: 'DELETE_ITEM_BY_ID', payload: { id: focusedItemId } })
  }, [appDispatch, focusedItemId])

  const openSchedulingDialog = useCallback(() => {
    appDispatch({ type: 'SET_SCHEDULING_DIALOG_OPEN', payload: { schedulingDialogOpen: true } })
  }, [appDispatch])

  const openDurationDialog = useCallback(() => {
    appDispatch({
      type: 'BATCH', payload: [
        { type: 'SET_SCHEDULING_MODE', payload: { schedulingMode: true } },
        { type: 'SET_DURATION_DIALOG_OPEN', payload: { durationDialogOpen: true } }
      ]
    })
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

  const selectedItem = useMemo(() => {
    if (!selectedItemId) return null
    return getItemById(items, selectedItemId)
  }, [selectedItemId, items])

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

  // If entering scheduling mode from a SubCalendar, pre-filter list to show only items that fit
  const durationFilterIds = useMemo(() => {
    if (!schedulingMode || !(focusedItem instanceof SubCalendarItem)) return null;

    // Build occupied intervals from existing children
    const intervals: Array<{ start: number; end: number }> = focusedItem.children
      .map(c => {
        const d = getItemById(items, c.id)?.duration ?? 0;
        return { start: c.start, end: c.start + d };
      })
      .filter(iv => iv.end > iv.start)
      .sort((a, b) => a.start - b.start);

    // Compute largest available gap in [0, focusedItem.duration)
    let maxGap = 0;
    let cursor = 0;
    for (const iv of intervals) {
      if (iv.start > cursor) {
        maxGap = Math.max(maxGap, iv.start - cursor);
      }
      cursor = Math.max(cursor, iv.end);
    }
    if (focusedItem.duration > cursor) {
      maxGap = Math.max(maxGap, focusedItem.duration - cursor);
    }
    if (intervals.length === 0) {
      maxGap = focusedItem.duration;
    }

    const ids = items
      .filter(i => i.id !== focusedItem.id && i.duration > 0 && i.duration <= maxGap)
      .map(i => i.id);
    return ids.length ? ids : null;
  }, [schedulingMode, focusedItem, items])

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
            {!schedulingMode && (
              <ListItem>
                <ButtonGroup>
                  <RandomItemButton />
                  <NewItemButton />
                  <ImportButton />
                  <ExportButton />
                </ButtonGroup>
              </ListItem>
            )}
            <hr />
            <ButtonGroup sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
              {schedulingMode ? (
                <>
                  <Typography variant="body2" sx={{ flex: 1, px: 1 }}>
                    Schedule into: {focusedItem?.name ?? '—'}
                  </Typography>
                  <IconButton onClick={closeDrawer}>
                    <Close />
                  </IconButton>
                </>
              ) : (
                <>
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
                  ) : (
                    <IconButton disabled={!canSchedule} onClick={openSchedulingDialog}>
                      <Schedule />
                    </IconButton>
                  )}
                </>
              )}
            </ButtonGroup>
            <hr />
            <ItemListFilter
              value={filterString}
              setValue={setFilterString}
              onFilteredItemsChange={setFilteredItemIds}
              hideVariableFilter={schedulingMode}
            />
            <PaginatedItemList
              filterString={filterString}
              filteredItemIds={(schedulingMode && durationFilterIds) ? durationFilterIds : (filteredItemIds ?? undefined)}
            />
          </List>
          <hr />

          {/* Child Scheduling Mode Indicator */}
          {schedulingMode && (
            <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1, mx: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.contrastText' }}>
                🎯 Child Scheduling Mode
              </Typography>
              <Typography variant="caption" sx={{ color: 'primary.contrastText' }}>
                Click items below to select as child templates
              </Typography>
            </Box>
          )}

          {!schedulingMode && (
            <List>
              <ListItem>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                  Focused Item (Parent):
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  Name: {focusedItem?.name || 'None'}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  Duration: {focusedItem?.duration || 0}ms
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  Child Count: {focusedItem ? getChildren(focusedItem).length : 0}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  Parent Count: {focusedItem?.parents.length || 0}
                </Typography>
              </ListItem>

              <ListItem>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                  Selected Item (Child):
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  Name: {selectedItem?.name || 'None'}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography>
                  Duration: {selectedItem?.duration || 0}ms
                </Typography>
              </ListItem>
            </List>
          )}
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
