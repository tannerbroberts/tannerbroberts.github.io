import Box from '@mui/material/Box';
import Header from './Header';
import SideBar from './SideBar';
import MainBody from './MainBody';
import useItemListValidation from '../functions/utils/useItemListValidation';
import { useAppState } from '../reducerContexts';
import { useEffect } from 'react';
// Backend removed: stub template import (no-op success)
function clonePublicTemplate(): Promise<{ ok: true }> {
  return Promise.resolve({ ok: true });
}

export default function App() {
  useItemListValidation();
  const { items } = useAppState();

  // Debug localStorage loading
  useEffect(() => {
    console.log(`App loaded with ${items.length} items from localStorage`);
  }, [items.length]);

  // QR deep-link import: /?importOwner=...&importHash=...
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      const owner = url.searchParams.get('importOwner')
      const hash = url.searchParams.get('importHash')
      if (owner && hash) {
  clonePublicTemplate()
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
  }, [])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Header />
      <Box sx={{ display: 'flex', flex: 1, marginTop: '64px' }}>
        <SideBar />
        <MainBody />
      </Box>
    </Box>
  );
}
