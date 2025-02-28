import { Button } from "@mui/material";
import { useCallback } from "react";
import { v4 as uuid } from "uuid";
import { useAppDispatch, useAppState } from "../context/App";
import getRandomName from "../store/utils/getRandomName";
import { Child, getItemById, Item } from "../store/utils/item";

export default function CreateRandomItemFromTemplatesButton() {
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

  return (
    <Button variant='contained' onClick={createRandomItemFromTemplates}>
      RANDOM
    </Button>
  )
}
