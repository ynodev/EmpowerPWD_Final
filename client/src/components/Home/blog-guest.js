import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import logo from "../../assets/img/logo.svg";


const BlogsGuest = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
 const [isOpen, setIsOpen] = React.useState(false);
  useEffect(() => {
    fetchBlogs();
  }, [selectedType, sortBy]);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/blogs/public?type=${selectedType}&sort=${sortBy}&search=${searchQuery}`);
      const data = await response.json();
      
      if (data.success) {
        setBlogs(data.blogs);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      setError('Failed to fetch blogs');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterBlogs = blogs.filter(blog => 
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const BlogCard = ({ blog }) => (
    <Link 
      to={`/guest/blogs/${blog._id}`}
      className="block transform transition-all duration-300 hover:scale-105 hover:shadow-lg"
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 h-full">
        <div className="h-48 rounded-t-xl overflow-hidden">
          <img 
            src={blog.thumbnail || '/default-blog-thumbnail.jpg'} 
            alt={blog.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3.5rem]">{blog.title}</h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">{blog.description}</p>
          <div className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center">
            Read More <span className="ml-1">→</span>
          </div>
        </div>
      </div>
    </Link>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <header className="fixed top-0 left-0 right-0 flex justify-between items-center px-8 py-4 bg-white z-50 shadow-md">
                    <div className="flex items-center">
                       <img src={logo} alt="logo" className="w-8 h-8" />
                       <span className="ml-2 text-lg font-semibold">EmpowerPWD</span>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                       <nav className="flex space-x-8">
                          <Link to="/" className="text-gray-600 hover:text-black font-medium">Home</Link>
                          <Link to="/about" className="text-gray-600 hover:text-black font-medium">About Us</Link>
                          <Link to="/guest/blogs" className="text-gray-600 hover:text-black font-medium">Blogs</Link>
                       </nav>
                       <Link 
                          to="/login" 
                          className="bg-[#1A2755] text-white px-6 py-2 rounded-xl hover:bg-[#3532D9] transition-colors font-medium"
                       >
                          SIGN IN
                       </Link>
                    </div>
                    <button 
                       className="md:hidden"
                       onClick={() => setIsOpen(!isOpen)}
                    >
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                       </svg>
                    </button>
                 </header>
        {/* Header */}
        <div className="mb-8 mt-20">
          <h1 className="text-3xl font-bold text-gray-900">EmpowerPWD Blog</h1>
          <p className="mt-2 text-gray-600">Discover insights, guides, and news about disability employment</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                placeholder="Search blogs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
              >
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">Filters</span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full p-2.5 pl-4 pr-10 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="Article">Articles</option>
                  <option value="Guide">Guides</option>
                  <option value="News">News</option>
                  <option value="Case Study">Case Studies</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2.5 pl-4 pr-10 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Blog Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : filterBlogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No blogs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filterBlogs.map((blog) => (
              <BlogCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogsGuest; 