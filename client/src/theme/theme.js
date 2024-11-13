// theme.js

import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#8B0000', // Dark red
    },
    background: {
      default: '#f0f0f0', // Light grey background for light mode
    },
    text: {
      primary: '#000000', // Black text for light mode
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B0000', // Dark red
    },
    background: {
      default: '#303030', // Dark background for dark mode
    },
    text: {
      primary: '#ffffff', // White text for dark mode
    },
  },
});
