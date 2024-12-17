import Blog from '../models/Blog.js';

export const getAllBlogs = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            type, 
            privacy,
            search,
            sortBy = 'createdAt',
            order = 'desc'
        } = req.query;

        const query = {};
        if (type) query.type = type;
        if (privacy) query.privacy = privacy;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const sortOptions = {};
        sortOptions[sortBy] = order === 'desc' ? -1 : 1;

        const blogs = await Blog.find(query)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();

        const count = await Blog.countDocuments(query);

        res.json({
            blogs,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalBlogs: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createBlog = async (req, res) => {
    try {
        const { title, description, content, type, privacy = 'public' } = req.body;

        const blog = new Blog({
            title,
            description,
            content,
            type,
            privacy,
            createdBy: req.user._id,
            thumbnail: req.file ? `/uploads/blog-thumbnails/${req.file.filename}` : null
        });

        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateBlog = async (req, res) => {
    try {
        const updates = req.body;
        if (req.file) {
            updates.thumbnail = `/uploads/blog-thumbnails/${req.file.filename}`;
        }

        const blog = await Blog.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            updates,
            { new: true }
        );

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found or unauthorized' });
        }

        res.json(blog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findOneAndDelete({
            _id: req.params.id,
            createdBy: req.user._id
        });

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found or unauthorized' });
        }

        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateBlogPrivacy = async (req, res) => {
    try {
        const { privacy } = req.body;
        if (!['public', 'private', 'draft'].includes(privacy)) {
            return res.status(400).json({ message: 'Invalid privacy setting' });
        }

        const blog = await Blog.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user._id },
            { privacy },
            { new: true }
        );

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found or unauthorized' });
        }

        res.json(blog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; 