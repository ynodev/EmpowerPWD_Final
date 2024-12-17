import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Clock, 
  DollarSign,
  Users,
  CheckCircle,
  XCircle,
  X,
  Globe,
  Phone,
  Mail,
  Building,
  Check
} from 'lucide-react';
import SidebarAdmin from './sideNavAdmin';

const JobReview = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [declineReason, setDeclineReason] = useState('');
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showCompanyProfile, setShowCompanyProfile] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    fetchJobDetails();
  }, [jobId]);

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(`/api/jobs/jobseeker/${jobId}`);
      
      if (response.data.success) {
        console.log('Fetched job details:', response.data.data);
        setJob(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch job details');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching job details');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      const response = await axios.patch(`/api/admin/management/jobs/${jobId}/status`, {
        status: 'active',
        message: job.jobStatus === 'active' 
          ? 'Your job posting has been re-approved.'
          : 'Your job posting has been approved and is now live.',
        type: 'job_status'
      });
      
      if (response.data.success) {
        try {
          await axios.post('/api/notifications', {
            userId: job.employer?._id,
            title: 'Job Approved',
            message: job.jobStatus === 'active'
              ? `Your job posting "${job.jobTitle}" has been re-approved.`
              : `Your job posting "${job.jobTitle}" has been approved.`,
            type: 'job_status',
            metadata: {
              jobId: jobId,
              action: 'approved'
            }
          });
        } catch (notifError) {
          console.warn('Failed to create notification:', notifError);
        }

        setNotification({
          type: 'success',
          message: job.jobStatus === 'active' 
            ? 'Job has been re-approved successfully!'
            : 'Job has been approved successfully!'
        });
        setShowNotification(true);
        
        await fetchJobDetails();
        
        setTimeout(() => {
          navigate('/admin/jobs');
        }, 2000);
      }
    } catch (err) {
      console.error('Error approving job:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to approve job. Please try again.'
      });
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    try {
      if (!declineReason.trim()) {
        setNotification({
          type: 'error',
          message: 'Please provide a reason for declining the job.'
        });
        setShowNotification(true);
        return;
      }

      setLoading(true);
      const response = await axios.patch(`/api/admin/management/jobs/${jobId}/status`, {
        status: 'declined',
        message: declineReason,
        type: 'job_status'
      });
      
      if (response.data.success) {
        try {
          await axios.post('/api/notifications', {
            userId: job.employer?._id,
            title: 'Job Declined',
            message: job.jobStatus === 'declined'
              ? `Your job posting "${job.jobTitle}" has been declined again. Reason: ${declineReason}`
              : `Your job posting "${job.jobTitle}" has been declined. Reason: ${declineReason}`,
            type: 'job_status',
            metadata: {
              jobId: jobId,
              action: 'declined',
              reason: declineReason
            }
          });
        } catch (notifError) {
          console.warn('Failed to create notification:', notifError);
        }

        setNotification({
          type: 'success',
          message: job.jobStatus === 'declined' 
            ? 'Job has been declined again.'
            : 'Job has been declined.'
        });
        setShowNotification(true);
        setShowDeclineModal(false);
        
        await fetchJobDetails();
        
        setTimeout(() => {
          navigate('/admin/jobs');
        }, 2000);
      }
    } catch (err) {
      console.error('Error declining job:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to decline job. Please try again.'
      });
      setShowNotification(true);
    } finally {
      setLoading(false);
    }
  };

  const CompanyInfoPanel = ({ company }) => {
    if (!company) return null;

    const getLogoUrl = (logoPath) => {
      if (!logoPath) return null;
      // Remove any leading slashes and construct the full URL
      const cleanPath = logoPath.startsWith('/') ? logoPath.slice(1) : logoPath;
      return `${process.env.REACT_APP_API_URL}${cleanPath}`;
    };

    return (
      <div className="bg-white rounded-2xl shadow-md p-8 sticky top-24">
        <div className="space-y-6">
          {/* Company Header */}
          <div className="text-center pb-6 border-b border-gray-100">
            <div className="w-24 h-24 mx-auto bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden mb-4 border border-gray-100">
              {company.companyLogo ? (
                <img 
                  src={getLogoUrl(company.companyLogo)}
                  alt={company.companyName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Error loading image:', e);
                    e.target.src = ''; // Clear the source on error
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.parentElement.innerHTML = '<div class="w-12 h-12 text-gray-400"><Building2 /></div>';
                  }}
                />
              ) : (
                <Building2 className="w-12 h-12 text-gray-400" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{company.companyName}</h3>
            <p className="text-gray-500 text-sm">{company.industry?.join(' • ')}</p>
          </div>

          {/* Company Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Company Details</h4>
            
            <div className="grid gap-4">
              <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100/50 hover:border-gray-200 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-700">Company Size</span>
                </div>
                <p className="text-gray-600 ml-8">{company.companySize || 'Not specified'}</p>
              </div>

              {company.location && (
                <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100/50 hover:border-gray-200 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-700">Location</span>
                  </div>
                  <p className="text-gray-600 ml-8">{company.location}</p>
                </div>
              )}

              {company.website && (
                <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100/50 hover:border-gray-200 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-700">Website</span>
                  </div>
                  <a 
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-8"
                  >
                    {company.website}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* About Section */}
          {company.companyDescription && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">About Company</h4>
              <div className="p-5 bg-gray-50/80 rounded-2xl border border-gray-100/50 hover:border-gray-200 transition-all">
                <p className="text-gray-600 text-sm leading-relaxed">
                  {company.companyDescription}
                </p>
              </div>
            </div>
          )}

          {/* Industry Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Industries</h4>
            <div className="flex flex-wrap gap-2">
              {company.industry?.map((ind, index) => (
                <span 
                  key={index}
                  className="px-4 py-2 bg-gray-50/80 text-gray-700 rounded-2xl border border-gray-100/50 text-sm font-medium hover:border-gray-200 transition-all"
                >
                  {ind}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Notification = ({ type, message, onClose }) => {
    return (
      <div className={`fixed top-4 right-4 p-4 rounded-xl shadow-lg border ${
        type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${
            type === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {type === 'success' ? (
              <Check className={`w-5 h-5 ${type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
            ) : (
              <X className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p className={`text-sm font-medium ${
            type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message}
          </p>
          <button
            onClick={onClose}
            className="ml-auto p-1 hover:bg-white rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!job) return <div>Job not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <SidebarAdmin />
      
      <div className="p-8 sm:ml-64">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <button
            onClick={() => navigate('/admin/jobs')}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-all duration-200 group bg-white px-4 py-2 rounded-2xl shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back to Jobs List</span>
          </button>
        </nav>

        {/* Main Content Layout */}
        <div className="flex gap-8">
          {/* Job Details Section */}
          <div className="flex-1 max-w-4xl space-y-6">
            {/* Header with Status */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{job?.jobTitle}</h1>
                  <p className="text-gray-600">{job?.employer?.companyInfo?.companyName}</p>
                </div>
                <span className={`px-5 py-2.5 rounded-2xl text-sm font-medium
                  ${job?.jobStatus === 'pending' ? 'bg-blue-50 text-blue-800' :
                    job?.jobStatus === 'active' ? 'bg-green-50 text-green-800' :
                    'bg-gray-100 text-gray-800'}`}>
                  {job?.jobStatus?.charAt(0).toUpperCase() + job?.jobStatus?.slice(1)}
                </span>
              </div>

              {/* Key Job Information */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50/80 rounded-2xl border border-blue-100/50 hover:border-blue-200 transition-all">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{job?.jobLocation}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50/80 rounded-2xl border border-blue-100/50 hover:border-blue-200 transition-all">
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Employment Type</p>
                    <p className="font-medium text-gray-900">{job?.employmentType}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50/80 rounded-2xl border border-blue-100/50 hover:border-blue-200 transition-all">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Application Deadline</p>
                    <p className="font-medium text-gray-900">
                      {new Date(job?.applicationDeadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50/80 rounded-2xl border border-blue-100/50 hover:border-blue-200 transition-all">
                  <DollarSign className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Salary Range</p>
                    <p className="font-medium text-gray-900">{job?.salaryMin || 'Not specified'} - {job?.salaryMax || 'Not specified'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50/80 rounded-2xl border border-blue-100/50 hover:border-blue-200 transition-all">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Vacancies</p>
                    <p className="font-medium text-gray-900">{job?.vacancy}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-blue-50/80 rounded-2xl border border-blue-100/50 hover:border-blue-200 transition-all">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Experience Level</p>
                    <p className="font-medium text-gray-900">{job?.yearsOfExperience}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-2xl shadow-md p-8 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Job Description</h2>
                <p className="text-gray-600 whitespace-pre-line">{job?.jobDescription}</p>
              </div>

              {/* Accessibility Features */}
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Accessibility Features</h2>
                <div className="grid grid-cols-2 gap-3">
                  {job?.accessibilityFeatures?.map((feature, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-2 p-4 bg-blue-50/80 rounded-2xl border border-blue-100/50"
                    >
                      <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Accommodations */}
              {job?.specialAccommodations && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Special Accommodations</h2>
                  <div className="p-5 bg-blue-50/80 rounded-2xl border border-blue-100/50">
                    <p className="text-blue-700">{job.specialAccommodations}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-md p-8">
              <div className="flex justify-between items-center">
                {/* Current Status Display */}
                <div className={`px-4 py-2 rounded-xl flex items-center gap-2 ${
                  job.jobStatus === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : job.jobStatus === 'declined'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {job.jobStatus === 'active' ? (
                      <Check className="w-4 h-4" />
                    ) : job.jobStatus === 'declined' ? (
                      <X className="w-4 h-4" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium capitalize">
                      Status: {job.jobStatus}
                    </span>
                  </div>
                </div>

                {/* Action Buttons - Always show both */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeclineModal(true)}
                    className="px-6 py-3 border-2 border-gray-600 text-gray-600 rounded-2xl hover:bg-gray-50 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || job.jobStatus === 'declined'}
                  >
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      <span>{job.jobStatus === 'declined' ? 'Decline Again' : 'Decline Job'}</span>
                    </div>
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={loading || job.jobStatus === 'active'}
                  >
                    <div className="flex items-center gap-2">
                      {loading ? (
                        <span className="animate-spin">⌛</span>
                      ) : (
                        <CheckCircle className="w-5 h-5" />
                      )}
                      <span>
                        {loading ? 'Processing...' : 
                         job.jobStatus === 'active' ? 'Approve Job' : 'Approve Job'}
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Company Info Side Panel */}
          <div className="w-80 hidden xl:block">
            <CompanyInfoPanel company={job?.employer?.companyInfo} />
          </div>
        </div>
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md m-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Decline Job</h2>
            <p className="text-gray-500 mb-6">Please provide a reason for declining this job posting.</p>
            <textarea
              className="w-full p-4 border rounded-xl mb-6 h-32 resize-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
              placeholder="Enter your reason here..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="px-6 py-2.5 text-gray-600 hover:text-gray-900 transition-colors font-medium rounded-2xl hover:bg-gray-50 disabled:opacity-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-colors font-medium shadow-sm hover:shadow-md disabled:opacity-50"
                disabled={loading || !declineReason.trim()}
              >
                {loading ? (
                  <span className="animate-spin">⌛</span>
                ) : (
                  'Confirm Decline'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showNotification && notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};

export default JobReview; 