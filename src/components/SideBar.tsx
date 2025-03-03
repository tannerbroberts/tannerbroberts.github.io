import { Box, Drawer, List, ListItem, Toolbar } from "@mui/material";
import { useAppDispatch, useAppState } from "../context/App";
import { useCallback } from "react";
import PaginatedItemList from "./PaginatedItemList";
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
        // Mobile, fullscreen width
        '&.MuiDrawer-modal': {
          width: '100%',
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
          <PaginatedItemList />
        </List>
      </Box>
    </Drawer>
  )
}
