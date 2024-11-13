require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // For deleting files from the filesystem
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg');
const JSZip = require('jszip');  // Import JSZip

ffmpeg.setFfmpegPath(ffmpegPath.path);

// Set up express app
const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// MongoDB connection URI
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("MongoDB URI is not defined in the .env file!");
    process.exit(1);
}

// MongoDB connection
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Atlas connected'))
    .catch(err => console.log('Error connecting to MongoDB Atlas:', err));

// Define Schema and Model
const fileSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    filePath: { type: String, required: true },
    thumbnailPath: { type: String }, // Add this line for videos
});
const File = mongoose.model('File', fileSchema);

// Multer setup for file upload with validation
const allowedFileTypes = [
    'video/mp4', 'video/mkv', 'video/avi', 
    'image/jpeg', 'image/png', 'image/jpg', 'image/gif',
    'audio/mp3', 'audio/wav', 'audio/mpeg'
]; // Include audio and gif

const maxFileSize = 50 * 1024 * 1024; // Limit upload size to 50MB

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));  // Ensure unique filename
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: maxFileSize }, // Limit file size
    fileFilter: function (req, file, cb) {
        if (!allowedFileTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type. Only video, audio, image, and gif files are allowed.'));
        }
        cb(null, true);
    }
});

// Function to generate a thumbnail from a video
const generateThumbnail = (videoPath) => {
    return new Promise((resolve, reject) => {
        const normalizedVideoPath = path.resolve(videoPath);  // Use path.resolve for absolute path
        const thumbnailFileName = `${Date.now()}_thumbnail.png`;  // Unique filename for the thumbnail
        const thumbnailsDir = path.join(__dirname, 'uploads', 'thumbnails');

        // Ensure the thumbnails directory exists
        if (!fs.existsSync(thumbnailsDir)) {
            fs.mkdirSync(thumbnailsDir, { recursive: true });
        }

        const thumbnailPath = path.join(thumbnailsDir, thumbnailFileName);  // Full path for the thumbnail

        console.log("Attempting to generate thumbnail from video at:", normalizedVideoPath);

        // Run ffmpeg to generate the thumbnail
        ffmpeg(normalizedVideoPath)
            .setFfmpegPath(ffmpegPath.path)  // Ensure ffmpeg path is set
            .seekInput(5)                    // Set time to extract the thumbnail (5 seconds)
            .frames(1)                       // Capture a single frame
            .size('1280x720')                // Set the thumbnail size
            .output(thumbnailPath)           // Output the thumbnail
            .on('end', () => {
                console.log('Thumbnail generated successfully at:', thumbnailPath);
                const thumbnailUrl = `/uploads/thumbnails/${thumbnailFileName}`;  // URL for thumbnail
                resolve(thumbnailUrl);  // Return the thumbnail URL
            })
            .on('error', (err) => {
                console.error('Error generating thumbnail:', err.message);  // Log the error message
                reject(new Error(`Failed to generate thumbnail: ${err.message}`));
            })
            .run();
    });
};

// Route to upload a file with metadata
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const metadata = JSON.parse(req.body.metadata);
    const filePath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const newFile = new File({
        title: metadata.title,
        type: metadata.type,
        description: metadata.description,
        filePath: filePath
    });

    try {
        // Check if the uploaded file is a video
        if (metadata.type.startsWith('video/')) {
            // Generate the thumbnail for video files
            const thumbnailUrl = await generateThumbnail(path.join(__dirname, 'uploads', req.file.filename));

            // Save the thumbnail URL in the file metadata
            newFile.thumbnailPath = thumbnailUrl;
        }

        const savedFile = await newFile.save();
        res.json(savedFile);  // Return the saved file with the thumbnail URL (if applicable)
    } catch (error) {
        console.error('Error saving file details:', error);
        res.status(500).json({ message: 'Error saving file details', error });
    }
});

// Route to fetch all files with optional filter and search
app.get('/api/files', async (req, res) => {
    const { type, search, limit, skip } = req.query;
    let filter = {};

    if (type) filter.type = type;
    if (search) filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
    ];

    const limitNumber = parseInt(limit) || 50;  // Default to 50 files
    const skipNumber = parseInt(skip) || 0;    // Default to no skipped files

    try {
        const files = await File.find(filter)
            .skip(skipNumber)
            .limit(limitNumber);

        res.json(files);
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: 'Error fetching files', error });
    }
});

// Route to delete a file by its ID
app.delete('/api/files/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const file = await File.findById(id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Delete the main file and its thumbnail (if it exists)
        const filePath = path.join(__dirname, 'uploads', path.basename(file.filePath));
        const thumbnailPath = file.thumbnailPath ? path.join(__dirname, 'uploads', 'thumbnails', path.basename(file.thumbnailPath)) : null;

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);  // Synchronously delete file
        }

        if (thumbnailPath && fs.existsSync(thumbnailPath)) {
            fs.unlinkSync(thumbnailPath);  // Synchronously delete thumbnail
        }

        await File.findByIdAndDelete(id);
        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Error deleting file', error });
    }
});

// Endpoint to serve files directly with download headers
app.get('/api/uploads/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'uploads', fileName);

    res.download(filePath, fileName, (err) => {
        if (err) {
            console.error('Error during file download:', err);
            res.status(500).json({ message: 'File download failed' });
        }
    });
});

// Endpoint for downloading selected files as a ZIP
app.get('/api/download-zip', async (req, res) => {
    const cartItemIds = req.query.cartItems;  // Array of MongoDB ObjectIds from the cart page
  
    if (!cartItemIds || cartItemIds.length === 0) {
        return res.status(400).json({ message: 'No files selected' });
    }
  
    const zip = new JSZip();
    
    try {
        const files = await File.find({ '_id': { $in: cartItemIds } });
  
        if (!files || files.length === 0) {
            return res.status(404).json({ message: 'No files found for the provided IDs' });
        }
  
        files.forEach(file => {
            const fileName = path.basename(file.filePath);  // Extract filename
            const filePath = path.join(__dirname, 'uploads', fileName);  // Full file path
    
            if (fs.existsSync(filePath)) {
                const fileData = fs.readFileSync(filePath);  // Read file data
                zip.file(file.title + path.extname(file.filePath), fileData);  // Add to ZIP
            } else {
                console.error(`File ${file.title} not found at ${filePath}`);
            }
        });
  
        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });
  
        res.set('Content-Type', 'application/zip');
        res.set('Content-Disposition', 'attachment; filename=cart-files.zip');
        res.send(zipBuffer);
    } catch (error) {
        console.error('Error generating ZIP file:', error);
        res.status(500).json({ message: 'Error generating ZIP file', error });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
