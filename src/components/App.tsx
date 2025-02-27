import Box from '@mui/material/Box';
import Header from './Header';
import MainBody from './MainBody';
import SideBar from './SideBar';
import useItemListValidation from '../store/utils/useItemListValidation';

export default function App() {
  useItemListValidation()

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <SideBar />
      <MainBody />
    </Box>
  );
}
