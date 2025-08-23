
import React from 'react';
import { Box } from '@mui/material';
import { useAppState } from '../reducerContexts';
import DayView from './day/DayView';
import AccountingView from './accounting/AccountingView';


export default function MainBody() {
  // Removed viewportHeight, use flex: 1 for height
  const { currentView } = useAppState();

  let content: React.ReactElement | null = null;
  if (currentView === 'day') {
    content = <DayView />;
  } else if (currentView === 'accounting') {
    content = <AccountingView />;
  } else {
    // Default to execution view (can be replaced with actual execution view component)
  content = <Box sx={{ p: 0, textAlign: 'center' }}>Execution View Placeholder</Box>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        maxWidth: '100vw',
        maxHeight: '100vh',
        boxSizing: 'border-box',
        overflowX: 'hidden',
        overflowY: 'hidden'
      }}
    >
      {content}
    </Box>
  );
}
