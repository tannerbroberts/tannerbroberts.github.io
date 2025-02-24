import Box from '@mui/material/Box';
import Header from './Header';
import MainBody from './MainBody';
import SideBar from './SideBar';

export default function App() {

  return (
    <Box sx={{ display: 'flex' }}>
      <Header />
      <SideBar />
      <MainBody />
    </Box>
  );
}
