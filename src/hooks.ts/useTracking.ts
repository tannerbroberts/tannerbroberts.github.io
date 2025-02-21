import { useEffect } from "react"
import { useAppDispatchContext } from "../AppContext"

export default function useTracking(pageName: string) {
  const dispatch = useAppDispatchContext()
  useEffect(() => {
    dispatch({ type: "ADD_PAGE_TO_VIEWED_PAGES", payload: pageName })
  }, [pageName, dispatch])
}
