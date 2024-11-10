import React from 'react';
import {
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Typography,
  Box
} from '@mui/material';
import { Delete, CloudDownload } from '@mui/icons-material';

const Cart = () => {
  // Dummy cart data - replace with actual state management
  const cartItems = [
    { id: 1, name: 'Sample Song 1', type: 'song' },
    { id: 2, name: 'Funny Meme', type: 'meme' }
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Your Cart
        </Typography>
        <List>
          {cartItems.map((item) => (
            <ListItem key={item.id}>
              <ListItemText 
                primary={item.name}
                secondary={item.type}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="delete">
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudDownload />}
          >
            Download All as ZIP
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Cart;
