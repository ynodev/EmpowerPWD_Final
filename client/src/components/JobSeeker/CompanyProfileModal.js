import React from 'react';
import { X, MapPin, Globe, Users, Calendar, Phone, Mail, Linkedin } from 'lucide-react';

const CompanyProfileModal = ({ company, onClose }) => {
  if (!company) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative p-6 border-b">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
              {company.logo ? (
                <img 
                  src={company.logo} 
                  alt={company.name} 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-2xl font-bold text-gray-400">
                  {company.name.substring(0, 2)}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{company.name}</h2>
              <div className="flex items-center text-gray-600 mt-2">
                <MapPin className="w-4 h-4 mr-2" />
                <span>{company.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Company Info */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">About Company</h3>
            <p className="text-gray-600 mb-4">{company.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="flex items-center text-gray-600">
                <Globe className="w-5 h-5 mr-2" />
                <span>Industry: {company.industry}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <Users className="w-5 h-5 mr-2" />
                <span>Company Size: {company.companySize}</span>
              </div>
              {company.website && (
                <div className="flex items-center text-gray-600">
                  <Globe className="w-5 h-5 mr-2" />
                  <a 
                    href={company.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Company Website
                  </a>
                </div>
              )}
              {company.establishmentDate && (
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>Established: {new Date(company.establishmentDate).getFullYear()}</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          {company.contactPerson && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center text-gray-600">
                  <Phone className="w-5 h-5 mr-2" />
                  <span>{company.contactPerson.phoneNumber}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="w-5 h-5 mr-2" />
                  <span>{company.contactPerson.email}</span>
                </div>
                {company.contactPerson.linkedIn && (
                  <div className="flex items-center text-gray-600">
                    <Linkedin className="w-5 h-5 mr-2" />
                    <a 
                      href={company.contactPerson.linkedIn} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      LinkedIn Profile
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PWD Support */}
          {company.pwdSupport && (
            <div>
              <h3 className="text-xl font-semibold mb-4">PWD Support</h3>
              <div className="space-y-3">
                {company.pwdSupport.accessibilityFeatures?.length > 0 && (
                  <div>
                    <h4 className="font-medium">Accessibility Features:</h4>
                    <ul className="list-disc list-inside text-gray-600 ml-4">
                      {company.pwdSupport.accessibilityFeatures.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {company.pwdSupport.supportPrograms?.length > 0 && (
                  <div>
                    <h4 className="font-medium">Support Programs:</h4>
                    <ul className="list-disc list-inside text-gray-600 ml-4">
                      {company.pwdSupport.supportPrograms.map((program, index) => (
                        <li key={index}>{program}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyProfileModal; 