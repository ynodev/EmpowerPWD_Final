import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Building2, ChevronLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatDistance } from 'date-fns';
import axios from 'axios';

const JobDetailsAdmin = () => {
  const [job, setJob] = useState(null);
  const [employerId, setEmployerId] = useState(null);
  const [employer, setEmployer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {

    const fetchJobDetails = async () => {
      if (!id) {
        setError('Job ID is missing');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        
        const response = await fetch(`/api/jobs/${id}`);
        if (!response.ok) throw new Error(response.status === 404 ? 'Job not found' : 'Failed to fetch job details');
        
        const data = await response.json();
        setJob(data.data);
        setEmployerId(data.data.employersId);

        console.log("Job Dataset: ", data.data);
        //console.log("Employer UserId:", data.data.employersId);

      } catch (err) {
        console.error('Error fetching job details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [id]);

  console.log("id:",employerId)


  //Second useEffect to fetch employer details
  // useEffect(() => {
  //   if (employerId) {  
  //     const fetchEmployerDetails = async () => {
  //       try {
  //         const response = await fetch(`/api/employers/${employerId}`);
  //         if (!response.ok) throw new Error('Failed to fetch employer details');

  //         const employerData = await response.json();
  //         setEmployer(employerData.data);
          
  //         console.log("Employer Dataset: ", employerData.data);
          
  //       } catch (err) {
  //         console.error('Error fetching employer details:', err);
  //         setError('Failed to load employer details');
  //       }
  //     };
  //     fetchEmployerDetails();
  //   }
  // }, [employerId]);


  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       // Call the backend endpoint to get the employer profile data
  //       const response = await axios.get('/api/Employers/profile', {
  //         withCredentials: true // Ensures cookies are sent for authentication
  //       });
  
  //       console.log("Response: ", response.data);

  //       // Check for a valid response
  //       if (response.data && response.data.success && response.data.employer) {
  //         //const { companyInfo, contactPerson, pwdSupport } = response.data.employer;
  
  //         // Set user info based on received data
  //         //setEmployer(companyInfo);
  
  //         setAuthError(null);
  //       } else {
  //         console.log('Invalid response data:', response.data);
  //         setAuthError('Unable to load profile data');
  //       }
  
  //     } catch (error) {
  //       console.error("Error fetching user data:", error.response || error);
  
  //       if (error.response?.status === 401) {
  //         console.log('Unauthorized');
  //         navigate('/login');
  //       } else if (error.response?.status === 404) {
  //         setAuthError('Profile not found. Please complete your profile setup.');
  //         navigate('/profile-setup');
  //       } else {
  //         setAuthError(error.response?.data?.message || 'An error occurred while loading your profile');
  //       }
  //     }
  //   };
  
  //   fetchUserData();
  // }, []);

  console.log("Employer: ", employer);
  



  /*const handleApply = () => {
    
    


    navigate(`/jobs/${id}/apply`, { 
      state: { jobId: id, jobTitle: job.jobTitle, company: job.company, jobDescription
        : job.jobDescription
      } 
    });
  };
  */

  /*const handleSaveJob = async () => {
    try {
      const response = await fetch(`/api/jobs/${id}/save`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) throw new Error('Failed to save job');
      alert('Job saved successfully!');
    } catch (err) {
      console.error('Error saving job:', err);
      alert('Failed to save job. Please try again.');
    }
  };
  */

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <ChevronLeft className="h-5 w-5" />
          <span>Back to Jobs</span>
        </button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong><span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="min-h-screen bg-white">
    <div className="max-w-7xl mx-auto p-6 space-x-6 font-poppins">
    <div className="w-full mx-auto mb-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 border border-gray-500 border-2 hover:border-gray-900 p-2 rounded-xl"
      >
        <ChevronLeft className="h-5 w-5" />
        <span >Back to Jobs</span>
      </button>
      </div>
        <div className="flex flex-col sm:flex-row  justify-between mb-6">
            <div className="w-24 ml-7 h-24 bg-gray-300 flex-shrink-0"></div>
            <div className="mt-4 sm:mt-0 sm:ml-4 flex-grow">
                <div className="flex justify-between">
                    <h1 className="text-2xl font-bold ml-4">{job.jobTitle}</h1>
                    <span className="flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        {/* Posted {new Date(job.createdAt).toLocaleDateString()} */}
                        Posted {formatDistance(new Date(job.createdAt), new Date(), { addSuffix: true })}
                    </span>
                </div>
                <div className="space-x-4 mt-2 text-gray-600">
                    <div className="flex items-center ml-4">
                        <Building2 className="h-5 w-5" />
                        <span>{job.company}</span>
                         {/* Rating display */}
                        {job.rating && (
                            <div className="flex items-center ml-2">
                                {[...Array(5)].map((_, index) => (
                                    <span
                                        key={index}
                                        className={`h-4 w-4 ${index < job.rating ? 'text-yellow-500' : 'text-gray-300'}`}
                                    >
                                        ★
                                    </span>
                                ))}
                                <span className="ml-1 text-sm text-gray-600">({job.rating})</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center">
                      {job.salaryMin && job.salaryMax && (
                          <div className="mb-4">
                            <h2 className="font-semibold mb-1">Salary Range</h2>
                            <p className="text-gray-600">
                              ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} per year
                            </p>
                          </div>
                        )}
                    </div>
                    <div className="flex justify-between">    
                      <div className="flex items-center gap-2">
                      {job.employmentType && (
                          <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                            {job.employmentType}
                          </span>
                        )}
                        {job.industry && (
                          <span className="bg-gray-200 px-3 py-1 rounded-full text-sm">
                            {job.industry.join(', ')}
                          </span>
                        )}
                      </div>

                    
                        

                    </div>
                    <div className="flex items-center gap-2">
                      {job.requirements && job.requirements.length > 0 && (
                      <div className="mb-8">
                          <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                          <ul className="list-disc list-inside space-y-2">
                            {job.requirements.map((requirement, index) => <li key={index} className="text-gray-600">{requirement}</li>)}
                          </ul>
                      </div>
                      )}
                      {job.companyDescription && (
                        <div className="bg-gray-100 p-6 rounded-lg">
                          <h2 className="text-xl font-semibold mb-4">About {job.company}</h2>
                          <p className="text-gray-600">{job.companyDescription}</p>
                          {job.companyWebsite && <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Visit Company Website</a>}
                        </div>
                      )}
                    </div>    
                </div>
            </div>
        </div>
        <hr className="my-6" />
        <div className="mb-6">
            <h2 className="text-xl font-bold">Location</h2>
            <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                <span className="mt-2 text-gray-700">{job.jobLocation}</span>
            </div>
        </div>
        <hr className="my-6" />
        <div className="text-justify">
            <h2 className="text-xl font-bold">Job Description</h2>
            <p className="mt-2 text-gray-700">{job.jobDescription}</p>
        </div>
        <hr className="my-6" />
        {job.requirements && job.requirements.length > 0 && (
            <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                <ul className="list-disc list-inside space-y-2">
                    {job.requirements.map((requirement, index) => <li key={index} className="text-gray-600">{requirement}</li>)}
                </ul>
            </div>
        )}
        {job.companyDescription && (
          <div className="bg-gray-100 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">About {job.company}</h2>
            <p className="text-gray-600">{job.companyDescription}</p>
            {job.companyWebsite && <a href={job.companyWebsite} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">Visit Company Website</a>}
          </div>
        )}   
      </div>
    </div>

  );
};

export default JobDetailsAdmin;
