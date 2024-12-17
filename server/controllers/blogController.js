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

        // Ensure blog-thumbnails directory exists
        const thumbnailDir = path.join(process.cwd(), 'uploads', 'blog-thumbnails');
        if (!fs.existsSync(thumbnailDir)) {
            fs.mkdirSync(thumbnailDir, { recursive: true });
        }

        // Construct thumbnail path
        const thumbnailPath = req.file 
            ? `/uploads/blog-thumbnails/${req.file.filename}` 
            : null;

        const blog = new Blog({
            title,
            description,
            content,
            type,
            privacy,
            createdBy: req.user._id,
            thumbnail: thumbnailPath
        });

        await blog.save();
        res.status(201).json(blog);
    } catch (error) {
        console.error('Blog creation error:', error);
        res.status(400).json({ message: error.message });
    }
};


export const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, content, type, privacy } = req.body;

        // Find the existing blog
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        // Check if a new thumbnail is uploaded
        if (req.file) {
            // Remove old thumbnail if it exists
            if (blog.thumbnail) {
                const oldThumbnailPath = path.join(process.cwd(), 'uploads', blog.thumbnail.replace('/uploads/', ''));
                if (fs.existsSync(oldThumbnailPath)) {
                    fs.unlinkSync(oldThumbnailPath);
                }
            }

            // Update with new thumbnail
            blog.thumbnail = `/uploads/blog-thumbnails/${req.file.filename}`;
        }

        // Update other blog fields
        blog.title = title || blog.title;
        blog.description = description || blog.description;
        blog.content = content || blog.content;
        blog.type = type || blog.type;
        blog.privacy = privacy || blog.privacy;

        await blog.save();
        res.json(blog);
    } catch (error) {
        console.error('Blog update error:', error);
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
