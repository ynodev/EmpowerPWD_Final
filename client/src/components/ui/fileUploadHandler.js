import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const FileUploadHandler = ({ onFileChange, fileType, acceptedTypes, label }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const validateFile = (file) => {
    // Check file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      return 'File size exceeds 5MB limit';
    }

    // Check file type
    const allowedTypes = acceptedTypes.split(',').map(type => type.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedTypes.includes(fileExtension)) {
      return 'Invalid file type';
    }

    return null;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    const validationError = validateFile(file);
    
    if (validationError) {
      setError(validationError);
      setSelectedFile(null);
      setFileName('');
      e.target.value = ''; // Reset input
      return;
    }

    setSelectedFile(file);
    setFileName(file.name);
    // Pass the file object to the parent
    onFileChange(file);
};
  // Function to upload file - will be called by parent component during form submission
  const uploadFile = async () => {
    if (!selectedFile) return null;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('document', selectedFile);
      formData.append('fileType', fileType);

      const response = await fetch('http://localhost:5001/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return data.fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Error uploading file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileName('');
    onFileChange(fileType, null);
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-gray-400 transition-colors">
        <input
          type="file"
          onChange={handleFileSelect}
          accept={acceptedTypes}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-2">
            {fileName ? (
              <div className="flex flex-col items-center">
                <p className="text-sm text-gray-600">{fileName}</p>
                <button
                  onClick={handleRemoveFile}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                  type="button"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  Drag and drop a file, or click to select
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {acceptedTypes.split(',').join(', ')} up to 5MB
                </p>
              </>
            )}
          </div>
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add upload method to component
FileUploadHandler.uploadFile = async (file) => {
  if (!file) return null;
  
  const formData = new FormData();
  formData.append('document', file);
  
  const response = await fetch('http://localhost:5001/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Upload failed');
  }

  const data = await response.json();
  return data.fileUrl;
};

export default FileUploadHandler;