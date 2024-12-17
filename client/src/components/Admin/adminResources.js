import React, { useState, useEffect } from 'react';
import SidebarAdmin from './sideNavAdmin';
import { Plus, Loader, Trash2, Edit, X, Upload, Search, Filter, ChevronDown, RefreshCw, FileText, Video, BookOpen, MoreVertical, Lock, Globe } from 'lucide-react';
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import BlogView from './BlogView';

const AdminResources = () => {
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [editingResource, setEditingResource] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        file: null,
        contentType: 'video',
        content: '',
        type: ''
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filterType, setFilterType] = useState('all');
    const [sortField, setSortField] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeTab, setActiveTab] = useState('videos');
    const [blogPosts, setBlogPosts] = useState([]);
    const [notification, setNotification] = useState({ type: '', message: '' });
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const resourceTypes = [
        'Video',
        'Document',
        'Article',
        'Tutorial'
    ];

    const videoTypes = [
        'Tutorial',
        'Lecture',
        'Workshop',
        'Guide'
    ];

    const blogTypes = [
        'Article',
        'Guide',
        'News',
        'Case Study'
    ];

    useEffect(() => {
        fetchResources();
    }, []);

    useEffect(() => {
        const savedPosts = JSON.parse(localStorage.getItem('blogPosts') || '[]');
        setBlogPosts(savedPosts);
    }, []);

    useEffect(() => {
        if (activeTab === 'blogs') {
            fetchBlogs();
        }
    }, [activeTab]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const tab = searchParams.get('tab');
        if (tab === 'videos' || tab === 'blogs') {
            setActiveTab(tab);
        }
    }, [window.location.search]);

    const fetchResources = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/resources/videos', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResources(response.data.videos || []);
        } catch (error) {
            console.error('Error fetching resources:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBlogs = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/blogs', {
                headers: { Authorization: `Bearer ${token}` },
                params: {
                    page: currentPage,
                    limit: 10,
                    type: filterType !== 'all' ? filterType : undefined,
                    search: searchQuery || undefined,
                    sortBy: sortField,
                    order: sortOrder
                }
            });

            setBlogPosts(response.data.blogs);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching blogs:', error);
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to fetch blogs'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (formData.contentType === 'blog') {
            handleBlogSubmit(e);
        } else {
            handleVideoUpload(e);
        }
    };

    const handleVideoUpload = async (e) => {
        e.preventDefault();
        if (!formData.file || !formData.title) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('video', formData.file);
        uploadData.append('title', formData.title);
        uploadData.append('description', formData.description);

        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/resources/upload', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(progress);
                }
            });

            setShowUploadModal(false);
            setFormData({ 
                title: '', 
                description: '', 
                file: null, 
                contentType: 'video', 
                content: '', 
                type: '' 
            });
            fetchResources();
        } catch (error) {
            console.error('Upload error:', error);
            setNotification({
                type: 'error',
                message: 'Failed to upload video'
            });
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleBlogSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.content || !formData.type) {
            setNotification({
                type: 'error',
                message: 'Please fill in all required fields'
            });
            return;
        }

        setUploading(true);
        try {
            const token = localStorage.getItem('token');
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('content', formData.content);
            formDataToSend.append('type', formData.type);
            formDataToSend.append('privacy', 'public');
            
            if (formData.thumbnail) {
                formDataToSend.append('thumbnail', formData.thumbnail);
            }

            await axios.post('/api/blogs', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            setNotification({
                type: 'success',
                message: 'Blog post published successfully!'
            });
            
            setFormData({
                title: '',
                description: '',
                file: null,
                contentType: 'blog',
                content: '',
                type: '',
                thumbnail: null
            });
            
            setShowUploadModal(false);
            fetchBlogs();
        } catch (error) {
            console.error('Error publishing blog:', error);
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to publish blog post'
            });
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (videoId) => {
        if (!window.confirm('Are you sure you want to delete this video?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/resources/${videoId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchResources();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        if (!editingResource) return;

        try {
            const token = localStorage.getItem('token');
            await axios.patch(`/api/resources/${editingResource.id}`, {
                title: editingResource.title,
                description: editingResource.description
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEditingResource(null);
            fetchResources();
        } catch (error) {
            console.error('Update error:', error);
        }
    };

    const resetFilters = () => {
        setFilterType('all');
        setSortField('createdAt');
        setSortOrder('desc');
        setSearchQuery('');
        setCurrentPage(1);
    };

    const handleEditorChange = (content) => {
        setFormData(prev => ({ ...prev, content }));
    };

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],  // Headers
            ['bold', 'italic', 'underline', 'strike'],  // Text styling
            [{ 'color': [] }],  // Text color
            [{ 'align': [] }],  // Text alignment
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],  // Lists
            ['blockquote'],  // Quotes
            ['clean']  // Remove formatting
        ]
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'color',
        'align',
        'list', 'bullet',
        'blockquote'
    ];

    const handleBlogDelete = async (blogId) => {
        if (!window.confirm('Are you sure you want to delete this blog post?')) return;

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/blogs/${blogId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setNotification({
                type: 'success',
                message: 'Blog post deleted successfully'
            });
            
            fetchBlogs(); // Refresh the list after deletion
        } catch (error) {
            console.error('Delete error:', error);
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to delete blog post'
            });
        }
    };

    const toggleDropdown = (e, blogId) => {
        e.stopPropagation(); // Prevent card click when clicking dropdown
        setActiveDropdown(activeDropdown === blogId ? null : blogId);
    };

    const handlePrivacyChange = async (blogId, newPrivacy) => {
        try {
            const token = localStorage.getItem('token');
            await axios.patch(
                `/api/blogs/${blogId}/privacy`,
                { privacy: newPrivacy },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            fetchBlogs(); // Refresh the list
            setActiveDropdown(null); // Close dropdown
            setNotification({
                type: 'success',
                message: `Blog is now ${newPrivacy}`
            });
        } catch (error) {
            setNotification({
                type: 'error',
                message: error.response?.data?.message || 'Failed to update privacy'
            });
        }
    };

    const renderResources = () => {
        if (activeTab === 'videos') {
            return resources.map((resource) => (
                <div key={resource.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden">
                    <div className="relative aspect-video bg-gray-100">
                        {activeTab === 'videos' ? (
                            resource.thumbnail && (
                                <img
                                    src={resource.thumbnail}
                                    alt={resource.title}
                                    className="w-full h-full object-cover"
                                />
                            )
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                                <FileText className="w-12 h-12 text-gray-400" />
                            </div>
                        )}
                        <div className="absolute top-2 right-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                                activeTab === 'videos' 
                                    ? 'bg-blue-100 text-blue-800' 
                                    : 'bg-green-100 text-green-800'
                            }`}>
                                {resource.type || (activeTab === 'videos' ? 'Video' : 'Blog')}
                            </span>
                        </div>
                    </div>

                    <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
                        <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                        
                        <div className="flex gap-2">
                            <button 
                                className={`flex-1 px-4 py-2 rounded-xl text-white ${
                                    activeTab === 'videos' 
                                        ? 'bg-blue-500 hover:bg-blue-600' 
                                        : 'bg-green-500 hover:bg-green-600'
                                }`}
                            >
                                {activeTab === 'videos' ? 'Watch Video' : 'Read Post'}
                            </button>
                            
                           
                            <button
                                onClick={() => handleDelete(resource.id)}
                                className="p-2 text-gray-600 hover:text-red-600 rounded-lg hover:bg-gray-100"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            ));
        } else {
            return blogPosts.map((blog) => (
                <div 
                    key={blog._id} 
                    className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedBlog(blog._id)}
                >
                    <div className="relative aspect-video bg-gray-100">
                        {blog.thumbnail ? (
                            <img
                                src={blog.thumbnail}
                                alt={blog.title}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                                <FileText className="w-12 h-12 text-gray-400" />
                            </div>
                        )}
                        <div className="absolute top-2 right-2 flex items-center gap-2">
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                                {blog.type}
                            </span>
                            {/* Action Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={(e) => toggleDropdown(e, blog._id)}
                                    className="p-1 rounded-full bg-white/90 hover:bg-white text-gray-600 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <MoreVertical size={20} />
                                </button>
                                {activeDropdown === blog._id && (
                                    <div 
                                        className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10"
                                        onClick={(e) => e.stopPropagation()} // Prevent card click when clicking menu items
                                    >
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedBlog(blog._id);
                                                setIsEditing(true);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            <Edit size={16} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePrivacyChange(blog._id, blog.privacy === 'public' ? 'private' : 'public');
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            {blog.privacy === 'public' ? <Lock size={16} /> : <Globe size={16} />}
                                            {blog.privacy === 'public' ? 'Make Private' : 'Make Public'}
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleBlogDelete(blog._id);
                                            }}
                                            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">{blog.title}</h3>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{blog.description}</p>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                                <span>•</span>
                                <span>{blog.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {blog.privacy === 'private' && (
                                    <span className="text-gray-500 flex items-center gap-1">
                                        <Lock size={16} />
                                        <span className="text-sm">Private</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ));
        }
    };

    const Notification = ({ type, message }) => {
        if (!message) return null;

        const bgColor = type === 'error' ? 'bg-red-100' : 'bg-green-100';
        const textColor = type === 'error' ? 'text-red-800' : 'text-green-800';

        return (
            <div className={`fixed top-4 right-4 p-4 rounded-lg ${bgColor} ${textColor} z-50`}>
                {message}
            </div>
        );
    };

    useEffect(() => {
        const handleClickOutside = () => setActiveDropdown(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        const newUrl = `${window.location.pathname}?tab=${tab}`;
        window.history.pushState({}, '', newUrl);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Notification type={notification.type} message={notification.message} />
            <SidebarAdmin />
            <div className="flex-1 ml-64">
                {/* Header */}
                <div className="bg-white shadow-sm">
                    <div className="p-8">
                        <h1 className="text-4xl font-bold text-[#1A2755]">Resources Management</h1>
                        <p className="text-gray-600 mt-2">Manage and organize learning resources for users</p>
                    </div>
                </div>

                <div className="p-8">
                    {/* Stats Cards */}
                   

                    {/* Main Content Area */}
                    <div className="bg-white rounded-2xl shadow-sm">
                        {/* Tab Navigation */}
                        <div className="flex gap-6 px-6 border-b">
                            <button 
                                className={`py-4 text-sm font-medium transition-colors relative ${
                                    activeTab === 'videos' 
                                        ? 'text-blue-700 border-b-2 border-blue-700' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                                onClick={() => handleTabChange('videos')}
                            >
                                <div className="flex items-center gap-2">
                                    <Video className="w-4 h-4" />
                                    Video Content
                                </div>
                            </button>
                            <button 
                                className={`py-4 text-sm font-medium transition-colors relative ${
                                    activeTab === 'blogs' 
                                        ? 'text-blue-700 border-b-2 border-blue-700' 
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                                onClick={() => handleTabChange('blogs')}
                            >
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Blog Posts
                                </div>
                            </button>
                        </div>

                        {/* Search and Filter Bar */}
                        <div className="p-6 border-b">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="relative flex-1 max-w-md">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search resources..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className="px-6 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 flex items-center gap-2 transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    >
                                        <Filter className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-700">Filters</span>
                                        <ChevronDown 
                                            className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${
                                                showFilters ? 'rotate-180' : ''
                                            }`} 
                                        />
                                    </button>
                                    <button
                                        onClick={() => setShowUploadModal(true)}
                                        className="px-6 py-2.5 bg-[#144390] text-white rounded-full hover:bg-blue-700 flex items-center gap-2 transition-all duration-200"
                                    >
                                        <Plus size={20} />
                                        Add Resource
                                    </button>
                                </div>
                            </div>

                            {/* Advanced Filters */}
                            {showFilters && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                {activeTab === 'videos' ? 'Video Type' : 'Blog Type'}
                                            </label>
                                            <select
                                                value={filterType}
                                                onChange={(e) => setFilterType(e.target.value)}
                                                className="w-full p-2.5 pl-4 pr-10 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white transition-all duration-200"
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'right 1rem center',
                                                    backgroundSize: '1.5em 1.5em'
                                                }}
                                            >
                                                <option value="all">All Types</option>
                                                {(activeTab === 'videos' ? videoTypes : blogTypes).map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                                            <select
                                                value={`${sortField}-${sortOrder}`}
                                                onChange={(e) => {
                                                    const [field, order] = e.target.value.split('-');
                                                    setSortField(field);
                                                    setSortOrder(order);
                                                }}
                                                className="w-full p-2.5 pl-4 pr-10 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white transition-all duration-200"
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundPosition: 'right 1rem center',
                                                    backgroundSize: '1.5em 1.5em'
                                                }}
                                            >
                                                <option value="createdAt-desc">Newest First</option>
                                                <option value="createdAt-asc">Oldest First</option>
                                                <option value="title-asc">Title (A-Z)</option>
                                                <option value="title-desc">Title (Z-A)</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Reset Filters Button */}
                                    <div className="flex justify-end mt-6">
                                        <button
                                            onClick={resetFilters}
                                            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Reset Filters
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Resources Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                            {renderResources()}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center p-4 border-t">
                                <div className="flex gap-2">
                                    <button
                                        className="px-4 py-2 border rounded-full disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                        onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                                        disabled={currentPage === 1 || loading}
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 text-gray-600">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        className="px-4 py-2 border rounded-full disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                        onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                                        disabled={currentPage === totalPages || loading}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Upload Modal - Updated size and styling */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white px-8 py-6 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        {formData.contentType === 'video' ? 'Upload New Video' : 'Create New Blog Post'}
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {formData.contentType === 'video' 
                                            ? 'Upload and share educational videos' 
                                            : 'Create and publish informative blog content'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowUploadModal(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="p-8">
                            <form onSubmit={handleFormSubmit} className="space-y-6">
                                {/* Content Type Selection */}
                                <div className="grid grid-cols-2 gap-4 max-w-md">
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, contentType: 'video' }))}
                                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all duration-200 ${
                                            formData.contentType === 'video'
                                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                                : 'border-gray-200 hover:border-blue-500'
                                        }`}
                                    >
                                        <Video className="w-5 h-5" />
                                        <span>Video</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, contentType: 'blog' }))}
                                        className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all duration-200 ${
                                            formData.contentType === 'blog'
                                                ? 'bg-green-50 border-green-500 text-green-700'
                                                : 'border-gray-200 hover:border-green-500'
                                        }`}
                                    >
                                        <FileText className="w-5 h-5" />
                                        <span>Blog</span>
                                    </button>
                                </div>

                                {formData.contentType === 'video' ? (
                                    // Video Upload Form
                                    <div className="space-y-6">
                                        {/* Video Type Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Video Type
                                            </label>
                                            <select
                                                className="w-full p-3 border border-gray-200 rounded-xl"
                                                value={formData.type}
                                                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                            >
                                                <option value="">Select type</option>
                                                {videoTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Title and Description */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Title
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                                placeholder={`Enter ${formData.contentType} title`}
                                                required
                                            />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                                placeholder={`Enter ${formData.contentType} description`}
                                                rows="4"
                                            />
                                        </div>

                                        {/* Video Upload */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Upload Video
                                            </label>
                                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl">
                                                <div className="space-y-2 text-center">
                                                    <div className="flex text-sm text-gray-600">
                                                        <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                            <span>Upload a video</span>
                                                            <input
                                                                type="file"
                                                                accept="video/*"
                                                                onChange={(e) => setFormData(prev => ({ 
                                                                    ...prev, 
                                                                    file: e.target.files[0] 
                                                                }))}
                                                                className="sr-only"
                                                            />
                                                        </label>
                                                        <p className="pl-1">or drag and drop</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        MP4, MOV, WEBM up to 5MB
                                                    </p>
                                                    {formData.file && (
                                                        <div className="mt-2">
                                                            <p className="text-sm text-gray-600">
                                                                Selected: {formData.file.name}
                                                            </p>
                                                            {/* Preview video */}
                                                            <video
                                                                src={URL.createObjectURL(formData.file)}
                                                                alt="Video preview"
                                                                className="mt-2 mx-auto h-32 w-auto rounded-lg object-cover"
                                                                controls
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Blog Post Form
                                    <div className="grid grid-cols-2 gap-6">
                                        {/* Left Column */}
                                        <div className="space-y-6">
                                            {/* Resource Type Selection */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    {formData.contentType === 'video' ? 'Video Type' : 'Blog Type'}
                                                </label>
                                                <select
                                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                                    value={formData.type}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                                                >
                                                    <option value="">Select type</option>
                                                    {(formData.contentType === 'video' ? videoTypes : blogTypes).map(type => (
                                                        <option key={type} value={type}>{type}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Title Input */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Title
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                                    placeholder={`Enter ${formData.contentType} title`}
                                                    required
                                                />
                                            </div>

                                            {/* Description Input */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Description
                                                </label>
                                                <textarea
                                                    value={formData.description}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                                    className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                                                    placeholder={`Enter ${formData.contentType} description`}
                                                    rows="4"
                                                />
                                            </div>

                                            {/* Thumbnail Upload */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Blog Thumbnail
                                                </label>
                                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-gray-400 transition-colors">
                                                    <div className="space-y-2 text-center">
                                                        <div className="flex text-sm text-gray-600">
                                                            <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                                                                <span>Upload a thumbnail</span>
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => setFormData(prev => ({ 
                                                                        ...prev, 
                                                                        thumbnail: e.target.files[0] 
                                                                    }))}
                                                                    className="sr-only"
                                                                />
                                                            </label>
                                                            <p className="pl-1">or drag and drop</p>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            PNG, JPG, WEBP up to 5MB
                                                        </p>
                                                        {formData.thumbnail && (
                                                            <div className="mt-2">
                                                                <p className="text-sm text-gray-600">
                                                                    Selected: {formData.thumbnail.name}
                                                                </p>
                                                                {/* Preview thumbnail */}
                                                                <img
                                                                    src={URL.createObjectURL(formData.thumbnail)}
                                                                    alt="Thumbnail preview"
                                                                    className="mt-2 mx-auto h-32 w-auto rounded-lg object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column - Blog Content Editor */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Blog Content
                                            </label>
                                            <div className="border rounded-xl overflow-hidden">
                                                <ReactQuill
                                                    theme="snow"
                                                    value={formData.content}
                                                    onChange={handleEditorChange}
                                                    modules={modules}
                                                    formats={formats}
                                                    className="h-[400px] bg-white"
                                                    style={{
                                                        borderRadius: '12px',
                                                    }}
                                                    placeholder="Write your blog content here..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Upload Progress */}
                                {uploading && (
                                    <div className="space-y-2">
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                                                style={{ width: `${uploadProgress}%` }}
                                            />
                                        </div>
                                        <p className="text-sm text-gray-600 text-center">
                                            {uploadProgress}% uploaded
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowUploadModal(false)}
                                        className="px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors w-32"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={uploading || (!formData.file && formData.contentType === 'video') || !formData.title}
                                        className={`px-4 py-3 rounded-xl flex items-center justify-center gap-2 w-32
                                            ${uploading || (!formData.file && formData.contentType === 'video') || !formData.title
                                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                            } transition-colors`}
                                    >
                                        {uploading ? (
                                            <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                <span>Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-4 h-4" />
                                                <span>Publish</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {selectedBlog && (
                <BlogView
                    blogId={selectedBlog}
                    onClose={() => setSelectedBlog(null)}
                    onDelete={handleBlogDelete}
                />
            )}
        </div>
    );
};

export default AdminResources;
