import fs from 'fs';
import path from 'path';

export const handleJobSeekerDocuments = (files, email) => {
  const documentPaths = {};
  const baseDir = `uploads/jobseekers/${email}/documents`;

  // Ensure directory exists
  fs.mkdirSync(baseDir, { recursive: true });

  // Process each type of document
  Object.entries(files).forEach(([fieldName, fileArray]) => {
    const file = fileArray[0]; // Get first file from array
    if (file) {
      const filePath = path.join(baseDir, file.filename);
      documentPaths[fieldName] = {
        path: filePath,
        originalName: file.originalname,
        mimeType: file.mimetype
      };
    }
  });

  return documentPaths;
};

export const handleEmployerDocuments = (files, email) => {
  const documentPaths = {};
  const baseDir = `uploads/employers/${email}/documents`;

  // Ensure directory exists
  fs.mkdirSync(baseDir, { recursive: true });

  // Process each type of document
  Object.entries(files).forEach(([fieldName, fileArray]) => {
    const file = fileArray[0]; // Get first file from array
    if (file) {
      const filePath = path.join(baseDir, file.filename);
      documentPaths[fieldName] = {
        path: filePath,
        originalName: file.originalname,
        mimeType: file.mimetype
      };
    }
  });

  return documentPaths;
}; 