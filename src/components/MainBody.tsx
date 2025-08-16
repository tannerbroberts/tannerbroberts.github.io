import { Box } from '@mui/material';
import { useViewportHeight } from "../hooks/useViewportHeight";

export default function MainBody() {
  const viewportHeight = useViewportHeight();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: viewportHeight,
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
    </Box>
  );
}
