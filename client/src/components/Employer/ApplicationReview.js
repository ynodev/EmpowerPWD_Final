import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, FileText, User, Building2, X } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import NavEmployer from '../ui/navEmployer';
import axios from 'axios';

// Reuse the same components from UserReview
const Badge = ({ children }) => (
  <span className="inline-block bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm">
    {children}
  </span>
);

const InfoField = ({ label, value }) => (
  <div>
    <label className="text-sm text-gray-500 block mb-1">{label}</label>
    <p className="font-medium text-gray-800">{value || 'N/A'}</p>
  </div>
);

const SectionCard = ({ icon: Icon, title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
    <div className="border-b border-gray-100 p-6">
      <div className="flex items-center">
        <Icon className="w-5 h-5 text-gray-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const Modal = ({ title, message, onClose }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
      <h2 className="text-lg font-semibold text-gray-800">{message}</h2>
      <div className="mt-4 flex justify-end gap-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

const ApplicationReview = () => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);

  useEffect(() => {
    // Get the current URL
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);
    
    // Extract the ID from URL like /employer/applications/review/{id}
    const matches = currentPath.match(/\/employer\/applications\/([^/]+)/);
    console.log('URL matches:', matches);
    
    const applicationId = matches ? matches[1] : null;
    console.log('Extracted application ID:', applicationId);

    if (applicationId) {
      fetchApplicationData(applicationId);
    } else {
      console.log('No valid application ID found in URL');
      setError('Invalid application ID');
      setLoading(false);
    }
  }, []);

  const fetchApplicationData = async (applicationId) => {
    console.log('Attempting to fetch data for application:', applicationId);
    try {
      const response = await axios.get(`/api/applications/${applicationId}/details`, {
        withCredentials: true
      });
      
      console.log('Response:', response);
      
      if (response.data.success) {
        console.log('Application data:', response.data.data);
        setApplication(response.data.data);
      } else {
        throw new Error(response.data.message || 'Failed to fetch application data');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationStatus = async (status) => {
    setProcessing(true);
    try {
      const response = await fetch(`http://localhost:5001/api/applications/review/${application._id}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status,
          startDate: null,
          endDate: null,
          notification: {
            from: 'employer',
            to: 'applicant',
            type: status === 'accepted' ? 'application_accepted' : 'application_rejected',
            message: status === 'accepted' 
              ? 'Your application has been accepted! You can now schedule your interview.' 
              : 'Your application has been declined.'
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update application status');
      }

      setModalMessage(
        status === 'accepted' 
          ? 'Application has been accepted successfully! The applicant will schedule their interview.' 
          : 'Application has been declined.'
      );
      setShowModal(true);
    } catch (error) {
      console.error('Update error:', error);
      setError(error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    window.location.href = '/employer/applications';
  };

  if (loading) {
    console.log('Component is in loading state');
    return (
      <div className="min-h-screen bg-gray-50">
        <NavEmployer />
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mb-4" />
            <p className="text-gray-600">Loading application data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavEmployer />
        <div className="max-w-7xl mx-auto p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <button 
            onClick={() => window.history.back()} 
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavEmployer />
        <div className="max-w-7xl mx-auto p-6">
          <Alert>
            <AlertDescription>No application data found.</AlertDescription>
          </Alert>
          <button 
            onClick={() => window.history.back()} 
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavEmployer />
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header with Status */}
        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => window.history.back()}
              className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Application Review</h1>
              <p className="text-sm text-gray-500">Applied on: {new Date(application?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            application?.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            application?.status === 'accepted' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {application?.status?.charAt(0).toUpperCase() + application?.status?.slice(1)}
          </span>
        </div>

        {/* Job Details */}
        <SectionCard icon={Building2} title="Job Details">
          <div className="grid md:grid-cols-2 gap-6">
            <InfoField label="Job Title" value={application?.jobId?.jobTitle} />
            <InfoField label="Location" value={application?.jobId?.jobLocation} />
            <InfoField label="Employment Type" value={application?.jobId?.employmentType} />
            <InfoField label="Work Setup" value={application?.jobId?.workSetup} />
            <InfoField label="Education Level" value={application?.jobId?.educationLevel} />
            <InfoField label="Experience Required" value={application?.jobId?.yearsOfExperience} />
            <InfoField label="Application Deadline" value={new Date(application?.jobId?.applicationDeadline).toLocaleDateString()} />
            <InfoField label="Salary Range" value={`${application?.jobId?.salaryMin} - ${application?.jobId?.salaryMax} (${application?.jobId?.salaryBasis})`} />
            
            <div className="md:col-span-2">
              <InfoField label="Job Description" value={application?.jobId?.jobDescription} />
            </div>
            
            <div className="md:col-span-2">
              <h3 className="text-sm text-gray-500 mb-2">Industry</h3>
              <div className="flex flex-wrap gap-2">
                {application?.jobId?.industry?.map((item, index) => (
                  <Badge key={index}>{item}</Badge>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm text-gray-500 mb-2">Key Skills</h3>
              <div className="flex flex-wrap gap-2">
                {application?.jobId?.keySkills?.map((skill, index) => (
                  <Badge key={index}>{skill}</Badge>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <InfoField label="Other Skills" value={application?.jobId?.otherSkills} />
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm text-gray-500 mb-2">Benefits</h3>
              <div className="flex flex-wrap gap-2">
                {application?.jobId?.benefits?.map((benefit, index) => (
                  <Badge key={index}>{benefit}</Badge>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm text-gray-500 mb-2">Accessibility Features</h3>
              <div className="flex flex-wrap gap-2">
                {application?.jobId?.accessibilityFeatures?.map((feature, index) => (
                  <Badge key={index}>{feature}</Badge>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm text-gray-500 mb-2">Disability Types</h3>
              <div className="flex flex-wrap gap-2">
                {application?.jobId?.disabilityTypes?.map((type, index) => (
                  <Badge key={index}>{type}</Badge>
                ))}
              </div>
            </div>

            <InfoField label="Additional Perks" value={application?.jobId?.additionalPerks} />
            <InfoField label="Special Accommodations" value={application?.jobId?.specialAccommodations} />
            <InfoField label="Vacancy" value={`${application?.jobId?.filledPositions} / ${application?.jobId?.vacancy}`} />
          </div>
        </SectionCard>

        {/* Applicant Information */}
        <SectionCard icon={User} title="Applicant Information">
          <div className="grid md:grid-cols-2 gap-6">
            <InfoField label="Email" value={application?.jobseeker?.email} />
            <InfoField label="Role" value={application?.jobseeker?.role} />
            <InfoField label="Account Created" value={new Date(application?.jobseeker?.createdAt).toLocaleDateString()} />
            <InfoField label="Verified" value={application?.jobseeker?.isVerified ? 'Yes' : 'No'} />
          </div>
        </SectionCard>

        {/* Application Details */}
        <SectionCard icon={FileText} title="Application Details">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="md:col-span-2">
              <h3 className="text-sm text-gray-500 mb-2">Basic Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InfoField label="First Name" value={application?.applicationData?.basicInfo?.firstName} />
                <InfoField label="Last Name" value={application?.applicationData?.basicInfo?.lastName} />
                <InfoField label="Email" value={application?.applicationData?.basicInfo?.email} />
                <InfoField label="Phone" value={application?.applicationData?.basicInfo?.phoneNumber} />
                <InfoField label="Address" value={application?.applicationData?.basicInfo?.address} />
                <InfoField label="City" value={application?.applicationData?.basicInfo?.city} />
                <InfoField label="Province" value={application?.applicationData?.basicInfo?.province} />
                <InfoField label="Country" value={application?.applicationData?.basicInfo?.country} />
                <InfoField label="Postal Code" value={application?.applicationData?.basicInfo?.postalCode} />
              </div>
            </div>

            {/* Work History */}
            {application?.applicationData?.workHistory?.map((work, index) => (
              <div key={index} className="md:col-span-2">
                <h3 className="text-sm text-gray-500 mb-2">Work History {index + 1}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <InfoField label="Job Title" value={work.previousJobTitle} />
                  <InfoField label="Company" value={work.companyName} />
                  <InfoField label="Duration" value={work.duration} />
                  <InfoField label="Currently Working" value={work.isCurrentlyWorking ? 'Yes' : 'No'} />
                  <div className="md:col-span-2">
                    <InfoField label="Key Responsibilities" value={work.keyResponsibility} />
                  </div>
                </div>
              </div>
            ))}

            {/* Job Preferences */}
            <div className="md:col-span-2">
              <h3 className="text-sm text-gray-500 mb-2">Job Preferences</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <InfoField label="Availability" value={application?.applicationData?.jobPreferences?.availability} />
                <InfoField 
                  label="Preferred Start Date" 
                  value={new Date(application?.applicationData?.jobPreferences?.preferredStartDate).toLocaleDateString()} 
                />
              </div>
            </div>

            {/* Questionnaire */}
            {application?.jobId?.questioner?.length > 0 && (
              <div className="md:col-span-2">
                <h3 className="text-sm text-gray-500 mb-2">Pre-Interview Questions</h3>
                <div className="space-y-4">
                  {application.jobId.questioner.map((question, index) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <p className="text-sm font-medium text-gray-700 mb-2">Q: {question}</p>
                      <p className="text-gray-600">A: {application.applicationData.questionnaireAnswers[index]}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Documents */}
        {application?.documents?.resumeUrl && (
          <SectionCard icon={FileText} title="Documents">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center">
                  <FileText className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-800">Resume</p>
                    <p className="text-sm text-gray-500">{application.documents.resumeUrl.originalName}</p>
                  </div>
                </div>
                <a 
                  href={application.documents.resumeUrl.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  View Resume
                </a>
              </div>
            </div>
          </SectionCard>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={() => handleApplicationStatus('rejected')}
            disabled={processing || application?.status === 'rejected'}
            className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors flex items-center disabled:opacity-50"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Decline
          </button>
          <button
            onClick={() => handleApplicationStatus('accepted')}
            disabled={processing || application?.status === 'accepted'}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Accept
          </button>
        </div>

        {showModal && (
          <Modal
            message={modalMessage}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};

export default ApplicationReview; 