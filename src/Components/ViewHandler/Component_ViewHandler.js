import { CALENDAR_VIEWS } from '../../constants';
import React from 'react';
import ViewHandlerProvider from './Provider_ViewHandler';
import ViewHandlerReducer, { ViewHandlerInitialState } from './Reducer_ViewHandler';
import { css } from '@emotion/css';
import { useAboutTimeContext } from '../AboutTime';
import UpNext from '../UpNext'
import Day from '../Day'
import Week from '../Week'
import Month from '../Month'
import Changelog from '../Changelog'

const viewHandlerCss = css`
  position: relative;
  top: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  background-color: yellow;
`;

export default function ViewHandler() {
  const [state, dispatch] = React.useReducer(ViewHandlerReducer, ViewHandlerInitialState);
  const { AboutTimeState } = useAboutTimeContext();

  return (
    <ViewHandlerProvider {...{ state, dispatch }}>
      <div className={viewHandlerCss}>
        {AboutTimeState.selectedView === CALENDAR_VIEWS.UP_NEXT && <UpNext />}
        {AboutTimeState.selectedView === CALENDAR_VIEWS.DAY && <Day />}
        {AboutTimeState.selectedView === CALENDAR_VIEWS.WEEK && <Week />}
        {AboutTimeState.selectedView === CALENDAR_VIEWS.MONTH && <Month />}
        {AboutTimeState.selectedView === CALENDAR_VIEWS.CHANGELOG && <Changelog />}
      </div>
    </ViewHandlerProvider>
  );
}
