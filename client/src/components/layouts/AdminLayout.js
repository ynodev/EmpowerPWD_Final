import React from 'react';
import { useLocation } from 'react-router-dom';
import SidebarAdmin from '../Admin/sideNavAdmin';

const AdminLayout = ({ children }) => {
   const location = useLocation();
   const isNavMinimized = localStorage.getItem('adminNavMinimized') === 'true';

   return (
      <div className="flex min-h-screen bg-gray-50">
         <SidebarAdmin />
         <main 
            className={`flex-1 transition-all duration-300
               ${isNavMinimized ? 'md:ml-20' : 'md:ml-64'}
               ${location.pathname === '/messages' ? 'w-full' : 'max-w-7xl mx-auto'}
            `}
         >
            <div className="p-6 md:p-8">
               {children}
            </div>
         </main>
      </div>
   );
};

export default AdminLayout; 