import React from 'react';
import {
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography
} from '@mui/material';
import { CloudDownload } from '@mui/icons-material';

const History = () => {
  // Dummy history data - replace with actual API calls
  const downloadHistory = [
    { id: 1, name: 'Song.mp3', date: '2024-01-01', type: 'song' },
    { id: 2, name: 'Meme.jpg', date: '2024-01-02', type: 'meme' }
  ];
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Download History
        </Typography>
        <List>
          {downloadHistory.map((item) => (
            <ListItem key={item.id}>
              <ListItemText 
                primary={item.name}
                secondary={`Downloaded on ${item.date}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" aria-label="download again">
                  <CloudDownload />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
    </Container>
  );
};

export default History;
