import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CreateEmployer from './components/Employer/registerEmployer';
import CreateJobSeeker from './components/JobSeeker/registerJobSeeker';
import JobPostingForm from './components/Employer/JobPostingForm';
import Login from './components/Auth/loginComponent';
import AdminLogin from './components/Auth/adminLogin'; // Import AdminLogin component
import AdminRegister from './components/Auth/adminRegister'; // Import AdminRegister component
import JobsDashboard from './components/Employer/jobDashboard';
import Usertype from './components/Auth/userTypeComponent';
import JobList from './components/JobSeeker/JobBoard';
import JobDetails from './components/JobSeeker/JobDetails';
import JobApplication from './components/JobSeeker/JobApplicationComp';
import ViewJob from './components/Employer/viewJob';
import EditJob from './components/Employer/editJob';
import DebugManageJobs from './components/debugComponent';
import ApplicationDashboard from './components/Employer/jobApplication';
import JobManagement from './components/Admin/jobManagement'; // New JobManagement component
import HomePageComponent from './components/Home/homePage';
import UserManagementSystem from './components/Admin/userManagement';
import SeekerProfile from './components/JobSeeker/profile';
import MyApplicationDetails from './components/JobSeeker/myApplication';
import AdminDashboard from './components/Admin/adminDashboard';
import UserDetailsView from './components/Admin/userDetails'; // New JobManagement component
import UserReview from './components/Admin/userReview';
import NotFoundPage from './components/ui/404notFound';
import JobDetailsAdmin from './components/Admin/JobDetails';
import Messages from './components/messages/MessageModal';
import Conversation from './components/messages/Conversation';
import MessagesPage from './components/messages/MessagesPage';
import JobReview from './components/Admin/JobReview';
import { NotificationProvider } from './context/NotificationContext';
import Resources from './components/Resources/Resources';
import ResourcesView from './components/Resources/ResourcesView';
import AdminResources from './components/Admin/adminResources'; // Add this import
import ApplicationReview from './components/Employer/ApplicationReview';
import ViewApplication from './components/Employer/ViewApplication';
import ApplicantDetails from './components/Employer/ApplicantDetails';
import InterviewSchedule from './components/Employer/schedule';
import JobSeekerSchedule from './components/JobSeeker/schedule'; // Add this import
import { AuthProvider } from './context/AuthContext';
import VideoCall from './components/VideoCall.jsx';
import JoinCall from './components/JoinCall';
import VideoCallLanding from './components/VideoCallLanding';
import AccessibilityWidget from './components/Accessibility/AccessibilityWidget';
import ExploreCompanies from './components/JobSeeker/exploreCompanies';
import EmployerProfile from './components/Employer/EmployerProfile';
import Notification from './components/Employer/notification';
import Settings from './components/Employer/settings';
import AllUsers from './components/Admin/Users/AllUsers';
import Employers from './components/Admin/Users/Employers';
import JobSeekers from './components/Admin/Users/JobSeekers';
import PendingVerification from './components/Admin/Users/PendingVerification';
import Dashboard from './components/Employer/Dashboard';
import ForgotPassword from './components/Auth/forgotpass.js'
import JobSeekerInterviews from './components/JobSeeker/JobSeekerInterviews';
import SavedJobs from './components/JobSeeker/savedJobs';
import SeekerType from './components/Auth/seekerTypeComponent';
import RegisterAssistant from './components/JobSeeker/registerAssistant';
import Blogs from './components/JobSeeker/blogs';
import BlogDetails from './components/JobSeeker/blogDetails';
import AdminList from './components/Admin/Management/AdminList';
import RolesManagement from './components/Admin/Management/RolesManagement';
import VerifyEmail from './components/Admin/VerifyEmail';
import ActivityLogs from './components/Admin/ActivityLogs';
import AdminForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import About from './components/Home/about';
import JobSeekerProfile from './components/Employer/JobSeekerProfile';
import SDG15Website from './components/Home/sdg.js';
import BlogsGuest from './components/Home/blog-guest';
import BlogGuestView from './components/Home/blog-details.js';
const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="app">
            <div className="accessibility-widget">
              <AccessibilityWidget />
            </div>
            <Routes>
              {/* Main job board route */}
              <Route path="/" element={<HomePageComponent />} />
              <Route path="/job-list" element={<JobList />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/employers/view-job/:jobId" element={<ViewJob />} />
              <Route path="/debug" element={<DebugManageJobs />} />
              <Route path='/employer/application' element={<ApplicationDashboard />} />
              <Route path="/employers/edit-job/:jobId" element={<EditJob />} />
              <Route path="/login" element={<Login />} />
              <Route path="/seeker/profile" element={<SeekerProfile />} />
              <Route path="/admin/users/:userId" element={<UserDetailsView />} />

              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/register" element={<AdminRegister />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/explore-companies" element={<ExploreCompanies />} />
              <Route path="/admin/jobs" element={<JobManagement />} />
              <Route path="/admin/jobs/:id" element={<JobDetailsAdmin />} />
              <Route path="/admin/jobs/:jobId/review" element={<JobReview />} />
              <Route path="/admin/resources" element={<AdminResources />} />
              <Route path="/admin/user-management" element={<AllUsers />} />
              <Route path="/admin/user-management/employers" element={<Employers />} />
              <Route path="/admin/user-management/jobseekers" element={<JobSeekers />} />
              <Route path="/admin/user-management/pending" element={<PendingVerification />} />
              <Route path="/admin/users/:userId/review" element={<UserReview />} />

              <Route path="/jobs/:id/apply" element={<JobApplication />} />
              <Route path="/my-application" element={<MyApplicationDetails />} />

              <Route path="/create-employer" element={<CreateEmployer />} />
              <Route path="/RegisterjobSeeker" element={<CreateJobSeeker />} />
              <Route path="/job-dashboard" element={<JobsDashboard />} />
              <Route path="/Emp-Dashboard" element={<Dashboard />} />
              <Route path="/employers/create-job" element={<JobPostingForm />} />
              <Route path="/user-type" element={<Usertype />} />
              <Route path="/seeker-type" element={<SeekerType />} />
              <Route path="/forgot-pass" element={<ForgotPassword />} />
              <Route path="/register-assistant" element={<RegisterAssistant />} />
              <Route path="/saved-jobs" element={<SavedJobs />} />

              <Route path="/messages/conversation/:userId" element={<Conversation />} />
              <Route path="/messages" element={<MessagesPage />} />


              <Route path="/employer/applications" element={<ApplicationDashboard />} />
              <Route path="/employers/resources" element={<Resources />} />
              <Route path="/employers/resources/view" element={React.createElement(ResourcesView)} />
              <Route path="/employer/applications/:applicationId/review" element={<ApplicationReview />} />
              <Route path="/employer/applications/:id" element={<ViewApplication />} />
              <Route path="/employer/applications/:applicationId" element={<ApplicantDetails />} />
              <Route path="/employer/schedule" element={<InterviewSchedule />} />
              <Route path="/jobseeker/schedule" element={<JobSeekerSchedule />} />
              <Route path="/video-call" element={<VideoCall />} />
              {/* Video Call Routes */}
              <Route path="/video" element={<VideoCallLanding />} />
              <Route path="/video/create" element={<VideoCall />} />
              <Route path="/video/join" element={<JoinCall />} />
              <Route path="/video/room/:roomId" element={<VideoCall />} />

              <Route path="/employer/profile" element={<EmployerProfile />} />

              <Route path="/notifications" element={<Notification />} />

              <Route path="/settings" element={<Settings />} />
              
              <Route path="/jobseeker/interviews" element={<JobSeekerInterviews />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/:id" element={<BlogDetails />} />
              <Route path="/admin/management/admins" element={<AdminList />} />
              <Route path="/admin/management/roles" element={<RolesManagement />} />
              <Route path="/admin/verify-email/:token" element={<VerifyEmail />} />
              <Route path="/admin/activity-logs" element={<ActivityLogs />} />
              <Route path="/admin/forgot-password" element={<AdminForgotPassword />} />
              <Route path="/admin/reset-password/:token" element={<ResetPassword />} />
              <Route path="/about" element={<About />} />
              <Route path="/sdg" element={<SDG15Website />} />

              <Route path="/guest/blogs" element={<BlogsGuest />} />
              <Route path="/guest/blogs/:id" element={<BlogGuestView />} />


              <Route path="/employer/jobseeker/:seekerId" element={<JobSeekerProfile />} />
              <Route path="*" element={<NotFoundPage />} />
              
            </Routes>
          </div>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
