import React, { useState } from 'react';
import { Box, Grid, Modal, Typography, Chip, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MediaCard from '../components/MediaCard';

const sampleFiles = [
  {
    _id: '1',
    title: 'Sample Image',
    description: 'A beautiful sample image.',
    type: 'image',
    filePath: "/uploads/1731508989311.jpg",
    tags: ['Nature', 'Beautiful', 'Scenic']
  },
  {
    _id: '2',
    title: 'Sample GIF',
    description: 'An amazing sample Gif.',
    type: 'gif',
    filePath: '/uploads/1731510178008.gif',
    tags: ['Funny', 'Loop', 'Animation']
  },
  {
    _id: '3',
    title: 'Sample GIF',
    description: 'An entertaining sample GIF.',
    type: 'gif',
    filePath: '/uploads/1731510516528.gif',
    tags: ['Entertainment', 'Humor', 'Loop']
  },
  {
    _id: '4',
    title: 'Sample Video',
    description: 'An entertaining sample Video.',
    type: 'video',
    filePath: '/uploads/1731510799148.mp4',
    tags: ['Action', 'Thriller', 'HD']
  },
];

const HomePage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const handlePreviewClick = (file) => {
    setSelectedFile(file);
    setOpenModal(true);
  };

  const handleClosePreview = () => {
    setOpenModal(false);
    setSelectedFile(null);
  };

  const handleDownload = (file) => {
    console.log(`Downloading: ${file.title}`);
    navigate('/history');
  };

  const handleAddToCart = (file) => {
    console.log(`Added to Cart: ${file.title}`);
    navigate('/cart');
  };

  return (
    <Box sx={{ maxWidth: '1200px', mx: 'auto', mt: 4, padding: 2 }}>
      <Typography variant="h4" gutterBottom><b>Latest Releases</b></Typography>
      <Grid container spacing={4}>
        {sampleFiles.map((file) => (
          <Grid item xs={12} sm={6} md={4} key={file._id}>
            <MediaCard 
              item={file} 
              onClick={handlePreviewClick} 
              onDownload={handleDownload} 
              onAddToCart={handleAddToCart} 
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              {file.tags.map((tag, index) => (
                <Chip key={index} label={tag} variant="outlined" />
              ))}
            </Stack>
          </Grid>
        ))}
      </Grid>

      <Modal open={openModal} onClose={handleClosePreview} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ backgroundColor: 'white', padding: 4, borderRadius: 2, boxShadow: 3, maxWidth: '80%', maxHeight: '80%', overflowY: 'auto' }}>
          {selectedFile && <MediaCard item={selectedFile} />}
          {selectedFile && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              {selectedFile.tags.map((tag, index) => (
                <Chip key={index} label={tag} variant="outlined" />
              ))}
            </Stack>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default HomePage;
