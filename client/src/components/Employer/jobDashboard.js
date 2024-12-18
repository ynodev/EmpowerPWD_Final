import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Star, MoreHorizontal, X, Archive, Trash2, CheckSquare, Briefcase, CheckCircle, XCircle, Clock, Filter, ArrowLeft, Eye, Edit } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, AlertDescription } from "../ui/alert.js";
import NavEmployer from '../ui/navEmployer.js';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://empower-pwd.onrender.com/api'
    : '/api';

// Add these constants at the top of the file, after the imports
const EMPLOYMENT_TYPES = [
  'all',
  'full-time',
  'part-time',
  'contract',
  'internship',
  'temporary'
];

const INDUSTRIES = [
  'all',
  'technology',
  'healthcare',
  'finance',
  'education',
  'manufacturing',
  'retail',
  'other'
];

const ManageJobs = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [starredJobs, setStarredJobs] = useState(new Set());
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedJobs, setSelectedJobs] = useState(new Set());
  const [notification, setNotification] = useState(null);
  const [showStarredOnly, setShowStarredOnly] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    workSetup: 'all',
    employmentType: 'all',
    industry: 'all',
    salaryRange: 'all'
  });
  const [jobCounts, setJobCounts] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    pending: 0
  });
  const [allJobs, setAllJobs] = useState([]);

  const jobStatuses = ['All', 'active', 'inactive', 'pending'];
  const dropdownRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
  const location = useLocation();
  const highlightedJobRef = useRef(null);
  const { highlightJobId, scrollToJob } = location.state || {};

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };
  
  // Update the fetchJobs function
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
  
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated');
      }
  
      const response = await fetch(
        `${API_BASE_URL}/employer/jobs/employer/${userId}`,
        {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'Accept': 'application/json'
          },
          credentials: 'include'
        }
      );
  
      // Log the response details for debugging
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));
  
      // Check if the response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Received non-JSON response:', text);
        throw new Error(`Expected JSON response but got ${contentType}`);
      }
  
      if (response.status === 401) {
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch jobs');
      }
  
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load jobs');
      }
  
      setAllJobs(data.data || []);
      setJobs(data.data || []);
      setJobCounts(data.jobCounts);
      
      const starredSet = new Set(
        (data.data || [])
          .filter(job => job.isStarred)
          .map(job => job._id)
      );
      setStarredJobs(starredSet);
  
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message);
      
      if (err.message === 'User not authenticated') {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    const savedStarredJobs = localStorage.getItem('starredJobs');
    if (savedStarredJobs) {
      setStarredJobs(new Set(JSON.parse(savedStarredJobs)));
    }

    fetchJobs();
  }, []);

  useEffect(() => {
    if (selectedStatus === 'All') {
      setJobs(allJobs);
    } else {
      const filtered = allJobs.filter(job => 
        job.jobStatus?.toLowerCase() === selectedStatus.toLowerCase()
      );
      setJobs(filtered);
    }
  }, [selectedStatus, allJobs]);

  useEffect(() => {
    const filtered = allJobs.filter(job =>
      job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setJobs(filtered);
  }, [searchTerm, allJobs]);

  useEffect(() => {
    localStorage.setItem('starredJobs', JSON.stringify([...starredJobs]));
  }, [starredJobs]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });

    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    notificationTimeoutRef.current = setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const handleAddJob = () => {
    navigate('/employers/create-job');
  };

  const toggleStar = async (jobId, currentStarStatus) => {
    try {
      const newStarStatus = !currentStarStatus;
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        throw new Error('Authentication required');
      }
  
      const response = await fetch(
        `${API_BASE_URL}/employer/jobs/${jobId}/star`,
        {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ isStarred: newStarStatus }),
          credentials: 'include'
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to update star status');
      }
  
      const data = await response.json();
      
      if (data.success) {
        setStarredJobs(prev => {
          const newSet = new Set(prev);
          if (newStarStatus) {
            newSet.add(jobId);
          } else {
            newSet.delete(jobId);
          }
          return newSet;
        });
  
        // Update the job in both allJobs and jobs arrays
        const updateJobList = (jobList) => {
          return jobList.map(job => {
            if (job._id === jobId) {
              return { ...job, isStarred: newStarStatus };
            }
            return job;
          });
        };
  
        setAllJobs(prev => updateJobList(prev));
        setJobs(prev => updateJobList(prev));
        
        showNotification('Star status updated successfully');
      }
    } catch (error) {
      console.error('Star toggle error:', error);
      showNotification(error.message, 'error');
    }
  };


  const toggleJobSelection = (jobId) => {
    setSelectedJobs((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(jobId)) {
        newSelected.delete(jobId);
      } else {
        newSelected.add(jobId);
      }
      return newSelected;
    });
  };

  const toggleAllJobs = (event) => {
    if (event.target.checked) {
      const allJobIds = jobs.map(job => job._id);
      setSelectedJobs(new Set(allJobIds));
    } else {
      setSelectedJobs(new Set());
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedJobs.size === 0) return;

    if (!window.confirm(`Are you sure you want to ${action} the selected jobs?`)) {
      return;
    }

    try {
      const selectedJobIds = Array.from(selectedJobs);
      const userId = localStorage.getItem('userId');

      const response = await fetch(
        `${API_BASE_URL}/employer/jobs/bulk-delete`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
          body: JSON.stringify({ 
            jobIds: selectedJobIds
          }),
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} jobs`);
      }

      // Update both allJobs and jobs states
      const updatedJobs = allJobs.filter(job => !selectedJobs.has(job._id));
      setAllJobs(updatedJobs);
      setJobs(updatedJobs);
      setSelectedJobs(new Set());
      calculateJobCounts(updatedJobs);
      
      showNotification(`Selected jobs ${action}d successfully`);
    } catch (err) {
      console.error(`Bulk ${action} error:`, err);
      showNotification(err.message || `Failed to ${action} jobs`, 'error');
    }
  };
  const handleActionClick = async (jobId, action) => {
    try {
      switch (action) {
        case 'view':
          navigate(`/employers/view-job/${jobId}`);
          break;

        case 'edit':
          navigate(`/employers/edit-job/${jobId}`);
          break;

        case 'delete':
          const jobToDelete = jobs.find(job => job._id === jobId);
          setJobToDelete(jobToDelete);
          setShowDeleteConfirm(true);
          break;

        default:
          break;
      }
      setActiveDropdown(null);
    } catch (err) {
      console.error('Action error:', err);
      showNotification(err.message || 'Failed to perform action', 'error');
    }
  };

  const handleRowClick = (jobId) => {
    navigate(`/employers/view-job/${jobId}`);
  };

  const applyFilters = () => {
    const filtered = allJobs.filter(job => {
      // Filter by status
      const matchesStatus = selectedStatus === 'All' || 
        job.jobStatus?.toLowerCase() === selectedStatus.toLowerCase();

      // Filter by search term
      const matchesSearch = job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by starred
      const matchesStarred = !showStarredOnly || starredJobs.has(job._id);

      // Filter by date range
      const matchesDateRange = filters.dateRange === 'all' || 
        (filters.dateRange === 'today' && isToday(job.createdAt)) ||
        (filters.dateRange === 'week' && isWithinLastWeek(job.createdAt)) ||
        (filters.dateRange === 'month' && isWithinLastMonth(job.createdAt));

      // Filter by work setup/location
      const matchesWorkSetup = filters.workSetup === 'all' || 
        job.workSetup?.toLowerCase() === filters.workSetup.toLowerCase();

      // Filter by employment type
      const matchesEmploymentType = filters.employmentType === 'all' || 
        job.employmentType?.toLowerCase() === filters.employmentType.toLowerCase();

      // Filter by industry
      const matchesIndustry = filters.industry === 'all' || 
        job.industry?.toLowerCase() === filters.industry.toLowerCase();

      // Filter by salary range
      const matchesSalary = filters.salaryRange === 'all' || checkSalaryRange(job.salaryMin, filters.salaryRange);

      return matchesStatus && matchesSearch && matchesStarred && 
             matchesDateRange && matchesWorkSetup && matchesEmploymentType && 
             matchesIndustry && matchesSalary;
    });

    setJobs(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedStatus, searchTerm, showStarredOnly, filters, allJobs]);

  const isWithinLastWeek = (date) => {
    if (!date) return false;
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(date) >= weekAgo;
  };

  const isWithinLastMonth = (date) => {
    if (!date) return false;
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return new Date(date) >= monthAgo;
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    const jobDate = new Date(date);
    return jobDate.toDateString() === today.toDateString();
  };

  const checkSalaryRange = (salary, range) => {
    if (!salary) return false;
    const salaryNum = Number(salary);
    switch (range) {
      case '0-30000':
        return salaryNum < 30000;
      case '30000-50000':
        return salaryNum >= 30000 && salaryNum < 50000;
      case '50000-80000':
        return salaryNum >= 50000 && salaryNum < 80000;
      case '80000-100000':
        return salaryNum >= 80000 && salaryNum < 100000;
      case '100000+':
        return salaryNum >= 100000;
      default:
        return true;
    }
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
          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Posted
            </label>
            <select
              className="w-full border rounded-lg p-2"
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({...prev, dateRange: e.target.value}))}
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>

          {/* Work Setup Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Work Setup
            </label>
            <select
              className="w-full border rounded-lg p-2"
              value={filters.workSetup}
              onChange={(e) => setFilters(prev => ({...prev, workSetup: e.target.value}))}
            >
              <option value="all">All Setups</option>
              <option value="remote">Remote</option>
              <option value="onsite">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>

          {/* Employment Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employment Type
            </label>
            <select
              className="w-full border rounded-lg p-2"
              value={filters.employmentType}
              onChange={(e) => setFilters(prev => ({...prev, employmentType: e.target.value}))}
            >
              {EMPLOYMENT_TYPES.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Active Filters
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => 
                value !== 'all' && (
                  <span
                    key={key}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {value}
                    <button
                      onClick={() => setFilters(prev => ({...prev, [key]: 'all'}))}
                      className="ml-1.5 hover:text-blue-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            
            <button
              onClick={() => {
                applyFilters();
                setShowFilters(false);
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const ActionsDropdown = ({ jobId }) => (
    <div 
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleActionClick(jobId, 'view');
        }}
        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
      >
        <Eye className="w-4 h-4" />
        View Job
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleActionClick(jobId, 'edit');
        }}
        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
      >
        <Edit className="w-4 h-4" />
        Edit Job
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleActionClick(jobId, 'delete');
        }}
        className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600"
      >
        <Trash2 className="w-4 h-4" />
        Delete Job
      </button>
    </div>
  );

  const calculateJobCounts = (jobsData) => {
    const counts = {
      total: jobsData.length,
      active: jobsData.filter(job => job.jobStatus?.toLowerCase() === 'active').length,
      inactive: jobsData.filter(job => job.jobStatus?.toLowerCase() === 'inactive').length,
      pending: jobsData.filter(job => job.jobStatus?.toLowerCase() === 'pending').length
    };
    console.log('Job Counts:', counts); // Add this for debugging
    setJobCounts(counts);
  };

  // Add this helper function for formatting dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If less than 24 hours ago
    if (diffDays === 1) {
      const hours = Math.ceil(diffTime / (1000 * 60 * 60));
      if (hours < 24) {
        if (hours === 1) return '1 hour ago';
        return `${hours} hours ago`;
      }
    }

    // If less than 7 days ago
    if (diffDays < 7) {
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    }

    // If more than 7 days ago, show the full date
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    if (highlightJobId && scrollToJob) {
      // Find the job in the jobs array
      const jobToHighlight = jobs.find(job => job._id === highlightJobId);
      
      if (jobToHighlight) {
        // Set the correct status tab
        setSelectedStatus(jobToHighlight.jobStatus || 'All');
        
        // Wait for the table to render
        setTimeout(() => {
          const jobRow = document.getElementById(`job-${highlightJobId}`);
          if (jobRow) {
            // Scroll to the job row
            jobRow.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            
            // Add highlight animation
            jobRow.classList.add('highlight-animation');
            
            // Remove highlight after animation
            setTimeout(() => {
              jobRow.classList.remove('highlight-animation');
            }, 3000);
          }
        }, 100);
      }
    }
  }, [highlightJobId, jobs, scrollToJob]);

  // Add this state for delete confirmation modal
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  // Add this DeleteConfirmationModal component
  const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, jobTitle }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md m-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{jobTitle}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Delete Job
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add this function to handle the actual deletion
  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/employer/jobs/${jobToDelete._id}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders(),
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete job');
      }

      // Update both allJobs and jobs states
      const updatedJobs = allJobs.filter(job => job._id !== jobToDelete._id);
      setAllJobs(updatedJobs);
      setJobs(updatedJobs);
      
      // Update job counts
      calculateJobCounts(updatedJobs);
      
      // Show success notification
      showNotification('Job deleted successfully');
      
      // Close the confirmation modal
      setShowDeleteConfirm(false);
      setJobToDelete(null);
    } catch (err) {
      console.error('Delete error:', err);
      showNotification(err.message || 'Failed to delete job', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen font-poppins">

      {/* Nav Bar and Side Bar {*/}  
      <NavEmployer/>  

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50">
          <Alert className={`${
            notification.type === 'error' ? 'border-red-500' : 'border-green-500'
          }`}>
            <AlertDescription>
              {notification.message}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setJobToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        jobTitle={jobToDelete?.jobTitle}
      />

      {/* Main Content */}
      <div className="flex-1 p-8 sm:ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="h-6 w-6 text-gray-500" />
                  </button>
                  <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
                </div>
                <p className="text-gray-600 mt-2">Manage and track your job postings</p>
              </div>
              <button
                onClick={handleAddJob}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Add Job
              </button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Briefcase className="text-blue-500" size={24} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total Jobs</p>
                  <p className="text-2xl font-semibold mt-1">{jobCounts.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <CheckCircle className="text-green-500" size={24} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Active Jobs</p>
                  <p className="text-2xl font-semibold mt-1 text-green-600">{jobCounts.active}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-50 flex items-center justify-center">
                  <XCircle className="text-red-500" size={24} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Inactive Jobs</p>
                  <p className="text-2xl font-semibold mt-1 text-red-600">{jobCounts.inactive}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center">
                  <Clock className="text-yellow-500" size={24} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Pending Jobs</p>
                  <p className="text-2xl font-semibold mt-1 text-yellow-600">{jobCounts.pending}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                {jobStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      selectedStatus.toLowerCase() === status.toLowerCase()
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {status === 'All' ? status : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowStarredOnly(!showStarredOnly)}
                  className={`p-2 rounded-lg transition-colors ${
                    showStarredOnly ? 'bg-yellow-50 text-yellow-600' : 'text-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <Star className="h-5 w-5" />
                </button>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={() => setShowFilters(true)}
                  className="px-4 py-2 border rounded-full hover:bg-gray-50 flex items-center gap-2"
                >
                  <Filter className="h-5 w-5" />
                  Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {selectedJobs.size > 0 && (
          <div className="mb-4 p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedJobs.size} {selectedJobs.size === 1 ? 'job' : 'jobs'} selected
            </span>
            <div className="space-x-2">
              
              <button
                className="px-4 py-2 border rounded-full flex items-center space-x-2 text-red-600 hover:bg-red-50"
                onClick={() => handleBulkAction('delete')}
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="py-4 px-6 text-left">
                    <input
                      type="checkbox"
                      checked={selectedJobs.size === jobs.length && jobs.length > 0}
                      onChange={toggleAllJobs}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-500">Job Title</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-500">Date Posted</th>
                  <th className="py-4 px-6 text-left text-sm font-medium text-gray-500">Status</th>
                  <th className="py-4 px-6 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <span className="ml-3 text-gray-500">Loading jobs...</span>
                      </div>
                    </td>
                  </tr>
                ) : jobs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8">
                      <div className="text-center">
                        <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by creating a new job posting.
                        </p>
                        <div className="mt-6">
                          <button
                            onClick={handleAddJob}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                            New Job
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr
                      key={job._id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={(e) => {
                        if (!e.target.closest('.action-buttons')) {
                          handleRowClick(job._id);
                        }
                      }}
                    >
                      <td className="py-4 px-6">
                        <input
                          type="checkbox"
                          checked={selectedJobs.has(job._id)}
                          onChange={() => toggleJobSelection(job._id)}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center">
                          <div>
                            <div className="font-medium text-gray-900">{job.jobTitle}</div>
                            <div className="text-sm text-gray-500">{job.jobLocation}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-900">{formatDate(job.createdAt)}</div>
                        <div className="text-xs text-gray-500">Posted date</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${job.jobStatus === 'active' ? 'bg-green-100 text-green-800' :
                            job.jobStatus === 'inactive' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'}`}>
                          {job.jobStatus.charAt(0).toUpperCase() + job.jobStatus.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-3 action-buttons">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(job._id, starredJobs.has(job._id));
                            }}
                            className="text-gray-400 hover:text-yellow-500"
                          >
                            <Star
                              className={`h-5 w-5 ${
                                starredJobs.has(job._id) ? 'fill-yellow-400 text-yellow-400' : ''
                              }`}
                            />
                          </button>
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(activeDropdown === job._id ? null : job._id);
                              }}
                              className="text-gray-400 hover:text-gray-500"
                            >
                              <MoreHorizontal className="h-5 w-5" />
                            </button>
                            {activeDropdown === job._id && <ActionsDropdown jobId={job._id} />}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showFilters && <FilterModal />}
    </div>
  );
};

// Add these styles to your CSS
const styles = `
    @keyframes highlightPulse {
        0% { 
            background-color: white;
            transform: scale(1);
        }
        50% { 
            background-color: #dbeafe;
            transform: scale(1.01);
        }
        100% { 
            background-color: white;
            transform: scale(1);
        }
    }

    .highlight-animation {
        animation: highlightPulse 2s ease-in-out;
        position: relative;
    }

    .highlight-animation::after {
        content: '';
        position: absolute;
        inset: 0;
        border: 2px solid #3b82f6;
        border-radius: 0.375rem;
        opacity: 0;
        animation: borderPulse 2s ease-in-out;
    }

    @keyframes borderPulse {
        0% { opacity: 0; }
        50% { opacity: 1; }
        100% { opacity: 0; }
    }
`;

// Add the styles to your document
const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ManageJobs;
