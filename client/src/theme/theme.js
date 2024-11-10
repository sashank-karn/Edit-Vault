import { createTheme } from '@mui/material';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#ff1744', // red
      light: '#ff4569',
      dark: '#b2102f',
    },
    secondary: {
      main: '#2196f3', // blue
      light: '#4dabf5',
      dark: '#1769aa',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff1744',
      light: '#ff4569',
      dark: '#b2102f',
    },
    secondary: {
      main: '#2196f3',
      light: '#4dabf5',
      dark: '#1769aa',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});
