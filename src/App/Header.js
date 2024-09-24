import React from "react";
import { Squash as Hamburger } from "hamburger-react";
import { css } from "@emotion/css";
import { useAppContext } from "./App";
import t from "../translation";

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
  const { appState: { selectedView, selectedItem, sideDrawerOpen }, appDispatch } = useAppContext();
  const calendarType = t(selectedView);

  const openLeftDrawer = () => { appDispatch({ type: "TOGGLE_SIDE_DRAWER" }); };

  return (
    <div className={headerCss}>
      <Hamburger toggled={sideDrawerOpen} toggle={openLeftDrawer} />
      <div className={headerTextCss}>{`${calendarType}  ${selectedItem}`}</div>
    </div>
  );
};
