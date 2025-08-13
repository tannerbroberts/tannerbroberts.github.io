import { useAppState } from "../reducerContexts"
import { getItemById } from "../functions/utils/item/index"
import { useViewportHeight } from "../hooks/useViewportHeight"

interface LedgerLinesProps {
  millisecondsPerSegmentOverride?: number;
  forcedHeightPx?: number;
}

const formatTime = (ms: number) => {
  const milliseconds = ms % 1000
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString()}`
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${milliseconds.toString()}`
}

export default function LedgerLines({ millisecondsPerSegmentOverride, forcedHeightPx }: LedgerLinesProps = {}) {
  const { focusedItemId, items, millisecondsPerSegment, pixelsPerSegment } = useAppState()
  const viewportHeight = useViewportHeight()
  const focusedItem = getItemById(items, focusedItemId)

  if (!focusedItem) return null

  const msPerSeg = millisecondsPerSegmentOverride ?? millisecondsPerSegment
  const naturalHeight = focusedItem.duration * pixelsPerSegment / msPerSeg
  const maxHeight = viewportHeight * 2
  const computedHeight = Math.min(naturalHeight, maxHeight)
  const totalHeight = forcedHeightPx ?? computedHeight

  // Calculate number of lines based on time segments
  const numberOfLines = Math.floor(totalHeight / pixelsPerSegment)

  const shouldShowLabel = (index: number) => {
    if (index === 0) return false
    if (pixelsPerSegment <= 20) return index % 10 === 0
    if (pixelsPerSegment < 50) return index % 5 === 0
    return true
  }

  return (
    <div style={{ position: 'absolute', width: '100%', height: totalHeight + 'px', zIndex: 0 }}>
      {Array.from({ length: numberOfLines + 1 }, (_, i) => {
        const timeAtLine = i * msPerSeg
        const linePosition = i * pixelsPerSegment
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: `${linePosition}px`,
              height: 10,
              width: '90%',
              borderTop: '2px solid rgba(0, 0, 0, 0.2)',
              display: 'flex',
            }}
          >
            {shouldShowLabel(i) && (
              <span style={{
                fontSize: '12px',
                color: 'rgba(0, 0, 0, 0.6)',
                marginLeft: '8px',
                userSelect: 'none',
              }}>
                {formatTime(timeAtLine)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
