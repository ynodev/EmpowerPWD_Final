import React, { useState } from 'react';
import axios from 'axios';

// File upload component
const DocumentUpload = ({ onFileUpload, type }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
    
    if (!selectedFile) {
      setUploadError('No file selected');
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadError('Invalid file type. Please upload PDF, DOC, DOCX, JPG, or PNG.');
      return;
    }

    // Validate file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds 5MB limit');
      return;
    }

    setFile(selectedFile);
    setUploadError(null);

    // Create FormData for file upload
    const formData = new FormData();
    formData.append(type, selectedFile);

    try {
      setUploading(true);
      const response = await axios.post('/api/upload/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Assume the response contains the file path or URL
      onFileUpload(type, {
        path: response.data.path,
        originalName: selectedFile.name,
        mimeType: selectedFile.type
      });

      setUploading(false);
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Upload failed');
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    onFileUpload(type, null);
  };

  return (
    <div className="mb-4">
      <label className="block mb-2 font-poppins text-[15px]">
        Upload {type === 'resume' ? 'Resume' : 'Cover Letter'}
      </label>
      <div className="flex items-center">
        <input
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          onChange={handleFileChange}
          className="w-full bg-[#F4F4F4] text-gray-700 px-4 py-2 rounded-[5px] file:mr-4 file:rounded-md file:border-0 file:bg-blue-500 file:px-4 file:py-2 file:text-sm file:text-white hover:file:bg-blue-600"
        />
        {file && (
          <button 
            onClick={clearFile} 
            className="ml-2 text-red-500 hover:text-red-700"
          >
            Clear
          </button>
        )}
      </div>
      {uploading && <p className="text-blue-500 mt-2">Uploading...</p>}
      {uploadError && <p className="text-red-500 mt-2">{uploadError}</p>}
      {file && !uploading && (
        <p className="text-green-500 mt-2">
          Selected: {file.name} ({Math.round(file.size / 1024)} KB)
        </p>
      )}
    </div>
  );
};


export default DocumentUpload;