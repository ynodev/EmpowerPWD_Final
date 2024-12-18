import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import NavSeeker from '../ui/navSeeker';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://empower-pwd.onrender.com/api'
    : '/api';

const BlogDetails = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE_URL}/blogs/public/${id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setBlog(data.blog);
        } else {
          throw new Error(data.message || 'Failed to fetch blog');
        }
      } catch (error) {
        setError('Failed to fetch blog');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavSeeker />
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavSeeker />
        <div className="text-center py-20">
          <p className="text-red-500">{error || 'Blog not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavSeeker />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Blog Header with Cover Image */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {blog.thumbnail && (
            <div className="relative h-[300px] md:h-[400px]"> {/* Fixed height container */}
              <img 
                src={blog.thumbnail} 
                alt={blog.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Add a gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Content overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
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
                <h1 className="text-3xl font-bold mb-4 text-shadow">{blog.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-200">
                  <span>By {blog.author}</span>
                </div>
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="p-8">
            <p className="text-gray-600">{blog.description}</p>
          </div>
        </div>

        {/* Blog Content */}
        <div className="bg-white rounded-2xl shadow-sm mt-6 p-8">
          <div className="prose prose-blue max-w-none">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails; 
