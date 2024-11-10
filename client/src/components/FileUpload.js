// src/components/FileUpload.jsx
import React, { useState } from 'react';
import { 
  Button, 
  Box, 
  LinearProgress, 
  Typography,
  Paper 
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(progress);
        }
      });
      
      console.log('File uploaded successfully:', response.data);
      setFile(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <input
          accept="image/*,video/*,audio/*"
          style={{ display: 'none' }}
          id="contained-button-file"
          type="file"
          onChange={handleFileSelect}
        />
        <label htmlFor="contained-button-file">
          <Button
            variant="contained"
            component="span"
            startIcon={<CloudUpload />}
          >
            Select File
          </Button>
        </label>
        
        {file && (
          <>
            <Typography>Selected file: {file.name}</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleUpload}
              disabled={uploading}
            >
              Upload
            </Button>
          </>
        )}
        
        {uploading && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
            />
            <Typography variant="body2" color="text.secondary">
              {uploadProgress}%
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default FileUpload;
