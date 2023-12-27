import React from "react";
import { css } from "@emotion/css";

export default function Button({ onClick, children }) {
  return (
    <button
      className={css`
        background-color: #007bff;
        color: #fff;
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        font-weight: bold;
      `}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
