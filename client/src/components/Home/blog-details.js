import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import logo from "../../assets/img/logo.svg";
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowLeft, Clock, User, Tag } from 'lucide-react';
import SharedNav from '../ui/SharedNav';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://empower-pwd.onrender.com/api'
  : '/api';

const BlogGuestView = () => {
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();
  const [isOpen, setIsOpen] = React.useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/blogs/public/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setBlog(data.blog);
        } else {
          throw new Error(data.message);
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

  // Add Poppins font import
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-poppins flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-poppins flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-md">
          <p className="text-red-500 text-xl mb-4">{error || 'Blog not found'}</p>
          <button 
            onClick={() => navigate('/guest/blogs')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 font-poppins">
      <SharedNav />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 mt-20">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="h-6 w-6 text-gray-500" />
          <span className="text-gray-500 font-medium">Back to Blogs</span>
        </button>
        
        {/* Blog Header with Cover Image */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {blog.thumbnail && (
            <div className="relative h-[300px] md:h-[450px]">
              <img 
                src={blog.thumbnail || 'https://via.placeholder.com/800x400'} 
                alt={blog.title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-white/20 flex items-center gap-2 ${
                    blog.type === 'Article' ? 'text-blue-200' :
                    blog.type === 'Guide' ? 'text-green-200' :
                    blog.type === 'News' ? 'text-purple-200' :
                    'text-orange-200'
                  }`}>
                    <Tag className="h-4 w-4" />
                    {blog.type}
                  </span>
                  <span className="text-sm text-gray-200 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-shadow">{blog.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-200">
                  <User className="h-5 w-5" />
                  <span>By {blog.author}</span>
                </div>
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="p-6 md:p-8 text-left">
            <p className="text-gray-600 text-left text-lg leading-relaxed italic">{blog.description}</p>
          </div>
        </div>

        {/* Blog Content */}
        <div className="bg-white rounded-3xl shadow-lg mt-6 p-6 md:p-8">
          <div className="prose prose-blue max-w-none text-left">
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogGuestView;