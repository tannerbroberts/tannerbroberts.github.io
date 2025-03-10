import { useCallback, useMemo } from "react"
import { useAppDispatch, useAppState } from "../context/App.ts"
import AboutTimeListItem from "./AboutTimeListItem.tsx"
import { Pagination } from "@mui/material"
import { DEFAULT_WINDOW_RANGE_SIZE } from "../store/reducers/AppReducer.ts"

export default function PaginatedItemList({ filterString }: { filterString: string }) {
  const { items, itemSearchWindowRange: { min, max } } = useAppState()

  const appDispatch = useAppDispatch()
  // Virtualize the list
  const sortedByDurationItems = useMemo(() => [...items].sort((a, b) => a.duration - b.duration), [items])
  const filteredItems = useMemo(() => {
    if (!filterString) return sortedByDurationItems
    return sortedByDurationItems.filter(item => item.name.toLowerCase().includes(filterString.toLowerCase()))
  }, [filterString, sortedByDurationItems])

  const paginatedItems = useMemo(() => {
    const minDuration = min
    const maxDuration = max
    return filteredItems.slice(minDuration, maxDuration)
  }, [min, max, filteredItems])

  const totalItemPages = useMemo(() => Math.ceil(filteredItems.length / DEFAULT_WINDOW_RANGE_SIZE), [filteredItems])

  const handlePageChange = useCallback((_event: React.ChangeEvent<unknown>, value: number) => {
    const minDuration = (value - 1) * DEFAULT_WINDOW_RANGE_SIZE
    const maxDuration = value * DEFAULT_WINDOW_RANGE_SIZE
    appDispatch({ type: 'SET_ITEM_SEARCH_WINDOW_RANGE', payload: { min: minDuration, max: maxDuration } })
  }, [appDispatch])

  return (
    <>
      <Pagination count={totalItemPages} onChange={handlePageChange} page={min / DEFAULT_WINDOW_RANGE_SIZE + 1} />
      {paginatedItems.map(item => <AboutTimeListItem key={item.id} item={item} />)}
    </>
  )
}
