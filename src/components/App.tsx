import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useAppDispatch, useAppState } from '../context/App';
import { Button } from '@mui/material';
import Header from './Header';
import MainBody from './MainBody';

const drawerWidth = 'min(33vw, max(50vw, 240px)';

export default function App() {
  const { sideDrawerOpen, items } = useAppState()
  const appDispatch = useAppDispatch()

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Drawer
        variant='temporary'
        anchor='left'
        open={sideDrawerOpen}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem>
              <Button variant='contained' onClick={() => appDispatch({ type: 'CREATE_ITEM', payload: { name: 'New Item', duration: Math.floor(Math.random() * 10_000) } })}>
                Create Item
              </Button>
            </ListItem>
            {items.map((item) => {
              return (
                <ListItem key={item.id}>
                  <ListItemText primary={item.name} secondary={item.duration} />
                </ListItem>
              )
            })}
          </List>
        </Box>
      </Drawer>
      <MainBody />
    </Box>
  );
}
