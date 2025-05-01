import React, { useState } from 'react';
import { TextField, Button, MenuItem, Box, Typography, CardMedia, Chip, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

const Upload = () => {
  const [file, setFile] = useState(null);
  const [metadata, setMetadata] = useState({ title: '', description: '', type: '', tags: [] });
  const [preview, setPreview] = useState(null);
  const [tagInput, setTagInput] = useState('');
  const [uploading, setUploading] = useState(false); // For upload state
  const [generatingTags, setGeneratingTags] = useState(false); // For auto-generate tags state
  const [error, setError] = useState(''); // For validation errors
  const [successMessage, setSuccessMessage] = useState(''); // For success messages

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);

    // Reset all fields and preview when a new file is selected
    setMetadata({ title: '', description: '', type: '', tags: [] });
    setPreview(null);
    setTagInput('');
    setError('');
    setSuccessMessage('');

    if (selectedFile) {
      const fileURL = URL.createObjectURL(selectedFile);
      if (selectedFile.type.startsWith('image') || selectedFile.type === 'image/gif') {
        setPreview(<CardMedia component="img" image={fileURL} alt="Preview" height="200" />);
      } else if (selectedFile.type.startsWith('video')) {
        setPreview(<CardMedia component="video" src={fileURL} controls height="200" />);
      } else {
        setPreview(<Typography>File preview not available</Typography>);
      }
    }
  };

  const handleMetadataChange = (event) => {
    const { name, value } = event.target;
    setMetadata((prevMetadata) => ({ ...prevMetadata, [name]: value }));
  };

  const handleTagChange = (event) => {
    setTagInput(event.target.value);
  };

  const addTag = () => {
    if (tagInput.trim() !== '' && !metadata.tags.includes(tagInput.trim())) {
      setMetadata((prevMetadata) => ({ ...prevMetadata, tags: [...prevMetadata.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setMetadata((prevMetadata) => ({
      ...prevMetadata,
      tags: prevMetadata.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const validateFields = () => {
    if (!metadata.title || !metadata.description || !metadata.type) {
      setError('All fields (Title, Description, and Type) are required.');
      return false;
    }
    setError('');
    return true;
  };

  const handleAutoGenerateTags = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setGeneratingTags(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:5000/api/generate-tags', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Generated tags response:', response.data); // Debug log

      const { tags, caption, celebrity } = response.data;

      // Update metadata with generated tags and caption
      setMetadata((prevMetadata) => ({
        ...prevMetadata,
        description: `${prevMetadata.description} ${caption || ''}`.trim(),
        tags: [...new Set([...prevMetadata.tags, ...tags, celebrity].filter(Boolean))], // Avoid duplicates
      }));
    } catch (error) {
      console.error('Error generating tags:', error);
    } finally {
      setGeneratingTags(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    if (!validateFields()) {
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    try {
      const response = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log('Upload response:', response.data); // Debug log

      // Show success message and refresh the page
      setSuccessMessage('File uploaded successfully!');
      setTimeout(() => {
        window.location.reload(); // Refresh the page after 2 seconds
      }, 2000);
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {preview && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Preview</Typography>
          {preview}
        </Box>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="contained" component="label">
          Select File
          <input type="file" hidden onChange={handleFileChange} />
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleAutoGenerateTags}
          disabled={generatingTags} // Use generatingTags state here
        >
          {generatingTags ? <CircularProgress size={24} /> : 'Auto Generate'}
        </Button>
      </Box>

      <TextField
        label="Title"
        name="title"
        value={metadata.title}
        onChange={handleMetadataChange}
        fullWidth
        margin="normal"
      />
      <TextField
        label="Description"
        name="description"
        value={metadata.description}
        onChange={handleMetadataChange}
        fullWidth
        margin="normal"
      />
      <TextField
        select
        label="Type"
        name="type"
        value={metadata.type}
        onChange={handleMetadataChange}
        fullWidth
        margin="normal"
      >
        <MenuItem value="image">Image</MenuItem>
        <MenuItem value="gif">GIF</MenuItem>
        <MenuItem value="video">Video</MenuItem>
        <MenuItem value="audio">Audio</MenuItem>
      </TextField>

      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <TextField
          label="Add Tag"
          value={tagInput}
          onChange={handleTagChange}
          fullWidth
          onKeyDown={(e) => e.key === 'Enter' && addTag()}
        />
        <Button variant="contained" onClick={addTag}>
          Add Tag
        </Button>
      </Box>

      <Box sx={{ mt: 2 }}>
        {metadata.tags.map((tag, index) => (
          <Chip key={index} label={tag} onDelete={() => removeTag(tag)} sx={{ m: 0.5 }} />
        ))}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        fullWidth
        sx={{ mt: 2 }}
        disabled={uploading} // Use uploading state here
      >
        {uploading ? <CircularProgress size={24} /> : 'Upload'}
      </Button>
    </Box>
  );
};

export default Upload;
