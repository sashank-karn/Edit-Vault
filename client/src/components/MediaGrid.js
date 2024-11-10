import React from 'react';
import { Grid, Card, CardMedia, CardContent, Typography, IconButton } from '@mui/material';
import { PlayArrow, AddShoppingCart } from '@mui/icons-material';

const MediaGrid = ({ items }) => {
  return (
    <Grid container spacing={3} padding={2}>
      {items.map((item, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Card>
            <CardMedia
              component="img"
              height="200"
              image={`/assets/${item.image}`}
              alt={item.title}
            />
            <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body1">{item.title}</Typography>
              <div>
                <IconButton onClick={() => console.log('Play', item.title)}>
                  <PlayArrow />
                </IconButton>
                <IconButton onClick={() => console.log('Add to cart', item.title)}>
                  <AddShoppingCart />
                </IconButton>
              </div>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default MediaGrid;
