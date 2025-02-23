import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { useAppDispatch, useAppState } from '../context/App';
import { Button } from '@mui/material';
import Header from './Header';
import MainBody from './MainBody';
import { useCallback } from 'react';
import AboutTimeItemList from './AboutTimeList';
import { Child, getItemById, Item } from '../store/utils/item';
import getRandomName from '../store/utils/getRandomName';

// TODO: Build view for the creation of a new item with already created items available as children
// Each item only shows if it's the same or less duration than the item being created
// Each item can be dragged and dropped to change the order of the children
// No dead space between children... I know, weird
// Maybe the length isn't specified to begin with, rather, the length of the item being created is the sum of the children's lengths...
// Unless, of course, the item HAS no children, in which case, a length would be required.

export default function App() {
  const { sideDrawerOpen, items } = useAppState()
  const appDispatch = useAppDispatch()

  const createRandomItemFromTemplates = useCallback(() => {

    const generateRandomNonOverlappingChildrenFromItems = (duration: number) => {
      const children: Array<Child> = []
      for (const item of items) {
        // Skip items that are too long
        if (item.duration > duration) continue

        // Determine if this item can fit within the remaining duration time, taking into account the space taken by the currently scheduled children
        let nextAvailableMoment = 0;
        if (children.length) {
          const lastChildIndex = children.length - 1
          const lastChild = children[lastChildIndex]
          const { id, start } = lastChild
          const lastChildItem = getItemById(items, id) as Item
          if (!lastChild) throw new Error(`A child was added by ID during generation of random non-overlapping children, but the id used to add it was not found in the items list`)
          nextAvailableMoment = start + lastChildItem.duration
        }
        if (nextAvailableMoment + item.duration > duration) continue
        children.push({ id: item.id, start: nextAvailableMoment })
      }
      return children
    }

    const name = getRandomName()
    const duration = Math.floor(Math.random() * 10_000)
    const children = generateRandomNonOverlappingChildrenFromItems(duration)
    const payload = { name, duration, children }
    appDispatch({ type: 'CREATE_ITEM', payload })
  }, [appDispatch, items])

  const closeDrawer = useCallback(() => {
    appDispatch({ type: 'CLOSE_SIDE_DRAWER' })
  }, [appDispatch])

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <Drawer
        variant='temporary'
        open={sideDrawerOpen}
        onClose={closeDrawer}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem>
              <Button variant='contained' onClick={createRandomItemFromTemplates}>
                Create Item
              </Button>
            </ListItem>
            <AboutTimeItemList />
          </List>
        </Box>
      </Drawer>
      <MainBody />
    </Box>
  );
}
