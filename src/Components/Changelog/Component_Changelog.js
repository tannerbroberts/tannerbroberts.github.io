import React from 'react';
import ChangelogProvider from './Provider_Changelog';
import ChangelogReducer, { ChangelogInitialState } from './Reducer_Changelog';
import { css } from '@emotion/css';
import Markdown from 'markdown-to-jsx';

const containerStyles = css`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: whitesmoke;
`;

const markdownStyles = css`
  margin-left: min(25%, 50px);
  margin-right: min(25%, 50px);
  margin-top: min(25%, 50px);
  margin-bottom: min(25%, 100px);
`;

export default function Changelog() {
  const [state, dispatch] = React.useReducer(ChangelogReducer, ChangelogInitialState);

  React.useEffect(() => {
    fetch("/CHANGELOG.md")
      .then((response) => response.text())
      .then((data) => {
        dispatch({ type: "SET_CHANGELOG", value: data });
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <ChangelogProvider {...{ state, dispatch }}>
      <div className={containerStyles}>
        <Markdown className={markdownStyles}>{state.changeLog}</Markdown>
      </div>
    </ChangelogProvider>
  );
}
