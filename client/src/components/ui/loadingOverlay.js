import { useEffect, useState } from 'react';

const LoadingOverlay = () => {
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const timer = setTimeout(() => {
         setLoading(false);
      }, 1000); // 1 second delay

      return () => clearTimeout(timer); // Cleanup timer on component unmount
   }, []);

   if (!loading) return null; // Don't render anything if loading is false

   return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
         <div className="border-t-4 border-blue-500 border-solid rounded-full w-16 h-16 animate-spin"></div>
      </div>
   );
};

export default LoadingOverlay;