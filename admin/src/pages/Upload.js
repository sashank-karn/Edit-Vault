import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, MenuItem, Box, Typography, CardMedia, CircularProgress } from '@mui/material';

const audioPlaceholder = 'http://localhost:5000/uploads/AudioPlaceHolder.jpeg';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({ title: '', description: '', type: '' });
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false); // State to track the uploading status
  const [uploadSuccess, setUploadSuccess] = useState(false); // State to track upload success

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setUploadSuccess(false); // Reset success state when a new file is selected

    if (selectedFile) {
      const fileURL = URL.createObjectURL(selectedFile);

      if (selectedFile.type.startsWith('image') || selectedFile.type === 'image/gif') {
        setPreview(<CardMedia component="img" image={fileURL} alt="Preview" height="140" />);
      } else if (selectedFile.type.startsWith('video')) {
        setPreview(<CardMedia component="video" src={fileURL} controls height="140" />);
      } else if (selectedFile.type.startsWith('audio')) {
        setPreview(<CardMedia component="img" image={audioPlaceholder} alt="Audio Placeholder" height="140" />);
      } else {
        setPreview(<Typography>File preview not available</Typography>);
      }
    } else {
      setPreview(null);
    }
  };

  const handleMetadataChange = (event) => {
    const { name, value } = event.target;
    setMetadata((prevMetadata) => ({ ...prevMetadata, [name]: value }));
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true); // Start the upload process
    setUploadSuccess(false); // Reset success state before uploading

    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    try {
      await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploading(false);
      setUploadSuccess(true); // Set upload success to true
      setTimeout(() => {
        setUploadSuccess(false); // Optionally hide the success message after a few seconds
      }, 3000);
    } catch (error) {
      setUploading(false);
      console.error('Error uploading file:', error);
      alert('File upload failed');
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>Upload Media</Typography>

      <TextField
        label="Title"
        name="title"
        value={metadata.title}
        onChange={handleMetadataChange}
        fullWidth
        margin="normal"
        autoComplete="off"
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
            '&:hover fieldset': { borderColor: 'black' },
            '&.Mui-focused fieldset': { borderColor: 'black' },
          },
          '& .MuiOutlinedInput-root.Mui-focused': {
            outline: 'none',
            boxShadow: 'none', // Ensure boxShadow is removed when focused
          },
        }}
      />

      <TextField
        label="Description"
        name="description"
        value={metadata.description}
        onChange={handleMetadataChange}
        fullWidth
        margin="normal"
        autoComplete="off"
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
            '&:hover fieldset': { borderColor: 'black' },
            '&.Mui-focused fieldset': { borderColor: 'black' },
          },
          '& .MuiOutlinedInput-root.Mui-focused': {
            outline: 'none',
            boxShadow: 'none', // Ensure boxShadow is removed when focused
          },
        }}
      />

      <TextField
        select
        label="Type"
        name="type"
        value={metadata.type}
        onChange={handleMetadataChange}
        fullWidth
        margin="normal"
        autoComplete="off"
        sx={{
          '& .MuiOutlinedInput-root': {
            '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
            '&:hover fieldset': { borderColor: 'black' },
            '&.Mui-focused fieldset': { borderColor: 'black' },
          },
          '& .MuiOutlinedInput-root.Mui-focused': {
            outline: 'none',
            boxShadow: 'none', // Ensure boxShadow is removed when focused
          },
        }}
      >
        <MenuItem value="image">Image</MenuItem>
        <MenuItem value="gif">GIF</MenuItem>
        <MenuItem value="video">Video</MenuItem>
        <MenuItem value="audio">Audio</MenuItem>
      </TextField>

      <Button
        variant="contained"
        component="label"
        fullWidth
        sx={{
          mt: 2,
          '&:focus': { outline: 'none' }, // Removes focus outline on button click
        }}
      >
        Select File
        <input type="file" hidden onChange={handleFileChange} />
      </Button>

      {preview && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Preview</Typography>
          {preview}
        </Box>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        fullWidth
        sx={{
          mt: 2,
          '&:focus': { outline: 'none' }, // Removes focus outline on button click
        }}
        disabled={!file || uploading}
      >
        {uploading ? (
          <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
        ) : (
          'Upload'
        )}
      </Button>

      {uploading && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Uploading...
        </Typography>
      )}

      {uploadSuccess && (
        <Typography variant="body2" sx={{ mt: 2, color: 'green' }}>
          File uploaded successfully!
        </Typography>
      )}
    </Box>
  );
};

export default Upload;
