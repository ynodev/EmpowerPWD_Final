import React from 'react';
import { X, Building2, MapPin, Clock, DollarSign, BriefcaseIcon, CalendarCheck, Globe, Building } from 'lucide-react';

const ApplicationDetailsModal = ({ isOpen, onClose, application }) => {
  if (!isOpen || !application) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const StatusBadge = ({ status }) => {
    const statusStyles = {
      'Pending': {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: '⏳'
      },
      'Interview Scheduled': {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        icon: '📅'
      },
      'Rejected': {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: '❌'
      },
      'Accepted': {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: '✅'
      }
    };

    const style = statusStyles[status] || {
      bg: 'bg-gray-50',
      text: 'text-gray-700',
      border: 'border-gray-200',
      icon: 'ℹ️'
    };

    return (
      <div className={`px-3 py-1.5 rounded-full border ${style.bg} ${style.border} flex items-center gap-2`}>
        <span className="text-sm">{style.icon}</span>
        <span className={`text-sm font-medium ${style.text}`}>{status}</span>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header Section */}
          <div className="relative p-6 border-b border-gray-100">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                {application.company.logo ? (
                  <img 
                    src={`${process.env.REACT_APP_API_URL}${application.company.logo}`}
                    alt={application.company.name}
                    className="w-full h-full object-contain rounded-xl"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/64';
                    }}
                  />
                ) : (
                  <Building className="w-8 h-8 text-gray-300" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{application.job.title}</h2>
                    <p className="text-gray-600 mt-1">{application.company.name}</p>
                  </div>
                  <StatusBadge status={application.status} />
                </div>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Content Section */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Application Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Application Details</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <CalendarCheck className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Applied On</p>
                        <p className="text-sm text-gray-600">{formatDate(application.appliedAt)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">{application.job.location}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <BriefcaseIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Employment Type</p>
                        <p className="text-sm text-gray-600">{application.job.employmentType}</p>
                      </div>
                    </div>

                    {(application.job.salary.min > 0 || application.job.salary.max > 0) && (
                      <div className="flex items-center gap-3">
                        <DollarSign className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Salary Range</p>
                          <p className="text-sm text-gray-600">
                            ₱{application.job.salary.min.toLocaleString()} - ₱{application.job.salary.max.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Company Details */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Company Information</h3>
                  <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                    {application.company.description && (
                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">About</p>
                          <p className="text-sm text-gray-600">{application.company.description}</p>
                        </div>
                      </div>
                    )}

                    {application.company.industry && (
                      <div className="flex items-center gap-3">
                        <Building className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Industry</p>
                          <p className="text-sm text-gray-600">{application.company.industry}</p>
                        </div>
                      </div>
                    )}

                    {application.company.website && (
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Website</p>
                          <a 
                            href={application.company.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {application.company.website}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ApplicationDetailsModal;