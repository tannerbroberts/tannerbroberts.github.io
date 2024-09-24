import React from "react";
import Markdown from "markdown-to-jsx";
import { css } from "@emotion/css";

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

const Changelog = () => {
  const [changelog, setChangelog] = React.useState("");

  React.useEffect(() => {
    fetch("/CHANGELOG.md")
      .then((response) => response.text())
      .then((data) => {
        setChangelog(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div className={containerStyles}>
      <Markdown className={markdownStyles}>{changelog}</Markdown>
    </div>
  );
};

export default Changelog;
