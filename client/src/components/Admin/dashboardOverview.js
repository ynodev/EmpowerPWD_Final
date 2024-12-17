import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, FileCheck, Clock, TrendingUp, Calendar, DollarSign, Target, UserCheck, AlertCircle } from "lucide-react";

const AdminDashboard = () => {
  // Sample data - replace with your actual data
  const stats = {
    totalSeekers: 12456,
    totalEmployers: 892,
    activeJobs: 1234,
    pendingApplications: 345,
    monthlyGrowth: 23.5,
    interviews: 567,
    premiumEmployers: 234,
    completedJobs: 789,
    activeUsers: 5678,
    reportedJobs: 12
  };

  const pendingJobs = [
    { id: 1, company: "Tech Corp", position: "Senior Developer", location: "New York", date: "2024-11-03", status: "Pending Review" },
    { id: 2, company: "Marketing Pro", position: "Digital Marketing Manager", location: "Remote", date: "2024-11-03", status: "Documents Required" },
    { id: 3, company: "Finance Plus", position: "Financial Analyst", location: "London", date: "2024-11-02", status: "Pending Review" },
    { id: 4, company: "Healthcare Inc", position: "Medical Assistant", location: "Chicago", date: "2024-11-02", status: "Pending Review" },
    { id: 5, company: "Education First", position: "Math Teacher", location: "Boston", date: "2024-11-01", status: "Documents Required" },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
        
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview and management of platform activities</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated:</p>
            <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Generate Report
          </button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Job Seekers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Job Seekers
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSeekers.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">↑ 12% vs last month</p>
          </CardContent>
        </Card>

        {/* Total Employers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Employers
            </CardTitle>
            <Briefcase className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployers.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">↑ 8% vs last month</p>
          </CardContent>
        </Card>

        {/* Active Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Jobs
            </CardTitle>
            <FileCheck className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Across all categories</p>
          </CardContent>
        </Card>

        {/* Premium Employers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Premium Employers
            </CardTitle>
            <DollarSign className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.premiumEmployers.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Active subscriptions</p>
          </CardContent>
        </Card>

        {/* Monthly Growth */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Monthly Growth
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.monthlyGrowth}%</div>
            <p className="text-xs text-gray-500 mt-1">Overall platform growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Users
            </CardTitle>
            <UserCheck className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        {/* Pending Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Applications
            </CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingApplications.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Require review</p>
          </CardContent>
        </Card>

        {/* Completed Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Completed Jobs
            </CardTitle>
            <Target className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedJobs.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">This month</p>
          </CardContent>
        </Card>

        {/* Reported Issues */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Reported Issues
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.reportedJobs.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Jobs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Pending Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Company</th>
                  <th className="text-left py-3 px-4">Position</th>
                  <th className="text-left py-3 px-4">Location</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingJobs.map((job) => (
                  <tr key={job.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{job.company}</td>
                    <td className="py-3 px-4 font-medium">{job.position}</td>
                    <td className="py-3 px-4">{job.location}</td>
                    <td className="py-3 px-4">{job.date}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        {job.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 mr-2">
                        Review
                      </button>
                      <button className="text-gray-600 hover:text-gray-800">
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;