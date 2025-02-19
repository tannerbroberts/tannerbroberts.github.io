import { Outlet } from "react-router";
import { Box, Tab, Tabs } from "@mui/material";
import { useAppDispatchContext, useAppStateContext } from "./AppContext";

export default function Search() {
  const { selectedTabIndex } = useAppStateContext();
  const appDispatch = useAppDispatchContext();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",

        height: "100vh",
        width: "100vw",

        overflow: "clip",
      }}>
      <Tabs
      value={selectedTabIndex}
      onChange={(_, newValue) => appDispatch({ type: "SET_TAB_INDEX", payload: newValue })}
      variant="fullWidth"
      textColor="primary"
      indicatorColor="primary"
      >
        <Tab label="All" />
        <Tab label="Frontend" />
        <Tab label="Backend" />
        <Tab label="Full Stack" />
      </Tabs>
      <Outlet />
    </Box>
  );
}
