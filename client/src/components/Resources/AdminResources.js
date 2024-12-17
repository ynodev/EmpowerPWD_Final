import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader, Trash2, Edit, Upload, X } from 'lucide-react';

const AdminResources = () => {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [editingResource, setEditingResource] = useState(null);

    useEffect(() => {
        fetchResources();
    }, []);

    const fetchResources = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/resources/videos', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResources(response.data.videos || []);
            setError(null);
        } catch (err) {
            setError('Failed to load resources');
            console.error('Error fetching resources:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('video', selectedFile);
        formData.append('title', selectedFile.name);
        formData.append('description', '');

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/resources/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(progress);
                }
            });

            setSelectedFile(null);
            setUploadProgress(0);
            fetchResources();
        } catch (err) {
            setError('Failed to upload video');
            console.error('Upload error:', err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (videoId) => {
        if (!window.confirm('Are you sure you want to delete this video?')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/resources/${videoId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchResources();
        } catch (err) {
            setError('Failed to delete video');
            console.error('Delete error:', err);
        }
    };

    const handleEdit = async (e) => {
        e.preventDefault();
        if (!editingResource) return;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `/api/resources/${editingResource.id}`,
                {
                    title: editingResource.title,
                    description: editingResource.description
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setEditingResource(null);
            fetchResources();
        } catch (err) {
            setError('Failed to update video');
            console.error('Update error:', err);
        }
    };

    if (loading) {
        return React.createElement('div', {
            className: "flex items-center justify-center min-h-screen"
        }, React.createElement(Loader, {
            className: "w-8 h-8 animate-spin"
        }));
    }

    return React.createElement('div', {
        className: "container mx-auto px-4 py-8"
    }, [
         // Insert NavEmployer component here
      React.createElement(NavEmployer, { key: 'nav' }),
        // Upload Section
        React.createElement('div', {
            key: 'upload-section',
            className: "mb-8 p-6 bg-white rounded-lg shadow-md"
        }, [
            React.createElement('h2', {
                key: 'upload-title',
                className: "text-xl font-bold mb-4"
            }, "Upload New Video"),
            React.createElement('div', {
                key: 'upload-controls',
                className: "flex gap-4 items-center"
            }, [
                React.createElement('input', {
                    key: 'file-input',
                    type: 'file',
                    accept: 'video/*',
                    onChange: handleFileSelect,
                    className: "flex-1"
                }),
                React.createElement('button', {
                    key: 'upload-button',
                    onClick: handleUpload,
                    disabled: isUploading || !selectedFile,
                    className: `px-4 py-2 bg-black text-white rounded-lg 
                        ${isUploading || !selectedFile ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'}`
                }, [
                    React.createElement(Upload, {
                        key: 'upload-icon',
                        className: "w-4 h-4 inline-block mr-2"
                    }),
                    "Upload"
                ])
            ]),
            isUploading && React.createElement('div', {
                key: 'progress',
                className: "mt-4"
            }, [
                React.createElement('div', {
                    key: 'progress-bar',
                    className: "w-full bg-gray-200 rounded-full h-2.5"
                }, React.createElement('div', {
                    className: "bg-black h-2.5 rounded-full",
                    style: { width: `${uploadProgress}%` }
                })),
                React.createElement('span', {
                    key: 'progress-text',
                    className: "text-sm text-gray-600 mt-1"
                }, `${uploadProgress}% uploaded`)
            ])
        ]),

        // Resources List
        React.createElement('div', {
            key: 'resources-list',
            className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        }, resources.map(resource => 
            React.createElement('div', {
                key: resource.id,
                className: "bg-white rounded-lg shadow-md overflow-hidden"
            }, [
                // Thumbnail
                resource.thumbnail && React.createElement('img', {
                    key: 'thumb',
                    src: resource.thumbnail,
                    alt: resource.title,
                    className: "w-full h-48 object-cover"
                }),

                // Content
                React.createElement('div', {
                    key: 'content',
                    className: "p-4"
                }, [
                    editingResource?.id === resource.id ?
                        // Edit Form
                        React.createElement('form', {
                            key: 'edit-form',
                            onSubmit: handleEdit,
                            className: "space-y-4"
                        }, [
                            React.createElement('input', {
                                key: 'title-input',
                                type: 'text',
                                value: editingResource.title,
                                onChange: (e) => setEditingResource({
                                    ...editingResource,
                                    title: e.target.value
                                }),
                                className: "w-full p-2 border rounded"
                            }),
                            React.createElement('textarea', {
                                key: 'desc-input',
                                value: editingResource.description,
                                onChange: (e) => setEditingResource({
                                    ...editingResource,
                                    description: e.target.value
                                }),
                                className: "w-full p-2 border rounded"
                            }),
                            React.createElement('div', {
                                key: 'edit-buttons',
                                className: "flex gap-2"
                            }, [
                                React.createElement('button', {
                                    key: 'save',
                                    type: 'submit',
                                    className: "px-4 py-2 bg-black text-white rounded"
                                }, "Save"),
                                React.createElement('button', {
                                    key: 'cancel',
                                    type: 'button',
                                    onClick: () => setEditingResource(null),
                                    className: "px-4 py-2 bg-gray-200 rounded"
                                }, "Cancel")
                            ])
                        ]) :
                        // View Mode
                        [
                            React.createElement('h3', {
                                key: 'title',
                                className: "font-semibold text-lg mb-2"
                            }, resource.title),
                            React.createElement('p', {
                                key: 'desc',
                                className: "text-gray-600 text-sm"
                            }, resource.description),
                            React.createElement('div', {
                                key: 'actions',
                                className: "flex gap-2 mt-4"
                            }, [
                                React.createElement('button', {
                                    key: 'edit',
                                    onClick: () => setEditingResource(resource),
                                    className: "p-2 text-gray-600 hover:text-black"
                                }, React.createElement(Edit, { size: 20 })),
                                React.createElement('button', {
                                    key: 'delete',
                                    onClick: () => handleDelete(resource.id),
                                    className: "p-2 text-gray-600 hover:text-red-600"
                                }, React.createElement(Trash2, { size: 20 }))
                            ])
                        ]
                ])
            ])
        ))
    ]);
};

export default AdminResources; 