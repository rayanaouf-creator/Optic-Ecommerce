import express from 'express';
import path from 'path';
import multer from 'multer';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { Readable } from 'stream';

dotenv.config();

const app = express();
const PORT = 3000;

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Upload to Google Drive
app.post('/api/upload-drive', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_DRIVE_FOLDER_ID } = process.env;

    if (!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY || !GOOGLE_DRIVE_FOLDER_ID) {
      return res.status(500).json({ error: 'Google Drive credentials not configured on the server. Please check your environment variables.' });
    }

    // Authenticate with Service Account
    const auth = new google.auth.JWT(
      GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Handle newlines in the key
      ['https://www.googleapis.com/auth/drive.file']
    );

    const drive = google.drive({ version: 'v3', auth });

    // Define file metadata and target folder
    const fileMetadata = {
      name: file.originalname,
      parents: [GOOGLE_DRIVE_FOLDER_ID],
    };

    // Define media
    const media = {
      mimeType: file.mimetype,
      body: Readable.from(file.buffer),
    };

    // Upload to drive
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });
    
    if (!response.data.id) throw new Error("Failed to get file ID from Google Drive");

    // Make the file publicly readable so it can be displayed in the app
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });
    
    // Get the webContentLink and thumbnailLink
    const metaRes = await drive.files.get({
        fileId: response.data.id,
        fields: 'thumbnailLink, webContentLink'
    });

    // Use thumbnail link for better performance, fallback to content link
    let imageUrl = metaRes.data.webContentLink;
    if (metaRes.data.thumbnailLink) {
        imageUrl = metaRes.data.thumbnailLink.replace(/=s\d+/, '=s800');
    }

    res.json({ url: imageUrl });
  } catch (error: any) {
    console.error('Drive upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
