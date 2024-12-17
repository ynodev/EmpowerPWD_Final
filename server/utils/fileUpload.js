// utils/fileUpload.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Handles file upload to local storage
 * @param {Object} file - File object from multer
 * @returns {Promise<Object>} Object containing file details
 */
export const uploadToStorage = async (file) => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${file.originalname}`;
    
    // Create subdirectories based on file type
    const fileType = file.mimetype.split('/')[0]; // 'image' or 'application'
    const typeDir = path.join(uploadsDir, fileType);
    if (!fs.existsSync(typeDir)) {
      fs.mkdirSync(typeDir, { recursive: true });
    }

    // Define file path
    const filePath = path.join(typeDir, uniqueFilename);
    
    // Write file to disk
    await fs.promises.writeFile(filePath, file.buffer);

    // Return file information
    return {
      originalname: file.originalname,
      filename: uniqueFilename,
      url: `/uploads/${fileType}/${uniqueFilename}`,
      mimetype: file.mimetype,
      size: file.size
    };
  } catch (error) {
    console.error('Error in uploadToStorage:', error);
    throw new Error('File upload failed');
  }
};

/**
 * Deletes a file from local storage
 * @param {string} fileUrl - URL of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFromStorage = async (fileUrl) => {
  try {
    if (!fileUrl) return;

    // Convert URL to file path
    const relativePath = fileUrl.split('/uploads/')[1];
    if (!relativePath) return;

    const filePath = path.join(uploadsDir, relativePath);

    // Check if file exists before deleting
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (error) {
    console.error('Error in deleteFromStorage:', error);
    throw new Error('File deletion failed');
  }
};

/**
 * Gets the file extension from a filename
 * @param {string} filename 
 * @returns {string} File extension
 */
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

/**
 * Validates file type and size
 * @param {Object} file - File object from multer
 * @returns {boolean} Whether the file is valid
 */
export const validateFile = (file) => {
  // Define allowed file types and maximum size (5MB)
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
  const allowedDocTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  // Check file size
  if (file.size > maxSize) {
    throw new Error('File size exceeds 5MB limit');
  }

  // Check file type
  if (!allowedImageTypes.includes(file.mimetype) && !allowedDocTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type');
  }

  return true;
};