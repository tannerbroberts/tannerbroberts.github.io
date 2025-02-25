import { useAppState } from "../context/App"
import { getItemById } from "../store/utils/item"
import ItemSchedule from "./ItemSchedule"

export default function MainBody() {
  const { focusedItemId, items } = useAppState()
  const focusedItem = getItemById(items, focusedItemId)

  return (
    <div style={{ margin: 50, width: '100%' }}>
      {focusedItem &&
        <>
          <ItemSchedule item={focusedItem} />
        </>
      }
    </div>
  )
}
