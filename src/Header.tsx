import { AppBar, Box, IconButton } from "@mui/material";
import { Link, Outlet, useLocation } from "react-router";
import useTracking from "./hooks.ts/useTracking";
import { ArrowBack } from "@mui/icons-material";

const PATH_TITLE_MAP: Record<string, string> = {
  "/": "Home", // Never shows, the header is only shown starting on /search
  "/projects": "Search Projects",
  "/projects/mazeGenerator": "Maze Generator",
}

export default function Header() {
  useTracking("Header")
  const location = useLocation()
  const pathname = location.pathname
  const title = PATH_TITLE_MAP[pathname]
  const showBackButton = pathname !== "/projects"

  return (
    <Box
      sx={{
        display: "flex",
        position: "relative",
        flexDirection: "column",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        overflow: "clip",
      }}
    >
      <AppBar
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          position: "sticky",
          top: 0,
        }}>
        <IconButton component={Link} to="/projects">
          <ArrowBack fontSize="large"
            sx={{
              margin: "0 1rem",
              transition: "all 0.5s",
              width: showBackButton ? "auto" : 0,
            }} />
        </IconButton>
        <h1>{title}</h1>
      </AppBar>
      <Outlet />
    </Box>
  )
}
