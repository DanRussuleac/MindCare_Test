// theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    background: {
      default: '#181818',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#d0d0d0',
      secondary: '#9E9E9E',
    },
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#D3D3D3',
    },
  },
  typography: {
    fontFamily: "'Roboto Slab', serif",
  },
});

export default theme;
