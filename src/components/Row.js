import React from 'react';
import { css } from '@emotion/css';

const Row = ({ children }) => {
  const rowStyles = css`
    display: flex;
    flex-direction: row;
    gap: 10px;
  `;

  return <div className={rowStyles}>{children}</div>;
};

export default Row;
