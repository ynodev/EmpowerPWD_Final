import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, FileText, User, Building2, X } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import SidebarAdmin from './sideNavAdmin';

// Reusable components
const Badge = ({ children }) => (
  <span className="inline-block bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm">
    {children}
  </span>
);

const InfoField = ({ label, value }) => (
  <div>
    <label className="text-sm text-gray-500 block mb-1">{label}</label>
    <p className="font-medium text-gray-800">{value}</p>
  </div>
);

const Modal = ({ title, message, onClose, primaryAction }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
      <h2 className="text-lg font-semibold text-gray-800">{message}</h2>
      <div className="mt-4 flex justify-end gap-4">
        {primaryAction}
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

const DocumentViewer = ({ document, onClose }) => {
  const [loadError, setLoadError] = useState(false);
  const [viewerType, setViewerType] = useState('default');

  if (!document) return null;

  // Extract filename from path
  const getFileName = (path) => {
    if (!path) return '';
    // Convert Windows path separators to URL format and remove 'uploads' prefix
    const normalizedPath = path.replace(/\\/g, '/').replace(/^uploads\//, '');
    console.log('Normalized path:', normalizedPath);
    return normalizedPath;
  };

  const filename = getFileName(document.path || document.filePath || document.fileName);
  console.log('Document:', document);
  console.log('Filename:', filename);
  
  // Use different URLs for viewing and downloading
  const downloadUrl = `${process.env.REACT_APP_API_URL}/uploads/${encodeURIComponent(filename)}`;
  const viewUrl = `${process.env.REACT_APP_API_URL}/view-pdf/${encodeURIComponent(filename)}`;
  
  
  const isImage = document.mimeType?.startsWith('image/') || 
                 document.contentType?.startsWith('image/');
  
  const isPDF = document.mimeType?.includes('pdf') || 
                document.contentType?.includes('pdf') ||
                filename.toLowerCase().endsWith('.pdf');

  const renderContent = () => {
    if (loadError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-6">
          <p className="text-red-500 mb-4">Unable to display the document directly</p>
          <div className="flex gap-4">
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Open in New Tab
            </a>
          </div>
        </div>
      );
    }

    if (isImage) {
      return (
        <img
          src={downloadUrl}
          alt={document.originalName || document.fileName}
          className="w-full h-full object-contain"
          onError={() => setLoadError(true)}
        />
      );
    }

    if (isPDF) {
      if (viewerType === 'default') {
        return (
          <iframe
            src={viewUrl}
            type="application/pdf"
            width="100%"
            height="100%"
            className="w-full h-full"
            style={{ border: 'none' }}
            onError={() => setViewerType('fallback')}
          />
        );
      } else {
        return (
          <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(downloadUrl)}&embedded=true`}
            width="100%"
            height="100%"
            className="w-full h-full"
            frameBorder="0"
            onError={() => setLoadError(true)}
          />
        );
      }
    }

    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <p className="text-gray-500 mb-4">Preview not available for this file type</p>
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Open in New Tab
        </a>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {document.originalName || document.fileName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '80vh' }}>
          {renderContent()}
        </div>

        <div className="mt-4 flex justify-end gap-4">
          {isPDF && !loadError && (
            <button
              onClick={() => setViewerType(viewerType === 'default' ? 'fallback' : 'default')}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Switch Viewer
            </button>
          )}
          <a
            href={downloadUrl}
            download={document.originalName || document.fileName}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

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

const UserReview = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);

  useEffect(() => {
    const pathSegments = window.location.pathname.split('/');
    const userId = pathSegments[pathSegments.length - 2];
    fetchUserData(userId);
  }, []);

  const getUserId = () => {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[pathSegments.length - 2];
  };

  const fetchUserData = async (userId) => {
    try {
      console.log('Fetching user data for ID:', userId);
      const response = await fetch(`/api/admin/management/users/${userId}/review`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      console.log('Raw API response:', JSON.stringify(data, null, 2));

      // Ensure documents exist before processing
      if (data.documents) {
        console.log('Found documents in response:', data.documents);
      } else {
        console.warn('No documents found in response');
      }

      setUserData(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (approved) => {
    setVerifying(true);
    try {
      const response = await fetch(`/api/admin/management/users/${getUserId()}/verify`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: approved }),
      });

      if (!response.ok) throw new Error('Failed to update verification status');

      setModalMessage(approved ? 'User has been successfully approved!' : 'User has been rejected.');
      setShowModal(true);
    } catch (error) {
      setError(error.message);
      setModalMessage('An error occurred while verifying the user.');
      setShowModal(true);
    } finally {
      setVerifying(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    window.location.href = '/admin/user-management';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const user = {
    ...userData,
    ...(userData?.jobSeekerData || {}),
    ...(userData?.employerData || {}),
  };

  const renderBasicInfo = () => (
    <SectionCard icon={User} title="Basic Information">
      <div className="grid md:grid-cols-2 gap-6">
        <InfoField label="Email" value={user?.email} />
        <InfoField label="Role" value={user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)} />
        {user?.basicInfo && (
          <>
            <InfoField 
              label="Full Name" 
              value={`${user.basicInfo.firstName} ${user.basicInfo.lastName}`} 
            />
            <InfoField label="Age" value={user.basicInfo.age} />
          </>
        )}
      </div>
    </SectionCard>
  );

  const renderJobSeekerInfo = () => (
    user?.role === 'jobseeker' && (
      <>
        
        
        {user.documents && user.documents.length > 0 && (
          <SectionCard icon={FileText} title="Submitted Documents">
            <div className="space-y-4">
              {user.documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center">
                    <FileText className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-800">{doc.documentType}</p>
                      <p className="text-sm text-gray-500">{doc.fileName}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedDocument(doc);
                      setShowDocumentModal(true);
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </>
    )
  );

  const renderEmployerInfo = () => {
    console.log('Rendering employer info');
    console.log('User data:', user);
    console.log('Documents:', user?.documents);

    return (
      user?.role === 'employer' && (
        <>
          {user.companyInfo && (
            <SectionCard icon={Building2} title="Company Information">
              <div className="grid md:grid-cols-2 gap-6">
                <InfoField label="Company Name" value={user.companyInfo.companyName} />
                <InfoField label="Industry" value={user.companyInfo.industry?.join(', ')} />
                <InfoField label="Company Size" value={user.companyInfo.companySize} />
                <InfoField label="Website" value={user.companyInfo.website} />
                <InfoField 
                  label="Description" 
                  value={user.companyInfo.companyDescription} 
                />
                {user.companyInfo.establishmentDate && (
                  <InfoField 
                    label="Establishment Date" 
                    value={new Date(user.companyInfo.establishmentDate).toLocaleDateString()} 
                  />
                )}
              </div>
            </SectionCard>
          )}

          {user.contactPerson && (
            <SectionCard icon={User} title="Contact Person">
              <div className="grid md:grid-cols-2 gap-6">
                <InfoField label="Name" value={user.contactPerson.fullName} />
                <InfoField label="Position" value={user.contactPerson.position} />
                <InfoField label="Email" value={user.contactPerson.email} />
                <InfoField label="Phone" value={user.contactPerson.phoneNumber} />
              </div>
            </SectionCard>
          )}
        </>
      )
    );
  };

  const renderDocumentSection = () => {
    if (!user?.documents) return null;

    // Handle job seeker documents which might be in a different format
    const documents = user.role === 'jobseeker' ? 
      Object.entries(user.documents).map(([key, value]) => ({
        documentType: key,
        ...value
      })) :
      Object.entries(user.documents).map(([docType, docInfo]) => {
        if (docType === 'otherDocs' || !docInfo) return null;
        return {
          documentType: docType,
          ...docInfo
        };
      }).filter(Boolean);

    return (
      <SectionCard icon={FileText} title="Submitted Documents">
        <div className="space-y-4">
          {documents.map((doc, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-800">
                    {doc.documentType.charAt(0).toUpperCase() + 
                     doc.documentType.slice(1).replace(/([A-Z])/g, ' $1')}
                  </p>
                  <p className="text-sm text-gray-500">
                    {doc.originalName || doc.fileName}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  console.log('Opening document:', doc);
                  setSelectedDocument(doc);
                  setShowDocumentModal(true);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
              >
                View
              </button>
            </div>
          ))}

          {documents.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No documents uploaded</p>
            </div>
          )}
        </div>
      </SectionCard>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">

      <SidebarAdmin />

      <div className="p-8 px-20 sm:ml-64 space-y-6">
        <div className="bg-white rounded-2xl shadow-sm p-6 flex items-center">
          <button 
            onClick={() => window.history.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Account Review</h1>
        </div>

        {renderBasicInfo()}
        {renderJobSeekerInfo()}
        {renderEmployerInfo()}
        {renderDocumentSection()}

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={() => handleVerify(false)}
            disabled={verifying}
            className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors flex items-center disabled:opacity-50"
          >
            <XCircle className="w-5 h-5 mr-2" />
            Reject
          </button>
          <button
            onClick={() => handleVerify(true)}
            disabled={verifying}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Approve
          </button>
        </div>

        {showModal && (
          <Modal
            message={modalMessage}
            onClose={handleCloseModal}
          />
        )}

        {showDocumentModal && (
          <DocumentViewer
            document={selectedDocument}
            onClose={() => setShowDocumentModal(false)}
          />
        )}
      </div>
    </div>
  );
};

export default UserReview;