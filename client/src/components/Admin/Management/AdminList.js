import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../../layouts/AdminLayout';
import { 
  Shield, 
  UserPlus, 
  Trash2, 
  Edit, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  X
} from 'lucide-react';
import { defaultRolePermissions } from './RolesManagement';
import Toast from '../../ui/Toast';

const permissionOptions = [
  { value: 'manage_admins', label: 'Manage Admins' },
  { value: 'manage_users', label: 'Manage Users' },
  { value: 'manage_jobs', label: 'Manage Jobs' },
  { value: 'manage_employers', label: 'Manage Employers' },
  { value: 'manage_resources', label: 'Manage Resources' },
  { value: 'view_analytics', label: 'View Analytics' },
  { value: 'manage_settings', label: 'Manage Settings' }
];

const AdminModal = ({ isOpen, onClose, admin = null, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: admin?.user?.email || '',
    accessLevel: admin?.accessLevel || 'moderator',
    permissions: admin?.permissions || defaultRolePermissions.moderator,
    status: admin?.status || 'active'
  });

  useEffect(() => {
    if (!admin) {
      setFormData(prev => ({
        ...prev,
        permissions: defaultRolePermissions[prev.accessLevel] || []
      }));
    }
  }, [formData.accessLevel, admin]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 animate-scale-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {admin ? 'Edit Administrator' : 'Add New Administrator'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={admin}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Access Level
                </label>
                <select
                  value={formData.accessLevel}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    accessLevel: e.target.value,
                    permissions: defaultRolePermissions[e.target.value] || []
                  })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permissions
                </label>
                <div className="space-y-2">
                  {permissionOptions.map((permission) => (
                    <label key={permission.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission.value)}
                        onChange={(e) => {
                          const newPermissions = e.target.checked
                            ? [...formData.permissions, permission.value]
                            : formData.permissions.filter(p => p !== permission.value);
                          setFormData({ ...formData, permissions: newPermissions });
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">{permission.label}</span>
                    </label>
                  ))}
                </div>
                {formData.permissions.length === 0 && (
                  <p className="text-sm text-red-500 mt-1">
                    At least one permission must be selected
                  </p>
                )}
              </div>
              {admin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formData.permissions.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {admin ? 'Save Changes' : 'Add Administrator'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AdminList = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [currentUserPermissions, setCurrentUserPermissions] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/admins');
      setAdmins(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch administrators');
      console.error('Error fetching admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const handleDelete = async (adminId) => {
    if (!window.confirm('Are you sure you want to delete this administrator?')) return;

    try {
      await axios.delete(`/api/admin/admins/${adminId}`);
      setAdmins(admins.filter(admin => admin._id !== adminId));
      showToast('Administrator deleted successfully');
    } catch (err) {
      console.error('Error deleting admin:', err);
      showToast('Failed to delete administrator', 'error');
    }
  };

  const handleStatusChange = async (adminId, newStatus) => {
    try {
      await axios.put(`/api/admin/admins/${adminId}/status`, { status: newStatus });
      setAdmins(admins.map(admin => 
        admin._id === adminId ? { ...admin, status: newStatus } : admin
      ));
    } catch (err) {
      console.error('Error updating admin status:', err);
      alert('Failed to update administrator status');
    }
  };

  const handleAddAdmin = async (formData) => {
    try {
      const response = await axios.post('/api/admin/register', {
        email: formData.email,
        accessLevel: formData.accessLevel,
        permissions: formData.permissions
      });

      if (response.data.success) {
        setAdmins([...admins, response.data.data]);
        setShowAddModal(false);
        showToast('Invitation email has been sent to the new administrator');
      }
    } catch (err) {
      console.error('Error adding admin:', err);
      showToast('Failed to add administrator', 'error');
    }
  };

  const handleUpdatePermissions = async (adminId, newPermissions) => {
    try {
      const response = await axios.put(`/api/admin/admins/${adminId}/permissions`, {
        permissions: newPermissions
      });

      if (response.data.success) {
        setAdmins(admins.map(admin => 
          admin._id === adminId ? { ...admin, permissions: newPermissions } : admin
        ));
        setShowEditModal(false);
        setSelectedAdmin(null);
      }
    } catch (err) {
      console.error('Error updating permissions:', err);
      alert('Failed to update permissions');
    }
  };

  const handleEditAdmin = async (formData) => {
    try {
      const response = await axios.put(`/api/admin/admins/${selectedAdmin._id}`, {
        accessLevel: formData.accessLevel,
        status: formData.status
      });

      if (response.data.success) {
        await handleUpdatePermissions(selectedAdmin._id, formData.permissions);
        
        setAdmins(admins.map(admin => 
          admin._id === selectedAdmin._id ? {
            ...admin,
            accessLevel: formData.accessLevel,
            status: formData.status,
            permissions: formData.permissions
          } : admin
        ));
        setShowEditModal(false);
        setSelectedAdmin(null);
        showToast('Administrator updated successfully');
      }
    } catch (err) {
      console.error('Error updating admin:', err);
      showToast('Failed to update administrator', 'error');
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'inactive':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'suspended':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getAccessLevelColor = (level) => {
    switch(level) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800 ring-purple-600/20';
      case 'admin':
        return 'bg-blue-100 text-blue-800 ring-blue-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[calc(100vh-2rem)]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
          <AlertCircle className="h-12 w-12 mb-4 text-red-500" />
          <p className="text-lg font-medium text-red-500">{error}</p>
          <button 
            onClick={fetchAdmins}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Administrator Management</h1>
            <p className="mt-2 text-sm text-gray-600">Manage administrator accounts and permissions</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <UserPlus size={20} />
            Add Administrator
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Administrator
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Access Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Permissions
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {admins.map((admin) => (
                  <tr key={admin._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {admin.user?.email}
                          </div>
                          <div className="text-xs text-gray-500">
                            Added {new Date(admin.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccessLevelColor(admin.accessLevel)}`}>
                        {admin.accessLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {getStatusIcon(admin.status)}
                        <span className={`text-sm ${
                          admin.status === 'active' ? 'text-green-700' :
                          admin.status === 'suspended' ? 'text-red-700' :
                          'text-gray-700'
                        }`}>
                          {admin.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {admin.permissions.map((permission, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                          >
                            {permission}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setShowEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        {admin.accessLevel !== 'super_admin' && (
                          <button
                            onClick={() => handleDelete(admin._id)}
                            className="text-red-600 hover:text-red-900 transition-colors duration-200"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        <AdminModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddAdmin}
        />

        <AdminModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAdmin(null);
          }}
          admin={selectedAdmin}
          onSubmit={handleEditAdmin}
        />

        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, show: false })}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminList; 