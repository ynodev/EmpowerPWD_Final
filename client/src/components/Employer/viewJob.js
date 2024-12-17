import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Users, Clock, Briefcase, BarChart, Eye, MousePointer, UserPlus, TrendingUp } from 'lucide-react';
import { Card, CardContent } from "../ui/card.js";
import NavEmployer from "../ui/navEmployer.js";


const ViewJob = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const calculateDaysActive = (createdAt) => {
    if (!createdAt) return '0';
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - created);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays.toString();
  };

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/employer/jobs/${jobId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          credentials: 'include'
        });

        const data = await response.json();
        console.log('Server response:', data);

        if (!response.ok) {
          throw new Error(data.message || `Error ${response.status}: Failed to fetch job details`);
        }

        if (data && data.job) {
          setJob(data.job);
        } 
        else if (data && data.data) {
          setJob(data.data);
        }
        else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          setJob(data);
        }
        else {
          console.error('Invalid response structure:', data);
          throw new Error('Unable to parse job data from server response');
        }

      } catch (err) {
        console.error('Error fetching job details:', err);
        if (err.message.includes('Unable to parse job data')) {
          setError('The server response was not in the expected format. Please try again or contact support.');
        } else {
          setError(err.message || 'An unexpected error occurred while fetching job details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [jobId]);

  const handleEdit = () => {
    if (!job) {
      console.error('No job data available to edit');
      return;
    }

    try {
      sessionStorage.setItem('editJobData', JSON.stringify(job));
      navigate(`/employers/edit-job/${jobId}`);
    } catch (err) {
      console.error('Error storing job data:', err);
      navigate(`/employers/edit-job/${jobId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavEmployer />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavEmployer />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="bg-red-50 text-red-500 p-6 rounded-lg max-w-md text-center">
            <h2 className="text-lg font-semibold mb-2">Error Loading Job</h2>
            <p className="mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
              >
                Try again
              </button>
              <button 
                onClick={() => navigate('/employers/dashboard')} 
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-gray-500 text-center">
          <p>Job not found</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-4 text-sm text-blue-600 hover:text-blue-800"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'No value';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (err) {
      return 'Invalid date';
    }
  };

  // Helper function to check array data
  const renderArrayData = (array, renderer) => {
    if (!Array.isArray(array) || array.length === 0) {
      return <span className="text-gray-500">No value</span>;
    }
    return renderer(array);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <NavEmployer/>
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
                  <h1 className="text-3xl font-bold text-gray-900">Job Details</h1>
                </div>
                <p className="text-gray-600 mt-2">View and manage job posting details</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2 transition-colors duration-200"
                >
                  <span className="hidden sm:inline">Edit Job</span>
                </button>
              </div>
            </div>
          </div>

          {/* Job Title and Status Section */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{job.jobTitle || 'No title'}</h2>
                <p className="text-gray-600 mt-1">{job.jobLocation || 'No location'}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                job.jobStatus === 'active' ? 'bg-green-100 text-green-800' : 
                job.jobStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                'bg-red-100 text-red-800'
              }`}>
                {job.jobStatus?.charAt(0).toUpperCase() + job.jobStatus?.slice(1) || 'No status'}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Star className="text-blue-500" size={24} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Salary Range</p>
                  <p className="text-xl font-semibold mt-1">
                    {job?.salaryMin && job?.salaryMax 
                      ? `${job.salaryMin}-${job.salaryMax}/${job.salaryBasis}`
                      : "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-50 flex items-center justify-center">
                  <Clock className="text-yellow-500" size={24} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Days Active</p>
                  <p className="text-xl font-semibold mt-1">
                    {calculateDaysActive(job.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-50 flex items-center justify-center">
                  <Briefcase className="text-purple-500" size={24} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Job Type</p>
                  <p className="text-xl font-semibold mt-1">{job?.employmentType || "Not specified"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BarChart className="h-5 w-5 text-gray-500" />
                Performance Metrics
              </h2>
            </div>

            <div className="grid grid-cols-4 gap-6">
              <div className="p-4 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Eye className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Views</span>
                </div>
                <p className="text-2xl font-semibold">{job.performance?.views || 0}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <MousePointer className="h-4 w-4 text-green-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Clicks</span>
                </div>
                <p className="text-2xl font-semibold">{job.performance?.clicks || 0}</p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-yellow-600" />
                  </div>
                  <span className="text-gray-600 text-sm">CTR</span>
                </div>
                <p className="text-2xl font-semibold">
                  {job.performance?.views 
                    ? `${((job.performance.clicks / job.performance.views) * 100).toFixed(1)}%`
                    : '0%'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-purple-600" />
                  </div>
                  <span className="text-gray-600 text-sm">Applications</span>
                </div>
                <p className="text-2xl font-semibold">{job.performance?.applications || 0}</p>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Main Details */}
            <div className="col-span-2 space-y-6">
              {/* Job Description */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Job Description</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{job?.jobDescription || 'No description provided'}</p>
              </div>

              {/* Requirements */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Requirements</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Education Level</p>
                    <p className="font-medium">{job?.educationLevel || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Years of Experience</p>
                    <p className="font-medium">{job?.yearsOfExperience || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Key Skills</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job?.keySkills?.map((skill, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      )) || 'No skills specified'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              {job?.benefits?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <h2 className="text-lg font-semibold mb-4">Benefits</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((benefit, index) => (
                      <span key={index} className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                        {benefit}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Accessibility Features */}
              {job?.accessibilityFeatures?.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border p-6">
                  <h2 className="text-lg font-semibold mb-4">Special Accommodations</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.accessibilityFeatures.map((feature, index) => (
                      <span key={index} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Additional Info */}
            <div className="space-y-6">
              {/* Details Card */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Date Posted</p>
                    <p className="font-medium">{formatDate(job.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Application Deadline</p>
                    <p className="font-medium">{formatDate(job.applicationDeadline)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Work Setup</p>
                    <p className="font-medium">{job?.workSetup || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewJob;
