import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Clock,
  UserCheck,
  MoreVertical,
  Download,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';
import NavEmployer from '../ui/navEmployer';
import {
  Chart,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import empowerPwdLogo from '../../assets/img/logo.svg';

// Register Chart.js components
Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/employers/dashboard/stats');
        setStats(response.data.data);
        setLoading(false);
        console.log(response.data.data);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return <div className="text-red-500 p-6 text-center">Error: {error}</div>;
  if (!stats) return null;

  const StatCard = ({ title, value, icon: Icon }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 h-full transition-all duration-300 hover:shadow-xl">
      <div className="flex items-center mb-4">
        <Icon size={24} className="text-blue-600" strokeWidth={1.5} />
        <h3 className="text-lg font-semibold ml-3 text-gray-700">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-gray-800">{value}</p>
    </div>
  );

  const handleViewApplication = (applicationId) => {
    navigate(`/employer/applications/${applicationId}`);
  };

  // Function to format the application trends data
  const formatApplicationTrends = (trends) => {
    // If trends is undefined or empty, return default empty data
    if (!trends || trends.length === 0) {
      return {
        labels: [],
        applications: [],
        interviews: []
      };
    }
  
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    const applications = [];
    const interviews = [];
  
    trends.forEach(trend => {
      // Safely access nested properties with optional chaining
      const month = trend?._id?.month;
      const year = trend?._id?.year;
      
      if (month && year) {
        const monthName = months[month - 1];
        labels.push(`${monthName} ${year}`);
        applications.push(trend.applications || 0);
        interviews.push(trend.interviews || 0);
      }
    });
  
    return {
      labels,
      applications,
      interviews
    };
  };

  // Update the status mapping to match the model's enum values
  const statusMap = {
    'pending': 'Pending',
    'accepted': 'Accepted',
    'rejected': 'Rejected',
    'interview': 'Interview'  // Updated from 'Interview Scheduled'
  };

  // Update status colors
  const formatStatusData = (statusData) => {
    // If statusData is undefined or empty, return default empty data
    if (!statusData || statusData.length === 0) {
      return {
        labels: [],
        counts: [],
        colors: {
          'Pending': ['rgba(255, 206, 86, 0.5)', 'rgba(255, 206, 86, 1)'],
          'Accepted': ['rgba(75, 192, 192, 0.5)', 'rgba(75, 192, 192, 1)'],
          'Rejected': ['rgba(255, 99, 132, 0.5)', 'rgba(255, 99, 132, 1)'],
          'Interview': ['rgba(54, 162, 235, 0.5)', 'rgba(54, 162, 235, 1)']
        }
      };
    }
  
    const formattedData = {
      labels: [],
      counts: [],
      colors: {
        'Pending': ['rgba(255, 206, 86, 0.5)', 'rgba(255, 206, 86, 1)'],
        'Accepted': ['rgba(75, 192, 192, 0.5)', 'rgba(75, 192, 192, 1)'],
        'Rejected': ['rgba(255, 99, 132, 0.5)', 'rgba(255, 99, 132, 1)'],
        'Interview': ['rgba(54, 162, 235, 0.5)', 'rgba(54, 162, 235, 1)']
      }
    };
  
    statusData.forEach(item => {
      const status = statusMap[item?._id] || item?._id || 'Unknown';
      formattedData.labels.push(status);
      formattedData.counts.push(item.count || 0);
    });
  
    return formattedData;
  };
  // Chart data using actual API data
  const lineChartData = {
    labels: stats?.applicationTrends ? formatApplicationTrends(stats.applicationTrends).labels : [],
    datasets: [
      {
        label: 'Applications',
        data: stats?.applicationTrends ? formatApplicationTrends(stats.applicationTrends).applications : [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4,
      },
      {
        label: 'Interviews',
        data: stats?.applicationTrends ? formatApplicationTrends(stats.applicationTrends).interviews : [],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const statusData = stats?.applicationsByStatus ? formatStatusData(stats.applicationsByStatus) : { labels: [], counts: [] };
  
 const barChartData = {
  labels: statusData.labels,
  datasets: [
    {
      label: 'Number of Applications',
      data: statusData.counts,
      backgroundColor: statusData.labels.map(label => 
        (statusData.colors[label] || ['rgba(54, 162, 235, 0.5)'])[0]
      ),
      borderColor: statusData.labels.map(label => 
        (statusData.colors[label] || ['rgba(54, 162, 235, 1)'])[1]
      ),
      borderWidth: 1,
    },
  ],
};

  // Update chart options to be more readable
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Application Trends (Last 6 Months)',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Applications by Status',
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
  };

  const convertSvgToPng = async (svgUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const originalWidth = 93;
        const originalHeight = 122;
        const aspectRatio = originalWidth / originalHeight;
        const targetHeight = 15;
        const targetWidth = targetHeight * aspectRatio;
        const scale = 4;
        canvas.width = targetWidth * scale;
        canvas.height = targetHeight * scale;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL('image/png', 1.0));
      };
      img.onerror = reject;
      img.src = svgUrl;
    });
  };

  const generateChartImage = async (data, type, title) => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    if (window.tempChart) {
      window.tempChart.destroy();
    }
    
    window.tempChart = new Chart(ctx, {
      type: type,
      data: data,
      options: {
        responsive: false,
        animation: false,
        plugins: {
          title: {
            display: true,
            text: title,
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true,
            position: 'bottom'
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    return canvas.toDataURL('image/png');
  };

  const generatePDFReport = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let currentY = 15;

    // Helper function for page breaks
    const checkPageBreak = (neededSpace) => {
      if (currentY + neededSpace > pageHeight - 20) {
        doc.addPage();
        currentY = 20;
        return true;
      }
      return false;
    };

    // Add logo and header
    try {
      const pngData = await convertSvgToPng(empowerPwdLogo);
      const logoHeight = 15;
      const logoWidth = (93/122) * logoHeight;
      doc.addImage(pngData, 'PNG', 14, currentY, logoWidth, logoHeight);
    } catch (error) {
      console.error('Error converting logo:', error);
    }

    // Company Information
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text([
      'EmpowerPWD',
      'Recruitment Analytics Report',
      `Generated on: ${new Date().toLocaleDateString()}`
    ], pageWidth - 14, currentY + 2, { align: 'right' });

    currentY += 25;

    // Mission Statement
    currentY += 20;
    doc.setFontSize(12);
    doc.setTextColor(100);
    const mission = "Empowering Persons with Disabilities through inclusive employment opportunities and accessible career development.";
    const splitMission = doc.splitTextToSize(mission, pageWidth - 28);
    doc.text(splitMission, pageWidth / 2, currentY, { align: 'center' });
    
    // Executive Summary
    currentY += 20;
    doc.setFontSize(16);
    doc.setTextColor(25, 39, 85);
    doc.text('Executive Summary', 14, currentY);
    
    currentY += 10;
    doc.setFontSize(11);
    doc.setTextColor(60);
    const summary = [
      `This report provides an overview of your recruitment activities and impact through EmpowerPWD's platform.`,
      `Your organization has posted ${stats.activeJobs} active jobs,`,
      `received ${stats.totalApplications} applications,`,
      `and made ${stats.hiresMade} successful hires.`,
      `This demonstrates your commitment to inclusive employment practices.`
    ].join(' ');
    
    const splitSummary = doc.splitTextToSize(summary, pageWidth - 28);
    doc.text(splitSummary, 14, currentY);
    currentY += splitSummary.length * 7;

    // PWD Employment Insights
    checkPageBreak(100);
    doc.setFontSize(16);
    doc.setTextColor(25, 39, 85);
    doc.text('PWD Employment Insights', 14, currentY);
    
    currentY += 10;
    doc.setFontSize(11);
    doc.setTextColor(60);
    
    const pwdInsights = [
      {
        title: 'Accessibility & Inclusion',
        points: [
          '• Job postings screened for accessibility compliance',
          '• Enhanced profile options for disability disclosure',
          '• Accessible application process with multiple format support'
        ]
      },
      {
        title: 'Employment Opportunities',
        points: [
          `• ${stats.activeJobs} active job postings available`,
          '• Remote work options for enhanced accessibility',
          '• Specialized job categories for PWD-friendly positions'
        ]
      },
      {
        title: 'Recruitment Impact',
        points: [
          `• ${stats.totalApplications} applications received`,
          `• ${stats.pendingReviews} applications pending review`,
          `• ${stats.hiresMade} successful hires made`
        ]
      }
    ];

    pwdInsights.forEach(section => {
      checkPageBreak(40);
      doc.setFontSize(13);
      doc.setTextColor(25, 39, 85);
      doc.text(section.title, 14, currentY);
      
      currentY += 8;
      doc.setFontSize(11);
      doc.setTextColor(60);
      section.points.forEach(point => {
        doc.text(point, 20, currentY);
        currentY += 7;
      });
      currentY += 5;
    });

    // Platform Health Metrics
    checkPageBreak(60);
    currentY += 10;
    doc.setFontSize(16);
    doc.setTextColor(25, 39, 85);
    doc.text('Platform Health Metrics', 14, currentY);
    
    currentY += 10;
    doc.setFontSize(11);
    doc.setTextColor(60);
    
    const healthMetrics = [
      `• Application Rate: ${stats.activeJobs > 0 
        ? (stats.totalApplications / stats.activeJobs).toFixed(1) 
        : '0'} applications per job posting`,
      
      `• Review Efficiency: ${stats.totalApplications > 0 
        ? (((stats.totalApplications - stats.pendingReviews) / stats.totalApplications) * 100).toFixed(1) 
        : '0'}% applications reviewed`,
      
      `• Hiring Success Rate: ${stats.totalApplications > 0 
        ? ((stats.hiresMade / stats.totalApplications) * 100).toFixed(1) 
        : '0'}% conversion rate`
    ];
    
    healthMetrics.forEach(metric => {
      doc.text(metric, 20, currentY);
      currentY += 7;
    });

    // Key Metrics Section
    doc.setFontSize(16);
    doc.setTextColor(25, 39, 85);
    doc.text('Key Recruitment Metrics', 14, currentY);
    
    const metrics = [
      ['Metric', 'Value'],
      ['Active Jobs', stats.activeJobs],
      ['Total Applications', stats.totalApplications],
      ['Pending Reviews', stats.pendingReviews],
      ['Hires Made', stats.hiresMade]
    ];
    
    doc.autoTable({
      startY: currentY + 10,
      head: [metrics[0]],
      body: metrics.slice(1),
      theme: 'grid',
      headStyles: { 
        fillColor: [37, 99, 235],
        fontSize: 12,
        fontStyle: 'bold'
      }
    });

    currentY = doc.lastAutoTable.finalY + 20;

    // Add Application Trends Chart
    if (checkPageBreak(150)) {
      currentY = 20;
    }

    doc.setFontSize(16);
    doc.text('Application Trends', 14, currentY);
    
    try {
      const lineChartImage = await generateChartImage(lineChartData, 'line', 'Application Trends');
      currentY += 10;
      doc.addImage(lineChartImage, 'PNG', 14, currentY, 180, 100);
      currentY += 110;
    } catch (error) {
      console.error('Error generating line chart:', error);
    }

    // Add Status Distribution Chart
    if (checkPageBreak(150)) {
      currentY = 20;
    }

    doc.setFontSize(16);
    doc.text('Application Status Distribution', 14, currentY);
    
    try {
      const barChartImage = await generateChartImage(barChartData, 'bar', 'Applications by Status');
      currentY += 10;
      doc.addImage(barChartImage, 'PNG', 14, currentY, 180, 100);
    } catch (error) {
      console.error('Error generating bar chart:', error);
    }

    // Add footer
    const addFooter = () => {
      const pages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.line(14, pageHeight - 15, pageWidth - 14, pageHeight - 15);
        doc.text(
          'EmpowerPWD - Recruitment Analytics Report',
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
    doc.save(`recruitment_report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const generateCSVReport = () => {
    const csvContent = [
      "Recruitment Analytics Report",
      `Generated on: ${new Date().toLocaleString()}`,
      "",
      "Key Metrics",
      `Active Jobs,${stats.activeJobs}`,
      `Total Applications,${stats.totalApplications}`,
      `Pending Reviews,${stats.pendingReviews}`,
      `Hires Made,${stats.hiresMade}`,
      "",
      "Recent Applications",
      "Applicant Name,Job Title,Applied Date,Status",
      ...stats.recentApplicants.map(app => 
        `${app.jobseeker.firstName} ${app.jobseeker.lastName},${app.jobId.jobTitle},${new Date(app.createdAt).toLocaleDateString()},${app.status}`
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `recruitment_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <NavEmployer />
      <div className="p-6 sm:ml-64">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-gray-600 mt-2">Monitor your recruitment activities and performance</p>
            </div>
            
            {/* Report Generation Dropdown */}
            <div className="relative group">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center gap-2 transition-all duration-300">
                <Download className="w-4 h-4" />
                Generate Report
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-300 ease-in-out transform translate-y-1 group-hover:translate-y-0">
                <button
                  onClick={generatePDFReport}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  <FileText className="w-4 h-4" />
                  Download as PDF
                </button>
                <button
                  onClick={generateCSVReport}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Download as CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Active Jobs",
              value: stats.activeJobs,
              icon: Briefcase,
              color: "blue"
            },
            {
              title: "Total Applications",
              value: stats.totalApplications,
              icon: FileText,
              color: "green"
            },
            {
              title: "Pending Reviews",
              value: stats.pendingReviews,
              icon: Clock,
              color: "yellow"
            },
            {
              title: "Hires Made",
              value: stats.hiresMade,
              icon: UserCheck,
              color: "purple"
            }
          ].map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 flex items-center justify-center`}>
                  <stat.icon className={`text-${stat.color}-500`} size={24} />
                </div>
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-2xl font-semibold mt-1">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add this after the Stats Cards section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="text-blue-500" size={20} />
              </div>
              <h3 className="text-gray-700 font-medium">Application Rate</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900">
              {stats.activeJobs > 0 
                ? (stats.totalApplications / stats.activeJobs).toFixed(1) 
                : '0'}
            </p>
            <p className="text-sm text-gray-500 mt-1">applications per job posting</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <CheckCircle className="text-green-500" size={20} />
              </div>
              <h3 className="text-gray-700 font-medium">Review Efficiency</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900">
              {stats.totalApplications > 0 
                ? (((stats.totalApplications - stats.pendingReviews) / stats.totalApplications) * 100).toFixed(1) 
                : '0'}%
            </p>
            <p className="text-sm text-gray-500 mt-1">applications reviewed</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <UserCheck className="text-purple-500" size={20} />
              </div>
              <h3 className="text-gray-700 font-medium">Hiring Success Rate</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900">
              {stats.totalApplications > 0 
                ? ((stats.hiresMade / stats.totalApplications) * 100).toFixed(1) 
                : '0'}%
            </p>
            <p className="text-sm text-gray-500 mt-1">conversion rate</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Application Trends</h3>
            <Line options={lineChartOptions} data={lineChartData} />
          </div>

          <div className="bg-white rounded-2xl shadow-sm border p-6 hover:shadow-md transition-all duration-300">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Application Status Distribution</h3>
            <Bar options={barChartOptions} data={barChartData} />
          </div>
        </div>

        {/* Recent Applications Table */}
      {/* Recent Applications Table */}
<div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
  <div className="p-6 border-b border-gray-200">
    <h2 className="text-xl font-semibold text-gray-900">Recent Applicants</h2>
  </div>
  {stats.recentApplicants && stats.recentApplicants.length > 0 ? (

    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Applicant Name</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Job Title</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Applied Date</th>
            <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
            <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {stats.recentApplicants.map((applicant) => (
            <tr 
              key={applicant._id}
              className="hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => handleViewApplication(applicant._id)}
            >
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                    {applicant.jobseeker?.firstName?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {applicant.jobseeker?.firstName || 'Unknown'} {applicant.jobseeker?.lastName || ''}
                    </div>
                    <div className="text-sm text-gray-500">
                      {applicant.jobseeker?.email || 'No email'}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">{applicant.jobId?.jobTitle || 'Untitled Job'}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-gray-500">
                {applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString() : 'N/A'}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${applicant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${applicant.status === 'accepted' ? 'bg-green-100 text-green-800' : ''}
                  ${applicant.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                  ${applicant.status === 'interview' ? 'bg-blue-100 text-blue-800' : ''}
                `}>
                  {statusMap[applicant.status] || 'Unknown'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div className="p-6 text-center text-gray-500">
      No recent applicants found
    </div>
  )}
</div>
      </div>
    </div>
  );
};

export default Dashboard;
