import React from 'react';
import { Container, Paper, List, ListItem, ListItemText, IconButton, Typography, Button, Box } from '@mui/material';
import { CloudDownload, Delete } from '@mui/icons-material';

const History = () => {
  const [downloadHistory, setDownloadHistory] = React.useState([]);

  const clearDownloadHistory = () => {
    setDownloadHistory([]);
  };

  const handleDownload = (item) => {
    console.log(`Downloading: ${item.name}`);
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
