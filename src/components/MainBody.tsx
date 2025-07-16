import { useAppState } from "../reducerContexts/App"
import { getItemById } from "../functions/utils/item"
import ItemSchedule from "./ItemSchedule"
import LedgerLines from "./LedgerLines"
import ExecutionView from "./ExecutionView"

export default function MainBody() {
  const { focusedItemId, items } = useAppState()
  const focusedItem = getItemById(items, focusedItemId)

  return (
    <div style={{ marginTop: 100, margin: 50, width: '100%', position: 'relative' }}>
      {focusedItem ? (
        <>
          <LedgerLines />
          <ItemSchedule item={focusedItem} />
        </>
      ) : (
        /* Execution View - Shows the base calendar and current task execution */
        <ExecutionView />
      )}
    </div>
  )
}
