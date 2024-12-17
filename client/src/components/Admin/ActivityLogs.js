import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLayout from '../layouts/AdminLayout';
import { 
  ClipboardList, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle
} from 'lucide-react';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/admin/activity-logs?page=${pageNum}&search=${searchTerm}`);
      setLogs(response.data.data);
      setTotalPages(response.data.totalPages);
      setError(null);
    } catch (err) {
      setError('Failed to fetch activity logs');
      console.error('Error fetching logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
  }, [page, searchTerm]);

  const getActionColor = (action) => {
    switch (action) {
      case 'ADMIN_CREATED':
        return 'text-green-600 bg-green-50 border border-green-200';
      case 'ADMIN_DELETED':
        return 'text-red-600 bg-red-50 border border-red-200';
      case 'PERMISSIONS_UPDATED':
        return 'text-blue-600 bg-blue-50 border border-blue-200';
      case 'STATUS_UPDATED':
        return 'text-yellow-600 bg-yellow-50 border border-yellow-200';
      case 'LOGIN':
        return 'text-purple-600 bg-purple-50 border border-purple-200';
      case 'LOGOUT':
        return 'text-gray-600 bg-gray-50 border border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border border-gray-200';
    }
  };

  const formatAction = (action) => {
    const actionMap = {
      'ADMIN_CREATED': 'Created Admin',
      'ADMIN_DELETED': 'Deleted Admin',
      'PERMISSIONS_UPDATED': 'Updated Permissions',
      'STATUS_UPDATED': 'Updated Status',
      'LOGIN': 'Logged In',
      'LOGOUT': 'Logged Out',
      'USER_VERIFIED': 'Verified User',
      'JOB_APPROVED': 'Approved Job',
      'JOB_REJECTED': 'Rejected Job',
      'RESOURCE_ADDED': 'Added Resource',
      'RESOURCE_UPDATED': 'Updated Resource',
      'RESOURCE_DELETED': 'Deleted Resource'
    };
    return actionMap[action] || action;
  };

  const formatDetails = (action, details) => {
    switch (action) {
      case 'ADMIN_CREATED':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">New Admin:</span>
              <span className="text-blue-600 font-medium">{details.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Role:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                ${details.accessLevel === 'admin' ? 'bg-blue-100 text-blue-700' : 
                  'bg-gray-100 text-gray-700'}`}>
                {details.accessLevel}
              </span>
            </div>
          </div>
        );

      case 'ADMIN_DELETED':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Deleted Admin:</span>
              <span className="text-red-600 font-medium">{details.email || details.adminId}</span>
            </div>
          </div>
        );

      case 'PERMISSIONS_UPDATED':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Admin:</span>
              <span className="text-blue-600 font-medium">{details.email || details.adminId}</span>
            </div>
            <div>
              <span className="text-gray-600 text-sm">New Permissions:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {details.changes?.permissions?.map((perm, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    {perm.split('_').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );

      case 'STATUS_UPDATED':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Admin:</span>
              <span className="text-blue-600 font-medium">{details.email || details.adminId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">New Status:</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                ${details.status === 'active' ? 'bg-green-100 text-green-700' :
                  details.status === 'suspended' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'}`}>
                {details.status.charAt(0).toUpperCase() + details.status.slice(1)}
              </span>
            </div>
          </div>
        );

      case 'LOGIN':
        return (
          <div className="space-y-2">
            <p className="text-gray-600">Successfully logged into the system</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Browser: {details.browser || 'Unknown'}</p>
              <p>Device: {details.device || 'Unknown'}</p>
              <p>Time: {new Date(details.timestamp).toLocaleString()}</p>
            </div>
          </div>
        );

      case 'LOGOUT':
        return (
          <div className="space-y-2">
            <p className="text-gray-600">Successfully logged out of the system</p>
            <div className="text-xs text-gray-500">
              <p>Session Duration: {details.sessionDuration || 'Unknown'}</p>
              <p>Time: {new Date(details.timestamp).toLocaleString()}</p>
            </div>
          </div>
        );

      case 'USER_VERIFIED':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Verified User:</span>
              <span className="text-blue-600 font-medium">{details.userEmail || details.userId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Type:</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {details.userType || 'User'}
              </span>
            </div>
          </div>
        );

      case 'JOB_APPROVED':
      case 'JOB_REJECTED':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Job Title:</span>
              <span className="text-blue-600 font-medium">{details.jobTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Employer:</span>
              <span className="text-gray-800">{details.employer}</span>
            </div>
            {details.reason && (
              <div className="mt-1">
                <span className="text-gray-600">Reason:</span>
                <p className="text-sm text-gray-700 mt-1">{details.reason}</p>
              </div>
            )}
          </div>
        );

      case 'RESOURCE_ADDED':
      case 'RESOURCE_UPDATED':
      case 'RESOURCE_DELETED':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Resource:</span>
              <span className="text-blue-600 font-medium">{details.resourceTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Type:</span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {details.resourceType}
              </span>
            </div>
          </div>
        );

      default:
        // For any unhandled action types, display a formatted version of the details
        return (
          <div className="space-y-1 text-sm text-gray-600">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2">
                <span className="font-medium min-w-[100px] text-gray-700">
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}:
                </span>
                <span className="text-gray-600">
                  {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                </span>
              </div>
            ))}
          </div>
        );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
            onClick={() => fetchLogs(page)}
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
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Activity Logs</h1>
          <p className="mt-2 text-sm text-gray-600">Track all administrative actions and changes</p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 pr-4 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {/* Activity List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time & Admin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                        <div className="text-gray-500">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {log.admin?.email || 'System'}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          IP: {log.ipAddress}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        {formatDetails(log.action, log.details)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ActivityLogs; 