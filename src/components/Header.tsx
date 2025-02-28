import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { Menu, MenuOpen } from '@mui/icons-material';
import { useAppDispatch, useAppState } from '../context/App';


export default function Header() {
  const { sideDrawerOpen, items } = useAppState()
  const appDispatch = useAppDispatch()

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
        <Typography variant="h6" noWrap component="div">
          About Time {items.length}
        </Typography>
      </Toolbar>
    </AppBar>
  )
}
