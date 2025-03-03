import { Dialog } from "@mui/material";
import { useCallback } from "react";
import { useAppDispatch, useAppState } from "../context/App";

export default function SchedulingDialog() {
  const { schedulingDialogOpen } = useAppState()
  const dispatch = useAppDispatch()

  const handleClose = useCallback(() => {
    dispatch({ type: 'SET_SCHEDULING_DIALOG_OPEN', payload: { schedulingDialogOpen: false } })
  }, [dispatch])

  return (
    <Dialog open={schedulingDialogOpen} onClose={handleClose}>
      
    </Dialog>
  )
}