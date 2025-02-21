import { Box } from "@mui/material"
import useTracking from "./hooks.ts/useTracking"


export default function Error404() {
  useTracking("Example")
  return <Box sx={{ 
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    height: "100vh",
    width: "100vw",
   }}>
    <h1>404 - Not Found</h1>
    <Box>
    <h3>"Because someone erased it from the archive memories"</h3>
    <p>-padawan learner</p>
    </Box>
  </Box>
}