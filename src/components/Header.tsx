import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { Menu, MenuOpen } from '@mui/icons-material';
import { useAppDispatch, useAppState } from '../context/App';


export default function Header() {
  const { sideDrawerOpen } = useAppState()
  const appDispatch = useAppDispatch()

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          onClick={() => appDispatch({ type: 'TOGGLE_SIDE_DRAWER' })}
          color="inherit"
          aria-label="open drawer"
          edge="start"
        >
          {sideDrawerOpen ? <MenuOpen /> : <Menu />}
        </IconButton>
        <Typography variant="h6" noWrap component="div">
          About Time
        </Typography>
      </Toolbar>
    </AppBar>
  )
}