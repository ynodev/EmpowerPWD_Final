import React, { useEffect, useState } from 'react';
import axios from 'axios';
import NavEmployer from '../ui/navEmployer';
import { Search, Filter, MoreVertical, Eye, Edit, UserCircle, XCircle, MessageCircle, Users, Clock, CheckCircle, AlertCircle, FileText, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApplicationDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [jobFilter, setJobFilter] = useState('all');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const userId = localStorage.getItem('userId');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [remark, setRemark] = useState('');
  const [isRemarkModalOpen, setIsRemarkModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`/api/applications/employer/${userId}/applications`);
      console.log('Received applications:', response.data.data);
      setApplications(response.data.data);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  useEffect(() => {
    if (!userId) {
      console.error("User ID not found in localStorage");
      return;
    }

    fetchApplications();
  }, [userId]);

  const toggleDropdown = (id) => {
    setOpenDropdownId(openDropdownId === id ? null : id);
  };

  const filteredApplications = applications.filter(app => {
    const fullName = `${app.applicationData?.basicInfo?.firstName || ''} ${app.applicationData?.basicInfo?.lastName || ''}`;
    const jobTitle = app.jobId?.jobTitle || '';
    const matchesSearch = fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesJob = jobFilter === 'all' || app.jobId?._id === jobFilter;
    
    return matchesSearch && matchesStatus && matchesJob;
  });

  // Modified: Create unique jobs array properly
  const uniqueJobs = Array.from(new Set(
    applications
      .filter(app => app.jobId && app.jobId._id)
      .map(app => JSON.stringify({ id: app.jobId._id, title: app.jobId.jobTitle }))
  ))
  .map(str => JSON.parse(str));

  const handleViewApplication = (applicationId) => {
    navigate(`/employer/applications/${applicationId}`);
  };

  const handleViewProfile = (userId) => {
    // Navigate to user profile or open in new tab
    window.open(`/applicant-profile/${userId}`, '_blank');
    setOpenDropdownId(null);
  };

  const handleQuickDecline = async (applicationId) => {
    if (!window.confirm('Are you sure you want to decline this application?')) return;
    
    try {
      await axios.patch(`/api/applications/${applicationId}/status`, {
        status: 'rejected'
      });
      // Refresh applications
      await fetchApplications();
      setOpenDropdownId(null);
    } catch (error) {
      console.error('Error declining application:', error);
    }
  };

  const handleAddRemark = (application) => {
    setSelectedApplication(application);
    setIsRemarkModalOpen(true);
    setOpenDropdownId(null);
  };

  const submitRemark = async () => {
    try {
      await axios.post(`/api/applications/${selectedApplication._id}/remarks`, {
        remark
      });
      setIsRemarkModalOpen(false);
      setRemark('');
      await fetchApplications();
    } catch (error) {
      console.error('Error adding remark:', error);
    }
  };

  const calculateStats = () => {
    return {
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      accepted: applications.filter(app => app.status === 'accepted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      recentApplications: applications.filter(app => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return new Date(app.createdAt) > oneWeekAgo;
      }).length
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <NavEmployer />
      <div className="flex-1 p-8 sm:ml-64">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Applications Management</h1>
            <p className="text-gray-600 mt-2">Track and manage all job applications</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {[
              {
                label: "Total Applications",
                value: calculateStats().total,
                icon: FileText,
                color: "blue"
              },
              {
                label: "Pending",
                value: calculateStats().pending,
                icon: Clock,
                color: "yellow"
              },
              {
                label: "Accepted",
                value: calculateStats().accepted,
                icon: CheckCircle,
                color: "green"
              },
              {
                label: "Rejected",
                value: calculateStats().rejected,
                icon: XCircle,
                color: "red"
              },
              {
                label: "Recent",
                value: calculateStats().recentApplications,
                icon: Users,
                color: "purple"
              }
            ].map((stat, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-${stat.color}-50 flex items-center justify-center flex-shrink-0`}>
                    <stat.icon className={`text-${stat.color}-500`} size={24} />
                  </div>
                  <div className="min-w-[100px]">
                    <p className="text-gray-600 text-sm truncate">{stat.label}</p>
                    <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
            <div className="flex justify-between items-center">
              <div className="flex gap-4">
                {/* Job Filter */}
                <select
                  className="px-4 py-2 rounded-full border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={jobFilter}
                  onChange={(e) => setJobFilter(e.target.value)}
                >
                  <option value="all">All Jobs</option>
                  {uniqueJobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.title}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  className="px-4 py-2 rounded-full border bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  className="pl-10 pr-4 py-2 border rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search applications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-white rounded-2xl shadow-sm border">
            <div className="relative overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Applicant Name</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Job Title</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Applied Date</th>
                    <th className="text-left p-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="w-[50px]"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredApplications.map(app => (
                    <tr key={app._id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <UserCircle className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {`${app.applicationData?.basicInfo?.firstName || ''} ${app.applicationData?.basicInfo?.lastName || ''}`}
                            </div>
                            <div className="text-sm text-gray-500">
                              {app.applicationData?.basicInfo?.email || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span>{app.jobId?.jobTitle || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          app.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="relative flex justify-end">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdown(app._id);
                            }}
                            className="p-1 hover:bg-gray-100 rounded-full"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          
                          {openDropdownId === app._id && (
                            <>
                              {/* Overlay */}
                              <div 
                                className="fixed inset-0"
                                onClick={() => setOpenDropdownId(null)}
                              />
                              
                              {/* Dropdown menu */}
                              <div 
                                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-[60]"
                              >
                                <div className="py-1">
                                  <button
                                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleViewApplication(app._id);
                                    }}
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    View Application
                                  </button>
                                  
                                  
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Applications Found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No applications match your current filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Application Modal */}
      {isViewModalOpen && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Application Details</h2>
              <button 
                onClick={() => setIsViewModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Applicant Info */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Applicant Information</h3>
                <p><span className="font-medium">Name:</span> {selectedApplication.basicInfo?.firstName} {selectedApplication.basicInfo?.lastName}</p>
                <p><span className="font-medium">Email:</span> {selectedApplication.basicInfo?.email}</p>
                <p><span className="font-medium">Phone:</span> {selectedApplication.basicInfo?.phoneNumber}</p>
                <p><span className="font-medium">Location:</span> {selectedApplication.basicInfo?.location}</p>
              </div>

              {/* Work History */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Work History</h3>
                <p><span className="font-medium">Previous Position:</span> {selectedApplication.workHistory?.previousJobTitle}</p>
                <p><span className="font-medium">Company:</span> {selectedApplication.workHistory?.companyName}</p>
                <p><span className="font-medium">Duration:</span> {selectedApplication.workHistory?.duration}</p>
                <p><span className="font-medium">Key Responsibilities:</span> {selectedApplication.workHistory?.keyResponsibility}</p>
              </div>

              {/* Documents */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Documents</h3>
                {selectedApplication.documents?.resumeUrl && (
                  <a 
                    href={selectedApplication.documents.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block"
                  >
                    View Resume
                  </a>
                )}
                {selectedApplication.documents?.coverLetterUrl && (
                  <a 
                    href={selectedApplication.documents.coverLetterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block"
                  >
                    View Cover Letter
                  </a>
                )}
              </div>

              {/* Application Status */}
              <div>
                <h3 className="font-semibold mb-2">Application Status</h3>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  selectedApplication.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedApplication.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  selectedApplication.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedApplication.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Remark Modal */}
      {isRemarkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Remark</h2>
              <button 
                onClick={() => setIsRemarkModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <textarea
              className="w-full p-2 border rounded-lg mb-4 h-32"
              placeholder="Enter your remark here..."
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            />

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => setIsRemarkModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                onClick={submitRemark}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationDashboard;