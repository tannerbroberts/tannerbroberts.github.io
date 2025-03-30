import { useAppState } from "../context/App"
import { getItemById } from "../store/utils/item"
import ItemSchedule from "./ItemSchedule"
import LedgerLines from "./LedgerLines"

export default function MainBody() {
  const { focusedItemId, items } = useAppState()
  const focusedItem = getItemById(items, focusedItemId)

  return (
    <div style={{ marginTop: 100, margin: 50, width: '100%', position: 'relative' }}>
      {focusedItem &&
        <>
          <LedgerLines />
          <ItemSchedule item={focusedItem} />
        </>
      }
    </div>
  )
}
