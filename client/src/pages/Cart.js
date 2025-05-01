import React from 'react';
import { Container, Paper, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Button, Typography, Box } from '@mui/material';
import { CloudDownload, Delete } from '@mui/icons-material';

const Cart = () => {
  const [cartItems, setCartItems] = React.useState([]);

  const removeItemFromCart = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const handleDownloadAll = () => {
    if (cartItems.length === 0) {
      console.error('No items in the cart to download.');
      return;
    }
    console.log('Downloading all items as ZIP:', cartItems.map(item => item.name));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>Your Cart</Typography>
        <List>
          {cartItems.length === 0 ? (
            <Typography>No items in the cart.</Typography>
          ) : (
            cartItems.map((item) => (
              <ListItem key={item.id}> {/* Unique key for each item */}
                <ListItemText primary={item.name} secondary={item.description} />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete" onClick={() => removeItemFromCart(item.id)}>
                    <Delete />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>

        <Box sx={{ mt: 2, textAlign: 'right' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudDownload />}
            onClick={handleDownloadAll}
            disabled={cartItems.length === 0} // Disable if no items
          >
            Download All as ZIP
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Cart;
