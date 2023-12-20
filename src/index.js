import React from "react";
import ReactDOM from "react-dom/client";
import App from "./components/App";

// Base element styling outside of React
const rootCss = document.getElementById("root");
const body = document.getElementsByTagName("body")[0];
const html = document.getElementsByTagName("html")[0];

// Add css to make sure there is no touch action
rootCss.style.touchAction = "none";
body.style.touchAction = "none";
html.style.touchAction = "none";

// Remove all margin and padding
rootCss.style.margin = "0";
body.style.margin = "0";
html.style.margin = "0";

rootCss.style.padding = "0";
body.style.padding = "0";
html.style.padding = "0";

html.style.height = "100%";
body.style.height = "100%";
rootCss.style.height = "100%";

body.style.position = "relative";

// Add css to make sure the default font is monospace
html.style.fontFamily = "monospace";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
