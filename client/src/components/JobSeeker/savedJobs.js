import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import NavSeeker from '../ui/navSeeker';
import ProfileNav from './profileNav';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const SavedJobs = () => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const response = await axios.get('http://localhost:5001/api/seekers/saved-jobs', {
        withCredentials: true
      });
      
      // Filter out any null jobs
      const validJobs = response.data.data.filter(item => item.job != null);
      setSavedJobs(validJobs);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (savedJobId) => {
    try {
      await axios.delete(`http://localhost:5001/api/seekers/saved-jobs/${savedJobId}`, {
        withCredentials: true
      });
      // Remove the unsaved job from state
      setSavedJobs(prev => prev.filter(job => job._id !== savedJobId));
    } catch (err) {
      console.error('Error unsaving job:', err);
    }
  };

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const handleViewDetails = (job) => {
    navigate('/job-list', {
      state: { searchQuery: job.jobTitle }
    });
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <NavSeeker />
      
      <div className="max-w-6xl mx-auto p-6">
         <ProfileNav />

        <div className="space-y-6">
          {savedJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h3>
              <p className="text-gray-500 mb-4">Start saving jobs you're interested in to view them here</p>
              <Link
                to="/job-list"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Jobs
              </Link>
            </div>
          ) : (
            savedJobs.map((savedJob) => {
              // Add null check for job object
              if (!savedJob?.job) return null;

              return (
                <div 
                  key={savedJob._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col space-y-4">
                    {/* Header - Always Visible */}
                    <div className="flex items-start justify-between group">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Company Logo */}
                        <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                          {savedJob.job.employersId?.companyInfo?.companyLogo ? (
                            <img 
                              src={savedJob.job.employersId.companyInfo.companyLogo} 
                              alt="Company Logo" 
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <Briefcase className="w-6 h-6 text-blue-500" />
                          )}
                        </div>

                        {/* Job Info */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {savedJob.job.jobTitle}
                          </h3>
                         
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {savedJob.job.jobLocation}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {savedJob.job.employmentType}
                            </div>
                            <div className="flex items-center gap-1">
                            <span >₱</span>
                                                          {savedJob.job.salaryMin} - {savedJob.job.salaryMax}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUnsaveJob(savedJob._id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Show More/Less Button */}
                    <button
                      onClick={() => toggleExpand(savedJob._id)}
                      className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 pl-16 group"
                    >
                      <span className="group-hover:underline">
                        {expandedItems.has(savedJob._id) ? 'Show less' : 'Show more'}
                      </span>
                      <div className={`transform transition-transform duration-300 ${
                        expandedItems.has(savedJob._id) ? 'rotate-180' : ''
                      }`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </button>

                    {/* Expanded Content */}
                    {expandedItems.has(savedJob._id) && (
                      <div className="pl-16 pt-4 border-t">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Job Description</h4>
                        <p className="text-gray-600 text-sm whitespace-pre-line">
                          {savedJob.job.jobDescription}
                        </p>
                        <div className="mt-4">
                          <button
                            onClick={() => handleViewDetails(savedJob.job)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                          >
                            View Full Details
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedJobs;
