import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Calendar, Building, MapPin, Book, Briefcase, Activity, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

const UserDetailsView = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`/api/admin/management/users/${userId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Id': localStorage.getItem('userId'),
            'X-User-Role': localStorage.getItem('userRole'),
          },
        });

        if (!response.ok) throw new Error('Failed to fetch user details');

        const data = await response.json();
        setUserData(data.user);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleBack = () => window.history.back();

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} />;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <HeaderSection onBack={handleBack} isVerified={userData?.isVerified} />

      <BasicInfo userData={userData} />

      {userData.role === 'jobseeker' && (
        <>
          <EducationSection education={userData.profile?.education} />
          <ExperienceSection experience={userData.profile?.experience} />
          <ApplicationStats stats={userData.applicationStats} />
        </>
      )}

      {userData.role === 'employer' && (
        <>
          <CompanyInfo companyInfo={userData.profile?.companyInfo} />
          <JobPostingStats stats={userData.jobStats} />
        </>
      )}

      <RecentActivity recentActivity={userData.recentActivity} />
      <AccountStats stats={userData.accountStats} />
    </div>
  );
};

const LoadingView = () => (
  <div className="p-6 max-w-7xl mx-auto flex items-center justify-center h-64">
    <div className="text-lg">Loading...</div>
  </div>
);

const ErrorView = ({ message }) => (
  <div className="p-6 max-w-7xl mx-auto">
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  </div>
);

const HeaderSection = ({ onBack, isVerified }) => (
  <div className="mb-6">
    <button onClick={onBack} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Users
    </button>
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold">User Details</h1>
      <span
        className={`px-3 py-1 rounded-full text-sm ${
          isVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}
      >
        {isVerified ? 'Verified' : 'Not Verified'}
      </span>
    </div>
  </div>
);

const BasicInfo = ({ userData }) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>Basic Information</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <DetailItem icon={<Mail />} text={userData.email} />
          {userData.profile?.basicInfo?.phone && <DetailItem icon={<Phone />} text={userData.profile.basicInfo.phone} />}
          <DetailItem icon={<Calendar />} text={`Joined ${new Date(userData.createdAt).toLocaleDateString()}`} />
        </div>
        {userData.profile?.basicInfo?.location && <DetailItem icon={<MapPin />} text={userData.profile.basicInfo.location} />}
      </div>
    </CardContent>
  </Card>
);

const EducationSection = ({ education }) => (
  <Section title="Education" items={education} renderItem={(edu) => (
    <>
      <span className="font-medium">{edu.degree}</span>
      <p>{edu.institution}</p>
      <p className="text-sm text-gray-500">{edu.startDate} - {edu.endDate || 'Present'}</p>
    </>
  )} />
);

const ExperienceSection = ({ experience }) => (
  <Section title="Experience" items={experience} renderItem={(exp) => (
    <>
      <span className="font-medium">{exp.title}</span>
      <p>{exp.company}</p>
      <p className="text-sm text-gray-500">{exp.startDate} - {exp.endDate || 'Present'}</p>
    </>
  )} />
);

const ApplicationStats = ({ stats }) => (
  <StatsGrid title="Application Statistics" stats={stats} />
);

const CompanyInfo = ({ companyInfo }) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>Company Information</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <DetailItem icon={<Building />} text={companyInfo?.name} />
        <DetailItem icon={<MapPin />} text={companyInfo?.location} />
        <p className="text-gray-600">{companyInfo?.description}</p>
      </div>
    </CardContent>
  </Card>
);

const JobPostingStats = ({ stats }) => (
  <StatsGrid title="Job Posting Statistics" stats={stats} />
);

const RecentActivity = ({ recentActivity }) => (
  <Section title="Recent Activity" items={recentActivity} renderItem={(activity) => (
    <>
      <span className="text-sm">{activity.action}</span>
      <span className="text-sm text-gray-500 ml-auto">{new Date(activity.timestamp).toLocaleString()}</span>
    </>
  )} />
);

const AccountStats = ({ stats }) => (
  <Card>
    <CardHeader>
      <CardTitle>Account Statistics</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid md:grid-cols-2 gap-6">
        <DetailItem label="Account Created" text={new Date(stats.createdAt).toLocaleDateString()} />
        <DetailItem label="Last Login" text={new Date(stats.lastLogin).toLocaleDateString()} />
        <DetailItem label="Login Count" text={stats.loginCount} />
        <DetailItem
          label="Verification Status"
          icon={stats.verificationStatus ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-gray-500" />}
        />
        <DetailItem label="Last Updated" text={new Date(stats.lastUpdated).toLocaleDateString()} />
      </div>
    </CardContent>
  </Card>
);

const Section = ({ title, items, renderItem }) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {items?.map((item, index) => (
        <div key={index} className="mb-4 last:mb-0">
          {renderItem(item)}
        </div>
      ))}
    </CardContent>
  </Card>
);

const DetailItem = ({ icon, text, label }) => (
  <div className="flex items-center justify-between">
    {label && <span>{label}</span>}
    {icon && <span className="mr-2">{icon}</span>}
    <span>{text}</span>
  </div>
);

const StatsGrid = ({ title, stats }) => (
  <Card className="mb-6">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats?.map((stat, index) => (
          <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold">{stat.count}</div>
            <div className="text-sm text-gray-500 capitalize">{stat._id}</div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default UserDetailsView;
