import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Users, Briefcase, FileCheck, Verified, X, Download, FileText, FileSpreadsheet, CheckCircle, Calendar as CalendarIcon } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import SidebarAdmin from './sideNavAdmin';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Chart, registerables } from 'chart.js';
import empowerPwdLogo from '../../assets/img/logo.svg';
import { format } from 'date-fns';
Chart.register(...registerables);

const axiosConfig = {
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Add this helper function to convert SVG to PNG
const convertSvgToPng = async (svgUrl) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      
      // Original SVG dimensions
      const originalWidth = 93;  // from your SVG viewBox
      const originalHeight = 122; // from your SVG viewBox
      const aspectRatio = originalWidth / originalHeight;
      
      // Set desired height in the PDF (in points)
      const targetHeight = 15; // Adjust this value as needed
      const targetWidth = targetHeight * aspectRatio;
      
      // Use higher resolution for better quality
      const scale = 4; // Increase this for higher quality
      canvas.width = targetWidth * scale;
      canvas.height = targetHeight * scale;
      
      const ctx = canvas.getContext('2d');
      
      // Enable image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      // Scale up for better quality
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      resolve(canvas.toDataURL('image/png', 1.0)); // Maximum quality
    };
    img.onerror = reject;
    img.src = svgUrl;
  });
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [insights, setInsights] = useState(null);
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1))); // Default to last month
  const [endDate, setEndDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigate = useNavigate();

  
  useEffect(() => {
    // Remove token from config since it will be sent via cookies
    // Fetch platform statistics
    axios.get('https://empower-pwd.onrender.com/api/admin/dashboard/stats', axiosConfig)
      .then(response => {
        if (response.data.success) {
          setStats(response.data.data);
        }
      })
      .catch(error => {
        if (error.response?.status === 401) {
          navigate('/admin/login');
        }
        console.error('Error fetching platform statistics:', error);
      });

    // Fetch monthly trends
    axios.get('https://empower-pwd.onrender.com/api/admin/dashboard/trends', axiosConfig)
      .then(response => {
        if (response.data.success) {
          setMonthlyTrends(response.data.data);
        }
      })
      .catch(error => {
        console.error('Error fetching monthly trends:', error);
      });

    // Fetch pending jobs
    axios.get('https://empower-pwd.onrender.com/api/admin/dashboard/pending-jobs', axiosConfig)
      .then(response => {
        if (response.data.success) {
          setPendingJobs(response.data.data);
        }
      })
      .catch(error => {
        console.error('Error fetching pending jobs:', error);
      });

    // Fetch pending users
    axios.get('https://empower-pwd.onrender.com/api/admin/dashboard/pending-users', axiosConfig)
      .then(response => {
      if (response.data.success) {
        setPendingUsers(response.data.data);
      }
    })
    .catch(error => {
      console.error('Error fetching pending users:', error);
    })
  }, [navigate]);

  useEffect(() => {
    if (stats && monthlyTrends?.length >= 2) {
      setInsights(calculateInsights());
    }
  }, [stats, monthlyTrends]);

  const updateJobStatus = (jobId, newStatus) => {
    axios.patch(`https://empower-pwd.onrender.com/api/admin/dashboard/jobs/${jobId}/status`, { status: newStatus }, axiosConfig)
      .then(response => {
        if (response.data.success) {
          setPendingJobs(pendingJobs.map(job =>
            job.id === jobId ? { ...job, status: newStatus } : job
          ));
        }
      })
      .catch(error => {
        console.error('Error updating job status:', error);
      });
  };

  const verifyUser = async (userId) => {
    try {
      const response = await axios.patch(
        `https://empower-pwd.onrender.com/api/admin/dashboard/users/${userId}/verify`,
        { status: 'verified' },
        axiosConfig
      );

      if (response.data.success) {
        setPendingUsers(pendingUsers.filter(user => user._id !== userId));
        setStats(prev => ({
          ...prev,
          totalVerifiedUsers: prev.totalVerifiedUsers + 1,
          totalUnverifiedUsers: prev.totalUnverifiedUsers - 1
        }));
      }
    } catch (error) {
      console.error('Error verifying user:', error);
    }
  };

  const rejectUser = async (userId) => {
    try {
      const response = await axios.patch(
        `https://empower-pwd.onrender.com/api/admin/dashboard/users/${userId}/reject`,
        { status: 'rejected' },
        axiosConfig
      );

      if (response.data.success) {
        setPendingUsers(pendingUsers.filter(user => user._id !== userId));
        setStats(prev => ({
          ...prev,
          totalUnverifiedUsers: prev.totalUnverifiedUsers - 1
        }));
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  const calculateInsights = () => {
    if (!stats || !monthlyTrends || monthlyTrends.length < 2) {
      return {
        seekerGrowth: 0,
        employerGrowth: 0,
        jobGrowth: 0,
        verificationRate: 0,
        jobsPerEmployer: 0
      };
    }
    
    // Growth calculations
    const lastMonth = monthlyTrends[monthlyTrends.length - 1];
    const previousMonth = monthlyTrends[monthlyTrends.length - 2];
    
    // Calculate growth rates with checks for zero values
    const seekerGrowth = previousMonth.seekers > 0
      ? ((lastMonth.seekers - previousMonth.seekers) / previousMonth.seekers * 100).toFixed(1)
      : lastMonth.seekers > 0 ? '100' : '0';

    const employerGrowth = previousMonth.employers > 0
      ? ((lastMonth.employers - previousMonth.employers) / previousMonth.employers * 100).toFixed(1)
      : lastMonth.employers > 0 ? '100' : '0';

    const jobGrowth = previousMonth.jobs > 0
      ? ((lastMonth.jobs - previousMonth.jobs) / previousMonth.jobs * 100).toFixed(1)
      : lastMonth.jobs > 0 ? '100' : '0';
    
    // User verification rate
    const totalUsers = stats.totalVerifiedUsers + stats.totalUnverifiedUsers;
    const verificationRate = totalUsers > 0
      ? ((stats.totalVerifiedUsers / totalUsers) * 100).toFixed(1)
      : '0';
    
    // Average jobs per employer
    const jobsPerEmployer = stats.totalEmployers > 0
      ? (stats.totalJobs / stats.totalEmployers).toFixed(1)
      : '0';
    
    return {
      seekerGrowth,
      employerGrowth,
      jobGrowth,
      verificationRate,
      jobsPerEmployer
    };
  };

  const generateChartImage = async (data, type, title) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800; // Increased width
    canvas.height = 400; // Increased height
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.tempChart) {
      window.tempChart.destroy();
    }
    
    window.tempChart = new Chart(ctx, {
      type: type,
      data: data,
      options: {
        responsive: false,
        animation: false, // Disable animations for PDF
        plugins: {
          title: {
            display: true,
            text: title,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true,
            position: 'bottom',
            labels: {
              padding: 20,
              font: { size: 12 }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#E5E7EB'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });

    return canvas.toDataURL('image/png');
  };

  const generatePDFReport = async (start, end) => {
    const insights = calculateInsights();
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let currentY = 15;

    // Add logo and header
    try {
      const pngData = await convertSvgToPng(empowerPwdLogo);
      const logoHeight = 15;
      const logoWidth = (93/122) * logoHeight;
      doc.addImage(pngData, 'PNG', 14, currentY, logoWidth, logoHeight);
    } catch (error) {
      console.error('Error converting logo:', error);
    }

    // Header information
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text([
      'EmpowerPWD',
      'Platform Analytics Report',
      `Report Period: ${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`,
      `Generated on: ${format(new Date(), 'MMM d, yyyy')}`
    ], pageWidth - 14, currentY, { align: 'right' });

    currentY += 40;

    // Platform Statistics
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Platform Statistics', 14, currentY);
    currentY += 10;

    const statistics = [
      ['Metric', 'Current Value', 'Monthly Growth'],
      ['Job Seekers', stats.totalSeekers.toString(), `${insights.seekerGrowth}%`],
      ['Employers', stats.totalEmployers.toString(), `${insights.employerGrowth}%`],
      ['Total Jobs', stats.totalJobs.toString(), `${insights.jobGrowth}%`],
      ['Verified Users', stats.totalVerifiedUsers.toString(), `${insights.verificationRate}%`],
      ['Unverified Users', stats.totalUnverifiedUsers.toString(), '-']
    ];

    doc.autoTable({
      startY: currentY,
      head: [statistics[0]],
      body: statistics.slice(1),
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 20;

    // Monthly Trends
    if (monthlyTrends.length > 0) {
      doc.setFontSize(14);
      doc.text('Monthly Trends', 14, currentY);
      currentY += 10;

      const trendsData = monthlyTrends.map(trend => [
        trend.name,
        trend.seekers.toString(),
        trend.employers.toString(),
        trend.jobs.toString()
      ]);

      doc.autoTable({
        startY: currentY,
        head: [['Month', 'Job Seekers', 'Employers', 'Jobs']],
        body: trendsData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [37, 99, 235] },
        margin: { left: 14, right: 14 }
      });

      currentY = doc.lastAutoTable.finalY + 20;
    }

    // Pending Actions Summary
    doc.setFontSize(14);
    doc.text('Pending Actions Summary', 14, currentY);
    currentY += 10;

    const pendingActions = [
      ['Category', 'Count'],
      ['Pending Job Approvals', pendingJobs.length.toString()],
      ['Pending User Verifications', pendingUsers.length.toString()]
    ];

    doc.autoTable({
      startY: currentY,
      head: [pendingActions[0]],
      body: pendingActions.slice(1),
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: 14, right: 14 }
    });

    // Add footer to all pages
    const addFooter = () => {
      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
        doc.text(
          'EmpowerPWD - Platform Analytics Report',
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(
          `Page ${i} of ${pages}`,
          pageWidth - 14,
          pageHeight - 10,
          { align: 'right' }
        );
      }
    };

    addFooter();
    doc.save(`platform_report_${format(start, 'yyyy-MM-dd')}_to_${format(end, 'yyyy-MM-dd')}.pdf`);
  };

  const generateCSVReport = (start, end) => {
    const insights = calculateInsights();
    
    const csvContent = [
      "EmpowerPWD Platform Analytics Report",
      `Report Period: ${format(start, 'MMM d, yyyy')} - ${format(end, 'MMM d, yyyy')}`,
      `Generated on: ${format(new Date(), 'MMM d, yyyy')}`,
      "",
      "Platform Statistics",
      "Metric,Current Value,Monthly Growth",
      `Job Seekers,${stats.totalSeekers},${insights.seekerGrowth}%`,
      `Employers,${stats.totalEmployers},${insights.employerGrowth}%`,
      `Total Jobs,${stats.totalJobs},${insights.jobGrowth}%`,
      `Verified Users,${stats.totalVerifiedUsers},${insights.verificationRate}%`,
      `Unverified Users,${stats.totalUnverifiedUsers},-`,
      "",
      "Monthly Trends",
      "Month,Job Seekers,Employers,Jobs",
      ...monthlyTrends.map(trend => 
        `${trend.name},${trend.seekers},${trend.employers},${trend.jobs}`
      ),
      "",
      "Pending Actions",
      "Category,Count",
      `Pending Job Approvals,${pendingJobs.length}`,
      `Pending User Verifications,${pendingUsers.length}`,
      "",
      "Pending Users Detail",
      "Name,Email,Role,Status",
      ...pendingUsers.map(user => 
        `${user.name || 'N/A'},${user.email},${user.role},Pending`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `platform_report_${format(start, 'yyyy-MM-dd')}_to_${format(end, 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const DateRangePicker = ({ onClose }) => {
    const [localStartDate, setLocalStartDate] = useState(startDate);
    const [localEndDate, setLocalEndDate] = useState(endDate);

    const handleApply = () => {
      setStartDate(localStartDate);
      setEndDate(localEndDate);
      onClose();
    };

    return (
      <div className="absolute right-0 mt-2 p-4 bg-white rounded-lg shadow-lg border z-50 w-80">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={format(localStartDate, 'yyyy-MM-dd')}
              onChange={(e) => setLocalStartDate(new Date(e.target.value))}
              max={format(localEndDate, 'yyyy-MM-dd')}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={format(endDate, 'yyyy-MM-dd')}
              onChange={(e) => setLocalEndDate(new Date(e.target.value))}
              min={format(localStartDate, 'yyyy-MM-dd')}
              max={format(new Date(), 'yyyy-MM-dd')}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!stats) {
    return <div>Loading...</div>;
  }

  console.log("Stats: ", stats);
  console.log("Trends: ", monthlyTrends);
  console.log("Pending Jobs: ", pendingJobs);
  console.log("Pending Users: ", pendingUsers);


  return (
    <div className="min-h-screen bg-gray-50">
      <SidebarAdmin />
      <div className="p-6 sm:ml-64">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Monitor platform activities and performance</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated:</p>
              <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
            </div>
            <div className="relative group">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300">
                <Download className="w-4 h-4" />
                Generate Report
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 ease-in-out transform translate-y-1 group-hover:translate-y-0">
                <div className="p-2 border-b">
                  <button
                    onClick={() => setShowDatePicker(true)}
                    className="w-full text-left px-2 py-1 rounded hover:bg-gray-50 flex items-center gap-2 text-gray-700 text-sm"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')}
                  </button>
                </div>
                <button
                  onClick={() => {
                    generatePDFReport(startDate, endDate);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  <FileText className="w-4 h-4" />
                  Download as PDF
                </button>
                <button
                  onClick={() => {
                    generateCSVReport(startDate, endDate);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Download as CSV
                </button>
              </div>
              {showDatePicker && (
                <DateRangePicker onClose={() => setShowDatePicker(false)} />
              )}
            </div>
          </div>
        </div>

        {/* Section Title */}
        <div className="px-8 mb-6">
          <div className="flex items-center">
            <h2 className="text-blue-500 text-lg font-bold">Overview</h2>
          </div>
          <div className="mt-2">
            <div className="border-b border-gray-300 w-full"></div>
            <div className="border-b-4 border-blue-500 w-20 -mt-[1px]"></div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 px-8 mb-8">
          {[
            {
              title: "Total Job Seekers",
              value: stats?.totalSeekers || 0,
              growth: insights?.seekerGrowth,
              icon: Users,
              color: "blue"
            },
            {
              title: "Total Employers",
              value: stats?.totalEmployers || 0,
              growth: insights?.employerGrowth,
              icon: Briefcase,
              color: "green"
            },
            {
              title: "Total Jobs",
              value: stats?.totalJobs || 0,
              growth: insights?.jobGrowth,
              icon: FileCheck,
              color: "purple"
            },
            {
              title: "Verified Users",
              value: stats?.totalVerifiedUsers || 0,
              growth: insights?.verificationRate,
              icon: Verified,
              color: "emerald",
              suffix: "%"
            },
            {
              title: "Unverified Users",
              value: stats?.totalUnverifiedUsers || 0,
              icon: X,
              color: "yellow"
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-300">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</p>
                {stat.growth !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className={`text-xs ${
                      parseFloat(stat.growth) > 0 
                        ? 'text-green-600' 
                        : parseFloat(stat.growth) < 0 
                          ? 'text-red-600' 
                          : 'text-gray-600'
                    }`}>
                      {parseFloat(stat.growth) > 0 ? '+' : ''}{stat.growth}{stat.suffix || '%'}
                    </span>
                    <span className="text-xs text-gray-500">vs last month</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 px-8 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Platform Growth Trends</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="seekers" 
                    stroke="#2563eb" 
                    name="Job Seekers"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="employers" 
                    stroke="#16a34a" 
                    name="Employers"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Monthly Job Growth</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar 
                    dataKey="jobs" 
                    fill="#8b5cf6" 
                    name="Total Jobs"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Pending Actions Section */}
        <div className="px-8">
          <div className="flex items-center mb-4">
            <h2 className="text-blue-500 text-lg font-bold">Pending Actions</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pending Jobs */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Pending Job Approvals</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {pendingJobs.map((job) => (
                  <div key={job._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{job.title}</h4>
                        <p className="text-sm text-gray-500">{job.company}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateJobStatus(job._id, 'approved')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => updateJobStatus(job._id, 'rejected')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Users */}
            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Pending User Verifications</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {pendingUsers.map((user) => (
                  <div key={user._id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => verifyUser(user._id)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => rejectUser(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
