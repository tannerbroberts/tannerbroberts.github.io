import Box from '@mui/material/Box';
import Header from './Header';
import SideBar from './SideBar';
import MainBody from './MainBody';
import NotificationSystem from './notifications/NotificationSystem';
import useItemListValidation from '../functions/utils/useItemListValidation';
import { useAppState } from '../reducerContexts';
import { useEffect } from 'react';
import { useAuth } from '../auth/useAuth';
import AuthGate from './AuthGate';
import { clonePublicTemplate } from '../api/client';
import { firebaseServices } from '../firebase';

export default function App() {
  useItemListValidation();
  const { items } = useAppState();
  const { user } = useAuth();

  // Debug localStorage loading
  useEffect(() => {
    console.log(`App loaded with ${items.length} items from localStorage`);
  }, [items.length]);

  // Initialize Firebase (optional)
  useEffect(() => {
    firebaseServices.init()
  }, [])

  // QR deep-link import: /?importOwner=...&importHash=...
  useEffect(() => {
    if (!user) return
    try {
      const url = new URL(window.location.href)
      const owner = url.searchParams.get('importOwner')
      const hash = url.searchParams.get('importHash')
      if (owner && hash) {
        clonePublicTemplate(owner, hash)
          .then(() => {
            window.dispatchEvent(new CustomEvent('app:notify', {
              detail: {
                id: `import-${owner}-${hash}`,
                type: 'success',
                title: 'Imported',
                message: 'Template imported from QR link.'
              }
            }))
            // Clear params
            url.searchParams.delete('importOwner');
            url.searchParams.delete('importHash');
            window.history.replaceState({}, '', url.toString());
          })
          .catch((e) => {
            window.dispatchEvent(new CustomEvent('app:notify', {
              detail: {
                id: `import-failed-${Date.now()}`,
                type: 'error',
                title: 'Import failed',
                message: e instanceof Error ? e.message : 'Could not import template'
              }
            }))
          })
      }
    } catch {
      // ignore
    }
  }, [user])

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
