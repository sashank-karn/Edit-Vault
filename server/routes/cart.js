const express = require('express');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const app = express();

// Assuming cartItems are sent as query parameters containing file paths
app.get('/api/download-zip', (req, res) => {
  const cartItems = req.query.cartItems; // This should be an array of file paths

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).send('No items to download.');
  }

  const zipName = 'cart-items.zip';
  const output = fs.createWriteStream(path.join(__dirname, zipName));
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  output.on('close', () => {
    console.log(`ZIP file has been finalized and written: ${archive.pointer()} total bytes.`);
  });

  archive.on('error', (err) => {
    res.status(500).send({ error: err.message });
  });

  res.attachment(zipName);
  archive.pipe(output);

  // Add files from cartItems to the archive
  cartItems.forEach(filePath => {
    const fullPath = path.join(__dirname, 'uploads', filePath); // Adjust based on where your files are stored
    if (fs.existsSync(fullPath)) {
      archive.file(fullPath, { name: path.basename(fullPath) });
    } else {
      console.error(`File not found: ${fullPath}`);
    }
  });

  archive.finalize();
});

module.exports = app;
