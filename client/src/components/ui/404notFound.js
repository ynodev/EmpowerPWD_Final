import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
   const navigate = useNavigate();
   const [loading, setLoading] = useState(true);

   // Set a timer to simulate loading for 1-2 seconds
   useEffect(() => {
      const timer = setTimeout(() => {
         setLoading(false);
      }, 1000); // Adjust time as needed (2000 ms = 2 seconds)

      return () => clearTimeout(timer); // Cleanup on unmount
   }, []);

   return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
         {loading ? (
         <div className="flex flex-col items-center">
            {/* Spinner/Loader */}
            <div className="loader mb-4">
               <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-600"></div>
            </div>
            <p className="text-lg text-gray-600">Loading...</p>
         </div>
         ) : (
         <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-800">404</h1>
            <p className="mt-4 text-lg text-gray-600">Oops! Page not found.</p>
            <button
               onClick={() => navigate(-1)}
               className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
               Go Back
            </button>
         </div>
         )}
      </div>
   );
};

export default NotFoundPage;
