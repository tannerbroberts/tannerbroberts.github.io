import { useCallback, useMemo } from "react"
import { useAppDispatch, useAppState } from "../context/App"
import AboutTimeListItem from "./AboutTimeListItem.tsx"
import { Pagination } from "@mui/material"

export default function AboutTimeList() {
  const { items, itemSearchWindowRange: { min, max } } = useAppState()
  const appDispatch = useAppDispatch()
  // Virtualize the list
  const sortedByDurationItems = useMemo(() => [...items].sort((a, b) => a.duration - b.duration), [items])

  const paginatedItems = useMemo(() => {
    const minDuration = min
    const maxDuration = max
    return sortedByDurationItems.slice(minDuration, maxDuration)
  }, [min, max, sortedByDurationItems])

  const totalItemPages = useMemo(() => Math.ceil(sortedByDurationItems.length / 4), [sortedByDurationItems])

  const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, value: number) => {
    const minDuration = (value - 1) * 4
    const maxDuration = value * 4
    appDispatch({ type: 'SET_ITEM_SEARCH_WINDOW_RANGE', payload: { min: minDuration, max: maxDuration } })
  }, [appDispatch])

  return (
    <>
      <Pagination count={totalItemPages} onChange={handlePageChange} page={min / 4 + 1} />
      {paginatedItems.map(item => <AboutTimeListItem key={item.id} item={item} />)}
    </>
  )
}
