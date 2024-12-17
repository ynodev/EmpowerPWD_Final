import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit, Trash2, Lock, Globe, FileEdit, X } from 'lucide-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const BlogView = ({ blogId, onClose, onEdit, onDelete }) => {
    const [blog, setBlog] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedBlog, setEditedBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBlog();
    }, [blogId]);

    const fetchBlog = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/blogs/${blogId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlog(response.data);
            setEditedBlog(response.data);
            setLoading(false);
        } catch (error) {
            setError('Failed to load blog');
            setLoading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            
            Object.keys(editedBlog).forEach(key => {
                if (key !== 'thumbnail' || (key === 'thumbnail' && editedBlog[key] instanceof File)) {
                    formData.append(key, editedBlog[key]);
                }
            });

            await axios.patch(`/api/blogs/${blogId}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            fetchBlog();
            setIsEditing(false);
        } catch (error) {
            setError('Failed to update blog');
        }
    };

    const handlePrivacyChange = async (privacy) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/blogs/${blogId}/privacy`, 
                { privacy },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            fetchBlog();
        } catch (error) {
            setError('Failed to update privacy settings');
        }
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    if (!blog) return <div className="p-8 text-center">Blog not found</div>;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col">
                <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h2 className="text-3xl font-bold text-gray-900">
                                {isEditing ? 'Edit Blog Post' : blog.title}
                            </h2>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePrivacyChange(blog.privacy === 'public' ? 'private' : 'public')}
                                    className={`p-2 rounded-lg flex items-center gap-2 ${
                                        blog.privacy === 'public' 
                                            ? 'text-green-600 hover:bg-green-50' 
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    {blog.privacy === 'public' ? <Globe size={20} /> : <Lock size={20} />}
                                    <span className="text-sm font-medium">{blog.privacy === 'public' ? 'Public' : 'Private'}</span>
                                </button>
                                <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800">
                                    {blog.type}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {!isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(true)}
                                        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-2"
                                    >
                                        <Edit size={18} />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={() => handlePrivacyChange(blog.privacy === 'draft' ? 'public' : 'draft')}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                                    >
                                        <FileEdit size={18} />
                                        <span>{blog.privacy === 'draft' ? 'Publish' : 'Save as Draft'}</span>
                                    </button>
                                    <button
                                        onClick={() => onDelete(blogId)}
                                        className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        <span>Delete</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdate}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                                    >
                                        <FileEdit size={18} />
                                        Save Changes
                                    </button>
                                </>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                            >
                                <X size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    {isEditing ? (
                        <div className="space-y-6 max-w-4xl mx-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    value={editedBlog.title}
                                    onChange={(e) => setEditedBlog({...editedBlog, title: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={editedBlog.description}
                                    onChange={(e) => setEditedBlog({...editedBlog, description: e.target.value})}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    rows="3"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Thumbnail
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setEditedBlog({
                                        ...editedBlog, 
                                        thumbnail: e.target.files[0]
                                    })}
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Content
                                </label>
                                <ReactQuill
                                    value={editedBlog.content}
                                    onChange={(content) => setEditedBlog({...editedBlog, content})}
                                    className="bg-white"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-8">
                            {blog.thumbnail && (
                                <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg">
                                    <img 
                                        src={blog.thumbnail}
                                        alt={blog.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            )}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 text-gray-500 text-sm">
                                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span>{blog.author}</span>
                                </div>
                                <p className="text-xl text-gray-600 leading-relaxed">
                                    {blog.description}
                                </p>
                            </div>
                            <div 
                                className="prose prose-lg max-w-none"
                                dangerouslySetInnerHTML={{ __html: blog.content }}
                            />
                        </div>
                    )}
                </div>

                {isEditing && (
                    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdate}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                            >
                                <FileEdit size={18} />
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogView; 