import { Link, useLocation } from 'react-router-dom';
import { User, Bookmark, FileText } from 'lucide-react';

// Add this new component after the imports and before the Profile component
const ProfileNav = () => {
   const location = useLocation();
   
   const navItems = [
     { 
       path: '/seeker/profile', 
       label: 'Profile', 
       icon: User 
     },
     { 
       path: '/saved-jobs', 
       label: 'Saved Jobs', 
       icon: Bookmark 
     }

   ];
 
   return (
     <div className="bg-white border-b mb-6">
       <div className="max-w-6xl mx-auto">
         <nav className="flex space-x-8">
           {navItems.map(({ path, label, icon: Icon }) => {
             const isActive = location.pathname === path;
             return (
               <Link
                 key={path}
                 to={path}
                 className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                   isActive
                     ? 'border-blue-500 text-blue-600'
                     : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                 }`}
               >
                 <Icon className="w-4 h-4" />
                 {label}
               </Link>
             );
           })}
         </nav>
       </div>
     </div>
   );
};

export default ProfileNav;