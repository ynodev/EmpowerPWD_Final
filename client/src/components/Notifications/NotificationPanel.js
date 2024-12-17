import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, CheckCircle, XCircle, ExternalLink, RefreshCw, ChevronRight } from 'lucide-react';
import axios from 'axios';

const NotificationPanel = ({ 
   notifications = [], 
   loading = false, 
   error = null,
   onClose,
   onRefresh 
}) => {
   const navigate = useNavigate();
   const [showAllNotifications, setShowAllNotifications] = useState(false);
   
   // Show only 5 notifications initially
   const displayedNotifications = showAllNotifications 
      ? notifications 
      : notifications.slice(0, 5);

   const handleNotificationClick = (notification) => {
      if (!notification.read) {
         handleMarkAsRead(notification._id);
      }
      
      // Navigate based on user role and notification type
      const userRole = localStorage.getItem('userRole');
      
      if (userRole === 'admin') {
         switch (notification.type) {
            case 'new_job':
            case 'job_update':
               navigate(`/admin/jobs/${notification.jobId}/review`);
               break;
            case 'job_approval':
            case 'job_rejection':
               navigate(`/admin/job-management?jobId=${notification.jobId}`);
               break;
            default:
               if (notification.jobId) {
                  navigate(`/admin/job-management?jobId=${notification.jobId}`);
               }
         }
      } else {
         // Existing employer/jobseeker navigation logic
         if (notification.jobId) {
            navigate(`/employer/jobs/${notification.jobId}`);
         }
      }
      
      if (onClose) onClose();
   };

   // Prevent event bubbling for action buttons
   const handleActionClick = (e, action) => {
      e.stopPropagation();
      action();
   };

   const getNotificationIcon = (type) => {
      switch (type) {
         case 'approval':
            return <CheckCircle className="w-5 h-5 text-green-500" />;
         case 'rejection':
            return <XCircle className="w-5 h-5 text-red-500" />;
         default:
            return <Bell className="w-5 h-5 text-gray-500" />;
      }
   };

   const handleMarkAsRead = async (notificationId) => {
      try {
         const token = localStorage.getItem('token');
         await axios.patch(`/api/notifications/${notificationId}/read`, {}, {
            headers: { Authorization: `Bearer ${token}` }
         });
         onRefresh?.();
      } catch (error) {
         console.error('Error marking notification as read:', error);
      }
   };

   const handleDelete = async (notificationId) => {
      try {
         const token = localStorage.getItem('token');
         await axios.delete(`/api/notifications/${notificationId}`, {
            headers: { Authorization: `Bearer ${token}` }
         });
         onRefresh?.();
      } catch (error) {
         console.error('Error deleting notification:', error);
      }
   };

   if (loading) {
      return (
         <div className="fixed right-4 top-5 w-96 bg-white shadow-lg rounded-lg z-50 p-4">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-semibold">Notifications</h2>
               <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
               </button>
            </div>
            <div className="flex justify-center items-center p-8">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
         </div>
      );
   }

   return (
      <div className={`fixed right-4 top-5 bg-white shadow-lg rounded-lg z-50 border border-gray-200 
         ${showAllNotifications ? 'w-[800px]' : 'w-96'}`}>
         <div className="sticky top-0 p-4 border-b border-gray-200 bg-white flex justify-between items-center">
            <h2 className="text-lg font-semibold">Notifications</h2>
            <div className="flex gap-2">
               <button
                  onClick={onRefresh}
                  className="text-gray-400 hover:text-gray-600"
                  title="Refresh"
               >
                  <RefreshCw className="w-5 h-5" />
               </button>
               <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                  title="Close"
               >
                  <X className="w-5 h-5" />
               </button>
            </div>
         </div>

         <div className={`${showAllNotifications ? 'grid grid-cols-2 gap-4 p-4' : ''}`}>
            {displayedNotifications.map((notification) => (
               <div 
                  key={notification._id} 
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer 
                     ${!notification.read ? 'bg-gray-50' : ''}`}
               >
                  <div className="flex items-start gap-3">
                     <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                     </div>
                     <div className="flex-grow">
                        <h3 className="font-medium text-gray-900">
                           {notification.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                           {notification.message}
                        </p>
                        {notification.jobId && (
                           <div className="mt-2 inline-flex items-center text-sm text-blue-600">
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View Job Details
                           </div>
                        )}
                        <div className="mt-1 text-xs text-gray-400">
                           {new Date(notification.createdAt).toLocaleDateString()}
                        </div>
                     </div>
                     <div className="flex-shrink-0 flex gap-2">
                        {!notification.read && (
                           <button
                              onClick={(e) => handleActionClick(e, () => handleMarkAsRead(notification._id))}
                              className="text-gray-400 hover:text-gray-600"
                              title="Mark as read"
                           >
                              <CheckCircle className="w-4 h-4" />
                           </button>
                        )}
                        <button
                           onClick={(e) => handleActionClick(e, () => handleDelete(notification._id))}
                           className="text-gray-400 hover:text-red-600"
                           title="Delete"
                        >
                           <X className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {/* View All Button */}
         {!showAllNotifications && notifications.length > 5 && (
            <button
               onClick={() => setShowAllNotifications(true)}
               className="w-full p-3 text-center text-blue-600 hover:text-blue-800 border-t border-gray-100 flex items-center justify-center"
            >
               View All Notifications
               <ChevronRight className="w-4 h-4 ml-1" />
            </button>
         )}

         {/* Back to Preview Button */}
         {showAllNotifications && (
            <div className="p-4 border-t border-gray-100">
               <button
                  onClick={() => setShowAllNotifications(false)}
                  className="text-blue-600 hover:text-blue-800 flex items-center"
               >
                  <ChevronRight className="w-4 h-4 rotate-180 mr-1" />
                  Back to Preview
               </button>
            </div>
         )}
      </div>
   );
};

export default NotificationPanel; 