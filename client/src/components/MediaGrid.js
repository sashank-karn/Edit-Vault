// MediaGrid.js
import React from 'react';
import { Grid } from '@mui/material';
import MediaCard from './MediaCard';  // Import MediaCard component

const MediaGrid = ({ items, onClick }) => {
  return (
    <Grid container spacing={3} padding={2}>
      {items.map((item, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <MediaCard item={item} onClick={onClick} />  {/* Use MediaCard here */}
        </Grid>
      ))}
    </Grid>
  );
};

export default MediaGrid;
