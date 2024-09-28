import React, { useMemo } from 'react';
import AboutTimeProvider from './Provider_AboutTime';
import AboutTimeReducer, { AboutTimeInitialState } from './Reducer_AboutTime';
import { ErrorBoundary } from 'react-error-boundary';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import useLibrary from '../../useLibrary';
import { css } from '@emotion/css';

import Header from '../Header';
import ViewHandler from '../ViewHandler';
import SideDrawer from '../SideDrawer';
import AddItemFloatingActionButton from '../AddItemFloatingActionButton';

// Makes the app fill the entire screen
const fullScreenCss = css`
  overflow: hidden;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: yellow;
`;

export default function AboutTime() {
  const [state, dispatch] = React.useReducer(AboutTimeReducer, AboutTimeInitialState);
  const library = useLibrary();
  const extras = useMemo(() => ({ library }), [library]);

  return (
    <AboutTimeProvider {...{ state, dispatch, extras }}>
      <ErrorBoundary>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className={fullScreenCss}>
            <Header />
            <ViewHandler />
            <SideDrawer />
            <AddItemFloatingActionButton />
          </div>
        </LocalizationProvider>
      </ErrorBoundary>  </AboutTimeProvider>
  );
}
