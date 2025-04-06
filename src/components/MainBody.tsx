import { useAppState } from "../reducerContexts/App"
import { getItemById } from "../functions/utils/item"
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
