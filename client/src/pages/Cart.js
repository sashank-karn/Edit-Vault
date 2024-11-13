// Cart.js
import React from 'react';
import { useCart } from '../components/CartContext';  // Import useCart from the context
import { Container, Paper, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Button, Typography, Box } from '@mui/material';
import { Delete, CloudDownload } from '@mui/icons-material';
import axios from 'axios';

function Cart() {
  const { cartItems, removeItemFromCart, updateDownloadHistory } = useCart();

  const handleRemove = (id) => {
    removeItemFromCart(id);
  };

  const handleDownloadAll = async () => {
  if (cartItems.length === 0) {
    console.error('No items in the cart to download.');
    return;
  }

  const cartItemIds = [...new Set(cartItems.map((item) => item.id))];

  const zipDownloadUrl = `http://localhost:5000/api/download-zip?cartItems[]=${cartItemIds.join('&cartItems[]=')}`;

  try {
    const response = await axios.get(zipDownloadUrl, { responseType: 'blob' });

    const blob = new Blob([response.data], { type: 'application/zip' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'cart-files.zip';
    link.click();

    // Record each individual file in download history
    updateDownloadHistory(cartItems, true);
  } catch (error) {
    console.error('Error downloading the ZIP file:', error);
    alert('An error occurred while downloading the files. Please try again.');
  }
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
                  <IconButton edge="end" aria-label="delete" onClick={() => handleRemove(item.id)}>
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
}

export default Cart;
