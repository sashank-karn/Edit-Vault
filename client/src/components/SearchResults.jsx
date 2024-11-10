// src/pages/Home.jsx or src/components/SearchResults.jsx
import React from 'react';
import { Grid } from '@mui/material';
import MediaCard from './MediaCard';

const SearchResults = ({ items }) => {
  return (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
          <MediaCard item={item} />
        </Grid>
      ))}
    </Grid>
  );
};

export default SearchResults;
