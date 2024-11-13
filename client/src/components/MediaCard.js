// MediaCard.js
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const MediaCard = ({ item, onClick }) => {
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
        return (
          <img 
            src={item.filePath} 
            alt={item.title} 
            width="100%" 
            height="200" 
            style={{ objectFit: 'cover' }} 
          />
        );
      case 'gif':
        return (
          <img 
            src={item.filePath} 
            alt={item.title} 
            width="100%" 
            height="200" 
            style={{ objectFit: 'cover' }} 
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
    }} onClick={() => onClick(item)}>
      {renderMediaThumbnail()}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" gutterBottom>
          {item.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {item.description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MediaCard;
