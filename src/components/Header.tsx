import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { Menu, MenuOpen, Update } from '@mui/icons-material';
import { useAppDispatch, useAppState } from '../context/App';
import { getItemById } from '../store/utils/item';
import { useMemo } from 'react';


export default function Header() {
  const { sideDrawerOpen, items, focusedItemId } = useAppState()
  const appDispatch = useAppDispatch()

  const focusedItem = useMemo(() => {
    return getItemById(items, focusedItemId)
  }, [focusedItemId, items])

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          onClick={() => appDispatch({ type: 'SET_SIDE_DRAWER_OPEN', payload: { sideDrawerOpen: !sideDrawerOpen } })}
          color="inherit"
          aria-label="open drawer"
          edge="start"
        >
          {sideDrawerOpen ? <MenuOpen /> : <Menu />}
        </IconButton>
        {/* Render the Update icon with blue and gray colors with a large size */}
        <Update sx={{ color: 'skyblue', fontSize: "50px" }} />
        <Typography variant="h4" noWrap component="div">
          {focusedItem ? focusedItem.name : 'About Time'}
        </Typography>
      </Toolbar>
    </AppBar>
  )
}
