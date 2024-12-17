import React, { useState, useEffect } from 'react';
import { LogOut, Settings, User, LayoutDashboard, Users, Briefcase, FileText, ChevronUp, ChevronDown, Menu, UserCheck, Building2, Video, Shield, UserCog, ClipboardList } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logo from "../../assets/img/logo.svg";

const SidebarAdmin = () => {
   const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
   const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for mobile sidebar
   const [isLoggingOut, setIsLoggingOut] = useState(false);
   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
   const [selectedItem, setSelectedItem] = useState('Dashboard');
   const [userInfo, setUserInfo] = useState({ email: '', accessLevel: '' });
   const [authError, setAuthError] = useState(null);
   const [expandedMenus, setExpandedMenus] = useState({});
   const [isMinimized, setIsMinimized] = useState(() => {
      const savedState = localStorage.getItem('adminNavMinimized');
      return savedState ? JSON.parse(savedState) : false;
   });
   const [userPermissions, setUserPermissions] = useState([]);
   const [userAccessLevel, setUserAccessLevel] = useState('');
   
   const navigate = useNavigate();
   const location = useLocation(); // Get current location

   const menuItems = [
      { 
         icon: <LayoutDashboard size={20} />, 
         label: 'Dashboard', 
         path: '/admin/dashboard',
         requiredPermission: 'view_analytics'
      },
      { 
         icon: <Shield size={20} />, 
         label: 'Admin Management', 
         path: '/admin/management',
         requiredPermission: 'manage_admins',
         subItems: [
            { 
               icon: <UserCog size={16} />,
               label: 'Manage Admins', 
               path: '/admin/management/admins',
               parentLabel: 'Admin Management',
               requiredPermission: 'manage_admins'
            },
            { 
               icon: <Settings size={16} />,
               label: 'Roles & Permissions', 
               path: '/admin/management/roles',
               parentLabel: 'Admin Management',
               requiredPermission: 'manage_admins'
            },
         ]
      },
      { 
         icon: <Users size={20} />, 
         label: 'User Management', 
         path: '/admin/user-management',
         requiredPermission: 'manage_users',
         subItems: [
            { 
               icon: <UserCheck size={16} />,
               label: 'Verification', 
               path: '/admin/user-management/pending',
               parentLabel: 'User Management',
               requiredPermission: 'manage_users'
            },
            { 
               icon: <Building2 size={16} />,
               label: 'Employers', 
               path: '/admin/user-management/employers',
               parentLabel: 'User Management',
               requiredPermission: 'manage_employers'
            },
            { 
               icon: <User size={16} />,
               label: 'Job Seekers', 
               path: '/admin/user-management/jobseekers',
               parentLabel: 'User Management',
               requiredPermission: 'manage_users'
            }
         ]
      },
      { 
         icon: <Briefcase size={20} />, 
         label: 'Jobs', 
         path: '/admin/jobs',
         requiredPermission: 'manage_jobs'
      },
      { 
         icon: <FileText size={20} />, 
         label: 'Resources',
         path: '/admin/resources',
         requiredPermission: 'manage_resources',
         subItems: [
            {
               icon: <Video size={16} />,
               label: 'Video Resources',
               path: '/admin/resources?tab=videos',
               requiredPermission: 'manage_resources'
            },
            {
               icon: <FileText size={16} />,
               label: 'Blog Posts',
               path: '/admin/resources?tab=blogs',
               requiredPermission: 'manage_resources'
            }
         ]
      },
   ];

   const accountMenuItems = [
      { 
         icon: <ClipboardList size={16} />, 
         label: 'Activity Logs',
         path: '/admin/activity-logs',
         requiredPermission: 'view_analytics'
      },
      { icon: <LogOut size={16} />, label: 'Log Out' }
   ];

   // Add function to check permissions
   const hasPermission = (requiredPermission) => {
      return userAccessLevel === 'super_admin' || userPermissions.includes(requiredPermission);
   };

   // Update the useEffect that fetches user data
   useEffect(() => {
      const fetchUserData = async () => {
         try {
            const userId = localStorage.getItem('userId');
            const response = await axios.get('/api/admin/profile');

            if (response.data && response.data.success) {
               const adminData = response.data.data;
               setUserInfo({
                  email: adminData.user?.email || 'Admin',
                  accessLevel: adminData.accessLevel || 'N/A',
               });
               setUserPermissions(adminData.permissions || []);
               setUserAccessLevel(adminData.accessLevel);
               setAuthError(null);
            } else {
               console.log('Invalid response data:', response.data);
               setAuthError('Unable to load admin profile data');
            }
         } catch (error) {
            console.error("Error fetching admin data:", error);
            if (error.response?.status === 401) {
               navigate('/login');
            } else {
               setAuthError(error.response?.data?.message || 'An error occurred while loading your profile');
            }
         }
      };

      fetchUserData();
   }, [navigate]);

   // Filter menu items based on permissions
   const filteredMenuItems = menuItems.filter(item => {
      // Super admin can see everything
      if (userAccessLevel === 'super_admin') return true;
      
      // Check main item permission
      if (!hasPermission(item.requiredPermission)) return false;
      
      // If item has subitems, filter them too
      if (item.subItems) {
         item.subItems = item.subItems.filter(subItem => 
            hasPermission(subItem.requiredPermission)
         );
         // Only show item if it has at least one accessible subitem
         return item.subItems.length > 0;
      }
      
      return true;
   });

   // Add this to prevent unnecessary re-renders
   const memoizedMenuItems = React.useMemo(() => filteredMenuItems, []);

   // Add this helper function at the top of your component
   const isPathActive = (itemPath, currentPath) => {
      // For resources tab
      if (itemPath.includes('?tab=')) {
         const [basePath, queryString] = itemPath.split('?');
         const currentTab = new URLSearchParams(window.location.search).get('tab');
         const itemTab = new URLSearchParams(`?${queryString}`).get('tab');
         return currentPath === basePath && currentTab === itemTab;
      }
      
      // For exact path matching (like /admin/jobs)
      if (!itemPath.includes('/user-management')) {
         return currentPath === itemPath;
      }
      
      // For nested paths (like /admin/user-management/*)
      return currentPath.startsWith(itemPath);
   };

   // Update the useEffect for path tracking
   useEffect(() => {
      const currentPath = location.pathname;

      const updateActiveItem = () => {
         // Find the deepest matching path
         let bestMatch = null;
         let bestMatchLength = 0;

         memoizedMenuItems.forEach(item => {
            // Check main item path
            if (item.path && currentPath.startsWith(item.path)) {
               if (item.path.length > bestMatchLength) {
                  bestMatch = item;
                  bestMatchLength = item.path.length;
               }
            }

            // Check subitems
            if (item.subItems) {
               item.subItems.forEach(subItem => {
                  const subItemPath = subItem.path.split('?')[0]; // Remove query params for comparison
                  if (currentPath.startsWith(subItemPath) && subItemPath.length > bestMatchLength) {
                     bestMatch = subItem;
                     bestMatchLength = subItemPath.length;
                  }
               });
            }
         });

         if (bestMatch) {
            setSelectedItem(bestMatch.label);
            // If it's a subitem, expand its parent menu
            if (bestMatch.parentLabel) {
               setExpandedMenus(prev => ({ ...prev, [bestMatch.parentLabel]: true }));
            }
         }
      };

      updateActiveItem();
   }, [location.pathname, location.search, memoizedMenuItems]);

   // Update the click handler for better navigation
   const handleItemClick = React.useCallback((item, subItem = null) => {
      if (subItem) {
         // Handle submenu item click
         setSelectedItem(subItem.label);
         if (item.label === 'Resources') {
            const searchParams = new URLSearchParams(window.location.search);
            const currentTab = searchParams.get('tab');
            const targetTab = subItem.path.split('=')[1];

            if (currentTab !== targetTab) {
               navigate(subItem.path);
            }
         } else {
            // For other submenu items, just navigate
            navigate(subItem.path);
         }
      } else if (item.subItems) {
         // Toggle submenu without navigation if item has subitems
         setExpandedMenus(prev => ({
            ...prev,
            [item.label]: !prev[item.label]
         }));
         // Don't change selected item or navigate
      } else {
         // Handle main menu item click
         setSelectedItem(item.label);
         navigate(item.path);
      }
   }, [navigate]);

   const handleLogoutClick = () => {
      setShowLogoutConfirm(true);
   };

   const confirmLogout = async () => {
      setIsLoggingOut(true);
      try {
         await axios.post('/api/auth/logout', {}, {
            withCredentials: true
         });
         navigate('/admin/login');
      } catch (error) {
         console.error("Logout error:", error);
         navigate('/admin/login');
      } finally {
         setIsLoggingOut(false);
         setShowLogoutConfirm(false);
      }
   };

   const cancelLogout = () => {
      setShowLogoutConfirm(false);
   };

   // Add toggleMinimize function
   const toggleMinimize = () => {
      const newState = !isMinimized;
      setIsMinimized(newState);
      localStorage.setItem('adminNavMinimized', JSON.stringify(newState));
   };

   // Add effect to sync minimized state across tabs
   useEffect(() => {
      const handleStorageChange = (e) => {
         if (e.key === 'adminNavMinimized') {
            setIsMinimized(JSON.parse(e.newValue));
         }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
   }, []);

   return (
      <div>
         {/* Mobile menu button */}
         <button
            className="p-2 bg-gray-900 text-white fixed top-4 left-4 z-50 md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
         >
            <Menu size={24} />
         </button>

         {/* Sidebar */}
         <div className={`flex flex-col h-screen bg-white border-r border-gray-100 fixed transform transition-all duration-300 z-40
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            ${isMinimized ? 'w-20' : 'w-64'}
            md:translate-x-0`}>
            {/* Logo Section */}
            <div className="p-5">
               <button 
                  onClick={toggleMinimize}
                  className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-xl transition-all duration-200 w-full"
               >
                  <div className="w-8 h-8 flex items-center justify-center">
                     <img src={logo} alt="logo" className="w-10 h-10" />
                  </div>
                  {!isMinimized && <span className="font-semibold text-gray-800">EmpowerPWD</span>}
               </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 px-2 py-4">
               {filteredMenuItems.map((item, index) => (
                  <div key={`${item.label}-${index}`}>
                     <button
                        onClick={() => handleItemClick(item)}
                        className={`flex items-center justify-between w-full px-4 py-2.5 mt-1 rounded-xl transition-all duration-200 relative group
                        ${(isPathActive(item.path, location.pathname) || 
                           (item.subItems && item.subItems.some(sub => isPathActive(sub.path, location.pathname))))
                           ? 'bg-blue-50 text-blue-600 font-medium' 
                           : 'text-gray-700 hover:bg-gray-50'
                        }`}
                     >
                        <div className="flex items-center">
                           <span className={`group-hover:scale-110 transition-transform duration-200`}>
                              {item.icon}
                           </span>
                           {!isMinimized && <span className="ml-3">{item.label}</span>}
                        </div>
                        {!isMinimized && item.subItems && (
                           <ChevronDown 
                              size={16} 
                              className={`transform transition-transform duration-200 
                                 ${expandedMenus[item.label] ? 'rotate-180' : ''}`
                              } 
                           />
                        )}
                        {/* Tooltip for minimized state */}
                        {isMinimized && (
                           <div className="absolute left-14 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                              {item.label}
                           </div>
                        )}
                     </button>
                     
                     {/* Submenu items */}
                     {!isMinimized && item.subItems && expandedMenus[item.label] && (
                        <div className="ml-6 mt-2 space-y-1">
                           {item.subItems.map((subItem, subIndex) => (
                              <button
                                 key={`${subItem.label}-${subIndex}`}
                                 onClick={() => handleItemClick(item, subItem)}
                                 className={`w-full flex items-center px-4 py-2.5 text-sm rounded-xl transition-all duration-200
                                    ${isPathActive(subItem.path, location.pathname)
                                       ? 'bg-blue-50 text-blue-600 font-medium' 
                                       : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                              >
                                 <span>{subItem.icon}</span>
                                 <span className="ml-3">{subItem.label}</span>
                              </button>
                           ))}
                        </div>
                     )}
                  </div>
               ))}
            </nav>

            {/* Account Section */}
            <div className={`border border-[#C6D7E9] m-4 rounded-xl shadow-md ${isMinimized ? 'p-2' : ''}`}>
               <div className="relative">
                  <button
                     onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                     className="flex items-center justify-between w-full p-3 text-sm rounded-xl transition-all duration-200"
                  >
                     <div className={`flex items-center ${isMinimized ? 'justify-center w-full' : 'gap-3'}`}>
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                           <User size={20} />
                        </div>
                        {!isMinimized && (
                           <div>
                              <p className="font-medium">{userInfo.accessLevel}</p>
                              <p className="text-sm text-[#202B58]">{userInfo.email || 'Admin'}</p>
                           </div>
                        )}
                     </div>
                     {!isMinimized && (
                        isAccountMenuOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />
                     )}
                  </button>

                  {/* Account Menu Dropdown */}
                  {isAccountMenuOpen && (
                     <div className={`absolute ${isMinimized ? 'left-full bottom-0 ml-2' : 'bottom-full left-0 mb-2'} w-48`}>
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden py-1">
                           {accountMenuItems.map((item, index) => (
                              <button
                                 key={index}
                                 onClick={item.label === 'Log Out' ? handleLogoutClick : () => navigate(item.path)}
                                 className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200"
                              >
                                 {item.icon}
                                 <span className="ml-3">{item.label}</span>
                              </button>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Confirmation Dialog */}
         {showLogoutConfirm && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
               <div className="bg-white p-6 rounded-2xl shadow-lg w-11/12 max-w-md mx-auto">
                  <p className="mb-4">Are you sure you want to log out?</p>
                  <div className="flex justify-end space-x-4">
                     <button onClick={cancelLogout} className="bg-white px-4 py-2 rounded-full border border-black hover:bg-black hover:text-white">Cancel</button>
                     <button onClick={confirmLogout} className="bg-black rounded-full text-white px-4 py-2 hover:bg-red-600">
                        {isLoggingOut ? 'Logging out...' : 'Confirm'}
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Loading Spinner */}
         {isLoggingOut && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
               <div className="loader border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div>
            </div>
         )}
      </div>
   );
};

export default SidebarAdmin;
