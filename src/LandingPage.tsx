import { Box, Button } from "@mui/material";
import { Link } from "react-router";
import useTracking from "./hooks.ts/useTracking";

export default function LandingPage() {
  useTracking("LandingPage");
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",

        height: "100vh",
        width: "100vw",

        overflow: "clip",
      }}>
      <h1>Welcome!</h1>
      <Button component={Link} to="/projects" variant="contained">
        View Projects
      </Button>
    </Box>
  );
}
