import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Box, 
  TextField, 
  Button 
} from '@mui/material';
import { Link } from 'react-router-dom';
import { WbSunny, NightsStay } from '@mui/icons-material'; 
import { Home, ShoppingCart, History } from '@mui/icons-material';

const Navbar = ({ isLoggedIn, toggleTheme, isDarkMode, onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchClick = () => {
    onSearch(searchQuery);
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        backgroundColor: '#8B0000', // Dark blood red color for the background
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography 
          variant="h6" 
          component={Link}  // Wrap the Typography with Link
          to="/"            // Set the link to home
          sx={{ 
            minWidth: '120px', 
            fontFamily: '"Pacifico", cursive', // Applying the Pacifico font
            color: isDarkMode ? 'white' : 'black', // Font color changes based on theme
            fontSize: '2rem', // Increased font size
            textDecoration: 'none', // Remove underline
          }}
        >
          EditVault
        </Typography>

        {/* Search Bar Centered */}
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center'}}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, backgroundColor: 'white', borderRadius: 3, padding: '5px', maxWidth: 500 }}>
            <TextField
              variant="outlined"
              placeholder="Search"
              size="small"
              value={searchQuery}
              onChange={handleSearchChange}
              sx={{ flexGrow: 1 }}
            />
            <Button variant="contained" color="primary" onClick={handleSearchClick} sx={{borderRadius: 3}}>
              Search
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton 
            component={Link} 
            to="/" 
            color="inherit"
            title="Home"
            sx={{
              color: isDarkMode ? 'white' : 'black', // Icon color changes based on theme
            }}
          >
            <Home sx={{ fontSize: 30 }} /> {/* Increased icon size */}
          </IconButton>

          <IconButton
            component={Link}
            to="/cart"
            color="inherit"
            title="Cart"
            sx={{
              color: isDarkMode ? 'white' : 'black', // Icon color changes based on theme
            }}
          >
            <ShoppingCart sx={{ fontSize: 30 }} /> {/* Increased icon size */}
          </IconButton>

          <IconButton
            component={Link}
            to="/history"
            color="inherit"
            title="Download History"
            sx={{
              color: isDarkMode ? 'white' : 'black', // Icon color changes based on theme
            }}
          >
            <History sx={{ fontSize: 30 }} /> {/* Increased icon size */}
          </IconButton>

          <IconButton edge="end" color="inherit" onClick={toggleTheme}>
            {isDarkMode ? <WbSunny sx={{ fontSize: 30, color: 'white' }} /> : <NightsStay sx={{ fontSize: 30, color: 'black' }} />}
            {/* Toggle icon size */}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
