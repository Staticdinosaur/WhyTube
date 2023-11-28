const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost/video-sharing', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const videoSchema = new mongoose.Schema({
  title: String,
  description: String,
  filename: String,
});

const Video = mongoose.model('Video', videoSchema);

const storage = multer.memoryStorage(); // Use memory storage for streaming uploads
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/upload', upload.single('video'), async (req, res) => {
  try {
    const { title, description } = req.body;

    // Get the file buffer from the memory storage
    const videoBuffer = req.file.buffer;

    // Save video details to MongoDB
    const newVideo = new Video({ title, description, filename: 'placeholder.mp4' });
    await newVideo.save();

    res.send('Video upload started. Processing...');

    // Perform video processing or saving to storage here
    // For demonstration purposes, we're just updating the filename to a placeholder
    newVideo.filename = `${newVideo._id}.mp4`;
    await newVideo.save();

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/videos', async (req, res) => {
  const videos = await Video.find();
  res.json(videos);
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
