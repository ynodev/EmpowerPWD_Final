import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
  Play, Heart, Search, Filter, SlidersHorizontal, 
  Clock, Grid, List, X, ExternalLink, Loader 
} from 'lucide-react';
import NavEmployer from '../ui/navEmployer.js';

const ResourcesView = () => {
   const [resources, setResources] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
   const [selectedVideo, setSelectedVideo] = useState(null);
   const [favorites, setFavorites] = useState({});
   const [showFavorites, setShowFavorites] = useState(false);
   const [sortBy, setSortBy] = useState('newest');
   const [searchTerm, setSearchTerm] = useState('');
   const [selectedCategory, setSelectedCategory] = useState('all');
   const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
   const [showFilters, setShowFilters] = useState(false);
   const [filters, setFilters] = useState({
     dateRange: 'all',
     categories: [],
     favorites: false
   });

   useEffect(() => {
      fetchResources();
      fetchFavorites();
   }, []);

   const fetchResources = async () => {
      try {
         const token = localStorage.getItem('token');
         const response = await axios.get('/api/resources', {
            headers: { Authorization: `Bearer ${token}` }
         });
         setResources(response.data.data || []);
         setError(null);
      } catch (err) {
         setError('Failed to load resources. Please try again later.');
         console.error('Error fetching resources:', err);
      } finally {
         setLoading(false);
      }
   };

   const fetchFavorites = async () => {
      try {
         const response = await axios.get('/api/resources/favorites');
         const favoritesMap = {};
         response.data.data.forEach(fav => {
            favoritesMap[fav.videoId] = true;
         });
         setFavorites(favoritesMap);
      } catch (error) {
         console.error('Error fetching favorites:', error);
      }
   };

   const openVideo = (videoId) => {
      setSelectedVideo(videoId);
   };

   const closeVideo = () => {
      setSelectedVideo(null);
   };
   const toggleFavorite = async (resource) => {
      try {
         if (favorites[resource.vimeoId]) {
            await axios.delete(`/api/resources/favorite/${resource.vimeoId}`);
            setFavorites(prev => {
               const newFavorites = { ...prev };
               delete newFavorites[resource.vimeoId];
               return newFavorites;
            });
         } else {
            await axios.post('/api/resources/favorite', {
               videoId: resource.vimeoId,
               title: resource.title,
               thumbnail: resource.thumbnail,
               description: resource.description
            });
            setFavorites(prev => ({
               ...prev,
               [resource.vimeoId]: true
            }));
         }
      } catch (error) {
         console.error('Error toggling favorite:', error);
      }
   };

   const renderResourceCard = (resource) => {
      return React.createElement('div', {
         key: resource._id,
         className: "bg-white rounded-lg shadow-md overflow-hidden rounded-xl "
      }, [
         // Thumbnail Container
         React.createElement('div', {
            key: 'thumbnail',
            className: "relative aspect-video p-4 "
         }, [
            resource.thumbnail && React.createElement('img', {
               key: 'thumb-img',
               src: resource.thumbnail,
               alt: resource.title,
               className: "w-full h-full object-cover bg-white rounded-xl"
            }),
            React.createElement('button', {
               key: 'play-button',
               onClick: () => openVideo(resource.vimeoId),
               className: "absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-opacity duration-300 rounded-xl m-4"
            }, React.createElement(Play, {
               className: "w-12 h-12 text-white"
            }))
         ]),
         // Content Container
         React.createElement('div', {
            key: 'content',
            className: "p-4"
         }, [
            React.createElement('h3', {
               key: 'title',
               className: "font-semibold text-lg mb-2"
            }, resource.title),
            React.createElement('p', {
               key: 'description',
               className: "text-gray-600 text-sm mb-4"
            }, resource.description),
            // Categories
            React.createElement('div', {
               key: 'categories',
               className: "flex flex-wrap gap-2 mb-4"
            }, resource.categories?.map((category, index) => 
               React.createElement('span', {
                  key: index,
                  className: "px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
               }, category)
            )),
           // Buttons Container
            React.createElement('div', {
               key: 'buttons-container',
               className: "flex items-center mt-4 gap-2"
            }, [
               // Heart Button
               React.createElement('button', {
                  key: 'heart-button',
                  onClick: () => toggleFavorite(resource),
                  className: `p-2 rounded-xl transition-colors duration-300 mr-2 ${
                     favorites[resource.vimeoId]
                        ? ' text-pink-500'
                        : ' text-gray-500 hover:bg-gray-100'
                  }`
               }, React.createElement(Heart, {
                  className: "w-5 h-5",
                  fill: favorites[resource.vimeoId] ? "currentColor" : "none"
               })),
               // Watch Button
               React.createElement('button', {
                  key: 'watch-button',
                  onClick: () => openVideo(resource.vimeoId),
                  className: "flex bg-[#4285F4] text-white py-2 px-4 rounded-xl hover:bg-gray-800 transition-colors duration-300 flex items-center justify-center  semi-bold w-full"
               }, [
                  React.createElement(Play, {
                     key: 'play-icon',
                     className: "w-4 h-4"
                  }),
                  'Watch Video'
               ])
            ])
         ])
      ]);
   };

   const renderVideoModal = () => {
      if (!selectedVideo) return null;

      return React.createElement('div', {
         className: "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      }, React.createElement('div', {
         className: "relative w-full max-w-4xl aspect-video"
      }, [
         React.createElement('button', {
            key: 'close-button',
            onClick: closeVideo,
            className: "absolute -top-10 right-0 text-white hover:text-gray-300"
         }, 'Close'),
         React.createElement('iframe', {
            key: 'video-iframe',
            src: `https://player.vimeo.com/video/${selectedVideo}?autoplay=1`,
            className: "w-full h-full rounded-lg",
            allow: "autoplay; fullscreen",
            allowFullScreen: true
         })
      ]));
   };

   const getUniqueCategories = () => {
      const categories = new Set();
      resources.forEach(resource => {
         resource.categories?.forEach(category => categories.add(category));
      });
      return ['all', ...Array.from(categories)];
   };

   const sortResources = (resources) => {
      switch (sortBy) {
         case 'newest':
            return [...resources].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
         case 'oldest':
            return [...resources].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
         case 'title':
            return [...resources].sort((a, b) => a.title.localeCompare(b.title));
         default:
            return resources;
      }
   };

   const filterResources = (resources) => {
      return resources.filter(resource => {
         const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             resource.description.toLowerCase().includes(searchTerm.toLowerCase());
         const matchesCategory = selectedCategory === 'all' || 
                               resource.categories?.includes(selectedCategory);
         return matchesSearch && matchesCategory;
      });
   };

   const filteredResources = showFavorites 
      ? resources.filter(resource => favorites[resource.vimeoId])
      : resources;

   const filteredAndSortedResources = useMemo(() => {
     let result = [...resources];

     // Apply search filter
     if (searchTerm) {
       const searchLower = searchTerm.toLowerCase();
       result = result.filter(resource => 
         resource.title.toLowerCase().includes(searchLower) ||
         resource.description.toLowerCase().includes(searchLower)
       );
     }

     // Apply category filter
     if (selectedCategory !== 'all') {
       result = result.filter(resource => 
         resource.categories?.includes(selectedCategory)
       );
     }

     // Apply favorites filter
     if (showFavorites) {
       result = result.filter(resource => favorites[resource.vimeoId]);
     }

     // Apply date range filter
     if (filters.dateRange !== 'all') {
       const now = new Date();
       const cutoff = new Date();
       
       switch (filters.dateRange) {
         case 'today':
           cutoff.setHours(0, 0, 0, 0);
           break;
         case 'week':
           cutoff.setDate(cutoff.getDate() - 7);
           break;
         case 'month':
           cutoff.setMonth(cutoff.getMonth() - 1);
           break;
       }
       
       result = result.filter(resource => 
         new Date(resource.createdAt) >= cutoff
       );
     }

     // Apply sorting
     switch (sortBy) {
       case 'newest':
         return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
       case 'oldest':
         return result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
       case 'title':
         return result.sort((a, b) => a.title.localeCompare(b.title));
       default:
         return result;
     }
   }, [resources, searchTerm, selectedCategory, showFavorites, filters.dateRange, sortBy]);

   // Filter Modal Component
   const FilterModal = () => (
     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
       <div className="bg-white rounded-2xl p-6 w-full max-w-md">
         <div className="flex justify-between items-center mb-6">
           <h3 className="text-lg font-semibold">Filters</h3>
           <button onClick={() => setShowFilters(false)}>
             <X className="w-5 h-5" />
           </button>
         </div>

         <div className="space-y-6">
           {/* Date Range */}
           <div>
             <label className="block text-sm font-medium mb-2">Date Range</label>
             <select
               value={filters.dateRange}
               onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
               className="w-full p-2 border rounded-xl"
             >
               <option value="all">All Time</option>
               <option value="today">Today</option>
               <option value="week">This Week</option>
               <option value="month">This Month</option>
             </select>
           </div>

           {/* Categories */}
           <div>
             <label className="block text-sm font-medium mb-2">Categories</label>
             <div className="space-y-2">
               {getUniqueCategories().map(category => (
                 <label key={category} className="flex items-center">
                   <input
                     type="checkbox"
                     checked={filters.categories.includes(category)}
                     onChange={(e) => {
                       setFilters(prev => ({
                         ...prev,
                         categories: e.target.checked
                           ? [...prev.categories, category]
                           : prev.categories.filter(c => c !== category)
                       }));
                     }}
                     className="mr-2"
                   />
                   {category}
                 </label>
               ))}
             </div>
           </div>
         </div>

         <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
           <button
             onClick={() => setFilters({
               dateRange: 'all',
               categories: [],
               favorites: false
             })}
             className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl"
           >
             Reset
           </button>
           <button
             onClick={() => setShowFilters(false)}
             className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
           >
             Apply Filters
           </button>
         </div>
       </div>
     </div>
   );

   return (
     <div className="flex">
       <NavEmployer />
       <div className="flex-1 overflow-auto ml-64 p-8">
         <div className="max-w-7xl mx-auto">
           {/* Header */}
           <div className="flex justify-between items-center mb-8">
             <h1 className="text-3xl font-bold text-gray-900">Training Resources</h1>
             <div className="flex items-center gap-3">
               <button
                 onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                 className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
               >
                 {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
               </button>
               <button
                 onClick={() => setShowFilters(true)}
                 className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
               >
                 <SlidersHorizontal className="w-5 h-5" />
               </button>
             </div>
           </div>

           {/* Search and Filters Bar */}
           <div className="bg-white rounded-2xl shadow-sm border p-4 mb-6">
             <div className="flex gap-4 items-center">
               <div className="flex-1 relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                 <input
                   type="text"
                   placeholder="Search resources..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
                 />
               </div>
               <select
                 value={sortBy}
                 onChange={(e) => setSortBy(e.target.value)}
                 className="px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500"
               >
                 <option value="newest">Newest First</option>
                 <option value="oldest">Oldest First</option>
                 <option value="title">Title A-Z</option>
               </select>
               <button
                 onClick={() => setShowFavorites(!showFavorites)}
                 className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
                   showFavorites ? 'bg-pink-50 text-pink-600' : 'hover:bg-gray-100'
                 }`}
               >
                 <Heart className={showFavorites ? 'fill-current' : ''} size={20} />
                 Favorites
               </button>
             </div>
           </div>

           {/* Resources Grid/List */}
           {loading ? (
             <div className="flex items-center justify-center h-64">
               <Loader className="w-8 h-8 animate-spin text-blue-500" />
             </div>
           ) : error ? (
             <div className="text-center text-red-500 py-8">
               {error}
             </div>
           ) : filteredAndSortedResources.length === 0 ? (
             <div className="text-center text-gray-500 py-8">
               No resources found
             </div>
           ) : (
             <div className={`grid gap-6 ${
               viewMode === 'grid' 
                 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                 : 'grid-cols-1'
             }`}>
               {filteredAndSortedResources.map(resource => (
                 <div key={resource._id} className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                   {/* Thumbnail */}
                   <div className="relative aspect-video">
                     {resource.thumbnail && (
                       <img
                         src={resource.thumbnail}
                         alt={resource.title}
                         className="w-full h-full object-cover"
                       />
                     )}
                     <button
                       onClick={() => openVideo(resource.vimeoId)}
                       className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
                     >
                       <Play className="w-12 h-12 text-white" />
                     </button>
                   </div>

                   {/* Content */}
                   <div className="p-4">
                     <h3 className="font-semibold text-lg mb-2">{resource.title}</h3>
                     <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                     
                     {/* Categories */}
                     <div className="flex flex-wrap gap-2 mb-4">
                       {resource.categories?.map((category, index) => (
                         <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                           {category}
                         </span>
                       ))}
                     </div>

                     {/* Actions */}
                     <div className="flex items-center gap-2">
                       <button
                         onClick={() => toggleFavorite(resource)}
                         className={`p-2 rounded-xl transition-colors ${
                           favorites[resource.vimeoId]
                             ? 'text-pink-500'
                             : 'text-gray-400 hover:bg-gray-100'
                         }`}
                       >
                         <Heart
                           className="w-5 h-5"
                           fill={favorites[resource.vimeoId] ? "currentColor" : "none"}
                         />
                       </button>
                       <button
                         onClick={() => openVideo(resource.vimeoId)}
                         className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                       >
                         <Play className="w-4 h-4" />
                         Watch Video
                       </button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </div>
       </div>

       {/* Modals */}
       {showFilters && <FilterModal />}
       {selectedVideo && (
         <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
           <div className="relative w-full max-w-4xl aspect-video">
             <button
               onClick={closeVideo}
               className="absolute -top-10 right-0 text-white hover:text-gray-300"
             >
               Close
             </button>
             <iframe
               src={`https://player.vimeo.com/video/${selectedVideo}?autoplay=1`}
               className="w-full h-full rounded-lg"
               allow="autoplay; fullscreen"
               allowFullScreen
             />
           </div>
         </div>
       )}
     </div>
   );
};

export default ResourcesView; 