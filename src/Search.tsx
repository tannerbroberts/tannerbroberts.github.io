import { Box, Paper, Tab, Tabs } from "@mui/material";
import { useAppDispatchContext, useAppStateContext } from "./AppContext";
import useTracking from "./hooks.ts/useTracking";
import data from './data'
import { Link } from "react-router";

const CATEGORY_INDEX_MAP: { [key: number]: string } = {
  0: "All",
  1: "Frontend",
  2: "Backend",
  3: "Full Stack",
}

const ALL = "All";

export default function Search() {
  useTracking("Search");
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
        sx={{
          top: 0,
        }}
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
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          width: "100vw",
        }}
      >

        {
          data.main.childrenRoutes
            .filter((routeData) => routeData.cardProps)
            .filter((routeData) => {
              if (!routeData.cardProps) return false;
              return CATEGORY_INDEX_MAP[selectedTabIndex] === ALL || routeData.cardProps.category === CATEGORY_INDEX_MAP[selectedTabIndex]
            })
            .map((routeData) => {
              if (!routeData.cardProps) return null;
              return (
                <Box
                  key={routeData.cardProps.title}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100vh",
                    width: "100vw",
                    overflow: "clip",
                  }}>
                  <ProjectCard {...routeData} />
                </Box>
              )
            })
        }
      </Box>
    </Box>
  );
}

function ProjectCard(props: { routeProps: { path: string }, cardProps: { title: string, category: string } }) {
  const {
    routeProps: { path },
    cardProps: { title: cardTitle, category },
  } = props;
  return (
    <Paper
      component={Link}
      to={path}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "200px",
        width: "200px",
        borderRadius: "10px",
      }}>
      <h3>{cardTitle}</h3>
      <p>{category}</p>
    </Paper>
  );
}
