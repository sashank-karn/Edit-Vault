import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, IconButton, Typography, Modal } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';
import LoadingSpinner from './LoadingSpinner'; // Loading spinner component
import CloseIcon from '@mui/icons-material/Close';

const FileList = () => {
  const [files, setFiles] = useState([]); // To store file data
  const [selectedFile, setSelectedFile] = useState(null); // To store the selected file for preview
  const [openModal, setOpenModal] = useState(false); // To control modal visibility
  const [loading, setLoading] = useState(true); // For loading state

  // Fetch all files from the backend
  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/files');
      if (response && response.data) {
        setFiles(response.data); // Update state with fetched files
      }
      setLoading(false); // Set loading to false once the files are fetched
    } catch (error) {
      console.error('Error fetching files:', error);
      setLoading(false); // Set loading to false in case of error
    }
  };

  // Delete file from the list
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/files/${id}`);
      setFiles(files.filter(file => file._id !== id)); // Remove deleted file from state
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  // Handle file preview click
  const handlePreviewClick = (file) => {
    if (file) {
      setSelectedFile(file); // Set the selected file to show in the modal
      setOpenModal(true); // Open the modal to show the preview
    }
  };

  // Close the preview modal
  const handleClosePreview = () => {
    setOpenModal(false); // Close the preview modal
    setSelectedFile(null); // Reset selected file
  };

  // Use effect hook to fetch files on component mount
  useEffect(() => {
    fetchFiles();
  }, []);

  // Ensure that each file object is not null and has the necessary properties before rendering
  const renderPreview = (file) => {
    if (!file || !file.type) {
      return <Typography variant="body2" sx={{ color: 'gray', marginBottom: 16 }}>No Preview</Typography>;
    }

    switch (file.type) {
    case 'gif':
      case 'image':
        return <img
            src={`http://localhost:5000/uploads/${file.filePath.split('/').pop()}`}  // Ensure this is a valid path
            alt={file.title}
            onClick={() => handlePreviewClick(file)}
            style={{
              width: '100%',
              height: 'auto',
              cursor: 'pointer',
              maxHeight: '200px',
              objectFit: 'cover', // Ensures consistent preview size
            }}
          />
      case 'video':
        return (
          <img
            src={`http://localhost:5000/uploads/thumbnails/thumbnail.png`} // Assuming the video has a thumbnailPath
            alt={file.title}
            onClick={() => handlePreviewClick(file)}
            style={{
              width: '100%',
              height: 'auto',
              cursor: 'pointer',
              maxHeight: '200px',
              objectFit: 'cover',
            }}
          />
        );
      case 'audio':
        return (
          <img
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
          />
        );
      default:
        return <Typography variant="body2" sx={{ color: 'gray', marginBottom: 16 }}>No Preview</Typography>;
    }
  };

  return (
    <Box sx={{ maxWidth: '90%', mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Uploaded Files</Typography>

      {/* Loading state */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <Grid container spacing={4}>
          {files.length === 0 ? (
            <Box sx={{ width: '100%', textAlign: 'center', padding: 4 }}>
              <Typography variant="h6" color="textSecondary">No files available.</Typography>
            </Box>
          ) : (
            files.map((file) => (
              file && file._id && ( // Add null checks here for each file
                <Grid item xs={12} sm={6} md={4} key={file._id}>
                  <Paper sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: 2,
                    borderRadius: 2,
                    boxShadow: 3,
                    backgroundColor: '#f4f4f4',
                    textAlign: 'left', // Aligning the text to the left
                    position: 'relative',
                    height: '350px', // Fixed height for consistent preview size
                    overflow: 'hidden',
                    transition: 'transform 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.05)', // Zoom effect on hover
                    },
                  }}>
                    {/* File Preview */}
                    {renderPreview(file)}

                    {/* File Title and Description */}
                    <Typography variant="h5" sx={{ marginBottom: 1 }}>
                      {file.title}
                    </Typography>
                    <Typography variant="h7" color="textSecondary" sx={{ marginBottom: 2 }}>
                      {file.description}
                    </Typography>

                    {/* Delete Button in the bottom-right corner */}
                    <IconButton
                      onClick={() => handleDelete(file._id)}
                      color="error"
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        borderRadius: '50%',
                        padding: 1,
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Paper>
                </Grid>
              )
            ))
          )}
        </Grid>
      )}

      {/* Modal for Preview */}
      <Modal
        open={openModal}
        onClose={handleClosePreview}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <Box sx={{
          backgroundColor: 'white',
          padding: 2,
          borderRadius: 2,
          position: 'relative',
          maxWidth: '80%', // Ensure width adjusts based on content
          maxHeight: '80%',
          overflow: 'hidden', // Prevent overflow from content
        }}>
          {/* Close Icon Outside the Box */}
          <IconButton
            onClick={handleClosePreview}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1, // Ensure it stays above the content
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Displaying the selected file's content with scrollable modal content */}
          <Box sx={{
            maxHeight: '70vh', // Maximum height for the modal content
            overflowY: 'auto', // Allows vertical scrolling if content exceeds max height
            paddingBottom: 2, // Space for scroll bar
          }}>
            {selectedFile && selectedFile.type === 'image' && (
              <img
                src={selectedFile.filePath}
                alt={selectedFile.title}
                style={{
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain', // Ensure full image is shown
                }}
              />
            )}
            {selectedFile && selectedFile.type === 'video' && (
              <video width="100%" height="auto" controls>
                <source src={selectedFile.filePath} type="video/mp4" />
              </video>
            )}
            {selectedFile && selectedFile.type === 'audio' && (
              <div>
                {/* Displaying Audio Player */}
                <audio controls autoPlay>
                  <source src={selectedFile.filePath} type="audio/mp3" />
                </audio>
              </div>
            )}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default FileList;
