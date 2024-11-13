import React from 'react';
import { useCart } from '../components/CartContext';
import { Container, Paper, List, ListItem, ListItemText, IconButton, Typography, Button, Box } from '@mui/material';
import { CloudDownload, Delete } from '@mui/icons-material';

const History = () => {
  const { downloadHistory, clearDownloadHistory, updateDownloadHistory } = useCart();

  // Function to handle file download again
  const handleDownload = (item) => {
    if (!item.filePath) {
      console.error('File path is missing');
      return;
    }
    const downloadUrl = `http://localhost:5000/api/uploads/${item.filePath.split('/').pop()}`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', item.title);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    updateDownloadHistory(item, false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>Download History</Typography>
        <Box sx={{ textAlign: 'right', mb: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Delete />}
            onClick={clearDownloadHistory}
            disabled={downloadHistory.length === 0} // Disable if no history
          >
            Clear History
          </Button>
        </Box>
        <List>
          {downloadHistory.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={<Typography>No download history available.</Typography>}
              />
            </ListItem>
          ) : (
            downloadHistory.map((item, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={item.name}
                  secondary={`Downloaded on ${item.date}`}
                />
                <IconButton edge="end" aria-label="download again" onClick={() => handleDownload(item)}>
                  <CloudDownload />
                </IconButton>
              </ListItem>
            ))
          )}
        </List>
      </Paper>
    </Container>
  );
};

export default History;
