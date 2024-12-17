import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from "react";
import { Plus, LogOut, Settings, User, LayoutDashboard, Briefcase, FileText, ChevronUp, ChevronDown, Menu, MessageCircle, Bell, Users, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from "axios";
import logo from "../../assets/img/logo.svg";
import NotificationPanel from '../Notifications/NotificationPanel';
import { useNotifications } from '../../context/NotificationContext';
import axiosInstance from '../../utils/axios';
import { useUnreadMessages } from '../../hooks/useUnreadMessages';

const NavEmployer = () => {
   const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
   const [isLoggingOut, setIsLoggingOut] = useState(false);
   const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
   const [selectedItem, setSelectedItem] = useState('Dashboard');
   const [userInfo, setUserInfo] = useState({ 
      email: '', 
      accessLevel: '', 
      name: '',
      profilePic: null 
   });
   const [authError, setAuthError] = useState(null);
   const navigate = useNavigate();
   const location = useLocation();
   const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
   const [showNotifications, setShowNotifications] = useState(false);
   const [notifications, setNotifications] = useState([]);
   const [notificationLoading, setNotificationLoading] = useState(false);
   const [notificationError, setNotificationError] = useState(null);
   const notificationContext = useNotifications();
   const userId = localStorage.getItem('userId');
   const messageUnreadCount = useUnreadMessages(userId);
   const notificationUnreadCount = notificationContext?.unreadCount || 0;
   const [isMinimized, setIsMinimized] = useState(() => {
      const savedState = localStorage.getItem('navMinimized');
      return savedState ? JSON.parse(savedState) : false;
   });

   const addMenuItems = [
      //{ label: 'Add Job', path: '/employers/create-job' },
      { label: 'Add User', path: '/employers/add-user' },
      { label: 'Add Company', path: '/employers/add-company' },
   ];

   const menuItems = [
      { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/Emp-Dashboard' },
      //{ icon: <User size={20} />, label: 'Profile', path: '/employer/profile' },
     // { icon: <Plus size={20} />, label: 'Add Job', path: '/employers/create-job', adminOnly: false },
      { icon: <Briefcase size={20} />, label: 'Jobs', path: '/job-dashboard', adminOnly: false },
      { 
         icon: <MessageCircle size={20} />, 
         label: 'Messages', 
         path: '/messages', 
         badge: messageUnreadCount > 0 ? messageUnreadCount : null, 
         adminOnly: false 
      },
      { icon: <Calendar size={20} />, label: 'Schedule', path: '/employer/schedule', adminOnly: false },
      { 
         icon: <FileText size={20} />, 
         label: 'Resources', 
         path: userInfo.accessLevel === 'admin' ? '/employers/resources/manage' : '/employers/resources/view',
         adminOnly: false 
      },
      { icon: <User size={20} />, label: 'Applicants', path: '/employer/applications', adminOnly: false },
   ];

   const handleLogoutClick = () => {
      setShowLogoutConfirm(true);
   };

   const cancelLogout = () => {
      setShowLogoutConfirm(false);
   };

   const confirmLogout = async () => {
      setIsLoggingOut(true);
      try {
         localStorage.removeItem('token');
         localStorage.removeItem('userRole');
         navigate('/login');
      } catch (error) {
         console.error('Logout error:', error);
      } finally {
         setIsLoggingOut(false);
         setShowLogoutConfirm(false);
      }
   };

   const fetchNotifications = async () => {
      setNotificationLoading(true);
      setNotificationError(null);
      try {
         const userId = localStorage.getItem('userId');
         if (!userId) {
            throw new Error('No user ID found');
         }
         
         const response = await axios.get(`/api/notifications/employer/${userId}`);
         setNotifications(response.data.notifications || []);
      } catch (error) {
         console.error('Error fetching notifications:', error);
         setNotificationError('Failed to load notifications');
      } finally {
         setNotificationLoading(false);
      }
   };

   // Fetch notifications when component mounts
   useEffect(() => {
      if (showNotifications) {
         fetchNotifications();
      }
   }, [showNotifications]);

   const handleNotificationClick = () => {
      setShowNotifications(prev => !prev);
   };

   const accountMenuItems = [
      { 
         icon: <Bell size={16} />, 
         label: 'Notifications', 
         onClick: () => navigate('/notifications')
      },
      { 
         icon: <User size={16} />, 
         label: 'Profile', 
         onClick: () => navigate('/employer/profile')
      },
      { 
         icon: <Settings size={16} />, 
         label: 'Settings',
         onClick: () => navigate('/settings')
      },
      { 
         icon: <LogOut size={16} />, 
         label: 'Log Out', 
         onClick: handleLogoutClick 
      },
   ];

   useEffect(() => {
      const fetchUserData = async () => {
         try {
            const userId = localStorage.getItem('userId');
            const response = await axiosInstance.get(`/api/employer-profile/profile/${userId}`);

            if (response.data && response.data.success) {
               const employerData = response.data.data;
               setUserInfo({
                  email: 'Employer',
                  accessLevel: 'User',
                  name: employerData?.basicInfo?.firstName 
                     ? `${employerData.basicInfo.firstName} ${employerData.basicInfo.lastName}`
                     : employerData?.companyInfo?.companyName || 'User',
                  profilePic: employerData?.basicInfo?.profilePicture || null
               });
               setAuthError(null);
            } else {
               console.log('Invalid response data:', response.data);
               setAuthError('Unable to load employer profile data');
            }
         } catch (error) {
            console.error("Error fetching employer data:", error);
            if (error.response?.status === 401) {
               navigate('/login');
            } else {
               setAuthError(error.response?.data?.message || 'An error occurred while loading your profile');
            }
         }
      };

      fetchUserData();
   }, [navigate]);

   // Set selected item based on current path
   useEffect(() => {
      const currentPath = location.pathname;
      const foundItem = menuItems.find(item => item.path === currentPath);
      if (foundItem) {
         setSelectedItem(foundItem.label);
      }
   }, [location.pathname]);

   const toggleMinimize = () => {
      const newState = !isMinimized;
      setIsMinimized(newState);
      localStorage.setItem('navMinimized', JSON.stringify(newState));
   };

   useEffect(() => {
      const handleStorageChange = (e) => {
         if (e.key === 'navMinimized') {
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
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-md"
         >
            <Menu size={24} />
         </button>

         {/* Sidebar */}
         <div 
            className={`flex flex-col h-screen bg-[#FBFBFB] border-r border-gray-300 fixed transform transition-all duration-300 shadow-md z-40
               ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
               ${isMinimized ? 'w-20' : 'w-64'}
               md:translate-x-0`}
         >
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
               {menuItems
                  .filter(item => !item.adminOnly || userInfo.accessLevel === 'admin')
                  .map((item, index) => (
                     <div key={index}>
                        {item.isDropdown ? (
                           <div className="relative">
                              <button
                                 onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                                 className={`w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors
                                 ${selectedItem === item.label 
                                    ? 'text-blue-600 bg-blue-50'  : ''
                                 }`}
                              >
                                 <div className="relative">
                                    {item.icon}
                                 </div>
                                 <span className="ml-3">{item.label}</span>
                                 {isAddMenuOpen ? <ChevronUp className="ml-auto" size={16} /> : <ChevronDown className="ml-auto" size={16} />}
                              </button>
                              
                              {/* Dropdown Menu */}
                              {isAddMenuOpen && (
                                 <div className="ml-4 mt-1">
                                    {item.subItems.map((subItem, subIndex) => (
                                       <Link
                                          key={subIndex}
                                          to={subItem.path}
                                          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-[#F4F5F6] transition-all duration-200"
                                       >
                                          <span className="ml-3">{subItem.label}</span>
                                       </Link>
                                    ))}
                                 </div>
                              )}
                           </div>
                        ) : (
                           <Link
                              to={item.path}
                              onClick={() => setSelectedItem(item.label)}
                              className={`flex items-center w-full px-4 py-2 mt-1 text-gray-700 rounded-xl transition-all duration-200 relative group
                                 ${selectedItem === item.label 
                                    ? 'bg-[#F4F5F6] text-[#4285F4] font-medium' 
                                    : 'hover:bg-gray-50 font-normal'
                                 }`}
                           >
                              <div className="relative">
                                 {item.icon}
                                 {item.badge && (
                                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-xl h-4 w-4 flex items-center justify-center">
                                       {item.badge}
                                    </span>
                                 )}
                              </div>
                              {!isMinimized && <span className="ml-3">{item.label}</span>}
                              {isMinimized && (
                                 <div className="absolute left-14 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                    {item.label}
                                 </div>
                              )}
                              {selectedItem === item.label && (
                                 <div className="absolute left-0 w-1.5 h-10 bg-[#4285F4] rounded-l" />
                              )}
                           </Link>
                        )}
                     </div>
                  ))}
            </nav>

            {/* Account Section */}
            <div className={`border border-[#C6D7E9] m-4 rounded-xl shadow-sm bg-white hover:bg-gray-50 transition-all duration-200 ${isMinimized ? 'p-2' : ''}`}>
               <div className="relative">
                  <button
                     onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                     className="flex items-center justify-between w-full p-3 text-sm rounded-xl transition-all duration-200"
                  >
                     <div className={`flex items-center ${isMinimized ? 'justify-center w-full' : 'gap-3'}`}>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 overflow-hidden">
                           {userInfo.profilePic ? (
                              <img 
                                 src={`${process.env.REACT_APP_API_URL}${userInfo.profilePic}`}
                                 alt={userInfo.name}
                                 className="w-full h-full object-cover"
                                 onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '';
                                    e.target.parentNode.innerHTML = userInfo.name ? (
                                       `<span class="text-base font-semibold">${userInfo.name.charAt(0).toUpperCase()}</span>`
                                    ) : (
                                       '<User size={20} />'
                                    );
                                 }}
                              />
                           ) : (
                              <span className="text-base font-semibold">
                                 {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : <User size={20} />}
                              </span>
                           )}
                        </div>
                        {!isMinimized && (
                           <div>
                              <p className="font-medium text-gray-900 text-left">
                                 {userInfo.name || 'User'}
                              </p>
                              <p className="text-sm text-gray-500 flex items-center gap-2">
                                 <span>Employer</span>
                                 <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                              </p>
                           </div>
                        )}
                     </div>
                     {!isMinimized && (
                        isAccountMenuOpen ? (
                           <ChevronUp size={18} className="text-gray-400" />
                        ) : (
                           <ChevronDown size={18} className="text-gray-400" />
                        )
                     )}
                  </button>

                  {/* Account Menu Dropdown */}
                  {isAccountMenuOpen && (
                     <div className={`absolute ${isMinimized ? 'left-full bottom-0 ml-2' : 'bottom-full left-0 mb-2'} w-48`}>
                        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden py-1">
                           {accountMenuItems.map((item, index) => (
                              <button
                                 key={index}
                                 onClick={item.onClick}
                                 className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200"
                              >
                                 <div className={item.label === 'Log Out' ? 'text-red-500' : 'text-gray-500'}>
                                    {item.icon}
                                 </div>
                                 <span className={`ml-3 ${item.label === 'Log Out' ? 'text-red-500' : ''}`}>
                                    {item.label}
                                 </span>
                              </button>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* Notification Panel */}
         {showNotifications && (
            <NotificationPanel 
               notifications={notifications}
               loading={notificationLoading}
               error={notificationError}
               onClose={() => setShowNotifications(false)}
               onRefresh={fetchNotifications}
            />
         )}

         {/* Logout Confirmation Modal */}
         {showLogoutConfirm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
               <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-sm mx-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                     Confirm Logout
                  </h3>
                  <p className="text-gray-600 mb-6">
                     Are you sure you want to log out of your account?
                  </p>
                  <div className="flex justify-end gap-3">
                     <button 
                        onClick={cancelLogout}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                     >
                        Cancel
                     </button>
                     <button 
                        onClick={confirmLogout}
                        className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors flex items-center gap-2"
                     >
                        {isLoggingOut ? (
                           <>
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Logging out...</span>
                           </>
                        ) : (
                           <>
                              <LogOut size={18} />
                              <span>Logout</span>
                           </>
                        )}
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

export default NavEmployer;