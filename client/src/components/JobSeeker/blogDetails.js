import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavSeeker from '../ui/navSeeker';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://empower-pwd.onrender.com/api'
    : '/api';

const BlogDetails = () => {
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchBlogAndRelated = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch main blog
        const blogResponse = await fetch(`${API_BASE_URL}/blogs/public/${id}`);
        const blogData = await blogResponse.json();

        if (blogData.success) {
          setBlog(blogData.blog);
          
          // Fetch related blogs based on type
          const relatedResponse = await fetch(
            `${API_BASE_URL}/blogs/public?type=${blogData.blog.type}&limit=3`
          );
          const relatedData = await relatedResponse.json();
          
          if (relatedData.success) {
            // Filter out the current blog
            const filteredRelated = relatedData.blogs.filter(b => b._id !== id);
            setRelatedBlogs(filteredRelated.slice(0, 3));
          }
        }
      } catch (error) {
        setError('Failed to fetch blog content');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogAndRelated();
  }, [id]);

  // Reuse the BlogCard component from blogs.js
  const BlogCard = ({ blog }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <div className="h-48 rounded-t-xl overflow-hidden">
        <img 
          src={blog.thumbnail || '/default-blog-thumbnail.jpg'} 
          alt={blog.title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium 
            ${blog.type === 'Article' ? 'bg-blue-100 text-blue-700' :
              blog.type === 'Guide' ? 'bg-green-100 text-green-700' :
              blog.type === 'News' ? 'bg-purple-100 text-purple-700' :
              'bg-orange-100 text-orange-700'}`}
          >
            {blog.type}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(blog.createdAt).toLocaleDateString()}
          </span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{blog.description}</p>
        <Link 
          to={`/blogs/${blog._id}`}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center"
        >
          Read More <span className="ml-1">→</span>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavSeeker />
      
      {/* Back Button */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Link 
          to="/blogs" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blogs
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="text-red-500">{error}</p>
          </div>
        ) : blog ? (
          <>
            {/* Blog Content */}
            <article className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {blog.thumbnail && (
                <div className="relative h-[300px] md:h-[400px]">
                  <img 
                    src={blog.thumbnail} 
                    alt={blog.title}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-white/10
                        ${blog.type === 'Article' ? 'text-blue-200' :
                          blog.type === 'Guide' ? 'text-green-200' :
                          blog.type === 'News' ? 'text-purple-200' :
                          'text-orange-200'}`}
                      >
                        {blog.type}
                      </span>
                      <span className="text-sm text-gray-200">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h1 className="text-3xl font-bold mb-4 text-white">{blog.title}</h1>
                    <div className="flex items-center gap-2 text-sm text-gray-200">
                      <span>By {blog.author}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="p-8">
                <div className="prose prose-blue max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: blog.content }} />
                </div>
              </div>
            </article>

            {/* Related Blogs Section */}
            {relatedBlogs.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedBlogs.map((relatedBlog) => (
                    <BlogCard key={relatedBlog._id} blog={relatedBlog} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default BlogDetails; 
