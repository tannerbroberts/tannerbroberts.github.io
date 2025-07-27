import Box from '@mui/material/Box';
import Header from './Header';
import MainBody from './MainBody';
import SideBar from './SideBar';
import NotificationSystem from './notifications/NotificationSystem';
import useItemListValidation from '../functions/utils/useItemListValidation';

export default function App() {
  useItemListValidation();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1, marginTop: '64px' }}>
        <SideBar />
        <MainBody />
      </Box>
      <NotificationSystem />
    </Box>
  );
}
