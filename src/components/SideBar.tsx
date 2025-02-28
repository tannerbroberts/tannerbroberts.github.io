import { Box, Drawer, List, ListItem, Toolbar } from "@mui/material";
import { useAppDispatch, useAppState } from "../context/App";
import { useCallback } from "react";
import AboutTimeList from "./AboutTimeList";
import RandomItemButton from "./RandomItemButton.tsx";
import NewItemButton from "./NewItemButton.tsx";

export default function SideBar() {
  const { sideDrawerOpen } = useAppState()
  const appDispatch = useAppDispatch()

  const closeDrawer = useCallback(() => {
    appDispatch({ type: 'SET_SIDE_DRAWER_OPEN', payload: { sideDrawerOpen: false } })
  }, [appDispatch])

  return (
    <Drawer
      variant='temporary'
      open={sideDrawerOpen}
      onClose={closeDrawer}
      sx={{
        '& .MuiDrawer-paper': {
          width: '440px',
        },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItem>
            <RandomItemButton />
          </ListItem>
          <ListItem>
            <NewItemButton />
          </ListItem>
          <AboutTimeList />
        </List>
      </Box>
    </Drawer>
  )
}
