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
{/* TODO: This is the place where the base calendar/schedule will go. All other views above based on the currently focusedItem are edit views, but this view will be the one for execution of tasks that the user has actually scheduled in their life, as opposed to just having the task in their library, or scheduled inside of another task. */}
    </div>
  )
}
