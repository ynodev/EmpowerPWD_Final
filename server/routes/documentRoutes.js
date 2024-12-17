import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.get('/view/:filename(*)', (req, res) => {
  try {
    const filename = req.params.filename;
    // Remove any 'uploads' prefix and normalize path
    const normalizedFilename = filename.replace(/^uploads[\/\\]/, '');
    const filePath = path.join(__dirname, '..', 'uploads', normalizedFilename);

    console.log('Requested file path:', filePath);
    console.log('File exists?', fs.existsSync(filePath));

    // Set headers to allow iframe viewing
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'self' *");
    
    // Send the file
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving document:', error);
    res.status(500).send('Error serving document');
  }
});

export default router; 