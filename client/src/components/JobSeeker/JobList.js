import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/jobs');
        console.log('Jobs Response:', response.data);
        
        if (response.data.success) {
          setJobs(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      try {
        const response = await axiosInstance.get('/api/applications/my-applications');
        console.log('Applied Jobs Response:', response.data);
        
        if (response.data.success) {
          const appliedIds = new Set(response.data.data.map(app => app.jobId.toString()));
          setAppliedJobIds(appliedIds);
          console.log('Applied Job IDs:', Array.from(appliedIds));
        }
      } catch (error) {
        console.error('Error fetching applied jobs:', error);
      }
    };

    fetchAppliedJobs();
  }, []);

  // Debug when either jobs or appliedJobs changes
  useEffect(() => {
    const availableJobs = jobs.filter(job => !appliedJobIds.has(job._id.toString()));
    console.log('Filtering Debug:', {
      totalJobs: jobs.length,
      appliedJobsCount: appliedJobIds.size,
      availableJobsCount: availableJobs.length,
      appliedIds: Array.from(appliedJobIds),
      jobIds: jobs.map(job => job._id.toString())
    });
  }, [jobs, appliedJobIds]);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Filter out jobs that have been applied to
  const availableJobs = jobs.filter(job => !appliedJobIds.has(job._id.toString()));

  return (
    <div>
      {availableJobs.map(job => (
        <JobCard key={job._id} job={job} />
      ))}
    </div>
  );
};

export default JobList; 