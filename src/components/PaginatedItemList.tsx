import { useCallback, useMemo, useEffect, useState } from "react"
import { useAppDispatch, useAppState } from "../reducerContexts/App"
import AboutTimeListItem from "./AboutTimeListItem"
import { Pagination } from "@mui/material"
import { DEFAULT_WINDOW_RANGE_SIZE } from "../functions/reducers/AppReducer"

interface PaginatedItemListProps {
  readonly filterString: string;
  readonly filteredItemIds?: string[]; // Item IDs from variable filtering
}

export default function PaginatedItemList({ filterString, filteredItemIds }: PaginatedItemListProps) {
  const { items, itemSearchWindowRange: { min, max } } = useAppState()
  const appDispatch = useAppDispatch()

  // Track which filtering mode is active
  const [usingVariableFilter, setUsingVariableFilter] = useState(false);

  // Update filtering mode when filteredItemIds changes
  useEffect(() => {
    setUsingVariableFilter(!!filteredItemIds);
  }, [filteredItemIds]);

  // Virtualize the list
  const sortedByDurationItems = useMemo(() => [...items].sort((a, b) => a.duration - b.duration), [items])

  const filteredItems = useMemo(() => {
    // If we have variable filter results, use those
    if (usingVariableFilter && filteredItemIds) {
      const filteredItemsMap = new Set(filteredItemIds);
      return sortedByDurationItems.filter(item => filteredItemsMap.has(item.id));
    }

    // Otherwise use name filtering
    if (!filterString) return sortedByDurationItems
    return sortedByDurationItems.filter(item => item.name.toLowerCase().includes(filterString.toLowerCase()))
  }, [filterString, sortedByDurationItems, filteredItemIds, usingVariableFilter])

  // Reset pagination to first page when filter changes
  useEffect(() => {
    const currentPage = Math.floor(min / DEFAULT_WINDOW_RANGE_SIZE) + 1
    const totalPages = Math.ceil(filteredItems.length / DEFAULT_WINDOW_RANGE_SIZE)

    // If current page is beyond the available pages, reset to page 1
    if (currentPage > totalPages && totalPages > 0) {
      appDispatch({
        type: 'SET_ITEM_SEARCH_WINDOW_RANGE',
        payload: { min: 0, max: DEFAULT_WINDOW_RANGE_SIZE }
      })
    }
  }, [filteredItems.length, min, appDispatch])

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
