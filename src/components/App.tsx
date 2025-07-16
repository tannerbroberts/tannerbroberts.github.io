import Box from '@mui/material/Box';
import Header from './Header';
import MainBody from './MainBody';
import SideBar from './SideBar';
import useItemListValidation from '../functions/utils/useItemListValidation';

export default function App() {
  useItemListValidation();

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <SideBar />
      <MainBody />
    </Box>
  );
}

/**
** TODO: Move and delete need to act on the relationshipId, not the item id.

** TODO: The Main calendar should show headers for item lineage

** TODO: Varibles aren't implemented at all

 */