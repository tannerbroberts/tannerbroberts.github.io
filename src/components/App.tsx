import Box from '@mui/material/Box';
import Header from './Header';
import SideBar from './SideBar';
import MainBody from './MainBody';
import NotificationSystem from './notifications/NotificationSystem';
import useItemListValidation from '../functions/utils/useItemListValidation';
import { useAppState } from '../reducerContexts/App';
import { useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import AuthGate from './AuthGate';

export default function App() {
  useItemListValidation();
  const { items } = useAppState();
  const { user } = useAuth();

  // Debug localStorage loading
  useEffect(() => {
    console.log(`App loaded with ${items.length} items from localStorage`);
  }, [items.length]);

  if (!user) {
    return <AuthGate />
  }

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
