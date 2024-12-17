import express from 'express';
import multer from 'multer';
import { Vimeo } from '@vimeo/vimeo';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddlewareControl.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { SavedVideo } from '../models/userModel.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Vimeo client configuration
const client = new Vimeo(
    process.env.VIMEO_CLIENT_ID,
    process.env.VIMEO_CLIENT_SECRET,
    process.env.VIMEO_ACCESS_TOKEN
);

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// Helper Functions
const checkVideoProcessing = async (videoId) => {
    return new Promise((resolve, reject) => {
        const checkStatus = () => {
            client.request({
                method: 'GET',
                path: `/videos/${videoId}`
            }, (error, body) => {
                if (error) return reject(error);
                
                switch (body.transcode.status) {
                    case 'complete':
                        resolve();
                        break;
                    case 'in_progress':
                        setTimeout(checkStatus, 5000);
                        break;
                    default:
                        reject(new Error('Video processing failed'));
                }
            });
        };
        checkStatus();
    });
};

const cleanupFile = async (filePath) => {
    try {
        // Check if file exists before attempting to delete
        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
            console.log('Temporary file deleted successfully');
        }
    } catch (err) {
        console.log('Cleanup warning:', err.message);
        // Don't throw the error as it's not critical
    }
};

// Routes
router.post('/upload', 
    authMiddleware, 
    roleMiddleware(['admin']), 
    upload.single('video'), 
    async (req, res) => {
        let uploadedFilePath = null;

        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'No video file provided'
                });
            }

            uploadedFilePath = req.file.path;

            const response = await new Promise((resolve, reject) => {
                client.upload(
                    uploadedFilePath,
                    {
                        name: req.body.title || 'Untitled',
                        description: req.body.description || '',
                        privacy: {
                            view: 'anybody'
                        }
                    },
                    async (uri) => {
                        try {
                            const videoId = uri.split('/').pop();
                            await checkVideoProcessing(videoId);
                            resolve(uri);
                        } catch (error) {
                            reject(error);
                        } finally {
                            if (uploadedFilePath) {
                                await cleanupFile(uploadedFilePath);
                            }
                        }
                    },
                    (bytesUploaded, bytesTotal) => {
                        const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
                        console.log(`${percentage}% uploaded`);
                    },
                    (error) => {
                        reject(error);
                    }
                );
            });

            const videoId = response.split('/').pop();
            await new Promise((resolve, reject) => {
                client.request({
                    method: 'PATCH',
                    path: `/videos/${videoId}`,
                    body: {
                        privacy: {
                            view: 'anybody',
                            embed: 'public',
                            download: false,
                            comments: 'nobody'
                        }
                    }
                }, (error, body) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(body);
                });
            });

            res.json({
                success: true,
                vimeoId: videoId,
                message: 'Video uploaded successfully'
            });

        } catch (error) {
            console.error('Upload error:', error);
            
            if (uploadedFilePath) {
                await cleanupFile(uploadedFilePath);
            }

            res.status(500).json({
                success: false,
                message: 'Failed to upload video',
                error: error.message
            });
        }
});

router.get('/videos', 
    authMiddleware,
    async (req, res) => {
        try {
            client.request({
                method: 'GET',
                path: '/me/videos',
                query: {
                    per_page: 100,
                    fields: 'uri,name,description,pictures,embed,privacy,transcode.status'
                }
            }, (error, body) => {
                if (error) {
                    console.error(error);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to fetch videos'
                    });
                }

                const videos = body.data
                    .filter(video => video.transcode.status === 'complete')
                    .map(video => ({
                        id: video.uri.split('/').pop(),
                        vimeoId: video.uri.split('/').pop(),
                        title: video.name,
                        description: video.description,
                        thumbnail: video.pictures?.sizes?.[0]?.link,
                        embedUrl: video.embed?.html,
                        privacy: video.privacy
                    }));

                res.json({
                    success: true,
                    videos
                });
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch videos'
            });
        }
});

// Add this route for getting all resources
router.get('/', 
    authMiddleware,
    async (req, res) => {
        try {
            client.request({
                method: 'GET',
                path: '/me/videos',
                query: {
                    per_page: 100,
                    fields: 'uri,name,description,pictures,embed,privacy,transcode.status'
                }
            }, (error, body) => {
                if (error) {
                    console.error('Vimeo API error:', error);
                    return res.status(500).json({
                        status: 'error',
                        message: 'Failed to fetch videos'
                    });
                }

                const resources = body.data
                    .filter(video => video.transcode.status === 'complete')
                    .map(video => ({
                        _id: video.uri.split('/').pop(),
                        title: video.name,
                        description: video.description,
                        vimeoId: video.uri.split('/').pop(),
                        thumbnail: video.pictures?.sizes?.[3]?.link || video.pictures?.sizes?.[0]?.link,
                        duration: video.duration,
                        categories: video.tags || [],
                        embedUrl: video.embed?.html
                    }));

                res.status(200).json({
                    status: 'success',
                    data: resources
                });
            });
        } catch (error) {
            console.error('Server error:', error);
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        }
    }
);

// Delete video
router.delete('/:id', 
    authMiddleware, 
    roleMiddleware(['admin']), 
    async (req, res) => {
        try {
            const videoId = req.params.id;
            
            await new Promise((resolve, reject) => {
                client.request({
                    method: 'DELETE',
                    path: `/videos/${videoId}`
                }, (error, body) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });
            });

            res.status(200).json({
                success: true,
                message: 'Video deleted successfully'
            });
        } catch (error) {
            console.error('Delete error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to delete video'
            });
        }
    }
);

// Update video details
router.patch('/:id', 
    authMiddleware, 
    roleMiddleware(['admin']), 
    async (req, res) => {
        try {
            const videoId = req.params.id;
            const { title, description } = req.body;

            await new Promise((resolve, reject) => {
                client.request({
                    method: 'PATCH',
                    path: `/videos/${videoId}`,
                    body: {
                        name: title,
                        description: description
                    }
                }, (error, body) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(body);
                });
            });

            res.status(200).json({
                success: true,
                message: 'Video updated successfully'
            });
        } catch (error) {
            console.error('Update error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to update video'
            });
        }
    }
);

// Save a video as favorite
router.post('/favorite', 
    authMiddleware,
    roleMiddleware(['employer']), 
    async (req, res) => {
        try {
            const { videoId, title, thumbnail, description } = req.body;
            const employerId = req.user.profile._id;

            // Check if already favorited
            const existingFavorite = await SavedVideo.findOne({
                employer: employerId,
                videoId: videoId
            });

            if (existingFavorite) {
                return res.status(400).json({
                    success: false,
                    message: 'Video already saved to favorites'
                });
            }

            // Create new favorite
            const savedVideo = new SavedVideo({
                employer: employerId,
                videoId,
                title,
                thumbnail,
                description
            });

            await savedVideo.save();

            res.status(200).json({
                success: true,
                message: 'Video saved to favorites',
                savedVideo
            });
        } catch (error) {
            console.error('Save favorite error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to save video to favorites'
            });
        }
    }
);

// Remove from favorites
router.delete('/favorite/:videoId',
    authMiddleware,
    roleMiddleware(['employer']),
    async (req, res) => {
        try {
            const { videoId } = req.params;
            const employerId = req.user.profile._id;

            await SavedVideo.findOneAndDelete({
                employer: employerId,
                videoId: videoId
            });

            res.status(200).json({
                success: true,
                message: 'Video removed from favorites'
            });
        } catch (error) {
            console.error('Remove favorite error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to remove video from favorites'
            });
        }
    }
);

// Get favorite videos
router.get('/favorites',
    authMiddleware,
    roleMiddleware(['employer']),
    async (req, res) => {
        try {
            const employerId = req.user.profile._id;
            const favorites = await SavedVideo.find({ employer: employerId })
                .sort('-savedAt');

            res.status(200).json({
                success: true,
                data: favorites
            });
        } catch (error) {
            console.error('Fetch favorites error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to fetch favorite videos'
            });
        }
    }
);

export default router;