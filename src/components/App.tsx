import Box from '@mui/material/Box';
import Header from './Header';
import NotificationSystem from './notifications/NotificationSystem';
import useItemListValidation from '../functions/utils/useItemListValidation';

export default function App() {
  useItemListValidation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1, marginTop: '64px' }}>
        {/* TODO: Re-implement SideBar and MainBody for simplified variable system */}
        <div>Simplified Variable System - TODO: Rebuild UI</div>
      </Box>
      <NotificationSystem />
    </Box>
  );
}
