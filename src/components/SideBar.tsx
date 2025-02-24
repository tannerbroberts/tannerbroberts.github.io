import { Box, Button, Drawer, List, ListItem, Toolbar } from "@mui/material";
import { useAppDispatch, useAppState } from "../context/App";
import { useCallback } from "react";
import AboutTimeList from "./AboutTimeList";
import { Child, getItemById, Item } from "../store/utils/item";
import getRandomName from "../store/utils/getRandomName";

export default function SideBar() {
  const { items, sideDrawerOpen } = useAppState()
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
    <Drawer
        variant='temporary'
        open={sideDrawerOpen}
        onClose={closeDrawer}
        sx={{ width: '33vw'}}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItem>
              <Button variant='contained' onClick={createRandomItemFromTemplates}>
                Create Item
              </Button>
            </ListItem>
            <AboutTimeList />
          </List>
        </Box>
      </Drawer>
  )
}