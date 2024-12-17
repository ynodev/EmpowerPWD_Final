import { useState, useEffect } from 'react';
import axios from 'axios';

const Resources = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchVideos();
    }, []);

    const fetchVideos = async () => {
        try {
            const response = await axios.get('/api/resources/videos');
            setVideos(response.data.videos);
        } catch (err) {
            setError('Failed to fetch videos');
            console.error('Error fetching videos:', err);
        }
    };

    const handleFileSelect = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setError('Please select a video file');
            return;
        }

        setLoading(true);
        setError(null);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('video', selectedFile);
        formData.append('title', title);
        formData.append('description', description);

        try {
            await axios.post('/api/resources/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(progress);
                },
            });

            // Reset form
            setTitle('');
            setDescription('');
            setSelectedFile(null);
            setUploadProgress(0);
            
            // Refresh video list
            fetchVideos();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload video');
            console.error('Upload error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Resource Center</h1>

            {/* Upload Form */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                <h2 className="text-xl font-semibold mb-4">Upload New Video</h2>
                <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Video Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border rounded"
                            rows="3"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Video File</label>
                        <input
                            type="file"
                            onChange={handleFileSelect}
                            accept="video/*"
                            className="w-full"
                            required
                        />
                    </div>

                    {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-600 h-2.5 rounded-full"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 text-sm">{error}</div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-black text-white px-4 py-2 rounded-full hover:bg-gray-800 disabled:bg-gray-400"
                    >
                        {loading ? 'Uploading...' : 'Upload Video'}
                    </button>
                </form>
            </div>

            {/* Video List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video) => (
                    <div key={video.id} className="bg-white p-4 rounded-lg shadow-md">
                        <div className="aspect-w-16 aspect-h-9 mb-4">
                            <iframe
                                src={`https://player.vimeo.com/video/${video.vimeoId}`}
                                className="w-full h-full rounded"
                                frameBorder="0"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                        <h3 className="font-semibold mb-2">{video.title}</h3>
                        <p className="text-sm text-gray-600">{video.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Resources; 