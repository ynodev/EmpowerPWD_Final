import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Eye, ClipboardCheck, Users as UsersIcon, Briefcase, UserCheck, AlertCircle, ChevronDown, ArrowUpDown } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import SidebarAdmin from './sideNavAdmin';

const UserManagementSystem = ({ userType = 'all' }) => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [actionStatus, setActionStatus] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobSeekers: 0,
    totalEmployers: 0,
    pendingVerification: 0,
    verifiedUsers: 0
  });

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    
    if (!userRole || !userId) {
      setError('Please log in to access this page');
      setIsAuthorized(false);
      return;
    }

    if (userRole !== 'admin') {
      setError('You do not have permission to access this page');
      setIsAuthorized(false);
      return;
    }

    setIsAuthorized(true);
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        role: userType,
        search: searchQuery,
        verified: filterStatus,
        sortBy: sortField,
        order: sortOrder
      });

      console.log('Fetching with params:', Object.fromEntries(queryParams));

      const response = await fetch(`/api/admin/management/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');

      const data = await response.json();
      console.log('Received data:', data);
      
      setUsers(data.data.users);
      setTotalPages(data.data.pagination.pages);
      if (data.data.stats) {
        setStats(data.data.stats);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchUsers();
    }
  }, [userType, currentPage, searchQuery, filterStatus, sortField, sortOrder]);

  const handleReviewUser = async (userId) => {
    setReviewMode(true);
    window.location.href = `/admin/users/${userId}/review`;
    setOpenDropdownId(null);
  };

  const handleStatusChange = async (userId, isVerified) => {
    setActionLoading(true);
    setActionStatus(null);
    try {
      const response = await fetch(`/api/admin/management/users/${userId}/verify`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': localStorage.getItem('userId'),
          'X-User-Role': localStorage.getItem('userRole')
        },
        body: JSON.stringify({ 
          isVerified,
          sendEmail: true
        })
      });

      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update user status');
      }

      await fetchUsers();
      setOpenDropdownId(null);
      setActionStatus({
        type: 'success',
        message: `User successfully ${isVerified ? 'verified. Verification email has been sent.' : 'unverified'}`
      });
    } catch (error) {
      setActionStatus({
        type: 'error',
        message: error.message
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('This action cannot be undone. Are you sure you want to delete this user?')) {
      return;
    }

    setActionLoading(true);
    setActionStatus(null);
    try {
      const response = await fetch(`/api/admin/management/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': localStorage.getItem('userId'),
          'X-User-Role': localStorage.getItem('userRole')
        }
      });

      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action');
      }

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      await fetchUsers();
      setOpenDropdownId(null);
      setActionStatus({
        type: 'success',
        message: 'User successfully deleted'
      });
    } catch (error) {
      setActionStatus({
        type: 'error',
        message: error.message
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setActionStatus(null), 3000);
    }
  };

  const handleViewUser = (userId) => {
    window.location.href = `/admin/users/${userId}`;
    setOpenDropdownId(null);
  };

  const toggleDropdown = (userId) => {
    setOpenDropdownId(openDropdownId === userId ? null : userId);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Add role-specific columns
  const getColumns = () => {
    const baseColumns = [
      {
        header: 'User',
        cell: (user) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600 font-medium">
                {user.profile?.firstName?.charAt(0) || user.email.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="font-medium text-gray-900">
                {user.profile?.firstName 
                  ? `${user.profile.firstName} ${user.profile.lastName}`
                  : user.email
                }
              </div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </div>
        )
      },
      {
        header: 'Status',
        cell: (user) => (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
            ${user.isVerified 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {user.isVerified ? 'Verified' : 'Pending'}
          </span>
        )
      }
    ];

    // Role-specific columns
    if (userType === 'jobseeker') {
      return [
        ...baseColumns,
        {
          header: 'Skills',
          cell: (user) => (
            <div className="flex flex-wrap gap-1">
              {user.skills?.slice(0, 3).map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                  {skill}
                </span>
              ))}
              {user.skills?.length > 3 && (
                <span className="text-xs text-gray-500">+{user.skills.length - 3} more</span>
              )}
            </div>
          )
        },
        {
          header: 'Applications',
          cell: (user) => (
            <span className="text-gray-600">{user.applications || 0}</span>
          )
        }
      ];
    }

    if (userType === 'employer') {
      return [
        ...baseColumns,
        {
          header: 'Company',
          cell: (user) => (
            <div>
              <div className="font-medium text-gray-900">{user.company?.name}</div>
              <div className="text-sm text-gray-500">{user.company?.industry}</div>
            </div>
          )
        },
        {
          header: 'Jobs Posted',
          cell: (user) => (
            <div>
              <div className="font-medium text-gray-900">{user.activeJobs || 0} active</div>
              <div className="text-sm text-gray-500">{user.jobsPosted || 0} total</div>
            </div>
          )
        }
      ];
    }

    return baseColumns;
  };

  if (!isAuthorized) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Alert variant="destructive">
          <AlertDescription>{error || 'Unauthorized access'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <SidebarAdmin />
      
      <div className="sm:ml-64"> 
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="p-8">
            <h1 className="text-4xl font-bold text-[#1A2755]">
              {userType === 'employer' ? 'Employer Management' :
               userType === 'jobseeker' ? 'Job Seeker Management' :
               filterStatus === 'pending' ? 'Pending Verifications' :
               'User Management System'}
            </h1>
            <p className="text-gray-600 mt-2">
              {userType === 'employer' ? 'Manage and monitor employer accounts' :
               userType === 'jobseeker' ? 'Manage and monitor job seeker accounts' :
               filterStatus === 'pending' ? 'Review and verify pending user accounts' :
               'Manage and monitor all users in the system'}
            </p>
          </div>
        </div>
        
        <div className="p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Users</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.totalUsers}</h3>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <UsersIcon className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Job Seekers</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.totalJobSeekers}</h3>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <Briefcase className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Employers</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.totalEmployers}</h3>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <Briefcase className="w-6 h-6 text-purple-500" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Pending Verification</p>
                  <h3 className="text-2xl font-bold mt-1">{stats.pendingVerification}</h3>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {actionStatus && (
            <Alert 
              variant={actionStatus.type === 'success' ? 'default' : 'destructive'} 
              className="mb-6"
            >
              <AlertDescription>{actionStatus.message}</AlertDescription>
            </Alert>
          )}

          {/* Search and Filter */}
          <div className="bg-white p-6 rounded-2xl shadow-sm mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-6 py-2.5 border border-gray-200 rounded-full hover:bg-gray-50 flex items-center gap-2 transition-all duration-200 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">Filters</span>
                  <ChevronDown 
                    className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${
                      showFilters ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full p-2.5 pl-4 pr-10 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white transition-all duration-200"
                  >
                    <option value="all">All Users</option>
                    <option value="verified">Verified Users</option>
                    <option value="pending">Pending Verification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={`${sortField}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split('-');
                      setSortField(field);
                      setSortOrder(order);
                    }}
                    className="w-full p-2.5 pl-4 pr-10 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 appearance-none bg-white transition-all duration-200"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 1rem center',
                      backgroundSize: '1.5em 1.5em'
                    }}
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="name-desc">Name (Z-A)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th 
                      className="text-left p-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('name')}
                    >
                      <div className="flex items-center gap-2">
                        Name
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('role')}
                    >
                      <div className="flex items-center gap-2">
                        Role
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center gap-2">
                        Date Created
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th 
                      className="text-left p-4 font-semibold text-gray-600 cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort('isVerified')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        <ArrowUpDown className="w-4 h-4" />
                      </div>
                    </th>
                    <th className="w-[50px]"></th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="text-center p-8">
                        <div className="flex justify-center items-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center p-8 text-gray-500">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="border-b hover:bg-gray-50">
                        <td className="p-4">{user.profile?.basicInfo?.name || user.email}</td>
                        <td className="p-4 capitalize">{user.role}</td>
                        <td className="p-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            user.isVerified 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.isVerified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="relative">
                            <button 
                              onClick={() => toggleDropdown(user._id)}
                              className="p-2 hover:bg-gray-100 rounded-full"
                              disabled={actionLoading}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            
                            {openDropdownId === user._id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10">
                                {!user.isVerified && (
                                  <button
                                    className="w-full text-left px-4 py-2 hover:bg-gray-100 disabled:opacity-50 flex items-center"
                                    onClick={() => handleReviewUser(user._id)}
                                    disabled={actionLoading}
                                  >
                                    <ClipboardCheck className="w-4 h-4 mr-2" />
                                    Review Account
                                  </button>
                                )}
                                <button
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 disabled:opacity-50"
                                  onClick={() => handleStatusChange(user._id, !user.isVerified)}
                                  disabled={actionLoading}
                                >
                                  {user.isVerified ? 'Unverify' : 'Verify'} User
                                </button>
                                <button 
                                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 disabled:opacity-50"
                                  onClick={() => handleDeleteUser(user._id)}
                                  disabled={actionLoading}
                                >
                                  Delete User
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center p-4 border-t">
                <div className="flex gap-2">
                  <button
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                    disabled={currentPage === 1 || actionLoading}
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                    onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                    disabled={currentPage === totalPages || actionLoading}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagementSystem;  