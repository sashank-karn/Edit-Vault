import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Switch,
  FormControlLabel
} from '@mui/material';

const Account = ({ isDarkMode, toggleTheme }) => {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Account Settings
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={isDarkMode}
                onChange={toggleTheme}
                color="primary"
              />
            }
            label="Dark Mode"
          />
        </Box>

        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            color="primary"
            sx={{ mr: 2 }}
          >
            Update Profile
          </Button>
          <Button
            variant="outlined"
            color="secondary"
          >
            Change Password
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Account;
