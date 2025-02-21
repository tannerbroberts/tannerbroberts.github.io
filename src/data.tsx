import LandingPage from "./LandingPage"
import Header from "./Header"
import Error404 from "./Error404"
import Search from "./Search"

export default {
  landingPath: {
      path: '/',
      element: <LandingPage />,
  },
  main: {
    path: '/projects',
    element: <Header />,
    childrenRoutes: [
      {
        routeProps: {
          path: '/projects',
          index: true,
          element: <Search />,
        },
      },
      {
        routeProps: {
          path: '/projects/mazeGenerator',
          index: true,
          element: <h1>Maze Generator</h1>,
        },
        cardProps: {
          title: "React Project", category: "Frontend"
        }
      },
      {
        routeProps: {
          path: '*',
          index: true,
          element: <Error404 />,
        }
      }
    ],
  },
}
