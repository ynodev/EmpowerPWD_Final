import express from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middleware/authMiddlewareControl.js';
import {
    getAllBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    getBlogById,
    updateBlogPrivacy
} from '../controllers/blogController.js';
import Blog from '../models/Blog.js';

const router = express.Router();

// Configure local storage for blog thumbnails
const blogStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(process.cwd(), 'uploads', 'blog-thumbnails'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        cb(null, `${uuidv4()}-${uniqueSuffix}-${sanitizedOriginalName}`);
    }
});

// File filter for blog thumbnails
const blogFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.'), false);
    }
};

// Configure multer for blog uploads
const blogUpload = multer({
    storage: blogStorage,
    fileFilter: blogFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
router.get('/public', async (req, res) => {
  try {
    const { type, sort, search } = req.query;
    
    // Build filter
    const filter = { privacy: 'public' };
    if (type && type !== 'all') {
      filter.type = type;
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 }
    };

    const blogs = await Blog.find(filter)
      .sort(sortOptions[sort] || sortOptions.newest)
      .select('-content');

    res.json({
      success: true,
      blogs
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blogs'
    });
  }
});
router.get('/public/:id', async (req, res) => {
  try {
    const blog = await Blog.findOne({ 
      _id: req.params.id,
      privacy: 'public'
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    res.json({
      success: true,
      blog
    });
  } catch (error) {
    console.error('Error fetching blog details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching blog details'
    });
  }
});
// Routes
router.get('/', authMiddleware, getAllBlogs);
router.post('/', authMiddleware, blogUpload.single('thumbnail'), createBlog);
router.patch('/:id', authMiddleware, blogUpload.single('thumbnail'), updateBlog);
router.delete('/:id', authMiddleware, deleteBlog);
router.get('/:id', getBlogById);
router.patch('/:id/privacy', authMiddleware, updateBlogPrivacy);

export default router;
