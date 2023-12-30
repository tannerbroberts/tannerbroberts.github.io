import React from "react";
import Markdown from "markdown-to-jsx";

const Changelog = () => {
  const [changelog, setChangelog] = React.useState("");

  React.useEffect(() => {
    fetch("/CHANGELOG.md")
      .then((response) => response.text())
      .then((data) => {
        console.log("data", data);
        setChangelog(data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div
      style={{
        position: "relative",
        top: "50px",
        width: "100%",
        height: "100%",
        overflow: "auto",
        backgroundColor: "whitesmoke",
        padding: "10px",
      }}
    >
      <Markdown>{changelog}</Markdown>
    </div>
  );
};

export default Changelog;
