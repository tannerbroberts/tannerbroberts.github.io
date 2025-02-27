import { Box, Drawer, List, Toolbar } from "@mui/material";
import { useAppDispatch, useAppState } from "../context/App";
import { useCallback, useRef } from "react";
import AboutTimeList from "./AboutTimeList";
import CreateRandomItemFromTemplatesButton from "./CreateRandomItemFromTemplatesButton.tsx";

export default function SideBar() {
  const { sideDrawerOpen } = useAppState()
  const appDispatch = useAppDispatch()

  const closeDrawer = useCallback(() => {
    appDispatch({ type: 'SET_SIDE_DRAWER_OPEN', payload: { sideDrawerOpen: false } })
  }, [appDispatch])

  const mountedRef = useRef(false)

  return (
    <Drawer
      variant='temporary'
      open={sideDrawerOpen}
      onClose={closeDrawer}
      sx={{ width: '33vw' }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <CreateRandomItemFromTemplatesButton mountedRef={mountedRef} />
          <AboutTimeList />
        </List>
      </Box>
    </Drawer>
  )
}
