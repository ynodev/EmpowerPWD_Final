import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Plus, Search, MoreVertical, Eye, Trash2, ArrowUpDown, Check, X, Lock, Briefcase, Clock, Filter, ChevronDown, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import SidebarAdmin from './sideNavAdmin';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5001',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionStatus, setActionStatus] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Filtering and Sorting States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Add new state for statistics
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    pendingJobs: 0
  });

  // Add these new state variables at the top of the component
  const [showFilters, setShowFilters] = useState(false);
  const [filterIndustry, setFilterIndustry] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [locationInput, setLocationInput] = useState('');
  const locationDebounceRef = useRef(null);

  // Add these arrays for filter options
  const industryOptions = [
    'Technology',
    'Healthcare',
    'Education',
    'Finance',
    'Manufacturing',
    'Retail',
    'Other'
  ];

  const jobTypeOptions = [
    'Full-time',
    'Part-time',
    'Contract',
    'Internship',
    'Remote'
  ];

  useEffect(() => {
    const loadData = async () => {
      await fetchJobs();
      await fetchJobStats();
    };
    loadData();
  }, [searchQuery, filterIndustry, filterType, filterLocation, statusFilter, sortField, sortDirection, currentPage]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Basic pagination
      params.append('page', currentPage);
      params.append('limit', 10);
      
      // Sorting
      params.append('sortField', sortField);
      params.append('sortDirection', sortDirection);
      
      // Status filter (from tabs)
      if (statusFilter !== 'all') {
        params.append('status', statusFilter.toLowerCase());
      }
      
      // Search query
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      
      // Industry filter
      if (filterIndustry !== 'all') {
        params.append('industry', filterIndustry);
      }
      
      // Job type filter
      if (filterType !== 'all') {
        params.append('jobType', filterType);
      }
      
      // Location filter - don't trim the value when sending to API
      if (filterLocation !== 'all') {
        params.append('location', filterLocation);
      }

      console.log('Fetching jobs with params:', params.toString()); // Debug log

      const response = await api.get(`/api/admin/management/jobs?${params.toString()}`);

      if (response.data.success) {
        setJobs(response.data.data);
        setTotalPages(Math.ceil(response.data.total / response.data.perPage));
      } else {
        setError('Failed to fetch jobs');
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Error fetching jobs');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobStats = async () => {
    try {
      const response = await api.get('/api/admin/management/stats');

      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      } else {
        console.error('Invalid stats response:', response.data);
        setStats({
          totalJobs: 0,
          activeJobs: 0,
          pendingJobs: 0
        });
      }
    } catch (error) {
      console.error('Error fetching job stats:', error);
      setStats({
        totalJobs: 0,
        activeJobs: 0,
        pendingJobs: 0
      });
    }
  };

  const handleDelete = async (jobId) => {
    try {
      setActionLoading(true);
      await api.delete(`/api/jobs/delete-job/${jobId}`);
      setJobs(jobs.filter(job => job._id !== jobId));
      setActionStatus({ type: 'success', message: 'Job deleted successfully' });
      fetchJobStats();
    } catch (err) {
      setActionStatus({ type: 'error', message: err.response?.data?.message || 'Error deleting job' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (jobId, newStatus) => {
    try {
      setActionLoading(true);
      const response = await api.patch(`/api/jobs/${jobId}/status`, {
        status: newStatus.toLowerCase()
      });
      setJobs(jobs.map(job => (job._id === jobId ? { ...job, jobStatus: response.data.data.jobStatus } : job)));
      setActionStatus({ type: 'success', message: 'Job status updated successfully' });
      fetchJobStats();
    } catch (err) {
      setActionStatus({ type: 'error', message: err.response?.data?.message || 'Error updating job status' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleIndustryToggle = (industry) => {
    setSelectedIndustries(prev =>
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const handleTypeToggle = (type) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleTabClick = (status) => {
    console.log('Setting status filter to:', status);
    // Convert status to the correct format for the API
    const apiStatus = status === 'all' ? 'all' : 
                     status === 'ACTIVE' ? 'active' : 
                     status === 'PENDING' ? 'pending' : status;
    
    setStatusFilter(apiStatus);
    setCurrentPage(1);
    
    // Reset sorting when changing tabs
    if (status === 'all') {
      setSortField('createdAt');
      setSortDirection('desc');
    }
  };

  const resetFilters = () => {
    setFilterIndustry('all');
    setFilterType('all');
    setFilterLocation('all');
    setLocationInput('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const FilterModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-2xl max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Filter Jobs</h3>
          <button onClick={() => setShowFilters(false)}>
            <X className="h-5 w-5 text-gray-400 hover:text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Industry Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
            <select
              value={filterIndustry}
              onChange={(e) => {
                setFilterIndustry(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2.5 border rounded-lg"
            >
              <option value="all">All Industries</option>
              {industryOptions.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          {/* Job Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-2.5 border rounded-lg"
            >
              <option value="all">All Types</option>
              {jobTypeOptions.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Location Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by location..."
                value={locationInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setLocationInput(value);
                  
                  // Clear any existing timeout
                  if (locationDebounceRef.current) {
                    clearTimeout(locationDebounceRef.current);
                  }
                  
                  // Set a new timeout to update the filter
                  locationDebounceRef.current = setTimeout(() => {
                    setFilterLocation(value === '' ? 'all' : value);
                    setCurrentPage(1);
                  }, 500); // Wait 500ms after user stops typing
                }}
                className="w-full p-2.5 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
              {locationInput && (
                <button
                  onClick={() => {
                    setLocationInput('');
                    setFilterLocation('all');
                    setCurrentPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              onClick={() => {
                resetFilters();
                setShowFilters(false);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 border rounded-lg"
            >
              Reset
            </button>
            <button
              onClick={() => {
                fetchJobs();
                setShowFilters(false);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    return () => {
      if (locationDebounceRef.current) {
        clearTimeout(locationDebounceRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarAdmin/>
      <div className="sm:ml-64">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="p-8">
            <h1 className="text-4xl font-bold text-[#1A2755]">Job Management</h1>
            <p className="text-gray-600 mt-2">Monitor and manage all job postings in the system</p>
          </div>
        </div>

        <div className="p-8">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Jobs</p>
                  <h2 className="text-2xl font-bold mt-1">{typeof stats.totalJobs === 'number' ? stats.totalJobs : '0'}</h2>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <Briefcase className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Active Jobs</p>
                  <h2 className="text-2xl font-bold mt-1">{typeof stats.activeJobs === 'number' ? stats.activeJobs : '0'}</h2>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <Check className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pending Jobs</p>
                  <h2 className="text-2xl font-bold mt-1">{typeof stats.pendingJobs === 'number' ? stats.pendingJobs : '0'}</h2>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="bg-white rounded-2xl shadow-sm">
            {/* Tab Navigation */}
            <div className="flex gap-6 px-6 border-b">
              {['all', 'ACTIVE', 'PENDING'].map((status) => (
                <button 
                  key={status}
                  className={`py-4 text-sm font-medium transition-colors relative ${
                    statusFilter === status.toLowerCase() 
                      ? 'text-blue-700 border-b-2 border-blue-700' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => handleTabClick(status)}
                >
                  {status === 'all' ? 'Recent Jobs (7 Days)' :
                   status === 'ACTIVE' ? 'All Jobs' : 'Pending Jobs'}
                </button>
              ))}
            </div>

            {/* Search and Filter Bar */}
            <div className="p-6 border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to first page when searching
                    }}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <button 
                    className={`px-6 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 flex items-center gap-2 transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700">Filters</span>
                    <ChevronDown 
                      className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${
                        showFilters ? 'rotate-180' : ''
                      }`} 
                    />
                  </button>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <FilterModal />
              )}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-[120px]">JobID</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-[200px]">Job Title</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-[180px]">Company</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-[150px]">Industry</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-[120px]">Date Created</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-[150px]">Location</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-600 w-[100px]">Status</th>
                    <th className="w-[80px] p-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="text-center p-8">
                        <div className="flex justify-center items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-gray-200 border-t-blue-700 rounded-full animate-spin"></div>
                          <span className="text-gray-500">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : jobs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center p-8 text-gray-500">
                        No jobs found
                      </td>
                    </tr>
                  ) : (
                    jobs.map((job) => (
                      <tr key={job._id} className="border-b hover:bg-gray-50">
                        <td className="p-4 text-sm">
                          <div className="truncate max-w-[120px]" title={job._id}>
                            {job._id}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="max-w-[200px]">
                            <div className="truncate font-medium text-gray-900" title={job.jobTitle}>
                              {job.jobTitle}
                            </div>
                            <div className="truncate text-xs text-gray-500" title={job.employmentType}>
                              {job.employmentType}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          <div className="truncate max-w-[180px]" title={job.employerDetails?.companyName || 'N/A'}>
                            {job.employerDetails?.companyName || 'N/A'}
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          <div className="truncate max-w-[150px]" title={job.industry?.join(', ') || 'N/A'}>
                            {job.industry?.join(', ') || 'N/A'}
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          <div className="truncate max-w-[120px]" title={new Date(job.createdAt).toLocaleDateString()}>
                            {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="p-4 text-sm">
                          <div className="truncate max-w-[150px]" title={job.jobLocation || 'N/A'}>
                            {job.jobLocation || 'N/A'}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium
                            ${job.jobStatus === 'active' ? 'bg-green-100 text-green-800' :
                              job.jobStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'}`}>
                            {job.jobStatus.charAt(0).toUpperCase() + job.jobStatus.slice(1)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="relative">
                            <button 
                              onClick={() => setOpenDropdownId(openDropdownId === job._id ? null : job._id)}
                              className="p-2 hover:bg-gray-100 rounded-full"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>

                            {openDropdownId === job._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                                <button
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                                  onClick={() => {
                                    window.location.href = `/admin/jobs/${job._id}/review`;
                                    setOpenDropdownId(null);
                                  }}
                                >
                                  <Eye className="w-4 h-4" />
                                  Review Job
                                </button>
                                {job.jobStatus === 'pending' && (
                                  <>
                                    <button
                                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-green-600"
                                      onClick={() => {
                                        handleStatusUpdate(job._id, 'active');
                                        setOpenDropdownId(null);
                                      }}
                                    >
                                      <Check className="w-4 h-4" />
                                      Approve
                                    </button>
                                    <button
                                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                      onClick={() => {
                                        handleStatusUpdate(job._id, 'declined');
                                        setOpenDropdownId(null);
                                      }}
                                    >
                                      <X className="w-4 h-4" />
                                      Decline
                                    </button>
                                  </>
                                )}
                                <button
                                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600"
                                  onClick={() => {
                                    if (window.confirm('Are you sure you want to delete this job?')) {
                                      handleDelete(job._id);
                                      setOpenDropdownId(null);
                                    }
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center p-4 border-t">
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 border rounded-full disabled:opacity-50 hover:bg-gray-50 transition-colors"
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="px-4 py-2 border rounded-full disabled:opacity-50 hover:bg-gray-50 transition-colors"
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobManagement;