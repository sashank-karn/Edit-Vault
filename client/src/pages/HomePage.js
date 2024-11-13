import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, IconButton, Typography, Modal } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';
import { useCart } from '../components/CartContext';

const HomePage = () => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const { addItemToCart, updateDownloadHistory } = useCart();

  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/files');
      if (Array.isArray(response.data)) {
        setFiles(response.data);
      } else {
        console.error('Expected an array of files, but received:', response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching files:', error);
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDownload = (file) => {
    const downloadUrl = `http://localhost:5000/api/uploads/${file.filePath.split('/').pop()}`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', file.title);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    updateDownloadHistory(file, false);
  };

  const handleAddToCart = (file) => {
    addItemToCart({
      id: file._id,
      name: file.title,
      description: file.description,
      type: file.type,
      path: file.filePath,
    });
    updateDownloadHistory(file, false);  // Save history when file is added to cart
  };

  const handlePreviewClick = (file) => {
    setSelectedFile(file);
    setOpenModal(true);
  };

  const handleClosePreview = () => {
    setOpenModal(false);
    setSelectedFile(null);
  };

  const renderPreview = (file) => {
    if (!file || !file.type) {
      return <Typography variant="body2" sx={{ color: 'gray', marginBottom: 16 }}>No Preview</Typography>;
    }

    const previewProps = {
      src: '',
      alt: file.title,
      onClick: () => handlePreviewClick(file),
      style: {
        width: '100%',
        height: 'auto',
        cursor: 'pointer',
        maxHeight: '80vh',
        objectFit: 'contain',
      },
    };

    switch (file.type) {
      case 'gif':
      case 'image' :
        return <img 
        src={`http://localhost:5000/uploads/${file.filePath.split('/').pop()}`} // Placeholder image for audio
        alt={file.title}
        onClick={() => handlePreviewClick(file)} // On click, open the modal with the audio
        style={{
          width: '100%',
          height: 'auto',
          cursor: 'pointer',
          maxHeight: '200px',
          objectFit: 'cover',
        }}
          />;
      case 'video':
        return <img 
        src={`http://localhost:5000/uploads/thumbnails/thumnail.png`} // Placeholder image for audio
        alt={file.title}
        onClick={() => handlePreviewClick(file)} // On click, open the modal with the audio
        style={{
          width: '100%',
          height: 'auto',
          cursor: 'pointer',
          maxHeight: '200px',
          objectFit: 'cover',
        }}
          />;
      case 'audio':
        return <img 
        src={`http://localhost:5000/uploads/AudioPlaceHolder.jpeg`} // Placeholder image for audio
        alt={file.title}
        onClick={() => handlePreviewClick(file)} // On click, open the modal with the audio
        style={{
          width: '100%',
          height: 'auto',
          cursor: 'pointer',
          maxHeight: '200px',
          objectFit: 'cover',
        }}
          />;
      default:
        return <Typography variant="body2" sx={{ color: 'gray', marginBottom: 16 }}>No Preview</Typography>;
    }
  };

  return (
    <Box sx={{ maxWidth: '90%', mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom><b>Latest Release</b></Typography>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={4}>
          {files.length === 0 ? (
            <Box sx={{ width: '100%', textAlign: 'center', padding: 4 }}>
              <Typography variant="h6" color="textSecondary">No files available.</Typography>
            </Box>
          ) : (
            files.map((file) => (
              <Grid item xs={12} sm={6} md={4} key={file._id}>
                <Paper sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: 2,
                  borderRadius: 2,
                  boxShadow: 3,
                  backgroundColor: '#f4f4f4',
                  textAlign: 'left',
                  height: '280px',
                  overflow: 'hidden',
                  transition: 'transform 0.3s ease-in-out',
                  position: 'relative',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}>
                  {/* File Preview at Top Center */}
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '100%',
                    height: 'auto',
                    maxHeight: '200px',
                    overflow: 'hidden',
                  }}>
                    {renderPreview(file)}
                  </Box>

                  {/* Title and Description at the Left Bottom */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                    color: 'black',
                  }}>
                    <Typography variant="h1" sx={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                      {file.title}
                    </Typography>
                    <Typography variant="h5" sx={{ color: 'black' }}>
                      {file.description}
                    </Typography>
                  </Box>

                  {/* Icons at the Bottom-Right */}
                  <Box sx={{
                    position: 'absolute',
                    bottom: 8,
                    right: 8,
                    display: 'flex',
                    gap: 1,
                  }}>
                    <IconButton
                      color="primary"
                      onClick={() => handleDownload(file)}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: '50%',
                        padding: 1,
                      }}
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      color="primary"
                      onClick={() => handleAddToCart(file)}
                      sx={{
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: '50%',
                        padding: 1,
                      }}
                    >
                      <AddShoppingCartIcon />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {/* Modal for File Preview */}
      <Modal
        open={openModal}
        onClose={handleClosePreview}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <Box sx={{          
          backgroundColor: 'white',
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          maxWidth: '80%',
          maxHeight: '80%',
          overflowY: 'auto',
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6">{selectedFile?.title}</Typography>
            <IconButton onClick={handleClosePreview}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ marginTop: 2 }}>
            {renderPreview(selectedFile)}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default HomePage;
