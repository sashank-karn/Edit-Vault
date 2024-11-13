// server/models/Song.js
const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  description: String,
  filename: { 
    type: String, 
    required: true 
  },
  path: { 
    type: String, 
    required: true 
  },
  uploadDate: { 
    type: Date, 
    default: Date.now 
  },
  downloads: { 
    type: Number, 
    default: 0 
  },
  views: { 
    type: Number, 
    default: 0 
  }
});

module.exports = mongoose.model('Song', songSchema);
