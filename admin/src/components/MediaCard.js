// src/components/MediaCard.jsx
import React, { useState } from 'react';
import { 
  Card, 
  CardMedia, 
  CardContent, 
  IconButton, 
  Typography,
  Box 
} from '@mui/material';
import { 
  PlayArrow, 
  Pause, 
  AddShoppingCart,
  Download 
} from '@mui/icons-material';

const MediaCard = ({ item }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    // If it's an audio file
    if (item.type === 'audio') {
      const audio = document.getElementById(`audio-${item.id}`);
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
    }
  };

  return (
    <Card
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      sx={{ position: 'relative', width: '250px', height: '350px', margin: 2, boxShadow: 3 }}
    >
      {item.type === 'audio' && (
        <audio id={`audio-${item.id}`} src={item.url} />
      )}
      
      <CardMedia
        component={item.type === 'image' ? 'img' : 'video'}
        src={item.url}
        height="200"
        sx={{ objectFit: 'cover', borderRadius: '8px' }}
      />
      
      {isHovering && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2
          }}
        >
          <IconButton 
            onClick={handlePlay}
            sx={{ color: 'white' }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
          <IconButton 
            sx={{ color: 'white' }}
          >
            <AddShoppingCart />
          </IconButton>
          <IconButton 
            sx={{ color: 'white' }}
          >
            <Download />
          </IconButton>
        </Box>
      )}

      <CardContent sx={{ padding: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          {item.title}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default MediaCard;
