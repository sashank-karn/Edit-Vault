import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography, 
  Menu,
  MenuItem,
  Box,
  Button,
  InputBase,
  Paper
} from '@mui/material';
import { Link } from 'react-router-dom';
import { 
  Home, 
  AccountCircle, 
  ShoppingCart, 
  History, 
  Settings,
  Search 
} from '@mui/icons-material';

const Navbar = ({ isLoggedIn, toggleTheme, isDarkMode }) => {
  const [settingsAnchor, setSettingsAnchor] = React.useState(null);

  const handleSettingsMenu = (event) => {
    setSettingsAnchor(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchor(null);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ minWidth: '120px' }}>
          Edit Vault
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
          <IconButton 
            component={Link} 
            to="/" 
            color="inherit"
            title="Home"
          >
            <Home />
          </IconButton>

          <IconButton
            component={Link}
            to="/cart"
            color="inherit"
            title="Cart"
          >
            <ShoppingCart />
          </IconButton>

          <IconButton
            component={Link}
            to="/history"
            color="inherit"
            title="Download History"
          >
            <History />
          </IconButton>

          <IconButton
            onClick={handleSettingsMenu}
            color="inherit"
            title="Settings"
          >
            <Settings />
          </IconButton>

          <Menu
            anchorEl={settingsAnchor}
            open={Boolean(settingsAnchor)}
            onClose={handleSettingsClose}
          >
            <MenuItem onClick={toggleTheme}>
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </MenuItem>
            <MenuItem component={Link} to="/account">Account Settings</MenuItem>
            {isLoggedIn ? (
              <MenuItem onClick={handleSettingsClose}>Logout</MenuItem>
            ) : (
              <MenuItem component={Link} to="/login">Login</MenuItem>
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
