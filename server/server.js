require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg');
const JSZip = require('jszip');
const { spawn } = require('child_process'); // Import spawn to run Python scripts

ffmpeg.setFfmpegPath(ffmpegPath.path);

const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("MongoDB URI is not defined in the .env file!");
    process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB Atlas connected'))
    .catch(err => console.log('Error connecting to MongoDB Atlas:', err));

const fileSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    filePath: { type: String, required: true },
    thumbnailPath: { type: String },
    tags: { type: [String], default: [] }, // Add tags field
});

const File = mongoose.model('File', fileSchema);

const allowedFileTypes = [
    'video/mp4', 'video/mkv', 'video/avi',
    'image/jpeg', 'image/png', 'image/jpg', 'image/gif',
    'audio/mp3', 'audio/wav', 'audio/mpeg'
];

const maxFileSize = 50 * 1024 * 1024;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: maxFileSize },
    fileFilter: function (req, file, cb) {
        if (!allowedFileTypes.includes(file.mimetype)) {
            return cb(new Error('Invalid file type.'));
        }
        cb(null, true);
    }
});

const generateThumbnail = (videoPath) => {
    return new Promise((resolve, reject) => {
        const thumbnailFileName = `${Date.now()}_thumbnail.png`;
        const thumbnailsDir = path.join(__dirname, 'uploads', 'thumbnails');

        if (!fs.existsSync(thumbnailsDir)) {
            fs.mkdirSync(thumbnailsDir, { recursive: true });
        }

        const thumbnailPath = path.join(thumbnailsDir, thumbnailFileName);

        ffmpeg(videoPath)
            .setFfmpegPath(ffmpegPath.path)
            .seekInput(5)
            .frames(1)
            .size('1280x720')
            .output(thumbnailPath)
            .on('end', () => resolve(`/uploads/thumbnails/${thumbnailFileName}`))
            .on('error', (err) => reject(err))
            .run();
    });
};

app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const metadata = JSON.parse(req.body.metadata);
    const filePath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const newFile = new File({
        title: metadata.title,
        type: metadata.type,
        description: metadata.description, // Initial description
        filePath: filePath,
        tags: metadata.tags, // Initial tags
    });

    try {
        // Generate a thumbnail if the file is a video
        if (metadata.type.startsWith('video/')) {
            const thumbnailUrl = await generateThumbnail(path.join(__dirname, 'uploads', req.file.filename));
            newFile.thumbnailPath = thumbnailUrl;
        }

        // Save the file metadata to the database
        const savedFile = await newFile.save();

        // Send the saved file metadata back to the frontend
        res.json({
            title: savedFile.title,
            type: savedFile.type,
            description: savedFile.description,
            filePath: savedFile.filePath,
            thumbnailPath: savedFile.thumbnailPath,
            tags: savedFile.tags, // Include the initial tags in the response
        });
    } catch (error) {
        console.error('Error saving file details:', error);
        res.status(500).json({ message: 'Error saving file details', error });
    }
});

// Route to auto-generate tags, captions, and celebrity names
app.post('/api/generate-tags', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded for tag generation' });
    }

    const filePath = path.join(__dirname, 'uploads', req.file.filename);

    try {
        // Spawn the Python process
        const pythonProcess = spawn('python', ['../model/z1.py', filePath]);

        let output = '';
        let errorLogs = '';

        // Collect JSON output from stdout
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        // Collect logs from stderr (limit log size to avoid memory issues)
        pythonProcess.stderr.on('data', (data) => {
            if (errorLogs.length < 1000) { // Limit log size to 1000 characters
                errorLogs += data.toString();
            }
            console.error('Python script log:', data.toString()); // Log to server console
        });

        // Handle process close event
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                try {
                    // Parse the JSON output from the Python script
                    const result = JSON.parse(output.trim());
                    console.log('Python script output:', result); // Debug log

                    // Extract tags, caption, and celebrity
                    const { tags, caption, celebrity } = result;

                    // Filter out invalid tags and "No celebrity recognized"
                    const filteredTags = tags.filter(tag => tag && tag !== "No celebrity recognized");

                    // Only include the celebrity if it is recognized
                    const recognizedCelebrity = celebrity !== "No celebrity recognized" ? celebrity : null;

                    // Send the filtered result back to the frontend
                    res.json({
                        tags: filteredTags,
                        caption: caption,
                        celebrity: recognizedCelebrity, // Send null if not recognized
                    });
                } catch (err) {
                    console.error('Error parsing Python output:', err);
                    res.status(500).json({ message: 'Error parsing Python output' });
                }
            } else {
                console.error('Python script exited with code:', code);
                res.status(500).json({ message: 'Error generating tags', logs: errorLogs });
            }
        });
    } catch (err) {
        console.error('Error running Python script:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/files', async (req, res) => {
    try {
        const files = await File.find(); // Fetch all files from the database
        res.json(files); // Send the files as a JSON response
    } catch (error) {
        console.error('Error fetching files:', error);
        res.status(500).json({ message: 'Error fetching files' });
    }
});

app.delete('/api/files/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Find the file by ID
        const file = await File.findById(id);
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Delete the file from the file system
        const filePath = path.join(__dirname, 'uploads', path.basename(file.filePath));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // Delete the thumbnail if it exists
        if (file.thumbnailPath) {
            const thumbnailPath = path.join(__dirname, file.thumbnailPath);
            if (fs.existsSync(thumbnailPath)) {
                fs.unlinkSync(thumbnailPath);
            }
        }

        // Delete the file from the database
        await File.findByIdAndDelete(id);

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).json({ message: 'Error deleting file', error });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
