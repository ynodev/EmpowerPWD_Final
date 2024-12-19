import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Filter, Building, Briefcase, Users, ChevronDown, ChevronUp, Globe, MessageSquare, Calendar, Info, ChevronLeft } from 'lucide-react';
import NavSeeker from '../ui/navSeeker.js';
import axios from 'axios';
import CompanyProfileModal from './CompanyProfileModal';
import { formatDistance } from 'date-fns';

const formatRating = (rating) => {
  return typeof rating === 'number' ? rating.toFixed(1) : 'N/A';
};

const ratingOptions = [
  { value: "", label: "Any Rating" },
  { value: "4.5", label: "4.5+" },
  { value: "4.0", label: "4.0+" },
  { value: "3.5", label: "3.5+" },
  { value: "3.0", label: "3.0+" }
];

const calculateAverageRating = (feedbacks) => {
  if (!feedbacks || feedbacks.length === 0) return null;
  const sum = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
  return sum / feedbacks.length;
};

const REVIEWS_TO_SHOW = 3;

const cardHoverEffect = "transition-all duration-300 hover:shadow-md hover:border-blue-100";
const iconBaseClass = "transition-colors duration-200";
const gradientBg = "bg-gradient-to-br from-blue-50/50 to-blue-50/30";
const statCardClass = `bg-white border border-gray-100 p-6 rounded-xl ${cardHoverEffect}`;

const mobileCardStyle = `
  flex flex-col bg-white rounded-xl shadow-sm border border-gray-100
  transition-all duration-300 active:scale-[0.99]
`;

const mobileHeaderStyle = `
  sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100
  px-4 py-3 flex items-center justify-between
`;

const ExploreCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [selectedCompanyDetails, setSelectedCompanyDetails] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [companySize, setCompanySize] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [sortBy, setSortBy] = useState('relevant');
  const [expandedReviews, setExpandedReviews] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/companies/list/with-reviews');
        const companiesWithReviews = response.data.data;
        
        console.log('Companies with reviews:', companiesWithReviews);
        setCompanies(companiesWithReviews);
        setError(null);
      } catch (err) {
        setError('Failed to fetch companies');
        console.error('Error fetching companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getFilteredAndSortedCompanies = () => {
    let filtered = companies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = company.location.toLowerCase().includes(searchLocation.toLowerCase());
      const matchesIndustry = industryFilter === '' || company.industry === industryFilter;
      const matchesSize = companySize === '' || company.employeeCount === companySize;
      const matchesRating = ratingFilter === '' || 
        (company.rating && company.rating >= parseFloat(ratingFilter));

      return matchesSearch && matchesLocation && matchesIndustry && 
             matchesSize && matchesRating;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'recent':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });
  };

  const handleViewProfile = async (companyId) => {
    try {
      setExpandedReviews(false);
      
      console.log('Attempting to fetch details for company:', companyId);

      // Clear any existing error
      setError(null);

      const companyResponse = await axios.get(`/api/companies/details/${companyId}`);
      console.log('Company Response:', companyResponse.data);

      if (!companyResponse.data.success) {
        throw new Error(companyResponse.data.message || 'Failed to fetch company details');
      }

      const company = companyResponse.data.data;

      // Fetch reviews
      const reviewsResponse = await axios.get(`/api/reviews/company/${companyId}`);
      console.log('Reviews Response:', reviewsResponse.data);

      // Ensure reviews is always an array
      const reviews = Array.isArray(reviewsResponse.data.data) 
        ? reviewsResponse.data.data 
        : [];

      const { ratingDistribution, averageRating, totalReviews } = reviewsResponse.data.meta || {};

      setSelectedCompanyDetails({
        ...company,
        feedbacks: reviews.map(review => ({
          _id: review._id,
          rating: review.rating,
          comment: review.review,
          createdAt: review.createdAt,
          sender: {
            firstName: review.jobseekerId?.basicInfo?.firstName || 'Anonymous',
            lastName: review.jobseekerId?.basicInfo?.lastName || 'User',
            profilePicture: review.jobseekerId?.basicInfo?.profilePicture || ''
          }
        })),
        ratingDistribution,
        averageRating,
        totalReviews
      });
    } catch (error) {
      console.error('Error fetching company details:', {
        error: error.message,
        companyId,
        response: error.response?.data
      });
      
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to load company details. Please try again later.'
      );

      setSelectedCompanyDetails(null);
    }
  };

  const RatingDisplay = ({ rating, reviewCount, size = "small" }) => {
    const isSmall = size === "small";
    const starSize = isSmall ? "w-4 h-4" : "w-5 h-5";
    
    return (
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`${starSize} ${
                rating && star <= rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        {rating ? (
          <span className={`text-gray-600 ${isSmall ? 'text-sm' : 'text-base'}`}>
            {rating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        ) : (
          <span className={`text-gray-500 ${isSmall ? 'text-sm' : 'text-base'}`}>
            No reviews yet
          </span>
        )}
      </div>
    );
  };

  const CompanyFeedback = ({ 
    feedbacks = [], 
    ratingDistribution = {}, 
    expandedReviews, 
    setExpandedReviews 
  }) => {
    if (!feedbacks?.length) {
      return (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Building className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 mb-3">No reviews yet</p>
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            Be the first to review
          </button>
        </div>
      );
    }

    const totalReviews = Object.values(ratingDistribution).reduce((a, b) => a + b, 0) || feedbacks.length;
    const averageRating = feedbacks.reduce((acc, curr) => acc + (curr.rating || 0), 0) / feedbacks.length;

    // Determine how many reviews to show
    const reviewsToDisplay = expandedReviews ? feedbacks : feedbacks.slice(0, REVIEWS_TO_SHOW);

    return (
      <div>
        {/* Rating Summary Card */}
        <div className="bg-white shadow-sm border border-gray-100 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-2 gap-8">
            {/* Left Column - Average Rating */}
            <div className="flex flex-col items-center justify-center border-r border-gray-100 pr-8">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {averageRating.toFixed(1)}
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={star}
                    className={`w-6 h-6 ${
                      star <= averageRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-500">
                Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
              </div>
            </div>

            {/* Right Column - Rating Distribution */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = ratingDistribution[rating] || 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="w-12 text-sm text-gray-600 font-medium">{rating} stars</div>
                    <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm text-gray-500 text-right">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {reviewsToDisplay.map((feedback) => (
            <div 
              key={feedback._id} 
              className={`bg-white border border-gray-100 rounded-xl p-6 ${cardHoverEffect}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-medium shadow-md">
                    {feedback.sender?.firstName?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {feedback.sender?.firstName} {feedback.sender?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDistance(new Date(feedback.createdAt), new Date(), { addSuffix: true })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-4 h-4 ${
                        i < feedback.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed">{feedback.comment}</p>
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {feedbacks.length > REVIEWS_TO_SHOW && (
          <div className="text-center mt-8">
            <button 
              onClick={() => setExpandedReviews(!expandedReviews)}
              className="px-6 py-2.5 border border-gray-200 rounded-xl text-gray-600 
                hover:text-gray-900 hover:border-gray-300 transition-colors flex items-center 
                gap-2 mx-auto"
            >
              {expandedReviews ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show All {feedbacks.length} Reviews
                </>
              )}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavSeeker />
      
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center py-10 bg-red-50 mx-8 mt-8 rounded-lg">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col h-screen">
          {/* Top Search Bar - More compact on mobile */}
          <div className="bg-white p-3 sm:p-6 mx-2 sm:mx-4 mt-2 sm:mt-4 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="mb-3 sm:mb-4">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Explore Companies</h1>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Find your next opportunity</p>
              </div>

              {/* Search Inputs */}
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-3">
                <div className="flex-1 relative group">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search company name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                      hover:border-gray-300 transition-all duration-200 text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex-1 relative group">
                  <MapPin className="w-4 h-4 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Location"
                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 
                      focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
                      hover:border-gray-300 transition-all duration-200 text-sm"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-full border ${
                    isFilterOpen 
                      ? 'bg-blue-50 border-blue-200 text-blue-600' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  } transition-all duration-200 text-xs sm:text-sm`}
                >
                  <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Advanced Filters</span>
                  {isFilterOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Filter Section */}
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  isFilterOpen ? 'max-h-[500px] opacity-100 mt-4' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="filter-group bg-gray-50 p-3 rounded-xl">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      <Users className="w-3.5 h-3.5 inline mr-1 text-blue-500" />
                      Company Size
                    </label>
                    <select
                      className="w-full p-2 rounded-lg border border-gray-200 bg-white text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                    >
                      <option value="">Any Size</option>
                      <option value="1-50">1-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501+">501+ employees</option>
                    </select>
                  </div>

                  <div className="filter-group bg-gray-50 p-3 rounded-xl">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      <Briefcase className="w-3.5 h-3.5 inline mr-1 text-blue-500" />
                      Industry
                    </label>
                    <select
                      className="w-full p-2 rounded-lg border border-gray-200 bg-white text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={industryFilter}
                      onChange={(e) => setIndustryFilter(e.target.value)}
                    >
                      <option value="">All Industries</option>
                      <option value="Technology">Technology</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                      <option value="Manufacturing">Manufacturing</option>
                      <option value="Retail">Retail</option>
                    </select>
                  </div>

                  <div className="filter-group bg-gray-50 p-3 rounded-xl">
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      <Star className="w-3.5 h-3.5 inline mr-1 text-blue-500" />
                      Rating
                    </label>
                    <select
                      className="w-full p-2 rounded-lg border border-gray-200 bg-white text-sm
                        focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                    >
                      {ratingOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setCompanySize('');
                      setRatingFilter('');
                      setIndustryFilter('');
                      setSearchLocation('');
                      setSearchTerm('');
                      setIsFilterOpen(false);
                    }}
                    className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 
                      hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                      transition-colors text-xs font-medium shadow-sm hover:shadow"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Companies List - Full width on mobile */}
          <div className={`
            flex-1 overflow-hidden 
            ${windowWidth < 1024 ? 'flex flex-col' : 'flex flex-row'}
            p-2 sm:p-4 gap-2 sm:gap-4
          `}>
            <div className={`
              bg-white rounded-xl overflow-y-auto
              ${windowWidth < 1024 
                ? selectedCompanyDetails ? 'hidden' : 'flex-1'
                : 'w-2/5'
              }
            `}>
              {/* Companies list content */}
              <div className="p-3 sm:p-6">
                {/* Sticky Header - More compact on mobile */}
                <div className="sticky top-0 bg-white z-10 pb-3 sm:pb-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                      Companies <span className="text-gray-500">({getFilteredAndSortedCompanies().length})</span>
                    </h2>
                    <select 
                      className="text-xs sm:text-sm border border-gray-200 rounded-lg p-1.5 sm:p-2"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="relevant">Most Relevant</option>
                      <option value="recent">Most Recent</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </div>
                </div>

                {/* Company Cards - More compact on mobile */}
                <div className="space-y-3 sm:space-y-4">
                  {getFilteredAndSortedCompanies().map((company) => (
                    <div 
                      key={company._id}
                      className={`
                        p-4 sm:p-5 rounded-xl cursor-pointer
                        ${cardHoverEffect}
                        ${selectedCompanyDetails?._id === company._id 
                          ? 'border-2 border-blue-500 shadow-md' 
                          : 'border border-gray-200'
                        }
                      `}
                      onClick={() => company._id && handleViewProfile(company._id)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Company Logo */}
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex-shrink-0">
                          {company.logo ? (
                            <img 
                              src={`${process.env.REACT_APP_API_URL}${company.logo}`} 
                              alt={company.name} 
                              className="w-full h-full object-cover rounded-xl"
                            />
                          ) : (
                            <div className={`w-full h-full ${gradientBg} flex items-center justify-center rounded-xl`}>
                              <Building className="w-7 h-7 text-blue-400" />
                            </div>
                          )}
                        </div>

                        {/* Company Info */}
                        <div className="flex-1 min-w-0">
                          {/* Company Header */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate max-w-[70%]">
                              {company.name}
                            </h3>
                            {/* Rating Badge */}
                            <div className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-sm whitespace-nowrap
                              ${company.rating ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-50 text-gray-500'}">
                              <Star className={`w-4 h-4 ${company.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} />
                              <span className="font-medium">
                                {company.rating ? company.rating.toFixed(1) : 'N/A'}
                              </span>
                            </div>
                          </div>

                          {/* Company Details */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                              <span className="truncate">{company.location}</span>
                            </div>
                            <div className="flex items-center">
                              <Briefcase className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                              <span className="truncate">{company.industry}</span>
                            </div>
                            {company.employeeCount && (
                              <div className="flex items-center col-span-full">
                                <Users className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                <span className="truncate">{company.employeeCount} employees</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Company Details - Full width on mobile */}
            <div className={`
              bg-white rounded-xl overflow-y-auto
              ${windowWidth < 1024 
                ? selectedCompanyDetails ? 'flex-1' : 'hidden'
                : 'w-3/5'
              }
            `}>
              {selectedCompanyDetails ? (
                <div className="p-4 sm:p-6">
                  {/* Header Section */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-100 rounded-xl flex items-center justify-center object-cover shadow-sm">
                        {selectedCompanyDetails.logo ? (
                          <img 
                            src={selectedCompanyDetails.logo} 
                            alt={selectedCompanyDetails.name} 
                            className="w-full h-full object-cover rounded-xl"
                          />
                        ) : (
                          <Building className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedCompanyDetails.name}</h2>
                        <div className="flex flex-wrap items-center gap-4 text-gray-600">
                          <div className="flex items-center px-3 py-1 bg-gray-50 rounded-lg">
                            <MapPin className="w-4 h-4 mr-1.5 text-gray-500" />
                            <span className="text-sm">{selectedCompanyDetails.location}</span>
                          </div>
                          <div className="flex items-center px-3 py-1 bg-gray-50 rounded-lg">
                            <Briefcase className="w-4 h-4 mr-1.5 text-gray-500" />
                            <span className="text-sm">{selectedCompanyDetails.industry}</span>
                          </div>
                          <div className="flex items-center px-3 py-1 bg-gray-50 rounded-lg">
                            <Users className="w-4 h-4 mr-1.5 text-gray-500" />
                            <span className="text-sm">{selectedCompanyDetails.employeeCount} employees</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {[
                      {
                        icon: <Star className="w-5 h-5 text-yellow-400" />,
                        label: "Average Rating",
                        value: selectedCompanyDetails.averageRating?.toFixed(1) || 'N/A',
                      },
                      {
                        icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
                        label: "Total Reviews",
                        value: selectedCompanyDetails.totalReviews || 0,
                      },
                      {
                        icon: <Calendar className="w-5 h-5 text-blue-500" />,
                        label: "Established",
                        value: selectedCompanyDetails.establishmentDate ? 
                          new Date(selectedCompanyDetails.establishmentDate).getFullYear() : 
                          'N/A',
                      }
                    ].map((stat, index) => (
                      <div key={index} className={statCardClass}>
                        <div className="flex items-center gap-2 mb-2">
                          {stat.icon}
                          <span className="font-medium text-gray-700 text-sm">{stat.label}</span>
                        </div>
                        <p className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* About Section */}
                  <section className="mb-6 sm:mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-500" />
                      About
                    </h3>
                    <div className={`${gradientBg} rounded-xl p-6 ${cardHoverEffect}`}>
                      <p className="text-gray-600 leading-relaxed">
                        {selectedCompanyDetails.description}
                      </p>
                    </div>
                  </section>

                  {/* Company Details */}
                  <section className="mb-6 sm:mb-8">
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                      <Building className="w-5 h-5 text-blue-500" />
                      Company Details
                    </h3>
                    <div className="bg-gray-50 rounded-xl p-4 sm:p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Location</h4>
                          <p className="text-gray-600">
                            {selectedCompanyDetails.address?.street}<br />
                            {selectedCompanyDetails.address?.city}, {selectedCompanyDetails.address?.province}<br />
                            {selectedCompanyDetails.address?.country} {selectedCompanyDetails.address?.postalCode}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Departments</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedCompanyDetails.departments?.map((dept, index) => (
                              <span 
                                key={index}
                                className={`px-3 py-1.5 ${gradientBg} text-blue-600 rounded-lg text-sm font-medium ${cardHoverEffect}`}
                              >
                                {dept}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Reviews Section */}
                  <section>
                    <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      Reviews
                    </h3>
                    <CompanyFeedback 
                      feedbacks={selectedCompanyDetails.feedbacks} 
                      ratingDistribution={selectedCompanyDetails.ratingDistribution}
                      expandedReviews={expandedReviews}
                      setExpandedReviews={setExpandedReviews}
                    />
                  </section>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
                  <Building className="w-16 h-16 mb-4 text-gray-300" />
                  <p className="text-lg">Select a company to view details</p>
                  <p className="text-sm text-gray-400 mt-2">Get comprehensive information about the company</p>
                </div>
              )}
            </div>

            {/* Mobile Navigation */}
            {windowWidth < 1024 && selectedCompanyDetails && (
              <button
                onClick={() => setSelectedCompanyDetails(null)}
                className="fixed bottom-4 left-4 z-50 bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to List
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreCompanies;

