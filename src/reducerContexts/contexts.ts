import { createContext } from "react";
import type { AppAction, AppState } from "../functions/reducers/AppReducer";

// Centralized contexts so provider and hooks can share without triggering react-refresh warnings
export const StateContext = createContext<AppState | null>(null);
export const DispatchContext = createContext<React.Dispatch<AppAction> | null>(null);
