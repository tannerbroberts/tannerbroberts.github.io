import React from 'react';
import { useMediaQuery, Drawer, Popover } from '@mui/material';

const DrawerOrPopup = ({ children }) => {
  const isMobile = useMediaQuery('(max-width: 600px)');

  if (isMobile) {
    return (
      <Drawer anchor="bottom" open={true}>
        {children}
      </Drawer>
    );
  }

  return (
    <Popover open={true}>
      {children}
    </Popover>
  );
};

export default DrawerOrPopup;
