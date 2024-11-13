import React, { useState } from 'react';
import { Box, Typography, AppBar, Toolbar, Button, IconButton, CssBaseline, Modal } from '@mui/material';
import { DarkMode as DarkModeIcon, Close as CloseIcon } from '@mui/icons-material';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import List from './pages/FileList';
import Upload from './pages/Upload';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [openBox, setOpenBox] = useState(false); // State to manage the modal visibility

  const handleDarkModeToggle = () => {
    setDarkMode((prevMode) => !prevMode);
  };

  // Handle opening and closing of the modal
  const handleOpenBox = () => setOpenBox(true);
  const handleCloseBox = () => setOpenBox(false);

  // Define light and dark themes
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#8B0000', // Dark Blood Red
      },
      background: {
        default: '#ffffff',
        paper: '#f5f5f5',
      },
      text: {
        primary: '#000000',
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#8B0000', // Dark Blood Red
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
      text: {
        primary: '#ffffff',
      },
    },
  });

  return (
    <ThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      <CssBaseline />
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* App Bar with black background and text/icons */}
          <AppBar position="sticky" sx={{ backgroundColor: '#8B0000' }}>
            <Toolbar>
              <Link to="/list" style={{ textDecoration: 'none', flexGrow: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography 
                    variant="h3" 
                    sx={{ fontFamily: 'Pacifico, cursive', color: '#000000' }} // White text
                  >
                    EditVault
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ fontSize: '0.75rem', color: '#000000' }} // White subheading
                  >
                    Admin Portal
                  </Typography>
                </Box>
              </Link>
              <Button component={Link} to="/list" sx={{ color: '#000000' }}>Files</Button>
              <Button component={Link} to="/upload" sx={{ color: '#000000' }}>Upload</Button>
              <IconButton onClick={handleDarkModeToggle} sx={{ color: '#000000' }}>
                <DarkModeIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          {/* Main Content */}
          <Box sx={{ flexGrow: 1, padding: 3 }}>
            <Routes>
              <Route path="/list" element={<List onItemClick={handleOpenBox} />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/" element={<List onItemClick={handleOpenBox} />} />
            </Routes>
          </Box>

          {/* Modal (Box) that opens upon item click */}
          <Modal
            open={openBox}
            onClose={handleCloseBox}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1300, // Ensures modal stays above other content
            }}
          >
            <Box sx={{
              position: 'relative',
              backgroundColor: 'background.paper',
              padding: 3,
              maxWidth: 500,
              width: '80%',
              borderRadius: 2,
              boxShadow: 24,
            }}>
              {/* Close icon outside the modal box */}
              <IconButton
                onClick={handleCloseBox}
                sx={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  color: '#000000',
                  zIndex: 1,
                }}
              >
                <CloseIcon />
              </IconButton>

              {/* Content inside the modal */}
              <Typography variant="h4">Item Details</Typography>
              <Typography variant="body1">
                This box adjusts its size based on the content.
              </Typography>
            </Box>
          </Modal>
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App;
