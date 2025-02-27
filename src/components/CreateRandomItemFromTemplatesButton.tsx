import { Button, ListItem } from "@mui/material";
import { useCallback, useEffect } from "react";
import { Child, Item } from "../store/utils/item";
import { useAppDispatch, useAppState } from "../context/App";
import { getItemById } from "../store/utils/item";
import getRandomName from "../store/utils/getRandomName";
import { v4 as uuid } from "uuid";

export default function CreateRandomItemFromTemplatesButton({ mountedRef }: { mountedRef: React.MutableRefObject<boolean> }) {
  const { items } = useAppState()
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
        const { id } = item
        const relationshipId = uuid()
        children.push(new Child(id, relationshipId, nextAvailableMoment))
      }
      return children
    }

    const name = getRandomName()
    const duration = Math.floor(Math.random() * 10_000)
    const children = generateRandomNonOverlappingChildrenFromItems(duration)
    const id = uuid()
    const payload = { id, name, duration, children }
    appDispatch({ type: 'CREATE_ITEM', payload })
  }, [appDispatch, items])

  useEffect(() => {
    // call createRandomItemFromTemplates 30 times when the component mounts
    if (mountedRef.current) return
    for (let i = 0; i < 30; i++) {
      createRandomItemFromTemplates()
    }
    mountedRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <ListItem>
      <Button variant='contained' onClick={createRandomItemFromTemplates}>
        Create Item
      </Button>
    </ListItem>
  )
}
