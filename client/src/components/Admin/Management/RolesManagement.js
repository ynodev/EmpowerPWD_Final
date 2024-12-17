import React, { useState } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import { Shield, Settings } from 'lucide-react';

const permissionDescriptions = {
  manage_admins: 'Create, edit, and delete administrator accounts',
  manage_users: 'Manage user accounts and verification',
  manage_jobs: 'Review and moderate job postings',
  manage_employers: 'Manage employer accounts and verification',
  manage_resources: 'Create and edit platform resources',
  view_analytics: 'Access system analytics and reports',
  manage_settings: 'Configure system settings'
};

// Move roles data outside to make it accessible to other components
export const defaultRolePermissions = {
  super_admin: ['manage_admins', 'manage_users', 'manage_jobs', 'manage_employers', 'manage_resources', 'view_analytics', 'manage_settings'],
  admin: ['manage_users', 'manage_jobs', 'manage_employers', 'manage_resources', 'view_analytics'],
  moderator: ['manage_users', 'manage_jobs', 'manage_resources']
};

const RolesManagement = () => {
  const [roles, setRoles] = useState([
    {
      name: 'super_admin',
      label: 'Super Admin',
      description: 'Full system access with ability to manage other administrators',
      permissions: defaultRolePermissions.super_admin,
      color: 'purple'
    },
    {
      name: 'admin',
      label: 'Administrator',
      description: 'General administrative access with limited admin management',
      permissions: defaultRolePermissions.admin,
      color: 'blue'
    },
    {
      name: 'moderator',
      label: 'Moderator',
      description: 'Basic content and user management capabilities',
      permissions: defaultRolePermissions.moderator,
      color: 'green'
    }
  ]);

  const [selectedRole, setSelectedRole] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleUpdatePermissions = async (role, newPermissions) => {
    try {
      const response = await axios.put(`/api/admin/roles/${role.name}/permissions`, {
        permissions: newPermissions
      });

      if (response.data.success) {
        setRoles(roles.map(r => 
          r.name === role.name ? { ...r, permissions: newPermissions } : r
        ));
        setShowEditModal(false);
        setSelectedRole(null);
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Failed to update permissions. Please try again.');
    }
  };

  const EditRoleModal = ({ isOpen, onClose, role }) => {
    const [selectedPermissions, setSelectedPermissions] = useState(role?.permissions || []);

    const handleSubmit = async (e) => {
      e.preventDefault();
      await handleUpdatePermissions(role, selectedPermissions);
    };

    return isOpen ? (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Edit {role.label} Permissions
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                {Object.entries(permissionDescriptions).map(([permission, description]) => (
                  <label key={permission} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedPermissions.includes(permission)}
                      onChange={(e) => {
                        setSelectedPermissions(prev => 
                          e.target.checked
                            ? [...prev, permission]
                            : prev.filter(p => p !== permission)
                        );
                      }}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-medium text-gray-900">
                        {permission.split('_').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </p>
                      <p className="text-sm text-gray-500">{description}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    ) : null;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Roles & Permissions</h1>
          <p className="mt-2 text-sm text-gray-600">Manage role-based permissions for administrators</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div 
              key={role.name}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
            >
              <div className={`px-6 py-4 border-b border-gray-200 bg-${role.color}-50`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-${role.color}-100 flex items-center justify-center`}>
                    <Shield className={`w-5 h-5 text-${role.color}-600`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{role.label}</h3>
                    <p className="text-sm text-gray-500">{role.description}</p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Permissions</h4>
                <div className="space-y-2.5">
                  {role.permissions.map((permission) => (
                    <div 
                      key={permission}
                      className="flex items-start gap-2.5"
                    >
                      <Settings className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {permission.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {permissionDescriptions[permission]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {role.name !== 'super_admin' && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedRole(role);
                      setShowEditModal(true);
                    }}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                  >
                    Edit Permissions
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {selectedRole && (
          <EditRoleModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedRole(null);
            }}
            role={selectedRole}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default RolesManagement; 