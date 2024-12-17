import React from 'react';
import { X, Building2, MapPin, Clock, DollarSign, BriefcaseIcon, CalendarCheck } from 'lucide-react';

const ApplicationDetailsModal = ({ isOpen, onClose, application }) => {
  if (!isOpen || !application) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Define status order and get current status progress
  const statusOrder = ['Pending', 'Interview Scheduled', 'Accepted', 'Rejected'];
  const currentIndex = statusOrder.indexOf(application.status);
  const progressWidth = `${((currentIndex + 1) / statusOrder.length) * 100}%`;

  return (
    <>
      {/* Modal Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center">
                  {application.company.logo ? (
                    <img 
                      src={application.company.logo} 
                      alt={application.company.name}
                      className="w-full h-full object-contain rounded-xl"
                    />
                  ) : (
                    <Building2 size={32} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{application.job.title}</h2>
                  <p className="text-gray-600">{application.company.name}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <CalendarCheck size={20} className="text-gray-400" />
              <span className="text-sm text-gray-600">Applied on {formatDate(application.appliedAt)}</span>
            </div>

            {/* Application Status */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Application Status</h3>
              <div className="w-full bg-gray-100 h-2 rounded-full">
                <div 
                  className={`h-full rounded-full ${
                    application.status === 'Rejected' ? 'bg-red-500' :
                    application.status === 'Accepted' ? 'bg-blue-500' :
                    application.status === 'Interview Scheduled' ? 'bg-emerald-500' :
                    'bg-yellow-500'
                  }`}
                  style={{ width: progressWidth }}
                />
              </div>
              <div className="mt-2">
                <span className="text-sm font-medium" style={{
                  color: application.status === 'Rejected' ? '#EF4444' :
                         application.status === 'Accepted' ? '#3B82F6' :
                         application.status === 'Interview Scheduled' ? '#10B981' :
                         '#F59E0B'
                }}>
                  {application.status}
                </span>
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Job Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{application.job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BriefcaseIcon size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-600">{application.job.employmentType}</span>
                </div>
                {(application.job.salary.min > 0 || application.job.salary.max > 0) && (
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      ${application.job.salary.min.toLocaleString()} - ${application.job.salary.max.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Company Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Company Details</h3>
              <div className="space-y-2">
                {application.company.website && (
                  <a 
                    href={application.company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Company Website
                  </a>
                )}
                {application.company.description && (
                  <p className="text-sm text-gray-600">{application.company.description}</p>
                )}
                {application.company.industry && (
                  <p className="text-sm text-gray-600">Industry: {application.company.industry}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplicationDetailsModal;