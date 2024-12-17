import React from 'react';
import { useLocation } from 'react-router-dom';
import NavEmployer from '../ui/navEmployer';

const EmployerLayout = ({ children }) => {
   const location = useLocation();
   const isNavMinimized = localStorage.getItem('navMinimized') === 'true';

   return (
      <div className="flex min-h-screen bg-gray-50">
         <NavEmployer />
         <main className={`flex-1 transition-all duration-300 p-4 md:p-6
            ${isNavMinimized ? 'md:ml-20' : 'md:ml-64'}
            ${location.pathname === '/messages' ? 'max-w-full' : 'max-w-7xl mx-auto'}
         `}>
            {children}
         </main>
      </div>
   );
};

export default EmployerLayout; 