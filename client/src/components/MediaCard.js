import React from 'react';
import { Card, CardContent, Typography, CardActions, IconButton, Chip, Stack } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';

const MediaCard = ({ item, onClick, onDownload, onAddToCart }) => {
  const renderMediaThumbnail = () => {
    switch (item.type) {
      case 'video':
        return (
          <video 
            width="100%" 
            height="200" 
            controls 
            poster={item.thumbnailPath || 'https://via.placeholder.com/300'}
          >
            <source src={item.filePath} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      case 'audio':
        return (
          <audio 
            controls 
            style={{ width: '100%', height: 'auto' }}
          >
            <source src={item.filePath} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        );
      case 'image':
      case 'gif':
        return (
          <img 
            src={item.filePath} 
            alt={item.title} 
            width="100%" 
            height="200" 
            style={{ objectFit: 'cover', cursor: 'pointer' }}
            onClick={() => onClick(item)} 
          />
        );
      default:
        return <img src="https://via.placeholder.com/300" alt="Placeholder" width="100%" />;
    }
  };

  return (
    <Card sx={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.02)',
        boxShadow: 6
      }
    }}>
      {renderMediaThumbnail()}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {item.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {item.description}
        </Typography>
        {/* Display tags */}
        {item.tags && (
          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            {item.tags.map((tag, index) => (
              <Chip key={index} label={tag} variant="outlined" />
            ))}
          </Stack>
        )}
      </CardContent>
      <CardActions sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, padding: '8px' }}>
        <IconButton color="primary" onClick={() => onDownload(item)}>
          <DownloadIcon />
        </IconButton>
        <IconButton color="primary" onClick={() => onAddToCart(item)}>
          <AddShoppingCartIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default MediaCard;
