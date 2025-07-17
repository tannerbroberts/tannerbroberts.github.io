import { useAppState } from "../reducerContexts/App"
import { getItemById } from "../functions/utils/item"
import { useViewportHeight } from "../hooks/useViewportHeight"
import ItemSchedule from "./ItemSchedule"
import LedgerLines from "./LedgerLines"
import ExecutionView from "./ExecutionView"

export default function MainBody() {
  const { focusedItemId, items, millisecondsPerSegment, pixelsPerSegment } = useAppState()
  const viewportHeight = useViewportHeight()
  const focusedItem = getItemById(items, focusedItemId)

  // Calculate if the focused item would exceed maximum height
  const itemExceedsMaxHeight = focusedItem &&
    (focusedItem.duration * pixelsPerSegment / millisecondsPerSegment) > (viewportHeight * 2)

  return (
    <div style={{
      marginTop: 100,
      margin: 50,
      width: '100%',
      position: 'relative',
      // Add overflow scrolling when items exceed maximum height
      ...(itemExceedsMaxHeight && {
        maxHeight: `${viewportHeight * 2}px`,
        overflowY: 'auto',
        border: '2px solid rgba(255, 165, 0, 0.8)', // Orange border to indicate truncation
        borderRadius: '4px',
        padding: '8px'
      })
    }}>
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
