import React from 'react';
import HeaderProvider from './Provider_Header';
import HeaderReducer, { HeaderInitialState } from './Reducer_Header';
import Hamburger from 'hamburger-react';
import { css } from '@emotion/react';
import { useAboutTimeContext } from '../AboutTime/Provider_AboutTime';
import t from '../../translation';

const headerCss = css`
  z-index: 1;
  box-sizing: border-box;
  border-bottom: 1px solid lightgray;
  position: absolute;
  display: flex;
  flex-direction: row;
  height: 50px;
  width: 100%;
  background-color: whitesmoke;
`;

const headerTextCss = css`
  display: flex;
  align-items: center;
  margin-left: 15px;
  font-size: 20px;
  font-weight: bold;
`;

export default function Header() {
  const [state, dispatch] = React.useReducer(HeaderReducer, HeaderInitialState);
  const { AboutTimeState: { selectedView, selectedItem, sideDrawerOpen }, AboutTimeDispatch } = useAboutTimeContext();
  const calendarType = t(selectedView);

  const openLeftDrawer = () => { AboutTimeDispatch({ type: "TOGGLE_SIDE_DRAWER" }); };

  return (
    <HeaderProvider {...{ state, dispatch }}>

      <div className={headerCss}>
        <Hamburger toggled={sideDrawerOpen} toggle={openLeftDrawer} />
        <div className={headerTextCss}>{`${calendarType}  ${selectedItem}`}</div>
      </div>
    </HeaderProvider>

  );
}
