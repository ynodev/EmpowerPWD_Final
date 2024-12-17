import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavEmployer from '../ui/navEmployer';
import { 
  FileText, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Briefcase, 
  Clock,
  Building,
  FileCheck,
  AlertCircle,
  ArrowLeft,
  X,
  Download,
  UserCircle
} from 'lucide-react';

const ViewApplication = () => {
  const { id } = useParams();
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Document viewer state
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentType, setDocumentType] = useState('');

  // First, add a state for job questions
  const [jobQuestions, setJobQuestions] = useState([]);

  const fetchApplicationDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching application details for ID:', id);
      const response = await axios.get(`/api/applications/${id}/details`);
      console.log('Response:', response.data);
      
      if (response.data.success) {
        setApplication(response.data.data);
        // Get the questions from the job data
        if (response.data.data.jobId?.questioner) {
          setJobQuestions(response.data.data.jobId.questioner);
        }
      } else {
        console.error('API returned success: false');
      }
    } catch (error) {
      console.error('Error fetching application:', error);
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicationDetails();
  }, [id]);

  const handleStatusUpdate = async (status) => {
    try {
      const response = await axios.patch(`/api/applications/${id}/status`, { 
        status: status.toLowerCase()
      });

      if (response.data.success) {
        setApplication(prev => ({ ...prev, status: status.toLowerCase() }));
        
        // Send SMS for rejection
        if (status.toLowerCase() === 'rejected') {
          try {
            const phoneNumber = formatPhoneNumberForSMS(application.basicInfo.phoneNumber);
            const message = `We regret to inform you that your application for ${application.jobId.jobTitle} was not successful at this time. Thank you for your interest.`;
            
            await axios.post('/api/sms/send', {
              phoneNumber: phoneNumber,
              message: message
            });
          } catch (smsError) {
            console.error('Failed to send rejection SMS:', smsError);
          }
        }

        alert(`Application ${status} successfully`);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status');
    }
  };

  const handleAcceptClick = async () => {
    try {
      if (!userId) {
        alert('Please login again');
        return;
      }

      setIsGeneratingLink(true);
      // Generate meeting link with basic properties
      const response = await axios.post('/api/daily/create-room', {
        properties: {
          exp: Math.round(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days from now
          enable_chat: true,
          enable_screenshare: true,
          start_audio_off: true,
          start_video_off: true,
          max_participants: 10,
          enable_knocking: true
        }
      });

      if (response.data.data?.url) {
        setMeetingLink(response.data.data.url);
        setShowAcceptModal(true);
      } else {
        throw new Error('No meeting URL in response');
      }
    } catch (error) {
      console.error('Error creating meeting room:', error);
      alert('Failed to create meeting room. Please try again.');
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleConfirmAccept = async () => {
    try {
      if (!meetingLink) {
        alert('Please wait for the meeting link to be generated');
        return;
      }

      // Create interview data with null times
      const interviewData = {
        applicationId: id,
        jobseekerId: application.jobseeker._id,
        employerId: userId,
        jobId: application.jobId._id,
        date: null,
        startTime: null,
        endTime: null,
        meetingLink: meetingLink,
        notes: notes,
        status: 'pending'  // Set initial status as pending
      };

      console.log('Creating interview with data:', interviewData);

      // Create interview first
      const interviewResponse = await axios.post('/api/interviews/create', interviewData);
      console.log('Interview creation response:', interviewResponse.data);

      if (interviewResponse.data.success) {
        // Update application status
        const statusResponse = await axios.patch(`/api/applications/${id}/status`, {
          status: 'interview',
          message: notes,
          meetingLink: meetingLink
        });

        if (statusResponse.data.success) {
          // Send SMS notification to job seeker
          try {
            const phoneNumber = application.applicationData.basicInfo.phoneNumber;
            const formattedNumber = phoneNumber
              .replace(/\D/g, '')
              .replace(/^(\+)?63/, '63')
              .substring(0, 12);
            
            const message = 
              `JobPortal: Application Accepted!\n\n` +
              `Your application for "${application.jobId.jobTitle}" has been accepted.\n\n` +
              `Meeting Link:\n${meetingLink}\n\n` +
              `${notes ? `Notes: ${notes}\n\n` : ''}` +
              `You can now schedule your interview time.`;
            
            const smsData = {
              phoneNumber: formattedNumber,
              message: message.substring(0, 800)
            };
            
            const smsResponse = await axios.post('/api/sms/send', smsData);
            console.log('SMS API Response:', smsResponse.data);
            
          } catch (smsError) {
            console.error('SMS Error:', smsError);
          }

          setShowAcceptModal(false);
          setMeetingLink('');
          setNotes('');
          setApplication(prev => ({ ...prev, status: 'interview' }));
          alert('Application accepted successfully! The applicant will schedule their interview.');
        }
      }
    } catch (error) {
      console.error('Error in acceptance process:', error);
      alert(`Failed to process acceptance: ${error.message}`);
    }
  };

  // Update the phone number formatting functions

  // For display in the UI
  const formatPhoneNumberForDisplay = (phoneNumber) => {
    if (!phoneNumber) return 'No phone number provided';
    
    // If it's already in the correct format, just return it
    if (phoneNumber.startsWith('+63') && phoneNumber.length === 13) {
      // Format as +63 XXX XXX XXXX
      const cleaned = phoneNumber.substring(3); // Remove +63
      return `+63 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    
    // If it's not in the correct format, try to format it
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `+63 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    
    // If we can't format it, return as is
    return phoneNumber;
  };

  // For SMS sending
  const formatPhoneNumberForSMS = (phoneNumber) => {
    if (!phoneNumber) return null;
    
    // If it's already in the correct format (+639XXXXXXXXX)
    if (phoneNumber.startsWith('+63') && phoneNumber.length === 13) {
      return phoneNumber.substring(1); // Remove the + sign only
    }
    
    // If it needs formatting
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `63${cleaned}`;
    }
    
    // If it already starts with 63 and has correct length
    if (cleaned.startsWith('63') && cleaned.length === 12) {
      return cleaned;
    }
    
    throw new Error('Invalid phone number format');
  };


  const handleViewDocument = (url, type) => {
    setDocumentUrl(url);
    setDocumentType(type);
    setShowDocumentModal(true);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleViewProfile = () => {
    // Make sure we're using the correct ID from the application data
    const seekerUserId = application.jobseeker?.user?._id || application.jobseeker?._id;
    
    if (!seekerUserId) {
      console.error('No seeker ID found in application data:', application);
      return;
    }
    
    console.log('Navigating to profile with ID:', seekerUserId); // Debug log
    navigate(`/employer/jobseeker/${seekerUserId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-900 border-t-transparent"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-700">Application not found</p>
          <p className="text-sm text-gray-500 mt-2">The requested application could not be loaded.</p>
        </div>
      </div>
    );
  }

  const { 
    jobseeker = {}, 
    jobId: job = {}, 
    applicationData = {},
    documents = {}, 
    status = 'pending',
    createdAt,
  } = application || {};

  // applicationData contains the actual basic info and other details
  const {
    basicInfo = {},
    workHistory = [],
    jobPreferences = {},
    questionnaireAnswers = []
  } = applicationData;

  console.log('Render Data:', {
    hasApplication: !!application,
    basicInfo,
    jobId: job,
    status
  });

  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'interview scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavEmployer />
      <div className="flex-1 p-8 sm:ml-64">
        <div className="max-w-5xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => navigate('/employer/applications')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Applications</span>
          </button>

          {/* Application Header */}
          <div className="bg-white rounded-2xl shadow-sm border p-8 mb-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {application.applicationData?.basicInfo?.firstName} {application.applicationData?.basicInfo?.lastName}
                </h1>
                <p className="text-gray-500 mt-1">Application for {application.jobId?.jobTitle}</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(status)}`}>
                    {status}
                  </span>
                  <span className="text-sm text-gray-500">
                    Applied {formatDate(createdAt)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleViewProfile}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                    transition-colors flex items-center gap-2"
                >
                  <UserCircle className="w-5 h-5" />
                  View Profile
                </button>
                <button
                  onClick={handleAcceptClick}
                  disabled={status === 'accepted' || isGeneratingLink}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {isGeneratingLink ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Generating Link...</span>
                    </>
                  ) : (
                    'Accept & Schedule Interview'
                  )}
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={status === 'rejected'}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 
                    disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Reject Application
                </button>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Mail className="w-4 h-4 mr-3" />
                <span>{application.jobseeker?.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-3" />
                <span>
                  {application.applicationData?.basicInfo?.phoneNumber ? 
                    formatPhoneNumberForDisplay(application.applicationData.basicInfo.phoneNumber) : 
                    'No phone number provided'}
                </span>
              </div>
              <div className="flex items-start text-gray-600">
                <MapPin className="w-4 h-4 mr-3 mt-1" />
                <span>
                  {[
                    application.applicationData?.basicInfo?.address,
                    application.applicationData?.basicInfo?.city,
                    application.applicationData?.basicInfo?.province,
                    application.applicationData?.basicInfo?.country,
                    application.applicationData?.basicInfo?.postalCode
                  ].filter(Boolean).join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-8 mt-8">
            {/* Left Column - Main Application Content */}
            <div className="flex-1 space-y-8">
              {/* Work Experience */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Work Experience</h2>
                {application.applicationData?.workHistory?.length > 0 ? (
                  <div className="space-y-6">
                    {application.applicationData.workHistory.map((work, index) => (
                      <div key={index} className="border-l-2 border-gray-200 pl-4">
                        <h3 className="font-medium text-gray-900">{work.previousJobTitle}</h3>
                        <p className="text-gray-600 text-sm">{work.companyName}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          {formatDate(work.startDate)} - {work.isCurrentlyWorking ? 'Present' : formatDate(work.endDate)}
                        </p>
                        <p className="mt-2 text-gray-700">{work.keyResponsibility}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No work history provided</p>
                )}
              </div>

              {/* Job Preferences */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Job Preferences</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">Preferred Start Date</p>
                    <p className="font-medium mt-1">
                      {formatDate(application.applicationData?.jobPreferences?.preferredStartDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Availability</p>
                    <p className="font-medium mt-1">
                      {application.applicationData?.jobPreferences?.availability}
                    </p>
                  </div>
                  {application.applicationData?.jobPreferences?.accomodation && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Accommodation Needs</p>
                      <p className="mt-1">{application.applicationData.jobPreferences.accomodation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Questionnaire Answers */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Questionnaire Answers</h2>
                {jobQuestions.length > 0 ? (
                  <div className="space-y-6">
                    {jobQuestions.map((question, index) => (
                      <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                        <div className="space-y-2">
                          <div className="font-medium text-gray-900">
                            {question}
                          </div>
                          <div className="pl-6 text-gray-700">
                            {application.applicationData?.questionnaireAnswers?.[index] || 'No answer provided'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No questionnaire questions were set for this job</p>
                )}
              </div>
            </div>

            {/* Right Column - Documents and Additional Info */}
            <div className="w-80 space-y-6">
              {/* Documents Section */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Documents</h2>
                <div className="space-y-3">
                  {application.documents?.resumeUrl && (
                    <button
                      onClick={() => handleViewDocument(application.documents.resumeUrl.path, 'resume')}
                      className="w-full flex items-center p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <FileCheck className="w-5 h-5 mr-3" />
                      View Resume
                    </button>
                  )}
                  {application.documents?.coverLetterUrl && (
                    <button
                      onClick={() => handleViewDocument(application.documents.coverLetterUrl.path, 'coverLetter')}
                      className="w-full flex items-center p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    >
                      <FileText className="w-5 h-5 mr-3" />
                      View Cover Letter
                    </button>
                  )}
                </div>
              </div>

              {/* Disability Information */}
              <div className="bg-white rounded-2xl shadow-sm border p-6">
                <h2 className="text-lg font-semibold mb-4">Disability Information</h2>
                {application.jobseeker?.disabilityInfo?.disabilityType ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Type</p>
                      <div className="flex flex-wrap gap-2">
                        {application.jobseeker.disabilityInfo.disabilityType.map((type, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    {application.jobseeker.disabilityInfo.disabilityAdditionalInfo && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Additional Information</p>
                        <p className="text-gray-700">
                          {application.jobseeker.disabilityInfo.disabilityAdditionalInfo}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No disability information provided</p>
                )}
              </div>
            </div>
          </div>

          

          {/* Document Viewer Modal */}
          {showDocumentModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg w-[95%] h-[95vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-bold">
                    {documentType === 'resume' ? 'Resume' : 'Cover Letter'}
                  </h2>
                  <button
                    onClick={() => setShowDocumentModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                {/* Document Viewer */}
                <div className="flex-1 p-4 bg-gray-50">
                  <iframe
                    src={documentUrl}
                    className="w-full h-full rounded-lg border border-gray-200 shadow-lg"
                    title={documentType === 'resume' ? 'Resume' : 'Cover Letter'}
                  />
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t flex justify-end gap-3">
                  <a
                    href={documentUrl}
                    download={`${documentType}_${application?.jobseeker?.name || 'document'}.pdf`}
                    className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download size={16} />
                    Download
                  </a>
                  <button
                    onClick={() => window.open(documentUrl, '_blank')}
                    className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    Open in New Tab
                  </button>
                  <button
                    onClick={() => setShowDocumentModal(false)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Accept Application Modal */}
          {showAcceptModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg w-[90%] max-w-[500px]">
                <h2 className="text-xl font-bold mb-4">Accept Application</h2>
                
                {/* Meeting Link Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={meetingLink}
                      readOnly
                      className="border rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={copyToClipboard}
                      className={`
                        px-4 py-2 rounded-lg text-white whitespace-nowrap
                        ${isCopied ? 'bg-green-500' : 'bg-blue-500 hover:bg-blue-700'}
                        transition duration-200
                      `}
                    >
                      {isCopied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about the interview..."
                    className="w-full p-3 border border-gray-300 rounded-lg min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setShowAcceptModal(false);
                      setMeetingLink('');
                      setNotes('');
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmAccept}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Confirm Accept
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewApplication;