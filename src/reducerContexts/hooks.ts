import { useContext } from "react";
import { StateContext, DispatchContext } from "./contexts";

export function useAppState() {
  const context = useContext(StateContext);
  if (context === null) {
    throw new Error("useAppState must be used within AppProvider");
  }
  return context;
}

export function useAppDispatch() {
  const context = useContext(DispatchContext);
  if (context === null) {
    throw new Error("useAppDispatch must be used within AppProvider");
  }
  return context;
}
